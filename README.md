# humanize-cli

Analyze and humanize AI-generated text. Detect AI markers, score detection risk, and get actionable improvement suggestions.

```bash
npm install -g humanize-cli
```

## Why This Exists

AI detectors are everywhere now. GPTZero, Originality.ai, Turnitin — they're flagging content left and right. Problem is, they also flag plenty of human writing.

This tool helps you understand *why* text gets flagged and *how* to fix it. Not to help AI pretend to be human, but to help you write in a way that sounds like you actually wrote it.

## Quick Start

```bash
# Analyze text for AI markers
humanize analyze "This comprehensive solution leverages cutting-edge technology."

# Get detection risk score
humanize score --file article.txt

# Get improvement suggestions
echo "The software utilizes robust methodologies" | humanize suggest

# Auto-transform text
humanize transform "It is important to note that this solution is seamless."
```

## Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `analyze` | `a` | Detect AI markers and patterns |
| `score` | `s` | Calculate detection risk score |
| `suggest` | `sg` | Get improvement suggestions |
| `transform` | `t` | Apply automatic fixes |
| `watch` | `w` | Watch directory for changes |
| `config` | `c` | Show configuration and API status |

### `humanize analyze <text>`

Detects AI markers and patterns in your text:
- AI vocabulary (delve, leverage, comprehensive, seamless...)
- Structural patterns (perfect intro/conclusion, uniform sentences)
- Missing human elements (contractions, personal voice, opinions)

```bash
$ humanize analyze "This comprehensive guide delves into best practices."

═══ TEXT ANALYSIS ═══

Words: 8 | Sentences: 1 | Avg words/sentence: 8.0

⚠ AI Vocabulary Detected (3)
  • "comprehensive" → try: full, complete, thorough
  • "delves" → try: digs into, explores, looks at
  • "best practices" → try: what works, good approaches
```

### `humanize score <text>`

Calculates detection risk as a percentage (0-100%):
- **0-20%**: Low risk — appears human-written
- **21-40%**: Moderate risk — may trigger sensitive detectors
- **41-70%**: High risk — likely to be flagged
- **71-100%**: Very high risk — will be flagged by most detectors

```bash
$ humanize score --file draft.txt

═══ DETECTION RISK SCORE ═══

Overall Risk: 67% (HIGH RISK)

Component Breakdown:
  vocabulary           ████████░░ 78%
  structure            ██████░░░░ 55%
  patterns             ███████░░░ 65%
  naturalness          ██████░░░░ 58%
  personality          ███████░░░ 72%
```

### `humanize suggest <text>`

Generates prioritized improvement suggestions:
- **🔴 Priority Fixes**: Must-fix issues that scream "AI"
- **🟡 Recommended**: Improvements that help
- **🟢 Optional Polish**: Nice-to-have tweaks
- **⚡ Quick Wins**: Copy-paste replacements

```bash
$ echo "It is important to note that our solution leverages..." | humanize suggest

═══ IMPROVEMENT SUGGESTIONS ═══

🔴 Priority Fixes
  1. AI vocabulary detected: "leverages"
     → Replace with: use, take advantage of, work with
     Before: "solution leverages cutting-edge..."
     After:  "solution uses cutting-edge..."

  2. No contractions found - text sounds robotic
     → Use contractions! "Do not" → "don't"
```

### `humanize transform <text>`

Automatically applies humanization fixes:
- Replaces AI vocabulary
- Adds contractions
- Removes filler phrases
- Shows before/after risk score

```bash
$ humanize transform "It is important to utilize comprehensive solutions."

═══ TRANSFORMED TEXT ═══

It's important to use complete solutions.

Risk score: 72% → 31% (↓41% improvement)
```

### `humanize watch <directory>`

Monitor a directory for changes and analyze files in real-time:

