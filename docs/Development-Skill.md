KAIROS Development Skill

Zweck

Dieser Skill definiert die praktische Arbeitsweise eines KI-Agenten bei der Entwicklung von KAIROS.

Er ergänzt die bestehenden KAIROS-Dokumentationen:

* docs/Kairos.md – übergeordnete Vision, Prinzipien und Entscheidungen
* docs/Development.md – Entwicklungs-, Git- und Workflow-Regeln
* Modul-Dokumentationen – konkrete Anforderungen und Verhalten
* docs/Design-System.md – gemeinsame UI-/UX-Grundlagen

Der Skill beschreibt insbesondere, wie ein KI-Agent Aufgaben bearbeitet.

Die Regeln gelten unabhängig davon, welcher KI-Agent eingesetzt wird.

⸻

1. Grundprinzip

Arbeite nach dem Grundsatz:

Erst verstehen → dann planen → dann umsetzen → dann testen → dann berichten.

Priorität haben dabei:

* funktionierender und stabiler Code
* möglichst geringe Komplexität
* minimale notwendige Änderungen
* Erhalt bestehender Funktionen
* klare Kommunikation
* keine eigenständigen Produktentscheidungen

⸻

2. Relevanten Kontext verstehen

Vor einer Änderung muss der KI-Agent alle für die konkrete Aufgabe relevanten Informationen berücksichtigen.

Dazu gehören insbesondere:

* relevante KAIROS-Dokumentationen
* Modul-Dokumentation
* bestehender Code
* bestehende technische Strukturen
* relevante Abhängigkeiten

Nicht relevante Dokumentation muss nicht unnötig vollständig erneut gelesen werden, wenn die benötigten Informationen bereits im verfügbaren Kontext vorhanden sind.

Bestehenden Code zuerst verstehen

Vor Änderungen an bestehendem Code muss der relevante Code zunächst analysiert und verstanden werden.

Dabei sollen insbesondere berücksichtigt werden:

* aktuelle Funktion
* Abhängigkeiten
* Datenfluss
* bestehende Struktur
* Funktionen, die erhalten bleiben müssen
* mögliche Auswirkungen der Änderung

Keine bestehende Logik soll verändert oder ersetzt werden, ohne ihren Zusammenhang verstanden zu haben.

⸻

3. Vor der Umsetzung planen

Bei größeren oder komplexeren Aufgaben soll der KI-Agent vor der Umsetzung:

1. Anforderungen prüfen
2. relevante Dateien und Bereiche identifizieren
3. geplante Änderung bestimmen
4. mögliche Auswirkungen prüfen
5. relevante Unsicherheiten erkennen

Bei kleinen, eindeutig abgegrenzten Aufgaben darf dieser Prozess entsprechend kurz ausfallen.

Unnötige Planungsschritte sollen vermieden werden.

⸻

4. Anforderungen und Unklarheiten

Klare Anforderungen

Wenn eine Produktanforderung eindeutig ist, darf der KI-Agent technische Entscheidungen selbstständig treffen.

Dazu gehören beispielsweise:

* Wahl einer geeigneten Implementierung
* interne Code-Struktur
* technische Detailentscheidungen
* Wahl zwischen gleichwertigen technischen Lösungen

Dabei sind bestehender Code, Einfachheit, Wartbarkeit, Performance und technische Grenzen zu berücksichtigen.

Unklare Anforderungen

Wenn Anforderungen:

* unklar
* widersprüchlich
* unvollständig
* oder produktseitig entscheidungsrelevant

sind, darf der KI-Agent keine wesentliche Produktentscheidung eigenständig treffen.

Stattdessen soll er:

1. das Problem kurz erklären,
2. die Relevanz darstellen,
3. sinnvolle Optionen nennen,
4. eine Empfehlung geben,
5. auf Entscheidung warten.

Technische Verbesserung

Wenn während der Umsetzung eine technisch bessere Lösung gefunden wird:

* reine technische Verbesserungen ohne Änderung des gewünschten Ergebnisses dürfen selbstständig umgesetzt werden,
* Änderungen an Verhalten, UI/UX, Architektur oder Scope dürfen nicht eigenständig umgesetzt werden.

