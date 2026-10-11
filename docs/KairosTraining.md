# Kairos – Training
## Technische Leistungsanforderung / Produktdefinition
### Version 1.0 – Prototyp

---

# 1. Zweck des Moduls

„Kairos – Training“ ist ein persönlicher Trainings-Tracker für das Fitnessstudio.

Das Modul soll zunächst die bisherige Nutzung einer einfachen Notizen-App ersetzen.

Der aktuelle Workflow des Nutzers besteht im Wesentlichen aus mehreren Notizen mit Trainingsplänen. In diesen Notizen stehen die Übungen in einer festen Reihenfolge und jeweils das aktuell verwendete Gewicht.

Kairos soll diesen Workflow nicht unnötig komplizieren, sondern ihn:

- übersichtlicher,
- optisch ansprechender,
- interaktiver,
- komfortabler beim Training

machen.

Der wichtigste Zweck von V1 ist daher:

> Der Nutzer soll seine Trainingspläne und Übungen verwalten können und während des Trainings schnell sehen, welches Gewicht er bei der jeweiligen Übung verwenden soll.

Zusätzliche Funktionen wie Historien, Statistiken, Fortschrittsdiagramme, Trainingsvorschläge und automatische Aktivitätsdaten sind ausdrücklich spätere Erweiterungen.

---

# 2. Grundprinzipien

## 2.1 Einfachheit

Die App soll den bestehenden einfachen Workflow verbessern und nicht unnötig komplizierter machen.

Während des Trainings soll der Nutzer möglichst wenig tippen müssen.

Die wichtigste Information während einer normalen Übung ist:

> Übungsname + aktuelles Gewicht

---

## 2.2 Freies Training

Es gibt keinen festen Wochenkalender.

Der Nutzer entscheidet selbst, welchen Trainingsplan er an welchem Tag ausführt.

Beispiel:

- Training A
- Training C
- Training B
- Training C
- Training A

Die App darf später Empfehlungen für das nächste Training geben, V1 benötigt diese Funktion jedoch noch nicht.

---

## 2.3 Übungen sind unabhängig von Trainingsplänen

Eine Übung ist ein eigenes Objekt und wird nicht pro Trainingsplan separat gespeichert.

Beispiel:

„Concentration Curls“ kann sowohl in Training A als auch in Training B enthalten sein.

Wenn das aktuelle Gewicht der Übung von 16 kg auf 18 kg geändert wird, gilt 18 kg anschließend für diese Übung überall.

Das Gewicht gehört zur Übung und nicht zum Trainingsplan.

Wird eine Übung aus einem Trainingsplan entfernt, wird die Übung selbst nicht gelöscht und ihr gespeichertes Gewicht bleibt erhalten.

Wenn die Übung später wieder zu einem Trainingsplan hinzugefügt wird, soll ihr zuletzt gespeichertes Gewicht wieder angezeigt werden.

---

# 3. Umfang von Version 1

## Muss in V1 funktionieren

- Trainingspläne erstellen
- Trainingspläne bearbeiten
- Trainingspläne löschen
- Trainingspläne benennen
- Beschreibung eines Trainingsplans hinterlegen
- Übungen zu Trainingsplänen hinzufügen
- eigene Übungen erstellen, bearbeiten, umbenennen und dauerhaft löschen
- Übungen aus Trainingsplänen entfernen
- Reihenfolge der Übungen verändern
- aktuelles Gewicht einer Übung speichern
- Gewicht während des Trainings ändern
- Training starten
- Übungen nacheinander anzeigen
- Übungen überspringen
- übersprungene Übungen als offen markieren
- übersprungene Übungen später nachholen
- Training beenden
- Trainingsdauer automatisch messen
- auch unvollständig beendete Trainings speichern
- Trainingsdaten lokal auf dem Gerät speichern
- laufende Trainingseinheiten lokal sichern und automatisch fortsetzen
- Trainingspläne manuell sortieren
- nach dem ersten erfolgreichen Laden vollständig offline nutzbar sein, einschließlich App-Start
- vollständigen JSON-Import und -Export bereitstellen
- Speicherfehler verständlich anzeigen und ungespeicherte Daten bestmöglich erhalten

## Nicht Bestandteil von V1

