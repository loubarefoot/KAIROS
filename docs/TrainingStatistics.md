# Trainingsstatistik – Training v26 (vorbereitet)

Auftrag 77, Basis v25 `6f014ef5717f05b78372d5bb8dd0e280cc198196`.
Arbeitsbranch `fix/training-v26-statistics-ux`; kein Commit, Push oder Deployment.

## Navigation und Zeiträume

„Übersicht | Verlauf | Historie“ ist als primäre Navigation mit Unterstrich gestaltet.
Der kleinere Zeitraumfilter liegt darunter in einer eigenen, zurückhaltenden Gruppe.
7/30/90 Tage umfassen heute und die vorherigen 6/29/89 lokalen Kalendertage.
Einheiten werden anhand `startedAt` gefiltert; „Gesamt“ umfasst alle gespeicherten
Einheiten. Kennzahlen bleiben auf gespeicherte Einheiten begrenzt; die Historie
bleibt unabhängig vom Filter vollständig und nach Trainingsbeginn absteigend.

Jedes Diagramm zeigt den gesamten gewählten Zeitraum bis zum Ende des heutigen
Kalendertages. Bei Gesamt reicht die Zeitachse vom ersten bis zum letzten belegten
Kalendertag. Auch Tage ohne Training bleiben im Zeitraum enthalten. Bei 7 Tagen
werden alle sieben Tage beschriftet; längere Zeiträume erhalten wenige,
überschneidungsfreie Datumsbeschriftungen. Alle echten Messpunkte bleiben erhalten.
SVGs passen sich der verfügbaren Kartenbreite an, auch bei Rotation; es gibt
keine horizontalen Diagramm-Scrollbereiche oder neuen Bibliotheken.

## Diagramme und exakte Werte

- **Kalenderwochen:** Montag bis Sonntag, ISO-8601-Wochennummer mit zugehörigem
  ISO-Wochenjahr. Leere Wochen innerhalb des Zeitraums erhalten die berechnete
  Anzahl 0, keine belegte Woche entfällt. Ganzzahlige Y-Skala, Zahlen über Balken
  bei genügend Platz. Tabelle: KW | Woche ab | Einheiten. Randwochen zählen nur
  Einheiten innerhalb des Filters.
- **Trainingsdauer:** gespeicherte `durationMs` in Minuten; Y-Achse ab 0. Beim
  Antippen wird die tatsächliche gespeicherte Dauer als Stunden:Minuten:Sekunden gezeigt.
- **Gewicht:** nur abgeschlossene Übungen mit zuverlässigem historischem Gewicht.
  Dynamische Y-Grenzen mit Randabstand, kg direkt an den Skalenwerten. Kleine
  Veränderungen bleiben sichtbar, konstante Werte ergeben eine horizontale Linie.
  Es werden keine zusätzlichen Messungen oder Zwischenwerte erzeugt.

Antippen zeigt Datum und tatsächlichen Wert. Pfeiltasten sowie die eingeblendeten
Vor-/Zurück-Schaltflächen machen dicht beieinanderliegende oder zeitgleiche
Messungen einzeln erreichbar. Gewichts-/Dauertabellen enthalten auch Uhrzeiten,
so bleiben mehrere Einheiten desselben Tages nachvollziehbar. Alle Werte stehen
weiterhin in der aufklappbaren Datentabelle.

## Native Übungsauswahl

v25 ersetzte beim `change`-Ereignis das gesamte Statistik-DOM und fokussierte das
neu erstellte Select. v26 lässt das native Select und seine Optionen unverändert
im DOM; nur die Gewichtskarte wird aktualisiert. Es gibt keinen expliziten Fokus,
keinen Blur-/Open-Trick und kein eigenes Dropdown. Unveränderte Hintergrund-Renders
ersetzen das Statistik-DOM ebenfalls nicht. Chromium prüft DOM-Identität und
fehlende erneute Fokusereignisse; das native iOS-Pickerfenster selbst ist damit
nicht nachgewiesen und muss auf dem iPhone geprüft werden.

## Wiederaufnahme und 15-Minuten-Regel

Bei Rückkehr nach weniger als 15 Minuten bleibt die zuletzt geöffnete Ansicht
erhalten, auch bei einem laufenden Training oder einem Tageswechsel. Statistik
behält Unterbereich, Zeitraum, Übung und gegebenenfalls die geöffnete Historieneinheit.
Bei mindestens 15 Minuten Abwesenheit beginnt die App auf der Trainingsübersicht;
eine laufende Einheit bleibt dort fortsetzbar. Ein fertiges, noch nicht gespeichertes
Training behält Vorrang mit dem vorhandenen Abschlussdialog.

Die bestehende 60-Minuten-Inaktivitätsregel der aktiven Trainingslogik bleibt
unverändert; die 15-Minuten-Regel verwirft keine Daten und berührt keinen Status.
Planentwürfe durchlaufen bei notwendigem Verlassen weiterhin Speichern/Verwerfen/
Abbrechen. Bei kurzer Rückkehr bleiben ihre Formularfelder erhalten.

Die Anzeigeauswahl liegt im Speicher und zusätzlich optional unter
`kairos.training.ui.v26` in `sessionStorage` des Tabs. Sie erweitert weder Schema 1
noch Backups, globale Gewichte oder Session-Snapshots. Ein Reload im selben Tab
kann die Ansicht innerhalb von 15 Minuten wiederherstellen. Blockierter
Tab-Speicher beeinträchtigt die Rückkehr im noch lebenden Dokument nicht. Ein
vollständig neuer App-/Browser-Tab ohne diesen Anzeigestand nutzt die bestehende
Start-/Aktivtrainingslogik; eine Wiederherstellung nach Betriebssystem-Beendigung
ist vom Erhalt des Tab-Speichers abhängig.

