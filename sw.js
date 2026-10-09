const CACHE_NAME = 'gameverse-v1';
const ASSETS = [
    './',
    './index.html',
    './lobby.html',
    './game.html',
    './drawing.html',
    './profile.html',
    './settings.html',
    './leaderboard.html',
    './style.css',
    './icons.js',
    './app.js',
    './games.js',
    './uno.js',
    './i18n.js',
    './music.js',
    './manifest.json'
];

// ============ Install ============
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS).catch(err => console.log('Cache add failed:', err)))
            .then(() => self.skipWaiting())
    );
});

// ============ Activate ============
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// ============ Fetch ============
self.addEventListener('fetch', e => {
    // تجاهل الطلبات غير GET
    if (e.request.method !== 'GET') return;
    
    // تجاهل Firebase requests (لأنها ديناميكية)
    if (e.request.url.includes('firebase') || 
        e.request.url.includes('googleapis') ||
        e.request.url.includes('gstatic')) {
        return;
    }
    
    e.respondWith(
        caches.match(e.request).then(cached => {
            const networkFetch = fetch(e.request).then(res => {
                if (res && res.ok && e.request.url.startsWith(self.location.origin)) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                }
                return res;
            }).catch(() => cached);
            
            return cached || networkFetch;
        })
    );
});

// ============ Message ============
self.addEventListener('message', e => {
    if (e.data === 'SKIP_WAITING') self.skipWaiting();
});