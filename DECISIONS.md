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

## 13. Le miroir joue sur le rôle, jamais sur la forme

La symétrie décrite plus haut a un piège : reprendre les mêmes composants après la
bascule produirait un copier-coller, et un copier-coller se voit. La règle est donc plus
stricte — chaque section d'après répond au **rôle** d'une section d'avant, et n'emprunte
rien à son apparence.

La ligne de partage est l'interaction elle-même :

- **Dans la fiction, tout se cache et se révèle.** Accordéon qu'on déplie, carrousel
  qu'on fait défiler, stylo en 3D qu'on tourne, cartes qui réagissent au survol. Une
  fiche produit ménage ses effets, c'est sa nature.
- **Après la bascule, tout est montré d'un coup.** Un tableau qu'on lit, des questions
  dont les réponses sont déjà écrites, une colonne de texte. Ce qui se déplie relève du
  spectacle ; ce qui est écrit relève de l'engagement.

Conséquence directe, à traiter : les vrais témoignages sont encore dans un carrousel.
Cinq personnes réelles rangées derrière des flèches, c'est la grammaire de la fiction.

Deux gestes typographiques scellent la bascule, tous deux gratuits :

- **La numérotation meurt avec la fiction.** « 12 — Divulgation » est la dernière
  étiquette numérotée du site. Le compte appartenait à la fiche produit ; il n'a plus
  d'objet une fois l'aveu passé. Bénéfice secondaire : plus aucune renumérotation à
  chaque ajout, et les métadonnées de partage annoncent désormais « douze actes, puis
  la vérité ».
- **Le registre bas de casse devient la loi** de tout ce qui suit.

La Divulgation, enfin, ne se contente plus de parler de Julien. Elle retourne la phrase
vers le visiteur : ce stylo ne valait rien et il lui a donné neuf minutes ; son offre,
elle, vaut quelque chose et tient dans une plaquette que personne ne lit. Sans ce
retournement, la révélation restait une performance qu'on admire au lieu d'un miroir.

## 14. L'offre : les mots du client, pas les miens

Les quatre « formations » de la section L'auteur étaient de mon invention. Julien a
fourni la vraie offre, déjà écrite sur son site Framer, et elle est meilleure que ce que
j'aurais produit parce qu'elle est précise : quatre heures, huit heures, seize heures,
un plan d'action de trente jours, une session de suivi à J+30, huit clients en simultané.
Les listes sont reprises telles quelles.

Trois écarts assumés par rapport à la source :

- **« CPF » est retiré**, « financement OPCO possible » est conservé. Le CPF suppose un
  enregistrement RNCP ou RS au nom de l'organisme ; un partenariat ne le couvre pas.
  L'OPCO, si — et c'est ce que Julien annonce déjà.
- **Le partenaire Qualiopi n'est pas nommé**, à sa demande. Le site ne porte donc aucune
  section financement : la seule mention est la ligne « financement OPCO possible » des
  deux formats. Les CGV, elles, contiennent encore le montage en attente de décision.
- **« Starter Plan » et « Growth Plan » deviennent « Demi-journée » et « Journée
  complète ».** Ce site parle français et nomme les choses par ce qu'elles sont ;
  « Sprint Site » reste, c'est un nom de produit.

La forme suit la règle du chapitre 13. La grille fictive du stylo est faite de trois
cartes côte à côte qui réagissent au survol ; la vraie est faite de bandes séparées par
des filets, sans rien à déplier ni à survoler. La formation signature occupe sa propre
section sur fond ember — la « porte séparée » demandée, visible sans être mélangée au
catalogue.

La méthode, enfin, ne reprend pas le défilement collant de l'Anatomie. Trois principes
posés à plat, en deux colonnes, comme un contrat qu'on lit d'un coup.

## 15. Une seule photographie, et c'est un visage

Le site ne contient aucune image photographique : le stylo est du CSS, l'atelier un
dégradé, la feuille un rectangle. C'est cohérent avec son propos — le premier tiers est
une construction, et il finit par l'avouer.

D'où la règle : **la seule photographie du site est le portrait de Julien, et elle
arrive après la Divulgation.** Elle n'est pas un élément de plus, c'est le moment où le
site cesse d'être fabriqué. Douze actes d'objet rendu par ordinateur, puis un homme
photographié. Pour quelqu'un qui s'apprête à passer deux jours en tête-à-tête à
1 850 €, savoir qui sera dans la pièce n'est pas un détail.

