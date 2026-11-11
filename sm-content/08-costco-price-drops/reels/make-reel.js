// Animated Instagram reel (1080x1920, 30 fps) from a rendered price-drop carousel (Monica, 2026-11-04).
// Hook (photos pop in, "8 prices just dropped", claim total counts up) -> cover -> each item slide with a push
// transition, a "CLAIM $X BACK" stamp and a running total -> end card with a pulsing FOLLOW button.
// Usage: node make-reel.js <week json> <lang> <out.mp4>
// Frames are drawn deterministically (frame(t) in the page), screenshotted and piped into ffmpeg; the music is
// made by music.py with a whoosh on every cut.
const fs = require("fs"), path = require("path"), { spawn, execFileSync } = require("child_process");
const { chromium } = require("playwright");
const [weekFile, lang, out] = process.argv.slice(2);
const SC = path.join(__dirname, "../scenes");
const week = JSON.parse(fs.readFileSync(path.resolve(SC, weekFile), "utf8"));
const name = path.basename(weekFile, ".json");
const dir = path.join(__dirname, "../posts", name, lang);
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".png")).sort();
const items = week.carousels[0].items.map((s) => ({ sku: s, ...week.items[s] }));
const FPS = 30, HOOK = 2.4, COVER = 1.6, ITEM = 1.5, END = 3.0;
const total = Math.round(items.reduce((a, b) => a + b.off, 0) * 100) / 100;
const exp = items[0].exp;
const b64 = (p) => "data:image/" + (p.endsWith(".png") ? "png" : "jpeg") + ";base64," + fs.readFileSync(p).toString("base64");
const slides = files.map((f) => b64(path.join(dir, f)));
const photos = items.map((i) => b64(path.join(SC, ".cache", i.sku + ".jpg")));
const money = (n, dec) => lang === "fr"
  ? (dec ? n.toFixed(2).replace(".", ",") : String(Math.round(n))) + " $"
  : "$" + (dec ? n.toFixed(2) : String(Math.round(n)));
