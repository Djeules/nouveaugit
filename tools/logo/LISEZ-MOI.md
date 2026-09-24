# Logo Julien — fichiers et usages

Le logo est **typographique** : le mot composé en Figtree 700, approche
resserrée à −0,032 em, suivi d'un ® à 40 % du corps calé sur le haut des
capitales. C'est exactement le lettrage du titre du site et de la barre de
navigation.

Les SVG ne sont pas du texte : les contours ont été extraits de la police
variable figée à la graisse 700. Ils s'affichent donc partout à l'identique,
sans que la police ait besoin d'être installée.

## Quel fichier prendre

| Fond | Fichier |
|---|---|
| Sombre (le site, une photo foncée) | `julien-creme` |
| Blanc ou clair | `julien-sombre` |
| Orange ember, ou photo | `julien-blanc` |
| Impression noir et blanc, tampon, fax | `julien-noir` |

`julien-creme` et `julien-sombre` gardent le ® en ember. `julien-blanc` et
`julien-noir` sont monochromes — à réserver aux cas où une seconde couleur
est impossible.

## Les formats

- **`.svg`** — vectoriel, à préférer partout où c'est accepté : site,
  document, impression. Aucune perte à l'agrandissement.
- **`.png` 512 / 1024 / 2048** — fond transparent, recadrés au plus juste.
  Prendre la taille immédiatement supérieure à l'usage, jamais inférieure.
- **`julien-creme-sur-walnut.png` / `julien-sombre-sur-blanc.png`** — fond
  plein, pour les services qui refusent la transparence.

## Le monogramme

`monogramme-*` : le J seul avec son ®, dans un carré.

À réserver aux **photos de profil et favicons**. Le mot entier devient
illisible à 56 px, la taille d'un avatar sur LinkedIn ou Instagram — le
monogramme reste lisible.

`monogramme-creme-sur-walnut-1080.png` est la version à téléverser comme
photo de profil : carré plein, prêt à l'emploi.

## Deux règles

**Ne jamais recomposer le logo à la main** en tapant « JULIEN » dans une
police approchante. L'approche resserrée et la position du ® sont ce qui le
rend reconnaissable ; retapé, il devient un mot quelconque.

**Laisser autour de lui une marge au moins égale à la hauteur du J.** C'est
ce qui l'empêche d'être avalé par ce qui l'entoure.

## Refabriquer

Les fichiers sont produits par le script consigné dans
`tools/README-og.md`, section « Logo ». Changer la graisse ou l'approche
dans le site suppose de les régénérer, sinon le logo et les titres
divergent.
