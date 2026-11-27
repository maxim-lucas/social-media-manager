/**
 * Where each content pack lives: the one lookup every script and workflow uses (sm-content/packs.json).
 *
 * A pack is named by its stable KEY ("evergreen", "price-drops"); its folder may move. Lookups also accept the
 * folder name ("03-evergreen") and, for one transition, the pack's former folder name (see LEGACY), so a command
 * typed from an older doc still works.
 *
 *   const packs = require("./lib/packs");   packs.dir("evergreen")  -> absolute path
 *                                            packs.rel("evergreen")  -> "sm-content/03-evergreen"
 *   node scripts/lib/packs.js dir price-drops      # prints sm-content/08-costco-price-drops (for workflows)
 *   node scripts/lib/packs.js list                 # key, folder, what reads it
 *   node scripts/lib/packs.js check                # every folder exists, every sm-content/ folder is registered
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const CONTENT = "sm-content";
const REGISTRY = JSON.parse(fs.readFileSync(path.join(ROOT, CONTENT, "packs.json"), "utf8")).packs;
// Folder names before the 2026-11-27 renumbering, so old commands keep resolving.
const LEGACY = { evergreen: "evergreen", teaser: "teaser", brand: "brand" };

function key(nameOrDir) {
  const n = String(nameOrDir || "").replace(/^sm-content\//, "").replace(/\/+$/, "");
  if (REGISTRY[n]) return n;
  for (const [k, v] of Object.entries(REGISTRY)) if (v.dir === n) return k;
  for (const [k, old] of Object.entries(LEGACY)) if (old === n) return k;
  return null;
}
function entry(nameOrDir) {
  const k = key(nameOrDir);
  if (!k) throw new Error(`unknown pack "${nameOrDir}" — not a key or a folder in ${CONTENT}/packs.json`);
  return { key: k, ...REGISTRY[k] };
}
const rel = (nameOrDir) => `${CONTENT}/${entry(nameOrDir).dir}`;
const dir = (nameOrDir) => path.join(ROOT, rel(nameOrDir));
const all = () => Object.keys(REGISTRY).map(entry);

function check() {
  const problems = [];
  for (const p of all()) if (!fs.existsSync(dir(p.key))) problems.push(`${p.key}: ${rel(p.key)} does not exist`);
  const registered = new Set(all().map((p) => p.dir));
  for (const d of fs.readdirSync(path.join(ROOT, CONTENT), { withFileTypes: true }))
    if (d.isDirectory() && !registered.has(d.name)) problems.push(`${CONTENT}/${d.name} is not in packs.json`);
  return problems;
}

module.exports = { ROOT, CONTENT, key, entry, rel, dir, all, check };

if (require.main === module) {
  const [cmd, arg] = process.argv.slice(2);
  try {
    if (cmd === "dir") console.log(rel(arg));
    else if (cmd === "list") for (const p of all()) console.log(`${p.key.padEnd(16)} ${rel(p.key).padEnd(36)} ${(p.automated || []).join(", ")}`);
    else if (cmd === "check") {
      const problems = check();
      problems.forEach((x) => console.error(x));
      console.log(problems.length ? `packs check: ${problems.length} problem(s)` : `packs check OK — ${all().length} packs, every folder registered`);
      process.exit(problems.length ? 1 : 0);
    } else {
      console.error("usage: node scripts/lib/packs.js dir <key> | list | check");
      process.exit(2);
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
