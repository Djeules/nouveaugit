# Diffusion sur les réseaux — méthode

Ce fichier consigne tout ce qui a été décidé et fabriqué pour porter le site
sur LinkedIn puis sur Instagram : la doctrine, les gabarits, la manière de
publier. Il vit dans `tools/`, donc hors du dossier publié.

---

## 1. La doctrine : ne jamais présenter le concept

La première intention était d'écrire un post qui « présente le concept du
site ». C'était l'erreur à ne pas commettre.

Ce site ne produit son effet **qu'une fois, sur quelqu'un qui ne l'a pas vu
venir**. Un post qui explique « j'ai fait un site qui vend un stylo pour
démontrer les techniques de vente » offre le dénouement avant l'histoire :
le lecteur arrive prévenu, cherche le procédé au lieu de le vivre, et le
meilleur actif commercial est brûlé en une publication — pour lui comme pour
tous ceux à qui il le racontera.

**L'angle retenu est le quiz.** Il donne de la valeur immédiate, il ne
dévoile rien, et il transforme le lecteur en participant.

### Le piège du lien direct vers l'épreuve

L'épreuve est placée **après** la Divulgation, à vingt-quatre écrans du haut
de page. Deux mauvaises réponses se présentaient :

- lier `#epreuve` directement : le lecteur saute la fiction et l'aveu, et la
  phrase de clôture du quiz — « vous venez de répondre à cinq questions sur
  un stylo qui ne vaut presque rien » — ne veut plus rien dire ;
- lier la page d'accueil et espérer qu'il descende : la plupart abandonnent.

**La sortie a été de mettre le quiz dans le post.** Les questions sur les
planches, les corrections sur le site. Le lecteur obtient quelque chose tout
de suite, et la seule façon de savoir s'il a juste est de cliquer.

---

## 2. Ce qui a été fabriqué

| Support | Format | Gabarit |
|---|---|---|
| Carrousel LinkedIn | 7 × 1080×1350, PDF | `tools/carrousel-linkedin.html` |
| Stories Instagram | 5 × 1080×1920 | `tools/instagram-stories.html` |
| Posts carrés (grille) | 3 × 1080×1080 | `tools/instagram-grille.html` |
| Bannière LinkedIn | 1584×396 | `tools/linkedin-banner.html` |
| Image de partage | 1200×630 | `tools/og-image.html` |

Tous rendus depuis la charte du site — mêmes fichiers de police, mêmes
valeurs de palette, même scène d'atelier — par capture headless puis
découpe. Procédures dans `tools/README-og.md`.

**Le carrousel 4:5 sert sur les deux réseaux** : c'est le même format. Seule
différence, Instagram ne rend pas l'URL cliquable — elle reste utile, on la
retient ou on la tape.

---

## 3. Publier sur LinkedIn

**Le format.** Un carrousel se téléverse comme **document**, pas comme
image. Titre du document : `Vends-moi ce stylo` — il s'affiche sous le
carrousel et il est cliquable, ne pas le laisser vide.

**Le texte du post.**

```
Dans Le Loup de Wall Street, un homme tend son stylo et lâche :
vends-moi ce stylo.

Presque tout le monde répond en parlant du stylo. C'est l'erreur —
et on la répète devant des offres à cinquante mille euros.

Cinq questions ci-dessous. Celles que je pose en formation.

Répondez à la première en commentaire, juste par une lettre.
Je réponds à chacun.

Les corrections complètes et votre score sont sur avecjulien.fr.
Je vous préviens : la page ne ressemble pas à ce que vous attendez.

Julien Marquer — vingt ans de terrain B2B avant de former.
```

La dernière phrase annonce **qu'il y a quelque chose**, sans dire quoi.
C'est la différence entre annoncer le tour et annoncer qu'il y en a un.

**Quand.** Mardi ou jeudi, entre 8 h et 9 h.

**La première heure décide de tout.**

1. Rester disponible soixante minutes. Un post publié avant une réunion de
   deux heures est un post enterré.
