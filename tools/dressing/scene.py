"""
Le dressing qui se range tout seul — scène Blender/Cycles rendue image par image.

Une seule scène, une seule caméra, un seul éclairage : toutes les images de la
séquence sortent du même modèle 3D, d'où la cohérence parfaite d'un plan à
l'autre (mêmes meubles, même lumière, même angle). La chorégraphie est écrite
en fonction de la progression du défilement `p` (0 → 1), exactement celle que
lit la page : image i  ⇔  p = i / (N - 1) * P_END.

Utilisation (bpy installé par pip, Python 3.13) :

    python3 tools/dressing/scene.py --variant desktop --out /chemin/frames \
            --frames 150 --samples 40
    python3 tools/dressing/scene.py --variant mobile  --out /chemin/frames-m ...
    python3 tools/dressing/scene.py --variant desktop --only 0,75,149   # tests

Rien d'aléatoire n'est tiré au rendu : la graine est fixe, deux rendus de la
même image sont identiques.
"""
import argparse
import math
import os
import random
import sys

import bpy  # noqa: E402  (bpy doit précéder bmesh)
import bmesh
from mathutils import Euler, Matrix, Quaternion, Vector, noise

# ------------------------------------------------------------------ réglages
P_END = 0.88  # au-delà, la scène est immobile : la page garde la dernière image

ap = argparse.ArgumentParser()
ap.add_argument("--variant", choices=["desktop", "mobile"], default="desktop")
ap.add_argument("--out", default="/tmp/dressing-frames")
ap.add_argument("--frames", type=int, default=150)
ap.add_argument("--samples", type=int, default=40)
ap.add_argument("--only", default="")
ap.add_argument("--scale", type=float, default=1.0, help="facteur de résolution (tests)")
ap.add_argument("--blend", default="", help="enregistre le .blend pour inspection")
args = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])

R = random.Random(7)


# ------------------------------------------------------------------ outils
def ease(t):
    """Accélération puis freinage doux (sinusoïde) — t borné à [0, 1]."""
    t = min(1.0, max(0.0, t))
    return 0.5 - 0.5 * math.cos(math.pi * t)


def ease3(t):
    t = min(1.0, max(0.0, t))
    return t * t * t * (t * (6 * t - 15) + 10)  # smootherstep


def span(p, a, b):
    return ease3((p - a) / (b - a)) if b > a else float(p >= a)


def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, 1.0)


def link(o):
    bpy.context.scene.collection.objects.link(o)
    return o


def mesh_obj(name, bm):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return link(bpy.data.objects.new(name, me))


def smooth(o, level=1, render=None):
    for poly in o.data.polygons:
        poly.use_smooth = True
    if level:
        m = o.modifiers.new("sub", "SUBSURF")
        m.levels = level
        m.render_levels = render if render is not None else level
    return o


def rounded_box(name, sx, sy, sz, r=0.15, cuts=6, bevel_only=False):
    """Boîte aux arêtes arrondies (r en fraction de la demi-taille la plus petite)."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=2.0)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=cuts, use_grid_fill=True)
    hx, hy, hz = sx / 2, sy / 2, sz / 2
    rr = r * min(hx, hy, hz)
    for v in bm.verts:
        p = Vector((v.co.x * hx, v.co.y * hy, v.co.z * hz))
        inner = Vector((max(-hx + rr, min(hx - rr, p.x)),
                        max(-hy + rr, min(hy - rr, p.y)),
                        max(-hz + rr, min(hz - rr, p.z))))
        d = p - inner
        v.co = inner + (d.normalized() * rr if d.length > 1e-9 else d)
    return mesh_obj(name, bm)


def box(name, x0, x1, y0, y1, z0, z1, mat, bevel=0.002):
    """Pavé dont les sommets sont aux coordonnées données ; l'objet reste à
    l'origine, si bien que ses coordonnées « Object » sont celles du monde (le
    veinage se suit d'une pièce à l'autre) et qu'un objet construit en repère
    local (porte autour de sa charnière) se place simplement par `location`."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((x0 + (v.co.x + 0.5) * (x1 - x0),
                       y0 + (v.co.y + 0.5) * (y1 - y0),
                       z0 + (v.co.z + 0.5) * (z1 - z0)))
    o = mesh_obj(name, bm)
    if bevel:
        m = o.modifiers.new("bev", "BEVEL")
        m.width = bevel
        m.segments = 2
        m.limit_method = "NONE"
    o.data.materials.append(mat)
    return o


# ------------------------------------------------------------------ matières
def node_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    return m, nt, bsdf


