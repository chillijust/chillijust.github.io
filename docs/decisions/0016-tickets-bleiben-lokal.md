# 0016 · Tickets bleiben lokal und werden gebündelt kopiert

**Status:** angenommen · 2026-08-02 · ersetzt ADR 0014

## Kontext

ADR 0014 ließ Tickets über eine vorausgefüllte GitHub-Adresse in ein privates Repo
wandern. Das löste die Sicherheitsfrage sauber, brachte aber drei Kosten mit:

- Ein **zweites Repo** musste angelegt und gepflegt werden — für einen Vorgang, der
  ohnehin bei Claude Code endet.
- **Ein Ticket, ein Formular.** Wer über eine Woche fünf Dinge notiert, öffnet fünfmal
  GitHub und schickt fünfmal ab.
- Die Datei trug eine **Fremdadresse**, also eine Ausnahme von einer sonst
  ausnahmslosen Regel.

Der eigentliche Weg ist kürzer: Die Tickets sollen zu mir, nicht zu GitHub.

## Entscheidung

1. **Tickets bleiben im `localStorage`.** Kein Versand, kein Verweis nach außen.
2. **Ein Knopf bündelt alle offenen Tickets** zu einem Markdown-Text, legt ihn in die
   Zwischenablage und zeigt ihn zugleich in einem schreibgeschützten Feld.
3. **Bündeln heißt übergeben:** die betroffenen Tickets bekommen `uebergeben`.
   «Alle kopieren» nimmt auch Übergebene mit, ohne etwas zu ändern; «Übergebene löschen»
   räumt auf.
4. **`erstellt` ist streng steigend**, damit die Nummerierung im Text eindeutig ist.
5. **`tools/pruefen.mjs` erlaubt jetzt gar keine Fremdadresse mehr** — die Ausnahme aus
   ADR 0014 entfällt.

## Begründung

**Der Umweg war einer.** Ein Ticket sollte bei Claude Code landen; GitHub war nur die
Zwischenstation, die den Transport organisiert. Wenn der Nutzer ohnehin selbst
weiterreicht, ist die Zwischenstation Aufwand ohne Ertrag.

**Gebündelt ist besser als einzeln.** Fünf Tickets in einem Text sind ein Auftrag; fünf
Issues sind fünf Vorgänge. Für die Abarbeitung ist der zusammenhängende Text sogar
nützlicher, weil er die Reihenfolge und den gemeinsamen Kontext (Gerät, App-Stand)
mitliefert.

**Die Sicherheitsfrage löst sich auf, statt gelöst zu werden.** Ohne Server gibt es
nichts, worauf ein Fremder zugreifen könnte. Wer die öffentliche Seite besucht, sieht
seinen eigenen, leeren Speicher — er kann weder Tickets lesen noch welche anlegen. Die
ursprüngliche Frage «wie verhindere ich, dass andere Tickets erstellen?» hat damit keinen
Gegenstand mehr.

**Kopieren darf scheitern.** `navigator.clipboard` braucht einen sicheren Kontext und
eine Nutzergeste; beides ist hier gegeben, aber verlassen sollte man sich nicht darauf.
Der Text steht deshalb immer sichtbar da und ist vormarkiert — die Zwischenablage ist
Bequemlichkeit, nicht Voraussetzung.

**Übergeben statt gesendet.** Der Zustand heißt jetzt, was er ist. Ältere Stände werden
beim Einlesen umgeschrieben.

## Folgen

- Das private Repo `chillingo-tickets` wird nicht mehr gebraucht.
- Die App kommt wieder **ganz ohne Aussenverbindung** aus; `pruefen.mjs` schlägt bei
  jeder Fremdadresse fehl, ohne Ausnahmeliste.
- Marken (`bug`, `enhancement`) entfallen — die Art steht in der Überschrift des
  Abschnitts.
- Es gibt keine Längenbegrenzung mehr für den Ticket-Text; das frühere `TICKET_MAX`
  richtete sich nach der Adresslänge und ist gegenstandslos.
- Was übergeben wurde, bleibt sichtbar, bis man es löscht — die Liste ist damit auch ein
  kleines Protokoll.
