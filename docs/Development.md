KAIROS – Entwicklungsregeln

1. Zweck

Diese Datei definiert die technischen und organisatorischen Regeln für die Entwicklung von KAIROS und seinen Modulen.

Sie ergänzt die übergeordneten Projektgrundsätze aus docs/KAIROS.md.

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

Änderungen werden auf einem Arbeitsbranch durchgeführt. Ein Merge in main erfolgt ausschließlich nach erfolgreichem Review und ausdrücklicher Freigabe durch den Nutzer.

⸻

4. Commits

Jeder Commit soll eine klar abgegrenzte Änderung enthalten.

Commit-Nachrichten sollen kurz, verständlich und aussagekräftig beschreiben, was geändert wurde.

Unterschiedliche, voneinander unabhängige Änderungen sollen nach Möglichkeit nicht unnötig in einem einzigen Commit zusammengefasst werden.

Commits sollen einen nachvollziehbaren Entwicklungsverlauf ermöglichen.

⸻

5. Aufgaben für KIs

Eine KI arbeitet ausschließlich innerhalb des Umfangs der konkret erteilten Aufgabe. Ein ausdrücklich freigegebener Entwicklungsauftrag erlaubt notwendige Dateiänderungen innerhalb dieses Umfangs.

Analyseaufträge bleiben vollständig lesend, sofern nicht ausdrücklich anders beauftragt.

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

Auch mit direktem GitHub-Zugriff gelten weiterhin die Regeln aus docs/KAIROS.md, insbesondere die Regel gegen eigenmächtige Änderungen.

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

Eine KI darf Probleme außerhalb des vereinbarten Auftrags nicht eigenmächtig beheben, auch wenn die Behebung klein und risikoarm erscheint.

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

Idee / Problem → Abstimmung zwischen Lou und ChatGPT → konkrete Anforderung → Auftrag an die zuständige KI → Umsetzung auf einem Arbeitsbranch → Test → Commit, sofern Bestandteil des Auftrags → Rückmeldung → erfolgreiches Review → ausdrückliche Nutzerfreigabe → Merge in main → gegebenenfalls Dokumentationsaktualisierung

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

Für einen ausdrücklich freigegebenen Entwicklungsauftrag darf eine KI auf einem Arbeitsbranch Änderungen durchführen, testen und nach erfolgreicher Umsetzung committen, sofern dies Bestandteil des Auftrags ist.

Ein Commit bedeutet jedoch nicht automatisch, dass die Änderung als fertig oder für main freigegeben gilt.

Änderungen erfolgen auf einem Arbeitsbranch.

Ein Merge in main erfolgt ausschließlich nach erfolgreichem Review und ausdrücklicher Freigabe durch den Nutzer.

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


Development Workflow

KAIROS-Entwicklungsaufgaben folgen grundsätzlich einem klaren, nachvollziehbaren Ablauf. Der Workflow soll die Zusammenarbeit zwischen Produkt-/Planungsebene und Development-Agent strukturieren, ohne unnötige Bürokratie oder Kommunikationsaufwand zu erzeugen.

1. Idee oder Problem

Eine neue Funktion, Änderung oder ein Problem wird zunächst auf Produkt-/Planungsebene besprochen und eingeordnet.

Nicht jede Idee wird automatisch zu einer Entwicklungsaufgabe. Zuerst wird geklärt, ob sie für die aktuelle Version relevant ist.

2. Abstimmung und konkreter Auftrag

Vor der Umsetzung werden Ziel, Umfang und gewünschtes Ergebnis gemeinsam festgelegt.

Aus der Abstimmung entsteht ein klar abgegrenzter Development-Auftrag. Dieser sollte – soweit relevant – enthalten:

* Ziel der Aufgabe
* gewünschte Änderungen
* betroffene Dateien oder Bereiche
* Funktionen oder bestehendes Verhalten, die erhalten bleiben müssen
* relevante Einschränkungen
* überprüfbare Erfolgskriterien

Der Auftrag muss nicht unnötig formalisiert werden. Entscheidend ist, dass der Development-Agent eindeutig versteht, was erreicht werden soll und was nicht Teil der Aufgabe ist.

3. Analyse und Planung

Der Development-Agent prüft den relevanten Projektkontext, die bestehenden Dokumentationen und den betroffenen Code.

Bei kleinen, klar abgegrenzten Aufgaben kann die Umsetzung direkt beginnen.

Bei größeren oder komplexeren Aufgaben wird zunächst der geplante Lösungsweg kurz dargestellt. Relevante Auswirkungen, Unsicherheiten oder notwendige Entscheidungen werden vor der Umsetzung transparent gemacht.

4. Umsetzung

Die Aufgabe wird innerhalb des vereinbarten Umfangs umgesetzt.

Dabei gelten insbesondere die Regeln aus docs/DevelopmentSkill.md:

* kleinste sinnvolle Änderung
* bestehendes funktionierendes Verhalten erhalten
* keine eigenständige Erweiterung des Scopes
* technische Entscheidungen innerhalb des vereinbarten Rahmens eigenständig treffen
* größere Produkt-, UI/UX-, Architektur- oder Scope-Entscheidungen nicht eigenständig treffen

5. Schrittweises Testen

Relevante Änderungen werden bereits während der Umsetzung getestet, bevor darauf aufbauend weitere Änderungen vorgenommen werden.

Dadurch sollen Fehler möglichst früh erkannt und nicht über mehrere weitere Änderungen hinweg verschleppt werden.

6. Abschlusstest

Nach Abschluss der Implementierung erfolgt ein abschließender Test der Aufgabe.

Je nach Umfang werden dabei sowohl die neu implementierte Funktion als auch relevante bestehende Funktionen bzw. betroffene Bereiche auf Regressionen geprüft.

