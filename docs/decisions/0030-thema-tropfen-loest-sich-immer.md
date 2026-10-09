# 0030 · Der Hell/Dunkel-Tropfen löst sich immer

*2026-10-06 · GitHub-Lauf rot (Prüfstand, `thema C0`) · Version 0.10.0T2, abgenommen · ergänzt 0025*

## Ausgangslage

Der Prüfstand auf GitHub war zweimal hintereinander rot: Nach dem Hell/Dunkel-Wechsel trug
`<html>` noch `thema-tropft`. Die Klasse nahm nur `transition.finished` wieder weg. Läuft
der Übergang an, meldet aber sein Ende nie, bleibt sie hängen. Das kommt vor, wenn kein
Bild gezeichnet wird: im kopflosen Browser oder am Gerät, wenn die App mitten im Wechsel
in den Hintergrund geht. Solange die Klasse steht, ruhen alle Übergänge der App
(`html.thema-tropft * { transition: none !important }`).

## Entscheidung

Spätestens `THEMA_TROPFEN + 400` ms nach dem Druck nimmt ein Zeitgeber die Klasse weg,
gleich ob der Übergang sein Ende gemeldet hat. Bis dahin ist der Tropfen in jedem Fall
durch.

## Folgen

- Suite `thema` C14: ein Übergang, dessen Ende nie kommt.
- Der Lauf auf GitHub war kein Zufall, sondern dieser Fehler; lokal kam das Ende
  rechtzeitig.
