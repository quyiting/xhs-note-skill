# 其他赛道档案（可直接复制改名）

三份现成档案，覆盖三种典型赛道。复制到 `profile/{账号名}.yaml`，改账号名、题材、固定声明即可用。

**注意**：档案里的 KPI 基线是**占位符**。填自己账号的近 7 日后台均值之前，阶段三只记录不判读。

---

## A. 快手菜（家常菜号）

```yaml
account: 十分钟快手菜
niche: 家常菜 / 快手菜
audience: 下班晚、只有一口锅的上班族，想少洗两次锅
tone: 麻利、给结论，不啰嗦

series:
  name: 十分钟快手菜
  total: 30

visual:
  preset: handbook-illustration
  paper: 米白纸
  ink: 深灰蓝
  accent: 番茄红
  render: gouache and watercolor with fine ink contours, warm home-kitchen props

cover:
  headline_max_chars: 12
  headline_max_lines: 2
  subject_ratio: 0.55-0.65
  badge: "{series.name} · {n}/{series.total}"

body:
  list_title: "🥘 用料（2 人份）"
  howto_title: 做法
  pitfall_label: "记住这一点："
  steps: 3

fixed:
  image_footer: "分量按 2 人份 · 家用不粘锅 · AI插画"
  body_footer: "分量与时间按家用不粘锅、2 人份整理；配图为 AI 生成插画，非实拍。"

banned:
  - 减肥、降血糖、抗癌等功效宣称
  - 「最好吃」「零失败」「一次就成」
  - 未标注的常见致敏原（坚果、海鲜、蛋、奶、麸质）
  - 「隔夜也能吃」「不用洗」这类安全误导
  - 价格与外部链接

sources:
  - 家用不粘锅火力与容量实测
  - 常见家常菜配料表

units:
  - 时间写「大火 90 秒」这类可复现表述，不写模糊的「适量」
  - 勺/克数与单位之间留空格

topics:
  - 快手菜
  - 家常菜
  - 十分钟晚餐
  - 上班族晚餐

kpi:
  cover_ctr:
  avg_watch_seconds:
  save_rate:
  followers_7d:
```

**示例标题**：`番茄炒蛋｜先炒蛋才是真的嫩`　**首图大字**：`先炒蛋`

---

## B. 效率工具（职场方法论号）

```yaml
account: 效率工具箱
niche: 职场效率 / 软件技巧
audience: 每天和 Excel、文档打交道、被重复劳动困住的白领
tone: 直给命令句，讲清「怎么做」和「原来错在哪」

series:
  name: 效率工具箱
  total: 50

visual:
  preset: flat-geometric
  paper: 纯白
  ink: 近黑
  accent: 电光蓝
  render: flat geometric shapes, no texture, crisp vector look, generous negative space

cover:
  headline_max_chars: 12
  headline_max_lines: 2
  subject_ratio: 0.55-0.65
  badge: "{series.name} · {n}/{series.total}"

body:
  list_title: "⌨️ 关键操作"
  howto_title: "三步设置"
  pitfall_label: "最容易错的一步："
  steps: 3

fixed:
  image_footer: "界面为示意图 · 版本以官方为准 · AI插画"
  body_footer: "路径与快捷键以当前版本界面为准，示意图为 AI 生成插画，非实拍。"

banned:
  - 「效率提升 10 倍」这类未验证数字
  - 绝对化用语（最好用、最简单、永久免费）
  - 未实测的跑分 / 性能结论
  - 贬低竞品（智商税、垃圾软件）
  - 付费引导与返利链接

sources:
  - 官方文档与版本说明
  - 本机实测截图

units:
  - 快捷键写法统一写成「Ctrl + Shift + E」
  - 版本号写具体版本，不写「最新版」

topics:
  - Excel技巧
  - 效率工具
  - 职场干货
  - 办公软件

kpi:
  cover_ctr:
  avg_watch_seconds:
  save_rate:
  followers_7d:
```

**示例标题**：`Excel｜别再一个格子一个格子点`　**首图大字**：`别一个个点`

---

## C. 旅行收纳（行李清单号）

