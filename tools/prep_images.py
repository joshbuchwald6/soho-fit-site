"""Build optimized web images for the SOHO Fit site from the original archive.

Originals in ../public/assets are never modified. Outputs go to site/src/img/.
Run: python3 -I site/tools/prep_images.py <repo_root>
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(sys.argv[1]).resolve()
SRC = ROOT / "public" / "assets"
OUT = ROOT / "site" / "src" / "img"
OUT.mkdir(parents=True, exist_ok=True)

# key: (source path under public/assets, crop box as fractions (l,t,r,b) or None, widths, note)
PHOTOS = {
    # Authentic SOHO Fit studio photography (2021 shoot)
    "studio-trx": ("studio/36.jpeg", None, [1800, 1000], "TRX strap detail, studio"),
    "studio-glove": ("studio/4.jpeg", None, [1800, 1000], "Boxing glove on bench, studio"),
    "studio-floor": ("studio/20211004_080204-scaled-1.jpeg", None, [2400, 1200], "Studio floor, wide"),
    "studio-rack": ("studio/20211004_080112-1-scaled-1.jpeg", None, [2400, 1200], "Racks and bag, wide"),
    "studio-doors": ("studio/20211004_080520-scaled-1.jpeg", None, [2400, 1200], "French doors and dumbbells"),
    "studio-cardio": ("studio/20211004_080009-1-scaled-1.jpeg", None, [2400, 1200], "Cardio and turf"),
    "studio-room": ("studio/6.jpeg", None, [1800, 1000], "Cardio room"),
    "studio-tall": ("studio/IMG_20230112_150111.jpg", None, [1200, 700], "Studio, portrait"),
    "studio-mural": ("studio/20211004_080143-scaled-1.jpeg", None, [2400, 1200], "Studio mural wall"),
    # SOHO uploads used on the live site for services (licensed stock / design uploads; flagged for reshoot)
    "svc-stretch": ("services/Assisted-Stretch-Sessions-at-Soho-Fit.jpg", None, [1024, 600], "Assisted stretch"),
    "svc-athome": ("services/AtHome-PersonalTraining-Box.jpg", None, [1500, 700], "At-home training"),
    "svc-corporate": ("services/corporate-wellness.jpg", None, [1500, 700], "Corporate wellness"),
    "svc-youth": ("services/Untitled-design-1.png", None, [1500, 700], "Youth training"),
    "svc-prenatal": ("services/Untitled-design-3.png", None, [1500, 700], "Prenatal training"),
    "svc-inbody": ("services/inbody.jpg", None, [1500, 700], "InBody 270 scan"),
    "svc-nutrition": ("studio/FB_IMG_1601480252460.jpeg", None, [1080, 700], "Meal prep"),
}

TRAINERS = {
    "andrew-dunbuss": "trainers/Trainers-Andrew-Busse.jpg",
    "ashton-leal": "trainers/Ashton-Leal.jpg",
    "bayli-king": "trainers/Baylis.jpg",
    "chavely-castro-amores": "trainers/IMG_3077-rotated.jpeg",
    "cole-ringquist": "trainers/col.jpg",
    "jake-morran": "trainers/Jake-Morran-1.jpg",
    "jd": "trainers/Trainers-JD-White.jpg",
    "joe-berg": "trainers/Soho-Fit-Portrait-Design1.jpg",
    "kristin-blanchard": "trainers/Kristin1.jpg",
    "lisa-scalzo": "trainers/Lisa-Scalzo.jpg",
    "roman-blake": "trainers/roman.jpg",
    "tyler-ding": "trainers/Trainers-Tyler-Ding-2.jpg",
}

manifest = {"photos": {}, "trainers": {}}


def save(im, name, width, q=78):
    im = im.convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    p = OUT / f"{name}-{im.width}.webp"
    im.save(p, "WEBP", quality=q, method=6)
    return {"file": p.name, "w": im.width, "h": im.height}


for key, (rel, crop, widths, note) in PHOTOS.items():
    im = ImageOps.exif_transpose(Image.open(SRC / rel))
    if crop:
        w, h = im.size
        im = im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
    outs = [save(im, key, w) for w in widths]
    manifest["photos"][key] = {"source": f"public/assets/{rel}", "note": note, "variants": outs}

for slug, rel in TRAINERS.items():
    im = ImageOps.exif_transpose(Image.open(SRC / rel))
    # normalise every portrait to 4:5
    w, h = im.size
    target = 4 / 5
    if w / h > target:
        nw = int(h * target)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / target)
        im = im.crop((0, 0, w, nh))
    outs = [save(im, f"t-{slug}", 600, q=82)]
    manifest["trainers"][slug] = {"source": f"public/assets/{rel}", "variants": outs}

(OUT / "image-manifest.json").write_text(json.dumps(manifest, indent=1))
print(len(manifest["photos"]), "photos,", len(manifest["trainers"]), "trainers ->", OUT)


# ---- Brand duotones (direction C+): shadows Ink, mids SOHO red or blue, highlights tint ----
def tritone(im, dark, mid, light):
    g = ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=1)
    lut = []
    for ch in range(3):
        for i in range(256):
            t = i / 255
            if t < 0.5:
                v = dark[ch] + (mid[ch] - dark[ch]) * (t / 0.5)
            else:
                v = mid[ch] + (light[ch] - mid[ch]) * ((t - 0.5) / 0.5)
            lut.append(int(v))
    return Image.merge("RGB", (g, g, g)).point(lut)


INK = (14, 14, 14)
TONES = {"blue": ((45, 140, 181), (214, 236, 246)), "red": ((208, 61, 77), (250, 220, 223))}
DUO = {
    "studio-trx": "blue", "studio-glove": "red", "studio-floor": "blue", "studio-rack": "red",
    "studio-doors": "blue", "studio-cardio": "red", "studio-room": "blue", "studio-tall": "red",
    "studio-mural": "red",
    "svc-stretch": "blue", "svc-athome": "red", "svc-corporate": "blue", "svc-youth": "red",
    "svc-prenatal": "blue", "svc-inbody": "red", "svc-nutrition": "blue",
}
manifest["duotones"] = {}
for key, tone in DUO.items():
    rel = PHOTOS[key][0]
    im = ImageOps.exif_transpose(Image.open(SRC / rel)).convert("RGB")
    mid, light = TONES[tone]
    duo = tritone(im, INK, mid, light)
    outs = [save(duo, f"{key}-{tone}", w) for w in PHOTOS[key][2]]
    manifest["duotones"][key] = {"tone": tone, "variants": outs}
(OUT / "image-manifest.json").write_text(json.dumps(manifest, indent=1))
print("duotones:", len(DUO))
