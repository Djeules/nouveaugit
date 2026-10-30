"""Génère les fichiers du logo de Nine (SVG + PNG) à partir des polices DM.

Le mot « nine » est dessiné en contours (DM Serif Display) : le logo ne
dépend d'aucune police installée. Le point du i est remplacé par un carré.
"""
import pathlib, subprocess, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ICI = pathlib.Path(__file__).parent
SORTIE = ICI / "logos"
POLICES = pathlib.Path.home() / ".fonts" / "dm"
SERIF = POLICES / "f6.ttf"      # DM Serif Display Regular
SANS = POLICES / "f4.ttf"       # DM Sans Bold

ENCRE, CREME, TOMATE, BLANC = "#1F1C18", "#F4EEE4", "#E5452A", "#FFFFFF"


def chemins(police, texte, interlettre=0, echelle=1.0, dx=0, dy=0):
    """Contours SVG d'un texte, origine en haut à gauche (y vers le bas)."""
    f = TTFont(police)
    cmap, gs = f.getBestCmap(), f.getGlyphSet()
    x, d = 0, []
    for ch in texte:
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (echelle, 0, 0, -echelle, dx + x * echelle, dy)))
        d.append(pen.getCommands())
        x += gs[g].width + interlettre
    return " ".join(d), (x - interlettre) * echelle


def mot_symbole(texte, point):
    """« nıne » en contours ; renvoie (path, largeur, carré du point)."""
    # Ligne de base à y=700 (hauteur du i pointé de DM Serif Display).
    d, larg = chemins(SERIF, texte, interlettre=-12, dy=700)
    # Le ı est la 2e lettre : n (578) - 12 d'interlettre. Le point rond du i
    # de DM Serif Display est centré en x=139,5 et y=624 : le carré prend sa place.
    cx, cy = 578 - 12 + 139.5, 700 - 624
    cote = 136
    carre = (cx - cote / 2, cy - cote / 2, cote)
    return d, larg, carre


def svg_mot(encre, point, signature=False):
    d, larg, (px, py, c) = mot_symbole("nıne", point)
    marge_haut = py                    # le haut du carré borne le dessin
    h = 700 + 15 - marge_haut
    corps = f'<path d="{d}" fill="{encre}" transform="translate(0,{-marge_haut})"/>'
    corps += f'<rect x="{px}" y="{py - marge_haut}" width="{c}" height="{c}" fill="{point}"/>'
    if signature:
        # « un coin de neuf » en DM Sans Bold capitales espacées, sous le mot.
        # Mise à l'échelle pour couvrir exactement la largeur du mot.
        _, naturelle = chemins(SANS, "UN COIN DE NEUF", interlettre=160)
        e = larg / naturelle
        sd, sl = chemins(SANS, "UN COIN DE NEUF", interlettre=160, echelle=e)
        sx = 0
        corps += (f'<path d="{sd}" fill="{encre}" '
                  f'transform="translate({sx},{h + 130 + 700 * e})"/>')
        h += 130 + 700 * e + 10
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -2 {larg} {h + 4}" '
            f'width="{larg}" height="{h + 4}">{corps}</svg>')


def svg_symbole(fond, coin, cadre=None):
    """Le carré dont un coin change de couleur : 3×3 cases, celle en haut à droite."""
    s = 900
    r = f'<rect width="{s}" height="{s}" fill="{fond}"/>'
    r += f'<rect x="{s * 2 / 3}" y="0" width="{s / 3}" height="{s / 3}" fill="{coin}"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {s} {s}" width="{s}" height="{s}">{r}</svg>'


VARIANTES = {
    # nom : (fonction, arguments)
    "nine-logo-encre": (svg_mot, (ENCRE, TOMATE)),
    "nine-logo-creme": (svg_mot, (CREME, TOMATE)),
    "nine-logo-sur-tomate": (svg_mot, (ENCRE, CREME)),
    "nine-logo-noir": (svg_mot, (ENCRE, ENCRE)),
    "nine-logo-blanc": (svg_mot, (BLANC, BLANC)),
    "nine-signature-encre": (svg_mot, (ENCRE, TOMATE, True)),
    "nine-signature-creme": (svg_mot, (CREME, TOMATE, True)),
    "nine-symbole": (svg_symbole, (ENCRE, TOMATE)),
    "nine-symbole-creme": (svg_symbole, (CREME, TOMATE)),
    "nine-symbole-sur-tomate": (svg_symbole, (ENCRE, CREME)),
    "nine-symbole-noir": (svg_symbole, (ENCRE, "#5A544C")),
}


def png_depuis_svg(svgs, largeur=2400):
    """Rasterise chaque SVG en PNG transparent avec le Chromium installé (Playwright Node)."""
    script = ICI / "rasterise.js"
    subprocess.run(["node", str(script), str(largeur), *map(str, svgs)], check=True)


if __name__ == "__main__":
    SORTIE.mkdir(exist_ok=True)
    faits = []
    for nom, (fn, args) in VARIANTES.items():
        p = SORTIE / f"{nom}.svg"
        p.write_text(fn(*args))
        faits.append(p)
    png_depuis_svg(faits)
    print("\n".join(str(p) for p in faits))
