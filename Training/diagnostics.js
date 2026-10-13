(() => {
  'use strict';
  // Unique identifier for this temporary diagnostic build based on published main.
  const BUILD = 'training-compact-diagnostics-1 (Basis feae196, Shell v14)';
  const lastScroll = new Map();
  const history = [];
  const liveButton = document.getElementById('diagnostics-live');
  const liveDialog = document.getElementById('diagnostics-live-dialog');
  const liveReport = document.getElementById('diagnostics-live-report');
  const liveStatus = document.getElementById('diagnostics-live-status');
  if (!liveButton || !liveDialog || !liveReport || !liveStatus) return;
  let scrollTimer;
  const describe = element => !element ? 'unbekannt' : element.id ? '#' + element.id : element.tagName.toLowerCase();
  document.addEventListener('scroll', event => {
    const element = event.target === document ? document.scrollingElement : event.target;
    if (liveDialog.open) return;
    if (element instanceof Element) lastScroll.set(describe(element), {scrollTop: element.scrollTop, scrollLeft: element.scrollLeft, time: new Date().toISOString(), section: document.querySelector('.view:not([hidden])')?.id || 'unbekannt'});
    record('Scroll-Ereignis');
    clearTimeout(scrollTimer); scrollTimer = setTimeout(()=>record('Nach Scrollen (120 ms Ruhe)'),120);
  }, true);
  function dimensions(element) {
    if (!element) return 'unbekannt';
    const style = getComputedStyle(element);
    return {element: describe(element), scrollTop: element.scrollTop, scrollLeft: element.scrollLeft,
      clientHeight: element.clientHeight, scrollHeight: element.scrollHeight, overflowY: style.overflowY,
      position: style.position, display: style.display};
  }
  function snapshot(trigger) {
    const viewport = window.visualViewport, nav = document.querySelector('.tabbar'), rect = nav?.getBoundingClientRect();
    const style = nav && getComputedStyle(nav);
    const visible = document.querySelector('.view:not([hidden])');
    const main = document.getElementById('main');
    return {
      measuredAt: new Date().toISOString(), measurement: trigger,
      diagnosticBuildFromLoadedJS: BUILD,
      visibleSection: {id: visible?.id || 'unbekannt', title: visible?.querySelector('h1')?.textContent || 'unbekannt'},
      documentHeight: document.scrollingElement?.scrollHeight ?? 'unbekannt',
      mainHeight: main?.getBoundingClientRect().height ?? 'unbekannt',
      sectionHeight: visible?.getBoundingClientRect().height ?? 'unbekannt',
      url: location.origin + location.pathname,
      standalone: {apple: typeof navigator.standalone === 'boolean' ? navigator.standalone : 'unbekannt', media: matchMedia('(display-mode: standalone)').matches},
      viewport: {innerHeight, clientHeight: document.documentElement.clientHeight,
        visualHeight: viewport?.height ?? 'unbekannt', offsetTop: viewport?.offsetTop ?? 'unbekannt', scale: viewport?.scale ?? 'unbekannt'},
      navigation: rect ? {top: rect.top, bottom: rect.bottom, height: rect.height, left: rect.left, right: rect.right,
        position: style.position, bottomCSS: style.bottom, paddingBottom: style.paddingBottom, background: style.backgroundColor,
        heightCSS: style.height, minHeightCSS: style.minHeight, transform: style.transform, boxSizing: style.boxSizing} : 'unbekannt',
      scroll: {windowX: scrollX, windowY: scrollY, documentScroller: describe(document.scrollingElement),
        containers: [document.scrollingElement, document.body, document.getElementById('scrollArea'), document.getElementById('main')].filter((e,i,a)=>e && a.indexOf(e)===i).map(dimensions),
        observedScrollingContainers: lastScroll.size ? Object.fromEntries(lastScroll) : 'unbekannt – noch kein Scroll-Ereignis beobachtet'},
      focus: describe(document.activeElement)
    };
  }
  function record(trigger) {
    if (liveDialog.open) return;
    history.push(snapshot(trigger));
    if (history.length > 24) history.shift();
  }
  window.addEventListener('kairos-training-viewchange',()=>{
    record('Nach Ansichtswechsel (sofort)');
    requestAnimationFrame(()=>record('Nach Ansichtswechsel (Layout)'));
  });
  window.addEventListener('pageshow',()=>requestAnimationFrame(()=>record('pageshow (Layout)')));
  window.visualViewport?.addEventListener('resize',()=>record('VisualViewport resize'));
  window.visualViewport?.addEventListener('scroll',()=>record('VisualViewport scroll'));
  record('Diagnose geladen – sichtbare Startansicht');
  requestAnimationFrame(()=>record('Startansicht (Layout)'));
  function askWorker(worker) {
    if (!worker) return Promise.resolve({present: false, version: 'unbekannt'});
    return new Promise(resolve => {
      const channel = new MessageChannel();
      let done = false;
      const finish = info => {
        if (done) return; done = true; clearTimeout(timer); channel.port1.close(); channel.port2.close();
        resolve({present: true, scriptURL: worker.scriptURL, state: worker.state, ...info});
      };
      const timer = setTimeout(()=>finish({version: 'unbekannt', reason: 'Keine Diagnoseantwort vom tatsächlich abgefragten Worker'}),1500);
      channel.port1.onmessage = event => {
        const value = event.data;
        if (value?.type !== 'KAIROS_TRAINING_DIAGNOSTICS' || typeof value.version !== 'string' || value.scriptURL !== worker.scriptURL) return;
        finish({version: value.version, scope: value.scope, cacheName: value.cacheName,
          expectedStylesheetFileSHA256: value.expectedStylesheetSHA256});
      };
      try { worker.postMessage({type:'KAIROS_TRAINING_DIAGNOSTICS'},[channel.port2]); }
      catch { finish({version:'unbekannt',reason:'Worker-Nachricht nicht möglich'}); }
    });
  }
  async function stylesheet() {
    // Read the stylesheet already in the CSSOM. Never refetch CSS to infer a loaded version.
    const link = document.querySelector('link[rel=stylesheet]');
    const sheet = Array.from(document.styleSheets).find(item=>item.href===link?.href);
    if (!sheet) return {version:'unbekannt',reason:'Geladenes Stylesheet nicht gefunden'};
    try {
      const rules = Array.from(sheet.cssRules,rule=>rule.cssText);
      let marker = 'unbekannt';
      for (const rule of sheet.cssRules) {
        const value = rule.style?.getPropertyValue('--kairos-training-css-build').trim();
        if (value) marker = value.replace(/^"|"$/g,'');
      }
      const bytes = new TextEncoder().encode(JSON.stringify(rules));
      const digest = await crypto.subtle.digest('SHA-256',bytes);
      return {versionFromLoadedRules:marker, url:sheet.href,
        loadedCSSOM_SHA256:Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join(''),
        checksumMeaning:'SHA-256 von JSON der geladenen CSS-Regeln; kein Hash der ursprünglichen Datei-Bytes'};
    } catch { return {version:'unbekannt',reason:'CSS-Regeln oder SHA-256 nicht zugänglich'}; }
  }
  let sequence = 0;
  async function update(values) {
    const id = ++sequence;
    values.recentMeasurements = history.slice();
    liveStatus.textContent = 'Worker und geladenes Stylesheet werden geprüft …';
    liveReport.value = JSON.stringify(values,null,2);
    const controller = navigator.serviceWorker?.controller;
    let registration;
    try { registration = await navigator.serviceWorker?.getRegistration(location.href); } catch { /* unknown below */ }
    const [css, controlling, active, waiting] = await Promise.all([
      stylesheet(), askWorker(controller),
      registration ? askWorker(registration.active) : {present:'unbekannt',version:'unbekannt'},
      registration ? askWorker(registration.waiting) : {present:'unbekannt',version:'unbekannt'}
    ]);
    if (id !== sequence) return;
    values.stylesheet = css;
    values.serviceWorker = {controller:controlling, registrationActive:active, waiting,
      registrationAvailable:!!registration,
      note:'controller steuert diese Seite. Erwarteter Datei-Hash vom Worker und geladener CSSOM-Hash sind unterschiedliche Messgrößen.'};
    liveReport.value = JSON.stringify(values,null,2);
    liveStatus.textContent = 'Aktualisiert. Die Geometrie stammt vom Messzeitpunkt oben. Keine Trainingsdaten enthalten.';
  }
  async function copyReport(field, message) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(field.value);
      message.textContent='Diagnose kopiert. Du kannst sie jetzt in den Chat einfügen.';
    } catch {
      field.focus(); field.select(); field.setSelectionRange(0,field.value.length);
      message.textContent='Bitte den markierten Bericht über das iPhone-Auswahlmenü kopieren.';
    }
  }
  document.getElementById('diagnostics-live-copy').addEventListener('click',()=>copyReport(liveReport,liveStatus));
  let liveSnapshot;
  liveButton.addEventListener('pointerdown',()=>{liveSnapshot=snapshot('Direktdiagnose vor Fokus-/Fensterwechsel');});
  liveButton.addEventListener('click',()=>{
    const values=liveSnapshot || snapshot('Direktdiagnose vor Fensterwechsel');liveSnapshot=null;
    liveStatus.textContent='Worker und geladenes Stylesheet werden geprüft …';
    update(values);liveDialog.showModal();
  });
})();
