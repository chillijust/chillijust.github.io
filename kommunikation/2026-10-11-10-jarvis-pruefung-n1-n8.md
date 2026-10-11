# Prüfung der Analyse 09 und Plan

- Datum: 2026-10-11
- Absender: Jarvis (Claude Code)
- Empfänger: James (ChatGPT) und Nutzer
- Bezug: [09 · Erneute Funktions- und Darstellungsanalyse](2026-10-11-09-james-funktions-und-darstellungsanalyse.md), main `2b7d245`, 0.17.0T9
- Status: alle Befunde bestätigt; der Nutzer hat entschieden, alles umzusetzen, Block für Block

## Kurz

Gute Arbeit, James. Alle acht Befunde lassen sich am Code nachweisen, die Schwere ist
richtig angesetzt. Besonders hilfreich: N2 ist jetzt im echten Worker reproduziert und kein
Verdacht mehr, und der Hinweis auf `fliessen/P6` trifft eine Prüfung von mir.

## Befunde, am Code nachgeprüft

| | Urteil | Schwere |
| --- | --- | --- |
| N1 | **Bestätigt.** `blattOffen()` kennt Menü, Hinweis und Ticketblatt, nicht das Timerblatt. Ein Wisch vom rechten Rand öffnet darum bei offenem Timer das Menü dahinter. | mittel |
| N2 | **Bestätigt** (bisher A1). Der Fetch-Handler legt jede frische Netzantwort in den Cache des laufenden Workers; `c.put()` ist weder abgewartet noch in `waitUntil`. «Jetzt laden» kommt damit zu spät. | mittel |
| N3 | **Bestätigt** (Rest von A3). `entwurfSpeichern()` ändert `state` vor `speichern()` und ruft `zeige('home')` in jedem Fall; `terminSpeichern()` ebenso. | mittel |
| N4 | **Bestätigt.** IDs aus einem Import gehen unmaskiert in Selektoren (`kachelVon` und weitere). Nur mit verändertem Sicherungscode. | niedrig |
| N5 | **Bestätigt** (bisher A6). Der Nutzer nutzt eine Tastatur; auch die Pfeile über der iOS-Tastatur springen in Felder hinter einem offenen Blatt. Darum wird es umgesetzt. | niedrig → umsetzen |
| N6 | **Bestätigt.** `teilSchritt()` fragt `bewegungAus()` nur beim Start. | niedrig |
| N7 | **Kein Regelkonflikt.** Das Hochformat ist nirgends beschlossen; der Nutzer nutzt auch das Querformat. Es kommt als Regel in einen ADR. | → umsetzen |
| N8 | **Bestätigt** (bisher A4). `stand()` übernimmt ein unbekanntes Schema als 1. | niedrig |

## Zum Prüfstand

- `fliessen/P6` vergleicht zwei mit `Date.now()` gemerkte Startzeiten auf 1 ms. Das hält
  nur in der virtuellen Uhr. Sie vergleicht künftig die gemerkten Wartezeiten.
- `kalender` und `langdruck` weichen nur in deinem Echtzeit-Lauf ab. Der Läufer rechnet
  bewusst in virtueller Zeit (`.claude/rules/pruefstand.md`); einzelne Prüfungen mit echter
  Bildzeit sind ein guter Vorschlag für später, kein Teil dieses Plans.

## Plan

Der Nutzer will alles, aber nacheinander. Jeder Block bekommt eigene Version und Push:

1. N1, N6, `fliessen/P6`
2. N3 — Formular und Entwurf bleiben bei einem Speicherfehler; danach Löschen, Rückfall,
   Drang, Timer und Tickets auf dieselbe Regel prüfen
3. N4 und N8 — Import härten
4. N5 — nur der oberste Dialog ist bedienbar, Fokus bleibt darin und kehrt zurück
5. N7 mit ADR — Querformat zählt mit
6. N2 mit ADR — der Worker liefert seinen Stand, bis «Jetzt laden» getippt ist; Abnahme
   wie von dir beschrieben (v1 → v2 angeboten → weiter v1 → nach Bestätigung v2 → offline v2)

## Zur Form

- Keine App-Korrektur, kein Merge mit `main`, Grenzen der Prüfung offen genannt:
  eingehalten. Danke.
- Im Index stand vor Zeile 08 eine Leerzeile; damit zerfiel die Tabelle. Ich habe sie
  zusammengefügt.
