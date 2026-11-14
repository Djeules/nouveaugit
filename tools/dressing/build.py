"""Convertit les rendus PNG de scene.py en WebP pour la démo.

    python3 tools/dressing/build.py <png-desktop> <png-mobile> [<png-desktop-hd>]

Écrit site/demos/dressing/assets/frames/{d,m,h}/fNNN.webp.

- d (1440 × 810) et m (720 × 1280) : qualité 80, ~25-35 Ko par image (88 pesait
  40 % de plus pour une différence invisible : la page fond déjà deux images).
- h (2560 × 1440, écrans retina et larges) : qualité 74. À cette définition un
  pixel compte moins, et 80 dépassait 95 Ko par image.

Le flou qu'on voyait sur un écran retina venait de la définition (image
1440 agrandie 1,75 fois), pas de la compression : voir README.
"""
import pathlib
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "site/demos/dressing/assets/frames"
QUALITY = {"d": 80, "m": 80, "h": 74}

for src, key in zip(sys.argv[1:4], ("d", "m", "h")):
    dst = OUT / key
    dst.mkdir(parents=True, exist_ok=True)
    pngs = sorted(pathlib.Path(src).glob("f*.png"))
    total = 0
    for p in pngs:
        out = dst / (p.stem + ".webp")
        Image.open(p).convert("RGB").save(out, "WEBP", quality=QUALITY[key], method=6)
        total += out.stat().st_size
    print(f"{key}: {len(pngs)} images, {total / 1e6:.1f} Mo")