**Première tentative, ratée.** Le portrait d'origine, noir et blanc sur fond noir, a été
passé en bichromie chaude pour « entrer dans la palette ». Résultat : un rectangle sépia
posé sur un fond brun, avec un bord net. J'avais traité la photo au lieu de traiter sa
rencontre avec la page — la même erreur que sur le cartel du hero, au chapitre 8.

**La bonne réponse est de supprimer le bord, pas de l'accorder.** Le portrait est
détouré, en niveaux de gris fidèles, et le buste se dissout vers le bas sous un dégradé
d'opacité. Il n'y a plus de cadre à faire correspondre : la figure émerge du fond.

Deux points techniques qui valent d'être retenus :

- Un détourage par remplissage par diffusion échoue sur ce type d'image : la chemise
  claire et le fond blanc ont des valeurs trop proches, et le contour part en lambeaux
  aux épaules. Le fichier utilisé est un détourage propre fourni par Julien.
- Le fichier est en **niveaux de gris + alpha** (mode `LA`), deux canaux au lieu de
  quatre. 191 Ko pour 540 px de large, là où un RGBA en pesait le double.

## 16. Des monogrammes plutôt que des visages empruntés

Les vrais témoignages étaient en texte seul. La tentation, courante, est d'y coller des
portraits de banque d'images. Elle annulerait tout le travail du chapitre 12 : on ne
passe pas des heures à remplacer cinq faux témoignages par cinq vrais pour poser ensuite
le visage d'un inconnu sous le nom d'Isabelle Bertrand. Et une vraie photo de client
demanderait son accord pour l'image, distinct de l'autorisation de citation.

Chaque témoignage porte donc un disque de couleur avec ses initiales. Ça n'affirme rien,
ça identifie. Les cinq teintes sont toutes prises dans le vocabulaire existant — ember,
le brun du cartel, un olive assombri pour le contraste, le brun du capuchon, le sable de
la pointe du stylo. Aucune couleur nouvelle n'entre dans la palette.

Détail technique qui a coûté un aller-retour : `.quote span` porte le style monospace
des fonctions, avec une spécificité de (0,1,1). Une règle `.mono` seule, à (0,1,0), perd
— les initiales héritaient de la casse et du corps des étiquettes. Les règles sont
scopées en `.quote .mono`.

Le carrousel de la fiction n'en reçoit pas. Un écart de plus entre les deux moitiés.

## 17. L'audit avant mise en ligne, et ses quatre correctifs

Mesures prises sur le code, pas d'impression : page de 22 593 px, soit 27,8 écrans, et
le lien de réservation à **94 %** de la hauteur — un seul lien vers Cal.com sur toute la
page. Tous les autres boutons renvoyaient dans la fiction. Le site était une impasse.

Quatre correctifs, dans l'ordre de leur effet sur la conversion :

1. **Le bouton de la barre bascule à la Divulgation.** Avant, il dit « Précommander » et
   appartient au décor ; après, il devient « Réserver trente minutes » et pointe sur
   l'agenda. L'adresse est lue sur le lien `[data-booking]` de la section Contact : une
   seule source, jamais dupliquée dans le script.
2. **La navigation contient un chemin réel.** « L'offre » entre dans la barre et dans le
   menu ; entre 900 et 1 100 px, ce sont « Benchmarks » et « Recherche » qui s'effacent,
   jamais lui. Et « Tarifs » disparaît du menu mobile : il menait à la grille du stylo,
   donc le visiteur qui cherchait un prix tombait sur une plaisanterie. C'était le piège
   le plus coûteux du site, puisqu'il frappait le visiteur le plus qualifié.
3. **L'écran de chargement passe de 1,4 s (jusqu'à 2,8 s) à ~450 ms**, et ne se joue
   qu'une fois par session. Le délai était entièrement fabriqué : la page était prête.
4. **Le ton des étiquettes passe de 44 % à 56 % d'opacité.** Il était à 3,93:1 sur
   walnut et 3,69:1 sur bark, sous le seuil AA de 4,5 pour du petit texte, alors qu'il
   porte les numéros de section, les unités de prix et les fonctions des témoins.
   À 56 % : 5,8:1 et 5,1:1. Les filets restent à 24 %, ils ne portent rien.

