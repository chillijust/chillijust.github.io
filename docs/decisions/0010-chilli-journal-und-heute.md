# 0010 · Der Name heißt «Chilli Journal», «Heute» führt den Kalender nach Hause

*2026-10-05 · Ansicht von 0.5.0T · Version 0.5.0T2, Auswahl des Schriftzugs und Heimweg 0.5.0T3, Entwurf «Lodern» 0.5.0T4, breiter 0.5.0T5*

## Ausgangslage

Die App trug ihren Arbeitsnamen «Chillinal». Gewünscht ist eine Marke: **Chilli** — das
ist der Nutzer selbst, und die Marke soll auf weitere Apps übertragbar sein. Chilli steht
für entspannt und funktional, «es funktioniert einfach gut», mächtig und doch einfach,
flüssig statt schnappend, grell oder hektisch. Dazu fehlte im Kalender ein Weg zurück zu
heute.

## Entscheidung

- **Sichtbar heißt die App «Chilli Journal»**: Seitentitel, Kopf, Teilen-Blatt, Kalender-
  Export (`PRODID`, Beschreibung). **Unter dem Symbol nur «Chilli»** — «Chilli Journal»
  schnitte iOS ab, und dann soll nur die Marke stehen.
- **«Chilli» steht vorn und am größten**, «Journal» kleiner und leiser. Bis der gezeichnete
  Schriftzug kommt, trägt das die Schrift allein (`.marke`, `.marke-zusatz`).
- **Intern bleibt «Chillinal»**: Unterlagen, Regeln und vor allem der Speicherschlüssel
  `chillinal_v1` — ein neuer Schlüssel hieße Migration ohne Gewinn.
- **«Heute» neben der Chili ist der Rückweg** (`#heuteKnopf`, `zuHeute`): Ein Tipp blättert
  zurück, wählt den heutigen Tag und öffnet seine Liste — im Takt des Kalenders
  (`KAL_TAKT`). Woche oder Monat bleibt, wie es war. Ist heute schon gewählt, geschieht
  nichts. Kein eigener Knopf: Das Wort war schon da.
- **Die Überschrift führt zur Übersicht.** Unterwegs ist der Titel ein Knopf (`#titelHeim`),
  der immer zum Dashboard geht — auch wo der Rückweg einen Schritt zurück führt (aus dem
  Export). Auf dem Dashboard ist der Schriftzug selbst der Knopf (`#markeKnopf`): Er rollt
  nach oben und läßt den Schriftzug einmal ablaufen.
- **Der Schriftzug wird am Gerät gewählt.** Unten auf dem Dashboard stehen die Entwürfe
  (`MARKEN`, `zeichneSchriftzugWahl`) neben «Schlicht»; ein Tipp spielt den Entwurf ab und
  setzt ihn in den Kopf, gespeichert als `schriftzug`. Jeder Entwurf ist ein SVG aus
  eigenen Linien oder Poppins, Farben nur über Tokens. **Die Stiele sind grau, nicht grün**
  — Grün heißt erledigt. Bewegt wird einmal, beim Start und auf Wunsch (`wm-los`), nie
  im Kreis; unter «Bewegung reduzieren» steht alles still. **Ausnahme auf Ansage: «Lodern»**
  (Runde 2, ganz oben in der Auswahl) — die Handschrift aus «Glut», «Journal» kursiv in
  Lora an der Linie wie bei «Etikett». Die Flammen der i steigen beim Ablauf von unten auf
  (`wmAufflammen`) und lodern danach leise weiter (`wmLodern`, ein Schein dahinter), die
  beiden nicht im Gleichtakt. Das ist das einzige, was im Schriftzug im Kreis läuft. Ist der Entwurf entschieden,
  fliegen Auswahl und die übrigen Entwürfe wieder hinaus.

## Begründung

Eine Marke trägt ein Wort, nicht zwei; der Zusatz sagt nur, welche App. Der Rückweg auf
dem Wort «Heute» kostet keinen Platz und steht genau dort, wo man nach heute sucht.

## Folgen

- Wer die Verknüpfung auf dem Home-Bildschirm behält, sieht dort weiter den alten Namen,
  bis er sie neu anlegt — iOS liest den Titel nur beim Anlegen.
- Die Auswahl ist ein Gerüst auf Zeit: Mit der Entscheidung bleibt ein Entwurf, der Rest
  und das Feld `schriftzug` gehen (oder es bleibt, falls mehrere bleiben sollen).
- Suiten: `geruest` A1/A1a, `kalender` H1–H5, `export` (`PRODID`), `schriftzug` (C7a–C7c: «Lodern»).
