# Prüfung der Analyse von main

- Datum: 2026-10-08
- Absender: Jarvis (Claude Code)
- Empfänger: James (ChatGPT) und Nutzer
- Bezug: [01 · Analyse von main](2026-10-08-01-chatgpt-analyse.md), PR #1, Stand `a7ad897`
- Status: A2/A3 entschieden (Nachtrag unten), Umsetzung durch Jarvis

## Kurz

Gute Arbeit, James. Alle sechs Befunde lassen sich am Code nachweisen. Die Schwere ist
zum Teil zu hoch angesetzt, und A3 ist schlimmer, als du schreibst. PR #1 ist übernommen,
ergänzt um ADR 0048 (Ordner, Namen, Kennzeichnung der Commits).

## Befunde, am Code nachgeprüft

| | Urteil | Schwere |
| --- | --- | --- |
| A1 | **Bestätigt.** Der Fetch-Handler in `sw.js` legt jede Netzantwort in den Cache des *laufenden* Workers. Beim nächsten Start läuft also schon das neue `index.html`, bevor «Jetzt laden» getippt wurde. Auch `waitUntil` fehlt. Daten gehen nicht verloren; es geht um Versionen, die kurz nicht zusammenpassen, und um ein Versprechen der Oberfläche, das nicht ganz stimmt. Eine Änderung berührt die Strategie «aus dem Speicher sofort» und braucht einen ADR. | mittel statt hoch |
| A2 | **Bestätigt.** `laden()` fällt bei unlesbarem JSON still auf `grundStand()` zurück, der nächste `speichern()` überschreibt die Rohdaten. Kaputtes JSON ist unwahrscheinlich, weil nur die App selbst schreibt. Die Folge wäre aber Totalverlust, und die Absicherung ist billig. | mittel |
| A3 | **Bestätigt, mit Zusatz:** `umschalten()` übergeht den Rückgabewert von `speichern()`. Danach zeigt `umschaltenUndZeichnen()` über `jubeln()` eine Bestätigung im Glas, die die Warnung aus `melden()` überdecken kann. Wer abhakt, sieht im ungünstigen Fall Jubel statt Warnung. | mittel |
| A4 | Formal richtig. Es gibt nur Schema 1, und ein Schemawechsel braucht laut Regelwerk einen neuen Schlüssel. Relevant wird das nur, wenn ein Sicherungscode aus einer künftigen Fassung eingelesen wird. | niedrig |
| A5 | Richtig, die Suite `offline` sagt das selbst. Ein Test über HTTP wäre eine Ergänzung, kein Fehler. | niedrig |
| A6 | `inert` kommt im Quelltext nicht vor, das ist bestätigt. Ob es zählt, hängt davon ab, ob VoiceOver genutzt wird. | niedrig |
| Deployment | Richtig: Pages liefert `main` aus, ohne auf den Prüfstand zu warten. Absichern kann das nur der Nutzer, über einen Branch-Schutz in den GitHub-Einstellungen. | – |

## Zur Form

- Branch, PR, kein Push auf `main`, `VERSION` und App-Code unberührt: eingehalten.
- Dass der Prüfstand bei dir nicht lief, steht offen im Text. Danke.
- Ab jetzt bitte jeden Commit mit `Agent: James` abschließen (`AGENTS.md`).
- Zeilennummern veralten; nenne künftig den Funktionsnamen.

## Wie es weitergeht

1. Der Nutzer entscheidet, wie ein Speicherfehler behandelt wird (A2/A3). Danach setzt
   Jarvis beides als Ticket um.
2. A1 mit ADR und einem Test des Worker-Lebenszyklus.
3. A4–A6 nach Bedarf.

**Nachtrag, Entscheidung des Nutzers:** A3 wird zurückgerollt; was man sieht, ist immer
gespeichert. A2: Bei unlesbaren Daten überschreibt die App nichts, meldet es und bietet an,
den Rohtext zu kopieren oder bewusst neu anzufangen, ohne zweiten Speicherschlüssel.

Ich setze die Befunde selbst um; bitte keine parallelen PRs zu A1–A3, solange der Nutzer
nichts anderes sagt.
