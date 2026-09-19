# Journal des décisions

Ce document conserve le **pourquoi** des choix faits sur ce site. Le code dit ce qui a
été fait ; ce fichier dit pourquoi, pour que les évolutions futures ne défassent pas par
inadvertance ce qui tient le dispositif debout.

Session de conception : https://claude.ai/code/session_017Pk5cQ2PU4TFQHiBhnLPhy
Page publiée : https://claude.ai/artifact/SoUQGzfV84RNbb7eSVZeqY

---

## 1. Le principe du site

Vendre avec le plus grand sérieux un stylo à bille en plastique à trente centimes, comme
s'il s'agissait d'un lancement produit majeur — puis révéler, aux deux tiers de la page,
que toute la mise en scène *était* la démonstration commerciale.

La direction artistique reprend celle d'[oryzo.ai](https://oryzo.ai) (studio Lusion), qui
applique la même idée à un dessous-de-verre en liège.

## 2. Le stylo plutôt que le dessous-de-verre

**Question posée :** le stylo est-il trop évident, trop peu mystérieux ?

**Décision : garder le stylo.** Le dessous-de-verre fonctionne pour Lusion parce qu'il est
*arbitraire* — personne n'a de script mental sur un sous-bock, donc l'absurdité est de la
pure surprise. Un studio de design peut se le permettre : l'objet ne doit rien signifier.

Ici l'objet doit atterrir sur « je forme des vendeurs ». Le stylo est l'objet le plus
chargé de l'univers de la vente : il porte déjà le test, l'entretien d'embauche, la scène
culte. On échange du mystère contre de la **pertinence**, et c'est le bon change pour une
carte de visite de formateur.

**Risque identifié :** parce que l'objet est chargé, un visiteur du métier devine la chute
avant la révélation, et les deux mille mots de montée en tension tombent à plat.

## 3. L'épreuve — et pourquoi elle est placée après la divulgation

Le quiz est le remède au risque ci-dessus : il convertit le visiteur qui a deviné en
candidat qui se teste. Celui qui vous devance cesse d'être spectateur.

**Contrainte structurante : le quiz vient après la divulgation, jamais avant.** Placé
avant, il évente le dispositif. Placé après, le score devient la qualification qui rend le
passage à l'offre légitime au lieu de commercial.

**La valeur n'est pas le score, c'est le bilan.** Chaque question se conclut par une
explication de trois lignes : c'est là que se démontre l'expertise. Un score seul ne prouve
rien.

**Les quatre verdicts mènent tous à l'offre, mais pas à la même.** Le palier maximal
(10-12) oriente vers le coaching d'équipe, pas vers la formation individuelle : un
excellent vendeur à qui l'on propose d'apprendre à vendre referme l'onglet.

Barème et paliers : `data-points` dans le HTML, constante `TIERS` dans `main.js`.

## 4. Les deux registres typographiques

La casse n'est pas esthétique, elle indique **qui parle**.

- **Capitales, graisse 500** — la voix « fiche produit », froide, qui parodie le langage
  des lancements tech.
- **Casse normale, graisse 650, corps plus grand** (`.voice`) — la voix humaine.

Les minuscules tombent sur l'accroche puis sur tout le dernier tiers. Le site commence en
voix humaine pour attraper, enfile le masque corporate pendant la parodie, et le retire
définitivement à la divulgation. **La typographie joue la révélation.**

En ajoutant un titre : choisir le registre selon qui parle, jamais selon la taille voulue.

## 5. Le bouton « Précommander »

Il ne mène à aucune commande. Le premier clic répond sur place « Aucun stylo n'est vendu
ici » ; les clics suivants font monter une escalade dont la troisième réplique retourne
l'insistance du visiteur en argument de formation ; le cinquième emmène à la divulgation.
Sans JavaScript, le lien y conduit directement.

C'est à la fois la meilleure blague du site et sa protection principale : la mise au point
apparaît exactement au moment du geste d'achat. **Ne jamais transformer ce bouton en
formulaire de commande.**

## 6. Les protections juridiques

Le site affiche « Précommander » et une grille tarifaire pour un produit qui n'existe pas.
Trois garde-fous, à conserver ensemble :

1. le bouton qui répond au lieu de vendre (§5) ;
2. tous les autres boutons d'achat mènent à la divulgation ;
3. l'article 6 des mentions légales énonce qu'aucun stylo n'est vendu, et le pied de page
   le répète.

Les pages légales sont écrites pour un **organisme de formation déclaré (NDA), non
certifié Qualiopi, vendant en B2B**. Tout changement sur l'un de ces trois points impose
une relecture des CGV.

