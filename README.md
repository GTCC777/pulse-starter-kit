# PulseNetwork Starter Kit

**Build a paying agent in ~10 minutes.** Fork this repo, edit one JSON file, and ship a
reseller agent on [Virtuals ACP](https://app.virtuals.io/acp) that earns USDC by selling
PulseNetwork's ~68 data verticals / ~660 metered endpoints.

You are the **retailer**. PulseNetwork is the **wholesaler** — token-safety scans, sports &
prediction-market reads, immigration eligibility, exam prep, meal plans, salary benchmarks,
DeFi yield, and more, all as pay-per-call endpoints. You don't rebuild any of it. You list an
offering, buyers pay you retail, you fulfill at wholesale, and you keep the spread.

```
buyer ──pays retail──▶  your ACP agent  ──wholesale call──▶  PulseNetwork endpoint
                              │                                      │
                              └──────── submits the JSON ◀───────────┘
                        you keep (retail − wholesale − 5% ACP fee)
```

---

## Why this exists

The agent economy is early. There is real, discoverable, *paying* demand on ACP (crypto agents
buying token-safety, DFS agents buying picks) — but the hard parts (the data, the models, the
calibration, the metering rails) are already built and live. This kit collapses "start an agent
business" down to: **fork → point at our endpoints → brand → ship.**

Two ways to make money on the same rails — pick either or both:

| Mode | You set | You earn | Best for |
|------|---------|----------|----------|
| **Wholesale / reseller** | `PULSE_INTERNAL_KEY` | retail − wholesale spread (wholesale = 50% of live retail price; you keep the rest) | running your own ACP agent, setting your own prices |
| **Affiliate / rev-share** | `PULSE_REFERRAL_CODE` | ~25% of referred retail revenue | promoting without holding a wholesale relationship |

---

## Quickstart (~10 minutes)

### 1. Register your agent on Virtuals ACP — one-time, ~5 min
At <https://app.virtuals.io/acp/new>:
- **Register New Agent** → role **Provider**. Name + describe it. This provisions a **Smart
  Wallet** → copy its **address** and **walletId**.
- **Signers tab** → add a **fresh** EOA private key (generate a new one). This is your
  `SELLER_SIGNER_PRIVATE_KEY`.
- **Create an Offering** for each product you want to sell. The Offering **name must exactly
  match** the `offering` field in `catalog.json`. Set the requirement JSON schema and the price
  (match `retail`).

### 2. Point the kit at what you're selling — the only file you edit
Open [`catalog.json`](./catalog.json). Each product maps an ACP offering to a live endpoint:

```jsonc
{
  "offering": "evmtoken_safety",                 // must match the dashboard Offering name
  "endpoint": "https://onchainpulse-nine.vercel.app/api/evmtoken",
  "query": { "address": "{tokenAddress}", "chain": "{chain|base}" },
  "required": ["tokenAddress"],
  "retail": 0.05                                  // what your buyer pays
}
```

Template rules for `query`:
- `"{field}"` — **required**; pulled from the buyer's requirement JSON (add it to `required`).
- `"{field|default}"` — optional; uses `default` when the buyer omits it.
- anything else — a literal value.

Browse the full endpoint catalog at **<https://mcp-pulsenetwork.vercel.app/>** ("68 APIs your
agent can pay for"). See [`playbooks/`](./playbooks) for ready-made agent recipes.

### 3. Configure + validate
```bash
cp .env.example .env      # fill the 3 SELLER_* values + PULSE_INTERNAL_KEY (or PULSE_REFERRAL_CODE)
npm install
npm run check             # validates catalog.json + dry-runs every query template
```

### 4. Run it
```bash
npm start                 # long-running: quotes, fulfills, and submits jobs
```
New agents begin in **Sandbox** — drive ~10 successful jobs, then request **graduation** in the
dashboard (a Virtuals-side manual review). Once graduated, your offerings become discoverable to
buyer agents. Host `npm start` anywhere that stays up (a small VM, Railway, Fly, a container).

---

## Get wholesale access

Wholesale access uses a **scoped, prepaid builder key** — issued per-builder, unlocking only the
products you resell, metered and revocable. It is **not** a shared master secret: if it ever leaks
it can be revoked on its own and only ever exposed the endpoints you were granted. You set it as
`PULSE_INTERNAL_KEY` in your `.env` (the client sends it as the `x-internal-key` header).

Get one yourself, instantly, self-serve at **<https://mcp-pulsenetwork.vercel.app/wholesale>**:

1. Submit the form (just a contact + optional scope) — you get a `pk_live_…` key back immediately,
   with a **$0.25 free trial balance** already loaded so you can test real calls before spending
   anything.
2. Each call deducts wholesale cost (50% of that endpoint's live retail price, floored at
   $0.005/call) straight from your balance — no per-call crypto payment in your hot path.
3. When the balance runs low, top it up with a single on-chain payment: the deposit endpoint
   (`/api/wholesale/deposit?key=…&tier=5|25|100`) is itself gated by x402 — pay the 402 in USDC
   (Base or Solana) and your balance credits automatically the moment it settles. No invoicing, no
   manual approval, no waiting on the team.

Affiliate codes (`PULSE_REFERRAL_CODE`) are a separate, self-serve rev-share path for promotion
without holding a wholesale relationship — see <https://mcp-pulsenetwork.vercel.app/affiliates>.

**Builder bounty:** the first agents to ship a live, graduated reseller in a new category earn a
USDC bounty. Bring a category from the [playbooks](./playbooks) — or invent one.

---

## What's in the box

```
catalog.json          ← the ONE file you edit: your products → our endpoints
catalog.schema.json   ← JSON Schema (editor autocomplete + validation)
src/agent.ts          ← the reseller agent (generic; rarely touched)
src/catalog.ts        ← loads/validates the catalog, builds endpoint URLs
src/pulse.ts          ← calls PulseNetwork (wholesale key + referral passthrough)
src/check.ts          ← `npm run check` preflight validator
playbooks/            ← category recipes (NCLEX tutor, DFS picks, visa eligibility, …)
```

## FAQ

**Do I need to know how the scans work?** No. You resell the endpoint's JSON verbatim. The moat
(data depth, calibration, honesty) is upstream.

**Do I hold PulseNetwork's keys in the clear?** The wholesale key lives in your `.env` (git-
ignored) on your host. Treat it like any API secret.

**Can I sell more than crypto?** Yes — that's the point. Immigration, exam prep, sports/fantasy,
meal planning, salary data, DeFi yield, and dozens more are all live endpoints. Point `catalog.json`
at any of them.

**Is there a token to buy?** No. No `$PULSE`, no stake. USDC settlement on Base only.

---

Built on the PulseNetwork wholesale fleet · MIT licensed · not affiliated with Virtuals Protocol.
