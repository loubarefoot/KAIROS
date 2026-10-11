# Training – Datenmodell und lokale Speicherung

Technischer Stand des abgegrenzten Datenmodell-Schritts. Die Produktanforderungen in `KairosTraining.md` bleiben maßgeblich. Übungs- und Trainingsplanverwaltung sowie Bibliotheksinitialisierung sind implementiert. Aktiver Trainingsablauf und automatische Wiederaufnahme sind ebenfalls implementiert. Zeitmessung, endgültiger Trainingsabschluss, Zusammenfassung und Anzeige des letzten gespeicherten Trainings sind implementiert. JSON-Import/-Export ist implementiert. Offline-Caching ist noch nicht implementiert.

## Speicherung

`Training/data.js` stellt `KairosTrainingData` bereit. Ein gemeinsamer localStorage-Schlüssel `kairos.training.state` enthält logisch getrennte Bereiche als JSON mit `schemaVersion: 1`. Ein einzelner Schreibvorgang vermeidet teilweise gespeicherte Beziehungen zwischen Plänen und Übungen. Die Weight-Schlüssel `weightEntries` und `appSettings` werden weder gelesen noch geschrieben.

Beim Start lädt `app.js` den Store und zeigt Fehler als verständliche Meldung mit `role="alert"`. Ein fehlender Schlüssel ergibt zunächst einen leeren gültigen Zustand. Nur für diesen tatsächlich neuen Bestand initialisiert `app.js` die 52 verbindlichen Übungen aus `library.js` und speichert sie über denselben Store. Ein vorhandener gültiger Bestand wird auch dann nicht aufgefüllt oder ersetzt, wenn er leer ist. Beschädigte Bestände bleiben gesperrt. Nach einem fehlgeschlagenen Initialisierungsschreibvorgang bleiben die 52 Übungen einmalig im Arbeitsspeicher erhalten und können erneut gespeichert werden, ohne sie erneut anzulegen. Unbekannte Versionen werden gesperrt, nicht automatisch migriert.

## Strukturen

| Bereich | Felder und Bedeutung |
| --- | --- |
| `exercises` | Array aus `id`, `name`, `source` (`builtin` oder `custom`), `weightKg` (Zahl oder `null`), `isMax`, `repetitions` |
| `plans` | Array aus `id`, `name`, `description`, geordneten `exerciseIds`; leere Pläne sind zulässig |
| `planOrder` | Geordnetes Array aller Plan-IDs, jede genau einmal; unabhängig von der letzten Nutzung |
| `completedSessions` | Array mit `id`, `planId`, `planName`, `planDescription`, `startedAt`, `endedAt`, `durationMs` und geordneten Übungsmomentaufnahmen |
| `activeSession` | `null` oder Einheit mit denselben Plan-/Übungsmomentaufnahmen, `startedAt`, `endedAt: null`, `durationMs: null`, `currentIndex` |
| `settings` | `lastView`, `lastOpenedDay` (Datum oder `null`), `lastBackgroundAt` (Zeitstempel oder `null`); Vorbereitung der späteren Navigationsregeln |

Zeitstempel und Dauer verwenden Millisekunden. Eine Übungsmomentaufnahme enthält die Übungsfelder und `status` (`open`, `skipped`, `completed`). Historische Plan-/Übungs-IDs müssen nicht mehr in den aktuellen Stammdaten existieren. Namen und Gewichte bleiben dadurch auch nach Löschung rekonstruierbar. Die Speicherung berechnet keinen Timer. `session.js` startet eine Einheit mit einem unveränderten Startzeitstempel als Grundlage der Dauerberechnung.

IDs entstehen mit kryptografischer Zufallserzeugung und bleiben beim Laden unverändert. Übungsreferenzen im Plan und ihre Array-Reihenfolge sind verbindlich. Momentaufnahmen sind tiefe Kopien; `getState()` liefert ebenfalls eine Kopie.

`weightKg` speichert das letzte numerische Gewicht auch während `isMax: true`. So stellt das Ausschalten von MAX denselben Wert wieder her; bei zuvor leerem Gewicht bleibt `null` erhalten. 0 ist von `null` zu unterscheiden. `parseWeight()` akzeptiert Dezimalkomma/-punkt und nichtnegative Vielfache von 0,25 kg. Neue Übungen erhalten standardmäßig 10 Wiederholungen.

