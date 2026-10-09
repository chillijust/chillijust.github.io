# 0023 · Kalendertag und «Hinzufügen», Welle abbrechen, der Tropfen ist rund

*2026-10-06 · sechs Tickets vom Gerät (App-Stand 0.8.0T2) · Version 0.9.0T3 · löst in 0008
die Spitze des Tropfens ab · ergänzt 0016 (Wisch auf dem Dashboard), 0006 (Tagesliste) · «Hinzufügen», Kalenderwochen und Wisch geändert durch 0025*

## Ausgangslage

- «Heute» neben der Chili führt den Kalender nach Hause, sah aber aus wie ein Etikett —
  niemand ahnte, daß man darauf tippen kann. Der heutige Tag im Kalender war nur
  unterstrichen.
- Ein kommender Tag sagte nur «Dieser Tag kommt noch.» — gefragt war, *was* kommt.
- «Termin an diesem Tag» konnte nur einen Termin anlegen.
- Eine aus Versehen begonnene 10-Minuten-Welle ließ sich nicht beenden, ohne
  «Gewonnen» oder «Nachgegeben» zu lügen.
- Der Monat zeigte keine Kalenderwochen.
- Der Wisch vom linken Rand tat auf dem Dashboard nichts. Im Ticketblatt fehlte ein Ort
  für Allgemeines.
- Zurück aus «Alle Tickets» kam kein Tropfen: Die Liste war aus dem Knopf im Ticketblatt
  gewachsen, und das Blatt ist beim Rückweg zu — die Ansicht verblaßte nur. Dasselbe
  überall, wo die Herkunft beim Rückweg fort ist (ein Leerzustand nach dem Anlegen).
- Die Spitze des Tropfens zeigte am Gerät nicht immer vom Ziel weg.

## Entscheidung

- **«Heute» ist eine Pille** (`.heute-pille`): Schrift im Akzent, Grund zart getönt
  (`color-mix` aus `--akzent`). Orange auf ausdrücklichen Wunsch — es weicht von der Regel
  «der Akzent gehört Symbolen» ab und liegt hell bei etwa 3 : 1; Etikett, kein Fließtext.
- **Heute im Kreis**: Die Zahl des heutigen Tages steht in einem Kreis aus `--akzent`, die
  Schrift darin `--auf-akzent` (neues Token, dunkel in beiden Darstellungen — Weiß hätte
  3,1 : 1). Alle Zahlen haben die Kreisgröße, damit nichts springt.
- **Ein kommender Tag sagt, was dran ist** (`zeichneTagVoraus`): ein Satz, wie viele
  Gewohnheiten fällig sind, dann jede Zeile — fällig vorn, «x-mal pro Woche» als «frei»
  dahinter, «nicht dran» zuletzt und blaß. Ohne Haken; abhaken bleibt der Vergangenheit
  und heute vorbehalten (ADR 0003).
- **«Hinzufügen» fragt erst** (`#kalNeu`, `#kalNeuWahl`): Ein Tipp läßt «Was möchtest du
  hinzufügen?» mit *Termin*, *Gewohnheit*, *Abgewöhnen* herabtropfen (`teilTropfen`,
  ADR 0012), ein zweiter zieht es zurück; das Plus dreht sich zum Kreuz. Termin liegt an
  diesem Tag; Abgewöhnen von einem vergangenen Tag aus heißt «frei seit diesem Tag»
  (Uhrzeit von jetzt), von heute oder einem kommenden aus «jetzt» — der Start liegt nie in
  der Zukunft. Eine Gewohnheit beginnt wie immer heute. Das Plus ist Akzent, nicht mehr
  Blau: Blau heißt Termin, «Hinzufügen» heißt alles.
- **Die Welle hat «Abbrechen, zählt nicht»** (`welleAbbrechen`): leise unter den beiden
  Ausgängen, auch wenn die Welle durch ist. Weder Drang noch Rückfall wird gezählt.
- **Kalenderwochen vorn, klein, mit einem Strich** durch das ganze Raster, in der Fuge
  rechts neben der Spalte (`::before` am Raster) — so reißt er zwischen den Zeilen nicht
  ab. Auch die Woche trägt die Spalte, obwohl ihr Titel die KW schon nennt: Nur so quillt
  der Monat beim Umschalten genau aus ihrer Zeile, statt seitlich zu springen.
- **Wisch vom Rand auf dem Dashboard öffnet das Menü**; unterwegs bleibt er der Rückweg
  (ADR 0016). Bei offenem Menü, Hinweis oder Ticketblatt schweigt er weiter.
- **«Allgemein»** steht im Ticketblatt vorn unter «Wo».
- **Der Tropfen ist rund** (`TROPFEN = '50%'`): Ansichten, Hinweis, Ticketblatt, Menü und
  tropfende Knöpfe. `TROPFEN_ZU`, `TROPFEN_AUF` und `tropfenSpitzeZu` entfallen.
- **Zurück fließt immer ein Tropfen**: Ist die Herkunft fort, geht die Ansicht in den
  Menüknopf — von dort ist jede Ansicht zu erreichen. Was aus dem Ticketblatt kam, geht in
  den Ticketknopf; was aus der Frage unter «Hinzufügen» kam, in «Hinzufügen».

## Begründung

Was man tippen kann, muß so aussehen. Ein Kalender, der einen kommenden Tag verschweigt,
ist nur ein halber. «Hinzufügen» an einem Tag ist der natürliche Ort für alles Neue, nicht
nur für Termine. Eine Spitze, die in die falsche Richtung zeigt, ist schlechter als keine.

## Folgen

- Suite `nachschliff` (46 Prüfungen); angepaßt: `kalender` N9, `termine` K5, K6, K9, K10,
  `menue` W6–W6b, `bewegung` D1, D3a, D10, `exportwege` H2, H7, H8a, H8b, `langdruck`, `tickets` U0.
- Neues Token `--auf-akzent` in allen drei Paletten.
- Wer nach den Tickets auf 0.8.0T2 stand, sieht mit dieser Fassung auch 0.9.0T2 zum ersten Mal.
