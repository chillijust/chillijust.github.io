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

// «laenge» darf eine Zahl sein oder [mindestens, höchstens].
const pruefeTupel = (wo, tupel, laenge) => {
  const [min, max] = Array.isArray(laenge) ? laenge : [laenge, laenge];
  if (!Array.isArray(tupel) || tupel.length < min || tupel.length > max) {
    meckern(wo + ': erwartet ein Array mit ' +
      (min === max ? min : min + ' bis ' + max) + ' Einträgen');
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
const buchstaben = lies('buchstaben.json').wert;

// ── Wortart und Geschlecht ───────────────────────────────────
// Die Endung der Grundform verrät beides — meistens. Was die Regel liefert,
// steht nirgends in den Daten; nur wo sie danebenliegt, trägt die Vokabel ein
// viertes Feld. So bleibt die Ausnahmeliste kurz und ehrlich (ADR 0030).
//
//   m  männlich · mb  männlich und belebt · w  weiblich · s  sächlich
//   pl nur Mehrzahl · v  Verb · a  Adjektiv · -  keine Formenlehre
const WORTARTEN = ['m', 'mb', 'w', 's', 'pl', 'v', 'a', '-'];

const wortartRegel = (ru) => {
  if (/(ться|ть)$/.test(ru)) return 'v';
  if (/(ый|ий|ой|ая|яя|ое|ее)$/.test(ru)) return 'a';
  if (/[ая]$/.test(ru)) return 'w';
  if (/[оеё]$/.test(ru)) return 's';
  if (/[бвгджзйклмнпрстфхцчшщй]$/.test(ru)) return 'm';
  // -ь ist zweideutig (день männlich, ночь weiblich), -и/-ы meist Mehrzahl.
  return '';
};

const wortart = (w) => (w.length > 3 ? w[3] : '') || wortartRegel(w[0]);

// Vokabeln: [russisch, deutsch, transliteration] plus wahlweise Wortart.
const gesehen = new Map();
for (const [thema, liste] of Object.entries(vokabeln)) {
  if (!Array.isArray(liste) || liste.length === 0) {
    meckern('vokabeln.json » ' + thema + ': leeres Thema');
    continue;
  }
  liste.forEach((w, i) => {
    const wo = 'vokabeln.json » ' + thema + ' #' + (i + 1);
    if (!pruefeTupel(wo, w, [3, 4])) return;
    if (gesehen.has(w[0])) meckern(wo + ': «' + w[0] + '» steht bereits in ' + gesehen.get(w[0]));
    else gesehen.set(w[0], thema);

    const regel = wortartRegel(w[0]);
    if (w.length > 3) {
      if (!WORTARTEN.includes(w[3])) {
        meckern(wo + ': unbekannte Wortart «' + w[3] + '» — erlaubt: ' + WORTARTEN.join(' '));
      } else if (w[3] === regel) {
        // Eine Angabe, die nur wiederholt, was die Endung ohnehin sagt, macht
        // die Liste lang und verdeckt die echten Ausnahmen.
        meckern(wo + ': «' + w[0] + '» trägt «' + w[3] + '», das sagt die Endung schon');
      }
    } else if (!regel) {
      meckern(wo + ': «' + w[0] + '»: die Endung sagt die Wortart nicht — viertes Feld ' +
        'nötig (' + WORTARTEN.join(' ') + ')');
    }
  });
}

// ── Formenmaschine, zweite Fassung ──────────────────────────
// Dieselben Regeln wie in index.html. Sie stehen absichtlich zweimal: Der Build
// muss ohne die App laufen können — und weil beide Fassungen an denselben
// vermerkten Formen gemessen werden, fällt jede Abweichung sofort auf.
const akkusativ = (ru, art) => {
  if (art === 'w') {
    if (/а$/.test(ru)) return ru.slice(0, -1) + 'у';
    if (/я$/.test(ru)) return ru.slice(0, -1) + 'ю';
    return ru;
  }
  if (art === 'mb') return /[йь]$/.test(ru) ? ru.slice(0, -1) + 'я' : ru + 'а';
  return ru;
};
const grammForm = (ru, art, rolle) => (rolle === 'akk' ? akkusativ(ru, art) : null);
const ROLLEN = { akk: 'Akkusativ' };

// Sätze: { ru, de, stufe, benoetigt } — «benoetigt» nennt die Grundformen aus
// dem Lehrplan, die ein Satz voraussetzt. Erst wenn die sitzen, wird er angeboten.
const platz = {};
const wortIndex = {};
Object.values(vokabeln).flat().forEach((w, i) => {
  if (Array.isArray(w)) { platz[w[0]] = i; wortIndex[w[0]] = w; }
});

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

    // «formen» führt gebeugte Wörter auf Grundform und Rolle zurück. Hier fällt
    // die Entscheidung, ob die Grammatik stimmt: Die Maschine muss jede
    // vermerkte Form aus Grundform und Rolle **exakt** nachbauen.
    if (s.formen !== undefined) {
      if (typeof s.formen !== 'object' || Array.isArray(s.formen)) {
        meckern(wo + ': «formen» erwartet ein Objekt Form → [Grundform, Rolle]');
      } else {
        Object.entries(s.formen).forEach(([form, angabe]) => {
          const woF = wo + ' » ' + form;
          if (!Array.isArray(angabe) || angabe.length !== 2) {
            return meckern(woF + ': erwartet [Grundform, Rolle]');
          }
          const [grundform, rolle] = angabe;
          if (typeof s.ru === 'string' && !new RegExp('(^|[^а-яёА-ЯЁ])' + form +
              '([^а-яёА-ЯЁ]|$)').test(s.ru)) {
            meckern(woF + ': steht gar nicht in diesem Satz');
          }
          const eintrag = wortIndex[grundform];
          if (!eintrag) return meckern(woF + ': Grundform «' + grundform + '» fehlt im Lehrplan');
          if (!ROLLEN[rolle]) {
            return meckern(woF + ': unbekannte Rolle «' + rolle + '» — bekannt: ' +
              Object.keys(ROLLEN).join(' '));
          }
          const art = wortart(eintrag);
          const gebaut = grammForm(grundform, art, rolle);
          // Groß-/Kleinschreibung ist Satzsache, nicht Grammatik: «Россию»
          // steht am Satzanfang groß, die Maschine rechnet in Kleinschrift.
          if (gebaut === null) {
            meckern(woF + ': die Maschine kennt die Rolle «' + rolle + '» für Wortart «' + art + '» nicht');
          } else if (gebaut.toLowerCase() !== form.toLowerCase()) {
            meckern(woF + ': die Maschine baut «' + gebaut + '», im Satz steht «' + form + '»');
          }
        });
      }
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

// Buchstaben: [Groß, Klein, Laut, Merkhilfe] — das ganze Alphabet, in seiner
// Reihenfolge, ohne Lücke und ohne Dublette.
if (!Array.isArray(buchstaben) || buchstaben.length !== 33) {
  meckern('buchstaben.json: erwartet genau 33 Einträge, gefunden ' +
    (Array.isArray(buchstaben) ? buchstaben.length : 'keine Liste'));
} else {
  const kleine = new Set();
  buchstaben.forEach((b, i) => {
    const wo = 'buchstaben.json #' + (i + 1);
    if (!pruefeTupel(wo, b, 4)) return;
    if ([...b[0]].length !== 1 || [...b[1]].length !== 1) {
      return meckern(wo + ': Groß- und Kleinform müssen je ein Zeichen sein');
    }
    if (!istKyrillisch(b[1])) return meckern(wo + ': «' + b[1] + '» ist nicht kyrillisch');
    if (b[0].toLowerCase() !== b[1]) meckern(wo + ': «' + b[0] + '» und «' + b[1] + '» gehören nicht zusammen');
    if (kleine.has(b[1])) meckern(wo + ': «' + b[1] + '» kommt mehrfach vor');
    else kleine.add(b[1]);
    if (b[3].length < 20) meckern(wo + ': die Merkhilfe ist zu knapp, um zu helfen');
  });
  // Die Tastatur zeigt dasselbe Alphabet — beide müssen dieselben Zeichen führen.
  const tasten = new Set(tastatur.flat());
  const fehlt = [...kleine].filter((c) => !tasten.has(c));
  if (fehlt.length) meckern('buchstaben.json: auf der Tastatur fehlen ' + fehlt.join(' '));
  const zuviel = [...tasten].filter((c) => !kleine.has(c));
  if (zuviel.length) meckern('tastatur.json: «' + zuviel.join(' ') + '» steht nicht im Alphabet');
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
    const formen = s.formen && Object.keys(s.formen).length
      ? ', formen: { ' + Object.entries(s.formen).map(([f, a]) =>
          jsStr(f) + ': [' + a.map(jsStr).join(', ') + ']').join(', ') + ' }'
      : '';
    zeilen.push('  { ru: ' + jsStr(s.ru) + ', de: ' + jsStr(s.de) + ', stufe: ' + s.stufe +
      ', benoetigt: [' + s.benoetigt.map(jsStr).join(', ') + ']' + formen + ' }' +
      (i < liste.length - 1 ? ',' : ''));
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
  '',
  listenBlock('ALPHABET', buchstaben, true),
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
    const formen = s.formen && Object.keys(s.formen).length ? s.formen : null;
    zeilen.push('    "benoetigt": [' + s.benoetigt.map(jsonStr).join(', ') + ']' +
      (formen ? ',' : ''));
    if (formen) {
      zeilen.push('    "formen": {');
      const paare = Object.entries(formen);
      paare.forEach(([form, a], k) => {
        zeilen.push('      ' + jsonStr(form) + ': [' + a.map(jsonStr).join(', ') + ']' +
          (k < paare.length - 1 ? ',' : ''));
      });
      zeilen.push('    }');
    }
    zeilen.push('  }' + (i < liste.length - 1 ? ',' : ''));
  });
  zeilen.push(']');
  return zeilen.join('\n') + '\n';
};

const dateien = [
  ['data/vokabeln.json', jsonObjekt(vokabeln)],
  ['data/saetze.json', jsonSaetze(saetze)],
  ['data/fakten.json', jsonListe(fakten, false)],
  ['data/tastatur.json', jsonListe(tastatur, true)],
  ['data/buchstaben.json', jsonListe(buchstaben, true)]
];

// ── Kennungen für den Sicherungscode ────────────────────────
// Der Code führt Wörter, Sätze und Fakten über eine sechsstellige Kennung —
// den Hash ihres Textes, nicht ihre Position. Zwei gleiche Kennungen würden
// zwei Stände vermischen. Die Wahrscheinlichkeit ist winzig, die Folge wäre
// still und nicht behebbar; darum wird sie hier ausgeschlossen statt gehofft.
const kennung = (text) => {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36).padStart(6, '0').slice(-6);
};
for (const [was, texte] of [
  ['Vokabeln', Object.values(vokabeln).flat().map((v) => v[0])],
  ['Sätze', saetze.map((s) => s.ru)],
  ['Fakten', fakten],
  ['Buchstaben', buchstaben.map((b) => b[1])]
]) {
  const gesehen = new Map();
  for (const t of texte) {
    const k = kennung(t);
    if (gesehen.has(k)) {
      meckern(was + ': «' + gesehen.get(k) + '» und «' + t + '» teilen die Kennung ' + k +
        ' — im Sicherungscode wären ihre Stände nicht zu trennen. Einen der beiden Texte ändern.');
    }
    gesehen.set(k, t);
  }
}

