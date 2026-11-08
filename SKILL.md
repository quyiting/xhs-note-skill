---
name: xhs-note
description: "Use when the user asks to write, rewrite, or schedule a Xiaohongshu (小红书 / RED / Little Red Book) post — 写小红书笔记, 改小红书标题, 做小红书封面, 出笔记文案, fill a RED draft, or publish to creator.xiaohongshu.com. Works for any niche (家常菜, 效率工具, 旅行收纳, 学习方法, 职场, 健身, 护肤, 代码…), not just one. Produces a click-tested title, a thumbnail-readable cover headline, a structured body, an AI image prompt for the cover, and optionally drives the creator platform through Chrome DevTools Protocol. Trigger phrases: xiaohongshu note, red note, 小红书, 小红书文案, 小红书标题, 小红书封面, RED post, creator platform."
---

# 小红书笔记生产流水线（通用版）· Xiaohongshu Note Pipeline

从**一句卖点**产出**标题 + 封面方案 + 正文 + 配图提示词**，必要时再通过 CDP 驱动用户已登录的 Chrome，把内容填进小红书创作服务平台。

## 这套方法为什么是通用的

流水线只依赖两个抽象，与题材无关：

1. **账号档案（Account Profile）** —— 题材相关的一切都装在这里：系列名、视觉语言、正文骨架标签、固定声明、禁用表述、KPI 基线、标签池。换成任何赛道只改这一份档案，流程一个字不动。
2. **可验证具体点** —— 每篇笔记只讲**一个能被核对、能被复现、能被兑现**的细节（一个比例、一个顺序、一个易错点、一个概念对）。调酒的「配方」是它，家常菜的「火候」是它，效率工具的「快捷键」是它。

> **零假设**：阶段一～三（内容生产）不需要小红书账号、不需要装任何东西、不需要联网。阶段四（填稿发布）才需要已登录的 Chrome，且**默认不执行**。
>
> **无档案也能开工**：用户临时起意写一篇时，按 `references/account-profile.md` 里的「最小档案」现填 6 个字段即可，不必建文件。

---

## 阶段零：确认边界 + 装载档案

### 0.1 必问（缺信息就问，不要猜）

| 问题 | 为什么必须问 |
|---|---|
| 这次做哪几篇？（主题 / 条目 / 编号） | 决定标题句式配比与发布波次 |
| 哪个账号？有没有既定的档案或风格？ | 决定视觉语言、固定声明、禁用表述 |
| 只出文案，还是要填进创作平台？ | 「填稿」和「发布」是两个动作，不能混 |
| 要不要出图？出图用什么工具？ | 生图提示词与实际出图是两步 |
| 哪些是已发布的、不能动的？ | 已发布笔记的封面回改需要单独授权 |

### 0.2 装载账号档案

档案是本 skill 唯一的题材相关输入。查找顺序：

1. `profile/` 目录或用户指定的档案文件（YAML / Markdown 均可）
2. `examples/topic-profiles.md` 里的现成赛道档案（可直接复制改名）
3. 都没有 → 按 `references/account-profile.md` 现建一份**最小档案**（6 个字段：账号/题材、目标读者、视觉语言、正文骨架标签、固定声明、禁用表述）

**档案里的固定声明与禁用表述是红线，不允许为了某篇稿子临时改写。**

### 0.3 硬边界（默认成立，除非用户明确改口）

- 只产出文案与封面方案时，**不碰**任何线上已发布笔记。
- **发布**是不可逆动作。即使流程走到最后一步，也要用户明确说「发布」才点发布按钮；否则停在「暂存离开」。
- 只写**档案允许的事实来源**里的内容；未经验证的口感结论、疗效、绝对化表述、价格一律不写。

---

## 阶段一：内容生产规范

### 1.1 选题：先有「一个具体点」

一篇笔记 = 一个**可验证具体点**。从这四类里选（与题材无关）：

