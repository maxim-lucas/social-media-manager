"""
mask_receipts.py — the two real receipts shown in the Kickstarter video, masked so they
belong to nobody: only the printed COSTCO WHOLESALE logo stays readable (v2, 2026-11-02:
totals and dates blurred too, so the demo can carry its own products, total and date). Warehouse, address, member number, barcode, every item line,
card, approval and register numbers are pixelated then blurred (not recoverable).

Inputs (never committed here, they stay in the app's test fixtures):
  PAPER = Priceback/__tests__/fixtures/receipts/PXL_20260604_173014846.jpg   (+ .vision.json word boxes)
  PDF   = Priceback/__tests__/fixtures/receipts/Costco Receipts PDF/G-10.pdf  (Costco digital receipt, 2 items)

Outputs (committed): receipt-paper-masked.png, receipt-pdf-masked.png in this folder.

    python sources/mask_receipts.py
"""
import json, os, re
from PIL import Image, ImageFilter
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
FIX = os.path.normpath(os.path.join(HERE, "../../../../Priceback/__tests__/fixtures/receipts"))
PAPER = os.path.join(FIX, "PXL_20260604_173014846.jpg")
PAPER_OCR = os.path.join(FIX, "PXL_20260604_173014846.vision.json")
PDF = os.path.join(FIX, "Costco Receipts PDF", "G-10.pdf")  # 2 item lines = the 2 products shown

KEEP_LINE = re.compile(r"\b(SUB-?TOTAL|TAX|TOTAL)\b|\*\*\*\*", re.I)


def obliterate(img, box, pad=6):
    """Pixelate hard, then blur: the text cannot be read back."""
    x0, y0, x1, y1 = [int(v) for v in box]
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(img.width, x1 + pad), min(img.height, y1 + pad)
    if x1 <= x0 or y1 <= y0:
        return
    region = img.crop((x0, y0, x1, y1))
    w, h = region.size
    small = region.resize((max(1, w // 18), max(1, h // 18)), Image.BILINEAR)
    region = small.resize((w, h), Image.BILINEAR).filter(ImageFilter.GaussianBlur(radius=max(4, h // 6)))
    img.paste(region, (x0, y0))


def group_lines(words, key_y, key_h):
    """Cluster words into printed lines by vertical position."""
    lines = []
    for w in sorted(words, key=key_y):
        y, h = key_y(w), key_h(w)
        for ln in lines:
            if abs(ln["y"] - y) < max(h, ln["h"]) * 0.55:
                ln["words"].append(w)
                break
        else:
            lines.append({"y": y, "h": h, "words": [w]})
    return lines


# Crisp black-on-white PDF text survives a light mosaic, so the PDF uses strength 2.2.
def soften(img, text_h, strength=1.0):
    """Mosaic + blur sized to the printed text: line shapes stay visible (it still reads as a
    receipt), characters do not. Blocks of ~0.45x the text height merge every digit."""
    block = max(6, int(text_h * 0.45 * strength))
    small = img.resize((max(1, img.width // block), max(1, img.height // block)), Image.BILINEAR)
    return small.resize(img.size, Image.BILINEAR).filter(ImageFilter.GaussianBlur(radius=max(3, text_h * 0.3 * strength)))


def keep_only(img, keep_boxes, text_h, strength=1.0):
    """Blur EVERYTHING except the given boxes (x0, y0, x1, y1). Safer than blurring word by word:
    a word the OCR missed (the member number did) is blurred anyway."""
    clean = img.copy()
    img.paste(soften(img, text_h, strength), (0, 0))
    for box in keep_boxes:
        x0, y0, x1, y1 = [int(v) for v in box]
        img.paste(clean.crop((x0, y0, x1, y1)), (x0, y0))
    return img


def _find(words, pattern, y=lambda w: w["yMid"]):
    return [w for w in words if re.fullmatch(pattern, w["text"])]


def paper():
    img = Image.open(PAPER).convert("RGB")
    words = json.load(open(PAPER_OCR, encoding="utf-8"))["words"]
    wholesale = _find(words, "WHOLESALE")[0]
    sub = _find(words, "SUBTOTAL")[0]
    total = [w for w in _find(words, "TOTAL") if w["yMid"] > sub["yMid"]][0]
    logo_bottom = wholesale["yMid"] + wholesale["height"] * 0.9
    totals_top = sub["yMid"] - sub["height"] * 0.62
    totals_bottom = total["yMid"] + total["height"] * 1.1
    W = img.width
    text_h = sorted(w["height"] for w in words)[len(words) // 2]
    img = keep_only(img, [(0, 0, W, logo_bottom)], text_h)
    # Stop just under the TOTAL line: the payment part is never needed for a scan.
    img = img.crop((0, 0, W, int(totals_bottom + 60)))
    out = os.path.join(HERE, "receipt-paper-masked.png")
    img.save(out)
    return out


def pdf():
    """The PDF's text is drawn as vector shapes (no text layer), so the kept bands come from the
    fixture's OCR (G-11.vision.json): x/height normalised to the page, yMid = page*1e6 + y."""
    doc = pymupdf.open(PDF)
    ocr = json.load(open(PDF.replace(".pdf", ".vision.json"), encoding="utf-8"))["words"]
    zoom = 2.5
    parts = []
    for pi, page in enumerate(doc):
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom))
        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        W, H = img.width, img.height
        words = [dict(w, y=w["yMid"] - pi * 1e6) for w in ocr if int(w["yMid"] // 1e6) == pi]
        text_h = sorted(w["height"] for w in words)[len(words) // 2] * H
        band = lambda w, k=0.9: ((w["y"] - w["height"] * k) * H, (w["y"] + w["height"] * k) * H)
        if pi == 0:
            ws = [w for w in words if w["text"] == "WHOLESALE"][0]
            end = max(w["y"] for w in words if w["text"] in ("Again", "Come"))
            img = keep_only(img, [(0, 0, W, band(ws)[1])], text_h, strength=2.2)
            parts.append(img.crop((0, 0, W, int(end * H) + 80)))
            continue
        break  # page 2 holds only register footers: not shown
    sheet = Image.new("RGB", (max(p.width for p in parts), sum(p.height for p in parts)), "white")
    y = 0
    for p in parts:
        sheet.paste(p, (0, y)); y += p.height
    out = os.path.join(HERE, "receipt-pdf-masked.png")
    sheet.save(out)
    return out


if __name__ == "__main__":
    print(paper())
    print(pdf())
