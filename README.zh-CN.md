# xhs-note — 小红书笔记生产流水线

[English](README.md) · **简体中文**

把**一个可验证的具体点**做成一篇完整的小红书图文笔记 —— 标题、首图、正文、配图，并可选地通过 Chrome DevTools Protocol 把草稿填进创作服务平台。

不限赛道。自带调酒、家常菜、效率工具、旅行收纳、穿搭五份档案示例。

---

## 为什么要做这个

市面上「AI 帮你写小红书」的工具，产出大多像广告。真正会被收藏的笔记只有一个共同点：**它教会你一件原本会做错的事** —— 一个比例、一个先后顺序、一种会买错的材料。

所以这套流水线只有一条不可让步的规矩：

> 每篇笔记必须承载**一个可验证的具体点** —— 能用尺子量、能查来源、能拍两张图证明。

其余的一切（篇幅、语气、封面风格、发布节奏）都可以谈。

---

## 最关键的判断：主体是「物」还是「人」

动笔之前先定这一件事：

| 主体 | 例 | 能不能 AI 生成 |
|---|---|---|
| **物** | 一杯酒、一道菜、单品平铺、工具、产品 | ✅ 可以，而且应该做成手机随手拍的样子 |
| **人** | 上身效果、上脸效果、健身动作 | ❌ 不行，必须实拍 |
| **混合** | 穿搭（上身+平铺）、美妆（上脸+产品） | ⚠️ 拆开：人实拍，物生成 |

跳过这个判断的流水线，会开开心心地生成一个 AI 模特穿着衣服。读者一眼识破 —— 因为这类内容的全部价值，就是**这个真实的身体穿着这些真实的衣服**。

档案里的 `visual.subject` 这一个字段，决定封面策略、提示词模板，以及「到底允不允许生成」。

---

## 两种首图策略

| | `photo`（默认） | `infographic`（按需） |
|---|---|---|
| 是什么 | 一张有生活痕迹的照片，**图上 0 字** | 带短标题的信息图卡片 |
| 文字在哪 | 全在标题里 | 图上 + 标题 |
| 适合 | 大多数笔记；「AI 味」最轻 | 图鉴、清单、参数对比 |
| 前提 | 主体必须是「物」 | 文字必须用排版工具渲染，不能交给生图模型 |

为什么要求 0 字：AI 写字是最先露馅的地方；而且一旦把字烧进图里，改标题就得重做图。

---

## 覆盖范围

| 阶段 | 产出 |
|---|---|
| **0 · 定边界** | 做哪几篇、填稿还是发布、哪些已上线；装载或新建账号档案 |
| **1 · 文案** | 选题四类、标题公式（四种句式+配比）、正文骨架、单篇交付清单 |
| **2 · 图片** | 物/人判断、生活感照片提示词、信息图模板、生图脚本、成本纪律 |
| **3 · 批次** | 句式配比、发布波次、A/B 方法、数据验收与归因 |
| **4 · 填稿** | CDP 填稿、草稿增删改查、话题链接、七个平台坑 |
| **5 · 合规** | 固定声明、通用与领域红线、单位写法精度 |

贯穿全程的是**账号档案** —— 唯一的题材相关输入：系列名、配色、正文标签、固定声明、禁用表述、KPI 基线、话题池。

---

## 快速开始

### 一、只要文案 —— 不装任何东西、不用账号、不用联网

```
1. 写账号档案        (references/account-profile.md，最小 6 个字段就能开工)
2. 选一个具体点      (四问全「是」才动笔)
3. 标题              {点名}｜{具体点}，≤20 字，一篇只用一种句式
4. 首图              主体是物 → 拍/生成生活感照片；是人 → 必须实拍
5. 正文              开场反转 → 要点 → 做法 → 易错提示 → 二选一提问 → 固定声明
6. 配图              套 references/cover-spec.md 的模板，一张只放一个主体
```

### 二、生成首图

```bash
export MINIMAX_API_KEY=sk-...            # 不要提交进仓库

python3 scripts/genimg.py --prompt-file prompts/12.txt \
  --out assets/12-gin-fizz-src.jpg       # 864×1152，已是 3:4，无水印
python3 scripts/plain.py \
  --photo assets/12-gin-fizz-src.jpg \
  --out  assets/12-gin-fizz-cover.jpg    # 裁成 1242×1656，仍然 0 字
```

换供应商只需改 `genimg.py` 里的 `call()`。成本纪律：**先出一张给用户确认，再批量跑**；批量前先把文件名对齐，否则要付两遍钱。

### 三、填成草稿

```bash
node scripts/cdp.mjs targets
node scripts/cdp.mjs open "https://creator.xiaohongshu.com/publish/publish?source=official"

node scripts/fillnote.mjs  <targetId> assets/12-gin-fizz-cover.jpg drafts/12-gin-fizz.body.txt "金菲士｜摇完把冰滤掉才对"
node scripts/addtopic.mjs  <targetId> 调酒 家庭调酒 金菲士 金酒 气泡酒
node scripts/click.mjs     <targetId> "暂存离开"        # 不是「发布」
```

