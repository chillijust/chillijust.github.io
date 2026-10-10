# Architektur

Eine Datei, ein Skript, ein Zustand. Hier steht, wie `index.html` gebaut ist und wo man
was findet. Wie sich eine Ansicht im Einzelnen verhält, steht im ADR und in der Suite.
**Nur bei Bedarf lesen**, nicht vor jeder Arbeit.

## Aufbau der Datei

| Teil | Inhalt |
| --- | --- |
| `<head>` | Meta für iOS, CSP, App-Symbol (Daten-URI), `theme-color` |
| `<style>` | Schriftblock (generiert), Farbtokens hell/dunkel, Bausteine |
| `<body>` | `#app` mit `#kopf`, `#swNeu`, `#ansicht`; daneben `#menue`, `#meldung`, `#hinweisBlatt`, `#ticketKnopf`, `#ticketBlatt` |
| `<script>` | genau einer, `'use strict'`; oben `var`/`function`, innen modern (ADR 0045) |

Im Skript, von oben: Version und Stand · `CHILI_BILD` · Hilfen (`esc`, `ICON`, Datum,
`melden`, Tage) · Zustand und Speicher · Darstellung · Bewegung · Gewohnheiten ·
Abgewöhnen · Termine · Kalender-Export · Ansichten · Sicherung · Tickets · Einstellungen ·
Menü · Service Worker · Start. Die Abschnitte trennen Kommentarbalken `// ── Name ──`;
`grep -n "^// ── " index.html` zeigt das Inhaltsverzeichnis.

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
    angelegt: '2026-10-05',              // der Beginn, Tagesschlüssel; rückt nur zurück (beginnVorziehen)
    erledigt: ['2026-10-05', …],         // sortiert, einmalig
    archiviert: null,                    // | Tagesschlüssel
    erinnerung: null,                    // | 'HH:MM' — nur für den Kalender-Export
    timer: null,                         // | { minuten: 1–240, stumm } — schließt zaehler aus (ADR 0038)
    zaehler: null,                       // | { schritt: 0,01–1000, einheit: 'L' } (ADR 0040)
    zaehlung: {}                         // Tag → Menge; ein erledigter Tag ohne Eintrag zählt einen Schritt
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
    ort: '', notiz: '',
    erledigt: ['2026-10-16']             // abgehakte Tage, je Tag auch bei einer Reihe (ADR 0041)
  }],
  journal: [{
    woche: '2026-10-05',                 // Montag der Woche, eine Reflexion je Woche
    gut: '', stoerte: '',                // höchstens JOURNAL_MAX Zeichen, nicht beide leer
    zeit: 1791700000000                  // zuletzt geschrieben, oder null
  }],
  welle: null,                           // | { id, start } — die laufende 10-Minuten-Welle
  timer: null,                           // | { id, tag, start, ms, stumm, pausiert } — der laufende Timer, höchstens einer
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
  gefeiert: { 'a…': 1791200000000 },     // Abgewöhnen: der Rückfall, nach dem der neue Rekord gefeiert ist
  exportOhne: { 't:…': true },          // Export: Neues, das bewußt draußen bleibt (ADR 0034)
  schwachHinweis: true,                  // der Hinweis ab drei ungefestigten Gewohnheiten
  bewegung: 'auto',                      // | 'aus' — Bewegung reduzieren
  fluessig: null                         // | { grund, technik, werte, stellen } — die Flüssigprobe (0.16.0T),
                                         //   bis gewählt ist; nicht im Sicherungscode, bleibt beim Einlesen
}
```

## Speicher

- **Ein Schlüssel**: `chillinal_v1`. `laden()` liest, `stand(roh)` übernimmt nur bekannte
  Felder mit gültigen Werten und füllt den Rest aus `grundStand()`. Kaputtes JSON, ein
  fremder Wert, ein werfender Speicher — alles ergibt den Grundstand. War dabei etwas
  da, das sich nicht lesen ließ, setzt `speicherUnlesbar()` die `speicherSperre`; dann
  schreibt `speichern()` nichts, bis der Nutzer neu anfängt (ADR 0049). `gewohnheitLesen()`,
  `lasterLesen()` und `terminLesen()` prüfen je einen Eintrag; was nicht paßt, fällt weg.
- `speichern()` schreibt den ganzen Zustand und meldet ein Scheitern über `melden()`.
  Die Abhak-Wege (`umschalten`, `zaehlen`, `terminAbhaken`) nehmen ihre Änderung dann
  zurück (ADR 0049).
- **Neue Felder**: Vorgabe in `grundStand()`, Prüfung in `stand()`. Erst wenn ein
  vorhandener Stand **anders gelesen** werden muß, steigt das Schema — mit neuem Schlüssel
  und Migration — und die erste Ziffer der Version.
- **Gespeichert sind nur Tatsachen** (Tage, Zeitpunkte). Stärke, Serie, Rekord rechnen
  `auswerten(g, heute)` und `lasterAuswerten(a, nun)` bei jedem Zeichnen neu.
- Nur im Speicher der Seite, nie in `state`: `kalVersatz`, `kalTag`, `hm`, `entwurf`,
  `terminEntwurf`, `reflexionEntwurf`, `ticketEntwurf`, `rueckgaengig`.

## Render-Zyklus

- `zeige(name, id)` wechselt die Ansicht; ein unbekannter Name oder eine ungültige `id`
  landet beim Dashboard.
- `render()` zeichnet den Kopf (`renderKopf()`), dann die Ansicht:
  `ANSICHTEN[ansicht].zeichnen()` liefert HTML, danach hängt `bindeAnsicht()` die
  Ereignisse an. Kein Diffing — eine Ansicht ist schnell genug ganz neu gezeichnet.
  Danach `heldNachziehen()` (Höhe der Karte oben), `wahlenSetzen()` (Marken der
  Umschalter), `ringeFuellen()` (Ringe laufen vom alten Wert herüber).
- **Bewegung legt sich über das Neuzeichnen, sie verzögert es nie** (ADR 0007):
  `uebergangVorbereiten` nimmt die alte Ansicht als Geist, `uebergangAusfuehren` läßt die
  neue aus dem Getippten wachsen (`tippMerken`).
- **Was `render()` überlebt**, liegt außerhalb von `#app`: Hinweis (`#hinweisBlatt`),
  Menü (`#menue`), Ticketblatt (`#ticketBlatt`).
