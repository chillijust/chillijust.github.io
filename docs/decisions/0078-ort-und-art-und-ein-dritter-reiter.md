# 0078 · Ort und Art sind zwei Fragen — und ein dritter Reiter

**Stand:** angenommen · 2026-08-15 · aus zwei Tickets
**Ergänzt:** ADR 0069 (der Bezug ist eine Wahl) · ADR 0074 (das Klappfeld) ·
ADR 0025 (der Entwurf überlebt das Zuklappen)

## 1 · Zwei Felder statt einer langen Liste

**Befund:** «Nimm mehr häufige Gründe dazu (ca. 3). Ich hätte gerne die Übungen
auch dabei. Gibt es eine Möglichkeit, es übersichtlich zu halten, ohne direkt
30 verschiedene Arten zu haben?»

Der letzte Satz ist die eigentliche Frage, und die Antwort ist: **weil zwei
verschiedene Dinge in eine Liste sollten.** «Lernsets» beantwortet *wo*,
«Anzeige» beantwortet *was*. In einer Liste zusammengelegt

- wächst sie auf die Summe beider (rund dreißig Einträge) und
- kann man nur **eines von beidem** sagen.

**Entscheidung:** Zwei Klappfelder derselben Bauart (ADR 0074).

| Feld | Inhalt | Länge |
| --- | --- | --- |
| **Betrifft** | Übersicht, die acht Übungen, die Menüansichten | unverändert |
| **Art** | Anzeige oder Darstellung · Bedienung · Falscher Inhalt · Stürzt ab oder hängt · Ton oder Vorlesen · Sonstiges | 6 |

Die Übungen **waren bereits alle in der Liste** — sie stehen hinter einer
Rollleiste, und das ist der wahrscheinlichere Grund, warum sie als «begrenzt»
erschien.

Die sechs Gründe sind absichtlich grob. Feiner geschnitten müsste man raten,
welche Schublade gemeint ist, und das ist mehr Arbeit als ein Satz im Text.

**Nur beim Fehler.** Ein Wunsch hat keinen Grund, er hat einen Zweck — und der
steht im Text. Wird nach einer Wahl auf «Wunsch» umgeschaltet, geht die Art
beim Sichern nicht mit.

Das Feld heißt im Ticket `grund` und fährt durch den **gebündelten Text**
(`- Art: …`) und wieder zurück. Ein Feld, das den Weg nach draußen und zurück
nicht überlebt, ist auf dem zweiten Gerät verloren (ADR 0069).

## 2 · «Bearbeiten» als dritter Reiter

**Befund:** «Können wir in der Ticket-Erstellung einen weiteren Reiter dazu
machen? Reiter: bearbeiten. Funktion: aktuelle Tickets aufgelistet anzeigen und
auswählbar zur Bearbeitung machen.»

Bis hierher führte der einzige Weg zu einem vorhandenen Ticket über das Menü in
die Ticketansicht. Der Reiter bringt die Liste dorthin, wo man ohnehin schreibt.

**Entscheidung:** Ein dritter Chip in derselben Reihe — «Fehler · Wunsch ·
Bearbeiten». Auf Nachfrage so entschieden; ich hatte eine eigene Zeile darüber
vorgeschlagen, weil die Reihe damit zwei verschiedene Fragen mischt: Fehler und
Wunsch sagen, *was für ein* Ticket es wird, «Bearbeiten» ist eine andere
Tätigkeit. Der Nutzer sieht dort «was jetzt», und «ein vorhandenes ändern» ist
für ihn die dritte Antwort darauf.

**Im Zustand bleiben beide getrennt**, auch wenn sie sich eine Reihe teilen:
`meldeArt` sagt, was für ein Ticket entsteht, `meldeModus`, was das Blatt gerade
zeigt. Sonst wäre «Bearbeiten» ein dritter Ticket-Typ, und der erste, der einen
echten dritten Typ braucht, hätte das Problem.

**Der Entwurf überlebt den Abstecher** (ADR 0025): Der Schreibteil wird
verborgen, nicht ausgeräumt. Wer in die Liste schaut und zurückkommt, findet
seinen halben Satz wieder.

Das Blatt öffnet **immer** im Schreibteil — die Liste ist ein Abstecher, kein
Zustand, in dem man es verlässt (derselbe Gedanke wie ADR 0072).

## Was das Bildschirmfoto fand und die Prüfung nicht

Die Knopfzeile «Abbrechen / Sichern» stand im Reiter «Bearbeiten» weiter da,
obwohl sie das Attribut `hidden` trug: `.btn-row` hat `display: flex`, **und ein
gesetztes `display` sticht `[hidden]`**. Genau diese Falle steht seit ADR 0059
in der Arbeitsanweisung.

Meine Prüfung fragte `el.hidden === true` — das Attribut — und war grün. Sie
fragt jetzt `getComputedStyle(…).display`.

> **Eine Prüfung auf ein Attribut prüft nicht, was man sieht.** Die
> Augenprüfung hat hier gefunden, was die DOM-Prüfung durchgewinkt hat; sie
> ersetzen einander nicht.

## Folgen

- `tickets` bekommt `F3h`–`F3p` (die beiden Felder, der dritte Reiter, der
  überlebende Entwurf), `Y3b`/`Y3c` (die Art fährt durch den Text) und einen
  Abschnitt **Z** (aus der Liste heraus bearbeiten, samt Leerzustand).
- `#meldeAktionen`, `#meldeNeu` und `#meldeListe` bekommen ihre
  `[hidden] { display: none }`-Zeile.
