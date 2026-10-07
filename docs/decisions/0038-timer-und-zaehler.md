# 0038 · Timer und Zähler

*2026-10-07 · Wunsch (App-Stand 0.11.0T3) · Version 0.12.0T · ergänzt das Pflichtenheft (Gewohnheiten);
lockert 0003 (ein Ziel je Kachel) für den Zähler; erweitert 0009 (Export)*

## Ausgangslage

Gewünscht: Eine Gewohnheit, die eine Zeit dauert (Übungen, Lesen), soll einen Timer haben, der
beim Abhaken startet, sich abbrechen oder vorzeitig fertig melden lässt und auf Wunsch stumm
ist. Eine Gewohnheit, die man zählt (eine Tasse Wasser je Kaffee), soll einen Zähler haben,
der beim ersten Zählen abhakt und sich bei Vertippern zurückzählen lässt. Geklärt in drei
Fragerunden.

## Entscheidung

- **Jede Gewohnheit wird auf eine Weise abgehakt** — im Formular unter «Abhaken»:
  Antippen · Timer · Zähler. Timer und Zähler schließen sich aus. Abgewöhnen kennt das nicht.
- **Timer** (`timer: { minuten, stumm }`, 1–240 Minuten, ein Minutenfeld, «Ton am Ende»):
  - Ein Tipp auf die Kachel startet ihn und läßt ein Glasfenster aus der Kachel tropfen:
    Name, großer Ring mit Restzeit, «Abbrechen», «Fertig», oben rechts der Ton.
  - Abgehakt wird erst am Ende — wenn er durch ist oder «Fertig» kommt. «Abbrechen» will
    zwei Tipps und hakt nichts ab.
  - Danebentippen schließt das Fenster; der Timer läuft weiter, die Kachel zeigt die
    Restzeit in ihrem Ring. Ein Tipp auf die Kachel holt das Fenster zurück.
  - Es läuft höchstens ein Timer. Ein zweiter fragt im Glas, ob der laufende abbrechen soll.
  - Er merkt sich seinen Start (`state.timer = { id, tag, start, ms, stumm }`) und läuft darum
    weiter, auch wenn die App zu ist; ist er beim Öffnen durch, ist die Gewohnheit für den
    Tag abgehakt, an dem er begann.
  - Am Ende ein sanfter Gong, in der App erzeugt (Web Audio, keine Datei) — nur, wenn er nicht
    stumm ist, die App zu sehen ist und das Ende eben erst war. «Stumm» steht je Gewohnheit
    und läßt sich im Lauf umschalten, nur für diesen Lauf.
  - Archivieren oder das Umstellen auf eine andere Weise beendet einen laufenden Timer.
- **Zähler** (`zaehler: true`, `zaehlung: { Tag: n }`):
  - Ein Tipp zählt eins; der erste hakt ab (mit allem Jubel), weitere zählen nur mit. Die
    Scheibe zeigt die Zahl, die Kachel «3× heute».
  - Ab eins steht auf der Kachel ein rundes «−» (44 px). Bei null ist der Haken weg.
  - Gespeichert wird nur, was über eins hinausgeht: Ein erledigter Tag ohne Eintrag zählt
    eins. So bleibt jeder Haken, auch ein nachgetragener, eine gültige Zählung.
- **Nachtragen** im Kalender bleibt einfaches Abhaken: Rückwirkend läuft kein Timer, der
  Zähler setzt eins. Die Tagesliste nennt die Zahl («3× erledigt»); zurückgenommen ist auch
  die Zahl fort.
- **Export**: Eine Gewohnheit mit Timer steht so lang im Kalender, wie der Timer dauert.
- **Sicherung**: Timer und Zählungen fahren im Code mit, ein laufender Timer nicht.

## Grenzen

Ohne Server darf eine Web-App auf iOS im Hintergrund weder klingen noch eine Mitteilung
zeigen; Vibration kann Safari nicht. Der Timer läuft weiter, aber hörbar enden kann er nur bei
offener App. Ob iOS den Gong bei eingeschaltetem Stummschalter des Geräts spielt, zeigt nur
das Gerät.

## Begründung

Ein Haken, der erst am Ende kommt, sagt, daß die Zeit wirklich verbracht wurde. Der Zähler
hakt sofort ab, weil schon das erste Mal die Gewohnheit erfüllt; die Zahl ist Zugabe. Das «−»
auf der Kachel ist ein zweites Ziel gegen ADR 0003 — gewünscht, weil Korrigieren dort sein
muß, wo man sich vertippt hat; es steht abseits der Scheibe und erscheint erst ab eins.

## Folgen

- Suite `timer` (neu): D1–D6, F1–F8, T0–T19, Z1–Z7.
- Version 0.12.0T: Es kommt etwas dazu; alte Stände lesen sich unverändert (neue Felder mit
  Vorgabe), der Schlüssel bleibt.