| 类型 | 特征 | 例（不同题材） |
|---|---|---|
| 缺口型 | 大众做法少了一步 / 换了一个关键件 | 「还差 10 ml 青柠」／「少了这一步汤就浑」 |
| 易错型 | 买错料 / 用错工具 / 概念搞混 | 「姜汁啤酒 ≠ 姜味汽水」／「≠ 气泡水」 |
| 参数型 | 比例、克数、时长、次数 | 「60 : 10」／「3 分钟、180℃」 |
| 顺序型 | 先做 A 再做 B 的先后差别 | 「先溶糖再倒酒」／「先烤后腌」 |

选题四问，全是「是」才动笔：

1. 它**能被核对**吗？（有权威来源／能被复现／能截图验证）
2. 读者**会做错**吗？（没人错的点没有收藏动机）
3. **一句话说得清**吗？（说不清就换点）
4. 正文第 2、3 页**能兑现**吗？（兑现不了就是标题党）

### 1.2 标题公式

```
{点名（2–4 字）}｜{具体点（6–11 字，含数字／顺序／易错词)}
```

总长 ≤ 20 字（小红书上限）。

三条硬规则：

1. **前 8 个字必须自带信息量**。移动端会截断，`调酒｜威士忌酸`、`效率｜工具` 这类零信息开头等于浪费。
2. **卖点必须能在正文里被兑现**。标题说「别搅」，正文就必须写为什么别搅。
3. **一篇只用一种句式**。十篇全是「≠」会腻。

四种句式，按批次配比分配：

| 句式 | 特征 | 适用 |
|---|---|---|
| 反常识／易错型 | `≠`、买错、漏一步、概念混 | 制造「我是不是做错了」的自我怀疑，收藏与转发动机最强 |
| 数字／参数型 | 比例、克数、分钟、次数 | 一眼看完，截图保存动机强 |
| 顺序／流程型 | 先做 A 再做 B | 讲操作先后，适合步骤类 |
| 对照／对比型 | 与另一个做法／另一个选项的差异 | 与系列内其他篇联动 |

**禁用标题**：零信息开头（`分类｜名称` 两边都是类目词）、泛情绪词（`我的 XX 上永远有你`、`一杯入魂`）、任何未验证的结论、任何绝对化用语、档案禁列的价格／功效／参数。

> 句式配比、禁用清单、跨题材改写范例见 `references/title-formulas.md`；调酒系列的完整档案与 20 条已验证范例见 `examples/cocktail-series.md`。

### 1.3 首图：先判断主体是「物」还是「人」

这一步比画风重要。判断错了，后面全白做。

| 主体 | 例 | 能不能 AI | 理由 |
|---|---|---|---|
| **物** | 一杯酒、一道菜、单品平铺、工具、产品 | ✅ 可以 | 没有身份，不承诺真人体验 |
| **人** | 上身效果、上脸效果、健身动作、真人出镜 | ❌ 必须实拍 | 卖点就是真实身体与真实结果 |
| **混合** | 穿搭（上身 + 单品）、美妆（上脸 + 产品） | ⚠️ 拆开做 | 上身实拍，单品可生成 |

**口诀**：读者要看「这东西长什么样」→ AI 可以；要看「我用了会怎样」→ 只有真人可信。

然后按档案里的 `visual.image_mode` 选一种：

**策略 A｜纯照片（默认）** —— 首图一张生活感照片，**图上 0 字**，卖点全交给标题。

- 这是「AI 味」最轻、最省事、最不容易翻车的形态
- 硬要求：单一方向光、有真实阴影、台面有 2–3 件无关杂物、留一处「不干净」
- 不要在图上线贴大字：AI 写字最先露馅，而且换标题就得重做图

**策略 B｜信息图封面（按需）** —— 仅适合「内容本身就是信息结构」的题材（图鉴、清单、参数对比、流程总览）。

- 大字 ≤ 12 字、2 行内、字高 ≥ 画面高度 8%
- 文字必须用**排版工具**渲染（Pillow / Figma），不要让生图模型写
- 自检：缩到 150px 宽仍认得出 4 个字

**第 2 页起**负责留住人（承接人均观看时长）：要点卡 → 步骤卡 →（可选）数字卡。

> 完整规格、命名约定、发布前自检清单见 `references/cover-spec.md`。

### 1.4 正文骨架

