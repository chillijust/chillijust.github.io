# 0082 · Zwei Plätze für eine Leiste, ein Klappfeld für die Optionen

**Stand:** angenommen · 2026-08-16 · aus zwei Tickets
**Ändert:** ADR 0081 (die Leiste über dem Inhalt) · ADR 0044 (der Wissensknopf
zieht in die Kachel)

## 1 · Die Leiste stand am falschen Ort

**Befund:** «Du hast die Positionen falsch interpretiert. Übungen: rechts über
der Übungskachel — mit etwas Abstand zur Kachel. Rest wie Übersicht: in der
Kopfzeile (alte Position und Größe).»

ADR 0081 hatte die Leiste zwischen Kopf und `#main` gehängt — dort steht sie
weit über der Aufgabe, weil die Kachel in den Übungen auf zwei Dritteln der
Höhe sitzt. «Über dem Fenster» hieß nicht «unter dem Kopf», sondern «über der
Kachel».

**Entscheidung:** Zwei Plätze, eine Leiste.

| Wo | Platz | Knöpfe |
| --- | --- | --- |
| Übung mit Aufgabenkachel | im Inhalt, rechts über der Kachel, 10 px Abstand | 36 px, Fläche 44 |
| überall sonst | in der Kopfzeile | 44 px, alte Position |

Bewegt wird sie mit demselben Verfahren, das den Wissensknopf schon bewegt hat:
Vor einem Renderlauf kommt sie nach Hause — `main.innerHTML` würde sie sonst
mitsamt Blatt und Zuhörern wegwerfen —, danach zieht sie wieder hinaus.

**`display: contents` macht die Heimat durchsichtig:** Zu Hause reicht die
Leiste ihre Knöpfe an die Kopfzeile durch, als stünden sie selbst dort. Erst bei
der Kachel wird sie ein eigener Kasten.

Der Wissensknopf zieht damit **nicht mehr einzeln** in die Übersetzen-Kachel
(ADR 0044) — er fährt in der Leiste mit, links neben dem Fragezeichen. Das war
schon der Wunsch aus dem Ticket davor.

### Zwei Fallen, beide zugeschnappt

- **Drei Übungen, nicht eine.** Nur «Übersetzen» holte die Leiste vor dem
  Zeichnen heim; «Lernsets» und «Tippen» warfen sie weg. Danach war
  `#tutRund` für immer fort, und 23 Suiten fielen mit einem Schlag. *Wer einen
  Knoten in `#main` schickt, muss ihn in **jeder** Ansicht zurückholen, die
  dorthin schreibt.*
- **Ein leerer Behälter ist nicht nichts.** `#leisteHeim` ist null Pixel breit,
  zählte aber als Flex-Kind und bekam seinen eigenen `gap` — zwischen zwei
  Knöpfen standen plötzlich zwölf statt sechs Pixel. Auch die Heimat braucht
  `display: contents`.
- Und die Prüfung, die das fand, zählte drei Kennungen auf. Sie fragt jetzt
  nach **allen sichtbaren** runden Knöpfen der Gruppe: Eine Prüfung, die eine
  Liste aufzählt, misst über jede Lücke hinweg, die neu dazukommt.

## 2 · Die Optionen klappen weg

**Befund:** «Ticket-Erstellung klappt zu weit aus. Zugeklappt: Überschrift und
Textfeld sichtbar. Aufgeklappt: Betrifft und Art. Im Button soll *Optionen*
stehen. Bei aktiver Option wird der Button farbig gefüllt.»

Das Blatt war so hoch geworden, dass der eigene Satz oben aus dem Bild rutschte
— und das ist genau das, was man beim Schreiben ansieht. Ort und Art sind
Beiwerk.

**Entscheidung:** `#meldeOpt` klappt mit derselben Mechanik wie das Menü — eine
Rasterzeile von `0fr` auf `1fr`. Der Knopf steht links neben «Alle Tickets».

**Der Text wandert nach oben**, wie die Striche aus dem Menüknopf wandern: zwei
Beschriftungen übereinander in einem Kasten, der nur eine zeigt («Optionen» /
«Weniger»). Beide Bewegungen laufen mit derselben Kurve und derselben Dauer wie
das Blatt — sie sind eine Bewegung, nicht zwei nebeneinander.

**Gefüllt heißt gesetzt.** Zugeklappt soll man sehen, dass dort etwas steht.
«Betrifft» ist vorbelegt und zählt darum nur, wenn der Nutzer etwas **anderes**
gewählt hat als die Seite, über der er steht — sonst wäre der Knopf immer bunt
und sagte nichts.

Wer ein vorhandenes Ticket zum Ändern öffnet, bekommt die Optionen **offen**:
Sonst müsste er raten, was schon dasteht.

### Das Textfeld wächst, aber nicht endlos

Drei Zeilen als Grundmaß, höchstens drei dazu. Was länger wird, rollt — sonst
schöbe ein langer Text die Knöpfe aus dem Bild, und das Blatt wäre wieder da,
wo es vor diesem Ticket war.

## Folgen

- `tutorial` M1–M5 auf zwei Plätze umgeschrieben, `tickets` F3g2–F3g8 und
  F3m2/F3m3 neu, `maskottchen` Q3 auf «alle sichtbaren» umgestellt.
- `wissenHeimschicken`/`wissenUmhaengen` heißen jetzt `leisteHeimschicken`/
  `leisteUmhaengen` — sie bewegen den ganzen Kasten, nicht mehr nur den einen
  Knopf.
