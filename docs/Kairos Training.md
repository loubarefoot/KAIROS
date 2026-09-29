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
- eigene Übungen erstellen
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

Beim Öffnen der App soll zunächst eine kompakte Startansicht erscheinen.

Sie soll insbesondere beim ersten Öffnen des Tages beziehungsweise nach längerer Inaktivität als Einstieg dienen.

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

Die Trainingspläne werden in ihrer gespeicherten Reihenfolge dargestellt.

V1 benötigt noch keine Kennzeichnung „Empfohlen“, „Als Nächstes“ o. Ä.

Der Nutzer wählt selbst den gewünschten Trainingsplan.

Nach Auswahl eines Trainingsplans beginnt das aktive Training.

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

---

# 8. Übungen

Es soll eine grundlegende Liste häufiger Übungen vorhanden sein.

Zusätzlich muss der Nutzer jederzeit eigene Übungen erstellen können.

Eine Übung besitzt mindestens:

- Name
- aktuelles Gewicht
- Standard-Wiederholungszahl

Die Standard-Wiederholungszahl beträgt normalerweise 10.

Die Satzzahl wird nicht als regulärer Eingabewert benötigt.

Der Standardfall ist:

> 3 Sätze

Der Nutzer dokumentiert nicht jeden einzelnen Satz.

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

Anschließend wird die Übung dem Trainingsplan hinzugefügt.

---

# 10. Gewichtssystem

Das aktuelle Gewicht ist eine zentrale Eigenschaft der jeweiligen Übung.

Beispiel:

> Concentration Curls  
> aktuelles Gewicht: 18 kg

Wenn diese Übung in mehreren Trainingsplänen verwendet wird, wird überall dasselbe aktuelle Gewicht verwendet.

Eine Änderung des Gewichts in einem Training aktualisiert das aktuelle Gewicht der Übung global.

---

## 10.1 Gewicht während des Trainings ändern

Im aktiven Training wird das aktuelle Gewicht groß und prominent dargestellt.

Das Gewicht soll antippbar sein.

Beim Antippen öffnet sich eine einfache numerische Eingabemöglichkeit.

Der Nutzer gibt beispielsweise ein:

> 20

und bestätigt.

Danach wird das neue Gewicht gespeichert.

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

---

# 12. Aktives Training

Nach Auswahl eines Trainingsplans startet das aktive Training.

Beim Start wird automatisch ein Timer gestartet.

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

Danach wird automatisch die nächste Übung angezeigt.

Die einzelnen Sätze werden nicht separat dokumentiert.

Es ist für V1 nicht relevant, ob beispielsweise im dritten Satz nur 8 statt 10 Wiederholungen geschafft wurden.

Das Trainingsziel ist grundsätzlich 3 × 10.

---

# 14. Fortschrittsanzeige

Während eines aktiven Trainings soll ein einfacher Fortschrittsbalken angezeigt werden.

Beispiel:

> Übung 4 von 8
>
> ████████░░░░░░░░

Der Fortschritt orientiert sich zunächst an der Anzahl der Übungen.

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

Es soll nicht notwendig sein, einen zusätzlichen „Speichern“-Button zu drücken.

---

# 18. Trainingsdauer

Der Timer startet automatisch beim Start des Trainings.

Er läuft während der gesamten Trainingseinheit.

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

Eine vollständige Löschung der Übung wäre eine separate Aktion und darf nicht versehentlich durch „Aus Trainingsplan entfernen“ ausgelöst werden.

Dadurch kann eine Übung später wieder zu einem Trainingsplan hinzugefügt werden und besitzt weiterhin ihr zuletzt gespeichertes Gewicht.

---

# 21. Datenhaltung

V1 benötigt keine Cloud und kein Benutzerkonto.

Die Daten sollen lokal auf dem Gerät gespeichert werden.

Die App soll daher auch ohne Internetverbindung grundsätzlich nutzbar sein.

Die Datenstruktur soll trotzdem so aufgebaut werden, dass spätere Erweiterungen möglich sind.

Insbesondere sollen Trainingspläne, Übungen und absolvierte Trainingseinheiten logisch getrennt gespeichert werden.

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
