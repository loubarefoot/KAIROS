# Training – PWA-Vorbereitung und Veröffentlichungsplan

## Stand

GitHub Pages ist laut Nutzer unter `https://loubarefoot.github.io/KAIROS/` aktiviert, Quelle `main`, `/(root)`. Training wird auf `feat/training-v1` vorbereitet. Ziel ist `https://loubarefoot.github.io/KAIROS/Training/`; Weight bleibt unter `/KAIROS/Weight/`. Diese Vorbereitung veröffentlicht keine Dateien und ändert keine Pages-Einstellungen.

Die feste Manifest-ID `/KAIROS/Training/` bezeichnet ausschließlich Training. `start_url` und `scope` sind relativ zum Manifest jeweils `./`; die Anzeige ist `standalone`. Die ID ist bewusst auf das vorgesehene Deployment festgelegt: bei einer späteren Pfad-/Domainänderung muss die App-Identität überprüft werden. Die PNGs verwenden `#14171b`, `#1d2126` und Training-Grün `#78c99b`; ein reduziertes Hantelsymbol bleibt auch in kleinen Größen erkennbar. Die Dateien sind quadratisch und undurchsichtig; iOS übernimmt die äußere Rundung.

Der Worker liegt in `Training/sw.js`, registriert mit Scope `./`. Bei diesem Deployment kontrolliert er ausschließlich `/KAIROS/Training/`. Shell `v3` enthält die bisherigen acht App-Dateien, Manifest und drei Icons; jede Ressource benötigt erfolgreichen HTTP-Status, keine Weiterleitung, passenden MIME-Typ und die richtige SHA-256-Prüfsumme. Fehlgeschlagene Updates erhalten die bisherige Version. Vollständige neue Versionen warten auf das Schließen kontrollierter Seiten. Es gibt kein `skipWaiting()` und keine Erweiterung des Scopes. Die Cache-Bereinigung betrifft nur das Training-Präfix dieses Scopes.

## Prüfung und Wiederholung

Alle automatisierten Tests:

```sh
node --test Training/tests/*.test.cjs
```

Browser-Audit (vorhandenes Playwright Core und Chromium; keine App-Abhängigkeit):

```sh
KAIROS_PLAYWRIGHT_MODULE=/pfad/zu/playwright-core \
KAIROS_CHROMIUM_PATH=/pfad/zu/chromium \
node Training/tests/audit-browser.cjs
```

PWA-, Offline- und Weight-Regression:

```sh
KAIROS_PLAYWRIGHT_MODULE=/pfad/zu/playwright-core \
KAIROS_CHROMIUM_PATH=/pfad/zu/chromium \
KAIROS_CHART_PATH=/pfad/zu/chart.umd.min.js \
node Training/tests/pwa-browser.cjs
```

Der letzte Lauf benötigt die unveränderte bestehende Chart.js-Version 4.4.1. Nur im Test wird diese Datei für die bereits vorhandene CDN-Adresse ausgeliefert. Er verwendet einen lokalen HTTP-Server auf Loopback (sicherer Browserkontext), den exakten `/KAIROS/Training/`-Pfad und ein isoliertes temporäres Browserprofil, das danach entfernt wird. Die bisherige v2-Shell wird aus dem gesicherten Commit `d05f7541839fda3adc26e87c323c15cbb77f543b` gelesen. Es entstehen keine Änderungen an Weight oder Benutzer-Browserdaten.

Die Prüfung umfasst App-ID/Startpfad, MIME-/Hash-Prüfung aller zwölf Cache-Dateien, unvollständiges Icon-Update, wartenden Versionswechsel, Offline-Ressourcen, Fortsetzung einer aktiven Einheit, Offline-Abschluss und JSON-Export/-Import, vollständigen Browser-Prozessneustart sowie Breiten von 320/390/844/1280 Pixeln. Der separate Audit deckt veraltete Mehrtab-Formulare, globale Gewichtsspeicherung, Fokus nach Sortierung, ungültige Backups und fehlgeschlagene Cache-Schreibvorgänge ab. Weight wird auf derselben Origin mit unverändertem Code, Chart.js, Speicherung/Neuladen, Eingabevalidierung, Einstellungen und Statistik geprüft; Training-Daten und fremde Caches werden erhalten.

Dies sind Chromium-Tests. Eine installierte iOS-App, Safari-Speicherverhalten und die wirkliche GitHub-Pages-Auslieferung sind damit nicht nachgewiesen.

### Ergebnis der Vorbereitung

- 45 automatisierte Tests bestanden (42 bestehende Tests und drei zusätzliche PWA-/Fehlerprüfungen), keine Fehler oder übersprungenen Tests.
- Browser-Audit und PWA-/Offline-/Weight-Regression unter `/KAIROS/Training/` bestanden, einschließlich frischer Erstinstallation, Verzeichnisweiterleitung und Offline-Einstieg über `index.html` mit Queryparametern.
- `Weight/index.html` ist bytegleich zum Training-Ausgangscommit und zu `origin/main`. SHA-256: `aa88a3b8e30596701535c89c20f84be82b4d907e455a0d5e0a4eeaf857137dd7`. Auch der vollständige Weight-Git-Baum ist identisch.
- JavaScript-Syntax und `git diff --check` bestanden. HEAD bleibt `d05f7541839fda3adc26e87c323c15cbb77f543b`; Änderungen sind nicht committet oder gepusht.

## Plan für spätere Zusammenführung

Geprüfte Ausgangspunkte: `origin/main` = `f0581a2b76282c396b114a3c47c3bd9d7e3bdf96`; Training-HEAD = `d05f7541839fda3adc26e87c323c15cbb77f543b`, zuzüglich dieser noch nicht committeten Vorbereitung. Gemeinsame Basis ist `a28fd43880827595e1c159fa08d8dc17f6790d22`. Training liegt vier Commits voraus und einen zurück.

