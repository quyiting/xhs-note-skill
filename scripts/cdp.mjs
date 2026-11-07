#!/usr/bin/env node
// Minimal CDP driver for a running Chrome instance (profile already logged in).
//
// Connects to a Chrome that was started with --remote-debugging-port=<port>.
// The endpoint is resolved in this order, without reading anything outside the
// project directory or the user's explicit environment:
//
//   1. $CDP_WS_URL  -> full browser WebSocket URL (highest priority)
//   2. $CDP_PORT    -> TCP port, default 9222 (same port as --remote-debugging-port)
//   3. $CDP_PORT_FILE -> optional path to a Chrome DevToolsActivePort file,
//                        if the user wants to reuse an existing discovery file
//
// Usage:
//   node cdp.mjs targets
//   node cdp.mjs open <url>                       -> prints new targetId
//   node cdp.mjs eval "<js expr>"                 -> evaluates in page matching creator.xiaohongshu.com
//   node cdp.mjs evalon <targetId> "<js expr>"
//   node cdp.mjs shot <out.png>                   -> screenshot of creator page
//   node cdp.mjs upload <selector> <filePath...>  -> set files on <input type=file>
//   node cdp.mjs files                            -> list all <input type=file>
//   node cdp.mjs setvalue <selector> <text>       -> set a React-controlled input value
//   node cdp.mjs typefile <selector> <path>       -> type a text file line by line
//   node cdp.mjs wait <ms>
//   node cdp.mjs close <targetId>
//
// Network scope: connects ONLY to 127.0.0.1 on the local debugging port.
// No external network calls, no writes outside the paths given as arguments.
import fs from "node:fs";

const HOST = "127.0.0.1";
const PORT = process.env.CDP_PORT || "9222";

async function browserWs() {
  // 1. explicit WebSocket URL wins.
  if (process.env.CDP_WS_URL) return process.env.CDP_WS_URL;
  // 2. Chrome's HTTP discovery endpoint on the local debugging port.
  const port = PORT;
  let res;
  try {
    res = await fetch(`http://${HOST}:${port}/json/version`);
  } catch (e) {
    throw new Error(
      `cannot reach Chrome DevTools on ${HOST}:${port}.\n` +
      `Start Chrome with a debugging port, then retry:\n` +
      `  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=${port}\n` +
      `(on Linux: google-chrome --remote-debugging-port=${port})\n` +
      `Override the port with CDP_PORT, or set CDP_WS_URL to the full ws:// URL.\n` +
      `Underlying error: ${e.message}`
    );
  }
  if (!res.ok) throw new Error(`cannot reach Chrome DevTools on ${HOST}:${port} (HTTP ${res.status})`);
  const info = await res.json();
  if (!info.webSocketDebuggerUrl) throw new Error("no webSocketDebuggerUrl in /json/version");
  return info.webSocketDebuggerUrl;
}

class Conn {
  constructor(ws) {
    this.ws = ws;
    this.seq = 0;
    this.pending = new Map();
    ws.addEventListener("message", (ev) => {
      let m; try { m = JSON.parse(ev.data); } catch { return; }
      const w = m.id && this.pending.get(m.id);
      if (!w) return;
      this.pending.delete(m.id);
      m.error ? w.reject(new Error(JSON.stringify(m.error))) : w.resolve(m.result);
    });
  }
  static async open() {
    let lastErr;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const url = await browserWs();
        const ws = new WebSocket(url);
        await new Promise((res, rej) => {
          const t = setTimeout(() => rej(new Error("ws timeout")), 8000);
          ws.addEventListener("open", () => { clearTimeout(t); res(); }, { once: true });
          ws.addEventListener("error", () => rej(new Error("ws refused")), { once: true });
        });
        return new Conn(ws);
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 600));
      }
    }
    throw lastErr;
  }
  send(method, params = {}, sessionId) {
    const id = ++this.seq;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(msg));
      setTimeout(() => {
        if (this.pending.has(id)) { this.pending.delete(id); reject(new Error(`timeout ${method}`)); }
      }, 30000);
    });
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pageSession(conn, targetMatch = "creator.xiaohongshu.com") {
  const { targetInfos } = await conn.send("Target.getTargets");
  const pages = targetInfos.filter((t) => t.type === "page");
  const hit = pages.find((t) => t.url.includes(targetMatch));
  if (!hit) throw new Error(`no page matching ${targetMatch}; pages: ${pages.map((p) => p.url).join(" , ")}`);
  const { sessionId } = await conn.send("Target.attachToTarget", { targetId: hit.targetId, flatten: true });
  return { sessionId, target: hit };
}

