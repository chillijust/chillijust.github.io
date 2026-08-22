---
paths:
  - "data/**"
  - "tools/build.mjs"
---

# Lerninhalte · Chillingo

Gilt für `/data` und den Build. Begründungen in den ADRs unter `docs/decisions/`.
Nach jeder Änderung: `node tools/build.mjs` (`--check` = nur prüfen).

## Grammatik

- **Grammatik ist eine Funktion, kein Fakt** (ADR 0030). Die Karteikarte ist die **Regel**,
  nicht das Wort, und die Aufgabe verlangt ein bekanntes Wort in einer nie gesehenen Form —
  sonst prüft sie Auswendiglernen. Formen rechnet `grammForm()`; sie steht doppelt (App und
  Build) und wird an den vermerkten Formen der Sätze gemessen. Dreizehn Bausteine, sechs
  Formen je Nomen (`akk`, `praep`, `gen`, `dat`, `instr`, `plural`) und die Zukunft aus
  `быть` plus Grundform (`fut1s` … `fut3p`).
- In `data/nomen.json` wird **jede Angabe für sich** gegen die blanke Regel geprüft, nicht
  der Eintrag als Ganzes. **Eine Wortart-Angabe, die nur wiederholt, was die Endung sagt,
  läßt den Build scheitern** — sonst verdeckt die Liste die echten Ausnahmen. Dasselbe gilt
  für `data/verben.json`: **ein Eintrag, der dasselbe liefert wie die blanke Regel, bricht
  den Build ab** (ADR 0031).
- **Ein vollendetes Verb hat kein Präsens** (ADR 0057). «скажу» heißt «ich werde sagen». Der
  Aspekt steht als `aspekt: "pf"` in `data/verben.json` — **nur bei den vollendeten**.
  `perfektiv()` schließt sie aus Präsens, Ich-Form und Zukunft aus, der Build zusätzlich aus
  den Beispielen. **`быть` bekommt nie ein `formen`-Feld**: «буду» ist Zukunft.
- **Geschlecht und Belebtheit sind zwei Dinge** (ADR 0032). Nie das rohe Kürzel für das
  Geschlecht halten — immer `geschlecht(art)` fragen, sonst gilt `мама` als Ausnahme und
  `мышь` wird zu «мыше». `belebt(art)` sagt, ob ein Lebewesen gemeint ist.
- **Ein Baustein, der etwas über die Welt voraussetzt, nennt seine Wörter selbst** (ADR
  0043) — Präpositiv, Mehrzahl, Genitiv und Übereinstimmung. «в маме», «zwei Wasser», «нет
  музыки», «тёмный папа» sind alle tadellos gebeugt und trotzdem Unsinn. Die Übereinstimmung
  nennt dafür in `partner` die Nomen, nach denen sich ein Adjektiv richten darf.
- **Eine richtige Form kann trotzdem Unsinn sein.** «в маме» ist grammatisch tadellos — in
  einer Mutter ist niemand.
- **Erklären und abfragen sind zwei Dinge.** Was sich nicht herleiten läßt, erklärt «Wissen»
  im Satz, aber die Übung fragt nicht danach — belebte männliche Nomen im Akkusativ, Verben
  mit eigenem Stamm (`писать` → `пиш-`), `быть` im Präsens, der Ortsfall auf `-у` (`в году`,
  `в лесу`). Lieber schweigen als danebenliegen.

## Sätze und Lehrplan

- **Die Sätze tragen den Lehrplan** (ADR 0057). Ein Wort ohne Satz liegt in keinem Set —
  mehr Vokabeln allein bringen nichts, mehr Sätze alles. `data/saetze.json` steht **nach
  Stufe und Reifegrad sortiert**.
- **Nichts Bestehendes umformulieren:** Die Kennung eines Satzes im Sicherungscode ist sein
  Text. Schneidet der Zuwachs die Lernsets neu, wird `state.setSchnitt` ungültig, und
  `setSchnittPruefen()` wirft die `set:*`-Marken weg.
- **Der Dativ verlangt Lebewesen** («книге нравится» ist Unsinn), der Präpositiv umgekehrt
  Orte. **Im Instrumental entscheidet nach ж ч ш щ ц die Betonung** über die Endung — die
  Regel nimmt das unbetonte `е` an, die betonten stehen in `nomen.json`; die Betonungsliste
  wird dafür **nicht** befragt (ADR 0054).
- **Die Reihenfolge in `data/vokabeln.json` ist der Lehrplan.** Aus ihr und den
  Satzvoraussetzungen bauen sich die Lernsets (`SET_MAX`, `SATZ_STUFE`); Ergänzungen ans Ende
  des passenden Themas.
- **Jeder Satz nennt in `benoetigt` seine Voraussetzungen als Grundformen** («книгу» →
  `книга`). Ein Satz mit unbekanntem Wort läßt den Build scheitern — das Wort gehört zuerst
  in den Lehrplan.

## Betonung und Schreibung

- **Die Betonung ist eine Zahl** (ADR 0054), keine zweite Schreibweise: `data/betonung.json`
  sagt, der wievielte Vokal sie trägt. **Der Strich wird gezeichnet, nicht geschrieben**
  (ADR 0065): angezeigt über `ruAnzeigeHtml()`/`betontesWortHtml()`, die den betonten Vokal
  in `<span class="bet">` hüllen — **ohne `esc()` darum**, das steckt schon drin.
  `betontesWort()` mit U+0301 bleibt die Textfassung für den Prüfstand. **Nie ins Wort
  schreiben** — die Kennung im Lernstand *ist* das russische Wort, und ein Tippfehler darin
  löscht einen Lernstand. Angezeigt **nur** über `ruAnzeige()`/`betontesWort()`; verglichen wird nie mit ihr
  (`normalize()` wirft U+0301 weg), gesprochen auch nicht. Die Einstellung `betonung` blendet sie ab Stufe 3 aus.
- **Die Lücke ist ein Paar, keine Zahl** (ADR 0055). Eine Aufgabe in «Schreibung» nennt beide
  Schreibweisen — die richtige (`ist`) und die nach Gehör (`klingt`); wo sie sich
  unterscheiden, ist die Lücke. Eine Zahl kann danebenliegen, ohne daß es jemand merkt —
  vierzehn taten es. Build und Suite rechnen jede Aufgabe nach. Eine **leere** Stelle ist ein
  gültiger Fall («ь oder nichts»). `hoerbar: false` heißt: Beide Schreibweisen klingen gleich.
- **Kein Kyrillisch in `name` und `kurz`** — beide stehen in Versalien-Etiketten
  (`.task-label`, `kurz` der Bausteine): «в на» liest sich als «B HA». `.cyr` ist von
  `text-transform` ausgenommen, im Datenfeld hilft das aber nicht.
