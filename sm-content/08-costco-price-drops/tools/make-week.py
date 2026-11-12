"""Builds one week file per category for the price-drop carousels (Monica, 2026-11-10: 1 category = 1 carousel,
as few categories as possible). Usage: python3 make-week.py <items module> <week> <cat>=<sku,sku,...> ...
Items without a cached photo in scenes/.cache are dropped and listed. Biggest saving first, then end date."""
import json, sys, os, importlib.util
SC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scenes")
spec = importlib.util.spec_from_file_location("items", sys.argv[1]); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
I = m.I; week = sys.argv[2]
CATS = {"grocery": ("Grocery", "Épicerie"), "home": ("Home & more", "Maison et plus"),
        "hb": ("Health & Beauty", "Santé et beauté"), "frozen": ("Frozen", "Surgelés"),
        "tech": ("TVs & tech", "Télés et techno"), "bc": ("Grocery", "Épicerie")}  # bc = Business Centre: grocery only (Monica, 2026-11-12)
for arg in sys.argv[3:]:
    cat, skus = arg.split("="); skus = skus.split(",")
    have = lambda s: os.path.exists(f"{SC}/.cache/{s}.jpg")
    keep = [s for s in skus if have(s)]; miss = [s for s in skus if not have(s)]
    keep.sort(key=lambda s: (I[s][3], -I[s][1]))
    d = {"_note": f"{CATS[cat][0]} ending the week of {week}. priceback.savings live rows (not superseded), never posted before; biggest saving first. Missing photo (dropped): {', '.join(miss) or 'none'}.",
         "source": "priceback.savings + latest priceback.price_points regular price",
         "provinceStrip": True, "endSlide": True, "coverStyle": "claim", "bigClaim": True, **({"businessCentre": True} if cat.startswith("bc") else {}),
         "carousels": [{"id": "c", "category": {"en": CATS[cat][0], "fr": CATS[cat][1]}, "items": keep}],
         "items": {}, "feeds": {"en": ["c"], "fr": ["c"]}}
    for s in keep:
        reg, off, prov, exp, en, fr = I[s]
        d["items"][s] = {"sameday": None, "tag": {"en": [x for x in en if x], "fr": [x for x in fr if x]}, "regular": reg,
                         "off": float(off), "price": round(reg - off, 2), "exp": exp, "seen": getattr(m, "SEEN", "2026-11-10"), "provinces": prov, "bizOnly": []}
    f = f"{week}-{cat}"; json.dump(d, open(f"{SC}/weeks/{f}.json", "w"), ensure_ascii=False, indent=2)
    print(f, len(keep), "items, total", round(sum(I[s][1] for s in keep), 2), "| missing", miss)
