# Umstellung — was wir aus dem Didaktikplan übernehmen

Auswahl aus `GAP.md` unter **einer** harten Bedingung: Die Webapp-Funktion bleibt.
„Zum Home-Bildschirm hinzufügen" muss weiter gehen, und die App muss offline laufen —
also **eine Datei, keine externen Ressourcen, kein Nachladen**.

Alles hier Aufgeführte ist unter dieser Bedingung machbar. Was sie bricht, steht am Ende
unter „Nicht im Plan" — mit Begründung, damit später niemand rät, warum es fehlt.

**Stand:** **freigegeben am 2026‑08‑13** · Ausgangsstand 1.5.1 ·
Sicherung: Zweig `backup/stand-1.5.1-2026-08-13`

---

## Fortschritt

Diese Tabelle ist die einzige Wahrheit über den Stand. Sie wird **mit jeder Etappe im
selben Commit** fortgeschrieben — eine zweite Datei würde davon abdriften, und dann glaubt
man der falschen.

| # | Etappe | Version | Stand |
|---|---|---|---|
| 1 | Kleinkram mit Sofortnutzen | 1.5.2 | **fertig** · ADR 0052 · Suite `robust` |
| 2 | Kontext-Lücke (W3) | 1.6.0 | **fertig** · ADR 0053 · Suite `luecke` |
| 3 | Betonung | 1.7.0 | **fertig** · ADR 0054 · Suite `betonung` · Sätze folgen mit 6 |
| 4 | Orthographie ohne Ton (E3 + Prüfwort) | 1.8.0 | **fertig** · ADR 0055 · Suite `schreibung` · neue Übung «Schreibung» |
| 5 | Handling: Rekonstruktion, Tagesmaß, Fehlerprofil | 1.9.0 | **fertig** · ADR 0056 · Suite `strenge` · drei neue Einstellungen |
| 6a | Sätze wachsen · Portion 1 + Dativ | 2.0.0 | **fertig** · ADR 0057 · Suite `lehrplan` · 102 Sätze, 51 % im Lernweg |
| 6b | Sätze wachsen · Portion 2 + Instrumental | 2.1.0 | offen |
| 6c | Sätze wachsen · Portion 3 + Aspekt und Futur | 2.2.0 | offen |
| 7 | Buchstaben-Generatoren ohne Ton (D3, D4, D6) | 2.3.0 | offen |
| 8 | Service Worker | 2.4.0 | offen |

Stände: `offen` · `läuft` · `fertig` · `verworfen (Grund)`

---

## Der Befund, der alles ordnet

Beim Nachrechnen für diesen Plan kam etwas heraus, das die Reihenfolge bestimmt:

> **Von 395 Vokabeln liegen nur 133 im Lernweg.**
> Die übrigen 262 kommen in keinem Satz vor.

Lernsets entstehen **ausschließlich aus Sätzen**: Der Code sortiert die 55 Sätze nach
ihrem spätesten Wort und füllt daraus zwölf Sets zu je maximal zwölf Wörtern. Ein Wort,
das kein Satz braucht, landet in keinem Set, schaltet nichts frei und taucht in
«Übersetzen» nie auf. Es ist nur über «Freestyle» und «Tippen» erreichbar — also über die
Übungen ohne Lehrplan.

**Damit ist Ihre Wortschatzfrage beantwortet:** 395 → 700 Wörter **allein** bringt fast
nichts. Es macht das Verhältnis sogar schlechter — 700 Wörter, weiterhin 133 im Weg. Der
Engpass sind die **Sätze**, nicht die Vokabeln.

Der Nutzen ist erst dann groß, wenn beides zusammen wächst. Als Richtwert: Um 700 Wörter
in den Lernweg zu bringen, braucht es rund **250 Sätze** statt der heutigen 55. Das ist
der Preis, und er ist ehrlich genannt (Etappe 6).

---

## Etappe 1 · Kleinkram mit Sofortnutzen → 1.5.2

Fünf kleine Dinge, die einzeln kaum der Rede wert sind und zusammen einen Tag kosten.

