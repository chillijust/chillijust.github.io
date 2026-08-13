# Umstellung — was wir aus dem Didaktikplan übernehmen

Auswahl aus `GAP.md` unter **einer** harten Bedingung: Die Webapp-Funktion bleibt.
„Zum Home-Bildschirm hinzufügen" muss weiter gehen, und die App muss offline laufen —
also **eine Datei, keine externen Ressourcen, kein Nachladen**.

Alles hier Aufgeführte ist unter dieser Bedingung machbar. Was sie bricht, steht am Ende
unter „Nicht im Plan" — mit Begründung, damit später niemand rät, warum es fehlt.

**Stand:** Entwurf, wartet auf Freigabe · angelegt 2026‑08‑13 · Ausgangsstand 1.5.1

---

## Fortschritt

Diese Tabelle ist die einzige Wahrheit über den Stand. Sie wird **mit jeder Etappe im
selben Commit** fortgeschrieben — eine zweite Datei würde davon abdriften, und dann glaubt
man der falschen.

| # | Etappe | Version | Stand |
|---|---|---|---|
| 1 | Kleinkram mit Sofortnutzen | 1.5.2 | offen |
| 2 | Kontext-Lücke (W3) | 1.6.0 | offen |
| 3 | Betonung | 1.7.0 | offen |
| 4 | Orthographie ohne Ton (E3 + Prüfwort) | 1.8.0 | offen |
| 5 | Handling: Rekonstruktion, Tagesmaß, Fehlerprofil | 1.9.0 | offen |
| 6 | Wortschatz und Sätze wachsen | 2.0.0 | offen |
| 7 | Buchstaben-Generatoren ohne Ton (D3, D4, D6) | 2.1.0 | offen |

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

---

## Etappe 6 · Wortschatz und Sätze wachsen → 2.0.0

Der große Inhaltsblock, und der Grund für die erste Ziffer: Der Lernweg wird ein anderer.

**Ziel:** 700 Wörter, davon **möglichst alle im Lernweg** — also rund 250 Sätze statt 55.
Erste Ziffer der Version, weil sich die Lernsets neu schneiden: Aus 12 Sets werden etwa
55, und bestehende Sets verschieben sich. Der Lernstand je Wort bleibt erhalten (die
Kennung ändert sich nicht), aber „Set 7" bedeutet danach etwas anderes.

**In Portionen, jede für sich lieferbar:**

| Portion | Inhalt | Grammatik, die dazukommt |
|---|---|---|
| 6a | +100 Wörter, +45 Sätze | Dativ (Empfänger, `мне нра́вится`, Alter) |
| 6b | +100 Wörter, +45 Sätze | Instrumental (`с` + I, Beruf) |
| 6c | +100 Wörter, +55 Sätze | Aspektpaare, Futur |
| 6d | Rest auf 700, Sätze auf ~250 | Verben der Bewegung, Rektion |

Jede Portion bringt ihre Wörter **vollständig** mit: Übersetzung, Lautschrift, Betonung,
Wortart, wo nötig `pruefwort` — deshalb steht diese Etappe **nach** 3 und 4. Andersherum
wäre es dieselbe Arbeit zweimal.

**Was sich ändert:** fast nur **Hintergrund**. Die Oberfläche bleibt, wie sie ist; es
steht nur mehr dahinter. Sichtbar wird es an den Zahlen auf den Kacheln und daran, dass
der Fortschrittsbalken langsamer wächst.
**Risiko:** **das größte in diesem Plan**, aber nicht technisch.
- Die Sätze müssen alle `benoetigt`-Wörter kennen, sonst bricht der Build ab. Das ist gut
  so, kostet aber Sorgfalt.
- Jeder neue Baustein muss ADR 0043 genügen: `в маме` ist tadellos gebeugt und trotzdem
  Unsinn. Dativ und Instrumental sind dafür anfälliger als alles bisher — `с водой` geht
  nur manchmal.
- Der **Sicherungscode führt Inhalte über einen Hash des Textes**. Neue Wörter sind
  unkritisch; ein *geänderter* Text einer bestehenden Vokabel macht alte Codes an dieser
  Stelle ungültig. Regel für diese Etappe: **nichts Bestehendes umformulieren.**
- Die Datei wächst. Heute 492 KB, davon 63 KB Daten. Nach 6d etwa 640 KB — für eine Seite,
  die einmal geladen und dann gecacht wird, unkritisch, aber es gehört gesagt.

**Absicherung:** Der Build prüft bereits das meiste (unbekannte Wörter, doppelte
Kennungen, Wortart-Angaben, die nur die Regel wiederholen). Dazu eine Suite `lehrplan`:
Anteil der Wörter im Lernweg, kein Set über `SET_MAX`, jede Stufe hat genug Sätze.

---

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

### Eine Entscheidung, die Ihnen gehört

**Ein Service Worker würde die Webapp-Funktion nicht brechen, sondern stärken.** Heute
hängt „offline" am Browser-Cache — das funktioniert, ist aber eine Hoffnung, keine
Zusage. Ein Service Worker macht daraus eine Garantie und erlaubt außerdem, eine neue
Version sauber zu erkennen statt sie über einen gelöschten Home-Bildschirm-Eintrag
einzusammeln.

Der Preis: **eine zweite und dritte Datei** (`sw.js`, `manifest.json`) — und damit fällt
ADR 0001. Das steht seit dem ersten Tag als bewusst offene Frage in `docs/architektur.md`.

Ich schlage das **nicht** von mir aus vor und habe es nicht eingeplant. Wenn Sie es wollen,
ist es eine eigene Etappe von etwa zwei Tagen.

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

## Was ich von Ihnen brauche

1. **Freigabe der Reihenfolge** — oder eine andere. Etappe 6 ist die einzige, die auf
   Vorarbeit angewiesen ist (3 und 4); der Rest ließe sich umsortieren.
2. **Eine Ansage zum Wortschatz.** 700 Wörter *mit* 250 Sätzen ist viel Inhaltsarbeit.
   Wenn Ihnen das zu weit geht, ist die ehrlichere kleine Variante: **bei 395 Wörtern
   bleiben und nur die Sätze auf ~150 bringen.** Das holt die 262 heimatlosen Wörter in
   den Lernweg und ist didaktisch der größere Sprung als 300 neue Vokabeln.
3. **Service Worker: ja oder nein.**
