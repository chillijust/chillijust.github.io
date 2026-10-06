// Der Auftritt beim Kaltstart (ADR 0029): Erst steht nur der Schriftzug groß
// in der Mitte und schreibt sich, dann wandert er kleiner werdend an seinen
// Platz oben links, dann tropft das Dashboard Karte für Karte auf. Ein Tipp
// überspringt ihn; aus dem Hintergrund zurück gibt es keinen.
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('auftritt', html, String.raw`
pruefe('A0 beim Kaltstart lief der Auftritt', auftrittBeimStart === true);
frisch();
function gw(id) { return gewohnheitLesen({ id: id, name: id, rhythmus: { art: 'taeglich' }, angelegt: '2026-09-01', erledigt: [] }); }
state.gewohnheiten = [gw('Lesen'), gw('Laufen'), gw('Wasser')];
zeige('home');
ausbewegt();
function svg() { return q('#markeKnopf svg.wm'); }
var platz = svg().getBoundingClientRect();
function deckend(sel) { return Number(getComputedStyle(q(sel)).opacity); }

auftritt();
var r = svg().getBoundingClientRect(), a = svg().getAnimations().filter(function (x) { return !x.animationName; })[0];
pruefe('A1 nur der Schriftzug: alles andere ist unsichtbar', document.documentElement.classList.contains('auftritt') &&
  ['#ansicht', '#kopf .datum', '#themaKnopf', '#menuKnopf', '#ticketKnopf'].every(function (s) { return deckend(s) === 0; }) &&
  deckend('#markeKnopf') === 1);
pruefe('A2 er steht groß in der Mitte', Math.abs(r.left + r.width / 2 - innerWidth / 2) < 2 &&
  Math.abs(r.top + r.height / 2 - innerHeight / 2) < 2 && Math.abs(r.width - platz.width * 2) < 2,
  [r.left, r.top, r.width, platz.width, innerWidth, innerHeight].join());
pruefe('A3 und schreibt sich dort', svg().classList.contains('wm-los'));
var bilder = a ? a.effect.getKeyframes() : [];
pruefe('A4 erst wenn er geschrieben ist (2,3 s), wandert er in 0,7 s an seinen Platz', !!a &&
  a.effect.getTiming().duration === 3000 && bilder.length === 3 && Math.abs(bilder[1].computedOffset - 2300 / 3000) < 0.001 &&
  bilder[1].transform === bilder[0].transform && bilder[2].transform === 'none', bilder.map(function (b) { return b.computedOffset; }).join());
pruefe('A5 solange nimmt nichts einen Tipp an', getComputedStyle(document.body).pointerEvents === 'none');
a.finish();
return Promise.resolve().then(function () {
  var r2 = svg().getBoundingClientRect();
  pruefe('A6 danach steht er an seinem Platz', !document.documentElement.classList.contains('auftritt') &&
    Math.abs(r2.left - platz.left) < 1 && Math.abs(r2.width - platz.width) < 1 && deckend('#ansicht') === 1);
  var karten = alle('#ansicht .held, #ansicht .abschnitt > h2, #ansicht .gw-liste > *').filter(function (k) {
    return k.getBoundingClientRect().top < innerHeight; });
  var warten = karten.map(function (k) { var x = k.getAnimations()[0]; return x ? x.effect.getTiming().delay : -1; });
  pruefe('A7 das Dashboard tropft Karte für Karte auf, von oben nach unten', karten.length >= 3 && warten[0] === 0 &&
    warten.every(function (w, i) { return i === 0 || w > warten[i - 1]; }) &&
    karten.every(function (k) { var x = k.getAnimations()[0]; return x && /round/.test(x.effect.getKeyframes()[0].clipPath) &&
      x.effect.getTiming().fill === 'backwards'; }), warten.join());
  pruefe('A8 Datum, Schalter und Knöpfe blenden auf', ['#kopf .datum', '#themaKnopf', '#menuKnopf', '#ticketKnopf'].every(function (s) {
    return q(s).getAnimations().length > 0; }));
  ausbewegt();
  // Ein Tipp überspringt ihn.
  auftritt();
  document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  pruefe('A9 ein Tipp überspringt den Auftritt', !auftrittLaeuft && !document.documentElement.classList.contains('auftritt') &&
    Math.abs(svg().getBoundingClientRect().left - platz.left) < 1);
  ausbewegt();
  // Wird währenddessen neu gezeichnet, endet er still.
  auftritt();
  render();
  pruefe('A10 neu gezeichnet endet er, ohne etwas zurückzulassen', !auftrittLaeuft &&
    !document.documentElement.classList.contains('auftritt') && deckend('#ansicht') === 1);
  // Aus dem Hintergrund zurück: kein Auftritt.
  document.dispatchEvent(new Event('visibilitychange'));
  pruefe('A11 aus dem Hintergrund zurück gibt es keinen', !auftrittLaeuft);
  // Unterwegs und bei abgeschalteter Bewegung auch nicht.
  zeige('einstellungen');
  auftritt();
  pruefe('A12 nur auf dem Dashboard', !auftrittLaeuft);
  zeige('home');
  state.bewegung = 'aus';
  auftritt();
  pruefe('A13 bei abgeschalteter Bewegung startet sofort das Dashboard', !auftrittLaeuft &&
    !document.documentElement.classList.contains('auftritt'));
  frisch();
  speichern();
});
`);
