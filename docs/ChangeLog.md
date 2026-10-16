# KAIROS – Changelog

## 11.10.2026

### Training – Dokumentation

- Die 17 bestätigten Produktentscheidungen in die bestehenden Abschnitte von `KairosTraining.md` eingearbeitet und den V1-Pflichtumfang entsprechend ergänzt.
- Automatische Fortsetzung, Planänderungen, expliziten Trainingsabschluss und Fortschrittszählung präzisiert.
- Übungsbibliothek, Namenseindeutigkeit, Plan-Zuordnungen, Gewichtseingabe, MAX-Verhalten und Löschung konkretisiert.
- Startansicht, Plansortierung, KAIROS-Dialoge, vollständige Offline-Nutzung, JSON-Import/-Export und Speicherfehler dokumentiert.
- Verbleibende offene Details ausgewiesen und die bestätigten Entscheidungen im Decision Log festgehalten.

Keine Änderung am Anwendungscode oder am Weight Tracker; keine Training-Funktionen implementiert.

### Training – Ergänzung der Entscheidungen 18 bis 22

- Schutz laufender und absolvierter Einheiten vor Übungsänderungen und Löschungen ergänzt.
- Importsperre bei laufendem Training, weiterhin verfügbaren Export und Beginn der 60-Minuten-Inaktivitätsfrist festgelegt.
- Vollständige Bearbeitbarkeit vorgefertigter Übungen bei erhaltenem Löschschutz sowie MAX-Rückkehr zu leerem oder vorherigem numerischem Gewicht präzisiert.
- Abschnitt 29 auf verbleibende Details und die Abgrenzung zwischen festgelegten Übungsdaten und Gewichtseingabe während des Trainings reduziert.

Ausschließlich Dokumentation geändert; Weight und Anwendungscode bleiben unverändert.

### Training – Ergänzung der Entscheidungen 23 bis 25

- Sofortige Anzeige und globale Speicherung von Gewichtsänderungen im laufenden Training als ausdrückliche Ausnahme zu den unveränderten Übungsdaten präzisiert.
- Wiederherstellung der zuletzt verwendeten Ansicht unterhalb von 60 Minuten ergänzt; Tagesstart und Vorrang laufender Trainings erhalten.
- Umfang und Abdeckung der Grundbibliothek mit ungefähr 50 Übungen dokumentiert, ohne eine konkrete Liste vorwegzunehmen.
- Abschnitt 29 auf den geklärten Anforderungsstand und die noch ausstehende Freigabe der konkreten Übungsauswahl aktualisiert.

Ausschließlich Dokumentation geändert; keine zusätzlichen Funktionen und keine Änderungen am Anwendungscode.

### Training – Verbindliche Grundbibliothek mit 52 Übungen

- Die freigegebenen 50 Übungsnamen unverändert in Abschnitt 8.1 von `KairosTraining.md` übernommen.
- Ausschließlich „Beinbeugen liegend an der Maschine“ unter Beine und „Wrist Roller am Kabelzug“ unter Unterarme ergänzt.
- Umfang auf 52 Übungen konkretisiert und den ausstehenden Freigabepunkt in Abschnitt 29 abgeschlossen.
- Freigabe im Decision Log protokolliert.

Keine Änderungen an sonstigen Anforderungen oder am Anwendungscode.

### Training – Eigenständiges Grundgerüst

- `Training/index.html`, `Training/styles.css` und `Training/app.js` erstellt, ohne Framework oder zusätzliche Abhängigkeiten.
- Startansicht, Training, aktives Training, Einstellungen, Planverwaltung, Übungsverwaltung und Datenimport/-export als statische Ansichten angelegt. Genau zwei Bottom-Navigationseinträge: Training und Einstellungen; die Startansicht gehört zum Training-Bereich.
- Mobile Dark-Mode-Gestaltung mit grüner Akzentfarbe, Touch-Flächen und Safe-Area-Abständen umgesetzt. Tastaturbedienung, Fokuswechsel und Kennzeichnung der aktiven Navigation ergänzt.
- Noch nicht verfügbare Aktionen bleiben deaktivierte Platzhalter. Keine Trainingsdaten, Übungsbibliothek, Trainingslogik, Timer, Fortschrittsberechnung, Speicherung, Import-/Exportlogik oder Offline-Caching implementiert. Die spätere Tages-/Inaktivitätsnavigation und automatische Trainingsfortsetzung sind ebenfalls noch nicht umgesetzt.
- Geprüft: JavaScript-Syntax, alle Navigationswege und Ansichten, aktive Bottom-Navigation, Tastatur und Fokus, deaktivierte Aktionen, unveränderter Weight Tracker sowie fehlende Speicherzugriffe. Chromium-Prüfung bei 320, 390, 844 und 1280 Pixeln ohne horizontale Überläufe oder von der Bottom-Navigation verdeckte letzte Schaltflächen. Mobile Bildschirmaufnahme visuell geprüft.

Die Safe-Area-Regeln sind im CSS berücksichtigt; ein Praxistest auf einem physischen iPhone steht noch aus. Keine Änderung der Produktanforderungen, keine vollständige V1 und keine Implementierung weiterer Schritte.

### Training – Datenmodell und lokale Speicherung

