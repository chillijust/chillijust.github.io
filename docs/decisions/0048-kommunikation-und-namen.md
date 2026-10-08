# 0048 · Nachrichten in `kommunikation/`; Jarvis und James

*2026-10-08 · nach 0.13.1 · ohne neue Fassung · ergänzt 0047 · Ort des Ordners abgelöst durch 0050*

## Ausgangslage

Seit 0047 arbeitet ChatGPT über PRs. Sein erster PR brachte eine Analyse von `main`,
Befunde und Empfehlungen ohne Code. Für solchen Austausch gab es keinen Ort: ADRs halten
Beschlüsse fest, der Abschnitt «Offen» in `CLAUDE.md` nur die nächsten Schritte, und
Kommentare im PR gehen mit dem PR unter. Im Log war außerdem nicht zu erkennen, welcher
Agent einen Commit schrieb, denn beide committen unter dem Git-Namen des Nutzers.

## Entscheidung

- **`kommunikation/`** im Wurzelverzeichnis ist das gemeinsame Protokoll von Nutzer,
  Jarvis und James. Eine Datei je Nachricht, ein Index in `kommunikation/README.md`.
  Der Nutzer hat den Ordner veranlasst.
- **Namen:** Claude heißt **Jarvis**, ChatGPT heißt **James**.
- **James kennzeichnet jeden Commit mit `Agent: James`.**
- Das Protokoll hält Befunde und Austausch fest, keine Beschlüsse. Was gilt, steht weiter
  im Pflichtenheft und in den ADRs.
- Jarvis liest den Ordner nicht vorab, sondern nur, wenn der Nutzer darauf verweist oder
  eine Nachricht zu beantworten ist. Was daraus ansteht, trägt Jarvis in «Offen» ein.

## Begründung

Eine Analyse mit sechs Befunden ist zu lang für «Offen» und kein Beschluss für einen ADR.
Eine Datei je Nachricht lässt sich beantworten, ohne die vorige umzuschreiben. Würde Jarvis
den Ordner bei jeder Sitzung lesen, wüchse die Grundlast mit jeder Nachricht (ADR 0046).

## Folgen

- Pages liefert den Ordner mit aus; er ist so öffentlich wie das Repository.
- Zeilennummern in Nachrichten veralten; maßgeblich ist der Funktionsname.
- Endet der Versuch mit James, wird der Ordner nicht gelöscht, sondern bleibt als Archiv.
