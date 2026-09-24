# Refabriquer l'image de partage

`site/assets/img/og.jpg` (1200 × 630) est l'image que LinkedIn, Slack, WhatsApp,
iMessage et X affichent quand quelqu'un colle un lien vers le site.
Elle n'est pas dessinée dans un outil graphique : elle est **rendue depuis
le site lui-même**, à partir de `tools/og-image.html`, qui réutilise les
polices, les couleurs et la scène d'atelier du hero. Modifier la charte
suffit donc à régénérer une image cohérente.

`tools/` vit hors du dossier publié (`site/`) : ces gabarits sont des
sources, comme un `.psd` qu'on garde à côté du `.jpg`. Leurs `@font-face`
pointent donc vers `../site/assets/fonts/`.

## Procédure

```bash
# 1. servir le site en local (les polices refusent de se charger en file://)
python3 -m http.server 8099

# 2. rendre en 2× puis réduire : le texte reste net
chromium --headless=new --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=1200,780 \
  --virtual-time-budget=6000 \
  --screenshot=og2x.png http://127.0.0.1:8099/tools/og-image.html

python3 - <<'PY'
from PIL import Image
im = Image.open('og2x.png').convert('RGB')
im.crop((0, 0, 2400, 1260)).resize((1200, 630), Image.LANCZOS) \
  .save('site/assets/img/og.jpg', 'JPEG', quality=90, optimize=True, progressive=True)
PY
```

La fenêtre est volontairement plus haute que la carte (780 au lieu de 630) :
on recadre ensuite au pixel près, ce qui évite de dépendre de la hauteur
exacte de viewport que Chromium accorde en headless.

## Règles tenues

- **1200 × 630** exactement (ratio 1,91:1). LinkedIn recadre tout le reste.
- **Sous 300 Ko.** Ici 70 Ko : la photo n'existe pas, tout est vectoriel.
- **Lisible à 300 px de large.** C'est la taille réelle dans un fil
  LinkedIn sur mobile. D'où le titre à 45 px et non un pavé de texte.
- **Rien d'essentiel dans les 60 px du bord.** Certains clients rognent.
- **Pas de prix, pas de date, pas de promesse chiffrée** : l'image est
  mise en cache des mois par les réseaux sociaux, on ne la corrige pas.

## Après chaque changement d'image

Les réseaux gardent l'ancienne version en cache. Pour forcer la relecture :

- LinkedIn — <https://www.linkedin.com/post-inspector/>
- Facebook / WhatsApp — <https://developers.facebook.com/tools/debug/>
- X — <https://cards-dev.twitter.com/validator>

---

# Bannière LinkedIn

`tools/linkedin-banner.jpg` (1584 × 396) est la bannière du profil LinkedIn.
Même principe que l'image de partage : elle est **rendue depuis la charte du
site**, à partir de `tools/linkedin-banner.html`, et non dessinée ailleurs.

```bash
python3 -m http.server 8099

chromium --headless=new --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=1584,520 \
  --virtual-time-budget=6000 \
  --screenshot=li2x.png http://127.0.0.1:8099/tools/linkedin-banner.html

python3 - <<'PY'
from PIL import Image
Image.open('li2x.png').convert('RGB').crop((0, 0, 3168, 792)) \
  .resize((1584, 396), Image.LANCZOS) \
  .save('tools/linkedin-banner.jpg', 'JPEG', quality=92, optimize=True, progressive=True)
PY
```

## Contraintes propres à LinkedIn

- **1584 × 396** exactement (ratio 4:1).
- **Les 330 premiers pixels ne portent aucun texte.** Sur desktop, la photo
  de profil ronde mord le bas gauche de la bannière. Le texte commence donc
  à `left:360px`. Vérifié en superposant un disque de contrôle au rendu.
- **Deux lignes courtes et grandes**, pas un paragraphe : la bannière est
  souvent vue à 400 px de large sur mobile, où tout ce qui descend sous
  ~40 px de corps devient une texture. L'accroche reste lisible à cette
  taille, la ligne de signature non — c'est assumé, l'URL figure aussi dans
  les coordonnées du profil.
