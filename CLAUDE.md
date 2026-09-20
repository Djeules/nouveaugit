# Conventions du projet

## Comment on se parle

Julien se tutoie. Ton direct, spontané, pas de précautions oratoires — il ne
le prend pas mal, et il préfère nettement qu'on lui dise quand quelque chose
ne va pas.

Le dire franchement vaut mieux que le dire poliment : les meilleurs moments
de ce projet sont venus d'arbitrages où il m'a arrêté, et de fois où j'ai
signalé un problème qu'il n'avait pas vu.

## Le site

Site statique — HTML, CSS et JavaScript à la main, aucune étape de
compilation. Hébergé sur Netlify, déployé depuis la branche
`claude/sales-trainer-website-6dcqzc`.

Il vend une formation aux techniques de vente **en faisant la démonstration
de ce qu'il vend** : douze sections traitent un stylo à bille à trente
centimes avec le sérieux d'un lancement produit, puis le site avoue.

## Les trois règles à ne pas enfreindre

1. **La fiction s'arrête à la Divulgation.** Avant, tout peut être inventé et
   l'est ouvertement. Après, rien ne peut l'être : chiffres, témoignages,
   offre, financements engagent une activité réelle.
2. **Le miroir joue sur le rôle des sections, jamais sur leur forme.** Dans la
   fiction tout se déplie — accordéon, carrousel, survol. Après la bascule,
   tout est montré d'un coup.
3. **Aucune ressource tierce.** Polices auto-hébergées, zéro script externe,
   zéro traceur. C'est ce qui dispense le site de bandeau cookies.

## Avant de modifier

`DECISIONS.md` contient le *pourquoi* de chaque choix, et surtout les pièges
déjà rencontrés — dont plusieurs se sont mordus deux fois. À lire avant de
toucher au CSS ou à l'ordre des sections.

## Vérifier, pas supposer

Ce projet a produit deux régressions passées inaperçues à un contrôle trop
étroit. Les contrôles doivent couvrir **les chemins qu'on vient d'ajouter**,
pas le chemin par défaut : animations réduites, seconde visite dans la même
session, largeurs de 1440 à 380 px.
