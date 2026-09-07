#!/usr/bin/env node
/**
 * publish-due.js — the scheduled poster for the evergreen Instagram pack.
 *
 *   node scripts/publish-due.js --print      the fortnight as a readable agenda
 *   node scripts/publish-due.js --check      validate every slot; no network
 *   node scripts/publish-due.js              DRY RUN — what would post right now
 *   node scripts/publish-due.js --write      actually publish what is due
 *
 * Reads sm-content/evergreen/schedule.json, works out which slots are due, and
 * publishes them to Instagram through Meta's Graph API. Writes a receipt for
 * every publish into sm-content/evergreen/published.json.
 *
 * ── Four properties this script exists to guarantee ────────────────────────
 *
 * 1. DRY RUN BY DEFAULT. Posting to a live account is public and effectively
 *    irreversible, so it takes an explicit --write. There is no config flag
 *    that makes writing the default.
 *
 * 2. NEVER TWICE. Every publish is recorded by slot id in published.json and a
 *    recorded slot is skipped forever after. Cron overlaps, a re-run, a
 *    workflow retry after a network blip — none of them can double-post.
 *
 * 3. NEVER LATE. A slot is only due inside a window after its scheduled time
 *    (default 6h). A runner that was down for two days must not wake up and
 *    dump four posts into the feed at once; those slots are reported MISSED and
 *    left for a human to decide about.
 *
 * 4. THE DISCLAIMER CANNOT BE FORGOTTEN. It is appended here, to every caption,
 *    from one string in the schedule — never typed per-post. The app repo's
 *    legal/MARKETING_CLAIMS.md names the exact failure mode: a claim clipped
 *    into a social card without its paired fine print. Anything a human has to
 *    remember on every post is something that eventually gets forgotten.
 *
 * ── What is NOT automated, and why ─────────────────────────────────────────
 *
 * Stories and Reels are `automate: false` in the schedule. The Graph API can
 * publish story *media*, but it cannot attach a poll, quiz, question, slider or
 * link sticker — and on these frames the sticker IS the content; the art
 * deliberately leaves an empty band for it. An automated story would post the
 * frame with a hole in it. Reels want in-app audio picked at post time for the
 * same kind of reason. Both are listed by --print as the day's manual work.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PACK = path.join(ROOT, "sm-content", "evergreen");
const SCHEDULE_PATH = path.join(PACK, "schedule.json");
const LEDGER_PATH = path.join(PACK, "published.json");

const GRAPH_API_VERSION = "v20.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
const UPSTREAM_TIMEOUT_MS = 30_000;

// How long after its scheduled time a slot stays publishable. See property 3.
const DUE_WINDOW_HOURS = Number(process.env.PUBLISH_WINDOW_HOURS) || 6;

const args = process.argv.slice(2);
const has = (f) => args.includes(`--${f}`);
const argVal = (name, dflt) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : dflt;
};

const WRITE = has("write");
const PRINT = has("print");
const CHECK = has("check");
// Lets a human post one slot by hand without waiting for its window.
const ONLY = argVal("only", null);

const schedule = JSON.parse(fs.readFileSync(SCHEDULE_PATH, "utf8"));

/**
 * Public base URL the assets are served from. Meta FETCHES the image itself, so
 * a local path is useless — the URL has to be reachable from Meta's servers.
 * raw.githubusercontent.com serves this repo's files directly and is the
 * default; override for a CDN or a private mirror.
 */
const ASSET_BASE =
  process.env.ASSET_BASE_URL ||
  `https://raw.githubusercontent.com/maxim-lucas/social-media-manager/${
    process.env.ASSET_REF || "sm-content-evergreen"
  }/sm-content/evergreen/`;

// ── Time ────────────────────────────────────────────────────────────────────
/** Milliseconds `tz` is ahead of UTC at the given instant. */
function tzOffsetMs(instant, tz) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = Object.fromEntries(dtf.formatToParts(instant).map((x) => [x.type, x.value]));
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  return asUTC - instant.getTime();
}

/**
 * "2026-09-07" + "18:30" in `tz` -> a UTC Date.
 *
 * Two passes, not one: the offset depends on the instant, and the instant is
 * what we are solving for. Around a DST change the first guess lands an hour
 * out and the second pass corrects it.
 */