- detaillierte Trainingshistorie
- Fortschrittsdiagramme
- statistische Auswertungen
- automatische Trainingsvorschläge
- automatische Activity-/Wearable-Daten
- Laufen
- Radfahren
- GPS
- Kalorienverbrauch
- Apple Health / Garmin / Amazfit / Strava-Integration
- Cloud-Synchronisation
- Benutzerkonto
- Social Features

Diese Funktionen können später auf Basis der V1 erweitert werden.

---

# 4. Navigation

V1 verwendet eine einfache Bottom-Navigation mit zwei Bereichen:

1. Training
2. Einstellungen

Eine separate Statistik-Seite wird in V1 noch nicht benötigt.

Statistiken und Historie werden in einer späteren Version ergänzt.

---

# 5. Startseite / Training

Die kompakte Startansicht erscheint beim ersten Öffnen des Tages und nach mindestens 60 Minuten Inaktivität.

Die 60 Minuten Inaktivität beginnen, sobald KAIROS in den Hintergrund wechselt oder verlassen wird. Wird KAIROS ohne laufendes Training nach weniger als 60 Minuten Abwesenheit erneut geöffnet, wird die zuletzt verwendete Ansicht wiederhergestellt. Ab 60 Minuten erscheint die Startansicht. Beim ersten Öffnen des Tages erscheint ebenfalls die Startansicht; diese Regel hat Vorrang vor der Wiederherstellung der zuletzt verwendeten Ansicht.

Ein laufendes Training hat immer Vorrang vor der Startansicht und wird beim erneuten Öffnen direkt automatisch fortgesetzt (siehe Abschnitt 12).

Die Startansicht zeigt:

## Letztes Training

Beispiel:

> Letztes Training  
> Oberkörper A  
> 26.09.2026

Optional kann später zusätzlich die Trainingsdauer angezeigt werden.

## Trainingspläne

Darunter werden alle vorhandenen Trainingspläne aufgelistet.

Beispiel:

> Training A  
> Oberkörper  
> 8 Übungen

> Training B  
> Oberkörper  
> 8 Übungen

> Training C  
> Beine  
> 7 Übungen

Die Anzahl der Übungen wird automatisch aus den tatsächlich enthaltenen Übungen berechnet.

Die Trainingspläne werden in ihrer gespeicherten Reihenfolge dargestellt. Der Nutzer kann diese Reihenfolge manuell per Drag & Drop ändern. Sie wird lokal gespeichert und nicht automatisch durch die letzte Verwendung verändert.

V1 benötigt noch keine Kennzeichnung „Empfohlen“, „Als Nächstes“ o. Ä.

Der Nutzer wählt selbst den gewünschten Trainingsplan.

Nach Auswahl eines nicht leeren Trainingsplans beginnt das aktive Training. Leere Trainingspläne können nicht gestartet werden.

---

# 6. Trainingspläne

Trainingspläne können vom Nutzer vollständig selbst erstellt werden.

Ein Trainingsplan besitzt mindestens:

- Name
- Beschreibung
- Liste der Übungen
- Reihenfolge der Übungen

Beispiel:

> Training A  
> Oberkörper  
> 8 Übungen

Der Name und die Beschreibung dürfen frei eingegeben werden.

Es darf keine fest eingebaute Annahme geben, dass Trainingspläne zwingend „A“, „B“ oder „C“ heißen.

Der Nutzer könnte beispielsweise auch folgende Namen verwenden:

- Montag
- Oberkörper
- Beine
- Push
- Pull
- Ganzkörper

Leere Trainingspläne dürfen erstellt und gespeichert, aber nicht gestartet werden.

Jede Übung darf innerhalb eines Trainingsplans nur einmal vorkommen. Dieselbe Übung kann weiterhin in mehreren Trainingsplänen verwendet werden.

---

# 7. Trainingsplan bearbeiten

Es soll einen zentralen Bereich zur Verwaltung der Trainingspläne geben.

Dort können:

- neue Trainingspläne erstellt werden
- bestehende Trainingspläne bearbeitet werden
- Trainingspläne gelöscht werden
- Übungen hinzugefügt werden
- Übungen entfernt werden
- die Reihenfolge der Übungen verändert werden

