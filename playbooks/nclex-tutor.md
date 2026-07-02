# Playbook — NCLEX / Exam-Prep Tutor Agent

**Vertical:** EduPulse (`https://edupulse-xi-blond.vercel.app`) · study guides + adaptive quizzes
for 200+ exams, any subject, 190+ countries.

**The pitch:** an agent that generates *unlimited, adaptive* practice for licensing/admissions
exams (NCLEX, MCAT, bar, SAT) and diagnoses the student's exact weak spots — replacing a
$200 static question bank.

**Why it prints:** extreme intent (people pay thousands to pass), daily repeat use for months,
and a huge existing creator economy (study TikTok/YouTube, tutors on Teachable/Gumroad, r/NCLEX
& r/Mcat mods, nursing/pre-med Discords). Tutors can *resell* it inside a paid course.

**Who to reach:** test-prep tutors, micro-course sellers, study-influencers, exam-subreddit mods,
bootcamp operators. Hook: *"unlimited, adaptive, diagnoses your exact gap."*

## catalog.json snippet

```jsonc
{
  "agent": { "name": "NCLEX Drill Agent", "tagline": "Unlimited adaptive exam practice + gap diagnosis." },
  "products": [
    {
      "offering": "study_guide",
      "description": "Custom study guide for any subject/topic/grade.",
      "endpoint": "https://edupulse-xi-blond.vercel.app/api/study/guide",
      "query": { "grade": "{grade|12}", "subject": "{subject}", "topic": "{topic}", "lang": "{lang|en}" },
      "required": ["subject", "topic"],
      "wholesale": 0.01,
      "retail": 0.25
    },
    {
      "offering": "adaptive_quiz",
      "description": "Adaptive, exam-style quiz for any subject/topic.",
      "endpoint": "https://edupulse-xi-blond.vercel.app/api/study/quiz",
      "query": { "grade": "{grade|12}", "subject": "{subject}", "topic": "{topic}", "lang": "{lang|en}" },
      "required": ["subject", "topic"],
      "wholesale": 0.01,
      "retail": 0.25
    }
  ]
}
```

Register two ACP offerings named `study_guide` and `adaptive_quiz` with a requirement schema like
`{ "subject": string, "topic": string, "grade": string }`, priced at your `retail`.

**Margin:** wholesale ~$0.01 → sell at $0.25. Even at 100 quizzes/day that's ~$24/day gross to
you, near-pure margin. Bundle guide+quiz+diagnosis into a "drill pack" your audience pays for.
