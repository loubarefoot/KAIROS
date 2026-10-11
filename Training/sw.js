'use strict';
// Bump VERSION whenever any shell file changes. Keep the previous worker until
// the new complete shell is installed and all old controlled pages are closed.
const VERSION = 'v1';
const PREFIX = 'kairos-training-shell:' + self.registration.scope + ':';
const CACHE = PREFIX + VERSION;
const FILES = ['index.html', 'styles.css', 'data.js', 'library.js', 'management.js', 'session.js', 'navigation.js', 'app.js'];
const HASHES = {
  "index.html": "d97b39a2e42c7727e20e4c223e254c47364de0d48e7e04b2b3f9ce490566e59b",
  "styles.css": "7b93637ae9de8b7d31b645bc65b04169ead1bdb400cb7cccf50edd909cec53c0",
  "data.js": "aa685260a76757deedd7323abd90daad037498f0d6913921483c08422711775b",
  "library.js": "f27ed498f9c4a22bc1e6e2ea223aa8806441acf62776f0a583a45a48fd5dfbc8",
  "management.js": "9f7bb93151aa2330df0a4c87ea6c9186091ed10abf36917e45aab50f2ce2f9b3",
  "session.js": "d94d1f3aa71bdb6f99d21fb132a15ed5c27ee70ee93e6d5180fc954cc71792bd",
  "navigation.js": "33219a21f3155bba44028fbdf3628486f35f68b5223b84c3497592b49358b883",
  "app.js": "f441bb1bbd509d6cee793cd1c071aaef6033674d057901f0bedbad13ce25c6b6"
};
const urls = FILES.map(file => new URL(file, self.registration.scope).href);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const responses = await Promise.all(urls.map(async url => {
      const response = await fetch(new Request(url, {cache: 'reload'}));
      const type = response.headers.get('content-type') || '';
      const expected = url.endsWith('.html') ? /text\/html/i : url.endsWith('.css') ? /text\/css/i : /(?:javascript|ecmascript)/i;
      if (!response.ok || response.redirected || !expected.test(type)) throw new Error('Incomplete Training shell: ' + url);
      // Read the whole body now: truncated network responses must fail installation.
      const body = await response.arrayBuffer();
      if (!body.byteLength) throw new Error('Empty Training shell: ' + url);
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', body)), byte => byte.toString(16).padStart(2, '0')).join('');
      if (digest !== HASHES[FILES[urls.indexOf(url)]]) throw new Error('Corrupt or mismatched Training shell: ' + url);
      const headers = new Headers(response.headers); headers.delete('content-encoding'); headers.delete('content-length');
      return new Response(body, {status: response.status, statusText: response.statusText, headers});
    }));
    const cache = await caches.open(CACHE);
    try { await Promise.all(urls.map((url, i) => cache.put(url, responses[i]))); }
    catch (error) { await caches.delete(CACHE); throw error; }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const complete = await Promise.all(urls.map(url => cache.match(url)));
    if (complete.some(response => !response)) throw new Error('Incomplete Training cache');
    await Promise.all((await caches.keys()).filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
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
    const cache = await caches.open(CACHE);
    const response = await cache.match(navigation ? urls[0] : shellURL);
    return response || fetch(request);
  })());
});
