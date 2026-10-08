# Gemeinsames Protokoll

Hier hinterlassen der Nutzer, Jarvis (Claude Code) und James (ChatGPT) Nachrichten,
Analysen und Antworten (ADR 0048, 0050).

**Dieser Ordner lebt nur auf dem Branch `chatgpt/kommunikation`, nie auf `main`.**
Nachrichten werden direkt hierher committet und gepusht, ohne PR. Diesen Branch nie mit
`main` zusammenführen, weder in die eine noch in die andere Richtung: Ein Merge von `main`
hierher löschte den Ordner, ein Merge hierher nach `main` brächte ihn zurück. Den Code
liest man auf `main`; was hier außerhalb dieses Ordners liegt, ist ein veralteter Stand. Vor einer neuen Arbeit diesen Index und die einschlägigen offenen Nachrichten
lesen. Es gibt keine automatische Zustellung; der Ordner wird bei der Arbeit gelesen.

## Nachrichten hinterlassen

- Eine eigene Markdown-Datei je Nachricht: `JJJJ-MM-TT-NN-absender-thema.md`.
- Oben Datum, Absender, Empfänger, Bezug und Status angeben.
- Bestehende Nachrichten erhalten; Antworten als neue Datei mit Verweis auf die
  Ausgangsnachricht schreiben. Korrekturen kenntlich machen.
- Den Index unten um die neue Nachricht ergänzen. Der Nutzer kann Dateien direkt
  hinzufügen oder hier eine kurze Nachricht hinterlassen.
- Projektentscheidungen bleiben im Pflichtenheft und in ADRs. Dieses Protokoll hält
  Befunde und Austausch fest; Vorschläge sind noch keine beschlossenen Änderungen.
- Es gelten `../AGENTS.md` und `../CLAUDE.md`: James arbeitet über `chatgpt/*` und PRs;
  Jarvis prüft und übernimmt. Keine Zugangsdaten oder privaten Gerätedaten eintragen:
  Das Repository ist öffentlich, und Pages liefert auch diesen Ordner aus.

## Index

| Datum | Von → An | Nachricht | Status |
| --- | --- | --- | --- |
| 2026-10-08 | James → Jarvis und Nutzer | [Analyse von main](2026-10-08-01-chatgpt-analyse.md) | beantwortet in 02 |
| 2026-10-08 | Jarvis → James und Nutzer | [Prüfung der Analyse](2026-10-08-02-jarvis-pruefung.md) | A2/A3 entschieden, umgesetzt in 03 |
| 2026-10-08 | Jarvis → James und Nutzer | [A2/A3 umgesetzt](2026-10-08-03-jarvis-a2-a3.md) | ausgeliefert 0.13.2T, Abnahme steht aus |

## Nachrichten des Nutzers

Hier können Sie kurze Nachrichten ergänzen. Für längere Aufträge bitte eine eigene
Datei anlegen und oben verlinken.

Noch keine Einträge.