## 7. Les polices sont hébergées avec le site

Figtree et JetBrains Mono (SIL OFL 1.1) sont servies depuis `assets/fonts/`. Le site ne
fait **aucune requête vers un serveur tiers** : aucune adresse IP de visiteur n'est
transmise, et la politique de confidentialité peut l'affirmer sans réserve. Les fichiers
`LICENSE-*.txt` doivent rester à côté des `.woff2`.

Ne pas réintroduire d'appel à un service de polices distant.

## 8. Le stylo 3D

Prisme hexagonal de 28 faces en CSS 3D, pas une image. L'éclairage de chaque face est
recalculé à chaque image, avec un **terme de Fresnel** sur le corps : une face vue de biais
renvoie plus de lumière, ce qui fait lire le tube comme du cristal et laisse voir la
colonne d'encre. C'est ce terme qui fait toute la matière — le retirer donnerait un tube
de plastique gris.

## 9. Le hero : le nom en grand, l'argument dans le cartel

D'après la vraie page d'accueil de la référence. Le très grand mot n'est pas la promesse,
c'est **la marque** ; la phrase de vente est reléguée dans un cartel translucide en bas à
gauche, comme l'étiquette d'une œuvre au mur. Le nom occupe l'espace, l'argument se lit en
petit — et c'est ce décalage qui fait l'allure.

Sémantiquement, le `<h1>` reste la phrase (« Le stylo à bille le plus inutilement
sophistiqué du monde. ») dans le cartel ; le mot « JULIEN » est un élément de marque, pas
un titre.

La scène d'atelier est **entièrement dessinée en CSS** : bureau en bois, tapis de découpe
vert avec sa trame et ses graduations imprimées, bon de commande, trombone, et le stylo
posé en travers. Le vert du tapis est l'**olive** de la palette à quatre valeurs, déclarée
dès le départ dans les tokens et restée inutilisée jusqu'ici.

### La teinte du cartel, relevée au pixel

Le cartel ne doit **jamais assombrir** la scène : il l'éclaircit.

Valeurs obtenues par **régression linéaire sur 104 paires intérieur/extérieur** le long du
bord droit du cartel de la référence, à distance du bord pour échapper au flou. Le fond y
varie de 64 à 218 en rouge, ce qui donne une pente fiable :

    voile = rgb(181,150,113) à 64 % d'opacité, flou d'arrière-plan ≈ 26 px

Les trois canaux donnent la même opacité à 0,015 près (R² ≈ 0,70), ce qui valide le modèle.

> Une première estimation à 33 % d'opacité, tirée d'une seule paire de points, était
> fausse : elle comparait deux endroits où le voile lui-même varie. **Ne jamais estimer
> ce genre de valeur sur moins d'une dizaine de points.**

### Ce qui fait vraiment lire la transparence

Ce n'est pas l'opacité, c'est **ce qu'il y a derrière**. Sur la référence, la limite entre
le tapis vert et le bois éclairé passe derrière le cartel : la luminance y varie de 16
points sur sa hauteur, et c'est cette variation vue au travers du flou qui donne
l'impression de verre.

Un cartel posé sur un fond uniforme paraît opaque quelle que soit son opacité réelle. La
géométrie du décor a donc été revue pour que le bord inférieur du tapis traverse le
cartel, et le bureau en bois a été éclairci pour qu'il y ait un contraste à voir.

Une lumière directionnelle venue du haut-droit assombrit le coin bas-gauche, où se trouve
le cartel : c'est physiquement cohérent et cela recale la teinte rendue dans la fourchette
de la référence (luminance 107→115 contre 99→114).

Contraste du texte blanc chaud `#fff9f2` : 4,15:1. Le cartel de la référence n'atteint pas
non plus 4,5:1 — aucun texte clair ne le peut sur cette teinte. Le corps et la graisse du
texte ont donc été relevés d'un cran plutôt que de fausser la couleur.

Une vraie photographie peut remplacer la scène : il suffit de poser une image en fond de
`.mockup` et de masquer ses enfants.

### Deux pièges rencontrés

Un `padding` en pourcentage se résout sur la **largeur du bloc conteneur**, jamais sur
celle de l'élément : `padding: 10% 11%` sur une feuille de 218 px dans un conteneur de
1744 px produisait 384 px de rembourrage, qui forçait la largeur du bloc. Les rembourrages
de la scène sont donc en pixels.

Les tailles de la nature morte sont calées sur la fenêtre (`clamp(…vw…)`) et non sur le
conteneur, pour que le rapport stylo/feuille reste constant à toutes les largeurs.

## 10. Un piège CSS à ne pas réintroduire