def mat_plain(name, col, rough=0.8, sheen=0.0, spec=0.5, bump=0.0, bump_scale=200.0):
    m, nt, b = node_mat(name)
    b.inputs["Base Color"].default_value = srgb(col)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Specular IOR Level"].default_value = spec
    if sheen:
        b.inputs["Sheen Weight"].default_value = sheen
        b.inputs["Sheen Roughness"].default_value = 0.6
    if bump:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        nz = nt.nodes.new("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = bump_scale
        nz.inputs["Detail"].default_value = 6
        bp = nt.nodes.new("ShaderNodeBump")
        bp.inputs["Strength"].default_value = bump
        bp.inputs["Distance"].default_value = 0.002
        nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
        nt.links.new(nz.outputs["Fac"], bp.inputs["Height"])
        nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def mat_knit(name, col, rib_scale=90.0, axis="X"):
    """Maille : côtes régulières + duvet, éclairage velouté (sheen)."""
    m, nt, b = node_mat(name)
    b.inputs["Roughness"].default_value = 0.95
    b.inputs["Specular IOR Level"].default_value = 0.25
    b.inputs["Sheen Weight"].default_value = 0.8
    b.inputs["Sheen Roughness"].default_value = 0.5
    tc = nt.nodes.new("ShaderNodeTexCoord")
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.wave_type = "BANDS"
    wave.bands_direction = axis
    wave.inputs["Scale"].default_value = rib_scale
    wave.inputs["Distortion"].default_value = 1.5
    wave.inputs["Detail"].default_value = 2
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 260
    nz.inputs["Detail"].default_value = 8
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "FLOAT"
    mix.inputs["Factor"].default_value = 0.35
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = 0.35
    bp.inputs["Distance"].default_value = 0.003
    nt.links.new(tc.outputs["Object"], wave.inputs["Vector"])
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    nt.links.new(wave.outputs["Fac"], mix.inputs["A"])
    nt.links.new(nz.outputs["Fac"], mix.inputs["B"])
    nt.links.new(mix.outputs["Result"], bp.inputs["Height"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    # légère variation de teinte dans la maille
    cr = nt.nodes.new("ShaderNodeValToRGB")
    base = srgb(col)
    cr.color_ramp.elements[0].color = tuple(c * 0.86 for c in base[:3]) + (1,)
    cr.color_ramp.elements[1].color = base
    nt.links.new(mix.outputs["Result"], cr.inputs["Fac"])
    nt.links.new(cr.outputs["Color"], b.inputs["Base Color"])
    return m


def mat_oak(name, light="#e2cfae", dark="#c3a47c", along="Z", planks=False, gloss=0.42, grain=38.0):
    """Chêne clair : veinage ondulé, étiré dans le sens du fil (`along`) ;
    pour le parquet, lames de 18 cm x 1,4 m dans l'axe de la caméra."""
    m, nt, b = node_mat(name)
    b.inputs["Specular IOR Level"].default_value = 0.45
    L = nt.links.new
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    sc_ = {"X": (0.1, 1, 1), "Y": (1, 0.1, 1), "Z": (1, 1, 0.1)}[along]
    mp.inputs["Scale"].default_value = sc_
    L(tc.outputs["Object"], mp.inputs["Vector"])
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.wave_type = "BANDS"
    wave.bands_direction = "Y" if along == "X" else "X"
    wave.inputs["Scale"].default_value = grain
    wave.inputs["Distortion"].default_value = 7.0
    wave.inputs["Detail"].default_value = 3
    wave.inputs["Detail Scale"].default_value = 1.5
    L(mp.outputs["Vector"], wave.inputs["Vector"])
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 9
    nz.inputs["Detail"].default_value = 5
    L(mp.outputs["Vector"], nz.inputs["Vector"])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "FLOAT"
    mix.inputs["Factor"].default_value = 0.45
    L(wave.outputs["Fac"], mix.inputs["A"])
    L(nz.outputs["Fac"], mix.inputs["B"])
    cr = nt.nodes.new("ShaderNodeValToRGB")
    cr.color_ramp.elements[0].position = 0.2
    cr.color_ramp.elements[0].color = srgb(dark)
    cr.color_ramp.elements[1].position = 0.85
    cr.color_ramp.elements[1].color = srgb(light)
    L(mix.outputs["Result"], cr.inputs["Fac"])
    col = cr.outputs["Color"]
    rr = nt.nodes.new("ShaderNodeMapRange")
    rr.inputs["To Min"].default_value = gloss - 0.06
    rr.inputs["To Max"].default_value = gloss + 0.1
    L(nz.outputs["Fac"], rr.inputs["Value"])
    L(rr.outputs["Result"], b.inputs["Roughness"])
    if planks:
        rot = nt.nodes.new("ShaderNodeMapping")
        rot.inputs["Rotation"].default_value = (0, 0, math.pi / 2)
        L(tc.outputs["Object"], rot.inputs["Vector"])
        br = nt.nodes.new("ShaderNodeTexBrick")
        br.offset = 0.37
        br.offset_frequency = 1
        br.squash = 1.0
        br.squash_frequency = 1
        br.inputs["Scale"].default_value = 1.0
        br.inputs["Mortar Size"].default_value = 0.0025
        br.inputs["Mortar Smooth"].default_value = 0.4
        br.inputs["Brick Width"].default_value = 1.4
        br.inputs["Row Height"].default_value = 0.18
        br.inputs["Bias"].default_value = 0.0
        br.inputs["Color1"].default_value = (0.86, 0.86, 0.86, 1)
        br.inputs["Color2"].default_value = (1.07, 1.07, 1.07, 1)
        br.inputs["Mortar"].default_value = (0.5, 0.5, 0.5, 1)
        L(rot.outputs["Vector"], br.inputs["Vector"])
        mul = nt.nodes.new("ShaderNodeMix")
        mul.data_type = "RGBA"
        mul.blend_type = "MULTIPLY"
        mul.inputs["Factor"].default_value = 1.0
        L(col, mul.inputs["A"])
        L(br.outputs["Color"], mul.inputs["B"])
        col = mul.outputs["Result"]
        bp = nt.nodes.new("ShaderNodeBump")
        bp.invert = True
        bp.inputs["Strength"].default_value = 0.4
        bp.inputs["Distance"].default_value = 0.002
        L(br.outputs["Fac"], bp.inputs["Height"])
        L(bp.outputs["Normal"], b.inputs["Normal"])
    else:
        bp = nt.nodes.new("ShaderNodeBump")
        bp.inputs["Strength"].default_value = 0.05
        bp.inputs["Distance"].default_value = 0.001
        L(wave.outputs["Fac"], bp.inputs["Height"])
        L(bp.outputs["Normal"], b.inputs["Normal"])
    L(col, b.inputs["Base Color"])
    return m


# palette : blanc cassé, chêne clair, lin, gris doux, bleu poudré, marine, jaune paille
C_WALL = "#e7e2d9"
C_STRAW = "#d8c27c"
M = {
    "wall": mat_plain("mur", C_WALL, rough=0.92, spec=0.3, bump=0.06, bump_scale=60),
    "ceil": mat_plain("plafond", "#efece6", rough=0.95, spec=0.2),
    "trim": mat_plain("plinthe", "#f1eee8", rough=0.55, spec=0.4),
    "floor": mat_oak("parquet", light="#dfcbab", dark="#c2a47e", along="Y", planks=True, gloss=0.36, grain=30),
    "oak": mat_oak("chene", light="#e4d3b6", dark="#cbb08b", along="Z", gloss=0.5),
    "oak_end": mat_oak("chene-chant", light="#d9c3a0", dark="#c09f78", along="X", gloss=0.5),
    "rail": mat_plain("tringle", "#2b2a28", rough=0.35, spec=0.6),
    "hanger": mat_oak("cintre", light="#e0caa6", dark="#cfb38c", along="Y", gloss=0.35, grain=80),
    "linen": mat_plain("lin-blanc", "#f2f0eb", rough=0.9, sheen=0.6, spec=0.3, bump=0.25, bump_scale=420),
    "linen_g": mat_plain("lin-gris", "#d6d3cc", rough=0.9, sheen=0.6, spec=0.3, bump=0.25, bump_scale=420),
    "box_w": mat_plain("boite-lin", "#e6e1d6", rough=0.88, sheen=0.4, spec=0.3, bump=0.3, bump_scale=380),
    "box_s": mat_plain("boite-paille", C_STRAW, rough=0.85, sheen=0.4, spec=0.3, bump=0.35, bump_scale=300),
    "box_g": mat_plain("boite-gris", "#c9c6bf", rough=0.88, sheen=0.4, spec=0.3, bump=0.3, bump_scale=380),
    "ceram": mat_plain("ceramique", "#efebe3", rough=0.3, spec=0.5, bump=0.08, bump_scale=30),
    "stem": mat_plain("tiges", "#d9c58c", rough=0.75, spec=0.3),
    "rug": mat_plain("tapis", "#cdc4b3", rough=1.0, sheen=1.0, spec=0.2, bump=0.6, bump_scale=160),
    "frame": mat_plain("menuiserie", "#f4f2ee", rough=0.5, spec=0.4),
}
KNIT = {
    "ecru": mat_knit("maille-ecru", "#ebe3d3"),
    "sand": mat_knit("maille-sable", "#d4c2a4"),
    "grey": mat_knit("maille-gris", "#b9b7b2"),
    "char": mat_knit("maille-anthracite", "#55565a"),
    "navy": mat_knit("maille-marine", "#2f3a52"),
    "straw": mat_knit("maille-paille", C_STRAW),
    "sage": mat_knit("maille-sauge", "#aab3a0"),
    "white": mat_knit("maille-blanc", "#f1efea"),
}
COTTON = {
    "white": mat_plain("coton-blanc", "#f3f2ee", rough=0.8, sheen=0.5, spec=0.35, bump=0.15, bump_scale=600),
    "ecru": mat_plain("coton-ecru", "#e8e1d2", rough=0.8, sheen=0.5, spec=0.35, bump=0.15, bump_scale=600),
    "sky": mat_plain("coton-ciel", "#bccbdb", rough=0.8, sheen=0.5, spec=0.35, bump=0.15, bump_scale=600),
    "chambray": mat_plain("coton-chambray", "#8a9db4", rough=0.85, sheen=0.5, spec=0.3, bump=0.2, bump_scale=600),
    "grey": mat_plain("coton-gris", "#bdbbb6", rough=0.85, sheen=0.5, spec=0.3, bump=0.2, bump_scale=600),
    "sand": mat_plain("coton-sable", "#cdbb9c", rough=0.85, sheen=0.5, spec=0.3, bump=0.2, bump_scale=600),
    "straw": mat_plain("coton-paille", "#dcc888", rough=0.85, sheen=0.5, spec=0.3, bump=0.2, bump_scale=600),
    "sage": mat_plain("coton-sauge", "#a7b19e", rough=0.85, sheen=0.5, spec=0.3, bump=0.2, bump_scale=600),
    "navy": mat_plain("coton-marine", "#323d55", rough=0.85, sheen=0.5, spec=0.3, bump=0.2, bump_scale=600),
}

# ------------------------------------------------------------------ pièce
RX0, RX1, RY0, RY1, RZ = -3.2, 3.4, -8.0, 0.30, 2.80
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)

floor = box("sol", RX0, RX1, RY0, RY1, -0.05, 0.0, M["floor"], bevel=0)
box("plafond", RX0, RX1, RY0, RY1, RZ, RZ + 0.05, M["ceil"], bevel=0)
box("mur-fond", RX0, RX1, RY1, RY1 + 0.1, 0, RZ, M["wall"], bevel=0)
box("mur-avant", RX0, RX1, RY0 - 0.1, RY0, 0, RZ, M["wall"], bevel=0)
box("mur-droit", RX1, RX1 + 0.1, RY0, RY1, 0, RZ, M["wall"], bevel=0)
# mur gauche percé d'une grande fenêtre
WY0, WY1, WZ0, WZ1 = -4.5, -1.7, 0.42, 2.48
box("mur-g-a", RX0 - 0.15, RX0, RY0, WY0, 0, RZ, M["wall"], bevel=0)
box("mur-g-b", RX0 - 0.15, RX0, WY1, RY1, 0, RZ, M["wall"], bevel=0)
box("mur-g-c", RX0 - 0.15, RX0, WY0, WY1, 0, WZ0, M["wall"], bevel=0)
box("mur-g-d", RX0 - 0.15, RX0, WY0, WY1, WZ1, RZ, M["wall"], bevel=0)
# menuiserie : cadre, meneau, traverse, appui
ft = 0.055
box("cadre-1", RX0 - 0.1, RX0 - 0.02, WY0, WY0 + ft, WZ0, WZ1, M["frame"])
box("cadre-2", RX0 - 0.1, RX0 - 0.02, WY1 - ft, WY1, WZ0, WZ1, M["frame"])
box("cadre-3", RX0 - 0.1, RX0 - 0.02, WY0, WY1, WZ0, WZ0 + ft, M["frame"])
box("cadre-4", RX0 - 0.1, RX0 - 0.02, WY0, WY1, WZ1 - ft, WZ1, M["frame"])
box("meneau", RX0 - 0.1, RX0 - 0.03, (WY0 + WY1) / 2 - 0.03, (WY0 + WY1) / 2 + 0.03, WZ0, WZ1, M["frame"])
box("traverse", RX0 - 0.1, RX0 - 0.03, WY0, WY1, 1.92, 1.96, M["frame"])
box("appui", RX0, RX0 + 0.06, WY0 - 0.05, WY1 + 0.05, WZ0 - 0.03, WZ0, M["trim"])
# plinthes
for nm, a in (("pl-fond", (RX0, RX1, RY1 - 0.012, RY1, 0, 0.075)),
              ("pl-droite", (RX1 - 0.012, RX1, RY0, RY1, 0, 0.075)),
              ("pl-gauche", (RX0, RX0 + 0.012, RY0, RY1, 0, 0.075))):
    box(nm, *a, M["trim"])

# ------------------------------------------------------------------ armoire
AX0, AX1, AY0, AY1, AH = -1.15, 1.15, -0.32, 0.28, 2.10
T = 0.022
DIV = 0.08
box("flanc-g", AX0, AX0 + T, AY0, AY1, 0.0, AH, M["oak"])
box("flanc-d", AX1 - T, AX1, AY0, AY1, 0.0, AH, M["oak"])
box("dessus", AX0, AX1, AY0, AY1, AH - T, AH, M["oak"])
box("fond", AX0 + T, AX1 - T, AY1 - 0.012, AY1, 0.06, AH - T, M["oak"])
box("socle", AX0 + T, AX1 - T, AY0 + 0.03, AY1, 0.0, 0.06, M["oak_end"])
box("bas", AX0 + T, AX1 - T, AY0, AY1 - 0.012, 0.06, 0.06 + T, M["oak"])
box("separation", DIV, DIV + T, AY0, AY1 - 0.012, 0.06 + T, AH - T, M["oak"])
SHELF_L = 1.72
box("tablette-g", AX0 + T, DIV, AY0 + 0.01, AY1 - 0.012, SHELF_L, SHELF_L + T, M["oak"])
SHELVES_R = [0.47, 0.86, 1.25, 1.64]
for i, z in enumerate(SHELVES_R):
    box(f"tablette-d{i}", DIV + T, AX1 - T, AY0 + 0.01, AY1 - 0.012, z, z + T, M["oak"])
# tringle
bpy.ops.mesh.primitive_cylinder_add(radius=0.011, depth=DIV - AX0 - 2 * T, vertices=24,
                                    location=((AX0 + T + DIV) / 2, -0.02, 1.665),
                                    rotation=(0, math.pi / 2, 0))
rail = bpy.context.active_object
rail.data.materials.append(M["rail"])
smooth(rail, 0)

# portes ouvertes (charnières sur les flancs)
DOOR_W = (AX1 - AX0) / 2
for side in (-1, 1):
    hx = AX0 if side < 0 else AX1
    d = box(f"porte{side}", 0, DOOR_W, -0.022, 0, 0.0, AH, M["oak"])
    # poignée fine, côté intérieur ouvert
    h = box(f"poignee{side}", DOOR_W - 0.06, DOOR_W - 0.045, -0.05, -0.022, 0.85, 1.25, M["rail"], bevel=0.003)
    h.parent = d
    d.location = (hx, AY0, 0)
    # porte gauche : -112° (vers l'avant-gauche) ; droite : 180° + 112°
    ang = math.radians(97)
    d.rotation_euler = (0, 0, -ang if side < 0 else math.pi + ang)

# ------------------------------------------------------------------ mobilier de la chambre
# lit bas en chêne contre le mur droit
BX0, BX1, BY0, BY1 = 1.30, 3.38, -4.75, -3.05
box("lit-cadre", BX0, BX1, BY0, BY1, 0.08, 0.26, M["oak"], bevel=0.01)
for (x, y) in ((BX0 + 0.06, BY0 + 0.06), (BX0 + 0.06, BY1 - 0.06), (BX1 - 0.06, BY0 + 0.06), (BX1 - 0.06, BY1 - 0.06)):
    box("pied", x - 0.03, x + 0.03, y - 0.03, y + 0.03, 0, 0.08, M["oak_end"], bevel=0.004)
box("tete-lit", BX1 - 0.06, BX1 - 0.02, BY0, BY1, 0.08, 0.95, M["oak"], bevel=0.008)
matt = rounded_box("matelas", BX1 - BX0 - 0.12, BY1 - BY0 - 0.08, 0.2, r=0.35, cuts=8)
matt.location = ((BX0 + BX1) / 2 - 0.03, (BY0 + BY1) / 2, 0.38)
matt.data.materials.append(M["linen"])
smooth(matt, 1)
tex = bpy.data.textures.new("plis", "CLOUDS")
tex.noise_scale = 0.16
tex.noise_depth = 3


def drape(name, x0, x1, y0, y1, top, size_x, size_y, cx, cy, drop=0.3, rad=0.07, wr=0.025, nu=70, nv=60,
          seed=0.0):
    """Tissu posé sur un plateau rectangulaire [x0,x1]×[y0,y1] à la hauteur `top`,
    qui s'enroule sur l'arête (rayon `rad`) puis retombe verticalement."""
    bm = bmesh.new()
    g = []
    for j in range(nv + 1):
        row = []
        for i in range(nu + 1):
            x = cx - size_x / 2 + size_x * i / nu
            y = cy - size_y / 2 + size_y * j / nv
            # distance au-delà du plateau, et direction vers l'extérieur
            dx = x - min(max(x, x0), x1)
            dy = y - min(max(y, y0), y1)
            d = math.hypot(dx, dy)
            px, py, pz = x, y, top
            if d > 1e-6:
                ox, oy = dx / d, dy / d
                ex, ey = x - dx, y - dy
                arc = rad * math.pi / 2
                if d < arc:
                    a_ = d / rad
                    px, py = ex + ox * rad * math.sin(a_), ey + oy * rad * math.sin(a_)
                    pz = top - rad + rad * math.cos(a_)
                else:
                    h = min(d - arc, drop)
                    px, py = ex + ox * rad, ey + oy * rad
                    pz = top - rad - h
                    if d - arc > drop:  # le surplus se plisse au bas du tombé
                        px += ox * (d - arc - drop) * 0.3
            n = noise.noise(Vector((x * 6 + seed, y * 6, 0.3)))
            n2 = noise.noise(Vector((x * 17, y * 17 + seed, 1.7)))
            pz += wr * n + wr * 0.35 * n2
            row.append(bm.verts.new((px, py, pz)))
        g.append(row)
    for j in range(nv):
        for i in range(nu):
            bm.faces.new((g[j][i], g[j][i + 1], g[j + 1][i + 1], g[j + 1][i]))
    o = mesh_obj(name, bm)
    so = o.modifiers.new("ep", "SOLIDIFY")
    so.thickness = 0.025
    so.offset = 1
    smooth(o, 1, 1)
    return o


MT = 0.50  # dessus du matelas
duvet = drape("couette", BX0 + 0.06, BX1 - 0.06, BY0 + 0.04, BY1 - 0.04, MT + 0.05,
              size_x=BX1 - BX0 - 0.36 + 0.3, size_y=BY1 - BY0 + 0.5, cx=(BX0 + BX1) / 2 - 0.2,
              cy=(BY0 + BY1) / 2, drop=0.26, rad=0.09, wr=0.03, seed=2.0)
# la couette ne couvre pas le haut du lit (oreillers) : on rogne côté tête
duvet.data.materials.append(M["linen"])
throw = drape("plaid", BX0 + 0.06, BX1 - 0.06, BY0 + 0.04, BY1 - 0.04, MT + 0.1,
              size_x=0.62, size_y=BY1 - BY0 + 0.62, cx=BX0 + 0.42, cy=(BY0 + BY1) / 2 + 0.03,
              drop=0.34, rad=0.14, wr=0.02, nu=30, seed=5.0)
throw.data.materials.append(KNIT["straw"])
for i, y in enumerate((BY0 + 0.45, BY1 - 0.45)):
    pw = rounded_box(f"oreiller{i}", 0.46, 0.7, 0.2, r=1.0, cuts=8)
    pw.location = (BX1 - 0.3, y, 0.63)
    pw.rotation_euler = (0, math.radians(-14), math.radians(2 - 4 * i))
    pw.data.materials.append(M["linen"] if i else M["linen_g"])
    smooth(pw, 2)
# tapis de laine
rug = rounded_box("tapis", 2.6, 1.9, 0.014, r=0.6, cuts=4)
rug.location = (0.15, -2.35, 0.007)
rug.data.materials.append(M["rug"])
smooth(rug, 1)
# vase et herbes sèches à gauche de l'armoire
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, segments=48, ring_count=24, location=(-2.62, -0.05, 0.2))
vase = bpy.context.active_object
vase.scale = (1, 1, 1.35)
vase.data.materials.append(M["ceram"])
smooth(vase, 1)
for i in range(16):
    a = R.uniform(-0.45, 0.45)
    b = R.uniform(0, 2 * math.pi)
    ln = R.uniform(0.75, 1.15)
    cu = bpy.data.curves.new(f"tige{i}", "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = 0.0028
    cu.bevel_resolution = 1
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(1)
    p0 = Vector((-2.62, -0.05, 0.4))
    dirv = Vector((math.sin(a) * math.cos(b), math.sin(a) * math.sin(b) * 0.6, math.cos(a)))
    p1 = p0 + dirv * ln
    sp.bezier_points[0].co = p0
    sp.bezier_points[0].handle_left = p0 - dirv * 0.1
    sp.bezier_points[0].handle_right = p0 + dirv * 0.35
    sp.bezier_points[1].co = p1
    sp.bezier_points[1].handle_left = p1 - dirv * 0.3 + Vector((0, 0, 0.05))
    sp.bezier_points[1].handle_right = p1 + dirv * 0.1
    o = link(bpy.data.objects.new(f"tige{i}", cu))
    o.data.materials.append(M["stem"])
    # épi plumeux au bout
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.022, segments=12, ring_count=8, location=p1)
    ep = bpy.context.active_object
    ep.scale = (1, 1, 3.2)
    ep.rotation_euler = dirv.to_track_quat("Z", "Y").to_euler()
    ep.data.materials.append(M["stem"])

# suspension en papier au plafond (hors champ à la fin du travelling)
paper = bpy.data.materials.new("papier")
paper.use_nodes = True
pn = paper.node_tree
pb = pn.nodes["Principled BSDF"]
pb.inputs["Base Color"].default_value = srgb("#f3efe6")
pb.inputs["Roughness"].default_value = 0.9
pb.inputs["Subsurface Weight"].default_value = 0.6
pb.inputs["Subsurface Radius"].default_value = (0.3, 0.3, 0.25)
pb.inputs["Subsurface Scale"].default_value = 0.05
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.27, segments=48, ring_count=32, location=(0.75, -3.4, 2.22))
lamp = bpy.context.active_object
lamp.scale = (1, 1, 0.92)
for v in lamp.data.vertices:
    # côtes horizontales du papier plissé
    v.co *= 1.0 + 0.012 * math.sin(math.asin(max(-1, min(1, v.co.z / 0.27))) * 26)
