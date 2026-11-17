const test = require("node:test");
const assert = require("node:assert");
const { buildSchedule, dueState, WEEK_TEMPLATE } = require("./slots");
const { torontoInstant, addDays, addMinutes } = require("./time");

const MONDAY = "2026-11-16";
const ready = (id) => ({ ...slotBase(id), status: "ready" });
const slotBase = (id) => buildSchedule({ monday: MONDAY }).find((s) => s.id === id);

test("a week has every template slot in English and a French twin", () => {
  const slots = buildSchedule({ monday: MONDAY });
  assert.strictEqual(slots.length, WEEK_TEMPLATE.length * 2);
  assert.deepStrictEqual(slots.filter((s) => s.lang === "fr").length, WEEK_TEMPLATE.length);
});

test("dates run Monday to Sunday and the French twin is 75 minutes after the English slot", () => {
  const slots = buildSchedule({ monday: MONDAY });
  const en = slots.find((s) => s.id === "2026-11-18-carousel-home-en");
  const fr = slots.find((s) => s.id === "2026-11-18-carousel-home-fr");
  assert.deepStrictEqual([en.time, fr.time], ["08:00", "09:15"]);
  assert.strictEqual(slots.find((s) => s.kind === "carousel" && s.key === "how-to-claim").date, "2026-11-22");
});

test("the Monday carousel is asap between 08:00 and 14:30", () => {
  const s = slotBase("2026-11-16-carousel-grocery-en");
  assert.deepStrictEqual([s.asap, s.earliest, s.latest], [true, "08:00", "14:30"]);
});

test("a slot with no assets or no caption needs content", () => {
  assert.strictEqual(slotBase("2026-11-16-carousel-grocery-en").status, "needs_content");
  const id = "2026-11-16-carousel-grocery-en";
  const slots = buildSchedule({
    monday: MONDAY, available: { [id]: { assets: ["a.jpg", "b.jpg"] } }, captions: { [id]: { instagram: "x", facebook: "y" } },
  });
  assert.strictEqual(slots.find((s) => s.id === id).status, "ready");
});

test("due state: pending, due inside the 2 h window, then missed", () => {
  const s = ready("2026-11-18-carousel-home-en"); // Wed 08:00 Toronto
  const at = (hhmm) => torontoInstant("2026-11-18", hhmm);
  assert.strictEqual(dueState(s, {}, at("07:59")), "pending");
  assert.strictEqual(dueState(s, {}, at("08:00")), "due");
  assert.strictEqual(dueState(s, {}, at("10:00")), "due");
  assert.strictEqual(dueState(s, {}, at("10:01")), "missed");
});

test("a published slot is never due again", () => {
  const s = ready("2026-11-18-carousel-home-en");
  assert.strictEqual(dueState(s, { [s.id]: { at: "x" } }, torontoInstant("2026-11-18", "08:30")), "published");
});

test("the asap Monday slot is due the moment it is ready after 08:00 and missed after 14:30", () => {
  const s = ready("2026-11-16-carousel-grocery-en");
  const at = (hhmm) => torontoInstant("2026-11-16", hhmm);
  assert.strictEqual(dueState(s, {}, at("07:30")), "pending");
  assert.strictEqual(dueState(s, {}, at("09:10")), "due");
  assert.strictEqual(dueState(s, {}, at("14:30")), "due");
  assert.strictEqual(dueState(s, {}, at("14:31")), "missed");
});

test("a needs_content slot is reported as such, not posted", () => {
  assert.strictEqual(dueState(slotBase("2026-11-17-carousel-tech-en"), {}, torontoInstant("2026-11-17", "12:30")), "needs_content");
});

test("time helpers survive both daylight-saving offsets", () => {
  assert.strictEqual(torontoInstant("2026-11-16", "08:00").toISOString(), "2026-11-16T13:00:00.000Z"); // EST
  assert.strictEqual(torontoInstant("2026-07-13", "08:00").toISOString(), "2026-07-13T12:00:00.000Z"); // EDT
  assert.strictEqual(addDays("2026-11-28", 3), "2026-12-01");
  assert.strictEqual(addMinutes("23:00", 75), "23:59");
});

test("a weekday top-up schedule is the national carousels on the pack's own date, French 75 minutes after", () => {
  const { DAY_TEMPLATE } = require("./slots");
  const s = buildSchedule({ monday: "2026-11-18", template: DAY_TEMPLATE });
  assert.deepStrictEqual(s.filter((x) => x.lang === "en").map((x) => [x.date, x.key, x.time]), [
    ["2026-11-18", "grocery", "17:00"], ["2026-11-18", "home", "18:00"], ["2026-11-18", "tech", "19:00"],
  ]);
  assert.strictEqual(s.find((x) => x.key === "grocery" && x.lang === "fr").time, "18:15");
});
