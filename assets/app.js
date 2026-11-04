/**
 * Moteur partagé du site Al-Moulakhkhas Al-Fiqhi.
 * Chaque page HTML ne contient presque rien : cette application construit l'en-tête,
 * le menu latéral, la recherche, la progression, les marque-pages, etc. à partir de sommaire.js.
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
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')   // accents latins
      .replace(/[ً-ٰٟ]/g, '')               // voyelles arabes
      .replace(/[’']/g, '');
  }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var ICONS = {
    menu: 'M4 7h16M4 12h16M4 17h16', search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4.3-4.3',
    close: 'M6 6l12 12M18 6L6 18', left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7', check: 'M5 13l4 4L19 7',
    sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'
  };
  function ico(n, c) {
    return '<svg viewBox="0 0 24 24" class="' + (c || 'w-5 h-5') + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + ICONS[n] + '"/></svg>';
  }

  /* ---------- données ---------- */
  var flat = [];
  BOOKS.forEach(function (b) {
    b.chapters.forEach(function (c) {
      flat.push({ key: 'sub-' + c.id, book: b, ch: c, num: c.id.split('-')[1], url: ROOT + 'kitab-' + b.id + '/sub-' + c.id + '.html' });
    });
  });
  function bookUrl(b) { return ROOT + 'kitab-' + b.id + '/index.html'; }
  function byKey(key) { for (var i = 0; i < flat.length; i++) if (flat[i].key === key) return flat[i]; return null; }
  function bookRead(b) { return b.chapters.filter(function (c) { return read['sub-' + c.id]; }).length; }

  var read = store.get('fiqh_read_status', {});   // { 'sub-1-2': true }
  var marks = store.get('fiqh_bookmarks', []);    // [{ id, key:'sub-1-2', i:n° du bloc, ex:extrait, t }] (anciens marque-pages = chaînes)
  marks = marks.map(function (m) { return typeof m === 'string' ? { id: 'm' + m, key: m, i: -1, ex: '', t: 0 } : m; });
  function hasMark(key) { return marks.some(function (m) { return m.key === key; }); }
  function markCount(key) { return marks.filter(function (m) { return m.key === key; }).length; }
  var pos = store.get('fiqh_pos', {});            // position de lecture par chapitre (0 à 1)
  var last = store.get('fiqh_last', null);        // dernier chapitre ouvert { key, t }

  /* ---------- disponibilité des fichiers (chapitres ajoutés un par un) ---------- */
  var AVAIL = null;
  function loadAvailability() {
    if (CFG.checkAvailability === false) return Promise.resolve(null);
    if (navigator.onLine === false) return Promise.resolve(store.get('fiqh_avail_last', null));
    try {
      var c = JSON.parse(sessionStorage.getItem('fiqh_avail') || 'null');
      if (c && Date.now() - c.t < 300000) return Promise.resolve(c.m);
    } catch (e) {}
    return Promise.all(flat.map(function (f) {
      return fetch(f.url, { method: 'HEAD', cache: 'no-store' })
        .then(function (r) { return [f.key, r.ok]; })
        .catch(function () { return [f.key, null]; });
    })).then(function (pairs) {
      var m = {}, unknown = false;
      pairs.forEach(function (p) { if (p[1] === null) unknown = true; m[p[0]] = p[1]; });
      if (unknown) return store.get('fiqh_avail_last', null); // ex. ouverture en local (file://)
      try { sessionStorage.setItem('fiqh_avail', JSON.stringify({ t: Date.now(), m: m })); } catch (e) {}
      store.set('fiqh_avail_last', m);
      return m;
    });
  }
  function isAvail(key) { return key === 'sub-' + CUR_ID || !AVAIL || AVAIL[key] !== false; }

  /* ---------- thème et taille du texte ---------- */
  var theme = 'light';
  try {
    var st = localStorage.getItem('fiqh_theme');
    theme = st || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } catch (e) {}
  function applyTheme() {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    var b = $('#theme-btn'); if (b) b.innerHTML = ico(theme === 'dark' ? 'sun' : 'moon', 'w-5 h-5');
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', theme === 'dark' ? '#001d31' : '#005c83');
  }
  var FS = [0.9, 1, 1.12, 1.26, 1.42];
  var fontLevel = Math.max(-1, Math.min(3, store.get('fiqh_font', 0)));
  function applyFont() { document.documentElement.style.setProperty('--fs', FS[fontLevel + 1]); }
  function setFont(d) {
    fontLevel = Math.max(-1, Math.min(3, fontLevel + d)); store.set('fiqh_font', fontLevel); applyFont();
    var a = $('#f-dec'), b = $('#f-inc');
    if (a) a.disabled = fontLevel <= -1; if (b) b.disabled = fontLevel >= 3;
  }
  applyFont();

  /* ---------- fenêtres latérales (menu, marque-pages) ---------- */
  var openCount = 0;
  function lockScroll(on) { document.body.style.overflow = on ? 'hidden' : ''; }
  function openSidebar() { $('#sidebar').classList.remove('-translate-x-full'); $('#overlay').classList.remove('hidden'); lockScroll(true); }
  function closeSidebar() { $('#sidebar').classList.add('-translate-x-full'); $('#overlay').classList.add('hidden'); lockScroll(false); }
  function openPanel() {
    pending = null; renderPanel();
    var p = $('#bm-panel'); p.classList.remove('invisible'); p.offsetWidth; p.classList.remove('translate-x-full');
    $('#bm-overlay').classList.remove('hidden'); lockScroll(true);
  }
  function closePanel() {
    var p = $('#bm-panel'); p.classList.add('translate-x-full');
    setTimeout(function () { if (p.classList.contains('translate-x-full')) p.classList.add('invisible'); }, 320);
    $('#bm-overlay').classList.add('hidden'); lockScroll(false); pending = null;
  }
  function panelOpen() { return !$('#bm-panel').classList.contains('translate-x-full'); }

  /* ---------- coquille commune ---------- */
  function shell() {
    var isChap = PAGE === 'chapter';
    $('#app').innerHTML =
      '<div id="progress" class="fixed top-0 inset-x-0 h-[3px] z-[60] pointer-events-none' + (isChap ? '' : ' hidden') + '"><div id="progress-bar" class="h-full w-0 bg-gold-500"></div></div>' +
      '<header class="sticky top-0 z-40 bg-emerald-950/95 backdrop-blur text-white border-b border-gold-500/30 shadow-md">' +
        '<div class="mx-auto max-w-[96rem] px-2 sm:px-4 lg:px-6 h-14 flex items-center gap-1 sm:gap-2">' +
          '<button id="menu-btn" class="icon-btn lg:hidden" aria-label="Ouvrir le sommaire">' + ico('menu', 'w-6 h-6') + '</button>' +
          '<a href="' + ROOT + 'index.html" class="flex items-center gap-2.5 min-w-0 mr-auto lg:mr-4">' +
            '<span class="site-logo w-9 h-9 ring-2 ring-gold-500/60" role="img" aria-label="Logo"></span>' +
            '<span class="min-w-0 leading-tight"><span class="block font-bold text-[15px] sm:text-base text-amber-100 truncate">Al-Moulakhkhas<span class="hidden min-[430px]:inline"> Al-Fiqhi</span></span>' +
            '<span class="hidden sm:block text-[11px] text-gold-400 font-arabic truncate">الملخص الفقهي - الشيخ صالح الفوزان</span></span>' +
          '</a>' +
          '<div class="hidden md:block flex-1 max-w-md mx-auto relative">' +
            '<input id="search" type="search" autocomplete="off" placeholder="Rechercher un livre ou un chapitre (FR / AR)…" class="w-full h-10 px-4 rounded-full bg-emerald-900/70 border border-gold-500/40 text-sm text-white placeholder-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-gold-400">' +
            '<div id="search-box" class="hidden absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-[70vh] overflow-y-auto z-50"></div>' +
          '</div>' +
          '<span id="offline-pill" class="hidden whitespace-nowrap text-[10px] font-bold px-2 py-1 rounded-full bg-gold-500 text-emerald-950">Hors ligne</span>' +
          '<button id="search-btn" class="icon-btn md:hidden" aria-label="Rechercher">' + ico('search', 'w-5 h-5') + '</button>' +
          '<button id="bm-open" class="icon-btn relative" aria-label="Marque-pages" title="Marque-pages"><span class="text-xl">🔖</span><span id="bm-badge" class="hidden absolute top-0.5 right-0 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-gold-500 text-emerald-950 text-[10px] font-bold items-center justify-center"></span></button>' +
          '<button id="theme-btn" class="icon-btn" aria-label="Changer le thème"></button>' +
        '</div>' +
        '<div id="msearch" class="hidden md:hidden px-3 pb-3 relative">' +
          '<input id="search-m" type="search" autocomplete="off" placeholder="Rechercher (FR / AR)…" class="w-full h-11 px-4 rounded-full bg-emerald-900/70 border border-gold-500/40 text-base text-white placeholder-emerald-300/70 focus:outline-none focus:ring-2 focus:ring-gold-400">' +
          '<div id="search-box-m" class="hidden absolute left-3 right-3 top-full mt-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-[65vh] overflow-y-auto z-50"></div>' +
        '</div>' +
      '</header>' +
      '<div class="flex-1 flex mx-auto w-full max-w-[96rem] relative">' +
        '<div id="overlay" class="fixed inset-0 bg-slate-950/60 z-30 hidden lg:hidden"></div>' +
        '<aside id="sidebar" class="fixed lg:sticky top-14 left-0 z-30 w-[20rem] lg:w-[330px] max-w-[88vw] h-[calc(100dvh-3.5rem)] shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 -translate-x-full lg:translate-x-0">' +
          '<div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-cream-100/60 dark:bg-slate-900/50">' +
            '<div class="flex items-center justify-between mb-2"><span class="text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-400">Ma progression</span><span id="pct" class="text-xs font-bold text-gold-600 dark:text-gold-400">0%</span></div>' +
            '<div class="meter"><i id="bar" style="width:0%"></i></div>' +
          '</div>' +
          '<nav id="toc" aria-label="Sommaire" class="flex-1 overflow-y-auto scroll-thin p-3 space-y-2"></nav>' +
        '</aside>' +
        '<main class="flex-1 min-w-0 px-4 sm:px-8 lg:px-10 py-5 sm:py-8 pb-28 md:pb-12"><div id="main" class="mx-auto w-full ' + (isChap ? 'max-w-[46rem] lg:max-w-[832px] min-[1500px]:max-w-[896px]' : 'max-w-5xl xl:max-w-6xl') + '"></div></main>' +
      '</div>' +
      '<footer class="text-center text-xs text-slate-600 dark:text-slate-400 px-4 pt-6 pb-24 md:pb-8 border-t border-slate-200 dark:border-slate-800">Al-Moulakhkhas Al-Fiqhi — Cheykh Sâlih Al-Fawzân · Outil d’étude personnel<div id="offline-foot" class="mt-1"></div></footer>' +
      '<div id="bm-overlay" class="fixed inset-0 z-50 bg-slate-950/60 hidden"></div>' +
      '<aside id="bm-panel" class="fixed top-0 right-0 z-50 h-[100dvh] w-[min(24rem,92vw)] bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 translate-x-full invisible" aria-label="Marque-pages">' +
        '<div class="flex items-center justify-between pl-4 pr-2 h-14 bg-emerald-950 text-white border-b border-gold-500/30 shrink-0"><h2 class="font-bold text-lg flex items-center gap-2"><span>🔖</span> Marque-pages</h2><button id="bm-close" class="icon-btn" aria-label="Fermer">' + ico('close', 'w-5 h-5') + '</button></div>' +
        '<div id="bm-body" class="flex-1 overflow-y-auto scroll-thin p-4 space-y-6 safe-b"></div>' +
      '</aside>' +
      (isChap ? mobileBar() + '<button id="bm-fab" class="hidden md:flex fixed bottom-6 right-6 z-30 items-center gap-2 h-12 pl-4 pr-5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-gold-300 font-semibold text-sm shadow-xl ring-2 ring-gold-500/40 active:scale-95 transition" title="Marquer le passage affiché (touche B)"></button>' : '') +
      '<div id="fn-pop" class="pop-hidden fixed z-50 bottom-20 md:bottom-6 inset-x-3 mx-auto max-w-xl card shadow-2xl p-4" role="dialog" aria-label="Note"><div class="flex items-start gap-3"><div id="fn-body" class="flex-1 min-w-0 text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 max-h-[45vh] overflow-y-auto"></div><button id="fn-close" class="shrink-0 w-9 h-9 -mt-1 -mr-1 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center" aria-label="Fermer la note">' + ico('close', 'w-4 h-4') + '</button></div></div>' +
      '<div id="toast" class="pop-hidden fixed z-50 bottom-20 md:bottom-6 inset-x-3 mx-auto w-fit max-w-[92vw] rounded-xl bg-emerald-950 text-white text-sm px-4 py-2.5 shadow-xl flex items-center gap-3"></div>';

    $('#theme-btn').addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('fiqh_theme', theme); } catch (e) {}
      applyTheme();
    });
    $('#menu-btn').addEventListener('click', openSidebar);
    $('#overlay').addEventListener('click', closeSidebar);
    $('#bm-open').addEventListener('click', openPanel);
    $('#bm-close').addEventListener('click', closePanel);
    $('#bm-overlay').addEventListener('click', closePanel);
    $('#fn-close').addEventListener('click', hideNote);
    $('#search-btn').addEventListener('click', function () {
      var m = $('#msearch'); m.classList.toggle('hidden');
      if (!m.classList.contains('hidden')) $('#search-m').focus();
    });
    bindSearch($('#search'), $('#search-box'));
    bindSearch($('#search-m'), $('#search-box-m'));
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#search, #search-box, #search-m, #search-box-m, #search-btn')) {
        $('#search-box').classList.add('hidden'); $('#search-box-m').classList.add('hidden');
      }
      if (!e.target.closest('#fn-pop, a.footnote-ref')) hideNote();
    });
    applyTheme();
    updateBadge();
    window.addEventListener('online', netState); window.addEventListener('offline', netState); netState();
  }
  function netState() { var p = $('#offline-pill'); if (p) p.classList.toggle('hidden', navigator.onLine !== false); }

  function mobileBar() {
    var cls = 'flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 active:bg-slate-100 dark:active:bg-slate-800';
    return '<nav id="mbar" aria-label="Navigation du chapitre" class="fixed bottom-0 inset-x-0 z-30 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 safe-b"><div class="grid grid-cols-4 h-14">' +
      '<a id="mb-prev" class="' + cls + '">' + ico('left', 'w-5 h-5') + '<span>Précédent</span></a>' +
      '<button id="mb-bm" class="' + cls + '"></button>' +
      '<button id="mb-read" class="' + cls + '"></button>' +
      '<a id="mb-next" class="' + cls + '">' + ico('right', 'w-5 h-5') + '<span>Suivant</span></a>' +
    '</div></nav>';
  }

  /* ---------- recherche globale ---------- */
  function bindSearch(input, box) {
    input.addEventListener('input', function () {
      var q = norm(input.value.trim());
      if (!q) { box.classList.add('hidden'); return; }
      var out = [];
      BOOKS.forEach(function (b) {
        if (norm(b.titleFr).indexOf(q) > -1 || norm(b.titleAr).indexOf(q) > -1)
          out.push({ href: bookUrl(b), a: b.titleFr, b: b.titleAr, tag: 'Livre ' + b.id, ok: true });
      });
      flat.forEach(function (f) {
        if (norm(f.ch.titleFr).indexOf(q) > -1 || norm(f.ch.titleAr).indexOf(q) > -1)
          out.push({ href: f.url, a: f.ch.titleFr, b: f.ch.titleAr, tag: f.book.titleFr, ok: isAvail(f.key) });
      });
      out = out.slice(0, 20);
      box.innerHTML = out.length ? out.map(function (r) {
        var inner = '<div class="min-w-0"><div class="text-sm font-medium leading-snug">' + esc(r.a) + '</div><div class="text-[11px] text-slate-600 dark:text-slate-400 truncate">' + esc(r.tag) + (r.ok ? '' : ' · bientôt') + '</div></div><span class="font-arabic text-emerald-700 dark:text-emerald-400 text-sm shrink-0">' + esc(r.b) + '</span>';
        return r.ok
          ? '<a href="' + r.href + '" class="flex items-center justify-between gap-3 px-4 py-3 hover:bg-emerald-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0">' + inner + '</a>'
          : '<div class="flex items-center justify-between gap-3 px-4 py-3 soon">' + inner + '</div>';
      }).join('') : '<p class="px-4 py-4 text-sm text-slate-600">Aucun résultat.</p>';
      box.classList.remove('hidden');
    });
  }

  /* ---------- menu latéral ---------- */
  function renderSidebar() {
    var openIds = {};
    var existing = $$('#toc details');
    existing.forEach(function (d) { if (d.open) openIds[d.getAttribute('data-book')] = true; });
    var first = existing.length === 0;

    $('#toc').innerHTML = BOOKS.map(function (b) {
      var open = first ? b.id === CUR_BOOK : !!openIds[b.id];
      var n = bookRead(b);
      return '<details data-book="' + b.id + '"' + (open ? ' open' : '') + ' class="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">' +
        '<summary class="px-3 py-3 flex items-center justify-between gap-2 bg-cream-100/70 dark:bg-slate-800/70 hover:bg-cream-200/70 dark:hover:bg-slate-800">' +
          '<span class="flex items-center gap-2 min-w-0"><span class="chev text-gold-600 text-[10px]">▶</span><span class="text-[13px] font-bold text-emerald-950 dark:text-emerald-300 leading-snug">' + esc(b.titleFr) + '</span></span>' +
          '<span class="flex items-center gap-2 shrink-0"><span class="text-[11px] ' + (n === b.chapters.length && n ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400') + '">' + n + '/' + b.chapters.length + '</span><span class="text-xs font-arabic text-emerald-800 dark:text-emerald-400">' + esc(b.titleAr) + '</span></span>' +
        '</summary>' +
        '<div class="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/50">' +
          '<a href="' + bookUrl(b) + '" class="block px-4 py-2.5 text-xs text-gold-700 dark:text-gold-400 font-semibold hover:bg-emerald-50 dark:hover:bg-slate-800">Voir tout le livre →</a>' +
          b.chapters.map(function (c) {
            var key = 'sub-' + c.id, ok = isAvail(key), isCur = c.id === CUR_ID;
            var mark = read[key] ? '<span class="text-emerald-600 dark:text-emerald-400">✓</span>' : '<span class="text-slate-300 dark:text-slate-600">○</span>';
            var body = '<span class="flex items-start gap-2 min-w-0">' + mark + '<span class="font-medium leading-snug ' + (isCur ? 'text-emerald-900 dark:text-white' : 'text-slate-700 dark:text-slate-300') + '">' + esc(c.titleFr) + (ok ? '' : ' <em class="not-italic text-[10px] text-slate-600 dark:text-slate-400">(bientôt)</em>') + '</span></span>' +
              (c.titleAr ? '<span class="text-[11px] font-arabic text-slate-400 dark:text-slate-400 shrink-0">' + esc(c.titleAr) + '</span>' : '');
            var cls = 'px-4 py-3 flex items-start justify-between gap-2 text-xs ' + (isCur ? 'bg-emerald-100/80 dark:bg-slate-800 border-l-4 border-gold-500 ' : '');
            return ok
              ? '<a href="' + ROOT + 'kitab-' + b.id + '/sub-' + c.id + '.html"' + (isCur ? ' id="cur-item"' : '') + ' class="' + cls + 'hover:bg-emerald-50 dark:hover:bg-slate-800/60">' + body + '</a>'
              : '<div class="' + cls + 'soon">' + body + '</div>';
          }).join('') +
        '</div></details>';
    }).join('');
    updateProgress();
  }

  function updateBadge() {
    var b = $('#bm-badge'); if (!b) return;
    b.textContent = marks.length; b.classList.toggle('hidden', !marks.length); b.classList.toggle('flex', !!marks.length);
  }
  function updateProgress() {
    var n = flat.filter(function (f) { return read[f.key]; }).length;
    var pct = flat.length ? Math.round(n / flat.length * 100) : 0;
    var p = $('#pct'), bar = $('#bar');
    if (p) p.textContent = pct + '%';
    if (bar) bar.style.width = pct + '%';
    updateBadge();
  }

  /* ---------- réinitialisation (confirmation sur la page même) ---------- */
  var RESETS = [
    { id: 'chap', txt: 'Effacer la progression de ce chapitre', hint: 'chapitre lu et position de lecture', chapOnly: true },
    { id: 'prog', txt: 'Effacer toute la progression de lecture', hint: 'chapitres lus et positions' },
    { id: 'marks', txt: 'Supprimer tous les marque-pages', hint: '' },
    { id: 'all', txt: 'Tout effacer', hint: 'progression et marque-pages' }
  ];
  var pending = null;
  function resetHtml(ctx) {
    return RESETS.filter(function (r) { return !r.chapOnly || (ctx === 'panel' && PAGE === 'chapter'); }).map(function (r) {
      if (pending === r.id) {
        return '<div class="rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 text-sm leading-relaxed">' +
          '<span class="font-semibold text-red-800 dark:text-red-300">' + esc(r.txt) + ' ?</span> ' +
          '<span class="whitespace-nowrap"><button class="font-bold text-red-700 dark:text-red-400 underline underline-offset-2 py-1" data-reset-yes="' + r.id + '">Oui, effacer</button>' +
          ' <span class="text-slate-400">/</span> <button class="font-semibold text-slate-600 dark:text-slate-300 underline underline-offset-2 py-1" data-reset-no="1">Annuler</button></span></div>';
      }
      return '<div class="py-1"><button class="linkish" data-reset="' + r.id + '">' + esc(r.txt) + '</button>' +
        (r.hint ? '<div class="text-xs text-slate-600 dark:text-slate-400">' + esc(r.hint) + '</div>' : '') + '</div>';
    }).join('');
  }
  function renderResetBlocks() { $$('.reset-block').forEach(function (el) { el.innerHTML = resetHtml(el.getAttribute('data-ctx')); }); }
  function doReset(id) {
    var key = 'sub-' + CUR_ID, msg = '';
    if (id === 'chap') { delete read[key]; delete pos[key]; if (last && last.key === key) last = null; msg = 'Progression du chapitre effacée.'; }
    if (id === 'prog' || id === 'all') { read = {}; pos = {}; last = null; msg = 'Progression de lecture effacée.'; }
    if (id === 'marks' || id === 'all') { marks = []; msg = id === 'all' ? 'Progression et marque-pages effacés.' : 'Marque-pages supprimés.'; }
    store.set('fiqh_read_status', read); store.set('fiqh_pos', pos); store.set('fiqh_bookmarks', marks);
    if (last) store.set('fiqh_last', last); else store.del('fiqh_last');
    pending = null;
    refreshAll(); toast(msg);
  }
  function refreshAll() {
    renderSidebar(); updateProgress();
    if (PAGE === 'home') renderHome();
    else if (PAGE === 'book') renderBook();
    else if (PAGE === 'chapter') { toolbar(); paintMarks(); }
    renderPanel(); renderResetBlocks();
  }

  /* ---------- panneau des marque-pages ---------- */
  function renderPanel() {
    var cur = PAGE === 'chapter' ? byKey('sub-' + CUR_ID) : null;
    var items = marks.slice().sort(function (x, y) { return (y.t || 0) - (x.t || 0); }).map(function (m) {
      var f = byKey(m.key); if (!f) return '';
      var href = m.i >= 0 ? f.url + '?bm=' + encodeURIComponent(m.id) : f.url;
      return '<div class="flex items-stretch gap-2"><a href="' + href + '" class="flex-1 min-w-0 card px-3.5 py-3 hover:border-gold-500">' +
        '<div class="text-[11px] font-bold uppercase tracking-wide text-gold-600 dark:text-gold-400 truncate">Livre ' + f.book.id + ' · ' + esc(f.book.titleFr) + '</div>' +
        '<div class="text-[15px] font-semibold leading-snug mt-0.5 text-slate-800 dark:text-slate-100">' + esc(f.ch.titleFr) + '</div>' +
        (m.ex ? '<div class="mt-1.5 text-[13px] italic leading-snug text-slate-600 dark:text-slate-300 border-l-2 border-gold-500 pl-2 line-clamp-3" dir="auto">« ' + esc(m.ex) + ' »</div>'
              : '<div class="text-[11px] text-slate-600 mt-1">Chapitre entier</div>') +
      '</a><button data-bm-del="' + esc(m.id) + '" class="w-10 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 hover:border-red-300 flex items-center justify-center" aria-label="Retirer ce marque-page">' + ico('close', 'w-4 h-4') + '</button></div>';
    }).join('');
    $('#bm-body').innerHTML =
      (cur ? '<div><button data-bm-add="1" class="btn btn-primary w-full !py-3">🔖 Marquer le passage affiché</button><p class="text-xs text-slate-600 dark:text-slate-400 mt-2">Le passage en haut de l’écran est retenu ; vous y reviendrez en un geste.</p></div>' : '') +
      '<section><h3 class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">Mes marque-pages' + (marks.length ? ' (' + marks.length + ')' : '') + '</h3>' +
        (items ? '<div class="space-y-2.5">' + items + '</div>' : '<p class="text-sm text-slate-600 dark:text-slate-400 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-center">Aucun marque-page.<br>Dans un chapitre, touchez « Marquer » : le passage affiché à l’écran est retenu.</p>') +
      '</section>' +
      '<section class="pt-5 border-t border-slate-200 dark:border-slate-800"><h3 class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Réinitialiser</h3>' +
        '<div class="reset-block space-y-1" data-ctx="panel">' + resetHtml('panel') + '</div></section>';
  }

  /* marque-pages sur un passage : bloc de texte affiché en haut de l'écran */
  function saveMarks() { store.set('fiqh_bookmarks', marks); }
  function bt(el) { return el.textContent.replace(/\s+/g, ' ').replace(/^\u2055\s*/, '').trim(); }
  function blocks() {
    var root = $('#prose'); if (!root) return [];
    return $$('p, li, h1, h2, h3, h4, table', root).filter(function (el) { return !el.closest('.footnotes') && !el.querySelector('p, li, h1, h2, h3, h4'); });
  }
  function topBlock() {
    var bl = blocks();
    for (var i = 0; i < bl.length; i++) if (bl[i].getBoundingClientRect().bottom > 80) return { i: i, el: bl[i] };
    return bl.length ? { i: bl.length - 1, el: bl[bl.length - 1] } : null;
  }
  function locate(m) {
    if (m.i < 0) return null;
    var bl = blocks(), ex = (m.ex || '').slice(0, 40);
    if (bl[m.i] && (!ex || bt(bl[m.i]).indexOf(ex) === 0)) return bl[m.i];
    if (ex) for (var k = 0; k < bl.length; k++) if (bt(bl[k]).indexOf(ex) === 0) return bl[k];
    return bl[m.i] || null;
  }
  function paintMarks() {
    blocks().forEach(function (e) { e.classList.remove('has-bm'); });
    marks.forEach(function (m) { if (m.key === 'sub-' + CUR_ID) { var el = locate(m); if (el) el.classList.add('has-bm'); } });
  }
  function afterMarksChange() {
    updateBadge(); if (panelOpen()) renderPanel();
    if (PAGE === 'chapter') { paintMarks(); toolbar(); } else if (PAGE === 'home') renderHome(); else if (PAGE === 'book') renderBook();
  }
  function addMark() {
    var t = topBlock(), key = 'sub-' + CUR_ID;
    if (!t) { toast('Rien à marquer ici.'); return; }
    if (marks.some(function (m) { return m.key === key && m.i === t.i; })) { toast('Ce passage est déjà marqué.'); return; }
    var ex = bt(t.el).slice(0, 120);
    var m = { id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), key: key, i: t.i, ex: ex, t: Date.now() };
    marks.push(m); saveMarks(); afterMarksChange();
    toast('Passage marqué.', 'Annuler', function () { removeMark(m.id); });
  }
  function removeMark(id) { marks = marks.filter(function (m) { return m.id !== id; }); saveMarks(); afterMarksChange(); }

  /* ---------- messages, notes de bas de page ---------- */
  var toastT;
  function toast(msg, label, fn) {
    var t = $('#toast');
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (label ? '<button class="font-bold text-gold-400 underline underline-offset-2 whitespace-nowrap" id="toast-act">' + esc(label) + '</button>' : '');
    t.classList.remove('pop-hidden');
    if (label) $('#toast-act').addEventListener('click', function () { t.classList.add('pop-hidden'); fn(); });
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.add('pop-hidden'); }, label ? 7000 : 2500);
  }
  function showNote(ref) {
    var id = (ref.getAttribute('href') || '').replace('#', ''), li = id && document.getElementById(id);
    if (!li) return false;
    var c = li.cloneNode(true);
    $$('a[role="doc-backlink"], a.footnote-back', c).forEach(function (a) { a.remove(); });
    $('#fn-body').innerHTML = '<div class="text-[11px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-1">Note ' + esc(ref.textContent.replace(/[^\d]/g, '')) + '</div>' + c.innerHTML;
    $('#fn-pop').classList.remove('pop-hidden');
    return true;
  }
  function hideNote() { var p = $('#fn-pop'); if (p) p.classList.add('pop-hidden'); }

  /* ---------- hors ligne (service worker) ---------- */
  var off = { state: 'idle', done: 0, total: 0, n: 0 };
  function offlineHtml(compact) {
    if (off.state === 'unsupported') return '<span class="text-xs text-slate-600">Lecture hors ligne : ouvrez le site depuis son adresse web (https) pour l’activer.</span>';
    if (off.state === 'busy') {
      var p = off.total ? Math.round(off.done / off.total * 100) : 0;
      return '<div class="text-xs text-slate-600 dark:text-slate-300 mb-1.5">Téléchargement pour la lecture hors ligne… ' + off.done + '/' + off.total + '</div><div class="meter"><i style="width:' + p + '%"></i></div>';
    }
    if (off.state === 'ready') return '<span class="text-xs ' + (compact ? '' : 'text-slate-600 dark:text-slate-300') + '"><span class="text-emerald-600 dark:text-emerald-400 font-bold">✓ Disponible hors ligne</span> (' + off.n + ' pages) · <button class="linkish !text-xs" data-offline-dl="1">Mettre à jour</button></span>';
    return '<button class="btn btn-primary w-full" data-offline-dl="1">⬇ Télécharger pour lire hors ligne</button>';
  }
  function updateOfflineUI() {
    var a = $('#offline-box'); if (a) a.innerHTML = offlineHtml(false);
    var b = $('#offline-foot'); if (b) b.innerHTML = off.state === 'unsupported' ? '' : offlineHtml(true).replace('btn btn-primary w-full', 'linkish');
  }
  function swPost(msg) {
    if (!navigator.serviceWorker) return;
    navigator.serviceWorker.ready.then(function (reg) { if (reg.active) reg.active.postMessage(msg); });
  }
  function startOffline() {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) { off.state = 'unsupported'; updateOfflineUI(); return; }
    var saved = store.get('fiqh_offline', null);
    if (saved) { off.state = 'ready'; off.n = saved.n || 0; }
    navigator.serviceWorker.addEventListener('message', function (e) {
      var d = e.data || {};
      if (d.type !== 'cache-progress') return;
      off.done = d.done; off.total = d.total;
      if (d.finished) { off.state = 'ready'; off.n = d.cached; store.set('fiqh_offline', { t: Date.now(), n: d.cached }); }
      else off.state = 'busy';
      updateOfflineUI();
    });
    navigator.serviceWorker.register(ROOT + 'sw.js', { scope: ROOT }).then(function () {
      if (navigator.onLine !== false && (!saved || Date.now() - saved.t > 86400000)) swPost({ type: 'cache-all' });
    }).catch(function () { off.state = saved ? 'ready' : 'idle'; });
    updateOfflineUI();
  }

  /* ---------- listes de chapitres ---------- */
  function chapterList(b, compact) {
    return b.chapters.map(function (c) {
      var key = 'sub-' + c.id, ok = isAvail(key), rd = !!read[key], bm = hasMark(key);
      var num = '<span class="w-7 h-7 shrink-0 rounded-full text-xs font-bold flex items-center justify-center ' + (rd ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400') + '">' + (rd ? '✓' : esc(c.id.split('-')[1])) + '</span>';
      var inner = num + '<span class="flex-1 min-w-0 ' + (compact ? 'text-sm' : 'text-[15px]') + ' leading-snug">' + esc(c.titleFr) + (ok ? '' : ' <em class="not-italic text-[10px] text-slate-600 dark:text-slate-400">(bientôt)</em>') + '</span>' +
        (c.titleAr ? '<span class="font-arabic text-slate-400 dark:text-slate-400 shrink-0 text-sm">' + esc(c.titleAr) + '</span>' : '') +
        (bm ? '<span class="text-gold-500 shrink-0" title="Marqué">★</span>' : '');
      var cls = 'flex items-center gap-3 ' + (compact ? 'py-2' : 'py-3') + ' px-2 text-slate-700 dark:text-slate-300 ';
      return ok ? '<a href="' + ROOT + 'kitab-' + b.id + '/sub-' + c.id + '.html" class="' + cls + 'hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg">' + inner + '</a>'
                : '<div class="' + cls + 'soon">' + inner + '</div>';
    }).join('');
  }

  /* ---------- page d'accueil ---------- */
  function renderHome() {
    var n = flat.filter(function (f) { return read[f.key]; }).length;
    var pct = flat.length ? Math.round(n / flat.length * 100) : 0;
    var firstOk = flat.filter(function (f) { return isAvail(f.key); })[0];
    var lf = last && byKey(last.key);
    var resume = lf
      ? '<a href="' + lf.url + '" class="btn btn-primary w-full mt-4 !justify-between !py-3"><span class="text-left leading-snug"><span class="block text-[11px] font-semibold opacity-80 uppercase tracking-wide">Reprendre la lecture' + (pos[lf.key] > 0.02 ? ' · ' + Math.round(pos[lf.key] * 100) + ' %' : '') + '</span>' + esc(lf.ch.titleFr) + '</span>' + ico('right', 'w-5 h-5 shrink-0') + '</a>'
      : '<a href="' + (firstOk ? firstOk.url : bookUrl(BOOKS[0])) + '" class="btn btn-primary w-full mt-4 !py-3">Commencer la lecture →</a>';
    $('#main').innerHTML =
      '<div class="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-center mb-8">' +
        '<section class="text-center lg:text-left py-2 sm:py-6">' +
          '<div class="site-logo w-24 h-24 sm:w-28 sm:h-28 mx-auto lg:mx-0 mb-5 shadow-lg ring-4 ring-gold-500/30" role="img" aria-label="Logo"></div>' +
          '<h1 class="font-arabic text-4xl sm:text-5xl font-bold text-emerald-900 dark:text-emerald-300 mb-2" dir="rtl">الملخص الفقهي</h1>' +
          '<p class="text-lg sm:text-xl text-slate-800 dark:text-slate-100 font-semibold">Al-Moulakhkhas Al-Fiqhi</p>' +
          '<p class="text-slate-600 dark:text-slate-400 font-medium mb-4">Cheykh Sâlih Al-Fawzân</p>' +
          '<p class="text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 text-[15px] leading-relaxed">Résumé de jurisprudence islamique, traduit en français et organisé par livres et par chapitres. Lecture confortable sur téléphone, tablette et ordinateur, marque-pages et reprise automatique, même hors ligne.</p>' +
        '</section>' +
        '<section class="card p-5 sm:p-6" id="lecture-card">' +
          '<div class="flex items-baseline justify-between"><h2 class="font-bold text-lg text-emerald-950 dark:text-emerald-300">Ma lecture</h2><span class="text-sm font-bold text-gold-600 dark:text-gold-400">' + pct + ' %</span></div>' +
          '<div class="meter mt-3"><i style="width:' + pct + '%"></i></div>' +
          '<p class="mt-2.5 text-sm text-slate-600 dark:text-slate-400"><b class="text-slate-800 dark:text-slate-100">' + n + '</b> chapitre' + (n > 1 ? 's' : '') + ' lu' + (n > 1 ? 's' : '') + ' sur ' + flat.length + ' · <b class="text-slate-800 dark:text-slate-100">' + marks.length + '</b> marque-page' + (marks.length > 1 ? 's' : '') + '</p>' +
          resume +
          '<div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800" id="offline-box"></div>' +
          '<div class="mt-3"><button class="linkish" data-toggle-reset="1">Réinitialiser ma lecture</button>' +
            '<div id="home-reset" class="hidden mt-2"><div class="reset-block space-y-1" data-ctx="home"></div></div></div>' +
        '</section>' +
      '</div>' +
      '<h2 class="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">Les livres</h2>' +
      '<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 items-start" id="books">' +
        BOOKS.map(function (b) {
          var r = bookRead(b), p = b.chapters.length ? Math.round(r / b.chapters.length * 100) : 0;
          return '<article class="card p-4 sm:p-5">' +
            '<a href="' + bookUrl(b) + '" class="flex items-start justify-between gap-3 group">' +
              '<div class="min-w-0"><span class="badge">Livre ' + b.id + '</span>' +
              '<h3 class="mt-2 text-[17px] font-bold leading-snug text-emerald-950 dark:text-emerald-300 group-hover:text-gold-600">' + esc(b.titleFr) + '</h3></div>' +
              '<span class="font-arabic text-xl text-emerald-800 dark:text-emerald-400 shrink-0" dir="rtl">' + esc(b.titleAr) + '</span></a>' +
            '<div class="mt-3 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400"><div class="meter flex-1"><i style="width:' + p + '%"></i></div><span class="shrink-0">' + r + '/' + b.chapters.length + ' lu' + (r > 1 ? 's' : '') + '</span></div>' +
            '<details class="mt-3"><summary class="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 py-1"><span class="chev text-[10px] text-gold-600">▶</span>' + b.chapters.length + ' chapitre' + (b.chapters.length > 1 ? 's' : '') + '</summary>' +
              '<div class="mt-1 divide-y divide-slate-100 dark:divide-slate-800/60">' + chapterList(b, true) + '</div></details>' +
          '</article>';
        }).join('') +
      '</section>';
    renderResetBlocks(); updateOfflineUI(); updateProgress();
  }

  /* ---------- page d'un livre ---------- */
  function renderBook() {
    var b = BOOKS.filter(function (x) { return x.id === CUR_BOOK; })[0];
    if (!b) { $('#main').innerHTML = '<p>Livre introuvable.</p>'; return; }
    var prev = BOOKS.filter(function (x) { return x.id === b.id - 1; })[0];
    var next = BOOKS.filter(function (x) { return x.id === b.id + 1; })[0];
    var r = bookRead(b), p = b.chapters.length ? Math.round(r / b.chapters.length * 100) : 0;
    document.title = b.titleFr + ' — Al-Moulakhkhas Al-Fiqhi';
    $('#main').innerHTML =
      '<nav aria-label="Fil d\'Ariane" class="text-xs font-medium text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-1.5"><a href="' + ROOT + 'index.html" class="hover:underline">Accueil</a> <span>›</span> <span class="font-bold text-slate-900 dark:text-white truncate">' + esc(b.titleFr) + '</span></nav>' +
      '<article class="card p-5 sm:p-9">' +
        '<span class="badge">Livre ' + b.id + ' sur ' + BOOKS.length + '</span>' +
        '<h1 class="mt-3 text-2xl sm:text-4xl font-bold leading-tight text-slate-900 dark:text-white">' + esc(b.titleFr) + '</h1>' +
        '<h2 class="text-3xl sm:text-4xl font-arabic text-emerald-800 dark:text-emerald-400 text-right mt-2" dir="rtl">' + esc(b.titleAr) + '</h2>' +
        '<div class="mt-4 mb-5 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400"><div class="meter flex-1"><i style="width:' + p + '%"></i></div><span class="shrink-0">' + r + '/' + b.chapters.length + ' lu' + (r > 1 ? 's' : '') + '</span></div>' +
        '<div class="divide-y divide-slate-100 dark:divide-slate-800/60">' + chapterList(b, false) + '</div>' +
      '</article>' +
      '<div class="mt-5 grid grid-cols-2 gap-3">' +
        (prev ? '<a href="' + bookUrl(prev) + '" class="card p-3 hover:border-gold-500 block"><span class="text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-400">← Livre précédent</span><span class="block font-semibold text-sm leading-snug line-clamp-2">' + esc(prev.titleFr) + '</span></a>' : '<span></span>') +
        (next ? '<a href="' + bookUrl(next) + '" class="card p-3 hover:border-gold-500 block text-right"><span class="text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-400">Livre suivant →</span><span class="block font-semibold text-sm leading-snug line-clamp-2">' + esc(next.titleFr) + '</span></a>' : '') +
      '</div>';
  }

  /* ---------- page d'un chapitre ---------- */
  function renderChapter() {
    var f = byKey('sub-' + CUR_ID);
    if (!f) { $('#main').innerHTML = '<p>Chapitre inconnu : vérifiez data-id et sommaire.js.</p>'; return; }
    var titleFr = f.ch.titleFr, titleAr = f.ch.titleAr;
    document.title = titleFr + ' — Al-Moulakhkhas Al-Fiqhi';
    var tpl = document.getElementById('chapter-content');
    var extra = tpl ? tpl.innerHTML : '';

    $('#main').innerHTML =
      '<div class="mb-4 flex items-center justify-between gap-3">' +
        '<nav aria-label="Fil d\'Ariane" class="min-w-0 text-xs font-medium text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">' +
          '<a href="' + ROOT + 'index.html" class="hidden sm:inline hover:underline">Accueil</a><span class="hidden sm:inline">›</span>' +
          '<a href="' + bookUrl(f.book) + '" class="truncate hover:underline">‹ ' + esc(f.book.titleFr) + '</a></nav>' +
        '<div class="flex items-center gap-2 shrink-0">' +
          '<div class="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden text-slate-700 dark:text-slate-200">' +
            '<button id="f-dec" class="w-11 h-10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30" aria-label="Réduire le texte">A−</button>' +
            '<button id="f-inc" class="w-11 h-10 text-base font-bold border-l border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30" aria-label="Agrandir le texte">A+</button></div>' +
          '<button id="bm-btn" class="btn hidden md:inline-flex"></button>' +
          '<button id="read-btn" class="btn hidden md:inline-flex"></button>' +
        '</div>' +
      '</div>' +
      '<article class="card px-5 py-7 sm:px-10 sm:py-10">' +
        '<header class="pb-6 mb-7 border-b border-slate-200 dark:border-slate-800">' +
          '<a href="' + bookUrl(f.book) + '" class="badge !normal-case !tracking-normal">Livre ' + f.book.id + ' · ' + esc(f.book.titleFr) + '</a>' +
          '<h1 class="mt-3 font-serif text-[1.65rem] sm:text-4xl font-bold leading-tight text-slate-900 dark:text-white">' + esc(titleFr) + '</h1>' +
          (titleAr ? '<h2 class="mt-2 text-2xl sm:text-3xl font-arabic text-emerald-800 dark:text-emerald-400 text-right leading-relaxed" dir="rtl">' + esc(titleAr) + '</h2>' : '') +
        '</header>' +
        '<div id="prose" class="prose-fiqh">' + extra + '</div>' +
        '<div class="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">' +
          '<p class="text-sm text-slate-600 dark:text-slate-400">Fin du chapitre.</p>' +
          '<button id="read-btn2" class="btn !py-3"></button>' +
        '</div>' +
      '</article>' +
      '<div id="chap-nav" class="mt-5 grid grid-cols-2 gap-3"></div>';

    enhance($('#prose')); paintMarks();
    $('#f-inc').addEventListener('click', function () { setFont(1); });
    $('#f-dec').addEventListener('click', function () { setFont(-1); });
    setFont(0);
    $('#bm-btn').addEventListener('click', addMark); $('#bm-fab').addEventListener('click', addMark);
    $('#mb-bm').addEventListener('click', addMark);
    function toggleRead() {
      read[f.key] = !read[f.key]; if (!read[f.key]) delete read[f.key];
      store.set('fiqh_read_status', read); toolbar(); renderSidebar();
      toast(read[f.key] ? 'Chapitre marqué comme lu.' : 'Chapitre marqué comme non lu.');
    }
    $('#read-btn').addEventListener('click', toggleRead);
    $('#read-btn2').addEventListener('click', toggleRead);
    $('#mb-read').addEventListener('click', toggleRead);
    toolbar(); renderChapterNav(f);
    trackReading(f.key);
  }

  /* mise en forme du contenu : puces, tableaux défilants */
  function enhance(root) {
    $$('p', root).forEach(function (p) {
      var n = p.firstChild;
      if (n && n.nodeType === 3 && /^\s*⁕\s/.test(n.nodeValue)) {
        n.nodeValue = n.nodeValue.replace(/^\s*⁕\s+/, '');
        var s = document.createElement('span'); s.className = 'bul'; s.textContent = '⁕';
        p.insertBefore(s, p.firstChild); p.classList.add('has-bul');
      }
    });
    $$('table', root).forEach(function (t) {
      if (t.parentNode.classList.contains('tbl-wrap')) return;
      var w = document.createElement('div'); w.className = 'tbl-wrap';
      t.parentNode.insertBefore(w, t); w.appendChild(t);
    });
  }

  function toolbar() {
    var key = 'sub-' + CUR_ID, nb = markCount(key), bm = nb > 0, rd = !!read[key];
    var b = $('#bm-btn'), r = $('#read-btn'), r2 = $('#read-btn2');
    if (!b) return;
    b.className = 'btn hidden md:inline-flex ' + (bm ? 'btn-gold' : '');
    b.textContent = '🔖 Marquer ce passage' + (nb ? ' (' + nb + ')' : '');
    r.className = 'btn hidden md:inline-flex ' + (rd ? 'btn-ok' : '');
    r.textContent = rd ? '✓ Lu' : 'Marquer comme lu';
    r2.className = 'btn !py-3 ' + (rd ? 'btn-ok' : 'btn-primary');
    r2.textContent = rd ? '✓ Chapitre lu (annuler)' : '✓ Marquer comme lu';
    var fab = $('#bm-fab'); if (fab) fab.innerHTML = '<span class="text-lg leading-none">🔖</span><span>Marquer ce passage' + (nb ? ' (' + nb + ')' : '') + '</span>';
    var mb = $('#mb-bm'), mr = $('#mb-read');
    if (mb) { mb.innerHTML = '<span class="text-lg leading-none">🔖</span><span>Marquer' + (nb ? ' (' + nb + ')' : '') + '</span>'; mb.classList.toggle('text-gold-600', bm); }
    if (mr) { mr.innerHTML = '<span class="text-lg leading-none">' + (rd ? '✓' : '○') + '</span><span>' + (rd ? 'Lu' : 'Marquer lu') + '</span>'; mr.classList.toggle('text-emerald-600', rd); }
  }

  function renderChapterNav(f) {
    var i = flat.indexOf(f), p = null, n = null, k;
    for (k = i - 1; k >= 0; k--) if (isAvail(flat[k].key)) { p = flat[k]; break; }
    for (k = i + 1; k < flat.length; k++) if (isAvail(flat[k].key)) { n = flat[k]; break; }
    window.__prev = p ? p.url : null; window.__next = n ? n.url : null;
    var box = $('#chap-nav'); if (!box) return;
    box.innerHTML =
      (p ? '<a href="' + p.url + '" class="card p-3.5 hover:border-gold-500 block"><span class="text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-400">← Précédent</span><span class="block font-semibold text-sm leading-snug mt-0.5 line-clamp-3">' + esc(p.ch.titleFr) + '</span></a>' : '<span></span>') +
      (n ? '<a href="' + n.url + '" class="card p-3.5 hover:border-gold-500 block text-right !bg-emerald-800 !border-emerald-800 text-gold-300"><span class="text-[11px] uppercase tracking-wide opacity-80">Suivant →</span><span class="block font-semibold text-sm leading-snug mt-0.5 line-clamp-3 text-white">' + esc(n.ch.titleFr) + '</span></a>'
         : '<a href="' + bookUrl(f.book) + '" class="card p-3.5 hover:border-gold-500 block text-right"><span class="text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-400">Terminé →</span><span class="block font-semibold text-sm mt-0.5">Retour au livre</span></a>');
    var mp = $('#mb-prev'), mn = $('#mb-next');
    if (mp) { if (p) { mp.href = p.url; mp.classList.remove('opacity-30', 'pointer-events-none'); } else mp.classList.add('opacity-30', 'pointer-events-none'); }
    if (mn) { mn.href = n ? n.url : bookUrl(f.book); }
  }

  /* barre de progression, position de lecture mémorisée */
  function trackReading(key) {
    var ticking = false, saveT;
    function ratio() { var h = document.documentElement.scrollHeight - window.innerHeight; return h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0; }
    function upd() {
      ticking = false;
      var r = ratio(), bar = $('#progress-bar'); if (bar) bar.style.width = (r * 100) + '%';
      clearTimeout(saveT);
      saveT = setTimeout(function () {
        if (r > 0.01) pos[key] = Math.round(r * 1000) / 1000; else delete pos[key];
        store.set('fiqh_pos', pos);
      }, 400);
    }
    last = { key: key, t: Date.now() }; store.set('fiqh_last', last);
    var p = pos[key];
    var restore = function () {
      var bmId = new URLSearchParams(location.search).get('bm'), bmk = bmId && marks.filter(function (m) { return m.id === bmId; })[0], bel = bmk && locate(bmk);
      if (bel) {
        window.scrollTo({ top: bel.getBoundingClientRect().top + window.scrollY - 84, behavior: 'instant' });
        bel.classList.add('bm-flash'); setTimeout(function () { bel.classList.remove('bm-flash'); }, 3200);
        toast('Passage marqué retrouvé.');
      } else if (p > 0.02 && !location.hash) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: p * h, behavior: 'instant' });
        toast('Reprise là où vous en étiez (' + Math.round(p * 100) + ' %).', 'Revenir au début', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
      }
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
      upd();
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(restore, 30); }); else restore();
  }

  /* ---------- événements globaux ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-reset],[data-reset-yes],[data-reset-no],[data-toggle-reset],[data-bm-del],[data-bm-add],[data-offline-dl],a.footnote-ref');
    if (!t) return;
    if (t.matches('a.footnote-ref')) { if (showNote(t)) e.preventDefault(); return; }
    if (t.hasAttribute('data-reset')) { pending = t.getAttribute('data-reset'); renderResetBlocks(); }
    else if (t.hasAttribute('data-reset-no')) { pending = null; renderResetBlocks(); }
    else if (t.hasAttribute('data-reset-yes')) doReset(t.getAttribute('data-reset-yes'));
    else if (t.hasAttribute('data-toggle-reset')) { pending = null; $('#home-reset').classList.toggle('hidden'); renderResetBlocks(); }
    else if (t.hasAttribute('data-bm-del')) removeMark(t.getAttribute('data-bm-del'));
    else if (t.hasAttribute('data-bm-add')) addMark();
    else if (t.hasAttribute('data-offline-dl')) { off.state = 'busy'; off.done = 0; off.total = flat.length; updateOfflineUI(); swPost({ type: 'cache-all' }); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { hideNote(); if (panelOpen()) closePanel(); closeSidebar(); return; }
    if (PAGE !== 'chapter' || e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ''))) return;
    if (e.key === 'b' || e.key === 'B') { addMark(); return; }
    if (e.key === 'ArrowLeft' && window.__prev) location.href = window.__prev;
    if (e.key === 'ArrowRight' && window.__next) location.href = window.__next;
  });

  /* ---------- démarrage ---------- */
  function renderAll() {
    renderSidebar();
    if (PAGE === 'home') renderHome();
    else if (PAGE === 'book') renderBook();
    else if (PAGE === 'chapter') { var f = byKey('sub-' + CUR_ID); if (f) renderChapterNav(f); }
  }

  shell();
  renderSidebar();
  var cur = $('#cur-item'); if (cur) { var tc = $('#toc'); tc.scrollTop = cur.offsetTop - tc.clientHeight / 3; }
  if (PAGE === 'home') renderHome();
  else if (PAGE === 'book') renderBook();
  else if (PAGE === 'chapter') renderChapter();
  renderPanel();
  startOffline();

  loadAvailability().then(function (m) { AVAIL = m; if (m) renderAll(); });
})();
