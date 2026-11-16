/** time.js: Toronto wall-clock helpers. Daylight saving needs no table: try both offsets, keep the one that round-trips. */
const TZ = "America/Toronto";

/** The Toronto calendar date (YYYY-MM-DD) of an instant. */
function torontoToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
}

/** The UTC instant of a Toronto wall-clock time ("HH:MM") on a Toronto calendar date. */
function torontoInstant(iso, hhmm) {
  for (const off of ["-04:00", "-05:00"]) {
    const d = new Date(`${iso}T${hhmm}:00${off}`);
    const back = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
    const day = torontoToday(d);
    if (back === hhmm && day === iso) return d;
  }
  throw new Error(`cannot place ${iso} ${hhmm} in Toronto time`);
}

/** Add days to an ISO date. */
function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** "HH:MM" plus minutes, clamped to 23:59 so a twin never slips into the next day. */
function addMinutes(hhmm, mins) {
  const [h, m] = hhmm.split(":").map(Number);
  const t = Math.min(h * 60 + m + mins, 23 * 60 + 59);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

module.exports = { torontoToday, torontoInstant, addDays, addMinutes };
