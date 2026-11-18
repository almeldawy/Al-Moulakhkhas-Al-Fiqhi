#!/bin/sh
# Régénère assets/site.css (Tailwind + styles du site + polices locales).
# À relancer seulement si vous modifiez outils/main.css, assets/app.js ou la palette.
# Prérequis une seule fois :  npm install --no-save tailwindcss@3
cd "$(dirname "$0")/.." || exit 1
npx tailwindcss@3 -c outils/tailwind.config.js -i outils/main.css -o assets/site.css --minify
