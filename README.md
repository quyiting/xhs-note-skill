# xhs-note — Xiaohongshu (小红书 / RED) Note Pipeline

**English** · [简体中文](README.zh-CN.md)

Turn **one verifiable concrete point** into a finished Xiaohongshu post — title, cover, body, images — and optionally stage it as a draft in the creator platform over the Chrome DevTools Protocol.

Built for any niche. Ships with worked profiles for cocktails, home cooking, productivity tools, travel packing, and fashion.

---

## Why this exists

Most "AI writes your 小红书" tools produce text that reads like an ad. The posts that actually get saved have one thing in common: **they teach you one specific thing you'd otherwise get wrong** — a ratio, an order of operations, a material you'd buy by mistake.

So the pipeline has exactly one non-negotiable rule:

> Every note carries **one verifiable concrete point** — something you can check with a ruler, a source, or two comparison photos.

Everything else (length, tone, cover style, posting schedule) is negotiable.

---

## The one decision that matters

Before writing a word, decide **what is the subject of the photo**:

| Subject | Example | May AI generate it? |
|---|---|---|
| **Thing** | a drink, a dish, a flat-lay outfit, a tool, a product | ✅ yes — and it should look like a phone photo |
| **Person** | outfit worn on a body, makeup on a face, workout form | ❌ no — must be shot for real |
| **Mixed** | outfit (worn + flat-lay), beauty (face + product) | ⚠️ split: shoot the person, generate the object |

A pipeline that skips this question will cheerfully generate an AI model wearing clothes. The audience spots it instantly, because the entire value of that content is *this real body in these real clothes*.

This single field (`visual.subject`) drives the cover strategy, the prompt template, and whether generation is allowed at all.

---

## Two cover strategies

| | `photo` (default) | `infographic` (on demand) |
|---|---|---|
| What it is | one lived-in photo, **zero text on the image** | illustrated card with a short headline |
| Wording lives in | the title | the image + the title |
| Good for | most notes; the lightest "AI smell" | atlases, checklists, parameter comparisons |
| Rule | subject = thing only | text must be rendered by a layout tool, never by the image model |

The reason for zero text: AI-written characters are the first thing readers notice, and any text burned into the image has to be redone when you change the title.

---

## What it covers

| Stage | Deliverable |
|---|---|
| **0 · Scope** | Which notes, fill vs. publish, what's already live; load or create the account profile |
| **1 · Copy** | Point selection (4 types), title formula (4 sentence patterns + mix), body skeleton, per-note checklist |
| **2 · Images** | Object-vs-person rule, bare-photo prompt template, infographic template, generation script, cost discipline |
| **3 · Batch** | Sentence-pattern mix, release waves, A/B method, KPI review and attribution |
| **4 · Fill** | CDP fill, draft CRUD (list / open / delete / rebuild / verify), topic chips, the 7 platform traps |
| **5 · Compliance** | Fixed disclosure, general + per-domain red lines, unit-precision rules |

Present in all stages: the **account profile** — the only niche-specific input. Series name, palette, body labels, fixed disclosure, banned claims, KPI baseline, topic pool.

---

## Quick start

### 1. Content only — no install, no account, no network

```
1. Write an account profile   (references/account-profile.md — 6 fields is enough to start)
2. Pick a point               (4 questions, all must be "yes")
3. Title                      {subject}｜{specific point}, ≤20 chars, one sentence pattern
4. Cover                      subject = thing? shoot/generate a photo. person? shoot for real.
5. Body                       hook → key points → how-to → pitfall → question → disclosure
6. Images                     template in references/cover-spec.md, one subject per image
```

### 2. Generate the cover

```bash
export MINIMAX_API_KEY=sk-...            # never committed

python3 scripts/genimg.py --prompt-file prompts/12.txt \
  --out assets/12-gin-fizz-src.jpg       # 864×1152, already 3:4, no watermark
python3 scripts/plain.py \
  --photo assets/12-gin-fizz-src.jpg \
  --out  assets/12-gin-fizz-cover.jpg    # crop to 1242×1656, still zero text
```

Any provider works — swap `call()` in `genimg.py`. The cost rule: **render one sample, get it approved, then batch**; align filenames before batching, or you pay twice.

### 3. Stage it as a draft

```bash
node scripts/cdp.mjs targets
node scripts/cdp.mjs open "https://creator.xiaohongshu.com/publish/publish?source=official"

node scripts/fillnote.mjs  <targetId> assets/12-gin-fizz-cover.jpg drafts/12-gin-fizz.body.txt "金菲士｜摇完把冰滤掉才对"
node scripts/addtopic.mjs  <targetId> 调酒 家庭调酒 金菲士 金酒 气泡酒
node scripts/click.mjs     <targetId> "暂存离开"        # never "发布"
```

