---
name: ticket
description: Ein Chillingo-Ticket vom Befund bis zur bestätigten Auslieferung abarbeiten — reproduzieren, reparieren, absichern, Version, Commit, Deploy prüfen. Verwenden, sobald ein Ticket im Format «# Chillingo · N Tickets» ankommt oder ein Fehler beziehungsweise Wunsch aus der App gemeldet wird.
---

# Ein Ticket abarbeiten

Ein Ticket kommt aus dem Meldeblatt der App und trägt **Ort**, **Wunsch** oder
**Fehler**, App-Stand und Gerät. Mehrere in einer Nachricht werden einzeln
abgearbeitet, aber gemeinsam ausgeliefert, wenn sie zusammengehören.

## Der Weg

**1 · Verstehen, bevor gesucht wird.** Bei Unklarheit oder mehreren möglichen
Lesarten `AskUserQuestion` benutzen — der Nutzer hat ausdrücklich um Rückfragen
gebeten. Eine Rückfrage ist billiger als eine Auslieferung in die falsche
Richtung.

**2 · Bei einem Fehler: erst reproduzieren.** Ein Prüfskript schreiben, das den
Befund am DOM zeigt, **bevor** eine Zeile geändert wird → Skill `pruefstand`.
Der gemeldete Befund stimmt oft nicht wörtlich; der Prüfstand sagt, was wirklich
passiert.

**3 · Fragen, ob dieselbe Ursache anderswo steckt.** Die App hat sieben Übungen,
die sich Muster teilen. Ein Fehler im Jubel saß in vier davon, ein Fehler im
Abstand in allen Fortschrittsreihen. Wer nur die gemeldete Stelle repariert,
bekommt die nächste Meldung.

**4 · Reparieren** — im vorhandenen Stil (ES5-nah, `var`, `function`, zwei
Leerzeichen, deutsche Kommentare, die das *Warum* nennen).

**5 · Absichern.** Die Prüfung, die den Fehler zeigte, wird eine Suite. Sie ist
ab jetzt das Gedächtnis dafür.

**6 · Aussehen prüfen**, wenn die Änderung sichtbar ist: Bildschirmfoto in
Handybreite, und zwar in **Dark und einem hellen Schema**.

**7 · Dokumentieren.** Eine Entscheidung mit Begründung bekommt einen ADR unter
`docs/decisions/`, fortlaufend nummeriert. Eine Regel, an die man sich später
halten muss, kommt zusätzlich als **ein Satz** in `CLAUDE.md`. Berührt die
Änderung Zustand oder Renderzyklus, gehört sie in `docs/architektur.md`.

**8 · Version stempeln** (`VERSION`, danach `node tools/build.mjs`):
erste Ziffer = der Lernstand wird anders gelesen · zweite = etwas kommt dazu ·
dritte = alles Übrige. Ein Fehler ist die dritte.

**9 · Commit** — einer je logischer Änderung, Betreff im Imperativ, im Rumpf
steht das *Warum*, nicht das *Was*.

**10 · Push.** Der Hook fährt `build.mjs --check`, `pruefen.mjs` und den
Prüfstand und hält an, wenn etwas rot ist.

**11 · Auslieferung bestätigen.** Den Pages-Build abwarten und prüfen (siehe
unten). Erst dann ist das Ticket erledigt.

## Die Auslieferung prüfen

`chillijust.github.io` ist aus der Arbeitsumgebung **nicht erreichbar** (Proxy).
Der Nachweis läuft über den Workflow-Lauf. Die Antwort des GitHub-Werkzeugs ist
zu groß fürs Lesen und wird in eine Datei gespeichert — daraus lesen:

```sh
python3 -c "
import json
d=json.load(open('<gespeicherte Datei>'))
r=d['workflow_runs'][0]
print(r['head_sha'][:7], r.get('status'), r.get('conclusion'), r.get('updated_at'))
"
```

Der Bau braucht ein bis drei Minuten. Danach dem Nutzer sagen, dass die
Live-Seite selbst nicht abrufbar war und er am Gerät gegenprüfen möge — und dass
eine Home-Bildschirm-Verknüpfung ihren eigenen Cache hält.

## Wie berichtet wird

Auf Deutsch, mit «Sir», in der Sie-Form. Knapp und direkt. Was hineingehört:

- **Was die Ursache war**, nicht nur was geändert wurde. Der Nutzer hat den
  Fehler gesehen; ihn interessiert, warum er entstand.
- **Entscheidungen, die ich getroffen habe** und die er anders sehen könnte —
  ausdrücklich als solche benannt, mit Begründung und dem Angebot, es zu drehen.
- **Was ich bewusst *nicht* gemacht habe** und warum.
- **Was geprüft wurde**, mit Zahlen.
- **Was er selbst tun muss** — am Gerät nachsehen, Cache leeren.

Nebenbefunde nicht verschweigen: Ein stiller Mangel im Prüfstand oder eine
veraltete Annahme ist eine Meldung wert, auch wenn niemand danach gefragt hat.
