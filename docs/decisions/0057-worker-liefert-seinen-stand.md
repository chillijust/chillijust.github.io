# 0057 · Der Worker liefert seinen Stand, bis «Jetzt laden» getippt ist

*2026-10-11 · Befund A1 von James (Nachricht 01), im echten Worker nachgewiesen als N2
(Nachricht 09 auf `chatgpt/kommunikation`) · Version 0.17.0T15 · ersetzt das Nachsehen im
Hintergrund, das `sw.js` seit 0.1.0 hatte*

## Ausgangslage

Der Fetch-Handler lieferte aus dem Speicher und sah zugleich im Netz nach: Jede frische
Antwort legte er in den Speicher des **laufenden** Workers, ohne darauf zu warten
(`c.put` außerhalb von `waitUntil`). Nach einer neuen Auslieferung lief darum schon beim
zweiten Start die neue App unter dem alten Worker — bevor jemand «Jetzt laden» getippt
hatte. James hat das mit dem unveränderten Worker auf einem lokalen Server nachgewiesen:
erster Neustart v1, zweiter v2, aktiver Worker weiter v1. Das Versprechen «Der neue Worker
wartet, bis der Nutzer es will» stimmte nur für den Worker, nicht für die App.

## Entscheidung

- **Der Worker liefert die Dateien seines Standes aus seinem Speicher**, ohne aufs Netz zu
  warten, auch im Funkloch.
- **Ans Netz geht er nur für das, was fehlt**, und legt es abgewartet dazu. **Was er hat,
  überschreibt er nie.**
- **Eine neue Fassung kommt allein über den neuen Worker**: Der Browser findet ihn beim
  Start (oder über «Nach Aktualisierung suchen»), er richtet sich am HTTP-Cache vorbei
  seinen eigenen Speicher ein und wartet auf «Jetzt laden». Danach fällt der alte Speicher.
- Abgesichert in der Suite `offline` mit `sw.js` selbst in einer Nachbildung von Speicher,
  Netz und Ereignissen: v1 eingerichtet → v2 ausgeliefert → weiter v1 → v2 wartet → «Jetzt
  laden» → v2 → ohne Netz v2.

## Begründung

Der Kommentar in `sw.js` fürchtete, «nur Speicher» wäre eine Falle, in der man für immer
auf dem alten Stand säße. Das gilt nicht, solange jeder Stand den Worker ändert: `build.mjs` stempelt die
Version in `sw.js`, der Browser vergleicht `sw.js` bei jedem Start Byte für Byte und
richtet einen geänderten Worker ein. Das Nachsehen im Hintergrund war damit doppelt — und
der Weg, auf dem die neue App am Nutzer vorbei kam.

## Folgen

- Ein Stand, der `index.html` ändert, ohne die Version zu ändern, kommt nie an. Das
  verhindert schon `pruefen.mjs` (Version nur über `VERSION` und `build.mjs`).
- Wer noch einen Worker vor 0.17.0T15 hat, bekommt den Wechsel ein letztes Mal auf dem
  alten Weg; ab dem neuen Worker gilt diese Regel.
- Ob Safari den neuen Worker in der Home-Bildschirm-App so findet wie Chromium, zeigt nur
  das Gerät: neue Fassung ausliefern, App zweimal starten — die Version in den
  Einstellungen bleibt, bis «Jetzt laden» getippt ist.
