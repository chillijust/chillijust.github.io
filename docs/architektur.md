# Architektur

Eine Datei, ein Skript, ein Zustand. Dieses Papier beschreibt, wie `index.html` gebaut ist —
es wächst mit jedem Bauabschnitt.

## Aufbau der Datei

| Teil | Inhalt |
| --- | --- |
| `<head>` | Meta für iOS, CSP, App-Symbol (Daten-URI), `theme-color` |
| `<style>` | Schriftblock (generiert), Farbtokens hell/dunkel, Bausteine |
| `<body>` | `#app` mit `#kopf`, `#swNeu`, `#ansicht`; daneben `#menue`, `#meldung`, `#hinweisBlatt`, `#ticketKnopf`, `#ticketBlatt` |
| `<script>` | genau einer, `'use strict'`, ES5-nah |

Im Skript, von oben: Version und Stand · `CHILI_BILD` · Hilfen (`esc`, `ICON`, Datum,
`melden`, Tage) · Zustand und Speicher · Darstellung · Bewegung (Tropfen) · Gewohnheiten
(Rechnung) · Abgewöhnen (Rechnung, Welle) · Termine · Kalender-Export (`.ics`) · Ansichten ·
Sicherung · Tickets · Einstellungen · Menü · Service Worker · Start.

## Zustand

```js
state = {
  schema: 1,
  thema: 'auto',     // 'auto' | 'hell' | 'dunkel'
  kalender: 'woche', // 'woche' | 'monat' — was der Kalender zuletzt zeigte
  gewohnheiten: [{
    id: 'g…',
    name: 'Lesen',                       // höchstens NAME_MAX Zeichen
    rhythmus: { art: 'taeglich' }        // | { art: 'wochentage', tage: [1, 4] }  (0 = Sonntag)
                                         // | { art: 'proWoche', anzahl: 3 }      (1–6)
    angelegt: '2026-10-05',              // Tagesschlüssel, lokale Zeit
    erledigt: ['2026-10-05', …],         // sortiert, einmalig
    archiviert: null,                    // | Tagesschlüssel
    erinnerung: null                     // | 'HH:MM' — nur für den Kalender-Export
  }],
  abgewoehnen: [{
    id: 'a…',
    name: 'Rauchen',
    start: 1791100000000,                // Zeitpunkt in ms — «frei seit» ist eine Dauer
    rueckfaelle: [{ zeit: …, notiz: '' }],  // sortiert, keiner vor dem Start
    draenge: [1791200000000, …],         // gewonnene Dränge
    archiviert: null
  }],
  termine: [{
    id: 't…',
    titel: 'Zahnarzt',                   // höchstens TITEL_MAX Zeichen
    tag: '2026-10-16',                   // der erste Termin einer Reihe
    ganztags: false,
    von: '09:30', bis: '10:15',          // null ganztags; bis darf fehlen, liegt sonst nach von
    wiederholung: 'keine',               // | 'taeglich' | 'woechentlich' | 'monatlich'
    wiederholungBis: null,               // | Tag — nur bei einer Reihe
    vorlauf: 15,                         // Minuten vor dem Beginn, aus VORLAUF_ZEIT / VORLAUF_GANZ, oder null
    ort: '', notiz: ''
  }],
  journal: [{
    woche: '2026-10-05',                 // Montag der Woche, eine Reflexion je Woche
    gut: '', stoerte: '',                // höchstens JOURNAL_MAX Zeichen, nicht beide leer
    zeit: 1791700000000                  // zuletzt geschrieben, oder null
  }],
  welle: null,                           // | { id, start } — die laufende 10-Minuten-Welle
  exportiert: null,                      // | Zeitpunkt in ms — wann zuletzt eine .ics hinausging
  tickets: [{
    id: 'k…',
    art: 'fehler',                       // | 'wunsch'
    titel: '', text: '',                 // höchstens TICKET_TITEL_MAX / TICKET_TEXT_MAX
    ort: 'kalender', grund: '',          // Kennungen aus TICKET_ORTE / TICKET_GRUENDE[art], grund darf leer sein
    erstellt: 1791000000000,             // streng steigend
    stand: '0.8.0 · 2026-10-06',         // APP_VERSION · APP_STAND beim Anlegen
    abgegeben: null                      // | Zeitpunkt in ms — kopiert
  }],
  gesichert: null,                       // | Zeitpunkt in ms — wann zuletzt ein Sicherungscode kopiert wurde
  schwachHinweis: true,                  // der Hinweis ab drei ungefestigten Gewohnheiten
  bewegung: 'auto'                       // | 'aus' — Bewegung reduzieren
}
```

