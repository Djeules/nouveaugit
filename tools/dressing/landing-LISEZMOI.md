# Landing « dressing » en scroll vidéo

Une landing page complète autour de la démo « L'ordre change tout » : la
séquence 3D avance au défilement, puis viennent la méthode, un avant/après,
les prestations, la FAQ et un formulaire de contact.

HTML, CSS et JavaScript à la main, sans dépendance ni ressource externe :
polices auto-hébergées, aucun script tiers.

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | La page complète, à ouvrir telle quelle |
| `landing.css`, `landing.js` | Mise en page des sections, en-tête, formulaire |
| `dressing-film.css`, `dressing-film.js` | Le composant film au scroll, préfixé `.dzf` |
| `snippet.html` | Le film seul, à coller dans une page existante |
| `assets/frames/d`, `h`, `m` | 3 × 120 images WebP (paysage, paysage HD, portrait) |
| `fonts/` | Fraunces et Inter (licence OFL) |

## Deux façons de l'intégrer

**1. La page entière.** Dépose le dossier sur ton hébergement, puis
remplace dans `index.html` : « Maison Ordre », les textes, l'`action` du
formulaire (Formspree, Netlify Forms…) et retire `<meta name="robots" content="noindex">`.

**2. Le film seul dans une page à toi.** Voir `snippet.html` :

1. charge `dressing-film.css` et `dressing-film.js` dans le `<head>` ;
2. colle la `<section class="dzf" …>` ;
3. mets dans `data-frames` le chemin du dossier `assets/frames`.

Réglages, en style sur la section :

- `--dzf-top: 72px` : hauteur de ton en-tête fixe, pour que chapitres et titre passent dessous ;
- `--dzf-length: 500vh` : longueur du défilement (plus long = plus lent) ;
- `--dzf-bg`, `--dzf-ink`, `--dzf-accent` : couleurs.

Et en attributs : `data-end="0.86"` (part du défilement consacrée à la
séquence, le reste sert au titre final).

## Chargement

- Chaque visiteur ne télécharge qu'un jeu : `m` sur mobile portrait
  (3,4 Mo), `d` sur écran classique (3,6 Mo), `h` sur retina et grands
  écrans (7,2 Mo).
- Le chargement démarre seulement à l'approche du film, puis va du grossier
  au fin (1 image sur 8, puis 4, 2, 1) : la séquence se joue dès les
  premières secondes et se précise pendant le téléchargement. Une fine barre
  grise sous la barre de progression montre où en est le téléchargement.
- Animations réduites : le film suit le défilement sans lissage, le titre
  apparaît en fondu.

## Hébergement

Sers les `.webp` avec un cache long (`Cache-Control: public, max-age=31536000, immutable`).
Tout fonctionne en sous-dossier : les chemins sont relatifs.