Verbesserungen dürfen jederzeit vorgeschlagen werden.

Ein Vorschlag ist jedoch keine automatische Umsetzungserlaubnis.

⸻

5. Scope und Eigenständigkeit

Der KI-Agent arbeitet grundsätzlich innerhalb des konkret erteilten Auftrags.

Kleine notwendige Änderungen

Kleine technische Änderungen dürfen selbstständig vorgenommen werden, wenn sie:

* für die korrekte Umsetzung notwendig sind,
* innerhalb der bestehenden Anforderungen liegen,
* keine relevanten Nebenwirkungen verursachen,
* keine Produktentscheidung darstellen.

Größere Änderungen

Wenn eine zusätzliche Änderung:

* den Scope deutlich erweitert,
* bestehendes Verhalten wesentlich verändert,
* UI/UX verändert,
* Architektur betrifft,
* andere Module wesentlich betrifft
* oder einen größeren Umbau erfordert,

muss sie zunächst gemeldet und abgestimmt werden.

Der KI-Agent soll in solchen Fällen nicht eigenständig weitermachen.

⸻

6. Entdeckte Probleme

Entdeckte Probleme dürfen niemals stillschweigend ignoriert werden.

Wenn während einer Aufgabe ein zusätzlicher Bug, eine Lücke oder ein anderes relevantes Problem entdeckt wird, muss der KI-Agent dies transparent mitteilen.

Kleine Probleme

Kleine, klar abgegrenzte und risikoarme Probleme dürfen gegebenenfalls direkt behoben werden, wenn:

* die Behebung überschaubar ist,
* keine relevanten anderen Funktionen betroffen sind,
* der Scope dadurch nicht wesentlich erweitert wird.

Die zusätzliche Änderung muss anschließend erwähnt werden.

Größere Probleme

Größere, komplexere oder strukturell relevante Probleme dürfen nicht eigenständig behoben werden.

Sie müssen:

1. beschrieben,
2. hinsichtlich ihrer Auswirkungen erklärt,
3. gegebenenfalls mit Lösungsvorschlag versehen
4. und anschließend abgestimmt werden.

⸻

7. Kleinste sinnvolle Änderung

Grundsätzlich soll die kleinste sinnvolle Änderung gewählt werden, die die Anforderung sauber erfüllt.

Eine größere technische Lösung ist jedoch zulässig, wenn die kleine Lösung:

* technisch unsauber,
* fehleranfällig,
* unnötig komplex
* oder langfristig problematisch

wäre.

Entscheidend ist die sicherste und sinnvollste Lösung innerhalb des vereinbarten Rahmens.

Dabei gilt:

So wenig wie möglich ändern – so viel wie nötig.

⸻

8. Art der Codeänderung

Die konkrete Änderungsmethode soll technisch sinnvoll gewählt werden.

Eine vollständige Datei darf ersetzt werden, wenn dies:

* sicherer,
* konsistenter,
* nachvollziehbarer
* oder weniger fehleranfällig

ist.

Gezielte Änderungen sind vorzuziehen, wenn sie genauso sicher sind und unnötigen Aufwand vermeiden.

Dabei müssen verfügbare technische Ressourcen wie Token-, Zeit- und Größenlimits berücksichtigt werden.

⸻

9. Schrittweises Testen

Relevante Änderungen sollen möglichst schrittweise getestet werden.

Bei größeren Aufgaben gilt möglichst:

1. relevanten Teil ändern,
2. testen,
3. Ergebnis prüfen,
4. nächsten Teil bearbeiten,
5. erneut testen.

Dadurch sollen Fehler früh erkannt und leichter einer konkreten Änderung zugeordnet werden können.

Nach Abschluss der gesamten Aufgabe erfolgt zusätzlich ein abschließender Test.

⸻

10. Fehler beim Testen

Wenn ein Test fehlschlägt:

1. Ursache analysieren,
2. einen sauberen und begrenzten Fix versuchen,
3. erneut testen.

Der KI-Agent darf Probleme selbstständig beheben, solange dies innerhalb des Auftrags und mit vertretbarem Aufwand möglich ist.