- **Gespeichert sind nur Tage.** Stärke, Serie, «nie zweimal» und die Punkte rechnet
  `auswerten(g, heute)` bei jedem Zeichnen neu (ADR 0002, `.claude/rules/logik.md`).
- **`jetzt()` ist die einzige Uhr**; Tage sind Schlüssel `JJJJ-MM-TT` (`tagSchluessel`,
  `tagPlus`, `wochenAnfang`).
- `gewohnheitLesen()` prüft jede Gewohnheit einzeln; was nicht paßt, fällt weg.
  `lasterLesen()` ebenso fürs Abgewöhnen; eine Welle gilt nur für etwas, das es gibt und
  das nicht archiviert ist.
- **Abgewöhnen** (ADR 0004): `lasterAuswerten(a, nun)` liefert «frei seit», Rekord und
  Stärke; `zeitJetzt()` ist `jetzt()` in Millisekunden. Geändert wird nur über
  `rueckfallEintragen`, `welleBeginnen` und `welleGewonnen`.

- **Termine** (ADR 0006): `terminAm(t, k)` sagt, ob ein Termin an einem Tag liegt,
  `termineAm(k)` liefert sie sortiert (ganztags zuerst, dann Uhrzeit). Monatlich fällt in
  Monaten ohne die Tageszahl aus. `terminLesen()` prüft jeden einzeln.

- **Kalender-Export** (ADR 0009): `kalenderDatei(heute, nun)` schreibt die `.ics` aus
  `exportTermine(heute)` (was heute oder später noch liegt) und `exportGewohnheiten()`
  (laufend, mit Erinnerung) — je ein VEVENT über `terminEreignis` bzw.
  `gewohnheitEreignis`, Zeiten schwebend in der Zeit des Geräts, Zeilen über `icsFalten`.
  Hinaus geht sie über `icsLaden` (Blob, `<a download>`), das `exportiert` setzt;
  Teilen gibt es nicht mehr (ADR 0013).
  Die Kachel zeichnet ihre Wege immer mit, nur verborgen; `exTeileNachziehen()` (aus
  `bindeExport`) vergleicht mit `exTeileZuvor` und läßt Geändertes über `teilTropfen`
  auf- und zugehen. Außerhalb der Exportansicht ist `exTeileZuvor` `null` (ADR 0012).

- **Ein Schlüssel**: `chillinal_v1`. `laden()` liest, `stand(roh)` übernimmt nur bekannte
  Felder mit gültigen Werten und füllt den Rest aus `grundStand()`. Kaputtes JSON, ein
  fremder Wert, ein werfender Speicher — alles ergibt den Grundstand.
- `speichern()` schreibt den ganzen Zustand und meldet ein Scheitern über `melden()`.
- **Neue Felder** bekommen ihren Vorgabewert in `grundStand()` und ihre Prüfung in
  `stand()`. Erst wenn ein vorhandener Stand **anders gelesen** werden muß, steigt das
  Schema — mit neuem Schlüssel und Migration — und die erste Ziffer der Version.

