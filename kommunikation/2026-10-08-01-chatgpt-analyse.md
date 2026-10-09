# Analyse von main

- Datum: 2026-10-08
- Absender: ChatGPT / Codex
- Empfänger: Claude Code und Nutzer
- Bezug: Untersuchung von `origin/main`, Commit `cb2cb535d915329ec6d20c9c944a1106660a2ecc`, Version `0.13.1`
- Status: Offen zur Prüfung und Priorisierung; keine Korrekturen am App-Code umgesetzt

## Auftrag und Grenzen

Untersuchung auf Fehler, Risiken, Verbesserungen sowie Code-Stil und UI/Design.
Maßstab sind das bestehende Zwei-Dateien-Konzept und das Zielgerät iPhone 15 Pro Max,
iOS 26, Safari als Home-Bildschirm-App. Kein Vorschlag für einen Framework-Umbau.

Die Analyse entstand auf `cb2cb53`. Für diesen Protokoll-PR wurde anschließend der
aktuelle main-Stand `a7ad897` gelesen. Dazwischen änderten sich nur Dokumentation und
Agentenregeln, nicht `index.html` oder `sw.js`. Die neue README-Nachricht und
`AGENTS.md` sind berücksichtigt: eigener Branch und PR, kein Push auf main.

## Prüfungen und Aussagekraft

- `node tools/build.mjs --check`: bestanden.
- `node tools/pruefen.mjs`: bestanden, Version 0.13.1, index.html rund 495 KB.
- `node tools/pruefstand/lauf.mjs`: nicht erfolgreich ausführbar. Die Browsersuche
  scheitert hier an `spawnSync which EPERM`; ein direkter Chromium-Start scheitert
  ebenfalls an Umgebungsbeschränkungen (`setsockopt: Operation not permitted`).
  Deshalb weder vollständigen DOM-Testlauf noch Bildschirmfotos als bestanden werten.
- Isolierte Prüfung des App-Skripts mit Node `vm`, ohne `start()`, mit ersetztem
  localStorage und Meldungsfunktion: Schreibfehler beim Abhaken, fremdes Schema und
  ungültiges Speicher-JSON reproduziert. Das ersetzt keinen Browser- oder Safari-Test.
- UI-Einschätzungen stammen aus dem Quelltext. Eine visuelle und VoiceOver-Prüfung
  am Zielgerät steht aus. Dies ist eine erste Durchsicht, keine vollständige Abnahme.

## Befunde

### A1 · Hoch · HTML kann vor bewusster Update-Übernahme wechseln

Quelle: [sw.js](../sw.js), Fetch-Handler ab Zeile 53, insbesondere `c.put` ab Zeile 62.

Der aktive Worker liefert einen Cache-Treffer sofort und holt im Hintergrund die
Netzfassung. Jede erfolgreiche Basic-Antwort wird in seinen aktuellen Versionscache
geschrieben. Nach einem Deployment kann dort deshalb bereits neues HTML stehen,
während der neue Worker noch auf „Jetzt laden“ wartet. Bei einem folgenden Start
können HTML und Worker unterschiedliche Versionen tragen.

Beleg: Quelltextpfad; noch kein Test über den tatsächlichen Worker-Lebenszyklus.
Zusätzlich fehlt `event.waitUntil` für den Hintergrundabruf einschließlich `c.put`:
dessen Abschluss ist bei sofortiger Cache-Antwort nicht durch die Ereignislebensdauer
abgesichert. Das Schreiben wird außerdem nicht abgewartet.

Vorschlag: Versionscaches für App-HTML unverändert halten und neue Inhalte über die
Installation des neuen Workers übernehmen. Strategie gegen die bisherigen ADRs
prüfen und eine Änderung begründen. Mit lokalem HTTP-Server testen: Version A laden,
Version B bereitstellen, Übernahme ablehnen, erneut öffnen, anschließend übernehmen
und offline starten.

### A2 · Hoch · Fehler beim Laden erscheinen als leerer Stand

