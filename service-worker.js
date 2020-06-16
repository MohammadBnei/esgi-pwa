console.log('Service worker loaded');

const excludeFromCache = [
    'https://www.google.com/images/phd/px.gif',
    'http://localhost:3000/todos',
];

const cacheVersion = 'v1';

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(cacheVersion)
            .then(function (cache) {
                return cache.addAll([
                    // '/',
                    'index.html',
                    '/src/app.js',
                    '/src/localStorage/idb.js',
                    '/src/network.js',
                    '/src/views/home.js',
                    '/assets/styles/tailwind-import.css',
                    '/assets/styles/tailwind.css',
                ])
            })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', function (event) {
    const url = new URL(event.request.url);
    const link = `${url.origin}${url.pathname}`;

    if (event.request.method === 'GET' && !excludeFromCache.includes(link)) {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    clients
                    return response || fetch(event.request)
                        .then(function (response) {
                            const responseClone = response.clone();
                            caches.open(cacheVersion)
                                .then(function (cache) {
                                    cache.put(event.request, responseClone);
                                })

                            return response;
                        })
                })
                .catch(function () {
                    return caches.match('index.html');
                })
        );
    }
});

self.addEventListener('message', function (event) {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
