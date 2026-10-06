// Journal (0.7.0T): sonntags eine Kachel «Wochenreflexion» auf dem Dashboard,
// zwei Fragen, eine Reflexion je Woche unter ihrem Montag; im Journal
// nachzulesen und zu ändern (ADR 0017). Seit 0.7.0T2: Lesen, dann
// «Bearbeiten» mit «Löschen»; die Woche wählbar; Speichern bestätigt im Glas
// (ADR 0018).
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
function bestaetigt() {
  return !q('#hinweisBlatt').hidden && q('#hinweisKarte').classList.contains('bestaetigung')
    ? q('#hinweisTitel').textContent + ' ' + q('#hinweisText').textContent : '';
}
function meldung() { var m = q('#meldung').textContent + ' ' + bestaetigt(); hinweisSchliessen(); return m; }
function kachel() { return q('.jr-kachel [data-reflexion], .jr-kachel [data-lesen]'); }
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }

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
  q('#kopf h1').textContent === 'Wochenreflexion' && q('#jrWoche').textContent === 'KW 41 · 5.–11. Oktober');
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
pruefe('F8 wieder geöffnet ist sie zu lesen, nicht zu ändern', ansicht === 'lesen' && !q('#jrGut') &&
  /Drei Tage gelesen/.test(q('#ansicht').textContent) && /Handy/.test(q('#ansicht').textContent) &&
  q('#jrBearbeiten').textContent === 'Bearbeiten' && /Geschrieben/.test(q('#ansicht').textContent));
q('#jrBearbeiten').click();
pruefe('F8a «Bearbeiten» öffnet das Geschriebene, mit «Löschen», ohne Wochenwahl', ansicht === 'reflexion' &&
  q('#jrGut').value === r.gut && q('#jrStoerte').value === r.stoerte && !!q('#jrLoeschen') && !q('#jrFrueher'));
tippe('jrGut', 'Geändert');
q('#jrAbbrechen').click();
pruefe('F9 Abbrechen ändert nichts und führt ins Lesen zurück', ansicht === 'lesen' && reflexionNach(MO).gut === r.gut);
q('#zurueckKnopf').click();
pruefe('F9a vom Lesen zurück nach Hause, woher es kam', ansicht === 'home');
kachel().click();
q('#jrBearbeiten').click();
tippe('jrGut', 'Geändert');
q('#jrSpeichern').click();
pruefe('F9b Speichern führt ins Lesen, die Bestätigung fließt dorthin', ansicht === 'lesen' &&
  reflexionNach(MO).gut === 'Geändert' && /Gespeichert/.test(meldung()));
q('#jrBearbeiten').click();
tippe('jrGut', '  ');
tippe('jrStoerte', '');
q('#jrSpeichern').click();
pruefe('F10 leer gespeichert ist sie fort, weiter ins Journal', !reflexionNach(MO) && /entfernt/.test(meldung()) &&
  ansicht === 'journal');
zeige('home');
pruefe('F10a die Kachel ist wieder offen', !q('.jr-kachel.erledigt') && kachel().hasAttribute('data-reflexion'));
kachel().click();
pruefe('F11a neu: kein «Löschen»', !q('#jrLoeschen'));
q('#jrSpeichern').click();
pruefe('F11a2 auch «nichts gespeichert» kommt im Glas, ohne grünen Haken', q('#hinweisKarte').classList.contains('bestaetigung') &&
  q('#hinweisKarte').classList.contains('glas') && q('#hinweisHaken').classList.contains('neutral') &&
  q('#hinweisHaken').getAttribute('data-zeichen') === 'hinweis' && !/Nichts/.test(q('#meldung').textContent));
pruefe('F11 leer und neu: nichts gespeichert', !state.journal.length && /Nichts gespeichert/.test(meldung()));
bestaetigen('Gespeichert', '', null);
pruefe('F11b danach trägt eine echte Bestätigung wieder den Haken', !q('#hinweisHaken').classList.contains('neutral') &&
  q('#hinweisHaken').getAttribute('data-zeichen') === 'haken');
hinweisSchliessen();
state.journal = [reflexionLesen({ woche: MO, gut: 'Weg damit', stoerte: '' })];
zeige('lesen', MO);
q('#jrBearbeiten').click();
q('#jrLoeschen').click();
pruefe('F12 «Löschen» fragt erst', !!reflexionNach(MO) && q('#jrLoeschen').textContent === 'Wirklich löschen?' &&
  q('#jrLoeschen').classList.contains('frage'));