Die Reihenfolge soll möglichst komfortabel per Drag & Drop bzw. Drücken und Verschieben verändert werden können.

Beispiel:

> ☰ Butterfly  
> ☰ Bankdrücken  
> ☰ Cable Row  
> ☰ Hammer Curls

Der Nutzer kann die Reihenfolge jederzeit ändern.

Die Änderung betrifft den Trainingsplan und nicht die Übung selbst.

Änderungen an Trainingsplänen während einer laufenden Einheit gelten erst für das nächste Training. Die laufende Einheit behält den beim Start geltenden Plan mit seiner Übungsliste und Reihenfolge. Globale Gewichtsänderungen gemäß Abschnitt 10 bleiben davon unberührt.

---

# 8. Übungen

Training V1 enthält eine verbindlich freigegebene Grundbibliothek mit 52 Fitnessübungen gemäß Abschnitt 8.1. Sie deckt Brust, Rücken, Schultern, Arme, Beine, Bauch und Unterarme ab und berücksichtigt Maschinen, Kabelzüge, Kurz- und Langhanteln sowie Körpergewichtsübungen.

Zusätzlich muss der Nutzer jederzeit eigene Übungen erstellen, bearbeiten und umbenennen können. Eigene Übungen können dauerhaft gelöscht werden (siehe Abschnitt 20). Vorgefertigte Übungen bleiben Bestandteil der Grundbibliothek.

Doppelte Übungsnamen sind innerhalb der gesamten Übungsbibliothek nicht erlaubt. Beim Vergleich werden Groß-/Kleinschreibung sowie führende, abschließende und überflüssige Leerzeichen zwischen Wörtern ignoriert. Diese Regel gilt auch beim Umbenennen eigener und vorgefertigter Übungen.

Vorgefertigte Übungen dürfen hinsichtlich Name, Gewicht, Wiederholungen und MAX-Modus vollständig bearbeitet werden. Sie können jedoch nicht dauerhaft aus der Grundbibliothek gelöscht werden.

Eine Übung besitzt mindestens:

- Name
- aktuelles Gewicht
- Standard-Wiederholungszahl

Die Standard-Wiederholungszahl beträgt normalerweise 10.

Die Satzzahl wird nicht als regulärer Eingabewert benötigt.

Der Standardfall ist:

> 3 Sätze

Der Nutzer dokumentiert nicht jeden einzelnen Satz.

## 8.1 Verbindliche Grundbibliothek

Die folgende Liste ist freigegeben. Die ursprünglichen 50 Übungsnamen wurden unverändert übernommen und ausschließlich um „Beinbeugen liegend an der Maschine“ und „Wrist Roller am Kabelzug“ ergänzt.

### Brust (7 Übungen)

- Bankdrücken mit Langhantel
- Bankdrücken mit Kurzhanteln
- Schrägbankdrücken mit Kurzhanteln
- Brustpresse an der Maschine
- Butterfly an der Maschine
- Brustfliegen am Kabelzug
- Liegestütze

### Rücken (8 Übungen)

- Latzug zur Brust
- Klimmzüge
- Rudern sitzend am Kabelzug
- Rudern an der Maschine
- Einarmiges Rudern mit Kurzhantel
- Vorgebeugtes Rudern mit Langhantel
- Überzüge am Kabelzug mit gestreckten Armen
- Rückenstrecken an der Maschine

### Schultern (7 Übungen)

- Schulterdrücken mit Kurzhanteln
- Schulterpresse an der Maschine
- Seitheben mit Kurzhanteln
- Einarmiges Seitheben am Kabelzug
- Reverse Butterfly an der Maschine
- Face Pulls am Kabelzug
- Schulterheben mit Kurzhanteln

### Arme (9 Übungen)

- Bizepscurls mit SZ-Stange
- Bizepscurls mit Kurzhanteln
- Hammercurls mit Kurzhanteln
- Konzentrationscurls mit Kurzhantel
- Bizepscurls am Kabelzug
- Trizepsdrücken am Kabelzug mit Seil
- Trizepsstrecken über Kopf am Kabelzug
- Trizepsstrecken liegend mit SZ-Stange
- Dips am Barren

### Beine (12 Übungen)

