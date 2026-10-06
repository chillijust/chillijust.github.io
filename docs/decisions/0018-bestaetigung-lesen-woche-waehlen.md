# 0018 · Bestätigung im Glas, Reflexion lesen, Woche wählen

*2026-10-06 · Abnahme von 0.7.0T · Version 0.7.0T2, nachgebessert 0.7.0T3, frei mit 0.7.0 · ändert 0013, 0017*

## Ausgangslage

Drei Wünsche aus der Abnahme des Journals:

- Die Meldung «Gespeichert» soll aussehen wie der Hinweis nach dem Kalender-Export — nur
  ohne Knopf zum Bestätigen.
- Ein Eintrag im Journal öffnete sofort das Formular. Gewünscht: erst lesen, dann über
  «Bearbeiten» ändern; dort soll es auch «Löschen» geben.
- Eine vergessene Woche ließ sich nicht nachholen (ADR 0017 ließ nur die laufende zu).

## Entscheidung

- **Bestätigung** (`bestaetigen(titel, text, knopf, ziel)`): derselbe Hinweis aus Glas,
  derselbe Tropfen (ADR 0013, 0014), aber mit grünem Haken statt «OK», `role="status"`.
  Er geht von selbst nach `bestaetigungDauer` — 1,4 s plus 45 ms je Zeichen, höchstens
  4 s —, ein Tipp irgendwohin schließt früher. Er quillt aus dem getippten Knopf (gemessen,
  bevor die Ansicht wechselt) und fließt in das Gespeicherte: `ziel` darf ein Selektor
  sein, gesucht beim Schließen. Fehlt es, fließt er dorthin zurück, woher er kam.
- **Überall beim Speichern**, auf Ansage: Gewohnheit, Abgewöhnen, Termin, Reflexion —
  jedes «Gespeichert» und «Angelegt». Löschen einer Reflexion bestätigt ebenso.
  Fehlermeldungen, Archivieren, Löschen von Gewohnheit und Termin bleiben die Zeile unten.
- **Nichts gespeichert** (0.7.0T3): Wer eine neue Reflexion leer speichert, sieht dasselbe
  Glas — aber mit neutralem Zeichen statt grünem Haken (`zeichen: 'hinweis'`), denn der
  Haken heißt «gespeichert». Am Gerät bemerkt: Diese Meldung kam noch als Zeile.
- **Lesen** (Ansicht `lesen`, `id` = Montag): Woche, Zahlen, beide Antworten, wann
  geschrieben, «Bearbeiten». Journal-Einträge und die Sonntagskachel mit fertiger
  Reflexion öffnen hierhin (`data-lesen`). Zurück geht es dorthin, woher das Lesen kam;
  aus «Bearbeiten» zurück ins Lesen, nach dem Speichern ebenso.
- **Löschen** steht im Formular einer bestehenden Reflexion, zwei Tipps wie beim Termin
  («Wirklich löschen?»), danach ins Journal. Leer speichern entfernt weiterhin.
- **Woche wählen**: Eine neue Reflexion trägt Pfeile um den Wochentitel — zurück
  unbegrenzt, vor bis zur laufenden. Die Wahl ändert das Formular an Ort und Stelle
  (Tastatur bleibt offen), der Text bleibt im Entwurf. Steht die gewählte Woche schon,
  sagt es das Formular, sperrt «Speichern» und führt mit «Ansehen» hin.
- Das Journal zeigt oben immer einen Weg zum Schreiben: «Woche reflektieren», solange die
  laufende fehlt, sonst «Woche nachholen» für die jüngste fehlende (`offeneWoche`).

## Begründung

Eine Bestätigung, die aussieht wie der Hinweis, aber von selbst geht, verbindet beides:
Man sieht, daß es geklappt hat, und muß nichts wegtippen. Lesen vor Bearbeiten schützt
das Geschriebene vor versehentlichem Ändern. Die Woche im Formular zu wählen, statt eine
Liste fehlender Wochen zu führen, hält das Journal kurz, auch nach langen Pausen.

## Folgen

- ADR 0017: «vergangene Wochen lassen sich nicht nachholen» und «ein eigener Löschknopf
  entfällt» gelten nicht mehr; ein Eintrag öffnet zum Lesen, nicht zum Ändern.
- `hinweisZeigen` nimmt ein `opt` (`bestaetigung`); ein Hinweis mit «OK» bleibt, wie er war.
- Suiten: `journal` (F8–F13, F11a2, F11b, W5–W12, B1–B7), `termine` F17/F21 lesen die Bestätigung.
