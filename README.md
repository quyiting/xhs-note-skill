# xhs-note — Xiaohongshu (小红书 / RED) Note Pipeline

A reusable pipeline that turns **one selling point** into a complete Xiaohongshu post — title, cover headline, body, and AI image prompts — and can optionally fill it into the creator platform through the Chrome DevTools Protocol.

The method comes from the 家庭小酒馆 (Home Cocktail Tavern) account: a 20-episode illustrated cocktail series with a warm-cream-paper, dark-olive-type visual language. **The method is general** — swap "recipe" for any topic and the title formulas, cover structure, batch planning, and compliance rules still apply.

## What it covers

| Stage | Deliverable |
|---|---|
| 0 · Scope | Confirm which notes, whether to fill or publish, what's already live |
| 1 · Copy | Title formula (4 sentence patterns + mix ratio), cover three-page structure, body template, per-note deliverable list |
| 2 · Images | Cover / recipe / steps prompt templates, prompt self-check, batch colour rhythm |
| 3 · Batch | Sentence-pattern mix, three release waves, A/B method, KPI targets and attribution |
| 4 · Fill & publish | CDP-driven fill, selector reference, topic chips, screenshot verification, publish boundary |
| 5 · Compliance | Fixed disclosure strings, banned phrasing, unit-precision rules |

## Requirements

**Stages 1–3 need nothing.** No account, no install, no network. That's where most of the value is.

**Stage 4 needs:** Node 18+, a Chrome you have already logged into Xiaohongshu with, and Chrome started with a debugging port.

```bash
# macOS — quit Chrome first (⌘Q), then:
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222

# Linux
google-chrome --remote-debugging-port=9222
```

Your login survives. The scripts read the port from the environment only:

| Variable | Purpose | Priority |
|---|---|---|
| `CDP_WS_URL` | full browser WebSocket URL | highest |
| `CDP_PORT` | TCP port, default `9222` | next |

```bash
CDP_PORT=9333 node scripts/cdp.mjs targets
```

## Install

Unzip into your agent's skills directory (e.g. `~/.agents/skills/`, `~/.claude/skills/`, `~/.codex/skills/`):

```
xhs-note/
├── SKILL.md
├── README.md
├── LICENSE
├── agents/openai.yaml
├── references/
│   ├── title-formulas.md       # title formula + 20 worked rewrites
│   ├── cover-spec.md           # cover template v2 + image prompt templates
│   ├── batch-playbook.md       # batch planning, release waves, KPI review
│   ├── publishing-playbook.md  # CDP fill manual, selectors, troubleshooting
│   └── compliance.md           # fixed disclosure, banned phrasing, unit rules
├── scripts/
│   ├── cdp.mjs                 # CDP driver (eval / screenshot / upload / type)
│   └── topics.mjs              # topic-chip insertion via the editor dropdown
└── drafts/
    ├── body.template.txt       # body skeleton to copy
    └── 11-cuba-libre.body.txt  # worked example
```

## Quick start

```bash
# 1) find the creator-platform page
node scripts/cdp.mjs targets

# 2) open the publish page, get a targetId
node scripts/cdp.mjs open "https://creator.xiaohongshu.com/publish/publish"

# 3) set the title (React-controlled input — use setvalue, not type)
node scripts/cdp.mjs setvalue "input[placeholder*='标题']" "自由古巴｜只倒朗姆和可乐就错了"

# 4) fill the body (tiptap editor, line by line)
node scripts/cdp.mjs typefile "div.tiptap.ProseMirror" drafts/11-cuba-libre.body.txt

# 5) upload covers (several files in one call)
node scripts/cdp.mjs upload "input[type=file]" cover-01.png cover-02.png cover-03.png

# 6) insert topic chips (goes through the real suggestion dropdown)
node scripts/topics.mjs <targetId> "家庭小酒馆" "调酒" "鸡尾酒"

# 7) screenshot and verify
node scripts/cdp.mjs shot preview.png
```

Full command table and selector reference: `references/publishing-playbook.md`.

### cdp.mjs commands

| Command | Purpose |
|---|---|
| `targets` | list page targets (type / id / title / URL) |
| `open <url>` | open a tab, print the new targetId |
| `close <targetId>` | close a tab |
| `eval "<js>"` | evaluate JS in the page matching `creator.xiaohongshu.com` |
| `evalon <targetId> "<js>"` | evaluate JS in a specific target |
| `shot <out.png>` | screenshot the creator page |
| `upload <selector> <file...>` | set one or more files on `<input type=file>` |
| `files` | list every `<input type=file>` (locate the uploader) |
| `setvalue <selector> <text>` | set a React-controlled input value + fire `input` |
| `type <selector> <text>` | focus and type a single line |
| `typefile <selector> <path>` | type a text file line by line (`\n` = Enter) |
| `focusend <selector>` | move the caret to the end of an element |
| `insert <selector> <text>` | insert text at the end of an element |
| `key <Enter\|Tab\|Backspace>` | send a key |
| `wait <ms>` | sleep |

## Three hard boundaries

1. **Never publish on your own.** Publish only when the user explicitly says so; otherwise stop at "save draft". Publishing is irreversible and goes straight to review.
2. **Never fake a topic chip.** If the platform doesn't offer it, use a synonym or skip it.
3. **Never rewrite the fixed disclosure.** `配方参考 IBA · 单杯份量 · AI插画 · 理性饮酒` and the body footer are copied verbatim.

## Security notes

Both scripts:

- connect **only** to `127.0.0.1` on the debugging port — no external network calls, no runtime downloads;
- read **only** the paths passed as arguments, plus the two environment variables above;
- never write outside the paths given as arguments;
- contain no credentials, tokens, or encoded blobs;
- are plain, commented, auditable JavaScript.

`cdp.mjs` never inspects the browser profile directory. It asks Chrome's own `/json/version` endpoint for the WebSocket URL.

## License

MIT
