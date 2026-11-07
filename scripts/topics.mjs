#!/usr/bin/env node
// Add XHS topic chips to the caret position in the tiptap editor.
//
// Usage: node topics.mjs <targetId> <topic1> <topic2> ...
// Topic names are resolved against the editor's own suggestion dropdown, so a
// topic is only inserted when the platform actually offers it.
//
// Connects to a Chrome started with --remote-debugging-port=<port>.
// Endpoint resolution (no reads outside the project directory):
//   1. $CDP_WS_URL   -> full browser WebSocket URL
//   2. $CDP_PORT     -> TCP port, default 9222
//
// Network scope: connects ONLY to 127.0.0.1 on the local debugging port.
const HOST = "127.0.0.1";
const PORT = process.env.CDP_PORT || "9222";

async function resolveWsUrl() {
  if (process.env.CDP_WS_URL) return process.env.CDP_WS_URL;
  const res = await fetch(`http://${HOST}:${PORT}/json/version`);
  if (!res.ok) throw new Error(`cannot reach Chrome DevTools on ${HOST}:${PORT} (HTTP ${res.status})`);
  const info = await res.json();
  if (!info.webSocketDebuggerUrl) throw new Error("no webSocketDebuggerUrl in /json/version");
  return info.webSocketDebuggerUrl;
}

const wsUrl = await resolveWsUrl();
const ws = new WebSocket(wsUrl);

const TID = process.argv[2];
const wanted = process.argv.slice(3);
let seq = 0; const pending = new Map();
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const id = ++seq; pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id); pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let SID;
const evaluate = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }, SID);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result?.value;
};
const click = async (x, y) => {
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }, SID);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 }, SID);
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 }, SID);
};
const keyChar = async (ch) => {
  await send("Input.dispatchKeyEvent", { type: "keyDown", text: ch, key: ch, windowsVirtualKeyCode: ch.charCodeAt(0) }, SID);
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: ch, windowsVirtualKeyCode: ch.charCodeAt(0) }, SID);
};
const backspace = async () => {
  await send("Input.dispatchKeyEvent", { type: "rawKeyDown", windowsVirtualKeyCode: 8, code: "Backspace", key: "Backspace" }, SID);
  await send("Input.dispatchKeyEvent", { type: "keyUp", windowsVirtualKeyCode: 8, code: "Backspace", key: "Backspace" }, SID);
};

const listTags = () => evaluate(`JSON.stringify([...document.querySelectorAll('.recommend-topic-wrapper .tag')]
  .filter(e => e.offsetParent !== null && e.getBoundingClientRect().x > 0)
  .map(e => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim(), x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; }))`);

const removeStrayHash = async () => {
  const has = await evaluate(`(() => {
    const ed = document.querySelector('div.tiptap.ProseMirror');
    const p = ed.lastElementChild;
    const n = p.firstChild;
    if (!n || n.nodeType !== 3 || n.textContent !== '#') return 'none';
    const r = document.createRange(); r.setStart(n, 1); r.setEnd(n, 1);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r); ed.focus();
    return 'set';
  })()`);
  if (has === "set") { await backspace(); await sleep(300); return true; }
  return false;
};

ws.onopen = async () => {
  const { sessionId } = await send("Target.attachToTarget", { targetId: TID, flatten: true });
  SID = sessionId;
  for (const name of wanted) {
    const target = "#" + name;
    await evaluate(`(() => { const ed = document.querySelector('div.tiptap.ProseMirror'); ed.focus();
      const r = document.createRange(); r.selectNodeContents(ed); r.collapse(false);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r); return 1; })()`);
    await keyChar("#");
    await sleep(1200);
    let tags = JSON.parse(await listTags());
    let hit = tags.find((t) => t.t === target);
    for (let i = 0; i < 4 && !hit; i++) {
      const more = tags.find((t) => t.t === "更多");
      if (!more) break;
      await click(more.x, more.y);
      await sleep(1500);
      tags = JSON.parse(await listTags());
      hit = tags.find((t) => t.t === target);
    }
    if (!hit) { console.log("SKIP (not offered):", target, "| visible:", tags.map((t) => t.t).join(" ")); continue; }
    await click(hit.x, hit.y);
    await sleep(900);
    await removeStrayHash();
    const txt = await evaluate(`document.querySelector('div.tiptap.ProseMirror').lastElementChild.textContent`);
    console.log("ADDED", target, "->", JSON.stringify(txt));
  }
  const final = await evaluate(`document.querySelector('div.tiptap.ProseMirror').lastElementChild.innerHTML`);
  console.log("FINAL_HTML:", final.slice(0, 600));
  process.exit(0);
};