正文承担两件事：兑现标题承诺 + 给出**可截图**的要点清单。

```
{1–2 句开场：先承认大众做法，再点出差距}

{要点清单标题，如「🍸 单杯配方」/「📋 采购清单」/「3 个关键参数」}
{要点} {量／参数}
{要点} {量／参数}
{要点} {量／参数}

{做法标题，如「做法」/「步骤」/「怎么开始」}
1．{步骤}
2．{步骤}
3．{步骤}

{易错提示标签，如「记住这一点：」}{具体易错点}

{结尾二选一提问}
{档案里的正文固定声明}
```

要点：

- 开场必须**先承认大众做法**再反转（例：「白朗姆加可乐，很多人以为这就是自由古巴。其实还差 10 ml 鲜青柠汁——少了它，配方就不完整。」）
- 数值与单位之间留空格，保留档案里的原始单位写法。**`dash` 不写成「1 滴」；「少许」不编具体数值**
- 步骤用全角句号 `1．`（与序号之间不空格）
- 易错提示是全篇最容易被截图转发的一行，必须写具体的易错点
- 结尾用**二选一提问**制造评论动机（例：「下一篇想看无摇酒器版，还是低度数版？」）
- 固定声明照抄档案，不改写

### 1.5 单篇交付物清单

每一篇产出这 7 项才算完成：

1. 标题（主选 1 条 + 备选 2 条，主选 ≤ 20 字，备选与主选同句式）
2. 封面大字（≤ 12 字，最多 2 行）
3. 封面主体描述（形态／材质层次／关键细节／主色）
4. 系列角标（`{系列名} · NN/NN`）或「本篇不做系列」的明确说明
5. 第 2 页要点 + 第 3 页三步 + 易错提示
6. 正文全文（含结尾提问 + 固定声明）
7. 话题标签候选（从档案标签池里挑，待阶段四走候选流程）

---

## 阶段二：生图与封面

### 2.0 优先用「真照片」而不是插画

只要主体是**物**，第一选择是生成一张**看起来像手机随手拍的照片**，不是插画。

插画本身没错，错在「一眼能看出是 AI 做的图」。信息流里读者没义务分辨，划走就是划走。

生活感照片的六个要素（缺一个就假）：

| 要素 | 写法 |
|---|---|
| 光源 | 单一、有方向：`soft daylight from a window on the left, long soft shadows` |
| 相机感 | `shot on iPhone main camera, 35mm equivalent, shallow depth of field` |
| 缺陷 | `mildly underexposed, subtle film grain` |
| 环境物 | 2–3 件无关杂物：餐巾、砧板、纸巾、水果、瓶子 |
| 不干净 | 水圈、指纹、汁渍、边缘杂物 |
| 构图 | 略偏、略俯，不要海报式对称 |

**硬约束**：`vertical 3:4, no text anywhere` —— 图上不出字，字交给后期或标题。

### 2.1 照片提示词模板（策略 A）

```
A candid smartphone photo of {主体} on {台面/场景},
{主体的关键形态与颜色},
beside it {2–3 件无关杂物},
{directional light source} with {shadow description},
{不完美细节: condensation / water ring / fingerprint / juice stain},
slight 45-degree angle, shallow depth of field,
mildly underexposed, subtle film grain,
shot on iPhone main camera, 35mm equivalent,
unstaged everyday {场景}, vertical 3:4, no text anywhere
```

反向词（每次都带）：

```
illustration, vector art, infographic, poster layout, any text, letters, numbers,
watermark, logo, brand label, studio lighting, softbox, seamless white background,
perfect symmetry, glossy commercial advertising, HDR, oversaturated,
3D render, CGI, digital painting, cartoon, person's face
```

### 2.2 信息图封面模板（策略 B，按需）

```
Use case: infographic-cover.
Create ONE finished {题材} cover illustration, portrait 3:4, all edges visible.
{视觉预设: 纸色 / 墨色 / 点缀色 / 画法}
Composition: ONE single hero {主体}, occupying 55–65%. Large short headline in the upper third,
maximum two lines, maximum six characters per line. Small badge top-right.
No list, no numbered steps, no tables, no multiple subjects.
Hero: {形态与细节}. Palette: {主色} over {纸色}.
Constraints: no logos, no branded products, no people, no price, no extra text.
```

