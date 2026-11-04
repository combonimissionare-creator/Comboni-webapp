let assets = [
    "./", 
    "./index.html",
    "./manifest.json",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
];

const cacheVersion = "_v3";

self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open("comboni_static" + cacheVersion).then((cache) => {
            return cache.addAll(assets).catch(err => console.log('Cache addAll error:', err));
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== "comboni_static" + cacheVersion) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    let request = event.request;

    // WICHTIG: Niemals WordPress-APIs, Proxies oder GitHub-Daten abfangen oder blockieren!
    if (request.url.includes('wp-json') || request.url.includes('allorigins.win') || request.url.includes('github.io') || request.url.includes('combonimission')) {
        return; 
    }

    // Für statische Dateien: Network first, fallback to cache
    event.respondWith(
        fetch(request).catch(() => {
            return caches.match(request);
        })
    );
});
