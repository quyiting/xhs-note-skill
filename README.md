# xhs-note — Xiaohongshu (小红书 / RED) Note Pipeline

A reusable pipeline that turns **one verifiable concrete point** into a complete Xiaohongshu post — title, cover headline, body, and AI image prompts — and can optionally fill it into the creator platform through the Chrome DevTools Protocol.

**Any niche works.** Food, efficiency tools, travel packing, study methods, skincare, code — the method (title formulas, three-layer cover, body skeleton, batch planning, compliance rules) is topic-independent. Everything topic-specific lives in a single **account profile**: series name, visual language, body labels, fixed disclosure, banned phrasing, KPI baseline, topic pool.

## How it generalizes

| Layer | Topic-independent? | Where it lives |
|---|---|---|
| Title formulas, sentence-pattern mix | ✅ always | `references/title-formulas.md` |
| Cover: object-vs-person rule, bare-photo or infographic | ✅ always | `references/cover-spec.md` |
| Body skeleton (hook → key points → how-to → pitfall → question → disclosure) | ✅ always | `SKILL.md` |
| Batch waves, A/B method, attribution | ✅ always | `references/batch-playbook.md` |
| CDP fill & publish | ✅ always | `references/publishing-playbook.md` |
| Series name, palette, body labels, fixed disclosure, bans, KPI | ❌ per account | **`references/account-profile.md`** |

## What it covers

| Stage | Deliverable |
|---|---|
| 0 · Scope | Confirm which notes, whether to fill or publish, what's already live; load or create the account profile |
| 1 · Copy | Point selection (4 types), title formula (4 sentence patterns + mix ratio), cover three-layer structure, body skeleton, per-note deliverable list |
| 2 · Images | **Object-vs-person rule** (decides whether AI may generate), bare-photo prompt template, infographic template, image API script, cost discipline |
| 3 · Batch | Sentence-pattern mix, three release waves, A/B method, KPI review and attribution |
| 4 · Fill & publish | CDP fill, draft CRUD (list / open / delete / rebuild / verify), topic chips, the 7 platform traps, publish boundary |
| 5 · Compliance | Fixed disclosure from the profile, general + per-domain red lines, unit-precision rules |

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
│   ├── account-profile.md        # profile spec: fields, minimal profile, blank template
│   ├── title-formulas.md         # title formula + sentence patterns + cross-niche rewrites
│   ├── cover-spec.md             # object-vs-person rule, photo/infographic covers
│   ├── publishing-playbook.md    # CDP manual, draft CRUD, the 7 platform traps
│   ├── batch-playbook.md         # batch planning, release waves, KPI review
│   └── compliance.md             # fixed disclosure, red lines, unit rules
├── examples/
│   ├── cocktail-series.md        # worked case: object subject, fully automatable
│   └── topic-profiles.md         # profiles: cooking / tools / travel / fashion (person)
├── scripts/
│   ├── lib.mjs                   # shared CDP helpers (AX-tree, drawer, editor)
│   ├── cdp.mjs                   # CDP driver (eval / shot / open / type)
│   ├── genimg.py                 # MiniMax image API
│   ├── plain.py                  # crop to 3:4, no text
│   ├── placeholder.py            # grey placeholder cover
│   ├── fillnote.mjs              # image + title + body
│   ├── addtopic.mjs              # real topic links
│   ├── listdrafts.mjs            # list drafts
│   ├── editdraft.mjs             # open a draft
│   ├── deletedraft.mjs           # delete a draft
│   ├── rebuild.mjs               # delete + recreate (swap cover)
│   ├── verifydrafts.mjs          # check title / images / paras / topics
│   ├── setpara.mjs               # rewrite a paragraph by index
│   ├── click.mjs                 # click by accessible name
│   └── topics.mjs                # topic chips via dropdown
└── drafts/
    ├── body.template.txt         # body skeleton to copy
    └── 11-cuba-libre.body.txt    # worked example
```

## The one decision that matters most

Who — or what — is the subject of the photo?

| Subject | Example | May AI generate it? |
|---|---|---|
| **Thing** | a drink, a dish, a flat-lay outfit, a tool, a product | ✅ yes |
| **Person** | worn-on-body outfit, makeup on a face, workout form | ❌ no — must be shot for real |
| **Mixed** | outfit (worn + flat-lay), beauty (face + product) | ⚠️ split: shoot the person, generate the object |

A pipeline that ignores this will happily produce an AI model wearing clothes — and the audience spots it instantly, because the whole value of that content is *this real body in these real clothes*.

Everything downstream (`image_mode`, prompt template, whether generation is allowed at all) hangs off this one field.

## Quick start — content only

```
1. 建账号档案（references/account-profile.md，最小 6 个字段）
2. 选题：一个可验证具体点，四问全「是」才动笔
3. 标题：{点名}｜{具体点}，≤20 字，本篇只用一种句式
4. 封面：先判断主体是物还是人；物→生成生活感照片（图上 0 字），人→必须实拍
5. 正文：开场反转 → 要点清单 → 三步做法 → 易错提示 → 二选一提问 → 固定声明
6. 配图提示词：套 cover-spec.md 的模板，角标与大字逐字核对
```

## Quick start — fill and publish

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

## Images

Default is a **bare photo with no text on it** — all wording goes in the title.
Generation goes through `scripts/genimg.py` (MiniMax; swap `call()` for another provider):

```bash
export MINIMAX_API_KEY=sk-...        # never commit
python3 scripts/genimg.py --prompt-file prompts/12.txt --out assets/12-gin-fizz-src.jpg
python3 scripts/plain.py --photo assets/12-gin-fizz-src.jpg --out assets/12-gin-fizz-cover.jpg
```

Cost discipline: render **one** sample, get it approved, then batch. Align filenames
before batching (`{id}-{name}-src/cover`) — a mismatch means paying twice.

## Draft management

```bash
node scripts/listdrafts.mjs   <targetId>
node scripts/editdraft.mjs    <targetId> "标题"
node scripts/deletedraft.mjs  <targetId> "标题"
node scripts/rebuild.mjs      <targetId> drafts/rebuild-spec.txt --root .
node scripts/verifydrafts.mjs <targetId> "标题1" "标题2"
```

`rebuild` spec lines: `slug|标题|话题1,话题2`.

Nothing in this repo clicks 发布. Publishing is always a human action.

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
3. **Never rewrite the profile's fixed disclosure.** The image footer and body footer are copied verbatim from the account profile.

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