| Was | Warum |
|---|---|
| `100dvh` statt `100vh` in `body.aufgabe` | Auf iOS ist `100vh` schlicht falsch — es rechnet die Adressleiste mit. Der Plan nennt das als Falle, und der Bestand tappt an genau einer Stelle hinein |
| `navigator.storage.persist()` beim Start anfordern | Safari löscht Website-Daten nach ~7 Tagen ohne Nutzung. Die Home-Bildschirm-Verknüpfung ist ausgenommen — aber nur sie. Ein Aufruf, in `try/catch`, kostet nichts |
| Offline-Indikator | Die App wirbt mit Offline-Fähigkeit und sagt nie, ob sie gerade offline ist. `navigator.onLine` plus zwei Zuhörer |
| Erinnerung an die Sicherung | Der Sicherungscode ist gut (besser als der JSON-Export des Plans), aber niemand denkt daran. Nach 30 Tagen ohne Sicherung ein ruhiger Hinweis in der Bilanz — kein Blatt, keine Unterbrechung |
| **Latenz je Antwort messen** | Zeit zwischen Aufgabenaufbau und Abgabe, gemittelt je Übung. Kostet ein Feld, und es ist die Vorbedingung für alles, was später über Automatisierung entscheiden soll |

**Was sich ändert:** überwiegend **Hintergrund**. Sichtbar nur zwei Zeilen — der
Offline-Hinweis im Kopf und eine Tempozeile in der Bilanz.
**Risiko:** sehr gering. Keine Schemaänderung, kein Datenverlust möglich.
**Absicherung:** neue Suite `robust` (dvh, Persist-Aufruf in try/catch, Offline-Zustand,
Sicherungserinnerung nach Frist).

---

## Etappe 2 · Kontext-Lücke → 1.6.0

Der Plan nennt die Lückenaufgabe im Beispielsatz den **Standardfall** und isolierte
Vokabeln „nur als Notlösung". Der Bestand macht es genau umgekehrt. Das ist der größte
didaktische Riss — und er ist billig zu schließen, weil die Daten schon daliegen:
**42 der 55 Sätze tragen bereits `formen`-Angaben**, also die Zuordnung Wortform → Lemma
und Fall.

**Die Aufgabe:** Statt „книга — was heißt das?" steht der Satz da, das Zielwort fehlt,
und man setzt es ein — auf niedriger Stufe aus Kacheln, ab Stufe 3 getippt.
`Я читаю ___.` → `книгу`. Die Form kommt aus dem Satz, nicht aus der Grundform: Man lernt
das Wort und seine Beugung in einem Zug.

**Wann sie greift:** Als dritte Aufgabenform in «Lernsets» und «Freestyle», eingeschoben
wo ein Wort in einem freigeschalteten Satz vorkommt. Wo es das nicht tut, bleibt es bei
der heutigen Form — das betrifft heute noch die Mehrheit der Wörter und wird mit Etappe 6
zur Ausnahme.

**Was sich ändert:** **Handling und Oberfläche.** Vokabeltraining fühlt sich anders an —
weniger Karteikarte, mehr Sprache. Der Wortschatz-Fortschritt selbst bleibt unberührt.
**Risiko:** gering. Neue Aufgabenform neben den bestehenden, kein Eingriff in den Leitner-Stand.
**Absicherung:** Suite `luecke` — greift nur bei vorhandenem Satz, Bewertung akzeptiert
dieselben Freiheiten wie `normalize()`, `formen`-Angabe wird gegen `grammForm()` geprüft.

---

## Etappe 3 · Betonung → 1.7.0

Der Plan nennt das „nicht verhandelbar", und er hat recht: Ohne Betonungsstelle lässt sich
weder die Aussprache lernen noch die Prüfwort-Methode bauen. Der Bestand hat **kein
einziges Betonungszeichen** — die Lautschrift (`молоко → malako`) liefert die Reduktion
zwar mit, sagt aber nicht, welche Silbe trägt.

**Umsetzung:**
- Neues **fünftes Feld** je Vokabel: die betonte Schreibweise (`молоко́`).
- Dasselbe für Sätze: ein Feld `ru_betont` neben `ru`.
- Anzeige über eine Einstellung: **immer · nur bei neuen Wörtern · nie**.
  Die mittlere Stellung ist die Vorgabe und blendet die Zeichen ab Leitner-Stufe 3 aus —
  genau die Stelle, an der der Plan sie ausblenden will.
- Der Build prüft: Jedes Betonungsfeld muss ohne Betonungszeichen **buchstabengleich**
  zum Wort sein. Sonst schleicht sich ein Tippfehler ein, den niemand sieht.

