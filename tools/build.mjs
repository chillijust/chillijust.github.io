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
const grammatik = lies('grammatik.json').wert;
const verben = lies('verben.json').wert;
const nomen = lies('nomen.json').wert;
const kommentare = lies('kommentare.json').wert;
const tutorial = lies('tutorial.json').wert;

// ── Wortart und Geschlecht ───────────────────────────────────
// Die Endung der Grundform verrät beides — meistens. Was die Regel liefert,
// steht nirgends in den Daten; nur wo sie danebenliegt, trägt die Vokabel ein
// viertes Feld. So bleibt die Ausnahmeliste kurz und ehrlich (ADR 0030).
//
//   m  männlich · mb  männlich und belebt · w  weiblich · s  sächlich
//   pl nur Mehrzahl · v  Verb · a  Adjektiv · -  keine Formenlehre
// m männlich · w weiblich · s sächlich, je mit b für belebt (Lebewesen).
// pl nur Mehrzahl · v Verb · a Adjektiv · - keine Formenlehre.
const WORTARTEN = ['m', 'mb', 'w', 'wb', 's', 'sb', 'pl', 'v', 'a', '-'];
const GESCHLECHT_VON = { m: 'm', mb: 'm', w: 'w', wb: 'w', s: 's', sb: 's' };
const geschlecht = (art) => GESCHLECHT_VON[art] || art;
const belebt = (art) => art === 'mb' || art === 'wb' || art === 'sb';

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
  if (geschlecht(art) === 'w') {
    if (/а$/.test(ru)) return ru.slice(0, -1) + 'у';
    if (/я$/.test(ru)) return ru.slice(0, -1) + 'ю';
    return ru;
  }
  if (geschlecht(art) === 'm' && belebt(art)) {
    return /[йь]$/.test(ru) ? ru.slice(0, -1) + 'я' : ru + 'а';
  }
  return ru;
};
const praepositivMit = (ru, art, tab) => {
  const eigen = tab[ru] || null;
  if (eigen && eigen.starr) return ru;
  if (eigen && eigen.praep) return eigen.praep;
  if (/(ия|ий|ие)$/.test(ru)) return ru.slice(0, -1) + 'и';
  if (/ь$/.test(ru)) return ru.slice(0, -1) + (geschlecht(art) === 'w' ? 'и' : 'е');
  if (/е$/.test(ru)) return ru;
  if (/[аяой]$/.test(ru)) return ru.slice(0, -1) + 'е';
  return ru + 'е';
};
const praepositiv = (ru, art) => praepositivMit(ru, art, nomen);
const genitivMit = (ru, art, tab) => {
  const eigen = tab[ru] || null;
  if (eigen && eigen.starr) return ru;
  if (eigen && eigen.gen) return eigen.gen;
  if (/ия$/.test(ru)) return ru.slice(0, -1) + 'и';
  if (/(ий|ие)$/.test(ru)) return ru.slice(0, -2) + 'ия';
  if (/а$/.test(ru)) return ru.slice(0, -1) + (nachZischlaut(ru.slice(0, -1)) ? 'и' : 'ы');
  if (/я$/.test(ru)) return ru.slice(0, -1) + 'и';
  if (/ь$/.test(ru)) return ru.slice(0, -1) + (geschlecht(art) === 'w' ? 'и' : 'я');
  if (/о$/.test(ru)) return ru.slice(0, -1) + 'а';
  // Nach ж ч ш щ ц steht unbetont ein а, kein я: сердце → сердца.
  if (/е$/.test(ru)) return ru.slice(0, -1) + (/[жчшщц]$/.test(ru.slice(0, -1)) ? 'а' : 'я');
  if (/й$/.test(ru)) return ru.slice(0, -1) + 'я';
  return ru + 'а';
};
const genitiv = (ru, art) => genitivMit(ru, art, nomen);
const pluralMit = (ru, tab) => {
  const eigen = tab[ru] || null;
  if (eigen && eigen.starr) return ru;
  if (eigen && eigen.plural) return eigen.plural;
  if (/ия$/.test(ru)) return ru.slice(0, -1) + 'и';
  if (/ие$/.test(ru)) return ru.slice(0, -1) + 'я';
  if (/[ьй]$/.test(ru)) return ru.slice(0, -1) + 'и';
  if (/а$/.test(ru)) return ru.slice(0, -1) + (nachZischlaut(ru.slice(0, -1)) ? 'и' : 'ы');
  if (/я$/.test(ru)) return ru.slice(0, -1) + 'и';
  if (/о$/.test(ru)) return ru.slice(0, -1) + 'а';
  if (/е$/.test(ru)) return ru.slice(0, -1) + (/[жчшщц]$/.test(ru.slice(0, -1)) ? 'а' : 'я');
  return ru + (nachZischlaut(ru) ? 'и' : 'ы');
};
const plural = (ru) => pluralMit(ru, nomen);
const GENERA = ['m', 'w', 's', 'p'];
const adjTeile = (ru) => {
  if (!/(ый|ий|ой)$/.test(ru)) return null;
  const stamm = ru.slice(0, -2);
  const zisch = /[жчшщ]$/.test(stamm);
  const velar = /[кгх]$/.test(stamm);
  return { stamm, end: ru.slice(-2), zisch, velar, weich: ru.slice(-2) === 'ий' && !zisch && !velar };
};
const adjektiv = (ru, genus) => {
  const t = adjTeile(ru);
  if (!t) return null;
  if (genus === 'm') return ru;
  if (genus === 'w') return t.stamm + (t.weich ? 'яя' : 'ая');
  if (genus === 's') return t.stamm + (t.weich || (t.zisch && t.end !== 'ой') ? 'ее' : 'ое');
  if (genus === 'p') return t.stamm + (t.weich || t.zisch || t.velar ? 'ие' : 'ые');
  return null;
};
const PRAET_ENDE = { m: 'л', w: 'ла', s: 'ло', p: 'ли' };
const praeteritumMit = (ru, genus, tab) => {
  const i = GENERA.indexOf(genus);
  if (i === -1) return null;
  const eigen = tab[ru] || null;
  if (eigen && eigen.praet) return eigen.praet[i];
  if (/ться$/.test(ru)) {
    const basis = praeteritumMit(ru.slice(0, -2), genus, tab);
    if (!basis) return null;
    return basis + (/[аеёиоуыэюя]$/.test(basis) ? 'сь' : 'ся');
  }
  if (!/ть$/.test(ru)) return null;
  return ru.slice(0, -2) + PRAET_ENDE[genus];
};
const praeteritum = (ru, genus) => praeteritumMit(ru, genus, verben);
const PERSONEN = ['1s', '2s', '3s', '1p', '2p', '3p'];
const nachZischlaut = (stamm) => /[кгхжчшщ]$/.test(stamm);
const weicherStamm = (stamm) => /[аеёиоуыэюяьй]$/.test(stamm);
const endungenE = (stamm, betont) => {
  const weich = weicherStamm(stamm);
  const e = betont ? 'ё' : 'е';
  return [weich ? 'ю' : 'у', e + 'шь', e + 'т', e + 'м', e + 'те', weich ? 'ют' : 'ут'];
};
const endungenI = (stamm) => [
  nachZischlaut(stammIch(stamm)) ? 'у' : 'ю',
  'ишь', 'ит', 'им', 'ите',
  nachZischlaut(stamm) ? 'ат' : 'ят',
];
const WANDEL = { 'т': 'ч', 'д': 'ж', 'с': 'ш', 'з': 'ж', 'к': 'ч', 'г': 'ж', 'х': 'ш' };
const stammIch = (stamm) => {
  if (/ст$/.test(stamm)) return stamm.slice(0, -2) + 'щ';
  if (/[бпвфм]$/.test(stamm)) return stamm + 'л';
  const letzt = stamm.slice(-1);
  return WANDEL[letzt] ? stamm.slice(0, -1) + WANDEL[letzt] : stamm;
};
const verbBauMit = (ru, tab) => {
  const eigen = tab[ru] || null;
  if (eigen && eigen.formen) return eigen.formen.slice();
  if (/ться$/.test(ru)) {
    const basis = verbBauMit(ru.slice(0, -2), tab);
    if (!basis) return null;
    return basis.map((f) => f + (/[аеёиоуыэюя]$/.test(f) ? 'сь' : 'ся'));
  }
  let stamm = eigen && eigen.stamm ? eigen.stamm : null;
  const konj = eigen && eigen.konj ? eigen.konj : (/(ить|еть)$/.test(ru) ? 'i' : 'e');
  if (!stamm) {
    if (/(ать|ять)$/.test(ru)) stamm = ru.slice(0, -2);
    else if (/(ить|еть)$/.test(ru)) stamm = ru.slice(0, -3);
    else return null;
  }
  const enden = konj === 'i' ? endungenI(stamm) : endungenE(stamm, !!(eigen && eigen.betont));
  return enden.map((e, i) => (i === 0 && konj === 'i' ? stammIch(stamm) : stamm) + e);
};
const verbBau = (ru) => verbBauMit(ru, verben);
const praesens = (ru, person) => {
  const formen = verbBau(ru);
  if (!formen) return null;
  const i = PERSONEN.indexOf(person);
  return i === -1 ? null : formen[i];
};
const istNomen = (art) => !!GESCHLECHT_VON[art];
const grammForm = (ru, art, rolle) => {
  if (rolle === 'akk') return istNomen(art) ? akkusativ(ru, art) : null;
  if (rolle === 'praep') return istNomen(art) ? praepositiv(ru, art) : null;
  if (rolle === 'gen') return istNomen(art) ? genitiv(ru, art) : null;
  if (rolle === 'plural') return istNomen(art) ? plural(ru, art) : null;
  if (rolle.indexOf('praet') === 0) return art === 'v' ? praeteritum(ru, rolle.slice(5)) : null;
  if (rolle.indexOf('praes') === 0) return art === 'v' ? praesens(ru, rolle.slice(5)) : null;
  if (rolle.indexOf('adj') === 0) return art === 'a' ? adjektiv(ru, rolle.slice(3)) : null;
  return null;
};
const GENUS_NAME = { m: 'männlich', w: 'weiblich', s: 'sächlich', p: 'Mehrzahl' };
const GESCHLECHT_NAME = { m: 'männlich', w: 'weiblich', s: 'sächlich' };
const ROLLEN = { akk: 'Akkusativ', praep: 'Präpositiv', gen: 'Genitiv', plural: 'Mehrzahl' };
PERSONEN.forEach((p) => { ROLLEN['praes' + p] = 'Präsens ' + p; });
GENERA.forEach((g) => {
  ROLLEN['praet' + g] = 'Vergangenheit ' + GENUS_NAME[g];
  ROLLEN['adj' + g] = 'Adjektiv ' + GENUS_NAME[g];
});

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

