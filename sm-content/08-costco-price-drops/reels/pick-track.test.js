const test = require("node:test");
const assert = require("node:assert");
const { pickTrack } = require("./pick-track");
const { candidateSpecs } = require("./make-candidates");

const A = { id: "a", file: "music/a.wav" }, B = { id: "b", file: "music/b.wav" }, C = { id: "c", file: "music/c.wav" };

test("an empty library gives null", () => {
  assert.strictEqual(pickTrack([], [], "2026-11-23"), null);
});
test("never the previous week's track", () => {
  assert.strictEqual(pickTrack([A, B], [{ week: "2026-11-16", trackId: "a" }], "2026-11-23").id, "b");
});
test("a single approved track used last week gives null (no-music copy)", () => {
  assert.strictEqual(pickTrack([A], [{ week: "2026-11-16", trackId: "a" }], "2026-11-23"), null);
});
test("least recently used goes first, unused before used", () => {
  const history = [{ week: "2026-11-02", trackId: "a" }, { week: "2026-11-09", trackId: "b" }, { week: "2026-11-16", trackId: "c" }];
  assert.strictEqual(pickTrack([A, B, C], history, "2026-11-23").id, "a");
  assert.strictEqual(pickTrack([A, B, C, { id: "d", file: "x" }], history, "2026-11-23").id, "d");
});
test("history of the same or a later week is ignored (re-running a week gives the same answer)", () => {
  const history = [{ week: "2026-11-16", trackId: "a" }, { week: "2026-11-23", trackId: "b" }];
  assert.strictEqual(pickTrack([A, B], history, "2026-11-23").id, "b");
});
test("candidate specs are unique and within a calm range", () => {
  const specs = candidateSpecs(12);
  assert.strictEqual(new Set(specs.map((s) => `${s.bpm}/${s.shift}`)).size, 12);
  assert.ok(specs.every((s) => s.bpm >= 90 && s.bpm <= 118));
});