- **Contraste mesuré, pas supposé** : l'ember sur le fond de la ligne 2
  donne 4,36:1 au pire endroit. Le seuil WCAG applicable est 3:1, le texte
  étant grand et gras.
- **Rien de chiffré qui bouge.** Une bannière reste en place des années et
  personne ne pense à la corriger.

---

# Carrousel LinkedIn

`tools/carrousel-linkedin.html` produit les sept planches du carrousel
« Vends-moi ce stylo » : une couverture, une mise en place, cinq questions.
Mêmes fichiers de police, même palette et même scène d'atelier que le site,
d'où le chemin `../site/assets/fonts/` dans les `@font-face`.

```bash
python3 -m http.server 8096          # depuis la racine du dépôt

chromium --headless=new --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1080,9450 --virtual-time-budget=8000 \
  --screenshot=carr.png http://127.0.0.1:8096/tools/carrousel-linkedin.html

python3 - <<'PY'
from PIL import Image
im = Image.open('carr.png').convert('RGB')
pages = [im.crop((0, i*1350, 1080, (i+1)*1350)) for i in range(7)]
pages[0].save('carrousel.pdf', save_all=True, append_images=pages[1:], resolution=72.0)
PY
```

Les sept planches sont rendues **d'un seul tenant** puis découpées : une
capture par planche multiplierait les chargements de police et les écarts
de rendu.

## Contraintes propres au carrousel

- **1080 × 1350** (4:5). C'est le plus haut que LinkedIn accepte, donc
  celui qui occupe le plus de fil sur mobile.
- **LinkedIn veut un PDF**, pas une série d'images : un carrousel s'y
  téléverse comme « document ».
- **Lisible à 400 px de large**, soit une réduction de 2,7 fois. D'où les
  questions à 58 px et les options à 33 px : en dessous, les options
  deviennent une texture.
- **Aucune correction sur les planches.** Les questions sont la promesse,
  les réponses sont sur le site. C'est ce qui donne une raison de cliquer.
- **Les bonnes réponses ne sont jamais à la même lettre** (ici C, A, D, B,
  D). Un lecteur qui repère un motif répond juste sans lire le fond — c'est
  le défaut qui a fait refaire ce quiz.

---

# Instagram

Deux gabarits, même méthode que le carrousel : rendu d'un seul tenant puis
découpe. La démarche et les légendes sont dans `tools/METHODE-SOCIAL.md`.

```bash
python3 -m http.server 8094          # depuis la racine du dépôt

# stories — 5 × 1080×1920
chromium --headless=new --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1080,9600 --virtual-time-budget=8000 \
  --screenshot=st.png http://127.0.0.1:8094/tools/instagram-stories.html

# carrés — 3 × 1080×1080
chromium --headless=new --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1080,3240 --virtual-time-budget=8000 \
  --screenshot=sq.png http://127.0.0.1:8094/tools/instagram-grille.html
```

## Contraintes propres à Instagram

- **Une story mesure 1080 × 1920, mais l'interface en recouvre 250 px en
  haut et 250 px en bas.** Tout ce qui compte tient entre y=260 et y=1660 :
  c'est ce qui commande le `padding` des planches.
- **Le sticker natif plutôt que l'option dessinée.** Les stories 2 et 3
  laissent une zone vide en pointillés pour le sticker QUIZ d'Instagram,
  qui accepte quatre réponses et désigne la bonne. Un sticker produit une
  interaction comptée par l'algorithme, une image n'en produit aucune.
- **Aucun lien cliquable dans un post.** Le lien vit en bio, ou dans un
  sticker de story. Les pieds de planche portent malgré tout l'URL : on la
  retient ou on la tape.
- **Le carrousel 4:5 sert sur les deux réseaux.** C'est le même format que
  LinkedIn, il n'a pas été refait.
- **Le carré ne performe plus dans le fil**, mais c'est lui qui compose la
  grille du profil. Les trois carrés sont conçus pour tenir ensemble.

---

# Logo

