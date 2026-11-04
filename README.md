# Al-Moulakhkhas Al-Fiqhi — site d'étude

## Arborescence du dépôt

```
index.html                 ← accueil (Ma lecture, liste des livres)
sw.js, manifest.webmanifest← lecture hors ligne et installation sur l'écran d'accueil
outils/docx_vers_html.py   ← convertit un .docx en page de chapitre
outils/main.css, tailwind.config.js, build_css.sh ← sources du CSS (voir plus bas)
assets/
  sommaire.js              ← liste des livres et de leurs chapitres (source unique)
  app.js                   ← moteur du site (menu, recherche, marque-pages, progression…)
  site.css                 ← CSS compilé (Tailwind + styles du site)
  fonts/                   ← polices hébergées (Inter, Literata, Amiri)
kitab-1/  index.html       ← page du livre 1
          sub-1-1.html     ← chapitre 1 du livre 1 …
… jusqu'à kitab-21/
```

## Lecture hors ligne

Le site ne dépend plus d'aucun service externe (CSS et polices sont dans le dépôt). À la première visite
(en https, par exemple sur GitHub Pages) le navigateur télécharge toutes les pages ; l'accueil (« Ma lecture »)
indique l'état et permet de relancer le téléchargement. Un nouveau chapitre ajouté au dépôt est récupéré
automatiquement (une fois par jour, ou via « Mettre à jour »). Si vous modifiez `sw.js`, changez `VERSION` en haut du fichier.

## Modifier le design

`assets/site.css` est généré. Après avoir modifié `outils/main.css`, `assets/app.js` ou la palette :
`npm install --no-save tailwindcss@3` puis `sh outils/build_css.sh`.
Ajouter un chapitre ne demande aucune régénération.

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