- `Training/data.js` mit Schema-Version 1 und den Bereichen Übungen, Pläne, Planreihenfolge, abgeschlossene/laufende Einheiten und Einstellungen ergänzt.
- Lokale Speicherung unter `kairos.training.state`, Struktur-/Referenzvalidierung, Gewichts-/MAX-Regeln, stabile IDs und unabhängige Momentaufnahmen umgesetzt. Abgeschlossene Einheiten und vorgefertigte Übungsidentitäten sind gegen normale nachträgliche Änderungen geschützt.
- Beim App-Start Datenladen und sichtbare Fehlermeldungen integriert. Beschädigte/inkompatible Bestände werden nicht überschrieben; gültige ausstehende Änderungen bleiben bei Schreibfehlern im Arbeitsspeicher. Zwischenzeitliche externe Speicheränderungen sperren das Überschreiben.
- Technische Dokumentation in `TrainingData.md` und reproduzierbare Datentests in `Training/tests/data.test.cjs` ergänzt.
- Datentests, JavaScript-Syntax, Navigation/Tastatur und Darstellung bei 320/390/844/1280 Pixeln sowie sichtbare Fehlermeldung bei beschädigtem Speicher erfolgreich geprüft. Weight bleibt unverändert.

Keine Plan-/Übungsverwaltung, Trainingsabläufe, Timer, Bibliotheksinitialisierung, JSON-Import/-Export oder Offline-Caching implementiert. Automatische Tages-/Inaktivitätsnavigation und Trainingsfortsetzung bleiben spätere Schritte.

### Training – Übungs- und Trainingsplanverwaltung

- `library.js` mit exakt 52 freigegebenen Namen und einmaliger Initialisierung ausschließlich für einen fehlenden, gültig geladenen Training-Bestand ergänzt. Bestehende Daten werden nicht aufgefüllt oder überschrieben.
- `management.js` und bestehende Ansichten um Übungs-/Planformulare, Auswahl, Zuordnung, Bearbeitung und Löschung über den vorhandenen Store erweitert. Vorgefertigte Übungen bleiben vor dauerhafter Löschung geschützt.
- Normalisierte Namenseindeutigkeit, 0,25-kg-Gewichte einschließlich 0/leer, Wiederholungen und MAX mit erhaltenem vorherigem Gewicht integriert. Eigene Übungslöschung entfernt Referenzen aus allen Plänen und erhält Momentaufnahmen.
- Manuelle Plan- und Übungsreihenfolgen per Pointer-Drag-and-Drop und Tastaturschaltflächen, automatische Übungsanzahlen und gespeicherte Planreihenfolge in der Startansicht umgesetzt.
- Eigene KAIROS-Löschdialoge und erneuten Speicherversuch nach Fehlern ergänzt; keine zweite Datenhaltung.
- Datentests und Verwaltungstests sowie Browserprüfung für Initialisierung, Formulare, Dialoge, Persistenz, Sortierung, mobile Größen und Schreibfehler durchgeführt. Weight bleibt unverändert.

Trainingsabläufe, Timer, Fortschritt, JSON-Import/-Export und Offline-Caching sind weiterhin nicht implementiert.

### Training – Aktiver Ablauf und automatische Wiederaufnahme

- `Training/session.js` mit Start nicht leerer Pläne, unabhängigen Momentaufnahmen und Startzeitstempel ergänzt. Gleichzeitige bzw. ersetzende aktive Einheiten werden verhindert.
- Aktive Ansicht mit hervorgehobenen Übungsnamen und Gewichten, MAX/Wiederholungen, direkter Gewichtseingabe und atomarer globaler Speicherung integriert.
- Abschließen, Überspringen und explizites Nachholen offener Übungen bei erhaltener ursprünglicher Planreihenfolge umgesetzt.
- Fortschritt als Anzahl, Prozentwert und Balken ausschließlich aus abgeschlossenen Übungen berechnet. Auch bei 100 % bleibt das Training aktiv; Abschluss bleibt ein deaktivierter Platzhalter.
- Laufende Einheit nach Neuladen, erneutem Öffnen und Rückkehr aus dem Hintergrund automatisch angezeigt. Position, Übungsstatus und Startzeit bleiben erhalten.
- Datentests, Verwaltungstests und neue Ablauftests sowie Browserprüfungen für Ablauf, Wiederaufnahme, Eingaben, Navigation, mobile Breiten und Verwaltungsregressionen durchgeführt.

Kein endgültiger Abschluss, keine Zusammenfassung, keine neuen abgeschlossenen Einheiten, kein vollständiger Timer, JSON-Import/-Export oder Offline-Caching. Weight bleibt unverändert.

### Training – Zeitmessung, Abschluss und Zusammenfassung