lamp.data.materials.append(paper)
smooth(lamp, 1)
bpy.ops.mesh.primitive_cylinder_add(radius=0.0025, depth=RZ - 2.47, location=(0.75, -3.4, (RZ + 2.47) / 2))
bpy.context.active_object.data.materials.append(M["rail"])

# voilage de lin, retenu sur le côté de la fenêtre
veil = bpy.data.materials.new("voilage")
veil.use_nodes = True
vn = veil.node_tree
vb = vn.nodes["Principled BSDF"]
vb.inputs["Base Color"].default_value = srgb("#f4f1ea")
vb.inputs["Roughness"].default_value = 0.85
vb.inputs["Transmission Weight"].default_value = 0.0
vb.inputs["Subsurface Weight"].default_value = 0.0
tr = vn.nodes.new("ShaderNodeBsdfTranslucent")
tr.inputs["Color"].default_value = srgb("#f1ece0")
mx = vn.nodes.new("ShaderNodeMixShader")
mx.inputs["Fac"].default_value = 0.45
vn.links.new(vb.outputs["BSDF"], mx.inputs[1])
vn.links.new(tr.outputs["BSDF"], mx.inputs[2])
vn.links.new(mx.outputs["Shader"], vn.nodes["Material Output"].inputs["Surface"])
bm = bmesh.new()
nu, nv = 60, 30
grid = [[bm.verts.new((0, 0, 0)) for i in range(nu + 1)] for j in range(nv + 1)]
for j in range(nv + 1):
    for i in range(nu + 1):
        u, t = i / nu, j / nv
        y = WY1 - 0.18 + u * 0.62
        z = 0.03 + t * (RZ - 0.1)
        x = RX0 + 0.09 + 0.035 * math.sin(u * 2 * math.pi * 7) + 0.008 * noise.noise(Vector((u * 8, t * 3, 1)))
        grid[j][i].co = (x, y, z)
