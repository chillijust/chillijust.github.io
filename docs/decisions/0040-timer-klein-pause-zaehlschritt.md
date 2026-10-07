# 0040 · Glas aus der Scheibe, Timer mit Pause, Zähler in Schritten mit Einheit

*2026-10-07 · zwei Tickets vom Gerät (App-Stand 0.12.0T) · Version 0.12.0T2 · ändert 0038*

## Ausgangslage

- Das Timerfenster war schon zu Beginn sehr groß. Ursache: Der Tropfen nimmt die größere
  Seite seiner Quelle als Startgröße (`tropfenWeg`), und die Quelle war die ganze Kachel —
  rund 400 px breit. Dieselbe Ursache steckte im Jubel-Glas («Nicht zweimal», 50 %,
  Rekord) und im «Angelegt»-Glas, die aus der Kachel tropften oder in sie hinein.
- Gewünscht: Der Timer läßt sich pausieren.
- Gewünscht: Der Zähler zählt nicht in Einern, sondern in einstellbaren Schritten, etwa
  0,3 oder 0,6 L.

## Entscheidung

- **Jedes Glas, das an einer Gewohnheit hängt, beginnt und endet in ihrer runden Scheibe**
  (`scheibeVon`), in der Tagesliste in der runden Marke der Zeile: Timerfenster,
  «Es läuft schon ein Timer», Jubel, «Angelegt» und «Gespeichert». Der Tropfen beginnt so
  bei 40 px.
- **Pause**: Ein runder Knopf unter dem Ring hält den Timer an und läßt ihn weiterlaufen
  (`timerPause`). Pausiert steht die Restzeit still, die Zeit wird blasser, die Kachel sagt
  «pausiert». Weiter verschiebt den Start um die Dauer der Pause. Ein pausierter Timer
  übersteht das Schließen der App (`state.timer.pausiert`).
- **Zähler in Schritten mit Einheit** (`zaehler: { schritt, einheit }`): Im Formular stehen
  «Je Tipp» (etwa 0,3, mit Komma, höchstens zwei Stellen dahinter) und «Einheit» (frei,
  etwa L, höchstens acht Zeichen). Jeder Tipp zählt einen Schritt dazu, «−» nimmt einen
  zurück. Die Kachel zeigt «1,2 L heute», die Scheibe «1,2», die Tagesliste «1,2 L erledigt».
  Gerechnet wird auf Tausendstel genau, damit 0,1 + 0,2 nicht 0,30000000000000004 wird.
- **`zaehlung` hält die Menge des Tages**, nicht mehr die Zahl der Tipps. Ein erledigter Tag
  ohne Eintrag steht für einen Schritt. Ändert sich der Schritt später, bleiben
  gezählte Tage, was sie waren. Ein älterer Stand (`zaehler: true`) zählt in Einern weiter.

## Begründung

Ein Fenster, das in voller Kachelbreite erscheint, ist kein Tropfen, sondern ein Sprung.
Die Menge zu speichern statt der Tipps hält die Vergangenheit fest, auch wenn der Schritt
sich ändert.

## Folgen

- Suite `timer`: D7–D9, F9–F11, T2a, T4a, T4b, T5a, S1–S6.
- Version 0.12.0T2.
