---
name: xhs-note
description: "Use when the user asks to write, rewrite, or schedule a Xiaohongshu (小红书 / RED / Little Red Book) post — including requests to 写小红书笔记, 改小红书标题, 做小红书封面, 出笔记文案, fill a RED draft, or publish to creator.xiaohongshu.com. Produces a click-tested title, a thumbnail-readable cover headline, a structured body, an AI image prompt for the cover, and optionally drives the creator platform through Chrome DevTools Protocol. Trigger phrases: xiaohongshu note, red note, 小红书, 小红书文案, 小红书标题, 小红书封面, RED post, creator platform."
---

# 小红书笔记生产流水线 · Xiaohongshu Note Pipeline

一套可复用的流程：从**一句卖点**产出**标题 + 封面方案 + 正文 + 配图提示词**，再通过 CDP 驱动用户已登录的 Chrome，把内容填进小红书创作服务平台。

本 skill 的方法论来自「家庭小酒馆」账号 —— 一个 20 篇系列的家庭调酒图文账号，视觉语言为「暖奶油纸底 + 深橄榄字 + 酒红数字 + 细墨线 + 大量留白」的插画图鉴风。**方法论通用**（标题公式、封面三段式、批次编排、合规红线），但不必是调酒内容：把「配方」换成任何主题的**可验证具体点**即可复用。

> **零假设**：使用者不需要小红书账号就能用本 skill 的阶段一～三（内容生产）。只有阶段四（填稿发布）需要已登录的 Chrome，且默认不执行。

---

## 阶段零：先确认任务边界

动笔前必须确认（缺信息就问，不要猜）：

| 问题 | 为什么必须问 |
|---|---|
| 这次做哪几篇？（编号 / 酒名） | 决定标题句式配比与发布波次 |
| 只出文案，还是要填进创作平台？ | 「填稿」和「发布」是两个动作，不能混 |
| 要不要出图？出图用什么工具？ | 生图提示词与实际出图是两步 |
| 哪些是已发布的、不能动的？ | 已发布笔记的封面回改需要单独授权 |

**硬边界**（默认成立，除非用户明确改口）：

- 只产出文案与封面方案时，**不碰**任何线上已发布笔记。
- **发布**是不可逆动作。即使流程走到最后一步，也要用户明确说「发布」才点发布按钮；否则停在「暂存离开」。
- 配方与做法据 IBA 官网整理，属于可引用事实；**口感结论、酒精度、价格、品牌背书一律不写**。

---

## 阶段一：内容生产规范

### 1.1 标题公式

```
酒名（2–4 字）｜ + 具体点（6–11 字，含数字/顺序/易错词）
```

总长 ≤ 20 字（小红书上限）。

三条硬规则：

1. **前 8 个字必须自带信息量**。移动端会截断，`调酒｜威士忌酸` 式的开头等于浪费。
2. **卖点必须能在正文里被兑现**。标题说「别搅」，正文就必须写为什么别搅。
3. **一篇只用一种句式**。十篇全是「≠」会腻。

四种句式，按批次配比分配：

| 句式 | 特征 | 适用 |
|---|---|---|
| 反常识／易错型 | `≠`、买错材料、漏材料 | 制造「我是不是做错了」的自我怀疑，收藏与转发动机最强 |
| 数字型 | 比例、毫升数 | 一眼看完，截图保存动机强 |
| 顺序型 | 先做 A 再做 B | 讲操作先后，适合步骤类 |
| 对照型 | 与另一杯/另一种做法的差异 | 与系列内其他篇联动 |

**禁用标题**：`调酒｜酒名`、`我的酒单上永远有你`、`一杯入魂`、任何未验证的口感结论、任何酒精度数字。

### 1.2 封面三段式

小红书首图在信息流里只有约 150px 宽，首图的唯一目的是**让人在缩略图里读懂**。

**第 1 页（封面）— 唯一的点击页**

```
┌──────────────────────────────┐
│  家庭小酒馆 · 11/20        ← 角标，右上，极小字，系列感
│                              │
│   还差 10 ml 青柠            ← 大字卖点：≤ 12 字，最多 2 行
│                              │                    每行 ≤ 6 字
│                              │
│      [ 单杯成品插画 ]         ← 占画面 55%–65%，只画一杯
│        杯型 / 颜色 / 一杯冰   │     不画工具、不画材料堆
│                              │
│ 自由古巴 · CUBA LIBRE   ← 酒名小字（≤ 14px 等效），不抢卖点
└──────────────────────────────┘
```