for j in range(nv):
    for i in range(nu):
        bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
curtain = mesh_obj("voilage", bm)
curtain.data.materials.append(veil)
smooth(curtain, 1)

# ------------------------------------------------------------------ acteurs animés
ACTORS = []


class Actor:
    """Un objet qui va d'un état désordonné à un état rangé entre p=a et p=b.

    Le trajet suit une courbe de Bézier quadratique dont le point de contrôle est
    relevé de `lift` : les vêtements « volent » vers leur place au lieu de glisser.
    `morph` pilote une clé de forme (1 = froissé, 0 = plié) sur une fenêtre
    décalée, pour que le pli se fasse pendant le vol et pas à l'atterrissage.
    """

    def __init__(self, obj, a, b, loc0, rot0, loc1, rot1, lift=0.0, morph=None, scale0=1.0, scale1=1.0,
                 sway=0.0):
        self.o, self.a, self.b = obj, a, b
        self.l0, self.l1 = Vector(loc0), Vector(loc1)
        self.q0 = Euler(rot0).to_quaternion()
        self.q1 = Euler(rot1).to_quaternion()
        self.lift = lift
        self.morph = morph or []
        self.s0, self.s1 = scale0, scale1
        self.sway = sway
        obj.rotation_mode = "QUATERNION"
        ACTORS.append(self)

    def apply(self, p):
        t = span(p, self.a, self.b)
        mid = (self.l0 + self.l1) / 2 + Vector((0, 0, self.lift))
        loc = (1 - t) ** 2 * self.l0 + 2 * (1 - t) * t * mid + t * t * self.l1
        q = self.q0.slerp(self.q1, t)
        if self.sway:
            # petit balancement amorti autour de l'axe de la tringle
            s = math.sin(t * math.pi * 3) * self.sway * (1 - t) * t * 4
            q = q @ Euler((s, 0, 0)).to_quaternion()
        self.o.location = loc
        self.o.rotation_quaternion = q
        s = self.s0 + (self.s1 - self.s0) * t
        self.o.scale = (s, s, s) if isinstance(s, float) else s
        for kb, ma, mb in self.morph:
            kb.value = 1.0 - span(p, ma, mb)


