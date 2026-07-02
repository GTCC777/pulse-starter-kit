// The fulfillment client: calls a PulseNetwork endpoint and returns its JSON.
//
// Two ways to pay for the upstream call — set exactly one:
//   1. WHOLESALE (recommended for resellers): set PULSE_INTERNAL_KEY. You hit the endpoint
//      at wholesale (near-$0), charge your buyer retail on ACP, and keep the spread. Ask us
//      for a key — see the README ("Get wholesale access").
//   2. REFERRAL (affiliate mode): set PULSE_REFERRAL_CODE instead. You don't pay the internal
//      rate, but every referred call is credited to your code and you earn a rev-share on our
//      retail revenue. Good for promoting without holding a wholesale relationship.
//
// You can set both: the internal key fulfills the call, and the referral code still tags the
// traffic to your code in our analytics.
import type { Product } from './catalog.js';
import { buildUrl } from './catalog.js';

const INTERNAL_KEY = process.env.PULSE_INTERNAL_KEY;
const REFERRAL_CODE = process.env.PULSE_REFERRAL_CODE;

export async function fulfill(product: Product, req: Record<string, unknown>): Promise<unknown> {
  const url = buildUrl(product, req); // throws "missing required field: X" — caller rejects
  const headers: Record<string, string> = {};
  if (INTERNAL_KEY) headers['x-internal-key'] = INTERNAL_KEY;
  if (REFERRAL_CODE) headers['x-referral-code'] = REFERRAL_CODE;

  const res = await fetch(url, { headers });
  if (res.status === 402) {
    throw new Error(
      'upstream 402 (payment required): no wholesale key accepted. Set PULSE_INTERNAL_KEY ' +
        '(wholesale) — see the README.',
    );
  }
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return res.json();
}
