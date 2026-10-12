(() => {
  'use strict';
  // Unique identifier for this temporary diagnostic build based on published main.
  const BUILD = 'training-diagnostics-1 (Basis 55f1be8, Diagnose-Shell v6)';
  const panel = document.getElementById('diagnostics-panel');
  if (!panel) return;
  const report = document.getElementById('diagnostics-report');
  const status = document.getElementById('diagnostics-status');
  const refresh = document.getElementById('diagnostics-refresh');
  const lastScroll = new Map();
  const describe = element => !element ? 'unbekannt' : element.id ? '#' + element.id : element.tagName.toLowerCase();
  document.addEventListener('scroll', event => {
    const element = event.target === document ? document.scrollingElement : event.target;
    if (element instanceof Element) lastScroll.set(describe(element), {scrollTop: element.scrollTop, scrollLeft: element.scrollLeft, time: new Date().toISOString()});
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
    return {
      measuredAt: new Date().toISOString(), measurement: trigger,
      diagnosticBuildFromLoadedJS: BUILD,
      url: location.origin + location.pathname,
      standalone: {apple: typeof navigator.standalone === 'boolean' ? navigator.standalone : 'unbekannt', media: matchMedia('(display-mode: standalone)').matches},
      viewport: {innerHeight, clientHeight: document.documentElement.clientHeight,
        visualHeight: viewport?.height ?? 'unbekannt', offsetTop: viewport?.offsetTop ?? 'unbekannt', scale: viewport?.scale ?? 'unbekannt'},
      navigation: rect ? {top: rect.top, bottom: rect.bottom, height: rect.height, left: rect.left, right: rect.right,
        position: style.position, bottomCSS: style.bottom, paddingBottom: style.paddingBottom, background: style.backgroundColor} : 'unbekannt',
      scroll: {windowX: scrollX, windowY: scrollY, documentScroller: describe(document.scrollingElement),
        containers: [document.scrollingElement, document.body, document.getElementById('main')].filter((e,i,a)=>e && a.indexOf(e)===i).map(dimensions),
        observedScrollingContainers: lastScroll.size ? Object.fromEntries(lastScroll) : 'unbekannt – noch kein Scroll-Ereignis beobachtet'},
      focus: describe(document.activeElement)
    };
  }
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
    status.textContent = 'Worker und geladenes Stylesheet werden geprüft …';
    report.value = JSON.stringify(values,null,2);
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
    report.value = JSON.stringify(values,null,2);
    status.textContent = 'Aktualisiert. Die Geometrie stammt vom Messzeitpunkt oben. Keine Trainingsdaten enthalten.';
  }
  let pointerSnapshot;
  refresh.addEventListener('pointerdown',()=>{pointerSnapshot=snapshot('Antippen vor Fokus-/Tastaturwechsel');});
  refresh.addEventListener('click',()=>{const values=pointerSnapshot || snapshot('Aktualisieren');pointerSnapshot=null;update(values);});
  panel.addEventListener('toggle',()=>{if(panel.open) update(snapshot('Diagnose geöffnet'));});
  document.getElementById('diagnostics-copy').addEventListener('click',async()=>{
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(report.value);
      status.textContent='Diagnose kopiert. Du kannst sie jetzt in den Chat einfügen.';
    } catch {
      report.focus(); report.select(); report.setSelectionRange(0,report.value.length);
      status.textContent='Bitte den markierten Bericht über das iPhone-Auswahlmenü kopieren.';
    }
  });
})();