- **Was sich an Ort und Stelle ändert, ohne `render()`**: der Sekundentakt `takt()`
  («frei seit», Welle, Timer), das Formular beim Wählen, Heatmap-Woche und -Tag.
- `visibilitychange` zeichnet neu — nach Mitternacht ist ein anderer Tag, nach zehn
  Minuten im Hintergrund ist die Welle durch.

## Wegweiser

| Bereich | Einstieg |
| --- | --- |
| Ansichten, Rückweg | `zeige`, `ANSICHTEN`, `bindeAnsicht`, `zurueckGehen`, `rueckZiel` |
| Dashboard, Karte oben | `zeichneHome`, `zeichneHeld`, `tagesStand` |
| Gewohnheiten | `auswerten`, `umschalten`, `umschaltenUndZeichnen`, `beginnVorziehen`, `zeichneFormular`, `bindeFormular`, `entwurfSpeichern` |
| Timer, Zähler | `timerOeffnen`, `timerPause`, `timerRest`, `zaehlen`, `zaehlStand` |
| Abgewöhnen, Welle | `lasterAuswerten`, `rueckfallEintragen`, `welleBeginnen`, `welleGewonnen`, `welleAbbrechen` |
| Termine | `terminAm`, `termineAm`, `terminAbhaken`, `zeichneTerminZeile`, `zeichneTerminFormular` |
| Kalender | `zeichneKalender`, `bindeKalender`, `kalZeige`, `kalBlaettern`, `kalFliessen`, `zeichneTagesleiste`; Ziehen: `kalDruck`/`kalZug`/`kalLos`, `kalSetzen`, `kalWechselZeigen` |
| Kalender-Export | `kalenderDatei`, `exportAuswahl`, `exportiertMerken`, `icsLaden`, `zeichneExport`, `bindeExport` |
| Rückblick | `zeichneHeatmap`, `hmWocheWaehlen`, `hmTagZeigen` |
| Journal | `zeichneReflexionKachel`, `reflexionSpeichern`, `reflexionLoeschen` |
| Sicherung | `sicherungsCode`, `codeLesen`, `standErsetzen`, `sicherungZurueck`, `kopieren` |
| Tickets | `ticketBlattOeffnen`, `ticketBlattSchliessen`, `ticketSichern`, `ticketBlattWechseln`, `ticketTastatur` |
| Meldungen, Fragen, Jubel | `melden`, `bestaetigen`, `hinweisZeigen`, `loeschenFragen`, `jubeln`, `hakenJubel`, `rekordFeiern` |
| Bewegung | `tropfenAuf`, `tropfenZu`, `teilZeigen`, `teilTropfen`, `geist`, `zeileGeht`, `langDruecken`, `punktFlaeche` |
| Menü | `MENUE`, `menueOeffnen`, `menueSchliessen`, `menueAnker`, `menueMitrollen` |
| Hell/Dunkel | `themaSetzen`, `themaAnwenden` |
| Kaltstart, Schriftzug | `start`, `auftritt`, `auftrittEnde`, `dashboardAuftropfen`, `zeichneMarke` |
| Service Worker | `swAnmelden`, `swNachsehen`, `swAuskunft`, `swAufraeumen`, `perleAuf` |
| Uhr, Tage | `jetzt`, `tagSchluessel`, `tagPlus`, `wochenAnfang` |
