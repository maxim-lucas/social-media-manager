// 7.5-second looping follower reel, v4 (Monica, 2026-11-04 18:10). Replaces short-reel.js.
// Two modes, picked by "mode" in the config:
//   "basket" (category reel, e.g. grocery): the hook names the category, then 8 products drop into a cart one by
//            one while the claim counter climbs, then "+N more" takes it to the full total. Sells the total, not
//            one small saving.
//   "top3"   (whole-week reel): the 3 biggest drops of the week, slides cropped above their red footer with a big
//            CLAIM sticker.
// Layout rule: text and product photos live in separate zones; nothing is ever written over a photo. The end date
// is its own "ENDS | SUN NOV 8" ticket. End card: app name once, as "ONLY in [logo] PriceBack"; HIDDEN revealed.
// Usage: node follower-reel.js <config json> <en|fr> <out.mp4> [--silent | --stills t1,t2,...]
const fs = require("fs"), path = require("path"), { spawn, execFileSync } = require("child_process");
const { chromium } = require("playwright");
const [cfgFile, lang, out, flag, stillsAt] = process.argv.slice(2);
const cfg = JSON.parse(fs.readFileSync(path.resolve(__dirname, cfgFile), "utf8"));
const SC = path.join(__dirname, "../scenes"), POSTS = path.join(__dirname, "../posts");
const MODE = cfg.mode || "top3", skip = new Set(cfg.rawMeat || []);
let all = [];
for (const w of cfg.weeks) {
  const d = JSON.parse(fs.readFileSync(path.join(SC, "weeks", w + ".json"), "utf8"));
  if (d.businessCentre) continue; // reels are warehouse only
  const files = fs.readdirSync(path.join(POSTS, w, lang));
  for (const c of d.carousels) for (const s of c.items)
    all.push({ sku: s, week: w, ...d.items[s], slide: path.join(POSTS, w, lang, files.find((f) => f.endsWith("-" + s + ".png"))) });
}
const N = all.length, TOTAL = Math.round(all.reduce((a, b) => a + b.off, 0) * 100) / 100, exp = all[0].exp;
const brands = new Set();
const ranked = all.filter((i) => !skip.has(i.sku) && fs.existsSync(path.join(SC, ".cache", i.sku + ".jpg"))).sort((a, b) => b.off - a.off)
  .filter((i) => { const b = i.tag.en[0].toLowerCase(); if (brands.has(b)) return false; brands.add(b); return true; });