q('#jrLoeschen').click();
pruefe('F13 der zweite Tipp löscht, bestätigt und führt ins Journal', !reflexionNach(MO) && ansicht === 'journal' &&
  !JSON.parse(localStorage.getItem(SPEICHER)).journal.length && /Gelöscht/.test(meldung()));

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
pruefe('J4 die neueste Woche oben', eintraege.length === 2 && eintraege[0].getAttribute('data-lesen') === MO &&
  /KW 41/.test(eintraege[0].textContent) && /KW 40/.test(eintraege[1].textContent));
pruefe('J5 beide Antworten zu lesen, Leeres sagt es', /Stress/.test(eintraege[0].textContent) &&
  eintraege[0].querySelector('.jr-antwort.leer').textContent === 'Nichts notiert.' && /Ruhig/.test(eintraege[1].textContent));
pruefe('J6 steht die Woche schon, holt der Knopf die jüngste fehlende nach',
  q('#jrNeu').getAttribute('data-reflexion') === '2026-09-21' && /Woche nachholen/.test(q('#jrNeu').textContent));
ausbewegt();
pruefe('J7 jeder Eintrag groß genug', eintraege.every(function (e) { return e.getBoundingClientRect().height >= 44; }));
eintraege[1].click();
pruefe('J8 ein Eintrag öffnet seine Woche zum Lesen', ansicht === 'lesen' && lesenWoche === VORHER &&
  /Ruhig/.test(q('#ansicht').textContent) && /In dieser Woche/.test(q('.jr-zahlen').textContent));
q('#jrBearbeiten').click();
q('#jrAbbrechen').click();
q('#zurueckKnopf').click();
pruefe('J9 Abbrechen, dann zurück: ins Journal', ansicht === 'journal');
q('[data-lesen="' + VORHER + '"]').click();
q('#jrBearbeiten').click();
tippe('jrStoerte', 'Nichts');
q('#jrSpeichern').click();
pruefe('J10 Speichern führt ins Lesen', ansicht === 'lesen' && reflexionNach(VORHER).stoerte === 'Nichts' &&
  /Nichts/.test(q('#ansicht').textContent));
hinweisSchliessen();
q('#zurueckKnopf').click();
pruefe('J11 und von dort ins Journal', ansicht === 'journal');
q('[data-lesen="' + VORHER + '"]').click();
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
zeige('lesen', '2026-09-07');
pruefe('W4a ungeschriebenes ist nicht zu lesen: ins Journal', ansicht === 'journal');

// Die Woche wählen: zurück beliebig weit, vor bis zur laufenden.
state.journal = [reflexionLesen({ woche: '2026-09-28', gut: 'Da', stoerte: '' })];
zeige('journal');
q('#jrNeu').click();
var gutFeld = q('#jrGut');
tippe('jrGut', 'Vergessen');
pruefe('W5 eine neue Reflexion hat Pfeile, vor ist gesperrt', reflexionEntwurf.woche === '2026-10-12' &&
  !!q('#jrFrueher') && q('#jrSpaeter').disabled && !q('#jrSpeichern').disabled);
q('#jrFrueher').click();
pruefe('W6 eine Woche zurück, an Ort und Stelle', reflexionEntwurf.woche === '2026-10-05' && q('#jrGut') === gutFeld &&
  q('#jrGut').value === 'Vergessen' && q('#jrWoche').textContent === 'KW 41 · 5.–11. Oktober' &&
  /In dieser Woche: 3 von 7/.test(q('#jrZahlen').textContent) && !q('#jrSpaeter').disabled, q('#jrZahlen').textContent);
q('#jrFrueher').click();
pruefe('W7 steht die Woche schon: gesagt, Speichern gesperrt, Text bleibt', reflexionEntwurf.woche === '2026-09-28' &&
  !q('#jrVergeben').hidden && q('#jrSpeichern').disabled && q('#jrGut').value === 'Vergessen');
