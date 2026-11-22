"""Fabrique les visuels du stylo à partir des photos et de la vidéo source.

    python3 -I tools/photos/build.py [orange|brun]

Tout sort dans site/assets/img/stylo/. Rien n'est servi depuis tools/.
Les sources (tools/photos/src/) sont des photos sur fond clair : chaque
visuel est recoloré (bleu → teinte choisie), puis détouré pour se poser
sur les fonds sombres du site.
"""
import sys, os, glob, subprocess, tempfile
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from recolor import recolor, smooth
from bgest import local_bg, polyfit_bg
from matte import matte, rgba, bbox

TINT = sys.argv[1] if len(sys.argv) > 1 else 'orange'
OUT = os.path.join(HERE, '..', '..', 'site', 'assets', 'img', 'stylo')
os.makedirs(os.path.join(OUT, 'rotation'), exist_ok=True)


def load(name):
    return np.asarray(Image.open(os.path.join(HERE, 'src', name)).convert('RGB'))


def cutout(crop, rotate=0, solid=False, trim=True):
    B = local_bg(crop)
    tinted = recolor(crop, TINT)
    F, al = matte(tinted, B, kill_glare=True)
    if solid:
        # Pièce pleine et teintée (capuchon, bouchon) : seul ce qui porte la
        # teinte est gardé. Le fond, les ombres et les reflets sont gris.
        t = tinted.astype(np.float32) / 255
        mx, mn = t.max(-1), t.min(-1)
        sat = (mx - mn) / np.maximum(mx, 1e-3)
        al = smooth(0.14, 0.30, sat)
        F = t
    al = np.where(al < 0.06, 0, al)          # poussière de fond
    im = Image.fromarray(rgba(F, al), 'RGBA')
    if rotate:
        im = im.rotate(rotate, expand=True, resample=Image.BICUBIC)
    return im.crop(bbox(np.asarray(im)[..., 3], thr=40)) if trim else im


def part(tile, box, fade=None, **kw):
    """Le fond s'estime mieux sur la case entière : on détoure la case,
    puis on recadre la pièce. `fade` estompe un bord où la pièce sort du
    cadre de la photo, pour qu'elle s'efface au lieu d'être tranchée."""
    sub = np.array(cutout(tile, trim=False, **kw).crop(box))
    if fade:
        side, px = fade
        ramp = smooth(0, 1, np.linspace(0, 1, px))
        a = sub[..., 3].astype(np.float32)
        if side == 'right': a[:, -px:] *= ramp[::-1]
        else: a[:, :px] *= ramp
        sub[..., 3] = a.astype(np.uint8)
    sub = Image.fromarray(sub, 'RGBA')
    return sub.crop(bbox(np.asarray(sub)[..., 3], thr=24))


def save(im, name, max_side=None, q=82):
    if max_side and max(im.size) > max_side:
        k = max_side / max(im.size)
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    p = os.path.join(OUT, name)
    im.save(p + '.webp', 'WEBP', quality=q, method=6, alpha_quality=90)
    # Pas d'AVIF : essayé, il ne gagne rien sur ces détourages (parfois il
    # double le poids, l'alpha du cristal se compresse mal) — WebP suffit.
    print(f'{name}: {im.size}  webp {os.path.getsize(p + ".webp") // 1024} Ko')


# ---- Stylos entiers (clichés 01 à 08, 768 × 256) -------------------------
# capuchon engagé, couché, capuchon à gauche → tourné, capuchon en haut
save(cutout(load('01-ferme-profil.png'), rotate=-90), 'stylo-capuchon', 1400)
# capuchon emboîté au dos, pointe visible, dos à droite → dos en haut
save(cutout(load('06-capuchon-au-dos.png'), rotate=90), 'stylo-poste', 1400)
# sans capuchon, bouchon à droite → bouchon en haut
save(cutout(load('02-ouvert-profil.png'), rotate=90), 'stylo-nu', 1400)

# ---- Nomenclature : les gros plans de la vue éclatée (382 × 367) ----------
save(part(load('eclatee-capuchon.png'), (0, 0, 382, 367), solid=True), 'piece-capuchon', 640)
RC = load('eclatee-reservoir-corps.png')
save(part(RC, (168, 30, 382, 285), fade=('right', 90)), 'piece-corps', 640)
save(part(RC, (0, 135, 166, 245), fade=('left', 60)), 'piece-reservoir', 640)
BP = load('eclatee-bille-pointe.png')
save(part(BP, (68, 115, 194, 245)), 'piece-pointe', 640)
save(part(BP, (8, 165, 66, 230)), 'piece-bille', 640)
save(part(load('eclatee-bouchon.png'), (175, 95, 345, 260), solid=True), 'piece-bouchon', 640)

# ---- Rotation : séquence d'images détourées, lue au défilement -----------
tmp = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'src', 'rotation.mp4'),
                os.path.join(tmp, 'f%03d.png')], check=True)
files = sorted(glob.glob(os.path.join(tmp, '*.png')))
stack = np.stack([np.asarray(Image.open(f).convert('RGB')) for f in files[::4]])
med = np.median(stack, axis=0).astype(np.float32) / 255
poly = polyfit_bg((med * 255).astype(np.uint8))
# La caméra est fixe : la médiane des images donne le fond exact partout où
# le stylo ne passe pas la moitié du temps. Au centre, où il est toujours,
# la surface lisse prend le relais.
B = np.where((np.abs(med - poly).max(-1) < 0.02)[..., None], med, poly)

STEP = 2
frames = []
for f in files[::STEP]:
    F, al = matte(recolor(np.asarray(Image.open(f).convert('RGB')), TINT), B)
    # tourné d'un quart : la vue éclatée devient verticale, capuchon en haut
    frames.append(Image.fromarray(rgba(F, al), 'RGBA').rotate(90, expand=True))
alpha = np.max(np.stack([np.asarray(fr)[..., 3] for fr in frames]), 0)
box = bbox(alpha, thr=10, pad=8)
W = 520
for old in glob.glob(os.path.join(OUT, 'rotation', '*.webp')):
    os.remove(old)
for i, fr in enumerate(frames):
    fr = fr.crop(box)
    fr = fr.resize((W, round(fr.height * W / fr.width)), Image.LANCZOS)
    fr.save(os.path.join(OUT, 'rotation', f'{i:03d}.webp'), 'WEBP',
            quality=74, method=6, alpha_quality=80)
tot = sum(os.path.getsize(p) for p in glob.glob(os.path.join(OUT, 'rotation', '*.webp')))
print(f'rotation : {len(frames)} images de {fr.size[0]} × {fr.size[1]}, {tot // 1024} Ko au total')
