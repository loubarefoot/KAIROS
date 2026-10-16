# Trainingsstatistik V1 – Training v25

Auftrag 73/75, Basis v24 `00f7f6d140ff1612e9635d329d970f47fdef3af1`.
Arbeitsbranch `feat/training-statistics-v1`; kein Commit, Push oder Deployment.

## Bedienung und Berechnung

Die Hauptnavigation enthält Training, Statistik und Einstellungen. Statistik hat
Übersicht, Verlauf und Historie. Ein Tabwechsel beendet oder verändert kein Training.
Die bestehende Inaktivitätsregel bleibt wirksam. Neue Ansichten beginnen oben; Wrapper,
Dokument-Scroll, iOS-v13-Mindesthöhe und 80-Pixel-Tabbar bleiben unverändert.

Die Übersicht zählt gespeicherte Einheiten (auch teilweise abgeschlossene), summiert
`durationMs`, mittelt die bekannten Dauern und zählt Übungsstatus `completed` und
`skipped`. Eine aktive oder verworfene Einheit wird nicht mitgezählt. Ohne Einheiten
stehen die Zähler und Gesamtzeit auf null; ein Durchschnitt ist nicht verfügbar.

7/30/90 Tage umfassen den heutigen lokalen Kalendertag und die vorherigen 6/29/89
Tage bis zum aktuellen Zeitpunkt, zugeordnet anhand `startedAt`. Gesamt umfasst alle
Einheiten. Die Historie ist unabhängig vom Filter vollständig, neueste Starts zuerst.
Gleiche Startzeiten behalten ihre gespeicherte Reihenfolge; unbekannte Daten stehen hinten.

Die drei Diagramme verwenden lokale SVGs ohne Bibliotheken oder Netzwerkzugriff:

- Häufigkeit je Kalenderwoche (Montag bis Sonntag); dargestellt sind Wochen mit
  Training, beschriftet mit Wochenbeginn. Der Zeitraumfilter gilt vor Gruppierung,
  Randwochen können daher unvollständig sein.
- Trainingsdauer in Minuten pro gespeichertem Trainingsbeginn.
- Historisches Gewicht in kg pro abgeschlossener Übung, nach stabiler Übungs-ID.
  Die Auswahl stammt aus allen gespeicherten Snapshots, der Verlauf aus dem Filter.
  Umbenennungen bleiben dieselbe Übung, gelöschte Übungen bleiben auswählbar.
  Gleichnamige unterschiedliche IDs erhalten in der Auswahl eine laufende Nummer.

Große Reihen lassen sich horizontal wischen. „Daten anzeigen“ öffnet eine Tabelle
mit sämtlichen exakten Datums- und Zahlenwerten; Einzelmessungen bleiben sichtbar.

## Historische Daten und Grenzen

Es werden ausschließlich `completedSessions` gelesen: `id`, `startedAt`, `durationMs`,
`planName` sowie das geordnete `exercises`-Array mit `id`, `name`, `weightKg`, `isMax`
und `status`. Die Detailansicht zeigt die ursprüngliche Reihenfolge und alle drei
Status einschließlich offener Übungen. Aktuelle Pläne und globale Gewichte werden
weder abgefragt noch zum Ergänzen historischer Informationen verwendet.

`weightKg: null` bedeutet nicht verfügbar. Bei `isMax: true` zeigt die Historie MAX;
der Zahlenwert kann nur das letzte numerische Gewicht sein und wird deshalb nicht
gezeichnet. Gewicht null ist unbekannt, Gewicht 0 ist ein gültiger Messwert.
Snapshots dokumentieren keine einzelnen Sätze, Wiederholungszeitpunkte oder
Gewichtsänderungen innerhalb einer Übung; dargestellt wird der gespeicherte Endstand.

Das unveränderte Schema 1 verlangt für gültige alte/importierte Einheiten bereits
Zeit, Dauer, Plannamen und vollständige Übungs-Snapshots. Ungültige oder fremde
Backups bleiben durch den vorhandenen Import gesperrt. Die Statistik selbst behandelt
fehlende Angaben defensiv als nicht verfügbar; sie migriert oder repariert nichts.
Bei teilweise fehlenden Dauern zeigt sie den Hinweis, dass nur bekannte Dauern in
Summe und Durchschnitt enthalten sind. Fehlende Datumsangaben lassen sich keinem
begrenzten Zeitraum oder Diagramm zuordnen.