> 生成后若文字有缺笔画，**不要修图**，改用排版工具重新渲染文字层。

### 2.3 第 2、3 页

1. 删掉标题区大字（由第 1 页承担）
2. 要点字号放大到原稿 1.5 倍，一行一项，保留单位与空格
3. 顶部小字改为 `{要点清单标题} · {对象名}`
4. 第 3 页正文换成 3 条做法 + 一行易错提示

### 2.4 出图工具

**优先用本地脚本直接调 API**，不要把提示词丢给用户让他自己去跑。

| 方式 | 适用 | 脚本 |
|---|---|---|
| MiniMax `image_generation` | 通用，返回 3:4 无 watermark | `scripts/genimg.py` |
| 其他生图 API | 改 `genimg.py` 里的 endpoint 与 body 即可 | — |
| 用户自己的工具（即梦 / MJ） | 只在用户明确要用时 | 提示词给用户 |

MiniMax 用法：

```bash
export MINIMAX_API_KEY=...          # 不要写进仓库
python3 scripts/genimg.py --prompt-file p.txt --out assets/12-gin-fizz-src.jpg
```

- 端点 `https://api.minimaxi.com/v1/image_generation`，模型 `image-01`，`aspect_ratio: 3:4`
- 返回 864×1152（已 3:4），描述符里若带 `image_urls`，下载即可
- **没有水印**（第三方站点导出通常有，注意区分）

### 2.5 成本纪律

生图按次计费。批量之前：

1. **先出 1 张**给用户确认风格
2. 确认后再批量，**文件名先行对齐**（`{编号}-{名称}-src/cover`）
3. 批量脚本要能跳过已存在的文件（`if exists: skip`）

> 教训：文件名与规格表不一致，导致整批重跑一次，白付一轮钱。

### 2.6 提示词自检

- [ ] 主体只有一个
- [ ] 策略 A：`no text anywhere` 已写死
- [ ] 有明确方向的光，不是均匀棚拍光
- [ ] 有 2–3 件无关杂物
- [ ] 有至少一处不完美
- [ ] 没有 logo、品牌物、价格、人物脸
- [ ] 系列内相邻两篇的主色不撞

---

## 阶段三：批次编排与发布节奏

### 3.1 句式配比

一个批次（通常 10 篇）按固定比例分配句式，避免同质：

| 句式 | 篇数 | 用途 |
|---|---|---|
| 反常识／易错型 | 4 | 制造「我是不是做错了」 |
| 数字／参数型 | 3 | 一眼看完，收藏动机强 |
| 顺序／流程型 | 3 | 讲操作先后 |

### 3.2 发布波次

- **第一波 3 篇**：挑错误类型互不重叠的三种，且主色差异最大 —— 信息流里不撞脸
- **第二波 3 篇**：数字型 + 顺序型
- **第三波 4 篇**：其余
- **间隔 2–3 天一篇**，避免同一模板连续刷屏
- **视觉形态相近的两篇必须隔开发**（例：同为笛形杯的两篇、同为「一张清单图」的两篇）

### 3.3 A/B 方法（不改素材，只换标题）

- 同一篇不做双发。用**同句式两篇**对比：反常识型 4 篇看平均值，数字型 3 篇看平均值。
- 每篇观察满 **72 小时**再记数。
- 记录 `曝光 / 观看 / CTR / 人均观看 / 收藏 / 涨粉`，**直接抄后台数值，不换算**。

### 3.4 验收指标

目标线取**档案里的账号基线**（账号近 7 日均值）；没有基线就只记录、不判读：

| 指标 | 判读方式 |
|---|---|
| 封面点击率 | 对比账号 7 日均值；连续两批都低 → 回到选点与封面，不是改措辞 |
| 人均观看 | 对比账号 7 日均值；低于均值 → 封面过度承诺 |
| 收藏率（藏/观看） | 收藏率是「有用」的信号，优先于点赞看 |
| 涨粉 | 不设硬指标，先看主页访客是否随系列角标上升 |