## Schnittstelle und Schutzregeln

- `createExercise()`, `createPlan()`, `createId()`, `snapshotExercises()` und `withMax()` liefern Datenobjekte, ohne Verwaltung oder Trainingsabläufe auszuführen.
- `createStore({ storage, onStatus })` erlaubt auch isolierte Tests mit einem simulierten Speicher. Im Browser wird localStorage verwendet.
- `load()` lädt und validiert; `getState()` liefert eine unabhängige Kopie; `getStatus()` meldet `loaded`, `blocked`, `dirty`, `isNew`, `message`.
- `update(change)` bearbeitet eine Kopie, validiert Struktur und Änderungsregeln, übernimmt gültige Änderungen in den Arbeitsspeicher und versucht zu speichern. `save()` kann einen fehlgeschlagenen Schreibvorgang erneut versuchen. Rückgaben kennzeichnen Fehler mit `ok: false`.
- Validierung prüft Schema, Typen, eindeutige Objekt-IDs, normalisierte Übungsnamen, Gewichtsschritte, Wiederholungen, Herkunft, Referenzen, Planreihenfolge, Übungsstatus, Zeitdaten und Ansichtseinstellungen.
- Bereits abgeschlossene Einheiten dürfen über `update()` weder verändert noch entfernt werden. Bestehende vorgefertigte Übungen dürfen nicht gelöscht oder in eigene Übungen umgewandelt werden. Namen, Übungsreihenfolge und Plan-Momentaufnahme derselben laufenden Einheit bleiben geschützt; Gewichts- und Statusänderungen bleiben für den späteren Trainingsablauf möglich.

## Fehler und Grenzen

Beschädigte Daten, unbekannte Schema-Versionen oder Lesefehler sperren Schreibzugriffe. Der ursprüngliche Speicherinhalt wird nicht bereinigt oder überschrieben. Bei Schreibfehlern bleibt die gültige Änderung im Arbeitsspeicher mit `dirty: true` erhalten. Eine Fehlermeldung weist darauf hin, die App nicht zu schließen. Erneutes Laden im selben Store verwirft keine ausstehenden Änderungen.

Vor dem Speichern wird der gelesene Speicherinhalt mit dem zuletzt geladenen bzw. gespeicherten Inhalt verglichen. Eine zwischenzeitliche Änderung durch einen anderen Tab sperrt das Überschreiben und erhält den lokalen Zustand. Dies ist ein Konfliktschutz, keine tabübergreifende Transaktion: absolut gleichzeitige Schreibzugriffe können mit localStorage allein nicht vollständig ausgeschlossen werden.

Bei Seitenneuladen oder Schließen können ausschließlich im Arbeitsspeicher befindliche Änderungen verloren gehen. Es gibt bewusst keine automatische Reparatur, Rücksetzung oder Migration. Der bestätigte JSON-Import verwendet einen gesonderten, expliziten Ersetzungspfad; die normale Änderungsfunktion schützt weiterhin abgeschlossene Einheiten.

## Prüfung

`node --test Training/tests/data.test.cjs` prüft Speicher-Roundtrip, IDs und Referenzen, Gewicht/MAX, Momentaufnahmen, Änderungsregeln, beschädigte und inkompatible Daten, Lese-/Schreibfehler, Wiederholung nach Speicherfehlern, externe Änderungen und Weight-Isolation. Zusätzlich wurden Navigation, Tastatur/Fokus, mobile Größen und die Fehlermeldung im Browser geprüft.

## Übungs- und Planverwaltung

`Training/management.js` verwendet ausschließlich `store.update()` für Erstellen, Bearbeiten, Löschen, Übungszuordnungen und Umsortieren. Kein zweiter Datenbestand wird geführt. Die Formulare in `app.js` halten lediglich noch nicht bestätigte Eingaben. Sämtliche Verwaltungsänderungen betreffen Stammdaten; laufende und abgeschlossene Momentaufnahmen bleiben unverändert.

