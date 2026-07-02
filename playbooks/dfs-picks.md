# Playbook — DFS / Fantasy Picks Agent

**Vertical:** SignalPulse (`https://signalpulse-peach.vercel.app`) · data-backed sports, fantasy,
and prediction-market reads. DraftKings live salaries, Statcast xwOBA/xERA, confirmed lineups,
GPP stacking — with no-fabrication honesty.

**The pitch:** an agent a fantasy player or a betting agent can ask *any* sports/DFS question
("start-sit my flex", "best 3-ball at the Open", "who's the value play tonight") and get a
data-grounded pick plus commentary.

**Why it works:** sports is high-frequency and repeat (daily during season), fantasy advice is
liability-safe to give directly, and there's a proven creator/operator class (fantasy Discords,
sports-betting agents on ACP, DFS Twitter). The moat vs. paid ChatGPT = real data + calibration.

**Who to reach:** fantasy-sports Discord admins, DFS content creators, sports-betting agent
builders on ACP. Hook: *"grounded picks from live salaries + Statcast, not vibes."*

## catalog.json snippet

```jsonc
{
  "agent": { "name": "DFS Edge Agent", "tagline": "Data-backed fantasy & DFS picks with commentary." },
  "products": [
    {
      "offering": "sports_ask",
      "description": "Ask any sports/DFS/fantasy question, get a grounded pick + commentary.",
      "endpoint": "https://signalpulse-peach.vercel.app/api/scan/ask",
      "query": { "q": "{q}", "sport": "{sport|}" },
      "required": ["q"],
      "wholesale": 0.05,
      "retail": 0.50
    },
    {
      "offering": "fantasy_advice",
      "description": "Start-sit / lineup / waiver / trade advice for a fantasy roster.",
      "endpoint": "https://signalpulse-peach.vercel.app/api/scan/fantasy",
      "query": { "sport": "{sport}", "mode": "{mode|start-sit}", "players": "{players}", "scoring": "{scoring|ppr}" },
      "required": ["sport", "players"],
      "wholesale": 0.05,
      "retail": 0.50
    }
  ]
}
```

Register offerings `sports_ask` (`{ "q": string, "sport": string }`) and `fantasy_advice`
(`{ "sport": string, "mode": string, "players": string, "scoring": string }`) at your retail price.

**Margin:** wholesale ~$0.05 → sell $0.50. The `ask` front door means one offering covers every
sport and question type — minimal setup, maximal coverage.
