let assets = [

    "/", 
    "index.html",
    "weisheit.html",
    "geistliches.html",
    "tools.html",
    "/js/app.js",
    "OneSignalSDKWorker.js",
    "/css/style.css",
    "manifest.json",
];

const cacheTypes = ['main', "font", "image"];
const cacheVersion = "_v1";

self.addEventListener("install",(event)=> {
    console.log("SW install");
    self.skipWaiting();
event.waitUntil(
      caches.open(cacheTypes[0] + cacheVersion).then((cache) => {
        cache.addAll(assets);
    })
  );
});

function putInCache(request, response) {
    let cacheKey  = cacheTypes.includes(request.destination) 
    ? request.destination 
    : "main";
    caches.open(cacheKey + cacheVersion).then(cache => {
        cache.put(request, response);
    })
}

async function cacheFirst(request) {
let responseFromCache = await caches.match(request);
if (responseFromCache){
    return responseFromCache;
}

let responseFromNetwork = await fetch(request);
putInCache(request, responseFromNetwork.clone());
return responseFromNetwork;
}

async function networkFirst(request) {
    try {
        let responseFromNetwork = await fetch(request);
        putInCache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    }
    catch {
        const responseFromCache = await caches.match(request);
        if (responseFromCache) {
            return responseFromCache;
        }
    }
}

self.addEventListener("fetch",(event)=> {
//console.log(event.request);
let response = '';
switch (event.request.destination){
    case "font": 
    response = cacheFirst(event.request); 
    break;
    case "image": 
    response = networkFirst(event.request); 
    break;
    default: 
    response = networkFirst(event.request); 
}
event.respondWith(response);
});

async function deleteOldCaches(){
    let cacheKeepList = [];
    cacheTypes.forEach(element => {
        cacheKeepList.push(element + cacheVersion);
    });

    let keyList = await caches.keys();
    let cacheToDelete = keyList.filter((key) => !cacheKeepList.includes(key));

    await Promise.all( 
        cacheToDelete.map(key => {
        caches.delete(key);
        })
    );
}

self.addEventListener("activate",(event) => {
    event.waitUntil(
        deleteOldCaches().then(() => {
        clients.claim();
    })
    );
});
deleteOldCaches()