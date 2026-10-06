# 0016 · Vom linken Rand wischen heißt zurück

*2026-10-06 · Ansicht von 0.6.0T · Version 0.6.0T2*

## Ausgangslage

In der Home-Bildschirm-App gibt es keine Zurück-Geste des Browsers; der einzige Rückweg
ist der runde Knopf oben links — mit dem Daumen weit weg. Chillingo hatte dafür einen
Wisch vom linken Rand, und der Wunsch war: «wie bei Chillingo».

## Entscheidung

- **Wie in Chillingo:** Die Geste beginnt nur in den äußersten `WISCH_RAND` = 26 px, der
  Finger muß mindestens `WISCH_WEG` = 70 px nach rechts, und waagerecht muß deutlich
  überwiegen (senkrecht höchstens 0,7 × waagerecht) — sonst war es Blättern.
- **Sie wirkt beim Loslassen** (`touchend`) und tut dasselbe wie der Knopf:
  `zurueckGehen()`, also nach Hause oder über `rueckZiel` zurück in den Export.
- **Sie schweigt** auf dem Dashboard und solange Menü oder Hinweis offen sind
  (`blattOffen()`); die schließen sich auf ihre eigene Art.
- Die Zuhörer sind passiv — die Geste hält das Blättern nie auf.

## Begründung

Am Rand liegt kein Bedienelement, ein Tippen bewegt nichts, und erst das Loslassen
entscheidet: So kann die Geste nichts auslösen, was nicht gemeint war. Die Werte haben
sich in Chillingo am Gerät bewährt.

## Folgen

- Die Ansicht folgt dem Finger nicht; sie schrumpft nach dem Loslassen in ihre Herkunft
  wie beim Knopf (ADR 0007).
- Ob iOS am Rand selbst eine Geste beansprucht, zeigt nur das Gerät.
- Suite: `menue` (W1–W6).
