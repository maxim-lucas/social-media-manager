#!/usr/bin/env node
/**
 * query.js: read the week's savings through the read-only role, and say whether the harvest has settled.
 *
 *   node scripts/weekly/query.js --settled [--deadline=12:30]   poll: prints JSON, exits 0 when ready, 3 when not
 *   node scripts/weekly/query.js --snapshot=<out.json>           writes {rows, perProvince, lastCreatedAt}
 *
 * Needs DATABASE_URL_SOCIAL_RO (role social_ro: it can read four views in schema social_ro and nothing else).
 * "Today" and the deadline are Toronto time.
 */
const fs = require("fs");
const path = require("path");
const { Client, types } = require("pg");
const { evaluateSettled } = require("./lib/settled");

// A `date` column is a calendar date, not an instant: keep it as the text "YYYY-MM-DD". The driver's default turns it
// into a local-midnight Date, which is the previous day in any timezone east of UTC.
types.setTypeParser(1082, (v) => v);

const arg = (n) => (process.argv.find((a) => a.startsWith(`--${n}=`)) || "").split("=").slice(1).join("=");
const has = (n) => process.argv.includes(`--${n}`);

/** The Toronto calendar date of an instant, and the UTC instant of a Toronto wall-clock time that day. */
function torontoToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(now);
}
function torontoInstant(iso, hhmm) {
  // Try both offsets and keep the one that round-trips, so daylight saving needs no table.
  for (const off of ["-04:00", "-05:00"]) {
    const d = new Date(`${iso}T${hhmm}:00${off}`);
    const back = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Toronto", hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
    if (back === hhmm) return d;
  }
  throw new Error(`cannot place ${iso} ${hhmm} in Toronto time`);
}

async function main() {
  if (!process.env.DATABASE_URL_SOCIAL_RO) throw new Error("DATABASE_URL_SOCIAL_RO is not set");
  // The certificate is verified against Supabase's published CA (public, committed beside this script).
  const ca = fs.readFileSync(path.join(__dirname, "certs", "supabase-prod-ca-2021.crt"), "utf8");
  const client = new Client({ connectionString: process.env.DATABASE_URL_SOCIAL_RO, ssl: { ca, rejectUnauthorized: true } });
  await client.connect();
  try {
    const now = new Date();
    const today = torontoToday(now);
    const dayStart = torontoInstant(today, "00:00");

    const counts = await client.query(
      "select province, count(*)::int n, max(created_at) last from savings_live where created_at >= $1 group by province",
      [dayStart]
    );
    const perProvince = Object.fromEntries(counts.rows.map((r) => [r.province, r.n]));
    const lastCreatedAt = counts.rows.reduce((m, r) => (!m || r.last > m ? r.last : m), null);

    if (has("settled")) {
      const deadline = torontoInstant(today, arg("deadline") || "12:30");
      const r = evaluateSettled({ perProvince, lastCreatedAt, now, deadline });
      console.log(JSON.stringify({ ...r, today, perProvince, lastCreatedAt }));
      process.exit(r.ready ? 0 : 3);
    }

    const out = arg("snapshot");
    if (out) {
      const rows = await client.query(
        `select s.*, rp.regular from savings_live s
           left join regular_prices rp on rp.product_id = s.product_id and rp.province = s.province
          where s.valid_until >= $1`,
        [today]
      );
      fs.writeFileSync(out, JSON.stringify({ today, rows: rows.rows, perProvince, lastCreatedAt }, null, 1));
      console.log(`snapshot: ${rows.rows.length} rows -> ${out}`);
      return;
    }
    console.error("usage: query.js --settled [--deadline=HH:MM] | --snapshot=<file>");
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
module.exports = { torontoToday, torontoInstant };