这个仓库里没有任何代码会点**发布**。发布永远是人的动作。

---

## 环境要求

| 阶段 | 需要什么 |
|---|---|
| 1–3（文案、提示词、批次） | 什么都不需要 —— 不用账号、不用安装、不用联网 |
| 2（生成图片） | Python 3 + Pillow + 一个生图 API key |
| 4（填平台） | Node 18+、已登录小红书的 Chrome、带调试端口启动 |

### 用调试端口启动 Chrome

**Chrome 136+ 不允许在默认 profile 上开调试端口。** 要用独立目录：

```bash
# macOS
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --user-data-dir="$HOME/Library/Application Support/Chrome-Automation" \
  --remote-debugging-port=9222

# Linux
google-chrome --user-data-dir="$HOME/.chrome-automation" --remote-debugging-port=9222
```

新目录没有登录态。要保留登录，从默认 profile 复制这几个（约 30MB，不要整目录 3GB）：

```
Cookies  Local Storage/  Session Storage/  Preferences  "Local State"
```

脚本只从环境变量读地址 —— `CDP_WS_URL` → `CDP_PORT` → 发现文件。

---

## 平台的七个坑

创作平台是 SPA + 自定义元素：**能查到的常常点不到，能点到的常常查不到。** 下面每一条都是真踩出来的：

| 现象 | 原因 | 解法 |
|---|---|---|
| 发布栏、草稿抽屉 `querySelectorAll` 找不到 | 由自定义元素渲染 | 走无障碍树（`Accessibility.getFullAXTree` → `DOM.getBoxModel`） |
| 抽屉显示「暂无草稿」，标签却写着 15 | 默认停在视频页签 | 点「图文笔记」页签 |
| 抽屉跑到屏幕外，坐标 2388、视口 1920 | 滑入动画卡在 `translateX(600px)` | 清 `drawer-slide-right-enter-*`，设 `transform: translateX(0)` |
| 删除按钮点了没反应 | 它是**点击**触发 Popconfirm，不是 hover | 点一下，再点弹窗里的「删除」 |
| 删除按钮点不到 | 卡片在视口外 | 先 `scrollIntoView({block:'center'})` |
| 话题变成裸 `#文字` | 直接插字符串不会转换 | 打 `#词` + Enter，或点下拉候选 |
| 改完正文话题没了 | 重写段落会清掉该段的话题节点 | 先改正文，最后插话题 |

---

## 脚本

| 脚本 | 作用 |
|---|---|
| `lib.mjs` | 公共 CDP 辅助（无障碍树、抽屉、编辑器） |
| `cdp.mjs` | 底座驱动：`targets` / `open` / `evalon` / `shot` / `type` / `typefile` / `upload` |
| `fillnote.mjs` | 建一篇笔记：配图 + 标题 + 正文 |
| `addtopic.mjs` | 插入真话题链接 |
| `listdrafts.mjs` | 列出草稿 |
| `editdraft.mjs` | 打开某篇草稿 |
| `deletedraft.mjs` | 删除草稿（含确认框） |
| `rebuild.mjs` | 删掉重建 —— 换首图的唯一办法 |
| `verifydrafts.mjs` | 核对标题 / 图数 / 段落 / 话题 |
| `setpara.mjs` | 按段落序号改正文 |
| `click.mjs` | 按无障碍名点按钮（发布栏只能这样点） |
| `topics.mjs` | 走下拉候选插话题 |
| `genimg.py` | 生成图片 |
| `plain.py` | 裁 3:4，不加字 |
| `placeholder.py` | 生成占位首图 |

---

## 目录结构

```
xhs-note/
├── SKILL.md                      # 方法论（阶段、规则、清单）
├── references/
│   ├── account-profile.md        # 档案规范 —— 唯一的题材相关输入
│   ├── title-formulas.md         # 标题公式、句式配比、跨题材改写
│   ├── cover-spec.md             # 物/人判断、照片与信息图两种首图
│   ├── publishing-playbook.md    # CDP 手册、草稿增删改、七个坑
│   ├── batch-playbook.md         # 波次、A/B 方法、数据复盘
│   └── compliance.md             # 固定声明、红线、单位规则
├── examples/
│   ├── cocktail-series.md        # 主体是物 —— 可全自动
│   └── topic-profiles.md         # 家常菜 / 效率工具 / 旅行收纳 / 穿搭（主体是人）
├── scripts/                      # 上面列的全部脚本
└── drafts/
    ├── body.template.txt
    └── 11-cuba-libre.body.txt
```

---

## 边界

- **绝不自行发布。** 只存草稿，发布按钮由人点。
- **未经许可，不修改已发布笔记。**
- **不编造事实。** 不写未验证的口感结论、功效、价格、绝对化用语。
- **AI 图要声明**，用档案里那句固定声明，不改写。

---

## 许可

MIT —— 见 [LICENSE](LICENSE)。