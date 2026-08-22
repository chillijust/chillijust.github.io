# So arbeiten wir mit Claude an Chillingo

Kurzanleitung für den Nutzer. Warum das so ist, steht am Ende.

## Die drei Handgriffe

**1 · Eine Sitzung, ein Vorgang.**
Ein Ticketblock, ein Umbau, eine Frage — dann Schnitt. Ich melde mich von selbst mit
**«Sir, hier wäre ein guter Schnitt»** und hänge die Übergabe an. Sie tippen `/clear`
und setzen die Übergabe als erste Nachricht ein. Fertig.

**2 · Das Modell steht auf Sonnet.**
Das ist die Vorgabe in `.claude/settings.json` und gilt ab der nächsten frischen Sitzung.
Wird etwas kniffelig — Lernlogik umbauen, ein Fehler, der sich versteckt —, tippen Sie
`/model opus`. Das gilt nur für diese eine Sitzung. Ich sage Bescheid, wenn ich meine,
daß es sich lohnt.

**3 · Nebenfragen mit `/btw`.**
«Was macht eigentlich `waehleWort()`?» — mit `/btw` davor bleibt die Antwort außerhalb
des Gesprächs und kostet danach nichts mehr.

## Die Übergabe

Sie kommt immer als Codeblock, fünf Zeilen, zum Kopieren ohne Änderung:

```
Chillingo, Branch main. Stand <sha>, Version <VERSION>.
Zuletzt: <was gerade fertig wurde, ein Satz>
Offen: <was als Nächstes ansteht — oder «nichts»>
Achtung: <nur was diese Lage betrifft — sonst Zeile weglassen>
Lies CLAUDE.md.
```

**Mehr braucht es nicht.** Was Chillingo ist, welche Übungen es gibt, wie der Prüfstand
läuft — das steht in `CLAUDE.md` und wird beim Start jeder Sitzung von selbst geladen.
Es in die Übergabe zu schreiben hieße, es zweimal zu bezahlen. Die Übergabe trägt nur,
was **CLAUDE.md nicht wissen kann**: die Lage von heute.

Fehlt Ihnen die Übergabe, genügt: *«Gib mir die Übergabe.»*

## Zwei Befehle zum Nachsehen

| | |
| --- | --- |
| `/context` | was gerade geladen ist und wie groß der Sockel ist |
| `/usage` | was diese Sitzung bisher gekostet hat |

## Warum

Jeder Aufruf schickt die **ganze bisherige Sitzung** noch einmal mit. Gemessen an einer
langen Sitzung im August 2026: 720 Aufrufe, Kontext von 84 000 auf 780 000 Tokens
gewachsen, davon zwei Drittel der Kosten allein dadurch, daß abgeschlossene Vorgänge
liegenblieben. Nach der Hälfte kostete ein einzelnes «weiter» so viel wie fünf am Anfang.

Dazu kommt: Der Zwischenspeicher lebt eine Stunde. Wer nach einer längeren Pause in eine
große Sitzung zurückkehrt, zahlt den ganzen Kontext noch einmal — bei 700 000 Tokens
teuer, bei 165 000 kaum spürbar.

Die Regeln selbst liegen nicht mehr alle in `CLAUDE.md`, sondern themenweise unter
`.claude/rules/`. Sie laden automatisch, sobald die passende Datei angefaßt wird: Wer nur
einen ADR schreibt, lädt die Oberflächenregeln gar nicht erst.
