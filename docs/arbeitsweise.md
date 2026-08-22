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

## Drei Beispiele

### 1 · Tickets aus der App abarbeiten

Der häufigste Fall. Neue Sitzung, dann **eine** Nachricht:

> ```
> Chillingo, Branch main. Stand bbf5394, Version 2.9.3T.
> Zuletzt: ADR 0094 ausgeliefert.
> Offen: 2.9.3T wartet auf Abnahme am Gerät.
> Lies CLAUDE.md.
> ```
>
> \# Chillingo · 2 Tickets
>
> 1 · Fehler: In «Tippen» steht der Prüfen-Knopf nach dem Drehen des Geräts
> unter dem Rand.
>
> 2 · Wunsch: Die Bilanz soll das Tempo je Woche zeigen, nicht je Übung.

Ich erkenne das Format und fahre den Skill `ticket` von selbst: reproduzieren,
reparieren, im Prüfstand absichern, ADR schreiben, Version stempeln, committen,
pushen. Am Ende kommt der Schnitt mit der neuen Übergabe.

**Ist nichts offen, lassen Sie die Übergabe einfach weg** und schicken nur die Tickets.
`CLAUDE.md` lädt ohnehin.

### 2 · Frei an der App entwickeln

Wenn der Umfang noch unklar ist — «ich will die Lernlogik umbauen», «Buchstaben soll
anders funktionieren» —, **erst `Shift+Tab` für den Planmodus**, dann:

> Ich will, daß «Tippen» in «Übersetzen» aufgeht. Verschaff dir einen Überblick und
> leg mir einen Plan vor, etappenweise. Stell Rückfragen, wo mehrere Lesarten möglich
> sind — ich entscheide lieber vorher als hinterher.

Ich lese mich ein, frage nach, schreibe den Plan. Sie geben ihn frei, dann baue ich.
**Der Planmodus spart am meisten**, weil er die teure Sorte Fehler verhindert: zwei
Stunden in die falsche Richtung.

**Schnitt nach jeder Etappe**, nicht erst am Ende des Umbaus. Ein dreistündiger Umbau
in einer einzigen Sitzung ist genau der Fall, der 780 000 Tokens erzeugt hat.

### 3 · Nur kurz etwas nachsehen

Keine Sitzung aufmachen, kein `/clear`. In einer laufenden Sitzung:

> /btw Was macht `waehleWort()` nochmal genau?

Die Antwort landet **nicht** im Gesprächsverlauf und kostet danach nichts mehr. Ohne
`/btw` schleppen Sie die Antwort bis zum Sitzungsende bei jedem weiteren Aufruf mit.

Dasselbe gilt für «Läuft der Build?», «Was steht in ADR 0086?», «Welche Version ist
draußen?» — alles Fragen, deren Antwort man einmal braucht und nie wieder.

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