const top = ranked.slice(0, 3), pics = ranked.slice(0, 8);
const b64 = (p) => "data:image/" + (p.endsWith(".png") ? "png" : p.endsWith(".svg") ? "svg+xml" : "jpeg") + ";base64," + fs.readFileSync(p).toString("base64");
const money = (n) => { const d = Math.round(n * 100) % 100 !== 0; return lang === "fr" ? (d ? n.toFixed(2).replace(".", ",") : Math.round(n)) + " $" : "$" + (d ? n.toFixed(2) : Math.round(n)); };
const D = new Date(exp + "T12:00:00");
const MON = { en: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"], fr: ["JANV.", "FÉVR.", "MARS", "AVR.", "MAI", "JUIN", "JUIL.", "AOÛT", "SEPT.", "OCT.", "NOV.", "DÉC."] }[lang];
const DAY = { en: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], fr: ["DIM.", "LUN.", "MAR.", "MER.", "JEU.", "VEN.", "SAM."] }[lang];
const cat = cfg.category ? cfg.category[lang] : null;
const T = {
  en: { q: "Shopped at Costco<br>lately?", drop: cat ? `${N} ${cat} PRICES<br>JUST DROPPED` : `${N} COSTCO PRICES<br>JUST DROPPED`,
        upto: "Claim up to", back: "back", ifb: "if you bought them", more: (k) => `+ ${k} more drops`,
        ends: "ENDS", date: `${DAY[D.getDay()]} ${MON[D.getMonth()]} ${D.getDate()}`,
        e1: "🔔 DON'T MISS", e2: "NEXT WEEK'S<br>COSTCO DROPS", hid: "+ hundreds more<br><span class=\"hid\"><em>HIDDEN</em></span> savings", only: "ONLY in",
        rank: (i) => ["BIGGEST DROP", "#2 DROP", "#3 DROP"][i], claim: (x) => `CLAIM ${money(x)} BACK`, follow: "FOLLOW", handle: "@priceback.ca" },
  fr: { q: "Vous avez magasiné<br>chez Costco récemment ?", drop: cat ? `${N} PRIX ${cat}<br>VIENNENT DE BAISSER` : `${N} PRIX COSTCO<br>VIENNENT DE BAISSER`,
        upto: "Réclamez jusqu'à", back: "", ifb: "si vous les avez achetés", more: (k) => `+ ${k} autres baisses`,
        ends: "FIN", date: `${DAY[D.getDay()]} ${D.getDate()} ${MON[D.getMonth()]}`,
        e1: "🔔 NE MANQUEZ PAS", e2: "LES BAISSES COSTCO<br>DE LA SEMAINE PROCHAINE", hid: "+ des centaines de<br>rabais <span class=\"hid\"><em>CACHÉS</em></span>", only: "SEULEMENT dans",
        rank: (i) => ["PLUS GROSSE BAISSE", "BAISSE N° 2", "BAISSE N° 3"][i], claim: (x) => `RÉCLAMEZ ${money(x)}`, follow: "SUIVEZ", handle: "@priceback.ca" },
}[lang];
const FPS = 30, DUR = 7.5, A = 0.9, B = MODE === "basket" ? 1.7 : 2.5, C = 6.0;
const NB = pics.length, STEP = 0.42, BK = B + 0.15 + NB * STEP; // basket: when the "+N more" jump happens
const SHOWN = Math.round(pics.reduce((a, b) => a + b.off, 0) * 100) / 100;
const PER = (C - B) / top.length;
const cuts = MODE === "basket" ? [A, B, BK, C] : [A, B, ...top.map((_, i) => B + i * PER).slice(1), C];
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;overflow:hidden;font-family:"Helvetica Neue",Arial,sans-serif;background:radial-gradient(circle at 50% 45%,#0a72c8,#003f78 75%)}
.abs{position:absolute}
/* zones: 150-360 question | 400-900 photos | 940-1140 banner | 1170-1480 counter | 1560-1760 date ticket */
#q{left:40px;right:40px;top:170px;text-align:center;color:#fff;font-weight:900;font-size:${lang === "fr" ? 70 : 86}px;line-height:1.05;letter-spacing:-1.5px}
.ph{width:236px;height:236px;border-radius:26px;background:#fff center/86% no-repeat;box-shadow:0 14px 30px rgba(0,0,0,.35)}
#drop{left:20px;right:20px;top:950px;text-align:center}
#drop span{display:inline-block;background:#FFF200;color:#E31837;font-weight:900;font-size:${lang === "fr" ? 66 : 82}px;letter-spacing:-2px;padding:10px 26px;line-height:1.02;box-shadow:0 12px 0 #E31837}
#cnt{left:40px;right:40px;text-align:center;color:#fff;font-weight:900;font-size:60px}
#cnt b{display:block;font-size:140px;color:#FFF200;letter-spacing:-4px;line-height:1.02}
#cnt i{display:block;font-style:normal;color:#FFF200;font-size:44px;font-weight:800;margin-top:4px}
#tk{left:0;right:0;top:1560px;display:flex;justify-content:center}
#tk div{display:flex;align-items:stretch;border-radius:16px;overflow:hidden;box-shadow:0 10px 26px rgba(0,0,0,.35);border:5px solid #fff}
#tk em{font-style:normal;background:#E31837;color:#fff;font-weight:900;font-size:72px;padding:14px 34px;letter-spacing:3px;display:flex;align-items:center}
#tk strong{background:#fff;color:#0060A9;font-weight:900;font-size:96px;padding:6px 40px;letter-spacing:1px}
/* basket mode */
#cart{left:300px;top:1235px;width:480px;height:330px}
#cart svg{width:100%;height:100%}
.fly{width:540px;height:540px;border-radius:34px;background:#fff center/86% no-repeat;box-shadow:0 20px 44px rgba(0,0,0,.4)}
.chip{background:#E31837;color:#fff;font-weight:900;font-size:76px;padding:6px 26px;border-radius:999px;border:6px solid #fff;white-space:nowrap}
#more{left:0;right:0;top:820px;text-align:center}
#more span{display:inline-block;background:#FFF200;color:#E31837;font-weight:900;font-size:80px;padding:8px 30px;letter-spacing:-1px}
#tag{left:0;right:0;top:120px;text-align:center}
#tag span{display:inline-block;white-space:nowrap;background:#E31837;color:#fff;font-weight:900;font-size:${lang === "fr" ? 38 : 50}px;padding:8px 26px;letter-spacing:${lang === "fr" ? 1 : 3}px;border:5px solid #fff}
/* top3 mode */
#rank{left:0;right:0;top:150px;text-align:center}
#rank span{display:inline-block;background:#FFF200;color:#E31837;font-weight:900;font-size:64px;padding:8px 26px;letter-spacing:1px}
.sl{left:54px;top:300px;width:972px;height:1062px;background:#fff top/100% auto no-repeat;box-shadow:0 20px 50px rgba(0,0,0,.35);border-radius:8px;overflow:hidden}
#stamp{left:0;top:1420px;background:#E31837;color:#fff;font-weight:900;font-size:92px;padding:16px 36px;border:8px solid #fff;border-radius:18px;white-space:nowrap;box-shadow:0 16px 40px rgba(0,0,0,.4)}
/* end card */
#e1{left:0;right:0;top:250px;text-align:center}
#e1 span{display:inline-block;background:#FFF200;color:#E31837;font-weight:900;font-size:64px;padding:8px 28px;font-family:"Helvetica Neue",Arial,"Noto Color Emoji",sans-serif}
#e2{left:30px;right:30px;top:370px;text-align:center;color:#fff;font-weight:900;font-size:${lang === "fr" ? 84 : 116}px;line-height:1.02;letter-spacing:-2px}
#fol{left:0;right:0;top:700px;text-align:center}
#fol .btn{display:inline-block;background:#E31837;color:#fff;font-weight:900;font-size:130px;padding:24px 80px;border-radius:90px;border:8px solid #fff;letter-spacing:2px;box-shadow:0 14px 34px rgba(0,0,0,.35);line-height:1.05}
#fol .btn small{display:block;font-size:80px;letter-spacing:0}
#e3{left:20px;right:20px;top:1080px;text-align:center;color:#fff;font-weight:900;font-size:${lang === "fr" ? 62 : 70}px;line-height:1.25;white-space:nowrap}
#e3 .hid{position:relative;display:inline-block;background:#FFF200;color:#E31837;padding:0 14px;transform:rotate(-3deg);font-size:1.3em;letter-spacing:2px}
#e3 .hid em{font-style:normal}
#e3 .hid:after{content:"";position:absolute;right:0;top:0;bottom:0;left:var(--bar,0%);background:#111}
#e4{left:0;right:0;top:1340px;display:flex;flex-direction:column;align-items:center;gap:30px}
#e4 .pill{display:flex;align-items:center;gap:20px;background:#fff;border-radius:999px;padding:14px 44px 14px 34px;box-shadow:0 14px 34px rgba(0,0,0,.3)}
#e4 .only{color:#0EAD79;font-size:${lang === "fr" ? 44 : 54}px;font-weight:900;letter-spacing:3px;font-style:italic}
#e4 .mk{width:110px;height:110px;border-radius:24px}
#e4 b{color:#11785A;font-size:76px;font-weight:900;letter-spacing:-1px}
#e4 .bds{display:flex;align-items:center;gap:30px}
#e4 .bd{height:104px}
#e4 .bd+.bd{height:122px;margin:-9px}
#hand{font-size:150px;left:830px;top:880px;font-family:"Noto Color Emoji"}
#flash{left:0;top:0;width:1080px;height:1920px;background:#fff}
</style></head><body>
<div id="hookL" class="abs" style="left:0;top:0;width:1080px;height:1920px">
  <div id="q" class="abs">${T.q}</div>
  ${pics.map((p, i) => `<div class="abs ph" id="p${i}" style="background-image:url('${b64(path.join(SC, ".cache", p.sku + ".jpg"))}')"></div>`).join("")}
  <div id="drop" class="abs"><span>${T.drop}</span></div>
</div>
<div id="cnt" class="abs">${T.upto}<b>0</b>${T.back}<i>${T.ifb}</i></div>
<div id="tk" class="abs"><div><em>${T.ends}</em><strong>${T.date}</strong></div></div>
<div id="basL" class="abs" style="left:0;top:0;width:1080px;height:1920px;display:none">
  <div id="tag" class="abs"><span>${T.drop.replace("<br>", " ")}</span></div>
  <div id="cart" class="abs"><svg viewBox="0 0 480 330"><path d="M10 30 H90 L140 250 H420 L462 90 H110" fill="none" stroke="#fff" stroke-width="26" stroke-linejoin="round" stroke-linecap="round"/><path d="M120 92 H452 L414 236 H150 Z" fill="rgba(255,255,255,.18)"/><circle cx="180" cy="300" r="26" fill="#FFF200"/><circle cx="380" cy="300" r="26" fill="#FFF200"/></svg></div>
  ${pics.map((p, i) => `<div class="abs fly" id="f${i}" style="background-image:url('${b64(path.join(SC, ".cache", p.sku + ".jpg"))}')"></div><div class="abs chip" id="c${i}">-${money(p.off)}</div>`).join("")}
  <div id="more" class="abs"><span>${T.more(N - NB)}</span></div>
</div>
<div id="rank" class="abs"><span></span></div>
${MODE === "top3" ? top.map((t, i) => `<div class="abs sl" id="s${i}" style="background-image:url('${b64(t.slide)}')"></div>`).join("") : ""}
<div id="stamp" class="abs"></div>
<div id="endL" class="abs" style="left:0;top:0;width:1080px;height:1920px">
  <div id="e1" class="abs"><span>${T.e1}</span></div>
  <div id="e2" class="abs">${T.e2}</div>
  <div id="fol" class="abs"><div class="btn">${T.follow}<small>${T.handle}</small></div></div>
  <div id="e3" class="abs">${T.hid}</div>
  <div id="e4" class="abs"><div class="pill"><span class="only">${T.only}</span><img class="mk" src="${b64(path.join(SC, "mark.png"))}"><b>PriceBack</b></div><div class="bds"><img class="bd" src="${b64(path.join(__dirname, "../../06-launch/badges/app-store-en.svg"))}"><img class="bd" src="${b64(path.join(__dirname, "../../06-launch/badges/google-play-" + lang + ".png"))}"></div></div>
</div>
<div id="hand" class="abs">👆</div>
<div id="flash" class="abs"></div>
<script>
const MODE="${MODE}",A=${A},B=${B},C=${C},PER=${PER},TOTAL=${TOTAL},LANG="${lang}",NT=${top.length},NP=${pics.length},STEP=${STEP},BK=${BK};
const OFF=${JSON.stringify(pics.map((p) => p.off))}, RANK=${JSON.stringify(top.map((_, i) => T.rank(i)))}, CLAIM=${JSON.stringify(top.map((t) => T.claim(t.off)))};
const $=(id)=>document.getElementById(id), cl=(x)=>Math.max(0,Math.min(1,x)), eo=(x)=>1-Math.pow(1-cl(x),3), ei=(x)=>Math.pow(cl(x),2);
const back=(x)=>{x=cl(x);const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const money=(n)=>{const d=Math.round(n*100)%100!==0;return LANG==="fr"?(d?n.toFixed(2).replace(".",","):Math.round(n))+" $":"$"+(d?n.toFixed(2):Math.round(n))};
const grid=[...Array(8)].map((_,i)=>[22+(i%4)*262,410+Math.floor(i/4)*262]);
const show=(id,v)=>{$(id).style.display=v?(id==="tk"?"flex":"block"):"none"};
window.frame=(t)=>{
  const hook=t<B; show("hookL",hook);
  if(hook){
    $("q").style.transform="scale("+(1.2-0.2*back(t/0.3))+")";
    for(let i=0;i<NP;i++){const p=$("p"+i),k=back((t-0.12-i*0.05)/0.3),[x,y]=grid[i];p.style.left=x+"px";p.style.top=y+"px";
      p.style.opacity=String(cl((t-0.12-i*0.05)/0.08));p.style.transform="scale("+k+") rotate("+((i%2?6:-6)*(1-k)+(i%2?2:-2))+"deg)";}
    const d=back((t-A)/0.28); $("drop").style.opacity=String(cl((t-A)/0.06)); $("drop").style.transform="scale("+(2-1*d)+") rotate(-2deg)";
  }
  // counter + date ticket
  const inB=MODE==="basket"&&t>=B&&t<C, cOn=MODE==="basket"?inB:(hook&&t>=A+0.1);
  show("cnt",cOn); show("tk",t<C);
  $("tk").style.top=(MODE==="basket"?1610:1540)+"px"; $("tk").style.opacity=String(cl((t-0.5)/0.15));
  if(MODE==="top3"&&cOn){ $("cnt").style.top="1160px"; $("cnt").style.opacity=String(cl((t-A-0.1)/0.12)); $("cnt").querySelector("b").textContent=money(Math.round(TOTAL*eo((t-A-0.1)/0.8)*100)/100); }
  if(MODE==="top3"&&!hook) show("tk",false);
  // basket
  show("basL",inB);
  if(inB){
    const lt=t-B, first=B+0.15+0.6*STEP; $("cnt").style.top="225px"; $("cnt").style.opacity=String(cl((t-first)/0.08)); $("cnt").style.transform="scale("+(0.6+0.4*back((t-first)/0.25))+")";
    $("tag").style.transform="scale("+(0.5+0.5*back(lt/0.25))+")";
    let sum=0;
    for(let i=0;i<NP;i++){const s=0.15+i*STEP, u=(t-B-s)/STEP, f=$("f"+i), c=$("c"+i);
      if(u<0||u>1){f.style.display="none";c.style.display="none"; if(u>1) sum+=OFF[i]; continue;}
      f.style.display="block";c.style.display="block";
      // pop in at the centre (0-0.45), then fall into the cart (0.6-1)
      const pop=back(u/0.35), fall=ei((u-0.6)/0.4), sc=(0.6+0.4*pop)*(1-0.5*fall);
      const x=270, y=705+(1130-705)*fall;
      f.style.left=x+"px"; f.style.top=y+"px"; f.style.transform="scale("+sc+") rotate("+(fall*(i%2?18:-18))+"deg)"; f.style.opacity=String(cl(u/0.08));
      c.style.top=(585)+"px"; c.style.left=(540-c.offsetWidth/2)+"px"; c.style.opacity=String(cl((u-0.12)/0.08)*(1-cl((u-0.55)/0.1)));
      c.style.transform="scale("+back((u-0.12)/0.25)+") rotate(-4deg)";
      if(u>=0.6) sum+=OFF[i]*cl((u-0.6)/0.15);
    }
    const jump=eo((t-BK)/0.6); const val=t<BK?sum:sum+(TOTAL-sum)*jump;
    $("cnt").querySelector("b").textContent=money(Math.round(val*100)/100);
    $("cnt").querySelector("b").style.transform="scale("+(1+0.12*Math.max(0,Math.sin(Math.min(1,cl((t-BK)/0.4))*Math.PI)))+")";
    $("more").style.display=t>=BK?"block":"none"; $("more").style.transform="scale("+back((t-BK)/0.25)+") rotate(-3deg)";
    const shake=t>=BK?Math.sin((t-BK)*40)*8*(1-cl((t-BK)/0.5)):0; $("cart").style.transform="translateX("+shake+"px)";
  }
  // top 3
  const inItems=MODE==="top3"&&t>=B&&t<C; const k=Math.min(NT-1,Math.floor((t-B)/PER)), lt=t-B-k*PER;
  if(MODE==="top3") for(let i=0;i<NT;i++) $("s"+i).style.display="none";
  show("rank",inItems); show("stamp",inItems);
  if(inItems){
    const el=$("s"+k); el.style.display="block"; const tr=eo(lt/0.22);
    el.style.transform="translateX("+(1080*(1-tr))+"px) scale("+(1+0.03*cl(lt/PER))+")";
    if(k>0&&tr<1){const pv=$("s"+(k-1));pv.style.display="block";pv.style.transform="translateX("+(-1080*tr)+"px) scale(1.03)";}
    $("rank").firstElementChild.textContent=RANK[k]; $("rank").style.transform="scale("+(0.6+0.4*back(lt/0.25))+")";
    const sp=$("stamp"); sp.textContent=CLAIM[k]; const w=sp.offsetWidth; sp.style.left=(540-w/2)+"px";
    const s=back((lt-0.18)/0.22); sp.style.opacity=String(cl((lt-0.18)/0.05)); sp.style.transform="scale("+(2.3-1.3*s)+") rotate(-4deg)";
  }
  // end card
  const end=t>=C, lt2=t-C; show("endL",end); show("hand",end);
  if(end){ $("e1").style.transform="scale("+(0.3+0.7*back(lt2/0.25))+") rotate(-3deg)"; $("e2").style.opacity=String(cl((lt2-0.08)/0.12)); $("e2").style.transform="translateY("+(40*(1-eo((lt2-0.08)/0.25)))+"px)";
    $("e3").style.opacity=String(cl((lt2-0.45)/0.15)); document.querySelector("#e3 .hid").style.setProperty("--bar",(100*eo((lt2-0.6)/0.3))+"%");
    $("e4").style.opacity=String(cl((lt2-0.6)/0.15)); $("e4").style.transform="translateY("+(30*(1-eo((lt2-0.6)/0.25)))+"px)";
    const s=back((lt2-0.2)/0.3), pulse=1+0.05*Math.max(0,Math.sin((lt2-0.35)*Math.PI*3)); $("fol").style.transform="scale("+(s*pulse)+")";
    const tap=Math.abs(Math.sin((lt2-0.3)*Math.PI*2)); $("hand").style.opacity=String(cl((lt2-0.3)/0.1)); $("hand").style.transform="translate("+(-18*tap)+"px,"+(-26*tap)+"px)"; }
  const f=Math.max(1-cl(Math.abs(t-A)/0.07), 1-cl(Math.abs(t-B)/0.08), 1-cl(Math.abs(t-C)/0.08)); $("flash").style.opacity=String(f*0.45);
};
</script></body></html>`;
(async () => {
  const tmp = fs.mkdtempSync("/tmp/freel-"); fs.writeFileSync(path.join(tmp, "r.html"), html);
  const wav = path.join(tmp, "m.wav"), music = cfg.music || "music_house.py";
  if (flag !== "--silent" && flag !== "--stills") execFileSync("python3", [path.join(__dirname, music), String(DUR), wav, cuts.join(",")]);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto("file://" + path.join(tmp, "r.html")); await p.waitForTimeout(400);
  if (flag === "--stills") { for (const t of (stillsAt || "0.5,1.5,3,5.5,7.4").split(",")) { await p.evaluate((x) => window.frame(x), +t); await p.screenshot({ path: out.replace(/\.mp4$/, "") + "-" + t + ".png" }); } await b.close(); console.log(MODE, N, TOTAL, pics.map((x) => x.sku + " -" + x.off).join(", ")); return; }
  const args = ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-"];
  if (flag !== "--silent") args.push("-i", wav, "-c:a", "aac", "-b:a", "160k", "-shortest");
  args.push("-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart", out);
  const ff = spawn("ffmpeg", args, { stdio: ["pipe", "inherit", "inherit"] });
  const n = Math.round(DUR * FPS);
  for (let i = 0; i < n; i++) {
    await p.evaluate((t) => window.frame(t), i / FPS);
    const buf = await p.screenshot({ type: "jpeg", quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r)); await b.close();
  console.log("ok", out, MODE, "|", N, "drops,", TOTAL, "| shown:", pics.map((t) => t.sku + " -" + t.off).join(", "));
})();
