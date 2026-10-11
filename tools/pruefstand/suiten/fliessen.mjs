// Flüssig, die übrigen Stellen (ADR 0054): Auf iOS fließen auch Auftropfen und
// Zeilen wie in ihren Proben — die Karten beim Start als Kette, die erste aus
// dem Kopf, jede weitere aus der vorigen; eine gelöschte Zeile in den runden
// Knopf oben, kleine Teile aus «Bearbeiten» und zurück hinein. Bis 0.17.0T7 liefen dort nur die Chilli-Bilder auf einer
// Feder, und am Gerät sah man keinen Unterschied.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('fliessen', html, String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
var RUHE = fpRuhe(FP_IOS) + 600;
frisch();
state.gewohnheiten = [gewohnheitLesen({ id: 'A', name: 'A', rhythmus: { art: 'taeglich' }, angelegt: tagPlus(heuteSchluessel(), -3), erledigt: [] })];
state.fluessig = { ios: { perle: true, zeilen: true } };
flDauernSetzen();
zeige('home');
ausbewegt();

// ── P · Auftropfen beim Start ──────────────────────────────────
var held = q('#ansicht .held'), kopf = q('#kopf').getBoundingClientRect(), titel = q('#ansicht .abschnitt h2');
dashboardAuftropfen();
var f = held._fluss;
pruefe('P1 die Karte fließt als Tropfen aus dem Kopf', !!f && f.p.ziel === 1 && f.o.quelle().top === kopf.top &&
  f.o.quelle().height === kopf.height && f.o.inhalt === held);
pruefe('P2 ihre Schicht liegt vorn in der Ansicht, nie zwischen zwei Karten', !!f && f.s.parentNode === q('#ansicht') &&
  alle('#ansicht > .fl-schicht').every(function (s) { return !s.previousElementSibling || s.previousElementSibling.classList.contains('fl-schicht'); }));
pruefe('P3 ohne eigenen Grund blendet ein Teil nur ein', !!titel && !titel._fluss && titel.getAnimations().length === 1);
var naechste = alle('#ansicht .abschnitt *').filter(function (k) { return k._fluss; })[0];
pruefe('P5 die nächste Karte fließt aus der vorigen, wo deren Tropfen gerade ist, nicht aus dem Kopf', !!naechste &&
  !!f && !!f.jetzt && naechste._fluss.o.quelle() === f.jetzt);
pruefe('P6 sie löst sich, wenn die vorige halb gewachsen ist', !!naechste &&
  Math.abs(naechste._fluss.ab - f.ab - perleTakt()) <= 1 && perleTakt() > 0 && perleTakt() < fluessigTakt('perle').dauer * 0.5);
return warten(Math.round(fpRuhe(FP_IOS) * 0.45)).then(function () {
  pruefe('P7 sichtbar am Ziel trägt eine Karte ihren Schatten wieder, bevor die Feder ganz ruht', !!held._fluss &&
    held._fluss.p.x >= 0.97 && held.style.boxShadow === '');
  return warten(RUHE + 800);
}).then(function () {
  pruefe('P4 angekommen ist jede Karte wieder sie selbst', !held._fluss && !q('#ansicht .fl-schicht') && !held.style.position &&
    !held.style.opacity && !held.style.clipPath && !held.style.background &&
    !alle('#ansicht *').some(function (k) { return k._fluss || k.style.clipPath; }));

  // ── Z · Eine gelöschte Zeile ─────────────────────────────────
  state.tickets = ['k1', 'k2', 'k3'].map(function (id, i) { return ticketLesen({ id: id, titel: 'Ticket ' + id, erstellt: 5 + i, stand: 'x' }); });
  zeige('tickets');
  ausbewegt();
  ticketLoeschen({ id: 'k2' });
  return warten(TROPFEN_DAUER + 120);
}).then(function () {
  var hz = alle('body > .tropfen-huelle').filter(function (x) { return x._fluss; })[0], k = q('#zurueckKnopf').getBoundingClientRect();
  pruefe('Z1 eine gelöschte Zeile fließt als Tropfen in den Knopf oben', !!hz && hz._fluss.p.ziel === 0 &&
    hz._fluss.o.quelle().left === k.left && hz._fluss.o.quelle().top === k.top);
  return warten(RUHE);
}).then(function () {
  // Der leere Platz schließt sich über eine Animation; die kommt hier nur so an.
  ausbewegt();
  return warten(20);
}).then(function () {
  pruefe('Z2 angekommen ist sie fort, ihr Platz zu und die Liste um eine kürzer',
    !alle('body > .tropfen-huelle').some(function (x) { return x._fluss; }) && !q('body > .fl-schicht') &&
    alle('#app [data-ticket]').length === 2 && !q('#app .tm-liste .geist'));

  // ── E · Kleine Teile aus «Bearbeiten» ────────────────────────
  state.termine = [terminLesen({ id: 't1', titel: 'Zahnarzt', tag: tagPlus(heuteSchluessel(), 3), von: '09:30' }),
    terminLesen({ id: 't2', titel: 'Friseur', tag: tagPlus(heuteSchluessel(), 5), von: '11:00' })];
  state.exportOhne = { 't:t2': true };
  zeige('export');
  ausbewegt();
  q('#exBearbeiten').click();
  var hk = alle('#ansicht .ex-haken');
  pruefe('E1 die Häkchen tropfen aus «Bearbeiten», jedes als Tropfen', hk.length >= 2 &&
    hk.every(function (h) { return !!h._fluss && h._fluss.p.ziel === 1; }));
  pruefe('E2 ein leeres Häkchen fließt in der Farbe seines Rings, die am Ziel ausblendet',
    hk.some(function (h) { return !h.classList.contains('an'); }) &&
    hk.every(function (h) { return h._fluss.o.leer === !h.classList.contains('an'); }));
  return warten(RUHE + 500);
}).then(function () {
  pruefe('E3 angekommen steht jedes Häkchen als es selbst', alle('#ansicht .ex-haken').every(function (h) {
    return !h._fluss && !h.style.position && !h.style.opacity && !h.style.clipPath && !h.style.boxShadow;
  }) && !q('#ansicht .fl-schicht'));
  q('#exBearbeiten').click();
  pruefe('E4 mit «Fertig» fließen sie als Tropfen zurück hinein',
    alle('body > .tropfen-huelle').filter(function (x) { return x._fluss && x._fluss.p.ziel === 0; }).length >= 2);
  return warten(RUHE + 500);
}).then(function () {
  pruefe('E5 und sind dann fort', !alle('body > .tropfen-huelle').some(function (x) { return x._fluss; }) && !q('body > .fl-schicht'));
  state.fluessig = null;
  flDauernSetzen();
});
`);
