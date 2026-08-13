# 0051 · Das Tutorial ist ein Scheinwerfer

**Stand:** angenommen · 2026-08-12

## Ausgangslage

Wer die App zum ersten Mal öffnet, sieht sieben Kacheln und weiß nicht, welche zuerst.
Die Reihenfolge ist da — Buchstaben, Wörter, Sätze —, aber sie steht nirgends. Ebenso
wenig, dass «Übersetzen» von «Lernsets» abhängt, wofür der Trichter oben gut ist oder
wo die Sicherung liegt. Ein Hilfetext hätte das erklärt und wäre nicht gelesen worden.

## Entscheidung

**Ein Overlay, das jeweils genau eine Stelle der echten Oberfläche anleuchtet** und
daneben in zwei, drei Sätzen sagt, wozu sie da ist. Zwölf Schritte — erklärt wird nicht
die Bedienung, sondern der Sinn und die Reihenfolge.

Der Scheinwerfer ist **ein einziges Element**: `#tutLoch`, ein durchsichtiges Rechteck
mit `box-shadow: 0 0 0 9999px rgba(0,0,0,.82)`. Der Schatten deckt den Rest ab, das
Rechteck bleibt frei. Kein `clip-path`, kein SVG, keine vier Balken.

**Die Schritte sind Inhalt**, nicht Code: `data/tutorial.json`, je Zeile
`[Ort, Ziel, Text]`. `tools/build.mjs` prüft Ort und Länge und bettet sie als `TUTORIAL`
ein.

**Ein Schritt ist ein Absatz**, keine Überschrift mit Erklärung und Beispiel darunter.
Drei Bausteine in einer Blase auf verdunkeltem Grund waren mehr Gliederung als Inhalt;
jetzt steht dort ein Text, und das Beispiel ist sein letzter Satz.

**Die Chili erzählt, und zwar von dort, wovon sie spricht.** Sie steht frei auf dem
verdunkelten Bild direkt neben dem Angeleuchteten — darüber, wenn es unten liegt, darunter
sonst —, und der Text kommt als Sprechblase aus ihr heraus. Es gibt **keine Karte**, in
der beides säße: kein Grund, kein Rahmen um das Gespann, nur die Figur und ihre Blase.
Der Zipfel zeigt auf **sie**, nicht auf das Ziel; im Fuß der Blase eine Punktreihe statt
der Zeile «Schritt 3 von 12», rechts ein runder Pfeil, in der Ecke ein stilles ×.

**Sie springt von Schritt zu Schritt** — derselbe Wurfbogen wie überall in der App.

**Der Einstieg ist ein Knopf ganz unten auf Home** («Wie funktioniert das hier?»), ruhig
gestaltet — wer die App kennt, soll ihn übersehen dürfen. Beim allerersten Start bietet
die App ihn einmalig von selbst an (`state.tutorialGesehen`).

## Begründung

**Ein Wähler, der ins Leere zeigt, ist ein stiller Fehler.** Das Overlay ginge auf, alles
wäre dunkel, und nichts leuchtete. Weder Build noch Auge sehen das zuverlässig — darum
läuft die Suite `tutorial` alle zwölf Schritte durch, misst für jeden das Rechteck des
Ziels gegen das Rechteck des Lochs und verlangt Deckung.

**Ohne Ziel deckt der Hof selbst ab, nicht das Loch.** Der erste Entwurf parkte das Loch
bei `-9999px`, damit der Schatten alles verschluckt. Er verschluckt nichts: Die Streuung
reicht genau 9999 px, ihr Rand fiele auf den Bildrand — die Eingangsfrage stand auf einer
taghellen Übersicht. Jetzt bekommt `#tutHof.ohne-ziel` den Grund, und das Loch geht weg.

**Beim ersten Erscheinen darf nichts gleiten.** Von Schritt zu Schritt wandert das Loch,
und die Bewegung ist die Erklärung. Beim Aufgehen stünde es aber noch außerhalb des
Bildes und flöge sichtbar aus der Ecke heran — `#tutLoch.springt` schaltet den Übergang
für genau diesen einen Fall ab.

**Erst ins Bild holen, dann messen.** Ein Ziel unter dem Bildrand bekäme sonst ein Loch,
das niemand sieht. `scrollIntoView({ block: 'center' })` läuft vor
`getBoundingClientRect()`.

**Ein Schritt liegt außerhalb von Home.** Der Trichter sitzt in den Übungen, nicht in der
Übersicht; ihn zu erklären, ohne ihn zu zeigen, wäre Text über einen Knopf. Das Tutorial
wechselt für diesen Schritt nach «Lernsets» und kehrt am Ende nach Home zurück.

**Der Zipfel zeigt auf die Figur, nicht auf das Ziel.** Sie spricht — die Blase ist nur,
was sie sagt. Damit kann er auch nie ins Nichts zeigen: Sie steht immer da, auch auf der
Eingangsfrage, die nichts anleuchtet.

