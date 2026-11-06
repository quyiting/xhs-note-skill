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
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222
```

登录态会保留。

> 端口号由 Chrome 自己写进 `~/Library/Application Support/Google/Chrome/DevToolsActivePort`。
> `cdp.mjs` 读这个文件拿到真实的端口和 WebSocket 路径，所以即便端口不是 9222 也能连上。

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

# 4) 填标题
node scripts/cdp.mjs evalon <targetId> "(()=>{const e=document.querySelector('input[placeholder*=\"标题\"]');if(!e)return 'NOT_FOUND';const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(e,'自由古巴｜只倒朗姆和可乐就错了');e.dispatchEvent(new Event('input',{bubbles:true}));return 'OK';})()"

# 5) 填正文（tiptap 富文本，按行插入，空行跳过）
node scripts/cdp.mjs typefile <targetId> "div.tiptap.ProseMirror" drafts/11-cuba-libre.body.txt

# 6) 上传配图
node scripts/cdp.mjs upload "input[type=file]" /abs/path/cover-11-01.png
node scripts/cdp.mjs upload "input[type=file]" /abs/path/cover-11-02.png
node scripts/cdp.mjs upload "input[type=file]" /abs/path/cover-11-03.png

# 7) 插入话题标签
node scripts/topics.mjs <targetId> "家庭小酒馆" "调酒" "鸡尾酒" "自制冷饮"

# 8) 截图自检
node scripts/cdp.mjs shot /abs/path/preview-11-cuba-libre.png
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
| `upload <selector> <file>` | 给 `input[type=file]` 设置文件 |
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

话题必须走编辑器下拉候选才会变成可点击的蓝色标签。**直接敲 `#家庭小酒馆` 只是普通文字。**

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

- [ ] 标题**没有**被截断成「调酒｜酒名」
- [ ] 正文三段结构完整（配方 / 做法 / 记住这一点）
- [ ] 首图是**封面页**（成品杯 + 大字卖点），不是配方卡
- [ ] 图序正确，封面在第 1 位
- [ ] 话题标签是蓝色可点击样式，不是裸 `#文字`
- [ ] 合规声明在正文末尾

---

## 发布边界

| 用户说 | 动作 |
|---|---|
| 「发布」「发出去」 | 点发布按钮 |
| 「填好」「存草稿」「我看看」 | 点 **暂存离开**，不点发布 |
| 没说 | 停在填好状态，问用户 |

**绝不自行点击发布。** 发布会即时生效并进入审核，无法撤回。

---

## 故障排查

| 现象 | 原因 | 解决 |
|---|---|---|
| `curl 9222` 连接被拒 | Chrome 非调试模式启动 | 完全退出 Chrome，带 `--remote-debugging-port=9222` 重启 |
| `no page matching creator.xiaohongshu.com` | 创作平台页没开 | 先 `open` 发布页 |
| `selector not found` | 平台改版 | `eval` 打印所有 `input` / `[contenteditable]` 重新定位 |
| 正文打不进 | 编辑器不是 tiptap | `eval` 打印 `contenteditable` 元素列表 |
| 图片上传无效 | 有多个 `input[type=file]` | `eval` 打印每个的 outerHTML 定位真正的那个 |
| 标签不生效 | 绕过了候选流程 | 用 `topics.mjs`，不要手打 |
| 段落末尾有裸 `#` | 标签插入后清理失败 | `topics.mjs` 已内置；手动插入需自行处理 |
| 打字卡在输入框 | 焦点丢失 | 先 `focusend` 再 `type`/`typefile` |