def crumple_key(o, amp, sx=1.5, sy=1.3, sz=0.7, seed=0.0, fold_axis=None):
    """Ajoute une clé de forme « froissé » : élargi, aplati, bosselé."""
    o.shape_key_add(name="Basis")
    k = o.shape_key_add(name="froisse")
    off = Vector((seed * 3.1, seed * 1.7, seed * 2.3))
    hx = max(abs(v.co.x) for v in o.data.vertices) or 1
    hy = max(abs(v.co.y) for v in o.data.vertices) or 1
    for i, v in enumerate(o.data.vertices):
        c = v.co
        base = Vector((c.x * sx, c.y * sy, c.z * sz))
        n1 = noise.noise_vector(c * 4.0 + off)
        n2 = noise.noise_vector(c * 11.0 + off * 2)
        d = n1 * amp + n2 * amp * 0.35
        # les bords retombent : on abaisse ce qui est loin du centre
        r = math.hypot(c.x / hx, c.y / hy)
        base.z -= amp * 0.9 * r * r
        # bourrelets : le tissu fait des vagues, pas une crêpe
        base.z += amp * 0.9 * noise.noise(c * 7.0 + off * 3)
        k.data[i].co = base + d
    return k


def make_folded(name, mat, w=0.40, h=0.075, d=0.32, seed=0.0, amp=0.05, sx=1.35, sy=1.25, sz=1.6):
    o = rounded_box(name, w, d, h, r=0.55, cuts=7)
    o.data.materials.append(mat)
    k = crumple_key(o, amp, sx=sx, sy=sy, sz=sz, seed=seed)
    smooth(o, 1, 1)
    return o, k


def make_sleeves(parent, mat, seed):
    """Deux manches qui dépassent du pull froissé, rentrées une fois plié."""
    out = []
    for side in (-1, 1):
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=0.04, radius2=0.034, depth=0.36)
        bmesh.ops.subdivide_edges(bm, edges=[e for e in bm.edges if abs(e.verts[0].co.z - e.verts[1].co.z) > 0.1],
                                  cuts=6)
        for v in bm.verts:
            t = v.co.z / 0.36 + 0.5
            v.co.x += math.sin(t * 2.4 + seed + side) * 0.06
            v.co.y += math.sin(t * 3.1 + seed * 2) * 0.03
            v.co.z *= 1.0
            v.co.y *= 0.75 if abs(v.co.z) < 0.18 else 0.75
        o = mesh_obj(f"{parent.name}-manche{side}", bm)
        o.data.materials.append(mat)
        smooth(o, 1, 2)
        o.parent = parent
        o.location = (side * 0.27, 0.06 * side, -0.01)
        o.rotation_euler = (math.radians(90), math.radians(-8 * side), math.radians(side * (55 + seed * 8)))
        o.scale = (1, 0.6, 1)
        out.append(o)
    return out