`body { overflow-x: hidden }` transforme le body en conteneur de défilement et **neutralise
tous les `position: sticky` de la page**. Le symptôme est discret : les éléments collants
fonctionnent en début de section puis décrochent.

Pour contenir un débordement horizontal, utiliser `overflow-x: clip` sur `html`, qui n'a
pas cet effet de bord.

Deuxième piège lié : dans une grille avec `align-items: start`, la colonne d'un élément
collant n'est pas étirée à la hauteur de la ligne — il décroche à mi-parcours. La colonne
doit être en `align-self: stretch`, l'élément collant étant à l'intérieur.

## 11. L'image de partage, rendue et non dessinée

Un lien collé dans LinkedIn, Slack ou iMessage est presque toujours vu **avant** le site.
Sans `og:image`, il s'affiche en ligne de texte grise ; c'est le seul endroit où un
travail de plusieurs semaines peut être annulé par une balise manquante.

L'image n'a pas été dessinée dans un outil graphique. `tools/og-image.html` est une page
de 1200 × 630 qui recharge les polices, les couleurs et la scène d'atelier du hero, et
qu'on photographie avec Chromium en 2× avant de réduire. Trois conséquences : la charte
ne peut pas diverger, la retouche se fait en CSS, et le fichier pèse 70 Ko parce que rien
n'est photographique.

Ce qui a été écarté :

- **Le cartel translucide du hero.** Reproduit tel quel, il devenait illisible à 300 px de
  large — la largeur réelle d'un aperçu dans un fil mobile. Le partage est une affiche,
  pas une copie de la page : titre plein cadre, scène repoussée à droite.
- **Un mot en ember dans le titre.** Le site ne colore jamais un mot dans un titre ;
  l'accent est déjà porté par le capuchon du stylo.
- **Tout chiffre.** Prix, dates, nombre de clients : les réseaux sociaux mettent l'image
  en cache pendant des mois, une correction ne les rattrape pas.

Open Graph n'accepte que des URL absolues, ce qui oblige à inscrire le domaine en clair
dans chaque `<head>`. Plutôt qu'un domaine provisoire qui survivrait silencieusement à la
mise en ligne, le fichier porte le jeton `https://VOTRE-DOMAINE.fr` : il est visible, il
est unique, et un seul `sed` le remplace sur les cinq pages.

## 12. La frontière passe à la Divulgation, pas avant

Premier jugement, erroné : j'avais supprimé la section « Adoption » et ses cinq
témoignages inventés, au motif qu'on n'installe pas de fausses personnes sur le site
d'un formateur. Julien a tranché autrement, et mieux : **tout ce qui précède le
dénouement fait partie de la mise en scène, et doit être assumé comme tel.**

Il a raison, pour une raison que j'avais manquée : ces cinq témoins ne cautionnent pas
son activité. Ils parlent d'un stylo qui signe des contrats à 240 000 € et d'un
fournisseur qui n'augmente jamais ses tarifs. Ils appartiennent au décor, exactement
comme les benchmarks truqués et le BibTeX. Les retirer n'était pas une précaution,
c'était un trou dans la démonstration.

La frontière utile n'est donc pas « vrai / faux », c'est **avant / après la
Divulgation** :

- **Avant** — tout peut être inventé, et l'est ouvertement. Le pied de page le déclare,
  la section 12 le confirme. Un lecteur qui s'arrêterait à la section 9 n'a pas été
  trompé : il a été mis en scène, et le site le lui dira dix écrans plus bas.
- **Après** — plus rien ne peut l'être. Les chiffres, les témoignages, l'offre, les
  financements : tout ce qui suit le dénouement engage une activité réelle, et la
  moindre invention y devient une allégation commerciale.

Le carrousel existe donc en deux exemplaires, et c'est la meilleure version des deux
idées : la même forme revient après la bascule, avec de vraies voix dedans. Le visiteur
reconnaît le composant et mesure d'un coup ce qui a changé.

Conséquence technique : le composant ne peut plus s'appuyer sur un identifiant unique.
`initCarousel` s'applique à chaque `.carousel` et résout ses puces, ses flèches et ses
cartes **à l'intérieur de lui-même**. Le site compte désormais seize actes, ce que les
métadonnées Open Graph annoncent.

## 13. Ce qui reste à faire

Voir la liste en fin de `README.md`. Les points bloquants avant une mise en ligne réelle :
champs `.tbd` des pages légales, suppression des encadrés de remarques, option TVA à
trancher, chiffres réels de la section « L'auteur », témoignages fictifs, et relecture des
CGV par un professionnel du droit.
