// Shared CDP helpers for the Xiaohongshu creator platform.
//
// Everything here is niche-agnostic: it drives the platform, not the content.
//
// Key platform quirks handled below:
//   * the publish bar and the draft drawer are NOT reachable via
//     document.querySelectorAll -> we go through the accessibility tree
//   * the drawer defaults to the 视频笔记 tab -> switch to 图文笔记
//   * the drawer's slide-in animation can stall at translateX(600px) -> force it
//   * the 删除 control opens a Popconfirm on CLICK (not hover)
//   * editing a paragraph wipes the topic nodes inside it -> topics last
import fs from "node:fs";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------------------------------------------- transport */

export async function endpoint() {
  if (process.env.CDP_WS_URL) return process.env.CDP_WS_URL;
  const ports = [process.env.CDP_PORT || "9222", "9222", "9223"];
  for (const port of ports) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`, {
        signal: AbortSignal.timeout(2500),
      });
      if (!res.ok) continue;
      const j = await res.json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
  }
  // last resort: a DevToolsActivePort written by the browser
  const candidates = [
    `${process.env.HOME}/Library/Application Support/Chrome-Automation/DevToolsActivePort`,
    `${process.env.HOME}/Library/Application Support/Google/Chrome/DevToolsActivePort`,
    `${process.env.HOME}/.config/google-chrome/DevToolsActivePort`,
  ];
  for (const p of candidates) {
    try {
      const [port, path] = fs.readFileSync(p, "utf8").trim().split("\n");
      if (port && path) return `ws://127.0.0.1:${port.trim()}${path.trim()}`;
    } catch {}
  }
  throw new Error("no devtools endpoint — is Chrome running with --remote-debugging-port?");
}

export class Session {
  constructor(ws, targetId) {
    this.ws = ws;
    this.targetId = targetId;
    this.seq = 0;
    this.pending = new Map();
    this.sid = null;
  }