> ⚠️ **Der Fallstrick, der hier zählt:** Die Kennung im Lernstand *ist* das russische Wort.
> Ein Betonungszeichen in `ru` würde jeden bestehenden Lernstand löschen. Die Betonung
> gehört darum in ein **eigenes Feld** — `ru` bleibt unangetastet, und das prüft die Suite.

**Was sich ändert:** **Hintergrund** (Daten, ~450 Einträge Handarbeit) und **Oberfläche**
(Anzeige, eine Einstellung).
**Risiko:** gering technisch, **mittel inhaltlich**. Eine falsch gesetzte Betonung lernt
sich fest. Ich trage sie ein und prüfe gegen die Formen, die der Bestand schon kennt —
aber es sind 450 Einzelentscheidungen, und ich sage lieber vorher, dass darin Fehler
stecken können.
**Absicherung:** Suite `betonung` — Kennung unverändert, Buchstabengleichheit, Ausblenden
ab Stufe, Sicherungscode unberührt.

---

## Etappe 4 · Orthographie ohne Ton → 1.8.0

Das Herzstück von Phase 1 des Plans — und der Teil, der **ohne Audio spielbar ist.**
Diktate (E1/E2) brauchen Ton und fallen weg; die **Orthographie-Falle (E3)** und die
**Prüfwort-Methode** brauchen keinen.

**Die Aufgabe:** `мол_ко` — о oder а? Wer falsch liegt, bekommt nicht „falsch", sondern
das **Prüfwort**: `во́ды → вода́`. Also die Technik, mit der russische Grundschulen es
lehren, und die einzige, die auf unbekannte Wörter skaliert.

**Neue Daten:**
- `data/ortho.json` mit den neun Regeln aus dem Plan (Аканье, Иканье,
  Auslautverhärtung, Stimmassimilation, `-ого/-его`, `-тся/-ться`, stumme Konsonanten,
  жи/ши, Ь nach Zischlaut) — im Aufbau von `grammatik.json`, das bereits fast dieses
  Schema hat: Frage, Deutungen, richtige Deutung, Regel, Tabelle, Merksatz, Fußnote.
- Feld `pruefwort` bei den betroffenen Vokabeln.

**Wo sie sitzt:** Als **eigene Übung «Schreibung»** in der Gruppe «Wörter» — nicht als
Modus in «Tippen». Sie prüft eine andere Kompetenz (Enkodieren statt Abruf), hat einen
eigenen Lernstand je Regel und folgt damit demselben Muster wie «Grammatik»: Die
Karteikarte ist die **Regel**, nicht das Wort.

**Was sich ändert:** **Oberfläche** (eine neue Kachel, neue Gruppe-Zuordnung) und
**Hintergrund** (zwei neue Datendateien, ein neuer Lernstandstopf).
**Risiko:** mittel. `pruefwort` ist Wortwissen, nicht ableitbar — es muss je Wort stimmen.
Und die Regel „Ь nach Zischlaut" hat Ausnahmen, die der Plan verschweigt.
**Absicherung:** Suite `schreibung` — jede Regel hat mindestens fünf Wörter, jedes
`pruefwort` trägt die Betonung auf dem fraglichen Vokal, keine Regel widerspricht der
Schreibweise im Wortschatz.

### Umgesetzt als 1.8.0 — drei Abweichungen vom Entwurf oben

1. **Acht Regeln, nicht neun.** Иканье ist weggefallen: Unbetontes е klingt wie и, aber
   die Fälle, in denen das eine *Schreibentscheidung* ist, überschneiden sich fast völlig
   mit Аканье, und wo sie es nicht tun, gibt es kein Prüfwort. Eine Regel ohne Probe wäre
   Auswendiglernen — genau das, was die Übung ersetzen soll.
2. **Das Prüfwort steht in `ortho.json`, nicht als Feld an der Vokabel.** Von den 46
   Aufgabenwörtern stehen nur 14 überhaupt im Wortschatz — `лестница`, `конечно` und
   `второй` sind Beispiele für eine Regel, keine Lernwörter. Ein Feld an der Vokabel hätte
   für die übrigen 32 keinen Platz gehabt, und für die 14 hätte es `vokabeln.json`
   angefasst — die Datei, deren Kennungen der Lernstand trägt. Sie bleibt unberührt.
