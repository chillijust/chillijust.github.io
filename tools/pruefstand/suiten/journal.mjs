// Journal (0.7.0T): sonntags eine Kachel «Wochenreflexion» auf dem Dashboard,
// zwei Fragen, eine Reflexion je Woche unter ihrem Montag; im Journal
// nachzulesen und zu ändern (ADR 0017).
//
// Die Uhr steht meist auf Sonntag, dem 11. Oktober 2026 (KW 41, 5.–11.).
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('journal', html, String.raw`
function uhr(j, m, t) { jetzt = function () { return new Date(j, m, t, 12, 0); }; }
var MO = '2026-10-05', VORHER = '2026-09-28';
function gw(id, angelegt, erledigt) {
  return gewohnheitLesen({ id: id, name: id, rhythmus: { art: 'taeglich' }, angelegt: angelegt, erledigt: erledigt || [] });
}
function mitGewohnheit() {
  frisch();
  state.gewohnheiten = [gw('Lesen', '2026-09-20', ['2026-10-05', '2026-10-06', '2026-10-07'])];
  zeige('home');
}
function tippe(id, text) {
  var el = q('#' + id);
  el.value = text;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
function meldung() { return q('#meldung').textContent; }
function kachel() { return q('.jr-kachel [data-reflexion]'); }

// ── L · Lesen und Speicher ──────────────────────────────────
uhr(2026, 9, 11);
frisch();
pruefe('L1 der Grundstand hat ein leeres Journal', Array.isArray(grundStand().journal) && !grundStand().journal.length);
var lang = new Array(JOURNAL_MAX + 50).join('x');
var s = stand({ journal: [
  { woche: MO, gut: '  Viel gelesen  ', stoerte: '', zeit: 5 },
  { woche: VORHER, gut: lang, stoerte: 'Wenig Schlaf' },
  { woche: MO, gut: 'doppelt', stoerte: '' },
  { woche: '2026-10-06', gut: 'kein Montag', stoerte: '' },
  { woche: '2026-09-21', gut: '', stoerte: '   ' },
  { woche: 'kaputt', gut: 'x' }, null, 7
] });
pruefe('L2 Gültiges bleibt, nach Woche sortiert', s.journal.map(function (r) { return r.woche; }).join() === VORHER + ',' + MO,
  JSON.stringify(s.journal.map(function (r) { return r.woche; })));
pruefe('L3 Text getrimmt und begrenzt', s.journal[1].gut === 'Viel gelesen' && s.journal[0].gut.length === JOURNAL_MAX);
pruefe('L4 die erste Reflexion einer Woche gilt', s.journal[1].gut !== 'doppelt');
pruefe('L5 ohne Zeitpunkt bleibt er leer', s.journal[0].zeit === null && s.journal[1].zeit === 5);
state = s;
speichern();
pruefe('L6 Speichern und Laden gibt dasselbe', JSON.stringify(laden().journal) === JSON.stringify(s.journal));
pruefe('L7 kein Feld ohne Prüfung', JSON.stringify(stand({ journal: 'quatsch' }).journal) === '[]');

// ── D · Die Kachel auf dem Dashboard ────────────────────────
mitGewohnheit();
pruefe('D1 sonntags steht die Kachel da', !!kachel() && kachel().getAttribute('data-reflexion') === MO &&
  /Zwei Fragen/.test(kachel().textContent) && !q('.jr-kachel.erledigt'));
var h2 = alle('#ansicht .abschnitt h2').map(function (h) { return h.textContent; });
pruefe('D2 unter den Gewohnheiten von heute', h2.indexOf('Journal') === h2.indexOf('Gewohnheiten') + 1, h2.join(' | '));
ausbewegt();
pruefe('D3 groß genug für den Daumen', kachel().getBoundingClientRect().height >= 44);
uhr(2026, 9, 10);
mitGewohnheit();
pruefe('D4 samstags nicht', !kachel());
uhr(2026, 9, 12);
mitGewohnheit();
pruefe('D5 montags auch nicht', !kachel());
uhr(2026, 9, 11);
frisch();
pruefe('D6 ein leeres Dashboard begrüßt nur', !kachel() && !!q('#ersteGewohnheit'));

// ── F · Schreiben ───────────────────────────────────────────
mitGewohnheit();
kachel().click();
pruefe('F1 die Kachel öffnet die Reflexion ihrer Woche', ansicht === 'reflexion' &&
  q('#kopf h1').textContent === 'Wochenreflexion' && q('#ansicht .etikett').textContent === 'KW 41 · 5.–11. Oktober');
pruefe('F2 zwei Fragen', q('label[for="jrGut"]').textContent === 'Was lief gut?' &&
  q('label[for="jrStoerte"]').textContent === 'Was hat gestört?' &&
  +q('#jrGut').getAttribute('maxlength') === JOURNAL_MAX && +q('#jrStoerte').getAttribute('maxlength') === JOURNAL_MAX);
pruefe('F3 die Woche in Zahlen, heute offen zählt nicht', q('.jr-zahlen').textContent === 'Diese Woche bisher: 3 von 6 Haken gesetzt.',
  q('.jr-zahlen').textContent);
var feld = q('#jrGut');
tippe('jrGut', 'Drei Tage gelesen.\nUnd früh ins Bett.');
tippe('jrStoerte', 'Zu viel <b>Handy</b>');
pruefe('F4 Tippen zeichnet nicht neu', q('#jrGut') === feld && state.journal.length === 0);
q('#jrSpeichern').click();
var r = reflexionNach(MO);
pruefe('F5 Speichern trägt ein und geht zurück', ansicht === 'home' && !!r && r.gut === 'Drei Tage gelesen.\nUnd früh ins Bett.' &&
  r.stoerte === 'Zu viel <b>Handy</b>' && r.zeit === zeitJetzt() && /Gespeichert/.test(meldung()));
pruefe('F6 gespeichert im Gerät', JSON.parse(localStorage.getItem(SPEICHER)).journal.length === 1);
pruefe('F7 die Kachel trägt den Haken', !!q('.jr-kachel.erledigt') && /Geschrieben/.test(kachel().textContent));
kachel().click();
pruefe('F8 wieder geöffnet steht das Geschriebene da', q('#jrGut').value === r.gut && q('#jrStoerte').value === r.stoerte &&
  /Leer gespeichert/.test(q('#ansicht').textContent));
tippe('jrGut', 'Geändert');
q('#jrAbbrechen').click();
pruefe('F9 Abbrechen ändert nichts', ansicht === 'home' && reflexionNach(MO).gut === r.gut);
kachel().click();
tippe('jrGut', '  ');
tippe('jrStoerte', '');
q('#jrSpeichern').click();
pruefe('F10 leer gespeichert ist sie fort', !reflexionNach(MO) && /entfernt/.test(meldung()) && !q('.jr-kachel.erledigt'));
kachel().click();
q('#jrSpeichern').click();
pruefe('F11 leer und neu: nichts gespeichert', !state.journal.length && /Nichts geschrieben/.test(meldung()) &&
  !/Leer gespeichert/.test(q('#ansicht').textContent || ''));

// ── J · Das Journal im Menü ─────────────────────────────────
mitGewohnheit();
menueOeffnen();
pruefe('J1 der Eintrag ist gebaut', !q('[data-menue="journal"] .bald'));
q('[data-menue="journal"]').click();
pruefe('J2 und öffnet das Journal', ansicht === 'journal' && q('#kopf h1').textContent === 'Journal');
pruefe('J3 leer: ein Satz und der Weg zur laufenden Woche', /Noch keine Reflexion/.test(q('#ansicht').textContent) &&
  q('#ansicht .knopf[data-reflexion]').getAttribute('data-reflexion') === MO && /Sonntag/.test(q('#ansicht').textContent));
state.journal = [reflexionLesen({ woche: VORHER, gut: 'Ruhig', stoerte: '' }), reflexionLesen({ woche: MO, gut: '', stoerte: 'Stress' })];
zeige('journal');
var eintraege = alle('.jr-eintrag');
pruefe('J4 die neueste Woche oben', eintraege.length === 2 && eintraege[0].getAttribute('data-reflexion') === MO &&
  /KW 41/.test(eintraege[0].textContent) && /KW 40/.test(eintraege[1].textContent));
pruefe('J5 beide Antworten zu lesen, Leeres sagt es', /Stress/.test(eintraege[0].textContent) &&
  eintraege[0].querySelector('.jr-antwort.leer').textContent === 'Nichts notiert.' && /Ruhig/.test(eintraege[1].textContent));
pruefe('J6 steht die Woche schon, fehlt der Knopf', !q('#ansicht .knopf[data-reflexion]'));
ausbewegt();
pruefe('J7 jeder Eintrag groß genug', eintraege.every(function (e) { return e.getBoundingClientRect().height >= 44; }));
eintraege[1].click();
pruefe('J8 ein Eintrag öffnet seine Woche', ansicht === 'reflexion' && reflexionEntwurf.woche === VORHER &&
  q('#jrGut').value === 'Ruhig' && /In dieser Woche/.test(q('.jr-zahlen').textContent));
q('#jrAbbrechen').click();
pruefe('J9 Abbrechen führt ins Journal zurück', ansicht === 'journal');
q('[data-reflexion="' + VORHER + '"]').click();
tippe('jrStoerte', 'Nichts');
q('#jrSpeichern').click();
pruefe('J10 Speichern auch', ansicht === 'journal' && reflexionNach(VORHER).stoerte === 'Nichts');
q('[data-reflexion="' + VORHER + '"]').click();
q('#zurueckKnopf').click();
pruefe('J11 der Pfeil auch', ansicht === 'journal');
q('[data-reflexion="' + VORHER + '"]').click();
q('#titelHeim').click();
pruefe('J12 die Überschrift führt nach Hause', ansicht === 'home');
zeige('journal');
q('#zurueckKnopf').click();
pruefe('J13 aus dem Journal zurück ist das Dashboard', ansicht === 'home');

// ── W · Welche Woche ────────────────────────────────────────
uhr(2026, 9, 14);
mitGewohnheit();
zeige('journal');
pruefe('W1 mitten in der Woche läßt sich schon schreiben', /jetzt schon schreiben/.test(q('#ansicht').textContent) &&
  q('#ansicht .knopf[data-reflexion]').getAttribute('data-reflexion') === '2026-10-12');
zeige('reflexion', '2026-10-19');
pruefe('W2 die Zukunft nicht', ansicht === 'home' && reflexionSpeichern('2026-10-19', 'x', '') === false);
zeige('reflexion', '2026-10-13');
pruefe('W3 nur ein Montag ist eine Woche', ansicht === 'home');
zeige('reflexion');
pruefe('W4 ohne Woche nach Hause', ansicht === 'home');

// ── S · Ausgabe ─────────────────────────────────────────────
uhr(2026, 9, 11);
mitGewohnheit();
state.journal = [reflexionLesen({ woche: MO, gut: '<img src=x>', stoerte: '<b>fett</b>' })];
zeige('journal');
pruefe('S1 Geschriebenes bleibt Text', !q('.jr-eintrag img') && !q('.jr-eintrag b') && /<b>fett<\/b>/.test(q('.jr-eintrag').textContent));
var texte = '';
['journal', 'home'].forEach(function (a) { zeige(a); texte += q('#app').textContent; });
zeige('reflexion', MO);
texte += q('#app').textContent + alle('textarea').map(function (t) { return t.placeholder; }).join(' ');
pruefe('S2 auch das Journal duzt', !/\bSie\b|\bIhnen\b|\bIhr(e|en)?\b/.test(texte));
frisch();
`);
