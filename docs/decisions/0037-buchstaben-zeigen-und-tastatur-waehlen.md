# 0037 · Zeigen, wo es klemmte — und die Tastatur mitbringen

**Stand:** angenommen · 2026-08-08

## Ausgangslage

Zwei Beobachtungen aus der Benutzung, beide am geschriebenen Satz in «Übersetzen»:

1. Nach der Abgabe stand «Richtig wäre: …» darunter, und das getippte Feld blieb
   unverändert stehen — nur mit rotem Rand. Wer ein einziges Zeichen vertippt hatte,
   musste die beiden Sätze selbst nebeneinanderhalten, um zu sehen, welches.
2. Die eingebaute kyrillische Tastatur lag hinter «Tastatur einblenden». Verlangt eine
   Aufgabe Kyrillisch, ist sie aber das Werkzeug — sie erst zu holen war ein Handgriff
   ohne Entscheidung.

## Entscheidung

**Die Prüfzeile.** Nach der Abgabe tritt an die Stelle des Feldes der eingefärbte Satz:
grün, was stimmt, rot und unterstrichen, was falsch dasteht, ein schmaler Balken, wo
etwas fehlt. Ein `textarea` kann seinen Text nicht stellenweise färben, also weicht es,
statt bloß gesperrt zu werden.

Gerechnet wird mit Levenshtein **und Rückweg**: `editAbstand()` sagt, *wie viel* daneben
war, nicht *wo*. Auf dem Rückweg gewinnt die Diagonale, damit zwei Zeichen an derselben
Stelle einander zugeordnet bleiben.

**Was `normalize()` übersieht, übersieht auch die Farbe.** Satzzeichen, Leerraum,
Groß-/Kleinschreibung und ё/е kosten nichts.

**Die Tastatur kommt von selbst**, wo Kyrillisch verlangt ist — in «Übersetzen» nach
`loesungRu`, in «Tippen», «Grammatik» und im Power-Training immer. Die Einstellung
`tastaturAn` (Vorgabe aus, unabhängig von der Sprache) wird zu **`tastaturAuto`**
(Vorgabe an, sprachabhängig). Neuer Schlüssel, damit die neue Vorgabe auch bestehende
Geräte erreicht.

## Begründung

Zur Farbe: Sie darf nichts **allein** tragen. Falsche Zeichen sind zusätzlich
unterstrichen, und eine Zeile darunter zählt in Worten — «1 Zeichen steht falsch ·
1 fehlt». Rot und Grün sind die beiden Farben, die am häufigsten zusammenfallen.

Dass die Farbe dieselben Unterschiede übersieht wie `normalize()`, ist keine Feinheit,
sondern Bedingung: Eine Antwort, die als richtig gewertet wurde, darf nicht rot dastehen.
Sonst widerspräche die Zeile dem Haken direkt darüber.

Zur Tastatur: Die Einstellung bleibt — wer ein russisches Systemlayout installiert hat,
findet die eingebaute überflüssig. Sie ist jetzt aber ein Opt-out statt eines Opt-ins.

**Die Sprache der Gerätetastatur kann eine Seite nicht wählen.** iOS entscheidet das aus
den installierten Tastaturen und der zuletzt benutzten; `lang` ist dafür kein Hebel. Die
eingebaute Tastatur *ist* die Antwort der App darauf — für die Gegenrichtung (Deutsch)
gibt es nichts zu tun und nichts vorzutäuschen.

## Folgen

- `BK_SETTINGS` führt die Schalter an festen Stellen. Eine Einstellung, die es nicht mehr
  gibt, hinterlässt ein `null` als Platzhalter, sonst wandern die Stellen und ein alter
  Code liest die falschen Schalter. Und was ein Code **nicht führt**, behält seine
  Vorgabe — sonst machte ein älterer Code aus `tastaturAuto` ein «aus».
- Wer die Tastatur zuklappt, behält das für die Sitzung: Die Vorgabe greift einmal, dann
  entscheidet die Hand.
- Drei Bestandstests prüften die alte Vorgabe («Tastatur startet zugeklappt») und wurden
  umgestellt.
- Die Prüfzeile bleibt vorerst auf «Übersetzen» beschränkt. In «Tippen» wäre sie
  dieselbe Sache mit demselben Helfer — aber ein Wort statt eines Satzes, und danach war
  nicht gefragt.
