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
