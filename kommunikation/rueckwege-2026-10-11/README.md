# Beobachtung der Rückwege

Ergänzung zu [Nachricht 14](../2026-10-11-14-james-rueckwege-dashboard-und-termine.md).

- Unveränderter App-Stand: main `2dcfd420cf9364ea2897cdd6788912942d75299b`, Version `0.17.0T15`.
- Umgebung: Python mit Playwright, Chromium 151 unter `/usr/lib/chromium/chromium`, localhost, 430 × 932, Pixelfaktor 3, mobile Touch-Eingaben, dunkles Thema, alle neun iOS-Stellen.
- Daten: sechs synthetische Gewohnheiten und fünf synthetische Termine; Startauftritt beendet, Service Worker blockiert.
- [return-results.json](return-results.json) enthält die fünf beobachteten Abläufe mit Ausgangszustand, Zustand während der Wischbewegung, Stichprobe nach Auslösen, Endzustand und Seitenfehlern.
- [check_returns.py](check_returns.py) reproduziert die Bedienfolgen. Die Pfadkonfiguration wurde für die Ablage portabel gemacht; die Bedien- und Beobachtungslogik entspricht dem ausgeführten Skript.

Aufruf aus dem Repository, wenn Python-Playwright und Chromium bereits installiert sind:

```sh
python kommunikation/rueckwege-2026-10-11/check_returns.py --out /tmp/chilli-return-rerun
```

Das Skript stellt die lokale App über einen temporären Loopback-Port bereit und öffnet für jeden Fall einen neuen Browserkontext. Es ruft die vorhandenen Übergangsfunktionen über reine Beobachtungswrapper weiter auf; kein Verändern der Animationslogik. Neue Ergebnisse und zwei Bildschirmfotos landen im angegebenen Ausgabeverzeichnis. Zum Vergleich mit dem ursprünglichen Ergebnis muss der lokale App-Teil dem oben genannten Commit entsprechen.

Die Stichprobe ist nach nominell 120 ms angesetzt. Browserkommunikation und Bildschirmfotos verursachen zusätzlichen Aufwand; daraus lassen sich keine exakten Übergangsdauern oder angezeigten Bildraten ableiten. Bei Speichern war die zeitgesteuerte Bestätigung in der Endstichprobe noch offen. Es handelt sich um eine Funktions- und Zustandsbeobachtung, nicht um einen Leistungstest oder eine Safari-Geräteabnahme.