Nothing in this repo clicks **发布**. Publishing is always a human action.

---

## Requirements

| Stages | Needs |
|---|---|
| 1–3 (content, prompts, planning) | nothing — no account, no install, no network |
| 2 (image generation) | Python 3 + Pillow + a provider API key |
| 4 (fill the platform) | Node 18+, a Chrome already logged into Xiaohongshu, started with a debugging port |

### Starting Chrome with a debugging port

**Chrome 136+ refuses to open a debugging port on the default profile.** Use a dedicated directory:

```bash
# macOS
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --user-data-dir="$HOME/Library/Application Support/Chrome-Automation" \
  --remote-debugging-port=9222

# Linux
google-chrome --user-data-dir="$HOME/.chrome-automation" --remote-debugging-port=9222
```

A fresh directory has no login. To keep it, copy these from your default profile (~30 MB, not the whole 3 GB):

```
Cookies  Local Storage/  Session Storage/  Preferences  "Local State"
```

Scripts read the endpoint from the environment only — `CDP_WS_URL` → `CDP_PORT` → discovery file.

---

## The 7 platform traps

The creator platform is a SPA with custom elements: **what you can query, you often can't click; what you can click, you often can't query.** Each of these cost real debugging time:

| Symptom | Cause | Fix |
|---|---|---|
| Publish bar / draft drawer invisible to `querySelectorAll` | rendered by a custom element | go through the accessibility tree (`Accessibility.getFullAXTree` → `DOM.getBoxModel`) |
| Drawer says "no drafts" while the tab shows 15 | defaults to the video tab | click the `图文笔记` tab |
| Drawer sits off-screen at x=2388 with a 1920 viewport | slide-in animation stalled at `translateX(600px)` | clear `drawer-slide-right-enter-*`, set `transform: translateX(0)` |
| Delete button does nothing | it opens a Popconfirm on **click**, not hover | click once, then click `删除` in the popover |
| Delete button unreachable | card is below the fold | `scrollIntoView({block:'center'})` first |
| Topic becomes plain `#text` | typing a string doesn't convert it | type `#word` + `Enter`, or pick from the dropdown |
| Topics vanish after editing | rewriting a paragraph drops its topic nodes | edit body first, add topics last |

---

## Scripts

| Script | Purpose |
|---|---|
| `lib.mjs` | shared CDP helpers (AX-tree, drawer, editor) |
| `cdp.mjs` | base driver: `targets` / `open` / `evalon` / `shot` / `type` / `typefile` / `upload` |
| `fillnote.mjs` | create a note: image + title + body |
| `addtopic.mjs` | insert real topic links |
| `listdrafts.mjs` | list drafts |
| `editdraft.mjs` | open a draft |
| `deletedraft.mjs` | delete a draft (with confirmation) |
| `rebuild.mjs` | delete + recreate — the only way to swap a cover |
| `verifydrafts.mjs` | check title / image count / paragraphs / topics |
| `setpara.mjs` | rewrite a paragraph by index |
| `click.mjs` | click by accessible name (the publish bar needs this) |
| `topics.mjs` | topic chips via the dropdown |
| `genimg.py` | image generation |
| `plain.py` | crop to 3:4, no text |
| `placeholder.py` | grey placeholder cover |

---

## Repo layout

```
xhs-note/
├── SKILL.md                      # the method (stages, rules, checklists)
├── references/
│   ├── account-profile.md        # profile spec — the only niche-specific input
│   ├── title-formulas.md         # title formula, sentence patterns, rewrites
│   ├── cover-spec.md             # object-vs-person, photo/infographic covers
│   ├── publishing-playbook.md    # CDP manual, draft CRUD, the 7 traps
│   ├── batch-playbook.md         # waves, A/B method, KPI review
│   └── compliance.md             # fixed disclosure, red lines, unit rules
├── examples/
│   ├── cocktail-series.md        # thing subject — fully automatable
│   └── topic-profiles.md         # cooking / tools / travel / fashion (person)
├── scripts/                      # everything above
└── drafts/
    ├── body.template.txt
    └── 11-cuba-libre.body.txt
```

---

## Boundaries

- **Never publish on your own.** Drafts only; the human clicks publish.
- **Never edit published notes** without explicit permission.
- **Never invent a spec.** No unverified taste claims, no health effects, no prices, no absolute superlatives.
- **Disclose AI images** in the fixed footer, in the account's own wording.

---

## License

MIT — see [LICENSE](LICENSE).