// Kommentare: [Topf, Text] — die Zeile, die nach jeder Auflösung etwas sagt.
// Jeder Topf muss voll genug sein, dass sich nichts sofort wiederholt; darum
// hier eine Mindestzahl je Topf und keine Dublette im ganzen Vorrat.
const KOMMENTAR_TOEPFE = {
  richtig: 12, trocken: 8, serie: 5, jo: 3, weich: 3, lang: 3,
  eins: 5, knapp: 6, daneben: 8, auf: 4
};
if (!Array.isArray(kommentare) || kommentare.length === 0) {
  meckern('kommentare.json: erwartet eine nicht-leere Liste');
} else {
  const gezaehlt = {};
  const texte = new Set();
  kommentare.forEach((k, i) => {
    const wo = 'kommentare.json #' + (i + 1);
    if (!Array.isArray(k) || k.length !== 2) return meckern(wo + ': erwartet [Topf, Text]');
    const [topf, text] = k;
    if (typeof topf !== 'string' || !(topf in KOMMENTAR_TOEPFE)) {
      return meckern(wo + ': unbekannter Topf «' + topf + '» — erlaubt: ' +
        Object.keys(KOMMENTAR_TOEPFE).join(' '));
    }
    if (typeof text !== 'string' || text.trim() !== text || text.length < 4) {
      return meckern(wo + ': leerer, zu kurzer oder ungetrimmter Text');
    }
    // Nur die drei Platzhalter, die die App füllt. Ein unbekannter bliebe im
    // Satz stehen und läse sich wie ein Fehler — weil er einer wäre.
    const unbekannt = (text.match(/\{\w+\}/g) || [])
      .filter((ph) => ['{n}', '{f}', '{s}'].indexOf(ph) === -1);
    if (unbekannt.length) meckern(wo + ': unbekannter Platzhalter ' + unbekannt.join(' '));
    if (texte.has(text)) meckern(wo + ': dieser Text steht schon einmal in der Liste');
    else texte.add(text);
    gezaehlt[topf] = (gezaehlt[topf] || 0) + 1;
  });
  Object.keys(KOMMENTAR_TOEPFE).forEach((topf) => {
    const da = gezaehlt[topf] || 0;
    if (da < KOMMENTAR_TOEPFE[topf]) {
      meckern('kommentare.json: Topf «' + topf + '» hat nur ' + da +
        ' Einträge, nötig sind ' + KOMMENTAR_TOEPFE[topf] +
        ' — sonst wiederholt er sich zu schnell');
    }
  });
}

