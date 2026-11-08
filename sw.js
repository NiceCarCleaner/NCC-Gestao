const CACHE_NAME = 'ncc-gestao-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './css/variables.css',
    './css/style.css',
    './assets/icon-192.png',
    './assets/icon-512.png',
    './assets/apple-touch-icon.png',
    './assets/background.png',
    './assets/bg_watermark.png',
    './js/store.js',
    './js/services/ExportService.js',
    './js/components/Sidebar.js',
    './js/components/Dashboard.js',
    './js/components/Clients.js',
    './js/components/Services.js',
    './js/components/Schedule.js',
    './js/components/Billing.js',
    './js/components/Expenses.js',
    './js/components/Products.js',
    './js/components/DataView.js',
    './js/app.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Network-first strategy with cache fallback (ensures latest updates when online, works offline)
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
