#!/usr/bin/env python3
"""
Convertit un fichier Word (.docx) en page de chapitre du site.

Usage :   python outils/docx_vers_html.py  fichier.docx  1-4
          → écrit kitab-1/sub-1-4.html (le titre est pris dans assets/sommaire.js)

Prérequis : Pandoc installé (https://pandoc.org/installing.html).
"""
import re, subprocess, sys, html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AR = re.compile(r'[؀-ۿﭐ-﷿ﹰ-﻿]')

PAGE = """<!DOCTYPE html>
<html lang="fr" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png" href="../assets/logo.png">
  <link rel="apple-touch-icon" href="../assets/logo.png">
  <meta name="theme-color" content="#005c83">
  <title>{title} — Al-Moulakhkhas Al-Fiqhi</title>
  <script>try{{if(localStorage.getItem('fiqh_theme')==='dark')document.documentElement.classList.add('dark')}}catch(e){{}}</script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="../assets/tailwind-config.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/style.css">
</head>
<body data-page="chapter" data-book="{book}" data-id="{cid}" class="bg-cream-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 min-h-screen">
  <div id="app" class="min-h-screen flex flex-col"></div>

  <!-- ▼ CONTENU DU CHAPITRE ▼ -->
  <template id="chapter-content">
{content}
  </template>

  <script src="../assets/sommaire.js"></script>
  <script src="../assets/app.js"></script>
</body>
</html>
"""

def titre(cid):
    src = (ROOT / 'assets' / 'sommaire.js').read_text(encoding='utf-8')
    m = re.search(r"id:\s*'%s'\s*,\s*titleAr:\s*(?:'([^']*)'|\"([^\"]*)\")\s*,\s*titleFr:\s*(?:'([^']*)'|\"([^\"]*)\")" % re.escape(cid), src)
    if not m:
        sys.exit("Chapitre %s introuvable dans assets/sommaire.js : ajoutez-le d'abord." % cid)
    return (m.group(3) or m.group(4))

def convertir(docx):
    out = subprocess.run(['pandoc', str(docx), '-t', 'html', '--wrap=none'],
                         capture_output=True, text=True, check=True).stdout
    out = out.replace('<span dir="ltr"></span>', '')
    def para(m):
        inner = m.group(2)
        txt = re.sub(r'<[^>]+>', '', inner)
        letters = re.findall(r'[^\W\d_]', html.unescape(txt))
        if letters and sum(1 for c in letters if AR.match(c)) / len(letters) > 0.6:
            return '<p class="ar"%s>%s</p>' % (m.group(1), inner)
        return m.group(0)
    out = re.sub(r'<p([^>]*)>(.*?)</p>', para, out, flags=re.S)
    return out.strip()

def ecrire(cid, content):
    book = cid.split('-')[0]
    d = ROOT / ('kitab-' + book)
    d.mkdir(exist_ok=True)
    f = d / ('sub-%s.html' % cid)
    f.write_text(PAGE.format(title=html.escape(titre(cid)), book=book, cid=cid, content=content), encoding='utf-8')
    return f

if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    print('écrit :', ecrire(sys.argv[2], convertir(sys.argv[1])))
