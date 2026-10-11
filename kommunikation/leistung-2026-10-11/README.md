# Nachweise zu Leistung und Fehlerfreiheit

Bezug: [Nachricht 13](../2026-10-11-13-james-leistung-und-fehlerfreiheit.md). Stand **main `2dcfd42`, 0.17.0T15**. Synthetische Daten, unmodifizierte App über localhost, Chromium 151 mit SwiftShader. Kein Zugriff auf private Gerätedaten oder die Live-App.

| Datei | Inhalt |
| --- | --- |
| `performance-results.json` | 106 Messfenster, zehn Ticketvergleichsgruppen, drei Bedienprofile, Renderer und lokaler Online-/Offline-Start |
| `ticket-trace-results.json` | Separates, instrumentiertes Profiling der Ticket-Erstellung; Stil-, Geometrie- und Filterstichproben |
| `additional-results.json` | Timer und Einstellungen, bestätigter Speicherfehler im Ticketblatt mit Gegenvergleich, vier tatsächliche Kalendergesten |
| `suite-results.json` | 37 unveränderte Suite-Seiten in Echtzeit; 35 grün, Kalender und Langdruck abweichend |

Die Skripte sind Prüfwerkzeuge, keine Abhängigkeiten der App. Voraussetzung: Python mit Playwright, Chromium unter `/usr/lib/chromium/chromium`, Node für das Erzeugen der bestehenden Prüfseiten. `ROOT` in den Skripten an den Checkout anpassen. Ausgabe nach `/tmp/chilli-performance`, Verzeichnis vorher anlegen. `ticket_trace.py` und `additional.py` lesen die gemeinsamen JavaScript-Prüfhilfen aus `measure.py` im Ausgabeverzeichnis; diese Datei deshalb vorab dort ablegen. Die Browser brauchen in dieser Cloud-Sandbox die Netzwerkfreigabe für localhost und den Start.

```sh
mkdir -p /tmp/chilli-performance
cp kommunikation/leistung-2026-10-11/measure.py /tmp/chilli-performance/measure.py
python kommunikation/leistung-2026-10-11/measure.py
python kommunikation/leistung-2026-10-11/ticket_trace.py
python kommunikation/leistung-2026-10-11/additional.py
```

Messungen nacheinander fahren, um Konkurrenz zwischen Browsern zu vermeiden. Die erste Messung einer Gruppe enthält auch einmalige Arbeit beim erstmaligen Aufbau des Ticketblatts; deshalb drei Wiederholungen und separat ein Ruhezustand. Die 4-fache CPU-Drosselung ist nur ein Belastungsvergleich. `requestAnimationFrame` misst Callback-Abstände, keine tatsächlich dargestellten Bilder oder iPhone-FPS. Programmgesteuerte Klickpfade sind kein INP-Test. `PerformanceObserver` erfasst nicht zwingend alle über DevTools gestarteten Arbeiten; deshalb stehen zusätzlich synchrone Aufrufzeiten und CDP-Metriken in den Ergebnissen.

Das Profiling hat zusätzliche Funktionswrapper und Stilabfragen; seine Millisekunden nicht mit den uninstrumentierten Vergleichswerten vermischen. Die verschachtelten Funktionszeiten und Trace-Ereignisse nicht addieren. Der Eintrag `ios-first-touch-attempt` enthält Playwrights Warten auf einen bedienbaren Knopf während des Auftritts und ist ausdrücklich **kein gültiger Ticket-Benchmark**.

Für die Suiten vorher die Seiten aus den unveränderten Modulen erzeugen:

```sh
node --input-type=module - <<'JS'
import { readdirSync } from 'node:fs';
for (const file of readdirSync('./tools/pruefstand/suiten').filter(f => f.endsWith('.mjs')).sort()) {
  await import('./tools/pruefstand/suiten/' + file);
}
JS
python kommunikation/leistung-2026-10-11/verify_suites.py
```

Der lokale Original-CLI-Lauf über `file://` lieferte hier keine Seitenergebnisse; der oben genannte HTTP-Lauf ist ein eigener Echtzeitvergleich. Der offizielle GitHub-Lauf für denselben Commit ist grün. Die explizite Metadatenhöhe 517 der Querformat-Suite kompensiert Chromes 87 Pixel Leiste; Playwright bekommt direkt den Viewport 932 × 430. Die ausgewählten Querformat-Ergebnisse wurden nach dieser Korrektur in die archivierte Gesamtdatei übernommen.
