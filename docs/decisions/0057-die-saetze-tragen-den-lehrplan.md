# 0057 · Die Sätze tragen den Lehrplan

**Stand:** angenommen · 2026-08-14 · Etappe 6 der Umstellung, alle drei Portionen

## Ausgangslage

Beim Nachrechnen für den Umstellungsplan kam ein Befund heraus, der die ganze Reihenfolge
bestimmt hat:

> **Von 395 Vokabeln lagen nur 133 im Lernweg.**
> Die übrigen 262 kamen in keinem Satz vor.

Lernsets entstehen **ausschließlich aus Sätzen**: Der Code sortiert die Sätze nach ihrem
im Lehrplan spätesten Wort und füllt daraus Päckchen zu höchstens `SET_MAX` Wörtern. Ein
Wort, das kein Satz braucht, landet in keinem Set, schaltet nichts frei und taucht in
«Übersetzen» nie auf. Es ist nur über «Freestyle» und «Tippen» erreichbar — also über die
Übungen ohne Lehrplan.

Damit war auch die Wortschatzfrage beantwortet: **395 → 700 Wörter allein hätte fast
nichts gebracht.** Es hätte das Verhältnis sogar verschlechtert. Der Engpass sind die
Sätze.

## Entscheidung

**Die Sätze wachsen, der Wortschatz bleibt.** In drei Portionen von 55 auf rund 150.
Portion 6a bringt 47 Sätze und den **Dativ**; damit liegen 201 der 395 Wörter im Lernweg
(51 %), und aus 12 Lernsets sind 18 geworden.

**Die erste Ziffer der Version steigt** — nicht wegen der Zahl der Sätze, sondern wegen
einer einzigen Folge daraus: Die Jubelmarken in `state.gefeiert` heißen `set:0`, `set:1`, …
Schneidet man die Sets neu, meint `set:7` etwas anderes als vorher.

## Begründung

**Warum der Neuschnitt die Marken wertlos macht.** Eine Marke sagt «dieses Päckchen wurde
gefeiert». Nach dem Neuschnitt enthält Päckchen 7 andere Wörter — die Marke hielte dann
einen Jubel zurück, der jemandem zusteht, oder verschluckte einen, der ihm nie zustand.
`setSchnittPruefen()` merkt sich darum in `state.setSchnitt` die **Zahl der Sets**, unter
der die Marken entstanden sind. Stimmt sie nicht mehr, fallen alle `set:*`-Marken weg und
`jubelNachtragen()` bestimmt sie neu.

Das ist ein Fingerabdruck, kein Beweis: Käme irgendwann ein Schnitt heraus, der dieselbe
Anzahl Sets hat und trotzdem anders verläuft, bliebe eine Marke stehen. Der Schaden wäre
ein ausgefallener Jubel, nicht ein falscher Lernstand — und dafür ist die Regel billig
genug. Themen, Alphabet und Regeln bleiben unberührt; die hängen nicht am Schnitt.

**Der Wortschatz-Fortschritt selbst ist nicht in Gefahr.** Die Kennung im Lernstand ist
das russische Wort, und kein Wort wurde angefasst. **Kein bestehender Satz wurde
umformuliert** — der Sicherungscode führt Sätze über einen Hash ihres Textes, ein
geänderter Text machte alte Codes an dieser Stelle ungültig. Neue Sätze sind unkritisch.

**Warum der Dativ.** Er ist der Fall, der am meisten fehlte: der Empfänger (`пишу сестре`),
das Gefallen (`мне нравится`), das Alter (`брату двадцать лет`). Und er ist regelmäßig
genug, dass ihn die Formenmaschine rechnen kann — anders als der Instrumental, dessen
Verwendung stärker am Verb hängt (der kommt mit 6b).

**Der Dativ verlangt Lebewesen** (ADR 0043). «книге нравится» ist tadellos gebeugt und
trotzdem Unsinn: Empfangen kann nur, wer lebt. Der Baustein nennt seine Wörter darum
selbst, und `gramWortPool()` lässt für ihn **nur belebte** Nomen durch — genau umgekehrt
zum Präpositiv, der Orte braucht und Lebewesen ausschließt. Die Regel selbst gilt trotzdem
für jedes Nomen; im Satz führt «Wissen» sie vor.

**Der Dativstamm ist der Genitivstamm.** Wo dort ein Vokal fällt (`день → дня`), fällt er
auch hier (`дню`). Die zwölf Ausnahmen in `nomen.json` folgen darum eins zu eins den schon
vorhandenen Genitiv-Einträgen — und der Build prüft für jede einzeln, dass sie etwas sagt,
was die blanke Regel nicht liefert.

## Zwei Fehler, die die neuen Daten ans Licht gebracht haben

**1. Der große Anfangsbuchstabe gehört dem Satz, nicht dem Wort.** In `formen` steht die
Form so, wie sie im Satz steht — am Satzanfang also groß. In der Kontext-Lücke (ADR 0053)
stand die richtige Antwort dann als einzige Kachel groß neben lauter kleinen: Man erkannte
sie, ohne sie zu kennen. `lueckeSchreibung()` nimmt den Buchstaben zurück — außer bei
Namen, denn Москва ist immer groß. Vor dieser Etappe konnte der Fehler nicht auftreten:
Die einzigen großgeschriebenen Formen waren Eigennamen.

