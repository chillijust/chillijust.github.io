# 0010 · Der Name heißt «Chilli Journal», «Heute» führt den Kalender nach Hause

*2026-10-05 · Ansicht von 0.5.0T · Version 0.5.0T2, Auswahl des Schriftzugs und Heimweg 0.5.0T3, Entwurf «Lodern» 0.5.0T4, breiter 0.5.0T5, freigegeben 0.5.0T6*

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
- **Der Schriftzug ist «Lodern»** (`zeichneMarke`), am Gerät aus neun Entwürfen gewählt
  und freigegeben: «Chilli» in einem Zug geschrieben, breit gezogen und in der Höhe
  gestaucht; darunter «Journal» kursiv in Lora an einer kurzen Linie in Chili. Die
  i-Punkte sind Flammen. Beim Start und auf Tipp läuft er einmal ab (`wm-los`): erst die
  Schrift, dann steigen die Flammen von unten aus den i auf (`wmAufflammen`), dann Linie
  und «Journal». **Danach lodern die Flammen leise weiter** (`wmLodern`, ein Schein
  dahinter), die beiden nicht im Gleichtakt — auf Ansage die einzige Bewegung im
  Schriftzug, die im Kreis läuft. Unter «Bewegung reduzieren» steht alles still. Farben nur
  über Tokens; Grün kommt nicht vor, Grün heißt erledigt.

## Begründung

Eine Marke trägt ein Wort, nicht zwei; der Zusatz sagt nur, welche App. Der Rückweg auf
dem Wort «Heute» kostet keinen Platz und steht genau dort, wo man nach heute sucht.

## Folgen

- Wer die Verknüpfung auf dem Home-Bildschirm behält, sieht dort weiter den alten Namen,
  bis er sie neu anlegt — iOS liest den Titel nur beim Anlegen.
- Die Auswahl war ein Gerüst auf Zeit und ist mit der Entscheidung gegangen, samt der
  übrigen Entwürfe und dem Feld `schriftzug`. Ein gespeicherter alter Wert wird überlesen.
- Suiten: `geruest` A1/A1a, `kalender` H1–H5, `export` (`PRODID`), `schriftzug`.
