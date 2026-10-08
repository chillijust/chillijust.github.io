# 0006 · Lernweg: Päckchen, Wiedervorlage und gesperrtes Tippen

**Status:** angenommen · 2026-08-01

## Kontext

Alle drei Übungsrubriken zogen aus demselben Bestand von 311 Wörtern — aber ohne jede
Ordnung. „Üben" bot ein Themenmenü mit 17 Sachgruppen, „Tippen" zog aus allen 311
Wörtern, auch solchen, die noch nie aufgetaucht waren. Man konnte also ein Wort tippen
müssen, das man nie gesehen hatte, und in „Üben" beliebig zwischen Sachgruppen springen,
ohne dass irgendetwas aufeinander aufbaute. Die Leitner-Stufe steuerte nur die Frageform,
nicht die Auswahl.

## Entscheidung

1. **Gelernt wird in Päckchen zu zwölf Wörtern** in der Reihenfolge der Daten. Das
   nächste öffnet, wenn jedes Wort des laufenden mindestens Stufe 3 erreicht hat. Die
   Sachgruppen bleiben als Beschriftung erhalten, sind aber keine Navigation mehr.
2. **„Tippen" zeigt nur, was sitzt** — ab Leitner-Stufe 4, also vier richtigen Antworten
   nacheinander. Die Schwelle ist in den Einstellungen auf 2 oder 3 änderbar.
3. **Wiedervorlage über Zeitstempel.** `state.lastSeen` je Wort, Intervalle 1 · 3 · 7 ·
   21 Tage nach Stufe. Die Auswahl bevorzugt Fälliges, dann Unbekanntes, dann das am
   längsten Zurückliegende.
4. **Die Wort-Kennung ist das russische Wort**, nicht mehr `Thema::wort`. Alte Stände
   werden beim Laden umgeschrieben (`migriereIds()`).

## Begründung

Zwölf Wörter sind eine Sitzung, keine Hausaufgabe; Stufe 3 als Türöffner heißt, dass
jedes Wort dreimal richtig war, bevor es weitergeht — das ist streng genug, dass die
Freischaltung etwas bedeutet, und milde genug, dass man vorankommt.

Die Sperre in „Tippen" kostet Anlaufzeit: Bei Stufe 4 bleibt die Rubrik die ersten
Sitzungen leer. Das ist gewollt — Schreiben ohne gefestigten Wortschatz ist Raten mit
Tastatur. Der Leerzustand nennt deshalb die drei Wörter, die am nächsten dran sind, und
die Schwelle lässt sich senken, wenn es zäh wird.

Die Kennung vom Themennamen zu lösen war überfällig: Sie hing an einer Beschriftung, die
sich jederzeit ändern kann, und Etappe 2 wird die Themen ohnehin umsortieren.

## Folgen

- **Die Reihenfolge in `data/vokabeln.json` ist jetzt Lehrplan, nicht mehr nur Ordnung.**
  Ein Wort in der Mitte einzufügen verschiebt alle folgenden Päckchen. Ergänzungen
  gehören ans Ende des jeweiligen Themas.
- Der Themenfilter in „Üben" ist der Päckchenwahl gewichen. Wer gezielt ein Sachgebiet
  üben will, wählt das entsprechende Päckchen — solange es freigeschaltet ist.
- `state.lastSeen` wächst auf einen Eintrag je begonnenem Wort und geht in den
  Sicherungscode ein; bei 311 Wörtern sind das wenige Kilobyte.
- Offen bleibt Etappe 2: Die Sätze in „Übersetzen" hängen weiter in der Luft — nur 19 %
  ihrer Wörter stehen im Vokabular, der Rest sind Funktionswörter und gebeugte Formen.
  Ein Aufbau „Satz erst, wenn seine Wörter sitzen" braucht Voraussetzungslisten in den
  Satzdaten.
