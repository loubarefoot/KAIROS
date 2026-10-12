# Training – Datenmodell und lokale Speicherung

Technischer Stand des abgegrenzten Datenmodell-Schritts. Die Produktanforderungen in `KairosTraining.md` bleiben maßgeblich. Übungs- und Trainingsplanverwaltung sowie Bibliotheksinitialisierung sind implementiert. Aktiver Trainingsablauf und automatische Wiederaufnahme sind ebenfalls implementiert. Zeitmessung, endgültiger Trainingsabschluss, Zusammenfassung und Anzeige des letzten gespeicherten Trainings sind implementiert. JSON-Import/-Export ist implementiert. Automatische Startseitenlogik und Service-Worker-Offline-Start sind implementiert.

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

`refresh()` übernimmt extern gespeicherte gültige Daten nur bei geladenem, sauberem und nicht gesperrtem Store. Ungespeicherte lokale Änderungen werden dadurch nicht verworfen. Bei beschädigten externen Daten wird der Store gesperrt.

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

Nach Laden eines gültigen gespeicherten Zustands wird eine aktive Einheit direkt angezeigt. Ebenso führt die Rückkehr über `pageshow` oder aus dem Hintergrund über `visibilitychange` zur aktiven Ansicht. Das Training-Tab führt bei laufender Einheit stets dorthin. Startzeit, Position und Übungsstatus werden nicht zurückgesetzt. Die allgemeine Tages-/60-Minuten-Navigation ist über die bestehenden Einstellungen implementiert (siehe unten).

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

Nach Erfolg werden veraltete Verwaltungsformulare geschlossen und alle Listen sowie letztes Training neu angezeigt. Eine importierte aktive Einheit wird direkt fortgesetzt. Ohne aktive Einheit bleibt die Backup-Ansicht mit Erfolgsmeldung sichtbar. Import ist während eines laufenden Trainings sowohl im Dateifeld als auch im Store gesperrt. Die allgemeinen Tages-/Inaktivitätsregeln gelten beim nächsten Wiedereintritt (siehe unten).

`node Training/tests/backup.test.cjs` prüft vollständige Roundtrips, Momentaufnahmen, aktive Einheiten, ungültige Dateien, inkompatible Versionen, Werte/Referenzen/Fremdfelder, fehlende Bestätigung, geänderten Zustand, Speicherfehler mit ausstehenden Änderungen, Speicherkonflikte, Neuladen und Weight-Isolation. Chromium-Browserprüfungen prüfen tatsächliche Downloads/Dateiauswahl, KAIROS-Dialog mit Abbruch, Fehler und Wiederholung, Listen nach Import, importierte Trainingsfortsetzung sowie mobile Breiten. Ein physisches iPhone bzw. eine installierte iOS-PWA wurde nicht geprüft.


## Startseitenlogik und Seitenlebenszyklus

`navigation.js` entscheidet aus dem bestehenden Zustand und der Gerätezeit: aktive Einheit zuerst, sonst Startansicht bei neuem lokalen Kalendertag oder mindestens 3.600.000 ms Abwesenheit, andernfalls `settings.lastView`. Ein aktiver Ansichtsplatzhalter ohne Einheit und eine leere Zusammenfassung fallen auf die Trainingsübersicht zurück. Eine vorhandene Zusammenfassung zeigt beim Wiederöffnen die zuletzt gespeicherte abgeschlossene Einheit. Es werden keine neuen Schema-Felder eingeführt.

`showView()` speichert die tatsächlich verwendete Ansicht. `visibilitychange` (hidden) und `pagehide` speichern den Beginn der Abwesenheit einmal pro Hintergrundwechsel; Doppelauslösung setzt den Zeitpunkt nicht zurück. `pageshow` und Rückkehr zu visible verwenden die gespeicherten Werte und setzen beim Wiedereintritt den lokalen Öffnungstag sowie die Ansicht; der Hintergrundzeitpunkt wird geleert. Längere sichtbare Nutzung setzt keine Abwesenheitsfrist in Gang. Neuladen zählt die kurze Abwesenheit zwischen pagehide und erneutem Start. Die vorhandene Schaltfläche zur Startansicht bleibt erhalten.

