"""Détourage d'un objet photographié sur fond clair et uni.

On connaît (ou on estime) le fond B. Chaque pixel est vu comme un mélange
C = a·F + (1-a)·B. L'écart à B donne l'opacité a, et F s'en déduit.
Le cristal, presque de la couleur du fond, sort avec une opacité faible :
c'est ce qui le laisse transparent une fois posé sur le brun du site.
Les ombres portées (assombrissement uniforme et faible) et, sur les
photos, les reflets du plateau (éclaircissement uniforme et faible) sont
retirés : le site pose ses propres ombres.
"""
import numpy as np
from recolor import smooth
from bgest import boxblur

def matte(img, B, floor=0.03, t=0.20, kill_glare=False):
    a = img.astype(np.float32) / 255
    d = a - B
    mag = np.abs(d).max(-1)
    al = np.clip((mag - floor) / t, 0, 1) ** 0.75
    F = np.clip(B + d / np.maximum(al, 1e-3)[..., None], 0, 1)
    chroma = d.max(-1) - d.min(-1)
    flat = 1 - smooth(0.02, 0.05, chroma)
    # une ombre est un assombrissement neutre ET lisse ; une arête de
    # cristal est neutre aussi, mais nette : le gradient les sépare
    lum = a.mean(-1)
    gy, gx = np.gradient(lum)
    sharp = boxblur(np.hypot(gx, gy), 3)
    soft = 1 - smooth(0.008, 0.024, sharp)
    shadow = (d.mean(-1) < 0) * flat * np.maximum(1 - smooth(0.10, 0.18, mag),
                                                  soft * (1 - smooth(0.30, 0.45, mag)))
    al = al * (1 - shadow)
    if kill_glare:
        glare = (d.mean(-1) > 0) * flat * np.maximum(1 - smooth(0.06, 0.12, mag),
                                                     soft * (1 - smooth(0.20, 0.35, mag)))
        al = al * (1 - glare)
    return F, al

def rgba(F, al):
    return np.dstack([(F * 255 + .5).astype(np.uint8), (al * 255 + .5).astype(np.uint8)])

def bbox(al, thr=8, pad=6):
    ys, xs = np.where(al > thr)
    h, w = al.shape
    return (max(xs.min() - pad, 0), max(ys.min() - pad, 0),
            min(xs.max() + pad + 1, w), min(ys.max() + pad + 1, h))
