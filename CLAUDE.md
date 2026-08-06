# Arbeitsanweisung

## Umgang mit mir

Antworte auf Deutsch, sprich mich mit „Sir" an, Sie-Form. Direkt und knapp, proaktiv
Vorschläge machen. Vor Force-Push, Löschen von Dateien und History-Rewrite meine
ausdrückliche Zustimmung einholen. Bei Zielkonflikten zwischen meinen Vorgaben: sag es
mir, statt still eine Seite zu wählen.

## Projekt

**Chillingo** — Web-App zum Russischlernen (Kyrillisch lesen, schreiben, übersetzen) als
**eine einzelne, offline lauffähige HTML-Datei**. Gehostet über GitHub Pages unter
https://chillijust.github.io/. Zielgerät: iPhone 15 Pro Max (iOS 26.5.2), installiert über
„Zum Home-Bildschirm" als PWA im Vollbild.

Einstieg ist **Home**: Empfehlung plus eine Kachel je Übung. Der Begriff ist **Übung**,
nicht «Rubrik». In dieser Reihenfolge:
**Lernsets** (zielgerichtet: die Wörter der nächsten Sätze, schaltet «Übersetzen» frei),
**Freestyle** (freies Vokabeltraining nach Thema, ohne Sperren),
**Tippen** (Eingabequiz mit kyrillischer Tastatur, ab Leitner-Stufe 3),
**Übersetzen** (nur Sätze, deren Wörter sitzen; Form und Richtung steigern sich mit der
Stufe — Kacheln vor Tippen, RU→DE vor DE→RU),
**Buchstaben** (das kyrillische Alphabet — freiwillig, eigener Lernstand, zählt nicht in
Serie und Fortschritt; Einstieg ist das Üben, die Tafel liegt hinter einem eigenen Knopf),
**Grammatik** (warum ein Wort so dasteht — freiwillig, entdecken statt belehren).
Keine Übungen, sondern **im Menü** (runder Knopf, drei Striche): **Bilanz**,
**Sicherung**, **Einstellungen**, **Tickets**. Dazu **Sprachfakten** aus der Faktenkarte oder der
Bilanz. Eine Reiterleiste gibt es nicht — der Kopf trägt unterwegs den Rückweg.

Maskottchen ist die Chili — freigestellt aus `docs/IMG_2942.png` mit
`tools/freistellen.py`, abgelegt als `docs/maskottchen-freigestellt.png`. In der App gibt es sie
genau einmal als `#chiliFigur` in der Hülle `#chiliBuehne`; Ansichten stellen mit
`maskottchen(klasse)` nur einen Platzhalter auf, in den sie umgehängt wird. Nie ein
zweites Mal einbetten, und nie über Scroll-Rechnung positionieren — sie steht im Fluss
(ADR 0012).

## Harte Rahmenbedingungen — nicht verhandelbar

- Kein React, kein JSX, kein Build-Schritt, keine npm-Toolchain im Auslieferungspfad.
- Keine externen Ressourcen: keine CDNs, keine Google Fonts, keine externen Bilder, keine
  API-Aufrufe. Alles inline. Symbole als Inline-SVG über `ICON` — **keine Emoji-Zeichen**,
  iOS rendert sie als farbige Grafik. `tools/pruefen.mjs` bricht darüber ab. Die
  Content-Security-Policy im `<head>` macht die Regel für den Browser erzwingbar; sie
  bleibt drin.
- **Die ausgelieferte Datei ist öffentlich lesbar.** Nie ein Token, ein Passwort oder
  einen Schlüssel hineinschreiben — auch nicht verschleiert, auch nicht «nur zum Testen».
  `pruefen.mjs` sucht nach tokenähnlichem Text und bricht bei **jeder** Fremdadresse ab —
  die Datei verweist nirgendwohin und lädt nichts. Dass die Seite öffentlich ist, ist für
  die Daten belanglos: Lernstand und Tickets liegen im `localStorage` des Geräts, ein
  fremder Besucher sieht seinen eigenen, leeren Speicher.
- Persistenz ausschließlich über `localStorage`, jeder Zugriff in `try/catch`.
- Mobile-first: Touch-Ziele ≥ 44 × 44 px, keine Hover-abhängige Bedienung,
  `-webkit-tap-highlight-color: transparent`, `env(safe-area-inset-*)` für Notch und
  Home-Indicator.
