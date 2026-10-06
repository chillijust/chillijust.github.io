# 0019 · Alle Meldungen im Glas

*2026-10-06 · nach 0.7.0 · Version 0.7.1T · ergänzt 0018*

## Ausgangslage

Seit ADR 0018 kamen «Gespeichert» und «Angelegt» als Glas mit Haken, alles Übrige noch als
Zeile unten — etwa «Eingetragen. Ab jetzt zählt es neu.» nach einem Rückfall, Fehler im
Formular oder «Kommt mit einer der nächsten Fassungen.». Gewünscht: alle Meldungen im Glas.

## Entscheidung

- **`melden(text, zeichen)` zeigt das Glas** (über `bestaetigen`), keine Zeile mehr. Der
  erste Satz wird Titel (ohne Schlußpunkt), der Rest steht darunter. Die Meldung quillt
  aus dem, was gerade getippt wurde (`document.activeElement`), und fließt dorthin zurück.
- **Haken nur für Gelungenes** (`'haken'`): Rückfall eingetragen, Welle gewonnen,
  archiviert, gelöscht, Markierung aufgehoben. Fehler, Hinweise und «bald» tragen das
  neutrale Zeichen.
- `#meldung` bleibt als unsichtbarer Halter des letzten Wortlauts; vorgelesen wird die
  Karte (`role="status"`). Die Zeile unten gibt es nicht mehr.
- Dauer und Schließen wie jede Bestätigung: mit dem Text länger, höchstens 4 s, ein Tipp
  schließt früher.

## Begründung

Eine Art, etwas zu melden, statt zweier: Wer das Glas einmal kennt, liest jede Meldung am
selben Ort. Den Wortlaut in Titel und Satz zu teilen, hält die bestehenden Texte, ohne jede
Stelle einzeln umzuschreiben.

## Folgen

- Wer eine neue Meldung braucht, ruft `melden()`; was gelang, mit `'haken'`.
- Ein Fehler im Formular legt das Glas über die Felder; ein Tipp schließt es.
- Suiten: `abgewoehnen` C11a, E5a; `menue` C2; `exportwege` A7.
