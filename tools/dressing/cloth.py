"""Vêtements pliés en vrai tissu : une seule nappe, deux états.

Chaque pull (ou t-shirt) est **une nappe de tissu** (grille plane, épaissie au
rendu) qui connaît deux formes, portées par deux clés de forme de même
topologie :

- **plié** (clé de base) : la nappe repliée en accordéon, couche sur couche,
  chaque pli roulé en demi-cercle — c'est la tranche à boudins superposés qu'on
  voit sur une pile de pulls en boutique ;
- **froissé** (clé « froisse ») : la même nappe, desserrée, lâchée de 25 cm sur
  un plan et laissée retomber par la **simulation de tissu de Blender** (gravité,
  collisions, auto-collisions). Les plis du tas sont calculés, pas dessinés.

Le passage de l'un à l'autre se fait en vol (la clé de forme glisse de 1 à 0) :
le pli reste « magique », mais les deux états immobiles — début et fin de la
séquence — sont physiquement plausibles.

Les simulations coûtent ~20 s chacune ; leurs résultats sont gardés dans un
fichier cache (`--cloth-cache`) pour que les rendus paysage et portrait
utilisent exactement les mêmes tas.
"""
import json
import math
import os

import bpy
import bmesh
from mathutils import Matrix, Vector, noise


