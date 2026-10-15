# Verbindliche iOS-PWA-Navigationshülle

Die in Training v13 bestätigte Lösung ist die Referenz für neue KAIROS-Module. Bestehende Module, insbesondere Weight, werden dadurch nicht nachträglich umgebaut. Änderungen an dieser Hülle benötigen einen eigenen Auftrag und einen Praxistest in der installierten iPhone-PWA.

## Tatsächlicher Aufbau

Quelle: `Training/index.html`, `Training/styles.css` und `Training/app.js`. Der Viewport verwendet `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`; die Apple-Web-App-Metadaten aktivieren den Standalone-Betrieb mit `black-translucent` Statusleiste. `#scrollArea` umschließt `main.wrap` und die Inhaltsansichten. Die feste Bottom Navigation steht außerhalb dieses Inhaltsbereichs.

Die maßgeblichen Regeln lauten unverändert:

```css
html,body { height:100%; margin:0; }
#scrollArea {
  box-sizing:content-box;
  min-height:100vh;
  min-height:max(100%,100svh,100dvh,100lvh);
  overflow-y:auto;
  overflow-x:hidden;
  -webkit-overflow-scrolling:touch;
  overscroll-behavior-y:contain;
  scrollbar-width:none;
  -ms-overflow-style:none;
  padding-top:env(safe-area-inset-top,0px);
  padding-bottom:80px;
}
.wrap { max-width:520px; margin:0 auto; padding:20px 16px 24px; }
.tabbar {
  position:fixed; left:0; right:0; bottom:0; z-index:10;
  display:flex;
  background:var(--surface);
  border-top:1px solid var(--border);
  padding-bottom:0;
  height:80px;
  box-sizing:border-box;
}
```

Dies ist ein Auszug, kein vollständiges Stylesheet: Hintergrundfarben, ausgeblendete WebKit-Scrollleisten sowie die bestehenden Tab-Regeln gehören ebenfalls zur Referenz. Die Tab-Geschwisterregel `.tab + .tab { margin-top:0; }` verhindert insbesondere, dass die allgemeine Button-Abstandsregel die Navigation versetzt.

## Warum die Mindesthöhe entscheidend ist

Der Inhalt muss auch auf kurzen Seiten mindestens den relevanten Viewport ausfüllen. `svh`, `dvh` und `lvh` beschreiben den kleinen, aktuellen und großen Viewport. Das Maximum hält die Mindesthöhe auch dann aufrecht, wenn iOS den dynamischen Viewport vorübergehend verkleinert. `100vh` ist der Fallback für Browser ohne Unterstützung der nachfolgenden Regel. Lange Inhalte dürfen natürlich wachsen; es wird keine feste Inhaltshöhe erzwungen.

Die globale `border-box`-Regel wird für `#scrollArea` ausdrücklich durch `content-box` überschrieben. Dadurch bleibt die Reserve von 80 Pixeln **zusätzlich** zur Mindesthöhe erhalten. Sie verhindert, dass der feste Navigationsbereich die letzten Inhalte verdeckt. Die obere Safe Area wird im Scrollbereich berücksichtigt. Die Navigation hat ihre bestehende Gesamthöhe von 80 Pixeln ohne zusätzliche untere Safe-Area-Zugabe. Diese Geometrie darf nicht durch ein zweites `env(safe-area-inset-bottom)` oder eine zusätzliche Navigationsreserve verändert werden.

Der Inhaltsbereich besitzt keine feste Höhe, die ihn zu einem strikt isolierten inneren Scrollfenster machen würde. Dokumenthöhe, Scrollbereich und feste Navigation wirken gemeinsam. Beim internen Ansichtswechsel setzt die App `#scrollArea.scrollTop` zurück; sie verschiebt weder die Navigation anhand von `visualViewport` noch setzt sie die Fensterposition pauschal mit `window.scrollTo` zurück. Touch-Navigation fokussiert keine Überschrift; bei Tastaturbedienung erfolgt der Überschriftenfokus mit `preventScroll`.

## Belegbare Fehlergeschichte und Grenzen

Vor v13 wurden auf dem iPhone ein schwarzer unterer Streifen und unerwünschtes Scrollen beobachtet. Die Versionen davor erprobten unter anderem eine feste `100dvh`-Flex-Hülle mit ausschließlich innerem Scrollen, Safe-Area-Anpassungen und explizite Fenster-Scrollkorrekturen. Diese Varianten sind keine gültigen Alternativen zur bestätigten Referenz. v13 (Commit `feae1962b1592f76e4dce1e22d282561052a87d4`) ergänzte die entscheidende Mindesthöhe einschließlich `content-box`. Die bestehende Struktur und die 80-Pixel-Navigation blieben erhalten.

Technisch aus dem Code belegbar sind die zuvor fehlende viewportfüllende Mindesthöhe auf kurzen Seiten und die Wirkung von Boxmodell und Navigationsreserve. Eine vollständige Ursachenbehauptung über interne WebKit-Compositing- oder Safe-Area-Fehler lässt sich daraus nicht ableiten. Die praktische Wirksamkeit der Referenz beruht auf dem bestätigten iPhone-Test. Desktop-Chromium und Touch-Emulation ersetzen keinen Test in einer installierten iOS-PWA, insbesondere bei Tastatur, Sperren/Entsperren und wechselnden Viewportgrößen.

## Typische Fehler vermeiden

- Keine feste `height:100dvh`-Flex-Hülle, zusätzlichen Scrollcontainer oder globalen `overflow:hidden`-Workarounds einführen.
- `content-box`, die vollständige `max(...)`-Mindesthöhe und die 80-Pixel-Reserve zusammen erhalten; nicht durch `height`, nur `dvh` oder `border-box` ersetzen.
- Keine zusätzlichen unteren Safe-Area-Abstände, Tabbar-Verschiebungen per JavaScript oder Fenster-Scrollkorrekturen hinzufügen.
- Globale Button-, Layout- oder Fokusregeln dürfen die Tabs nicht beeinflussen. Neue Komponenten lokal gestalten.
- Keine automatischen Eingabefokusse beim Öffnen einer Ansicht; keine vollständigen Formular-Neuaufbauten bei jedem Tastendruck.

## Checkliste für neue Module

1. Referenzstruktur, Viewport-Metadaten, Safe Area, Mindesthöhe, Boxmodell und Tab-Regeln übernehmen; Abweichungen ausdrücklich prüfen lassen.
2. Kurze, leere und lange Ansichten testen: Inhalt erreichbar, kein horizontaler Überlauf, Navigation unverrückt, letzte Aktion nicht verdeckt.
3. Wechsel zwischen Tabs und Einstellungen sowie Öffnen/Schließen von Formularen ohne automatische Tastatur prüfen.
4. Installierte iPhone-PWA mit sichtbarer Tastatur, nach App-Rückkehr und Sperren/Entsperren prüfen; Browser-Emulation ergänzend verwenden.
5. Geschützte Referenz beim Diff vergleichen und Offline-Shell-Prüfsummen nach freigegebenen Inhaltsänderungen aktualisieren.
