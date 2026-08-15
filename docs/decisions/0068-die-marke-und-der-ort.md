# 0068 · Die Schreibmarke gehört ins Feld, der Ort überlebt das Update

**Stand:** angenommen · 2026-08-15 · aus drei Tickets
**Ergänzt:** ADR 0059/0062 (der Service Worker), ADR 0067 (die Blase)

## 1 · Der Rand der Blase wird schmaler

ADR 0067 gab der Sprechblase zwei Pixel in der Akzentfarbe. Zwei sind zu viel: Jeder
Knopf der App trägt einen Pixel, und ein doppelt so dicker Rahmen ließ die Blase wichtiger
aussehen, als sie ist. **Die Farbe trägt die Sichtbarkeit, nicht die Dicke.** Ein Pixel,
und der Zipfel entsprechend nachgeführt — sein unteres Dreieck ist einen Pixel schmaler
und einen tiefer gesetzt, damit genau die Randstärke stehenbleibt.

## 2 · Die Schreibmarke fehlte

**Befund:** Beim Schreiben über die eingebaute Tastatur fehlt im Eingabefeld das blinkende
Element, das zeigt, wo man im Text steht.

**Ursache:** Jede Taste setzte den Wert des Feldes (`inp.value = tEingabe`) — mehr nicht.
Das Feld bekam **nie den Fokus**, und ohne Fokus blinkt keine Marke. Man schrieb in etwas
hinein, das aussah wie ein Feld, aber keins war.

**Warum das nicht einfach mit `focus()` zu beheben war:** Auf iOS klappt ein fokussiertes
Textfeld die **Geräte**tastatur auf — und genau die soll die eingebaute ersetzen. Der
naheliegende Griff hätte das Problem gegen ein größeres getauscht.

**Entscheidung:** `inputmode="none"`. Das Attribut sagt dem Browser, dass er zu diesem
Feld keine Tastatur einblenden soll; das Feld bleibt ein Feld, mit Fokus, Marke und
Auswahl. Es steht **nur dort, wo die eingebaute Tastatur wirklich offen ist**
(`kbFeldAttr(kbOffen)`) — ist sie zu, muss die Gerätetastatur aufgehen dürfen.

Geschrieben wird über einen Helfer, `feldSchreiben(id, text)`, der drei Dinge auf einmal
tut: Wert setzen, fokussieren (mit `preventScroll` — sonst springt die Seite bei jedem
Tastendruck zum Feld) und die Marke ans Ende setzen. Er steht **einmal** und wird von
allen sechs Schreibfeldern benutzt: Tippen, Übersetzen, Grammatik, Schreibung,
Power-Training und die Nachschrift.

## 3 · Nach dem Update bleibt man, wo man war

**Wunsch:** Die Ladeanzeige soll etwa zwei Sekunden laufen, danach soll die Version
stimmen und der Nutzer im selben Fenster bleiben — kein Sprung zur Übersicht.

**Was nicht geht:** Ohne Neuladen keine neue Fassung. Eine neue Fassung ist neuer
Programmtext; solange die alte Seite läuft, läuft die alte Fassung. Das Neuladen ist
unvermeidlich.

**Was geht — und worum es eigentlich ging:** den *Eindruck* vermeiden, dass dabei etwas
verlorengeht. Zwei Dinge:

**Die Frist.** Der Tausch dauert oft nur Millisekunden, und ein Ring, der aufblitzt und
verschwindet, sieht aus wie ein Fehlgriff. `swNeustart()` wartet, bis `SW_LADEN_MIN`
(2000 ms) seit dem Tippen um ist. Geladen wird **nur** über diesen Weg — ein direktes
`reload()` daneben überspränge Frist und Merker, und die Suite zählt darum nach, dass es
`window.location.reload()` genau einmal gibt.

**Der Ort.** Vor dem Neustart wird gemerkt, wo man stand (`swOrtMerken()`: Ansicht und
Reiter). Beim Start liest `swOrtHolen()` das aus — **vor** dem ersten Zeichnen, damit die
Übersicht nicht kurz aufblitzt — und räumt den Schlüssel weg.

Drei Vorbehalte stecken in `swOrtHolen()`, und alle drei sind nötig:

- **Der Schlüssel wird immer entfernt**, auch wenn er nicht mehr gilt. Sonst führte er
  beim übernächsten Start noch einmal irgendwohin.
- **Er gilt nur eine Minute** (`SW_ORT_FRIST`). Er meint *diesen* Neustart; wer die App
  einen Tag später öffnet, will dahin, wo er immer landet.
- **Eine Ansicht, die es nicht mehr gibt, führt nirgendwohin.** Eine spätere Fassung darf
  eine Rubrik streichen, ohne dass ein alter Merker ins Leere zeigt.

Und der Rückweg: `ansichtStapel` ist nach einem Neustart leer. Wer in den Einstellungen
landet und «Zurück» drückt, käme in eine Sackgasse — der Stapel wird darum mit `home`
vorbelegt (ADR 0036).

## Folgen

- Neu: `feldSchreiben()`, `kbFeldAttr()`, `swNeustart()`, `swOrtMerken()`, `swOrtHolen()`,
  `SW_LADEN_MIN`, `SW_ORT_KEY`, `SW_ORT_FRIST`.
- Sechs Schreibfelder tragen `inputmode="none"`, solange ihre eingebaute Tastatur offen
  ist, und schreiben über den Helfer.
- Neu: Abschnitt Z in `tastatur` (7 Prüfungen), F in `offline` (6) und S21–S23 auf
  Dateiebene.
