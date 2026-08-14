# 0052 · Was die App über sich selbst weiß

**Stand:** angenommen · 2026-08-13 · Etappe 1 der Umstellung

## Ausgangslage

Die App verspricht drei Dinge, über die sie nichts sagen konnte: Sie läuft offline, sie
behält den Fortschritt, und sie misst das Lernen. Alle drei stimmten ungefähr, und
niemand konnte es nachsehen.

- **Offline** hing am Browser-Cache und wurde nie angezeigt. Wer im Zug übte, konnte nur
  hoffen.
- **Der Fortschritt** liegt allein auf dem Gerät. Safari räumt Website-Daten nach etwa
  einer Woche ohne Nutzung weg; ausgenommen ist nur, was zum Home-Bildschirm hinzugefügt
  wurde. Die App hat nie darum gebeten, verschont zu werden, und nie erinnert, dass es
  einen Sicherungscode gibt.
- **Der Lernstand** kannte nur richtig und falsch. Ob eine Antwort in einer Sekunde kam
  oder in acht, war nirgends festgehalten — dabei ist genau das der Unterschied zwischen
  *gewusst* und *abrufbar*.

## Entscheidung

**Vier Auskünfte, alle klein, alle unaufdringlich.**

1. **`navigator.storage.persist()` beim Start**, in `try/catch`. Ein Antrag, kein Anspruch:
   Der Browser darf ablehnen, und dann passiert eben nichts.
2. **Eine Offline-Anzeige im Kopf** — dort, wo sonst «gespeichert» erscheint. Sie ist
   ruhig gestaltet, weil Offline bei dieser App kein Fehler ist, sondern der gedachte
   Normalfall.
3. **Eine Erinnerung an die Sicherung** in der Bilanz, wenn seit 30 Tagen keine erzeugt
   wurde — aber erst ab 60 beantworteten Aufgaben. Eine Zeile, kein Blatt.
4. **Tempo je Übung** (`state.tempo`): Zeit vom fertigen Aufbau der Aufgabe bis zur
   Abgabe, gemittelt. Angezeigt in der Bilanz, sobald genug gemessen wurde.

Dazu die Höhenangabe: `min-height` steht dreifach — `100vh` als Rückfall, dann `100svh`,
dann `100dvh`. Auf iOS rechnet `100vh` eine Adressleiste mit, die im Vollbild gar nicht
da ist.

## Begründung

**Die Uhr steht in den Aufgabenbauern, nicht im Renderlauf.** Eine Ansicht wird auch neu
gezeichnet, wenn nur die Tastatur aufklappt oder ein Filter wechselt. Die Uhr dort zu
stellen hieße, jede Nachdenkpause zu verschenken — gemessen würde dann nicht das Denken,
sondern das Tippen. Sie wird darum in `uebNext()`, `buildTransTask()`, `abcFrageBauen()`,
`gramFrageBauen()`, `ptFrageBauen()` und beim Wortwechsel in «Tippen» gestellt und in den
vier Wertungstrichtern (`updateBox`, `satzUpdate`, `abcUpdate`, `gramUpdate`) abgelesen.
**In `ansichtenZuruecksetzen()` wird sie ausdrücklich angehalten** — Zurücksetzen ist
keine Aufgabe.

**Ausreißer fliegen raus.** Unter 200 ms war es kein Nachdenken, über zwei Minuten keine
Antwort, sondern eine Pause. Solche Werte verderben einen Schnitt für immer, weil er nie
wieder sinkt.

**Der Schnitt schweigt unter fünf Messungen.** Eine Zahl aus drei Antworten ist Rauschen,
sieht aber aus wie eine Erkenntnis.

**Erzeugt zählt als gesichert.** Ob der Code danach wirklich irgendwo landet, kann die App
nicht wissen. Öfter zu erinnern als nötig wäre lästiger als einmal zu wenig.

**Erst ab 60 Antworten.** Wer zehn Wörter gelernt hat, hat nichts zu verlieren, und eine
Warnung ohne Verlustrisiko lehrt nur, Warnungen zu übersehen.

## Folgen

- Zwei neue Zustandsfelder: `state.gesichertAm` (0 = nie) und `state.tempo` ({ Übung →
  { n, ms } }).
- **Beide stehen nicht im Sicherungscode.** Sie gehören zum Gerät, nicht zum Lernstand:
  Ein eingespielter Code, der ein Tempo mitbrächte, behauptete eine Geschwindigkeit, die
  jemand anders gebraucht hat.
- Das Tempo ist ausdrücklich **kein** Lernstand und steuert nichts. Es ist die Vorarbeit
  für eine spätere Planung, die Latenz berücksichtigen könnte (`GAP.md` §2.2) — und es
  sammelt ab jetzt die Daten, die eine solche Umstellung überhaupt erst kalibrierbar
  machen.
- Neue Suite `robust`: Speicherantrag (gestellt, werfend, fehlend), Offline-Anzeige,
  Erinnerungsfrist von beiden Seiten, Uhr in allen Übungen, Ausreißer, und dass beides
  den Sicherungscode nicht erreicht.
- **Nebenbefund im Prüfstand, mitrepariert:** Eine Suite, die beim Bauen `process.exit(1)`
  ruft, beendet den **Läufer** — ohne Ausgabe, ohne Grund, ohne die Zeile darüber. Genau
  das passierte beim ersten Lauf von `robust`. `robust` und `maskottchen` werfen jetzt
  statt auszusteigen; der Läufer fängt das ab und zeigt die Begründung.
