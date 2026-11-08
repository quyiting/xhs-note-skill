#!/usr/bin/env node
// Rebuild drafts from a spec: delete the old note, recreate it with a new cover.
// Useful for swapping placeholder covers for real photos.
//
// spec line format:  slug|标题|话题1,话题2,话题3
// slug resolves to  <root>/assets/<slug>-cover.jpg  and  <root>/drafts/<slug>.body.txt
//
// Usage: node scripts/rebuild.mjs <targetId> <specFile> [--root /path/to/project]
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const rootIdx = argv.indexOf("--root");
const ROOT = rootIdx >= 0 ? argv[rootIdx + 1] : process.env.XHS_ROOT || process.cwd();
const [targetId, specFile] = argv.filter((a, i) => a !== "--root" && i !== rootIdx + 1);

if (!targetId || !specFile) {
  console.error("usage: rebuild.mjs <targetId> <specFile> [--root DIR]");
  process.exit(1);
}

const run = (tool, args) =>
  execFileSync("node", [path.join(HERE, tool), ...args], { encoding: "utf8", timeout: 300000 });

const lines = fs.readFileSync(specFile, "utf8").split("\n").map((l) => l.trim()).filter(Boolean);

for (const line of lines) {
  const [slug, title, topicsRaw] = line.split("|");
  const topics = (topicsRaw || "").split(",").map((t) => t.trim()).filter(Boolean);
  const cover = path.join(ROOT, "assets", `${slug}-cover.jpg`);
  const body = path.join(ROOT, "drafts", `${slug}.body.txt`);

  console.log(`\n=== ${slug} :: ${title}`);
  if (!fs.existsSync(cover) || !fs.existsSync(body)) {
    console.log("  SKIP: missing", !fs.existsSync(cover) ? cover : body);
    continue;
  }

  // the old note may carry a doubled title from a failed run — try both
  for (const t of [title, title + title]) {
    try {
      const out = run("deletedraft.mjs", [targetId, t]);
      if (/not found/.test(out)) continue;
      console.log("  deleted:", t.slice(0, 16) + (t.length > 16 ? "…" : ""));
    } catch { /* not present */ }
  }

  try {
    run("fillnote.mjs", [targetId, cover, body, title]);
    console.log("  filled");
  } catch (e) {
    console.log("  FILL FAILED:", (e.stdout || e.message || "").trim().split("\n").pop());
    continue;
  }

  if (topics.length) {
    try { run("addtopic.mjs", [targetId, ...topics]); console.log("  topics ok"); }
    catch (e) { console.log("  TOPIC FAILED:", (e.stdout || e.message || "").trim().split("\n").pop()); }
  }

  // check before saving: a bad delete leaves doubled title/body behind
  try {
    const out = run("cdp.mjs", ["evalon", targetId,
      `JSON.stringify({t:document.querySelector('input.d-text[placeholder*="标题"]')?.value,` +
      `p:document.querySelector('div.tiptap.ProseMirror')?.children.length,` +
      `i:[...document.querySelectorAll('.img-list img')].filter(x=>x.offsetParent!==null).length})`]);
    const st = JSON.parse(out.trim().split("\n").pop());
    if (st.t !== title || st.i !== 1) {
      console.log(`  ⚠ sanity check failed (title=${st.t} images=${st.i}) — not saved`);
      continue;
    }
  } catch {}

  try { run("click.mjs", [targetId, "暂存离开"]); console.log("  saved as draft"); }
  catch (e) { console.log("  SAVE FAILED:", (e.stdout || e.message || "").trim().split("\n").pop()); }
}
console.log("\nDONE — nothing published.");