const fmt = (n) => money(n, Math.round(n * 100) % 100 !== 0);
const D = new Date(exp + "T12:00:00");
const dateTxt = lang === "fr" ? `dimanche ${D.getDate()} novembre` : `Sunday, Nov ${D.getDate()}`;
const T = {
  en: { q: "Shopped at Costco lately?", drop: `${items.length} PRICES JUST DROPPED`, upto: "Claim up to", back: "back",
        ends: `Ends ${dateTxt}`, of: (i, n) => `DROP ${i} OF ${n}`, tot: "Total back", claim: (x) => `CLAIM ${x} BACK`,
        follow: "FOLLOW", fsub: "for next week's Costco drops", handle: "@priceback.ca", swipe: "New drops every week" },
  fr: { q: "Vous avez magasiné chez Costco récemment ?", drop: `${items.length} PRIX VIENNENT DE BAISSER`, upto: "Réclamez jusqu'à", back: "",
        ends: `Jusqu'au ${dateTxt}`, of: (i, n) => `BAISSE ${i} SUR ${n}`, tot: "Total à récupérer", claim: (x) => `RÉCLAMEZ ${x}`,
        follow: "SUIVEZ", fsub: "pour les baisses Costco de la semaine prochaine", handle: "@priceback.ca", swipe: "Nouvelles baisses chaque semaine" },
}[lang];
// timeline: [start, slide index]
const segs = [[HOOK, 0]]; let t0 = HOOK + COVER;
items.forEach((_, i) => { segs.push([t0, i + 1]); t0 += ITEM; });
segs.push([t0, files.length - 1]); const DUR = t0 + END;
const cuts = segs.map((s) => s[0]);
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;overflow:hidden;font-family:"Helvetica Neue",Arial,sans-serif;background:#005DAA}
.abs{position:absolute}
#hook{left:0;top:0;width:1080px;height:1920px;background:radial-gradient(circle at 50% 45%,#0a72c8,#003f78 75%)}
#q{left:60px;right:60px;top:250px;text-align:center;color:#fff;font-weight:900;font-size:${lang === "fr" ? 70 : 84}px;line-height:1.05;letter-spacing:-1.5px}
.ph{width:250px;height:250px;border-radius:28px;background:#fff center/86% no-repeat;box-shadow:0 18px 40px rgba(0,0,0,.35)}
#drop{left:50px;right:50px;top:860px;text-align:center}
#drop span{display:inline-block;background:#FFF200;color:#E31837;font-weight:900;font-size:${lang === "fr" ? 70 : 92}px;letter-spacing:-2px;padding:10px 26px;line-height:1.05;box-shadow:0 12px 0 #E31837}
#cnt{left:40px;right:40px;top:1110px;text-align:center;color:#fff;font-weight:900;font-size:62px}
#cnt b{display:block;font-size:170px;color:#FFF200;letter-spacing:-4px;line-height:1.05}
#ends{left:40px;right:40px;top:1475px;text-align:center;color:#fff;font-weight:800;font-size:46px;opacity:.95}
#stage{left:0;top:0;width:1080px;height:1920px;background:#005DAA}
#top{left:0;top:0;width:1080px;height:300px;background:#005DAA}
#of{left:54px;top:150px;color:#fff;font-weight:900;font-size:44px;letter-spacing:3px}
#bar{left:54px;top:236px;width:972px;height:18px;border-radius:9px;background:rgba(255,255,255,.25)}
#bar i{display:block;height:100%;width:0;border-radius:9px;background:#FFF200}
#tot{right:54px;top:100px;text-align:right;color:#fff;font-weight:800;font-size:30px;letter-spacing:1px}
#tot b{display:block;color:#FFF200;font-size:60px;font-weight:900;letter-spacing:-1px}
.sl{left:54px;top:300px;width:972px;height:1215px;background:#fff center/100% no-repeat;box-shadow:0 20px 50px rgba(0,0,0,.35);border-radius:6px}
#bot{left:0;top:1515px;width:1080px;height:405px;background:#005DAA}
#handle{left:0;right:0;top:1560px;text-align:center;color:#fff;font-weight:900;font-size:52px}
#handle small{display:block;font-size:34px;font-weight:700;color:#FFF200;margin-top:6px}
#stamp{left:0;top:0;transform-origin:50% 50%;background:#E31837;color:#fff;font-weight:900;font-size:76px;padding:14px 30px;border:8px solid #fff;border-radius:16px;white-space:nowrap;box-shadow:0 16px 40px rgba(0,0,0,.4)}
#flash{left:0;top:0;width:1080px;height:1920px;background:#fff;pointer-events:none}
#fol{left:0;right:0;top:1560px;text-align:center}
#fol .btn{display:inline-block;background:#E31837;color:#fff;font-weight:900;font-size:62px;padding:16px 54px;border-radius:70px;border:6px solid #fff;letter-spacing:2px;box-shadow:0 14px 34px rgba(0,0,0,.35)}
#fol .sub{color:#fff;font-weight:800;font-size:${lang === "fr" ? 32 : 38}px;margin-top:18px}
#hand{font-size:110px;left:920px;top:1700px;font-family:"Noto Color Emoji"}
</style></head><body>
<div id="stage" class="abs">
  <div id="top" class="abs"><div id="of" class="abs"></div><div id="bar" class="abs"><i></i></div><div id="tot" class="abs">${T.tot}<b>0</b></div></div>
  ${slides.map((s, i) => `<div class="abs sl" id="s${i}" style="background-image:url('${s}')"></div>`).join("")}
  <div id="bot" class="abs"></div>
  <div id="handle" class="abs">${T.handle}<small>${T.swipe}</small></div>
  <div id="fol" class="abs"><div class="btn">${T.follow} ${T.handle}</div><div class="sub">${T.fsub}</div></div>
  <div id="hand" class="abs">👆</div>
  <div id="stamp" class="abs"></div>
</div>
<div id="hook" class="abs">
  <div id="q" class="abs">${T.q}</div>
  ${photos.map((p, i) => `<div class="abs ph" id="p${i}" style="background-image:url('${p}')"></div>`).join("")}
  <div id="drop" class="abs"><span>${T.drop}</span></div>
  <div id="cnt" class="abs">${T.upto}<b>0</b>${T.back}</div>
  <div id="ends" class="abs">${T.ends}</div>
</div>
<div id="flash" class="abs"></div>
<script>
const HOOK=${HOOK}, COVER=${COVER}, ITEM=${ITEM}, DUR=${DUR}, segs=${JSON.stringify(segs)}, offs=${JSON.stringify(items.map((i) => i.off))};
const TOTAL=${total}, LANG="${lang}", N=offs.length, NS=${slides.length};
const C=${JSON.stringify({ of: items.map((_, i) => T.of(i + 1, items.length)), claim: items.map((i) => T.claim(fmt(i.off))) })};
const $=(id)=>document.getElementById(id);
const cl=(x)=>Math.max(0,Math.min(1,x));
const eo=(x)=>1-Math.pow(1-cl(x),3);
const back=(x)=>{x=cl(x);const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const money=(n)=>{const d=Math.round(n*100)%100!==0;return LANG==="fr"?(d?n.toFixed(2).replace(".",","):Math.round(n))+" $":"$"+(d?n.toFixed(2):Math.round(n))};
const pos=[[60,470],[415,430],[770,470],[60,1530],[415,1570],[770,1530],[240,1790],[590,1790]];
window.frame=(t)=>{
  // hook
  const h=$("hook"); const out=eo((t-(HOOK-0.25))/0.25);
  h.style.opacity=String(1-out); h.style.transform="scale("+(1+0.15*out)+")";
  const q=eo(t/0.35); $("q").style.transform="scale("+(1.6-0.6*back(t/0.4))+")"; $("q").style.opacity=String(q);
  for(let i=0;i<N;i++){const p=$("p"+i); if(!p) continue; const k=back((t-0.35-i*0.07)/0.35); const [x,y]=pos[i%pos.length];
    p.style.left=x+"px"; p.style.top=y+"px"; p.style.opacity=String(cl((t-0.35-i*0.07)/0.1));
    p.style.transform="scale("+k+") rotate("+((i%2?6:-6)*(1-k)+(i%2?3:-3))+"deg)";}
  const d=back((t-1.0)/0.3); $("drop").style.transform="scale("+(2.2-1.2*d)+") rotate(-2deg)"; $("drop").style.opacity=String(cl((t-1.0)/0.08));
  const c=eo((t-1.1)/0.75); $("cnt").style.opacity=String(cl((t-1.1)/0.15)); $("cnt").querySelector("b").textContent=money(Math.round(TOTAL*c*100)/100);
  $("ends").style.opacity=String(cl((t-1.7)/0.2));
  // segments
  let cur=0; for(let i=0;i<segs.length;i++) if(t>=segs[i][0]) cur=i;
  for(let s=0;s<NS;s++){$("s"+s).style.display="none";}
  const [st,idx]=segs[cur]; const lt=t-st; const tr=eo(lt/0.28);
  const el=$("s"+idx); el.style.display="block";
  const zoom=1+0.035*cl(lt/ (cur===segs.length-1?3:1.5));
  if(cur===0){ el.style.transform="translateY("+(900*(1-tr))+"px) scale("+zoom+")"; }
  else { el.style.transform="translateX("+(1080*(1-tr))+"px) scale("+zoom+")";
    const prev=$("s"+segs[cur-1][1]); if(tr<1){prev.style.display="block"; prev.style.transform="translateX("+(-1080*tr)+"px) scale(1.035)";}}
  // top band: progress + running total
  const itemIdx=cur-1; // 0..N-1 for items
  const shown = itemIdx>=0 && itemIdx<N;
  $("of").textContent = shown ? C.of[itemIdx] : (cur===0 ? "" : "");
  const done = Math.max(0, Math.min(N, itemIdx + (shown ? eo((lt-0.35)/0.4) : (cur===segs.length-1?1:0))));
  $("bar").firstElementChild.style.width=(100*Math.min(1,(cur===segs.length-1?N:Math.max(0,itemIdx+ (shown?eo((lt-0.35)/0.4):0)))/N))+"%";
  let run=0; for(let i=0;i<N;i++){ if(i<itemIdx || cur===segs.length-1) run+=offs[i]; else if(i===itemIdx) run+=offs[i]*eo((lt-0.35)/0.4); }
  $("tot").querySelector("b").textContent=money(Math.round(run*100)/100);
  $("of").style.opacity = String(cur===0||cur===segs.length-1?0:1); $("bar").style.opacity=String(cur===0?0:1); $("tot").style.opacity=String(cur===0?0:1);
  // stamp on item slides
  const sp=$("stamp");
  if(shown){ const k=back((lt-0.3)/0.25); sp.style.display="block"; sp.textContent=C.claim[itemIdx];
    sp.style.opacity=String(cl((lt-0.3)/0.06)*(1-cl((lt-(ITEM-0.12))/0.1)));
    const w=sp.offsetWidth; sp.style.left=(540-w/2)+"px"; sp.style.top="1580px";
    sp.style.transform="scale("+(2.4-1.4*k)+") rotate(-4deg)"; } else sp.style.display="none";
  // bottom: handle vs follow CTA
  const end = cur===segs.length-1;
  $("handle").style.display=end?"none":"block"; $("handle").style.opacity=String(shown?0.0:1);
  const fo=$("fol"); fo.style.display=end?"block":"none";
  if(end){ const k=back((lt-0.2)/0.35); const pulse=1+0.06*Math.max(0,Math.sin((lt-0.6)*Math.PI*2.2)); fo.style.transform="scale("+(k*pulse)+")"; fo.style.opacity=String(cl((lt-0.2)/0.1)); }
  const hd=$("hand"); hd.style.display=end&&lt>0.9?"block":"none"; if(end){ const tap=Math.abs(Math.sin((lt-0.9)*Math.PI*1.1)); hd.style.transform="translate("+(-20*tap)+"px,"+(-30*tap)+"px)"; }
  // white flash on the hook->cover cut and the beat drop
  const f1=1-cl(Math.abs(t-1.0)/0.08), f2=1-cl(Math.abs(t-HOOK)/0.1); $("flash").style.opacity=String(Math.max(f1*0.5,f2*0.6));
};
</script></body></html>`;
(async () => {
  const tmp = fs.mkdtempSync("/tmp/reel-");
  fs.writeFileSync(path.join(tmp, "r.html"), html);
  const wav = path.join(tmp, "m.wav");
  execFileSync("python3", [path.join(__dirname, "music.py"), String(DUR), wav, cuts.join(",")]);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto("file://" + path.join(tmp, "r.html")); await p.waitForTimeout(500);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-i", wav,
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
  const n = Math.round(DUR * FPS);
  for (let i = 0; i < n; i++) {
    await p.evaluate((t) => window.frame(t), i / FPS);
    const buf = await p.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (process.env.STILLS && STILLS_AT(i)) fs.writeFileSync(`${process.env.STILLS}/f${String(i).padStart(4, "0")}.jpg`, buf);
  }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r)); await b.close();
  console.log("ok", out, DUR.toFixed(1) + "s", n, "frames");
})();
function STILLS_AT(i) { return [15, 40, 60, 80, 95, 110, 130, 150, 170, 380, 500, 540, 560].includes(i); }
