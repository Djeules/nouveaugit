# Refabriquer l'image de partage

`assets/img/og.jpg` (1200 × 630) est l'image que LinkedIn, Slack, WhatsApp,
iMessage et X affichent quand quelqu'un colle un lien vers le site.
Elle n'est pas dessinée dans un outil graphique : elle est **rendue depuis
le site lui-même**, à partir de `tools/og-image.html`, qui réutilise les
polices, les couleurs et la scène d'atelier du hero. Modifier la charte
suffit donc à régénérer une image cohérente.

`tools/` n'est pas publié en tant que page ; le fichier ne pèse rien et
sert de source, comme un fichier `.psd` qu'on garde à côté du `.jpg`.

## Procédure

```bash
# 1. servir le site en local (les polices refusent de se charger en file://)
python3 -m http.server 8099

# 2. rendre en 2× puis réduire : le texte reste net
chromium --headless=new --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=1200,780 \
  --virtual-time-budget=6000 \
  --screenshot=og2x.png http://127.0.0.1:8099/tools/og-image.html

python3 - <<'PY'
from PIL import Image
im = Image.open('og2x.png').convert('RGB')
im.crop((0, 0, 2400, 1260)).resize((1200, 630), Image.LANCZOS) \
  .save('assets/img/og.jpg', 'JPEG', quality=90, optimize=True, progressive=True)
PY
```

La fenêtre est volontairement plus haute que la carte (780 au lieu de 630) :
on recadre ensuite au pixel près, ce qui évite de dépendre de la hauteur
exacte de viewport que Chromium accorde en headless.

## Règles tenues

- **1200 × 630** exactement (ratio 1,91:1). LinkedIn recadre tout le reste.
- **Sous 300 Ko.** Ici 70 Ko : la photo n'existe pas, tout est vectoriel.
- **Lisible à 300 px de large.** C'est la taille réelle dans un fil
  LinkedIn sur mobile. D'où le titre à 45 px et non un pavé de texte.
- **Rien d'essentiel dans les 60 px du bord.** Certains clients rognent.
- **Pas de prix, pas de date, pas de promesse chiffrée** : l'image est
  mise en cache des mois par les réseaux sociaux, on ne la corrige pas.

## Après chaque changement d'image

Les réseaux gardent l'ancienne version en cache. Pour forcer la relecture :

- LinkedIn — <https://www.linkedin.com/post-inspector/>
- Facebook / WhatsApp — <https://developers.facebook.com/tools/debug/>
- X — <https://cards-dev.twitter.com/validator>