Die Grundbibliothek ist in `library.js` mit exakt 52 Namen hinterlegt. Ein Test gleicht die vollständige Liste mit Abschnitt 8.1 der Produktdokumentation ab. `initializeLibrary()` ist nur einmal für einen fehlenden Schlüssel nach erfolgreichem Laden verfügbar. Bereits gespeicherte IDs und Bearbeitungen bleiben erhalten.

Die Start- und Trainingsansicht zeigen die manuelle Planreihenfolge und die tatsächliche Übungsanzahl. Nicht leere Pläne können eine Einheit starten. Leere Pläne sowie weitere Starts bei einer bereits laufenden Einheit sind deaktiviert und werden auch durch die Ablauflogik abgewiesen.

Plan- und Übungsreihenfolgen lassen sich über Pointer-Ziehgriffe mit Touch oder Maus sowie alternativ über Tastaturschaltflächen verändern. Eigene KAIROS-Dialoge bestätigen dauerhafte Löschungen; Entfernen aus einem Plan löscht keine Übungsstammdaten. MAX deaktiviert die numerische Eingabe, erhält aber den vorherigen numerischen oder leeren Wert zum Zurückwechseln.

Bei Schreibfehlern bleiben Formulare und der gültige ungespeicherte Store-Zustand erhalten. Eine Schaltfläche erlaubt einen erneuten Speicherversuch. Es wird kein Erfolg angezeigt, bevor der Speichervorgang erfolgreich war.

Zusätzliche Prüfung: `node Training/tests/management.test.cjs` testet Initialisierung, Verwaltungsoperationen, Bibliotheksschutz, Namens-/Gewichtsregeln, Zuordnungen, Reihenfolgen, Momentaufnahmen und Schreibfehler. Browserprüfungen decken Formulare, Dialoge, Pointer-Drag-and-Drop, Persistenz, mobile Breiten und den erneuten Speicherversuch ab.

## Aktiver Trainingsablauf

`Training/session.js` kapselt Trainingsstart, Abschließen, Überspringen, Auswahl offener Übungen und Gewichtseingabe über denselben Store. Ein Start erzeugt eine unabhängige Plan-/Übungsmomentaufnahme in Planreihenfolge und einen Startzeitstempel. Ein zweiter Start und ein Ersetzen der laufenden Einheit durch eine andere aktive ID sind gesperrt.

Nach Abschließen oder Überspringen folgt bevorzugt die nächste bisher offene Übung in Planreihenfolge. Sind diese durchlaufen, können übersprungene Übungen nachgeholt werden. Alle offenen bzw. übersprungenen Übungen sind explizit auswählbar; abgeschlossene Übungen werden gekennzeichnet. Die ursprüngliche Liste wird nicht umsortiert.

Fortschritt wird aus den Statuswerten berechnet: abgeschlossene Übungen geteilt durch Gesamtzahl, angezeigt als Anzahl und gerundeter Prozentwert. Überspringen erhöht den Fortschritt nicht. Bei 100 % bleibt die Einheit aktiv. Die Abschlussaktion öffnet einen KAIROS-Bestätigungsdialog. Erst ein ausdrücklich bestätigter und erfolgreich gespeicherter Abschluss beendet die Einheit.

Die Gewichtseingabe verändert Gewicht, MAX-Modus und Wiederholungszahl gemeinsam in der laufenden Übungsmomentaufnahme und der globalen Übung. Namen und ursprüngliche Übungsliste bleiben erhalten. Änderungen aus der Übungs-/Planverwaltung verändern die Momentaufnahme weiterhin nicht. Wurde eine eigene Übung während der Einheit bereits dauerhaft aus der Bibliothek gelöscht, bleibt sie in der Einheit bedienbar; eine globale Gewichtsänderung wird jedoch mit einer verständlichen Meldung abgewiesen, da das globale Objekt nicht mehr existiert. Es wird keine gelöschte Übung eigenständig wieder angelegt.

Nach Laden eines gültigen gespeicherten Zustands wird eine aktive Einheit direkt angezeigt. Ebenso führt die Rückkehr über `pageshow` oder aus dem Hintergrund über `visibilitychange` zur aktiven Ansicht. Das Training-Tab führt bei laufender Einheit stets dorthin. Startzeit, Position und Übungsstatus werden nicht zurückgesetzt. Die allgemeine Tages-/60-Minuten-Navigation ohne laufende Einheit bleibt ein späterer Schritt.

