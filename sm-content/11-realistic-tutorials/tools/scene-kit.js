// scene-kit.js — shared pieces for tutorial scenes (video 02 onward). Loaded with a plain <script> tag.
// Everything is deterministic: a frame depends only on t, so tools/short.mjs can render any frame alone.
(function () {
  const K = (window.KIT = {});
  const $ = (K.$ = (id) => document.getElementById(id));

  K.rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909), (s ^= s >>> 16) >>> 0) / 4294967296); };
  K.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  K.lin = (t, a, b) => K.clamp((t - a) / (b - a));
  K.eo = (x) => 1 - Math.pow(1 - x, 3);
  K.eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  K.win = (t, a, b, fi = 0.25, fo = 0.25) => Math.min(K.lin(t, a, a + fi), 1 - K.lin(t, b - fo, b));

  // Plain matte surface: neutral warm grey, soft light from the upper left, a ±1.5-level dither so it never bands.
  K.drawSurface = (cv) => {
    const cx = cv.getContext("2d"), w = cv.width, h = cv.height, im = cx.createImageData(w, h), r = K.rng(31);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = (x - w * 0.38) / w, dy = (y - h * 0.36) / h, d = Math.sqrt(dx * dx * 1.3 + dy * dy);
      const k = 1.0 - 0.38 * Math.min(1, d * 1.25), n = (r() - 0.5) * 3, i = (y * w + x) * 4;
      im.data[i] = 168 * k + n; im.data[i + 1] = 162 * k + n; im.data[i + 2] = 154 * k + n; im.data[i + 3] = 255;
    }
    cx.putImageData(im, 0, 0);
    return cv.toDataURL("image/jpeg", 0.92);
  };

  let gcx, gim;
  K.grain = (f) => {
    if (!gcx) { const g = $("grain"); gcx = g.getContext("2d"); gim = gcx.createImageData(g.width, g.height); }
    const r = K.rng(1000 + f);
    for (let i = 0; i < gim.data.length; i += 4) { const v = r() * 255; gim.data[i] = gim.data[i + 1] = gim.data[i + 2] = v; gim.data[i + 3] = 255; }
    gcx.putImageData(gim, 0, 0);
  };

  // Handheld phone: slow push-in and a little drift. Returns the offsets so screen-space overlays can follow.
  K.camera = (t) => {
    const dx = 4.5 * Math.sin(t * 1.3) + 2.2 * Math.sin(t * 2.9 + 1), dy = 3.5 * Math.sin(t * 1.05 + 2) + 1.6 * Math.sin(t * 3.3);
    $("world").style.transform = `translate(${dx}px,${dy}px) rotate(${0.18 * Math.sin(t * 0.7)}deg) scale(${1 + 0.012 * t})`;
    return { dx, dy };
  };

  K.brackets = (x0, y0, x1, y1, op) => {
    const L = 64, W = 7;
    const set = (id, l, t, bt, br, bb, bl) => { const e = $(id); e.style.left = l + "px"; e.style.top = t + "px"; e.style.borderWidth = `${bt}px ${br}px ${bb}px ${bl}px`; e.style.opacity = op; };
    set("b0", x0, y0, W, 0, 0, W); set("b1", x1 - L, y0, W, W, 0, 0); set("b2", x0, y1 - L, 0, 0, W, W); set("b3", x1 - L, y1 - L, 0, W, W, 0);
  };

  K.heads = (t, list) => list.forEach(([id, a, b]) => {
    const v = K.win(t, a, b, 0.22, 0.18), e = $(id); e.style.opacity = v; e.style.transform = `translateY(${(1 - v) * -12}px)`;
  });

  K.outro = (t, t0) => {
    const v = K.eo(K.lin(t, t0 + 0.15, t0 + 0.6)); $("outro").style.opacity = v; $("outro").style.transform = `scale(${0.96 + 0.04 * v})`;
  };

  K.fontsReady = async (fams) => {
    await Promise.all(fams.map((f) => document.fonts.load(f)));
    for (const f of fams) if (!document.fonts.check(f)) throw new Error("font did not load: " + f);
  };
})();
