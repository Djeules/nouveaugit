# Archive — 12 octobre 2026
## Migration Netlify → Cloudflare Pages, puis ouverture du chantier design

> Ce dossier est versionné mais **jamais servi** : `netlify.toml` (supprimé) puis
> Cloudflare ne publient que `site/`. Aucun secret ici — les clés vivent dans les
> variables du tableau de bord Cloudflare.

---

## 1. Où en est la migration

**Fait**
- Les crédits Netlify étant épuisés, le site a été préparé pour Cloudflare Pages (offre gratuite).
  Il n'y a aucune étape de compilation : le dossier publié est `site/`.
- `netlify.toml` supprimé ; ses en-têtes de sécurité (CSP stricte, X-Frame-Options, etc.)
  sont repris dans `site/_headers`.
- Formulaire de contact : Netlify Forms remplacé par `functions/api/contact.js`
  (fonction Cloudflare gratuite, envoi par e-mail via Resend, région UE).
  Protections : contrôle de l'origine, champ piège `piege`, validation des champs.
  Testé avec un `fetch` simulé (12 cas).
- Pages légales mises à jour : Cloudflare (hébergeur + réception du formulaire) et
  Resend (sous-traitant) ; paragraphe sur les transferts hors UE complété.
- `package.json` + script `npm run deploy` (Wrangler) ; `.gitignore` ; `README.md` réécrit.
- Projet Pages `avecjulien` créé par intégration Git (dépôt `Djeules/nouveaugit`),
  en ligne sur **avecjulien.pages.dev**. Julien a vérifié : « il est bien configuré ».

**Reste à faire**
1. **Resend** — ajouter chez Infomaniak les 3 enregistrements DNS
   (TXT `resend._domainkey`, CNAME `rsend`, CNAME `send`), puis « Redémarrage » dans Resend
   jusqu'à l'état « Vérifié ». Ne pas activer la réception Resend (la boîte reste chez Infomaniak).
2. Créer la clé API Resend (envoi seulement, domaine avecjulien.fr), l'ajouter comme **secret**
   `RESEND_API_KEY` (Production) dans Cloudflare → projet avecjulien → Paramètres →
   Variables et secrets, relancer le déploiement, envoyer un message test à julien@avecjulien.fr.
3. Vérifier sur avecjulien.pages.dev : animations, quiz, liens Cal.com, mobile, pages légales.
4. Mettre à jour `CLAUDE.md` (il parle encore de Netlify, de la branche de production et des crédits).
5. **Plus tard, séparément** : basculer le vrai domaine avecjulien.fr (DNS chez Infomaniak,
   encore pointé sur Netlify). Attention : ne pas toucher aux enregistrements MX (e-mail)
   ni aux enregistrements Resend.

**Règle de déploiement à redéfinir** : avec l'intégration Git, un envoi sur la branche surveillée
par Cloudflare publie. L'ancienne branche de production
`claude/sales-trainer-website-6dcqzc` ne s'avance que sur demande explicite de Julien.

---

## 2. Chantier design — demande de Julien (12 octobre 2026, nuit)

**Question initiale** : « Est-il possible d'envisager un changement de polices et de couleurs ? »

**Précisions de Julien**
- Pas de souci de police en soi, mais **des écarts de taille trop présents** : il veut
  « une vraie uniformité, même avec des tailles différentes ».
- **Les couleurs ne sont pas toujours uniformes.**
- Il **aime beaucoup les tonalités** et certaines transitions, notamment **la bascule sur le ton crème**
  → à conserver.
- Il veut « à minima » qu'on retravaille le sujet.
- Il demande si **l'ajout d'animations au défilement** est possible.