- **Sicherung** (ADR 0020): `sicherungsCode(nun)` schreibt `CHJ1~<pruefsumme>~<base64>` aus dem
  Zustand ohne `tickets` und `welle`, die Tage einer Gewohnheit verdichtet (`tageVerdichten`,
  Feld `e`). `codeLesen(text)` prüft und entfaltet zum Rohstand für `stand()`.
  `standErsetzen(neu)` legt den alten Stand in `rueckgaengig` (nur im Speicher der Seite),
  behält die Tickets und speichert; `sicherungZurueck()` holt ihn wieder. Die Kachel auf der
  Übersicht zeigt `sicherungFaellig()`. Kopiert wird über `kopieren(text, fertig)` —
  Zwischenablage, sonst verborgenes Feld, sonst sieht man den Text.
- **Tickets** (ADR 0020): Das Ticketblatt (`#ticketBlatt`) liegt außerhalb von `#app` und
  überlebt jedes `render()`. `ticketBlattOeffnen(quelle, id, flaeche)` füllt es aus
  `ticketEntwurf` (bleibt beim Zuklappen) und tropft aus der Quelle; `ticketBlattSchliessen`
  fließt zurück, sonst in `#ticketKnopf`. `ticketSichern` legt an oder ändert (dann wieder
  offen) und bestätigt erst, wenn das Blatt angekommen ist. `ticketsAlsText` bündelt;
  `ticketsKopieren` setzt `abgegeben`. Das Blatt steht unten; `ticketTastatur()` hebt es
  über `--tastatur` um die Höhe der Tastatur (`visualViewport`), «Alle Tickets» (`#tkAlle`)
  klappt zu und öffnet die Liste (ADR 0021).

## Render-Zyklus

`render()` zeichnet erst den Kopf (`renderKopf()`), dann die Ansicht: `ANSICHTEN[ansicht]
.zeichnen()` liefert HTML, danach hängt `bindeAnsicht()` die Ereignisse an. Kein Diffing,
keine Teilaktualisierung — eine Ansicht ist schnell genug neu gezeichnet. Danach zieht
`heldNachziehen()` die Höhe der Karte oben weich nach und `wahlenSetzen()` legt die Marken
der Umschalter (ADR 0007).

- **Bewegung legt sich über das Neuzeichnen, sie verzögert es nie** (ADR 0007).
  `zeige()` nimmt vor `render()` die alte Ansicht als Geist (`uebergangVorbereiten`) und
  läßt danach die neue aus dem getippten Element wachsen oder die alte in ihre Herkunft
  schrumpfen (`uebergangAusfuehren`). Woher getippt wurde, merkt sich `tippMerken` (Erfassung
  von `pointerdown` und `click`); `herkunft` hält den Selektor auf dem Dashboard,
  `homeScroll` die Rollposition. Der Tag im Kalender öffnet mit `tropfenFallen`, schließt
  mit `leisteZurueck`.
  Der Hinweis (`hinweisZeigen`/`hinweisSchliessen`) liegt außerhalb von `#app` in
  `#hinweisBlatt` und überlebt darum jedes `render()`. Er tropft über `tropfenAuf` und
  `tropfenZu` wie eine Ansicht (ADR 0013).

- `zeige(name, id)` wechselt die Ansicht; ein unbekannter Name landet beim Dashboard.
  `neu` und `bearbeiten` legen dabei den `entwurf` an; `bearbeiten` ohne gültige `id`
  landet ebenfalls beim Dashboard.
- **Ansichten:** `home` (Dashboard), `neu` (Neue Gewohnheit, mit Umschalter Angewöhnen |
  Abgewöhnen), `bearbeiten` (Gewohnheit: Rückblick, Stand, Formular, Archivieren), `abgewoehnen`
  (Rückblick, Stand, Formular, Rückfälle, Archivieren), `welle` (Drang), `rueckfall`, `journal`, `reflexion`, `terminNeu` und
  `termin` (Formular, Löschen), `export` (Kalender-Export), `einstellungen`, `sicherung`,
  `tickets`. Wer aus `export` eine
  Gewohnheit oder einen Termin öffnet, kommt über `rueckZiel` dorthin zurück — mit dem
  Rückweg wie nach dem Speichern. `termin` braucht eine gültige `id`,
  `terminNeu` nimmt statt dessen einen Tag; beide legen `terminEntwurf` an.
  `journal` (Liste) und `reflexion` (zwei Fragen; `id` ist der Montag, nicht in der
  Zukunft — sonst Dashboard) legen `reflexionEntwurf` an; aus dem Journal geöffnet, führt
  `rueckZiel` dorthin zurück. `lesen` zeigt die Reflexion der Woche `lesenWoche`; zurück
  geht es nach `lesenZurueck`, aus `reflexion` zurück ins Lesen (ADR 0018). Gibt es die
  Woche nicht (mehr), führt `lesen` ins Journal.
  `abgewoehnen` und `rueckfall` brauchen eine gültige `id`, `welle` eine laufende Welle —
  sonst geht es zum Dashboard.
