KAIROS – Entwicklungsregeln

1. Zweck

Diese Datei definiert die technischen und organisatorischen Regeln für die Entwicklung von KAIROS und seinen Modulen.

Sie ergänzt die übergeordneten Projektgrundsätze aus docs/Kairos.md.

Die Regeln sollen eine nachvollziehbare, stabile und kontrollierte Entwicklung ermöglichen.

⸻

2. Git-Repository

Das GitHub-Repository ist die zentrale Versionsverwaltung des Projekts.

Der aktuelle Stand des Projekts soll jederzeit nachvollziehbar sein.

Änderungen werden grundsätzlich über Git versioniert und nicht nur lokal oder außerhalb des Repositorys durchgeführt.

⸻

3. Branch-Struktur

main

main enthält den stabilen Hauptstand des Projekts.

Der Branch soll grundsätzlich einen funktionierenden und nachvollziehbaren Zustand enthalten.

Entwicklungs-Branches

Neue Funktionen, größere Änderungen und Experimente werden grundsätzlich zunächst in einem separaten Entwicklungs-Branch umgesetzt.

Nach erfolgreicher Prüfung können die Änderungen in main übernommen werden.

Für kleine, eindeutig abgegrenzte Änderungen kann abhängig vom jeweiligen Workflow auch direkt auf main gearbeitet werden, sofern dies bewusst entschieden wird.

⸻

4. Commits

Jeder Commit soll eine klar abgegrenzte Änderung enthalten.

Commit-Nachrichten sollen kurz, verständlich und aussagekräftig beschreiben, was geändert wurde.

Unterschiedliche, voneinander unabhängige Änderungen sollen nach Möglichkeit nicht unnötig in einem einzigen Commit zusammengefasst werden.

Commits sollen einen nachvollziehbaren Entwicklungsverlauf ermöglichen.

⸻

5. Aufgaben für KIs

Eine KI arbeitet ausschließlich innerhalb des Umfangs der konkret erteilten Aufgabe.

Sie darf:

* die beauftragten Dateien erstellen oder bearbeiten,
* die beauftragte Funktion implementieren,
* notwendige Tests durchführen,
* technische Probleme innerhalb der Aufgabe beheben,
* auf zusätzliche Probleme oder Verbesserungspotenzial hinweisen.

Sie darf jedoch keine darüber hinausgehenden Änderungen eigenständig durchführen.

Wenn während der Entwicklung eine weitere Änderung sinnvoll erscheint, wird diese zunächst vorgeschlagen und muss ausdrücklich beauftragt werden.

⸻

6. GitHub-Zugriff von KIs

Wenn eine KI ausdrücklich Zugriff auf das GitHub-Repository erhält, darf sie diesen Zugriff zur Umsetzung ihrer beauftragten Entwicklungsaufgaben verwenden.

Dazu können – sofern im jeweiligen Auftrag vorgesehen – insbesondere gehören:

* Dateien erstellen,
* Dateien bearbeiten,
* Dateien löschen,
* Branches erstellen,
* Commits erstellen,
* Änderungen in Entwicklungs-Branches verwalten.

Ein Zugriff auf das Repository bedeutet jedoch nicht automatisch eine Erlaubnis zu eigenständigen Produktentscheidungen.

Auch mit direktem GitHub-Zugriff gelten weiterhin die Regeln aus Kairos.md, insbesondere die Regel gegen eigenmächtige Änderungen.

⸻

7. Änderungen am bestehenden Code

Bestehender funktionierender Code soll grundsätzlich erhalten bleiben.

Bei einer Änderung wird nur das verändert, was für die beauftragte Aufgabe notwendig ist.

Insbesondere sollen:

* unabhängige Funktionen nicht unnötig verändert werden,
* bestehende UI-Elemente nicht ohne Auftrag umgestaltet werden,
* funktionierende Logik nicht ohne Grund ersetzt werden,
* keine zusätzlichen Funktionen ungefragt eingebaut werden.

Wenn eine geplante Änderung Auswirkungen auf andere Funktionen haben kann, muss darauf hingewiesen und die Auswirkung geprüft werden.

⸻

8. Größere Codeänderungen

Bei größeren Änderungen soll nach Möglichkeit eine vollständige, konsistente Version der betroffenen Datei bereitgestellt bzw. erstellt werden.

Insbesondere bei größeren JavaScript-Änderungen soll nicht unnötig mit einzelnen kleinen Such-/Ersetzungsblöcken gearbeitet werden.

Ziel ist eine möglichst eindeutige und fehlerarme Übernahme des neuen Codes.

Bei kleinen, eindeutig abgegrenzten Änderungen können selbstverständlich auch gezielte Änderungen vorgenommen werden.

