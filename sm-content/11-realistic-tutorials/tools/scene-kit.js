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

  // Channel glyphs for the end band: simple shapes in each platform's colour, no trademark artwork.
  const GLYPH = {
    Instagram: '<svg viewBox="0 0 64 64"><defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f9a43a"/><stop offset=".5" stop-color="#e1306c"/><stop offset="1" stop-color="#7b3fe4"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#ig)"/><rect x="14" y="14" width="36" height="36" rx="11" fill="none" stroke="#fff" stroke-width="4.5"/><circle cx="32" cy="32" r="8.5" fill="none" stroke="#fff" stroke-width="4.5"/><circle cx="43" cy="21" r="2.6" fill="#fff"/></svg>',
    Facebook: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#1877f2"/><path d="M35 52V35h6l1-7h-7v-4c0-2 .7-3.4 3.6-3.4H42v-6.2c-.7-.1-3-.3-5.6-.3-5.6 0-9.4 3.4-9.4 9.6V28h-6v7h6v17z" fill="#fff"/></svg>',
    TikTok: '<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#111"/><path d="M36 14h6c.5 4.6 3.6 7.8 8 8.2v6.2c-3 0-5.7-.9-8-2.5V39a11 11 0 1 1-11-11c.7 0 1.4.1 2 .2v6.4a5 5 0 1 0 3 4.6z" fill="#25f4ee" transform="translate(-1.5 -1.5)"/><path d="M36 14h6c.5 4.6 3.6 7.8 8 8.2v6.2c-3 0-5.7-.9-8-2.5V39a11 11 0 1 1-11-11c.7 0 1.4.1 2 .2v6.4a5 5 0 1 0 3 4.6z" fill="#fe2c55" transform="translate(1.5 1.5)"/><path d="M36 14h6c.5 4.6 3.6 7.8 8 8.2v6.2c-3 0-5.7-.9-8-2.5V39a11 11 0 1 1-11-11c.7 0 1.4.1 2 .2v6.4a5 5 0 1 0 3 4.6z" fill="#fff"/></svg>',
    YouTube: '<svg viewBox="0 0 64 64"><rect y="10" width="64" height="44" rx="13" fill="#ff0000"/><path d="M26 22l17 10-17 10z" fill="#fff"/></svg>',
  };
  K.outroInit = () => {
    document.querySelectorAll("#outro .handles > div").forEach((d) => {
      if (d.querySelector("svg")) return;
      const b = d.querySelector("b"), sp = d.querySelector("span");
      d.innerHTML = (GLYPH[b.textContent.trim()] || "") + `<p>${b.outerHTML}${sp.outerHTML}</p>`;
    });
  };
  let outroReady = false;
  K.outro = (t, t0) => {
    if (!outroReady) { K.outroInit(); outroReady = true; }
    const v = K.eo(K.lin(t, t0 + 0.1, t0 + 0.6)); $("outro").style.opacity = Math.min(1, v * 1.6); $("outro").style.transform = `translateY(${(1 - v) * 420}px)`;
    const f = $("fine"); if (f) f.classList.toggle("band", v > 0.6);
  };

  // Thermal-paper texture tile (data URL) and a zigzag cut edge for a receipt's ends.
  K.paperTile = () => {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const cx = c.getContext("2d"), im = cx.createImageData(256, 256), r = K.rng(77);
    for (let i = 0; i < 256 * 256; i++) { const v = 238 + (r() - 0.5) * 18; im.data[i * 4] = v + 4; im.data[i * 4 + 1] = v + 2; im.data[i * 4 + 2] = v - 2; im.data[i * 4 + 3] = 255; }
    cx.putImageData(im, 0, 0); return c.toDataURL();
  };
  K.zig = (top, bottom, w, h, teeth = 46, d = 5) => {
    const pts = [];
    if (top) for (let i = 0; i <= teeth; i++) pts.push(`${(i / teeth) * w}px ${i % 2 ? d : 0}px`); else pts.push(`0px 0px`, `${w}px 0px`);
    if (bottom) for (let i = teeth; i >= 0; i--) pts.push(`${(i / teeth) * w}px ${h - (i % 2 ? d : 0)}px`); else pts.push(`${w}px ${h}px`, `0px ${h}px`);
    return `polygon(${pts.join(",")})`;
  };

  K.fontsReady = async (fams) => {
    await Promise.all(fams.map((f) => document.fonts.load(f)));
    for (const f of fams) if (!document.fonts.check(f)) throw new Error("font did not load: " + f);
  };
})();