**Die Blase ist in jedem Schema dunkel**, auch in den vier hellen. Das ist keine
Nachlässigkeit gegenüber ADR 0039: Sie liegt auf einem abgedunkelten Bild, und eine helle
Blase wäre dort der zweite Scheinwerfer — sie nähme dem ersten die Aussage. Die vier Werte
stehen darum als lokale Eigenschaften auf `#tutSprech` selbst.

**Der Ausgang sitzt in der Blase, nicht am Bildrand.** Oben rechts am Rand läge er über
dem Menüknopf und sähe aus wie ein zweiter davon; die Kopfzeile ist besetzt.

**Der weiche Rand ist ein zweiter, innen liegender Schatten** — mit **derselben** Deckung
wie der äußere. Eine goldene Umrandung sah ausgeschnitten aus; eine schwächere Innenkante
hätte den Rechteckrand nur blass stehen lassen. Erst wenn beide Schatten am Rand gleich
dunkel sind, gibt es keine Linie mehr, sondern einen Übergang. Dafür braucht das Loch
reichlich Luft (22 px): Der Auslauf reicht nach innen und läge sonst auf dem, was er
zeigen soll.

**Die Chili bleibt eine.** Im Tutorial ist ihr Platzhalter `#tutChili`, und
`chiliPlatzhalter()` fragt danach **vor** allem anderen — sonst zöge jeder Renderlauf
unter dem Overlay sie kurz in die Ansicht und wieder zurück. Beim **allerersten** Start
fliegt sie nicht: Da liegt das Tutorial schon über dem ersten Bild, und ein Flug im
Augenblick des Ladens sähe nach Fehler aus.

**Ihr Sprung wird in Bildkoordinaten gemessen** (`tutChiliLage()`), nicht wie sonst in
Dokumentkoordinaten. Ihr Platzhalter bleibt derselbe — es bewegt sich der Behälter um sie
herum —, also bemerkt `chiliAktualisieren()` keinen Umzug, und der Bogen wird in
`tutSprung()` ausgelöst. Zwischen zwei Schritten wird einmal gescrollt; in
Dokumentkoordinaten flöge sie um genau diese Strecke daneben. Das ist die eine benannte
Ausnahme zu ADR 0012, dort nachgetragen.

**Waagerecht rückt sie unter die Mitte des Ziels** (`tutChiliRuecken()`). Ohne das stünde
sie links am Rand, während rechts oben der Trichter leuchtet — zwei Dinge auf einem
dunklen Bild, die nichts miteinander zu tun zu haben scheinen.

**Die großzügigere Seite gewinnt**, nicht die Bildschirmhälfte. Ein Ziel knapp über der
Mitte kann oben weniger Platz haben als darunter, und ein Gespann, das nicht passt, legt
sich auf das, wovon es spricht.

**Nur die Eingangsfrage trägt beschriftete Knöpfe.** «Abbrechen» und «Loslegen» ist eine
echte Wahl. Ab da gibt es nur noch «weiter» — dafür genügt ein Pfeil, und am letzten
Schritt wird daraus ein Haken.

## Folgen

- Neuer Zustand: `state.tutorialGesehen` (Vorgabe `false`), im Sicherungscode nicht
  geführt — er gehört zum Gerät, nicht zum Lernstand.
- Die zwölf Texte sagen zusammen, **in welcher Reihenfolge man übt**: Buchstaben, dann
  Lernsets, dann Tippen und Übersetzen, Grammatik ab dem zweiten Set, Freestyle und
  Power-Training nebenher. Schritt 8 fasst es in einem Satz.
- **Die Suite prüft, dass das Gespann den Scheinwerfer nie verdeckt** und dass die Figur
  senkrecht wie waagerecht daneben steht. Eine Erklärung, die auf dem liegt, wovon sie
  spricht, ist keine.
- **Der Prüfstand fährt seither im Format des Zielgeräts** (`--window-size=430,932`).
  Vorher maß er einen Bildschirm, den niemand hat — bei einer Geometrie, die vom
  verfügbaren Platz abhängt, ist das kein Prüfen, sondern Raten.
- **Zwei Suiten mussten das Tutorial wegräumen**, bevor sie prüfen: `maskottchen` und
  `enter`. Beide laden mit leerem Speicher, also bietet die App es von selbst an — und
  die Figur steht dann in der Blase statt in einem Knopf. Das ist kein Störgeräusch,
  sondern die Funktion; `maskottchen` prüft sie darum ausdrücklich, bevor sie schließt.
- `data/tutorial.json` ist die einzige Quelle der Texte. Ein Ziel, das es nicht gibt,
  fällt in der Suite auf; ein unbekannter Ort schon im Build.
- Jedes Ziel kommt genau einmal vor — sonst erklärte das Tutorial zweimal dasselbe.
- Die Texte duzen wie der Rest der App (ADR 0050); die Suite prüft es mit.
- **Für die Messung schaltet die Suite den Übergang ab** — bei `#tutLoch` **und**
  `#tutGespann`. Im kopflosen Browser läuft keine Zeit; ohne das stünde bei jeder Messung
  noch der vorige Ort da. Wer nur eines der beiden abschaltet, misst die Vergangenheit
  des anderen — genau daran ist die Zipfelprüfung zuerst hängen geblieben.
