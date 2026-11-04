/* Service worker : lecture hors ligne du site Al-Moulakhkhas Al-Fiqhi.
   - les fichiers du site sont servis depuis le cache puis mis à jour en arrière-plan ;
   - toutes les pages listées dans assets/sommaire.js sont téléchargées pour la lecture hors ligne
     (automatiquement à la première visite, puis une fois par jour, ou via le bouton de l'accueil). */
const VERSION = 'fiqh-v3';
const BASE = new URL('./', self.location).href;
let running = false;

const CORE = ['./', 'index.html', 'assets/site.css', 'assets/app.js', 'assets/sommaire.js', 'assets/logo.png', 'manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.all(CORE.map((u) => cache.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    try { // polices citées par le CSS
      const css = await (await cache.match('assets/site.css')).text();
      const fonts = [...new Set([...css.matchAll(/url\((?:["']?)(fonts\/[^)"']+)/g)].map((m) => m[1]))];
      await Promise.all(fonts.map((f) => cache.add(new Request('assets/' + f)).catch(() => {})));
    } catch (err) {}
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
    cacheAll();
  })());
});

async function notify(msg) {
  for (const c of await self.clients.matchAll({ includeUncontrolled: true })) c.postMessage(msg);
}

async function pageUrls() {
  const urls = [BASE + 'index.html'];
  try {
    const txt = await (await fetch(BASE + 'assets/sommaire.js', { cache: 'reload' })).text();
    const w = {}; new Function('window', txt)(w);
    (w.SOMMAIRE || []).forEach((b) => {
      urls.push(BASE + 'kitab-' + b.id + '/index.html');
      b.chapters.forEach((c) => urls.push(BASE + 'kitab-' + b.id + '/sub-' + c.id + '.html'));
    });
  } catch (err) {}
  return urls;
}

async function cacheAll() {
  if (running) return; running = true;
  try {
    const cache = await caches.open(VERSION);
    const urls = await pageUrls();
    let done = 0, cached = 0, i = 0;
    await notify({ type: 'cache-progress', done, total: urls.length });
    const worker = async () => {
      while (i < urls.length) {
        const u = urls[i++];
        try {
          const r = await fetch(u, { cache: 'reload' });
          if (r.ok) { await cache.put(u, r); cached++; }
        } catch (err) {}
        done++;
        if (done % 10 === 0 || done === urls.length) await notify({ type: 'cache-progress', done, total: urls.length });
      }
    };
    await Promise.all([worker(), worker(), worker(), worker(), worker()]);
    await notify({ type: 'cache-progress', done: urls.length, total: urls.length, cached, finished: true });
  } finally { running = false; }
}

self.addEventListener('message', (e) => { if (e.data && e.data.type === 'cache-all') e.waitUntil(cacheAll()); });

const OFFLINE_PAGE = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hors ligne</title><body style="font-family:system-ui;max-width:30rem;margin:4rem auto;padding:0 1rem;text-align:center;color:#00263f"><h1>Page indisponible hors ligne</h1><p>Cette page n\'a pas encore été téléchargée. Reconnectez-vous une fois à Internet, puis ouvrez l\'accueil pour finir le téléchargement.</p><p><a href="' + BASE + 'index.html">Retour à l\'accueil</a></p>';

self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(BASE)) return;
  if (req.method === 'HEAD') { // test de disponibilité : répondre depuis le cache d'abord
    e.respondWith((async () => {
      if (await caches.match(req.url, { ignoreMethod: true, ignoreSearch: true })) return new Response(null, { status: 200 });
      return fetch(req).catch(() => Response.error());
    })());
    return;
  }
  if (req.method !== 'GET') return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then((r) => { if (r && r.ok) cache.put(req, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const r = await net;
    if (r) return r;
    if (req.mode === 'navigate') return new Response(OFFLINE_PAGE, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    return Response.error();
  })());
});
