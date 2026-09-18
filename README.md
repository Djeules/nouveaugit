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

Ce site utilise **Figtree** (Google Fonts, libre), la substitution géométrique la plus proche,
plus **JetBrains Mono** pour les étiquettes techniques. Pour coller à 100 % à la référence,
remplacer la déclaration `--sans` dans `assets/css/styles.css` par Halyard Display.

> L'interlignage a été légèrement ouvert (`.94` au lieu de `.86`) : les capitales accentuées
> françaises (É, À, Ô) ont besoin de plus de place que l'anglais de la référence.

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

## Interactions

Écran de chargement, curseur personnalisé et boutons aimantés, découpe des titres en lignes
animées, apparitions au défilement, compteurs, barres de benchmark, manifeste qui s'allume
mot à mot, rotation du stylo pilotée par le défilement, bascule de configuration, accordéon FAQ,
copie du BibTeX, menu plein écran en mobile.

`prefers-reduced-motion` est respecté : toutes les animations sont neutralisées.

## À personnaliser

- **Contact** : l'adresse e‑mail dans le CTA final et le pied de page.
- **Chiffres** : `data-count` dans la section « L'auteur » (commerciaux formés, années, recommandation).
- **Formations** : les quatre cartes `.offer`.
- **Mentions légales** : à ajouter si le site est mis en ligne.


## Avant la mise en ligne

- [ ] Remplir tous les champs `.tbd` des trois pages légales
- [ ] Supprimer les encadrés `.note-box` des pages légales
- [ ] Choisir l'option TVA dans les CGV (article 5) et supprimer l'autre
- [ ] Remplacer l'adresse e-mail par une adresse sur votre nom de domaine
- [ ] Corriger les chiffres de la section « L'auteur » (formés, années, recommandation)
- [ ] Remplacer les témoignages fictifs par de vrais, ou les retirer
- [ ] Héberger les polices avec le site plutôt que via Google Fonts (RGPD)
- [ ] Faire relire les CGV par un professionnel du droit
