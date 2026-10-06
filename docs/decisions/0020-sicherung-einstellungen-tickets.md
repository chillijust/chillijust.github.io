# 0020 · Sicherung, Einstellungen, Tickets; langer Druck als Tropfen

*2026-10-06 · Bauabschnitt 7 · Version 0.8.0T · ergänzt 0008 (Kacheln und Zeilen tropfen beim
langen Druck), 0013 (der Hinweis kann fragen)*

## Ausgangslage

Im Menü standen «Sicherung» und «Tickets» noch auf «bald», die Einstellungen trugen nur
Darstellung und App. Das Pflichtenheft sagt knapp «nur Sicherungscode, wie Chillingo» und
«Tickets kommen mit, Format `# Chillinal · N Tickets`». Die Gestaltung wurde vor dem Bau per
Auswahl geklärt. Dazu kam ein Wunsch: Wer eine Gewohnheit, ein Abgewöhnen oder einen Termin
auf der Übersicht lange drückt, soll die Ansicht als Tropfen aufgehen sehen.

## Entscheidung

**Sicherung**
- Der Code ist Text, `CHJ1~<Prüfsumme>~<Base64 von JSON>`, und verläßt das Gerät **nur
  über «Code kopieren»**. Geht die Zwischenablage nicht, steht er zum Kopieren von Hand da.
- Er trägt alles außer den **Tickets** und der laufenden **Welle**. Die Tage einer
  Gewohnheit stehen verdichtet (erster Tag, dann Lücke und Wiederholung zur Basis 36).
- Die **Prüfsumme** (FNV-1a) lehnt abgeschnittene oder verstümmelte Codes ab, bevor etwas
  ersetzt wird. Leerraum im eingefügten Text zählt nicht.
- **Einlesen ersetzt**, nach einer Frage im Glas mit Vorschau («1 Gewohnheit, … gesichert
  am …»). Der vorige Stand bleibt als **ein Rückgängig-Schritt**, bis die Seite neu lädt.
  Die Tickets des Geräts bleiben.
- **Kachel auf der Übersicht**, sobald es etwas zu verlieren gibt (30 Einträge) und noch nie
  oder vor 30 Tagen zuletzt gesichert wurde. Gesichert heißt: Code erfolgreich kopiert.

**Tickets**
- Ein **schwebender Knopf unten rechts**, auf jeder Ansicht. Er öffnet das **Ticketblatt**,
  das sich **über** die Ansicht legt, statt sie zu ersetzen. Ein halb ausgefülltes Formular
  darunter bleibt so stehen. Das Blatt quillt als Tropfen aus dem Knopf und fließt dorthin
  zurück; Danebentippen und Escape klappen zu und behalten den Entwurf, nur «Verwerfen» wirft
  ihn weg. Ein liegender Entwurf zeigt sich als Punkt am Knopf.
- Ein Ticket trägt **Art** (Fehler | Wunsch), **Titel**, **Text**, dazu **Ort** und
  **Grund** zur Wahl. Der Ort ist mit der Ansicht vorgewählt, aus der man kam.
- Die Liste (Menü → Tickets) bündelt die offenen als `# Chillinal · N Tickets` und kopiert sie;
  **kopiert heißt abgegeben**. Abgegebene stehen gedimmt darunter und lassen sich löschen.
  Ein geändertes Ticket ist wieder offen. Gespeichert unter `chillinal_v1` (`tickets`).

**Einstellungen**
- **Hinweis bei vielen neuen** abschaltbar (`schwachHinweis`).
- **Bewegung reduzieren** (`bewegung: 'aus'`): `bewegungAus()` gilt dann, und
  `data-bewegung="aus"` am `<html>` hält das Stylesheet still wie `prefers-reduced-motion`.
- **Alle Daten löschen**, nach Frage im Glas. Darstellung, Bewegung und Tickets bleiben;
  Rückgängig wie beim Einlesen.

**Der Hinweis fragt**: `hinweisZeigen(…, { frage: { ja, beiJa } })` zeigt «Abbrechen» und
`ja`. Meldet `beiJa` etwas, wird aus der Frage an Ort und Stelle die Bestätigung.

**Langer Druck als Tropfen**: Öffnet ein langer Druck eine Gewohnheit, ein Abgewöhnen oder
einen Termin, quillt die Ansicht als Tropfen aus einem Knopfkreis um die Stelle unter dem
Finger; zurück fließt sie dorthin. Terminzeilen kennen den langen Druck jetzt auch. Kurz
antippen bleibt beim Zoom.

## Begründung

- Kopieren reicht für eine Notiz oder eine Nachricht an sich selbst; Teilen und Datei hätte
  zwei weitere Wege zum Pflegen bedeutet (gewählt: «Nur Kopieren»).
- Ersetzen statt Zusammenführen: Beim Zusammenführen ist unklar, wer bei derselben
  Gewohnheit gewinnt. Das Rückgängig nimmt dem Ersetzen den Schrecken.
- Das Blatt über der Ansicht: Als eigene Ansicht hätte der Ticketknopf jedes halb
  ausgefüllte Formular verworfen, und der Ort hätte sich nicht mehr sagen lassen.
- Der Tropfen aus dem Fingerpunkt: Ein Tropfen von voller Kachelbreite sähe aus wie ein
  Versehen, darum zoomten Kacheln bisher (0008). Ein Kreis um den Finger ist so rund wie ein
  Knopf.

## Folgen

- `menue` C prüft «bald» an einem Probe-Eintrag; alle Menüeinträge sind gebaut.
- `frisch()` im Prüfstand klappt auch das Ticketblatt zu.
- Neue Suiten: `sicherung`, `tickets`, `einstellungen`, `langdruck`.
- **Am Gerät zu klären:** ob das Ticketblatt mit eingeblendeter Tastatur gut steht, und ob
  `navigator.clipboard` in der Home-Bildschirm-App ohne Rückfrage schreibt.
