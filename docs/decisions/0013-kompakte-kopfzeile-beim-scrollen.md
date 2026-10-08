# 0013 · Kompakte Kopfzeile statt reserviertem Streifen

**Status:** angenommen · 2026-08-02 · korrigiert Punkt 2 von ADR 0012

## Kontext

Zwei Befunde vom Gerät:

1. **Im Vollbild klaffte eine Lücke.** Die Reiterleiste trug
   `padding-top: var(--pad-oben)`, also `14px + env(safe-area-inset-top)`. Im Browser ist
   dieser Wert 0 und die Lücke unauffällig; als Verknüpfung auf dem Home-Bildschirm sind
   es rund 59 px, und zwischen Kopfzeile und Reitern stand ein breiter, toter Streifen.
   Er deckte dort obendrein den radialen Schein des Hintergrunds ab — die Kante war
   sichtbar.
2. **Oben blieb beim Scrollen nichts übrig.** ADR 0012 hatte das Andocken der Chili
   ersatzlos gestrichen. Damit war die Figur weg, sobald man scrollte, und die
   Einstellungen waren nur nach dem Hochscrollen erreichbar.

## Entscheidung

1. **Die Reiterleiste trägt keinen Innenabstand nach oben mehr.** Der Abstand zwischen
   Kopfzeile und Reitern ist im Browser und im Vollbild derselbe.
2. **Sie klebt eine Zonenhöhe unter dem Viewport-Rand**
   (`top: var(--kompakt-hoehe)`, `env(safe-area-inset-top) + 14px + 46px`).
3. **`#kompakt` füllt diese Zone** — fest am oberen Rand, `display: none`, bis die
   Leiste klebt. Darin links die Chili (30 px), rechts ein zweiter Reglerknopf (44 px).
4. **Umgeschaltet wird per Klassenvergleich**, nicht per Rechnung: klebt die Leiste
   (`getBoundingClientRect().top === top`), bekommt `<body>` die Klasse `kompakt`.
5. **Die Chili erscheint dort, sie springt nicht dorthin.** `chiliAktualisieren(true)`
   überspringt die Sprunganimation; nur der Inhalt der Zone blendet weich ein.
6. **Ein Platzhalter in der Ansicht geht vor.** Steht die Chili in einer Karte, bleibt
   sie dort; die Zone zeigt dann nur den Reglerknopf.

## Begründung

**Reservieren ist teuer, Einblenden ist billig.** Der alte Streifen kostete dauerhaft
Bauhöhe, damit gelegentlich etwas darin stehen konnte. Ein festes Element außerhalb des
Flusses kostet nichts, solange es unsichtbar ist — und die Reiterleiste klebt ohnehin,
also ist genau dann Platz, wenn er gebraucht wird.

**Der Umschaltpunkt ergibt sich von selbst.** „Die Leiste klebt" und „die Kopfzeile ist
weg" sind dasselbe Ereignis. Es braucht keine Schwelle in Pixeln, die man raten müsste
und die bei anderer Kopfhöhe wieder falsch wäre.

**Hart schalten, weich füllen.** Ein Übergang auf der Zone würde den durchlaufenden
Inhalt für die Dauer der Blende durchscheinen lassen. Die Zone erscheint darum sofort,
ihr Inhalt über 0,24 s.

**Zwei Knöpfe, ein Verhalten.** Beide tragen `data-regler`; Symbol, Klick und der
`active`-Zustand hängen an der Kennzeichnung, nicht an einer Id. Das hält die beiden
gezwungenermaßen gleich.

## Folgen

- Beim Scrollen verdeckt die Zone rund 46 px zuzüglich Notch. Das ist der Preis dafür,
  dass Chili und Einstellungen jederzeit erreichbar bleiben.
- `position: fixed` kann in Safari während des Adressleisten-Kollapses kurz verrutschen.
  Im Vollbild vom Home-Bildschirm — dem Zielfall — gibt es keine Adressleiste.
- In Ansichten mit eigenem Platzhalter (Faktenkarte, Leerzustände, Jubelkarte) bleibt der
  Platz in der Zone leer; das ist gewollt, weil die Figur dort etwas zu sagen hat.
- Ein Ansichtswechsel stößt `kompaktNachziehen()` an: eine kürzere Seite kann die Leiste
  vom Kleben lösen, ohne dass ein Scrollereignis fällt.
