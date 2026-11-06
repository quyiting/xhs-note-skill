# 封面模板 v2 · 完整规范

## 设计前提

小红书信息流里首图只有约 150px 宽。首图的唯一目的不是好看，是**让人在缩略图里读懂**。

账号已有插画风格（暖奶油纸 + 深橄榄字 + 酒红数字 + 细墨线 + 留白）经数据验证是有效的 —— 图鉴那篇 CTR 9.1%、人均观看 46 秒，是全账号最好的一条。**不要推翻风格**，问题只在「信息密度放错了页」。

---

## 第 1 页（封面）

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

### 硬性规范

| 项 | 规格 |
|---|---|
| 尺寸 | 3:4（1242×1656 或 1080×1440），全出血 |
| 安全区 | 四周留 ≥ 6%，文字不贴边 |
| 大字字高 | ≥ 画面高度的 8% |
| 大字字数 | ≤ 12 字，最多 2 行，每行 ≤ 6 字 |
| 文字层级 | 大字 1 句 + 酒名 1 行 + 角标 1 行，**≤ 3 层** |
| 主体占幅 | 55%–65% 画面 |
| 杯数 | **只画一杯** |

### 首图禁止出现

材料清单、步骤编号、表格线、多杯并排、价格、酒精度、品牌 logo、人物。

### 自检线

> 缩到 150px 宽仍能认出 4 个字 —— 过不了就删字。

不要靠「用户会点开看」来豁免这条。

---

## 第 2 页（配方卡）

沿用现有插画，只放大字号：

- 只放「单杯配方」三项左右，字号比现稿放大 **1.5 倍**，一行一项
- 顶部小字：`单杯配方 · {酒名}`
- 底部固定一行：`配方参考 IBA · 单杯份量 · AI插画 · 理性饮酒`
- 作用是**留住人**（承接人均观看时长），不是吸引点击

## 第 3 页（步骤卡）

- 3 条编号步骤，每条 ≤ 18 字
- 加一条「记住这一点」的易错提示
- 字号不小于材料页

## 第 4 页（可选，数字卡）

- 只在大字卖点有数字时使用（60:10、75+75）
- **一批 10 篇里建议只用 3 次**，避免每篇都四图

---

## 生图提示词模板

### 第 1 页（封面）

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

### 第 2、3 页的改法

沿用原 `prompt-01.txt` 结构，改三处：

1. 删除标题区大字（改由第 1 页承担）
2. 材料字号放大到原来的 **1.5 倍**，一行一项，保留单位与空格
3. 顶部小字改为 `单杯配方 · {酒名}`

第 3 页正文区换成 `做法` 三条 + 一行 `记住这一点：{易错提示}`。

> 每张图的固定文案（`配方参考 IBA · 单杯份量 · AI插画 · 理性饮酒`）**不要改**，避免合规口径漂移。

---

## 配色与视觉节奏（批次级）

同批封面之间要有视觉差异，避免信息流里撞脸：

| 篇 | 主色 | 定位 |
|---|---|---|
| 11 自由古巴 | 深棕 + 青柠绿 | 全组唯一绿色跳色 |
| 12 金菲士 | 冷白 + 淡金 | 留白最多，衬「干净」 |
| 13 干马天尼 | 冷调低饱和 | 与前后形成节奏差 |
| 14 曼哈顿 | 深宝石红 | 颜色最深，重口视觉锚点 |
| 15 古典 | 琥珀金 | 主色 |
| 16 莫斯科骡子 | 铜金 + 青柠绿 | 唯一金属杯型 |
| 17 龙舌兰日出 | 橙黄 + 红石榴红 | 唯一有明确渐变层 |
| 18 贝里尼 | 粉白 | 全组最亮 |
| 19 含羞草 | 明亮橙黄 | 与 18 同为笛形杯但颜色分明 |
| 20 边车 | 柑橘黄 | 糖边版为主色调 |

**同杯型不连续发**：18 贝里尼与 19 含羞草都是笛形杯，必须隔开。
