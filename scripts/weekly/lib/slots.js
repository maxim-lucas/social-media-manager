/**
 * slots.js: the week's posting slots and whether each one is due (Maxim, 2026-11-16).
 *
 * Times are the Meta AI proposal with the design's changes; they are hypotheses for 4 weeks, then replaced by
 * Instagram Insights data. Every English slot has a Quebec French twin 75 minutes later (60 to 90 in the design).
 */
const { addDays, addMinutes, torontoInstant } = require("./time");

const TWIN_MINUTES = 75;
const WINDOW_HOURS = 2;

/** day: 1 = Monday. asap: published as soon as it is ready, between earliest and latest (the first app to publish). */
const WEEK_TEMPLATE = [
  { day: 1, kind: "carousel", key: "grocery", time: "08:00", asap: true, earliest: "08:00", latest: "14:30" },
  { day: 1, kind: "reel", key: "grocery", time: "19:00" },
  { day: 2, kind: "carousel", key: "tech", time: "12:00" },
  { day: 2, kind: "reel", key: "tech", time: "20:00" },
  { day: 3, kind: "carousel", key: "home", time: "08:00" },
  { day: 3, kind: "reel", key: "home", time: "19:30" },
  { day: 4, kind: "carousel", key: "bc-grocery", time: "06:00" },
  { day: 4, kind: "reel", key: "bc-grocery", time: "12:00" },
  { day: 5, kind: "reel", key: "recap", time: "19:00" },
  { day: 6, kind: "carousel", key: "regional", time: "09:00" },
  { day: 6, kind: "reel", key: "regional", time: "18:00" },
  { day: 7, kind: "carousel", key: "how-to-claim", time: "18:00" },
  { day: 7, kind: "reel", key: "how-to-claim", time: "20:00" },
];

/**
 * A weekday top-up (Tue to Sat) after an important batch of new savings: the national carousels only, one slot each,
 * early evening, with the Quebec French twin 75 minutes later. `day: 1` = the pack's own date.
 */
const DAY_TEMPLATE = [
  { day: 1, kind: "carousel", key: "grocery", time: "17:00" },
  { day: 1, kind: "carousel", key: "home", time: "18:00" },
  { day: 1, kind: "carousel", key: "tech", time: "19:00" },
];

const slotId = (date, kind, key, lang) => `${date}-${kind}-${key}-${lang}`;

/**
 * @param {{monday: string, available: Record<string, {assets: string[]}>, captions: Record<string, {instagram: string, facebook: string}>}} o
 * available/captions are keyed by slot id. A slot without assets or a caption is `needs_content`, never guessed.
 */
function buildSchedule({ monday, available = {}, captions = {}, template = WEEK_TEMPLATE }) {
  const slots = [];
  for (const t of template) {
    const date = addDays(monday, t.day - 1);
    for (const lang of ["en", "fr"]) {
      const id = slotId(date, t.kind, t.key, lang);
      const asset = available[id];
      const cap = captions[id];
      const time = lang === "fr" ? addMinutes(t.time, TWIN_MINUTES) : t.time;
      slots.push({
        id, date, time, lang, kind: t.kind, key: t.key,
        ...(t.asap ? { asap: true, earliest: lang === "fr" ? addMinutes(t.earliest, TWIN_MINUTES) : t.earliest, latest: lang === "fr" ? addMinutes(t.latest, TWIN_MINUTES) : t.latest } : {}),
        assets: asset ? asset.assets : [],
        ...(t.kind === "reel" ? { cover: asset && asset.cover ? asset.cover : null } : {}),
        caption: cap || null,
        networks: ["instagram", "facebook"],
        // A reel is ready only with its cover too (Maxim, 2026-11-24): Instagram's own pick is a half-built frame.
        status: asset && asset.assets.length && cap && (t.kind !== "reel" || asset.cover) ? "ready" : "needs_content",
      });
    }
  }
  return slots;
}

/**
 * @returns {"published"|"needs_content"|"pending"|"due"|"missed"}
 * Never late: past its window a slot is MISSED and left for a human, so a runner that was down never dumps a backlog.
 */
function dueState(slot, ledger, now, { windowHours = WINDOW_HOURS } = {}) {
  if (ledger[slot.id]) return "published";
  if (slot.status !== "ready") return "needs_content";
  const start = torontoInstant(slot.date, slot.asap ? slot.earliest : slot.time);
  const end = slot.asap ? torontoInstant(slot.date, slot.latest) : new Date(start.getTime() + windowHours * 3600_000);
  if (now < start) return "pending";
  return now <= end ? "due" : "missed";
}

module.exports = { WEEK_TEMPLATE, DAY_TEMPLATE, buildSchedule, dueState, slotId, TWIN_MINUTES, WINDOW_HOURS };
