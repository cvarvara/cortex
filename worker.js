'use strict';


const CACHE_VERSION = '0.0.1';
const CACHE_NAME = 'cache_' + CACHE_VERSION;


self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/',
                '/cortex.js',
                '/favicon.png',
                '/index.html',
                '/main.js',
                '/reset.css',
                '/style.css',
                '/utils.js',
                '/worker.js'
            ]).then(() => self.skipWaiting());
        })
    );
});


self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});


self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(CACHE_NAME)
            .then(cache => cache.match(event.request, {ignoreSearch: true}))
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
