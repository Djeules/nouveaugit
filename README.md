# nouveaugit — LoremCats

Landing page « héros 3D » : un avatar-chat entièrement procédural (three.js) occupe
le centre de la page, suit le curseur, réagit au survol, au clic et au glisser, et se
déplace de section en section au fil du scroll. Tous les textes sont du lorem ipsum,
à remplacer.

Référence de départ : la page WINSCATS « Why so curious? » (post Instagram de
@danielsnows) — personnage 3D central dont la tête suit la souris, fond bleu pastel,
nav en pilules, cartes en bas à droite, badge circulaire rotatif, curseur personnalisé.

## Lancer

Un serveur statique suffit (les modules ES nécessitent `http://`, pas `file://`) :

```bash
python3 -m http.server 8099
# puis http://127.0.0.1:8099
```

Aucune étape de build, aucune dépendance à installer.

## Structure

```
index.html              markup + importmap
css/
  normalize.css         reset
  main.css              design system, layout, révélations, curseur
js/
  app.js                préchargeur, boucle rAF, repli si WebGL/CDN indisponible
  scene.js              renderer, caméra, lumières, chorégraphie de scroll, pointeur
  cat.js                l'avatar : géométrie procédurale + machine d'états d'interaction
  ui.js                 curseur personnalisé, split de titres, reveals, magnétisme, tilt
  shaders/fur.js        shader de fourrure par coques (shell fur)
  vendor/three.module.min.js  three.js r169 (voir plus bas)
```

## L'avatar

Rien n'est chargé : tête, oreilles, yeux, paupières, museau, moustaches et pull sont
construits à partir de primitives. La fourrure vient d'un *shell shader* : la même
géométrie est dessinée N fois (instanciée), chaque coque est poussée le long de la
normale et se découpe en mèches via un bruit cellulaire — technique classique du
temps réel pour les personnages peluche.

Interactions (`js/cat.js`) :

| Geste | Réaction |
|---|---|
| Déplacement du curseur | la tête s'oriente (lissage ressort), les pupilles suivent, le buste accompagne avec retard |
| Survol de l'avatar | oreilles dressées, yeux agrandis, fourrure gonflée, curseur en mode « pastille » |
| Clic | squash & stretch, clin d'œil, oreilles qui frémissent, bulle de dialogue |
| Glisser | rotation avec inertie, retour progressif vers la face |
| Repos | respiration, léger balancement, clignements aléatoires |
| Scroll | position, échelle, couleur du pull et palette de fond interpolées par section |

## Personnaliser

- **Textes** : tout est dans `index.html`.
- **Chorégraphie & palettes** : le tableau `KEYFRAMES` en haut de `js/scene.js`
  (une entrée par `<section data-index>`), avec `mob`/`mobScale` pour les écrans
  étroits.
- **Fourrure** : les options passées à `this._fur(...)` dans `js/cat.js`
  (`thickness`, `density`, nombre de coques, couleurs) et le découpage des mèches
  dans `js/shaders/fur.js`.
- **Couleurs de l'interface** : les variables CSS de `:root` dans `css/main.css`
  (`--bg-top`, `--bg-mid` et `--bg-deep` sont pilotées par le scroll depuis le JS).
- **Console** : `window.__loremcats` expose `{ scene, camera, cat, renderer, render }`
  pour régler la scène à chaud.

## Notes techniques

- three.js r169 est **vendorisé** dans `js/vendor/` : la page fonctionne hors ligne et
  sans dépendance externe. Pour repasser sur un CDN, remplacer le chemin de l'importmap
  dans `index.html` par `https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js`.
- Qualité adaptative : moins de coques, sphères moins denses et `pixelRatio` réduit sur
  mobile / pointeur grossier.
- Replis : si WebGL ou le module 3D échoue, la classe `no-webgl` masque le canvas et la
  page reste lisible sur son dégradé ; `prefers-reduced-motion` calme les animations.
- La boucle rAF borne `dt` à `[0, 50 ms]` — certains navigateurs livrent un premier
  timestamp antérieur à `performance.now()`, ce qui ferait diverger les lissages.
- `demo.css` à la racine est un reliquat du dépôt initial, non utilisé par la page.
