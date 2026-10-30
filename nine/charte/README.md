# Charte de marque de Nine — version 1

Hors `site/` : rien de ce dossier n'est servi en ligne.

| Fichier | À quoi il sert |
| --- | --- |
| `nine-charte-de-marque.pptx` | L'ebook (50 pages, 16:9), **à importer dans Canva** |
| `nine-charte-de-marque.pdf` | La même chose en lecture seule, à envoyer à Nine |
| `logos/` | Logo, signature et symbole en SVG et PNG transparents, toutes versions |
| `logos.py` | Redessine les logos à partir de DM Serif Display et DM Sans |
| `charte.py` | Régénère le `.pptx` |

## Ouvrir dans Canva

1. Canva → **Créer un design** → **Importer un fichier** → `nine-charte-de-marque.pptx`.
2. Textes, formes et couleurs restent modifiables. Les logos sont des images :
   pour une qualité maximale, importer les SVG de `logos/` et les glisser à la place.
3. Les cases « PHOTO » sont des emplacements : glisser une photo dessus.
4. Polices : **DM Serif Display** (titres) et **DM Sans** (texte), toutes deux
   dans la bibliothèque Canva. Si Canva signale une police manquante, la
   choisir dans la liste, sans en remplacer une par une autre.

## Régénérer

```sh
pip install python-pptx fonttools pillow
# polices DM dans ~/.fonts/dm (f2 = DM Sans, f4 = DM Sans Bold, f6 = DM Serif Display)
NODE_PATH=$(npm root -g) python3 logos.py    # Playwright Node pour les PNG
python3 charte.py
soffice --headless --convert-to pdf nine-charte-de-marque.pptx
```
