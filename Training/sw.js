'use strict';
// Bump VERSION whenever any shell file changes. Keep the previous worker until
// the new complete shell is installed and all old controlled pages are closed.
const VERSION = 'v20';
const PREFIX = 'kairos-training-shell:' + self.registration.scope + ':';
const FILES = ['index.html', 'styles.css', 'data.js', 'library.js', 'management.js', 'session.js', 'navigation.js', 'app.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'diagnostics.js'];
const HASHES = {
  "index.html": "67d4a9b9322d1d3021e17f63587515a0869b750b8f0f6cde29e0759034209870",
  "styles.css": "c31a329dd537a9f3ce5baf0443d6c4f56a7411d4625848ba660cfcba19263ca6",
  "data.js": "3c5382203316fee0cbe9599f8f76fa8adba178e927b3a3ca466440cfe53b70ae",
  "library.js": "f27ed498f9c4a22bc1e6e2ea223aa8806441acf62776f0a583a45a48fd5dfbc8",
  "management.js": "1b51bff6a00150c1fb243d8e20c5355306dde7a6ad48817d0e2d67587240e1b7",
  "session.js": "0c99d25df7da2b72e2bd9a7f82b7cf4768ff2924e690c28b2ff1e333a778ef74",
  "navigation.js": "a99ea6e12e92ca54920211907a8811f7f9361f708d2d95efff68d07889d5f161",
  "app.js": "4f846c4fb0e117a900f7c9538a1be4f8612279a42137d59f2f4ee0e180003142",
  "manifest.webmanifest": "2c43aaf1be2d8ad29a7f938f12654d52ed60d72c22aee254b683ab443a9fa7bc",
  "icons/icon-192.png": "7b853e1539b7b5b4741f3d84b363a14f698d8263c4c2fb85de5af31d817c8bf1",
  "icons/icon-512.png": "0fabf101438a17bd21f91ef09f5b6aabfcea15b86f2b350bbfe128f25e5856ac",
  "icons/apple-touch-icon.png": "d1077412ad73e2af11a0f35693be48f4363d20a7aae8748768515be76506ecd9",
  "diagnostics.js": "4be24e0730a502ac390ee4d1ca879481bcefb408fd0a1c5c093f9a328cd9b1fe"
};
// Deterministic across worker restarts, distinct for every shell content set.
const cacheName = crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(HASHES))).then(buffer => PREFIX + VERSION + ':' + Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join(''));
const urls = FILES.map(file => new URL(file, self.registration.scope).href);
self.addEventListener('message', event => {
  if (event.data?.type !== 'KAIROS_TRAINING_DIAGNOSTICS' || !event.ports[0]) return;
  event.waitUntil(cacheName.then(name => event.ports[0].postMessage({
    type: 'KAIROS_TRAINING_DIAGNOSTICS', version: VERSION,
    scriptURL: self.location.href, scope: self.registration.scope,
    cacheName: name, expectedStylesheetSHA256: HASHES['styles.css']
  })));
});
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