- Dark Mode als Standard, hell über `prefers-color-scheme` — oder ausdrücklich über die
  Einstellung `darstellung` (`data-theme` am `<html>`-Element).
- Die App muss offline funktionieren, nachdem sie einmal geladen wurde.

## Verzeichnisse

```
index.html                die App — genau diese Datei wird ausgeliefert
.nojekyll                 schaltet Jekyll ab, niemals löschen
data/*.json               Lerninhalte, einzige Quelle für Vokabeln/Sätze/Fakten/
                          Tastatur/Buchstaben/Grammatik/Verben/Nomen
tools/build.mjs           /data prüfen und in index.html einbetten (--check = nur prüfen)
tools/pruefen.mjs         Vor-Push-Prüfung von index.html
tools/freistellen.py      Maskottchen aus einem Bild freistellen (ohne Bildbibliothek)
tools/skaliere.py         PNG auf Icon-Größe bringen (ohne Bildbibliothek)
docs/                     Architektur, Datenmodell, Deploy, Entscheidungen (ADRs)
docs/decisions/           kurze ADRs, fortlaufend nummeriert
```

Vor inhaltlicher Arbeit lesen: `docs/architektur.md` (Zustand, Render-Zyklus),
`docs/datenmodell.md` (Format der Inhalte), `docs/deploy.md` (Pages, Cache).

## Konventionen

- **Code-Stil in `index.html`:** ES5-nah — `var`, klassische `function`-Ausdrücke, keine
  Klassen, keine Module, kein `async`, `'use strict'` am Skriptanfang. Bewusst so; neue
  Abschnitte folgen demselben Stil. Zwei Leerzeichen Einrückung, einfache
  Anführungszeichen. Gliederung über Kommentarbalken.
- **Alle Ausgaben durch `esc()`**, Ereignisbehandler nach dem Setzen von `innerHTML`
  anhängen, nie als `onclick`-Attribut.
- **Neue Einstellung:** Vorgabe in `defaultSettings()`, Zeile in `renderEinstellungen()`,
  Abfrage an der wirksamen Stelle. Gespeicherte Stände werden über `mergeState()`
  aufgefüllt — `state.settings` nie als Ganzes aus dem Speicher übernehmen. Die
  Einstellungen sind nach Fragen gegliedert: **Lernweg**, **Abgabe**, **Eingabe**,
  **Darstellung und Ton**. Soll eine geänderte Vorgabe auch bestehende Geräte
  erreichen, den Schlüssel umbenennen — der alte Wert fällt in `mergeState()` weg.
- **Vorlesen nur über `hoerknopf(text, sprache)`** — der Text hängt als `data-say` am
  Knopf, ein einziger Zuhörer auf `#main` bedient alle. Nie einen eigenen Zuhörer je
  Knopf anhängen. Was die Antwort wäre, schweigt bis zur Auflösung.
- **Klang nur über `ton(richtig)`** beziehungsweise `meisterTon(richtig)`. Erzeugt in der
  Web Audio API, nie als Datei, immer in `try/catch`, abschaltbar über die Einstellung
  `ton`. Kein Ablauf darf Ton voraussetzen. **Ein schlafender Kontext heißt `suspended`
  *oder* `interrupted`, und `resume()` ist asynchron** — wer sofort danach Noten plant,
  plant ins Leere (ADR 0026). Auf iOS schweigt Webton außerdem beim Stummschalter, solange
  `navigator.audioSession.type` nicht auf `transient` steht, und ein Kontext gilt erst als
  freigegeben, wenn er **in einer Geste** einmal etwas ausgegeben hat (ADR 0027).
- **Der Datenblock zwischen `DATEN:START` und `DATEN:ENDE` ist generiert.** Inhalte
  ausschließlich in `/data` ändern, danach `node tools/build.mjs`.
- **`APP_STAND` setzt `tools/build.mjs`**, nicht die Hand. Der Wert geht in jedes Ticket
  ein. `--check` vergleicht ohne ihn, sonst wäre die Datei jeden Tag «nicht auf Stand».
- **Ein Entwurf im Meldeblatt überlebt das Zuklappen.** Nur «Abbrechen» wirft ihn weg;
  Ziehen und Danebentippen schließen bloß. Wer das ändert, nimmt dem Blatt seinen Sinn
  (ADR 0025).