- Verstrichene Dauer als Stunden/Minuten/Sekunden aus dem gespeicherten Startzeitstempel angezeigt; kein Hochzählen oder sekündliches Speichern des Datenbestands.
- Ausdrücklichen vollständigen oder vorzeitigen Abschluss mit KAIROS-Bestätigungsdialog aktiviert. Statuswerte und Momentaufnahmen werden unverändert mit Start, Ende und Dauer gespeichert.
- Abschluss über einen Store-Commit umgesetzt, der die aktive Einheit erst nach erfolgreicher Speicherung entfernt. Fehler behalten aktive und ungesicherte Daten; parallele Bestätigungen und doppelte Einträge sind geschützt.
- Zusammenfassungsansicht mit Planname, Datum, Dauer und abgeschlossenen Übungen sowie Rückkehr zur Trainingsübersicht ergänzt. Platzhalter für letztes Training durch tatsächlich gespeicherte Einheiten ersetzt.
- Abschluss-/Zeitmessungstests und Browserprüfungen für Wiederaufnahme, Dialog/Abbruch, Speicherfehler, Doppelaktionen, Zusammenfassung, letztes Training, Persistenz und mobile Darstellung ergänzt; bestehende Ablauf- und Verwaltungsprüfungen durchgeführt.

Keine umfassende Historie/Statistik, JSON-Import/-Export oder Offline-Caching ergänzt. Weight bleibt unverändert.


### Training – JSON-Backup

- Vollständigen JSON-Export des aktuellen Training-Stores mit bestehender Schema-Version, Reihenfolgen, Einstellungen und Einheiten-Momentaufnahmen in die Backup-Ansicht integriert; auch während einer aktiven Einheit verfügbar.
- JSON-Dateiauswahl, vollständige Validierung vor Bestätigung und eigenen KAIROS-Dialog vor Ersetzung ergänzt. Während aktiver Einheiten bleibt Import gesperrt.
- Expliziten Importpfad im bestehenden Store ergänzt: erst erfolgreich speichern, dann Zustand übernehmen; ungültige Dateien, Speicherausfälle und Änderungen während Bestätigung erhalten vorhandene Daten.
- Listen/Formulare nach erfolgreichem Import aktualisiert und gegebenenfalls importierte aktive Einheit direkt fortgesetzt. Verständliche Meldungen für Download-Bereitstellung, Importerfolg, Abbruch und Fehler ergänzt.
- Backup-Datentests und Browserprüfungen für Downloads, Dateiauswahl, Dialoge, Speicherfehler, Wiederaufnahme, Persistenz und mobile Größen durchgeführt; bestehende Training-Tests geprüft.

Kein Offline-Caching, keine automatische Tages-/Inaktivitätsnavigation, keine Cloud-Synchronisierung und keine Änderungen am Weight Tracker. Keine neuen Abhängigkeiten.


### Training – Startseitenlogik und Offline-Start

- Bestehende Ansichtseinstellungen für lokale Kalendertage, Wiederherstellung unter 60 Minuten und Startansicht ab 60 Minuten genutzt; laufende Einheiten haben Vorrang.
- Beginn der Abwesenheit über Hintergrund-/Seitenlebenszyklus gespeichert, doppelte Ereignisse abgefangen und gespeicherte Ansichten nach Neuladen wiederhergestellt. Externe Tab-Daten werden bei sauberem Store sicher aktualisiert.
- Training-Service-Worker mit vollständiger versionierter Shell, SHA-256-Prüfung und auf den Training-Pfad begrenztem Cache ergänzt. Fehlgeschlagene Updates erhalten die bisherige Offline-Version; neue Versionen warten bis zum Schließen alter Seiten.
- Tests für Navigationsregeln, Cache-Installation/Fehler/Scope, Offline-Training und vollständigen Browser-Neustart ergänzt. Hosting-Voraussetzungen sowie iOS- und Speichergrenzen in `TrainingData.md` dokumentiert.

Keine Hosting-Änderungen, Cloud-Synchronisierung, zusätzlichen Produktfunktionen oder Änderungen am Weight Tracker. Keine neuen Abhängigkeiten.


### Training – Freigegebene Audit-Fehlerkorrekturen

- Gewichtsformulare an Einheiten-/Übungs-ID und ursprüngliche Werte gebunden; veraltete Eingaben werden vor Änderungen abgewiesen. Reguläre globale Gewichtsspeicherung bleibt erhalten.
- Tatsächliche Kalenderdaten und darstellbare Zeitstempel validiert; ungültige Backup-Zeitwerte werden nicht übernommen. Schema 1 bleibt erhalten.
- Tastaturfokus nach Plan-/Übungssortierung auf der verschobenen Zeile wiederhergestellt; Drag-and-Drop unverändert erhalten.
- Statischen falschen Leerzustand in der Trainingsübersicht durch den tatsächlichen aktiven Zustand ersetzt.
- Inhaltsfingerabdruck für Cache-Namen und geprüfte schreibfreie Wiederverwendung identischer Shells ergänzt. Fehlgeschlagene Updates mit gleicher Versionsnummer löschen keine bisher funktionierende Offline-Shell. Version und Dateiprüfsummen aktualisiert.
- Gezielte Daten-/Cache- und Browser-Regressionsprüfungen für alle fünf freigegebenen Befunde ergänzt.

Keine weiteren Audit-Themen, Produktfunktionen, Hosting-Einstellungen oder Weight-Dateien geändert.


### Training – iPhone-PWA für GitHub Pages vorbereitet