- Kniebeugen mit Langhantel
- Beinpresse
- Hackenschmidt-Kniebeugen an der Maschine
- Beinstrecken an der Maschine
- Beinbeugen sitzend an der Maschine
- Rumänisches Kreuzheben mit Langhantel
- Ausfallschritte mit Kurzhanteln
- Hüftheben mit Langhantel
- Hüftabduktion an der Maschine
- Hüftadduktion an der Maschine
- Wadenheben stehend an der Maschine
- Beinbeugen liegend an der Maschine

### Bauch (5 Übungen)

- Crunches am Boden
- Bauchpresse an der Maschine
- Crunches am Kabelzug
- Knieheben hängend
- Umgekehrte Crunches am Boden

### Unterarme (4 Übungen)

- Handgelenkcurls mit Kurzhanteln
- Umgekehrte Handgelenkcurls mit Kurzhanteln
- Reverse Curls mit SZ-Stange
- Wrist Roller am Kabelzug

---

# 9. Übung zu Trainingsplan hinzufügen

Beim Hinzufügen einer Übung kann der Nutzer:

- eine vorhandene Übung auswählen
- eine neue eigene Übung erstellen

Beim Hinzufügen einer neuen Übung sollen Name und initiales Gewicht direkt eingegeben werden können.

Das Gewicht darf auch leer bleiben und später während des ersten Trainings festgelegt werden.

Beispiel:

> Übung: Hammer Curls  
> Gewicht: 17,5 kg  
> Wiederholungen: 10

Anschließend wird die Übung dem Trainingsplan hinzugefügt, sofern sie dort noch nicht enthalten ist. Für neue Übungen gelten die Namensregeln aus Abschnitt 8 und die Gewichtseingaberegeln aus Abschnitt 10.

---

# 10. Gewichtssystem

Das aktuelle Gewicht ist eine zentrale Eigenschaft der jeweiligen Übung.

Beispiel:

> Concentration Curls  
> aktuelles Gewicht: 18 kg

Wenn diese Übung in mehreren Trainingsplänen verwendet wird, wird überall dasselbe aktuelle Gewicht verwendet.

Eine Änderung des Gewichts in einem Training aktualisiert das aktuelle Gewicht der Übung global.

---

## 10.1 Gewichtseingabe

Numerische Trainingsgewichte werden in 0,25-kg-Schritten eingegeben. 0 kg ist erlaubt. Dezimalkomma und Dezimalpunkt werden akzeptiert, beispielsweise `17,5` und `17.5`.

Ein Gewicht darf leer bleiben. Ein leerer Wert ist von 0 kg und vom MAX-Modus zu unterscheiden. Die Eingaberegeln gelten sowohl beim Erstellen und Bearbeiten einer Übung als auch während des Trainings.

---

## 10.2 Gewicht während des Trainings ändern

Im aktiven Training wird das aktuelle Gewicht groß und prominent dargestellt.

Das Gewicht soll antippbar sein.

Beim Antippen öffnet sich eine einfache numerische Eingabemöglichkeit.

Der Nutzer gibt beispielsweise ein:

> 20

und bestätigt.

Danach wird das neue Gewicht unmittelbar in der betroffenen Übung der laufenden Einheit angezeigt und gleichzeitig global gespeichert. Das neue Gewicht gilt auch für alle anderen Trainingspläne. Die beim Trainingsstart festgelegten Übungsnamen und die Übungsliste bleiben unverändert. Bei Speicherfehlern gilt Abschnitt 21.3.

V1 benötigt keine Plus-/Minus-Stepper.

Grund:

Verschiedene Übungen und Geräte besitzen unterschiedliche Gewichtsschritte. Ein universeller Stepper wäre daher nicht zuverlässig.

---

# 11. Maximalgewicht

Ein Sonderfall besteht bei Übungen, bei denen das maximale Gerätegewicht erreicht wurde.

In diesem Fall wird statt eines konkreten Gewichts:

> MAX

angezeigt.

Beispiel:

> Rückenstrecker  
> MAX  
> 3 × 12

Sobald eine Übung auf MAX steht, wird nicht mehr das Gewicht erhöht.

Stattdessen wird die Wiederholungszahl gesteigert.

Bei normalen Übungen gilt weiterhin:

> aktuelles Gewicht  
> Standard: 3 × 10

Die Wiederholungszahl wird im normalen Fall nicht prominent dargestellt.

Sobald MAX erreicht ist, wird die Wiederholungszahl zu einer relevanten Information und soll entsprechend sichtbar bzw. bearbeitbar sein.

Die Implementierung muss daher eine Übung sowohl mit einem numerischen Gewicht als auch mit dem Zustand „MAX“ speichern können.

Für die Eingabe von MAX soll eine eigene, klar erkennbare UI-Möglichkeit vorhanden sein.

Es soll nicht erforderlich sein, über das normale numerische iPhone-Tastenfeld einen Textwert wie „MAX“ einzugeben.

Beim Wechsel in den MAX-Modus bleibt das vorherige Gewicht gespeichert. Beim Zurückwechseln wird ein vorhandenes vorheriges numerisches Gewicht wiederhergestellt. War zuvor kein numerisches Gewicht eingetragen, bleibt das Gewicht nach Verlassen des MAX-Modus leer.

---

# 12. Aktives Training

Nach Auswahl eines nicht leeren Trainingsplans startet das aktive Training.

Beim Start wird automatisch ein Timer gestartet.

Laufende Trainingseinheiten werden lokal gesichert und nach erneutem Öffnen automatisch fortgesetzt. Der Fortschritt einschließlich abgeschlossener und übersprungener bzw. offener Übungen sowie die Trainingszeit bleiben erhalten. Die Fortsetzung setzt weder den Fortschritt noch die Zeit zurück.

Für Änderungen am Trainingsplan während einer laufenden Einheit gilt Abschnitt 7.

Änderungen und Löschungen von Übungen außerhalb der laufenden Einheit beeinflussen diese nicht. Die laufende Einheit verwendet weiterhin die beim Trainingsstart festgelegten Übungsdaten. Eine Ausnahme sind Gewichtsänderungen unmittelbar während des laufenden Trainings: Sie werden gemäß Abschnitt 10.2 sofort in der betroffenen Übung angezeigt und gleichzeitig global gespeichert. Die beim Start festgelegten Übungsnamen und die Übungsliste bleiben dabei unverändert. Bereits absolvierte Einheiten bleiben ebenfalls unverändert.

Der Nutzer soll die Übungen grundsätzlich in der gespeicherten Reihenfolge durchgehen.

Der aktuelle Screen soll möglichst übersichtlich sein.

Beispiel:

> Training A
>
> Übung 2 von 8
>
> **Hammer Curls**
>
> **17,5 kg**
>
> 3 × 10
>
> [ Übung abgeschlossen ]
>
> Überspringen

Das Gewicht soll visuell die wichtigste Information sein und groß dargestellt werden.

Der Übungsname muss ebenfalls eindeutig und gut lesbar sein.

Die Wiederholungszahl 10 muss bei normalen Übungen nicht prominent dargestellt werden.

---

# 13. Übung abschließen

Nach Abschluss einer Übung kann der Nutzer auf:

> Weiter

bzw.

> Übung abgeschlossen

tippen.

Danach wird automatisch die nächste Übung angezeigt, sofern eine nächste Übung vorhanden ist. Auch nach Abschluss aller Übungen bleibt das Training aktiv, bis der Nutzer es ausdrücklich beendet (siehe Abschnitt 17).

Die einzelnen Sätze werden nicht separat dokumentiert.

Es ist für V1 nicht relevant, ob beispielsweise im dritten Satz nur 8 statt 10 Wiederholungen geschafft wurden.

Das Trainingsziel ist grundsätzlich 3 × 10.

---

# 14. Fortschrittsanzeige

Während eines aktiven Trainings soll ein einfacher Fortschrittsbalken angezeigt werden.

Beispiel:

> 4 von 8 Übungen abgeschlossen
>
> ████████░░░░░░░░

Der Fortschrittsbalken zählt ausschließlich abgeschlossene Übungen im Verhältnis zur Gesamtzahl der Übungen der laufenden Einheit. Übersprungene Übungen bleiben offen und erhöhen den Fortschritt erst, wenn sie nachgeholt und abgeschlossen wurden. Die Position der aktuell angezeigten Übung ist nicht mit der Anzahl abgeschlossener Übungen gleichzusetzen.