Leçon d'outillage, au passage : sous `--virtual-time-budget`, Chromium ordonnance les
minuteurs et les trames d'animation autrement qu'en temps réel. Deux sondes identiques
ont donné des résultats contradictoires sur la bascule du bouton. La vérification qui
tranche lit un effet secondaire mesurable — ici la largeur de la barre de progression,
qui prouve que la boucle de défilement s'est exécutée.

## 18. Le cartel ne doit rien annoncer

La carte du hero portait « Conçu, écrit et **mis en scène** par Julien, **formateur aux
techniques de vente** ». Remarqué par Julien lui-même : cette ligne livre le dénouement
dans le premier écran. Elle annonce à la fois qu'il y a une mise en scène et qui la
signe, douze sections avant la Divulgation. Un visiteur qui la lit n'est plus dans le
jeu ; il assiste à une démonstration dont il connaît la fin.

Elle est supprimée. Comme elle portait le poids typographique du cartel, c'est le titre
qui le reprend : un cartel de musée affiche d'abord le nom de l'objet, pas la notice.

### Une régression, et la leçon qu'elle coûte

La capture qui a servi à valider ce changement a révélé autre chose : les compteurs
restaient à zéro. Cause : le correctif de l'écran de chargement, posé une heure plus
tôt, appelait `startObservers()` **de façon synchrone** pendant l'évaluation du module.
La fonction lit `observersStarted`, `counters` et `bars`, tous déclarés plus bas —
d'où une `ReferenceError` de zone morte temporelle qui interrompait **tout le script**.

Deux publics touchés, et le second est le pire : les visiteurs en animations réduites,
et **tout visiteur revenant dans la même session** — c'est-à-dire précisément le chemin
que le correctif venait d'ajouter. Le site se serait dégradé pour les gens qui
reviennent, sans que rien ne le signale.

Le code d'origine différait déjà cet appel d'un tour ; c'était la parade au même piège,
et je l'ai retirée sans voir pourquoi elle était là. La règle qui en découle :
**un appel différé d'un `setTimeout(…, 0)` sans explication est une précaution, pas une
maladresse — on cherche la raison avant de la supprimer.** Celle-ci est désormais
commentée dans le fichier.

Second enseignement : le contrôle « aucune erreur JavaScript » que j'avais passé ne
prouvait rien, parce qu'il s'exécutait en session vierge et en mouvement normal — les
deux seuls cas où le bogue ne se déclenche pas. Un contrôle doit couvrir les chemins
ajoutés, pas le chemin par défaut.

## 19. Nommer l'erreur plutôt que la corriger

Julien a relu la partie fiction et trouvé qu'elle vendait trop peu par le bénéfice.
Relecture section par section : il a raison pour trois d'entre elles, tort pour les
autres. 02 Anatomie, 03 Capacités et 04 Format sont déjà orientées utilité — « le stylo
ne roule pas hors de la table : il attend », « vos données restent sur le papier ».
En revanche 06 Évaluation est de la qualité intrinsèque pure, et 07 Modèle comme
08 Recherche n'offrent aucune utilité au lecteur en trente et trente-neuf mots.

**Ces trois sections n'ont pas été enrichies, pour deux raisons.** D'abord leur platitude
est le sujet : un lancement de modèle publie des benchmarks, des poids ouverts et un
papier, et c'est ce qu'elles imitent. Ensuite et surtout, le quiz accorde trois points à
« promouvoir sa valeur d'utilité » et un seul à « argumenter sur la qualité
intrinsèque » — or le site passe deux mille mots à faire le coup à un point.

Ce n'était pas une incohérence à réparer, c'était une démonstration que personne
n'énonçait. La phrase existait pourtant, enfouie dans l'explication de la question 1 du
quiz, qui n'apparaît qu'après avoir répondu. Elle est remontée dans la Divulgation, en
deuxième paragraphe, là où tout le monde passe.

Le site prouvait qu'il sait **mettre en scène**. Il prouve désormais qu'il sait
**diagnostiquer une argumentation**, ce qu'un dirigeant achète plus volontiers. Coût :
trois phrases, contre la réécriture de sept sections.

Détail d'écriture : « je vous ai **à peine** dit à quoi ce stylo vous sert » et non
« à aucun moment ». Les sections 02 à 04 disent bien l'utilité par endroits ; sur un
site bâti sur la précision, une exagération vérifiable coûte plus qu'elle ne rapporte.