Vor Wiedereintritt sowie bei einem Training-`storage`-Event werden externe Daten über `refresh()` berücksichtigt. Ausstehende lokale Änderungen werden nicht ersetzt; der bestehende Konfliktschutz sperrt in diesem Fall das Überschreiben fremder Daten. Die Einstellungen sind wie der gesamte Bestand zwischen Tabs desselben Origins geteilt; die zuletzt gespeicherte Ansicht gilt beim Wiedereintritt. Gleichzeitig schreibende Tabs bleiben eine dokumentierte localStorage-Grenze. Es gibt keine Hintergrundtimer und keinen periodischen Zeitstempel für letzte Benutzerinteraktion.

Mobile Browser können Prozesse ohne letztes Lifecycle-Event beenden. Dann kann nur der zuletzt erfolgreich gespeicherte Hintergrundzeitpunkt ausgewertet werden; für unterdrückte Ereignisse wird kein Zeitpunkt erfunden. Die Geräteuhr und lokale Zeitzone bestimmen Kalendertag/Abwesenheitsdauer. Speicherfehler werden über die bisherigen Meldungen sichtbar und erhalten Änderungen im Arbeitsspeicher.

## Offline-Shell und Aktualisierungen

`app.js` registriert `sw.js` relativ zum Training-Einstieg mit Scope `./` und `updateViaCache: 'none'`. Bei Hosting unter `/Training/` gilt der Worker ausschließlich für diesen Pfad. Ebenso sind Unterverzeichnisse wie `/KAIROS/Training/` unterstützt. `/Weight/` und fremde Origins werden nicht abgefangen.

`sw.js` installiert eine versionierte vollständige Shell aus `index.html`, `styles.css`, `data.js`, `library.js`, `management.js`, `session.js`, `navigation.js` und `app.js` sowie `manifest.webmanifest` und die drei PNG-Icons. Alle Dateien werden frisch geladen, auf HTTP-Erfolg, fehlende Redirects, passenden Content-Type, vollständigen/nichtleeren Body und die eingebettete SHA-256-Prüfsumme geprüft. Erst danach wird der neue Cache befüllt. Fehler beim Befüllen löschen nur den neuen Inhaltscache; die vorherige aktive Version bleibt auch bei versehentlich wiederverwendeter Versionsnummer erhalten. Ein bereits vorhandener identischer Cache wird nach Prüfung sämtlicher Inhalte schreibfrei wiederverwendet. Ein vorhandener unvollständiger Cache wird nicht überschrieben oder gelöscht; die Installation wird abgewiesen.

Die Shell wird aus dem zum aktiven Worker gehörenden Cache geliefert; `/Training/` und `/Training/index.html` einschließlich Start-Queryparametern verwenden dasselbe HTML. Fremde Dateien und Nicht-GET-Anfragen werden nicht gecacht. Es gibt kein Laufzeit-Caching von Trainingsdaten. localStorage und JSON-Dateien werden vom Worker weder verändert noch gelöscht. Cache-Namen enthalten Training-Präfix, Scope, Version und einen deterministischen SHA-256-Fingerabdruck des Shell-Prüfsummenverzeichnisses; nur ältere Caches genau dieses Training-Scopes werden nach erfolgreicher Aktivierung bereinigt.

Für jede Änderung einer Shell-Datei müssen vor späterer Veröffentlichung `VERSION` erhöht und `HASHES` in `sw.js` neu berechnet werden. Der Offline-Test prüft die Hashes gegen die tatsächlichen Dateien. Alle passenden Dateien einschließlich Worker müssen gemeinsam bereitgestellt werden. Eine teilweise Bereitstellung oder beschädigte Datei verhindert die Installation. Es gibt kein `skipWaiting()`: eine vollständige neue Version wartet, bis die bisherigen kontrollierten Seiten geschlossen sind. Dadurch wechseln offene Trainingsseiten nicht mitten im Betrieb auf eine andere Shell. Neue Besuche lösen die browserseitige Updateprüfung aus. Nach erstmaliger Installation werden die offenen Seiten übernommen. Die Offline-Einrichtung benötigt den erfolgreichen Abschluss der Worker-Installation, nicht nur das erste Anzeigen des HTMLs.

### Hosting- und iOS-Voraussetzungen