---

# 15. Übungen überspringen

Da im Fitnessstudio Geräte oder Maschinen gelegentlich belegt sind, muss eine Übung übersprungen werden können.

Beispiel:

> Butterfly

[ Überspringen ]

Danach wird mit der nächsten Übung fortgefahren.

Die übersprungene Übung bleibt jedoch als offen markiert.

Sie darf nicht einfach aus dem Training verschwinden.

Am Ende bzw. innerhalb des weiteren Trainings muss erkennbar sein, dass diese Übung noch offen ist.

Der Nutzer soll sie später nachholen können.

Beispiel:

> Butterfly  
> Übersprungen  
> [ Jetzt nachholen ]

Der Grund für das Überspringen muss in V1 nicht direkt abgefragt werden.

---

# 16. Training vorzeitig beenden

Ein Training kann jederzeit beendet werden.

Auch ein Training, bei dem nur wenige Übungen absolviert wurden, wird gespeichert.

Beispiel:

> 3 von 8 Übungen abgeschlossen  
> Dauer: 27 min

Es gibt keinen Mindestumfang, ab dem ein Training gespeichert werden muss.

Auch kurze oder unvollständige Trainingseinheiten sind gültige Daten.

V1 benötigt noch keine Pflichtangabe für den Grund des vorzeitigen Beendens.

Eine optionale Notiz kann später ergänzt werden.

---

# 17. Trainingsabschluss

Das Training muss ausdrücklich durch den Nutzer beendet werden, auch wenn bereits alle Übungen abgeschlossen sind. Ein vorzeitiges Beenden ist jederzeit möglich.

Wenn das Training beendet wird, soll eine kurze Zusammenfassung angezeigt werden.

Beispielsweise:

> Training abgeschlossen
>
> Oberkörper A
>
> Dauer: 63 min
>
> Übungen: 8 / 8

Bei einem unvollständigen Training entsprechend:

> Übungen: 5 / 8

Das Training wird anschließend automatisch gespeichert.

Es soll nicht notwendig sein, einen zusätzlichen „Speichern“-Button zu drücken. Bei einem Speicherfehler gelten die Anforderungen aus Abschnitt 21.3; ein fehlgeschlagener Speichervorgang darf nicht als erfolgreich dargestellt werden.

---

# 18. Trainingsdauer

Der Timer startet automatisch beim Start des Trainings.

Er läuft während der gesamten Trainingseinheit. Erneutes Öffnen und automatische Fortsetzung dürfen die bereits erfasste Trainingszeit nicht zurücksetzen.

Beim Beenden des Trainings wird die Dauer automatisch gespeichert.

Beispiel:

> Start: 18:03  
> Ende: 19:07  
> Dauer: 64 min

Die Trainingsdauer soll später für Statistiken und Wochenübersichten verwendet werden können.

Eine manuelle Eingabe der Trainingsdauer ist nicht notwendig.

---

# 19. Einstellungen

Die Einstellungen enthalten mindestens einen Bereich:

> Trainingspläne

Dort können alle Trainingspläne verwaltet werden.

Der Bereich dient insbesondere zum:

- Erstellen
- Bearbeiten
- Löschen
- Hinzufügen von Übungen
- Entfernen von Übungen
- Ändern der Reihenfolge

Während eines aktiven Trainings kann ein kleines Zahnrad bzw. ein entsprechender Button als direkter Einstieg in die Trainingsplanverwaltung angeboten werden.

Der Nutzer soll dadurch nicht gezwungen sein, das Training komplett zu verlassen, wenn ihm auffällt, dass ein Trainingsplan angepasst werden muss.

---

# 20. Übung entfernen vs. Übung löschen

Diese beiden Aktionen müssen strikt getrennt sein.

## Aus Trainingsplan entfernen

Die Übung wird nur aus diesem Trainingsplan entfernt.

Die Übung selbst bleibt erhalten.

Das gespeicherte Gewicht bleibt ebenfalls erhalten.

## Übung löschen

Eigene Übungen können als separate Aktion dauerhaft gelöscht werden. Diese Aktion darf nicht versehentlich durch „Aus Trainingsplan entfernen“ ausgelöst werden.