3. **Die Lücke ist kein Index, sondern ein Paar.** Die erste Fassung der Datei nannte die
   Stelle als Zeichenposition und lag bei jedem dritten Wort daneben, ohne dass es
   aufgefallen wäre — eine falsche Zahl sieht aus wie eine richtige. Jetzt stehen beide
   Schreibweisen da (`ist` und `klingt`); wo sie sich unterscheiden, ist die Lücke. Build
   und Suite rechnen es für jede Aufgabe nach (ADR 0055).

Dazu zwei Entscheidungen, die der Entwurf offenließ: Die Übung **zählt in Serie und
Antworten mit** — sie steht unter «Wörter», nicht unter «Freiwillig». Und **ab der
Satzstufe wird das ganze Wort geschrieben** statt gewählt: Zwei Möglichkeiten sind eine
Münze, und eine Regel darf auf der oberen Hälfte der Leiter nicht erratbar sein.

---

## Etappe 5 · Handling → 1.9.0

Drei Dinge, die der Plan verlangt und die keine neuen Daten brauchen.

**a) Erzwungene Rekonstruktion.** Der Plan: „Falsche Antwort → korrekte Lösung +
Mikro-Erklärung → **erzwungene Rekonstruktion** (nochmal tippen). Nur Ansehen genügt
nicht." Der Bestand zeigt die Lösung und geht weiter. Künftig: Wer sich verschreibt, tippt
das Wort einmal richtig nach, bevor es weitergeht. Nur bei getippten Aufgaben — gelegt ist
nicht geschrieben.

**b) Tagesmaß für neues Material.** Der Plan setzt 5–8 neue Items pro Tag, sonst „Lawine
in 3 Wochen". Der Bestand hat keine Grenze. Künftig: eine Einstellung mit dem Zähler aus
1.5.0, Vorgabe 8, abschaltbar. Sie bremst **nur neue** Wörter — Wiederholungen und die
«Alle»-Stapel bleiben unbegrenzt, sonst widerspräche es ADR 0048.

**c) Fehlerprofil statt Zufall.** Der Bestand merkt sich in `wortFehler` und `leseFehler`
*dass* etwas falsch war, nicht *womit* verwechselt wurde. Künftig auch das — und die
Ablenker kommen dann aus genau dieser Liste. Der Plan nennt das „den Unterschied zwischen
einer Karteikarten-App und einem Trainer", und er hat recht.

**Was sich ändert:** **Handling**, spürbar. Die App wird strenger (a), langsamer beim
Neuen (b) und gemeiner bei den Ablenkern (c). Alle drei sind Einstellungen — wer sie nicht
will, schaltet sie ab.
**Risiko:** gering technisch, **mittel im Gefühl**. Punkt (a) kann als Gängelung
ankommen. Wenn er nervt, drehen wir ihn auf „nur bei Wörtern, die schon zurückgefallen sind".
**Absicherung:** Suite `strenge`.

### Umgesetzt als 1.9.0 — vier Festlegungen, die der Entwurf offenließ

1. **Die Nachschrift bewertet nichts.** Die Antwort ist längst gezählt, die Stufe längst
   gefallen; die Nachschrift hält nur den «Weiter»-Knopf zu. Wäre sie eine zweite
   Bewertung, könnte man sich aus einem Fehler heraustippen.
2. **Der Rückzug ist gleich eingebaut.** Statt eines Schalters gibt es drei Stellungen —
   **Wörter** (Vorgabe) · **Auch Sätze** · **Nie**. Ein sechswortiger russischer Satz auf
   einer Bildschirmtastatur ist keine Übung mehr, sondern eine Strafe; wer sie trotzdem
   will, stellt sie ein. Damit ist die im Plan vorgesehene zweite Runde nicht nötig.
3. **Null heißt beim Tagesmaß «ohne Grenze», und der Zähler sagt das auch.** «0 neu/Tag»
   hieße wörtlich das Gegenteil. Bei Null tauschen beide Hälften des Zählers ihren Text.
4. **Das Fehlerprofil steht nicht im Sicherungscode**, ebenso wenig wie der Tageszähler.
   Beides sind Beobachtungen über dieses Gerät, kein Lernstand — dieselbe Linie wie beim
   Tempo (ADR 0052). Ein Tageszähler, der aus einer drei Wochen alten Sicherung
   zurückkäme, wäre schlicht falsch.

