# 0032 · Der Präpositiv — und warum Grammatik allein nicht reicht

**Status:** angenommen · 2026-08-06 · baut auf ADR 0030 und 0031

## Kontext

Etappe 3 des Grammatikplans: der Ortsfall nach в und на. Dreizehn Formen in den Sätzen —
`в городе`, `на столе`, `в Москве`, `в России`, `в этом году`.

Die Regel ist die einfachste bisher: fast alles endet auf `-е`, und das Geschlecht spielt
keine Rolle. Gerade darin liegt der Reiz, denn im Akkusativ war es umgekehrt.

## Entscheidung

1. **`data/nomen.json`** trägt, was die Regel nicht erreicht — vier Gruppen.
2. **Die Belebtheit gilt für alle Geschlechter**, nicht mehr nur für männliche Nomen.
3. **Der Präpositiv ist die einzige Rubrik mit ausgesuchten Wörtern.**
4. **Kyrillisch steht nie in einem Versalien-Etikett.**

## Begründung

**Der erste Entwurf war grammatisch tadellos und trotzdem falsch.** Der Bildschirm zeigte
«мама → в маме», «папа → в папе», «брат → в брате». Jede Form ist richtig gebildet. Keine
davon ergibt einen Sinn: In einer Mutter ist niemand.

Das ist die eigentliche Lehre dieser Etappe. Bisher genügte es, dass die Maschine richtig
rechnet — beim Geschlecht, beim Akkusativ, beim Präsens fällt keine Aufgabe aus dem
Rahmen, egal welches Wort sie erwischt. Der Ortsfall fragt zum ersten Mal etwas über die
**Welt**, nicht über die Sprache: Kann dieses Ding ein Ort sein? Darauf antwortet keine
Endung.

**Zwei Antworten, beide nötig.** Die Belebtheit ließ sich in den Daten nachtragen, und
das war ohnehin fällig: Sie ist eine eigene Eigenschaft, kein Geschlecht, und der
Genitiv wird sie ebenso brauchen. 18 weibliche Lebewesen tragen jetzt `wb`. Aber sie
löst nur die Hälfte — `утро`, `год`, `минута` sind keine Lebewesen und trotzdem keine
Orte. Für den Rest hilft nur, dass der Autor die Wörter benennt.

**Ausgesuchte Wörter sind ein Bruch mit ADR 0030 — ein begrenzter.** Dort steht, die
Übung solle auf dem begonnenen Wortschatz wirken, weil eine Regel sonst nur ihre eigene
Tabelle prüft. Das gilt weiter: Die **Regel** greift auf jedes Nomen des Lehrplans, und
im Satz führt «Wissen» sie an allen vor — `в России`, `в году`, `на кухне`. Nur die
**Übung** wählt aus 34 Wörtern, die ein Ort sein können, und nimmt daraus, was schon
gelernt ist. Der Unterschied zu einer Formentabelle bleibt: Gefragt ist eine Form, die
man nie gesehen hat.

**Die Belebtheit sauber zu trennen, deckte zwei Fehler auf.** Sobald `мама` das Kürzel
`wb` trug, hätte der Baustein «Geschlecht» sie als **Ausnahme** ausgegeben — «Die Endung
sagt etwas anderes» —, was schlicht unwahr ist: `-а` sagt weiblich, völlig richtig, die
Belebtheit steht nur obendrauf. Und `мышь` wäre im Präpositiv zu «мыше» geworden, weil
die Regel auf `art === 'w'` prüfte statt auf das Geschlecht. Beides kam davon, das rohe
Kürzel für das Geschlecht zu halten. Jetzt fragt jede Stelle `geschlecht()`.

**Der Ortsfall auf -у ist keine Regel, sondern eine Liste.** `в году`, `в лесу`,
`в аэропорту`, `на мосту` — eine Handvoll männlicher Wörter, die nach в/на ein `-у`
nehmen statt `-е`. Herleiten kann man das nicht. Sie stehen deshalb in `nomen.json` und
sind damit — wie die Verben mit eigenem Stamm — **erklärt, aber nicht abgefragt**. Die
Fußnote der Regelkarte nennt sie beim Namen, damit niemand sie für einen Fehler hält.

**Kyrillisch verträgt keine Versalien.** Das Etikett «Wo? — die Form nach в und на» las
sich in Großbuchstaben als «NACH B UND HA»: Aus в wird ein lateinisches B, aus на ein HA.
Eine Regel im Stylesheet nimmt jetzt `.cyr` von der Umwandlung aus — und der Untertitel
des Bausteins, der als Ganzes durch die Versalien läuft, heißt schlicht «Wo? — der
Ortsfall».

**Die Probe auf den überflüssigen Eintrag hat wieder zugeschlagen.** `кофе` stand als
unveränderliches Lehnwort in der Liste — überflüssig, denn es endet ohnehin auf `-е`, und
die Regel lässt solche Wörter in Ruhe. Sollte später ein Fall kommen, in dem sich das
unterscheidet, verlangt der Build den Eintrag dann.

## Folgen

- 58 von 110 fremden Formen sind erklärt (53 %, vorher 41 %).
- Sechs Bausteine. `data/nomen.json` mit 23 Einträgen; 18 Vokabeln bekamen `wb`.
- `GESCHLECHT_VON`, `geschlecht()`, `belebt()` in App und Build; `akkusativ()` und
  `praepositiv()` fragen das Geschlecht, nie das Kürzel.
- Neue Rolle `praep`; neue Aufgabe `praep`; `ROLLE_NAME` und «Wissen» kennen sie.
- `grammForm()` gibt für eine Rolle, die zur Wortart nicht passt, jetzt `null` statt
  einer stillen Grundform — ein Verb hat keinen Akkusativ.
- Testreihe `grammatik.mjs` von 108 auf 139 Prüfungen; zusammen 802.
- Offen: Vergangenheit (11 Formen), Genitiv (~6), Mehrzahl, Adjektivangleichung,
  Zeitangaben im Instrumental (`утром`, `зимой`).