Eine lesende Dreiwegeprüfung der gesicherten Commit-Stände zeigt keine Inhaltskonflikte. Die jetzigen PWA-Änderungen betreffen andere Dateien als die main-Regelkorrektur. Dies ist keine Garantie für einen später veränderten main-Stand; unmittelbar vor Übernahme erneut prüfen.

Gewünschtes gemeinsames Ergebnis:

| Dateien | Beizubehaltender Inhalt |
| --- | --- |
| `docs/KAIROS.md`, `docs/Development.md`, `docs/DevelopmentSkill.md` | Neuere main-Regeln und korrigierte Verweise aus `f0581a2`; kein Zurücksetzen auf ältere Training-Branch-Regeln. |
| `docs/KairosTraining.md` | Präzisierte Training-Anforderungen und alle freigegebenen Entscheidungen aus dem Training-Branch. |
| `docs/TrainingData.md`, `docs/TrainingPWA.md` | Training-Daten-/Offline-/PWA-Dokumentation einschließlich dieser Vorbereitung. |
| `docs/ChangeLog.md`, `docs/DecisionLog.md` | Alle Training-Einträge einschließlich PWA-Vorbereitung; spätere main-Einträge bei Bedarf zusätzlich erhalten. |
| `docs/DesignSystem.md`, `README.md` | Bestehenden identischen Stand erhalten. |
| `Weight/` | Vollständig bytegleich erhalten. |
| `Training/` | Geprüfte Training-V1-Dateien einschließlich Manifest, Icons, Worker v3 und Tests. |

Nach entsprechender Git-Freigabe zunächst die geprüfte Vorbereitung auf `feat/training-v1` committen und pushen. Anschließend den aktuellen main-Stand nach gesonderter Freigabe in den Training-Branch integrieren, die obige Dokumentationsmatrix kontrollieren und alle Tests erneut ausführen. Der automatische Dreiwege-Merge sollte beim aktuell geprüften Stand die getrennten Änderungen erhalten; pauschales Ersetzen von Dokumentation mit einer Branch-Version ist nicht vorgesehen.

Vor der Übernahme nach main Review der vollständigen Änderung und ausdrückliche Veröffentlichungsfreigabe einholen. Ein Push/Merge nach main löst bei dieser Pages-Konfiguration die Live-Veröffentlichung aus. Keine Umstellung der Pages-Quelle auf den Feature-Branch, keine Verschiebung von Weight, keine Pfad-/Domainänderung und kein originweiter Worker sind notwendig.

## Veröffentlichung und Gerätetest nach Freigabe

1. Bestehenden Weight-Stand und Ziel-Commit festhalten; vorhandene persönliche Daten per Backup sichern. Keine gemeinsamen Website-Daten löschen.
2. Reviewten gemeinsamen Stand nach main übernehmen und den bestehenden Pages-Build abwarten. Ein Build aus main benötigt keine zusätzliche Hosting-Lösung.
3. Auf der Live-URL HTTPS, abschließenden Slash, normale statische Auslieferung ohne HTML-Transformation, MIME-Typen und alle zwölf Ressourcen prüfen. `sw.js` muss ohne Weiterleitung unter `/KAIROS/Training/sw.js` erreichbar sein. Live-Hashes müssen zu `HASHES` passen. Worker-Scope und eventuell vorhandene übergeordnete Registrierungen überprüfen.
4. Weight online und aus seinem bestehenden Home-Screen-Eintrag prüfen: Anzeige, Speichern, Statistik und bisherige Daten. Seine Datei-Bytes weiterhin mit dem vorherigen Stand vergleichen.
5. Training in Safari online öffnen; die vollständige Worker-Installation abwarten. Safari → Teilen → Zum Home-Bildschirm, App als „Training“ hinzufügen und aus diesem Eintrag online starten. Falls iOS die Option anbietet, als Web-App öffnen. Installation/Offline-Bereitschaft im Home-Screen-Kontext selbst überprüfen; nicht von einem gemeinsam genutzten Safari-/App-Speicher ausgehen.
6. Icon, Titel, Standalone-Anzeige, Safe Areas, Tastatur, numerische Eingaben, Sortierung und Dialoge am echten iPhone prüfen. Laufende Einheit beginnen, App wechseln/sperren und wieder öffnen; Startzeit, Status und Position müssen erhalten sein.
7. Flugmodus aktivieren, App vollständig schließen und aus dem Home-Bildschirm erneut starten. Training fortsetzen und abschließen; JSON exportieren und nach beendeter Einheit importieren. Nach Gerät-Neustart Offline-Start erneut prüfen.
8. Ergebnisse mit iPhone-/iOS-Version dokumentieren. Bei Fehlern zuerst Ursache prüfen. Falls Rücknahme erforderlich wird, nur die freigegebene Training-Veröffentlichung zurücknehmen; Weight erhalten. Bereits installierte Offline-Versionen verschwinden dadurch nicht sofort und Trainingsdaten dürfen nicht gelöscht werden.

## Grenzen

iOS kann Cache oder Website-Daten entfernen; JSON-Backups bleiben wichtig. Safari und Home-Screen-App können unterschiedliche Speicher-/Installationskontexte verwenden. Ein Manifest allein garantiert weder eine vorhandene Offline-Installation noch deren Dauerhaftigkeit. Änderungen von URL/Origin können den Zugriff auf bisherige lokale Daten verändern. GitHub-Pages-HTTPS und Live-Header sowie ein physischer iPhone-/Home-Screen-Test stehen bis zur Veröffentlichung aus.
