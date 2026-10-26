# Al-Moulakhkhas Al-Fiqhi — site d'étude

## Arborescence du dépôt

```
index.html                 ← accueil + sommaire complet de tous les livres
outils/docx_vers_html.py   ← convertit un .docx en page de chapitre
assets/
  sommaire.js              ← liste des 8 livres et de leurs chapitres (source unique)
  app.js                   ← moteur du site (menu, recherche, notes, progression…)
  tailwind-config.js, style.css
kitab-1/  index.html       ← page du livre 1
          sub-1-1.html     ← chapitre 1 du livre 1
          sub-1-2.html …
kitab-2/  index.html, sub-2-1.html …
… jusqu'à kitab-13/
```

## Ajouter un chapitre depuis un fichier Word

1. Vérifiez que le chapitre existe dans `assets/sommaire.js` (sinon ajoutez une ligne `{ id: 'N-M', titleAr: '…', titleFr: '…' }`).
2. Lancez (Pandoc requis, https://pandoc.org/installing.html) :
   `python outils/docx_vers_html.py mon_fichier.docx N-M`
   → crée `kitab-N/sub-N-M.html`.
3. Envoyez ce fichier sur GitHub. Accueil, page du livre, menu, recherche et Précédent/Suivant se mettent à jour seuls.

Tant qu'un chapitre n'est pas sur le dépôt, il apparaît « (bientôt) » et n'est pas cliquable.
Le contenu d'une page est dans la balise `<template id="chapter-content">` : vous pouvez aussi l'y coller à la main.

## Publication (GitHub Pages)

Dépôt → Settings → Pages → Source : « Deploy from a branch » → branche `main`, dossier `/ (root)`.
