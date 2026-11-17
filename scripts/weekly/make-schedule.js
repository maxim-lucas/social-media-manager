#!/usr/bin/env node
/**
 * make-schedule.js: the week's slots, from the template and the content the routine produced.
 *
 *   node scripts/weekly/make-schedule.js <monday-iso> [--day]     --day: a weekday top-up pack (the date is the pack's own)
 *
 * Reads  weekly/<monday>/content.json   { available: {slotId: {assets: ["media/<slot>/01.jpg", ...]}},
 *                                         captions:  {slotId: {instagram, facebook}} }
 * Writes weekly/<monday>/schedule.json  every slot, `ready` or `needs_content` (never guessed, never posted unready).
 */
const fs = require("fs");
const path = require("path");
const { buildSchedule, DAY_TEMPLATE } = require("./lib/slots");

const monday = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(monday || "")) {
  console.error("usage: make-schedule.js <monday-iso>");
  process.exit(1);
}
const dir = path.join(__dirname, "..", "..", "sm-content", "08-costco-price-drops", "weekly", monday);
const contentPath = path.join(dir, "content.json");
const content = fs.existsSync(contentPath) ? JSON.parse(fs.readFileSync(contentPath, "utf8")) : { available: {}, captions: {} };
const slots = buildSchedule({ monday, available: content.available, captions: content.captions, template: process.argv.includes("--day") ? DAY_TEMPLATE : undefined });
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "schedule.json"), JSON.stringify({ monday, timezone: "America/Toronto", slots }, null, 2) + "\n");
const ready = slots.filter((s) => s.status === "ready").length;
console.log(`schedule for ${monday}: ${ready} ready, ${slots.length - ready} need content`);