q('#jrSpeichern').click();
pruefe('W8 gesperrt heißt gesperrt', reflexionNach('2026-09-28').gut === 'Da');
q('#jrSpaeter').click();
pruefe('W9 weiter: wieder frei', reflexionEntwurf.woche === '2026-10-05' && q('#jrVergeben').hidden && !q('#jrSpeichern').disabled);
for (var i = 0; i < 60; i++) q('#jrFrueher').click();
pruefe('W10 zurück ohne Grenze', reflexionEntwurf.woche === tagPlus('2026-10-05', -420), reflexionEntwurf.woche);
for (i = 0; i < 60; i++) q('#jrSpaeter').click();
q('#jrSpeichern').click();
pruefe('W11 gespeichert unter der gewählten Woche', !!reflexionNach('2026-10-05') && reflexionNach('2026-10-05').gut === 'Vergessen' &&
  !reflexionNach('2026-10-12') && ansicht === 'journal');
hinweisSchliessen();
zeige('reflexion', '2026-10-12');
q('#jrFrueher').click();
q('#jrAnsehen').click();
pruefe('W12 «Ansehen» öffnet die geschriebene Woche', ansicht === 'lesen' && lesenWoche === '2026-10-05');

// ── S · Ausgabe ─────────────────────────────────────────────
uhr(2026, 9, 11);
mitGewohnheit();
state.journal = [reflexionLesen({ woche: MO, gut: '<img src=x>', stoerte: '<b>fett</b>' })];
zeige('journal');
pruefe('S1 Geschriebenes bleibt Text', !q('.jr-eintrag img') && !q('.jr-eintrag b') && /<b>fett<\/b>/.test(q('.jr-eintrag').textContent));
var texte = '';
['journal', 'home'].forEach(function (a) { zeige(a); texte += q('#app').textContent; });
zeige('lesen', MO);
texte += q('#app').textContent;
pruefe('S1a auch beim Lesen bleibt es Text', !q('#ansicht img') && /<img src=x>/.test(q('#ansicht').textContent));
zeige('reflexion', MO);
texte += q('#app').textContent + alle('textarea').map(function (t) { return t.placeholder; }).join(' ');
pruefe('S2 auch das Journal duzt', !/\bSie\b|\bIhnen\b|\bIhr(e|en)?\b/.test(texte));

// ── B · Die Bestätigung im Glas ─────────────────────────────
mitGewohnheit();
kachel().click();
tippe('jrGut', 'Gut');
var knopfFlaeche = q('#jrSpeichern').getBoundingClientRect();
q('#jrSpeichern').click();
var huelle = q('body > .tropfen-huelle.glas');
pruefe('B1 gespeichert: das Glasfenster mit Haken, ohne «OK»', !q('#hinweisBlatt').hidden &&
  q('#hinweisKarte').classList.contains('bestaetigung') && q('#hinweisKarte').classList.contains('glas') &&
  !q('#hinweisHaken').hidden && !!q('#hinweisHaken svg') && q('#hinweisOk').hidden &&
  q('#hinweisKarte').getAttribute('role') === 'status' && q('#hinweisTitel').textContent === 'Gespeichert' &&
  !/Gespeichert/.test(q('#meldung').textContent));
pruefe('B2 er quillt aus «Speichern»', !!huelle && knopfFlaeche.width > 0);
return warten(bestaetigungDauer('Gespeichert', 'Nachzulesen im Journal.') + 100).then(function () {
  pruefe('B3 und geht von selbst', !q('#hinweisBlatt').classList.contains('offen'));
  ausbewegt();
  return warten(30);
}).then(function () {
  pruefe('B4 ganz', q('#hinweisBlatt').hidden && !q('body > .tropfen-huelle'));
  bestaetigen('Gespeichert', '', null);
  q('#hinweisBlatt').click();
  pruefe('B5 ein Tipp irgendwohin schließt früher', !q('#hinweisBlatt').classList.contains('offen'));
  hinweisZeigen('Datei geladen', 'Text', null, null);
  q('#hinweisBlatt').click();
  pruefe('B6 ein Hinweis mit «OK» wartet weiter auf «OK»', q('#hinweisBlatt').classList.contains('offen') &&
    !q('#hinweisOk').hidden && q('#hinweisHaken').hidden && q('#hinweisKarte').getAttribute('role') === 'alertdialog');
  hinweisSchliessen();
  pruefe('B7 die Zeit wächst mit dem Text, höchstens vier Sekunden', bestaetigungDauer('Gespeichert', '') < 2000 &&
    bestaetigungDauer('Angelegt', 'Antippen heißt erledigt, lange drücken öffnet sie.') > 3000 &&
    bestaetigungDauer('x', new Array(200).join('y')) === 4000);
  frisch();
});
`);