Dazu ein Fund nebenbei: **«Tippen» und «Übersetzen» zeigten ihre Tastatur auch in der
Auflösung** — ohne Eingabefeld, also als Attrappe. Seit die Nachschrift eine eigene
mitbringt, standen dort zwei übereinander; jetzt keine.

---

## Etappe 6 · Sätze wachsen → 2.0.0

**Kleine Variante, so entschieden:** Der Wortschatz bleibt bei 395. Die **Sätze** wachsen
von 55 auf rund 150.

Das ist nicht der bescheidenere Weg, sondern der wirksamere. Heute liegen 262 der 395
Wörter außerhalb des Lernwegs — sie kommen in keinem Satz vor, gehören zu keinem Set und
tauchen in «Übersetzen» nie auf. 300 neue Vokabeln hätten das Verhältnis verschlechtert;
100 neue Sätze holen die vorhandenen nach Hause.

**Ziel:** möglichst alle 395 Wörter im Lernweg. Aus 12 Lernsets werden etwa 33.

**Erste Ziffer der Version, weil sich der Lernstand anders liest:** Die Jubelmarken in
`state.gefeiert` heißen `set:0`, `set:1`, … — schneidet man die Sets neu, meint `set:7`
etwas anderes als vorher. Ohne Migration würden Sets als gefeiert gelten, die es nicht
sind, und umgekehrt. Die Marken werden darum beim Laden einmal verworfen und über
`jubelNachtragen()` neu bestimmt; der Wortschatz-Fortschritt selbst bleibt unberührt.

**In Portionen, jede für sich lieferbar:**

| Portion | Inhalt | Grammatik, die dazukommt |
|---|---|---|
| 6a | +30 Sätze über die heute heimatlosen Themen | Dativ (Empfänger, `мне нра́вится`, Alter) |
| 6b | +30 Sätze | Instrumental (`с` + I, Beruf) |
| 6c | +35 Sätze | Aspektpaare, Futur |

Jeder neue Satz bringt `benoetigt`, `formen` und die betonte Fassung mit — deshalb steht
diese Etappe **nach** 3 und 4. Andersherum wäre es dieselbe Arbeit zweimal.

**Was sich ändert:** fast nur **Hintergrund**. Sichtbar wird es an den Zahlen auf den
Kacheln, an mehr Sets und daran, dass «Übersetzen» deutlich voller wird.
**Risiko:** **das größte in diesem Plan**, aber nicht technisch.
- Die Sätze müssen alle `benoetigt`-Wörter kennen, sonst bricht der Build ab. Das ist gut
  so, kostet aber Sorgfalt.
- Jeder neue Baustein muss ADR 0043 genügen: `в маме` ist tadellos gebeugt und trotzdem
  Unsinn. Dativ und Instrumental sind dafür anfälliger als alles bisher — `с водой` geht
  nur manchmal.
- Der **Sicherungscode führt Inhalte über einen Hash des Textes**. Neue Sätze sind
  unkritisch; ein *geänderter* Text eines bestehenden Satzes macht alte Codes an dieser
  Stelle ungültig. Regel für diese Etappe: **nichts Bestehendes umformulieren.**
- Die Datei wächst von heute 492 KB auf etwa 560 KB. Unkritisch, aber es gehört gesagt.

**Absicherung:** Der Build prüft bereits das meiste. Dazu eine Suite `lehrplan`: Anteil
der Wörter im Lernweg (Ziel > 90 %), kein Set über `SET_MAX`, jede Stufe hat genug Sätze,
und die Jubelmarken werden nach dem Neuschnitt korrekt nachgetragen.

### Portion 6a ausgeliefert als 2.0.0

47 Sätze statt der geplanten 30 — die Themen **Farben, Körper, Kleidung und Tiere** lagen
vollständig außerhalb des Lernwegs, und sie halb zu erschließen hätte wenig gebracht.
Dazu der **Dativ** wie geplant.

| | vorher | jetzt | Ziel nach 6c |
|---|---|---|---|
| Sätze | 55 | **102** | ~150 |
| Wörter im Lernweg | 133 (34 %) | **201 (51 %)** | > 90 % |
| Lernsets | 12 | **18** | ~33 |
| Grammatik-Bausteine | 10 | **11** | 13 |

