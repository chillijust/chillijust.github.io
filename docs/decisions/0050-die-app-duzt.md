# 0050 · Die App duzt

**Stand:** angenommen · 2026-08-10

## Ausgangslage

Die App siezte durchgehend — «Wussten Sie?», «Schreiben Sie auf Russisch», «Sie beugen
besser als mein Onkel». Beim Entwurf eines Tutorials stellte sich die Frage, wie es den
Nutzer anspricht. Ein Tutorial, das duzt, während die Chili zwei Minuten später wieder
siezt, wäre ein hörbarer Bruch.

## Entscheidung

**Alles, was den Nutzer anspricht, duzt.** Oberfläche, Leerzustände, Einstellungen,
Kommentare, Jubeltexte, Meldeblatt.

**Der Lehrstoff bleibt unberührt.** Das ist keine Ausnahme aus Bequemlichkeit, sondern
eine Notwendigkeit:

| Stelle | warum sie «Sie» behält |
| --- | --- |
| `вы` → «ihr / Sie» | die Vokabel selbst |
| `ваш` → «euer / Ihr» | dieselbe |
| «Sie schreibt einen Brief.» | она пишет — dritte Person, nicht die Anrede |
| «Sie sind männlich» | über папа, дедушка, дядя |
| «Ihr Stamm ist der Infinitiv» | über die Verben |
| «Sie stehen wieder in «Buchstaben»» | über gefallene Buchstaben |
| «Sie sammeln sich hier an» | über die Sprachfakten |
| «Sie liegen nur auf diesem Gerät» | über die Tickets |

## Begründung

**Eine pauschale Ersetzung hätte den Lehrstoff beschädigt.** «Sie» ist im Deutschen
dreifach belegt: Anrede, dritte Person Plural, dritte Person Singular weiblich in der
Verbform. In einer Russisch-App kommen alle drei vor, und zwei davon sind Inhalt. Jede
der 37 Stellen wurde darum einzeln gelesen, keine gesucht-und-ersetzt.

**Die Ausnahmen stehen namentlich in der Prüfung**, nicht als Regel im Kopf. Wer später
eine hinzufügt, muss sie in `tools/pruefstand/suiten/anrede.mjs` eintragen und damit
begründen — eine stille Ausnahme gibt es nicht.

## Folgen

- Die Suite `anrede` liest den **gerenderten Text** von sechzehn Ansichten, allen vier
  Einstellungsreitern, allen Kommentaren und allen Jubeltexten.
- **Sie liest gezielt aus `#kopf`, `#main`, den Blättern** — nicht aus `document.body`.
  Der erste Entwurf nahm `body.innerText`, das im kopflosen Browser mangels Layout nur
  ein paar hundert Zeichen liefert; die Suite war grün und prüfte nichts.
  `body.textContent` wäre das andere Extrem: Es nimmt das eingespritzte Prüfskript mit,
  in dem «Schreiben Sie das Wort.» als Beispiel steht.
- Zwei Gegenproben halten fest, dass der Lehrstoff **nicht** mitgeduzt wurde.