  static async attach(targetId) {
    const url = await endpoint();
    const ws = new WebSocket(url);
    await new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error("ws timeout")), 8000);
      ws.addEventListener("open", () => { clearTimeout(t); res(); }, { once: true });
      ws.addEventListener("error", () => rej(new Error("ws refused")), { once: true });
    });
    const s = new Session(ws, targetId);
    ws.addEventListener("message", (e) => {
      let m; try { m = JSON.parse(e.data); } catch { return; }
      const w = m.id && s.pending.get(m.id);
      if (!w) return;
      s.pending.delete(m.id);
      m.error ? w.reject(new Error(JSON.stringify(m.error))) : w.resolve(m.result);
    });
    const { sessionId } = await s.send("Target.attachToTarget", { targetId, flatten: true });
    s.sid = sessionId;
    return s;
  }

  send(method, params = {}) {
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const msg = { id, method, params };
      if (this.sid) msg.sessionId = this.sid;   // omitted before attach
      this.ws.send(JSON.stringify(msg));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout ${method}`));
        }
      }, 30000);
    });
  }

  async eval(expr) {
    const r = await this.send("Runtime.evaluate", {
      expression: expr, returnByValue: true, awaitPromise: true,
    });
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    }
    return r.result?.value;
  }

  async mouse(type, x, y) {
    await this.send("Input.dispatchMouseEvent", {
      type, x, y, button: type === "mouseMoved" ? "none" : "left", clickCount: 1,
    });
  }

  async clickAt(x, y) {
    await this.mouse("mouseMoved", x, y);
    await sleep(120);
    await this.mouse("mousePressed", x, y);
    await sleep(80);
    await this.mouse("mouseReleased", x, y);
  }

  async key(type, key, vk, text) {
    const p = { type, key, windowsVirtualKeyCode: vk };
    if (text !== undefined) p.text = text;
    if (key === "Enter") p.code = "Enter";
    if (key === "Backspace") p.code = "Backspace";
    if (key === "Tab") p.code = "Tab";
    await this.send("Input.dispatchKeyEvent", p);
  }

  async pressEnter() {
    await this.key("rawKeyDown", "Enter", 13);
    await this.key("char", "Enter", 13, "\r");
    await this.key("keyUp", "Enter", 13);
    await sleep(40);
  }

  async typeText(text) {
    await this.send("Input.insertText", { text });
  }

  close() { try { this.ws.close(); } catch {} }
}

/* --------------------------------------------------------- accessibility */

// The publish bar / drawer escape normal DOM queries; find them via AX tree.
export async function axButtonPos(s, name) {
  await s.send("DOM.enable");
  await s.send("DOM.getDocument", { depth: 0 });
  await s.send("Accessibility.enable");
  const { nodes } = await s.send("Accessibility.getFullAXTree");
  const node = nodes.find(
    (n) => n.role?.value === "button" && n.name?.value === name && !n.ignored
  );
  if (!node) return null;
  const { nodeIds } = await s.send("DOM.pushNodesByBackendIdsToFrontend", {
    backendNodeIds: [node.backendDOMNodeId],
  });
  if (!nodeIds?.length) return null;
  const { model } = await s.send("DOM.getBoxModel", { nodeId: nodeIds[0] });
  const q = model.border;
  return { x: (q[0] + q[2] + q[4] + q[6]) / 4, y: (q[1] + q[3] + q[5] + q[7]) / 4 };
}

export async function clickButton(s, name) {
  const pos = await axButtonPos(s, name);
  if (!pos) throw new Error(`button not found: ${name}`);
  await s.clickAt(pos.x, pos.y);
  await sleep(1500);
  return pos;
}

/* -------------------------------------------------------------- draft box */

export async function openDrawer(s) {
  let open = await s.eval(`!!document.querySelector('.draft-title-text')`);
  if (open) return;

  // leaving an open editor first: the trigger only exists on the upload screen
  if (await s.eval(`!!document.querySelector('div.tiptap.ProseMirror')`)) {
    try { await clickButton(s, "暂存离开"); } catch {}
    await sleep(3500);
  }

  const d = await s.eval(`(() => {
    const e=[...document.querySelectorAll('.draft-title')].find(x=>x.offsetParent!==null);
    if(!e) return null;
    const r=e.getBoundingClientRect();
    return JSON.stringify({x:r.x+r.width/2, y:r.y+r.height/2});
  })()`);
  if (!d) throw new Error("draft drawer trigger not found (are you on the publish page?)");
  const b = JSON.parse(d);
  await s.clickAt(b.x, b.y);
  await sleep(2500);

  // the slide-in animation can stall while the tab is unfocused
  await s.eval(`(() => {
    const d=document.querySelector('.d-drawer');
    if(d){
      d.classList.remove('drawer-slide-right-enter-from','drawer-slide-right-enter-active','drawer-slide-right-enter-to');
      d.style.transform='translateX(0)';
    }
    return 1;
  })()`);
  await sleep(600);

  // default tab is 视频笔记; the drafts we want live under 图文笔记
  await s.eval(`(() => {
    const t=[...document.querySelectorAll('.tab-item-text')].find(e=>e.textContent.includes('图文笔记'));
    if(t){ (t.closest('[class*=tab-item]')||t).click(); return 1; }
    return 0;
  })()`);
  await sleep(2500);
}

export async function listDrafts(s) {
  await openDrawer(s);
  const raw = await s.eval(`JSON.stringify(
    [...document.querySelectorAll('.draft-item')].map(c => {
      const t = c.querySelector('.draft-title-text');
      const d = c.querySelector('.draft-info-desc');
      return { title: t ? t.textContent.trim() : null,
               saved: d ? d.textContent.trim().split('\\n')[0] : null };
    }))`);
  return JSON.parse(raw);
}

export async function openDraft(s, title) {
  await openDrawer(s);
  const ok = await s.eval(`(() => {
    const title = ${JSON.stringify(title)};
    const card=[...document.querySelectorAll('.draft-item')].find(c=>{
      const t=c.querySelector('.draft-title-text');
      return t && t.textContent.trim()===title;
    });
    if(!card) return 0;
    card.scrollIntoView({block:'center'});
    const e=[...card.querySelectorAll('.draft-actions .btn')].find(x=>x.textContent.trim()==='编辑');
    if(!e) return 0;
    e.click();               // DOM click: the forced transform desyncs synthetic hits
    return 1;
  })()`);
  if (!ok) throw new Error(`draft not found: ${title}`);
  await sleep(5200);
}

export async function deleteDraft(s, title) {
  await openDrawer(s);
  const pos = await s.eval(`(() => {
    const title = ${JSON.stringify(title)};
    const card=[...document.querySelectorAll('.draft-item')].find(c=>{
      const t=c.querySelector('.draft-title-text');
      return t && t.textContent.trim()===title;
    });
    if(!card) return null;
    card.scrollIntoView({block:'center'});
    const btn=[...card.querySelectorAll('.draft-actions .btn')].find(b=>b.textContent.trim()==='删除');
    if(!btn) return null;
    const r=btn.getBoundingClientRect();
    return JSON.stringify({x:r.x+r.width/2, y:r.y+r.height/2});
  })()`);
  if (!pos) return false;
  const p = JSON.parse(pos);

  // 删除 opens a Popconfirm on click (hover is not enough)
  await s.mouse("mouseMoved", p.x, p.y);
  await sleep(200);
  await s.mouse("mousePressed", p.x, p.y);
  await sleep(100);
  await s.mouse("mouseReleased", p.x, p.y);
  await sleep(1800);

  const confirm = await s.eval(`(() => {
    const pc=[...document.querySelectorAll('.d-popconfirm')].filter(x=>x.offsetParent!==null)[0];
    if(!pc) return null;
    const b=[...pc.querySelectorAll('button,.d-button')].find(x=>x.textContent.trim()==='删除');
    if(!b) return null;
    const r=b.getBoundingClientRect();
    return JSON.stringify({x:r.x+r.width/2, y:r.y+r.height/2});
  })()`);
  if (!confirm) throw new Error("delete confirmation did not appear");
  const c = JSON.parse(confirm);
  await s.clickAt(c.x, c.y);
  await sleep(2200);
  return true;
}

/* ------------------------------------------------------------------ editor */

export async function editorState(s) {
  const raw = await s.eval(`(() => {
    const ed=document.querySelector('div.tiptap.ProseMirror');
    return JSON.stringify({
      title: document.querySelector('input.d-text[placeholder*="标题"]')?.value || null,
      hasEditor: !!ed,
      images: [...document.querySelectorAll('.img-list img')].filter(i=>i.offsetParent!==null).length,
      topics: ed ? [...ed.querySelectorAll('a.tiptap-topic')].map(a=>JSON.parse(a.dataset.topic).name) : [],
      paras: ed ? ed.children.length : 0
    });
  })()`);
  return JSON.parse(raw);
}

// attributes come back either flat ["k","v",...] or [{name,value}]
export function attrOf(node, key) {
  const a = node.attributes || [];
  if (Array.isArray(a) && a.length && typeof a[0] === "object") {
    const hit = a.find((x) => x.name === key);
    return hit ? hit.value : null;
  }
  const i = a.findIndex((x) => x === key);
  return i >= 0 ? a[i + 1] : null;
}

export async function imageInputNodeId(s, { multiple = true } = {}) {
  await s.send("DOM.enable");
  const { root } = await s.send("DOM.getDocument", { depth: -1, pierce: true });
  const { nodeIds } = await s.send("DOM.querySelectorAll", {
    nodeId: root.nodeId, selector: "input[type=file]",
  });
  let fallback = null;
  for (const nid of nodeIds) {
    const { node } = await s.send("DOM.describeNode", { nodeId: nid });
    const accept = attrOf(node, "accept") || "";
    if (!/png|jpeg|jpg|webp/i.test(accept)) continue;
    const isMultiple = attrOf(node, "multiple") !== null;
    if (isMultiple === multiple) return nid;
    fallback = fallback ?? nid;
  }
  return fallback;
}