Jede Ablaufsänderung wird sofort lokal zu speichern versucht. Schreibfehler erhalten den aktuellen Zustand im Arbeitsspeicher, werden als Fehler angezeigt und können erneut gespeichert werden. Bei Neuladen wird nur der erfolgreich gespeicherte Zustand wiederhergestellt. Beschädigte Zustände werden gesperrt, nicht repariert oder überschrieben.

`node Training/tests/session.test.cjs` prüft Startregeln, Momentaufnahmen, Statusnavigation, Fortschritt, globale Gewichte, Persistenz und Speicherfehler. Browserprüfungen testen den aktiven Ablauf, Wiederaufnahme, MAX-/Gewichtseingabe, mobile Breiten und beschädigte Zustände.

## Zeitmessung und endgültiger Abschluss

Die Anzeige `HH:MM:SS` wird aus `Date.now() - startedAt` berechnet. Ein sekundlicher Anzeigeintervall zählt keine eigene Trainingszeit hoch und schreibt keine Sekundenstände in localStorage. Neuladen und Rückkehr aus dem Hintergrund verwenden denselben Startzeitstempel. Nach erfolgreichem Abschluss wird der Anzeigeintervall beendet.

`session.finish(expectedId)` erzeugt aus der aktiven Einheit einen abgeschlossenen Datensatz mit derselben stabilen Einheiten-ID, Startzeit, Endzeit, Dauer und unveränderten Plan-/Übungsmomentaufnahmen einschließlich der tatsächlichen Statuswerte. Es gibt keinen Mindestumfang und keinen automatischen Abschluss bei 100 %. Der Abschluss enthält keine Timer-/Pausen-Zusatzfunktionen.

Der neue Store-Pfad `commit(change)` validiert den möglichen Endzustand und schreibt ihn unter demselben Schlüssel. Erst nach erfolgreichem `setItem()` werden der Arbeitsspeicherzustand übernommen und die aktive Einheit entfernt. Bei einem Schreibfehler bleibt der vorherige aktive Zustand einschließlich bereits ungesicherter Änderungen erhalten. Es wird keine Zusammenfassung gezeigt und kein abgeschlossener Datensatz vorgetäuscht. Der Nutzer kann den Abschluss erneut bestätigen und versuchen; ein allgemeiner Speicherversuch allein beendet die Einheit nicht. Externe Speicheränderungen sperren auch diesen Pfad.

Die Abschlussbestätigung verwendet den bestehenden KAIROS-Dialog. Die Oberfläche verhindert parallele Bestätigungsabläufe; `expectedId`, die eindeutige Einheiten-ID und das Fehlen einer aktiven Einheit nach Erfolg verhindern doppelte Abschlüsse. Abbruch und Escape verändern keine Daten.

`getSavedState()` liefert eine unabhängige Kopie des zuletzt erfolgreich geladenen oder geschriebenen Bestands. Zusammenfassung und letztes Training verwenden ausschließlich dessen abgeschlossene Einheiten. Die Zusammenfassung zeigt Planname, Abschlussdatum, Dauer und abgeschlossene Übungen im Verhältnis zum Gesamtumfang. Die Rückkehr führt zur Trainingsübersicht. Die Startseite zeigt den Namen und das Abschlussdatum der zuletzt gespeicherten Einheit. Eine umfassende Historie oder Statistikansicht wird nicht ergänzt.

Die Zeitmessung folgt der Geräteuhr. Bei einem Endzeitpunkt vor dem gespeicherten Start wird der Abschluss mit einer verständlichen Meldung abgewiesen, statt eine negative Dauer zu speichern. Eine verstellte Geräteuhr kann die Dauer beeinflussen; es wird kein externer Zeitdienst eingeführt.

`node Training/tests/finish.test.cjs` prüft Formatierung, Zeitstempel/Wiederaufnahme, vorzeitigen und vollständigen Abschluss, Momentaufnahmen, Doppelabschluss, ausstehende Änderungen, Schreibfehler und Speicherkonflikte. Browserprüfungen mit kontrollierter Testuhr prüfen Zeitmessung nach Neuladen, Dialog/Abbruch, Speicherausfall und erneuten Abschluss, Zusammenfassung, letztes Training sowie mobile Darstellung.


