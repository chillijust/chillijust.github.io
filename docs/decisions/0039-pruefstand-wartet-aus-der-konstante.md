# 0039 · Der Prüfstand wartet aus der Konstante, mit mehr Budget

*2026-10-07 · GitHub-Lauf rot seit 0.11.0T3 (Prüfstand, `thema C0`, `C5g`) · ergänzt 0030*

## Ausgangslage

Seit ADR 0037 war der Prüfstand auf GitHub bei jedem Push rot, lokal grün. Die App war
nicht schuld: Die Sicherheitsuhr aus ADR 0030 räumt nach `THEMA_TROPFEN + 400` ms auf; mit
`THEMA_TROPFEN` = 1560 sind das 1960 ms. C0 schaute aber fest nach 340 + 1400 = 1740 ms
nach — passend zu den alten 1300 ms. Lokal fiel die Klasse über den 400-ms-Notweg
(kein Bild, Übergang übersprungen) schon vorher; auf GitHub läuft der Übergang an, und nur
die Uhr nimmt sie weg — zu spät für die feste Zahl.

## Entscheidung

- `thema` wartet überall `THEMA_TROPFEN + 500` (C0: ab dem Druck gerechnet), keine feste
  Zahl mehr.
- Das virtuelle Budget des Läufers steigt von 10 auf 20 s. `thema` wartete schon vorher
  ~9,7 s und lief damit hart an der Kante; mit den längeren Pausen kam sie ohne Urteil
  zurück.

## Begründung

Eine feste Wartezeit veraltet stumm, sobald die Bewegung länger wird — und zwar nur auf
GitHub, wo man es zuletzt sieht. Das größere Budget kostet nichts: Virtuelle Zeit läuft
vor, wenn nichts zu tun ist; der ganze Lauf dauert weiter rund 40 s.

## Folgen

- Nachgestellt, indem der Übergang anläuft, aber sein Ende nie meldet: C0 und C5g fielen
  wie auf GitHub und halten jetzt.
- Regel in `.claude/rules/pruefstand.md`. Keine neue Version — `index.html` ist unverändert.
