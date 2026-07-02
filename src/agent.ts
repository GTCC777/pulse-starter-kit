// PulseNetwork Starter Kit — a reseller agent on Virtuals ACP.
//
// This process is a thin envelope. When a buyer funds a job, you call a live PulseNetwork
// endpoint (declared in catalog.json) at wholesale and submit the JSON as the deliverable.
// You never rebuild the underlying data/model — PulseNetwork is the wholesaler, you're the
// retailer. To change what you sell, edit catalog.json; you should rarely touch this file.
import { base } from '@account-kit/infra';
import dotenv from 'dotenv';
import {
  AcpAgent,
  AssetToken,
  PrivyAlchemyEvmProviderAdapter,
  type AcpAgentOffering,
  type JobRoomEntry,
  type JobSession,
} from '@virtuals-protocol/acp-node-v2';
import { loadCatalog, type Product } from './catalog.js';
import { fulfill } from './pulse.js';

dotenv.config({ quiet: true });

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name} (see .env.example)`);
  return v;
}

const log = (m: string) => console.log(`[agent] ${m}`);

async function main(): Promise<void> {
  const catalog = loadCatalog();
  const products = new Map<string, Product>(catalog.products.map((p) => [p.offering, p]));
  log(`"${catalog.agent.name}" — selling: ${[...products.keys()].join(', ')}`);

  const agent = await AcpAgent.create({
    provider: await PrivyAlchemyEvmProviderAdapter.create({
      walletAddress: requireEnv('SELLER_WALLET_ADDRESS') as `0x${string}`,
      walletId: requireEnv('SELLER_WALLET_ID'),
      signerPrivateKey: requireEnv('SELLER_SIGNER_PRIVATE_KEY'),
      chains: [base],
    }),
  });

  const address = (await agent.getAddress()).toLowerCase();
  log(`address: ${address}`);

  // Load the offerings registered in the dashboard so we can quote each job at its listed price.
  let offerings = new Map<string, AcpAgentOffering>();
  try {
    const me = await agent.getAgentByWalletAddress(address);
    offerings = new Map((me?.offerings ?? []).map((o) => [o.name, o] as const));
    log(`loaded ${offerings.size} dashboard offering(s): ${[...offerings.keys()].join(', ') || '(none)'}`);
  } catch (err) {
    log(`WARN could not load offerings, will quote from catalog retail: ${err}`);
  }

  const pending = new Map<string | number, { product: Product; req: Record<string, unknown> }>();

  agent.on('entry', async (session: JobSession, entry: JobRoomEntry) => {
    // 1. Requirement arrives → match offering, validate, quote, stash.
    if (entry.kind === 'message' && entry.contentType === 'requirement' && session.status === 'open') {
      const offeringName = session.job?.description ?? '';
      const product = products.get(offeringName);
      if (!product) {
        await session.sendMessage(`Unsupported offering: ${offeringName || '(none)'}`);
        await session.reject('unsupported offering');
        return;
      }
      let req: Record<string, unknown>;
      try {
        req = JSON.parse(entry.content);
      } catch {
        await session.sendMessage('Could not parse the requirement payload (expected JSON).');
        await session.reject('unparseable requirement');
        return;
      }
      const missing = product.required.find((f) => {
        const v = req[f];
        return v === undefined || v === null || String(v) === '';
      });
      if (missing) {
        await session.sendMessage(`Missing required field: ${missing}.`);
        await session.reject(`missing ${missing}`);
        return;
      }
      pending.set(session.jobId, { product, req });
      // Prefer the dashboard's listed price; fall back to catalog retail.
      const price = offerings.get(offeringName)?.priceValue ?? product.retail;
      try {
        await session.setBudget(AssetToken.usdc(price, session.chainId));
        log(`job ${session.jobId} (${offeringName}): quoted ${price} USDC`);
      } catch (err) {
        log(`ERROR setBudget job ${session.jobId}: ${err}`);
      }
      return;
    }

    // 2. Funded → fulfill via the PulseNetwork endpoint, submit the deliverable.
    if (entry.kind === 'system' && entry.event.type === 'job.funded') {
      const p = pending.get(session.jobId);
      if (!p) {
        await session.sendMessage('Internal: lost the requirement for this job.');
        await session.reject('internal error');
        return;
      }
      try {
        await session.sendMessage('Funds received. Fulfilling your request now.');
        const result = await fulfill(p.product, p.req);
        await session.submit(JSON.stringify(result));
        log(`job ${session.jobId}: delivered`);
      } catch (err) {
        log(`ERROR delivery job ${session.jobId}: ${err}`);
        await session.sendMessage(`Request failed: ${String((err as Error).message)}`);
      } finally {
        pending.delete(session.jobId);
      }
      return;
    }

    if (entry.kind === 'system' && entry.event.type === 'job.completed') {
      log(`job ${session.jobId}: completed ✓`);
    }
  });

  await agent.start();
  log('ready, listening for jobs');

  const shutdown = async () => {
    await agent.stop();
    process.exit(0);
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
