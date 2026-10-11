// Nur der oberste Dialog ist bedienbar (James, N5): Was darunter liegt, ist
// «inert» — Tab und die Pfeile über der iOS-Tastatur erreichen es nicht. Geht
// ein Dialog auf, holt er den Fokus; geht er zu, kehrt der Fokus dorthin
// zurück, wo er war. Bis 0.17.0T12 lief die Tab-Folge aus der Frage hinaus zum
// Ticketknopf und in die Ansicht dahinter.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('dialoge', html, String.raw`
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }
function durch() { ausbewegt(); return warten(30); }
var BEDIENBAR = 'button, input, select, textarea, a[href], [tabindex]';
// Alles, was sich bedienen ließe und nicht im Dialog liegt, ist inert.
function nurIm(d) {
  return alle(BEDIENBAR).concat(Array.prototype.slice.call(document.querySelectorAll('body > ' + BEDIENBAR)))
    .filter(function (el) { return !d.contains(el); })
    .every(function (el) { return !!el.closest('[inert]'); });
}
function freiAlles() { return !document.querySelector('[inert]'); }

frisch();
state.gewohnheiten = [gewohnheitLesen({ id: 'T', name: 'T', rhythmus: { art: 'taeglich' },
  angelegt: tagPlus(heuteSchluessel(), -3), erledigt: [], timer: { minuten: 10 } })];
zeige('home');
ausbewegt();
pruefe('D0 ohne Dialog ist nichts inert', freiAlles());

// ── F · Eine Frage ───────────────────────────────────────────
var opener = q('#themaKnopf');
opener.focus();
loeschenFragen(opener, 'Löschen?', 'Weg ist weg.', 'Löschen', function () {});
return warten(0).then(function () {
  var hb = document.getElementById('hinweisBlatt');
  pruefe('F1 bei offener Frage ist alles dahinter inert, die Frage nicht', nurIm(hb) && !hb.inert &&
    q('#app').inert && document.getElementById('ticketKnopf').inert);
  pruefe('F2 die Meldung bleibt frei, sie liest nur vor', !document.getElementById('meldung').inert);
  pruefe('F3 der Fokus liegt in der Frage', hb.contains(document.activeElement));
  q('#menuKnopf').focus();
  pruefe('F4 der Hintergrund nimmt keinen Fokus an', hb.contains(document.activeElement));
  document.getElementById('hinweisNein').click();
  return warten(0);
}).then(function () {
  pruefe('F5 zu kehrt der Fokus zurück, wo er war', document.activeElement === opener && !q('#app').inert);
  return durch();
}).then(function () {
  pruefe('F6 danach ist nichts mehr inert', freiAlles());

  // ── T · Eine Frage über dem Ticketblatt ─────────────────────
  ticketBlattOeffnen(document.getElementById('ticketKnopf'));
  return warten(0);
}).then(function () {
  var tb = document.getElementById('ticketBlatt');
  pruefe('T1 das Ticketblatt holt den Fokus, die Ansicht ist inert', tb.contains(document.activeElement) && nurIm(tb));
  document.getElementById('tkTitel').focus();
  hinweisZeigen('Probe', 'Eine Frage über dem Blatt.', null, null, { frage: { ja: 'Ja', beiJa: function () {} } });
  return warten(0);
}).then(function () {
  var hb = document.getElementById('hinweisBlatt'), tb = document.getElementById('ticketBlatt');
  pruefe('T2 über dem Blatt ist nur die Frage bedienbar, das Blatt darunter ist inert', tb.inert && !hb.inert && nurIm(hb));
  hinweisSchliessen();
  return warten(0);
}).then(function () {
  var tb = document.getElementById('ticketBlatt');
  pruefe('T3 zu kehrt der Fokus ins Feld des Blatts zurück', !tb.inert && document.activeElement === document.getElementById('tkTitel'));
  ticketBlattSchliessen();
  return durch();
}).then(function () {
  pruefe('T4 alles zu, alles frei', freiAlles());

  // ── M · Menü und Timer ───────────────────────────────────────
  menueOeffnen();
  return warten(0);
}).then(function () {
  var m = document.getElementById('menue');
  pruefe('M1 beim Menü ist die Ansicht inert, das Menü hat den Fokus', nurIm(m) && m.contains(document.activeElement));
  menueSchliessen(true);
  return durch();
}).then(function () {
  q('#menue').hidden = true;
  timerStarten('T');
  return warten(0);
}).then(function () {
  var tb = document.getElementById('timerBlatt');
  pruefe('M2 beim Timer ebenso', nurIm(tb) && tb.contains(document.activeElement));
  state.timer = null;
  timerSchliessen();
  return durch();
}).then(function () {
  pruefe('M3 und danach ist wieder alles frei', freiAlles());
  frisch();
});
`);