// Tutorial: [Ort, Ziel, Titel, Text, Beispiel] — der Scheinwerfer braucht ein
// Ziel, das es auch gibt. Ob der Wähler auf dem Schirm etwas trifft, kann hier
// niemand wissen; das prüft die Suite «tutorial» am echten DOM. Hier steht nur,
// was sich ohne Browser feststellen lässt.
const TUT_ORTE = ['home', 'lernsets', 'freestyle', 'tippen', 'uebersetzen',
  'buchstaben', 'grammatik', 'power'];
if (!Array.isArray(tutorial) || tutorial.length < 5) {
  meckern('tutorial.json: erwartet eine Liste mit mindestens fünf Schritten');
} else {
  const ziele = new Set();
  tutorial.forEach((schritt, i) => {
    const wo = 'tutorial.json Schritt ' + (i + 1);
    if (!Array.isArray(schritt) || schritt.length !== 5) {
      return meckern(wo + ': erwartet [Ort, Ziel, Titel, Text, Beispiel]');
    }
    const [ort, ziel, titel, text, beispiel] = schritt;
    if (TUT_ORTE.indexOf(ort) === -1) {
      meckern(wo + ': unbekannter Ort «' + ort + '» — erlaubt: ' + TUT_ORTE.join(' '));
    }
    [['Ziel', ziel], ['Titel', titel], ['Text', text], ['Beispiel', beispiel]]
      .forEach(([name, wert]) => {
        if (typeof wert !== 'string' || wert.trim() !== wert) {
          meckern(wo + ': ' + name + ' ist kein sauberer Text');
        }
      });
    if (!ziel) meckern(wo + ': ohne Ziel gäbe es nichts zu beleuchten');
    if (ziele.has(ziel)) meckern(wo + ': das Ziel «' + ziel + '» kommt schon vor');
    else ziele.add(ziel);
    if (titel.length < 3) meckern(wo + ': der Titel ist zu knapp');
    if (text.length < 40) meckern(wo + ': der Text erklärt zu wenig');
    // Einfache Worte hei\u00dfen kurze S\u00e4tze. \u00dcber 240 Zeichen liest
    // auf einem Handy niemand mehr, w\u00e4hrend der Rest des Bildschirms dunkel ist.
    if (text.length > 240) meckern(wo + ': der Text ist zu lang für ein Overlay');
    if (beispiel && beispiel.length > 140) meckern(wo + ': das Beispiel ist zu lang');
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

// Grammatik-Bausteine: je Baustein ein Objekt über mehrere Zeilen — sie tragen
// zu viel Text für eine Zeile.
const grammatikBlock = (name, liste) => {
  const zeilen = ['var ' + name + ' = ['];
  liste.forEach((b, i) => {
    zeilen.push('  {');
    zeilen.push('    id: ' + jsStr(b.id) + ', name: ' + jsStr(b.name) +
      ', kurz: ' + jsStr(b.kurz) + ', aufgabe: ' + jsStr(b.aufgabe) + ',');
    if (b.klasse) zeilen.push('    klasse: ' + jsStr(b.klasse) + ',');
    if (b.person) zeilen.push('    person: ' + jsStr(b.person) + ',');
    if (b.partner) zeilen.push('    partner: [' + b.partner.map(jsStr).join(', ') + '],');
    zeilen.push('    frage: ' + jsStr(b.frage) + ',');
    zeilen.push('    deutungen: [' + b.deutungen.map(jsStr).join(', ') + '], richtig: ' + b.richtig + ',');
    zeilen.push('    regel: ' + jsStr(b.regel) + ',');
    zeilen.push('    tabelle: [' + b.tabelle.map((z) => '[' + z.map(jsStr).join(', ') + ']').join(', ') + '],');
    zeilen.push('    merksatz: ' + jsStr(b.merksatz) + ',');
    zeilen.push('    fussnote: ' + jsStr(b.fussnote || '') + ',');
    zeilen.push('    beispiele: [' + b.beispiele.map(jsStr).join(', ') + ']');
    zeilen.push('  }' + (i < liste.length - 1 ? ',' : ''));
  });
  zeilen.push('];');
  return zeilen.join('\n');
};

const verbenBlock = (name, obj) => {
  const zeilen = ['var ' + name + ' = {'];
  const schluessel = Object.keys(obj);
  schluessel.forEach((k, i) => {
    const a = obj[k];
    const teile = [];
    if (a.stamm) teile.push('stamm: ' + jsStr(a.stamm));
    if (a.betont) teile.push('betont: true');
    if (a.konj) teile.push('konj: ' + jsStr(a.konj));
    if (a.formen) teile.push('formen: [' + a.formen.map(jsStr).join(', ') + ']');
    if (a.praet) teile.push('praet: [' + a.praet.map(jsStr).join(', ') + ']');
    zeilen.push('  ' + jsStr(k) + ': { ' + teile.join(', ') + ' }' +
      (i < schluessel.length - 1 ? ',' : ''));
  });
  zeilen.push('};');
  return zeilen.join('\n');
};

// Eigenwillige Nomen: ein Wort je Zeile.
const nomenBlock = (name, obj) => {
  const zeilen = ['var ' + name + ' = {'];
  const schluessel = Object.keys(obj);
  schluessel.forEach((k, i) => {
    const a = obj[k];
    const teile = [];
    if (a.starr) teile.push('starr: true');
    if (a.praep) teile.push('praep: ' + jsStr(a.praep));
    if (a.gen) teile.push('gen: ' + jsStr(a.gen));
    if (a.plural) teile.push('plural: ' + jsStr(a.plural));
    zeilen.push('  ' + jsStr(k) + ': { ' + teile.join(', ') + ' }' +
      (i < schluessel.length - 1 ? ',' : ''));
  });
  zeilen.push('};');
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
  '',
  grammatikBlock('GRAMMATIK', grammatik),
  '',
  verbenBlock('VERBEN', verben),
  '',
  nomenBlock('NOMEN', nomen),
  '',
  listenBlock('KOMMENTARE', kommentare, true),
  '',
  listenBlock('TUTORIAL', tutorial, true),
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

// Eigenwillige Verben: ein Verb je Zeile.
const jsonVerben = (obj) => {
  const zeilen = ['{'];
  const schluessel = Object.keys(obj);
  schluessel.forEach((k, i) => {
    const a = obj[k];
    const teile = [];
    if (a.stamm) teile.push('"stamm": ' + jsonStr(a.stamm));
    if (a.betont) teile.push('"betont": true');
    if (a.konj) teile.push('"konj": ' + jsonStr(a.konj));
    if (a.formen) teile.push('"formen": [' + a.formen.map(jsonStr).join(', ') + ']');
    if (a.praet) teile.push('"praet": [' + a.praet.map(jsonStr).join(', ') + ']');
    zeilen.push('  ' + jsonStr(k) + ': { ' + teile.join(', ') + ' }' +
      (i < schluessel.length - 1 ? ',' : ''));
  });
  zeilen.push('}');
  return zeilen.join('\n') + '\n';
};

// Bausteine lesbar halten: Listen bleiben auf einer Zeile, lange Texte stehen
// für sich. So sieht man beim Durchsehen die Regel und nicht die Klammern.
const jsonGrammatik = (liste) => {
  const zeilen = ['['];
  liste.forEach((b, i) => {
    zeilen.push('  {');
    const feld = (name, wert, komma) =>
      zeilen.push('    ' + jsonStr(name) + ': ' + wert + (komma ? ',' : ''));
    feld('id', jsonStr(b.id), true);
    feld('name', jsonStr(b.name), true);
    feld('kurz', jsonStr(b.kurz), true);
    feld('aufgabe', jsonStr(b.aufgabe), true);
    if (b.klasse) feld('klasse', jsonStr(b.klasse), true);
    if (b.person) feld('person', jsonStr(b.person), true);
    feld('frage', jsonStr(b.frage), true);
    feld('deutungen', '[' + b.deutungen.map(jsonStr).join(', ') + ']', true);
    feld('richtig', String(b.richtig), true);
    feld('regel', jsonStr(b.regel), true);
    zeilen.push('    "tabelle": [');
    b.tabelle.forEach((z, k) => {
      zeilen.push('      [' + z.map(jsonStr).join(', ') + ']' + (k < b.tabelle.length - 1 ? ',' : ''));
    });
    zeilen.push('    ],');
    feld('merksatz', jsonStr(b.merksatz), true);
    feld('fussnote', jsonStr(b.fussnote || ''), true);
    if (b.partner) feld('partner', '[' + b.partner.map(jsonStr).join(', ') + ']', true);
    feld('beispiele', '[' + b.beispiele.map(jsonStr).join(', ') + ']', false);
    zeilen.push('  }' + (i < liste.length - 1 ? ',' : ''));
  });
  zeilen.push(']');
  return zeilen.join('\n') + '\n';
};

// Eigenwillige Nomen: ein Wort je Zeile.
const jsonNomen = (obj) => {
  const zeilen = ['{'];
  const schluessel = Object.keys(obj);
  schluessel.forEach((k, i) => {
    const a = obj[k];
    const teile = [];
    if (a.starr) teile.push('"starr": true');
    if (a.praep) teile.push('"praep": ' + jsonStr(a.praep));
    if (a.gen) teile.push('"gen": ' + jsonStr(a.gen));
    if (a.plural) teile.push('"plural": ' + jsonStr(a.plural));
    zeilen.push('  ' + jsonStr(k) + ': { ' + teile.join(', ') + ' }' +
      (i < schluessel.length - 1 ? ',' : ''));
  });
  zeilen.push('}');
  return zeilen.join('\n') + '\n';
};

const dateien = [
  ['data/vokabeln.json', jsonObjekt(vokabeln)],
  ['data/saetze.json', jsonSaetze(saetze)],
  ['data/fakten.json', jsonListe(fakten, false)],
  ['data/tastatur.json', jsonListe(tastatur, true)],
  ['data/buchstaben.json', jsonListe(buchstaben, true)],
  ['data/grammatik.json', jsonGrammatik(grammatik)],
  ['data/verben.json', jsonVerben(verben)],
  ['data/nomen.json', jsonNomen(nomen)],
  ['data/kommentare.json', jsonListe(kommentare, true)],
  ['data/tutorial.json', jsonListe(tutorial, true)]
];

// ── Eigenwillige Verben ─────────────────────────────────────
// Hier steht nur, was die Regel nicht trägt — meist ein abweichender Stamm,
// selten alle sechs Formen. Ein Eintrag, der dasselbe liefert wie die Regel,
// ist ein Fehler: Er verlängert die Liste und verdeckt die echten Sonderfälle.
if (!verben || typeof verben !== 'object' || Array.isArray(verben)) {
  meckern('verben.json: erwartet ein Objekt Grundform → Angaben');
} else {
  Object.entries(verben).forEach(([ru, a]) => {
    const wo = 'verben.json » ' + ru;
    const eintrag = wortIndex[ru];
    if (!eintrag) return meckern(wo + ': steht nicht in vokabeln.json');
    if (wortart(eintrag) !== 'v') meckern(wo + ': ist dort kein Verb');
    if (!a || typeof a !== 'object' || Array.isArray(a)) return meckern(wo + ': erwartet ein Objekt');
    const erlaubt = ['stamm', 'betont', 'konj', 'formen', 'praet'];
    Object.keys(a).forEach((k) => {
      if (!erlaubt.includes(k)) meckern(wo + ': unbekannte Angabe «' + k + '»');
    });
    if (a.formen !== undefined) {
      if (!Array.isArray(a.formen) || a.formen.length !== 6) {
        meckern(wo + ': «formen» braucht genau sechs Formen (я ты он мы вы они)');
      }
      if (a.stamm || a.konj || a.betont) meckern(wo + ': «formen» verträgt sich nicht mit «stamm»');
    }
    if (a.konj !== undefined && a.konj !== 'i' && a.konj !== 'e') {
      meckern(wo + ': «konj» ist «i» oder «e»');
    }
    // Die Vergangenheit steht getrennt: Sie folgt einer eigenen Regel und
    // stimmt bei den meisten Verben, auch wenn das Präsens abweicht.
    if (a.praet !== undefined) {
      if (!Array.isArray(a.praet) || a.praet.length !== 4 ||
        !a.praet.every((f) => typeof f === 'string' && istKyrillisch(f))) {
        meckern(wo + ': «praet» braucht vier kyrillische Formen (er sie es sie·Mz)');
      } else {
        const ohne = praeteritumMit(ru, 'm', { ...verben, [ru]: undefined });
        if (ohne && a.praet.join(' ') === GENERA.map(
          (g) => praeteritumMit(ru, g, { ...verben, [ru]: undefined })).join(' ')) {
          meckern(wo + ': «praet» überflüssig — die Regel liefert von allein «' + ohne + '»');
        }
      }
    }
    // Die Probe aufs Exempel: Was liefert die blanke Regel ohne diesen Eintrag?
    // Kommt dasselbe heraus, sagt der Eintrag nichts — dann weg damit.
    const nurPraet = Object.keys(a).length === 1 && a.praet !== undefined;
    const mit = verbBauMit(ru, verben);
    const ohne = verbBauMit(ru, { ...verben, [ru]: undefined });
    if (!nurPraet && mit && ohne && mit.join(' ') === ohne.join(' ')) {
      meckern(wo + ': überflüssig — die Regel liefert von allein «' + mit[0] + ' … ' + mit[5] + '»');
    }
  });
}

// ── Eigenwillige Nomen ──────────────────────────────────────
// Flüchtige Vokale (день → дне), eigene Stämme (время → времени), der Ortsfall
// auf -у nach в/на (год → году) und unveränderliche Lehnwörter (метро). Auch
// hier gilt: Was die Regel von allein trifft, gehört nicht in die Liste.
if (!nomen || typeof nomen !== 'object' || Array.isArray(nomen)) {
  meckern('nomen.json: erwartet ein Objekt Grundform → Angaben');
} else {
  Object.entries(nomen).forEach(([ru, a]) => {
    const wo = 'nomen.json » ' + ru;
    const eintrag = wortIndex[ru];
    if (!eintrag) return meckern(wo + ': steht nicht in vokabeln.json');
    const art = wortart(eintrag);
    if (!istNomen(art)) meckern(wo + ': ist dort kein Nomen');
    if (!a || typeof a !== 'object' || Array.isArray(a)) return meckern(wo + ': erwartet ein Objekt');
    const FAELLE = ['praep', 'gen', 'plural'];
    Object.keys(a).forEach((k) => {
      if (k !== 'starr' && !FAELLE.includes(k)) meckern(wo + ': unbekannte Angabe «' + k + '»');
    });
    if (a.starr && FAELLE.some((k) => a[k])) {
      meckern(wo + ': «starr» verträgt sich nicht mit einer Form');
    }
    if (!a.starr && !FAELLE.some((k) => a[k])) return meckern(wo + ': sagt nichts aus');
    FAELLE.forEach((k) => {
      if (a[k] !== undefined && (typeof a[k] !== 'string' || !istKyrillisch(a[k]))) {
        meckern(wo + ': «' + k + '» erwartet eine kyrillische Form');
      }
    });
    // Die Probe je Form: Was liefert die blanke Regel ohne diesen Eintrag?
    // Jede Angabe muss für sich etwas sagen, sonst verdeckt die Liste die
    // echten Ausnahmen.
    const blank = {
      praep: praepositivMit(ru, geschlecht(art), {}),
      gen: genitivMit(ru, geschlecht(art), {}),
      plural: pluralMit(ru, {}),
    };
    if (a.starr) {
      if (FAELLE.every((k) => blank[k] === ru)) {
        meckern(wo + ': überflüssig — die Regel lässt das Wort von allein stehen');
      }
    }
    FAELLE.forEach((k) => {
      if (a[k] !== undefined && a[k] === blank[k]) {
        meckern(wo + ': «' + k + '» überflüssig — die Regel liefert von allein «' + blank[k] + '»');
      }
    });
  });
}

// ── Grammatik-Bausteine ─────────────────────────────────────
// Ein Baustein ist eine Regel mit allem, was sie zum Lernen braucht: die Frage
// zum Entdecken samt Deutungen, die Regel selbst, eine Tabelle und ein
// Merksatz. Die Aufgabenart verweist auf eine Rolle, die die Maschine kennt.
const AUFGABEN = ['geschlecht', 'akk', 'praes', 'ichform', 'praep',
  'gen', 'plural', 'praet', 'adj'];
const verbKlasse = (ru) => {
  if (/ться$/.test(ru)) return verbKlasse(ru.slice(0, -2));
  const eigen = verben[ru] || null;
  if (eigen && eigen.formen) return '';
  if (eigen && eigen.konj) return eigen.konj;
  return /(ить|еть)$/.test(ru) ? 'i' : 'e';
};
const verbStamm = (ru) => {
  if (/ться$/.test(ru)) return verbStamm(ru.slice(0, -2));
  const eigen = verben[ru] || null;
  if (eigen && eigen.formen) return '';
  if (eigen && eigen.stamm) return eigen.stamm;
  if (/(ать|ять)$/.test(ru)) return ru.slice(0, -2);
  if (/(ить|еть)$/.test(ru)) return ru.slice(0, -3);
  return '';
};
if (!Array.isArray(grammatik) || grammatik.length === 0) {
  meckern('grammatik.json: erwartet eine nicht-leere Liste von Bausteinen');
} else {
  const ids = new Set();
  grammatik.forEach((b, i) => {
    const wo = 'grammatik.json #' + (i + 1) + (b && b.id ? ' (' + b.id + ')' : '');
    if (!b || typeof b !== 'object' || Array.isArray(b)) return meckern(wo + ': erwartet ein Objekt');
    ['id', 'name', 'kurz', 'aufgabe', 'frage', 'regel', 'merksatz'].forEach((f) => {
      if (typeof b[f] !== 'string' || b[f].trim() === '') meckern(wo + ': «' + f + '» fehlt oder ist leer');
    });
    if (!/^[a-z]+$/.test(String(b.id))) meckern(wo + ': «id» nur Kleinbuchstaben');
    if (ids.has(b.id)) meckern(wo + ': doppelte Kennung «' + b.id + '»');
    ids.add(b.id);
    if (!AUFGABEN.includes(b.aufgabe)) {
      meckern(wo + ': unbekannte Aufgabe «' + b.aufgabe + '» — bekannt: ' + AUFGABEN.join(' '));
    }
    if (b.klasse !== undefined && b.klasse !== 'i' && b.klasse !== 'e') {
      meckern(wo + ': «klasse» ist «i» oder «e»');
    }
    if (b.person !== undefined && !PERSONEN.includes(b.person)) {
      meckern(wo + ': «person» ist eine von ' + PERSONEN.join(' '));
    }
    // Die Übereinstimmung braucht ein Gegenüber: Nomen, nach denen sich das
    // Adjektiv richtet. Sie müssen alle drei Geschlechter abdecken — sonst
    // zeigt die Gegenüberstellung nicht, worum es geht — und ihre Mehrzahl
    // muss die Regel treffen, denn sie steht in der Aufgabe.
    if (b.aufgabe === 'adj') {
      if (!Array.isArray(b.partner) || b.partner.length < 4) {
        meckern(wo + ': «partner» braucht mindestens vier Nomen');
      } else {
        const gefunden = new Set();
        b.partner.forEach((w) => {
          if (!wortIndex[w]) return meckern(wo + ': Partner «' + w + '» steht nicht in vokabeln.json');
          const art = wortart(wortIndex[w]);
          if (!istNomen(art)) return meckern(wo + ': Partner «' + w + '» ist kein Nomen');
          if (nomen[w] && (nomen[w].starr || nomen[w].plural)) {
            meckern(wo + ': Partner «' + w + '» hat eine eigenwillige Mehrzahl');
          }
          gefunden.add(geschlecht(art));
        });
        ['m', 'w', 's'].forEach((gg) => {
          if (!gefunden.has(gg)) meckern(wo + ': «partner» nennt kein ' + GESCHLECHT_NAME[gg] + 'es Nomen');
        });
      }
    } else if (b.partner !== undefined) {
      meckern(wo + ': «partner» gibt es nur bei der Übereinstimmung');
    }
    // Entdecken heißt wählen: eine Deutung trifft, die anderen sind plausibel
    // und falsch. Unter drei Möglichkeiten wäre es kein Erkennen mehr, sondern
    // Raten mit halber Chance.
    if (!Array.isArray(b.deutungen) || b.deutungen.length < 3) {
      meckern(wo + ': «deutungen» braucht mindestens drei Möglichkeiten');
    } else if (!Number.isInteger(b.richtig) || b.richtig < 0 || b.richtig >= b.deutungen.length) {
      meckern(wo + ': «richtig» zeigt auf keine der Deutungen');
    }
    if (!Array.isArray(b.tabelle) || b.tabelle.length === 0) {
      meckern(wo + ': «tabelle» fehlt');
    } else {
      b.tabelle.forEach((z, k) => {
        if (!Array.isArray(z) || z.length !== 3) meckern(wo + ' » Zeile ' + (k + 1) + ': erwartet drei Spalten');
      });
    }
    // Beispiele müssen aus dem Lehrplan kommen — eine Regel an Wörtern zu
    // zeigen, die man nie lernt, erklärt nichts.
    if (!Array.isArray(b.beispiele) || b.beispiele.length < 4) {
      meckern(wo + ': «beispiele» braucht mindestens vier Wörter');
    } else {
      b.beispiele.forEach((w) => {
        if (!wortIndex[w]) return meckern(wo + ': Beispiel «' + w + '» steht nicht in vokabeln.json');
        const NOMENFACH = ['akk', 'praep', 'gen', 'plural'];
        if (NOMENFACH.includes(b.aufgabe) && !istNomen(wortart(wortIndex[w]))) {
          meckern(wo + ': Beispiel «' + w + '» ist kein Nomen');
        }
        if (b.aufgabe === 'adj' && wortart(wortIndex[w]) !== 'a') {
          meckern(wo + ': Beispiel «' + w + '» ist kein Adjektiv');
        }
        // Die Mehrzahl zeigt sich nur an Zählbarem — «zwei Wasser» ist kein
        // Beispiel, sondern eine Sonderbedeutung. Darum nennt der Baustein
        // seine Wörter selbst, und was die Regel nicht trifft, bleibt draußen.
        if (b.aufgabe === 'gen' || b.aufgabe === 'plural') {
          const art = wortart(wortIndex[w]);
          const eintrag = nomen[w];
          if (eintrag && (eintrag.starr || eintrag[b.aufgabe === 'gen' ? 'gen' : 'plural'])) {
            meckern(wo + ': Beispiel «' + w + '» ist eine Ausnahme — nicht herleitbar');
          } else if (grammForm(w, art, b.aufgabe) === w) {
            meckern(wo + ': Beispiel «' + w + '» ändert sich nicht');
          }
        }
        if (b.aufgabe === 'praet') {
          if (wortart(wortIndex[w]) !== 'v') return meckern(wo + ': Beispiel «' + w + '» ist kein Verb');
          if (verben[w] && verben[w].praet) {
            meckern(wo + ': Beispiel «' + w + '» ist eine Ausnahme — nicht herleitbar');
          } else if (!praeteritum(w, 'm')) {
            meckern(wo + ': Beispiel «' + w + '» bildet keine Vergangenheit nach der Regel');
          }
          return;
        }
        if (b.aufgabe === 'praep') {
          const art = wortart(wortIndex[w]);
          if (nomen[w] && (nomen[w].starr || nomen[w].praep)) {
            meckern(wo + ': Beispiel «' + w + '» ist eine Ausnahme — nicht herleitbar');
          }
          else if (belebt(art)) {
            meckern(wo + ': Beispiel «' + w + '» ist ein Lebewesen — kein Ort');
          } else if (praepositiv(w, geschlecht(art)) === w) {
            meckern(wo + ': Beispiel «' + w + '» ändert sich im Präpositiv nicht');
          }
        }
        if (b.aufgabe !== 'praes' && b.aufgabe !== 'ichform') return;
        // Ein Verb, an dem sich die Regel nicht zeigen lässt, taugt nicht als
        // Beispiel: Entweder folgt es keiner Reihe, oder die Übung fände es gar
        // nicht in ihrem Vorrat und stünde mit leeren Händen da.
        if (wortart(wortIndex[w]) !== 'v') return meckern(wo + ': Beispiel «' + w + '» ist kein Verb');
        if (!verbBau(w)) return meckern(wo + ': Beispiel «' + w + '» lässt sich nicht beugen');
        const klasse = verbKlasse(w);
        if (!klasse) return meckern(wo + ': Beispiel «' + w + '» folgt keiner Reihe');
        if (/ться$/.test(w)) return meckern(wo + ': Beispiel «' + w + '» ist rückbezüglich');
        if (b.aufgabe === 'ichform') {
          const stamm = verbStamm(w);
          if (klasse !== 'i' || stammIch(stamm) === stamm) {
            meckern(wo + ': Beispiel «' + w + '» wandelt seinen Stamm nicht');
          }
          return;
        }
        if (verben[w]) meckern(wo + ': Beispiel «' + w + '» hat einen eigenen Stamm — nicht herleitbar');
        if (b.klasse && klasse !== b.klasse) {
          meckern(wo + ': Beispiel «' + w + '» gehört zur ' + klasse + '-Reihe');
        }
      });
    }
  });
}

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
// Stand und Version landen in jedem Ticket, das aus der App kommt. Beide werden
// hier mitgeschrieben, damit sie niemand von Hand pflegen muss — der Stand aus
// dem Kalender, die Version aus der Datei VERSION. Sie ist die einzige Stelle,
// an der die Zahl von Hand steht.
const heute = new Date().toISOString().slice(0, 10);
const version = readFileSync(join(ROOT, 'VERSION'), 'utf8').trim();
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  meckern('VERSION: erwartet drei Zahlen, etwa «1.0.0» — steht dort «' + version + '»');
}
const stempeln = (t) => t
  .replace(/var APP_STAND = '[^']*';/, "var APP_STAND = '" + heute + "';")
  .replace(/var APP_VERSION = '[^']*';/, "var APP_VERSION = '" + version + "';");

const neu = stempeln(html.slice(0, von) + block + html.slice(bis + ENDE.length));

if (!/var APP_STAND = '\d{4}-\d{2}-\d{2}';/.test(neu)) {
  console.error('index.html: APP_STAND nicht gefunden — der Stand kann nicht gestempelt werden.');
  process.exit(1);
}
if (!/var APP_VERSION = '\d+\.\d+\.\d+';/.test(neu)) {
  console.error('index.html: APP_VERSION nicht gefunden — die Version kann nicht gestempelt werden.');
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
