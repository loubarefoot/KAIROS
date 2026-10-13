const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
test('manifest identity and all entry/icon paths stay inside the published Training path', () => {
  const base = 'https://loubarefoot.github.io/KAIROS/Training/';
  const manifestURL = new URL('manifest.webmanifest', base);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest')));
  assert.equal(new URL(manifest.id, new URL(manifest.start_url, manifestURL).origin).href, base);
  assert.equal(new URL(manifest.start_url, manifestURL).href, base);
  assert.equal(new URL(manifest.scope, manifestURL).href, base);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.name, 'KAIROS Training');
  for (const icon of manifest.icons) {
    assert.ok(new URL(icon.src, manifestURL).href.startsWith(base));
    assert.ok(fs.existsSync(path.join(root, icon.src)));
  }
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /rel="manifest" href="manifest.webmanifest"/);
  assert.match(html, /name="apple-mobile-web-app-capable" content="yes"/);
  assert.match(html, /name="apple-mobile-web-app-title" content="Training"/);
  assert.match(html, /rel="apple-touch-icon" sizes="180x180" href="icons\/apple-touch-icon.png"/);
});
test('home-screen icons are opaque PNGs in the required native dimensions', () => {
  for (const [name, size] of [['icon-192.png',192], ['icon-512.png',512], ['apple-touch-icon.png',180]]) {
    const bytes = fs.readFileSync(path.join(root, 'icons', name));
    assert.equal(bytes.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), size);
    assert.equal(bytes.readUInt32BE(20), size);
    assert.equal(bytes[25], 2); // RGB, no alpha: iOS owns the corner mask.
  }
});

test('unchanged shell rules retain Weight parity; the document minimum is the explicit exception', () => {
  const weight = fs.readFileSync(path.join(root, '../Weight/index.html'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.equal(html.match(/<meta name="viewport"[^>]+>/)[0], weight.match(/<meta name="viewport"[^>]+>/)[0]);
  for (const selector of ['html,body','html::-webkit-scrollbar,body::-webkit-scrollbar','#scrollArea::-webkit-scrollbar','.wrap','.tabbar']) {
    const rule = weight.slice(weight.indexOf(selector + '{')).split('}')[0] + '}';
    assert.ok(css.includes(rule), selector);
    assert.equal(css.split(selector + '{').length - 1, 1, selector);
  }
  assert.ok(!css.includes('scroll-padding-bottom'));
  assert.ok(html.indexOf('</main>') < html.indexOf('<nav class="tabbar"'));
});
