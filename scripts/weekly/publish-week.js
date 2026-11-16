#!/usr/bin/env node
/**
 * publish-week.js: posts whatever the weekly schedules say is due, to Instagram and Facebook (Graph API).
 *
 *   node scripts/weekly/publish-week.js                dry run: prints what would post right now
 *   node scripts/weekly/publish-week.js --write        actually publishes
 *   node scripts/weekly/publish-week.js --only=<slot>  one slot, ignoring its window (manual catch-up)
 *   node scripts/weekly/publish-week.js --now=<ISO>    pretend it is this instant (dry runs and tests)
 *
 * The four properties of scripts/publish-due.js, kept: DRY RUN BY DEFAULT; NEVER TWICE (a ledger per week, written
 * after every slot); NEVER LATE (a slot past its 2 h window is MISSED and left for a human); THE DISCLAIMER IS
 * APPENDED HERE from the one string in sm-content/evergreen/schedule.json, never typed per post.
 *
 * Env (set by Maxim as repository secrets, never in the repo): META_INSTAGRAM_BUSINESS_ACCOUNT_ID,
 * META_INSTAGRAM_ACCESS_TOKEN (falls back to META_PAGE_ACCESS_TOKEN), META_PAGE_ID, META_PAGE_ACCESS_TOKEN.
 * ASSET_BASE_URL: public base the weekly/<monday>/ folders are served from (default: this repo on GitHub, master).
 * REEL_BASE_URL: where reel videos are served from (a public bucket); defaults to ASSET_BASE_URL.
 */
const fs = require("fs");
const path = require("path");
const { dueState } = require("./lib/slots");
const g = require("./lib/graph");

const ROOT = path.join(__dirname, "..", "..");
const WEEKLY = path.join(ROOT, "sm-content", "08-costco-price-drops", "weekly");
const args = process.argv.slice(2);
const has = (f) => args.includes(`--${f}`);
const val = (n) => (args.find((a) => a.startsWith(`--${n}=`)) || "").split("=").slice(1).join("=");

const WRITE = has("write");
const ONLY = val("only");
const NOW = val("now") ? new Date(val("now")) : new Date();
const disclaimer = JSON.parse(fs.readFileSync(path.join(ROOT, "sm-content", "evergreen", "schedule.json"), "utf8")).disclaimer;

const assetBase = (monday) =>
  (process.env.ASSET_BASE_URL || `https://raw.githubusercontent.com/maxim-lucas/social-media-manager/master/sm-content/08-costco-price-drops/weekly/${monday}`).replace(/\/+$/, "");
const reelBase = (monday) => (process.env.REEL_BASE_URL || assetBase(monday)).replace(/\/+$/, "");

async function reachable(url) {
  try {
    const r = await fetch(url, { headers: { range: "bytes=0-0" }, signal: AbortSignal.timeout(20_000) });
    return r.ok ? null : `HTTP ${r.status}`;
  } catch (e) {
    return e.message;
  }
}

async function publishSlot(slot, monday) {
  const base = slot.kind === "reel" ? reelBase(monday) : assetBase(monday);
  const urls = slot.assets.map((a) => `${base}/${a.replace(/^\/+/, "")}`);
  const text = (n) => `${slot.caption[n]}\n\n${disclaimer[slot.lang]}`;
  g.validateSlot({ kind: slot.kind, assets: urls, instagramCaption: text("instagram") });
  for (const u of urls) {
    const why = await reachable(u);
    if (why) throw new Error(`asset not reachable by Meta (${why}): ${u}`);
  }
  if (!WRITE) return { dryRun: true, urls };

  const igToken = process.env.META_INSTAGRAM_ACCESS_TOKEN || process.env.META_PAGE_ACCESS_TOKEN;
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
  const out = {};
  if (slot.networks.includes("instagram")) {
    const common = { fetchImpl: fetch, igId: process.env.META_INSTAGRAM_BUSINESS_ACCOUNT_ID, token: igToken };
    out.instagram = {
      id: slot.kind === "reel"
        ? await g.postIgReel({ ...common, videoUrl: urls[0], caption: text("instagram") })
        : await g.postIgCarousel({ ...common, imageUrls: urls, caption: text("instagram") }),
      at: new Date().toISOString(),
    };
  }
  if (slot.networks.includes("facebook")) {
    // Instagram is already live by now, so a Facebook failure is recorded, never retried into a double Instagram post.
    try {
      const common = { fetchImpl: fetch, pageId: process.env.META_PAGE_ID, token: pageToken };
      out.facebook = {
        id: slot.kind === "reel"
          ? await g.postFbVideo({ ...common, videoUrl: urls[0], message: text("facebook") })
          : await g.postFbPhotos({ ...common, imageUrls: urls, message: text("facebook") }),
        at: new Date().toISOString(),
      };
    } catch (e) {
      out.facebook = { error: e.message, at: new Date().toISOString() };
    }
  }
  return out;
}

async function main() {
  if (!fs.existsSync(WEEKLY)) return console.log("no weekly folder yet: nothing to do");
  let failures = 0;
  for (const monday of fs.readdirSync(WEEKLY).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort()) {
    const schedulePath = path.join(WEEKLY, monday, "schedule.json");
    if (!fs.existsSync(schedulePath)) continue;
    const ledgerPath = path.join(WEEKLY, monday, "published.json");
    const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, "utf8")) : {};
    for (const slot of JSON.parse(fs.readFileSync(schedulePath, "utf8")).slots) {
      const state = ONLY ? (slot.id === ONLY ? (ledger[slot.id] ? "published" : "due") : "skip") : dueState(slot, ledger, NOW);
      if (state === "missed") console.log(`MISSED   ${slot.id} (past its window, not posted late)`);
      if (state !== "due") continue;
      try {
        const result = await publishSlot(slot, monday);
        if (result.dryRun) console.log(`DRY RUN  ${slot.id}: would post ${slot.assets.length} asset(s) to ${slot.networks.join(" + ")}`);
        else {
          ledger[slot.id] = result;
          fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + "\n"); // after every slot: never twice
          console.log(`POSTED   ${slot.id}: ${JSON.stringify(result)}`);
          if (result.facebook && result.facebook.error) failures++;
        }
      } catch (e) {
        failures++;
        console.error(`FAILED   ${slot.id}: ${e.message}`);
      }
    }
  }
  if (failures) process.exit(2);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
