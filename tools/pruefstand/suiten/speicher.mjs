// Der Speicher: ein Schlüssel, abgesichert, und nie im Weg.
//
// Safari wirft im privaten Modus und bei vollem Kontingent. Die App muss dann
// trotzdem stehen — und sagen, dass sie nicht speichern konnte. Ein Haken, der
// nicht gespeichert ist, springt zurück (E); ein unlesbarer Stand wird nie still
// überschrieben (F). Befunde A2/A3 aus kommunikation/2026-10-08-01.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('speicher', html, String.raw`
frisch();
pruefe('A1 der Schlüssel heißt chillinal_v1', SPEICHER === 'chillinal_v1');

// ── B · Lesen ───────────────────────────────────────────────
localStorage.removeItem(SPEICHER);
pruefe('B1 leer gibt den Grundstand', JSON.stringify(laden()) === JSON.stringify(grundStand()));
localStorage.setItem(SPEICHER, '{kaputt');
pruefe('B2 Unlesbares auch', JSON.stringify(laden()) === JSON.stringify(grundStand()));
localStorage.setItem(SPEICHER, '"nur ein Text"');
pruefe('B3 ein Wert ohne Gestalt auch', laden().thema === 'auto');
localStorage.setItem(SPEICHER, JSON.stringify({ thema: 'lila', fremd: 1 }));
var l = laden();
pruefe('B4 ein unbekanntes Thema fällt auf auto', l.thema === 'auto');
pruefe('B5 fremde Felder kommen nicht hinein', !('fremd' in l));
pruefe('B6 ein Stand ohne neues Feld wird aufgefüllt', l.schema === 1);

// ── C · Wenn der Speicher wirft ─────────────────────────────
var echtLesen = Storage.prototype.getItem, echtSchreiben = Storage.prototype.setItem;
Storage.prototype.getItem = function () { throw new Error('gesperrt'); };
Storage.prototype.setItem = function () { throw new Error('voll'); };
var gelesen, geschrieben, geworfen = false;
try {
  gelesen = laden();
  geschrieben = speichern();
  themaSetzen('dunkel');
  zeige('einstellungen');
  zeige('home');
} catch (e) { geworfen = e.message; }
Storage.prototype.getItem = echtLesen;
Storage.prototype.setItem = echtSchreiben;
pruefe('C1 nichts wirft durch', geworfen === false, geworfen);
pruefe('C2 gelesen wird der Grundstand', gelesen && gelesen.thema === 'auto');
pruefe('C3 speichern sagt, dass es nicht ging', geschrieben === false);
pruefe('C4 und die Meldung sagt es dem Nutzer', /Speichern ging nicht/.test(q('#meldung').textContent));
pruefe('C5 die App steht weiter', !!q('#chiliFigur') && state.thema === 'dunkel');

// ── D · Geschrieben wird, was der Zustand ist ───────────────
frisch();
state.thema = 'hell';
speichern();
pruefe('D1 der Zustand liegt als JSON unter dem Schlüssel',
  JSON.parse(localStorage.getItem(SPEICHER)).thema === 'hell');
frisch();
speichern();

// ── E · Scheitert das Speichern, springt der Haken zurück ────
jetzt = function () { return new Date(2026, 9, 14, 12, 0); };
var HEUTE = '2026-10-14';
function voll() { Storage.prototype.setItem = function () { throw new Error('voll'); }; }
function frei() { Storage.prototype.setItem = echtSchreiben; }
frisch();
state.gewohnheiten.push(gewohnheitLesen({ id: 'g1', name: 'Lesen', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [] }));
state.gewohnheiten.push(gewohnheitLesen({ id: 'g2', name: 'Wasser', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01',
  erledigt: [HEUTE], zaehler: { schritt: 1 } }));
state.gewohnheiten[1].zaehlung[HEUTE] = 2;
state.termine.push(terminLesen({ id: 't1', titel: 'Arzt', tag: '2026-10-13', von: '10:00', wiederholung: 'keine' }));
speichern();
zeige('home');
var lesen = state.gewohnheiten[0];
voll();
hinweisSchliessen();
q('#meldung').textContent = '';
var r1 = umschalten('g1', HEUTE);
pruefe('E1 umschalten sagt, dass es nicht ging', r1 === false);
pruefe('E2 der Haken ist nicht gesetzt', lesen.erledigt.indexOf(HEUTE) === -1, JSON.stringify(lesen.erledigt));
q('#meldung').textContent = '';
var flammteVorher = chiliFlammt;
var r2 = umschaltenUndZeichnen('g1', HEUTE);
pruefe('E3 auch über die Kachel kein Haken', r2 === false && !erledigtAm('g1', HEUTE));
pruefe('E4 statt Jubel die Warnung', /Speichern ging nicht/.test(q('#meldung').textContent) &&
  /Speichern ging nicht/.test(q('#hinweisTitel').textContent + ' ' + q('#hinweisText').textContent),
  q('#hinweisTitel').textContent);
pruefe('E5 die Chili flammt nicht', chiliFlammt === flammteVorher);

// Zurücknehmen scheitert ebenso: Der Haken bleibt, samt Menge.
frei();
umschalten('g1', HEUTE);
voll();
pruefe('E6 ein Haken, der nicht weggeht, bleibt', umschalten('g1', HEUTE) === false && erledigtAm('g1', HEUTE));
var wasser = state.gewohnheiten[1];
pruefe('E7 Zurücknehmen behält die Menge', umschalten('g2', HEUTE) === false && wasser.zaehlung[HEUTE] === 2 &&
  erledigtAm('g2', HEUTE), JSON.stringify(wasser.zaehlung));

