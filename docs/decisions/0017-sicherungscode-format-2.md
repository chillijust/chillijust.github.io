# 0017 · Sicherungscode Format 2, und Rubriken bauen danach neu auf

**Status:** angenommen · 2026-08-02

## Kontext

Zwei Befunde vom Gerät:

1. **Nach dem Wiederherstellen aktualisierten die Rubriken nicht** — «Tippen» sicher
   nicht. Der Import ersetzte `state`, rief `save()`, `updateKopf()` und `renderBilanz()`
   auf und war fertig. Jede Rubrik hält aber ihren eigenen Ansichtszustand in
   Modulvariablen: `tWord`, `tResult`, `tippenModus`, `trTask`, `trPhase`, `uebQ`,
   `uebPhase` und weitere. `state` auszutauschen rührt die nicht an, also zeigte die
   Rubrik nach dem Wechsel weiter den alten Stand.
2. Der Code selbst war unhandlich: der ganze Zustand als JSON in Base64. Mit 380
   kyrillischen Schlüsseln (in UTF-8 zwei Byte je Zeichen) und
   Millisekunden-Zeitstempeln sind das bei vollem Lernstand rund **35 KB** — ein Klumpen,
   den niemand gern von Hand markiert, ohne jede Möglichkeit zu merken, dass er
   unvollständig eingefügt wurde.

## Entscheidung

1. **`ansichtenZuruecksetzen()`** stellt alle Rubriken auf Anfang und läuft nach dem
   Wiederherstellen wie nach dem Zurücksetzen.
2. **Format 2**: eine Zeile, sieben durch `~` getrennte Felder, mit Kopf `CHG2` und
   Prüfsumme.
3. **Feste Breite statt JSON**: je Wort sechs Zeichen Kennung, eines für die Stufe, drei
   für das Alter **in Tagen**.
4. **Die Kennung ist ein Hash des Textes**, nicht seine Position im Lehrplan.
   `tools/build.mjs` schließt Kollisionen aus.
5. **Format 1 bleibt lesbar** — erkannt am fehlenden Kopf.
6. Die Ansicht sagt jetzt, **worüber man redet**: beim Erzeugen und nach dem Einlesen
   erscheint «47 Wörter · 12 Sätze · 30 Fakten», Fehler werden unterschieden.

## Begründung

**Der Fehler war strukturell, nicht örtlich.** Es hätte nicht genügt, in «Tippen» eine
Variable zurückzusetzen: Jede Rubrik hat dasselbe Problem, und die nächste käme mit
demselben Fehler dazu. Eine benannte Funktion an einer Stelle macht die Regel sichtbar —
wechselt der Lernstand als Ganzes, fangen alle Ansichten neu an.

**Kodiert wird nur, was sich nicht ausrechnen lässt.** Die russischen Wörter stehen
bereits in der Datei; sie im Code zu wiederholen kostete den Löwenanteil der Länge. Sechs
Zeichen Kennung genügen, um sie wiederzufinden. Das Ergebnis ist etwa ein Siebtel so lang.

**Hash statt Position**, obwohl die Position kürzer wäre. Der Lehrplan wächst am Ende der
Themen — jede neue Vokabel verschöbe die folgenden Indizes und ein alter Code lüde
lautlos die falschen Stände auf die falschen Wörter. Das ist genau die Art Fehler, die
man erst Monate später bemerkt. Die Kollisionsgefahr des Hashes ist dagegen beherrschbar,
weil der Build sie ausschließen kann.

**Tagesgenau statt millisekundengenau**, weil jede Frist in Tagen rechnet. Die verlorene
Genauigkeit hat keinen Empfänger.

**Prüfsumme**, weil das Kopieren langer Texte auf dem iPhone der wahrscheinlichste
Fehlerweg ist. Ohne sie lädt ein halb eingefügter Code einen halben Lernstand — und das
sieht man ihm nicht an.

## Folgen

- Alte Sicherungscodes funktionieren weiter; neue sind rund siebenmal kürzer.
- `tools/build.mjs` bricht ab, wenn zwei Inhalte dieselbe Kennung tragen. Der Ausweg wäre,
  einen der beiden Texte zu ändern — was dessen Lernstand ohnehin zurücksetzt.
- Zeitstempel im Code sind auf den Tag gerundet; nach dem Einspielen kann eine Frist
  daher um bis zu einen Tag abweichen.
- Der Code deckt bewusst **keine Tickets** ab — die liegen in ihrem eigenen Schlüssel
  (ADR 0016).
- Wer den Fortschritt zurücksetzt, sieht die Rubriken jetzt ebenfalls sofort leer statt
  mit stehengebliebenen Fragen.
