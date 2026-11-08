# 账号档案（Account Profile）

**账号档案是本 skill 唯一的题材相关输入。** 方法论（标题公式、首图策略、批次编排、合规红线）与档案无关；凡是「这个号长什么样、这个号不能说什么、这个号的数据基线是多少」，全部写进档案。

档案写成 YAML 或 Markdown 表都行，放 `profile/{账号名}.md`（或用户指定的位置）。一个号一份档案。

---

## 字段定义

| 字段 | 含义 | 必填 | 备注 |
|---|---|---|---|
| `account` | 账号名 | ✔ | 显示用，也用于文件名 |
| `niche` | 题材／赛道 | ✔ | 如「家庭调酒」「10 分钟快手菜」「职场效率工具」 |
| `audience` | 目标读者（一个人群 + 一个场景） | ✔ | 决定选题难度与语气 |
| `tone` | 语气 | | 默认：克制的朋友口吻，不喊口号 |
| `series.name` | 系列名 | | 不做系列就留空 → 封面不画角标 |
| `series.total` | 系列总篇数 | | 留空 → 角标只写 `系列名 · NN` |
| `visual.image_mode` | `photo`（纯照片，默认）或 `infographic`（信息图） | ✔ | 见 cover-spec.md 的两种策略 |
| `visual.subject` | `object`（物）／`person`（人）／`mixed`（混合） | ✔ | **决定能不能 AI 生成**；person 必须实拍 |
| `visual.preset` | 视觉预设名（见 cover-spec.md） | | 仅 `infographic` 模式需要：纸色／墨色／点缀色／画法 |
| `visual.body_coords` | 真人出镜时的人设坐标（身高／体重／常穿尺码／体型） | | **`subject: person` 时必填**，否则建议不可复用 |
| `visual.paper` / `ink` / `accent` | 底材色 / 主字色 / 点缀色 | | 从预设继承，可按批次微调 |
| `cover.headline_max_chars` | 首图大字上限 | | 默认 12 字 |
| `cover.headline_max_lines` | 首图大字行数 | | 默认 2 行，每行 ≤ 6 字 |
| `cover.subject_ratio` | 主体占幅 | | 默认 0.55–0.65 |
| `cover.badge` | 角标格式 | | 默认 `{series.name} · {n}/{total}` |
| `body.list_title` | 要点清单段的标题 | ✔ | 如「🍸 单杯配方」「📋 采购清单」「3 个关键参数」 |
| `body.howto_title` | 做法段的标题 | ✔ | 如「做法」「步骤」「怎么开始」 |
| `body.pitfall_label` | 易错提示的标签 | | 默认「记住这一点：」 |
| `body.steps` | 做法条数 | | 默认 3 条，每条 ≤ 18 字 |
| `fixed.image_footer` | 每张配图底部的固定一行 | ✔ | 抄进图，不改写 |
| `fixed.body_footer` | 每篇正文结尾的固定声明 | ✔ | 抄进正文，不改写 |
| `banned` | 禁用表述清单 | ✔ | 通用红线 + 领域红线 |
| `sources` | 可引用的事实来源 | ✔ | 选题与「可验证具体点」的依据 |
| `units` | 数值/单位的写法约定 | | 如「`dash` 不改写成毫升」 |
| `topics` | 话题标签池 | | 阶段四从中挑，走候选流程 |
| `kpi.cover_ctr` | 封面点击率基线（账号近 7 日均值） | | 无基线就留空 |
| `kpi.avg_watch_seconds` | 人均观看基线（秒） | | 无基线就留空 |
| `kpi.save_rate` | 收藏率基线（藏/观看） | | 无基线就留空 |
| `kpi.followers_7d` | 近 7 日涨粉 | | 参考用，不设硬指标 |

---

## 最小档案（临时写一篇用）

只有 6 个字段就能开工，其余缺省：

