# 填稿与发布手册（CDP 驱动）

用**用户已登录的 Chrome** 驱动小红书创作服务平台。脚本在 `scripts/`：

| 脚本 | 用途 |
|---|---|
| `cdp.mjs` | CDP 驱动：查目标页、打开、求值、截图、上传图片、打字、按键 |
| `topics.mjs` | 话题标签批量插入（走编辑器下拉候选） |

两个脚本都直连 Chrome 的 DevTools 端口，**不需要 Playwright 或 Puppeteer**。

---

## 前置条件

### 1. Chrome 必须带远程调试端口启动

```bash
curl -sS http://127.0.0.1:9222/json/version
```

连不上（`Failed to connect`）说明当前 Chrome 不是调试模式启动。让用户**完全退出 Chrome**（⌘Q，不是关窗口），然后：

```bash
# macOS
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222

# Linux
google-chrome --remote-debugging-port=9222
```

登录态会保留。

> 脚本**不会**去读浏览器配置文件目录来猜端口 —— 端口只从环境变量取：
>
> | 变量 | 作用 | 优先级 |
> |---|---|---|
> | `CDP_WS_URL` | 完整的浏览器 WebSocket URL | 最高 |
> | `CDP_PORT` | TCP 端口，默认 `9222` | 次之 |
>
> 端口号必须与 Chrome 启动时的 `--remote-debugging-port` 一致。若 Chrome 用了别的端口，启动脚本时带上：
>
> ```bash
> CDP_PORT=9333 node scripts/cdp.mjs targets
> ```

**不要在用户不知情的情况下强杀浏览器** —— 会有未保存的工作。

### 2. 已登录小红书创作服务平台

用户需在同一个 Chrome profile 里登录 `creator.xiaohongshu.com`。

### 3. 配图已出好

按封面规范出好的图，路径已知。文件命名建议 `cover-NN-slug-01.png` / `-02.png` / `-03.png`。

---

## 标准填稿序列

```bash
# 1) 列出所有页面目标，找到创作平台
node scripts/cdp.mjs targets

# 2) 打开发布页，拿到 targetId
node scripts/cdp.mjs open "https://creator.xiaohongshu.com/publish/publish"
#    → 输出形如 3A7F... 的 targetId

# 3) 先探一下标题框和正文编辑器的选择器（结构会随平台改版变化）
node scripts/cdp.mjs evalon <targetId> "JSON.stringify([...document.querySelectorAll('input,textarea,[contenteditable=true]')].map(e=>({tag:e.tagName,ph:e.placeholder||'',cls:e.className||''})))"

# 4) 填标题（React 受控输入框，用 setvalue 而不是 type）
node scripts/cdp.mjs setvalue "input[placeholder*='标题']" "番茄炒蛋｜先炒蛋才是真的嫩"

# 5) 填正文（tiptap 富文本，按行插入，空行跳过）
node scripts/cdp.mjs typefile "div.tiptap.ProseMirror" drafts/NN-slug.body.txt

# 6) 上传配图
node scripts/cdp.mjs upload "input[type=file]" /abs/path/cover-NN-01.png
node scripts/cdp.mjs upload "input[type=file]" /abs/path/cover-NN-02.png
node scripts/cdp.mjs upload "input[type=file]" /abs/path/cover-NN-03.png

# 7) 插入话题标签（从账号档案的 topics 池里挑）
node scripts/topics.mjs <targetId> "快手菜" "家常菜" "10分钟晚餐"

# 8) 截图自检
node scripts/cdp.mjs shot /abs/path/preview-NN-slug.png
```

用 `read_image` 看截图。

---

## cdp.mjs 命令速查

| 命令 | 说明 |
|---|---|
| `targets` | 列出所有 target（类型 / id / 标题 / URL） |
| `open <url>` | 新开标签页，输出 targetId |
| `close <targetId>` | 关闭标签页 |
| `eval "<js>"` | 在匹配 `creator.xiaohongshu.com` 的页面里求值 |
| `evalon <targetId> "<js>"` | 在指定 target 里求值 |
| `shot <out.png>` | 截创作平台页面全屏 |
| `upload <selector> <file...>` | 给 `input[type=file]` 设置一个或多个文件 |
| `files` | 列出所有 `input[type=file]`（定位上传控件） |
| `setvalue <selector> <text>` | 设置 React 受控输入值并触发 `input` |
| `type <selector> <text>` | 聚焦并输入文本（单行） |
| `typefile <selector> <path>` | 按行输入文本文件（`\n` = 回车） |
| `focusend <selector>` | 光标移到元素末尾 |
| `insert <selector> <text>` | 在元素末尾插入文本 |
| `key <Enter\|Tab\|Backspace>` | 按键 |
| `wait <ms>` | 等待 |

---

## 选择器速查

| 目标 | 选择器 | 备注 |
|---|---|---|
| 标题输入框 | `input[placeholder*="标题"]` | 平台改版后可能变化，用 `eval` 先探 |
| 正文编辑器 | `div.tiptap.ProseMirror` | 富文本，`contenteditable=true` |
| 图片上传 | `input[type=file]` | 可能不止一个，先打印数量 |
| 话题候选 | `.recommend-topic-wrapper .tag` | 需过滤 `offsetParent !== null` |
| 「更多」按钮 | 候选里文本为 `更多` 的那个 | 翻页找标签时用 |

