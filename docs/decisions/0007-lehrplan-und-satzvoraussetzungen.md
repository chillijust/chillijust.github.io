# 0007 · Lehrplan: Funktionswörter zuerst, Sätze mit Voraussetzungen

**Status:** angenommen · 2026-08-01

## Kontext

Nach ADR 0006 war die Reihenfolge der Vokabeln der Lernweg — nur war diese Reihenfolge
nie als Lernweg gedacht. Sie war nach Sachgruppen sortiert („Reisen & Natur" stand hinter
„Verben"), und die 55 Sätze in „Übersetzen" hingen völlig daneben: Von 274 Wörtern in den
Sätzen standen **19 %** im Vokabular. Die fehlenden 81 % waren zwei Gruppen:

- **Funktionswörter**, die nirgends gelehrt wurden — я, мы, в, на, не, и, что, это.
  Ohne sie ist kein russischer Satz lesbar, und sie fehlten vollständig.
- **Gebeugte Formen** gelehrter Wörter — «книгу» zu книга, «пишет» zu писать. Ein
  Zeichenkettenvergleich kann sie nicht erkennen; Russisch beugt zu stark.

Man konnte also Sätze übersetzen, deren Wörter man nie gelernt hatte, und Wörter lernen,
die in keinem Satz vorkamen.

## Entscheidung

1. **60 Funktionswörter und Alltagsverben ergänzt** (я, ты, он, она, мы, вы, они, это,
   в, на, у, с, к, из, о, через, и, но, не, мой, каждый, много, очень, если, когда,
   потому что, чтобы, хотя, нужно, играть, ехать, думать, готовить …), dazu neun Wörter,
   die die Sätze verlangten (язык, русский, музыка, ужин, Москва, Россия, долго …).
   Bestand jetzt 380 Wörter in 32 Päckchen.
2. **Die Reihenfolge folgt dem Lernen, nicht der Sachlogik.** Erst Personen und
   Zeigewörter, dann Grußformeln, dann Präpositionen, dann Familie, dann die zwölf
   häufigsten Verben. Ein neues Thema „Erste Dinge" zieht die Alltagsnomen nach vorn, die
   die einfachen Sätze brauchen (книга, город, кошка, собака …).
3. **Jeder Satz nennt seine Voraussetzungen** als Grundformen (`benoetigt`). „Übersetzen"
   bietet einen Satz erst an, wenn alle davon mindestens Leitner-Stufe 2 haben. Die
   Stufenleiste zeigt `3/20`, der Leerzustand nennt die fehlenden Wörter.
4. **Elf Sätze umgeschrieben**, die Wörter außerhalb des Lehrplans verlangten
   («фильм», «двор», «практиковаться», «объяснить»). Die grammatische Schwierigkeit
   bleibt — Nebensatz bleibt Nebensatz —, der Wortschatz kommt aus dem Lehrplan.

## Begründung

Die Alternative wäre gewesen, jedes Satzwort mit seiner Grundform zu annotieren und die
Zuordnung automatisch zu prüfen. Das hätte eine Morphologie-Tabelle im Auslieferungspfad
bedeutet — für eine Datei, die ohne Abhängigkeiten auskommen soll, der falsche Preis.
Eine handgepflegte Liste je Satz ist ein paar Zeilen Arbeit und dafür exakt.

Stufe 2 als Schwelle für Sätze (statt 4 wie beim Tippen) ist Absicht: Ein Wort im Satz
steht im Zusammenhang und wird von den Nachbarwörtern getragen; beim Tippen steht man
allein davor.

## Folgen

- **Wer einen Satz mit einem neuen Wort schreiben will, muss das Wort zuerst lehren.**
  `build.mjs` bricht sonst ab. Genau das hält den Aufbau zusammen.
- Der erste Satz ist ab Päckchen 5 erreichbar, acht Sätze ab Päckchen 8, alle 55 ab
  Päckchen 31 — die Kurve wächst mit dem Wortschatz statt an ihm vorbei.
- `state.readSeen` merkt sich Sätze jetzt am Text statt an einer laufenden Nummer; alte
  Einträge (`"1-0"`) fallen beim Laden weg. Kosten: der Zähler „Sätze übersetzt" beginnt
  einmalig von vorn.
- Die Zählung „Sätze übersetzt" bezieht sich auf die **offenen** Sätze, nicht auf alle —
  sonst stünde dort dauerhaft eine Zahl, die man noch gar nicht erreichen kann.
- Offen bleibt das Lesetraining (Buchstabengruppen, ähnliche Zeichen). Der Wortschatz
  deckt 32 der 33 Buchstaben ab; ein eigener Einstieg wäre der nächste Schritt.