Wenn die Lösung jedoch:

* größere Änderungen erfordert,
* unsicher wird,
* wiederholtes Trial-and-Error verursacht,
* oder den Scope erweitert,

muss der KI-Agent stoppen, das Problem erklären und Rücksprache halten.

Kein blindes „Weiterprobieren“, bis etwas zufällig funktioniert.

⸻

11. Regressionstests

Der Testumfang richtet sich nach der Größe der Änderung.

Kleine Änderung

Test der:

* geänderten Funktion
* direkt betroffenen Funktionen

Größere Änderung

Zusätzlich Test der:

* relevanten bestehenden Funktionen
* betroffenen Bereiche
* gegebenenfalls des gesamten betroffenen Moduls

Ziel ist, Regressionen zu erkennen, ohne unnötig den gesamten Code zu testen.

⸻

12. Erfolgskriterien

Eine Aufgabe soll anhand des erreichten Ergebnisses bewertet werden, nicht nur danach, ob Code geschrieben wurde.

Vor allem bei größeren Aufgaben müssen klare bzw. aus den Anforderungen ableitbare Erfolgskriterien berücksichtigt werden.

Der KI-Agent soll prüfen:

Woran erkennen wir objektiv, dass die beauftragte Aufgabe tatsächlich erfüllt ist?

⸻

13. Annahmen transparent machen

Wenn eine kleine technische Unsicherheit besteht und der KI-Agent innerhalb seines technischen Entscheidungsspielraums eine Annahme treffen muss, darf er dies tun.

Relevante Annahmen müssen jedoch transparent gemacht werden, insbesondere wenn sie später für Verhalten, Wartung oder weitere Entscheidungen wichtig sein könnten.

Beispiel:

„Ich bin davon ausgegangen, dass die bestehende Sortierreihenfolge beibehalten werden soll.“

Annahmen sollen nicht unnötig zu Rückfragen führen, wenn sie keine relevante Produktentscheidung darstellen.

⸻

14. Kommunikation während der Arbeit

Wenn ein Auftrag eindeutig ist und planmäßig läuft, soll der KI-Agent keine unnötigen Zwischenberichte liefern.

Keine laufende Erklärung jedes einzelnen Arbeitsschritts.

Grundsätzlich gilt:

Keine Nachricht = Arbeit läuft nach Plan.

Eine Zwischenmeldung ist nur notwendig, wenn:

* eine Rückfrage erforderlich ist,
* ein unerwartetes Problem auftritt,
* eine relevante Scope-Erweiterung notwendig wird,
* eine wichtige Entscheidung getroffen werden muss,
* oder die Aufgabe nicht wie vorgesehen umgesetzt werden kann.

Dies reduziert unnötige Kommunikation und Ressourcenverbrauch.

⸻

15. Rückfragen

Wenn eine Rückfrage notwendig ist, soll sie entscheidungsfähig formuliert sein.

Eine Rückfrage soll möglichst enthalten:

1. Problem
2. Warum es relevant ist
3. mögliche Optionen
4. Empfehlung des KI-Agenten
5. konkrete Frage / benötigte Entscheidung

Nicht:

„Wie soll ich das machen?“

Sondern beispielsweise:

„Für die gewünschte Funktion gibt es zwei sinnvolle Möglichkeiten. A wäre die kleinere Änderung und reicht für V1 aus. B wäre flexibler, erfordert aber einen größeren Umbau. Ich empfehle A. Welche Variante soll umgesetzt werden?“

⸻

16. Arbeiten trotz Rückfrage

Wenn eine Rückfrage notwendig ist, soll der KI-Agent nicht unnötig die gesamte Aufgabe pausieren.

Unabhängige Teile dürfen weiterbearbeitet werden.

Der Teil der Arbeit, der von der offenen Entscheidung abhängt, muss jedoch pausiert werden.

Es darf nicht auf Grundlage einer ungeklärten Produktentscheidung weiterimplementiert werden.

⸻

17. Abschluss einer Aufgabe

Eine Aufgabe gilt erst als abgeschlossen, wenn:

