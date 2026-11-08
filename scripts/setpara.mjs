#!/usr/bin/env node
// Replace specific body paragraphs by index (0-based).
// Note: rewriting a paragraph wipes the topic links inside it — add topics last.
//
// Usage: node scripts/setpara.mjs <targetId> <index> "<text>" [<index> "<text>" ...]
import { Session, sleep } from "./lib.mjs";

const argv = process.argv.slice(2);
const targetId = argv.shift();
const edits = [];
for (let i = 0; i + 1 < argv.length; i += 2) edits.push([Number(argv[i]), argv[i + 1]]);
if (!targetId || !edits.length) {
  console.error('usage: setpara.mjs <targetId> <index> "<text>" ...');
  process.exit(1);
}

const s = await Session.attach(targetId);
try {
  for (const [idx, text] of edits) {
    const ok = await s.eval(`(() => {
      const ed=document.querySelector('div.tiptap.ProseMirror');
      const p=ed && ed.children[${idx}];
      if(!p) return 0;
      ed.focus();
      const r=document.createRange(); r.selectNodeContents(p);
      const sel=getSelection(); sel.removeAllRanges(); sel.addRange(r);
      return 1;
    })()`);
    if (!ok) { console.log(`para ${idx}: missing`); continue; }
    await s.typeText(text);
    await sleep(500);
    const now = await s.eval(`document.querySelector('div.tiptap.ProseMirror').children[${idx}].textContent`);
    console.log(`para ${idx}:`, String(now).slice(0, 60));
  }
} finally { s.close(); process.exit(0); }
