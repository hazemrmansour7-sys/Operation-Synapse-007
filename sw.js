/* Operation Synapse offline cache. Bump VERSION when any file changes. */
var VERSION = "synapse-v1";
var FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== VERSION; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  if(e.request.mode === "navigate"){
    e.respondWith(caches.match("index.html").then(function(hit){
      return hit || fetch(e.request);
    }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function(hit){
    return hit || fetch(e.request).then(function(res){
      if(res && res.ok && new URL(e.request.url).origin === location.origin){
        var copy = res.clone(); caches.open(VERSION).then(function(c){ c.put(e.request, copy); });
      }
      return res;
    });
  }));
});
