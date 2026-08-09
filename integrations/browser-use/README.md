# PulseNetwork tools for browser-use

Give any [browser-use](https://github.com/browser-use/browser-use) agent the ability to
buy live data mid-task with x402 micropayments: token safety verdicts, market scans,
travel rights, sports, climate, compliance and 950+ more pay-per-call endpoints.
No API keys, no accounts. USDC on Base; the wallet is the identity.

## Quick start

```bash
pip install browser-use "x402[httpx,evm]" httpx eth-account python-dotenv
export PULSE_WALLET_KEY=0x...   # throwaway wallet with a few USDC on Base
export OPENAI_API_KEY=sk-...    # or any browser-use supported model
python pulsenetwork_template.py
```

## What the agent gets

| Tool | Cost | Does |
|---|---|---|
| `pulse_catalog(query)` | free | Searches the catalog and returns complete URLs with prices and parameters |
| `pulse_price(url)` | free | Bare 402 quote: exact USD price, nothing settles |
| `pulse_buy(url)` | pay per call | Pays with USDC on Base, returns the JSON |

Safety is code, not prompt: a per-call cap (default $0.50), a session budget
(default $2.00), and a host allowlist so the agent can only ever pay PulseNetwork
endpoints. The private key lives in an env var the LLM never sees.

The caps are enforced as an x402 payment policy, so they are checked against the
402 challenge that is actually signed rather than against an earlier quote. A
price that moves between the quote and the payment cannot slip past them, and a
lock around the buy path stops two concurrent calls from both spending the last
of the budget.

Catalog: https://pulse.theaslangroupllc.com/llms.txt
