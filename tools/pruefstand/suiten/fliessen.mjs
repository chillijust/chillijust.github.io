// Flüssig, die übrigen Stellen (ADR 0054, 0062): Auch Auftropfen und Zeilen
// fließen — die Karten beim Start als Kette, die erste aus dem Kopf, jede
// weitere aus der vorigen; eine gelöschte Zeile in den runden Knopf oben,
// kleine Teile aus «Bearbeiten» und zurück hinein.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('fliessen', html, String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
// Bis eine Feder von iOS 26 ruht.
function ruheZeit() { return Math.ceil(1000 * Math.log(1 / 0.0015) / (fpDaempfung(FP_IOS) * 2 * Math.PI / FP_IOS.tempo)) + 250; }
var RUHE = ruheZeit() + 600;
frisch();
state.gewohnheiten = [gewohnheitLesen({ id: 'A', name: 'A', rhythmus: { art: 'taeglich' }, angelegt: tagPlus(heuteSchluessel(), -3), erledigt: [] })];
zeige('home');
ausbewegt();

// ── P · Auftropfen beim Start ──────────────────────────────────
var held = q('#ansicht .held'), kopf = q('#kopf').getBoundingClientRect(), titel = q('#ansicht .abschnitt h2');
dashboardAuftropfen();
var f = held._fluss;
var hr = held.getBoundingClientRect(), pq = f && f.o.quelle();
pruefe('P1 die Karte fließt als Tropfen aus einer Perle unten am Kopf, über ihrer Mitte', !!f && f.p.ziel === 1 &&
  f.o.inhalt === held && pq.height === PERLE_D0 && pq.width === PERLE_D0 && pq.top === kopf.top + kopf.height - PERLE_D0 &&
  Math.abs(pq.left + PERLE_D0 / 2 - (hr.left + hr.width / 2)) < 0.5, JSON.stringify(pq));
pruefe('P8 unterwegs ohne Lichtkante, der Hals zäher reißt früher als bei iOS', !!f && !f.b.licht && f.o.schlicht === true &&
  f.o.hals === PERLE_HALS && PERLE_HALS < FP_IOS.hals);
pruefe('P2 ihre Schicht liegt vorn in der Ansicht, nie zwischen zwei Karten', !!f && f.s.parentNode === q('#ansicht') &&
  alle('#ansicht > .fl-schicht').every(function (s) { return !s.previousElementSibling || s.previousElementSibling.classList.contains('fl-schicht'); }));
pruefe('P3 ohne eigenen Grund blendet ein Teil nur ein', !!titel && !titel._fluss && titel.getAnimations().length === 1);
var naechste = alle('#ansicht .abschnitt *').filter(function (k) { return k._fluss; })[0];
var nq = naechste && naechste._fluss.o.quelle();
pruefe('P5 die nächste Karte fließt aus der vorigen, wo deren Tropfen gerade ist, nicht aus dem Kopf', !!nq &&
  !!f && !!f.jetzt && nq.top === f.jetzt.top + f.jetzt.height - nq.height && nq.height === Math.min(PERLE_D0, f.jetzt.height));
pruefe('P9 wer noch wartet, mißt nicht', !!naechste && teilMessen(naechste, Date.now()) === null);
pruefe('P6 sie löst sich, wenn die vorige halb gewachsen ist', !!naechste &&
  (naechste._fluss.o.warten || 0) - (f.o.warten || 0) === perleTakt() && perleTakt() > 0 &&
  perleTakt() < fluessigTakt('perle').dauer * 0.5);
// Der Hals der nächsten Karte reißt, bevor sie halb da ist; alle fließen in
// einem Bild — einmal fpBild je Bild, nicht einmal je Karte.
var hals = [], bilder = 0, reihe = 0, fpBildVorher = fpBild;
fpBild = function (cb) { bilder++; fpBildVorher(cb); };
var spaeh = setInterval(function () {
  var g = naechste && naechste._fluss;
  reihe = Math.max(reihe, teilReihe.length);
  if (g && Date.now() >= g.ab) hals.push([g.p.x, !!(g.b.haelse && g.b.haelse.hals)]);
}, 10);
return warten(perleTakt() * 3).then(function () {
  clearInterval(spaeh);
  fpBild = fpBildVorher;
  var hatte = hals.findIndex(function (h) { return h[1]; }), riss = hals.findIndex(function (h, i) { return i > hatte && !h[1]; });
  pruefe('P10 die nächste Karte hängt erst am Hals, der reißt, bevor sie halb da ist', hatte >= 0 && riss > hatte &&
    hals[riss][0] < 0.6, JSON.stringify(hals.slice(0, 30)));
  pruefe('P11 alle fließen in einem Bild: einmal fpBild je Bild', reihe >= 2 && bilder <= Math.ceil(perleTakt() * 3 / 16) + 2,
    bilder + ' Aufrufe, bis ' + reihe + ' Teile in einem Bild');
  return warten(Math.round(ruheZeit() * 0.45) - perleTakt() * 3);
}).then(function () {
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

  // ── S · Bewegung unterwegs abgeschaltet (James, N6) ──────────
  var probe = document.createElement('div'), mal = 0, vorher = state.bewegung;
  probe.style.cssText = 'position: fixed; left: 40px; top: 300px; width: 200px; height: 80px; background: var(--flaeche);';
  document.body.appendChild(probe);
  teilFliesst(probe, { quelle: function () { return q('#kopf').getBoundingClientRect(); },
    ziel: function () { return probe.getBoundingClientRect(); }, rund: 12, d0: 30, auf: true, fertig: function () { mal++; } });
  return warten(120).then(function () {
    var lief = !!probe._fluss && probe._fluss.p.x > 0.05 && probe._fluss.p.x < 0.97;
    state.bewegung = 'aus';
    return warten(100).then(function () {
      pruefe('S1 wird die Bewegung unterwegs abgeschaltet, steht das Teil sofort, sein Abschluß kommt einmal', lief &&
        !probe._fluss && mal === 1 && !probe.style.clipPath && !q('body > .fl-schicht'));
      state.bewegung = vorher;
      weg(probe);
    });
  });
});
`);
