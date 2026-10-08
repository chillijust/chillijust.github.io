# 0005 · Kopfbereich als Statusanzeige, Symbole als Inline-SVG

**Status:** angenommen · 2026-08-01

## Kontext

Der Kopf trug nur den Titel „Russisch". Rechts daneben standen zwei Elemente ohne
erkennbaren Zusammenhang: ein Zahnrad als Emoji-Zeichen (`⚙`, U+2699), das iOS als
farbige Grafik rendert und das neben der einfarbigen, serifenbetonten Gestaltung wie
aufgeklebt wirkte, und ein grüner Punkt für „gespeichert", der sich ohne Beschriftung
niemandem erschließt. Links viel Luft, rechts zwei Fremdkörper.

## Entscheidung

1. **Der Kopf zeigt Fortschritt.** Unter dem Titel eine haarfeine Leiste mit goldener
   Füllung — Anteil gemeisterter Wörter — und darunter „47 von 311 gemeistert · Serie 6".
   Die Daten liegen ohnehin im Zustand; sie hier zu zeigen kostet nichts und macht aus
   toter Fläche eine Antwort auf „wo stehe ich?".
2. **Der Speicherstatus wird flüchtig.** „✓ gespeichert" erscheint nach dem Schreiben und
   verblasst nach zwei Sekunden. Fehler bleiben stehen, samt Hinweis auf den
   Sicherungscode.
3. **Alle Symbole sind Inline-SVG** (`ICON` im Skript), einfarbig über `currentColor`.
   `tools/pruefen.mjs` bricht ab, sobald ein Zeichen aus dem Emoji-Bereich in
   `index.html` auftaucht.
4. **Einstellungen hängen an einem Reglerknopf**, nicht an einem fünften Reiter. Als
   Symbol dienen Schieberegler statt eines Zahnrads: Ein Zahnrad zerfällt als Umriss bei
   20 px zu einem Stern, Schieberegler bleiben eindeutig — und treffen die Sache, weil
   der Bereich aus Schaltern besteht.

Dazu Feinschliff, der die Teile zusammenbindet: flacher Radialverlauf hinter dem Kopf,
Lichtkante und weicher Schatten auf den Karten, mitlaufende Tab-Leiste beim Scrollen,
Haken und Kreuz vor den Rückmeldungen.

## Begründung

Ein dauerhafter grüner Punkt trainiert das Auge darauf, ihn zu übersehen — genau dann
fällt der Fehlerfall nicht mehr auf. Eine Meldung, die nur bei Ereignis erscheint, ist
im Normalfall unsichtbar und im Fehlerfall auffällig.

Emoji sind der einzige Teil der Oberfläche, dessen Aussehen das Betriebssystem bestimmt.
In einer App, die bewusst eine eigene Anmutung hat, ist das ein Bruch — und über die
Prüfung im Werkzeug bleibt es einer.

## Folgen

- `updateKopf()` läuft bei jedem `render()` mit; es zählt über alle Vokabeln. Bei der
  aktuellen Größenordnung (311) ist das belanglos; bei fünfstelligen Beständen wäre der
  Zähler zwischenzuspeichern.
- Die klebende Tab-Leiste braucht die Abdeckung über sich (`nav::before`), sonst blitzt
  gescrollter Inhalt im Bereich der Notch durch.
- Neue Symbole gehören in `ICON` und nirgendwo sonst hin.