- Eigenes Manifest mit Training-App-ID, relativem Start/Scope und Standalone-Anzeige ergänzt.
- Drei undurchsichtige PNG-Icons in 192/512/180 Pixeln mit grüner Hantel auf Anthrazit sowie Manifest-/Icon-Verweise und iOS-Metadaten ergänzt.
- Offline-Shell auf `v3` und zwölf vollständig MIME-/SHA-256-geprüfte Ressourcen erweitert. Scope und wartende Aktivierung erhalten.
- PWA-/Offline-Prüfungen und reproduzierbaren Browserlauf unter `/KAIROS/Training/` einschließlich Update, Browser-Neustart und Weight-Regression ergänzt.
- Hosting-Dokumentation und Plan für spätere Dokumentationszusammenführung und Veröffentlichung ergänzt.

Vorbereitung auf `feat/training-v1`; keine zusätzlichen Training-Funktionen, Weight-Änderungen, Commits, Pushes, Merges oder Pages-Einstellungsänderungen. Physischer iPhone-Test und Veröffentlichung stehen aus.


## 12.10.2026

### Training – iPhone-Navigation und Fokus gezielt korrigiert

- Viewport-feste App-Hülle mit dynamischer Höhe und ausschließlich scrollendem Hauptinhalt eingerichtet. Bottom-Navigation belegt eine eigene, nicht überlagernde Zeile einschließlich unterer Safe Area. Ansichtswechsel setzen den Inhaltsscroll zurück.
- Navigation von 68 auf 56 Pixel Grundhöhe verkleinert, Innenabstände reduziert, Icons auf 26 Pixel und Beschriftungen auf 0,8 rem vergrößert. Unbeabsichtigten 10-Pixel-Abstand am zweiten Navigationsbutton durch die allgemeine Geschwisterregel gezielt aufgehoben.
- Beim Öffnen/Wiederherstellen kein erzwungener Überschriftenfokus; bei bewussten Ansichtswechseln Fokusführung erhalten. Überschriften erhalten einen grünen Tastaturindikator über `:focus-visible`; kein pauschales Abschalten von Fokusstilen.
- Shell auf v4 erhöht und CSS-/JavaScript-Prüfsummen aktualisiert. Mobile Scroll-/Fokusprüfungen ergänzt; echter iPhone-/Safe-Area-Test bleibt notwendig.

Keine Änderungen an Training-Verwaltung, Datenformat, Icons oder Weight. Vorbereitung auf `fix/training-iphone-ui-1`, noch kein Commit, Push oder Merge.


### Auftrag 28 – Training-Navigation an Weight-Referenz angeglichen

- Weight-Implementierung untersucht: normale Prozenthöhe, scrollender Seiteninhalt, fixierte 80-Pixel-Navigation ohne zusätzliches unteres Safe-Area-Padding, entsprechender Inhaltsabstand; keine eigene Tastatur-/VisualViewport-Steuerung.
- Training-App-Hülle mit `100dvh` und Flex-Navigationszeile entfernt. Navigation wie bei Weight wieder unabhängig am Layout-Viewport fixiert; insgesamt 80 Pixel einschließlich Bereich unter den oben ausgerichteten Tabs. Kein additives Bottom-Inset, Hintergrund auf html/body und Navigation durchgehend gesetzt. Obere/seitliche Safe Areas und bestehende Fokusindikatoren erhalten.
- Inhaltsabstand auf dieselbe Navigationshöhe abgestimmt und Ansichtswechsel auf Dokument-Scroll zurückgestellt; keine Trainingslogik geändert. Zoom bleibt erlaubt.
- Shell v5 und Prüfsummen aktualisiert; Tests auf Dokument-Scroll, konstante Höhe, Safe-Area-Geometrie und simulierte VisualViewport-Verkleinerung angepasst. Reales iOS-Tastatur-/PWA-Verhalten weiterhin am Gerät prüfen.

Vorbereitung auf `fix/training-weight-navigation`; Weight vollständig unverändert; kein Commit, Push oder Merge.


### Auftrag 31 – Vorübergehende iPhone-PWA-Diagnose

- Aufklappbare Diagnose in den Einstellungen mit Aktualisieren, Kopieren und manueller Auswahl als Clipboard-Fallback ergänzt. Tastaturprobe wird nicht gespeichert und nicht exportiert.
- Geladenen Diagnose-Build, CSS-Kennung und SHA-256-Fingerabdruck tatsächlich geladener CSSOM-Regeln, Viewport-/Navigations-/Scroll-/Fokus-/Standalone-Werte angezeigt. Kein erneutes Laden des Stylesheets zur Versionsbestimmung.
- Kontrollierenden, registrierten aktiven und wartenden Worker separat per MessageChannel abgefragt; ältere/nicht antwortende Worker bleiben ausdrücklich unbekannt. Erwarteter CSS-Dateihash wird getrennt vom geladenen CSSOM-Hash ausgewiesen.
- Shell v6 mit dreizehn Ressourcen und aktualisierten Prüfsummen; Browserprüfungen für Versionen, Unbekannt-Fälle, Kopieren/Fallback, Offline und unveränderte Daten ergänzt.

Keine Änderungen an Navigation oder Trainingslogik; Weight unverändert. Vorbereitung auf `feat/training-pwa-diagnostics`, kein Commit/Push/Merge.


### Auftrag 34 – Direktdiagnose und Startlogik

