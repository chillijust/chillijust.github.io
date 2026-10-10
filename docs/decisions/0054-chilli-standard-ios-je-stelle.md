# 0054 · Chilli ist Standard, iOS-Flüssig je Stelle, Speichern

*2026-10-10 · Planänderung des Nutzers nach 0.17.0T2 · Version 0.17.0T3 · löst in 0053 die
Voreinstellung «iOS 26 im Filter», die eigenen Einstellungen (Grund, Technik, Regler),
«Einstellungen kopieren» und den Filter ab; ändert in 0041 den Aufbau des Timers; ergänzt durch 0055 (Kontrast in Dunkel)*

## Ausgangslage

Seit 0053 lief die ganze App auf der iOS-Feder, voreingestellt im Filter, mit Reglern zum
Feilen, die sofort galten. Am Gerät klappte das nicht wie gewollt: Die Bewegung hakte, am
meisten beim Menü, und Einstellungen waren nicht zu spüren. Der Filter (weich zeichnen,
hart schneiden) rechnet Safari auf dem iPhone teils ohne Grafikchip, Bild für Bild.

## Entscheidung

- **Standard ist die Chilli-Bewegung von 0.15.0**, exakt: Ansicht 416 ms, Menü 338 ms,
  Hinweis 166 ms, feste Kurven, die Wahl-Marke streckt sich über beide, die Haken-Scheibe
  springt — kein Hals, keine Feder, keine Lichtkante.
- **Der Reiter «Flüssig» schaltet je Stelle auf iOS-Flüssig** — neun Stellen: Ansichten,
  Menü, Hinweis, Schalter und Wahl, Tagesmarkierung, Abhaken, Zeilen, Welle, Perle. Ein
  Schalter überschreibt dort die Chilli-Bewegung, fest mit iOS 26 (`FP_IOS`). Jede Stelle
  zeigt ihre Probe, wie sie auf iOS fließt. Kein Hauptschalter, keine Regler.
- **Auf iOS fließt das Teil selbst, wie in seiner Probe** — die Chilli-Bilder laufen dann
  nicht zusätzlich. Menü, Ansichten, Teile und Hinweis (`teilFliesst`): ein runder Tropfen
  löst sich aus der Quelle, wandert, wächst zum Teil; gemalt in einer Schicht unter dem
  beschnittenen Teil, mit dessen Farbe und Schatten (Glas bleibt Glas, die Schicht malt
  dann nur Hals und Schatten). Ist die Quelle fort, quillt er aus einer Perle, die
  leerläuft. Der Knauf eines Schalters fließt gedehnt hinüber (`knaufFliesst`).
  `fliessen` (Marke, Knauf, Abhaken) malt nur Hals und Rest, nie das Teil selbst. In
  0.17.0T3 lief überall die Chilli-Bewegung, und das Flüssige lag als zweites Bild
  darunter — am Gerät sah das aus wie zwei Teile übereinander, mit doppeltem Schatten.
- **Jede Stelle im Reiter sagt, was sie tut, wie ihre Probe läuft und wie man sie in der
  App testet** («So testest du es»).
- **Pfad statt Filter**, in App und Proben: Formen und Hals als ein Umriß (`clip-path`),
  ein Bruchteil der Rechnung.
- **Entwurf und Speichern.** Die Schalter ändern einen Entwurf (`flEntwurf`); die App
  folgt erst nach «Speichern» (`flSpeichern`, dann `flDauernSetzen`). Die Leiste dafür
  klebt oben, sobald es Ungespeichertes gibt. Wer die Einstellungen ungespeichert
  verläßt, wird im Glas gefragt («Verwerfen»).
- **Drang und Timer zeigen immer Flüssigkeit mit Chili** (`welleFliesst`): Der Pegel sinkt
  mit der Restzeit. Im Standard wiegt die Oberfläche ruhig, ohne Perlen und Lichtkante; mit
  iOS-«Welle» wogt sie, Perlen steigen auf. Der Außenring ist bei beiden ein Drittel so
  dick wie zuvor.
- **Der Timer ist gebaut wie der Drang**: im Ring Flüssigkeit und Chili, die Zeit groß
  darunter, dann Pause, Abbrechen, Fertig (ersetzt «Pause im Ring» aus 0041). Die Chili
  wandert hinüber, solange er offen ist (`chiliImTimer`, `chiliZurueck`) — sie steht
  weiter genau einmal im Dokument.

## Begründung

Der Nutzer will die vertraute Bewegung als Grundlage und iOS-Flüssig gezielt dort, wo es
ihm am Gerät gefällt — und eine Änderung erst übernehmen, wenn er sie bestätigt. Fest
iOS 26 statt Reglern hält es einfach; der Pfad hält es flüssig.

## Folgen

- Was 0.17 auf dem Gerät gemerkt hat (eigene Werte, Regler), fällt beim Laden weg; alles
  startet auf Chilli. `state.fluessig` ist `{ ios: { stelle: true } }`.
- Die Prüfungen auf die festen Dauern aus 0.15.0 gelten wieder (Suite `bewegung`).
