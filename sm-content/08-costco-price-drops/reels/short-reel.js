// 7-second looping follower reel (Monica, 2026-11-04, from Instagram's feedback): hook -> "N PRICES JUST DROPPED"
// + claim total -> the 3 biggest drops with CLAIM stickers (slides cropped above their red footer) -> FOLLOW.
// Usage: node short-reel.js <config json> <en|fr> <out.mp4> [--silent]
const fs = require("fs"), path = require("path"), { spawn, execFileSync } = require("child_process");
const { chromium } = require("playwright");
const [cfgFile, lang, out, flag] = process.argv.slice(2);
const cfg = JSON.parse(fs.readFileSync(path.resolve(__dirname, cfgFile), "utf8"));
const SC = path.join(__dirname, "../scenes"), POSTS = path.join(__dirname, "../posts");
let all = [];
for (const w of cfg.weeks) {
  const d = JSON.parse(fs.readFileSync(path.join(SC, "weeks", w + ".json"), "utf8"));
  const files = fs.readdirSync(path.join(POSTS, w, lang));
  for (const s of d.carousels[0].items) all.push({ sku: s, week: w, biz: !!d.businessCentre, ...d.items[s], slide: path.join(POSTS, w, lang, files.find((f) => f.endsWith("-" + s + ".png"))) });
}
const N = all.length, TOTAL = Math.round(all.reduce((a, b) => a + b.off, 0) * 100) / 100, exp = all[0].exp;
const brands = new Set();
const top = all.filter((i) => !i.biz && !(cfg.rawMeat || []).includes(i.sku)).sort((a, b) => b.off - a.off)
  .filter((i) => { const b = i.tag.en[0].toLowerCase(); if (brands.has(b)) return false; brands.add(b); return true; }).slice(0, cfg.top || 3);