- Kleinen viewport-festen Diagnoseknopf ergänzt; Bericht erfasst die sichtbare Section und Geometrie vor Öffnen des separaten Diagnosefensters. Die bestehende Diagnoseauswertung und Kopierfunktion werden gemeinsam genutzt.
- Begrenztes, ausschließlich im Arbeitsspeicher gehaltenes Protokoll (24 Messpunkte) für Ansichtswechsel, Layoutabschluss, Scroll-Ereignisse/Scrollruhe, pageshow und VisualViewport ergänzt. Dokument-/Main-/Section-Höhen sowie zusätzliche Navigations-CSS-Werte aufgenommen. Keine Layoutkorrektur.
- Neuen Dokumentstart von Rückkehr in ein bestehendes Dokument unterschieden: aktive Einheit zuerst, sonst bei neuem Dokument Startseite. Warme Rückkehr und BFCache behalten Tages-/60-Minuten-Regeln.
- Shell v7, Diagnosekennung training-diagnostics-2 und Prüfsummen aktualisiert. Gezielte Daten-/Browserregression für Direktmessung, Kopieren, Kaltstart, BFCache, Inaktivität und unveränderte laufende Einheiten ergänzt.

Vorbereitung auf `fix/training-view-diagnostics-start`; keine Verwaltungs-/Trainingslogikänderungen, keine Weight-Änderungen, kein Commit/Push/Merge.


### Auftrag 37 – Training-Scrollstruktur und Diagnosebedienung

- Kombinierte `.wrap` getrennt: äußerer `#scrollArea` wie in Weight für Mindesthöhe, Overflow, oberen Safe-Area-Abstand und bestehende 80-Pixel-Inhaltsreserve; innerer Main nur für Inhaltsbreite und Abstände. Navigation, Viewport-/Statusleisten-Metadaten und Gesamtreserve (80 + 24 Pixel) unverändert. Ansichtswechsel setzen zusätzlich den äußeren Scrollcontainer zurück.
- Diagnoseknopf in einer eigenen Zeile im Inhaltsfluss statt als überlagerndes Fixed-Element. Nach Scrollen sind Messpunkte im bestehenden Protokoll verfügbar; zum Knopf zurückscrollen und Bericht öffnen.
- Native Schließen-Form und Kopieren außerhalb des scrollenden Dialoginhalts; Schließen erhält initialen Fokus. Diagnose erfasst auch den neuen äußeren Container.
- Shell v8, Buildkennung `training-scroll-structure-1`, alle 13 Ressourcen-Prüfsummen aktualisiert. Regressionen für kurze/lange Ansichten, kleine/querformatige Dialoge, native Schließen-Bedienung, Fokus, Lifecycle und Offline ergänzt beziehungsweise aktualisiert.

Die Strukturabweichung ist belegt; dass sie den nativen schwarzen Bereich beseitigt, muss am echten iPhone bestätigt werden. Keine Änderungen an Trainingsdaten/-logik, Startregeln oder Weight. Vorbereitung auf `fix/training-scroll-structure`, kein Commit/Push/Merge.


### Auftrag 40 – Isolierter Touch-Fokus-Test

- Automatischen Überschriftenfokus bei Touch-Ansichtswechseln deaktiviert; Tastatur und Aktivierungen ohne Pointer-Klickdetails behalten Fokusführung. Lifecycle-Startregeln, Eingabefokus, Scroll-Rücksetzung, Viewport, Scrollstruktur und Navigation unverändert.
- Bestehende Diagnose einschließlich Ansicht-/Viewport-Ereignissen erhalten; JS-Build `training-touch-focus-1`, Shell v9 mit aktualisierten Prüfsummen. CSS bleibt bytegleich zu v8.
- Echte Browser-Touch-Ereignisse und anschließende Enter-/Space-Fokusführung geprüft. Der 47-Pixel-Sprung muss mit v9 am echten iPhone geprüft werden; keine bestätigte Ursachenbehauptung.


### Auftrag 42 – Weight-Seitenhülle wortgetreu übernommen

- Viewport-Meta einschließlich maximum-scale/user-scalable und mobile-web-app-capable wie Weight. HTML/Body-, ScrollArea-, Wrap-, Tabbar- und Scrollbar-Regeln direkt aus der Referenz ersetzt; keine nachträglichen Overrides. Entfernt: globales scroll-padding-bottom, zusätzliche Body-Zeilenhöhe und seitliche Safe-Area-Abstände der Hülle. Globale color-scheme-Regel entfernt; dunkle Eingabedarstellung lokal erhalten.
- Training-Farben, Inhalte, größere Tab-Icons/-Beschriftung, Touch-/Tastaturfokus, Startlogik, native Dialoge und vorhandene Diagnose bleiben erhalten. Navigation weiterhin außerhalb des Scrollbereichs.
- JavaScript geprüft: keine globale Viewport-Höhensteuerung; ScrollArea-Rücksetzung, gezielter Eingabefokus, Speicherfehler-scrollIntoView und Drag-Autoscroll bleiben funktionsbezogen unverändert. Shell v11, Kennung training-weight-shell-1 und alle 13 Prüfsummen aktualisiert.
- Referenzparität und Regressionen geprüft; tatsächliche Wirkung auf den iOS-Streifen bleibt am Gerät zu bestätigen.


### Auftrag 44 – Isolierter Startseitenhöhen-Test v12