## JSON-Backup

Die Backup-Ansicht exportiert den vollständigen aktuellen Training-Store mit Schema-Version 1: Übungen, Pläne, beide Reihenfolgen, abgeschlossene und laufende Einheiten samt Momentaufnahmen und Einstellungen. `exportJSON()` liest ausschließlich diesen Store, keine Weight-Schlüssel. Auch bei laufendem Training ist Export möglich. Noch nicht lokal gespeicherte Änderungen sind enthalten und werden in der Meldung ausdrücklich benannt. Der Download verwendet einen JSON-Blob und einen Dateinamen `kairos-training-YYYY-MM-DD.json`. Die Meldung bestätigt die Bereitstellung zum Speichern, nicht einen vom Browser nicht überprüfbaren Speichervorgang auf dem Gerät. Der Objekt-URL wird nach 60 Sekunden freigegeben, damit die native Dateiverarbeitung Zeit erhält.

Die native Dateiauswahl akzeptiert JSON-Dateien. `parseBackup()` prüft JSON (einschließlich optionaler UTF-8-BOM), Schema-Version, sämtliche bestehenden Struktur-/Werte-/Referenzregeln sowie erlaubte Felder auf jeder Objektebene. Unbekannte Felder werden abgewiesen; ein Weight-Datenbestand oder ein fremdes Dateiformat ist kein Training-Backup. Historische Referenzen dürfen weiterhin auf inzwischen gelöschte Stammdaten verweisen. Die Dateiendung bzw. der MIME-Typ allein gilt nicht als Validierung.

Erst nach erfolgreicher Prüfung öffnet sich der bestehende KAIROS-Bestätigungsdialog. Abbruch verändert keine Daten. `importJSON(text, { confirmed, expectedState })` prüft nochmals, blockiert bei einer aktiven Zieleinheit und schützt gegen Änderungen während Dateilesen/Bestätigung sowie externe Speicheränderungen. Ersetzt wird der gesamte Training-Bestand; dabei dürfen durch den ausdrücklich bestätigten Import auch bisherige abgeschlossene Einheiten ersetzt werden. Normale Bearbeitungen behalten ihre bisherigen Schutzregeln.

Der importierte Zustand wird zuerst in einem einzelnen `setItem()` unter dem bestehenden Schlüssel gespeichert. Erst nach Erfolg werden Arbeitsspeicher und Speicher-Baseline ersetzt. Bei Fehlern bleiben gespeicherter Bestand, ausstehende Änderungen und deren Dirty-Status erhalten. Ein erneuter allgemeiner Speicherversuch importiert die Datei nicht; der Nutzer muss den Import erneut bestätigen. Bereits aufgrund beschädigter/inkompatibler Daten oder Speicherkonflikten gesperrte Stores bleiben auch für Import gesperrt; es gibt keine automatische Reparatur.

Nach Erfolg werden veraltete Verwaltungsformulare geschlossen und alle Listen sowie letztes Training neu angezeigt. Eine importierte aktive Einheit wird direkt fortgesetzt. Ohne aktive Einheit bleibt die Backup-Ansicht mit Erfolgsmeldung sichtbar. Import ist während eines laufenden Trainings sowohl im Dateifeld als auch im Store gesperrt. Die allgemeinen Tages-/Inaktivitätsregeln bleiben unverändert ein späterer Schritt.

`node Training/tests/backup.test.cjs` prüft vollständige Roundtrips, Momentaufnahmen, aktive Einheiten, ungültige Dateien, inkompatible Versionen, Werte/Referenzen/Fremdfelder, fehlende Bestätigung, geänderten Zustand, Speicherfehler mit ausstehenden Änderungen, Speicherkonflikte, Neuladen und Weight-Isolation. Chromium-Browserprüfungen prüfen tatsächliche Downloads/Dateiauswahl, KAIROS-Dialog mit Abbruch, Fehler und Wiederholung, Listen nach Import, importierte Trainingsfortsetzung sowie mobile Breiten. Ein physisches iPhone bzw. eine installierte iOS-PWA wurde nicht geprüft.
