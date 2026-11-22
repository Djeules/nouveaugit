"""Exporte les clichés du stylo pour le site, sans détourage.

    python3 -I tools/photos/build.py [bleu|orange|brun]

`bleu` (défaut) : les photos telles qu'elles ont été fournies.
`orange` / `brun` : seules les pièces bleues sont recolorées, par masque ;
le reste de la photo n'est pas touché.

Chaque cliché sort en deux tailles dans site/assets/img/stylo/ :
  nom.webp     taille native, qualité 95 (quasi sans perte visible)
  nom@2x.webp  agrandi ×2 au Lanczos, léger accent de netteté, pour les
               écrans haute densité. Ce n'est pas du détail en plus — il
               n'existe pas dans la source — mais c'est plus net que
               l'agrandissement bilinéaire que ferait le navigateur.
Rien n'est servi depuis tools/.
"""
import sys, os, glob
import numpy as np
from PIL import Image, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from recolor import recolor

TINT = sys.argv[1] if len(sys.argv) > 1 else 'bleu'
OUT = os.path.join(HERE, '..', '..', 'site', 'assets', 'img', 'stylo')
os.makedirs(OUT, exist_ok=True)
for old in glob.glob(os.path.join(OUT, '*.webp')):
    os.remove(old)


def load(name):
    im = Image.open(os.path.join(HERE, 'src', name)).convert('RGB')
    if TINT != 'bleu':
        im = Image.fromarray(recolor(np.asarray(im), TINT))
    return im


def save(im, name):
    p = os.path.join(OUT, name)
    im.save(p + '.webp', 'WEBP', quality=95, method=6)
    big = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    big = big.filter(ImageFilter.UnsharpMask(radius=1.6, percent=45, threshold=2))
    big.save(p + '@2x.webp', 'WEBP', quality=90, method=6)
    print(f'{name}: {im.size}  {os.path.getsize(p + ".webp") // 1024} Ko'
          f'  (@2x {os.path.getsize(p + "@2x.webp") // 1024} Ko)')


# Clichés entiers (768 × 256)
save(load('06-capuchon-au-dos.png'), 'cliche-capuchon-au-dos')   # accroche
save(load('01-ferme-profil.png'), 'cliche-ferme-profil')         # Format, poche
save(load('02-ouvert-profil.png'), 'cliche-ouvert-profil')       # Divulgation

# Gros plans de la vue éclatée (382 × 367) : Anatomie
for n in ('capuchon', 'bouchon', 'reservoir-corps', 'bille-pointe'):
    save(load(f'eclatee-{n}.png'), f'gros-plan-{n}')

# Nomenclature : chaque pièce recadrée dans son gros plan, fond d'origine
crops = {
    'piece-capuchon':  ('eclatee-capuchon.png',        (10, 20, 372, 330)),
    'piece-corps':     ('eclatee-reservoir-corps.png', (168, 30, 382, 290)),
    'piece-reservoir': ('eclatee-reservoir-corps.png', (0, 110, 170, 270)),
    'piece-pointe':    ('eclatee-bille-pointe.png',    (62, 105, 206, 255)),
    'piece-bille':     ('07-pointe-macro.png',         (140, 70, 300, 230)),
    'piece-bouchon':   ('eclatee-bouchon.png',         (170, 80, 362, 272)),
}
for name, (src, box) in crops.items():
    save(load(src).crop(box), name)
