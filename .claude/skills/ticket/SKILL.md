---
name: ticket
description: Ein Chillinal-Ticket vom Befund bis zum Push abarbeiten — reproduzieren, reparieren, im Prüfstand absichern, dokumentieren, Version stempeln, committen. Verwenden, sobald ein Ticket im Format «# Chillinal · N Tickets» ankommt oder ein Fehler beziehungsweise Wunsch aus der App gemeldet wird.
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

**3 · Fragen, ob dieselbe Ursache anderswo steckt.** Gewohnheiten, Abgewöhnen
und Termine teilen sich Muster — Tagesgrenze, Kachel, Ring, Kalender. Wer nur die
gemeldete Stelle repariert, bekommt die nächste Meldung.

**4 · Reparieren** — zwei Leerzeichen, deutsche Kommentare, die das *Warum* nennen.
Innerhalb von Funktionen ist modernes JavaScript erlaubt (`let`/`const`, Pfeile,
Template-Strings); auf oberster Ebene bleibt es bei `var` und `function`, sonst kann
der Prüfstand sie nicht ersetzen (ADR 0045).

**5 · Absichern.** Die Prüfung, die den Fehler zeigte, wird eine Suite. Sie ist
ab jetzt das Gedächtnis dafür.

**6 · Aussehen prüfen**, wenn die Änderung sichtbar ist: Bildschirmfoto in
Handybreite, und zwar **hell und dunkel**.

**7 · Dokumentieren.** Ein ADR nur für eine echte Entscheidung — Datenmodell,
Rechnung, neue Grundmechanik, Abweichung vom Pflichtenheft (`.claude/rules/docs.md`,
ADR 0045). Feinschliff und Fehlerbehebung tragen ihr *Warum* im Commit-Rumpf; das
Verhalten hält die Suite. Eine Regeldatei bekommt nur dann einen Satz, wenn weder
Code noch Suite die Falle von selbst zeigen. Berührt die Änderung Zustand oder
Renderzyklus, gehört sie in `docs/architektur.md`.

**8 · Version stempeln** (`VERSION`, danach `node tools/build.mjs`):
erste Ziffer = gespeicherte Daten werden anders gelesen · zweite = etwas kommt dazu ·
dritte = alles Übrige. Ein Fehler ist die dritte.
Ausgeliefert zum Ansehen am Gerät wird mit **`T`** am Ende (`0.14.0T`); jede weitere
Nachbesserung an derselben angesagten Fassung zählt es hoch (`0.14.0T2`). Erst die Abnahme
durch den Nutzer nimmt das `T` weg.

**9 · Commit** — einer je logischer Änderung, Betreff im Imperativ, im Rumpf
steht das *Warum*, nicht das *Was*.

**10 · Push.** Der Hook fährt `build.mjs --check`, `pruefen.mjs` und den
Prüfstand und hält an, wenn etwas rot ist. **Damit ist das Ticket erledigt.**
Meldet der Push einen **Hinweis** (etwa die Größe von `index.html` über 600 KB,
ADR 0046), gehört er in den Bericht an den Nutzer — nicht still übergehen.

**Den Pages-Bau nicht mehr über GitHub nachschlagen.** Der Hook hat den ganzen
Prüfstand da bereits gefahren, und ein Lauf-Abruf schüttet bis zu 50 000 Zeichen
in den Kontext, die von da an bei jedem weiteren Aufruf mitkosten. Statt dessen
dem Nutzer sagen: die Live-Seite ist aus der Arbeitsumgebung nicht abrufbar
(Proxy), er möge am Gerät gegenprüfen — und eine Home-Bildschirm-Verknüpfung
hält ihren eigenen Cache. Nur wenn er ausdrücklich nach dem Lauf fragt, wird er
abgerufen.

**11 · Schnitt anbieten.** Ist der Block ausgeliefert, «Sir, hier wäre ein guter
Schnitt» sagen — und die Übergabe **als Codeblock zum Kopieren** anhängen, in der
Form, die in `CLAUDE.md` unter «Umgang mit mir» steht. Nie als Fließtext: Was der
Nutzer abschreiben muss, schreibt er nicht ab.

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
