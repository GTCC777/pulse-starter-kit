# Playbook — Visa Eligibility Agent

**Vertical:** ImmigrationPulse (`https://immigrationpulse.vercel.app`) · global immigration
intelligence serving 281M+ migrants. Visa requirements, PR pathways, points calculators
(Express Entry CRS, SkillSelect), digital-nomad visas, citizenship.

**The pitch:** an agent that answers "can I move to X, and how?" — visa options by
nationality + destination, PR pathways, and nomad-visa matching, across 190+ countries.

**Why it works:** immigration is high-anxiety, high-value, and global (no US-first bias — the
whole world is the audience). One big decision per user but the *consultant* class routes many
queries. Immigration consultants and relocation services can fold this into their paid intake.

**Who to reach:** immigration consultants, relocation/global-mobility services, digital-nomad
communities, expat Discords/subreddits, "move abroad" creators. Hook: *"instant, personalized
visa options for any nationality → any country."*

## catalog.json snippet

```jsonc
{
  "agent": { "name": "Visa Options Agent", "tagline": "Personalized visa & PR pathways, 190+ countries." },
  "products": [
    {
      "offering": "visa_options",
      "description": "Visa requirements & options for a nationality → destination.",
      "endpoint": "https://immigrationpulse.vercel.app/api/visa",
      "query": { "nationality": "{nationality}", "destination": "{destination}", "category": "{category|work}", "lang": "{lang|en}" },
      "required": ["nationality", "destination"],
      "wholesale": 0.02,
      "retail": 0.25
    },
    {
      "offering": "pr_pathway",
      "description": "Permanent-residency pathways for a nationality → destination.",
      "endpoint": "https://immigrationpulse.vercel.app/api/pathway",
      "query": { "nationality": "{nationality}", "destination": "{destination}", "lang": "{lang|en}" },
      "required": ["nationality", "destination"],
      "wholesale": 0.02,
      "retail": 0.25
    }
  ]
}
```

Register offerings `visa_options` and `pr_pathway` with requirement schema
`{ "nationality": string, "destination": string, "category": string }` at your retail price.

**Margin:** wholesale ~$0.02 → sell $0.25. Consultants happily pay this per-query when it feeds a
$500+ intake. Design for the whole world — take `lang` so non-English users are first-class.