## 20. Ce qui reste à faire

Voir la liste en fin de `README.md`. Les points bloquants avant une mise en ligne réelle :
champs `.tbd` des pages légales, suppression des encadrés de remarques, option TVA à
trancher, chiffres réels de la section « L'auteur », témoignages fictifs, et relecture des
CGV par un professionnel du droit.

---

## 21. Le mouvement a deux régimes, pas deux territoires

Julien a comparé le site à oryzo.ai et a eu raison sur un point que j'avais
mal lu : le site a des **apparitions**, pas une **mise en scène**. Tout y
arrive de la même façon — fondu plus montée — quand un site de lancement
varie ses registres.

Ma première réponse a été de refuser d'animer la seconde moitié, au nom de
la règle du miroir. C'était une lecture trop littérale. La règle interdit ce
qui **retient une information** derrière un geste : accordéon, carrousel,
survol. Elle n'a jamais interdit le mouvement — la seconde moitié en avait
déjà, titres découpés et compteurs compris.

Julien a proposé la bonne sortie : les mêmes procédés partout, en amplitude
réduite après la bascule. Son argument porte plus loin que le mien. Une
seconde moitié visuellement pauvre n'a pas l'air sobre, elle a l'air
bâclée — et c'est elle qui vend. Le contraste doit être un contraste de
**registre**, pas de **qualité**.

D'où le partage, tenu par cinq variables sous `#revelation ~ *` :

|                | Fiction | Réel |
|----------------|---------|------|
| `--rise`       | 26 px   | 12 px |
| `--rise-dur`   | .95 s   | .55 s |
| `--line-dur`   | 1.05 s  | .62 s |
| `--line-tilt`  | 3 deg   | 0 |
| `--line-step`  | .08 s   | .035 s |

Le sélecteur `#revelation ~ *` couvre toutes les sections suivantes et le
pied de page sans un attribut à poser : ils sont frères dans `<main>`. La
Divulgation elle-même garde le plein régime — elle est le sommet de la mise
en scène, pas sa sortie. Côté JS, les délais écrits dans le HTML sont
divisés par deux pour les éléments situés **après** la Divulgation et non
**dans** celle-ci : `compareDocumentPosition` doit écarter
`DOCUMENT_POSITION_CONTAINED_BY`, sinon les quatre paragraphes de l'aveu
passent en régime réel.

### Le piège du jour : j'ai réinventé un composant qui existait

J'ai écrit un bandeau défilant complet — CSS, balisage, animation — avant de
découvrir qu'il y en avait déjà un entre le hero et le manifeste, sous les
mêmes noms de classe. Mes règles, plus bas dans la feuille, écrasaient
silencieusement les siennes : le fond translucide et le corps de texte
d'origine avaient disparu sans qu'aucune erreur ne soit levée.

Corrigé en gardant l'original et en l'étendant : un masque aux deux bords,
la pause au survol, et une variante `.ticker--reel`. Le site n'a donc pas
deux bandeaux de fiction mais **un de chaque côté de la frontière** — ce qui
est exactement le miroir, appliqué au mouvement, et plus sobre que ce que
j'avais prévu.

La leçon n'est pas « lire le CSS avant d'écrire ». C'est : **chercher le nom
de classe qu'on s'apprête à créer**, une commande de trois secondes qui
aurait évité une demi-heure.

### Ce que le banc d'essai ne sait pas faire

Sous `--virtual-time-budget`, un `IntersectionObserver` branché au
chargement se déclenche (le fond suit bien la section), mais celui des
apparitions, branché 2 600 ms après `load`, ne voit rien après un scroll
programmatique. Et `--screenshot` capture avant que ce scroll ait eu lieu,
là où `--dump-dom` attend. D'où des contrôles contradictoires : page noire à
l'image, état correct à la sonde.

Ce qui a fini par trancher : sonder l'état avec `--dump-dom`, et juger
l'apparence dans une page isolée qui charge la vraie feuille de style avec
les deux bandeaux extraits du HTML. Deux outils, deux questions — au lieu
d'un outil auquel on demande les deux.

### Accessibilité : une limite assumée

Le critère WCAG 2.2.2 demande une commande explicite pour tout mouvement
automatique de plus de cinq secondes. Les bandeaux n'en ont pas : ils
s'arrêtent au survol et au focus, et ne bougent pas du tout en mouvement
réduit. C'est un compromis, retenu parce que leur contenu est répété et
qu'aucune information n'y figure qu'on ne retrouve ailleurs sur la page.
Si un bandeau devait un jour porter une information unique, il lui faudrait
un vrai bouton de pause.

