# KAIROS – Decision Log

## 11.10.2026 – Training V1: Produktentscheidungen präzisiert

Die vom Nutzer verbindlich bestätigten 17 Entscheidungen sind in [KairosTraining.md](KairosTraining.md) in die bestehenden Anforderungen eingearbeitet. Sie konkretisieren Fortsetzung laufender Einheiten, unveränderte laufende Pläne, Abschluss und Fortschritt, Übungsverwaltung und Eingaberegeln, Startansicht und Sortierung sowie Dialoge, Offline-Nutzung, JSON-Backup und Speicherfehler.

Grundlage ist die bestehende V1-Produktdefinition. Ziel der Präzisierung ist ein eindeutig prüfbarer Trainingsworkflow unter Erhalt der bestehenden Kernfunktionen und V1-Abgrenzung. Weight bleibt unverändert. Zum Zeitpunkt dieser Präzisierung ungeklärte Wechselwirkungen und Details wurden in Abschnitt 29 festgehalten; hierzu wurde keine zusätzliche Produktentscheidung getroffen.

Die Dokumentationsänderung stellt keine Implementierung oder Freigabe von Anwendungscode dar.

## 11.10.2026 – Training V1: Entscheidungen 18 bis 22

Die vom Nutzer verbindlich bestätigten Entscheidungen 18 bis 22 sind in [KairosTraining.md](KairosTraining.md) integriert:

- Laufende und bereits absolvierte Einheiten bleiben von Übungsänderungen und Löschungen unberührt; laufende Einheiten verwenden ihre beim Start festgelegten Übungsdaten.
- JSON-Import ist während einer laufenden Einheit gesperrt; Export bleibt verfügbar.
- Inaktivität beginnt beim Wechsel in den Hintergrund oder Verlassen von KAIROS. Nach mindestens 60 Minuten erscheint die Startseite; laufende Einheiten haben Vorrang.
- Vorgefertigte Übungen sind hinsichtlich Name, Gewicht, Wiederholungen und MAX vollständig bearbeitbar, aber nicht dauerhaft aus der Grundbibliothek löschbar.
- Beim Verlassen von MAX wird das vorherige numerische Gewicht wiederhergestellt; ohne vorheriges numerisches Gewicht bleibt der Wert leer.

Die Entscheidungen schließen die zuvor gemeldeten Fragen gezielt, ohne andere Anforderungen aufzuheben. Abschnitt 29 weist weiterhin die Abgrenzung zur Gewichtseingabe innerhalb einer laufenden Einheit, die Ansicht unterhalb der Inaktivitätsschwelle und die konkrete Auswahl der Grundbibliothek aus. Diese Details wurden nicht eigenständig entschieden. Keine Implementierungsfreigabe oder Änderung am Anwendungscode.

## 11.10.2026 – Training V1: Entscheidungen 23 bis 25

Die verbindlichen Entscheidungen sind in [KairosTraining.md](KairosTraining.md) integriert:

- Gewichtsänderungen unmittelbar während des Trainings werden sofort in der betroffenen Übung angezeigt und global für alle Pläne gespeichert. Übungsnamen und Übungsliste der laufenden Einheit bleiben wie beim Start festgelegt. Dies präzisiert Entscheidung 18 für die Gewichtseingabe innerhalb der Einheit.
- Ohne laufendes Training wird nach weniger als 60 Minuten Abwesenheit die zuletzt verwendete Ansicht wiederhergestellt. Ab 60 Minuten und beim ersten Öffnen des Tages erscheint die Startseite. Laufende Trainings haben immer Vorrang.
- Die Grundbibliothek umfasst ungefähr 50 Übungen für Brust, Rücken, Schultern, Arme, Beine, Bauch und Unterarme mit Maschinen, Kabelzügen, Kurz- und Langhanteln sowie Körpergewicht. Eigene Übungen bleiben möglich; vorgefertigte Übungen sind bearbeitbar, aber nicht dauerhaft löschbar.

Damit sind die bisher offenen Verhaltensfragen abgegrenzt. Die konkrete Übungsauswahl wird ausschließlich als Vorschlag zur Freigabe vorgelegt und noch nicht als verbindliche Liste dokumentiert. Es wurden keine zusätzlichen Produktfunktionen beschlossen und kein Anwendungscode implementiert.