判读纪律：**发布不足 72 小时不作失败判定**；单篇样本太小，一次改稿只看趋势，不做因果断言。

指标异常时的归因：

- CTR 上去了但人均观看掉了 → 封面过度承诺。下一轮把大字卖点降一档强度、第 2 页要点卡提前。
- CTR 没动但收藏率上去了 → 封面改动有效、曝光分配不够。考虑换发布时间，而不是再改标题。
- 两个都没动 → 回到选点：卖点是否真的可验证、可复现。

> 完整波次表、A/B 记录表、归因表见 `references/batch-playbook.md`。

---

## 阶段四：填稿与发布（浏览器自动化）

用**用户已登录的 Chrome** 驱动创作服务平台。脚本在 `scripts/`，全部按**题材无关**设计。

| 脚本 | 作用 |
|---|---|
| `cdp.mjs` | CDP 底座：targets / evalon / shot / open / type / typefile / upload |
| `fillnote.mjs` | 建一篇图文笔记：传图 + 填标题 + 填正文（正文按行分段） |
| `addtopic.mjs` | 插入真话题链接（打 `#词` + Enter，失败自动回滚） |
| `topics.mjs` | 走下拉候选点选话题（备选路径） |
| `listdrafts.mjs` | 列出草稿箱 |
| `editdraft.mjs` | 打开某篇草稿 |
| `deletedraft.mjs` | 删除草稿（含 Popconfirm 确认） |
| `rebuild.mjs` | 删掉重建（换首图用） |
| `verifydrafts.mjs` | 逐篇核对标题/图数/段落/话题 |
| `click.mjs` | 按无障碍名点按钮（发布栏只能这样点） |
| `setpara.mjs` | 按段落序号改正文 |

### 4.1 前置条件

1. **Chrome 带调试端口**。先探测：

   ```bash
   curl -sS http://127.0.0.1:9222/json/version
   ```

   连不上 → 让用户完全退出 Chrome 后用调试端口重启。**不要悄悄强杀**。

2. **Chrome 136+ 的坑**：默认 profile **不再允许**开调试端口，会报
   `DevTools remote debugging requires a non-default data directory`。

   解法：用独立配置目录

   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --user-data-dir="$HOME/Library/Application Support/Chrome-Automation" \
     --remote-debugging-port=9222
   ```

   新目录没有登录态。要保留登录，把默认 profile 的 `Cookies`、`Local Storage`、`Session Storage`、`Preferences`、`Local State` 复制过去（约 30MB，足够），不要整目录 3GB 复制。

3. 用户 Adsw 已登录创作平台（在自动化的那个 profile 里）。

### 4.2 单篇填稿

```bash
# 打开发布页，拿 targetId
node scripts/cdp.mjs open "https://creator.xiaohongshu.com/publish/publish?source=official"

# 一篇到底：上传图 + 标题 + 正文
node scripts/fillnote.mjs <targetId> assets/12-gin-fizz-cover.jpg \
  drafts/12-gin-fizz.body.txt "金菲士｜摇完把冰滤掉才对"

# 话题
node scripts/addtopic.mjs <targetId> 调酒 家庭调酒 金菲士 金酒 气泡酒