⸻

9. Testing

Jede relevante Änderung muss getestet werden.

Dabei gilt:

* Die neu implementierte oder geänderte Funktion muss überprüft werden.
* Bei größeren Änderungen müssen zusätzlich bereits bestehende Funktionen geprüft werden.
* Fehler, unerwartetes Verhalten und Regressionen sollen vor Abschluss der Aufgabe erkannt und behoben werden.
* Eine Aufgabe gilt nicht allein deshalb als abgeschlossen, weil der Code ohne offensichtlichen Fehler gespeichert oder committed wurde.

Das Testen ist ein Bestandteil der Entwicklung und kein optionaler Schritt danach.

⸻

10. Regressionen

Eine neue Funktion darf bestehende funktionierende Funktionen nicht unbeabsichtigt beschädigen.

Wenn eine Änderung Auswirkungen auf bereits vorhandene Funktionen haben kann, müssen diese Funktionen nach der Änderung erneut geprüft werden.

Werden dabei Fehler festgestellt, müssen sie vor Abschluss der beauftragten Änderung behoben oder ausdrücklich dokumentiert werden.

⸻

11. Fehler und Probleme

Wenn während der Entwicklung ein Fehler entdeckt wird, der unmittelbar mit der beauftragten Aufgabe zusammenhängt, soll er im Rahmen dieser Aufgabe behoben werden.

Probleme, die nicht zur aktuellen Aufgabe gehören, sollen dokumentiert und gemeldet werden.

Eine KI soll solche Probleme nicht eigenständig als Anlass nehmen, weitere Teile des Projekts umzubauen.

⸻

12. Verbesserungsvorschläge

KIs dürfen jederzeit auf technische Probleme, mögliche Verbesserungen oder sinnvoll erscheinende Alternativen hinweisen.

Vorschläge müssen jedoch klar von tatsächlich beauftragten Änderungen getrennt werden.

Grundregel:

Vorschlagen ist erlaubt. Eigenständig umsetzen ist nur erlaubt, wenn die Änderung ausdrücklich beauftragt wurde.

⸻

13. Codequalität

Code soll:

* verständlich,
* nachvollziehbar,
* wartbar,
* möglichst einfach,
* konsistent mit dem bestehenden Projekt

sein.

Unnötige Komplexität soll vermieden werden.

Es sollen keine technischen Lösungen eingebaut werden, nur weil sie möglich sind, wenn eine einfachere Lösung die Anforderungen erfüllt.

⸻

14. Abhängigkeiten und Technologien

Neue Frameworks, Bibliotheken, externe Dienste oder sonstige technische Abhängigkeiten sollen nicht ohne vorherige Abstimmung eingeführt werden, sofern sie nicht bereits Teil der vereinbarten technischen Grundlage sind.

Bei einer geplanten neuen Abhängigkeit soll zunächst geklärt werden:

* Warum wird sie benötigt?
* Welchen konkreten Vorteil bietet sie?
* Gibt es eine einfachere Lösung ohne zusätzliche Abhängigkeit?
* Welche langfristigen Auswirkungen entstehen?

⸻

15. Definition of Done

Eine Entwicklungsaufgabe gilt erst als abgeschlossen, wenn:

1. die beauftragte Funktion umgesetzt wurde,
2. die Änderung getestet wurde,
3. bestehende relevante Funktionen weiterhin funktionieren,
4. keine unbeauftragten Änderungen enthalten sind,
5. der Code in einem nachvollziehbaren Zustand ist,
6. die Änderung entsprechend dem vereinbarten Git-Workflow versioniert wurde.

Bei größeren Aufgaben kann zusätzlich eine Dokumentationsaktualisierung erforderlich sein.

⸻

16. Dokumentation

Änderungen an Anforderungen oder Projektentscheidungen sollen in der entsprechenden Dokumentation festgehalten werden.

Technische Änderungen müssen nicht automatisch vollständig dokumentiert werden, sofern sie aus den bestehenden Anforderungen eindeutig hervorgehen.

Wenn sich durch eine technische Änderung jedoch eine relevante Projektentscheidung, Architektur oder Arbeitsweise verändert, muss die entsprechende Dokumentation aktualisiert werden.

⸻

17. Grundsatz

Die Entwicklung von KAIROS soll kontrolliert und nachvollziehbar erfolgen.

Es gilt:

Erst verstehen, dann planen, dann umsetzen, dann testen.

Neue Funktionen und Änderungen werden bewusst entschieden und nicht ungefragt hinzugefügt.

Stabilität, Verständlichkeit und kontrollierte Weiterentwicklung haben Vorrang vor unnötiger Komplexität.
