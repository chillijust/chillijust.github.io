# Nachweise der Prüfung am 2026-10-11

Bezug: [Nachricht 09](../2026-10-11-09-james-funktions-und-darstellungsanalyse.md). Untersucht wurde main `2b7d245`, Version `0.17.0T9`. Ausschließlich synthetische Daten; die Skripte bedienen localhost und verändern keinen Live-Datenstand.

| Datei | Aussage |
| --- | --- |
| `visual-results.json` | 46 Zustandsprüfungen mit Chilli-Standard, Hell/Dunkel |
| `visual-ios-results.json` | 18 Zustände mit allen iOS-Optionen |
| `risk-results.json` | Dialogüberlagerung, Fokus, Speicherfehler, geringe Höhe, reduzierte Bewegung, Richtungswechsel |
| `sw-results.json` | Neue App unter altem Worker ohne Übernahme |
| `calendar-touch-results.json` | Echte Touch-Folgen mit eingefangenen Startkoordinaten |
| `import-results.json` | Fremdes Schema und ID mit Anführungszeichen |
| `suite-results.json` | Ergänzender Echtzeitlauf der 33 unveränderten Suite-Seiten; drei Abweichungen |

Die PNGs sind ausgewählte Nachweisbilder. Weitere Bildschirmbilder wurden geprüft, um das Protokoll klein zu halten.

## Replay für Jarvis

Voraussetzungen: Python mit Playwright, Chromium unter `/usr/lib/chromium/chromium`, Node für die bestehenden Suite-Generatoren. Das sind Prüfwerkzeuge, keine App-Abhängigkeiten. Der Ausgangslauf nutzte Chromium 151. Die Skripte erlauben lokale HTTP-Verbindungen und brauchen im verwendeten Cloud-Sandboxmodus Netzwerkfreigabe für den Browserstart.

Die archivierten Skripte tragen den Ausgangspfad `/workspace/chillijust.github.io`. Bei anderem Checkout `ROOT` auf dessen Pfad setzen. Ausgabe unter `/tmp/chilli-audit`. Vor dem ersten Lauf:

```sh
mkdir -p /tmp/chilli-audit/bilder
python kommunikation/pruefung-2026-10-11/visual.py
python kommunikation/pruefung-2026-10-11/visual.py --ios
python kommunikation/pruefung-2026-10-11/risks.py
python kommunikation/pruefung-2026-10-11/calendar_touch.py
python kommunikation/pruefung-2026-10-11/sw_update.py
```

Für `run_suites.py` die Suite-Seiten vorher mit den vorhandenen Modulen erzeugen (oder nach einem vorhandenen CLI-Lauf verwenden):

```sh
node --input-type=module - <<'JS'
import { readdirSync } from 'node:fs';
for (const file of readdirSync('./tools/pruefstand/suiten').filter(f => f.endsWith('.mjs')).sort()) {
  await import('./tools/pruefstand/suiten/' + file);
}
JS
python kommunikation/pruefung-2026-10-11/run_suites.py
```

Der Echtzeitlauf über HTTP unterscheidet sich vom offiziellen CLI-Lauf über `file://` mit virtueller Zeit. Seine Abweichungen sind in Nachricht 09 erklärt. N2 wurde separat mit aktivem Service Worker geprüft; in den übrigen Replay-Skripten ist er zur Isolation blockiert.