---

## 22. Le plan d'atelier de l'Anatomie

Julien avait suggéré lui-même la sortie : « reprendre le concept de stylo en
style graphique ». C'était la bonne, et meilleure qu'un décalque d'oryzo.ai.
Leur site anime des photographies — des dizaines de rendus 3D d'un objet qui
existe. Ici il n'y a qu'un volume construit en CSS. Copier leurs mouvements
sans leur matière n'aurait donné que du vide en mouvement.

Le registre juste était sous la main depuis le début : un objet à trente
centimes présenté avec l'appareil d'un plan coté. C'est ce que fait tout le
texte de la fiction ; il ne manquait que le dessin.

D'où un calque par-dessus le volume — équerres de cadrage, graduations,
croix de visée, points d'ancrage — qui se tire au premier passage. Et une
cote, sous le cadre, qui suit l'étape qu'on est en train de lire : ⌀ 3,2 mm
pour le capuchon, Hex. 8,0 mm pour le corps, 3 200 m pour le réservoir,
⌀ 1,0 mm ±0,01 pour la bille. Les valeurs ne sont pas inventées pour
l'occasion : elles sont déjà dans les paragraphes, le plan ne fait que les
désigner.

Deux raisons de ne pas accrocher les cotes au stylo lui-même : il tourne
(`drawPen` reçoit un angle, pas une translation) et il grandit de 30 % sur
la traversée. Un cadre fixe ne se désaligne jamais ; des repères collés à
l'objet auraient glissé en permanence.

### Deux pièges, tous deux invisibles à l'exécution

**`stroke-dasharray` deviné.** Pour escamoter un tracé et le dérouler
ensuite, le dasharray doit valoir au moins la longueur du chemin. Sur un
`<path>` fait de sous-chemins disjoints, cette longueur ne se devine pas :
une valeur trop courte laisse des morceaux visibles et crée un motif qui se
répète. La réponse est `pathLength="1"` sur le path, qui normalise sa
longueur — `stroke-dasharray:1; stroke-dashoffset:1` l'escamote alors
exactement, quel que soit le dessin.

**`transform:none` sur ce qui se centre par transform.** Le calque se place
au centre par `translate(-50%,-50%)`. La règle `[data-reveal].is-in` pose
`transform:none` : le cadre serait parti en bas à droite au moment précis où
il devient visible. Il a fallu deux sélecteurs plus spécifiques
(`.draft[data-reveal]` et le même suffixé `.is-in`) pour repasser devant.
Règle générale à retenir : **un élément centré par transform ne peut pas
porter `data-reveal` sans se protéger**, et l'erreur ne se voit qu'à
l'instant de l'apparition.

### Ce que le banc n'a pas pu confirmer

Sous `--virtual-time-budget`, la boucle de défilement ne rejoue pas : elle
passe par `requestAnimationFrame`, qui ne se replanifie pas. L'étape active
reste donc figée sur la première, et la cote avec elle. Contrôle négatif
concluant : les deux sont figées **ensemble**, ce qui situe le blocage dans
la boucle et non dans la greffe — si la cote était en cause, l'étape
changerait sans elle. Le reste est du code de production déjà éprouvé.

À confirmer dans un vrai navigateur, en descendant les quatre étapes.

### La capsule, et le zoom qu'on ne fera pas

La capsule flottante était le dernier procédé d'oryzo.ai absent d'ici : une
pastille posée sur un visuel, texte en capitales et pastille ronde à gauche,
qui respire lentement. Elle coiffe le plan de l'Anatomie — intitulé en haut,
cote en bas — et achève de lire le cadre comme un cartouche. Son texte ne
change pas : une seule chose bouge dans ce cadre, et c'est la cote.

Nouvelle rencontre avec le même piège, sous un autre angle. La correction
précédente avait accroché le centrage du calque au sélecteur
`.draft[data-reveal]` : retirer `data-reveal` du balisage aurait suffi à
déporter le cadre, sans que rien ne le signale. Le centrage est revenu sur
`.draft` lui-même, la protection contre `transform:none` restant à part.
**Une correction de spécificité ne doit pas déplacer la règle de base ; elle
doit s'ajouter à côté.**

