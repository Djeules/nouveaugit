# JULIEN — site vitrine

Site de démonstration pour une activité de **formation aux techniques de vente**.

Le principe : vendre avec le plus grand sérieux un stylo à bille en plastique à 0,30 €,
comme s'il s'agissait d'un lancement produit majeur — puis révéler, en fin de page, que
toute la mise en scène *était* la démonstration commerciale.

## Référence de design

Le design reprend fidèlement la direction artistique de [oryzo.ai](https://oryzo.ai)
(studio Lusion), qui applique exactement la même idée à un dessous‑de‑verre en liège.

### Palette

| Rôle | Nom | Hex |
|---|---|---|
| Fond | Walnut Shadow | `#100904` |
| Texte | Warm Cream | `#ffedd7` |
| Surface | Bark Brown | `#382416` |
| Bordure | Cork Border | `#40372e` |
| Accent | Ember | `#dc5000` |
| Accent secondaire | Olive | `#6e6a4f` |

Le fond change de teinte au fil des sections (`data-bg` : `walnut`, `bark`, `deep`, `ember`),
avec transition douce sur `--bg`, `--bg-2` et `--glow`.

### Typographie

La référence utilise **Halyard Display** (Adobe Fonts, licence requise) pour ~99 % du texte :
graisse 500, capitales, interlignage serré pour les titres ; graisse 400 pour le corps.

Ce site utilise **Figtree**, la substitution géométrique libre la plus proche, plus
**JetBrains Mono** pour les étiquettes techniques. Pour coller à 100 % à la référence,
remplacer la déclaration `--sans` dans `site/assets/css/styles.css` par Halyard Display.

Les deux polices sont **hébergées avec le site** (`site/assets/fonts/`), en version variable,
sous licence SIL Open Font License 1.1 — les fichiers `LICENSE-*.txt` doivent rester
à côté des `.woff2`. Le site ne fait donc **aucune requête vers un serveur tiers** :
rien à charger depuis un service de polices, aucune adresse IP de visiteur transmise, et
une politique de confidentialité qui peut l'affirmer sans réserve. Total : 132 Ko.

> L'interlignage a été légèrement ouvert (`.94` au lieu de `.86`) : les capitales accentuées
> françaises (É, À, Ô) ont besoin de plus de place que l'anglais de la référence.

### Les deux registres de titre

La casse n'est pas un choix esthétique, elle indique **qui parle**.

**Capitales, graisse 500** (`.display`, `.heading`) — la voix « fiche produit », froide
et institutionnelle, qui parodie le langage des lancements tech : anatomie, capacités,
configuration, BureauBench, modèle, recherche, adoption, tarifs, FAQ.

**Casse normale, graisse 650, corps plus grand** (`.voice`, `.pop__title`) — la voix
humaine, celle de quelqu'un qui s'adresse au lecteur : l'accroche, « il tient dans une
poche », « Ce stylo coûte presque rien. », « Vends-moi ce stylo. », « Je m'appelle
Julien. », « Vendez mieux que ce stylo. »

Regardez où tombent les minuscules : l'accroche, puis tout le dernier tiers. Le site
commence en voix humaine, enfile le masque corporate pendant la parodie produit, et le
retire définitivement à la divulgation. **La typographie joue la révélation.** En ajoutant
un titre, choisir le registre selon ce critère, pas selon la taille voulue.

Deux raisons techniques à l'écart de graisse : les minuscules en très grand corps
paraissent molles à graisse 500, et le français en capitales accentuées est large —
« INUTILEMENT SOPHISTIQUÉ » tenait en cinq lignes, la version en casse normale en tient
trois.

## Structure

Le dépôt est coupé en deux : **ce qui part en ligne** et **ce qui reste ici**.

```
site/           ← le seul dossier publié (netlify.toml : publish = "site")
  index.html · merci.html
  mentions-legales.html · cgv.html · politique-de-confidentialite.html
  robots.txt · sitemap.xml
  assets/css/styles.css · assets/js/main.js · assets/fonts/ · assets/img/
netlify.toml    ← doit rester à la racine, Netlify l'y cherche
CLAUDE.md · DECISIONS.md · README.md · tools/   ← versionnés, jamais servis
```

Cette coupure n'est pas une affaire de confidentialité : `DECISIONS.md`
explique par quel dispositif la page opère, et ce site ne produit son effet
qu'une fois, sur quelqu'un qui ne l'a pas vu venir. Le mode d'emploi n'a
rien à faire à côté du tour.

Aucune dépendance, aucune étape de build. Ouvrir `site/index.html` suffit.

### Pages légales

Rédigées pour un **organisme de formation déclaré (NDA), sans certification Qualiopi,
vendant à des clients professionnels**. Tout changement sur l'un de ces trois points impose
une relecture des CGV.

Les champs à compléter apparaissent en orange sur fond hachuré (classe `.tbd`) : ils sont
volontairement impossibles à manquer. Vérifier qu'il n'en reste aucun avant publication :

```
grep -o 'class="tbd[^"]*"' *.html | wc -l
```

Les encadrés `.note-box` sont des remarques qui vous sont adressées, pas du texte contractuel :
**les supprimer avant mise en ligne.**

Sections : hero → bandeau défilant → manifeste → anatomie (stylo collant) → capacités →
configurateur → benchmarks → modèle open weight → recherche/BibTeX → témoignages → tarifs →
FAQ → **divulgation** → **l'épreuve** → formations → appel à l'action → pied de page.

### L'épreuve (`#epreuve`)

Quiz de quatre questions placé **après** la divulgation, jamais avant : il convertit le visiteur
qui a deviné la chute en candidat qui se teste. Référence à *Le Loup de Wall Street* (« vends‑moi
ce stylo »).

Barème : 3 / 2 / 1 / 0 points par question, 12 au total, et quatre verdicts —
*À retravailler* (0‑3), *De bons réflexes* (4‑6), *Vous êtes performant* (7‑9),
*Soyez redoutable* (10‑12). Tous mènent à l'offre : le dernier oriente vers le coaching d'équipe
plutôt que vers la formation individuelle.

Le bilan détaillé explique chaque bonne réponse — c'est là que se démontre l'expertise, pas dans
le score. Pour modifier les questions, tout est dans le HTML : `data-points` sur chaque `.opt`,
`data-best` et `data-short` sur chaque `.q`, explication dans `.q__why`. Les paliers sont dans
la constante `TIERS` de `main.js`.

## Le bouton « Précommander »

Il ne mène à aucune commande. Le premier clic répond, sous le bouton,
« Aucun stylo n'est vendu ici » ; les clics suivants font monter une petite
escalade (quatre répliques dans la constante `REPLIES` de `main.js`), et le
cinquième emmène finalement à la section de divulgation. Sans JavaScript, le
lien conduit directement à cette section : la mise au point est garantie
dans tous les cas. Les boutons de la grille tarifaire y mènent également.

C'est à la fois une blague et la protection principale contre une
qualification de pratique commerciale trompeuse — voir l'article 6 des
mentions légales. **Ne pas transformer ce bouton en formulaire de commande.**

## Le stylo 3D

Le stylo de la section Anatomie n'est pas une image : c'est un **prisme hexagonal
construit en CSS 3D** (28 faces), assemblé par `buildPen()` dans `main.js`. Chaque face
porte son angle de base ; à chaque image, `drawPen()` recalcule son éclairage selon
l'angle qu'elle présente à la lumière, plus un terme de Fresnel sur le corps — une face
vue de biais renvoie plus de lumière, ce qui fait lire le tube comme du cristal et laisse
voir la colonne d'encre. Rotation, inclinaison et échelle sont pilotées par la position
de défilement dans la section.

Géométrie et direction de lumière : constante `PEN` en tête du bloc.

## Interactions

Écran de chargement, stylo 3D piloté au défilement, carrousel de témoignages
(glisser, flèches, points, avance automatique suspendue à la première interaction),
planche graphique « Format » (cadre et cercle pointillés, fausse interface, gag
d'astérisque), titres qui montent en lumière à l'entrée dans la fenêtre,
curseur personnalisé et boutons aimantés, découpe des titres en lignes
animées, apparitions au défilement, compteurs, barres de benchmark, manifeste qui s'allume
mot à mot, rotation du stylo pilotée par le défilement, bascule de configuration, accordéon FAQ,
copie du BibTeX, menu plein écran en mobile.

`prefers-reduced-motion` est respecté : toutes les animations sont neutralisées.

## À personnaliser

- **Contact** : l'adresse e‑mail dans le CTA final et le pied de page.
- **Chiffres** : `data-count` dans la section « L'auteur ». Deux chiffres réels (50 dirigeants, 20 ans) ; la troisième case est libre, réservée au taux de recommandation quand il sera mesuré.
- **Offre** : les bandes `.band` de la section `#offre` et le bloc `#sprint`.
- **Mentions légales** : à ajouter si le site est mis en ligne.


## Déploiement et conversion

Le site est déployé sur **Netlify** (`netlify.toml` à la racine, aucun build). Deux réglages
à faire une seule fois dans l'interface Netlify :

1. **Site configuration → Forms → Enable form detection**, puis redéployer une fois.
2. **Forms → Form notifications → Add notification → Email**, vers votre adresse.

Le formulaire de contact utilise **Netlify Forms** (100 envois/mois sur l'offre gratuite),
avec un **pot de miel** comme anti-spam — surtout pas reCAPTCHA, qui chargerait des scripts
Google et ferait tomber la promesse « aucune ressource tierce ».

Le bouton de réservation est un **lien sortant**, jamais un module intégré : un widget
Cal.com ou Calendly poserait des cookies tiers sur la page. L'URL apparaît à deux endroits,
signalés par un commentaire `⚠️` :

```
grep -rn "cal.com" *.html
```

L'événement Cal.com est configuré en trente minutes, visioconférence Cal Video,
slug `diagnostic` — c'est ce slug que les deux liens du site attendent.

> Le formulaire ne fonctionne que sur Netlify. En prévisualisation locale ou dans un
> artefact Claude, l'envoi échoue — c'est normal.

## Image de partage

`site/assets/img/og.jpg` est rendue depuis `tools/og-image.html` avec les polices et la
scène du site : voir `tools/README-og.md` pour la refabriquer. Les cinq pages portent
les balises Open Graph et Twitter Card qui la déclarent.

Le domaine est `avecjulien.fr`. Open Graph exigeant des URL absolues, il apparaît en
clair dans les cinq `<head>`, ainsi que dans `sitemap.xml` et `robots.txt`. En cas de
changement :

```
grep -rl "avecjulien.fr" . --include=*.html --include=*.xml --include=*.txt
```

`site/index.html` porte aussi un bloc JSON-LD `ProfessionalService`. Il est en ligne, donc
soumis au `script-src` de la politique de sécurité : celle-ci l'autorise **par son
empreinte sha256**, inscrite dans `netlify.toml`. Toute modification du bloc impose de
recalculer cette empreinte, sinon le navigateur le bloque.

## Obligations qui ne s'arrêtent pas à la mise en ligne

Trois points extraits des encadrés retirés des pages légales, parce qu'ils
survivent à la publication :

- **« Cet enregistrement ne vaut pas agrément de l'État »** doit figurer partout où
  le numéro de déclaration d'activité apparaît — devis, conventions, plaquettes,
  signatures de courriel. Pas seulement sur le site. Son omission est sanctionnée
  (art. L. 6352-12 du Code du travail).
- **Les demandes d'aménagement liées au handicap**, prévues par les CGV, peuvent
  révéler des données de santé. Elles ne se stockent pas dans un tableur partagé.
- **Toute brique tierce ajoutée au site** — mesure d'audience, vidéo intégrée,
  formulaire externe, pixel publicitaire — fait tomber la promesse « aucune
  ressource tierce », impose un bandeau de consentement et oblige à rouvrir la
  politique de confidentialité. C'est la décision la plus coûteuse à revenir en
  arrière.

## Avant la mise en ligne

- [ ] Renommer le slug Cal.com en `diagnostic` (ou corriger les deux liens du site)
- [ ] Vérifier l'aperçu dans le LinkedIn Post Inspector après la mise en ligne
- [ ] Activer la détection des formulaires dans Netlify et brancher la notification
- [ ] Faire relire les CGV par un professionnel du droit