```bash
$ humanize watch ./content --threshold 60

═══ WATCH MODE ═══

Directory: ./content
Threshold: 60%
Press Ctrl+C to stop

Scanning...

✓ intro.md 23%
⚠ HIGH RISK blog-post.md 78%
  AI words: leverage, comprehensive, robust

Initial scan complete. Analyzed 2 files.
Watching for changes...
```

Options:
- `-t, --threshold <n>` — Alert when score >= threshold (default: 70)
- `-q, --quiet` — Only show high-risk files

### `humanize config`

Check configuration and API key status:

```bash
$ humanize config

═══ HUMANIZE CONFIGURATION ═══

API Integration:
  GPTZero API:       ✓ Configured
  Originality.ai:    ✗ Not configured

Detection Settings:
  AI Vocabulary:     90+ words and phrases
  Pattern Detectors: 9 structural patterns
  Scoring:           5-component weighted average
```

## API Integration

Optional integration with GPTZero and Originality.ai for external validation:

```bash
# Set API keys
export GPTZERO_API_KEY="your-key-here"
export ORIGINALITY_API_KEY="your-key-here"

# Run with API checks
humanize analyze --api --file article.txt
```

The tool works fully offline by default. API keys add external validation on top of local analysis.

## Input Methods

```bash
# Direct text
humanize analyze "Your text here"

# From file
humanize score --file article.txt
humanize score -f draft.md

# Piped input
cat document.txt | humanize suggest
pbpaste | humanize analyze  # macOS clipboard

# Output to file/clipboard
humanize transform -f draft.txt > improved.txt
humanize transform -f draft.txt | pbcopy  # macOS
```

## Options

| Flag | Description |
|------|-------------|
| `-f, --file` | Read input from file |
| `-j, --json` | Output results as JSON |
| `-V, --verbose` | Show detailed output |
| `-q, --quiet` | Minimal output |
| `-a, --api` | Include GPTZero/Originality.ai checks |
| `-t, --threshold` | Alert threshold for watch mode (default: 70) |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

## What It Detects

### AI Vocabulary

Words that scream "I was written by an AI":
- **The worst offenders**: delve, leverage, utilize, comprehensive, robust, seamless
- **Corporate buzzwords**: stakeholder, synergy, actionable, paradigm
- **Formal transitions**: furthermore, moreover, consequently, nevertheless
- **AI tells**: "It is important to note", "In conclusion", "Great question!"

### Structural Patterns

- Perfect intro/body/conclusion structure
- Uniform sentence lengths (low variance)
- Missing contractions
- Overuse of transitions
- Too many bullet points

### Missing Human Elements

- No personal pronouns (I, we, you)
- No opinions or perspective
- No emotional language
- No rhetorical questions
- No humor or personality

## Documentation

The `/docs` folder includes comprehensive guides:

- **[AI Detector Mechanics](docs/ai-detector-mechanics-technical-appendix.md)** — How detectors actually work (perplexity, burstiness, entropy)
- **[Writing Quality Research](docs/writing-quality-research.md)** — What makes writing genuinely good, not just undetectable
- **[The Humanization Pipeline](docs/The_Humanization_Pipeline.md)** — Complete 5-stage workflow for transforming AI text
- **[Tools Setup Guide](docs/Humanization_Tools_Setup.md)** — Recommended tools and budget breakdowns
- **[Quick Reference](docs/Humanization_Quick_Reference.md)** — Cheat sheet for fast fixes

## Philosophy

This tool isn't about fooling detectors — it's about writing better.

The same patterns that trigger AI detectors (robotic tone, uniform structure, missing personality) also make writing *worse*. Whether a human or AI wrote it, text without voice is text nobody wants to read.

Use this tool to:
1. **Understand** why text sounds robotic
2. **Learn** what makes writing human
3. **Improve** your writing habits over time

## License

MIT

---

**Built by [LXGIC Studios](https://lxgicstudios.com)**

🔗 [GitHub](https://github.com/lxgicstudios/humanize-cli) · [Twitter](https://x.com/lxgicstudios)