function zonedToUtc(dateStr, timeStr, tz) {
  let guess = new Date(`${dateStr}T${timeStr}:00Z`);
  for (let i = 0; i < 2; i++) {
    guess = new Date(new Date(`${dateStr}T${timeStr}:00Z`).getTime() - tzOffsetMs(guess, tz));
  }
  return guess;
}

const fmtLocal = (d) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: schedule.timezone,
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);

// ── Ledger ──────────────────────────────────────────────────────────────────
function readLedger() {
  if (!fs.existsSync(LEDGER_PATH)) return { published: [] };
  try {
    const parsed = JSON.parse(fs.readFileSync(LEDGER_PATH, "utf8"));
    return Array.isArray(parsed.published) ? parsed : { published: [] };
  } catch (e) {
    // A ledger we cannot read is the one case where continuing is dangerous:
    // every slot would look unpublished and the fortnight would post again.
    throw new Error(`published.json exists but could not be parsed (${e.message}). Refusing to run — fix or delete it.`);
  }
}

function recordPublish(entry) {
  const ledger = readLedger();
  ledger.published.push(entry);
  ledger.published.sort((a, b) => (a.at < b.at ? -1 : 1));
  fs.writeFileSync(LEDGER_PATH, `${JSON.stringify(ledger, null, 2)}\n`);
}

// ── Caption assembly ────────────────────────────────────────────────────────
function buildCaption(slot) {
  const lang = slot.lang === "fr" ? "fr" : "en";
  const tags = [...(schedule.hashtags.always[lang] || []), ...(slot.tags || [])];
  const parts = [slot.caption.trim(), tags.join(" "), schedule.disclaimer[lang].trim()];
  return parts.filter(Boolean).join("\n\n");
}

// ── Graph API ───────────────────────────────────────────────────────────────
// Intentionally mirrors src/lib/metaPublish.ts, which serves the Next.js route.
// The two are separate because this script runs in CI where no server exists,
// and adding a TypeScript build step to a cron job is a worse dependency than a
// second copy of a documented two-call flow. CHANGE BOTH TOGETHER.
class GraphError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "GraphError";
    this.code = code;
  }
}

