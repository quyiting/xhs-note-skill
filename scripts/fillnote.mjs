#!/usr/bin/env node
// Create one 图文 note in an open publish page: image + title + body.
// Never clicks 发布 — the note is left unsaved in the editor.
//
// Usage: node scripts/fillnote.mjs <targetId> <imagePath> <bodyFile> "<title>"
import fs from "node:fs";
import { Session, sleep } from "./lib.mjs";

const [targetId, image, bodyFile, title] = process.argv.slice(2);
if (!targetId || !image || !bodyFile || !title) {
  console.error('usage: fillnote.mjs <targetId> <image> <body.txt> "<title>"');
  process.exit(1);
}

const s = await Session.attach(targetId);
try {
  // 1) switch to the 图文 tab if the page defaults to video
  await s.eval(`(() => {
    const cs=[...document.querySelectorAll('.microapp-container')];
    const c=cs[cs.length-1];
    const tab=[...c.querySelectorAll('.creator-tab')].find(e=>e.innerText.trim()==='上传图文');
    if(tab) tab.click();
    return 1;
  })()`);
  await sleep(2500);

  // 2) upload the image
  const nid = await s.send("DOM.enable").then(async () => {
    const { root } = await s.send("DOM.getDocument", { depth: -1, pierce: true });
    const { nodeIds } = await s.send("DOM.querySelectorAll", {
      nodeId: root.nodeId, selector: 'input[type=file][accept*="png"]',
    });
    return nodeIds[0];
  });
  if (!nid) throw new Error("image input not found");
  await s.send("DOM.setFileInputFiles", { nodeId: nid, files: [image] });
  console.log("uploaded", image.split("/").pop());
  await sleep(9000);

  // 3) title
  const okTitle = await s.eval(`(() => {
    const e=document.querySelector('input.d-text[placeholder*="标题"]');
    if(!e) return 0;
    e.focus(); e.setSelectionRange(0,0); return 1;
  })()`);
  if (!okTitle) throw new Error("title input not found");
  await s.typeText(title);
  await sleep(500);

  // 4) body, paragraph by paragraph
  const lines = fs.readFileSync(bodyFile, "utf8").replace(/\r/g, "").split("\n");
  const okBody = await s.eval(`(() => {
    const ed=document.querySelector('div.tiptap.ProseMirror');
    if(!ed) return 0;
    ed.focus();
    const r=document.createRange(); r.selectNodeContents(ed); r.collapse(false);
    const sel=getSelection(); sel.removeAllRanges(); sel.addRange(r);
    return 1;
  })()`);
  if (!okBody) throw new Error("body editor not found");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length) await s.typeText(lines[i]);
    if (i < lines.length - 1) await s.pressEnter();
  }
  console.log("body typed, lines:", lines.length);

  await sleep(800);
  const st = await s.eval(`JSON.stringify({
    title: document.querySelector('input.d-text[placeholder*="标题"]')?.value,
    images: [...document.querySelectorAll('.img-list img')].filter(i=>i.offsetParent!==null).length,
    paras: document.querySelector('div.tiptap.ProseMirror')?.children.length
  })`);
  console.log("STATE:", st);
} finally {
  s.close();
  process.exit(0);
}