**Le zoom au défilement n'a pas été fait, et ne le sera pas tel quel.** Chez
Oryzo, la macro du bouchon fonctionne parce qu'ils ont des dizaines de
rendus d'un objet réel : leur zoom est un changement d'image. Ici il n'y a
qu'un volume construit en CSS, que l'Anatomie fait déjà tourner et grandir
de 30 % sur toute sa traversée. Un second zoom ailleurs redirait la même
chose, et la seule section encore libre — 03, Capacités — n'a aucun visuel
sur quoi zoomer. La place manque autant que la matière.

Le reprendre voudrait dire ajouter une section-traversée à une page qui fait
déjà vingt-sept écrans, pour un geste que le site produit ailleurs. Mieux
vaut ne pas le faire que le faire à moitié.

---

## 23. Le dépôt se coupe en deux

`avecjulien.fr/decisions.md` répondait 200. Vingt-deux chapitres y
expliquaient à qui voulait les lire que les onze premières sections sont une
mise en scène, à quel moment la bascule tombe et ce qu'elle doit produire
chez le lecteur. `CLAUDE.md`, `README.md` et `tools/` étaient servis de la
même façon.

Ce n'est pas un problème de confidentialité — rien là-dedans n'est secret.
C'est que ce site ne produit son effet qu'une fois, sur quelqu'un qui ne l'a
pas vu venir, et que le mode d'emploi du tour se trouvait posé à côté du
tour, indexable.

La coupure retenue est celle qui ne demande de réécrire aucun chemin :
`publish = "site"` dans `netlify.toml`, et tout ce qui part en ligne
déménage dans `site/`. Les liens du site sont tous relatifs, ils survivent
au déplacement sans une modification. Les URL publiques ne bougent pas
davantage : `avecjulien.fr/cgv.html` reste `avecjulien.fr/cgv.html`.

`netlify.toml` reste à la racine — Netlify l'y cherche. Les gabarits de
`tools/` pointaient vers `../assets/fonts/` et pointent désormais vers
`../site/assets/fonts/`.

Effet de bord assumé : `tools/linkedin-banner.jpg` n'est plus téléchargeable
depuis le site. Il avait servi une fois, à récupérer la bannière sur un
téléphone ; il reste dans le dépôt.

Les autres voies avaient chacune leur défaut. Des redirections 404 par
chemin laissent les fichiers en ligne et se contentent de les cacher, en
oubliant le prochain fichier ajouté. Renommer en fichiers pointés est
illisible. Un `.gitignore` ne s'applique pas au déploiement. Le dossier
publié était la seule réponse qui vaut aussi pour ce qu'on écrira demain.

### Le contrôle qui compte

Pas « le site s'affiche-t-il encore ». Les deux listes : ce qui doit
répondre 200 (les cinq pages, le CSS, le JS, une police, l'image de partage,
robots.txt, sitemap.xml) et ce qui doit répondre 404 (`DECISIONS.md`,
`CLAUDE.md`, `README.md`, `tools/`). Un serveur local lancé depuis `site/`
reproduit exactement ce que Netlify servira.

---

## 24. Le calque était invisible là où le site se lit

Julien : « je ne vois pas les animations ». Il lit le site sur son
téléphone. Le calque de plan et sa capsule portaient
`@media (max-width:980px){.draft{display:none}}`, posé la veille avec ce
commentaire : *« la colonne du stylo passe derrière le texte »*.

C'était une supposition, et elle était fausse. Sous 900 px, l'Anatomie passe
en une colonne : la scène devient une bande fixe de 56 svh en haut de
l'écran, et les étapes défilent dessous. Le cadre coté n'a jamais eu de
paragraphe sous lui — il suit la bande, exactement comme le stylo.

Deux erreurs empilées, et la seconde est la plus coûteuse :

1. Décrire une mise en page sans la regarder. Trois lignes de
   `@media (max-width:900px)` disaient le contraire de ce que j'affirmais.
2. Poser la coupure à **980 px** quand la bascule de mise en page est à
   **900 px**. Même si le motif avait été bon, la borne était fausse.

Résultat : une journée de travail invisible sur le seul écran où le site est
réellement lu. La règle « vérifier, pas supposer » de `CLAUDE.md` vise les
régressions ; celle-ci n'en était pas une, elle était pire — une
fonctionnalité livrée éteinte, et qu'aucun contrôle ne pouvait signaler
puisqu'elle se comportait exactement comme écrit.