- Ein nichtinteraktiver, eindeutig markierter temporärer Block mit 1200 Pixel Mindesthöhe ausschließlich in der Startseite ergänzt. Zur vollständigen Entfernung stehen BEGIN/END-Kommentare um den Block. Keine dauerhafte Designentscheidung.
- Viewport-Meta, gesamte CSS-Datei, Navigation, Scroll-/Fokuslogik, Funktionsmodule und Weight unverändert. Diagnose-Buildkennung aktualisiert; Worker v12 und alle 13 Ressourcen-Prüfsummen geprüft.
- Regression prüft lange Startansicht, nichtinteraktiven Block und dessen Ausblendung in anderen Ansichten. Physischer iPhone-Kaltstart bleibt der entscheidende Ursachen-Test.


### Auftrag 45 – Gemeinsame Dokument-Mindesthöhe

- V12-Testblock vollständig entfernt. Der gemeinsame ScrollArea-Inhaltsbereich erhält eine Viewport-Mindesthöhe (Fallback 100vh, modern max aus Prozent-/svh-/dvh-/lvh-Höhe). Nur ScrollArea verwendet content-box: Die bereits vorhandene Navigationsreserve von 80 Pixel und der bestehende obere Safe-Area-Abstand liegen außerhalb dieser Mindesthöhe. Dadurch hat auch eine kurze Ansicht echten Dokument-Scrollbereich; keine neue Padding-/47-Pixel-Kompensation.
- lvh verhindert, dass ein kleinerer dynamischer Viewport allein die Mindesthöhe zusammenzieht; größere Viewports und echte Inhaltslängen werden berücksichtigt. Keine JS-Höhenmessung oder Scroll-/Fokus-/Trainingslogikänderung. Native iOS-Wirkung muss noch am Gerät bestätigt werden.
- Worker v13 und 13 Prüfsummen aktualisiert; Regressionen für kurze/leere/lange Ansichten und echte Browser-Viewport-Verkleinerung/-Wiederherstellung. Vorbereitung auf fix/training-minimum-document-height; kein Commit/Push/Merge/Deployment.


### Auftrag 47 – Diagnose in Einstellungen entfernt

- Gesamten vorübergehenden Diagnoseabschnitt samt Tastaturprobe, Aktualisieren-/Kopieren-Schaltflächen, Berichtfeld und Statusanzeige aus Einstellungen entfernt. Ausschließlich zugehörige DOM-Referenzen und Listener gelöscht.
- Kompakter Diagnoseknopf und nativer Dialog mit Kopieren/Manuell-Auswahl, Schließen, Worker-/CSS-/Viewport-Auswertung und Ereignisprotokoll vollständig erhalten; Auswertung schreibt direkt in den verbleibenden Dialog.
- Mindesthöhe und gesamte CSS-Datei sowie Trainings-/Scroll-/Fokus-/Startlogik und Weight unverändert. Worker v14, neue Diagnose-JS-Kennung und 13 Prüfsummen aktualisiert; Diagnoseregressionen auf den verbleibenden Zugang übertragen.
- Vorbereitung auf chore/training-compact-diagnostics; kein Commit/Push/Merge.


## 13.10.2026 – Auftrag 51: Trainingsplanverwaltung V1 (Arbeitsbranch, unveröffentlicht)

- Eigene Editoransicht für Erstellen/Bearbeiten mit gemeinsamem lokalem Entwurf; bestehende und neue Übungen, globale Gewichte/MAX/Wiederholungen sowie Reihenfolge direkt bearbeitbar.
- Gemeinsame atomare Speicherung, Rückkehr zur Planübersicht, Dreiwege-Dialog beim internen Verlassen, Entwurfserhalt bei Schreibfehlern und Konfliktschutz.
- Kein automatischer Eingabefokus; bestehende Editorzeilen bei Listenänderungen weiterverwendet.
- Regressionstests ergänzt und Shell v15/Prüfsummen vorbereitet. Weight, Navigationsmarkup, CSS und bestehende Trainingsmomentaufnahmen unverändert.

Vorbereitet auf `feat/training-plan-management-v1`; kein Commit, Push, Merge oder Deployment. Physischer iPhone-Test und Review stehen aus.


### Auftrag 53 – Review-Befunde der Planverwaltung behoben (unveröffentlicht)

- Tageswechsel und mindestens 60 Minuten Abwesenheit gelten wieder bei offenem Planeditor; notwendige Ansichtswechsel schützen geänderte Entwürfe über Speichern/Verwerfen/Abbrechen.
- Unberührte Übungsfelder und unveränderte Plannamen bleiben erhalten; keine automatische Bereinigung der Bibliothek beim Plan-Speichern.
- Gezielte Daten- und Browserregressionen für Lebenszyklus, Verwerfen globaler/neuer Übungen, MAX, Pointer/Touch und Löschkonflikte ergänzt. Shell v15 mit aktualisierten Prüfsummen vorbereitet.
- Weight, CSS, Viewport-Metadaten und Navigationshülle unverändert. Kein Commit, Push, Merge oder Deployment.


### Auftrag 55 – Training v16 UX (unveröffentlicht)

