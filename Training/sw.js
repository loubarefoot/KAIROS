'use strict';
// Bump VERSION whenever any shell file changes. Keep the previous worker until
// the new complete shell is installed and all old controlled pages are closed.
const VERSION = 'v3';
const PREFIX = 'kairos-training-shell:' + self.registration.scope + ':';
const FILES = ['index.html', 'styles.css', 'data.js', 'library.js', 'management.js', 'session.js', 'navigation.js', 'app.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
const HASHES = {
  "index.html": "a1ad72967af3aaf4ed9f552eca58befc67b390d20d20daadde0d135bb68bded2",
  "styles.css": "7b93637ae9de8b7d31b645bc65b04169ead1bdb400cb7cccf50edd909cec53c0",
  "data.js": "8a76786514d6428921650ab976e6845d7b49615f5e265c2510c6e29cbef0416c",
  "library.js": "f27ed498f9c4a22bc1e6e2ea223aa8806441acf62776f0a583a45a48fd5dfbc8",
  "management.js": "9f7bb93151aa2330df0a4c87ea6c9186091ed10abf36917e45aab50f2ce2f9b3",
  "session.js": "beda560abb6ec0b112433cf3d8c564055099a6fcf7cc37437f9a0f635639bf75",
  "navigation.js": "33219a21f3155bba44028fbdf3628486f35f68b5223b84c3497592b49358b883",
  "app.js": "0d190cfc48fa781c61c97a4d7d99ebed02c13bf116f1276d11ef003b325c9c77",
  "manifest.webmanifest": "2c43aaf1be2d8ad29a7f938f12654d52ed60d72c22aee254b683ab443a9fa7bc",
  "icons/icon-192.png": "7b853e1539b7b5b4741f3d84b363a14f698d8263c4c2fb85de5af31d817c8bf1",
  "icons/icon-512.png": "0fabf101438a17bd21f91ef09f5b6aabfcea15b86f2b350bbfe128f25e5856ac",
  "icons/apple-touch-icon.png": "d1077412ad73e2af11a0f35693be48f4363d20a7aae8748768515be76506ecd9"
};
// Deterministic across worker restarts, distinct for every shell content set.
const cacheName = crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(HASHES))).then(buffer => PREFIX + VERSION + ':' + Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join(''));
const urls = FILES.map(file => new URL(file, self.registration.scope).href);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const responses = await Promise.all(urls.map(async url => {
      const response = await fetch(new Request(url, {cache: 'reload'}));
      const type = response.headers.get('content-type') || '';
      const expected = url.endsWith('.html') ? /^text\/html(?:;|$)/i
        : url.endsWith('.css') ? /^text\/css(?:;|$)/i
        : url.endsWith('.webmanifest') ? /^application\/(?:manifest\+json|json)(?:;|$)/i
        : url.endsWith('.png') ? /^image\/png(?:;|$)/i
        : /^(?:text|application)\/(?:javascript|ecmascript)(?:;|$)/i;
      if (!response.ok || response.redirected || !expected.test(type)) throw new Error('Incomplete Training shell: ' + url);
      // Read the whole body now: truncated network responses must fail installation.
      const body = await response.arrayBuffer();
      if (!body.byteLength) throw new Error('Empty Training shell: ' + url);
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', body)), byte => byte.toString(16).padStart(2, '0')).join('');
      if (digest !== HASHES[FILES[urls.indexOf(url)]]) throw new Error('Corrupt or mismatched Training shell: ' + url);
      const headers = new Headers(response.headers); headers.delete('content-encoding'); headers.delete('content-length');
      return new Response(body, {status: response.status, statusText: response.statusText, headers});
    }));
    const name = await cacheName;
    if ((await caches.keys()).includes(name)) {
      // A code-only worker update may reuse an already complete identical shell.
      const existing = await caches.open(name);
      const valid = await Promise.all(urls.map(async (url, i) => {
        const response = await existing.match(url);
        if (!response) return false;
        const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await response.arrayBuffer())), byte => byte.toString(16).padStart(2, '0')).join('');
        return digest === HASHES[FILES[i]];
      }));
      if (!valid.every(Boolean)) throw new Error('Existing Training cache is incomplete; it remains untouched');
      return;
    }
    const cache = await caches.open(name);
    try { await Promise.all(urls.map((url, i) => cache.put(url, responses[i]))); }
    catch (error) { await caches.delete(name); throw error; }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const name = await cacheName;
    const cache = await caches.open(name);
    const complete = await Promise.all(urls.map(url => cache.match(url)));
    if (complete.some(response => !response)) throw new Error('Incomplete Training cache');
    await Promise.all((await caches.keys()).filter(key => key.startsWith(PREFIX) && key !== name).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url), scope = new URL(self.registration.scope);
  if (request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  const shellURL = new URL(url.pathname, url.origin).href;
  const navigation = request.mode === 'navigate' && [scope.pathname, scope.pathname + 'index.html'].includes(url.pathname);
  if (!navigation && !urls.includes(shellURL)) return;
  event.respondWith((async () => {
    const name = await cacheName;
    const cache = await caches.open(name);
    const response = await cache.match(navigation ? urls[0] : shellURL);
    return response || fetch(request);
  })());
});