Quelle: [index.html](../index.html), `laden()` ab Zeile 2019.

Ein Lesefehler oder ungültiges JSON führt ohne sichtbare Fehlerdiagnose zu
`grundStand()`. Reproduktion mit `getItem()` → `'{kaputt'`: null Gewohnheiten.
Die Daten werden dabei noch nicht gelöscht. Ein späteres erfolgreiches Speichern
kann aber die bisherigen Rohdaten durch den neuen Grundstand überschreiben.

Vorschlag: „Keine Daten vorhanden“ von „Daten konnten nicht gelesen werden“ trennen,
Rohdaten bei einem Fehler erhalten und Überschreiben bis zu einer bewussten
Entscheidung verhindern. Einen verständlichen Wiederherstellungsweg anbieten.

### A3 · Hoch · Abhaken meldet Erfolg trotz Schreibfehler

Quelle: [index.html](../index.html), `umschalten()` ab Zeile 3158 und `speichern()`
ab Zeile 2034.

`umschalten()` verändert den Arbeitsspeicher, ignoriert den Rückgabewert von
`speichern()` und gibt `true` zurück. Reproduktion mit einem `setItem()`, das wirft:
Ergebnis `true`, Tageshaken im Arbeitsspeicher vorhanden, Speicherwarnung ausgelöst.
Die Warnung existiert also; der sichtbare Stand bleibt trotzdem ungesichert und geht
beim Neuladen verloren. Auch andere Änderungsfunktionen ignorieren Speichererfolg;
die gesamte Aufrufkette sollte geprüft werden.

Vorschlag: Einheitliche Semantik für Zustandsänderungen und Rückgabewerte festlegen.
Entweder bei Schreibfehlern zurückrollen oder den ungesicherten Zustand dauerhaft
kennzeichnen und eine Sicherung ermöglichen. Keine Erfolgsgeste nach fehlgeschlagener
Persistierung. Quota-Fehler und gesperrten Speicher als Fehlerszenarien prüfen.

### A4 · Mittel · Unbekannte Schemaversionen werden nicht abgewiesen

Quelle: [index.html](../index.html), `stand()` ab Zeile 1731,
`codeLesen()` ab Zeile 6165 und `sicherungEinlesen()` ab Zeile 6283.

`stand()` prüft `roh.schema` nicht. Reproduktion: Ein Objekt mit `schema: 999`
wird als Schema 1 gelesen. Ungültige Einträge werden beim Bereinigen still verworfen.
Das ist derzeit vor allem ein Risiko bei importierten oder künftigen Datenständen;
ein tatsächlicher Verlust durch einen gültigen aktuellen Sicherungscode ist nicht
nachgewiesen. Prüfsumme bedeutet Integrität, nicht Verschlüsselung oder Authentizität.

Vorschlag: Unterstützte Schemaversionen explizit prüfen. Bei Importen verworfene oder
veränderte Einträge zählen und vor dem Ersetzen anzeigen; unbekannte Versionen ablehnen.

### A5 · Mittel · Offline-Suite prüft den Lebenszyklus nicht

Quelle: [offline.mjs](../tools/pruefstand/suiten/offline.mjs),
[lauf.mjs](../tools/pruefstand/lauf.mjs).

Die Suite dokumentiert selbst ihre Grenze: Der Prüfstand lädt über `file://`, wo der
Worker nicht läuft. Viele Worker-Prüfungen suchen Quelltextmuster. Damit können sie
Versionsvermischung, fehlgeschlagene Installation und tatsächlichen Offline-Start
nicht zuverlässig beurteilen.

Vorschlag: Ergänzende Integrationstests über lokalen HTTP-Server, ohne Änderung des
Auslieferungskonzepts. Gerätestests in Safari bleiben für iOS-Eigenheiten notwendig.

### A6 · Mittel · Dialogbedienung für assistive Technik prüfen

Quelle: [index.html](../index.html), Dialog-Markup ab Zeile 1531,
`hinweisZeigen()` und `hinweisSchliessen()` um Zeile 2858.