async function graph(pathname, { method = "GET", params, body } = {}) {
  const url = new URL(`${GRAPH_BASE}${pathname}`);
  for (const [k, v] of Object.entries(params || {})) if (v != null) url.searchParams.set(k, v);

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (e) {
    throw new GraphError(`request failed: ${e.message}`);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON body on failure */
  }
  if (!res.ok) {
    const err = json && json.error;
    throw new GraphError(err?.message || `HTTP ${res.status}`, err?.code);
  }
  return json || {};
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function publishToInstagram({ igUserId, token, imageUrl, caption }) {
  const container = await graph(`/${igUserId}/media`, {
    method: "POST",
    body: { image_url: imageUrl, caption, access_token: token },
  });
  if (!container.id) throw new GraphError("Instagram returned no container id");

  // Meta fetches the image asynchronously. A container that reports ERROR will
  // not become valid by polling longer, so that is surfaced rather than retried.
  for (let i = 0; i < 12; i++) {
    const st = await graph(`/${container.id}`, { params: { fields: "status_code", access_token: token } });
    if (st.status_code === "FINISHED") break;
    if (st.status_code === "ERROR") {
      throw new GraphError(`Meta could not process the image at ${imageUrl}`);
    }
    if (i === 11) throw new GraphError("container did not finish processing in time");
    await sleep(2000);
  }

  const out = await graph(`/${igUserId}/media_publish`, {
    method: "POST",
    body: { creation_id: container.id, access_token: token },
  });
  if (!out.id) throw new GraphError("Instagram returned no media id");
  return out.id;
}

// ── Validation (--check) ────────────────────────────────────────────────────
function check() {
  const problems = [];
  const seen = new Set();
  const feedByDay = new Map();

  for (const slot of schedule.slots) {
    const at = `slot ${slot.id}`;
    if (seen.has(slot.id)) problems.push(`${at}: duplicate id`);
    seen.add(slot.id);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(slot.date)) problems.push(`${at}: bad date "${slot.date}"`);
    if (!/^\d{2}:\d{2}$/.test(slot.time)) problems.push(`${at}: bad time "${slot.time}"`);
    if (!["feed", "story", "reel"].includes(slot.kind)) problems.push(`${at}: unknown kind "${slot.kind}"`);
    if (!["en", "fr"].includes(slot.lang)) problems.push(`${at}: unknown lang "${slot.lang}"`);

    if (slot.asset) {
      const file = path.join(PACK, slot.asset);
      if (!fs.existsSync(file)) problems.push(`${at}: asset not found — ${slot.asset}`);
      // A caption in one language over art in the other is invisible in a diff
      // and obvious to a reader, so it is worth asserting mechanically.
      if (!slot.asset.includes(`-${slot.lang}-`)) {
        problems.push(`${at}: lang is "${slot.lang}" but the asset is ${slot.asset}`);
      }
    } else if (slot.automate) {
      problems.push(`${at}: automate:true with no asset`);
    }

    if (slot.kind === "feed") {
      if (!slot.caption || !slot.caption.trim()) problems.push(`${at}: feed slot with no caption`);
      if (!slot.ask) problems.push(`${at}: feed slot with no stated ask (send/save/comment/follow)`);
      const list = feedByDay.get(slot.date) || [];
      list.push(slot.id);
      feedByDay.set(slot.date, list);

      // Instagram's caption limit is 2200 characters and the disclaimer counts.
      const full = buildCaption(slot);
      if (full.length > 2200) problems.push(`${at}: assembled caption is ${full.length} chars (limit 2200)`);
    }

    if (slot.kind === "story" && slot.sticker === undefined) {
      problems.push(`${at}: story slot must declare a sticker ("none" is a valid answer)`);
    }
    if (slot.automate && slot.kind !== "feed") {
      problems.push(`${at}: only feed slots can be automated — stickers and in-app audio cannot be set through the API`);
    }
  }

  for (const [date, ids] of feedByDay) {
    if (ids.length > 1) problems.push(`${date}: ${ids.length} feed posts on one day (${ids.join(", ")})`);
  }

  for (const lang of ["en", "fr"]) {
    if (!schedule.disclaimer?.[lang]?.trim()) problems.push(`disclaimer.${lang} is missing`);
    if (!schedule.hashtags?.always?.[lang]?.length) problems.push(`hashtags.always.${lang} is empty`);
  }

  // A fortnight with no follow ask converts nobody; one where every post asks
  // for a follow converts nobody either.
  const follows = schedule.slots.filter((s) => s.ask === "follow");
  if (follows.length === 0) problems.push(`no slot asks for a follow — nothing in this run converts a viewer into a follower`);
  if (follows.length > 3) problems.push(`${follows.length} slots ask for a follow; the ask stops meaning anything past 2-3`);

  if (problems.length) {
    console.error(`check FAILED — ${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
    problems.forEach((p) => console.error(`  x ${p}`));
    process.exit(1);
  }
  const feed = schedule.slots.filter((s) => s.kind === "feed").length;
  const story = schedule.slots.filter((s) => s.kind === "story").length;
  const reel = schedule.slots.filter((s) => s.kind === "reel").length;
  console.log(`check OK — ${schedule.slots.length} slots (${feed} feed, ${story} story, ${reel} reel), 0 problems.`);
}

// ── Agenda (--print) ────────────────────────────────────────────────────────
function print() {
  const ledger = readLedger();
  const done = new Set(ledger.published.map((p) => p.id));
  const byDate = new Map();
  for (const s of schedule.slots) {
    const list = byDate.get(s.date) || [];
    list.push(s);
    byDate.set(s.date, list);
  }

  console.log(`\nPriceBack — evergreen run · ${schedule.account} · ${schedule.timezone}\n`);
  const dates = [...byDate.keys()].sort();
  let day = 0;
  for (const date of dates) {
    day++;
    const wd = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", weekday: "short" }).format(
      new Date(`${date}T12:00:00Z`)
    );
    console.log(`Day ${String(day).padStart(2)}  ${wd} ${date}`);
    for (const s of byDate.get(date).sort((a, b) => (a.time < b.time ? -1 : 1))) {
      const mark = done.has(s.id) ? "published" : s.automate ? "auto" : "by hand";
      const tag = `${s.kind}/${s.lang}`.padEnd(10);
      console.log(`        ${s.time}  ${tag} ${String(s.hook || s.sticker || "-").padEnd(22)} ${mark.padEnd(10)} ${s.id}`);
      if (s.note) console.log(`               ↳ ${s.note.split("\n")[0]}`);
    }
  }
  const feed = schedule.slots.filter((s) => s.kind === "feed");
  console.log(
    `\n${dates.length} days · ${feed.length} feed posts · ${
      schedule.slots.filter((s) => s.kind === "story").length
    } stories · ${schedule.slots.filter((s) => s.kind === "reel").length} reels`
  );
  console.log(`asks: ${feed.map((s) => s.ask).join(", ")}\n`);
}

// ── Publish ─────────────────────────────────────────────────────────────────
async function run() {
  const now = new Date();
  const ledger = readLedger();
  const done = new Set(ledger.published.map((p) => p.id));

  const due = [];
  const missed = [];
  for (const slot of schedule.slots) {
    if (!slot.automate) continue;
    if (done.has(slot.id)) continue;
    if (ONLY && slot.id !== ONLY) continue;

    const at = zonedToUtc(slot.date, slot.time, schedule.timezone);
    const ageH = (now - at) / 3_600_000;

    // --only names one slot explicitly, so it bypasses BOTH bounds: a human
    // asking for that id has already decided, and the window exists to stop the
    // scheduler acting on stale intent, not to stop a person.
    if (!ONLY) {
      if (ageH < 0) continue;
      if (ageH > DUE_WINDOW_HOURS) {
        missed.push({ slot, at, ageH });
        continue;
      }
    }
    due.push({ slot, at });
  }

  for (const { slot, ageH } of missed) {
    console.warn(
      `MISSED  ${slot.id} — scheduled ${slot.date} ${slot.time}, ${ageH.toFixed(
        1
      )}h ago, past the ${DUE_WINDOW_HOURS}h window. Post it by hand with --only=${slot.id} if it is still worth posting.`
    );
  }

  if (!due.length) {
    console.log(`nothing due at ${fmtLocal(now)}${missed.length ? ` (${missed.length} missed)` : ""}.`);
    return;
  }

  const igUserId = process.env.META_INSTAGRAM_BUSINESS_ACCOUNT_ID || "";
  const token = process.env.META_INSTAGRAM_ACCESS_TOKEN || process.env.META_PAGE_ACCESS_TOKEN || "";

  for (const { slot, at } of due) {
    const imageUrl = new URL(slot.asset, ASSET_BASE).href;
    const caption = buildCaption(slot);

    if (!WRITE) {
      console.log(`\nDRY RUN — would publish ${slot.id} (scheduled ${fmtLocal(at)})`);
      console.log(`  image   ${imageUrl}`);
      console.log(`  ask     ${slot.ask}   hook: ${slot.hook}`);
      console.log(`  caption ${caption.length} chars:`);
      console.log(
        caption
          .split("\n")
          .map((l) => `          ${l}`)
          .join("\n")
      );
      continue;
    }

    if (!igUserId || !token) {
      console.error(
        `refusing to publish ${slot.id}: META_INSTAGRAM_BUSINESS_ACCOUNT_ID and an access token must both be set.`
      );
      process.exitCode = 1;
      return;
    }

    try {
      const mediaId = await publishToInstagram({ igUserId, token, imageUrl, caption });
      // Recorded immediately, one slot at a time. If the next slot throws, this
      // one still cannot be republished on the next run.
      recordPublish({ id: slot.id, at: new Date().toISOString(), mediaId, platform: "instagram", asset: slot.asset });
      console.log(`published ${slot.id} -> media ${mediaId}`);
    } catch (e) {
      const expired = e instanceof GraphError && e.code === 190;
      console.error(`FAILED ${slot.id}: ${e.message}${expired ? " — the access token is invalid or expired; regenerate it" : ""}`);
      process.exitCode = 1;
      // Stop rather than march on: one failure is usually a bad token or a
      // wrong asset base, and both make every remaining slot fail too.
      return;
    }
  }
}

async function main() {
  if (CHECK) return check();
  if (PRINT) return print();
  check();
  await run();
}

main().catch((e) => {
  console.error(`publish-due failed: ${e.stack || e.message}`);
  process.exit(1);
});