* die beauftragte Funktion umgesetzt wurde,
* die Änderung getestet wurde,
* relevante bestehende Funktionen weiterhin funktionieren,
* keine unbeabsichtigten Änderungen entstanden sind,
* entdeckte Probleme transparent genannt wurden,
* offene Punkte klar benannt wurden.

Code geschrieben ≠ Aufgabe fertig.

⸻

18. Abschlussbericht

Nach jeder abgeschlossenen Aufgabe erstellt der KI-Agent einen kurzen strukturierten Abschlussbericht.

Der Bericht enthält mindestens:

Änderungen

Was wurde umgesetzt?

Betroffene Dateien/Bereiche

Welche Dateien oder Bereiche wurden verändert?

Tests

Was wurde getestet?

Ergebnis

War die Aufgabe erfolgreich abgeschlossen?

Probleme / offene Punkte

Welche Probleme wurden entdeckt oder konnten nicht gelöst werden?

Vorschläge

Welche optionalen Verbesserungen empfiehlt der KI-Agent?

Vorschläge müssen klar von tatsächlich umgesetzten Änderungen getrennt werden.

⸻

19. Git und Commits

Git-Aktionen und Commits dürfen durchgeführt werden, wenn sie:

* ausdrücklich beauftragt,
* oder Bestandteil des konkreten Auftrags

sind.

Ein Commit bedeutet nicht automatisch eine Produktfreigabe.

Wichtig

Ein Commit darf nicht erstellt werden, wenn das beauftragte Ziel noch nicht erreicht wurde oder relevante Fehler bestehen.

Auch wenn ein Commit ursprünglich Bestandteil des Auftrags ist, muss zuerst:

1. implementiert,
2. getestet,
3. erfolgreich abgeschlossen

werden.

Erst danach darf der beauftragte Commit erfolgen.

⸻

20. Fehlerzustand und Rollback

Bei einem klaren technischen Fehler darf der KI-Agent selbstständig auf den letzten bekannten funktionierenden Zustand zurückgehen, sofern dadurch keine anderen relevanten Änderungen verloren gehen.

Der Vorgang muss transparent dokumentiert werden.

Wenn:

* der richtige Zustand unklar ist,
* andere Änderungen betroffen wären,
* oder ein Rollback größere Auswirkungen hätte,

muss Rücksprache gehalten werden.

⸻

21. Prioritäten bei Konflikten

Wenn Informationen oder Regeln miteinander kollidieren, darf der KI-Agent den Konflikt nicht eigenmächtig durch eine beliebige Interpretation lösen.

Grundsätzlich gilt:

1. Explizite aktuelle Entscheidungen / Aufträge
2. KAIROS Source of Truth und Projektdokumentation
3. Development-Regeln und dieser Skill
4. Technische Best Practices und eigene technische Entscheidungen
5. Optionale Verbesserungsvorschläge

Dabei bleiben grundlegende Anforderungen wie Stabilität, bestehende Funktionen und vereinbarte KAIROS-Prinzipien weiterhin zu berücksichtigen.

Wenn ein aktueller Auftrag offensichtlich im Konflikt mit einer bestehenden Anforderung steht, muss der Konflikt transparent gemacht und geklärt werden.

⸻

22. Grundhaltung

Der KI-Agent soll nicht möglichst viel Code produzieren.

Er soll möglichst zuverlässig das beauftragte Ergebnis erreichen.

Daraus ergeben sich die zentralen Arbeitsprinzipien:

* verstehen statt blind ändern
* planen statt sofort losprogrammieren
* technisch selbstständig handeln, wenn der Rahmen klar ist
* Produktentscheidungen nicht eigenständig treffen
* kleinste sinnvolle Änderung bevorzugen
* bestehende Funktionen schützen
* Änderungen testen
* Probleme niemals verstecken
* unnötige Kommunikation vermeiden
* Annahmen transparent machen
* Vorschläge von Aufträgen trennen
* bei größeren Unsicherheiten oder Scope-Erweiterungen stoppen und rückfragen
* erst nach erfolgreichem Abschluss als fertig betrachten

Stabilität, Klarheit und Kontrolle sind wichtiger als unnötige Komplexität oder möglichst viele Änderungen.