- Kompakte Plan-/Übungskarten, korrekte Anzahlbeschriftung, Zurück-Pfeil im Planeditor und Übernahme ausschließlich über den Verlassensdialog.
- Globale Übungsnamen und Gewichte direkt bearbeitbar, klare Positionsnummern und Sortiermeldung, kompakte einheitliche Hinzufügeaktionen.
- Alphabetische Bibliothek mit Suche und eigener Bearbeitungsansicht ohne Autofokus; MAX-/Wiederholungsfelder ausgeblendet, intern erhalten. Neue Übungen weiterhin mit zehn Wiederholungen.
- Diagnose ohne veraltete v14-Beschriftung; v16-Shell/Hash-Vorbereitung und Browserregressionen. Bei Code-Review Wiederholbarkeit einer fehlgeschlagenen Neuanlage im eigenen Übungseditor abgesichert.

Vorbereitet auf `feat/training-v16-ux`; kein Commit, Push, Merge oder Deployment.


### Auftrag 57 – Training v17: UI und Bedienbarkeit

- Nummernspalte links; Name, Gewicht und Sortier-/Entfernungsaktionen bündig rechts in Planübungskarten.
- Einheitliche schmale Gewichtseingaben mit „Gewicht“ und „kg“ daneben; kompakte Verwaltungsbuttons.
- Bibliotheksuche mit Lupe und Reset beim Verlassen; vollständige Liste beim erneuten Öffnen.
- Dropdown durch alphabetische, durchsuchbare Scrollliste mit Touch-Auswahl zum Planentwurf ersetzt.
- Neue mobile UI-/Auswahlregressionen, aktualisierte Dokumentation und v17-Shell-Prüfsummen. Geschützte Daten-/Entwurfslogik und Weight unverändert; keine Migration.


## 15.10.2026 – Auftrag 58: Training v18 Trainingslogik (unveröffentlicht)

- Aktive Reihenfolge beim erfolgreichen Speichern des zugehörigen Plans atomar synchronisiert, mit unveränderten Snapshot-Werten/Status und stabiler manueller Auswahl.
- Nach Abschluss erste nicht abgeschlossene Übung in aktueller Reihenfolge; übersprungene bleiben offen.
- Persistierte Trainingsaktivität und automatisches Verwerfen nach 60 Minuten; Prüfung bei Aktionen, Wiederaufnahme und Neustart einschließlich Offline. Keine Speicherung als abgeschlossen; dauerhafte Gewichte und Historie bleiben erhalten.
- Kontexte gegen veraltete Complete-/Skip-/Select-Aktionen, Schutz bei Speicherfehlern und zusätzliche Daten-/Browserregressionen. Shell v18/Prüfsummen vorbereitet.

Auf `feat/training-v18`; kein Commit, Push, Merge oder Deployment. Weight, Mindesthöhe und Navigationshülle unverändert. Auftrag 59 für Oberfläche/iOS-Navigationsdokumentation bleibt ausstehend.

### Training v18 – Auftrag 59 (vorbereitet, unveröffentlicht)

- Aktives Training: kompakte offene/abgeschlossene Karten, aktuelle Übung grün markiert, Gewichtsbearbeitung direkt in der Karte ohne sichtbare MAX-/Wiederholungsfelder und ohne Autofokus.
- Planeditor: Suche nach Hinzufügen leeren, expliziter Löschbutton und stabiler Eingabeknoten mit getrenntem Label. Übungsverwaltung mit oberem Zurück-Pfeil.
- Verbindliche iOS-v13-Hülle mit technischen Belegen, Grenzen und Checkliste in `docs/IOSNavigation.md`; keine Änderungen an ihrer Implementierung.

### Training v19 – Auftrag 61, Design-Upgrade Phase 1 (vorbereitet, unveröffentlicht)

- Trainingsübersicht mit laufendem Plan zuerst, grüner Aktiv-Kennzeichnung, laufender Dauer und direkter Fortsetzung; separaten Aktiv-Block entfernt. Die gespeicherte Planreihenfolge bleibt unverändert.
- Aktives Training mit markantem Titel, kompaktem Fortschrittskopf und eigener Hauptkarte für die aktuelle Übung. Übrige offene und abgeschlossene Übungen sind ruhiger gestaltet und bleiben in Planreihenfolge. Antippbares Hauptgewicht ersetzt den dauerhaften Bearbeitungstext.
- Lokales Typografie-, Flächen-, Abstands- und Aktionssystem; zurückhaltende Übergänge berücksichtigen reduzierte Bewegung. Rückweg heißt „Trainingsübersicht“.
- Diagnose im normalen Einstieg ausgeblendet; intern über `?diagnostics=1` einschließlich Offline-Einstieg weiterhin erreichbar. Worker v19 und alle 13 Shell-Prüfsummen vorbereitet. Keine Veröffentlichung im Rahmen dieses Auftrags.

### Training v20 – Auftrag 63 (vorbereitet, unveröffentlicht)

- Automatischer Abschluss bei vollständig erledigter Session: Dauer atomar einfrieren, Dialog nach Offline-/App-Neustart wiederherstellen, 60-Minuten-Abbruch für diesen Zustand ausnehmen.
- Explizites Speichern oder bestätigtes Verwerfen, auch bei manuellem vorzeitigem Beenden. Speicherfehler behalten Daten und Dialog; keine doppelten Historieneinträge. Übersprungene Übungen bleiben offen.
- Start und Trainingsübersicht zusammengeführt; alte Routen werden auf `start` geleitet. Plankarten, Einstellungen und Übungsaktionen kompakter; stabile Positionsnummern in allen drei Übungsbereichen.
- Worker v20 und alle 13 Shell-Prüfsummen vorbereitet. Weight, v13-/Viewport-/Tabbar-Regeln und iOS-Dokumentation unverändert; kein Commit, Push oder Deployment in diesem Auftrag.