# 存草稿（绝不点发布）
node scripts/click.mjs <targetId> "暂存离开"
```

### 4.3 草稿箱的增删查改

```bash
node scripts/listdrafts.mjs <targetId>                      # 列全部草稿
node scripts/editdraft.mjs <targetId> "标题"                 # 打开某篇
node scripts/deletedraft.mjs <targetId> "标题"               # 删除（带确认）
node scripts/rebuild.mjs <targetId> drafts/rebuild-spec.txt  # 删掉重建
node scripts/verifydrafts.mjs <targetId> "标题1" "标题2"      # 批量核对
```

`rebuild` 的 spec 每行：`slug|标题|话题1,话题2`

### 4.4 平台交互的七个坑（都踩过）

| 现象 | 原因 | 解法 |
|---|---|---|
| `querySelectorAll` 找不到发布/草稿按钮 | 由自定义元素渲染，DOM 里查不到 | 走**无障碍树**：`Accessibility.getFullAXTree` → `DOM.getBoxModel` 拿坐标再点 |
| 草稿抽屉里"暂无草稿"，但标签写着 15 | 抽屉默认停在「视频笔记」 | 点 `.tab-item-text` 里含「图文笔记」的那个 |
| 抽屉在屏幕外，坐标 2388 但视口 1920 | 滑入动画卡在 `translateX(600px)` | 清掉 `drawer-slide-right-enter-*` 类并设 `transform: translateX(0)` |
| 删除按钮点了没反应 | 该按钮是**点击**触发 Popconfirm（不是 hover） | 点一下 → 等确认框 → 再点框里的「删除」 |
| 删除按钮在视口外 | 列表长，需要滚动 | 先 `card.scrollIntoView({block:'center'})` 再读坐标 |
| 话题变成裸 `#文字` | 直接插字符串不会转成话题 | 打 `#关键词` + **Enter**，或点下拉候选 |
| 改完正文，话题没了 | 重写段落会清掉该段的话题节点 | **先改正文，最后插话题** |

### 4.5 发布边界（硬）

- 用户明确说「发布」→ 才点发布按钮
- 只说「填好」「存草稿」→ 点 **暂存离开**
- **绝不自行点发布**。发布会即时生效并进审核，撤不回。

## 参考资料

| 文件 | 内容 |
|---|---|
| `references/account-profile.md` | **账号档案规范**：字段定义、最小档案、空白模板、填写指引 |
| `references/title-formulas.md` | 标题公式、句式配比、禁用清单、跨题材改写范例 |
| `references/cover-spec.md` | **两种首图策略**、物/人判定、尺寸命名、发布前自检 |
| `references/publishing-playbook.md` | CDP 填稿手册、草稿增删、平台交互故障排查 |
| `references/batch-playbook.md` | 批次编排、发布波次、A/B 方法、验收与归因 |
| `references/compliance.md` | 固定声明、通用与领域红线、单位写法精度 |
| `examples/cocktail-series.md` | 案例：调酒号（主体=物，可全自动） |
| `examples/topic-profiles.md` | 可复制赛道档案：家常菜 / 效率工具 / 旅行收纳 / **穿搭（主体=人）** |
| `drafts/body.template.txt` | 正文骨架模板 |

---

## 常见坑

| 坑 | 表现 | 解决 |
|---|---|---|
| 主体判断错 | 用 AI 生成"上身效果"，读者一眼识破 | 人必须实拍；只有"物"可以生成。见 1.3 |
| 首图贴字 | 图画得很好，但一眼还是 AI | 图上 0 字，卖点放标题；要大字就用排版工具 |
| 档案缺失 | 同一个号连续几篇视觉语言飘了 | 建一份档案，把固定声明与视觉预设写死 |
| 标题被削 | 发布后变成「分类｜名称」这类零信息开头 | 填稿后核对；标题前 8 字必须带信息量 |
| 卖点兑现不了 | 正文没接住标题承诺，收藏率低 | 回到选题四问，换一个可核对的具体点 |
| 生图整批重跑 | 花两遍钱 | 文件名先行对齐；批量脚本跳过已存在文件；先出 1 张确认 |
| Chrome 连不上 | `curl 9222` 连接被拒 | 见 4.1；Chrome 136+ 需 `--user-data-dir` |
| 草稿抽屉空白 | 标签显示 15 条但列表「暂无草稿」 | 切到「图文笔记」标签 |
| 删除没反应 | 点了没弹确认 | 删除是**点击**触发 Popconfirm，不是 hover |
| 话题没生效 | 正文里是裸 `#标签` | 打 `#词`+Enter，或点下拉候选 |
| 话题被清空 | 改完正文发现话题没了 | 先改正文，最后插话题 |
| 发布栏点不到 | DOM 里没有这个按钮 | 走无障碍树取坐标点 |

---

## 一句话总结

这套流程能跨赛道用，靠的是两个抽象：**账号档案**装题材差异，**可验证具体点**保证内容有干货。
换赛道只改档案，不改流程 —— 唯一需要重新想的是「主体是物还是人」，它决定图能不能生成。