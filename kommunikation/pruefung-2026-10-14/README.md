# Nachweise zur erneuten Prüfung von 0.17.0T30

Bezug: [Nachricht 18](../2026-10-14-18-james-schlusspruefung-0170T30.md), als Antwort auf 15–17.

**Neu:** main `b89fc042c3c72aeeec32a48e164754d9ba551a13`, 0.17.0T30. App-Dateien identisch zu `fe3973c`.
**Alt:** main `2dcfd420cf9364ea2897cdd6788912942d75299b`, 0.17.0T15.

Unveränderte App-Dateien, ausschließlich synthetische Daten, lokale HTTP-Testserver. Chromium 151.0.7922.173 mit SwiftShader. Leistung und Rückwege: 430 × 932, Pixelfaktor 3; Bilder: 430 × 932 und 932 × 430, Pixelfaktor 1 wie in der ursprünglichen Bildprüfung. Alle Stellen iOS, soweit keine Gegenprobe ausdrücklich einen anderen Stil verlangt. Performance-Replays nacheinander gefahren. Keine iPhone-/Safari-Messungen und keine private Zwischenablage.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `comparison.json` | Verdichtete Tabellen; Rohdaten bleiben erhalten |
| `old/`, `new/` | Je `measure.py`, `ticket_trace.py`, `additional.py` und deren drei Ergebnisdateien; je 106 Messfenster und zusätzliche Diagnose-/Funktionsfälle |
| `stress.py`, `stress-results.json` | Drei wechselnde Durchläufe je Version, tatsächliche Historienrechnungen bei Haken/Rücknahme zählen |
| `timer_probe.py`, `timer-probe-results.json` | Uninstrumentierter Timer-Gegenvergleich; drei Durchläufe bei CPU ×1, einer bei ×4, je Version |
| `returns.py`, `return-results.json` | 20 Rückwegfälle einschließlich Abbrüchen und Gegenproben; `fingerFollowing: true` in `checks` heißt: Erwartung erfüllt, auch beim erwarteten Ausbleiben der Bewegung |
| `edge_cases.py`, `edge-case-results.json` | Langdruck mit vollständiger Touch-/Browser-Klickfolge, drei Haltedauern je Version; außerdem dreifach liegenbleibendes Abbild |
| `edge-multitouch-results.json` | Gesonderter Lauf mit `--only-multitouch`: vor dem Ziehen sowie während des Ziehens ohne weiteren `touchmove` |
| `visual.py`, `visual-results.json` | 40 neue Bildzustände plus 16 Vergleichsbilder; allgemeine Layoutchecks |
| `title_probe.py`, `title-results.json` | Acht zusätzliche Prüfungen des wirklichen Textbereichs; überschüssiger Text kann innerhalb einer Karte liegen, ohne die Seite zu verbreitern |
| `bilder/` | 16 ausgewählte PNGs; weitere Bilder lassen sich reproduzieren |
| `verify_http.py`, `suite-results.json` | Ergänzender Echtzeitlauf der 44 unveränderten Suite-Seiten, direkte Viewportmaße nach ADR 0058; 41 grün, drei abweichend |
| `suite-cli.log`, `ci-results.json` | Nicht auswertbarer lokaler `file://`-Lauf und getrennte GitHub-Ergebnisse mit Links |

`checks` in `suite-results.json` ist historisch die Zahl der **Protokollzeilen**, nicht zuverlässig die Zahl der Tests. Die erfolgreichen Seitentitel sind die Quelle für Testzahlen. Die drei abweichenden Suiten sind im Bericht ausdrücklich aufgeführt. Die Replays ändern keine App-Datei und gehören nicht zum App-Prüfstand oder Auslieferungspfad.

## Wiederholen

Voraussetzungen: Python mit Playwright, Chromium unter `/usr/lib/chromium/chromium`, Node für die unveränderten Suite-Generatoren. In der verwendeten Sandbox braucht der Browserlauf Netzwerkfreigabe, um den lokalen Server und Chromium zu starten. Kein Zugriff auf die Live-App erforderlich.