```yaml
account: 我的小红书
niche: "{题材}"
audience: "{人群 + 场景}"
visual.image_mode: photo        # photo | infographic
visual.subject: object         # object | person | mixed
body.list_title: "{要点清单标题}"
fixed.image_footer: "{图注固定行}"
fixed.body_footer: "{正文固定声明}"
```

> 最小档案**不能替代**完整档案：连写三篇以上就应该建一份完整档案，否则视觉语言与固定声明会飘。

---

## 空白模板（复制即用）

```yaml
# profile/{账号名}.yaml
account:
niche:
audience:            # 人群 + 场景
tone:                # 默认「克制的朋友口吻」
series:
  name:              # 不做系列留空
  total:             # 留空则角标写 {name} · {n}
visual:
  preset:            # handbook-illustration | flat-geometric | hand-drawn | photo-real | paper-collage
  paper:             # 底材色
  ink:               # 主字色
  accent:            # 点缀色（用于数字、强调）
  render:            # 画法描述，喂给生图提示词
cover:
  headline_max_chars: 12
  headline_max_lines: 2
  subject_ratio: 0.55-0.65
  badge: "{series.name} · {n}/{series.total}"
body:
  list_title:
  howto_title:
  pitfall_label: "记住这一点："
  steps: 3
fixed:
  image_footer:       # 每张图底部一行
  body_footer:        # 每篇正文末尾一句
banned:
  - {禁用表述}
sources:
  - {可引用的权威来源}
units:
  - {数值/单位写法约定}
topics:
  - {标签}
kpi:
  cover_ctr:
  avg_watch_seconds:
  save_rate:
  followers_7d:
```

---

## 填写指引

### 视觉预设怎么选

见 `references/cover-spec.md` 的「视觉预设库」。默认用 `handbook-illustration`（图鉴插画风）—— 它在调酒号上被数据验证过（图鉴那篇 CTR 9.1%、人均观看 46 秒）。换赛道时通常**沿用预设、只换主色与主体**，不要推翻画法。

### 固定声明怎么写

固定声明的作用是**避免每篇重新措辞导致口径漂移**。写法要包含三件事里的至少两件：

- 来源：数据／配方／做法来自哪里
- 身份：图是 AI 生成还是实拍、是不是广告
- 免责：适用的边界（如「理性饮酒」「以实物为准」「个体差异较大」）

例（调酒号）：

```
图注：配方参考 IBA · 单杯份量 · AI插画 · 理性饮酒
正文：配方比例与做法据 IBA 官网整理；配图为 AI 生成插画，非实拍。理性饮酒。
```

例（快手菜号）：

```
图注：分量按 2 人份 · AI插画 · 家用不粘锅
正文：分量与时间按家用不粘锅、2 人份整理；配图为 AI 生成插画，非实拍。
```

### 禁用清单怎么写

两段拼起来：

1. **通用红线**（见 `references/compliance.md`）：绝对化用语、功效宣称、未验证结论、价格导流、隐私信息、平台敏感词
2. **领域红线**：酒类（ABV、口感断言、诱导饮酒）、食品（绝对化功效、过敏提示缺失）、医疗健康（诊断治疗宣称）、金融（收益保证）、母婴（婴幼儿相关绝对化）、美妆（功效承诺、刷单）

### KPI 基线怎么填

填账号近 7 日后台均值，**直接抄，不换算**。没有历史数据的号留空，阶段三只记录不判读；积累两批后再回填。

---

## 档案 vs 临时决定

| 属于档案（不要每篇改） | 属于单篇决定（每篇可变） |
|---|---|
| 视觉预设、纸色／墨色／点缀色体系 | 本篇主色（在预设色系内选） |
| 固定声明、禁用清单 | 本篇标题句式与备选 |
| 正文骨架标签 | 本篇要点条目、步骤内容、易错点 |
| 角标格式 | 本篇编号、对象名、副标题 |
| KPI 基线 | 本篇发布时间、波次 |

> 一个批次里**只允许**主色与标题句式变化。同一批次出现两套视觉语言，通常是档案缺失。