硬性规范：

- 尺寸 3:4（1242×1656 或 1080×1440），全出血，文字不贴边（四周留 ≥ 6% 安全区）
- 大字字高 ≥ 画面高度的 8%；缩到 150px 宽仍能认出 4 个字 —— 这是自检线，过不了就删字
- 首图文字总量：大字 1 句 + 酒名 1 行 + 角标 1 行，**不超过 3 层**
- 首图**不出现**：材料清单、步骤编号、表格线、多杯并排、价格、酒精度
- 保留现有视觉语言：暖奶油纸底、深橄榄字、酒红数字、细墨线、留白充足

**第 2 页 — 配方卡**

- 只放「单杯配方」三项左右，字号比原设计稿放大 1.5 倍，一行一项
- 顶部小字：`单杯配方 · {酒名}`
- 底部固定一行：`配方参考 IBA · 单杯份量 · AI插画 · 理性饮酒`（**不改**，避免合规口径漂移）
- 这一页的作用是**留住人**（承接人均观看时长），不是吸引点击

**第 3 页 — 步骤卡**

- 3 条编号步骤，每条 ≤ 18 字
- 加一条「记住这一点」的易错提示

**第 4 页（可选）— 数字卡**

- 只在大字卖点有数字时使用（60:10、75+75）
- **一个批次里最多用 3 次**，避免每篇都四图

### 1.3 正文结构

正文承担两件事：兑现标题承诺 + 给出可截图的配方。

```
{1–2 句开场：先承认大众做法，再点出差距}

🍸 单杯配方
{材料} {量}
{材料} {量}
{材料} {量}

做法
1．{步骤}
2．{步骤}
3．{步骤}

记住这一点：{易错提示}

{结尾二选一提问}
{合规声明}
```

要点：

- 开场必须**先承认大众做法**再反转（例：「白朗姆加可乐，很多人以为这就是自由古巴。其实还差 10 ml 鲜青柠汁——少了它，配方就不完整。」）
- 材料与单位之间留空格，保留 `ml`、`dash`、`少许` 等原始单位。**`dash` 不写成「1 滴」或「1 ml」；`少许` 不编毫升数**
- 步骤用全角句号 `1．`（与序号之间不空格）
- 「记住这一点」是全篇最容易被截图转发的一行，必须写具体的易错点
- 结尾用**二选一提问**制造评论动机（例：「下一篇想看无摇酒器版，还是低度数版？」）
- 合规声明固定：`配方比例与做法据 IBA 官网整理；配图为 AI 生成插画，非实拍。理性饮酒。`

### 1.4 单篇交付物清单

每一篇产出这 6 项才算完成：

1. 标题（主选 1 条 + 备选 2 条，主选 ≤ 20 字）
2. 封面大字（≤ 12 字，最多 2 行）
3. 封面画面描述（杯型 / 颜色层次 / 冰的处理 / 装饰 / 主色）
4. 系列角标（`家庭小酒馆 · NN/20`）
5. 第 2 页配方 + 第 3 页三步 + 易错提示
6. 正文全文（含结尾提问 + 合规声明）

---

## 阶段二：封面生图提示词

### 2.1 第 1 页（封面）提示词模板

```
Use case: infographic-cover.
Create ONE finished Chinese cocktail cover illustration, portrait 3:4, high resolution, all edges visible.
A cohesive illustrated handbook series: warm cream paper, refined dark olive Chinese typography, small burgundy numerals, restrained ink rules, generous negative space. Gouache and watercolor with fine ink contours, realistic glass geometry, calm and highly readable. AI illustration, not a photograph.

Composition: ONE single hero drink, centered slightly low, occupying 55–65% of the canvas. Large short headline in the upper third, maximum two lines, maximum six characters per line. Small series badge in the top-right corner. Small cocktail name line under the glass. No ingredient list, no numbered steps, no tables, no multiple glasses.

Hero drink: {杯型} with {颜色与层次}, {冰的处理}, {装饰}.
Palette: {主色} over warm cream.
Series badge exact: "家庭小酒馆 · {编号}/20"
Headline exact (render VERBATIM, do not paraphrase, do not add words): "{首图大字}"
Sub-line exact: "{酒名} · {英文名}"
Constraints: no logos, no branded bottles, no people, no price, no ABV numbers, no health claims, no extra text anywhere else.
```