## Historische Daten und altes Gewichtsfeld

Die Statistik liest ausschließlich `completedSessions`: `id`, `startedAt`,
`durationMs`, `planName` sowie geordnete `exercises` mit `id`, `name`, `weightKg`,
`isMax` und `status`. Spätere Plan-/Namens-/Gewichtsänderungen ergänzen oder ändern
keine historischen Informationen. Gewicht 0 ist gültig, `null` ist unbekannt.

Das frühere MAX-Konzept ist nicht mehr sichtbar. Alte `isMax`-Felder und gespeicherte
Zahlen bleiben unverändert kompatibel. Bei `isMax: true` ist die Zahl möglicherweise
nur ein früherer Zahlenwert; die Statistik zeichnet sie deshalb weiterhin nicht
als Messung und zeigt in der Historie „Gewicht nicht verfügbar“. Auch Fehlertexte
enthalten keinen alten Modusnamen mehr. Keine MAX-Auswahl wird angeboten.
Es gibt keine Migration und keine Änderung an Gewichtsspeicherung oder Training.

## Schutz und Offline-Version

Bytegleich zu v25 bleiben Weight, `index.html`, `styles.css`, `session.js`,
`management.js`, `library.js`, `diagnostics.js`, Manifest, Icons und
`docs/IOSNavigation.md`. In `data.js` ändert sich ausschließlich ein Fehlertext.
`navigation.js` und die Lifecycle-Anbindung in `app.js` enthalten die ausdrücklich
beauftragte Ansichts-Wiederaufnahme. Session-Verhalten, v24-Überspringen/Abschluss,
Import/Export, Snapshots, globale Gewichte, v23-Scrollreset, v13-Mindesthöhe,
Viewport und Bottom Navigation bleiben erhalten. Das künstliche Scrollen kurzer
Seiten wird nicht bearbeitet.

Worker v26 enthält weiterhin 16 lokale, SHA-256-geprüfte Shell-Dateien. Scope,
Cache-Schutz und wartender Versionswechsel bleiben unverändert.

## Prüfung

```sh
node --test Training/tests/*.test.cjs
TZ=Europe/Berlin node Training/tests/statistics.test.cjs
KAIROS_PLAYWRIGHT_MODULE=/pfad/zu/playwright-core node Training/tests/statistics-ux-browser.cjs
```

Browserprüfungen verwenden lokale Server und temporäre Profile. Die neue Prüfung
umfasst 0/120 Einheiten, alle Zeiträume, Breiten 320/390/430/844, nicht überlappende
Achsen, dynamische und konstante Gewichte, Antippwerte, Dropdown-Identität,
Reload-/Sperr-Rückkehr, blockierten UI-Speicher, exakt 15 Minuten sowie einen
vollständigen Offline-Prozessneustart mit unveränderten Trainingsdaten.
Physisches iPhone, Safari-Picker und Home-Screen-App bleiben als Gerätetest offen.

## Ergebnis der Umsetzung (16.10.2026)

- 100 Einzeltests in 14 Node-Testdateien bestanden, darunter neue Prüfungen für
  vollständige Zeiträume, dynamische Skalen, ISO-Wochen und die 15-Minuten-Grenze.
  Die Statistiktests liefen auch mit `TZ=Europe/Berlin` über Zeitumstellung und Jahreswechsel.
- Alle 16 Browser-Skripte erfolgreich: statistics, statistics-ux, skipped, completion,
  training-logic, pwa, scroll, audit, diagnostics, active-ui, design, ui, ux, polish,
  plan-editor und plan-editor-regression. Der umfangreiche Abschlusslauf benötigt
  eine ausreichend lange Testlaufzeit; ein 90-Sekunden-Gesamtlimit wurde überschritten,
  der vollständige Lauf mit 180-Sekunden-Limit bestand.
- Neue mobile Prüfung: 0/120 Einheiten, alle Zeiträume, sieben Tagesbeschriftungen,
  keine Überläufe oder überlappenden Datumsangaben an 320/390/430/844 px, ganzzahlige
  Wochen, exakte Gewichts-/Dauer-/Wochenwerte und konstante Gewichte bestätigt.
- Native Select-Identität, fehlender programmatischer Wiederfokus, kurze Rückkehr,
  gleicher-Tab-Reload, blockierter UI-Speicher, genau 15 Minuten und unveränderte
  aktive/historische/globale Trainingsdaten bestätigt. Gerätetest bleibt offen.
- Bestehende Regressionen öffnen nach programmatischer Session-Erzeugung das Training
  nun ausdrücklich über „Fortsetzen“, statt einen automatischen Ansichtswechsel
  vorauszusetzen. Lifecycle-Tests simulieren tatsächliche Zeitabwesenheit; die
  Regeln für Entwürfe, Inaktivität und abgeschlossene Sessions bleiben geprüft.
- PWA-Update/Erstinstallation, Offline-Prozessneustart, Export/Import und Weight
  bestanden. Alle 16 Shell-Dateien stimmen mit den v26-SHA-256-Prüfsummen überein.
- JavaScript-Syntax und `git diff --check` bestanden. Schutzdateien bytegleich zu
  v25; in `data.js` ausschließlich der sichtbare Fehlertext geändert.
- HEAD bleibt v25; sämtliche v26-Änderungen sind uncommittet und unveröffentlicht.
