// OneSignalSDKWorker.js
/*
self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('my-cache').then(function(cache) {
        return cache.addAll([
          'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDKWorker.js',
 //         'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js'
        ]);
      })
    );
  });

  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
   */
  self.addEventListener('push', function(event) {    
    var options = {
        body: event.data.text(),
        icon: '/img/icon-72x72.png',
    };
  
    event.waitUntil(
        self.registration.showNotification('Comboni Freunde', options)
    );
});
