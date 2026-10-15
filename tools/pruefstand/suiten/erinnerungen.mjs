// Erinnerungen (0.18.0T, ADR 0061): wie bei iOS offen, bis abgehakt. Ohne Tag
// gelten sie für heute; was an seinem Tag nicht abgehakt wurde, zieht mit auf
// heute. Eine Reihe springt mit dem Haken auf ihre nächste Fälligkeit nach
// heute. Auf dem Dashboard stehen sie mit den Terminen in «Heute», im Kalender
// als Punkt im Akzent; hinaus gehen sie in derselben .ics.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026, 8 Uhr (KW 42).
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('erinnerungen', html, String.raw`
var UHR = new Date(2026, 9, 14, 8, 0);
jetzt = function () { return new Date(UHR.getTime()); };
var HEUTE = '2026-10-14';
function er(roh) {
  var e = { id: 'e', titel: 'E', angelegt: '2026-10-10', wiederholung: 'keine', erledigt: [] };
  for (var k in roh) e[k] = roh[k];
  return erinnerungLesen(e);
}
function tippe(id, wert) {
  var f = q('#' + id);
  f.value = wert;
  f.dispatchEvent(new Event('input', { bubbles: true }));
}
function zeilen() {
  return alle('#ansicht > .abschnitt .tm-liste .tm-zeile').map(function (z) {
    return z.getAttribute('data-erinnerung') || z.getAttribute('data-termin');
  });
}
function zeile(id) { return q('#ansicht > .abschnitt [data-erinnerung="' + id + '"]'); }
function aufbauen(liste) {
  frisch();
  kalTag = null;
  state.erinnerungen = liste;
  zeige('home');
  ausbewegt();
}

// ── L · Lesen ───────────────────────────────────────────────
pruefe('L1 der Grundstand hat keine Erinnerungen', Array.isArray(grundStand().erinnerungen) &&
  !grundStand().erinnerungen.length);
pruefe('L2 ohne Titel oder Anlegetag keine Erinnerung', er({ titel: '  ' }) === null && er({ angelegt: 'x' }) === null);
var reihe = er({ wiederholung: 'taeglich', tag: null });
pruefe('L3 eine Reihe ohne Tag beginnt am Anlegetag', reihe.tag === '2026-10-10' && reihe.naechste === '2026-10-10');
pruefe('L4 eine einzelne behält nur ihren einen Haken', er({ erledigt: [{ am: HEUTE, war: null },
  { am: '2026-10-15', war: null }] }).erledigt.length === 1);
var alt = stand({ gewohnheiten: [], termine: [] });
pruefe('L5 ein Stand von vor 0.18.0 liest sich, ohne Erinnerungen', Array.isArray(alt.erinnerungen) && !alt.erinnerungen.length);
state.erinnerungen = [er({ id: 'k', titel: 'Kopie', tag: '2026-10-20', uhr: '07:15', notiz: 'n' })];
var zurueck = stand(codeLesen(sicherungsCode(zeitJetzt())));
pruefe('L6 der Sicherungscode trägt sie hin und zurück', zurueck.erinnerungen.length === 1 &&
  JSON.stringify(zurueck.erinnerungen[0]) === JSON.stringify(state.erinnerungen[0]) &&
  standText(zurueck).indexOf('1 Erinnerung') !== -1);
pruefe('L7 ein älterer Code nennt keine «0 Erinnerungen»', standText(alt).indexOf('Erinnerung') === -1);

// ── M · Heute und mitziehen ──────────────────────────────────
aufbauen([er({ id: 'ohne', titel: 'Ohne Tag' }), er({ id: 'gestern', titel: 'Gestern', tag: '2026-10-13' }),
  er({ id: 'fr', titel: 'Freitag', tag: '2026-10-16' }), er({ id: 'uhr', titel: 'Mit Uhr', tag: HEUTE, uhr: '09:00' })]);
state.termine = [terminLesen({ id: 'T', titel: 'Zahnarzt', tag: HEUTE, von: '09:30' })];
zeige('home');
ausbewegt();
pruefe('M1 Termine und Erinnerungen stehen in einer Liste «Heute»', alle('#ansicht h2')[0].textContent === 'Heute' &&
  zeilen().join() === 'gestern,ohne,uhr,T', zeilen().join());
pruefe('M2 Verpaßtes zieht mit auf heute und sagt, seit wann', /seit gestern/.test(zeile('gestern').textContent) &&
  zeile('gestern').classList.contains('ueberfaellig'));
pruefe('M3 ohne Tag gilt sie heute, ohne Uhrzeit trägt sie die Glocke', !!zeile('ohne') &&
  !!zeile('ohne').querySelector('.tm-zeit.ganz svg') && zeile('uhr').querySelector('.tm-zeit').textContent === '09:00');
pruefe('M4 was noch kommt, steht nicht heute', !zeile('fr'));
var akzent = getComputedStyle(document.documentElement).getPropertyValue('--akzent').trim();
var probe = document.createElement('i');
probe.style.color = akzent;
q('#app').appendChild(probe);
pruefe('M5 der Strich trägt den Akzent, nicht das Blau des Termins',
  getComputedStyle(zeile('uhr').querySelector('.tm-zeit')).borderLeftColor === getComputedStyle(probe).color &&
  getComputedStyle(q('#ansicht [data-termin="T"] .tm-zeit')).borderLeftColor !== getComputedStyle(probe).color);
probe.remove();
var fr = q('#kalRaster [data-kaltag="2026-10-16"]'), mi = q('#kalRaster [data-kaltag="2026-10-14"]');
pruefe('M6 im Kalender ein Punkt am kommenden Tag und heute', !!fr.querySelector('.kp.erinnerung') &&
  !!mi.querySelector('.kp.erinnerung') && !q('#kalRaster [data-kaltag="2026-10-13"] .kp.erinnerung') &&
  /1 Erinnerung/.test(fr.getAttribute('aria-label')));

// ── H · Abhaken und zurück ────────────────────────────────────
zeile('gestern').click();
var g = erinnerungNach('gestern');
pruefe('H1 antippen hakt ab, heute', g.erledigt.length === 1 && g.erledigt[0].am === HEUTE && g.erledigt[0].war === '2026-10-13' &&
  zeile('gestern').closest('.tm-reihe').classList.contains('erledigt') &&
  JSON.parse(localStorage.getItem(SPEICHER)).erinnerungen.some(function (e) { return e.id === 'gestern' && e.erledigt.length === 1; }));
zeile('gestern').click();
pruefe('H2 noch einmal antippen nimmt den Haken zurück', !erinnerungNach('gestern').erledigt.length &&
  /seit gestern/.test(zeile('gestern').textContent));
zeile('ohne').click();
UHR = new Date(2026, 9, 15, 8, 0);
zeige('home');
ausbewegt();
pruefe('H3 am nächsten Tag ist Erledigtes fort, Offenes zieht weiter mit', !zeile('ohne') && !!zeile('gestern') &&
  /seit Dienstag/.test(zeile('gestern').textContent), zeilen().join());
pruefe('H4 im Kalender steht Erledigtes am Tag seines Hakens', !!q('#kalRaster [data-kaltag="2026-10-14"] .kp.erinnerung'));
UHR = new Date(2026, 9, 14, 8, 0);

// ── R · Eine Reihe ────────────────────────────────────────────
aufbauen([er({ id: 'r', titel: 'Gießen', tag: '2026-10-11', wiederholung: 'taeglich' }),
  er({ id: 'w', titel: 'Müll', tag: '2026-10-12', wiederholung: 'woechentlich' })]);
pruefe('R1 eine verpaßte Reihe steht einmal heute, seit Sonntag', alle('#ansicht [data-erinnerung="r"]').length === 1 &&
  /seit Sonntag/.test(zeile('r').textContent) && /täglich/.test(zeile('r').textContent));
zeile('r').click();
var r = erinnerungNach('r');
pruefe('R2 abgehakt springt sie auf morgen, Verpaßtes stapelt sich nicht', r.naechste === '2026-10-15' &&
  r.erledigt.length === 1 && r.erledigt[0].war === '2026-10-11', r.naechste);
zeile('r').click();
pruefe('R3 zurückgenommen ist sie wieder seit Sonntag fällig', erinnerungNach('r').naechste === '2026-10-11' &&
  !erinnerungNach('r').erledigt.length);
var mo = erinnerungenAm('2026-10-19', HEUTE).map(function (x) { return x.e.id; }).sort().join();
pruefe('R4 im Kalender steht die Reihe an jedem kommenden Tag, die Woche an ihrem Wochentag', mo === 'r,w' &&
  erinnerungenAm('2026-10-20', HEUTE).map(function (x) { return x.e.id; }).join() === 'r', mo);

// ── F · Formular ─────────────────────────────────────────────
aufbauen([]);
pruefe('F0 das Menü führt zur neuen Erinnerung', MENUE.some(function (m) { return m.ziel === 'erinnerungNeu'; }));
zeige('erinnerungNeu');
pruefe('F1 neu: ohne Datum, ohne Uhrzeit', q('#erMitTag').getAttribute('aria-checked') === 'false' &&
  q('#erTagTeil').hidden && q('#erUhrTeil').hidden && /heute/.test(q('#erWdhText').textContent));
q('#erSpeichern').click();
pruefe('F2 ohne Titel wird nichts angelegt', ansicht === 'erinnerungNeu' && !state.erinnerungen.length);
tippe('erTitel', 'Brief einwerfen');
q('#erSpeichern').click();
var neu = state.erinnerungen[0];
pruefe('F3 angelegt ohne Tag, steht heute', !!neu && neu.tag === null && neu.uhr === null && neu.angelegt === HEUTE &&
  ansicht === 'home' && !!zeile(neu.id));
zeige('erinnerungNeu', '2026-10-16');
pruefe('F4 aus dem Kalender trägt sie den Tag', q('#erMitTag').getAttribute('aria-checked') === 'true' &&
  q('#erTag').value === '2026-10-16');
zeige('erinnerungNeu');
tippe('erTitel', 'Gießen');
q('[data-erwdh="woechentlich"]').click();
pruefe('F5 wer eine Wiederholung wählt, bekommt einen Tag', q('#erMitTag').getAttribute('aria-checked') === 'true' &&
  erinnerungEntwurf.mitTag && /Jeden Mittwoch/.test(q('#erWdhText').textContent));
q('#erMitUhr').click();
tippe('erUhr', '18:30');
q('#erSpeichern').click();
var w = state.erinnerungen[1];
pruefe('F6 eine Reihe mit Uhrzeit', w.wiederholung === 'woechentlich' && w.tag === HEUTE && w.naechste === HEUTE &&
  w.uhr === '18:30');
zeige('erinnerung', w.id);
q('#erMitTag').click();
pruefe('F7 wer den Tag abschaltet, macht sie wieder einzeln', erinnerungEntwurf.wiederholung === 'keine' &&
  q('[data-erwdh="keine"]').getAttribute('aria-pressed') === 'true');
zeige('erinnerung', w.id);
tippe('erTitel', 'Blumen gießen');
q('#erSpeichern').click();
pruefe('F8 bearbeitet bleibt sie, was sie war', erinnerungNach(w.id).titel === 'Blumen gießen' &&
  erinnerungNach(w.id).wiederholung === 'woechentlich' && state.erinnerungen.length === 2);

// ── X · Export ───────────────────────────────────────────────
var CRLF = String.fromCharCode(13, 10);
state.termine = [];
state.gewohnheiten = [];
state.erinnerungen = [er({ id: 'a', titel: 'Ohne Uhr', tag: '2026-10-16' }), er({ id: 'b', titel: 'Mit Uhr', tag: HEUTE, uhr: '15:00',
  notiz: 'Brief' }), er({ id: 'c', titel: 'Reihe', tag: '2026-10-01', wiederholung: 'monatlich' }),
  er({ id: 'd', titel: 'Verpaßt', tag: '2026-10-13' }), er({ id: 'f', titel: 'Erledigt', tag: '2026-10-20',
    erledigt: [{ am: HEUTE, war: '2026-10-20' }] })];
var datei = kalenderDatei(HEUTE, zeitJetzt());
var uids = (datei.match(/UID:[^@]+/g) || []).map(function (u) { return u.slice(4); }).join();
pruefe('X1 hinaus geht Offenes ab heute und jede Reihe — nicht Verpaßtes, nicht Erledigtes', uids === 'c,b,a', uids);
pruefe('X2 ohne Uhrzeit ganztags, Alarm um 9 Uhr', datei.indexOf('DTSTART;VALUE=DATE:20261016') !== -1 &&
  /SUMMARY:Ohne Uhr[^]*?TRIGGER:PT9H/.test(datei));
pruefe('X3 mit Uhrzeit zur Uhrzeit, Alarm genau dann, Notiz dabei', datei.indexOf('DTSTART:20261014T150000') !== -1 &&
  datei.indexOf('DTEND:20261014T151500') !== -1 && /SUMMARY:Mit Uhr[^]*?DESCRIPTION:Erinnerung aus Chilli Journal\\nBrief[^]*?TRIGGER:PT0M/.test(datei));
pruefe('X4 eine Reihe als RRULE ab ihrem Beginn', /DTSTART;VALUE=DATE:20261001[^]*?RRULE:FREQ=MONTHLY/.test(datei));
zeige('export');
pruefe('X5 die Exportansicht hat einen Abschnitt «Erinnerungen»', alle('#ansicht h2').some(function (h) {
  return h.textContent === 'Erinnerungen';
}) && alle('#ansicht .ex-zeile[data-erinnerung]').length === 3 && q('#exZahl').textContent === '3');
exportiertMerken(exportAuswahl(HEUTE));
var c = erinnerungNach('c');
pruefe('X6 nach dem Export stehen sie im Kalender', exStatus('e', c) === 'drin' && exStatus('e', erinnerungNach('a')) === 'drin');
c.naechste = '2026-11-01';
c.erledigt.push({ am: HEUTE, war: '2026-10-01' });
pruefe('X7 ein Haken an der Reihe ändert nichts, was im Kalender steht', exStatus('e', c) === 'drin');
frisch();
speichern();
`);
