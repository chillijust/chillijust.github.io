# Prüfstand

Die App wird nicht gebaut, hat keine Module und kein Testwerkzeug — sie ist eine
einzelne HTML-Datei. Geprüft wird sie darum so, wie ein Gerät sie sieht: Die
ausgelieferte Datei bekommt ein Skript angehängt, ein kopfloser Browser lädt
sie, das Skript prüft am **echten DOM** und schreibt sein Urteil in den
Seitentitel.

```sh
node tools/pruefstand/lauf.mjs              # alle Suiten
node tools/pruefstand/lauf.mjs thema menue  # nur diese
node tools/pruefstand/lauf.mjs -v           # auch jede grüne Suite einzeln nennen
```

Der Rückgabewert ist 0, wenn alles grün ist, sonst 1. Ein Hook
(`.claude/hooks/vor-dem-push.mjs`) fährt ihn vor jedem `git push` und hält den
Push an, wenn etwas rot ist.

## Aufbau

| | |
| --- | --- |
| `lauf.mjs` | der Läufer |
| `helfer.mjs` | Wege (`WURZEL`, `APP`, `BAU`), Browsersuche, `testseite()`, `suite()` |
| `bild.mjs` | Bildschirmfotos in Handybreite (430 × 932) |
| `suiten/*.mjs` | die Suiten — eine Datei, ein Thema |
| `bau/` | erzeugte Testseiten und Bilder, wegwerfbar (in `.gitignore`) |

Der Läufer liest `suiten/` selbst aus: **Eine neue Datei läuft ab sofort mit.**
Sie muss ihre Seite nach `bau/t-<dateiname>.html` schreiben; tut sie das nicht,
meldet der Läufer das als Fehler statt sie zu übergehen.

| Suite | prüft |
| --- | --- |
| `geruest` | Kopf, leeres Dashboard, Chili, Trefferflächen, Duzen, Emoji, Schriften |
| `thema` | hell/dunkel/automatisch, Schalter, beide dunklen Paletten gleich, Chillingos Speicher unberührt |
| `menue` | Reihenfolge, «bald» gegen Gebautes, Rückweg, Schließen, «Neue Gewohnheit» |
| `speicher` | Lesen, Kaputtes, werfender Speicher |
| `gewohnheiten` | Stärke, Serie, nie zweimal, Anlegen, Abhaken, Bearbeiten, Archiv, Hinweis ab 3, Speicher |
| `kalender` | langer Druck, Woche und Monat, Tönung, Tag antippen, Nachtragen |
| `abgewoehnen` | frei seit, Rekord, Stärke, Speicher, Anlegen, Takt, Rückfall, Welle, Bearbeiten, Duzen |
| `offline` | `sw.js` von außen, App ohne Worker, Hinweis, Knopf, Notausgang |

## Eine Suite schreiben

```js
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('meins', html, String.raw`
frisch();
zeige('einstellungen');
pruefe('A1 der Knopf steht da', !!q('#swKnopf'));
pruefe('A2 jeder Knopf ist groß genug', alle('#app button').every(function (b) {
  return b.getBoundingClientRect().height >= 44;
}));
`);
```

`suite()` stellt bereit: `pruefe(name, bedingung, extra)`, `q()`, `alle()` und
`frisch()` (Menü zu, Grundstand, Dashboard). Gibt der Rumpf ein Promise zurück,
wird erst geurteilt, wenn es erfüllt ist — so lassen sich Schriften
(`document.fonts.ready`) oder ein `setTimeout` der App abwarten.

Das Prüfskript läuft **im Gültigkeitsbereich der App**: `state`, `ANSICHTEN`,
`zeige()`, jede Funktion steht bereit. `String.raw` verhindert, dass Node die
Fluchtzeichen frisst, bevor der Browser sie sieht.

Eine Prüfung **von außen** — etwa an `sw.js`, das unter `file://` nicht läuft —
steht vor dem `suite()`-Aufruf in Node und wirft bei einem Fehler (siehe
`offline.mjs`).

## Regeln, die aus Schaden entstanden sind

Aus Chillingo übernommen, jede einmal teuer bezahlt:

- **Keine Prüfung in einem `if`, dessen Bedingung vom Zufall oder vom Lauftag
  abhängt.** Sie lief mal und mal nicht — und die Zahl der Prüfungen schwankte
  still von Lauf zu Lauf.
- **Die Zahl im Titel ist ein Messwert.** Sinkt sie ohne Grund, ist eine Prüfung
  verschwunden, nicht bestanden.
- **Ein grüner Lauf muss 0 zurückgeben.** Der Vorgänger hängte den Rückgabewert
  an ein `grep`, das bei vollständigem Erfolg nichts fand — und meldete Erfolg
  als Fehlschlag.
- **Nichts einspritzen, was die App selbst setzt.** `bild.mjs` rendert die Datei,
  wie sie ausgeliefert wird.
- **Kein Backtick im Prüfskript**, auch nicht in Kommentaren — es steckt in einem
  `String.raw`-Template.
- **Kein `$&` in einer Ersatz-Zeichenkette.** In `String.replace` sind `$&`,
  `` $` ``, `$'` und `$1` Steuerzeichen. `testseite()` und `suite()` setzen darum
  eine Funktion als Ersatz ein; wer die Seite von Hand zusammenbaut, tritt wieder
  hinein.

Neu mit Chillinal:

- **Was gesucht wird, steht nicht wörtlich im Prüfskript.** Das Skript hängt im
  selben Dokument: Die Emoji-Prüfung fand anfangs die Zeichen in ihrem eigenen
  Suchmuster. Grenzen über `String.fromCharCode`, gelesen wird `#app`.

## Bildschirmfotos

```sh
node tools/pruefstand/bild.mjs             # Dashboard, hell und dunkel
node tools/pruefstand/bild.mjs szenen.mjs  # eigene Szenen
```

Eine Szenendatei gibt ein Objekt zurück — Name auf Skript:

```js
export default {
  'menue': 'themaSetzen("hell"); menueOeffnen();',
  'einst-dunkel': 'themaSetzen("dunkel"); zeige("einstellungen");'
};
```

Als Modul erlaubt `schuss(namen, { ausschnitt: '.willkommen' })` einen Ausschnitt.
Die Überbreite wird bei jedem Bild gemeldet; sie muss 0 sein.
