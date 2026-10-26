/**
 * Moteur partagé du site Al-Moulakhkhas Al-Fiqhi.
 * Chaque page HTML ne contient presque rien : cette application construit l'en-tête,
 * le menu latéral, la recherche, la progression, les notes, etc. à partir de sommaire.js.
 *
 * <body data-page="home | book | chapter" data-book="N" data-id="N-M">
 */
(function () {
  'use strict';

  var script = document.currentScript;
  var ROOT = new URL('../', script.src).href; // racine du site, quel que soit le dossier de la page
  var BOOKS = window.SOMMAIRE || [];
  var CFG = window.SITE || {};
  var PAGE = document.body.getAttribute('data-page') || 'home';
  var CUR_BOOK = parseInt(document.body.getAttribute('data-book') || '0', 10) || null;
  var CUR_ID = document.body.getAttribute('data-id') || null;

  /* ---------- utilitaires ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')      // accents latins
      .replace(/[ً-ٰٟ]/g, '')                  // voyelles arabes
      .replace(/[’']/g, '');
  }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- données ---------- */
  var flat = [];
  BOOKS.forEach(function (b) {
    b.chapters.forEach(function (c) {
      flat.push({ key: 'sub-' + c.id, book: b, ch: c, url: ROOT + 'kitab-' + b.id + '/sub-' + c.id + '.html' });
    });
  });
  function bookUrl(b) { return ROOT + 'kitab-' + b.id + '/index.html'; }
  function byKey(key) { for (var i = 0; i < flat.length; i++) if (flat[i].key === key) return flat[i]; return null; }

  var read = store.get('fiqh_read_status', {});
  var marks = store.get('fiqh_bookmarks', []);
  var notes = store.get('fiqh_notes', {});

  /* ---------- disponibilité des fichiers (chapitres ajoutés un par un) ---------- */
  var AVAIL = null;
  function loadAvailability() {
    if (CFG.checkAvailability === false) return Promise.resolve(null);
    try {
      var c = JSON.parse(sessionStorage.getItem('fiqh_avail') || 'null');
      if (c && Date.now() - c.t < 30000) return Promise.resolve(c.m);
    } catch (e) {}
    return Promise.all(flat.map(function (f) {
      return fetch(f.url, { method: 'HEAD', cache: 'no-store' })
        .then(function (r) { return [f.key, r.ok]; })
        .catch(function () { return [f.key, null]; });
    })).then(function (pairs) {
      var m = {}, unknown = false;
      pairs.forEach(function (p) { if (p[1] === null) unknown = true; m[p[0]] = p[1]; });
      if (unknown) return null; // ex. ouverture en local (file://) : on considère tout disponible
      try { sessionStorage.setItem('fiqh_avail', JSON.stringify({ t: Date.now(), m: m })); } catch (e) {}
      return m;
    });
  }
  function isAvail(key) { return key === 'sub-' + CUR_ID || !AVAIL || AVAIL[key] !== false; }

  /* ---------- thème ---------- */
  var theme = 'light';
  try { theme = localStorage.getItem('fiqh_theme') || 'light'; } catch (e) {}
  function applyTheme() {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    var b = $('#theme-btn'); if (b) b.textContent = theme === 'dark' ? '☀' : '☾';
  }

  /* ---------- coquille commune ---------- */
  function shell() {
    $('#app').innerHTML =
      '<header class="sticky top-0 z-40 bg-emerald-900/95 dark:bg-slate-900/95 backdrop-blur border-b border-gold-500/30 text-white shadow-md">' +
        '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">' +
          '<div class="flex items-center gap-3">' +
            '<button id="menu-btn" class="lg:hidden p-2 rounded-lg text-gold-400 hover:bg-emerald-800 text-xl leading-none" aria-label="Ouvrir le sommaire">☰</button>' +
            '<a href="' + ROOT + 'index.html" class="flex items-center gap-3">' +
              '<span class="site-logo w-10 h-10 shadow" role="img" aria-label="Logo"></span>' +
              '<span><span class="block font-bold text-base sm:text-lg leading-tight text-amber-100">Al-Moulakhkhas Al-Fiqhi</span>' +
              '<span class="block text-xs text-gold-400 font-arabic">الملخص الفقهي - الشيخ صالح الفوزان</span></span>' +
            '</a>' +
          '</div>' +
          '<div class="hidden md:block flex-1 max-w-md relative">' +
            '<input id="search" type="search" autocomplete="off" placeholder="Rechercher un livre ou un chapitre (FR / AR)…" class="w-full px-4 py-1.5 rounded-full bg-emerald-950/60 border border-gold-500/40 text-sm text-white placeholder-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-gold-400">' +
            '<div id="search-box" class="hidden absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto z-50"></div>' +
          '</div>' +
          '<div class="flex items-center gap-2">' +
            '<button id="theme-btn" class="p-2 rounded-lg text-gold-400 hover:bg-emerald-800 dark:hover:bg-slate-800 text-lg leading-none" title="Changer le thème"></button>' +
          '</div>' +
        '</div>' +
        '<div class="md:hidden px-4 pb-3 relative">' +
          '<input id="search-m" type="search" autocomplete="off" placeholder="Rechercher (FR / AR)…" class="w-full px-4 py-1.5 rounded-full bg-emerald-950/60 border border-gold-500/40 text-sm text-white placeholder-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-gold-400">' +
          '<div id="search-box-m" class="hidden absolute left-4 right-4 top-full mt-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-80 overflow-y-auto z-50"></div>' +
        '</div>' +
      '</header>' +
      '<div class="flex-1 flex max-w-7xl w-full mx-auto relative">' +
        '<div id="overlay" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 hidden lg:hidden"></div>' +
        '<aside id="sidebar" class="fixed lg:sticky top-16 z-30 w-80 max-w-[85vw] h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 -translate-x-full lg:translate-x-0">' +
          '<div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-slate-900/50">' +
            '<div class="flex items-center justify-between mb-2"><span class="text-xs font-semibold uppercase tracking-wider text-emerald-900 dark:text-emerald-400">Progression globale</span><span id="pct" class="text-xs font-bold text-gold-600 dark:text-gold-400">0%</span></div>' +
            '<div class="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden"><div id="bar" class="bg-gradient-to-r from-emerald-600 to-gold-500 h-2.5 rounded-full transition-all duration-500" style="width:0%"></div></div>' +
            '<div class="flex mt-4 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">' +
              '<button id="tab-toc" class="flex-1 py-1 text-xs font-semibold rounded-md"></button>' +
              '<button id="tab-bm" class="flex-1 py-1 text-xs font-semibold rounded-md"></button>' +
            '</div>' +
          '</div>' +
          '<nav id="toc" class="flex-1 overflow-y-auto p-3 space-y-2"></nav>' +
          '<div id="bm" class="flex-1 overflow-y-auto p-3 space-y-2 hidden"></div>' +
        '</aside>' +
        '<main class="flex-1 min-w-0 p-4 sm:p-6 lg:p-8"><div id="main" class="max-w-4xl mx-auto w-full"></div></main>' +
      '</div>' +
      '<footer class="text-center text-xs text-slate-500 dark:text-slate-400 py-6 border-t border-slate-200 dark:border-slate-800">Al-Moulakhkhas Al-Fiqhi — Cheykh Sâlih Al-Fawzân · Outil d’étude personnel</footer>';

    $('#theme-btn').addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('fiqh_theme', theme); } catch (e) {}
      applyTheme();
    });
    var sb = $('#sidebar'), ov = $('#overlay');
    $('#menu-btn').addEventListener('click', function () { sb.classList.toggle('-translate-x-full'); ov.classList.toggle('hidden'); });
    ov.addEventListener('click', function () { sb.classList.add('-translate-x-full'); ov.classList.add('hidden'); });
    $('#tab-toc').addEventListener('click', function () { sideTab('toc'); });
    $('#tab-bm').addEventListener('click', function () { sideTab('bm'); });
    bindSearch($('#search'), $('#search-box'));
    bindSearch($('#search-m'), $('#search-box-m'));
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#search, #search-box, #search-m, #search-box-m')) {
        $('#search-box').classList.add('hidden'); $('#search-box-m').classList.add('hidden');
      }
    });
    applyTheme();
    sideTab('toc');
  }

  /* ---------- recherche globale ---------- */
  function bindSearch(input, box) {
    input.addEventListener('input', function () {
      var q = norm(input.value.trim());
      if (!q) { box.classList.add('hidden'); return; }
      var out = [];
      BOOKS.forEach(function (b) {
        if (norm(b.titleFr).indexOf(q) > -1 || norm(b.titleAr).indexOf(q) > -1)
          out.push({ href: bookUrl(b), a: b.titleFr, b: b.titleAr, tag: 'Livre', ok: true });
      });
      flat.forEach(function (f) {
        if (norm(f.ch.titleFr).indexOf(q) > -1 || norm(f.ch.titleAr).indexOf(q) > -1)
          out.push({ href: f.url, a: f.ch.titleFr, b: f.ch.titleAr, tag: f.book.titleFr, ok: isAvail(f.key) });
      });
      out = out.slice(0, 15);
      box.innerHTML = out.length ? out.map(function (r) {
        var inner = '<div class="min-w-0"><div class="text-sm font-medium truncate">' + esc(r.a) + '</div><div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">' + esc(r.tag) + (r.ok ? '' : ' · bientôt') + '</div></div><span class="font-arabic text-emerald-700 dark:text-emerald-400 text-sm shrink-0">' + esc(r.b) + '</span>';
        return r.ok
          ? '<a href="' + r.href + '" class="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-slate-800">' + inner + '</a>'
          : '<div class="flex items-center justify-between gap-3 px-4 py-2.5 soon">' + inner + '</div>';
      }).join('') : '<p class="px-4 py-3 text-sm text-slate-500">Aucun résultat.</p>';
      box.classList.remove('hidden');
    });
  }

  /* ---------- menu latéral ---------- */
  function sideTab(tab) {
    var on = 'flex-1 py-1 text-xs font-semibold rounded-md bg-white dark:bg-slate-700 text-emerald-900 dark:text-white shadow-sm';
    var off = 'flex-1 py-1 text-xs font-semibold rounded-md text-slate-600 dark:text-slate-400 hover:text-emerald-900 dark:hover:text-white';
    $('#tab-toc').className = tab === 'toc' ? on : off;
    $('#tab-bm').className = tab === 'bm' ? on : off;
    $('#toc').classList.toggle('hidden', tab !== 'toc');
    $('#bm').classList.toggle('hidden', tab !== 'bm');
    $('#tab-toc').textContent = 'Sommaire';
    $('#tab-bm').textContent = 'Marque-pages' + (marks.length ? ' (' + marks.length + ')' : '');
    if (tab === 'bm') renderBookmarks();
  }

  function renderSidebar() {
    var openIds = {};
    var existing = document.querySelectorAll('#toc details');
    for (var i = 0; i < existing.length; i++) if (existing[i].open) openIds[existing[i].getAttribute('data-book')] = true;
    var first = existing.length === 0;

    $('#toc').innerHTML = BOOKS.map(function (b) {
      var open = first ? b.id === CUR_BOOK : !!openIds[b.id];
      return '<details data-book="' + b.id + '"' + (open ? ' open' : '') + ' class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">' +
        '<summary class="p-3 flex items-center justify-between gap-2 bg-cream-100/60 dark:bg-slate-800/80 hover:bg-cream-200/60 dark:hover:bg-slate-800">' +
          '<span class="flex items-center gap-2 min-w-0"><span class="chev text-gold-600 text-xs">▶</span><span class="text-xs font-bold text-emerald-950 dark:text-emerald-300 truncate">' + esc(b.titleFr) + '</span></span>' +
          '<span class="text-xs font-arabic text-emerald-800 dark:text-emerald-400 shrink-0">' + esc(b.titleAr) + '</span>' +
        '</summary>' +
        '<div class="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/50">' +
          '<a href="' + bookUrl(b) + '" class="block px-6 py-2 text-xs text-gold-700 dark:text-gold-400 font-semibold hover:bg-emerald-50 dark:hover:bg-slate-800">Voir tout le livre →</a>' +
          b.chapters.map(function (c) {
            var key = 'sub-' + c.id, ok = isAvail(key), isCur = c.id === CUR_ID;
            var mark = read[key] ? '<span class="text-emerald-600 dark:text-emerald-400">✓</span>' : '<span class="text-slate-300 dark:text-slate-600">○</span>';
            var body = '<span class="flex items-center gap-2 min-w-0">' + mark + '<span class="truncate font-medium text-slate-700 dark:text-slate-300">' + esc(c.titleFr) + (ok ? '' : ' <em class="not-italic text-[10px] text-slate-400">(bientôt)</em>') + '</span></span><span class="text-[11px] font-arabic text-slate-400 dark:text-slate-500 shrink-0">' + esc(c.titleAr) + '</span>';
            var cls = 'px-4 pl-6 py-2.5 flex items-center justify-between gap-2 text-xs ' + (isCur ? 'bg-emerald-100 dark:bg-slate-800 font-bold ' : '');
            return ok
              ? '<a href="' + ROOT + 'kitab-' + b.id + '/sub-' + c.id + '.html" class="' + cls + 'hover:bg-emerald-50 dark:hover:bg-slate-800/60">' + body + '</a>'
              : '<div class="' + cls + 'soon">' + body + '</div>';
          }).join('') +
        '</div></details>';
    }).join('');
    updateProgress();
  }

  function renderBookmarks() {
    var box = $('#bm');
    if (!marks.length) { box.innerHTML = '<p class="text-center text-xs text-slate-500 py-8">Aucun marque-page enregistré.</p>'; return; }
    box.innerHTML = marks.map(function (k) {
      var f = byKey(k); if (!f) return '';
      return '<a href="' + f.url + '" class="block p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gold-500/50 text-xs">' +
        '<div class="font-bold text-slate-800 dark:text-slate-200">' + esc(f.ch.titleFr) + '</div>' +
        '<div class="font-arabic text-emerald-600 dark:text-emerald-400 text-[11px]">' + esc(f.ch.titleAr) + '</div></a>';
    }).join('');
  }

  function updateProgress() {
    var n = flat.filter(function (f) { return read[f.key]; }).length;
    var pct = flat.length ? Math.round(n / flat.length * 100) : 0;
    $('#pct').textContent = pct + '%';
    $('#bar').style.width = pct + '%';
    $('#tab-bm').textContent = 'Marque-pages' + (marks.length ? ' (' + marks.length + ')' : '');
    var a = $('#stat-read'), b = $('#stat-bm');
    if (a) a.textContent = n; if (b) b.textContent = marks.length;
  }

  /* ---------- page d'accueil ---------- */
  function chapterList(b, compact) {
    return b.chapters.map(function (c) {
      var key = 'sub-' + c.id, ok = isAvail(key);
      var inner = '<span class="flex items-center gap-2 min-w-0"><span class="' + (read[key] ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600') + '">' + (read[key] ? '✓' : '○') + '</span><span class="truncate">' + esc(c.titleFr) + (ok ? '' : ' <em class="not-italic text-[10px] text-slate-400">(bientôt)</em>') + '</span></span><span class="font-arabic text-slate-400 shrink-0">' + esc(c.titleAr) + '</span>';
      var cls = 'flex items-center justify-between gap-3 py-' + (compact ? '1.5' : '3') + ' px-2 text-sm text-slate-700 dark:text-slate-300 ';
      return ok ? '<a href="' + ROOT + 'kitab-' + b.id + '/sub-' + c.id + '.html" class="' + cls + 'hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg">' + inner + '</a>'
                : '<div class="' + cls + 'soon">' + inner + '</div>';
    }).join('');
  }

  function renderHome() {
    var firstOk = flat.filter(function (f) { return isAvail(f.key); })[0];
    var cta = firstOk ? firstOk.url : bookUrl(BOOKS[0]);
    $('#main').innerHTML =
      '<section class="text-center py-10 px-4">' +
        '<div class="site-logo w-28 h-28 mx-auto mb-6 shadow-lg" role="img" aria-label="Logo"></div>' +
        '<h1 class="text-2xl sm:text-3xl font-bold text-emerald-950 dark:text-emerald-300 mb-2">الملخص الفقهي</h1>' +
        '<p class="text-lg text-slate-700 dark:text-slate-200 font-semibold mb-3">Al-Moulakhkhas Al-Fiqhi — Cheykh Sâlih Al-Fawzân</p>' +
        '<p class="text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8 text-sm leading-relaxed">Application d’étude du résumé de jurisprudence islamique, organisée par livres et par chapitres, avec preuves, points clés, notes personnelles, marque-pages.</p>' +
        '<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8 text-center">' +
          stat(BOOKS.length, 'Livres') + stat(flat.length, 'Chapitres', 'text-gold-600 dark:text-gold-400') +
          stat(0, 'Chapitres lus', '', 'stat-read') + stat(0, 'Marque-pages', 'text-gold-600 dark:text-gold-400', 'stat-bm') +
        '</div>' +
        '<a href="' + cta + '" class="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 text-gold-300 font-semibold px-6 py-3 rounded-xl shadow-md">Commencer la lecture →</a>' +
      '</section>' +
      '<section class="grid gap-5 md:grid-cols-2" id="books">' +
        BOOKS.map(function (b) {
          return '<article class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5">' +
            '<a href="' + bookUrl(b) + '" class="flex items-start justify-between gap-3 mb-3 group">' +
              '<div><span class="text-[11px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">Livre ' + b.id + ' · ' + b.chapters.length + ' chapitre' + (b.chapters.length > 1 ? 's' : '') + '</span>' +
              '<h2 class="text-lg font-bold text-emerald-950 dark:text-emerald-300 group-hover:text-gold-600">' + esc(b.titleFr) + '</h2></div>' +
              '<span class="font-arabic text-xl text-emerald-800 dark:text-emerald-400">' + esc(b.titleAr) + '</span></a>' +
            '<div class="divide-y divide-slate-100 dark:divide-slate-800/60">' + chapterList(b, true) + '</div></article>';
        }).join('') +
      '</section>';
    updateProgress();
  }
  function stat(n, label, color, id) {
    return '<div class="bg-cream-100 dark:bg-slate-800/60 p-4 rounded-xl border border-gold-500/20"><span class="block text-2xl font-bold ' + (color || 'text-emerald-900 dark:text-emerald-400') + '"' + (id ? ' id="' + id + '"' : '') + '>' + n + '</span><span class="text-xs text-slate-500">' + label + '</span></div>';
  }

  /* ---------- page d'un livre ---------- */
  function renderBook() {
    var b = BOOKS.filter(function (x) { return x.id === CUR_BOOK; })[0];
    if (!b) { $('#main').innerHTML = '<p>Livre introuvable.</p>'; return; }
    var prev = BOOKS.filter(function (x) { return x.id === b.id - 1; })[0];
    var next = BOOKS.filter(function (x) { return x.id === b.id + 1; })[0];
    document.title = b.titleFr + ' — Al-Moulakhkhas Al-Fiqhi';
    $('#main').innerHTML =
      '<nav class="text-xs text-emerald-800 dark:text-emerald-400 mb-4"><a href="' + ROOT + 'index.html" class="hover:underline">Accueil</a> › <span class="font-bold text-slate-900 dark:text-white">' + esc(b.titleFr) + '</span></nav>' +
      '<article class="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm">' +
        '<span class="inline-block text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 mb-3">Livre ' + b.id + ' sur ' + BOOKS.length + '</span>' +
        '<h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">' + esc(b.titleFr) + '</h1>' +
        '<h2 class="text-2xl sm:text-3xl font-arabic text-emerald-800 dark:text-emerald-400 text-right mt-1 mb-6" dir="rtl">' + esc(b.titleAr) + '</h2>' +
        '<div class="divide-y divide-slate-100 dark:divide-slate-800/60">' + chapterList(b, false) + '</div>' +
      '</article>' +
      '<div class="mt-6 flex justify-between gap-3">' +
        (prev ? '<a href="' + bookUrl(prev) + '" class="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">← ' + esc(prev.titleFr) + '</a>' : '<span></span>') +
        (next ? '<a href="' + bookUrl(next) + '" class="px-4 py-2 rounded-xl bg-emerald-800 text-gold-300 text-sm font-medium hover:bg-emerald-900">' + esc(next.titleFr) + ' →</a>' : '') +
      '</div>';
  }

  /* ---------- page d'un chapitre ---------- */
  var fontLevel = store.get('fiqh_font', 0);
  function renderChapter() {
    var f = byKey('sub-' + CUR_ID);
    var C = window.CHAPTER || {};
    if (!f) { $('#main').innerHTML = '<p>Chapitre inconnu : vérifiez data-id et sommaire.js.</p>'; return; }
    var key = f.key;
    var titleFr = C.titleFr || f.ch.titleFr, titleAr = C.titleAr || f.ch.titleAr;
    document.title = titleFr + ' — Al-Moulakhkhas Al-Fiqhi';

    var tpl = document.getElementById('chapter-content');
    var extra = C.extraHtml || (tpl ? tpl.innerHTML : '');
    var fawaid = (C.fawaid || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    var dalil = (C.dalilAr || C.dalilFr)
      ? '<div class="bg-emerald-50/60 dark:bg-slate-800/40 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl p-5">' +
          '<div class="text-emerald-900 dark:text-emerald-400 font-bold mb-3">❝ Preuve canonique (الدليل) :</div>' +
          '<p class="font-arabic text-right text-lg text-emerald-950 dark:text-emerald-200 mb-2 leading-relaxed" dir="rtl">' + esc(C.dalilAr || '') + '</p>' +
          '<p class="text-sm text-slate-600 dark:text-slate-300 italic">' + esc(C.dalilFr || '') + '</p>' +
          '<span class="block text-xs text-gold-600 dark:text-gold-400 font-semibold mt-2 text-right">' + esc(C.dalilRef || '') + '</span></div>'
      : '';

    $('#main').innerHTML =
      '<div class="mb-6 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">' +
        '<nav class="text-xs font-medium text-emerald-800 dark:text-emerald-400"><a href="' + ROOT + 'index.html" class="hover:underline">Accueil</a> › <a href="' + bookUrl(f.book) + '" class="hover:underline">' + esc(f.book.titleFr) + '</a> › <span class="text-slate-900 dark:text-white font-bold">' + esc(titleFr) + '</span></nav>' +
        '<div class="flex items-center gap-2">' +
          '<div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 text-xs"><span class="px-2 text-slate-500 dark:text-slate-400">Police</span><button id="f-dec" class="px-2 py-0.5 rounded hover:bg-white dark:hover:bg-slate-700 font-bold">−</button><button id="f-inc" class="px-2 py-0.5 rounded hover:bg-white dark:hover:bg-slate-700 font-bold">+</button></div>' +
          '<button id="bm-btn" class="px-3 py-1.5 rounded-lg border text-xs font-semibold"></button>' +
          '<button id="read-btn" class="px-3 py-1.5 rounded-lg border text-xs font-semibold"></button>' +
        '</div>' +
      '</div>' +
      '<article class="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-8">' +
        '<header class="border-b border-slate-200 dark:border-slate-800 pb-6">' +
          '<a href="' + bookUrl(f.book) + '" class="inline-block text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 mb-3">' + esc(f.book.titleFr) + ' - ' + esc(f.book.titleAr) + '</a>' +
          '<h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">' + esc(titleFr) + '</h1>' +
          (titleAr ? '<h2 class="text-2xl sm:text-3xl font-arabic text-emerald-800 dark:text-emerald-400 text-right" dir="rtl">' + esc(titleAr) + '</h2>' : '') +
        '</header>' +
        (C.textAr ? '<div class="bg-cream-50 dark:bg-slate-950 p-6 rounded-xl border-r-4 border-gold-500 text-right" dir="rtl"><p id="c-ar" class="font-arabic leading-loose text-slate-900 dark:text-slate-100"></p></div>' : '') +
        (C.textFr ? '<div><h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Explication &amp; règles :</h3><p id="c-fr" class="text-slate-700 dark:text-slate-300 leading-relaxed"></p></div>' : '') +
        (extra ? '<div class="prose-fiqh text-slate-700 dark:text-slate-300 leading-relaxed">' + extra + '</div>' : '') +
        dalil +
        (fawaid ? '<div><h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Points clés à retenir (فوائد فقهية) :</h3><ul class="space-y-2 pl-5 list-disc marker:text-gold-500 text-sm text-slate-700 dark:text-slate-300">' + fawaid + '</ul></div>' : '') +
        '<div class="pt-6 border-t border-slate-200 dark:border-slate-800">' +
          '<div class="flex items-center justify-between mb-3"><label for="note" class="text-sm font-bold text-slate-700 dark:text-slate-300">✎ Mes notes personnelles pour ce chapitre :</label><span id="saved" class="text-xs text-emerald-600 dark:text-emerald-400 font-medium opacity-0 transition-opacity">Enregistré !</span></div>' +
          '<textarea id="note" rows="3" placeholder="Écrivez vos notes, remarques ou rappels ici…" class="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:text-white"></textarea>' +
        '</div>' +
      '</article>' +
      '<div id="chap-nav" class="mt-6 flex justify-between gap-3"></div>';

    if (C.textAr) $('#c-ar').textContent = C.textAr;
    if (C.textFr) $('#c-fr').textContent = C.textFr;
    $('#note').value = notes[key] || '';
    var t;
    $('#note').addEventListener('input', function (e) {
      notes[key] = e.target.value; store.set('fiqh_notes', notes);
      var s = $('#saved'); s.style.opacity = 1; clearTimeout(t); t = setTimeout(function () { s.style.opacity = 0; }, 1500);
    });
    $('#f-inc').addEventListener('click', function () { setFont(1); });
    $('#f-dec').addEventListener('click', function () { setFont(-1); });
    $('#bm-btn').addEventListener('click', function () {
      var i = marks.indexOf(key); if (i > -1) marks.splice(i, 1); else marks.push(key);
      store.set('fiqh_bookmarks', marks); toolbar(key); updateProgress();
      if (!$('#bm').classList.contains('hidden')) renderBookmarks();
    });
    $('#read-btn').addEventListener('click', function () {
      read[key] = !read[key]; store.set('fiqh_read_status', read); toolbar(key); renderSidebar();
    });
    toolbar(key); applyFont(); renderChapterNav(f);
  }

  function toolbar(key) {
    var bm = marks.indexOf(key) > -1, rd = !!read[key];
    $('#bm-btn').className = 'px-3 py-1.5 rounded-lg border text-xs font-semibold ' + (bm ? 'border-gold-500 text-gold-600 bg-amber-50 dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-gold-500');
    $('#bm-btn').textContent = bm ? '★ Marqué' : '☆ Marquer';
    $('#read-btn').className = 'px-3 py-1.5 rounded-lg border text-xs font-semibold ' + (rd ? 'bg-emerald-700 text-white border-emerald-700' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-600');
    $('#read-btn').textContent = rd ? '✓ Lu' : 'Marquer comme lu';
  }
  function setFont(d) { fontLevel = Math.max(-1, Math.min(2, fontLevel + d)); store.set('fiqh_font', fontLevel); applyFont(); }
  function applyFont() {
    var ar = ['text-lg', 'text-xl', 'text-2xl', 'text-3xl'], fr = ['text-sm', 'text-base', 'text-lg', 'text-xl'];
    var a = $('#c-ar'), f = $('#c-fr');
    if (a) a.className = 'font-arabic leading-loose text-slate-900 dark:text-slate-100 ' + ar[fontLevel + 1];
    if (f) f.className = 'text-slate-700 dark:text-slate-300 leading-relaxed ' + fr[fontLevel + 1];
  }
  function renderChapterNav(f) {
    var box = $('#chap-nav'); if (!box) return;
    var i = flat.indexOf(f), p = null, n = null, k;
    for (k = i - 1; k >= 0; k--) if (isAvail(flat[k].key)) { p = flat[k]; break; }
    for (k = i + 1; k < flat.length; k++) if (isAvail(flat[k].key)) { n = flat[k]; break; }
    box.innerHTML =
      (p ? '<a href="' + p.url + '" class="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">← Précédent</a>' : '<span></span>') +
      (n ? '<a href="' + n.url + '" class="px-4 py-2 rounded-xl bg-emerald-800 text-gold-300 text-sm font-medium hover:bg-emerald-900">Suivant →</a>' : '<a href="' + bookUrl(f.book) + '" class="px-4 py-2 rounded-xl bg-emerald-800 text-gold-300 text-sm font-medium hover:bg-emerald-900">Retour au livre</a>');
  }

  /* ---------- démarrage ---------- */
  function renderAll() {
    renderSidebar();
    if (PAGE === 'home') renderHome();
    else if (PAGE === 'book') renderBook();
    else if (PAGE === 'chapter') { var f = byKey('sub-' + CUR_ID); if (f) renderChapterNav(f); }
  }

  shell();
  renderSidebar();
  if (PAGE === 'home') renderHome();
  else if (PAGE === 'book') renderBook();
  else if (PAGE === 'chapter') renderChapter();

  loadAvailability().then(function (m) { AVAIL = m; if (m) renderAll(); });
})();