// Zähler: ein Schritt mehr, und vom ersten Schritt aus null.
zaehlen('g2', 1);
pruefe('E8 ein Schritt mehr bleibt aus', zaehlStand(wasser, HEUTE) === 2, zaehlStand(wasser, HEUTE));
frei();
umschalten('g2', HEUTE);
voll();
zaehlen('g2', 1);
pruefe('E9 der erste Schritt bleibt aus, ohne Menge im Speicher der Seite',
  !erledigtAm('g2', HEUTE) && !(HEUTE in wasser.zaehlung), JSON.stringify(wasser.zaehlung));

// Termine haken genauso ab.
var arzt = state.termine[0];
terminAbhaken('t1', '2026-10-13');
pruefe('E10 ein Termin bleibt offen', arzt.erledigt.indexOf('2026-10-13') === -1);
frei();
terminAbhaken('t1', '2026-10-13');
voll();
terminAbhaken('t1', '2026-10-13');
pruefe('E11 und abgehakt bleibt abgehakt', arzt.erledigt.indexOf('2026-10-13') !== -1);
frei();
pruefe('E12 im Speicher steht, was man sieht', JSON.parse(localStorage.getItem(SPEICHER)).termine[0].erledigt[0] === '2026-10-13' &&
  JSON.parse(localStorage.getItem(SPEICHER)).gewohnheiten[1].erledigt.length === 0);

// ── F · Ein unlesbarer Stand wird nie still überschrieben ────
hinweisSchliessen();
frisch();
localStorage.removeItem(SPEICHER);
pruefe('F1 leer ist nicht gesperrt', speicherUnlesbar() === null);
localStorage.setItem(SPEICHER, JSON.stringify(grundStand()));
pruefe('F2 ein lesbarer Stand auch nicht', speicherUnlesbar() === null);
localStorage.setItem(SPEICHER, '[1, 2]');
pruefe('F3 eine Liste ist kein Stand', !!speicherUnlesbar() && speicherUnlesbar().roh === '[1, 2]');
localStorage.setItem(SPEICHER, 'null');
pruefe('F4 null auch nicht', !!speicherUnlesbar());
var KAPUTT = '{' + 'kaputt';
localStorage.setItem(SPEICHER, KAPUTT);
var sperre = speicherUnlesbar();
pruefe('F5 kaputtes JSON sperrt und behält den Rohtext', !!sperre && sperre.roh === KAPUTT);
Storage.prototype.getItem = function () { throw new Error('gesperrt'); };
var ohneLesen = speicherUnlesbar();
Storage.prototype.getItem = echtLesen;
pruefe('F6 wirft schon das Lesen, sperrt es ohne Rohtext', !!ohneLesen && ohneLesen.roh === null);

// Gesperrt: Nichts wird geschrieben, auch kein Haken; der Hinweis bietet die Wege.
speicherSperre = sperre;
state.gewohnheiten.push(gewohnheitLesen({ id: 'g3', name: 'Lesen', rhythmus: { art: 'taeglich' }, angelegt: '2026-10-01', erledigt: [] }));
var gesperrtGespeichert = speichern();
pruefe('F7 speichern hält an', gesperrtGespeichert === false && localStorage.getItem(SPEICHER) === KAPUTT);
pruefe('F8 auch ein Haken schreibt nichts', umschalten('g3', HEUTE) === false && localStorage.getItem(SPEICHER) === KAPUTT &&
  !erledigtAm('g3', HEUTE));
pruefe('F9 der Hinweis sagt es', /nicht lesbar/.test(q('#hinweisTitel').textContent), q('#hinweisTitel').textContent);
pruefe('F10 mit beiden Wegen', !!q('#hinweisWahl [data-sperre="kopieren"]') && !!q('#hinweisWahl [data-sperre="neu"]'));
var kopiert = null;
var kopierenEcht = kopieren;
kopieren = function (text, fertig) { kopiert = text; fertig(true); };
q('#hinweisWahl [data-sperre="kopieren"]').click();
kopieren = kopierenEcht;
pruefe('F11 kopiert wird der Rohtext, unverändert', kopiert === KAPUTT);
pruefe('F12 kopieren hebt die Sperre nicht auf', !!speicherSperre && localStorage.getItem(SPEICHER) === KAPUTT);

// Ohne Rohtext gibt es nur den einen Weg.
hinweisSchliessen();
speicherSperre = { roh: null };
sperreZeigen();
pruefe('F13 ohne Rohtext kein Kopieren', !q('#hinweisWahl [data-sperre="kopieren"]') && !!q('#hinweisWahl [data-sperre="neu"]'));

// Neu anfangen fragt erst; «Nein» läßt alles stehen, «Neu anfangen» schreibt.
speicherSperre = sperre;
hinweisSchliessen();
sperreNeuFragen();
q('#hinweisNein').click();
pruefe('F14 Nein läßt die Sperre stehen', !!speicherSperre && localStorage.getItem(SPEICHER) === KAPUTT);
hinweisSchliessen();
sperreNeuFragen();
q('#hinweisOk').click();
var danach = null;
try { danach = JSON.parse(localStorage.getItem(SPEICHER)); } catch (e) { danach = null; }
pruefe('F15 Neu anfangen hebt die Sperre auf und schreibt', speicherSperre === null && !!danach && danach.schema === 1);
pruefe('F16 danach wird wieder gespeichert', umschalten('g3', HEUTE) === true &&
  JSON.parse(localStorage.getItem(SPEICHER)).gewohnheiten.some(function (g) { return g.id === 'g3' && g.erledigt.length === 1; }));

// Beim Start: gesperrt zeigt die App den Hinweis von selbst.
pruefe('F17 der Start zeigt den Hinweis, wenn gesperrt', /if \(speicherSperre\) sperreZeigen\(\)/.test(start.toString()));
hinweisSchliessen();
frisch();
speichern();
`);
