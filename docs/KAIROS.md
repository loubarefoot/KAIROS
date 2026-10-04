KAIROS – Projektgrundsätze und Regeln

1. Projektvision

KAIROS ist ein langfristig geplantes persönliches All-in-One-System.

Das langfristige Ziel ist eine zentrale App, die verschiedene persönliche Lebensbereiche in einzelnen Modulen abbildet und miteinander verbinden kann.

Auf dem Weg zu diesem Ziel werden die einzelnen Bereiche zunächst als eigenständige Module bzw. eigenständige Apps entwickelt.

Beispiele für Module sind:

* Kairos Weight
* Kairos Training
* Kairos Nutrition

Die einzelnen Module sollen von Anfang an so konzipiert werden, dass sie langfristig Teil eines gemeinsamen KAIROS-Systems werden können.

⸻

2. Grundprinzipien

KAIROS wird schrittweise entwickelt.

Dabei gelten insbesondere folgende Grundsätze:

* Einfachheit vor unnötiger Komplexität.
* Funktionierende Grundlagen vor zusätzlichen Funktionen.
* Jede Funktion soll einen nachvollziehbaren Zweck erfüllen.
* Bestehende funktionierende Funktionen werden nicht ohne Grund verändert.
* Neue Ideen werden nicht automatisch Teil der aktuellen Version.
* Entscheidungen werden bewusst getroffen und dokumentiert.
* KAIROS soll langfristig erweiterbar sein, ohne die aktuelle Version unnötig kompliziert zu machen.

⸻

3. V1-Regel

Die jeweilige V1 eines Moduls soll bewusst auf die notwendigen Kernfunktionen beschränkt bleiben.

Neue Ideen, zusätzliche Funktionen oder Verbesserungen, die für die aktuelle V1 nicht notwendig sind, werden zunächst gesammelt und für eine spätere Version zurückgestellt.

Eine Funktion wird nicht nur deshalb in die V1 aufgenommen, weil sie technisch möglich oder interessant ist.

Das Ziel einer V1 ist eine funktionierende, verständliche und stabile Grundlage – nicht die möglichst vollständige Umsetzung aller denkbaren Funktionen.

⸻

4. Source of Truth

Die Dokumentation ist die maßgebliche Quelle für den gewünschten Soll-Zustand von KAIROS.

Maßgebliche Quellen

* docs/Kairos.md
    → übergeordnete Projektregeln, Prinzipien und Entscheidungen
* docs/Development.md
    → Entwicklungs-, Git-, KI- und Workflow-Regeln
* jeweilige Modul-Dokumentation
    → Anforderungen, Funktionen, Verhalten und UI/UX des jeweiligen Moduls
* Modul-Code
    → technische Umsetzung des dokumentierten Soll-Zustands

Grundprinzip

Dokumentation beschreibt, was KAIROS tun und wie es sich verhalten soll. Der Code beschreibt, wie dieser Soll-Zustand technisch umgesetzt ist.

Der Code ist daher nicht die maßgebliche Quelle für Anforderungen.

Wenn beispielsweise in der Modul-Dokumentation festgelegt ist, dass ein Button unten rechts positioniert sein soll, der implementierte Code den Button aber oben links darstellt, liegt eine Abweichung in der Umsetzung vor. Die Dokumentation wird dadurch nicht automatisch geändert.

Änderungen an Anforderungen

Wenn sich eine Anforderung ändert, wird zunächst die entsprechende Dokumentation angepasst. Erst anschließend wird der Code entsprechend geändert und getestet.

Der reguläre Ablauf lautet:

Anforderung ändern → Dokumentation aktualisieren → Umsetzung anpassen → testen

Abweichungen zwischen Dokumentation und Code

Wenn Dokumentation und Code voneinander abweichen, darf die zuständige KI nicht eigenmächtig entscheiden, welche Variante künftig gelten soll.

* Entspricht der Code nicht der Dokumentation → Code muss im Rahmen eines entsprechenden Auftrags angepasst werden.
* Ist die Anforderung selbst nicht mehr aktuell → Dokumentation muss nach gemeinsamer Entscheidung geändert werden.
* Bei unklaren oder widersprüchlichen Anforderungen → Rückfrage statt eigenmächtiger Entscheidung.

Widersprüche zwischen Dokumentationsdateien

Wenn zwei Dokumentationsdateien widersprüchliche Anforderungen enthalten, darf nicht einfach anhand von Dateiname, Änderungsdatum oder persönlicher Einschätzung entschieden werden.

Der Widerspruch wird gemeldet und gemeinsam geklärt. Anschließend wird die maßgebliche Dokumentation entsprechend aktualisiert.

Grundsatz:

Die Dokumentation definiert den Soll-Zustand. Der Code setzt diesen Soll-Zustand um. Keine KI darf bei einem Widerspruch eigenmächtig eine neue Anforderung daraus ableiten.