```yaml
account: 出门带什么
niche: 旅行 / 出行收纳
audience: 一年出行三五次、每次都在机场手忙脚乱的人
tone: 清单式，讲取舍

series:
  name: 出门带什么
  total: 24

visual:
  preset: hand-drawn
  paper: 米色纸
  ink: 深灰蓝
  accent: 亮橙
  render: hand-drawn marker and colored pencil lines, casual travel sketchbook feel

cover:
  headline_max_chars: 12
  headline_max_lines: 2
  subject_ratio: 0.55-0.65
  badge: "{series.name} · {n}/{series.total}"

body:
  list_title: "🎒 装箱清单"
  howto_title: "怎么装"
  pitfall_label: "别忘带："
  steps: 3

fixed:
  image_footer: "清单按 5 天行程整理 · AI插画"
  body_footer: "清单按 5 天行程、春秋温差整理；配图为 AI 生成插画，非实拍。"

banned:
  - 航司 / 酒店的贬低与投诉点名
  - 价格与带货链接
  - 绝对化的「必须带」「千万别带」
  - 未经证实的安检 / 行李限制规则

sources:
  - 航司公开行李规则
  - 实际出行记录

units:
  - 数量写「两件」「500 ml 以内」这类可核对表述
  - 重量写近似值并注明「约」

topics:
  - 旅行收纳
  - 行李清单
  - 出差必备
  - 打包技巧

kpi:
  cover_ctr:
  avg_watch_seconds:
  save_rate:
  followers_7d:
```

**示例标题**：`出差箱｜大箱子反而塞不下`　**首图大字**：`箱子大 ≠ 装得多`

---

## D. 穿搭（真人出镜号 —— 主体是「人」）

**这份档案演示的是 `subject: person` 的写法。** 它和前三份最大的不同：首图**不能** AI 生成，必须真人实拍。

```yaml
account: 155 穿什么
niche: 穿搭 / 小个子通勤
audience: 155–160 的小个子上班族，衣柜里有衣服但不会配
tone: 平视、给具体数字，不喊「绝美」「封神」

series:
  name: 小个子衣柜
  total: 30

visual:
  image_mode: photo          # 纯照片，图上不加字
  subject: mixed             # 上身图=人（实拍），单品平铺=物（可生成）
  body_coords:               # 人设坐标：不写死，建议无法复用
    height: 156cm
    weight: 46kg
    size_top: S
    size_bottom: 25/26
    shape: 梨形

body:
  list_title: "📏 关键数据"
  howto_title: 怎么穿
  pitfall_label: "记住这一点："
  steps: 3

fixed:
  image_footer: ""
  body_footer: "身形数据为本人实测；单品为自购，未标注即非合作。理性消费。"

banned:
  - 显瘦 10 斤、显高 10cm 这类不可核对的数字
  - 最、第一、唯一、绝对（广告法）
  - 效果断言（穿上就是仙女）
  - 未标注的品牌合作
  - 真实价格（易过期，且易被判为导流）

sources:
  - 自己实测（身高/体重/尺码/裤长）
  - 品牌官方尺码表（引用时注明页面日期）

units:
  - 长度一律写 cm，不写「一点点」「稍微」
  - 尺码写 S/M/L 与具体数字并存

topics:
  - 小个子穿搭
  - 通勤穿搭
  - 155穿搭
  - 梨形身材
  - 显高穿搭
```

### 这份档案对应的「可验证具体点」

穿搭没有 IBA 那种官方数字，得自己造锚点：

| 类型 | 例 | 怎么核对 |
|---|---|---|
| 参数型 | `155 穿西装裤，96cm 是及格线` | 卷尺量 |
| 对照型 | `同一条黑裤，配尖头 vs 圆头` | 拍两张对比 |
| 材质型 | `亚麻皱了才对，别熨` | 材质事实 |
| 比例型 | `高腰线落在身高 × 0.6 处` | 换算后上身验证 |

**不能当卖点的**：`显瘦 10 斤`、`温柔又高级`、`穿上就是仙女` —— 无法核对，且踩广告法。

### 图片怎么分工

| 页 | 谁做 | 说明 |
|---|---|---|
| 首图 | **用户实拍** | 上身效果，AI 生成会毁掉可信度 |
| 单品/细节图 | 可 AI 生成 | 主体是「物」，平的、无脸 |
| 第 2 页数据卡 | 排版工具 | 身高体重尺码、裤长 |
| 第 3 页搭配卡 | 排版工具 | 上装/下装/鞋/配饰 |

### 示例标题

- `小个子西装裤｜96cm 是及格线`
- `同一条黑裤｜尖头 vs 圆头差在哪`
- `梨形身材｜A 字裙别买过膝`

---

## 建新档案时的三步

1. **抄一份最接近的**，改账号名、题材、`audience`、固定声明
2. **视觉预设先别动** —— 沿用预设、只换三色与主体，用两批数据再决定要不要换预设
3. **固定声明照抄第二份参考**（食品 / 软件 / 清单三类都有现成写法），不要临时编