def smoothstep(e0, e1, x):
    t = min(1.0, max(0.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def profile(d, n, gap, per_layer=16, per_arc=7):
    """Profil (y, z) de la nappe pliée en accordéon, de son bord libre (au fond,
    couche du bas) à l'autre bord libre (au fond, couche du haut ; n pair).
    Retourne une liste de (y, z, couche_continue)."""
    r = gap / 2
    ys = d / 2 - r          # là où le pli commence à s'enrouler
    pts = []
    for k in range(n):
        z = (k + 0.5) * gap
        y0, y1 = (ys, -ys) if k % 2 == 0 else (-ys, ys)
        for s in range(per_layer):
            t = s / per_layer
            pts.append((y0 + (y1 - y0) * t, z, k))
        if k == n - 1:
            pts.append((y1, z, k))
            break
        # demi-cercle vers la couche suivante, côté y1
        side = -1 if y1 < 0 else 1
        cy, cz = y1, z + r
        for s in range(per_arc):
            a = -math.pi / 2 + math.pi * s / per_arc
            pts.append((cy + side * r * math.cos(a), cz + r * math.sin(a), k + s / per_arc))
    return pts


def build_sheet(name, w, d, n, gap, seed, nu=20, loose=0.0):
    """Nappe pliée. `loose` > 0 donne l'état de départ de la simulation : couches
    écartées et décalées, comme un pull jeté en boule."""
    prof = profile(d, n, gap * (1 + loose * 8))
    bm = bmesh.new()
    grid = []
    off = Vector((seed * 3.7, seed * 1.3, seed * 2.9))
    for j, (y, z, kc) in enumerate(prof):
        row = []
        for i in range(nu + 1):
            u = i / nu * 2 - 1
            x = u * w / 2
            zz = z
            # bords latéraux : le tissu retombe sur la couche du dessous (pli de côté)
            e = smoothstep(0.82, 1.0, abs(u))
            zz -= e * gap * 0.42
            x -= math.copysign(e * gap * 0.25, u)
            # couches jamais parfaitement alignées : léger décalage qui varie d'une couche à l'autre
            x += 0.006 * noise.noise(Vector((kc * 0.7, 0.0, 0.0)) + off)
            y += 0.0
            yy = y + 0.005 * noise.noise(Vector((kc * 0.7, 3.0, 0.0)) + off)
            # duvet de la maille : la nappe gonfle un peu entre les bords
            puff = (1 - u * u) * (1 - (2 * y / d) ** 2)
            zz += gap * 0.14 * puff * (kc / n + 0.3)
            # quelques plis doux, surtout sur le dessus
            p = Vector((x * 9, yy * 9, kc)) + off
            ridge = 1 - abs(noise.noise(p))
            zz += gap * 0.16 * (ridge ** 3) * (0.3 + kc / n)
            zz += gap * 0.12 * noise.noise(p * 0.35) * (kc / n)
            if loose:
                # état « jeté » : couches tournées les unes sur les autres
                ang = loose * 0.9 * noise.noise(Vector((kc * 0.45, 7.0, 0.0)) + off)
                cx, cy_ = x, yy
                x = cx * math.cos(ang) - cy_ * math.sin(ang)
                yy = cx * math.sin(ang) + cy_ * math.cos(ang)
                # chiffonné : la nappe est ramassée (x, y × 0,75) et ondule fort,
                # l'excédent de tissu doit se replier en retombant
                x *= 0.75
                yy *= 0.8
                q = Vector((x * 7, yy * 7, kc * 0.8)) + off
                zz += loose * 0.04 * noise.noise(q) + loose * 0.012 * noise.noise(q * 2.3)
                x += loose * 0.03 * noise.noise(q + Vector((5, 0, 0)))
                yy += loose * 0.03 * noise.noise(q + Vector((0, 5, 0)))
            row.append(bm.verts.new((x, yy, zz)))
        grid.append(row)
    for j in range(len(grid) - 1):
        for i in range(nu):
            bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    return o


def simulate_heap(w, d, n, gap, seed, frames=70, drop=0.25, tilt=(0.0, 0.0)):
    """Lâche la nappe desserrée sur un plan (z = 0) et rend les coordonnées
    finales (repère de la nappe), recentrées, posées sur z = 0."""
    sc = bpy.context.scene
    o = build_sheet(f"_sim{seed}", w, d, n, gap, seed, loose=1.0)
    zc = sum(v.co.z for v in o.data.vertices) / len(o.data.vertices)
    o.location = (0, 0, drop - zc + 0.05)
    o.rotation_euler = (tilt[0], tilt[1], 0)
    plane_me = bpy.data.meshes.new("_sol")
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=3.0)
    bm.to_mesh(plane_me)
    bm.free()
    pl = bpy.data.objects.new("_sol", plane_me)
    sc.collection.objects.link(pl)
    pl.modifiers.new("col", "COLLISION")
    pl.collision.thickness_outer = 0.004
    pl.collision.cloth_friction = 12.0

    cm = o.modifiers.new("tissu", "CLOTH")
    s = cm.settings
    s.quality = 8
    s.mass = 0.12
    s.tension_stiffness = 12
    s.compression_stiffness = 12
    s.shear_stiffness = 6
    s.bending_stiffness = 0.08
    s.air_damping = 2.0
    cs = cm.collision_settings
    cs.use_self_collision = True
    cs.self_distance_min = 0.004
    cs.distance_min = 0.004
    cs.collision_quality = 3
    cs.self_friction = 8.0
    cm.point_cache.frame_start = 1
    cm.point_cache.frame_end = frames
    f0, f1 = sc.frame_start, sc.frame_end
    sc.frame_start, sc.frame_end = 1, frames
    for f in range(1, frames + 1):
        sc.frame_set(f)
    dg = bpy.context.evaluated_depsgraph_get()
    ev = o.evaluated_get(dg)
    mw = o.matrix_world.copy()
    co = [mw @ v.co for v in ev.data.vertices]
    sc.frame_start, sc.frame_end = f0, f1
    sc.frame_set(f0)
    bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.objects.remove(pl, do_unlink=True)
    cx = sum(c.x for c in co) / len(co)
    cy = sum(c.y for c in co) / len(co)
    zmin = min(c.z for c in co)
    return [(c.x - cx, c.y - cy, c.z - zmin) for c in co]


class HeapCache:
    """Résultats de simulation gardés sur disque (clé = paramètres)."""

    def __init__(self, path):
        self.path = path
        self.data = {}
        if path and os.path.exists(path):
            with open(path) as f:
                self.data = json.load(f)

    def get(self, w, d, n, gap, seed, tilt=(0.0, 0.0)):
        key = f"{w:.3f}|{d:.3f}|{n}|{gap:.4f}|{seed}|{tilt[0]:.2f}|{tilt[1]:.2f}"
        if key not in self.data:
            print(f"[tissu] simulation {key}", flush=True)
            self.data[key] = [list(map(lambda x: round(x, 5), c))
                              for c in simulate_heap(w, d, n, gap, seed, tilt=tilt)]
            if self.path:
                with open(self.path, "w") as f:
                    json.dump(self.data, f)
        return [Vector(c) for c in self.data[key]]


def make_folded_cloth(name, mat, cache, w, d, th, seed, heap_seed, n=4, thick=None):
    """Vêtement plié : objet (clé de base = plié, centré sur sa hauteur) et clé
    « froisse » (tas simulé, posé sur z = −th/2 en repère local)."""
    gap = th / n
    o = build_sheet(name, w, d, n, gap, seed)
    # centre la pile sur sa hauteur : l'origine reste au milieu, comme avant
    for v in o.data.vertices:
        v.co.z -= th / 2
    heap = cache.get(w, d, n, round(gap, 4), heap_seed)
    o.shape_key_add(name="Basis")
    k = o.shape_key_add(name="froisse")
    for i, c in enumerate(heap):
        k.data[i].co = Vector((c.x, c.y, c.z - th / 2))
    sol = o.modifiers.new("ep", "SOLIDIFY")
    sol.thickness = thick or gap * 0.62
    sol.offset = 0
    sol.use_even_offset = False
    for poly in o.data.polygons:
        poly.use_smooth = True
    sub = o.modifiers.new("sub", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 2
    o.data.materials.append(mat)
    return o, k
