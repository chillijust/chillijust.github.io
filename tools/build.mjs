#!/usr/bin/env node
// Bettet die Lerninhalte aus /data in den Datenblock von index.html ein.
//
//   node tools/build.mjs            prüft /data, normiert die Formatierung
//                                   und schreibt den Block in index.html
//   node tools/build.mjs --check    prüft nur; Exit-Code 1, wenn index.html
//                                   oder /data nicht dem Sollstand entsprechen
//
// Reines Autorenwerkzeug — läuft nur lokal, nie im Auslieferungspfad.
// index.html bleibt jederzeit vollständig und eigenständig.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = join(ROOT, 'index.html');
const START = '/* == DATEN:START — generiert aus /data durch tools/build.mjs, nicht von Hand ändern == */';
const ENDE = '/* == DATEN:ENDE == */';

const nurPruefen = process.argv.includes('--check');
const fehler = [];
const meckern = (msg) => fehler.push(msg);

// ── Zeichenketten ───────────────────────────────────────────
// Kombinierende und unsichtbare Zeichen werden escaped, damit sie im Quelltext
// sichtbar bleiben (z. B. das Betonungszeichen U+0301 in den Sprachfakten).
const versteckt = (c) => {
  const n = c.codePointAt(0);
  return n < 0x20 || (n >= 0x300 && n <= 0x36f) || (n >= 0x200b && n <= 0x200f) ||
    n === 0x00a0 || n === 0xfeff || n === 0x2028 || n === 0x2029;
};
const escape = (s) => [...s].map((c) => versteckt(c)
  ? '\\u' + c.codePointAt(0).toString(16).padStart(4, '0')
  : c).join('');