### Training v21 – Auftrag 65 (vorbereitet, unveröffentlicht)

- Ganze offene Übungskarten als native Auswahlfläche statt separatem Pfeilbutton; schmaler grüner Akzent, dezente Druckrückmeldung und Tastaturfokus. Bestehende Maße, Texte und Status bleiben erhalten.
- Dezente Trennlinien zwischen abgeschlossenen Übungen; untere Trainingsaktionen als erkennbare, kompakte Buttons.
- Nur Aktionsabstände und „Weiter trainieren“ im Abschlussdialog angepasst. „Letztes Training“ kompakt vertikal, Einstellungen als drei antippbare Menüzeilen mit zentriertem Titel.
- Geschützte v20-Komponenten werden im Browser direkt gegen den veröffentlichten v20-Code verglichen. Trainingslogik, Daten, Weight und iOS-Hülle bleiben unverändert. Worker v21 und 13 Prüfsummen vorbereitet; keine Veröffentlichung im Rahmen dieses Auftrags.

### Training v22 – Auftrag 67 (vorbereitet, unveröffentlicht)

- Informationskarte „Letztes Training“ entfernt, Historie unverändert erhalten. Abschnitt „Trainingspläne“ und Titel „Aktives Training“ gezielt hervorgehoben; redundantes „Dein Training“ entfernt.
- Offene Karten ohne rechten grünen Streifen, weiterhin vollständig antippbar mit bestehender Rückmeldung. Unteren Abstand vor den Trainingsaktionen von 32 auf 20 px reduziert; „← Übersicht“ und „Training beenden“ stehen nebeneinander.
- Training-Tab führt immer zur obersten Trainingsübersicht. Die laufende Einheit bleibt erhalten und ist über „Training fortsetzen“ erreichbar; Wiederaufnahme-, Entwurfs- und Abschlussregeln bleiben bestehen.
- Worker v22 mit 13 Shell-Prüfsummen vorbereitet. Geschützte Komponenten werden direkt gegen v21 verglichen. Kein Commit, Push oder Deployment in diesem Auftrag.

### Training v23 – Auftrag 69 (vorbereitet, unveröffentlicht)

- Bei tatsächlichen Ansichtswechseln werden `#scrollArea` und `document.scrollingElement` synchron auf den Anfang gesetzt. Bisher wurde nur der Wrapper zurückgesetzt, obwohl die v13-Hülle auch das Dokument scrollen lässt.
- Kein Reset bei erneutem Anzeigen derselben Ansicht oder gewöhnlichen Trainings-/Formularänderungen; bestehende Fokus- und Entwurfsentscheidungen bleiben erhalten. CSS, HTML, Daten- und Speicherlogik unverändert.
- Der künstliche Scrollweg kurzer Seiten bleibt bewusst offen: viewportfüllende Content-Mindesthöhe plus zusätzliche 80-px-Navigationsreserve erzeugen im Browser einen Scrollüberschuss. Eine Beseitigung würde die ausdrücklich geschützte v13-Geometrie betreffen; kein Layout-Umbau oder Scroll-Clamping eingeführt.
- Qualitätssicherung: 78 automatisierte Tests und 13 Browser-Testläufe bestanden, einschließlich direkter v22-Fehlerreproduktion, synchroner Scrollprüfung und Schutzvergleich. Installierte iPhone-PWA weiterhin separat prüfen.
- Worker v23 und 13 Shell-Prüfsummen vorbereitet; kein Commit, Push oder Deployment in diesem Auftrag.

### Training v24 – Auftrag 71 (vorbereitet, unveröffentlicht)

- Automatische Auswahl berücksichtigt nach Abschluss und Überspringen nur regulär offene Übungen. Übersprungene Karten stehen dahinter in Planreihenfolge, bleiben gekennzeichnet und manuell auswählbar.
- Automatischer Abschluss und eingefrorene Dauer auch bei gemischten/vollständig übersprungenen Einheiten; Dialog zeigt tatsächliche Abschluss-/Überspringzahlen. Keine fingierten Abschlüsse.
- Gemäß ergänzender Nutzerentscheidung ermöglicht „Weiter trainieren“ aus dem automatischen Dialog ein explizites Nachholen. Atomarer, eng validierter Übergang, keine Öffnung bereits gespeicherter Historie.
- Vorhandene Statusfelder/Schema 1 beibehalten. Validierung, Inaktivitätsausnahme und Offline-Wiederaufnahme angepasst; alte Historie und globale Gewichte erhalten. HTML/CSS, Weight, iOS-Hülle und v23-Scrollregeln unverändert. Kurze Seiten unangetastet.
- Qualitätssicherung: 87 automatisierte Tests und 14 Browser-Testläufe bestanden, einschließlich Nachholen, Konflikten, Fehlerpfaden und vollständigem Offline-Prozessneustart.
- Worker v24 und 13 Shell-Prüfsummen vorbereitet. Kein Commit, Push oder Deployment.