5. Rollen der beteiligten KIs

ChatGPT

ChatGPT übernimmt gemeinsam mit dem Entwickler insbesondere:

* Projektplanung
* Produktdenken
* Anforderungsdefinition
* UI/UX-Konzeption
* Strukturierung des Projekts
* Kommunikation und Abstimmung
* Dokumentation von Entscheidungen
* Vorbereitung von Aufgaben für die Implementierung

ChatGPT trifft dabei keine wesentlichen Produktentscheidungen allein, sondern entwickelt diese gemeinsam mit dem Entwickler.

Claude

Claude übernimmt primär:

* Implementierung
* Entwicklung
* technische Umsetzung vorgegebener Anforderungen
* Arbeit am Code
* technische Prüfung der eigenen Umsetzung

Claude erhält konkrete Aufgaben und setzt diese entsprechend der vereinbarten Anforderungen um.

DeepSeek und weitere KIs

Weitere KIs können langfristig abhängig von ihren Fähigkeiten für unterschiedliche Aufgaben eingesetzt werden.

Insbesondere kann geprüft werden, ob sie sich für:

* Implementierung
* technische Alternativen
* Tests
* Code-Reviews
* Fehlersuche
* zweite Meinungen

oder andere Aufgaben eignen.

Die konkrete Rolle weiterer KIs wird erst anhand praktischer Erfahrungen festgelegt.

DeepSeek erhält zunächst keinen direkten Zugriff auf das GitHub-Repository. Eine spätere Änderung dieser Regel ist möglich, wenn dies bewusst entschieden wird.

⸻

6. Keine eigenmächtigen Änderungen

Eine KI darf keine wesentlichen Änderungen am Projekt eigenständig vornehmen.

Die KI arbeitet ausschließlich innerhalb der konkret erteilten Aufgabe und setzt nur die vereinbarten Änderungen um.

Wenn während der Arbeit zusätzliche Probleme, Fehler, Verbesserungspotenzial oder sinnvoll erscheinende Änderungen auffallen, darf und soll die KI darauf hinweisen und entsprechende Vorschläge machen.

Sie darf diese Änderungen jedoch nicht eigenständig umsetzen, sofern sie nicht Teil des erteilten Auftrags sind.

Insbesondere gilt:

Vorschlagen ist erlaubt. Eigenmächtig entscheiden und umsetzen ist nicht erlaubt.

Das gilt unabhängig davon, welche KI an einem Teil des Projekts arbeitet.

⸻

7. Änderungen an bestehenden Funktionen

Bestehende funktionierende Funktionen sollen grundsätzlich erhalten bleiben.

Bei Änderungen gilt:

* Nur die tatsächlich erforderlichen Bereiche werden verändert.
* Unabhängige Funktionen werden nicht ohne Grund angepasst.
* Eine Verbesserung darf nicht ungefragt andere Projektbereiche verändern.
* Bei Unsicherheit wird zunächst nachgefragt.
* Größere Änderungen werden vor der Umsetzung abgestimmt.

Das Ziel ist, dass jede Änderung nachvollziehbar bleibt und möglichst geringe unbeabsichtigte Auswirkungen auf bereits funktionierende Bestandteile hat.

⸻

8. Gemeinsame Entscheidungsfindung

Produktentscheidungen werden zwischen dem Entwickler und ChatGPT abgestimmt.

Eine KI darf technische oder konzeptionelle Möglichkeiten aufzeigen und Empfehlungen aussprechen.

Die endgültige Entscheidung über das Produkt, seine Funktionen und seine Gestaltung liegt jedoch beim Entwickler.

Eine KI darf eine Entscheidung nicht dadurch ersetzen, dass sie eine nicht ausdrücklich beauftragte Alternative einfach selbst implementiert.

⸻

9. Modularität

KAIROS wird modular entwickelt.

Jedes Modul soll zunächst eigenständig funktionieren können, gleichzeitig aber langfristig in das gemeinsame KAIROS-System integrierbar bleiben.

Module sollen deshalb möglichst klar voneinander getrennt und verständlich strukturiert sein.

Eine gemeinsame KAIROS-Architektur kann mit zunehmender Reife des Projekts schrittweise entstehen.

Die langfristige Vision darf dabei die Einfachheit der aktuellen V1 nicht unnötig beeinträchtigen.

⸻

10. Weiterentwicklung

KAIROS wird iterativ entwickelt.

Nach jeder funktionierenden Version können Erfahrungen, Probleme und neue Anforderungen gesammelt werden.

Neue Versionen entstehen auf Basis konkreter Erkenntnisse und bewusst getroffener Entscheidungen – nicht durch ungeplantes Hinzufügen immer weiterer Funktionen.

Die Entwicklung soll dadurch kontrolliert, nachvollziehbar und langfristig erweiterbar bleiben.
