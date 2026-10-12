# 0058 · Der Prüfstand läuft im Fenster des iPhones

*2026-10-12 · Stand 0.17.0T16 · Block 2 aus Nachricht 15 (James 13) · erledigt den Nebenbefund aus 0056*

## Ausgangslage

Der Läufer rief Chromium je Suite mit `--dump-dom --window-size=430,932`. Das kopflose
Chrome hält aber mindestens 500 Punkte Breite und zieht 87 Punkte Leiste ab: Geprüft wurde
in 500 × 845, nicht auf dem Zielgerät (ADR 0056). Kein Schalter ändert das; die
Kopfloshülle könnte es, fehlt aber auf GitHub.

In James' Lauf mit 430 × 932 wichen `kalender` und `langdruck` ab. Im echten Fenster fielen
genau diese beiden:

- **kalender S7:** Die Suite las den Loslasspunkt an der Seite ab, die schon mit dem Finger
  gewandert war, und ließ 100 Punkte weiter links los — bei −200 statt −100. In 500 Breite
  federte das zufällig zurück, in 430 blätterte es. Ein Fehler der Suite, nicht der App.
- **langdruck G3:** Die klassische Bildlaufleiste nimmt 15 Punkte. War die Seite nach der
  Rückkehr knapp höher als das Fenster, erschien sie, «0 von 1» brach um, und die Kachel
  rückte 54 Punkte tiefer. Auf dem iPhone liegt die Leiste über dem Inhalt. Dazu lud eine
  Schrift erst, wenn sie gebraucht wurde — mitten im Test.

## Entscheidung

- **Der Läufer steuert Chromium über das DevTools-Protokoll** (`tools/pruefstand/kopflos.mjs`,
  `WebSocket` aus Node 22, nichts installiert): ein Browser für alle Suiten, je Suite ein
  eigener Browserkontext mit eigenem Speicher, das Fenster genau über
  `Emulation.setDeviceMetricsOverride`, die Bildlaufleiste ohne Platz
  (`setScrollbarsHidden`). Die virtuelle Zeit wird vor dem Laden angehalten und danach mit
  dem Budget von 20 s freigegeben — wie zuvor `--virtual-time-budget`.
- **Vor jedem Rumpf sind alle Schriften geladen** (`testseite()` in `helfer.mjs`).
- Eine Suite verlangt ein anderes Fenster genau so groß, wie die Seite es sieht
  (Querformat `'932,430'` statt `'932,517'`).

## Begründung

Was Lagen misst, prüft sonst einen Bildschirm, den niemand hat. Lokal und auf GitHub läuft
dasselbe Chromium-Protokoll; ein Weg, der nur lokal stimmt, wäre schlimmer als ein falsches
Fenster.

## Folgen

- Gleiche Zahl der Prüfungen wie zuvor (1482), dazu drei im Gerüst: Fenster, Schriften,
  Bildlaufleiste — 1485. Der ganze Lauf dauert rund 22 statt 38 s.
- Jede Seite beginnt auf einer leeren `file://`-Seite, nicht auf `about:blank`: Von dort
  nach `file://` wechselt Chromium den Prozess, und mit virtueller Zeit stürzt der Renderer
  dabei ab.
- Hängt eine Suite, meldet der Läufer sie nach zwei Minuten und startet den Browser neu.
- Nebenbefund im echten Fenster: «10 von 12» bricht im Tagesring auf zwei Zeilen um, die
  Karte wird höher. Eine Gestaltungsfrage an den Nutzer, kein Teil dieses ADR.
- Keine neue Version — `index.html` ist unverändert.
