#!/usr/bin/env node
// Add real topic links (not plain "#text") to the end of the body.
// Types "#name" then Enter; if no such topic exists the text is rolled back.
//
// Usage: node scripts/addtopic.mjs <targetId> 话题1 话题2 ...
import { Session, sleep } from "./lib.mjs";

const [targetId, ...topics] = process.argv.slice(2);
if (!targetId) { console.error("usage: addtopic.mjs <targetId> topic..."); process.exit(1); }

const s = await Session.attach(targetId);
try {
  for (const name of topics) {
    const before = await s.eval(`document.querySelectorAll('div.tiptap.ProseMirror a.tiptap-topic').length`);
    await s.eval(`(() => {
      const ed=document.querySelector('div.tiptap.ProseMirror');
      ed.focus();
      const r=document.createRange(); r.selectNodeContents(ed); r.collapse(false);
      const sel=getSelection(); sel.removeAllRanges(); sel.addRange(r);
      return 1;
    })()`);
    await s.key("keyDown", "#", 51, "#");
    await s.key("keyUp", "#", 51);
    await sleep(700);
    await s.typeText(name);
    await sleep(900);
    await s.key("rawKeyDown", "Enter", 13);
    await s.key("char", "Enter", 13, "\r");
    await s.key("keyUp", "Enter", 13);
    await sleep(1100);

    const after = await s.eval(`document.querySelectorAll('div.tiptap.ProseMirror a.tiptap-topic').length`);
    if (after > before) { console.log("ADDED #" + name); continue; }

    for (let i = 0; i < name.length + 1; i++) {
      await s.key("rawKeyDown", "Backspace", 8);
      await s.key("keyUp", "Backspace", 8);
      await sleep(60);
    }
    console.log("ROLLED BACK (no such topic): #" + name);
  }
  const st = await s.eval(`JSON.stringify({
    topics: [...document.querySelectorAll('div.tiptap.ProseMirror a.tiptap-topic')].map(a=>JSON.parse(a.dataset.topic).name)
  })`);
  console.log("STATE:", st);
} finally {
  s.close();
  process.exit(0);
}