## 11.10.2026 – Training V1: Grundbibliothek mit 52 Übungen freigegeben

Der Nutzer hat die vorgeschlagene Liste von 50 Übungen unverändert freigegeben und ausschließlich um „Beinbeugen liegend an der Maschine“ (Beine) sowie „Wrist Roller am Kabelzug“ (Unterarme) ergänzt. Damit ist die konkrete Auswahl der Grundbibliothek verbindlich festgelegt.

Alle 52 Übungen sind nach Muskelgruppen in [KairosTraining.md, Abschnitt 8.1](KairosTraining.md#81-verbindliche-grundbibliothek) dokumentiert. Der bisher ungefähre Umfang ist damit auf 52 Übungen konkretisiert; der ausstehende Freigabepunkt in Abschnitt 29 ist abgeschlossen. Die Bearbeitbarkeit und der Schutz vor dauerhafter Löschung vorgefertigter Übungen bleiben unverändert. Diese Freigabe betrifft die Dokumentation der Grundbibliothek, nicht die Implementierung.

## 11.10.2026 – Training: versionierter lokaler Datenbestand

Der beauftragte Datenmodell-Schritt verwendet logisch getrennte Bereiche innerhalb eines versionierten JSON-Dokuments unter `kairos.training.state`. Ein einzelner localStorage-Schreibvorgang verhindert teilweise gespeicherte Übungs-/Planbeziehungen. Weight-Daten bleiben vollständig getrennt.

Stabile IDs, unabhängige Momentaufnahmen und Schutz abgeschlossener Einheiten erhalten Trainingsdaten trotz späterer Stammdatenänderungen. Beschädigte oder inkompatible Daten sperren das Überschreiben; Schreibfehler erhalten ausstehende Änderungen im Arbeitsspeicher. Das technische Schema und seine Grenzen sind in [TrainingData.md](TrainingData.md) dokumentiert. Keine neue Produktfunktion und kein zusätzlicher Dienst.

## 11.10.2026 – Training: Abschluss erst nach erfolgreicher Speicherung

Der beauftragte Trainingsabschluss nutzt einen Commit-Pfad im vorhandenen Store. Im Gegensatz zu gewöhnlichen Änderungen wird sein Endzustand erst nach erfolgreicher Speicherung im Arbeitsspeicher übernommen. Dadurch bleibt die aktive Einheit bei Fehlern erhalten und wird nicht fälschlich als abgeschlossen dargestellt. Zusammenfassung und letztes Training beziehen sich auf den zuletzt tatsächlich gespeicherten Bestand. Schema und Speicherschlüssel bleiben erhalten; es entsteht keine zweite Datenhaltung.


## 11.10.2026 – Training: bestätigter JSON-Import als vollständige Ersetzung

Der beauftragte JSON-Import verwendet einen eigenen Ersetzungspfad im bestehenden Store unter `kairos.training.state`, ohne Schema-Wechsel oder zweite Datenhaltung. Die Datei wird vor der KAIROS-Bestätigung vollständig geprüft; der Store prüft beim Übernehmen erneut. Die bewusste Ersetzung unterscheidet sich von normalen Bearbeitungen, die abgeschlossene Einheiten und vorgefertigte Übungsidentitäten weiterhin schützen.

Ein einzelner erfolgreicher localStorage-Schreibvorgang geht der Übernahme in den Arbeitsspeicher voraus. Bei Fehlern bleiben bestehende Daten und ungespeicherte Änderungen erhalten. Änderungen während Bestätigung und externe Speicherkonflikte verhindern das Überschreiben. Export umfasst ausschließlich den aktuellen Training-Store, einschließlich etwaiger ausstehender Änderungen, und bleibt bei laufenden Einheiten verfügbar. Die bestehenden Produktanforderungen bleiben unverändert; technische Einzelheiten stehen in `TrainingData.md`.


## 11.10.2026 – Training: vollständige Offline-Version vor Aktivierung

Der beauftragte Offline-Start nutzt einen Service Worker ausschließlich im Training-Verzeichnis. Eine Shell-Version wird vor Installation vollständig geladen und anhand eingebetteter SHA-256-Prüfsummen geprüft. Neue Versionen warten auf das Schließen der bisherigen kontrollierten Seiten; es gibt keinen erzwungenen Wechsel während einer laufenden Anwendung. So bleiben bei teilweise ausgerollten oder beschädigten Dateien die bisherige Version und lokale Trainingsdaten erhalten. Version und Prüfsummen gehören künftig zu jeder Änderung an Shell-Dateien.

Die Startseitenlogik nutzt unverändert die vorhandenen drei Einstellungen und den lokalen Kalendertag. Der Hintergrund-/Verlassenszeitpunkt wird über Lifecycle-Ereignisse gespeichert. Ein sauberer Store kann externe Tab-Daten vor Wiedereintritt neu laden; ungespeicherte Änderungen behalten den bisherigen Konfliktschutz. Hosting- und iOS-Grenzen sind in `TrainingData.md` ausdrücklich dokumentiert, ohne Hosting-Einstellungen oder Produktregeln zu ändern.


## 11.10.2026 – Training: Cache-Inhalte unabhängig von Versionsnummer schützen

Die freigegebene Cache-Korrektur ergänzt den vorhandenen versionierten Scope-Cache um einen deterministischen Inhaltsfingerabdruck aus den Shell-Prüfsummen. Unterschiedliche Shells erhalten damit auch bei versehentlich gleicher Versionsnummer getrennte Caches; ein fehlgeschlagener Schreibvorgang darf nur den neu angelegten Inhaltscache entfernen. Identische vorhandene Inhalte werden vollständig geprüft und schreibfrei wiederverwendet. Der Fingerabdruck bleibt nach Worker-Neustarts stabil. Wartende Aktivierung, Training-Scope und lokale Trainingsdaten bleiben unverändert.

Die weiteren freigegebenen Korrekturen binden Gewichtsformulare an ihren ursprünglichen Kontext, vervollständigen Zeitvalidierung und erhalten Fokus bzw. zutreffende Übersichtszustände. Sie ändern keine Produktanforderungen oder gespeicherten Datenformate.


## 11.10.2026 – Training: eigenständige PWA im bestehenden Pages-Unterpfad

Der freigegebene Vorbereitungsauftrag ergänzt die Home-Screen-App unter `/KAIROS/Training/`. Eine feste Manifest-ID für diesen Pfad trennt die App-Identität von Weight; relative Ressourcen-, Start- und Scope-Pfade erhalten die statische Unterpfad-Auslieferung. Echte undurchsichtige PNGs unterstützen iOS ohne SVG-Daten-URL als Home-Screen-Icon. Manifest und Icons werden Teil der vollständig geprüften Offline-Shell.

Die bestehende Pages-Quelle `main`, `/(root)` bleibt erhalten. Eine spätere freigegebene Übernahme nach `main` löst die Veröffentlichung aus. Weight-Code, Training-Speicherschlüssel, Worker-Scope und wartende Updates bleiben unverändert. Noch kein Commit, Push, Merge oder Deployment; der konkrete Zusammenführungs- und Gerätetestplan steht in `TrainingPWA.md`.


## Auftrag 34 – Frischer Dokumentstart und Ansichtsmessung

Der ausdrückliche Auftrag präzisiert die frühere Wiederherstellung unter 60 Minuten: Sie gilt für die Rückkehr in ein bestehendes Dokument. Ein neu geladenes Dokument startet ohne aktive Einheit auf der Startseite; eine aktive Einheit hat weiterhin Vorrang. Der Dokument-lokale Initialisierungszustand genügt zur Unterscheidung, ohne neue gespeicherte Schemafelder einzuführen. BFCache erhält diesen Zustand und verwendet daher die Rückkehrregeln.

Die Navigationsdiagnose muss vor einem Wechsel zu Einstellungen messen. Ein kleiner Diagnoseknopf öffnet einen Bericht nach Erfassung der vorher sichtbaren Ansicht; automatische Messpunkte dokumentieren Ansicht/Scrollen im begrenzten Arbeitsspeicherprotokoll. Der Bericht selbst darf nicht als Messung der dahinterliegenden unveränderten Darstellung interpretiert werden. Navigation und Layout werden nicht korrigiert; die Daten dienen erst der Ursachenklärung.


## Auftrag 37 – Gemeinsame Scrollstruktur nach Weight-Referenz

Training übernimmt die Trennung von äußerem Scroll-/Safe-Area-Container und innerem Inhaltscontainer aus Weight für alle Ansichten. Die bisherige Zusammenlegung koppelte Mindesthöhe, Overflow und Inhaltsabstände in einer Box. Es werden keine numerischen Viewport-Kompensationen oder neuen Navigations-/Bottom-Abstände eingeführt. Die strukturelle Angleichung ist gezielt; die ursächliche Beteiligung am iOS-Viewport-Fehler bleibt bis zum Gerätetest offen.

Der temporäre Diagnoseknopf reserviert Platz im Inhaltsfluss. Das begrenzte Scrollprotokoll erhält Messungen vor dem Zurückscrollen zum Knopf. Der native Dialog hält Schließen und Kopieren außerhalb des scrollenden Berichts, damit kleine Viewports die Bedienelemente nicht abschneiden.


## Auftrag 45 – Mindesthöhe statt Testinhalt

Der erfolgreiche v12-Gerätetest begründet einen echten Dokument-Scrollbereich auch auf kurzen Training-Ansichten. Der gemeinsame äußere Container erhält eine Viewport-Mindesthöhe im Inhaltsbox-Modell: vorhandene Navigationsreserve bleibt außerhalb der Mindesthöhe, ohne neue Abstände. Die größte verfügbare Viewport-/Prozenthöhe verhindert das alleinige Zusammenziehen auf einen kleineren dynamischen Viewport. Alte Browser erhalten 100vh als Fallback. Lange Inhalte wachsen weiter natürlich; keine festen Gerätepixel oder JS-Höhensteuerung.

V12-Testblock vollständig entfernt. Die native iOS-Wirkung der minimalen Höhenregel bleibt vor Veröffentlichung beziehungsweise beim anschließenden Gerätetest zu bestätigen. Vorbereitung ohne Commit/Push/Merge gemäß Auftrag.


## 13.10.2026 – Auftrag 51: Gemeinsamer Trainingsplanentwurf

Der beauftragte Planeditor trennt einen lokalen Arbeitsspeicherentwurf vom Training-Store. Eine einzige bestätigte Speicheraktion übernimmt Plan und betroffene Übungsstammdaten atomar über den bestehenden Commit-Pfad. Globale Gewichte und unabhängige Trainingsmomentaufnahmen bleiben erhalten; Schema 1 und Speicherschlüssel ändern sich nicht. Konkurrierende Stammdatenänderungen weisen den Entwurf ab, statt fremde Änderungen zu überschreiben. Ein KAIROS-Dreiwege-Dialog schützt interne Ansichtswechsel. Betriebssystembedingtes Beenden kann Arbeitsspeicherentwürfe verlieren; es wird keine zusätzliche persistierte Entwurfsspeicherung eingeführt.

Implementierung auf dem Arbeitsbranch vorbereitet, noch nicht veröffentlicht.


### Auftrag 53 – Wiederaufnahme und Schutz unberührter Stammdaten

Die allgemeinen Tages-/60-Minuten-Regeln werden auch mit offenem Planeditor ausgewertet. Ein erforderlicher Wechsel wird bei Änderungen durch den vorhandenen Dreiwege-Dialog abgesichert; Abbrechen behält den Entwurf. Nur eine reguläre kurze Rückkehr zur Planverwaltung erhält den dokumentlokalen Editor unmittelbar. Das korrigiert die bisher zu weit gefasste Editor-Ausnahme. Beim Plan-Commit werden nur tatsächlich bearbeitete Übungsfelder übernommen und neue Übungen hinzugefügt; unveränderte Stammdaten werden nicht normalisiert. Keine neue Produktfunktion oder Datenmigration; weiterhin unveröffentlicht auf dem Arbeitsbranch.


## 13.10.2026 – Auftrag 55: Kompakte Verwaltungsoberflächen

Die beauftragte v16-Oberfläche speichert Planentwürfe ausschließlich nach ausdrücklicher Wahl im Verlassensdialog. Zurück-Pfeil und Tabs führen nach Speichern/Verwerfen zum gewählten Ziel. MAX und Wiederholungen entfallen in Planverwaltung/Bibliothek als sichtbare Eingaben; vorhandene Werte bleiben erhalten, neue Übungen verwenden zehn Wiederholungen. Die Suche und alphabetische Anzeige verändern keine gespeicherten Reihenfolgen. Die eigene Übungsansicht benötigt kein neues persistiertes Schemafeld. Die Diagnose trennt die Kennung geladener Diagnosefunktionen von dynamisch abgefragten Shell-Versionen. Noch keine Veröffentlichung.


## 13.10.2026 – Auftrag 57: Suchbare Übungsauswahl und einheitliche Gewichtsfelder

Der beauftragte v17-Schritt ersetzt nur die bisherige Dropdown-Bedienung durch eine alphabetische, scrollbare Suchliste. Auswählen fügt eine bestehende Übungs-ID zum lokalen Planentwurf hinzu; Übernahme erfolgt weiter ausschließlich durch den bestehenden Speichern/Verwerfen/Abbrechen-Dialog. Die Bibliotheksuche wird beim Verlassen zurückgesetzt. Schmale Gewichtsfelder mit rechtsstehendem „kg“ und eine separate Nummernspalte verbessern die Ausrichtung ohne Änderung von Datenformat, globalen Gewichten oder Navigationshülle.


## 15.10.2026 – Auftrag 58: Aktive Reihenfolge und Trainingsinaktivität

Der ausdrückliche v18-Auftrag präzisiert den bisherigen Snapshot-Schutz: Nur die Reihenfolge vorhandener aktiver Snapshots darf beim Speichern ihres Plans synchronisiert werden. Namen, Werte, Status und Mitgliedschaft bleiben erhalten; bereits abgeschlossene Einheiten ändern sich nicht. Nicht mehr im Plan enthaltene aktive Übungen bleiben hinten in ihrer relativen Reihenfolge; neue Planübungen gelten für das nächste Training. Nach Abschluss wird die erste nicht abgeschlossene Übung einschließlich übersprungener Einträge gewählt.

Ein optionales `lastActivityAt` an der aktiven Einheit bildet relevante Trainingsaktionen ab. Die Frist wird anhand dauerhaft gespeicherter Zeit geprüft, nicht anhand der Dauer eines JS-Timers. Reines Öffnen ist keine Aktivität. Für Altbestände ohne diesen Zeitstempel gilt der Start als letzter bekannter Aktivitätszeitpunkt, statt einen Zeitpunkt beim Öffnen zu erfinden. Nach mindestens 60 Minuten wird konfliktgeschützt verworfen, ohne Historieneintrag oder Verlust dauerhafter globaler Gewichte. Keine Umschreibung bestehender Historie; noch keine Veröffentlichung.

## Training v18 – Auftrag 59: Oberfläche und Navigationsreferenz

Aktive Übungen verwenden zwei gefilterte Ansichten derselben geordneten Momentaufnahme. Es wird kein zweiter Trainingszustand eingeführt. Gewichtsbearbeitung erhält die bestehenden internen MAX-/Wiederholungswerte und den ursprünglichen Konfliktkontext. Die iOS-v13-Hülle wird als verbindliche Referenz für neue Module in `IOSNavigation.md` dokumentiert; ihre Implementierung bleibt unverändert. Aussagen über die frühere schwarze Fläche werden auf technisch belegbare Geometrie und bestätigte Praxiserfahrung begrenzt.

## Training v19 – Phase 1: visuelle Hierarchie ohne neuen Trainingszustand

Die aktuelle Übung wird aus derselben v18-Momentaufnahme als separate Hauptkarte gerendert und aus der offenen Liste herausgefiltert. Die übrigen Gruppen behalten ihre Reihenfolge. Übersichtskarten ordnen ausschließlich ihre Darstellung um; `planOrder` bleibt unverändert. Bei inzwischen gelöschtem Ursprungsplan bleibt das laufende Training über eine Karte aus seiner Momentaufnahme erreichbar. Bestehende Timer-, Abbruch-, Konflikt- und Speicherlogik bleibt erhalten.

Neue Gestaltungsregeln gelten lokal für Übersicht und aktives Training. Die bewährte iOS-Hülle und Weight werden nicht angepasst. Diagnose ist ein ausdrücklicher interner Aufruf mit `?diagnostics=1`, statt Platz in der regulären Oberfläche zu belegen.

## Training v20 – eingefrorener Abschluss ohne zusätzliche Historienstruktur

Ein vollständiges Training verwendet bereits in `activeSession` die vorhandenen Felder `endedAt` und `durationMs`. Das Schema bleibt Version 1; neue Felder oder eine Bestandsmigration sind nicht nötig. Die Validierung erlaubt diesen ausstehenden Abschluss ausschließlich bei vollständig erledigten Übungen und schützt danach die gesamte Momentaufnahme vor Änderungen. Erst die explizite Speicherentscheidung verschiebt sie in die vorhandene Historie; bestätigtes Verwerfen entfernt ausschließlich die aktive Einheit.

Der letzte Übungsabschluss verwendet einen atomaren Commit, damit bei Schreibfehlern kein nur vorgetäuschter vollständiger Zustand entsteht. Vollständig erledigte Einheiten sind vom Inaktivitätsabbruch ausgenommen. Frühere v19-Einheiten bei 100 % verwenden beim Wiederaufnehmen den gespeicherten letzten Aktivitätszeitpunkt als bestmögliche vorhandene Endzeit (ohne Aktivitätszeitpunkt den Zeitpunkt der ersten erfolgreichen Wiederaufnahme). Historische Einträge bleiben unberührt.

`training` bleibt als eingehender Navigationswert alter Einstellungen/Backups akzeptiert, führt aber ausschließlich zur gemeinsamen Startseite `start`. Die zweite Inhaltsansicht entfällt. Übungsnummern werden aus der vollständigen Session-Reihenfolge berechnet, bevor die Ansicht nach Status filtert; neue Positionsfelder in Momentaufnahmen sind unnötig.

## Training v21 – native Auswahlfläche bei unveränderter Kartengeometrie

Die vorhandene native Auswahl-Schaltfläche wird transparent auf die gesamte offene Übungskarte ausgedehnt. Der sichtbare Pfeil entfällt, während zugänglicher Name, Enter-/Leertastenbedienung und derselbe bestehende Auswahlhandler erhalten bleiben. Reservierte Inhaltsbreite und Kartenmaße bleiben bewusst bestehen. Die Anpassungen verwenden ausschließlich lokale Komponentenregeln; es gibt keine Änderung an Trainings-, Speicher-, Navigations- oder Viewport-Logik.

## Training v23 – Dokument-Scroll nur bei tatsächlichem Ansichtswechsel

Die v13-Hülle wächst mit dem Inhalt; der Dokument-Scroller und `#scrollArea` sind nicht gleichzusetzen. Auftrag 69 erlaubt den gezielten synchronen Reset beider Scrollpositionen nach dem Umschalten der sichtbaren Ansicht und vor Fokus/Viewchange-Ereignis beziehungsweise Browser-Paint. Keine Timer, nachgelagerten Frame-Korrekturen, globalen Scroll-Listener oder Hüllenänderungen. Ein erneut angezeigter identischer Ansichtsname löst keinen Reset aus. Der bisherige Überschriftenfokus mit `preventScroll` bleibt erhalten.

Die kurze Seite erzeugt wegen `content-box`, viewportfüllender `min-height` und zusätzlicher 80-px-Reserve weiterhin einen dauerhaften Scrollbereich, gegebenenfalls erweitert durch obere Safe Area oder den größeren `lvh`. Das ist aus der Geometrie belegbar; daraus folgt keine vollständige Diagnose interner iOS-Compositing-Effekte. Eine Beseitigung benötigt einen eigenen freigegebenen Eingriff in die Referenzhülle samt installiertem iPhone-PWA-Test. Die Hülle und `IOSNavigation.md` bleiben in diesem Auftrag unverändert.

Für später vorgemerkt, ausdrücklich nicht implementiert: sichtbarer Seitentitel beziehungsweise Logo auf Trainings-/Einstellungsübersicht mit darunter scrollendem Inhalt. Keine Sticky-Header oder zusätzlichen Scrollcontainer in v23.
