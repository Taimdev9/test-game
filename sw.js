const CACHE_NAME = 'gameverse-v1';
const ASSETS = [
    './', './index.html', './lobby.html', './game.html', './drawing.html',
    './profile.html', './settings.html', './leaderboard.html',
    './style.css', './icons.js', './app.js', './games.js', './uno.js',
    './i18n.js', './music.js', './manifest.json'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then(cached => {
            const network = fetch(e.request).then(res => {
                if (res.ok && e.request.url.startsWith(self.location.origin)) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                }
                return res;
            }).catch(() => cached);
            return cached || network;
        })
    );
});