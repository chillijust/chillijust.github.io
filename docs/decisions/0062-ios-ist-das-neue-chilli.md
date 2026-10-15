# 0062 · iOS ist das neue Chilli: überall flüssig, kein Reiter «Flüssig»

*2026-10-15 · Wunsch des Nutzers nach der Freigabe von 0.18.0 · Version 0.19.0T · Sicherung
davor: `backup/chillinal-0.18.0T-2026-10-15` · löst in 0053 den Reiter «Flüssig» und in 0054
«Chilli ist Standard, iOS je Stelle» ab; ändert in 0041 «Einträge tropfen nacheinander»;
in 0060 gilt der Rückwisch nun immer*

## Ausgangslage

Seit 0.17.0 trug jede bewegte Stelle zwei Fassungen: die Chilli-Bewegung von 0.15.0 als
Standard und das Flüssige wie in iOS 26, je Stelle im Reiter «Flüssig» der Einstellungen
einzuschalten, mit Probe, Schalter und «Speichern». Der Nutzer will das Flüssige überall.
Zwei Fassungen hießen doppelten Code, doppelte Suiten und einen Reiter, der nur noch
umschaltete.

## Entscheidung

- **Jede Stelle fließt wie in iOS 26**, fest, als Pfad gerechnet (Feder, Hals, Dehnen,
  Lichtkante; ADR 0053, 0054). Die Chilli-Bilder sind fort: Ansichten, Hinweis, Menü,
  Schalter und Wahl, Abhaken, Welle, Tagesmarkierung, Zeilen, Auftropfen.
- **Der Reiter «Flüssig» ist fort** — mit Proben, Schaltern, «Speichern» und der Rückfrage
  beim Verlassen. Die Einstellungen sind wieder eine Seite, ohne Reiter.
- **«Ruckler messen» geht mit** (stand im Reiter, Nachricht 15). Wer wieder messen will,
  holt es aus der Sicherung.
- **`state.fluessig` entfällt.** Ein gemerkter Stand von dort fällt beim Laden still weg;
  das Schema bleibt `chillinal_v1`, ein älterer Stand und ein älterer Sicherungscode lesen
  sich unverändert.
- Die Dauern setzt `flDauernSetzen` einmal beim Start aus der Feder von iOS 26.
- Das Menü öffnet als ein Tropfen; seine Einträge blenden ein, wenn er fast steht, statt
  einzeln aufzutropfen (0041).

## Begründung

Der Nutzer: «iOS wird unser neues Chilli.» Was am Gerät gilt, soll auch die einzige
Fassung im Code sein. `index.html` wird dadurch rund 60 KB leichter (678 → 620 KB).

## Folgen

- Wer bewegt, nimmt `fluessigTakt`, `teilFliesst` und `fliessen` — es gibt keinen zweiten
  Weg und keine Weiche `flIos` mehr.
- Der Prüfstand bringt mit `ausbewegt()` auch fließende Teile ans Ziel; Suiten fragen die
  Feder (`el._fluss`) statt Keyframes. Die Suite `ruckler` entfällt, `fluessig` prüft
  ohne Reiter.
- Bewegung aus (`prefers-reduced-motion`, Einstellung) bleibt, wie sie war: alles steht.