**Die Portionen bekommen eigene Versionen** (2.0.0 · 2.1.0 · 2.2.0), Etappe 7 und 8
rücken entsprechend nach. Jede Portion ist für sich lieferbar und geprüft; eine, die
wochenlang halbfertig herumliegt, wäre das Gegenteil davon.

**Zwei Fehler hat die neue Datenmenge ans Licht gebracht** — beide in ADR 0057
beschrieben: Die richtige Antwort in der Kontext-Lücke stand am Satzanfang als einzige
groß da, und der Regel-Jubel behauptete «ZEHN VON ZEHN», als es elf wurden.

## Etappe 7 · Buchstaben-Generatoren ohne Ton → 2.1.0

Drei der sieben Dekodier-Generatoren des Plans brauchen keinen Ton.

| Generator | Was er tut | Warum er fehlt |
|---|---|---|
| **D3 Minimalpaar** | `ш` oder `щ`? `и` oder `ы`? Nur die tatsächlich verwechselten Paare, aus dem Fehlerprofil aus Etappe 5 | Der Bestand kennt die sechs falschen Freunde, aber nicht die Zischlaut-Paare |
| **D4 Silbenleiter** | `ма-мя, мо-мё, му-мю, мы-ми, мэ-ме` — Härte und Weichheit | **Fehlt heute komplett.** Der Unterschied hart/weich ist im Russischen bedeutungstragend, und die App erwähnt ihn nirgends |
| **D6 Betonung setzen** | Vokal antippen, der die Betonung trägt | Braucht Etappe 3. Trainiert nebenbei die Vokalreduktion — und damit genau das, was die Lautschrift heute nur behauptet |

**Was sich ändert:** **Handling** innerhalb von «Buchstaben». Keine neue Kachel, drei neue
Aufgabenformen in der bestehenden Übung.
**Risiko:** gering. «Buchstaben» ist freiwillig und hat einen eigenen Lernstand.
**Absicherung:** die Suite `buchstaben` wächst mit.

---

## Etappe 8 · Service Worker → 2.2.0

**Entschieden am 2026‑08‑13: ja, und zwar zuletzt.** Er ändert nichts am Lernen, macht
aber das Ausliefern ab dann angenehmer — und darum kommt er, wenn alles andere steht.

Heute hängt „offline" am Browser-Cache. Das funktioniert, ist aber eine Hoffnung: Safari
darf diesen Cache jederzeit wegräumen, und wer dann im Funkloch sitzt, sieht eine leere
Seite. Ein Service Worker legt die Datei ausdrücklich beiseite — aus der Hoffnung wird
eine Zusage.

Der zweite Gewinn steht seit Monaten als Fallstrick in `CLAUDE.md`: *„Eine bestehende
Home-Bildschirm-Verknüpfung hält ihren eigenen Cache. Zeigt sie nach einem Deploy noch den
alten Stand: Verknüpfung löschen und neu anlegen."* Das fällt weg. Der Service Worker
merkt eine neue Fassung und bietet sie an.

**Was dazukommt:**
- `sw.js` — der Service Worker selbst, wenige Zeilen: beim Einrichten die App ablegen,
  bei jeder Anfrage die abgelegte Fassung liefern, im Hintergrund nach einer neuen sehen.
- `manifest.json` — Name, Symbol, Startadresse, Vollbild.
- In den **Einstellungen**, Reiter «Darstellung und Ton» oder ein neuer Reiter «App»:
  «Offline bereit» mit Häkchen, «Nach Aktualisierung suchen» als Knopf, und die Fassung,
  die **wirklich läuft** — nicht die, die im Code steht.
- Ein ruhiger Hinweis, wenn eine neue Fassung bereitliegt. Kein Blatt, kein Zwang.

**Was sich ändert:** **Hintergrund**, plus drei Zeilen in den Einstellungen.
**Risiko: gering im Betrieb, aber es fällt ADR 0001.** Aus einer Datei werden drei. Alles
Inhaltliche bleibt in `index.html`; die beiden Helfer sind zusammen unter 5 KB.
**Der eigentliche Fallstrick ist ein anderer:** Ein Service Worker, der zu gierig
zwischenspeichert, liefert für immer den alten Stand aus. Die Regel dagegen heißt
**Netz zuerst für die App-Datei, Speicher zuerst für alles andere** — und ein
Notausgang, der den Speicher leert, gehört in die Einstellungen.
**Absicherung:** Suite `offline` — der Worker meldet sich an, die Fassung wird gemeldet,
der Notausgang leert wirklich. Dazu `pruefen.mjs`: `sw.js` und `manifest.json` dürfen
keine Fremdadresse enthalten, genau wie `index.html`.

