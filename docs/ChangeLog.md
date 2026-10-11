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
