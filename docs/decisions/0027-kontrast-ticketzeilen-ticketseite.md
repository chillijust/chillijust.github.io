# 0027 · Nachtrag: Kontrast im Tropfen, Ticketzeilen nach dem Wechsel, Ticketseite

*2026-10-06 · Ticket vom Gerät (App-Stand 0.9.0T5) · Version 0.9.0T6 · ändert 0026
(Hell ↔ Dunkel, Ticketzeilen); ergänzt 0025 («Alle Tickets» im Blatt)*

## Ausgangslage

- Hell → Dunkel war zu hart: Die Scheibe stand mit vollem Kontrast gegen die alte Darstellung.
- Unter «Alle Tickets» tropften die Zeilen, während das Blatt noch die Höhe wechselte.
- Aus der Liste im Blatt führte kein Weg zur Seite «Tickets».
- Ein Ticket mit Text, von der Seite «Tickets» geöffnet, zeigte nur eine Zeile davon.
  Ursache: `textWachsen` maß das Feld, solange das Blatt noch verborgen war. Verborgen ist
  die Höhe des Inhalts null, also blieb das Feld auf seiner Mindesthöhe.

## Entscheidung

- **Der Kontrast steigt mit dem Tropfen**: Die neue Darstellung blendet in der wachsenden
  Scheibe von durchsichtig auf voll (`opacity` 0 → 1 im selben Takt wie `clip-path`).
- **Die Ticketzeilen tropfen erst nach dem Wechsel**: Ändert sich die Höhe des Blatts,
  beginnt die erste Zeile nach dessen 380 ms. Jede Zeile braucht 820 ms statt 560, die
  nächste kommt 160 ms später statt 110 (`TK_WECHSEL`, `TK_ZEILE`, `TK_STAFFEL`).
- **«Ticketseite» im Kopf der Liste**: Die Seite «Tickets» öffnet sich unter dem Blatt,
  das Blatt fließt in den Ticketknopf zurück. Ein angefangener Entwurf bleibt liegen.
- **Der Fließtext wird gemessen, wenn das Blatt steht**: `ticketBlattOeffnen` ruft
  `textWachsen` nach dem Aufdecken noch einmal.

## Begründung

Eine Scheibe, deren Farbe sofort voll steht, wirkt wie ein Schnitt, nicht wie ein Tropfen.
Zeilen, die in ein Blatt tropfen, das sich noch bewegt, gehen in dessen Bewegung unter.
Die Liste im Blatt ist der schnelle Blick; aufräumen und von Hand kopieren kann nur die
Seite.

## Folgen

- Suiten: `thema` C0b; `tickets` U9a–U9c, U14.
- Wie weich der Übergang am Gerät wirkt, zeigt nur das Gerät — der kopflose Browser
  zeichnet den Ansichtsübergang nicht.