Le calque s'affiche donc sous 900 px, à l'échelle de la bande (46 svh). La
capsule y resserre son corps et son interlettrage : « Parfaitement
hexagonal, sérieusement » fait trente-sept signes, et devait tenir sans
déborder ni passer à la ligne.

À retenir : **toute `@media` qui masque un élément doit nommer la règle de
mise en page qu'elle compense, et partager sa borne.** Une valeur ronde
choisie au jugé ne tombe jamais au bon endroit.

Limite du contrôle : Chromium impose une largeur de fenêtre minimale de
485 px en mode sans interface. Le rendu a donc été vérifié à 490 px, et le
comportement sous 400 px déduit des largeurs — le cadre y est à 64 vw, la
capsule à largeur de contenu fixe.

---

## 25. Une coupe envisagée, mesurée, puis annulée

Julien a trouvé la page trop longue sur mobile et demandé la suppression de
la section 07 (Modèle). Elle a été faite, mesurée, puis annulée sur sa
demande. Ce qui reste de l'aller-retour, ce sont les chiffres — et un défaut
découvert en chemin.

**La coupe rapportait 828 px sur 21 605, soit 3,8 %** : de 25,1 à 24,2
écrans à 490 px de large. Une section en moins pour moins d'un écran de
défilement gagné.

Hauteurs relevées à cette largeur, à garder pour la prochaine fois :

| Fiction | px | | Réel | px |
|---|---:|---|---|---:|
| Anatomie | 1 930 | | Méthode | 1 997 |
| Tarifs | 1 451 | | Offre | 1 597 |
| Benchmarks | 1 272 | | Contact | 1 539 |
| Recherche | 1 066 | | Sprint | 939 |
| Format | 1 039 | | Divulgation | 888 |
| Capacités | 967 | | Épreuve | 857 |
| Configurateur | 832 | | Pied de page | 771 |
| Modèle | 798 | | Témoignages | 749 |
| Manifeste | 598 | | | |
| **Total fiction** | **12 219** | | **Total réel** | **9 385** |

Deux enseignements pour toute demande de raccourcissement à venir. **Aucune
section ne pèse plus de 9 %** : il n'existe pas de coupe unique qui
raccourcisse la page de façon sensible, et la chercher revient à sacrifier
une section pour rien. Et **la fiction pèse 12 219 px contre 9 385 au
réel** : y couper pour abréger revient à raboter la démonstration qui donne
son poids à l'aveu. Les leviers utiles sont ailleurs — les espacements
verticaux sur mobile, qui ne coûtent aucun contenu.

### Ce qui est resté : le chiffre de la Divulgation

En comptant les mots pour mesurer l'effet de la coupe, découverte d'un
défaut sans rapport avec elle. La Divulgation affirmait « vous venez de lire
**près de deux mille mots** ». La fiction en compte **1 301**.

Second comptage, sur le DOM rendu cette fois, script exécuté, pour inclure
ce que le configurateur et les carrousels fabriquent à la volée :
**1 207 mots**. Le comptage sur le fichier source était même un peu
généreux.

J'ai proposé « mille trois cents mots ». **Julien a tranché pour le
maintien de « près de deux mille »**, et c'est sa décision : la phrase est
sa signature, et elle appartient à un texte de vente avant d'appartenir à
un rapport. Le chiffre reste donc tel quel.

L'objection est consignée ici plutôt que répétée : c'est le seul endroit du
site où l'on explique au lecteur qu'il vient d'être manipulé, et un
arrondi de moitié y est vérifiable en une minute. Si la question revient,
il existe une troisième voie qui garde le rythme sans le chiffre — « vous
venez de passer neuf minutes sur un objet en plastique moulé », la durée
étant déjà annoncée plus loin dans la même phrase.

**Ce qui reste vrai quoi qu'il arrive : tout chiffre énoncé après la
Divulgation doit être recompté quand on touche à ce qui précède.** La
frontière ne sépare pas seulement le faux du vrai — elle crée une
dépendance, puisque le vrai d'après parle du faux d'avant. Le compte du
jour : 1 207 mots.

---

## 26. Le quiz refait : pourquoi on devinait sans réfléchir