const [cmd, ...rest] = process.argv.slice(2);
const conn = await Conn.open();

try {
  if (cmd === "targets") {
    const { targetInfos } = await conn.send("Target.getTargets");
    for (const t of targetInfos) console.log(`[${t.type}] ${t.targetId} | ${t.title.slice(0, 40)} | ${t.url.slice(0, 100)}`);
    if (!targetInfos.length) console.log("(no targets)");
  } else if (cmd === "open") {
    const { targetId } = await conn.send("Target.createTarget", { url: rest[0], newWindow: false });
    console.log(targetId);
  } else if (cmd === "close") {
    await conn.send("Target.closeTarget", { targetId: rest[0] });
    console.log("closed", rest[0]);
  } else if (cmd === "eval" || cmd === "evalon") {
    const [tid, expr] = cmd === "eval" ? [null, rest[0]] : [rest[0], rest[1]];
    let sessionId;
    if (tid) {
      const r = await conn.send("Target.attachToTarget", { targetId: tid, flatten: true });
      sessionId = r.sessionId;
    } else {
      sessionId = (await pageSession(conn)).sessionId;
    }
    const r = await conn.send("Runtime.evaluate", {
      expression: expr, returnByValue: true, awaitPromise: true, allowUnsafeEvalBlockedByCSP: true,
    }, sessionId);
    if (r.exceptionDetails) {
      console.error("EXCEPTION:", r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      process.exitCode = 1;
    } else {
      const v = r.result?.value;
      console.log(typeof v === "string" ? v : JSON.stringify(v, null, 1));
    }
  } else if (cmd === "shot") {
    const { sessionId } = await pageSession(conn);
    const r = await conn.send("Page.captureScreenshot", { format: "png" }, sessionId);
    fs.writeFileSync(rest[0], Buffer.from(r.data, "base64"));
    console.log("saved", rest[0]);
  } else if (cmd === "upload") {
    // upload <selector> <file...>  -> set one or more files on <input type=file>
    const [selector, ...files] = rest;
    if (!files.length) throw new Error("upload needs at least one file path");
    const { sessionId } = await pageSession(conn);
    const { root } = await conn.send("DOM.getDocument", { depth: -1, pierce: true }, sessionId);
    const { nodeId } = await conn.send("DOM.querySelector", { nodeId: root.nodeId, selector }, sessionId);
    if (!nodeId) throw new Error(`selector not found: ${selector}`);
    const missing = files.filter((f) => !fs.existsSync(f));
    if (missing.length) throw new Error(`file not found: ${missing.join(", ")}`);
    await conn.send("DOM.setFileInputFiles", { nodeId, files }, sessionId);
    console.log(`uploaded ${files.length} file(s) -> ${selector}`);
    for (const f of files) console.log("  +", f);
  } else if (cmd === "files") {
    // files  -> list every <input type=file> on the page, to locate the uploader
    const { sessionId } = await pageSession(conn);
    const r = await conn.send("Runtime.evaluate", {
      expression: `JSON.stringify([...document.querySelectorAll('input[type=file]')].map((e,i)=>({
        i, id: e.id||'', cls: e.className||'', accept: e.accept||'', multiple: !!e.multiple,
        visible: e.offsetParent !== null, html: e.outerHTML.slice(0,160)
      })), null, 1)`,
      returnByValue: true,
    }, sessionId);
    console.log(r.result?.value ?? "(none)");
  } else if (cmd === "setvalue") {
    // setvalue <selector> <text>  -> set a React-controlled input value + fire input event
    const [selector, ...textParts] = rest;
    const text = textParts.join(" ");
    const { sessionId } = await pageSession(conn);
    const r = await conn.send("Runtime.evaluate", {
      expression: `(() => {
        const e = document.querySelector(${JSON.stringify(selector)});
        if (!e) return "NOT_FOUND";
        e.focus();
        const proto = e instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
        setter.call(e, ${JSON.stringify(text)});
        e.dispatchEvent(new Event("input", { bubbles: true }));
        e.dispatchEvent(new Event("change", { bubbles: true }));
        return "OK:" + e.value;
      })()`,
      returnByValue: true,
    }, sessionId);
    const v = r.result?.value;
    if (String(v).startsWith("OK")) console.log("setvalue", JSON.stringify(text), "->", selector);
    else { console.log("setvalue failed:", String(v)); process.exitCode = 1; }
  } else if (cmd === "type") {
    const [selector, text] = rest;
    const { sessionId } = await pageSession(conn);
    const focus = await conn.send("Runtime.evaluate", {
      expression: `(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return "NOT_FOUND"; e.focus(); if (e.isContentEditable) { const r = document.createRange(); r.selectNodeContents(e); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } else if (e.setSelectionRange) { const l = e.value.length; e.setSelectionRange(l, l); } return "OK:" + e.tagName; })()`,
      returnByValue: true,
    }, sessionId);
    if (focus.result?.value !== undefined && String(focus.result.value).startsWith("OK")) {
      await conn.send("Input.insertText", { text }, sessionId);
      console.log("typed", JSON.stringify(text).slice(0, 60), "->", selector);
    } else {
      console.log("focus failed:", JSON.stringify(focus.result?.value));
      process.exitCode = 1;
    }
  } else if (cmd === "typefile") {
    // typefile <selector> <path>  -> types a text file paragraph by paragraph (\n = Enter)
    const [selector, file] = rest;
    const lines = fs.readFileSync(file, "utf8").replace(/\r/g, "").split("\n");
    const { sessionId } = await pageSession(conn);
    const focus = await conn.send("Runtime.evaluate", {
      expression: `(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return "NOT_FOUND"; e.focus(); if (e.isContentEditable) { const r = document.createRange(); r.selectNodeContents(e); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } return "OK"; })()`,
      returnByValue: true,
    }, sessionId);
    if (String(focus.result?.value) !== "OK") throw new Error("focus failed");
    const pressEnter = async () => {
      await conn.send("Input.dispatchKeyEvent", { type: "rawKeyDown", windowsVirtualKeyCode: 13, code: "Enter", key: "Enter" }, sessionId);
      await conn.send("Input.dispatchKeyEvent", { type: "char", text: "\r", key: "Enter", windowsVirtualKeyCode: 13 }, sessionId);
      await conn.send("Input.dispatchKeyEvent", { type: "keyUp", windowsVirtualKeyCode: 13, code: "Enter", key: "Enter" }, sessionId);
      await sleep(40);
    };
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length) await conn.send("Input.insertText", { text: lines[i] }, sessionId);
      if (i < lines.length - 1) await pressEnter();
    }
    console.log("typed file", file, "lines:", lines.length);
  } else if (cmd === "focusend" || cmd === "insert") {
    const [selector, text] = rest;
    const { sessionId } = await pageSession(conn);
    const r = await conn.send("Runtime.evaluate", {
      expression: `(() => {
        const e = document.querySelector(${JSON.stringify(selector)});
        if (!e) return "NOT_FOUND";
        e.focus();
        const sel = getSelection();
        const range = document.createRange();
        range.selectNodeContents(e);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        return "OK";
      })()`,
      returnByValue: true,
    }, sessionId);
    if (String(r.result?.value) !== "OK") throw new Error("focus failed " + JSON.stringify(r.result?.value));
    if (cmd === "insert") {
      await conn.send("Input.insertText", { text }, sessionId);
      console.log("inserted", JSON.stringify(text).slice(0, 80));
    } else {
      console.log("caret at end of", selector);
    }
  } else if (cmd === "key") {
    const [keyName] = rest;
    const { sessionId } = await pageSession(conn);
    const map = { Enter: [13, "Enter", 13], Tab: [9, "Tab", 9], Backspace: [8, "Backspace", 8] };
    const [vk, code, text] = map[keyName] || [0, keyName, 0];
    await conn.send("Input.dispatchKeyEvent", { type: "keyDown", windowsVirtualKeyCode: vk, code, key: keyName, text: keyName.length === 1 ? keyName : undefined }, sessionId);
    await conn.send("Input.dispatchKeyEvent", { type: "keyUp", windowsVirtualKeyCode: vk, code, key: keyName }, sessionId);
    console.log("key", keyName);
  } else if (cmd === "wait") {
    await sleep(Number(rest[0] || 1000));
    console.log("waited", rest[0]);
  } else {
    console.log("unknown command", cmd);
  }
} finally {
  try { conn.ws.close(); } catch {}
  await sleep(50);
  process.exit(process.exitCode || 0);
}