GitHub Pages ist laut Nutzer für `main`, `/(root)` unter `https://loubarefoot.github.io/KAIROS/` aktiviert. Training ist lokal auf `feat/training-v1` für `/KAIROS/Training/` vorbereitet und noch nicht veröffentlicht. Das eigene Manifest definiert die feste App-ID `/KAIROS/Training/`, relative `start_url` und `scope` jeweils `./` sowie `display: standalone`. PNG-Icons (192/512 Pixel) und ein Apple-Touch-Icon (180 Pixel) verwenden Anthrazit und Training-Grün. iOS-Metadaten und relative Ressourcenverweise stehen in `index.html`. Die tatsächlichen Live-Header sind nach Veröffentlichung zu prüfen; Pages-Einstellungen wurden nicht verändert. Das Hosting muss HTTPS (lokaler Test: localhost), normale statische Dateien unter dem Training-Pfad und korrekte HTML/CSS/JavaScript-MIME-Typen bereitstellen. `sw.js` muss ohne Redirect unter `/Training/sw.js` erreichbar sein; der normale Scope dieses Verzeichnisses genügt, kein originweiter Service-Worker-Header ist nötig. Der Verzeichniseinstieg muss `index.html` liefern; ein Aufruf ohne abschließenden Slash benötigt die übliche Hosting-Weiterleitung nach `/Training/`. Es darf keinen übergeordneten Worker geben, der diesen Scope oder die Auslieferung unerwartet übernimmt. Es wurden keine Hosting-Einstellungen ergänzt.

Safari/iOS und eine vorhandene Home-Screen-Web-App verwenden dieselben Lifecycle-/Worker-APIs. Ein physischer iPhone-/installierter PWA-Test steht aus; ein zusätzlicher Installationsdialog wurde nicht eingeführt. Die Installation erfolgt über Safari → Teilen → Zum Home-Bildschirm. Details und Veröffentlichungsplan stehen in `TrainingPWA.md`. Browser bzw. iOS können Website-Daten wegen Speicherknappheit, Privatmodus oder durch Nutzeraktionen entfernen. Dann ist die Offline-Verfügbarkeit nicht garantiert und eine erneute Online-Installation nötig. Offline-Cache und localStorage können getrennt betroffen sein; JSON-Backups bleiben die unabhängige Sicherungsmöglichkeit. Ohne Service-Worker-Unterstützung oder sichere Verbindung wird die fehlende Offline-Einrichtung verständlich angezeigt; die Online-Anwendung bleibt bedienbar.

### Prüfung

`navigation.test.cjs` prüft lokalen Tageswechsel, exakte 60-Minuten-Grenze, Ansichtswiederherstellung, Vorrang aktiver Einheiten und sichere Aktualisierung externer Daten. `offline.test.cjs` prüft vollständige Shell/Hash-Prüfung, fehlende und beschädigte Dateien, Cache-Bereinigung und die Beschränkung auf Training. Chromium-Prüfungen unter `/Training/` prüfen Lifecycle-Ereignisse, Tages-/Abwesenheitsregeln, Offline-Training/Speicherung/Export, fehlgeschlagene Updates, wartende und aktivierte Versionen sowie mobile Größen. Ein separates persistentes Testprofil prüft den Offline-Start nach vollständigem Browser-Prozessneustart.


## Freigegebene Audit-Korrekturen

Das Gewichtsformular speichert im DOM einen Kontext aus Einheiten-ID, Übungs-ID sowie den ursprünglichen Momentaufnahme-/Stammdatenwerten. Vor `changeWeight(fields, expected)` wird ein sauberer Store aktualisiert und der Kontext erneut verglichen. Ein inzwischen anderer Trainings-/Übungszustand oder veränderte Werte weisen die Eingabe mit einer verständlichen Meldung ab. Das Formular kann für die aktuelle Übung neu geöffnet werden. Reguläre Eingaben aktualisieren weiterhin Momentaufnahme und globales Gewicht über denselben Store; das Datenformat bleibt unverändert.

Zeitstempel müssen nichtnegative sichere Ganzzahlen innerhalb des JavaScript-Date-Bereichs sein. Kalenderdaten werden als tatsächliche ISO-Kalendertage geprüft, einschließlich Monatslängen und Schaltjahren. Ungültige Daten werden beim Laden und vor dem Import abgewiesen; gültige bisherige Bestände bleiben im Schema 1 kompatibel.

Nach Tastatur-/Schaltflächensortierung wird die verschobene Plan-/Übungs-ID wiedergefunden und ihre Sortierschaltfläche fokussiert. Am Listenrand wird die verfügbare Gegenrichtung fokussiert. Pointer-Drag-and-Drop bleibt erhalten. Die Trainingsübersicht zeigt jetzt den laufenden Plannamen und einen Fortsetzungshinweis bzw. ohne aktive Einheit den tatsächlichen Leerzustand.