Julien a trouvé le quiz « trop évident, comme si les gens pouvaient sentir la
bonne réponse ». Le défaut n'était pas la difficulté des sujets, il était
structurel, et tenait en trois points.

**La forme trahissait la réponse.** Dans trois questions sur quatre, la bonne
option était la seule formulée comme une question ou comme une non-action.
Le motif se repère à la deuxième question, et on répond juste sans lire.

**Les distracteurs étaient des repoussoirs.** « Valoriser son prix bas »,
« Je peux vous faire un geste », « Une réduction » — des fautes que personne
ne choisit. Un distracteur utile est une pratique que des commerciaux
compétents emploient vraiment.

**La morale était connue d'avance.** Dans un quiz de vente, tout le monde
sait que la réponse attendue est *écouter, questionner, se taire*. On tombe
juste par réflexe culturel, sans compétence.

Cinq questions remplacent les quatre, sur le même balisage. Les options sont
désormais toutes défendables, et la distinction porte sur une nuance : le
bon geste au mauvais moment, la bonne question posée trop tôt. La cinquième
demande **l'erreur** et non la bonne pratique, ce qui casse le réflexe de
chercher la réponse vertueuse.

### Le piège qu'on a failli recréer

Julien a donné ses bonnes réponses : A, C, A, A, A. Quatre A sur cinq — un
motif plus lisible encore que celui qu'on venait de corriger. Les options
ont été redistribuées sans toucher au fond : les bonnes réponses tombent en
**C, A, D, B, D**.

**À tenir pour toute question ajoutée plus tard : vérifier la distribution
des lettres avant de publier.** C'est une vérification de dix secondes qui
annule des heures de travail sur le contenu quand on l'oublie.

Barème : 3 points pour la bonne réponse, 2 pour la défendable, 1 pour la
médiocre, 0 pour la fautive — quinze points au total. Le maximum se calcule
tout seul en JS, mais **les quatre paliers de résultat étaient en dur sur
12** et ont dû être recalés sur 0-4 / 5-8 / 9-12 / 13+.

### Trois retouches visuelles signalées par Julien

**Le cartel du hero** était le seul objet beige du site — `rgba(181,150,113,.64)`,
une couleur relevée sur la référence d'origine et reprise nulle part
ailleurs. Il prend la teinte des autres cadres du site. Bénéfice second, plus
sérieux que l'esthétique : son texte est en crème clair, et le contraste
passe de **3,57:1 à 11,68:1** sur le pire fond. L'ancien était sous le seuil
AA sans que personne l'ait vu.

**Le bon de commande** était à l'aplomb du texte centré du hero, qui devenait
illisible sur la dernière ligne. Déplacé de 48 % à 64 %, le stylo de 50 % à
54 % pour qu'ils se détachent l'un de l'autre sans quitter la scène.

**Le stylo de la Divulgation** occupait la droite, où il serrait la colonne
de texte — d'où le `padding-right` de 250 px qu'elle portait pour s'en
écarter, et le quart de page vide en bas à gauche que Julien a remarqué. Le
stylo passe à gauche, dans ce vide ; le texte récupère sa largeur. Un
objet mal placé créait deux défauts à la fois.

### Le « y » coupé : une compensation qui n'était faite qu'à moitié

Julien a vu que le jambage du « y » de « stylo » était tranché net dans le
titre de la Divulgation.

Le mécanisme de découpe en lignes enferme chaque ligne dans un bloc à
`overflow:hidden` — c'est ce masque qui permet au texte de monter depuis le
bas à l'apparition. Avec une interligne de `.94`, cette boîte est plus
courte que les glyphes eux-mêmes : elle rogne ce qui dépasse.

La parade était déjà là, mais d'un seul côté :
`padding-top:.14em; margin-top:-.14em` élargit la boîte vers le haut pour
les accents et annule l'effet sur le flux. Rien n'avait été fait en bas,
alors que c'est le côté des jambages — y, g, p, q, j.

Corrigé par `padding-block:.14em .18em` et la marge négative
correspondante. Un peu plus en bas qu'en haut : un jambage descend plus
loin sous la ligne de base qu'un accent ne monte au-dessus des capitales.

**La leçon générale : une compensation de boîte se fait toujours sur les
deux axes.** Le défaut ne se voit que sur les mots qui portent une
descendante, ce qui le rend invisible à la relecture — « Ce stylo ne vaut
rien » l'a montré parce que c'est le plus grand titre du site.