- **Tickets liegen in `chillingo_tickets_v1`**, nicht im Lernstand — der Sicherungscode
  soll schlank bleiben. Sie verlassen das Gerät nie von selbst: ein Knopf bündelt sie zu
  einem Text zum Kopieren (ADR 0016).
- **Grammatik ist eine Funktion, kein Fakt** (ADR 0030). Die Karteikarte ist die **Regel**,
  nicht das Wort, und die Aufgabe verlangt ein bekanntes Wort in einer nie gesehenen Form —
  sonst prüft sie Auswendiglernen. Formen rechnet `grammForm()`; sie steht doppelt (App und
  Build) und wird an den vermerkten Formen der Sätze gemessen. **Eine Wortart-Angabe, die
  nur wiederholt, was die Endung sagt, lässt den Build scheitern** — sonst verdeckt die
  Liste die echten Ausnahmen. Dasselbe gilt für `data/verben.json`: **ein Eintrag, der
  dasselbe liefert wie die blanke Regel, bricht den Build ab** (ADR 0031).
- **Erklären und abfragen sind zwei Dinge.** Was sich nicht herleiten lässt, erklärt
  «Wissen» im Satz, aber die Übung fragt nicht danach — belebte männliche Nomen im
  Akkusativ, Verben mit eigenem Stamm (`писать` → `пиш-`), `быть` im Präsens (das es
  nicht gibt: `буду` ist Zukunft), der Ortsfall auf `-у` (`в году`, `в лесу`). Lieber
  schweigen als danebenliegen.
- **Geschlecht und Belebtheit sind zwei Dinge** (ADR 0032). Nie das rohe Kürzel für das
  Geschlecht halten — immer `geschlecht(art)` fragen, sonst gilt `мама` als Ausnahme und
  `мышь` wird zu «мыше». `belebt(art)` sagt, ob ein Lebewesen gemeint ist.
- **Eine richtige Form kann trotzdem Unsinn sein.** «в маме» ist grammatisch tadellos —
  in einer Mutter ist niemand. Wo eine Regel etwas über die Welt voraussetzt und nicht
  nur über die Sprache, nennt der Baustein seine Wörter selbst (bisher nur Präpositiv).
- **Kein Kyrillisch in Versalien-Etiketten** (`.task-label`, `kurz` der Bausteine):
  «в на» liest sich als «B HA». `.cyr` ist von `text-transform` ausgenommen — im
  Datenfeld hilft das aber nicht, dort gehört gar kein Kyrillisch hin.
- **Die Reihenfolge in `data/vokabeln.json` ist der Lehrplan.** Aus ihr und den
  Satzvoraussetzungen bauen sich die Lernsets (`SET_MAX`, `SATZ_STUFE`); Ergänzungen ans
  Ende des passenden Themas.
- **Jeder Satz nennt in `benoetigt` seine Voraussetzungen als Grundformen** («книгу» →
  `книга`). Ein Satz mit unbekanntem Wort lässt den Build scheitern — das Wort gehört
  zuerst in den Lehrplan.
- **Commits:** einer je logischer Änderung, Nachricht auf Deutsch, Betreffzeile im
  Imperativ. Im Rumpf steht, *warum*.
- **Branches:** neue Branches nur auf meine ausdrückliche Ansage. Direkte Arbeit auf
  `main` nur, wenn ich es für den jeweiligen Vorgang freigegeben habe.

## Vor jedem Push

```sh
node tools/build.mjs --check     # /data und index.html synchron
node tools/pruefen.mjs           # DOCTYPE, Front-Matter, externe Ressourcen, JS-Syntax
python3 -m http.server 8000      # lokal in Handybreite ansehen
```

Danach kurz sagen, was sich ändert. Nach dem Push: bestätigen, dass die Live-Seite
tatsächlich aktualisiert wurde — Pages braucht ein bis drei Minuten, der Cache bis zu
zehn.

## Bekannte Fallstricke

- **Jekyll.** Ohne `.nojekyll` rendert Pages Markdown und packt alles in ein
  Theme-Layout — genau der Fehler, der die Seite ursprünglich unbrauchbar machte
  (ADR 0003). Datei nie löschen. Kein YAML-Front-Matter in `index.html`.
- **Fehlendes DOCTYPE.** Ohne `<!DOCTYPE html>` in Zeile 1 rendert Safari im
  Quirks-Mode; Flexbox und Viewport verhalten sich anders. War schon einmal versehentlich
  entfernt.
