// Kalender und langer Druck (0.2.0T2): Woche und Monat, Tönung nach dem
// Erledigten, Nachtragen bis sieben Tage zurück — und die Kachel, die kurz
// getippt abhakt und lange gedrückt die Gewohnheit öffnet.
//
// Die Uhr steht: «heute» ist Mittwoch, der 14. Oktober 2026 (KW 42, 12.–18.).
import { readFileSync } from 'node:fs';
import { APP, suite } from '../helfer.mjs';
const html = readFileSync(APP, 'utf8');

suite('kalender', html, String.raw`
jetzt = function () { return new Date(2026, 9, 14, 12, 0); };
var HEUTE = '2026-10-14';
function vor(n) { return tagPlus(HEUTE, -n); }
function gw(id, rhythmus, angelegt, erledigt) {
  return gewohnheitLesen({ id: id, name: id, rhythmus: rhythmus, angelegt: angelegt, erledigt: erledigt || [] });
}
var TAEGLICH = { art: 'taeglich' };
function tag(k) { return q('[data-kaltag="' + k + '"]'); }
function zuKlein(wo) {
  ausbewegt();
  return alle(wo + ' button').filter(function (k) {
    var r = k.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    return r.width < 44 || r.height < 44;
  }).map(function (k) { return k.id || k.className || k.textContent.trim().slice(0, 20); });
}
function aufbauen() {
  frisch();
  kalVersatz = 0;
  kalTag = null;
  state.gewohnheiten = [
    gw('A', TAEGLICH, vor(20), [vor(1), vor(2)]),
    gw('B', TAEGLICH, vor(20), [vor(1)]),
    gw('C', { art: 'proWoche', anzahl: 3 }, vor(20), [vor(1)])
  ];
  zeige('home');
}

// ── K · Kalender ────────────────────────────────────────────
frisch();
pruefe('K1 ohne Gewohnheit kein Kalender', !q('#kalRaster') && !!q('#ersteGewohnheit'));
aufbauen();
pruefe('K2 die Woche ist die Vorgabe', state.kalender === 'woche' &&
  alle('#kalRaster [data-kaltag]').length === 7 && q('#kalTitel').textContent === 'KW 42 · 12.–18. Oktober',
  q('#kalTitel') && q('#kalTitel').textContent);
pruefe('K3 Kalenderwochen nach ISO', kalenderwoche('2025-12-29') === 1 && kalenderwoche('2026-12-28') === 53 &&
  kalenderwoche('2026-10-12') === 42);
pruefe('K4 alles erledigt ist voll', tag(vor(1)).classList.contains('voll'));
pruefe('K5 die Hälfte ist viel', tag(vor(2)).classList.contains('viel'));
pruefe('K6 heute offen ist noch nicht null', tag(HEUTE).classList.contains('frei') && tag(HEUTE).classList.contains('heute'));
pruefe('K7 morgen ist Zukunft', tag(tagPlus(HEUTE, 1)).classList.contains('zukunft'));
pruefe('K8 ein ganz verpaßter Tag ist null', kalStufe(tagesStand(vor(3)), vor(3), HEUTE) === 'null');
function punkte(k) {
  return alle('[data-kaltag="' + k + '"] .kp').map(function (p) { return p.className.replace('kp ', ''); }).join();
}
pruefe('K9 ein Punkt je Gewohnheit, gefüllt wenn erledigt', punkte(vor(1)) === 'erledigt,erledigt,erledigt',
  punkte(vor(1)));
pruefe('K9a verpaßt ist ein Ring, pro Woche ohne Haken fehlt', punkte(vor(2)) === 'erledigt,verpasst', punkte(vor(2)));
pruefe('K9b heute offen, morgen kommt es', punkte(HEUTE) === 'offen,offen' &&
  punkte(tagPlus(HEUTE, 1)) === 'kommt,kommt', punkte(HEUTE) + ' / ' + punkte(tagPlus(HEUTE, 1)));
pruefe('K9c Chili und Kalender sind eine Karte, ganz oben', !!q('.held .tagesring #chiliFigur') &&
  !!q('.held #kalRaster') && q('#ansicht').firstElementChild === q('.held'));
pruefe('K9d der Kalender trägt keine eigene Überschrift mehr', !alle('#ansicht h2').some(function (h) {
  return h.textContent === 'Kalender';
}));
pruefe('K10 pro Woche zählt nur, wenn erledigt', tagesStand(vor(1)).von === 3 && tagesStand(vor(2)).von === 2);
pruefe('K11 Trefferflächen in der Woche', zuKlein('#app').length === 0, zuKlein('#app').join(', '));

q('[data-kalender="monat"]').click();
pruefe('K12 umgeschaltet auf den Monat', state.kalender === 'monat' &&
  alle('#kalRaster [data-kaltag]').length === 31 && q('#kalTitel').textContent === 'Oktober 2026');
pruefe('K13 die Wahl ist gespeichert', JSON.parse(localStorage.getItem(SPEICHER)).kalender === 'monat');
pruefe('K14 und kommt beim Laden zurück', laden().kalender === 'monat');
pruefe('K15 Fremdes fällt auf die Woche', stand({ kalender: 'jahr' }).kalender === 'woche');
// Der 1. Oktober 2026 ist ein Donnerstag, der 31. ein Samstag: drei Lücken
// vorn, eine hinten.
var zellen = alle('#kalRaster .kal-tag').map(function (z) { return z.classList.contains('fremd') ? '-' : 'x'; }).join('');
pruefe('K16 der Monat beginnt am Montag', zellen === '---' + new Array(32).join('x') + '-', zellen);
pruefe('K17 Trefferflächen im Monat', zuKlein('#app').length === 0, zuKlein('#app').join(', '));
q('#kalZurueck').click();
pruefe('K18 ein Monat davor', q('#kalHeute') && q('#kalHeute').textContent === 'September 2026' &&
  alle('#kalRaster [data-kaltag]').length === 30);
q('#kalHeute').click();
pruefe('K19 der Titel führt zurück zu heute', q('#kalTitel').textContent === 'Oktober 2026' && kalVersatz === 0);
// Der Schalter schaltet, wohin man auch tippt: auf das Gewählte wie auf das
// andere (Ticket 0.11.0, ADR 0031).
q('[data-kalender="monat"]').click();
pruefe('K19a ein Tipp auf «Monat» im Monat schaltet zur Woche', state.kalender === 'woche', state.kalender);
q('[data-kalender="woche"]').click();
pruefe('K19b ein Tipp auf «Woche» in der Woche schaltet zum Monat', state.kalender === 'monat', state.kalender);
q('[data-kalender="woche"]').click();
pruefe('K19c und auf das andere wie bisher', state.kalender === 'woche', state.kalender);
q('#kalVor').click();
q('#kalVor').click();
pruefe('K20 eine Woche über die Monatsgrenze', q('#kalHeute').textContent === 'KW 44 · 26. Okt. – 1. Nov.',
  q('#kalHeute').textContent);

// ── N · Tag antippen, nachtragen ────────────────────────────
aufbauen();
var vorher = auswerten(gewohnheitNach('B'), HEUTE).staerke;
tag(vor(2)).click();
pruefe('N1 der Tag zeigt seine Gewohnheiten', !!q('#kalLeiste') &&
  /Montag, 12\. Oktober/.test(q('#kalLeiste').textContent) && alle('[data-nachtrag]').length === 3);
pruefe('N2 er ist gewählt', tag(vor(2)).classList.contains('gewaehlt'));
function status(id) { return q('[data-nachtrag="' + id + '"] .kal-status').textContent; }
pruefe('N2a pro Woche verpaßt keinen Tag', status('C') === 'frei' && status('B') === 'verpasst' &&
  status('A') === 'erledigt', status('A') + ' ' + status('B') + ' ' + status('C'));
q('[data-nachtrag="B"]').click();
pruefe('N3 nachgetragen und gespeichert', gewohnheitNach('B').erledigt.indexOf(vor(2)) !== -1 &&
  JSON.parse(localStorage.getItem(SPEICHER)).gewohnheiten[1].erledigt.indexOf(vor(2)) !== -1);
pruefe('N3a nachtragen läßt die Chili aufflammen', q('#chiliFigur').classList.contains('flammt'));
pruefe('N4 die Stärke rechnet neu', auswerten(gewohnheitNach('B'), HEUTE).staerke > vorher);
pruefe('N5 der Tag ist jetzt voll, die Leiste bleibt offen', tag(vor(2)).classList.contains('voll') && !!q('#kalLeiste'));
q('[data-nachtrag="B"]').click();
pruefe('N6 nochmal = zurück', gewohnheitNach('B').erledigt.indexOf(vor(2)) === -1 &&
  !q('#chiliFigur').classList.contains('flammt'));
tag(vor(2)).click();
pruefe('N7 nochmal antippen schließt den Tag', !q('#kalLeiste') && kalTag === null);
tag(HEUTE).click();
q('[data-nachtrag="A"]').click();
pruefe('N8 heute nachgetragen ist wie abgehakt', q('[data-haken="A"]').getAttribute('aria-pressed') === 'true');
tag(tagPlus(HEUTE, 1)).click();
pruefe('N9 ein künftiger Tag läßt sich nicht abhaken, zeigt aber, was kommt (ADR 0023)', !q('[data-nachtrag]') &&
  alle('#kalLeiste .kal-zeile.kommt').length === 3 && /2 Gewohnheiten sind an diesem Tag dran/.test(q('#kalLeiste').textContent),
  q('#kalLeiste').textContent);
pruefe('N10 auch nicht von Hand', umschalten('A', tagPlus(HEUTE, 1)) === false);
pruefe('N11 sieben Tage zurück geht', umschalten('B', vor(7)) === true && umschalten('B', vor(7)) === true);
pruefe('N12 acht nicht', umschalten('B', vor(8)) === false);
state.gewohnheiten.push(gw('D', TAEGLICH, vor(2), []));
pruefe('N13 vor dem Anlegen nicht', umschalten('D', vor(3)) === false && umschalten('D', vor(2)) === true);
q('[data-kalender="monat"]').click();
tag(vor(8)).click();
pruefe('N14 ein alter Tag zeigt nur an', !q('[data-nachtrag]') && alle('#kalLeiste .kal-zeile').length === 3 &&
  /bis 7 Tage zurück/.test(q('#kalLeiste').textContent));
tag(vor(3)).click();
pruefe('N15 vor dem Anlegen fehlt die Gewohnheit', alle('#kalLeiste .kal-name').map(function (n) {
  return n.textContent;
}).join() === 'A,B,C');
pruefe('N16 Trefferflächen mit offener Leiste', zuKlein('#app').length === 0, zuKlein('#app').join(', '));
var siez = q('#app').innerText.match(/(^|[.!?:]\s+|\s)(Sie|Ihnen|Ihre?[mnrs]?)\b/g);
pruefe('N17 auch der Kalender duzt', !siez, siez && siez.join(' | '));

// ── U · Woche | Monat hält den Tag (ADR 0008) ───────────────
aufbauen();
tag(vor(1)).click();
q('[data-kalender="monat"]').click();
pruefe('U1 zum Monat: der gewählte Tag bleibt, mit seiner Liste', kalTag === vor(1) && !!q('#kalLeiste') &&
  tag(vor(1)).classList.contains('gewaehlt') && q('#kalTitel').textContent === 'Oktober 2026');
q('[data-kalender="woche"]').click();
pruefe('U2 und zurück zur Woche ebenso', kalTag === vor(1) && !!q('#kalLeiste') &&
  q('#kalTitel').textContent === 'KW 42 · 12.–18. Oktober');
tag(vor(1)).click();
q('#kalVor').click();
q('#kalVor').click();
q('#kalVor').click();
q('[data-kalender="monat"]').click();
pruefe('U3 ohne Tag zeigt der Monat, wo die Woche stand', kalVersatz === 1 && q('#kalHeute').textContent === 'November 2026',
  kalVersatz + ' ' + (q('#kalHeute') || q('#kalTitel')).textContent);
tag('2026-11-20').click();
q('[data-kalender="woche"]').click();
pruefe('U4 ein Tag im anderen Monat führt in seine Woche', kalTag === '2026-11-20' && kalVersatz === 5 &&
  q('#kalHeute').textContent === 'KW 47 · 16.–22. November' && !!q('#kalLeiste'), (q('#kalHeute') || q('#kalTitel')).textContent);
tag('2026-11-20').click();
q('[data-kalender="monat"]').click();
q('#kalHeute').click();
q('[data-kalender="woche"]').click();
pruefe('U5 ohne Tag und ohne Blättern bleibt es bei heute', kalVersatz === 0 && q('#kalTitel').textContent === 'KW 42 · 12.–18. Oktober');
pruefe('U6 die Ankerrechnung', kalAnker(HEUTE) === HEUTE && versatzFuer('2026-12-31', HEUTE) === 11 &&
  versatzFuer('2026-10-11', HEUTE) === -1);
state.kalender = 'woche';

// ── H · «Heute» führt den Kalender nach Hause ──────────────
aufbauen();
q('#kalVor').click();
q('#kalVor').click();
q('#heuteKnopf').click();
pruefe('H1 aus der Ferne: zurück zu heute, der Tag gewählt, die Liste offen', kalVersatz === 0 && kalTag === HEUTE &&
  !!q('#kalLeiste') && tag(HEUTE).classList.contains('gewaehlt') && q('#kalTitel').textContent === 'KW 42 · 12.–18. Oktober');
tag(vor(1)).click();
q('#heuteKnopf').click();
pruefe('H2 ein anderer Tag gewählt: heute statt dessen', kalTag === HEUTE && !!q('#kalLeiste'));
q('#heuteKnopf').click();
pruefe('H3 schon da: nichts klappt zu', kalTag === HEUTE && !!q('#kalLeiste'));
q('[data-kalender="monat"]').click();
q('#kalZurueck').click();
q('#heuteKnopf').click();
pruefe('H4 im Monat bleibt es beim Monat, nur zurück zu heute', state.kalender === 'monat' && kalVersatz === 0 &&
  q('#kalTitel').textContent === 'Oktober 2026' && kalTag === HEUTE);
pruefe('H5 «Heute» ist eine Trefferfläche', q('#heuteKnopf').tagName === 'BUTTON' &&
  q('#heuteKnopf').getBoundingClientRect().height >= 44 && q('#tagesZahl').closest('#heuteKnopf') !== null);
state.kalender = 'woche';

// ── S · Wischen zieht den Kalender mit (ADR 0052) ────────────
// Titel, Wochentage und Tage folgen dem Finger 1:1, die Pfeile bleiben stehen.
// Losgelassen wird nach Weg oder Schwung geblättert, sonst federt die Seite
// zurück. Läuft am Ende der Suite, nach dem langen Druck.
function wischPruefen() {
  var RUHE = KAL_WISCH_DAUER + 300;
  function rolle(r) { return q('#kalSpur [data-rolle="' + r + '"]'); }
  function titel() { return q('#kalTitel, #kalHeute').textContent; }
  function zeiger(typ, el, x, y) {
    el.dispatchEvent(new PointerEvent(typ, { bubbles: true, pointerId: 5, isPrimary: true, pointerType: 'touch',
      clientX: x, clientY: y }));
  }
  function punkt(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + Math.min(20, r.height / 2) }; }
  // Ein Zug in «n» Schritten, je «dt» ms auseinander; «los» läßt danach los.
  function ziehen(el, dx, dy, n, dt, los) {
    var a = punkt(el), i = 0;
    zeiger('pointerdown', el, a.x, a.y);
    return new Promise(function (fertig) {
      (function weiter() {
        i++;
        zeiger('pointermove', el, a.x + dx * i / n, a.y + dy * i / n);
        if (i < n) { setTimeout(weiter, dt); return; }
        if (los !== false) zeiger('pointerup', el, a.x + dx, a.y + dy);
        fertig();
      }());
    });
  }
  function ruhig() {
    return ['jetzt', 'davor', 'danach'].every(function (r) {
      var e = rolle(r); return !e.style.clipPath && !e.style.transform && !e.style.opacity;
    }) && !q('#kalSpur').style.height;
  }
  aufbauen();
  var titelZeile = q('#kalSpur [data-rolle="jetzt"] .kal-titelzeile');
  pruefe('S1 Titel, Wochentage und Tage liegen in der Seite, die gleitet; die Pfeile nicht', !!titelZeile &&
    !!rolle('jetzt').querySelector('.kal-wtage') && !!rolle('jetzt').querySelector('#kalRaster') &&
    !q('#kalSpur #kalVor') && !q('#kalSpur #kalZurueck'));
  pruefe('S2 die Nachbarn tragen kein Ziel und sind unsichtbar', !q('#kalSpur [data-rolle="davor"] [data-kaltag]') &&
    getComputedStyle(rolle('davor')).visibility === 'hidden' && rolle('danach').getAttribute('aria-hidden') === 'true');
  pruefe('S3 senkrecht rollt die Seite, waagerecht zieht der Finger', getComputedStyle(q('.held')).touchAction === 'pan-y');
  return ziehen(q('#kalRaster'), -100, 4, 10, 60, false).then(function () {
    var j = rolle('jetzt');
    pruefe('S4 die Seite folgt dem Finger: zieht sich nach links zusammen', /translateX\(-/.test(j.style.transform) &&
      +j.style.opacity <= 1 && /inset/.test(j.style.clipPath) && getComputedStyle(rolle('danach')).visibility === 'visible');
    pruefe('S5 der Stand ändert sich erst beim Loslassen', kalVersatz === 0);
    pruefe('S6 nichts macht die Seite breiter', document.documentElement.scrollWidth <= innerWidth);
    var a = punkt(q('#kalRaster'));
    zeiger('pointerup', q('#kalRaster'), a.x - 100, a.y);
    return warten(RUHE);
  }).then(function () {
    pruefe('S7 kurz und langsam: federt zurück', kalVersatz === 0 && ruhig());
    return ziehen(q('#kalRaster'), -200, 0, 10, 60);
  }).then(function () {
    pruefe('S8 weit genug: die nächste Woche, sofort', kalVersatz === 1 && /KW 43/.test(titel()));
    return warten(RUHE);
  }).then(function () {
    pruefe('S9 und danach steht alles still', ruhig());
    return ziehen(q('#kalRaster'), 40, 0, 2, 20);
  }).then(function () {
    pruefe('S10 ein kurzer, schneller Schubs blättert auch — zurück', kalVersatz === 0, kalVersatz);
    return warten(RUHE);
  }).then(function () {
    return ziehen(q('#kalRaster'), -20, 120, 4, 30);
  }).then(function () {
    pruefe('S11 eher nach unten: nichts gleitet, nichts blättert', kalVersatz === 0 && ruhig());
    return ziehen(q('.kal-wtage'), -200, 0, 10, 60);
  }).then(function () {
    pruefe('S12 auch über den Wochentagen', kalVersatz === 1);
    return ziehen(q('.held'), 200, 0, 10, 60);
  }).then(function () {
    pruefe('S13 auch auf dem Rand der Karte', kalVersatz === 0);
    return ziehen(q('#kalVor'), -200, 0, 10, 60);
  }).then(function () {
    return ziehen(q('.held-kopf'), -200, 0, 10, 60);
  }).then(function () {
    pruefe('S14 nicht auf den Pfeilen, nicht auf Ring und Umschalter', kalVersatz === 0);
    var r = q('#kalRaster').getBoundingClientRect();
    zeiger('pointerdown', q('.held'), 6, r.top + 10);
    zeiger('pointermove', q('.held'), 200, r.top + 10);
    zeiger('pointerup', q('.held'), 200, r.top + 10);
    pruefe('S15 am Rand des Bildschirms beginnt kein Ziehen', kalVersatz === 0 && ruhig());
    return ziehen(q('#kalRaster'), -220, 0, 6, 30, false);
  }).then(function () {
    zeiger('pointercancel', q('#kalRaster'), 0, 0);
    return warten(RUHE);
  }).then(function () {
    pruefe('S16 nimmt das System den Finger, federt die Seite zurück', kalVersatz === 0 && ruhig());
    // Eine offene Tagesliste geht beim Blättern; über ihr wird nicht gezogen.
    kalGewischt = 0;
    tag(HEUTE).click();
    return ziehen(q('#kalLeiste'), -200, 0, 10, 60);
  }).then(function () {
    pruefe('S17 über der Tagesliste zieht nichts', kalVersatz === 0 && kalTag === HEUTE);
    return ziehen(q('#kalRaster'), -200, 0, 10, 60);
  }).then(function () {
    pruefe('S18 geblättert: die Liste geht', kalVersatz === 1 && kalTag === null && !q('#kalLeiste'));
    var t2 = q('#kalRaster [data-kaltag]');
    t2.click();
    pruefe('S19 ein Tipp gleich nach dem Ziehen wählt keinen Tag', kalTag === null);
    kalGewischt = 0;
    t2 = q('#kalRaster [data-kaltag]');
    t2.click();
    pruefe('S20 danach wählt ein Tipp wieder', kalTag === t2.getAttribute('data-kaltag'));
    kalTag = null;
    kalVersatz = 0;
    state.kalender = 'monat';
    render();
    return ziehen(q('#kalRaster'), -200, 0, 10, 60, false);
  }).then(function () {
    pruefe('S21 im Monat gleitet die Höhe mit', parseFloat(q('#kalSpur').style.height) > 0);
    var a = punkt(q('#kalRaster'));
    zeiger('pointerup', q('#kalRaster'), a.x - 200, a.y);
    pruefe('S22 im Monat: der nächste', kalVersatz === 1 && titel() === 'November 2026', titel());
    return warten(RUHE);
  }).then(function () {
    pruefe('S23 danach ist die Spur so hoch wie der neue Monat', ruhig() &&
      Math.abs(q('#kalSpur').offsetHeight - rolle('jetzt').offsetHeight) < 1);
    state.kalender = 'woche';
    kalVersatz = 0;
    render();
  });
}

// ── L · Langer Druck ────────────────────────────────────────
aufbauen();
pruefe('L1 der Pfeil ist weg', !q('[data-bearbeiten]') && !q('.gw-pfeil'));
function druck(id, art, x, y) {
  q('[data-haken="' + id + '"]').dispatchEvent(new PointerEvent(art,
    { bubbles: true, button: 0, clientX: x || 20, clientY: y || 20, pointerType: 'touch' }));
}
function warten(ms) { return new Promise(function (f) { setTimeout(f, ms); }); }

druck('A', 'pointerdown');
var gehalten = q('[data-haken="A"]').classList.contains('halten');
return warten(LANG_MS + 100).then(function () {
  pruefe('L2 die Kachel sinkt beim Halten ein', gehalten);
  pruefe('L3 lange drücken öffnet die Gewohnheit', ansicht === 'bearbeiten' && q('#gwName').value === 'A');
  pruefe('L4 und hakt nicht ab', gewohnheitNach('A').erledigt.indexOf(HEUTE) === -1);
  zeige('home');
  q('[data-haken="A"]').click();
  pruefe('L5 der Klick gleich danach hakt nicht ab', gewohnheitNach('A').erledigt.indexOf(HEUTE) === -1);
  langGedrueckt = 0;
  druck('A', 'pointerdown');
  druck('A', 'pointerup');
  q('[data-haken="A"]').click();
  return warten(LANG_MS + 100);
}).then(function () {
  pruefe('L6 kurz tippen hakt ab und bleibt', ansicht === 'home' && gewohnheitNach('A').erledigt.indexOf(HEUTE) !== -1);
  druck('B', 'pointerdown', 20, 20);
  druck('B', 'pointermove', 20, 60);
  return warten(LANG_MS + 100);
}).then(function () {
  pruefe('L7 wer beim Halten blättert, öffnet nichts', ansicht === 'home' &&
    !q('[data-haken="B"]').classList.contains('halten'));
  q('[data-haken="B"]').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
  pruefe('L8 ein Rechtsklick öffnet auch', ansicht === 'bearbeiten' && q('#gwName').value === 'B');
  langGedrueckt = 0;
  return wischPruefen();
}).then(function () {
  frisch();
  speichern();
});
`);
