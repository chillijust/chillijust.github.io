# 0051 · Das Tutorial ist ein Scheinwerfer

**Stand:** angenommen · 2026-08-12

## Ausgangslage

Wer die App zum ersten Mal öffnet, sieht sieben Kacheln und weiß nicht, welche zuerst.
Die Reihenfolge ist da — Buchstaben, Wörter, Sätze —, aber sie steht nirgends. Ebenso
wenig, dass «Übersetzen» von «Lernsets» abhängt, wofür der Trichter oben gut ist oder
wo die Sicherung liegt. Ein Hilfetext hätte das erklärt und wäre nicht gelesen worden.

## Entscheidung

**Ein Overlay, das jeweils genau eine Stelle der echten Oberfläche anleuchtet** und
daneben in zwei Sätzen sagt, wozu sie da ist. Zwölf Schritte, jeder mit einem **Beispiel**
— erklärt wird nicht die Bedienung, sondern der Sinn.

Der Scheinwerfer ist **ein einziges Element**: `#tutLoch`, ein durchsichtiges Rechteck
mit `box-shadow: 0 0 0 9999px rgba(0,0,0,.82)`. Der Schatten deckt den Rest ab, das
Rechteck bleibt frei. Kein `clip-path`, kein SVG, keine vier Balken.

**Die Schritte sind Inhalt**, nicht Code: `data/tutorial.json`, je Zeile
`[Ort, Ziel, Titel, Text, Beispiel]`. `tools/build.mjs` prüft Ort und Länge und bettet
sie als `TUTORIAL` ein.

**Die Erklärung ist eine Sprechblase, kein Kasten.** Sie trägt einen Zipfel, der auf das
Angeleuchtete zeigt, im Fuß eine Punktreihe statt der Zeile «Schritt 3 von 12» und rechts
einen runden Pfeil statt eines beschrifteten Knopfes. Der Ausgang ist ein stilles × in
ihrer Ecke.

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

**Der Zipfel darf nie ins Nichts zeigen.** Wo oben kein Platz war und die Blase neben dem
Ziel landet statt darüber, fällt er weg — ein Zeiger, der auf nichts zeigt, ist schlimmer
als keiner. `tutZipfelSetzen()` rechnet das nach und setzt sonst `ohne-zipfel`.

**Die Blase ist in jedem Schema dunkel**, auch in den vier hellen. Das ist keine
Nachlässigkeit gegenüber ADR 0039: Sie liegt auf einem abgedunkelten Bild, und eine helle
Karte wäre dort der zweite Scheinwerfer — sie nähme dem ersten die Aussage. Die vier Werte
stehen darum als lokale Eigenschaften auf `#tutKarte` selbst.

**Der Ausgang sitzt in der Blase, nicht am Bildrand.** Oben rechts am Rand läge er über
dem Menüknopf und sähe aus wie ein zweiter davon; die Kopfzeile ist besetzt.

**Nur die Eingangsfrage trägt beschriftete Knöpfe.** «Abbrechen» und «Loslegen» ist eine
echte Wahl. Ab da gibt es nur noch «weiter» — dafür genügt ein Pfeil, und am letzten
Schritt wird daraus ein Haken.

## Folgen

- Neuer Zustand: `state.tutorialGesehen` (Vorgabe `false`), im Sicherungscode nicht
  geführt — er gehört zum Gerät, nicht zum Lernstand.
- `data/tutorial.json` ist die einzige Quelle der Texte. Ein Ziel, das es nicht gibt,
  fällt in der Suite auf; ein unbekannter Ort schon im Build.
- Jedes Ziel kommt genau einmal vor — sonst erklärte das Tutorial zweimal dasselbe.
- Die Texte duzen wie der Rest der App (ADR 0050); die Suite prüft es mit.
- **Für die Messung schaltet die Suite den Übergang ab** — bei `#tutLoch` **und**
  `#tutKarte`. Im kopflosen Browser läuft keine Zeit; ohne das stünde bei jeder Messung
  noch der vorige Ort da. Wer nur eines der beiden abschaltet, misst die Vergangenheit
  des anderen — genau daran ist die Zipfelprüfung zuerst hängen geblieben.