Der Statistik-Tab wird nicht als neue `settings.lastView`-Ausprägung persistiert;
er wird dort auf `start` abgebildet. Ein Neustart verwendet damit die vorhandene
Start-/Aktivtrainingslogik. Interne Statistik-Auswahl bleibt nur im aktuellen Dokument.

## Umsetzung und Schutzbereiche

Neue Dateien: `statistics.js` (reine Berechnungen), `statistics-ui.js`, `statistics.css`.
`app.js` enthält ausschließlich die Anbindung und Tabroute; `index.html` die neuen
lokalen Ressourcen, Statistik-Section und den dritten Tab. `sw.js` führt v25 mit
16 vollständig SHA-256-geprüften Shell-Dateien; Worker-Lebenszyklus bleibt unverändert.

Bytegleich zu v24: Weight, `styles.css`, `session.js`, `data.js`, `management.js`,
`navigation.js`, `library.js`, `diagnostics.js`, Manifest, Icons und `docs/IOSNavigation.md`.
Die bestehenden Trainingsansichten bleiben nach Herausrechnen der Statistik-Ergänzungen
bytegleich. Es gibt keine Änderung an Abschluss/Überspringen, Speicherung, globalen
Gewichten, historischen Snapshots, Import/Export oder Offline-Updateverfahren.

## Wiederholbare Prüfung

```sh
node --test Training/tests/*.test.cjs
KAIROS_PLAYWRIGHT_MODULE=/pfad/zu/playwright-core node Training/tests/statistics-browser.cjs
```

Die Browserprüfung verwendet einen lokalen HTTP-Server und isolierte temporäre
Profile. Screenshots liegen in `/workspace/work/`. Für PWA-/Weight-Regression wie
bisher `KAIROS_CHART_PATH` auf die unveränderte Chart.js 4.4.1-Testdatei setzen;
das ist keine neue App-Abhängigkeit.

Echte iPhone-/Safari- und installierte Home-Screen-Prüfungen werden durch Chromium
mit mobilen Viewports nicht ersetzt; diese Geräteprüfung bleibt offen.

## Ergebnis am 16.10.2026

- 94 Einzeltests in 14 Node-Testdateien bestanden, darunter sieben neue Statistiktests;
  Zeitraumgrenzen zusätzlich mit `TZ=Europe/Berlin` einschließlich Zeitumstellung geprüft.
- Alle 15 Browser-Skripte erfolgreich: statistics, skipped, completion, training-logic,
  pwa, scroll, audit, diagnostics, active-ui, design, ui, ux, polish, plan-editor und
  plan-editor-regression. Mobile Breiten bis hinunter zu 320 px, Einzelwerte und
  120 gespeicherte Einheiten geprüft; Berechnungen zusätzlich mit 1000 Einheiten.
- PWA: vollständiger Browser-Prozessneustart offline, Training fortsetzen/abschließen,
  Export/Import, fehlgeschlagenes Update und Erstinstallation mit 16 Dateien bestanden.
  Weight bleibt auf derselben Origin funktionsfähig und von Training-Daten getrennt.
- Historische Werte bleiben trotz globaler Umbenennung/Gewichtsänderung unverändert.
  Tabwechsel und Statistiknavigation verändern aktive Einheiten und Historie nicht.
- JavaScript-Syntax, SHA-256-Shellprüfung und `git diff --check` bestanden.
- Alte Testserver um die neuen lokalen Ressourcen ergänzt; Versions-/Dateizähler und
  die bisherige Zwei-Tab-Erwartung aktualisiert. Der alte Inaktivitätstest setzt die
  Uhr und den simulierten Speicherfehler jetzt atomar; wiederhergestellte Zusatzseiten
  werden im isolierten Neustart-Test geschlossen, damit sie nicht parallel schreiben.
- Keine bekannten offenen Implementierungsfehler. Native iOS-/Safari-Prüfung offen.