`tools/logo/` contient le logo en SVG vectoriel et en PNG transparent,
quatre teintes et un monogramme. Usages détaillés dans
`tools/logo/LISEZ-MOI.md`.

Les contours sont **extraits de la police**, pas dessinés : le script fige
Figtree à la graisse 700, lit les glyphes de `JULIEN` et du `®`, applique
l'approche de −0,032 em du site et écrit les chemins. Le logo et les titres
du site ne peuvent donc pas diverger — ils viennent de la même source.

```bash
pip install fontTools brotli
```

Le script complet est dans l'historique git du commit « Le logo décliné en
SVG vectoriel… ». Les étapes :

1. `instancer.instantiateVariableFont(font, {'wght': 700})`
2. pour chaque lettre, `SVGPathPen` puis avance de `advanceWidth − 32`
   (l'approche, en unités d'un em de 1000)
3. le `®` à 40 % du corps, son sommet aligné sur la hauteur de capitale
4. l'axe des y d'un SVG descend, celui d'une police monte : les chemins
   sont retournés par `translate(0 h) scale(1 -1)`

Les PNG sont rendus par Chromium avec
`--default-background-color=00000000` — c'est cette option, et elle seule,
qui donne un fond réellement transparent — puis recadrés au contenu avec
`Image.getbbox()`.

**Piège rencontré :** la fenêtre de rendu doit être plus grande que l'image
dans les deux dimensions. Une fenêtre trop courte tronque sans rien
signaler, et le recadrage automatique masque ensuite la troncature — le
monogramme carré est sorti sans ses coins inférieurs avant qu'on s'en
aperçoive.

---

# Bannière de Page LinkedIn

`tools/linkedin-page-banner.html` — **à ne pas confondre** avec
`linkedin-banner.html`, qui est celle du **profil personnel**.

|  | Profil personnel | Page (entreprise) |
|---|---|---|
| Format | 1584 × 396 | **1128 × 434** |
| Rapport | 4:1 | environ 2,6:1 |
| L'image de profil | ronde, mord le bas gauche | carrée, mord le bas gauche |
| Zone à laisser libre | 330 px | 200 px |

**Le 1128 × 191 que documente LinkedIn depuis des années ne correspond plus
à son propre outil de recadrage.** Une image à ce rapport arrive dans le
cadre entourée de deux bandes noires, et il faut la zoomer pour la remplir —
donc la rogner. Le rapport a été relevé d'après la fenêtre de recadrage
elle-même, mesurée sur une capture : environ 2,6:1. À vérifier de nouveau
si LinkedIn refait son interface.

```bash
chromium --headless=new --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=2256,520 --virtual-time-budget=7000 \
  --screenshot=pg.png http://127.0.0.1:8092/tools/linkedin-page-banner.html
# puis recadrer à 2256×868 et enregistrer en JPEG
```

Le rendu se fait au double (2256 × 868) puis se réduit : LinkedIn sert la
bannière en pleine largeur sur écran dense, et une image posée à sa taille
nominale y paraît molle.

## Ce que 191 pixels de haut imposent

**Deux lignes de texte, et rien d'autre.** Sur le profil personnel, la
hauteur de 396 px laisse respirer un surtitre, une accroche et une
signature. Ici, tout ce qui dépasse trois blocs devient un pâté.

La feuille « bon pour accord » de la scène d'atelier a dû sauter : à cette
hauteur, elle n'était plus qu'un coin clair tranché par le bord droit. Un
décor pensé pour un format ne se transpose pas en changeant les
proportions — il se retaille.

## Livrer en JPEG, pas en PNG

LinkedIn rejette régulièrement les PNG de grande taille sur cette page —
« Échec de la mise à jour de l'image de couverture » sans autre précision.
Le JPEG passe, et il pèse six fois moins : 117 Ko contre 695.

Quand le téléversement échoue malgré cela, l'ordre à suivre : réessayer en
navigation privée (les bloqueurs de contenu interceptent l'envoi), puis
depuis un autre navigateur. L'erreur vient presque toujours de là, pas du
fichier.
