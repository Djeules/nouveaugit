# Page de présentation — expert en bâtiment, Saint-Nazaire

Une page unique, autonome (`index.html`), sans dépendance ni build.
Seules les polices sont chargées depuis Google Fonts.

## Avant la mise en ligne

Ouvrez `index.html` et remplacez tout ce qui est entre crochets — la liste
complète est rappelée en commentaire en haut du fichier :

| À remplacer | Où |
| --- | --- |
| `[Prénom Nom]` | en-tête, pied de page |
| `[06 XX XX XX XX]` | accroche, contact, et les deux liens `tel:+33600000000` |
| `[prenom@domaine.fr]` | contact, et les liens `mailto:` |
| `[XX]` ans, `[vos diplômes]`, `[Assureur]` | section « Qui je suis » |
| `[tarif]` (×3) | section « Honoraires » |
| `[SIRET]` | pied de page |

Pensez aussi à adapter la balise `<meta name="description">` et le `<title>`
une fois votre nom en place : c'est ce que Google affiche.

## Mise en ligne

N'importe quel hébergeur de fichiers statiques convient : déposez `index.html`
à la racine. GitHub Pages, Netlify ou l'hébergement mutualisé de votre
registrar font tous l'affaire.

## Notes

- S'adapte au mobile et au mode sombre du visiteur.
- Aucun cookie, aucun script, aucun tracker : rien à déclarer côté RGPD.
- Si vous ajoutez un formulaire de contact plus tard, ce ne sera plus vrai.
