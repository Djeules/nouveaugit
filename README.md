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
remplacer la déclaration `--sans` dans `assets/css/styles.css` par Halyard Display.

Les deux polices sont **hébergées avec le site** (`assets/fonts/`), en version variable,
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

`index.html` · `mentions-legales.html` · `cgv.html` · `politique-de-confidentialite.html`
`assets/css/styles.css` · `assets/js/main.js`
Aucune dépendance, aucune étape de build. Ouvrir `index.html` suffit.

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
- **Chiffres** : `data-count` dans la section « L'auteur » (commerciaux formés, années, recommandation).
- **Formations** : les quatre cartes `.offer`.
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
signalés par un commentaire `⚠️ REMPLACER` :

```
grep -rn "cal.com/julien" *.html
```

> Le formulaire ne fonctionne que sur Netlify. En prévisualisation locale ou dans un
> artefact Claude, l'envoi échoue — c'est normal.

## Avant la mise en ligne

- [ ] Remplir tous les champs `.tbd` des trois pages légales
- [ ] Supprimer les encadrés `.note-box` des pages légales
- [ ] Choisir l'option TVA dans les CGV (article 5) et supprimer l'autre
- [ ] Remplacer l'adresse e-mail par une adresse sur votre nom de domaine
- [ ] Corriger les chiffres de la section « L'auteur » (formés, années, recommandation)
- [ ] Remplacer les témoignages fictifs par de vrais, ou les retirer
- [ ] Remplacer l'URL de réservation aux deux emplacements signalés
- [ ] Activer la détection des formulaires dans Netlify et brancher la notification
- [ ] Compléter le nom et le NDA du partenaire Qualiopi dans les CGV (article 6)
- [ ] Faire relire les CGV par un professionnel du droit
