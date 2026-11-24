const test = require("node:test");
const assert = require("node:assert");
const { parseReport, problems } = require("./reelCheck");

const GOOD = `  Duration: 00:00:07.50, start: 0.000000, bitrate: 3566 kb/s
  Stream #0:0[0x1](und): Video: h264 (High), yuv420p, 1080x1920
  Stream #0:1[0x2](und): Audio: aac (LC), 44100 Hz, stereo
[Parsed_volumedetect_0 @ 0x1] mean_volume: -19.0 dB
[Parsed_volumedetect_0 @ 0x1] max_volume: -5.8 dB`;
const COVER = { width: 1080, height: 1920 };

test("a reel with music at a normal level and a cover has no problem", () => {
  assert.deepStrictEqual(problems({ report: GOOD, coverSize: COVER }), []);
  assert.deepStrictEqual(parseReport(GOOD), { hasVideo: true, hasAudio: true, meanDb: -19, seconds: 7.5 });
});

test("a reel with no audio stream is refused: the music was never mixed in", () => {
  const silent = GOOD.replace(/.*Audio:.*\n/, "").replace(/.*mean_volume.*\n/, "");
  assert.match(problems({ report: silent, coverSize: COVER }).join(), /NO AUDIO STREAM/);
});

test("a silent or near-silent track, and a clipping-loud one, are refused", () => {
  assert.match(problems({ report: GOOD.replace("-19.0", "-inf"), coverSize: COVER }).join(), /silent/);
  assert.match(problems({ report: GOOD.replace("-19.0", "-52.3"), coverSize: COVER }).join(), /silent/);
  assert.match(problems({ report: GOOD.replace("-19.0", "-4.0"), coverSize: COVER }).join(), /too loud/);
});

test("a reel without a cover, or with a wrong-size cover, is refused", () => {
  assert.match(problems({ report: GOOD, coverSize: null }).join(), /NO COVER/);
  assert.match(problems({ report: GOOD, coverSize: { width: 800, height: 800 } }).join(), /need 1080x1920/);
});