if (fehler.length) {
  console.error('Prüfung fehlgeschlagen:\n' + fehler.map((f) => '  · ' + f).join('\n'));
  process.exit(1);
}

// ── Schreiben oder vergleichen ──────────────────────────────
const html = readFileSync(HTML, 'utf8');
const von = html.indexOf(START);
const bis = html.indexOf(ENDE);
if (von === -1 || bis === -1 || bis < von) {
  console.error('index.html: Datenmarker nicht gefunden. Erwartet werden die Zeilen\n  ' + START + '\n  ' + ENDE);
  process.exit(1);
}
// Der Stand landet in jedem Ticket, das aus der App kommt. Er wird hier
// mitgeschrieben, damit ihn niemand von Hand pflegen muss.
const heute = new Date().toISOString().slice(0, 10);
const stempeln = (t) => t.replace(/var APP_STAND = '[^']*';/, "var APP_STAND = '" + heute + "';");

const neu = stempeln(html.slice(0, von) + block + html.slice(bis + ENDE.length));

if (!/var APP_STAND = '\d{4}-\d{2}-\d{2}';/.test(neu)) {
  console.error('index.html: APP_STAND nicht gefunden — der Stand kann nicht gestempelt werden.');
  process.exit(1);
}

// Der Stand allein ist kein Grund, «nicht auf Stand» zu melden: er ändert sich
// jeden Tag von selbst. Verglichen wird darum ohne ihn.
const ohneStand = (t) => t.replace(/var APP_STAND = '[^']*';/, '');
const abweichungen = [];
if (ohneStand(neu) !== ohneStand(html)) abweichungen.push('index.html');
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
  ' · Fakten ' + fakten.length + ' · Tasten ' + tastatur.flat().length +
  ' · Buchstaben ' + buchstaben.length);