**Constats techniques (à vérifier au moment de l'audit)**
- Les polices : Figtree (texte) et JetBrains Mono (étiquettes), auto-hébergées dans
  `site/assets/fonts/`. La règle n°3 interdit tout service externe : toute nouvelle police devra
  être libre (OFL) et servie depuis le site, avec son fichier de licence.
- Les tailles : six variables `--fs-*` (display, h2, h3, lead, body, label), mais de nombreuses
  tailles sont aussi écrites en dur dans le CSS (`.56rem`, `.58rem`, `.6rem`, `.62rem`, `.64rem`,
  `.66rem`, `.68rem`, `.7rem`…, surtout sur la police mono). **C'est très probablement la source
  des « différences de taille trop présentes »** : il faudra les ramener à une échelle courte.
- Les couleurs : palette de 7 valeurs en variables (walnut, cream, bark, cork, ember, olive, teal),
  mais aussi une quinzaine de valeurs écrites en dur (`#e0b371`, `#ff9350`, `#fff9f2`, `#190b03`…)
  et de nombreux `rgba(...)` dérivés de l'orange et du crème. **À rationaliser sans changer
  l'ambiance.**
- Les visuels déjà exportés dans `tools/` (image de partage, bannières LinkedIn, carrousel,
  Instagram) gardent l'ancienne palette tant qu'ils ne sont pas régénérés.

**Méthode proposée**
1. Audit chiffré : liste de toutes les tailles et couleurs utilisées, avec leur nombre d'occurrences.
2. Proposer une échelle de tailles courte (quelques crans seulement) et une palette consolidée,
   en gardant les tonalités actuelles.
3. Aperçu avant/après pour validation par Julien **avant** de toucher au vrai site.
4. Appliquer sur `master`, vérifier de 1440 à 380 px, en mouvement normal et réduit, et en seconde
   visite dans la même session (CLAUDE.md « Vérifier, pas supposer »).
5. Ne pas avancer la branche de production sans demande explicite.

---

## 3. Animations au défilement — ce qui existe, ce qui est possible

**Déjà en place** (`DECISIONS.md` §21 et `site/assets/js/main.js`)
- Apparitions en fondu + montée (`[data-reveal]`), titres découpés ligne par ligne,
  compteurs, barres qui se remplissent, barre de progression de lecture, stylo 3D qui suit le
  défilement, bandeau défilant, traversée de l'Anatomie.
- Deux régimes de mouvement partagés par cinq variables sous `#revelation ~ *`
  (`--rise`, `--rise-dur`, `--line-dur`, `--line-tilt`, `--line-step`) : ample avant la Divulgation,
  amplitude réduite après.

**Réponse** : oui, on peut en ajouter. Le site n'en manque pas ; il manque de **variété** (presque tout
arrive de la même façon : fondu + montée). Pistes, sans aucune ressource tierce :
- animations liées au défilement en CSS pur (`animation-timeline: view()`), sans JavaScript,
  en amélioration progressive (là où le navigateur ne les gère pas, la page reste correcte) ;
- parallaxe légère sur les décors, révélations par masque ou rognage des visuels, textes qui
  s'illuminent mot à mot, numéros et filets qui se tracent, changement de fond progressif pour
  adoucir la bascule crème.

**Contraintes à respecter**
- Règle n°2 : le mouvement peut accompagner mais ne doit jamais **retenir** une information
  ni **retarder** la lecture, surtout après la Divulgation.
- `prefers-reduced-motion` : tout reste visible et immobile.
- Pas de bibliothèque d'animation externe (CSP : `script-src 'self'`), donc CSS ou JavaScript maison.
- Le zoom au défilement a été écarté au §22 (pas de matière visuelle pour le justifier) ; à ne pas
  rouvrir sans nouveau visuel.
- Les navigateurs sans animations liées au défilement garderont les apparitions actuelles.
- Les animations doivent être testées en lecture réelle, pas seulement par captures
  (limites du banc d'essai : voir §21).

**Décision attendue de Julien** : quel niveau de mise en scène — retouches discrètes, ou une vraie
refonte du rythme du défilement ? À trancher en même temps que la validation de l'échelle de tailles
et de couleurs.

---

## 4. Ordre de travail convenu

1. Terminer Resend (DNS Infomaniak → clé API → test du formulaire).
2. Vérifier le site sur pages.dev, mettre à jour `CLAUDE.md`.
3. Chantier design : audit → aperçu → validation → application.
4. Animations au défilement, dans la foulée ou en second temps.
5. Plus tard : bascule du domaine avecjulien.fr vers Cloudflare.