Eine dauerhaft gelöschte eigene Übung wird aus allen Trainingsplänen entfernt. Laufende Trainingseinheiten verwenden weiterhin die beim Start festgelegten Übungsdaten gemäß Abschnitt 12. Bereits absolvierte Trainingseinheiten bleiben unverändert. Vorgefertigte Übungen können nicht dauerhaft aus der Grundbibliothek gelöscht werden.

Nur beim Entfernen aus einem Trainingsplan bleibt die Übung mit ihrem zuletzt gespeicherten Gewicht zum späteren erneuten Hinzufügen erhalten.

---

# 21. Datenhaltung

V1 benötigt keine Cloud und kein Benutzerkonto.

Die Daten sollen lokal auf dem Gerät gespeichert werden.

## 21.1 Lokale Speicherung und Offline-Nutzung

Training V1 soll nach dem ersten erfolgreichen Laden vollständig offline nutzbar sein, einschließlich App-Start. Der bestehende Weight Tracker bleibt unverändert.

Die Datenstruktur soll trotzdem so aufgebaut werden, dass spätere Erweiterungen möglich sind.

Insbesondere sollen Trainingspläne, Übungen und absolvierte Trainingseinheiten logisch getrennt gespeichert werden. Auch laufende Einheiten müssen für die automatische Fortsetzung gemäß Abschnitt 12 lokal gesichert werden.

## 21.2 JSON-Import und -Export

Training V1 erhält einen vollständigen JSON-Import und -Export seiner lokal gespeicherten Trainingsdaten.

Während einer laufenden Trainingseinheit ist der JSON-Import gesperrt. Der JSON-Export bleibt verfügbar.

Beim Import werden vorhandene Daten erst nach Bestätigung durch den Nutzer überschrieben. Die Bestätigung verwendet einen eigenen KAIROS-Dialog gemäß Abschnitt 22. Ungültige Dateien dürfen bestehende Daten nicht verändern.

## 21.3 Speicherfehler

Bei Speicherfehlern wird eine verständliche Fehlermeldung angezeigt. Ungespeicherte Daten sollen bestmöglich erhalten bleiben. Fehlgeschlagene Speichervorgänge dürfen nicht als erfolgreich dargestellt werden. Diese Anforderungen gelten auch für die Sicherung laufender Einheiten, den Trainingsabschluss und den Import.

---

# 22. Design / UI

Kairos Training soll optisch Teil der späteren Kairos-Produktfamilie sein.

Die bestehende Designphilosophie von Kairos Weight soll grundsätzlich übernommen werden:

- dunkles Anthrazit
- klare Typografie
- abgerundete Karten und UI-Elemente
- einfache, übersichtliche Struktur
- moderne, reduzierte Optik
- keine unnötige visuelle Überladung

Die Module dürfen eine eigene Akzentfarbe besitzen.

Für Training ist als Akzentfarbe **Grün** vorgesehen.

Die Akzentfarbe darf insbesondere für:

- aktive Elemente
- Buttons
- Hervorhebungen
- Fortschrittsanzeigen
- ausgewählte Zustände

verwendet werden.

Der restliche visuelle Aufbau soll sich an Kairos Weight orientieren.

Für Bestätigungen werden eigene KAIROS-Dialoge gemäß `DesignSystem.md` verwendet. Standard-Browserdialoge werden nicht verwendet.

---

# 23. Mobile First

Kairos Training ist primär für die Nutzung auf dem Smartphone gedacht.

Alle Bedienelemente müssen mit dem Finger komfortabel bedienbar sein.

Insbesondere während des Trainings:

- große Touch-Flächen
- gut lesbare Schrift
- klare Buttons
- möglichst wenige Eingaben
- keine unnötig kleinen Bedienelemente

Der Nutzer soll die App während des Trainings schnell und ohne unnötige Interaktion bedienen können.

---

# 24. Erweiterbarkeit

V1 soll bewusst einfach bleiben, aber die Datenstruktur darf spätere Erweiterungen nicht unnötig erschweren.

Geplante spätere Erweiterungen sind unter anderem:

## V2+

- Trainingshistorie
- Fortschrittsdiagramme pro Übung
- Gewichtsverlauf
- letzte Steigerung
- Trainingsstatistiken
- Wochenübersichten
- Trainingsvorschläge
- automatische Erkennung des nächsten Trainings