- **Der Takt:** `takt()` läuft jede Sekunde und schreibt «frei seit» (`[data-frei]`), die
  Restzeit auf dem Drang-Knopf (`[data-wellerest]`) und den Ring der Welle an Ort und
  Stelle. Neu gezeichnet wird nur, wenn die Welle durch ist.
- **Das Formular zeichnet sich beim Wählen nicht neu**: Rhythmus, Tage und Zähler ändern
  `entwurf` und die Knöpfe an Ort und Stelle; gespeichert wird mit dem Knopf.
- **Abhaken** (`[data-haken]`) ändert `erledigt`, speichert und zeichnet neu; die eben
  getippte Kachel trägt dabei `gerade` für ihre Animation. Kacheln bleiben, wo sie sind.
  **Lange drücken** (`langDruecken`, 500 ms) öffnet statt dessen `bearbeiten`; der Klick
  danach ist gesperrt (`langGedrueckt`). Der Punkt des Drucks (`langPunkt`) wird zur Quelle
  des Tropfens (`punktFlaeche`); `herkunftPunkt` merkt ihn relativ zur Kachel für den
  Rückweg (ADR 0020). Ebenso Abgewöhnen-Kacheln und Terminzeilen.
- **Jede Änderung eines Tages** geht über `umschalten(id, tag)` — die Kachel für heute,
  der Kalender (`[data-nachtrag]`) für bis zu `NACHTRAG_TAGE` zurück.
- **Oben steht eine Karte** (`zeichneHeld`, ADR 0005): Tagesring mit Chili und der
  Umschalter Woche | Monat, darunter der Kalender.
- **Kalender** (`zeichneKalender`, `bindeKalender`): `state.kalender` wählt Woche oder
  Monat; was zu sehen ist, halten `kalVersatz` (Wochen bzw. Monate von heute) und `kalTag`
  (der angetippte Tag) — beide nur im Speicher der Seite, nicht in `state`. Jeder Tag trägt
  vorn einen blauen Punkt, wenn er Termine hat, dann einen je Gewohnheit (`kalPunkte`);
  `kalStufe` aus `tagesStand(k)` färbt nur noch die Zahl eines vollen Tags. Die
  Tagesliste (`zeichneTagesleiste`) zeigt Termine, Gewohnheiten und «Termin an diesem
  Tag» (`[data-neutermin]`). `kalZeige(k)` stellt den Kalender auf einen Tag — nach dem
  Speichern eines Termins. Blättern und Umschalten setzen `kalGewechselt` für das
  Einblenden des Rasters.
- **Termine heute** stehen unter der Karte; eine Zeile (`zeichneTerminZeile`,
  `[data-termin]`) öffnet den Termin — auf dem Dashboard wie in der Tagesliste.
- **Ringe** werden mit dem Ziel gezeichnet und tragen in `data-von` den zuletzt gezeigten
  Wert (`ringZuletzt`); `ringeFuellen()` läßt sie nach jedem `render()` herüberlaufen.
- **Journal** (ADR 0017): sonntags setzt `zeichneHome` die Kachel `zeichneReflexionKachel`
  unter die fälligen Gewohnheiten; `[data-reflexion]` öffnet das Formular, `[data-lesen]`
  das Lesen. Geändert wird nur über `reflexionSpeichern` — leer gespeichert entfernt —,
  gelöscht über `reflexionLoeschen`. Eine neue Reflexion wählt ihre Woche mit
  `reflexionWocheWaehlen`, an Ort und Stelle (ADR 0018).
