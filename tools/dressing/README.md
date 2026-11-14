# Le dressing qui se range tout seul — fabrication

Démo en ligne : `site/demos/dressing/` (page `index.html`, `page.css`, `page.js`,
images dans `assets/frames/`).

## Pourquoi un rendu 3D plutôt que des photos

La consigne était « cohérence visuelle d'abord » : jamais deux photos aux meubles
ou aux angles incompatibles. Aucune vidéo source n'était disponible (et plus de
crédits de génération IA sur le compte), donc la séquence est **une scène 3D
unique** rendue par Blender/Cycles (tracé de chemins) : une seule armoire, une
seule lumière, une seule caméra. Chaque image est cohérente avec ses voisines
par construction, et le désordre se rejoue à l'envers sans aucun raccord.

## Refaire les images

```sh
pip download bpy==5.2.3 --no-deps -d /tmp/bpy        # ~400 Mo, Python 3.13
python3 -m venv /tmp/bvenv && /tmp/bvenv/bin/pip install /tmp/bpy/bpy-*.whl

# 120 images paysage 1440 × 810, puis 120 images portrait 720 × 1280
/tmp/bvenv/bin/python tools/dressing/scene.py --variant desktop --out /tmp/d --frames 120 --samples 12 --scale 0.9
/tmp/bvenv/bin/python tools/dressing/scene.py --variant mobile  --out /tmp/m --frames 120 --samples 12
# 120 images paysage haute définition 2560 × 1440 (écrans retina et larges)
/tmp/bvenv/bin/python tools/dressing/scene.py --variant desktop --out /tmp/h --frames 120 --samples 16 --scale 1.6
python3 tools/dressing/build.py /tmp/d /tmp/m /tmp/h     # → WebP dans site/demos/dressing/assets/frames/
```

Sur 4 cœurs : ~35 s par image paysage, ~25 s en portrait, ~2 min 40 en haute
définition (≈ 7 h 30 en tout). Lancer avec `setsid nohup …` : une tâche de fond
limitée à 2 h serait coupée en route.

## Trois jeux d'images, un seul chargé

`page.js` choisit le jeu selon l'écran : portrait `m` si l'écran est plus haut
que large, sinon `d` (1440 × 810) tant que le canevas fait moins de 1700 pixels
physiques de large, et `h` (2560 × 1440) au-delà. Sur un MacBook (1440 points,
densité 2) le canevas fait ~2500 pixels : l'image 1440 y était agrandie 1,75
fois, d'où le flou — la compression WebP n'y était pour presque rien.
Poids par visiteur : ~3,4 Mo en `d` ou `m`, ~7,3 Mo en `h`.
`--only 0,60,119 --scale 0.4 --samples 8` donne un aperçu en une minute.
`--cam x,y,z,cx,cy,cz,focale` place une caméra d'inspection (gros plan).

Les tas de vêtements sont simulés au premier lancement (13 simulations, ~3 min)
puis lus dans `--cloth-cache` (`/tmp/dressing-cloth.json` par défaut) : les deux
cadrages partagent ainsi exactement les mêmes tas. Effacer le fichier relance
les simulations.
`--frames` et `P_END` doivent rester identiques à `N` et `P_END` dans `page.js`.

## Chorégraphie (progression du défilement `p`)

| p | ce qui bouge |
|---|---|
| 0 – 0,15 | rien : la chambre, l'armoire qui déborde ; la caméra démarre à peine |
| 0,16 – 0,53 | les vêtements au sol et sur le lit s'envolent et se plient en vol |
| 0,22 – 0,62 | les pulls en vrac sur les étagères se replient et s'empilent |
| 0,30 – 0,74 | les chemises tombées remontent, toutes se trient par couleur et s'alignent |
| 0,44 – 0,74 | les boîtes reprennent leur place, couvercles posés à plat |
| 0,03 – 0,86 | travelling avant continu, qui finit à hauteur des yeux (1,60 m) |
| 0,86 – 1 | image figée ; le titre puis le sous-titre apparaissent |

## Limites du réalisme — à dire franchement

- **C'est une image de synthèse soignée, pas une photographie.** Lumière,
  matières (chêne, lin, maille) et ombres sont physiquement calculées, mais un
  œil attentif voit le rendu 3D : surfaces un peu trop propres, pas de micro-usure.
- **Les vêtements : du tissu plié et simulé, mais pas cousu.** Chaque pull ou
  t-shirt est une nappe de tissu (`cloth.py`) qui existe sous deux formes de même
  maillage : pliée en accordéon (les boudins superposés qu'on voit sur la tranche
  d'une pile en boutique) et froissée, obtenue en lâchant cette nappe desserrée
  sur le sol avec la simulation de tissu de Blender (gravité, collisions,
  auto-collisions). Les plis des tas sont donc calculés, pas sculptés. Ce n'est
  pas pour autant un vrai pull : pas de manches ni d'encolure dans la nappe,
  et le passage tas → pli, en vol, reste une interpolation.
  Les chemises restent des plaques épaissies, avec col, manches posées à plat
  et pans arrondis : convaincantes de face, moins si on les regarde de près.
- **Le rangement est magique, pas physique** : les objets volent sur des
  trajectoires en arc, sans collision calculée.
- **12 échantillons + débruitage** : l'image est propre mais légèrement lissée.
  Plus d'échantillons = plus de grain naturel, au prix du temps de rendu.

Pour passer au photoréalisme publicitaire, la voie est une vidéo générée
(Kling, Hailuo, Seedance) **ancrée sur la première et la dernière image de ce
rendu** : la 3D fixe l'armoire, l'angle et la lumière, l'IA apporte la matière
du tissu. La page n'a rien à changer : elle lit des images numérotées.