# ---- piles de pulls (compartiments de droite) ----
STACK_X = [DIV + T + 0.265, AX1 - T - 0.265]
YS = -0.035  # milieu de la profondeur utile
seed = 0
stack_plan = [
    # (étagère, x de pile, [couleurs du bas vers le haut], épaisseur)
    (0, 0, ["navy", "char", "grey", "sand"], 0.078),
    (0, 1, ["sage", "grey", "ecru", "white"], 0.078),
    (1, 0, ["sand", "straw", "ecru", "white"], 0.078),
    (1, 1, ["char", "navy", "grey", "sage"], 0.078),
    (2, 0, ["ecru", "sand", "straw"], 0.085),
    (2, 1, ["white", "ecru", "grey", "white", "sky"], 0.05),  # t-shirts, plus fins
]
folded = []
for shelf_i, sx_i, cols, th in stack_plan:
    base_z = SHELVES_R[shelf_i] + T
    for j, c in enumerate(cols):
        mat = KNIT.get(c) or COTTON[c]
        w = 0.40 if th > 0.06 else 0.36
        o, k = make_folded(f"pli-{shelf_i}-{sx_i}-{j}", mat, w=w, h=th, d=0.31, seed=seed,
                           amp=0.06 if th > 0.06 else 0.04)
        seed += 1
        tidy = (STACK_X[sx_i] + R.uniform(-0.004, 0.004), YS + R.uniform(-0.004, 0.004), base_z + th * (j + 0.5))
        folded.append(dict(o=o, k=k, tidy=tidy, th=th, shelf=shelf_i, sx=sx_i, j=j))

# Désordre : certains vêtements au sol, deux sur le lit, le reste en vrac sur leur étagère.
floor_spots = [(-0.55, -0.95), (0.35, -1.25), (0.95, -0.75), (-1.15, -1.55), (0.0, -1.85),
               (1.35, -1.6), (-0.15, -0.62), (0.65, -2.25)]
bed_spots = [(1.75, -3.55), (2.15, -4.2)]
order = list(range(len(folded)))
R.shuffle(order)
floor_ids = set(order[:8])
bed_ids = set(order[8:10])
fi = bi = 0
fly_idx = 0
for idx, f in enumerate(folded):
    o, k = f["o"], f["k"]
    tid = Vector(f["tidy"])
    rot1 = (0, 0, R.uniform(-0.012, 0.012))
    if idx in floor_ids:
        x, y = floor_spots[fi]; fi += 1
        loc0 = (x, y, 0.07)
        rot0 = (R.uniform(-0.08, 0.08), R.uniform(-0.08, 0.08), R.uniform(0, math.pi * 2))
        a = 0.16 + fly_idx * 0.028
        b = a + 0.17
        lift = 0.55 + R.uniform(0, 0.25)
        sl = make_sleeves(o, o.data.materials[0], seed=idx * 0.37) if f["th"] > 0.06 else []
        Actor(o, a, b, loc0, rot0, tid, rot1, lift=lift, morph=[(k, a, a + (b - a) * 0.8)])
        for s in sl:
            # les manches se replient sous le corps pendant le vol
            Actor(s, a, a + (b - a) * 0.7, s.location.copy(), s.rotation_euler.copy(),
                  (0, 0, 0), (math.radians(90), 0, 0), scale0=1.0, scale1=0.02)
        fly_idx += 1
    elif idx in bed_ids:
        x, y = bed_spots[bi]; bi += 1
        loc0 = (x, y, 0.67)
        rot0 = (R.uniform(-0.1, 0.1), R.uniform(-0.1, 0.1), R.uniform(0, math.pi * 2))
        a = 0.2 + bi * 0.05
        b = a + 0.22
        sl = make_sleeves(o, o.data.materials[0], seed=idx * 0.37) if f["th"] > 0.06 else []
        Actor(o, a, b, loc0, rot0, tid, rot1, lift=0.9, morph=[(k, a, a + (b - a) * 0.8)])
        for s in sl:
            Actor(s, a, a + (b - a) * 0.7, s.location.copy(), s.rotation_euler.copy(),
                  (0, 0, 0), (math.radians(90), 0, 0), scale0=1.0, scale1=0.02)
    else:
        # en vrac sur l'étagère : décalé, penché, entassé de travers
        base_z = SHELVES_R[f["shelf"]] + T
        loc0 = (tid.x + R.uniform(-0.13, 0.13), tid.y + R.uniform(-0.09, 0.05),
                base_z + 0.05 + f["j"] * 0.055)
        rot0 = (R.uniform(-0.25, 0.25), R.uniform(-0.3, 0.3), R.uniform(-0.9, 0.9))
        a = 0.22 + R.uniform(0, 0.2)
        b = a + 0.2
        Actor(o, a, b, loc0, rot0, tid, rot1, lift=0.12, morph=[(k, a - 0.02, b - 0.03)])

# ---- chemises sur cintres (compartiment de gauche) ----
SHIRT_COLS = ["white", "white", "ecru", "sky", "chambray", "sage", "straw", "sand", "grey", "navy"]
N_SH = len(SHIRT_COLS)
RAIL_Z = 1.665
x_lo, x_hi = AX0 + T + 0.08, DIV - 0.07
tidy_x = [x_lo + i * (x_hi - x_lo) / (N_SH - 1) for i in range(N_SH)]