### 2.2 第 2、3 页提示词的改法

沿用既有 `prompt-01.txt` 结构，只改三处：

1. 删除标题区大字（由第 1 页承担）
2. 材料字号放大到原稿 1.5 倍，一行一项，保留单位与空格
3. 顶部小字改为 `单杯配方 · {酒名}`

第 3 页正文区换成 `做法` 三条 + 一行 `记住这一点：{易错提示}`，字号不小于材料页。

### 2.3 提示词自检

出图前逐条核对：

- [ ] 角标数字与实际系列序号一致（`家庭小酒馆 · 11/20`）
- [ ] 大字与定稿标题的**大字**完全一致，一字不差
- [ ] 只画了一杯，没有材料堆、没有步骤卡
- [ ] 视觉风格与系列内其他篇一致（暖奶油纸 + 深橄榄字）
- [ ] 没有 logo、品牌瓶、价格、酒精度、人物

---

## 阶段三：批次编排与发布节奏

### 3.1 句式配比

一个批次（通常 10 篇）按固定比例分配句式，避免同质：

| 句式 | 篇数 | 用途 |
|---|---|---|
| 反常识／易错型 | 4 | 制造「我是不是做错了」 |
| 数字型 | 3 | 一眼看完，收藏动机强 |
| 顺序型 | 3 | 讲操作先后 |

### 3.2 发布波次

- **第一波 3 篇**：挑错误类型互不重叠的三种（「漏材料」「买错材料」「比例错」），且主色差异最大 —— 信息流里不撞脸
- **第二波 3 篇**：数字型 + 顺序型
- **第三波 4 篇**：其余
- **间隔 2–3 天一篇**，避免同一模板连续刷屏
- **同杯型的两篇必须隔开发**（例：笛形杯的贝里尼与含羞草）

### 3.3 A/B 方法（不改素材，只换标题）

- 同一篇不做双发。用**同句式两篇**对比：反常识型 4 篇看平均值，数字型 3 篇看平均值。
- 每篇观察满 **72 小时**再记数。
- 记录 `曝光 / 观看 / CTR / 人均观看 / 收藏 / 涨粉`，**直接抄后台数值，不换算**。

### 3.4 验收指标

沿用账号基线作为目标线：

| 指标 | 账号现状 | 本批目标 |
|---|---|---|
| 封面点击率 | 单杯 5.9%–7.7%，账号 7 日 6.6% | 单杯 ≥ 7.7%，图鉴级 9% 作上限参考 |
| 人均观看 | 单杯 6–18 秒 | ≥ 15 秒 |
| 收藏率（藏/观看） | 单杯约 1.5%–10% | ≥ 5% 作本账号试验门槛 |
| 涨粉 | 近 7 日 +4 | 不设硬指标，先看主页访客是否随角标上升 |

判读纪律：**发布不足 72 小时不作失败判定**；单篇样本太小，一次改稿只看趋势，不做因果断言。

指标异常时的归因：

- CTR 上去了但人均观看掉了 → 封面过度承诺。下一轮把大字卖点降一档强度、第 2 页配方卡提前。
- CTR 没动但收藏率上去了 → 封面改动有效、曝光分配不够。考虑换发布时间，而不是再改标题。

---

## 阶段四：填稿与发布（浏览器自动化）

用 **用户已登录的 Chrome** 驱动小红书创作服务平台。工具脚本在 `scripts/`：

- `scripts/cdp.mjs` — CDP 驱动：打开页面、求值、截图、上传图片、打字
- `scripts/topics.mjs` — 话题标签批量插入（走编辑器下拉候选）

### 4.1 前置条件（必查）

1. **Chrome 必须以远程调试端口启动**。检查：

   ```bash
   curl -sS http://127.0.0.1:9222/json/version
   ```

   连不上就要让用户**完全退出 Chrome** 后，用调试端口重启：

   ```bash
   # macOS
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --remote-debugging-port=9222
   # Linux
   google-chrome --remote-debugging-port=9222
   ```

   登录态会保留。不要在用户不知情的情况下强杀浏览器。

   脚本只从环境变量读端口（`CDP_WS_URL` 优先，其次 `CDP_PORT`，默认 `9222`），**不读取浏览器配置文件目录**。端口不同时用 `CDP_PORT=9333 node scripts/cdp.mjs targets`。

2. 用户已在 Chrome 里登录小红书创作服务平台。

3. 配图已按阶段二出好，放在本地，路径已知。

