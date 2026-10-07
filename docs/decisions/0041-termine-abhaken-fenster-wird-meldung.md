# 0041 · Termine abhaken, Fenster wird Meldung, Menüknopf tropft herab, Fragen im Glas

*2026-10-07 · sechs Tickets und ein Nachtrag vom Gerät (App-Stand 0.12.0T2) · Version 0.13.0T ·
ändert 0018, 0020, 0025, 0038, 0040*

## Ausgangslage

- Der Pausenknopf des Timers stand unter dem Ring; gewünscht war er im Ring, unter den Zahlen.
- Termine ließen sich öffnen, aber nicht als erledigt markieren.
- War das Dashboard hinuntergerollt, hing das per Wisch geöffnete Menü an einem Knopf
  außerhalb des Bilds — oben irgendwo, abgeschnitten.
- Die Menüeinträge erschienen alle zugleich; gewünscht war, daß sie nacheinander auftropfen wie
  die Zeilen unter «Alle Tickets».
- Wer in einem Fenster speicherte, das dabei ging (Ticketblatt, Journal, Formulare), sah es
  zurückfließen und danach eine Meldung aus einem Knopf quellen — zwei Bewegungen für einen
  Vorgang. «Kopiert» unter Tickets tropfte gar nicht: `melden()` suchte den Knopf über den
  Fokus, und iOS gibt einem getippten Knopf keinen.
- Das Glas von «Hinzufügen» tropfte aus dem fast kartenbreiten Knopf und war damit von Anfang
  an groß — dieselbe Ursache wie beim Timer in 0040.
- Löschen, Archivieren und Timer-Abbrechen fragten mit einem zweiten Tipp auf demselben
  Knopf («Wirklich?»); gewünscht war ein Fenster, das tropft.

## Entscheidung

- **Pause im Ring**: Zahlen und Pausenknopf stehen gemeinsam in `.timer-mitte`, der Knopf
  44 × 44 unter der Restzeit.
- **Termine abhaken**: Jeder Termin trägt `erledigt` (Tage, sortiert, einmalig). Wo ein Termin
  an einem Tag gezeigt wird, der nicht mehr kommt («Termine heute», Tagesliste), steht rechts
  ein runder Haken (`.tm-haken`, `terminAbhaken(id, tag)`); abgehakt wird die Zeile blaß, der
  Titel durchgestrichen, der Haken grün. Eine Reihe wird **je Tag** abgehakt, nie als Ganzes;
  kommende Tage tragen keinen Haken. Der Haken zählt nicht zur Stärke und jubelt nicht.
  Bearbeiten behält die Haken, soweit der Termin an dem Tag noch liegt.
- **Der Menüknopf tropft herab**: Ist er hinausgerollt, fällt ein Gast mit seinem Symbol
  (`#menueGast`) von dort, wo der Knopf steht, an den oberen Rand; erst dann klappt das Menü
  unter ihm auf (`menueGastSetzen`, `menueGastFallen`, `menueAnker`). Beim Schließen fließt das
  Menü in den Gast, der Gast steigt zurück. Ein Tipp auf ihn schließt.
- **Einträge tropfen nacheinander**: Jeder Eintrag beginnt als Perle an seinem Symbol und
  wächst zur Zeile (`menueEintraegeTropfen`), je 70 ms später, 460 ms lang. Enger als die 160 ms
  der Ticketliste: Das Menü öffnet man oft, sieben Zeilen zu je 160 ms ließen auf das letzte
  Ziel fast zwei Sekunden warten. Geschlossen wird weiter mit einem Ausblenden der Liste.
- **Ein Fenster wird zur Meldung**: Wer in einem Fenster speichert, das dabei geht, sieht es
  sich in der Mitte des Bilds zum Tropfen zusammenziehen; aus genau diesem Tropfen quillt die
  Meldung (`fensterWirdMeldung`, `bestaetigenUndGehen`, `meldenUndGehen`, `meldePunkt`). Es sind
  die bekannten Hälften `tropfenZu` und `tropfenAuf` mit einem gemeinsamen Punkt; `tropfenAuf`
  und `hinweisZeigen` kennen dafür `warten`. Die nächste Ansicht fließt dann nicht noch einmal
  zurück (`fensterIstMeldung`). Gilt für Ticketblatt, Journal, Gewohnheit, Abgewöhnen, Termin,
  Archivieren, Rückfall und Welle.
- **Meldungen quellen aus dem zuletzt getippten Knopf** (`letzterTipp`, höchstens drei Sekunden
  alt, noch im Bild), erst dann aus dem Fokus.
- **«Hinzufügen» tropft wie der Timer**: klein aus dem Plus, in dessen Tempo
  (`TROPFEN_DAUER` statt `HINWEIS_DAUER`, `opt.dauer` in `hinweisZeigen`).
- **Fragen im Glas**: Löschen (Termin, Reflexion, Ticket, Rückfall, Abgegebene), Archivieren und
  Timer-Abbrechen fragen in einem Glas, das aus dem Knopf tropft (`loeschenFragen`); «Abbrechen»
  fließt zurück, die Bestätigung wird an Ort und Stelle zur Antwort. Den zweiten Tipp und
  `.frage` gibt es nicht mehr.

## Begründung

Ein Vorgang, eine Bewegung: Was eben noch das Fenster war, ist jetzt die Meldung, und die
fließt ins Gespeicherte. Eine Frage, die das Ende eines Eintrags bedeutet, verdient ein
eigenes Fenster statt eines Knopfs, der seine Beschriftung tauscht — der läßt sich mit einem
Doppeltipp versehentlich überspringen.

## Folgen

- Suiten: `timer` T3a, T8; `termine` H1–H10, F22–F24; `menue` C2a, S1–S2, R0–R6; `journal` B2,
  B2a, F12–F13; `tickets` B18, D2a, D15–D18; `nachschliff` A3a; Fragen in `abgewoehnen`,
  `gewohnheiten`, `feinschliff`.
- Version 0.13.0T: Termine tragen ein neues Feld, gelesen wird alles wie bisher.