**选择器会随平台改版失效。** 每次批量操作前先用 `eval` 探一次，别照抄。

---

## 话题标签

话题必须走编辑器下拉候选才会变成可点击的蓝色标签。**直接敲 `#快手菜` 只是普通文字。**

`topics.mjs` 的行为：

1. 把光标移到编辑器末尾，输入 `#`
2. 读下拉候选（`.recommend-topic-wrapper .tag`），过滤掉不可见的
3. 没找到就点「更多」展开，最多翻 4 次
4. 点中目标标签
5. **清理编辑器里残留的裸 `#` 字符**（选中文本后按退格）
6. 输出 `ADDED #标签 -> 当前段落文本` 供核对

候选里没有的标签会输出：

```
SKIP (not offered): #某个标签 | visible: ...
```

**不要伪造标签。** 换一个更热门的同义词，或跳过。强行写入的标签不会产生话题权重。

---

## 截图自检清单

填完必须截图核对：

- [ ] 标题**没有**被截断成零信息开头
- [ ] 正文结构完整（要点清单 / 做法 / 易错提示 / 结尾提问 / 固定声明）
- [ ] 首图是**封面页**（主体 + 大字卖点），不是要点卡
- [ ] 图序正确，封面在第 1 位
- [ ] 话题标签是蓝色可点击样式，不是裸 `#文字`
- [ ] 固定声明在正文末尾

---

## 发布边界

| 用户说 | 动作 |
|---|---|
| 「发布」「发出去」 | 点发布按钮 |
| 「填好」「存草稿」「我看看」 | 点 **暂存离开**，不点发布 |
| 没说 | 停在填好状态，问用户 |

**绝不自行点击发布。** 发布会即时生效并进入审核，无法撤回。

---

## 草稿管理（增删查改）

平台没有「换一张图」的接口，换图只能**删掉重建**。脚本封装好了：

```bash
node scripts/listdrafts.mjs   <targetId>                  # 列出全部草稿
node scripts/editdraft.mjs    <targetId> "标题"            # 打开某篇
node scripts/deletedraft.mjs  <targetId> "标题"            # 删除（自动确认）
node scripts/rebuild.mjs      <targetId> spec.txt --root . # 删掉重建
node scripts/verifydrafts.mjs <targetId> "标题1" "标题2"    # 逐篇核对
```

`rebuild` 的 spec 每行：`slug|标题|话题1,话题2`，对应
`assets/<slug>-cover.jpg` 与 `drafts/<slug>.body.txt`。

**重建前必须确认删除成功**，否则会得到「标题拼接两遍 + 正文翻倍 + 两张图」的脏草稿。
`rebuild.mjs` 内置了保存前的 sanity check（标题必须精确相等、图必须 1 张），不通过就不保存。

---

## 故障排查

| 现象 | 原因 | 解决 |
|---|---|---|
| `curl 9222` 连接被拒 | Chrome 非调试模式启动 | 退出 Chrome，带 `--remote-debugging-port=9222` 重启 |
| 报错 `requires a non-default data directory` | Chrome 136+ 禁止默认 profile 开调试 | 加 `--user-data-dir=...` 用独立 profile |
| 独立 profile 里没登录 | 新 profile 没有 cookie | 复制默认 profile 的 `Cookies` / `Local Storage` / `Session Storage` / `Preferences` / `Local State`（约 30MB） |
| `no page matching creator.xiaohongshu.com` | 平台页没开 | 先 `open` 发布页 |
| 发布 / 暂存按钮在 DOM 里找不到 | 自定义元素渲染 | 走无障碍树：`scripts/click.mjs` |
| 草稿抽屉「暂无草稿」但标签写着 15 | 默认停在视频笔记页签 | 切到「图文笔记」（`lib.mjs` 已处理） |
| 抽屉元素在屏幕外（坐标 > 视口） | 滑入动画卡在 `translateX(600px)` | 清 `drawer-slide-right-enter-*` 并设 `transform: translateX(0)` |
| 删除按钮点了没反应 | 需要**点击**触发 Popconfirm | 点一下 → 等确认框 → 再点「删除」 |
| 删除按钮点不到 | 卡片在视口外 | 先 `scrollIntoView({block:'center'})` |
| 话题变裸 `#文字` | 直接插字符串不转换 | 打 `#词` + Enter，或点下拉候选 |
| 改完正文话题没了 | 重写段落会清掉该段的话题节点 | **先改正文，最后插话题** |
| `selector not found` | 平台改版 | `eval` 打印 `input` / `[contenteditable]` 重新定位 |
| 正文打不进 | 编辑器不是 tiptap | `eval` 打印 `contenteditable` 元素列表 |
| 图片上传无效 | 有多个 `input[type=file]` | 分别在 `describeNode` 里看 `accept`，挑图片那个 |
| 打字卡住 | 焦点丢失 | 先 focus 再 `type` / `typefile` |

---

## 一句话

平台是 SPA + 自定义元素，**能查到的不一定能点，能点的查不到**。
DOM 查不到就换无障碍树，鼠标点不到就换 DOM `click()`，两者都不行就看坐标是否在视口内。
