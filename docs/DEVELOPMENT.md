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


18. KI-Arbeitsworkflow

Die Entwicklung von KAIROS folgt grundsätzlich einem abgestimmten Workflow.

Der Standardablauf ist:

Idee / Problem → Abstimmung zwischen Lou und ChatGPT → konkrete Anforderung → Auftrag an die zuständige KI → Umsetzung → Test → Rückmeldung → Prüfung → Commit / Merge → gegebenenfalls Dokumentationsaktualisierung

Die einzelnen Schritte sollen nachvollziehbar bleiben und nicht ohne Grund übersprungen werden.

⸻

19. Erteilung von Entwicklungsaufträgen

Ein verbindlicher Entwicklungsauftrag an Claude, DeepSeek oder eine andere Entwicklungs-KI entsteht grundsätzlich erst nach Abstimmung zwischen Lou und ChatGPT.

Eine beiläufige Idee, ein Vorschlag oder eine Diskussion stellt noch keinen Entwicklungsauftrag dar.

Der Auftrag soll möglichst eindeutig beschreiben:

* was geändert werden soll,
* welche Dateien oder Bereiche betroffen sind,
* welches gewünschte Ergebnis erreicht werden soll,
* welche bestehenden Funktionen erhalten bleiben müssen,
* und gegebenenfalls welche Einschränkungen gelten.

⸻

20. Unklare Anforderungen

Wenn eine Anforderung unklar, widersprüchlich oder für die Umsetzung nicht ausreichend definiert ist, soll die zuständige KI nicht eigenständig eine wesentliche Produktentscheidung treffen.

Stattdessen soll sie:

* auf die Unklarheit hinweisen,
* eine Rückfrage stellen,
* oder mögliche Lösungswege zur Entscheidung vorlegen.

Bei rein technischen Details innerhalb des bereits eindeutig definierten Auftrags darf die KI selbstständig eine sinnvolle Lösung wählen.

⸻

21. Probleme außerhalb des Auftrags

Wenn eine KI während der Umsetzung ein Problem entdeckt, das nicht Teil des aktuellen Auftrags ist, soll sie dieses melden.

Sie darf:

* das Problem beschreiben,
* die möglichen Auswirkungen erklären,
* einen Lösungsvorschlag machen.

Sie darf das Problem jedoch nicht eigenständig außerhalb des Auftrags beheben.

Für die zusätzliche Änderung wird bei Bedarf ein separater Auftrag erteilt.

⸻

22. Auftragsumfang

Die KI arbeitet innerhalb des vereinbarten Scopes.

Der Auftrag darf nicht eigenständig erweitert werden, nur weil während der Entwicklung weitere Verbesserungsmöglichkeiten auffallen.

Wenn für die korrekte Umsetzung zusätzliche Änderungen notwendig erscheinen, muss die KI darauf hinweisen.

Eine Erweiterung des Auftrags erfolgt erst nach entsprechender Abstimmung.

⸻

23. Größere Entwicklungsaufgaben

Bei größeren oder komplexen Aufgaben soll die KI zunächst die geplante Vorgehensweise nachvollziehbar darstellen.

Wenn während der Umsetzung eine relevante technische oder konzeptionelle Entscheidung erforderlich wird, soll die KI nicht eigenständig eine wesentliche Produktentscheidung treffen.

Stattdessen soll sie die Situation erklären und gegebenenfalls mehrere mögliche Lösungswege zur Entscheidung vorlegen.

⸻

24. Umsetzung und Test

Nach Erteilung des Auftrags führt die zuständige KI die vereinbarte Umsetzung durch.

Nach der Umsetzung müssen die betroffenen Funktionen getestet werden.

Bei größeren Änderungen sind zusätzlich relevante bestehende Funktionen auf mögliche Regressionen zu prüfen.

Die KI soll nicht allein anhand des Codes davon ausgehen, dass eine Änderung erfolgreich ist.

⸻

25. Rückmeldung nach der Umsetzung

Nach Abschluss der Implementierung soll die KI eine strukturierte Rückmeldung geben.

Diese soll nach Möglichkeit enthalten:

* Was wurde geändert?
* Welche Dateien wurden geändert?
* Welche Funktionen wurden hinzugefügt oder angepasst?
* Was wurde getestet?
* Was war das Ergebnis der Tests?
* Gibt es bekannte Probleme oder offene Punkte?
* Gibt es zusätzliche Verbesserungsvorschläge?

Verbesserungsvorschläge müssen klar von tatsächlich umgesetzten Änderungen getrennt werden.

⸻

26. Commits und Merge

Eine KI darf bei einem ausdrücklich beauftragten Entwicklungsauftrag selbstständig einen Commit erstellen.

Ein Commit bedeutet jedoch nicht automatisch, dass die Änderung als fertig oder für main freigegeben gilt.

Änderungen sollen nach Möglichkeit zunächst in einem Entwicklungs-Branch erfolgen.

Ein Merge nach main erfolgt erst nach Prüfung und Freigabe.

main soll dadurch grundsätzlich den geprüften und stabilen Hauptstand des Projekts darstellen.

⸻

27. Fehler, Rollback und Abschluss

Wenn eine Änderung unerwartete Probleme verursacht, soll die Ursache zunächst nachvollzogen werden.

Es sollen nicht ungeplant weitere Änderungen auf eine fehlerhafte Änderung aufgestapelt werden.

Falls erforderlich, soll der vorherige funktionierende Zustand wiederhergestellt oder die Änderung sauber korrigiert werden.

Eine Entwicklungsaufgabe gilt erst als abgeschlossen, wenn:

1. der vereinbarte Auftrag umgesetzt wurde,
2. die relevanten Funktionen getestet wurden,
3. keine unbeabsichtigten Änderungen enthalten sind,
4. bekannte Probleme dokumentiert oder kommuniziert wurden,
5. die Änderung geprüft wurde,
6. und der vereinbarte Git-Workflow abgeschlossen wurde.

Erst danach wird die Aufgabe als erledigt betrachtet.