// hook photos: the 3 heroes first, then the biggest of the rest
const pics = [...top, ...all.filter((i) => !top.includes(i) && !(cfg.rawMeat || []).includes(i.sku)).sort((a, b) => b.off - a.off)].slice(0, 8);
const b64 = (p) => "data:image/" + (p.endsWith(".png") ? "png" : p.endsWith(".svg") ? "svg+xml" : "jpeg") + ";base64," + fs.readFileSync(p).toString("base64");
const money = (n) => { const d = Math.round(n * 100) % 100 !== 0; return lang === "fr" ? (d ? n.toFixed(2).replace(".", ",") : Math.round(n)) + " $" : "$" + (d ? n.toFixed(2) : Math.round(n)); };
const D = new Date(exp + "T12:00:00");
const T = {
  en: { q: "Shopped at Costco lately?", drop: `${N} PRICES JUST DROPPED`, upto: "Claim up to", back: "back", ifb: "if you bought them", e1: "🔔 DON'T MISS", e2: "NEXT WEEK'S<br>COSTCO DROPS", more: "+ hundreds more hidden savings<br>only in the PriceBack app", ends: `Ends Sunday, Nov ${D.getDate()}`,
        rank: (i) => ["BIGGEST DROP", "#2 DROP", "#3 DROP"][i], claim: (x) => `CLAIM ${money(x)} BACK`, follow: "FOLLOW", handle: "@priceback.ca", fsub: "for next week's drops" },
  fr: { q: "Vous avez magasiné chez Costco récemment ?", drop: `${N} PRIX VIENNENT DE BAISSER`, upto: "Réclamez jusqu'à", back: "", ifb: "si vous les avez achetés", e1: "🔔 NE MANQUEZ PAS", e2: "LES BAISSES COSTCO<br>DE LA SEMAINE PROCHAINE", more: "+ des centaines de rabais cachés<br>exclusivement dans l'app PriceBack", ends: `Jusqu'au dimanche ${D.getDate()} novembre`,
        rank: (i) => ["PLUS GROSSE BAISSE", "BAISSE N° 2", "BAISSE N° 3"][i], claim: (x) => `RÉCLAMEZ ${money(x)}`, follow: "SUIVEZ", handle: "@priceback.ca", fsub: "pour les baisses de la semaine prochaine" },
}[lang];
const FPS = 30, DUR = 7.5, A = 1.0, B = 2.5, C = 6.0, PER = (C - B) / top.length;
const cuts = [B, ...top.map((_, i) => B + i * PER).slice(1), C];
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;overflow:hidden;font-family:"Helvetica Neue",Arial,sans-serif;background:radial-gradient(circle at 50% 45%,#0a72c8,#003f78 75%)}
.abs{position:absolute}
#q{left:50px;right:50px;top:250px;text-align:center;color:#fff;font-weight:900;font-size:${lang === "fr" ? 72 : 90}px;line-height:1.05;letter-spacing:-1.5px}
.ph{width:250px;height:250px;border-radius:28px;background:#fff center/86% no-repeat;box-shadow:0 18px 40px rgba(0,0,0,.35)}
#drop{left:40px;right:40px;top:840px;text-align:center}
#drop span{display:inline-block;background:#FFF200;color:#E31837;font-weight:900;font-size:${lang === "fr" ? 72 : 96}px;letter-spacing:-2px;padding:10px 26px;line-height:1.05;box-shadow:0 12px 0 #E31837}
#cnt{left:40px;right:40px;top:1100px;text-align:center;color:#fff;font-weight:900;font-size:62px}
#cnt b{display:block;font-size:180px;color:#FFF200;letter-spacing:-4px;line-height:1.05}
#cnt i{display:block;font-style:normal;color:#FFF200;font-size:44px;font-weight:800;margin-top:6px}
#ends{left:40px;right:40px;top:1545px;text-align:center;color:#fff;font-weight:800;font-size:46px}
#rank{left:0;right:0;top:150px;text-align:center}
#rank span{display:inline-block;background:#FFF200;color:#E31837;font-weight:900;font-size:64px;padding:8px 26px;letter-spacing:1px}
.sl{left:54px;top:300px;width:972px;height:1062px;background:#fff top/100% auto no-repeat;box-shadow:0 20px 50px rgba(0,0,0,.35);border-radius:8px;overflow:hidden}
#stamp{left:0;top:1440px;background:#E31837;color:#fff;font-weight:900;font-size:92px;padding:16px 36px;border:8px solid #fff;border-radius:18px;white-space:nowrap;box-shadow:0 16px 40px rgba(0,0,0,.4)}
#e1{left:0;right:0;top:250px;text-align:center}
#e1 span{display:inline-block;background:#FFF200;color:#E31837;font-weight:900;font-size:64px;padding:8px 28px;font-family:"Helvetica Neue",Arial,"Noto Color Emoji",sans-serif}
#e2{left:30px;right:30px;top:370px;text-align:center;color:#fff;font-weight:900;font-size:${lang === "fr" ? 84 : 116}px;line-height:1.02;letter-spacing:-2px}
#fol{left:0;right:0;top:700px;text-align:center}
#e3{left:30px;right:30px;top:1120px;text-align:center;color:#FFF200;font-weight:900;font-size:${lang === "fr" ? 46 : 52}px;line-height:1.2}
#e4{left:140px;right:140px;top:1310px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:26px 30px}
#e4 .mk{width:120px;height:120px;border-radius:26px}
#e4 b{color:#fff;font-size:70px;font-weight:900}
#e4 .br{flex-basis:100%;height:0}
#e4 .bd{height:104px}
#e4 .bd+.bd{height:122px;margin:-9px}
#fol .btn{display:inline-block;background:#E31837;color:#fff;font-weight:900;font-size:130px;padding:24px 80px;border-radius:90px;border:8px solid #fff;letter-spacing:2px;box-shadow:0 14px 34px rgba(0,0,0,.35);line-height:1.05}
#fol .btn small{display:block;font-size:80px;letter-spacing:0}
#fol .sub{color:#FFF200;font-weight:900;font-size:${lang === "fr" ? 44 : 54}px;margin-top:34px}
#hand{font-size:150px;left:870px;top:990px;font-family:"Noto Color Emoji"}
#flash{left:0;top:0;width:1080px;height:1920px;background:#fff}
</style></head><body>
<div id="hookL" class="abs" style="left:0;top:0;width:1080px;height:1920px">
  <div id="q" class="abs">${T.q}</div>
  ${pics.map((p, i) => `<div class="abs ph" id="p${i}" style="background-image:url('${b64(path.join(SC, ".cache", p.sku + ".jpg"))}')"></div>`).join("")}
  <div id="drop" class="abs"><span>${T.drop}</span></div>
  <div id="cnt" class="abs">${T.upto}<b>0</b>${T.back}<i>${T.ifb}</i></div>
  <div id="ends" class="abs">${T.ends}</div>
</div>
<div id="rank" class="abs"><span></span></div>
${top.map((t, i) => `<div class="abs sl" id="s${i}" style="background-image:url('${b64(t.slide)}')"></div>`).join("")}
<div id="stamp" class="abs"></div>
<div id="endL" class="abs" style="left:0;top:0;width:1080px;height:1920px">
  <div id="e1" class="abs"><span>${T.e1}</span></div>
  <div id="e2" class="abs">${T.e2}</div>
  <div id="fol" class="abs"><div class="btn">${T.follow}<small>${T.handle}</small></div></div>
  <div id="e3" class="abs">${T.more}</div>
  <div id="e4" class="abs"><img class="mk" src="${b64(path.join(SC, "mark.png"))}"><b>PriceBack</b><i class="br"></i><img class="bd" src="${b64(path.join(__dirname, "../../06-launch/badges/app-store-en.svg").replace(/x$/, "x"))}"><img class="bd" src="${b64(path.join(__dirname, "../../06-launch/badges/google-play-" + lang + ".png"))}"></div>
</div>
<div id="hand" class="abs">👆</div>
<div id="flash" class="abs"></div>
<script>
const A=${A},B=${B},C=${C},PER=${PER},TOTAL=${TOTAL},LANG="${lang}",NT=${top.length},NP=${pics.length};
const RANK=${JSON.stringify(top.map((_, i) => T.rank(i)))}, CLAIM=${JSON.stringify(top.map((t) => T.claim(t.off)))};
const $=(id)=>document.getElementById(id), cl=(x)=>Math.max(0,Math.min(1,x)), eo=(x)=>1-Math.pow(1-cl(x),3);
const back=(x)=>{x=cl(x);const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const money=(n)=>{const d=Math.round(n*100)%100!==0;return LANG==="fr"?(d?n.toFixed(2).replace(".",","):Math.round(n))+" $":"$"+(d?n.toFixed(2):Math.round(n))};
const pos=[[60,470],[415,430],[770,470],[60,1560],[415,1600],[770,1560],[240,1800],[590,1800]];
window.frame=(t)=>{
  const hook=t<B; $("hookL").style.display=hook?"block":"none";
  if(hook){
    $("q").style.transform="scale("+(1.25-0.25*back(t/0.3))+")"; $("q").style.opacity="1";
    for(let i=0;i<NP;i++){const p=$("p"+i),k=back((t-0.15-i*0.06)/0.3),[x,y]=pos[i];p.style.left=x+"px";p.style.top=y+"px";
      p.style.opacity=String(cl((t-0.15-i*0.06)/0.08));p.style.transform="scale("+k+") rotate("+((i%2?6:-6)*(1-k)+(i%2?3:-3))+"deg)";}
    const d=back((t-A)/0.28); $("drop").style.opacity=String(cl((t-A)/0.06)); $("drop").style.transform="scale("+(2.2-1.2*d)+") rotate(-2deg)";
    $("cnt").style.opacity=String(cl((t-A-0.1)/0.12)); $("cnt").querySelector("b").textContent=money(Math.round(TOTAL*eo((t-A-0.1)/0.8)*100)/100);
    $("ends").style.opacity=String(cl((t-1.6)/0.15));
  }
  const inItems=t>=B&&t<C; const k=Math.min(NT-1,Math.floor((t-B)/PER)), lt=t-B-k*PER;
  for(let i=0;i<NT;i++) $("s"+i).style.display="none";
  $("rank").style.display=inItems?"block":"none"; $("stamp").style.display=inItems?"block":"none";
  if(inItems){
    const el=$("s"+k); el.style.display="block"; const tr=eo(lt/0.22);
    el.style.transform="translateX("+(1080*(1-tr))+"px) scale("+(1+0.03*cl(lt/PER))+")";
    if(k>0&&tr<1){const pv=$("s"+(k-1));pv.style.display="block";pv.style.transform="translateX("+(-1080*tr)+"px) scale(1.03)";}
    $("rank").firstElementChild.textContent=RANK[k]; $("rank").style.transform="scale("+(0.6+0.4*back(lt/0.25))+")";
    const sp=$("stamp"); sp.textContent=CLAIM[k]; const w=sp.offsetWidth; sp.style.left=(540-w/2)+"px";
    const s=back((lt-0.18)/0.22); sp.style.opacity=String(cl((lt-0.18)/0.05)); sp.style.transform="scale("+(2.3-1.3*s)+") rotate(-4deg)";
  }
  const end=t>=C, lt2=t-C; $("endL").style.display=end?"block":"none"; $("hand").style.display=end?"block":"none";
  if(end){ $("e1").style.transform="scale("+(0.3+0.7*back(lt2/0.25))+") rotate(-3deg)"; $("e2").style.opacity=String(cl((lt2-0.08)/0.12)); $("e2").style.transform="translateY("+(40*(1-eo((lt2-0.08)/0.25)))+"px)";
    $("e3").style.opacity=String(cl((lt2-0.45)/0.15)); $("e4").style.opacity=String(cl((lt2-0.6)/0.15)); $("e4").style.transform="translateY("+(30*(1-eo((lt2-0.6)/0.25)))+"px)"; }
  if(end){ const s=back((lt2-0.2)/0.3), pulse=1+0.05*Math.max(0,Math.sin((lt2-0.35)*Math.PI*3)); $("fol").style.transform="scale("+(s*pulse)+")";
    const tap=Math.abs(Math.sin((lt2-0.3)*Math.PI*2)); $("hand").style.opacity=String(cl((lt2-0.3)/0.1)); $("hand").style.transform="translate("+(-18*tap)+"px,"+(-26*tap)+"px)"; }
  const f=Math.max(1-cl(Math.abs(t-A)/0.07), 1-cl(Math.abs(t-B)/0.08), 1-cl(Math.abs(t-C)/0.08)); $("flash").style.opacity=String(f*0.45);
};
</script></body></html>`;
(async () => {
  const tmp = fs.mkdtempSync("/tmp/sreel-"); fs.writeFileSync(path.join(tmp, "r.html"), html);
  const wav = path.join(tmp, "m.wav");
  if (flag !== "--silent") execFileSync("python3", [path.join(__dirname, "music_pop.py"), String(DUR), wav, cuts.join(",")]);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto("file://" + path.join(tmp, "r.html")); await p.waitForTimeout(400);
  const args = ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-"];
  if (flag !== "--silent") args.push("-i", wav, "-c:a", "aac", "-b:a", "160k", "-shortest");
  args.push("-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart", out);
  const ff = spawn("ffmpeg", args, { stdio: ["pipe", "inherit", "inherit"] });
  const n = Math.round(DUR * FPS);
  for (let i = 0; i < n; i++) {
    await p.evaluate((t) => window.frame(t), i / FPS);
    const buf = await p.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (process.env.STILLS && i % 15 === 0) fs.writeFileSync(`${process.env.STILLS}/f${String(i).padStart(4, "0")}.jpg`, buf);
  }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r)); await b.close();
  console.log("ok", out, "top:", top.map((t) => t.sku + " -" + t.off).join(", "), "| hook:", N, "drops,", TOTAL);
})();