Die Shell-Version ist für diese Dateiänderungen auf `v2` erhöht; Prüfsummen wurden aktualisiert. Der zusätzliche Inhaltsfingerabdruck des Cache-Namens ist nach Worker-Neustarts stabil und trennt unterschiedliche Shells auch bei gleicher `VERSION`. Bei einer reinen Worker-Codeänderung ohne neue Shell-Inhalte kann ein vollständig geprüfter identischer Cache wiederverwendet werden. Aktivierung und Bereinigung bleiben auf den bisherigen Training-Scope begrenzt; es gibt weiterhin kein `skipWaiting()`.

`audit.test.cjs` prüft veraltete Gewichtsformulare bei Tab-/Einheitenwechsel und geänderten Werten sowie ungültige Kalender-/Zeitwerte. `offline.test.cjs` prüft zusätzlich wiederverwendete Versionen mit Schreibfehler und schreibfreie Cache-Wiederverwendung nach Worker-Neustart. `audit-browser.cjs` reproduziert alle fünf Befunde mit isolierten Browserdaten: mehrere Tabs, reguläre Gewichtsänderung, wiederholte Plan-/Übungssortierung, aktiver Übersichtshinweis, ungültige Datei und fehlgeschlagenes Update mit gleicher Versionsnummer. Ausführung mit einem bereits vorhandenen Playwright-Core-Modul: `KAIROS_PLAYWRIGHT_MODULE=/pfad/zum/playwright-core node Training/tests/audit-browser.cjs`; bei Bedarf `KAIROS_CHROMIUM_PATH` für das vorhandene Chromium setzen. Dies fügt der Anwendung keine Abhängigkeit hinzu.


## PWA-Vorbereitung

Shell-Version `v3` ergänzt Manifest und drei Icons zum bestehenden achtteiligen App-Cache. PNG- und Manifest-MIME-Typen werden vor Installation geprüft; Manifest akzeptiert `application/manifest+json` oder `application/json`. SHA-256-Prüfungen umfassen alle zwölf Ressourcen. Worker-Scope, wartende Aktivierung, Speicherformat und Training-Funktionen bleiben erhalten. Änderungen an diesen PWA-Ressourcen benötigen wie andere Shell-Änderungen eine erhöhte Version und neue Hashes.


## iPhone-UI-Korrektur 1

Die App-Hülle ist viewport-fest mit `100dvh` und einem Prozenthöhen-Fallback. `main.wrap` ist der einzige scrollende Inhaltsbereich; die Bottom-Navigation liegt als eigene nicht schrumpfende Zeile darunter. Ihre Hintergrundfläche umfasst die untere Safe Area, der Inhalt benötigt keine zusätzliche Navigationshöhe als unteren Abstand. Ansichtswechsel scrollen `main` zum Anfang. `enterApp()` stellt die Ansicht ohne erzwungenen Überschriftenfokus wieder her; ausdrückliche Ansichtswechsel behalten die vorhandene Fokusführung und Tastaturindikatoren. Die allgemein gültige Regel `button + button` wird ausschließlich für benachbarte Navigationstabs aufgehoben.

Shell v4 enthält die geänderten CSS-/App-Prüfsummen. Browserprüfungen decken kurze/lange Inhalte, Größenänderungen, isoliertes Scrollen, Erreichbarkeit letzter Aktionen, Öffnen/Wiederherstellen, Pointer- und Tastaturfokus ab. Ein synthetischer 34-Pixel-Inset prüft die Layoutgeometrie; die tatsächliche iOS-Safe-Area, Bildschirmtastatur und installierte PWA müssen auf dem physischen iPhone nachgeprüft werden. Das ursprüngliche iPhone-Verhalten der bereits `position: fixed` verwendenden Navigation konnte in Chromium nicht direkt reproduziert werden.


## Auftrag 28 – Navigation nach Weight-Referenz

Dieser Stand ersetzt die `100dvh`-/Flex-App-Hülle aus iPhone-UI-Korrektur 1. Weight verwendet `html,body` mit Prozenthöhe, einen natürlich wachsenden Scrollbereich mit 80 Pixel Navigationsreserve und eine separat fixierte 80-Pixel-Leiste bei `bottom:0`. Ein unteres Safe-Area-Padding wird dort nicht zusätzlich auf die Leistenhöhe addiert. Die Tab-Inhalte liegen oben in der Leiste; deren Hintergrund reicht bis zum unteren Layout-Viewport. Im gesamten Weight-Script gibt es keine Tastatur-/VisualViewport-Anpassung. Training übernimmt diese technische Struktur: feste Gesamthöhe, null zusätzliches Bottom-Padding, normaler Seitenfluss, Dokument-Scroll und identische Navigationsreserve. Oberer und seitlicher Safe-Area-Abstand bleiben erhalten; Zoom wird nicht deaktiviert.