**2. Der Jubel behauptete eine Zahl, die er nicht kannte.** «ZEHN VON ZEHN REGELN!» stand
fest im Text und wurde mit dem elften Baustein falsch. Jetzt steht dort `{m}` — dieselbe
Regel, die für die Kommentare schon galt (ADR 0049).

## Folgen

- `data/saetze.json`: 55 → 102 Sätze. Die Datei ist **nach Stufe und Reifegrad sortiert**;
  wer sie liest, sieht den Weg, und die Suite prüft es.
- Neue Rolle `dat` in `grammForm()` — **in beiden Fassungen**, App und Build. Zwölf neue
  `dat`-Einträge in `nomen.json`, dazu `звезда → звёзды` (ё/е-Wechsel, den keine Regel
  verrät).
- Neuer Grammatik-Baustein `dativ`; aus zehn Regeln werden elf.
- Neuer Zustand `state.setSchnitt`. Er steht **nicht** im Sicherungscode — er beschreibt,
  unter welcher Fassung der App die Marken entstanden sind, und das gehört zum Gerät.
- Neue Suite `lehrplan` (32 Prüfungen). **Ihre Zahlen sind Untergrenzen, keine
  Fixpunkte** — eine Suite, die «genau 102 Sätze» verlangt, wäre bei 6b rot, ohne dass
  etwas kaputt wäre, und dann gewöhnt man sich das Rot an. Vier bestehende Suiten mussten
  aus demselben Grund von festen Zahlen auf gerechnete umgestellt werden.
- **Portion 6a von dreien.** 6b bringt den Instrumental, 6c die Aspektpaare und das Futur.
  Die Untergrenze in der Suite steigt mit jeder Portion mit.

## Nachtrag · Portion 6b (2.1.0)

109 weitere Sätze — **211 insgesamt, und damit liegen alle 395 Wörter im Lernweg.** Das
Ziel von «über 90 %» ist mit 100 % übertroffen; aus 12 Lernsets sind 35 geworden. Dazu der
**Instrumental** als zwölfter Grammatik-Baustein.

**Der Instrumental hat eine Eigenheit, die keiner der anderen Fälle hat: Nach ж ч ш щ ц
entscheidet die Betonung über die Endung** — `му́жем` gegen `врачо́м`. Die Betonungsdaten
lägen seit ADR 0054 vor, aber sie werden **nicht befragt**: Die Betonung ist Anzeige, nicht
Rechengrundlage, und sie steht nur bei 301 von 395 Wörtern. Die Regel nimmt darum das
unbetonte `е` an — der häufigere Fall —, und die vier betonten stehen in `nomen.json`. Das
sind vier Einträge statt acht in der Gegenrichtung, und die Suite prüft beide Seiten.

**Ein Fund nebenbei:** `кофе` ist unbeugbar, stand aber nicht als `starr` in `nomen.json`.
Die blanke Regel machte daraus im Genitiv «кофя» — ein Fehler, der seit jeher dalag und
erst auffiel, als der Instrumental jedes Nomen durchgerechnet hat.

Damit ist der Zweck von 6c ein anderer als geplant: Die Abdeckung ist erreicht, es geht
dort nur noch um **Aspektpaare und Futur** — Grammatik, keine Reichweite.


## Nachtrag · Portion 6c (2.2.0)

Der Zweck war ein anderer als geplant: Die Abdeckung stand schon, es ging nur noch um
**Aspektpaare und Futur**.

**Die Zukunft** ist als dreizehnter Baustein dazugekommen — und sie ist die einfachste
Zeit des Russischen: `быть` in der Person, dahinter die unveränderte Grundform. Nur der
Helfer beugt sich. Neue Rollen `fut1s` … `fut3p` in `grammForm()`, in beiden Fassungen.

Sie ist zugleich der einzige Ort, an dem `быть` überhaupt eine Form hat — ein Präsens von
«sein» gibt es im Russischen nicht. Die Suite prüft darum ausdrücklich, dass `быть` **kein**
`formen`-Feld in `verben.json` bekommt: Stünde dort `буду`, behauptete die App eine
Gegenwart, die es nicht gibt.

**Die Aspektpaare sind nicht gekommen — und das ist kein Versäumnis, sondern ein Befund.**
Im ganzen Wortschatz stehen genau **zwei** vollendete Verben: `сказать` und `встретить`.
Eine Übung über den Aspekt bräuchte Paare (`покупать` / `купить`), und die gibt es nicht;
sie zu zweit zu bauen wäre eine Attrappe. Was der Aspekt stattdessen tut, ist **eine
Falschaussage verhindern**:

> **Ein vollendetes Verb hat kein Präsens.** «скажу» heißt «ich werde sagen», nicht «ich
> sage». Vor dieser Portion konnte «встретить» als Präsensbeispiel auftauchen — der Build
> hat es beim Einführen der Aspektangabe selbst gemeldet, mit der falschen Begründung
> («eigener Stamm»), die jetzt die richtige ist.

Der Aspekt steht darum als `aspekt: "pf"` in `verben.json` — **nur bei den vollendeten**,
denn unvollendet ist der Regelfall, und ein Eintrag, der «ipf» sagt, sagt nichts. Er
schließt sie aus Präsens, Ich-Form und Zukunft aus; der Build prüft dasselbe für die
Beispiele der Bausteine.

Eine echte Aspektübung gehört damit an eine Stelle, an der der Wortschatz wächst — nicht
in diese Etappe. Das ist in `Umstellung_Umsetzen.md` unter «Nicht im Plan» vermerkt.
