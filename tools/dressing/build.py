"""Convertit les rendus PNG de scene.py en WebP pour la démo.

    python3 tools/dressing/build.py <dossier-png-desktop> <dossier-png-mobile>

Écrit site/demos/dressing/assets/frames/d/fNNN.webp et .../m/fNNN.webp.
Qualité 88, méthode 6 : ~40-60 Ko par image paysage.
"""
import pathlib
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "site/demos/dressing/assets/frames"

for src, key in zip(sys.argv[1:3], ("d", "m")):
    dst = OUT / key
    dst.mkdir(parents=True, exist_ok=True)
    pngs = sorted(pathlib.Path(src).glob("f*.png"))
    total = 0
    for p in pngs:
        out = dst / (p.stem + ".webp")
        Image.open(p).convert("RGB").save(out, "WEBP", quality=88, method=6)
        total += out.stat().st_size
    print(f"{key}: {len(pngs)} images, {total / 1e6:.1f} Mo")