### 4.2 标准填稿序列

```bash
# 1) 找到创作平台页面
node scripts/cdp.mjs targets

# 2) 打开发布页，拿到 targetId
node scripts/cdp.mjs open "https://creator.xiaohongshu.com/publish/publish"
#    → 输出形如 3A7F... 的 targetId

# 3) 填标题（发布页的标题输入框）
node scripts/cdp.mjs evalon <targetId> "document.querySelector('input[placeholder*=\"标题\"]') && 'FOUND'"

# 4) 填正文（tiptap 富文本编辑器）
node scripts/cdp.mjs typefile <targetId> "div.tiptap.ProseMirror" drafts/NN-slug.body.txt
```

`typefile` 会**按行**插入正文，空行自动跳过，行间插入回车 —— 正文段落结构因此得以保留。

### 4.3 上传配图

```bash
# 图片上传控件通常是 <input type=file>
node scripts/cdp.mjs upload "input[type=file]" /abs/path/to/cover-01.png
```

多张图需逐个上传，或使用 `DOM.setFileInputFiles` 一次性传入多个路径（见 `cdp.mjs` 源码的 `upload` 分支，改成接收数组即可）。

### 4.4 插入话题标签

话题要在编辑器里以 `#` 触发候选下拉，再点选真实存在的标签 —— 不能直接敲字符串，否则不会变成可点击的话题。

```bash
node scripts/topics.mjs <targetId> "家庭小酒馆" "调酒" "鸡尾酒" "自制冷饮"
```

脚本会：

1. 把光标移到编辑器末尾，输入 `#`
2. 读取下拉候选（`.recommend-topic-wrapper .tag`）
3. 找不到就点「更多」展开，最多翻 4 次
4. 点中目标标签后，清理编辑器里残留的裸 `#` 字符
5. 输出 `ADDED #标签 -> 当前段落文本` 供你核对

候选里没有的标签会输出 `SKIP (not offered)` —— **不要伪造标签**，跳过即可。

### 4.5 截图自检

填完后**必须**截图核对，再决定是否发布：

```bash
node scripts/cdp.mjs shot /abs/path/to/preview-NN-slug.png
```

用 `read_image` 看这张图，确认：

- [ ] 标题没有被截断成「调酒｜酒名」
- [ ] 正文三段结构完整（配方 / 做法 / 记住这一点）
- [ ] 首图是**封面页**（成品杯 + 大字），不是配方卡
- [ ] 图序正确，封面在第 1 位
- [ ] 话题标签是蓝色可点击样式，不是裸 `#文字`

### 4.6 发布边界

- 用户明确说「发布」→ 点发布按钮。
- 用户只说「填好」「存草稿」「我看看」→ 点 **暂存离开**，不点发布。
- **绝不自行点击发布。** 发布会即时生效并进入审核，无法撤回。

---

## 参考资料

| 文件 | 内容 |
|---|---|
| `references/title-formulas.md` | 标题公式、句式配比、20 条已验证标题改写范例 |
| `references/cover-spec.md` | 封面模板 v2 完整规范 + 生图提示词模板 |
| `references/batch-playbook.md` | 批次编排、发布波次、A/B 方法、验收指标与归因 |
| `references/publishing-playbook.md` | CDP 填稿手册、选择器、故障排查 |
| `references/compliance.md` | 禁用表述清单、固定文案、合规声明 |

---

## 常见坑

| 坑 | 表现 | 解决 |
|---|---|---|
| 标题被削 | 发布后变成「调酒｜酒名」 | 填稿后截图核对；首图大字也承担卖点 |
| 首图塞太多 | 缩略图里读不出字 | 首图只留大字 + 酒名 + 角标 |
| 标签没生效 | 正文里是裸 `#家庭小酒馆` | 用 `topics.mjs` 点候选，不用手打 |
| Chrome 连不上 | `curl 9222` 连接被拒 | 完全退出 Chrome 后带 `--remote-debugging-port=9222` 重启；端口不同则 `CDP_PORT=xxxx` |
| 话题不在候选 | 输出 `SKIP (not offered)` | 换一个更热门的同义词，不要伪造 |
| 配图上传无效 | 控件不是 `input[type=file]` | 先 `eval` 打印所有 `input[type=file]` 的 outerHTML 定位 |
| 编辑器残留裸 `#` | 段落末尾有 `#` | `topics.mjs` 已内置清理；若手动插入需自行处理 |
