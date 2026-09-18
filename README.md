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

`index.html` · `assets/css/styles.css` · `assets/js/main.js`
Aucune dépendance, aucune étape de build. Ouvrir `index.html` suffit.

Sections : hero → bandeau défilant → manifeste → anatomie (stylo collant) → capacités →
configurateur → benchmarks → modèle open weight → recherche/BibTeX → témoignages → tarifs →
FAQ → **divulgation** → formations → appel à l'action → pied de page.

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