---

## Nicht im Plan — und warum

Damit später niemand rätselt, ob es vergessen wurde:

| Aus dem Didaktikplan | Warum nicht |
|---|---|
| **Der Reader** | Braucht ein Wörterbuch „mehrerer zehntausend Einträge". Das passt nicht in eine Datei, und ohne Nachladen gibt es keine Webapp-Funktion mehr. **Das ist der harte Konflikt** — nicht mit dem Plan, sondern mit Ihrer Bedingung |
| **Vorgerendertes Audio** | 15–25 MB. Nicht in einer Datei, nicht ohne externe Ressourcen. Diktate (E1/E2) bleiben damit unspielbar; `hoerknopf()` über die Sprachausgabe bleibt, was er ist — Beiwerk, kein Pflichtmodul |
| **FSRS-6 statt Leitner** | Rechnerisch machbar in einer Datei. Aber sein Gewinn (20–30 % weniger Wiederholungen) skaliert mit der Itemzahl, und er kostet einen Schemawechsel samt neuem Sicherungscode-Format. Bei 700 Wörtern nicht gedeckt. **Die Latenzmessung aus Etappe 1 hält die Tür offen** — sie sammelt genau die Daten, die eine spätere Umstellung kalibrierbar machen |
| **Ein Wort = mehrere Items** | Derselbe Schemawechsel. Gehört zu FSRS, nicht davor |
| **IndexedDB** | Ginge ohne zweite Datei — wird aber erst nötig, wenn eine Antworthistorie mitgeschrieben wird. Ohne FSRS gibt es die nicht |
| **Zwei Nutzertypen, Kompetenzvektor, Einstufung** | Diese App hat **einen** Nutzer, und der ist Typ A. Ein Einstufungsmodul mit fünf Messungen wäre Aufwand für eine Unterscheidung, die hier niemand braucht. Der Typ-A/B-Diskriminator ist außerdem das Hör-Diktat — ohne Audio nicht baubar |
| **Fortschrittsring statt Balken** | Der Balken sagt heute die Wahrheit: 700 Wörter sind endlich. Erst wenn der Wortschatz offen wächst, wird er zur Lüge. Ohne Reader also nicht |
| **Generatorschicht unter den Übungen** | Strukturell richtig (`GAP.md` §2.5), aber ein Umbau am laufenden Motor ohne sichtbaren Gewinn. Die Etappen 2, 4 und 7 bringen je zwei bis drei neue Aufgabenformen — **danach** ist zu sehen, ob sich der Umbau lohnt. Vorher wäre es Vorratsarbeit |

---

## Arbeitsweise

- **Eine Etappe, eine Version, ein Commit.** Jede ist für sich lieferbar und
  zurückrollbar; keine baut auf unfertigem Zwischenstand auf.
- **Vor jedem Push:** `build.mjs --check`, `pruefen.mjs`, Prüfstand. Der Hook hält an,
  wenn etwas rot ist.
- **Jede Etappe bringt ihre Prüfungen mit** — der Prüfstand ist das Gedächtnis für jeden
  Fehler, der schon einmal da war.
- **Jede Entscheidung mit Begründung bekommt einen ADR** (ab 0052), Regeln zusätzlich als
  einen Satz in `CLAUDE.md`.
- **Die Fortschrittstabelle oben wird im selben Commit fortgeschrieben** wie die Etappe.
- **Nach der letzten Etappe** wandern `GAP.md` und diese Datei nach `docs/archiv/`, mit
  einer Zeile im Kopf, was daraus wurde. Sie werden nicht gelöscht — sie sind die
  Begründung für alles, was danach im Code steht.

## Freigabe

Erteilt am 2026‑08‑13, mit zwei Festlegungen:

1. **Wortschatz: kleine Variante.** 395 Wörter bleiben, die Sätze wachsen auf ~150
   (Etappe 6).
2. **Service Worker: ja**, als letzte Etappe 8.

Begonnen wird mit Etappe 1 und 2.
