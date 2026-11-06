# 小红书笔记生产流水线 · 家庭小酒馆

一套可复用的 [DSH Skill](https://github.com/quyiting/xhs-note-skill)：从**一句卖点**产出**标题 + 封面方案 + 正文 + 配图提示词**，再通过 CDP 驱动已登录的 Chrome，把内容填进小红书创作服务平台。

面向「家庭小酒馆」——一个 20 篇系列的家庭调酒图文账号。

## 覆盖的环节

| 阶段 | 内容 |
|---|---|
| 内容规范 | 标题公式（4 种句式 + 配比）、封面三段式模板、正文结构、单篇交付物清单 |
| 生图 | 第 1/2/3 页提示词模板、提示词自检、批次级配色节奏 |
| 批次编排 | 句式配比、三波发布节奏、A/B 方法、验收指标与异常归因 |
| 填稿发布 | CDP 驱动 Chrome、选择器速查、话题标签插入、截图自检、发布边界 |
| 合规 | 固定文案、禁用清单、单位写法红线、配图禁止元素 |

## 安装

把 skill 目录放进 DSH 的技能目录：

```bash
cp -R xhs-note-skill ~/.agents/skills/
```

目录结构：

```
xhs-note-skill/
├── SKILL.md                      # 主流程（阶段零～阶段四）
├── agents/openai.yaml            # 界面元信息
├── references/
│   ├── title-formulas.md         # 标题公式与 20 条改写范例
│   ├── cover-spec.md             # 封面模板 v2 + 生图提示词
│   ├── batch-playbook.md         # 批次编排、发布节奏、指标复盘
│   ├── publishing-playbook.md    # CDP 填稿手册与故障排查
│   └── compliance.md             # 合规红线与固定文案
└── scripts/
    ├── cdp.mjs                   # CDP 驱动（求值/截图/上传/打字）
    └── topics.mjs                # 话题标签批量插入
```

## 快速上手

```bash
# 1) 确认 Chrome 开了远程调试端口
curl -sS http://127.0.0.1:9222/json/version

# 2) 找到创作平台页面
node scripts/cdp.mjs targets

# 3) 打开发布页，拿 targetId
node scripts/cdp.mjs open "https://creator.xiaohongshu.com/publish/publish"

# 4) 填标题（React 受控输入，需走 setvalue）
node scripts/cdp.mjs setvalue "input[placeholder*='标题']" "自由古巴｜只倒朗姆和可乐就错了"

# 5) 填正文（tiptap，按行插入）
node scripts/cdp.mjs typefile "div.tiptap.ProseMirror" drafts/11-cuba-libre.body.txt

# 6) 上传配图（可一次传多张）
node scripts/cdp.mjs upload "input[type=file]" cover-01.png cover-02.png cover-03.png

# 7) 插入话题标签（走下拉候选，才生效）
node scripts/topics.mjs <targetId> "家庭小酒馆" "调酒" "鸡尾酒"

# 8) 截图自检
node scripts/cdp.mjs shot preview-11.png
```

完整命令表与选择器见 `references/publishing-playbook.md`。

## 三条不可越过的线

1. **不自行点发布。** 用户明确说「发布」才发布；否则停在「暂存离开」。
2. **不伪造话题标签。** 候选里没有就换一个同义词或跳过。
3. **不改固定合规文案。** `配方参考 IBA · 单杯份量 · AI插画 · 理性饮酒` 与结尾声明逐字保留。

## License

MIT
