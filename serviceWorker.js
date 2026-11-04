let assets = [
    "./", 
    "./index.html",
    "./manifest.json",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
];

const cacheTypes = ['main', "font", "image"];
const cacheVersion = "_v2";

self.addEventListener("install", (event) => {
    console.log("SW install");
    self.skipWaiting();
    event.waitUntil(
        caches.open(cacheTypes[0] + cacheVersion).then((cache) => {
            return cache.addAll(assets).catch(err => {
                console.log('Cache addAll error (ignored for offline):', err);
            });
        })
    );
});

function putInCache(request, response) {
    if (!response || response.status !== 200 || response.type !== 'basic') {
        return;
    }
    let cacheKey = cacheTypes.includes(request.destination) 
        ? request.destination 
        : "main";
    let responseClone = response.clone();
    caches.open(cacheKey + cacheVersion).then(cache => {
        cache.put(request, responseClone);
    });
}

async function cacheFirst(request) {
    let responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }
    try {
        let responseFromNetwork = await fetch(request);
        putInCache(request, responseFromNetwork);
        return responseFromNetwork;
    } catch (error) {
        return new Response("Netzwerkfehler beim Laden der Ressource.", { status: 408, headers: { "Content-Type": "text/plain" } });
    }
}

async function networkFirst(request) {
    try {
        let responseFromNetwork = await fetch(request);
        putInCache(request, responseFromNetwork);
        return responseFromNetwork;
    } catch (error) {
        const responseFromCache = await caches.match(request);
        if (responseFromCache) {
            return responseFromCache;
        }
        return new Response("Keine Internetverbindung.", { status: 503, headers: { "Content-Type": "text/plain" } });
    }
}

self.addEventListener("fetch", (event) => {
    let request = event.request;
    // Ignoriere externe API-Anfragen für Caching, um Live-Daten nicht zu blockieren
    if (request.url.includes('wp-json') || request.url.includes('github.io')) {
        event.respondWith(fetch(request).catch(() => caches.match(request)));
        return;
    }

    let response = '';
    switch (request.destination) {
        case "font": 
            response = cacheFirst(request); 
            break;
        case "image": 
            response = networkFirst(request); 
            break;
        default: 
            response = networkFirst(request); 
    }
    event.respondWith(response);
});

async function deleteOldCaches() {
    let cacheKeepList = [];
    cacheTypes.forEach(element => {
        cacheKeepList.push(element + cacheVersion);
    });

    let keyList = await caches.keys();
    let cacheToDelete = keyList.filter((key) => !cacheKeepList.includes(key));

    await Promise.all( 
        cacheToDelete.map(key => caches.delete(key))
    );
}

self.addEventListener("activate", (event) => {
    event.waitUntil(
        deleteOldCaches().then(() => {
            return clients.claim();
        })
    );
});
