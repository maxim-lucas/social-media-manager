/**
 * reelCheck.js: is a rendered reel fit to post? (Maxim, 2026-11-24: the Monday pack went out without its planned music
 * and cover; nothing had checked either.) Pure parsing of ffmpeg's report, so it is tested without ffmpeg.
 *
 * A reel needs: an audio stream (the approved track is mixed INTO the file; the Graph API cannot add Instagram's own audio),
 * audible music (mean volume above MIN_MEAN_DB; a silent or near-silent track is a render failure), and a cover JPEG.
 */
const MIN_MEAN_DB = -35;
const MAX_MEAN_DB = -8; // above this the track is clipping-loud (Monica disliked a loud one, 2026-11-04)

/** @param {string} report ffmpeg stderr from `-i reel.mp4 -af volumedetect -f null -` */
function parseReport(report) {
  const hasVideo = /Stream #\d+:\d+.*: Video:/.test(report);
  const hasAudio = /Stream #\d+:\d+.*: Audio:/.test(report);
  const mean = report.match(/mean_volume:\s*(-?[\d.]+|-inf)\s*dB/);
  const dur = report.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  return {
    hasVideo, hasAudio,
    meanDb: mean ? (mean[1] === "-inf" ? -Infinity : Number(mean[1])) : null,
    seconds: dur ? Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3]) : null,
  };
}

/** @returns {string[]} what is wrong (empty = fit to post) */
function problems({ report, coverSize }) {
  const r = parseReport(report);
  const out = [];
  if (!r.hasVideo) out.push("no video stream");
  if (!r.hasAudio) out.push("NO AUDIO STREAM: the music was not mixed in");
  else if (r.meanDb === null) out.push("audio level could not be measured");
  else if (r.meanDb < MIN_MEAN_DB) out.push(`music is silent or nearly (mean ${r.meanDb} dB, need above ${MIN_MEAN_DB})`);
  else if (r.meanDb > MAX_MEAN_DB) out.push(`music is too loud (mean ${r.meanDb} dB, need below ${MAX_MEAN_DB})`);
  if (r.seconds !== null && (r.seconds < 5 || r.seconds > 20)) out.push(`odd length ${r.seconds}s (a follower reel is about 7.5 s)`);
  if (!coverSize) out.push("NO COVER IMAGE (render it with follower-reel.js --cover)");
  else if (coverSize.width !== 1080 || coverSize.height !== 1920) out.push(`cover is ${coverSize.width}x${coverSize.height}, need 1080x1920`);
  return out;
}

module.exports = { parseReport, problems, MIN_MEAN_DB, MAX_MEAN_DB };