Eine Aufgabe gilt nicht allein deshalb als abgeschlossen, weil der Code geschrieben oder gespeichert wurde.

7. Abschlussbericht

Nach erfolgreicher Umsetzung und Prüfung erstellt der Development-Agent einen kurzen strukturierten Abschlussbericht.

Dieser enthält mindestens:

* Was wurde geändert?
* Welche Dateien/Bereiche wurden geändert?
* Welche Tests wurden durchgeführt?
* Was war das Ergebnis?
* Welche Probleme oder offenen Punkte gibt es?
* Welche zusätzlichen Verbesserungen werden lediglich vorgeschlagen?

Vorgeschlagene Verbesserungen müssen klar von tatsächlich umgesetzten Änderungen getrennt werden.

8. Review

Der Abschlussbericht und das Ergebnis werden anschließend auf Produkt-/Planungsebene geprüft.

Das Review dient insbesondere dazu festzustellen, ob:

* die ursprüngliche Aufgabe erfüllt wurde,
* die Erfolgskriterien erreicht wurden,
* keine unerwünschten Änderungen vorgenommen wurden,
* relevante bestehende Funktionen weiterhin funktionieren,
* offene Punkte oder Probleme korrekt erkannt und kommuniziert wurden.

Die technische Fertigstellung durch den Agenten ist nicht automatisch eine Produktfreigabe.

9. Git und Übernahme

Nach erfolgreicher Umsetzung und Tests darf auf dem Arbeitsbranch ein Commit erfolgen, sofern dies Bestandteil des Auftrags ist. Ein vorheriges Produktreview ist für diesen Commit nicht erforderlich.

Ein Merge in main erfolgt ausschließlich nach erfolgreichem Review und ausdrücklicher Freigabe durch den Nutzer gemäß docs/Development.md.

Ein Commit stellt keine automatische Produktfreigabe dar.

10. Agent-Wechsel

Wenn eine Aufgabe von einem anderen Development-Agent übernommen wird, erhält der neue Agent den aktuellen Repository-Stand sowie den für die Aufgabe relevanten Dokumentations- und Arbeitskontext.

Sofern vorhanden, soll insbesondere der Abschlussbericht bzw. der aktuelle Arbeitsstand des vorherigen Agents berücksichtigt werden.

Der Workflow ist unabhängig davon, welcher Development-Agent verwendet wird.


Decision Log und Changelog

KAIROS führt zwei zentrale Dokumentationen für relevante Projektentscheidungen und Änderungen:

* docs/DecisionLog.md dokumentiert relevante Entscheidungen und insbesondere deren Begründung.
* docs/ChangeLog.md dokumentiert relevante Änderungen am Projekt und dessen Funktionen.

Beide Dokumente dienen der langfristigen Nachvollziehbarkeit und wachsen mit dem Projekt. Sie sollen jedoch nicht jede kleine technische Änderung oder jedes Detail protokollieren.

Decision Log

Ein Eintrag ist sinnvoll bei relevanten Entscheidungen, insbesondere:

* Architektur- oder Strukturentscheidungen
* wichtigen UI-/UX-Entscheidungen
* Änderungen an grundlegenden Projektregeln
* bewussten Entscheidungen zwischen mehreren relevanten Alternativen
* Entscheidungen, die für zukünftige Entwicklung oder andere Module relevant sein können

Einträge sollten kurz festhalten:

* Datum
* Entscheidung
* relevante Begründung bzw. Hintergrund
* gegebenenfalls verworfene Alternativen

Technische Detailentscheidungen müssen nicht automatisch dokumentiert werden. Wenn eine technische Entscheidung jedoch langfristige Auswirkungen hat oder für zukünftige Entwicklung relevant ist, sollte sie aufgenommen werden.

Changelog

Ein Eintrag ist sinnvoll bei relevanten Änderungen, insbesondere:

* neuen Funktionen
* wesentlichen Änderungen bestehender Funktionen
* relevanten UI-/UX-Änderungen
* wichtigen Bugfixes
* Änderungen, die den Zustand oder die Nutzung eines Moduls wesentlich verändern

Einträge sollten kurz festhalten:

* Datum
* betroffener Bereich bzw. Modul
* wesentliche Änderungen
* gegebenenfalls wichtige Hinweise

Kleine interne Codeänderungen, reine Refactorings ohne relevante Auswirkungen und sonstige nicht relevante Details müssen nicht einzeln im Changelog erscheinen.

Verantwortlichkeit

Relevante Produkt- und Projektentscheidungen werden gemeinsam auf Produkt-/Planungsebene getroffen und anschließend im Decision Log dokumentiert.

Der Development-Agent kann relevante technische Entscheidungen erkennen und für die Dokumentation hervorheben. Die Dokumentation darf jedoch keine eigenständige Produktentscheidung darstellen.

Relevante abgeschlossene Änderungen werden im Changelog festgehalten.

Bei größeren Aufgaben können Decision Log und Changelog Bestandteil des Development-Auftrags bzw. der Abschlussaufgabe sein.

Grundprinzip

Decision Log = Warum wurde etwas entschieden?

Changelog = Was wurde geändert?

Beide Dokumente sollen die Entwicklung von KAIROS nachvollziehbar machen, ohne unnötige Dokumentationsarbeit zu erzeugen.

## Verbindliche iOS-PWA-Hülle

Für neue KAIROS-Module gilt die bestätigte Training-v13-Navigationshülle als Referenz. Aufbau, Mindesthöhe, Safe Area, Grenzen der belegbaren Fehlerursache und die Prüfcheckliste stehen in [IOSNavigation.md](IOSNavigation.md). Komponentenänderungen dürfen diese Regeln nicht überschreiben; bestehende Weight-Dateien bleiben unberührt.