Die vorherige Training-Hülle koppelte die Navigation an die dynamische Viewport-Höhe und addierte die Safe Area zum Tab-Bereich. Das erklärt den zusätzlichen Abstand; die spezifische schwarze iOS-Fläche und die native Tastaturkomposition können im Desktop-Browser nicht nachgewiesen werden. Die neue Leiste wird nicht an die verkleinerte VisualViewport-Höhe angepasst. Wie bei Weight kann die iOS-Tastatur die am Layout-Viewport liegende Navigation überdecken, ohne eine eigene Navigationszeile über der Tastatur vorzuhalten.

Shell v5 enthält aktualisierte CSS-/App-Prüfsummen. Browserprüfungen decken fünf mobile Größen, kurze/lange Seiten, konstante 80-Pixel-Höhe, Erreichbarkeit der letzten Aktion, simulierten 34-Pixel-Inset ohne additive Leistenhöhe, Fokus und simulierte VisualViewport-Resize-/Scroll-Ereignisse ab. Die Simulation verändert nicht die echte Browser-Tastatur; tatsächlicher Home-Indikator, schwarzer Balken, Eingabescrolling, Tastaturöffnung/-schließung und PWA-Wiederherstellung müssen auf einem physischen iPhone bestätigt werden.


## Auftrag 31 – Vorübergehende Diagnose

Einstellungen → Vorübergehende iPhone-Diagnose öffnet ein Details-Feld ohne neue gespeicherte Ansicht. `diagnostics.js` liest technische Werte, schreibt keine Trainingsdaten und sendet keine Daten an externe Dienste. Der geladenen JavaScript-Datei ist die eindeutige Kennung `training-diagnostics-1` zugeordnet (Basis 55f1be8, Diagnose-Shell v6). Die tatsächlichen CSSOM-Regeln liefern separat die Stylesheet-Kennung und einen SHA-256-Fingerabdruck ihrer JSON-Serialisierung. Dieser Fingerabdruck ist browserabhängig und ausdrücklich nicht mit dem SHA-256 der ursprünglichen CSS-Dateibytes vergleichbar. Bei fehlender Kennung oder unzugänglichen Regeln steht unbekannt.

Worker-Angaben stammen aus einer Nachricht an das jeweilige Worker-Objekt, nicht aus einem Netzwerkabruf von sw.js. `controller` ist der Worker dieser Seite, `registrationActive` der aktive Worker der Registrierung; beide können sich unterscheiden. Ein vorhandener wartender Worker wird separat abgefragt. Nach 1,5 Sekunden ohne gültige Antwort wird seine Version unbekannt angezeigt. Der Worker meldet zusätzlich Scope, seinen Cache-Namen und den erwarteten CSS-Dateihash. Unzugängliche Registrierungen werden nicht als nachweislich fehlende wartende Worker ausgegeben. Ältere Worker können ohne Diagnoseprotokoll keine sichere Versionsnummer liefern.

Beim Antippen von Aktualisieren werden Geometrie und fokussiertes Element vor dem Fokuswechsel erfasst, sodass Werte der geöffneten Tastatur dokumentiert werden können. Worker/CSS-Auswertung folgt asynchron. Scroll-Ereignisse werden nur seit Laden des Diagnosescripts beobachtet; ohne Ereignis wird der tatsächlich scrollende Container unbekannt ausgewiesen. Zusätzlich stehen die Scrollpositionen von Dokument, Body und main im Bericht. Kopieren verwendet die Zwischenablage; falls sie nicht verfügbar ist, wird der Bericht zur manuellen iPhone-Auswahl markiert. Es werden weder Eingabetext der Tastaturprobe noch Trainings-/Weight-Daten aufgenommen.

Shell v6 cached diagnostics.js gemeinsam mit den bisherigen zwölf Ressourcen; wartende Aktivierung und Navigation bleiben unverändert. Ist noch eine alte Shell aktiv, erscheint die Diagnose möglicherweise noch nicht. Vor einem Gerätetest muss der neue Diagnose-Build im installierten PWA-Kontext angekommen sein; keine Website-Daten löschen oder Updates während einer laufenden Einheit erzwingen.