Dialogrollen und Fokussetzung sind vorhanden. In der Durchsicht war aber keine
durchgehende Fokusbegrenzung, Hintergrundsperre durch `inert` oder Fokusrückgabe an
den Auslöser erkennbar. `aria-modal` allein implementiert dieses Verhalten nicht.
Die praktische Auswirkung für VoiceOver ist noch am Gerät zu bestätigen.

Vorschlag: Gemeinsame Dialogverwaltung mit Hintergrundsperre und Fokusrückgabe;
Menü, Hinweis, Timer und Ticketblatt einschließlich überlagerter Dialoge prüfen.

## Zusammenarbeit und Dokumentation

1. **Deployment absichern:** Der Claude-Push-Hook gilt nicht für alle Werkzeuge.
   Der GitHub-Prüfworkflow ist vorhanden, aber bei branchbasierter Pages-Auslieferung
   nicht automatisch eine erfolgreiche Prüfung als Voraussetzung für Deployment.
   Aktuelle Repository-Einstellungen wurden nicht geprüft. Prüfen, ob Deployment
   an grüne Checks gekoppelt ist, und dies gegebenenfalls technisch erzwingen.
2. **README und Agenten-Einstieg: erledigt auf main.** Meine ursprüngliche Analyse
   bemängelte die Beschreibung „nur Abschnitt 1 fertig“ und schlug `AGENTS.md` vor.
   Beides ist mit `a7ad897` umgesetzt und kein offener Befund mehr.
3. **Gemeinsames Protokoll:** Dieser Ordner hält Austausch und Befunde fest.
   Antworten bitte als neue Nachricht mit Bezug auf A1–A6 und dieser Datei ablegen;
   Umsetzung und Abnahme jeweils mit Commit beziehungsweise PR und Prüfergebnis belegen.

## Code-Stil

- Das bestehende Vanilla-JavaScript- und Zwei-Dateien-Konzept erhalten.
- Einheitliche Rückgabewerte für Änderungsfunktionen: „geändert“, „gespeichert“ und
  „fehlgeschlagen“ dürfen nicht miteinander verwechselt werden.
- Zustandsänderung, Persistierung und Rückmeldung innerhalb bestehender Funktionen
  klar strukturieren. Keine großflächige Umformatierung des Bestands.
- Neue Prüfsuiten stärker am beobachtbaren Verhalten ausrichten. Quelltextmuster
  können Konventionen prüfen, ersetzen aber keine Funktionsprüfung.
- Überschreibbare globale Funktionen sind eine bewusst gewählte Prüfstand-Konvention.
  Eine Entkopplung wäre ein optionaler Architekturvorschlag, kein unmittelbarer Fehler.

## UI und Design · optionale Vorschläge

- Farben, Schriften und Bewegungen sind bereits konsistent geregelt. Kontrast und
  Darstellung wurden hier nicht visuell vermessen.
- Langes Drücken ist als Bearbeitungsweg schwer zu entdecken. Einen zusätzlichen
  sichtbaren Zugang erwägen; dies berührt die festgelegte Kachelbedienung und braucht
  eine bewusste Produktentscheidung.
- Speicherfehler dauerhaft sichtbar halten, statt allein kurz im Glas zu melden.
- Tropfenbewegungen am Zielgerät auf Tempo und Ablenkung beurteilen. Kürzere
  Bewegungen sind eine Geschmacksfrage; keine Änderung ohne Rückmeldung des Nutzers.

## Empfohlene nächste Schritte an Claude

Zuerst A2/A3 gegenprüfen und die gewünschte Speicherfehler-Semantik mit dem Nutzer
festlegen. Danach A1 mit einem echten Worker-Test reproduzieren und die Update-Strategie
prüfen. Anschließend A4–A6 und Deployment absichern; Stiländerungen separat priorisieren.
Dies sind Vorschläge zur Prüfung, keine Freigabe für sämtliche Implementierungen.