2. Répondre à chaque commentaire par une phrase de substance — jamais
   « merci », jamais un emoji seul. Quelqu'un répond B ? Lui expliquer
   pourquoi B transforme la vente en fiche technique. Chaque réponse relance
   la diffusion, et la compétence se démontre en public : c'est cela qui
   convertit, pas le carrousel.
3. Ne pas donner les bonnes réponses avant le lendemain. Tant qu'elles sont
   ouvertes, les gens reviennent.

**L'ordre compte plus que le contenu.** Les messages individuels de la
semaine 1 partent **avant** la publication : les contacts déjà passés sur le
site sont ceux qui commenteront dans la première heure, et un post qui
démarre à froid ne redémarre pas.

---

## 4. Publier sur Instagram

### Ce que ce réseau peut et ne peut pas

Instagram sert **la marque**, pas l'acquisition. La cible — des dirigeants
B2B — est sur LinkedIn. Ce qui est fait ici est du recyclage à faible coût,
et ne doit jamais passer avant les quarante messages du plan de lancement.

### Les stories : le sticker natif plutôt que l'image

Les planches 2 et 3 laissent une grande zone vide marquée en pointillés.
**Elle attend le sticker QUIZ d'Instagram**, qui accepte quatre réponses et
désigne la bonne.

C'est un point de méthode et non de mise en page : un sticker natif produit
une interaction que l'algorithme compte, une option dessinée sur l'image
n'en produit aucune. Le pointillé n'est pas un décor, c'est un repère de
pose — il disparaît sous le sticker.

- **Story 1** — l'accroche. Rien à poser dessus.
- **Story 2** — question 1, sticker QUIZ, bonne réponse **C**.
- **Story 3** — question 3, sticker QUIZ, bonne réponse **D**.
- **Story 4** — le site, sans rien dévoiler.
- **Story 5** — sticker LIEN vers `avecjulien.fr` dans le cadre prévu.

Publier les cinq d'affilée, le même jour que le post LinkedIn. À la
republication, garder les stories en story à la une sous le titre
« L'épreuve ».

### Le carrousel

Les sept planches en images, dans l'ordre. Légende :

```
« Vends-moi ce stylo. »

Presque tout le monde répond en parlant du stylo.
C'est l'erreur — et elle coûte bien plus cher qu'un stylo.

Cinq questions. Répondez en commentaire, juste par une lettre.

Les corrections sont sur le site. Lien en bio.
```

### Les trois carrés

Ils composent la grille du profil et se publient espacés, pas d'un coup :

1. **« Vends-moi ce stylo »** sur la scène d'atelier — l'objet, l'entrée.
2. **« Un très bon produit. Une très mauvaise histoire. »** — le diagnostic,
   la même phrase que la bannière LinkedIn ; la cohérence entre les réseaux
   se construit avec ces répétitions-là.
3. **« Ce stylo ne vaut rien. »** — la phrase nue, sans contexte. C'est
   celle qui se partage, parce qu'elle n'a aucun sens tant qu'on n'a pas lu
   le site.

### Ce qui manque et qu'il faudrait tourner

**Un Reel.** C'est le format qui porte aujourd'hui la portée sur Instagram,
et il ne se fabrique pas depuis une feuille de style : il faut filmer. Le
sujet est tout trouvé — une main, un vrai stylo, quinze secondes, la
question posée face caméra. Sans cela, la présence sur ce réseau restera
une vitrine, pas un canal.

---

## 5. L'ordre des opérations

1. Les quarante messages individuels (semaine 1 du plan de lancement).
2. Le post LinkedIn avec le carrousel, un mardi ou un jeudi à 8 h.
3. Les cinq stories Instagram le même jour.
4. Le carrousel Instagram le lendemain.
5. Les trois carrés, espacés sur deux semaines.
6. Les bonnes réponses en commentaire le lendemain du post LinkedIn.

**Un rappel qui vaut pour tout ce qui précède : le lien vers le site, une
fois par mois au maximum.** Le dispositif ne fonctionne qu'une fois par
personne. Le repartager chaque semaine aux mêmes gens revient à user le seul
outil qui fait la différence.
