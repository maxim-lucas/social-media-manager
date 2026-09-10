// The type ramp. One copy, imported by every pack.
//
// Two findings are baked into the family names and neither is obvious:
//
//   1. fontconfig will not hand you Roboto's Black face by weight. Asking for
//      "Roboto" at 900 gets you Bold. The Black face has to be asked for by
//      name, as "Roboto Black".
//   2. librsvg substitutes a missing family SILENTLY — no warning, no error,
//      just a different frame. Every pack's verify.js therefore measures a
//      rendered probe against a deliberately nonexistent family rather than
//      trusting that the font resolved.
//
// All three are Apache-2.0 and are resolved through the SYSTEM font list, not
// from this repo. That is also why CI does not re-render: a runner's font
// versions will not match the build machine's byte for byte.

const DISPLAY = "Roboto Black";
const SANS = "Roboto";
const MONO = "Roboto Mono";

const TYPE = {
  micro: { family: MONO, size: 21, weight: 400, tracking: 5.5 },
  small: { family: MONO, size: 26, weight: 400, tracking: 1.5 },
  row: { family: MONO, size: 30, weight: 400, tracking: 0 },
  rowBold: { family: MONO, size: 30, weight: 500, tracking: 0 },

  kicker: { family: MONO, size: 24, weight: 500, tracking: 7 },

  hook: { family: DISPLAY, size: 92, weight: 900, tracking: -2.5, leading: 1.03 },
  hookSm: { family: DISPLAY, size: 74, weight: 900, tracking: -2, leading: 1.05 },
  hookXl: { family: DISPLAY, size: 118, weight: 900, tracking: -3.5, leading: 1.0 },

  sub: { family: SANS, size: 34, weight: 500, tracking: 0, leading: 1.4 },

  mark: { family: SANS, size: 30, weight: 700, tracking: 0.5 },
  handle: { family: MONO, size: 24, weight: 400, tracking: 3 },

  // The non-affiliation line. Small, but it is on the ART, not only in the
  // caption — the app's legal/MARKETING_CLAIMS.md names the failure mode
  // precisely: a claim clipped into a social card without its paired fine
  // print. A frame that names a retailer carries its disclaimer in the pixels,
  // so a screenshot cannot separate the two.
  fineprint: { family: SANS, size: 22, weight: 400, tracking: 0.2, leading: 1.3 },
};

const GRID = { unit: 12, margin: 96 };

module.exports = { DISPLAY, SANS, MONO, TYPE, GRID };