## Später

- Laufen
- Radfahren
- weitere Sportarten
- Activity Tracking
- automatische Datenübernahme von Wearables
- Herzfrequenz
- Distanz
- Geschwindigkeit
- aktive Kalorien
- Apple Health / andere Schnittstellen
- gemeinsame Kairos-Datenbasis
- Dashboard

Diese Funktionen sollen in V1 noch nicht implementiert werden.

---

# 25. Wichtig – Entwicklungsumfang des ersten Prototyps

Der erste Prototyp muss nicht das komplette zukünftige Kairos Training enthalten.

Priorität hat ausschließlich ein funktionierender Trainingsworkflow:

1. App öffnen
2. Trainingsplan auswählen
3. Training starten
4. aktuelle Übung anzeigen
5. aktuelles Gewicht anzeigen
6. Übung abschließen
7. zur nächsten Übung wechseln
8. Übung überspringen können
9. übersprungene Übung später nachholen können
10. Gewicht ändern können
11. Training beenden können
12. Trainingsdauer automatisch erfassen
13. Training und Änderungen lokal speichern
14. Trainingspläne und Übungen verwalten können

Wenn dieser Workflow zuverlässig funktioniert, ist V1 als Prototyp erfolgreich.

---

# 26. Entwicklungsprinzip

Nicht unnötig überengineeren.

Der aktuelle Zweck ist ein funktionierender Prototyp, der anschließend im realen Fitnessstudio getestet wird.

Die erste Version soll deshalb lieber:

- einfach,
- stabil,
- verständlich,
- schnell bedienbar

sein als bereits alle später geplanten Funktionen enthalten.

Nach dem ersten Praxistest werden UX-Probleme, fehlende Funktionen und unnötige Elemente identifiziert und in späteren Iterationen verbessert.

---

# 27. Nicht verändern

Die folgenden Punkte sind keine optionalen Vorschläge, sondern gehören zum grundlegenden Konzept:

- Übungen haben ein globales aktuelles Gewicht.
- Ein Gewicht gilt daher über alle Trainingspläne hinweg.
- Trainingspläne bestimmen nur, welche Übungen in welcher Reihenfolge verwendet werden.
- Übungen können aus einem Plan entfernt werden, ohne gelöscht zu werden.
- Trainingspläne sind frei und nicht an Wochentage gebunden.
- Der Nutzer kann Übungen überspringen.
- Übersprungene Übungen bleiben offen und können später nachgeholt werden.
- Trainings können auch unvollständig gespeichert werden.
- Die Trainingsdauer wird automatisch gemessen.
- V1 bleibt auf Fitnessstudio-Training beschränkt.
- V1 enthält noch keine komplexen Statistiken oder Activity-Integrationen.

---

# 28. Ziel von V1

Das Ergebnis soll sich anfühlen wie:

> „Meine bisherige Trainings-Notiz – nur als richtige App.“

Der Nutzer soll nach kurzer Eingewöhnung im Fitnessstudio nicht darüber nachdenken müssen, wie die App funktioniert.

Er soll sie öffnen, seinen Trainingsplan auswählen, Übung für Übung durchgehen und jederzeit sofort wissen:

> Welche Übung ist jetzt dran?
>
> Welches Gewicht verwende ich?
>
> Was kommt danach?

Alles Weitere ist Erweiterung.


---

# 29. Stand der Anforderungsdefinition

Die Entscheidungen 23 bis 25 klären die unmittelbare Anzeige und globale Speicherung von Gewichtsänderungen während des Trainings, die Wiederherstellung der zuletzt verwendeten Ansicht bei weniger als 60 Minuten Abwesenheit sowie Umfang und Abdeckung der Grundbibliothek. Die Anforderungen sind in den Abschnitten 5, 8, 10.2 und 12 integriert. Die zuvor hier dokumentierten offenen Verhaltensfragen sind damit geklärt.

Die konkrete Grundbibliothek mit 52 Übungen ist freigegeben und in Abschnitt 8.1 verbindlich dokumentiert. Die zuvor ausstehende Freigabe der Übungsauswahl ist damit abgeschlossen.