- **Frage** (ADR 0020): `hinweisZeigen(…, { frage: { ja, beiJa } })` zeigt «Abbrechen»
  (`#hinweisNein`) und `ja` (`#hinweisOk`); meldet `beiJa` etwas, wird die Karte an Ort und
  Stelle zur Bestätigung.
- **Bestätigung** (ADR 0018): `bestaetigen()` öffnet den Hinweis mit `bestaetigung`;
  `hinweisUhr` schließt ihn, ein Tipp aufs Blatt früher. Das Ziel darf ein Selektor sein. `wochenZahlen` rechnet die Haken
  der Woche aus `tagesStand`, nichts davon wird gespeichert.
- `visibilitychange` zeichnet das Dashboard und die Welle ganz neu — nach Mitternacht ist es
  ein anderer Tag, nach zehn Minuten im Hintergrund ist die Welle durch.
- Der Kopf hat zwei Gestalten: auf dem Dashboard Titel, Datum, Sonne/Mond, Menüknopf;
  unterwegs Rückweg und Titel.
- **Der Rückweg ist `zurueckGehen()`** — der Knopf ruft ihn, ebenso der Wisch vom linken
  Rand (`wischBeginnen`/`wischEnden` an `document`, passiv; ADR 0016).
- **Die Heatmap** (`zeichneHeatmap`, ADR 0015) hält ihre Wahl in `hm` (`fuer`, `woche`,
  `tag`, dazu `wie` für den Zustand eines Tages). Woche und Tag wechseln an Ort und Stelle
  (`hmWocheWaehlen`, `hmTagZeigen`), ohne `render()`; `zeige()` in eine andere Ansicht
  setzt `hm.fuer` zurück. Den Rahmen um die Woche mißt `hmRahmenSetzen()` am Raster.
- Das Menü klappt unter dem Menüknopf auf (`blattLegen`), über einem Schleier, gezeichnet
  beim Öffnen aus `MENUE`; es quillt als Tropfen aus dem Knopf und fließt zurück. Ein
  Eintrag mit `ziel` öffnet die Ansicht als Tropfen aus dem Eintrag und schließt das Menü
  sofort (`menueSchliessen(true)`), einer ohne meldet «kommt» (ADR 0008).
- **Tropfen** (`tropfenAuf`, `tropfenZu`): Wo die Quelle rund ist (`tropfenQuelle`), läuft
  der Übergang in einer festen Hülle (`.tropfen-huelle`) mit einem Geist darin statt als
  Zoom. Woche | Monat behalten `kalTag`; `kalAnker` und `versatzFuer` wählen, was zu sehen
  ist, `kalFliessen` läßt den Monat aus der Woche quellen und zurück; Kartenhöhe (`heldTakt`) und
  Tagesliste (`leisteGleiten`) laufen dabei im selben `KAL_TAKT`.

## Darstellung

Die Palette steht als CSS-Variablen: hell im `:root`, dunkel zweimal gleich — unter
`@media (prefers-color-scheme: dark)` für `:root:not([data-thema="hell"])` und unter
`:root[data-thema="dunkel"]`. Die Suite `thema` vergleicht beide Wert für Wert.
`themaAnwenden()` setzt nur das Attribut und `theme-color`; ohne Wahl tut das Stylesheet
die Arbeit allein.

## Service Worker

`swAnmelden()` beim Start. Wartet eine neue Fassung und läuft schon eine, erscheint
`#swNeu`; «Jetzt laden» schickt `uebernehmen`, beim Wechsel des Workers lädt die Seite
einmal neu. Die Einstellungen zeigen die gespeicherte Fassung (`swAuskunft()`) und haben
«Nach Aktualisierung suchen» (`swNachsehen()` → `ok` · `kein netz` · `unmoeglich`) und den
Notausgang `swAufraeumen()`.