Die archivierten Skripte haben gegenüber den ausgeführten temporären Fassungen nur Pfadparameter erhalten; Aktionen, Daten, Wartezeiten und Messungen sind gleich. Trace und Zusatzfälle lesen `SETUP` und `INSTALL` aus ihrer benachbarten `measure.py`. Den Ausgangsstand passend auswählen; Metadaten in `old/measure.py` und `new/measure.py` benennen die hier geprüften Commits.

Vom Repository aus den alten Stand ausschließlich außerhalb des Repos vorbereiten:

```sh
mkdir -p /tmp/chilli-review-rerun/old-main
git show 2dcfd420cf9364ea2897cdd6788912942d75299b:index.html > /tmp/chilli-review-rerun/old-main/index.html
git show 2dcfd420cf9364ea2897cdd6788912942d75299b:sw.js > /tmp/chilli-review-rerun/old-main/sw.js
```

Auf dem passenden neuen App-Stand, nacheinander:

```sh
python kommunikation/pruefung-2026-10-14/old/measure.py
python kommunikation/pruefung-2026-10-14/new/measure.py
python kommunikation/pruefung-2026-10-14/old/additional.py
python kommunikation/pruefung-2026-10-14/new/additional.py
python kommunikation/pruefung-2026-10-14/old/ticket_trace.py
python kommunikation/pruefung-2026-10-14/new/ticket_trace.py
python kommunikation/pruefung-2026-10-14/stress.py
python kommunikation/pruefung-2026-10-14/timer_probe.py
python kommunikation/pruefung-2026-10-14/returns.py
python kommunikation/pruefung-2026-10-14/edge_cases.py
python kommunikation/pruefung-2026-10-14/edge_cases.py --only-multitouch
python kommunikation/pruefung-2026-10-14/visual.py
python kommunikation/pruefung-2026-10-14/title_probe.py
```

`--root`, `--out` und bei den gemeinsamen Vergleichsskripten `--old-root` erlauben andere Pfade. Ausgaben standardmäßig unter `/tmp/chilli-review-rerun/`, nicht im Repository. Die Bilddaten bleiben wie im Ausgangs-Replay absichtlich auf 2026-10-11 gestellt; sie zeigen trotzdem den neuen Quellstand. Alle Namen und Texte sind Testdaten.

Den vollständigen offiziellen Prüfstand separat ausführen. Er erzeugt die Suite-Seiten in `tools/pruefstand/bau/`. Danach kann der ergänzende HTTP-Lauf diese unverändert lesen:

```sh
node tools/build.mjs --check
node tools/pruefen.mjs
node tools/pruefstand/lauf.mjs
python kommunikation/pruefung-2026-10-14/verify_http.py
```

Optional einzelne HTTP-Suiten als Positionsargumente wählen. Ein nicht auswertbarer CLI-Lauf wird dadurch nicht nachträglich grün.

## Messgrenzen

`requestAnimationFrame` misst Callback-Abstände, keine angezeigten Bilder, iPhone-FPS oder INP. CPU ×4 simuliert kein bestimmtes Gerät. Drei Ticketöffnungen je Gruppe, zusätzliche P2-Diagnose mit drei Durchläufen; einzelne vollständige Navigations-/Belastungsfälle sind Stichproben. Der große Belastungsfall bleibt auch nach dem Cache spürbar. Profiling-Wrapper und Stilabfragen beeinflussen Zeiten; Diagnose- und uninstrumentierte Messwerte getrennt lesen, verschachtelte Funktionszeiten nicht addieren. Der Trace-Eintrag `ios-first-touch-attempt` enthält weiterhin Playwrights Warten während des Auftritts und ist ausdrücklich **kein gültiger Ticket-Benchmark**.