def make_shirt(name, mat, seed):
    """Chemise vue de profil sur son cintre : plaque souple, épaules tombantes,
    plis verticaux. Repère : origine au crochet, largeur selon Y, hauteur −Z."""
    bm = bmesh.new()
    nu, nv = 14, 26
    L = 0.80
    verts = []
    for j in range(nv + 1):
        s = j / nv
        row = []
        for i in range(nu + 1):
            u = i / nu * 2 - 1
            if s < 0.09:
                hw = 0.07 + (0.235 - 0.07) * (s / 0.09) ** 0.7
            else:
                hw = 0.235 + 0.01 * math.sin(s * 3)
            y = u * hw
            z = -0.045 - s * L
            x = 0.0
            row.append(bm.verts.new((x, y, z)))
        verts.append(row)
    for j in range(nv):
        for i in range(nu):
            bm.faces.new((verts[j][i], verts[j][i + 1], verts[j + 1][i + 1], verts[j + 1][i]))
    o = mesh_obj(name, bm)
    vg = o.vertex_groups.new(name="ep")
    for v in o.data.vertices:
        s_ = min(1.0, max(0.0, (-v.co.z - 0.045) / L))
        u_ = abs(v.co.y) / 0.24
        w_ = (1.0 - 0.55 * s_) * (1.0 - 0.35 * u_ ** 4)
        vg.add([v.index], w_, "REPLACE")
    sol = o.modifiers.new("ep", "SOLIDIFY")
    sol.thickness = 0.07
    sol.offset = 0
    sol.vertex_group = "ep"
    sol.thickness_vertex_group = 0.25
    o.data.materials.append(mat)
    # plis verticaux doux (dans la clé de base) + version froissée
    off = seed * 5.3
    for v in o.data.vertices:
        c = v.co
        s = -c.z
        v.co.x += (0.014 * math.sin(c.y * 31 + off) + 0.008 * math.sin(c.y * 67 + off * 2)) * min(1, s * 2.5) \
            + 0.01 * noise.noise(c * 7 + Vector((off, 0, 0)))
        # ourlet légèrement irrégulier
        if s > 0.7:
            v.co.z += 0.02 * noise.noise(Vector((c.y * 6, off, 0))) * (s - 0.7) / 0.15
    o.shape_key_add(name="Basis")
    k = o.shape_key_add(name="froisse")
    for i, v in enumerate(o.data.vertices):
        c = v.co
        n = noise.noise_vector(c * 5 + Vector((off, off, 0)))
        k.data[i].co = Vector((c.x + n.x * 0.06 + 0.04 * math.sin(c.z * 9 + off),
                               c.y * 1.05 + n.y * 0.03, c.z * 0.92 + n.z * 0.03))
    smooth(o, 1, 2)
    # cintre en bois + crochet
    cu = bpy.data.curves.new(name + "-cintre", "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = 0.009
    cu.bevel_resolution = 2
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(2)
    pts = [(0, -0.215, -0.075), (0, 0, -0.03), (0, 0.215, -0.075)]
    for bp_, co in zip(sp.bezier_points, pts):
        bp_.co = co
        bp_.handle_left_type = bp_.handle_right_type = "AUTO"
    hg = link(bpy.data.objects.new(name + "-cintre", cu))
    hg.data.materials.append(M["hanger"])
    cu2 = bpy.data.curves.new(name + "-crochet", "CURVE")
    cu2.dimensions = "3D"
    cu2.bevel_depth = 0.0022
    sp2 = cu2.splines.new("POLY")
    # tige, puis arc qui passe par-dessus la tringle (centre à z = -0,011)
    hook = [(0, 0, -0.036), (0, -0.014, -0.02)] + [
        (0, -0.0145 * math.cos(a), -0.011 + 0.0145 * math.sin(a))
        for a in [i * math.radians(200) / 10 for i in range(11)]]
    sp2.points.add(len(hook) - 1)
    for pt, co in zip(sp2.points, hook):
        pt.co = (*co, 1)
    hk = link(bpy.data.objects.new(name + "-crochet", cu2))
    hk.data.materials.append(M["rail"])
    return o, k, hg, hk


# Désordre : ordre des couleurs mélangé, cintres entassés, tournés ;
# deux chemises sont tombées par terre, leurs cintres vides restent sur la tringle.
messy_order = [3, 8, 0, 6, 1, 9, 4, 7, 2, 5]
messy_x = sorted([x_lo + R.uniform(0, 1) ** 1.4 * (x_hi - x_lo) * 0.85 for _ in range(N_SH)])
fallen = {6: ((-0.75, -0.78), 0.4), 2: ((-0.35, -1.35), -1.1)}
for ci, col in enumerate(SHIRT_COLS):
    o, k, hg, hk = make_shirt(f"chemise{ci}", COTTON[col], seed=ci)
    slot = messy_order.index(ci)
    tx = tidy_x[ci]
    hook_z = RAIL_Z + 0.011 - 0.0
    tidy_loc = (tx, -0.02, hook_z - 0.0)
    tidy_rot = (0, 0, -0.38)
    mloc = (messy_x[slot], -0.02 + R.uniform(-0.01, 0.01), hook_z)
    mrot = (R.uniform(-0.1, 0.1), 0, R.uniform(-0.85, 0.85))
    a = 0.34 + slot * 0.022
    b = a + 0.2
    for part in (hg, hk):
        Actor(part, a, b, mloc, mrot, tidy_loc, tidy_rot, lift=0.0, sway=0.0)
    if ci in fallen:
        (fx, fy), rz = fallen[ci]
        # couchée au sol : le plan du vêtement devient horizontal
        floor_rot = (0, math.radians(90), rz)
        fa, fb = 0.3 + 0.06 * (ci == 2), 0.52 + 0.06 * (ci == 2)
        Actor(o, fa, max(fb, b), (fx, fy, 0.042), floor_rot, tidy_loc, tidy_rot, lift=0.7,
              morph=[(k, fa, fa + 0.16)])
    else:
        Actor(o, a, b, mloc, mrot, tidy_loc, tidy_rot, lift=0.0, sway=0.12,
              morph=[(k, a - 0.04, b - 0.04)])
        k.slider_max = 1.0


# ---- boîtes de rangement ----
def make_box(name, mat, w, h, d, lid=True):
    o = rounded_box(name, w, d, h, r=0.12, cuts=3)
    o.data.materials.append(mat)
    smooth(o, 1, 1)
    parts = [o]
    if lid:
        l = rounded_box(name + "-couvercle", w + 0.012, d + 0.012, 0.035, r=0.3, cuts=2)
        l.data.materials.append(mat)
        smooth(l, 1, 1)
        parts.append(l)
    return parts


# (nom, matière, l, h, p, rangé (x, y, z_bas), désordre (x, y, z_bas, rx, ry, rz), fenêtre)
BOXES = [
    ("b-haut-1", M["box_w"], 0.36, 0.26, 0.40, (AX0 + T + 0.205, -0.03, SHELF_L + T),
     (AX0 + T + 0.26, -0.08, SHELF_L + T, 0, 0, 0.35), (0.5, 0.64)),
    ("b-haut-2", M["box_s"], 0.36, 0.26, 0.40, (AX0 + T + 0.605, -0.03, SHELF_L + T),
     (AX0 + T + 0.73, -0.10, SHELF_L + T + 0.07, 0.0, 0.42, -0.25), (0.53, 0.67)),
    ("b-haut-3", M["box_w"], 0.36, 0.26, 0.40, (AX0 + T + 1.005, -0.03, SHELF_L + T),
     (-0.95, -1.05, 0.0, 0.0, 0.0, 0.62), (0.47, 0.64)),
    ("b-bas-1", M["box_s"], 0.44, 0.30, 0.40, (STACK_X[0], -0.03, 0.06 + T),
     (STACK_X[0] - 0.05, -0.55, 0.0, 0, 0, 0.5), (0.55, 0.7)),
    ("b-bas-2", M["box_g"], 0.44, 0.30, 0.40, (STACK_X[1], -0.03, 0.06 + T),
     (STACK_X[1] + 0.03, -0.12, 0.06 + T, 0, 0, -0.32), (0.58, 0.72)),
    ("b-top-1", M["box_w"], 0.44, 0.30, 0.40, (STACK_X[0], -0.03, SHELVES_R[3] + T),
     (STACK_X[0] + 0.1, -0.1, SHELVES_R[3] + T, 0.0, 0.0, 0.55), (0.5, 0.66)),
    ("b-top-2", M["box_w"], 0.44, 0.30, 0.40, (STACK_X[1], -0.03, SHELVES_R[3] + T),
     (0.85, -1.62, 0.0, 0, 0, -0.75), (0.44, 0.66)),
    ("panier-1", M["box_s"], 0.52, 0.28, 0.40, (AX0 + T + 0.31, -0.03, 0.06 + T),
     (AX0 + T + 0.45, -0.2, 0.06 + T, 0, 0, 0.42), (0.57, 0.71)),
    ("panier-2", M["box_g"], 0.52, 0.28, 0.40, (AX0 + T + 0.87, -0.03, 0.06 + T),
     (AX0 + T + 0.80, -0.30, 0.06 + T, 0, 0, -0.2), (0.6, 0.74)),
]
for name, mat, w, h, d, tidy, messy, (a, b) in BOXES:
    parts = make_box(name, mat, w, h, d, lid=not name.startswith("panier"))
    bx, by, bz = tidy
    mx, my, mz, rx, ry, rz = messy
    lift = 0.35 if mz < 0.05 else 0.08
    Actor(parts[0], a, b, (mx, my, mz + h / 2), (rx, ry, rz), (bx, by, bz + h / 2), (0, 0, 0), lift=lift)
    if len(parts) > 1:
        # couvercle de travers dans le désordre, qui se repose bien à plat
        Actor(parts[1], a + 0.02, b, (mx + 0.05, my - 0.04, mz + h + 0.03), (rx + 0.12, ry - 0.1, rz + 0.3),
              (bx, by, bz + h + 0.0), (0, 0, 0), lift=lift + 0.05)

# ------------------------------------------------------------------ lumière du matin
world = bpy.data.worlds.new("ciel")
bpy.context.scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = srgb("#cfdbe8")
bg.inputs["Strength"].default_value = 0.45
_wn = world.node_tree
_lp = _wn.nodes.new("ShaderNodeLightPath")
_bright = _wn.nodes.new("ShaderNodeBackground")
_bright.inputs["Color"].default_value = srgb("#eef2f4")
_bright.inputs["Strength"].default_value = 3.2
_mix = _wn.nodes.new("ShaderNodeMixShader")
_wn.links.new(_lp.outputs["Is Camera Ray"], _mix.inputs["Fac"])
_wn.links.new(bg.outputs["Background"], _mix.inputs[1])
_wn.links.new(_bright.outputs["Background"], _mix.inputs[2])
_wn.links.new(_mix.outputs["Shader"], _wn.nodes["World Output"].inputs["Surface"])

sun = bpy.data.lights.new("soleil", "SUN")
sun.energy = 6.0
sun.angle = math.radians(2.2)
sun.color = (1.0, 0.955, 0.88)  # blanc chaud, jamais orangé
sun_o = link(bpy.data.objects.new("soleil", sun))
# vient de la fenêtre (−X), vers le fond de la pièce, basse au-dessus de l'horizon
_el, _az = math.radians(31), math.radians(24)
SUN_DIR = Vector((math.cos(_el) * math.cos(_az), math.cos(_el) * math.sin(_az), -math.sin(_el)))
sun_o.rotation_euler = (-SUN_DIR).to_track_quat("Z", "Y").to_euler()

win = bpy.data.lights.new("fenetre", "AREA")
win.shape = "RECTANGLE"
win.size, win.size_y = WZ1 - WZ0, WY1 - WY0
win.energy = 120
win.color = (0.93, 0.96, 1.0)
wo = link(bpy.data.objects.new("fenetre", win))
wo.location = (RX0 - 0.05, (WY0 + WY1) / 2, (WZ0 + WZ1) / 2)
wo.rotation_euler = (0, math.radians(-90), 0)  # émet vers +X, dans la pièce

# fill discret depuis l'arrière de la caméra (rebond du mur du fond de la pièce)
fill = bpy.data.lights.new("rebond", "AREA")
fill.shape = "RECTANGLE"
fill.size, fill.size_y = 4.0, 1.6
fill.energy = 45
fill.color = (1.0, 0.985, 0.96)
fo = link(bpy.data.objects.new("rebond", fill))
fo.location = (0.2, -7.6, 2.1)
fo.rotation_euler = (math.radians(80), 0, 0)  # émet vers +Y, légèrement plongeant
fill.cycles.is_caustics_light = False
fo.visible_camera = False

# ------------------------------------------------------------------ caméra
cam_d = bpy.data.cameras.new("cam")
cam = link(bpy.data.objects.new("cam", cam_d))
bpy.context.scene.camera = cam
cam_d.sensor_width = 36
cam_d.sensor_fit = "AUTO"
tgt = link(bpy.data.objects.new("visee", None))
tc = cam.constraints.new("TRACK_TO")
tc.target = tgt
tc.track_axis = "TRACK_NEGATIVE_Z"
tc.up_axis = "UP_Y"
cam_d.dof.use_dof = True
cam_d.dof.focus_object = tgt
cam_d.dof.aperture_fstop = 5.6

if args.variant == "desktop":
    W, H = 1600, 900
    CAM0 = dict(loc=(0.42, -6.6, 1.30), tgt=(0.12, 0.0, 1.0), lens=21.0)
    CAM1 = dict(loc=(0.0, -3.85, 1.60), tgt=(0.0, -0.05, 1.37), lens=23.0)
else:
    W, H = 720, 1280
    CAM0 = dict(loc=(0.30, -6.4, 1.30), tgt=(0.1, 0.0, 1.15), lens=22.0)
    CAM1 = dict(loc=(0.0, -3.7, 1.60), tgt=(0.0, -0.05, 1.42), lens=27.0)


def camera_at(p):
    # Séquence 1 : quasi immobile, puis travelling très léger ;
    # séquence 2 : avance lente ; séquence 3 : arrivée à hauteur des yeux.
    t = span(p, 0.03, 0.86)
    t = 0.7 * t + 0.3 * ease(min(1.0, max(0.0, (p - 0.03) / 0.83)))
    lerp = lambda a, b: Vector(a).lerp(Vector(b), t)
    cam.location = lerp(CAM0["loc"], CAM1["loc"])
    tgt.location = lerp(CAM0["tgt"], CAM1["tgt"])
    cam_d.lens = CAM0["lens"] + (CAM1["lens"] - CAM0["lens"]) * t


# ------------------------------------------------------------------ rendu
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = args.samples
sc.cycles.use_adaptive_sampling = True
sc.cycles.adaptive_threshold = 0.02
sc.cycles.use_denoising = True
sc.cycles.denoiser = "OPENIMAGEDENOISE"
sc.cycles.max_bounces = 8
sc.cycles.diffuse_bounces = 5
sc.cycles.glossy_bounces = 3
sc.cycles.transmission_bounces = 2
sc.cycles.sample_clamp_indirect = 4.0
sc.cycles.blur_glossy = 1.0
sc.cycles.caustics_reflective = False
sc.cycles.caustics_refractive = False
sc.render.use_persistent_data = True
sc.render.resolution_x = int(W * args.scale)
sc.render.resolution_y = int(H * args.scale)
sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_depth = "8"
sc.render.film_transparent = False
sc.view_settings.view_transform = "AgX"
sc.view_settings.look = "AgX - Medium High Contrast"
sc.view_settings.exposure = 0.0
sc.render.threads_mode = "AUTO"

if args.blend:
    bpy.ops.wm.save_as_mainfile(filepath=args.blend)

os.makedirs(args.out, exist_ok=True)
N = args.frames
todo = [int(x) for x in args.only.split(",")] if args.only else range(N)
for i in todo:
    p = i / (N - 1) * P_END
    for a in ACTORS:
        a.apply(p)
    camera_at(p)
    bpy.context.view_layer.update()
    sc.render.filepath = os.path.join(args.out, f"f{i:03d}.png")
    bpy.ops.render.render(write_still=True)
    print(f"[dressing] image {i + 1}/{N}  p={p:.3f}", flush=True)
