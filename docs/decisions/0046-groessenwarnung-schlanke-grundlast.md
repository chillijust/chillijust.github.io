# 0046 · Größenwarnung für `index.html`; schlanke Grundlast für Claude

*2026-10-08 · nach 0.13.1 · ohne neue Fassung*

## Ausgangslage

`index.html` wuchs von 339 KB (0.5.0) auf 495 KB (0.13.1), etwa 25 KB je Fassung —
ausschließlich Code; das Eingebettete blieb gleich. Niemand bemerkte das, weil nichts es
meldete. Der Push-Hook verschluckte außerdem jeden Hinweis von `pruefen.mjs`, solange alles
grün war.

Eine Ticket-Sitzung lud vor der ersten Zeile Arbeit rund 57 KB Text: `CLAUDE.md` (14 KB),
die Regeln zu `index.html` (10 KB), `docs/architektur.md` und `docs/deploy.md` als
Pflichtlektüre (25 KB), die Skills (9 KB). Der Prüfstand war dreimal beschrieben — Skill,
README und Regeldatei —, die Suitentabelle der README war veraltet (24 von 30).

## Entscheidung

**Größe.** `pruefen.mjs` meldet ab **600 KB** einen Hinweis und hält ab **800 KB** an.
Der Hook reicht Hinweise jetzt als Meldung durch, statt sie zu verschlucken. Die Schwelle
hebt nur der Nutzer an; die Antwort auf 800 KB ist Aufräumen oder ein Umbau auf
Quelldateien, die `build.mjs` zu einer `index.html` zusammensetzt — ausgeliefert würden
weiter zwei Dateien.

**Grundlast.**
- `CLAUDE.md` trägt nur, was immer gilt (14 → 8,5 KB). Was `pruefen.mjs` erzwingt, steht
  als eine Zeile mit (P).
- Service Worker, Version und Eingebettetes stehen in `.claude/rules/auslieferung.md`, die
  nur bei `sw.js`, `VERSION` und `tools/build.mjs` lädt. Das `T`-Schema steht zusätzlich
  im Skill `ticket`, weil `VERSION` oft per Shell geschrieben wird.
- `docs/architektur.md` ist keine Pflichtlektüre mehr und trägt nur Zustand, Speicher,
  Render-Zyklus und einen Wegweiser zu den Funktionen (18,5 → 9 KB).
- Der Prüfstand ist an drei Stellen je einmal beschrieben: Fallen in der Regeldatei,
  Vorgehen im Skill, Aufbau und Vorlage in der README. Statt der Suitentabelle zeigt
  `head -3 tools/pruefstand/suiten/*.mjs` die Kopfkommentare.

**Sonnet muß damit klarkommen.** Gekürzt wurde Wiederholtes und Beschreibendes, nicht die
Eindeutigkeit: Regeln stehen als «immer/nie», jede Falle ausgeschrieben, jede Datei sagt,
wann sie lädt und wo das Übrige steht.

## Begründung

Eine Warnung, die niemand sieht, ist keine. 600 KB lassen bei heutigem Tempo etwa vier
Fassungen Vorlauf, 800 KB etwa zwölf — genug, um ohne Druck zu entscheiden.

Was jede Sitzung lädt, kostet bei jedem Aufruf erneut. Ein Text, der nur bei Bedarf
gelesen wird, kostet nur dann.

## Folgen

- Eine Ticket-Sitzung lädt vorab rund 26 KB statt 57 KB.
- Wer `sw.js` ändert, bekommt dessen Regeln automatisch; wer nur `index.html` ändert, nicht.
- Eine neue Suite braucht nur ihren Kopfkommentar, keinen Tabelleneintrag.