const jsStr = (s) => "'" + escape(s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")) + "'";
const jsonStr = (s) => '"' + escape(s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')) + '"';

// ── Einlesen und prüfen ─────────────────────────────────────
const lies = (name) => {
  const pfad = join(ROOT, 'data', name);
  try {
    return { pfad, wert: JSON.parse(readFileSync(pfad, 'utf8')) };
  } catch (e) {
    console.error('data/' + name + ' ist nicht lesbar: ' + e.message);
    process.exit(1);
  }
};

const istKyrillisch = (s) => /[Ѐ-ӿ]/.test(s);

const pruefeTupel = (wo, tupel, laenge) => {
  if (!Array.isArray(tupel) || tupel.length !== laenge) {
    meckern(wo + ': erwartet ein Array mit ' + laenge + ' Einträgen');
    return false;
  }
  let ok = true;
  tupel.forEach((feld, i) => {
    if (typeof feld !== 'string' || feld === '') {
      meckern(wo + ' [' + i + ']: leeres oder nicht-textliches Feld');
      ok = false;
    } else if (feld !== feld.trim()) {
      meckern(wo + ' [' + i + ']: führende oder folgende Leerzeichen');
      ok = false;
    }
  });
  if (ok && !istKyrillisch(tupel[0])) meckern(wo + ': erstes Feld enthält kein Kyrillisch');
  return ok;
};

const vokabeln = lies('vokabeln.json').wert;
const saetze = lies('saetze.json').wert;
const fakten = lies('fakten.json').wert;
const tastatur = lies('tastatur.json').wert;

// Vokabeln: [russisch, deutsch, transliteration], keine Dubletten über alle Themen
const gesehen = new Map();
for (const [thema, liste] of Object.entries(vokabeln)) {
  if (!Array.isArray(liste) || liste.length === 0) {
    meckern('vokabeln.json » ' + thema + ': leeres Thema');
    continue;
  }
  liste.forEach((w, i) => {
    const wo = 'vokabeln.json » ' + thema + ' #' + (i + 1);
    if (!pruefeTupel(wo, w, 3)) return;
    if (gesehen.has(w[0])) meckern(wo + ': «' + w[0] + '» steht bereits in ' + gesehen.get(w[0]));
    else gesehen.set(w[0], thema);
  });
}

// Sätze: { ru, de, stufe, benoetigt } — «benoetigt» nennt die Grundformen aus
// dem Lehrplan, die ein Satz voraussetzt. Erst wenn die sitzen, wird er angeboten.
const platz = {};
Object.values(vokabeln).flat().forEach((w, i) => { if (Array.isArray(w)) platz[w[0]] = i; });

if (!Array.isArray(saetze) || saetze.length === 0) {
  meckern('saetze.json: erwartet eine nicht-leere Liste von Sätzen');
} else {
  const gesehen = new Set();
  const stufen = new Set();
  saetze.forEach((s, i) => {
    const wo = 'saetze.json #' + (i + 1);
    if (!s || typeof s !== 'object' || Array.isArray(s)) return meckern(wo + ': erwartet ein Objekt');
    ['ru', 'de'].forEach((feld) => {
      if (typeof s[feld] !== 'string' || s[feld] === '') meckern(wo + ': «' + feld + '» fehlt oder ist leer');
      else if (s[feld] !== s[feld].trim()) meckern(wo + ': «' + feld + '» hat Leerzeichen am Rand');
    });
    if (typeof s.ru === 'string') {
      if (!istKyrillisch(s.ru)) meckern(wo + ': «ru» enthält kein Kyrillisch');
      if (gesehen.has(s.ru)) meckern(wo + ': Dublette «' + s.ru + '»');
      gesehen.add(s.ru);
    }
    if (!Number.isInteger(s.stufe) || s.stufe < 1) meckern(wo + ': «stufe» muss eine ganze Zahl ab 1 sein');
    else stufen.add(s.stufe);
    if (!Array.isArray(s.benoetigt) || s.benoetigt.length === 0) {
      meckern(wo + ': «benoetigt» muss die vorausgesetzten Grundformen nennen');
    } else {
      s.benoetigt.forEach((w) => {
        if (platz[w] === undefined) meckern(wo + ': «' + w + '» steht nicht in vokabeln.json');
      });
      if (new Set(s.benoetigt).size !== s.benoetigt.length) meckern(wo + ': doppelte Voraussetzung');
    }
  });
  const liste = [...stufen].sort((a, b) => a - b);
  liste.forEach((n, i) => {
    if (n !== i + 1) meckern('saetze.json: Stufe ' + (i + 1) + ' fehlt (Stufen müssen lückenlos bei 1 beginnen)');
  });
}

// Fakten: nicht leer, keine Dubletten
if (!Array.isArray(fakten) || fakten.length === 0) meckern('fakten.json: erwartet eine nicht-leere Liste');
else {
  const bekannt = new Set();
  fakten.forEach((f, i) => {
    if (typeof f !== 'string' || f.trim() === '') meckern('fakten.json #' + (i + 1) + ': leerer Eintrag');
    else if (f !== f.trim()) meckern('fakten.json #' + (i + 1) + ': führende oder folgende Leerzeichen');
    else if (bekannt.has(f)) meckern('fakten.json #' + (i + 1) + ': Dublette');
    else bekannt.add(f);
  });
}

// Tastatur: einzelne kyrillische Zeichen, keine Dubletten
if (!Array.isArray(tastatur) || tastatur.length === 0) meckern('tastatur.json: erwartet eine nicht-leere Liste');
else {
  const tasten = new Set();
  tastatur.forEach((reihe, r) => {
    if (!Array.isArray(reihe) || reihe.length === 0) return meckern('tastatur.json Reihe ' + (r + 1) + ': leer');
    reihe.forEach((t) => {
      if (typeof t !== 'string' || [...t].length !== 1 || !istKyrillisch(t)) {
        meckern('tastatur.json Reihe ' + (r + 1) + ': «' + t + '» ist kein einzelnes kyrillisches Zeichen');
      } else if (tasten.has(t)) meckern('tastatur.json: Taste «' + t + '» kommt mehrfach vor');
      else tasten.add(t);
    });
  });
}

if (fehler.length) {
  console.error('Prüfung fehlgeschlagen:\n' + fehler.map((f) => '  · ' + f).join('\n'));
  process.exit(1);
}

// ── Ausgabe erzeugen (deterministisch, ein Eintrag je Zeile) ──
const tupelZeile = (t, einzug) => einzug + '[' + t.map(jsStr).join(', ') + '],';

const objektBlock = (name, obj, schluesselAlsZahl) => {
  const zeilen = ['var ' + name + ' = {'];
  const schluessel = Object.keys(obj);
  schluessel.forEach((k, i) => {
    zeilen.push('  ' + (schluesselAlsZahl ? k : jsStr(k)) + ': [');
    obj[k].forEach((t) => zeilen.push(tupelZeile(t, '    ')));
    zeilen[zeilen.length - 1] = zeilen[zeilen.length - 1].replace(/,$/, '');
    zeilen.push('  ]' + (i < schluessel.length - 1 ? ',' : ''));
  });
  zeilen.push('};');
  return zeilen.join('\n');
};

const listenBlock = (name, liste, alsTupel) => {
  const zeilen = ['var ' + name + ' = ['];
  liste.forEach((e, i) => {
    const komma = i < liste.length - 1 ? ',' : '';
    zeilen.push('  ' + (alsTupel ? '[' + e.map(jsStr).join(', ') + ']' : jsStr(e)) + komma);
  });
  zeilen.push('];');
  return zeilen.join('\n');
};

// Sätze als Liste von Objekten, ein Satz je Zeile.
const satzBlock = (name, liste) => {
  const zeilen = ['var ' + name + ' = ['];
  liste.forEach((s, i) => {
    zeilen.push('  { ru: ' + jsStr(s.ru) + ', de: ' + jsStr(s.de) + ', stufe: ' + s.stufe +
      ', benoetigt: [' + s.benoetigt.map(jsStr).join(', ') + '] }' + (i < liste.length - 1 ? ',' : ''));
  });
  zeilen.push('];');
  return zeilen.join('\n');
};

const block = [
  START,
  objektBlock('VOCAB_THEMES', vokabeln, false),
  '',
  satzBlock('SENTENCES', saetze),
  '',
  listenBlock('FACTS', fakten, false),
  '',
  listenBlock('KB_ROWS', tastatur, true),
  ENDE
].join('\n');

// ── /data kanonisch formatieren (Tupel je eine Zeile) ────────
const jsonObjekt = (obj) => {
  const schluessel = Object.keys(obj);
  const zeilen = ['{'];
  schluessel.forEach((k, i) => {
    zeilen.push('  ' + jsonStr(k) + ': [');
    obj[k].forEach((t, j) => {
      zeilen.push('    [' + t.map(jsonStr).join(', ') + ']' + (j < obj[k].length - 1 ? ',' : ''));
    });
    zeilen.push('  ]' + (i < schluessel.length - 1 ? ',' : ''));
  });
  zeilen.push('}');
  return zeilen.join('\n') + '\n';
};

const jsonListe = (liste, alsTupel) => {
  const zeilen = ['['];
  liste.forEach((e, i) => {
    const komma = i < liste.length - 1 ? ',' : '';
    zeilen.push('  ' + (alsTupel ? '[' + e.map(jsonStr).join(', ') + ']' : jsonStr(e)) + komma);
  });
  zeilen.push(']');
  return zeilen.join('\n') + '\n';
};

const jsonSaetze = (liste) => {
  const zeilen = ['['];
  liste.forEach((s, i) => {
    zeilen.push('  {');
    zeilen.push('    "ru": ' + jsonStr(s.ru) + ',');
    zeilen.push('    "de": ' + jsonStr(s.de) + ',');
    zeilen.push('    "stufe": ' + s.stufe + ',');
    zeilen.push('    "benoetigt": [' + s.benoetigt.map(jsonStr).join(', ') + ']');
    zeilen.push('  }' + (i < liste.length - 1 ? ',' : ''));
  });
  zeilen.push(']');
  return zeilen.join('\n') + '\n';
};

const dateien = [
  ['data/vokabeln.json', jsonObjekt(vokabeln)],
  ['data/saetze.json', jsonSaetze(saetze)],
  ['data/fakten.json', jsonListe(fakten, false)],
  ['data/tastatur.json', jsonListe(tastatur, true)]
];

// ── Schreiben oder vergleichen ──────────────────────────────
const html = readFileSync(HTML, 'utf8');
const von = html.indexOf(START);
const bis = html.indexOf(ENDE);
if (von === -1 || bis === -1 || bis < von) {
  console.error('index.html: Datenmarker nicht gefunden. Erwartet werden die Zeilen\n  ' + START + '\n  ' + ENDE);
  process.exit(1);
}
const neu = html.slice(0, von) + block + html.slice(bis + ENDE.length);

const abweichungen = [];
if (neu !== html) abweichungen.push('index.html');
for (const [pfad, inhalt] of dateien) {
  if (readFileSync(join(ROOT, pfad), 'utf8') !== inhalt) abweichungen.push(pfad);
}

if (nurPruefen) {
  if (abweichungen.length) {
    console.error('Nicht auf Stand: ' + abweichungen.join(', ') + '\nBitte «node tools/build.mjs» ausführen.');
    process.exit(1);
  }
  console.log('Alles auf Stand.');
} else {
  if (neu !== html) writeFileSync(HTML, neu);
  for (const [pfad, inhalt] of dateien) writeFileSync(join(ROOT, pfad), inhalt);
  console.log(abweichungen.length ? 'Aktualisiert: ' + abweichungen.join(', ') : 'Keine Änderung nötig.');
}

const anzahl = (o) => Object.values(o).reduce((n, a) => n + a.length, 0);
const woerter = anzahl(vokabeln);
console.log('Themen ' + Object.keys(vokabeln).length + ' · Vokabeln ' + woerter +
  ' · Päckchen ' + Math.ceil(woerter / 12) +
  ' · Sätze ' + saetze.length + ' in ' + new Set(saetze.map((s) => s.stufe)).size + ' Stufen' +
  ' · Fakten ' + fakten.length + ' · Tasten ' + tastatur.flat().length);