- **iOS-Quick-Look** (Vorschau aus Dateien/Mail) zeigt HTML anders als Safari und
  speichert nichts dauerhaft. Testen immer in Safari oder in der
  Home-Bildschirm-Verknüpfung.
- **`localStorage`** wirft im privaten Modus und bei vollem Kontingent. Jeder Zugriff in
  `try/catch`; schlägt das Schreiben fehl, Hinweis auf den Sicherungscode zeigen.
  Schlüssel: `russisch_trainer_v1` — Schemawechsel nur mit neuem Schlüssel und Migration.
- **`speechSynthesis`** braucht auf iOS eine Nutzergeste, liefert Stimmen erst
  verzögert und schweigt im Stummschalter-Modus. Nie in einen Ablauf einbauen, der ohne
  Sprachausgabe nicht funktioniert; Aufrufe in `try/catch`.
- **Safari-Cache.** Eine bestehende Home-Bildschirm-Verknüpfung hält ihren eigenen
  Cache. Zeigt sie nach einem Deploy noch den alten Stand: Verknüpfung löschen und neu
  anlegen.
- **Touch-Ziele und `:hover`.** Auf iOS bleibt ein Hover-Zustand nach dem Tippen hängen;
  Zustände deshalb über Klassen setzen, nicht über `:hover`.
- **Neuer Ansichtszustand** (eine Variable, die eine Rubrik zwischen zwei Renderläufen
  hält) gehört in `ansichtenZuruecksetzen()`. Sonst zeigt die Rubrik nach dem
  Wiederherstellen einer Sicherung weiter den alten Stand — genau dieser Fehler war da
  (ADR 0017).
- **Der Sicherungscode führt Inhalte über eine Kennung** (Hash des Textes, sechs
  Zeichen). `tools/build.mjs` bricht ab, wenn zwei Vokabeln, Sätze oder Fakten dieselbe
  tragen; dann einen der Texte ändern.
- **Wort umbenennen** setzt dessen Leitner-Stand zurück — die Kennung ist das russische
  Wort. Themen umzubenennen ist dagegen folgenlos. **Einen Satz umzuformulieren** setzt
  genauso seinen Stand in `satzBox`/`satzSeen` zurück; die Kennung ist der russische Satz.
- **Buchstaben kennen zwei Schwellen** wie Wörter (ADR 0024): «sitzt» ab `SATZ_STUFE`,
  «gemeistert» ab `BOX_MAX`. `abcPool()` fragt nach **gemeistert** — wer das auf «sitzt»
  umstellt, wirft die Buchstaben schon auf Stufe 2 aus der Übung und überspringt damit
  genau den Kachelmodus, der das Können prüft.
- **In «Übersetzen» hängt die Richtung an der Stufe** (ADR 0029), nicht am Zufall — sonst
  käme ein Satz über Losglück auf die Endstufe, ohne je geschrieben worden zu sein. Die
  Richtung steht in `trTask.dir`, nie beim Zeichnen aus `trDir` gelesen.
- **Gemeistert meldet nur der Übergang** auf `BOX_MAX` (ADR 0026). Wer `meisterPruefen()`
  auch beim Auffrischen auslösen lässt, macht aus der Meldung Rauschen.
- **«Tippen» und «Übersetzen» sind zweigeteilt** (ADR 0015): Lernen und Wiederholung.
  Fertig Gelerntes verlässt beide Stapel, bis die Frist `auffrischen` um ist. Wer dort
  etwas ändert, muss beide Stapel und die drei Leerzustände mitdenken — «noch nichts
  freigeschaltet», «alles gelernt», «gerade nichts fällig» fühlen sich verschieden an
  und sagen Verschiedenes.

## Offen

- Service Worker und Manifest stehen im Zielkonflikt mit der Ein-Datei-Vorgabe
  (ADR 0001). Bewusst unentschieden — vor einer Umsetzung mit mir klären.
- `apple-mobile-web-app-capable` gilt als veraltet zugunsten von
  `mobile-web-app-capable`. Safari braucht weiterhin die alte Variante; beide zu setzen
  wäre die saubere Lösung, ist aber noch nicht umgesetzt.
- Eigene Skills unter `.claude/skills/` (github-pages, ios-webapp,
  vanilla-app-architecture, offline-pwa, lerninhalt-pflege) sind vorgesehen, aber noch
  nicht angelegt — siehe `docs/uebergabe-prompt.md`.
