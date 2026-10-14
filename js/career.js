/* roLERbot Field Sim: mod carieră. Management în pagina asta, meciurile se joacă în field-sim-3d.html?career=1
 * Stare salvată în localStorage ('rbCareer'). Configurația meciului: 'rbCareerMatch'; rezultatul: 'rbCareerResult'. */
(() => {
  'use strict';
  const KEY = 'rbCareer', MATCH_KEY = 'rbCareerMatch', RESULT_KEY = 'rbCareerResult';
  const WEEK_COST = 150, MAX_SPONSORS = 3;
  const app = document.getElementById('app');
  const FRAMED = window.top !== window.self;   // opened inside the game menu
  const goTop = (url) => { (FRAMED ? window.top : window).location.href = url; };
  if (FRAMED) document.body.classList.add('embed');
  const menuLink = () => (FRAMED ? el('button', { class: 'cr-link', onclick: () => window.parent.postMessage({ rb: 'career-back' }, location.origin) }, '← Meniu') : el('a', { class: 'cr-link', href: 'field-sim-3d.html' }, '← Meniu joc'));

  // ---------- helpers ----------
  const rnd = (a, b) => a + Math.random() * (b - a), irnd = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const eur = (n) => Math.round(n).toLocaleString('ro-RO') + ' €';
  function el(tag, a, ...kids) {
    const e = document.createElement(tag);
    if (a) for (const k in a) { const v = a[k]; if (v === false || v == null) continue; if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v); }
    kids.flat().forEach((c) => { if (c == null || c === false) return; e.append(c.nodeType ? c : document.createTextNode(String(c))); });
    return e;
  }

  // ---------- game data ----------
  const HW = {
    chassis: {
      name: 'Șasiu și roți', tiers: [
        { n: 'Mecanum standard', cost: 0, rep: 0, wk: 0, d: 'Roți mecanum de 96 mm pe un șasiu din aluminiu.', fx: {} },
        { n: 'Mecanum mari + aderență', cost: 900, rep: 0, wk: 1, d: 'Roți mai mari, role cu aderență mai bună pe covor.', fx: { speed: 1.05, accel: 1.12, turn: 1.04 } },
        { n: 'Șasiu optimizat', cost: 2600, rep: 15, wk: 2, d: 'Greutate redusă, centru de masă jos, traction wheels.', fx: { speed: 1.10, accel: 1.26, turn: 1.08 } },
        { n: 'Swerve', cost: 6500, rep: 45, wk: 3, d: 'Fiecare roată se orientează independent. Cea mai agilă variantă.', fx: { speed: 1.15, accel: 1.45, turn: 1.16 } }]
    },
    motors: {
      name: 'Motoare drivetrain', tiers: [
        { n: 'Motoare 312 rpm', cost: 0, rep: 0, wk: 0, d: 'Motoare de bază: sigure, dar nu foarte rapide.', fx: {} },
        { n: 'Motoare 435 rpm', cost: 800, rep: 0, wk: 1, d: 'Raport de transmisie mai bun, viteză mai mare.', fx: { speed: 1.06, accel: 1.08 } },
        { n: '600 rpm + angrenaje', cost: 2400, rep: 15, wk: 2, d: 'Motoare puternice cu angrenaje de precizie.', fx: { speed: 1.12, accel: 1.16 } },
        { n: '1150 rpm + răcire', cost: 5800, rep: 45, wk: 3, d: 'Cele mai rapide motoare, cu radiatoare pentru încălzire.', fx: { speed: 1.18, accel: 1.24 } }]
    },
    intake: {
      name: 'Intake', tiers: [
        { n: 'Rolă simplă', cost: 0, rep: 0, wk: 0, d: 'O rolă din tub chirurgical. Merge, dar e îngustă.', fx: {} },
        { n: 'Roți compliant', cost: 700, rep: 0, wk: 1, d: 'Prinde mingile mai ușor, chiar dacă nu ești perfect aliniat.', fx: { intake: 1.2 } },
        { n: 'Intake lat, 2 role', cost: 2200, rep: 15, wk: 2, d: 'Gură largă care adună mingile și din margine.', fx: { intake: 1.4 } },
        { n: 'Intake activ cu senzor', cost: 5200, rep: 45, wk: 3, d: 'Se închide singur pe minge. Aproape nu mai ratezi.', fx: { intake: 1.62 } }]
    },
    launcher: {
      name: 'Lansator', tiers: [
        { n: 'O roată', cost: 0, rep: 0, wk: 0, d: 'Lansator simplu, cu o singură roată de aruncare.', fx: {} },
        { n: 'Două roți', cost: 1000, rep: 0, wk: 1, d: 'Mingea e prinsă între două roți: tragere mai constantă.', fx: { reload: 0.90, spread: 0.82 } },
        { n: 'Flywheel cu PID', cost: 2800, rep: 15, wk: 2, d: 'Turație stabilă după fiecare tragere. Deblochează turela independentă.', fx: { reload: 0.78, spread: 0.62 } },
        { n: 'Flywheel dublu + turelă rapidă', cost: 6800, rep: 45, wk: 3, d: 'Cadență mare și o precizie bună chiar din mișcare.', fx: { reload: 0.68, spread: 0.45 } }]
    },
    software: {
      name: 'Electronică și software', tiers: [
        { n: 'Control Hub standard', cost: 0, rep: 0, wk: 0, d: 'Control de bază, fără ajutoare la țintire.', fx: {} },
        { n: 'IMU + PID', cost: 600, rep: 0, wk: 1, d: 'Orientare stabilă; ajutorul de țintire prinde mai ușor celula.', fx: { assist: 1.3 } },
        { n: 'Odometrie (pod-uri)', cost: 2000, rep: 15, wk: 2, d: 'Știi exact unde ești pe teren. Țintirea asistată devine mult mai largă.', fx: { assist: 1.7 } },
        { n: 'Cameră + auto-aim', cost: 4800, rep: 45, wk: 3, d: 'Vede celula și ajută cu țintirea de la distanță.', fx: { assist: 2.2 } }]
    }
  };
  const CAP = { speed: [1, 1.38], accel: [1, 1.9], turn: [1, 1.35], intake: [1, 1.8], reload: [0.55, 1], spread: [0.35, 1], assist: [1, 2.6] };
  const BARS = [['speed', 'Viteză'], ['accel', 'Accelerație'], ['turn', 'Rotire'], ['intake', 'Intake (lățime)'], ['reload', 'Cadență de tragere'], ['spread', 'Precizie'], ['assist', 'Ajutor la țintire']];
  const EVENTS = [
    { id: 'loc', name: 'Calificare locală', week: 3, skill: [0.14, 0.50], pay: [2500, 1500, 900, 350], rep: [12, 8, 5, 2] },
    { id: 'reg', name: 'Campionat regional', week: 7, skill: [0.34, 0.70], pay: [4200, 2600, 1500, 500], rep: [18, 12, 8, 3] },
    { id: 'nat', name: 'Campionat național', week: 11, skill: [0.52, 0.90], pay: [7500, 4500, 2600, 800], rep: [28, 18, 12, 4] }
  ];
  const BRANDS = [['Recumed', 'recumed.png'], ['Primăria Vaslui', 'vaslui.png'], ['Domeniile Averești', 'domnav.png'], ['WoodlineMob', 'woodline.png'], ['Specialistul', 'specialistu.png'], ['Mixcod', 'mixcod.png'], ['Gold Studio', 'gold.png'], ['Curs Festiv Events', 'cfe.png'], ['Apisrom', 'apis.png'], ['Safir', 'safir.png']];
  const TEAM_NAMES = ['Gear Gliders', 'Byte Bees', 'Torque Titans', 'Servo Storm', 'Circuit Swarm', 'Pollen Patrol', 'Nectar Knights', 'Hive Hackers', 'Flywheel Foxes', 'Orbit Owls', 'Mecanum Monsters', 'Delta Drivers', 'Quantum Quills', 'Bolt Brigade', 'Alpha Apiary', 'Rotor Rangers'];
  const KINDS = {
    score: { text: (t) => 'Scorează cel puțin ' + t + ' puncte într-un singur meci', target: (e, z) => [20, 30, 40][e] + z * 4, pay: (t) => 600 + t * 14, rep: 4 },
    wins: { text: (t) => 'Câștigă cel puțin ' + t + ' din 4 meciuri de calificare la un eveniment', target: (e) => [2, 3, 3][e], pay: (t) => 900 + t * 350, rep: 6 },
    rank: { text: (t) => 'Termină în top ' + t + ' la un eveniment', target: (e) => [4, 3, 2][e], pay: (t) => 2400 - t * 350, rep: 8 },
    tips: { text: (t) => 'Răstoarnă stupul de ' + t + ' ori (în total)', target: (e) => [3, 5, 8][e], pay: (t) => 500 + t * 130, rep: 4 },
    flowers: { text: (t) => 'Obține ' + t + ' puncte din flori într-un singur meci', target: (e) => [8, 12, 18][e], pay: (t) => 600 + t * 40, rep: 4 }
  };
  const REP_LEVELS = [[0, 'Rookie'], [15, 'Echipă locală'], [40, 'Echipă regională'], [80, 'Echipă națională'], [150, 'Legendă']];
  const repLevel = (r) => REP_LEVELS.filter((l) => r >= l[0]).pop()[1];
  const oppLevel = (k) => (k < 0.25 ? 'Începător' : k < 0.45 ? 'Mediu' : k < 0.65 ? 'Puternic' : 'Elită');

  const addBuff = (s, mod, mul, label) => { s.buffs.push({ mod, mul, label, events: 1 }); };
  const CARDS = [
    { t: 'Voluntari generoși', d: 'Un mentor aduce piese din atelierul lui.', ch: [{ l: 'Mulțumim! (+300 €)', fn: (s) => { s.money += 300; } }] },
    { t: 'Motor ars la antrenament', d: 'Un motor de drivetrain a cedat.', ch: [{ l: 'Repară rapid (−250 €)', need: 250, fn: (s) => { s.money -= 250; } }, { l: 'Lasă așa (viteză −8% la următorul eveniment)', fn: (s) => addBuff(s, 'speed', 0.92, 'Motor slăbit') }] },
    { t: 'Sesiune extra de antrenament', d: 'Șoferii vor încă o zi la volan.', ch: [{ l: 'Da (−120 €, precizie +10% la următorul eveniment)', need: 120, fn: (s) => { s.money -= 120; addBuff(s, 'spread', 0.9, 'Șoferi odihniți'); } }, { l: 'Nu', fn: () => { } }] },
    { t: 'Interviu local', d: 'Presa locală vrea să scrie despre echipă.', ch: [{ l: 'Acceptă (+3 reputație)', fn: (s) => { s.rep += 3; } }] },
    { t: 'Atelier de robotică la școală', d: 'Poți face outreach cu elevii din zonă.', ch: [{ l: 'Organizează (−80 €, +4 reputație)', need: 80, fn: (s) => { s.money -= 80; s.rep += 4; } }, { l: 'Sari peste', fn: () => { } }] },
    { t: 'Baterii noi', d: 'Un distribuitor îți oferă baterii bune la preț mic.', ch: [{ l: 'Cumpără (−150 €, accelerație +8% la următorul eveniment)', need: 150, fn: (s) => { s.money -= 150; addBuff(s, 'accel', 1.08, 'Baterii noi'); } }, { l: 'Refuză', fn: () => { } }] },
    { t: 'Cablu defect', d: 'Un cablu s-a desfăcut chiar înainte de test.', ch: [{ l: 'Refă cablajul (−60 €)', need: 60, fn: (s) => { s.money -= 60; } }, { l: 'Riscă (intake −10% la următorul eveniment)', fn: (s) => addBuff(s, 'intake', 0.9, 'Cablaj slab') }] }
  ];

  // ---------- state ----------
  let S = null, tab = 'hub';
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
  const load = () => { try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); return j && j.v === 1 ? j : null; } catch (e) { return null; } };
  const log = (m) => { S.log.unshift(m); S.log = S.log.slice(0, 14); };
  function newState(name) {
    const s = { v: 1, team: { name, num: String(irnd(10000, 29999)) }, money: 3000, rep: 0, week: 1, season: 1, evIndex: 0, evCount: 0, hw: { chassis: 0, motors: 0, intake: 0, launcher: 0, software: 0 }, build: [], type: 'strafe', sponsors: [], offers: [], sponsorLog: [], event: null, pending: null, buffs: [], practiceWeek: 0, history: [], log: [], stats: { w: 0, l: 0, t: 0, tips: 0, titles: 0 }, summary: null, lastMatch: null, card: null };
    S = s; s.offers = genOffers(); log('Ai fondat echipa ' + name + ' (#' + s.team.num + '). Sezonul 1 începe.'); return s;
  }
  function modsOf(s, withBuffs = true) {
    const m = { speed: 1, accel: 1, turn: 1, intake: 1, reload: 1, spread: 1, assist: 1 };
    for (const c in HW) { const fx = HW[c].tiers[s.hw[c]].fx; for (const k in fx) m[k] *= fx[k]; }
    if (withBuffs) for (const b of s.buffs) m[b.mod] *= b.mul;
    for (const k in m) m[k] = Math.round(clamp(m[k], CAP[k][0], CAP[k][1]) * 1000) / 1000;
    return m;
  }
  const barPct = (k, v) => { const [lo, hi] = CAP[k]; return Math.round(((k === 'reload' || k === 'spread') ? (1 - v) / (1 - lo) : (v - 1) / (hi - 1)) * 100); };
  const barTxt = (k, v) => ((k === 'reload' || k === 'spread') ? '−' + Math.round((1 - v) * 100) + '%' : '+' + Math.round((v - 1) * 100) + '%');
  const nextEvent = () => EVENTS[S.evIndex];
  const canTurret = () => S.hw.launcher >= 2;
  const activeSponsors = () => S.sponsors.filter((x) => x.status === 'active');

  // ---------- sponsors ----------
  function genOffers() {
    const e = Math.min(S ? S.evIndex : 0, 2), z = S ? S.season - 1 : 0, taken = new Set((S ? activeSponsors() : []).map((x) => x.brand));
    const brands = shuffle(BRANDS.filter((b) => !taken.has(b[0]))).slice(0, 3), kinds = shuffle(Object.keys(KINDS)).slice(0, 3);
    return brands.map((b, i) => { const K = KINDS[kinds[i]], t = K.target(e, z), pay = Math.round((K.pay(t) * (1 + z * .2)) / 10) * 10;
      return { id: Date.now() + '-' + i + irnd(10, 99), brand: b[0], logo: b[1], kind: kinds[i], target: t, pay, signing: Math.round((pay * .2) / 10) * 10, rep: K.rep + z, expires: (S ? S.evCount : 0) + 2 }; });
  }
  function acceptOffer(o) {
    if (activeSponsors().length >= MAX_SPONSORS) return toast('Ai deja ' + MAX_SPONSORS + ' contracte active.');
    S.offers = S.offers.filter((x) => x.id !== o.id); S.sponsors.push(Object.assign({}, o, { status: 'active', progress: 0 }));
    S.money += o.signing; log('Contract nou cu ' + o.brand + ': +' + eur(o.signing) + ' bonus de semnare.'); save(); render();
  }
  function finishSponsor(sp, ok) {
    sp.status = ok ? 'done' : 'failed';
    if (ok) { S.money += sp.pay; S.rep += sp.rep; log(sp.brand + ' e mulțumit: +' + eur(sp.pay) + ', +' + sp.rep + ' reputație.'); }
    else { S.rep = Math.max(0, S.rep - 3); log(sp.brand + ' a anulat contractul (obiectiv ratat): −3 reputație.'); }
    S.sponsorLog.unshift({ brand: sp.brand, text: KINDS[sp.kind].text(sp.target), ok, pay: sp.pay }); S.sponsorLog = S.sponsorLog.slice(0, 10);
    return ok;
  }
  function evalSponsors(ctx) {
    const done = [];
    for (const sp of activeSponsors()) {
      let ok = false;
      if (ctx.kind === 'match') {
        if (sp.kind === 'score') ok = ctx.res.my >= sp.target;
        else if (sp.kind === 'flowers') ok = (ctx.res.flowers || 0) >= sp.target;
        else if (sp.kind === 'tips') { sp.progress += ctx.res.tips || 0; ok = sp.progress >= sp.target; }
      } else {
        if (sp.kind === 'wins') ok = ctx.wins >= sp.target;
        else if (sp.kind === 'rank') ok = ctx.rank <= sp.target;
      }
      if (ok) { finishSponsor(sp, true); done.push(sp.brand); }
    }
    return done;
  }

  // ---------- hardware ----------
  const pendingFor = (cat) => S.build.find((b) => b.cat === cat);
  function buy(cat, express) {
    const cur = S.hw[cat], t = HW[cat].tiers[cur + 1]; if (!t || pendingFor(cat)) return;
    const cost = Math.round(t.cost * (express ? 1.4 : 1));
    if (S.rep < t.rep) return toast('Ai nevoie de ' + t.rep + ' reputație.');
    if (S.money < cost) return toast('Nu ai destui bani (' + eur(cost) + ').');
    S.money -= cost;
    if (express) { S.hw[cat] = cur + 1; log(HW[cat].name + ': ' + t.n + ' montat imediat (express, −' + eur(cost) + ').'); }
    else { S.build.push({ cat, tier: cur + 1, ready: S.week + t.wk }); log('Comandat: ' + t.n + ' (−' + eur(cost) + '). Gata în ' + t.wk + ' săpt.'); }
    save(); render();
  }
  function installReady() {
    for (const b of S.build.slice()) if (b.ready <= S.week) { S.hw[b.cat] = b.tier; S.build = S.build.filter((x) => x !== b); log('Montat: ' + HW[b.cat].tiers[b.tier].n + '. Robotul e mai bun.'); }
    if (!canTurret()) S.type = 'strafe';
  }

  // ---------- calendar / events ----------
  function advanceWeek() {
    const ev = nextEvent(); if (S.week >= ev.week) return;
    S.week++; S.money -= WEEK_COST; installReady(); log('Săptămâna ' + S.week + ': cheltuieli de echipă −' + eur(WEEK_COST) + '.');
    if (Math.random() < 0.32 && S.week < ev.week) S.card = Math.floor(Math.random() * CARDS.length);
    save(); render();
  }
  function startEvent() {
    const def = nextEvent(), z = (S.season - 1) * 0.08, names = shuffle(TEAM_NAMES).slice(0, 7);
    const lo = clamp(def.skill[0] + z, 0, .97), hi = clamp(def.skill[1] + z, 0, .98);
    const teams = [{ name: S.team.name, me: true, rp: 0, pts: 0, played: 0, w: 0, l: 0, t: 0 }].concat(shuffle(names.map((n, i) => ({ name: n, skill: clamp(lo + (hi - lo) * (i / 6) + rnd(-.04, .04), 0, 1), rp: 0, pts: 0, played: 0, w: 0, l: 0, t: 0 }))));
    S.event = { id: def.id, name: def.name, teams, round: 0, sched: shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, 4), alliances: [0, 1, 2, 3].map(() => pick(['red', 'blue'])), hist: [] };
    log('Ai intrat la ' + def.name + '. 4 meciuri de calificare.'); save(); render();
  }
  function simScore(t) { return Math.max(0, Math.round(10 + 48 * t.skill + gauss() * 9)); }
  function simPair(a, b) {
    const sa = simScore(a), sb = simScore(b), ra = sa > sb ? 3 : sa === sb ? 1 : 0, rb = sb > sa ? 3 : sa === sb ? 1 : 0;
    a.rp += ra + (sa >= 38 && Math.random() < .6 ? 1 : 0); b.rp += rb + (sb >= 38 && Math.random() < .6 ? 1 : 0); a.pts += sa; b.pts += sb; a.played++; b.played++;
    if (ra > rb) { a.w++; b.l++; } else if (rb > ra) { b.w++; a.l++; } else { a.t++; b.t++; }
  }
  function launch(kind) {
    const id = Date.now() + '-' + irnd(1000, 9999);
    let opp, alliance, label;
    if (kind === 'qual') { const ev = S.event; opp = ev.teams[ev.sched[ev.round]]; alliance = ev.alliances[ev.round]; label = ev.name + ' · meciul ' + (ev.round + 1) + '/4'; }
    else { opp = { name: pick(TEAM_NAMES) + ' (antrenament)', skill: clamp(rnd(0.25, 0.6) + (S.season - 1) * .05, 0, .95) }; alliance = pick(['red', 'blue']); label = 'Antrenament'; }
    S.pending = { id, kind }; save();
    try { localStorage.setItem(MATCH_KEY, JSON.stringify({ id, type: kind, label, alliance, robot: canTurret() ? S.type : 'strafe', mods: modsOf(S), team: S.team, opp: { name: opp.name, skill: opp.skill }, ts: Date.now() })); localStorage.removeItem(RESULT_KEY); } catch (e) { return toast('Nu pot salva meciul (stocarea e blocată).'); }
    goTop('field-sim-3d.html?career=1');
  }
  function applyResult(res) {
    const p = S.pending; if (!p || p.id !== res.id) return false;
    const my = res.my, op = res.opp, win = my > op, tie = my === op; let rp = win ? 3 : tie ? 1 : 0; const tags = [];
    if ((res.lp || 0) >= 16) { rp++; tags.push('SWARM'); } if ((res.tips || 0) >= 4) { rp++; tags.push('POLLINATOR 1'); } if ((res.tips || 0) >= 7) { rp++; tags.push('POLLINATOR 2'); }
    S.stats.tips += res.tips || 0; if (win) S.stats.w++; else if (tie) S.stats.t++; else S.stats.l++;
    const lm = { kind: p.kind, my, op, win, tie, rp, tags, flowers: res.flowers || 0, tips: res.tips || 0, opp: null, money: 0, sponsors: [], eventDone: false };
    if (p.kind === 'qual' && S.event) {
      const ev = S.event, opp = ev.teams[ev.sched[ev.round]], me = ev.teams[0]; lm.opp = opp.name;
      me.rp += rp; me.pts += my; me.played++; if (win) me.w++; else if (tie) me.t++; else me.l++;
      opp.rp += win ? 0 : tie ? 1 : 3; opp.pts += op; opp.played++; if (win) opp.l++; else if (tie) opp.t++; else opp.w++;
      const rest = shuffle(ev.teams.slice(1).filter((t) => t !== opp)); for (let i = 0; i + 1 < rest.length; i += 2) simPair(rest[i], rest[i + 1]);
      ev.hist.push({ opp: opp.name, my, op, rp }); ev.round++;
      log('Meci ' + ev.round + '/4 vs ' + opp.name + ': ' + my + '–' + op + (win ? ' (victorie)' : tie ? ' (egal)' : ' (înfrângere)') + ', +' + rp + ' RP.');
    } else if (p.kind === 'practice') {
      const gain = 120 + Math.min(my, 40) * 5 + (win ? 100 : 0); S.money += gain; lm.money = gain; if (win) S.rep += 1; S.practiceWeek = S.week;
      log('Antrenament: ' + my + '–' + op + ', +' + eur(gain) + (win ? ', +1 reputație' : '') + '.');
    }
    lm.sponsors = evalSponsors({ kind: 'match', res });
    if (p.kind === 'qual' && S.event && S.event.round >= 4) { lm.eventDone = true; finishEvent(); }
    S.pending = null; S.lastMatch = lm; save(); return true;
  }
  function finishEvent() {
    const ev = S.event, def = EVENTS[S.evIndex], z = 1 + (S.season - 1) * .25;
    const sorted = ev.teams.slice().sort((a, b) => b.rp - a.rp || b.pts - a.pts), rank = sorted.findIndex((t) => t.me) + 1, k = rank === 1 ? 0 : rank === 2 ? 1 : rank <= 4 ? 2 : 3;
    const prize = Math.round(def.pay[k] * z), repGain = def.rep[k], me = ev.teams[0];
    S.money += prize; S.rep += repGain; if (rank === 1) S.stats.titles++;
    const done = evalSponsors({ kind: 'event', rank, wins: me.w });
    S.buffs.forEach((b) => { b.events--; }); S.buffs = S.buffs.filter((b) => b.events > 0);
    S.evCount++; S.evIndex++; S.history.unshift({ season: S.season, name: def.name, rank, rp: me.rp, w: me.w, l: me.l, t: me.t, prize });
    for (const sp of activeSponsors()) if (sp.expires <= S.evCount) finishSponsor(sp, false);
    S.summary = { name: def.name, rank, sorted: sorted.map((t) => ({ name: t.name, rp: t.rp, pts: t.pts, w: t.w, l: t.l, t: t.t, me: !!t.me })), prize, rep: repGain, sponsors: done, seasonEnd: false };
    log(def.name + ': locul ' + rank + ' (+' + eur(prize) + ', +' + repGain + ' reputație).');
    S.week = def.week + 1; S.event = null;
    if (S.evIndex >= EVENTS.length) { S.summary.seasonEnd = true; S.season++; S.evIndex = 0; S.week = 1; S.money += 500; log('Sezonul s-a încheiat. Buget nou de sezon: +' + eur(500) + '. Adversarii devin mai puternici.'); }
    S.offers = genOffers(); installReady();
  }
  function forfeit() {
    const p = S.pending; if (!p) return;
    applyResult({ id: p.id, my: 0, opp: 30, lp: 0, tips: 0, flowers: 0 }); render();
  }

  // ---------- ui bits ----------
  function toast(msg) { document.querySelectorAll('.cr-toast').forEach((n) => n.remove()); const t = el('div', { class: 'cr-toast', text: msg }); document.body.append(t); setTimeout(() => t.remove(), 3200); }
  function modal(content) {
    const m = el('div', { class: 'cr-modal' }, el('div', { class: 'box' }, content)); document.body.append(m);
    return { close: () => m.remove() };
  }
  function bars(m) {
    return el('div', { class: 'cr-bars' }, BARS.map(([k, label]) => el('div', { class: 'cr-bar' }, el('span', { text: label }), el('div', { class: 'track' }, el('i', { style: 'width:' + clamp(barPct(k, m[k]), 0, 100) + '%' })), el('b', { text: barTxt(k, m[k]) }))));
  }
  const tabs = [['hub', 'Acasă'], ['robot', 'Robot și hardware'], ['sponsors', 'Sponsori'], ['event', 'Eveniment'], ['history', 'Istoric']];

  // ---------- views ----------
  function header() {
    const ev = nextEvent();
    return el('header', { class: 'cr-top' },
      el('a', { class: 'cr-brand', href: 'index.html', target: FRAMED ? '_top' : null }, 'ro', el('span', { text: 'LER' }), 'bot'),
      el('div', { class: 'cr-team' }, el('b', { text: S.team.name }), el('small', { text: '#' + S.team.num + ' · ' + repLevel(S.rep) })),
      el('div', { class: 'cr-stats' },
        el('div', { class: 'cr-chip money' }, el('small', { text: 'Buget' }), el('b', { text: eur(S.money) })),
        el('div', { class: 'cr-chip rep' }, el('small', { text: 'Reputație' }), el('b', { text: Math.round(S.rep) })),
        el('div', { class: 'cr-chip' }, el('small', { text: 'Sezon ' + S.season }), el('b', { text: 'Săpt. ' + S.week }))),
      el('div', { class: 'cr-links' }, menuLink(), FRAMED ? null : el('a', { class: 'cr-link', href: 'index.html' }, '← Site')));
  }
  function nav() {
    const dot = (id) => (id === 'sponsors' && S.offers.length && activeSponsors().length < MAX_SPONSORS) || (id === 'event' && S.week >= nextEvent().week) ? el('span', { class: 'dot' }) : null;
    return el('nav', { class: 'cr-nav' }, tabs.map(([id, label]) => el('button', { class: tab === id ? 'on' : '', onclick: () => { tab = id; render(); } }, label, dot(id))));
  }
  function pendingBanner() {
    if (!S.pending) return null;
    return el('div', { class: 'banner' }, el('span', { text: 'Ai un meci început și nefinalizat. Îl poți relua sau îl poți abandona (se numără ca înfrângere).' }),
      el('div', { class: 'cr-row' }, el('button', { class: 'cr-btn pri sm', text: 'Reia meciul', onclick: () => { const p = S.pending; S.pending = null; launch(p.kind); } }), el('button', { class: 'cr-btn sm', text: 'Abandonează', onclick: forfeit })));
  }
  function hubView() {
    const ev = nextEvent(), left = ev.week - S.week, m = modsOf(S), practiced = S.practiceWeek === S.week;
    const nextCard = el('div', { class: 'cr-card s7' }, el('div', { class: 'cr-eyebrow', text: 'Sezonul ' + S.season + ' · eveniment ' + (S.evIndex + 1) + '/' + EVENTS.length }),
      el('h2', { text: ev.name }),
      el('p', { class: 'cr-sub', text: S.event ? 'Ești în mijlocul evenimentului. Continuă din tabul Eveniment.' : left > 0 ? 'Mai sunt ' + left + ' săptămâni. Cheltuiește bugetul pe upgrade-uri, semnează sponsori și antrenează-te.' : 'E ziua competiției! Poți intra în eveniment.' }),
      el('div', { class: 'cr-row' },
        S.event ? el('button', { class: 'cr-btn pri', text: 'Mergi la eveniment', onclick: () => { tab = 'event'; render(); } })
          : left > 0 ? el('button', { class: 'cr-btn pri', text: 'Avansează o săptămână (−' + WEEK_COST + ' €)', onclick: advanceWeek })
            : el('button', { class: 'cr-btn pri', text: 'Intră în eveniment', onclick: () => { startEvent(); tab = 'event'; render(); } }),
        el('button', { class: 'cr-btn', disabled: practiced || !!S.pending, text: practiced ? 'Antrenament făcut săptămâna asta' : 'Meci de antrenament (+bani)', onclick: () => launch('practice') })),
      S.buffs.length ? el('p', { class: 'cr-note', style: 'margin-top:12px' }, 'Efecte active: ', S.buffs.map((b) => b.label + ' (' + (b.mul < 1 ? (b.mod === 'spread' || b.mod === 'reload' ? '+' : '−') : '+') + Math.round(Math.abs(1 - b.mul) * 100) + '% ' + b.mod + ')').join(' · ')) : null);
    const robotCard = el('div', { class: 'cr-card s5' }, el('div', { class: 'cr-eyebrow', text: 'Robotul tău' }), el('h2', { text: 'Performanță' }), bars(m),
      el('div', { class: 'cr-row', style: 'margin-top:14px' }, el('button', { class: 'cr-btn sm', text: 'Upgrade-uri', onclick: () => { tab = 'robot'; render(); } })));
    const sp = activeSponsors();
    const spCard = el('div', { class: 'cr-card s6' }, el('div', { class: 'cr-eyebrow', text: 'Sponsori' }), el('h2', { text: sp.length ? 'Contracte active (' + sp.length + '/' + MAX_SPONSORS + ')' : 'Niciun contract activ' }),
      sp.length ? el('div', { class: 'sp-list' }, sp.map((x) => el('div', { class: 'sp' }, el('img', { src: 'assets/img/portfolio/' + x.logo, alt: x.brand }), el('div', null, el('h4', { text: x.brand }), el('p', { text: KINDS[x.kind].text(x.target) })), el('div', { class: 'meta', text: eur(x.pay) })))) : el('p', { class: 'cr-sub', text: 'Sponsorii îți dau bani dacă îndeplinești obiectivele din contract.' }),
      el('div', { class: 'cr-row', style: 'margin-top:12px' }, el('button', { class: 'cr-btn sm', text: 'Vezi oferte', onclick: () => { tab = 'sponsors'; render(); } })));
    const logCard = el('div', { class: 'cr-card s6' }, el('div', { class: 'cr-eyebrow', text: 'Jurnal' }), el('h2', { text: 'Ce s-a întâmplat' }), el('div', { class: 'log' }, S.log.slice(0, 8).map((l) => el('div', { text: l }))));
    return el('div', { class: 'cr-grid' }, nextCard, robotCard, spCard, logCard);
  }
  function robotView() {
    const m = modsOf(S);
    const cards = Object.keys(HW).map((cat) => {
      const H = HW[cat], cur = S.hw[cat], pend = pendingFor(cat);
      return el('div', { class: 'hw' }, el('div', { class: 'hw-head' }, el('h3', { text: H.name }), el('span', { class: 'hw-cur', text: 'Montat: ' + H.tiers[cur].n })),
        el('div', { class: 'tiers' }, H.tiers.map((t, i) => {
          const installed = i <= cur, building = pend && pend.tier === i, next = i === cur + 1 && !pend, locked = !installed && !building && !next;
          const fx = Object.keys(t.fx).map((k) => { const lab = { speed: 'viteză', accel: 'accel.', turn: 'rotire', intake: 'intake', reload: 'cadență', spread: 'precizie', assist: 'țintire' }[k], v = t.fx[k]; return lab + ' ' + (v < 1 ? '−' : '+') + Math.round(Math.abs(1 - v) * 100) + '%'; }).join(' · ');
          const rep = S.rep >= t.rep;
          return el('div', { class: 'tier ' + (installed ? 'installed' : building ? 'building' : locked ? 'locked' : '') },
            el('span', { class: 'tag ' + (installed ? '' : building ? 'gold' : 'dim'), text: installed ? (i === cur ? 'Montat' : 'Depășit') : building ? 'Se construiește · săpt. ' + pend.ready : 'Treapta ' + (i + 1) }),
            el('b', { text: t.n }), el('p', { text: t.d }), fx ? el('div', { class: 'fx', text: fx }) : null,
            next ? el('div', { class: 'cr-row' }, el('button', { class: 'cr-btn sm pri', disabled: !rep || S.money < t.cost, text: eur(t.cost) + ' · ' + t.wk + ' săpt.', onclick: () => buy(cat, false) }), el('button', { class: 'cr-btn sm', disabled: !rep || S.money < Math.round(t.cost * 1.4), title: 'Livrare imediată, +40%', text: 'Express', onclick: () => buy(cat, true) })) : null,
            next && !rep ? el('div', { class: 'cr-note', text: 'Necesită ' + t.rep + ' reputație' }) : null,
            !installed && !building && !next && i > cur + 1 ? el('div', { class: 'cr-note', text: 'Mai întâi treapta anterioară' }) : null);
        })));
    });
    return el('div', { class: 'cr-grid' },
      el('div', { class: 'cr-card s5' }, el('div', { class: 'cr-eyebrow', text: 'Statistici' }), el('h2', { text: 'Robotul acum' }), bars(m),
        el('div', { style: 'margin-top:16px' }, el('div', { class: 'cr-eyebrow', text: 'Configurație' }),
          el('div', { class: 'cr-row' }, ['strafe', 'turret'].map((t) => el('button', { class: 'cr-btn sm' + (S.type === t ? ' pri' : ''), disabled: t === 'turret' && !canTurret(), text: t === 'strafe' ? 'Full strafe' : 'Turelă independentă', onclick: () => { S.type = t; save(); render(); } }))),
          !canTurret() ? el('p', { class: 'cr-note', style: 'margin-top:8px', text: 'Turela se deblochează cu lansatorul „Flywheel cu PID” (treapta 3).' }) : null)),
      el('div', { class: 'cr-card s7' }, el('div', { class: 'cr-eyebrow', text: 'Atelier' }), el('h2', { text: 'Upgrade-uri de hardware' }), el('p', { class: 'cr-sub', text: 'Piesele noi durează câteva săptămâni până sunt gata (sau plătești express cu 40% mai mult). Treptele de sus cer reputație.' }),
        S.build.length ? el('p', { class: 'cr-note', text: 'În lucru: ' + S.build.map((b) => HW[b.cat].tiers[b.tier].n + ' (săpt. ' + b.ready + ')').join(', ') }) : null),
      el('div', { class: 'cr-card' }, el('div', { class: 'hw-grid' }, cards)));
  }
  function sponsorsView() {
    const act = activeSponsors();
    const row = (x, kind) => el('div', { class: 'sp ' + (x.status || '') }, el('img', { src: 'assets/img/portfolio/' + x.logo, alt: x.brand }),
      el('div', null, el('h4', { text: x.brand }), el('p', { text: KINDS[x.kind].text(x.target) }),
        el('div', { class: 'meta', text: (kind === 'offer' ? 'Semnare ' + eur(x.signing) + ' · la final ' : 'La final ') + eur(x.pay) + ' · +' + x.rep + ' reputație · valabil ' + Math.max(1, x.expires - S.evCount) + ' evenimente' }),
        kind === 'active' && x.kind === 'tips' ? el('div', { class: 'prog' }, el('i', { style: 'width:' + clamp(x.progress / x.target * 100, 0, 100) + '%' })) : null),
      kind === 'offer' ? el('button', { class: 'cr-btn pri sm', disabled: act.length >= MAX_SPONSORS, text: 'Acceptă', onclick: () => acceptOffer(x) }) : el('span', { class: 'cr-note', text: kind === 'active' ? 'Activ' : '' }));
    return el('div', { class: 'cr-grid' },
      el('div', { class: 'cr-card s6' }, el('div', { class: 'cr-eyebrow', text: 'Contracte' }), el('h2', { text: 'Active (' + act.length + '/' + MAX_SPONSORS + ')' }), act.length ? el('div', { class: 'sp-list' }, act.map((x) => row(x, 'active'))) : el('p', { class: 'cr-sub', text: 'Alege o ofertă din dreapta.' })),
      el('div', { class: 'cr-card s6' }, el('div', { class: 'cr-eyebrow', text: 'Oferte' }), el('h2', { text: 'Sponsori interesați' }), S.offers.length ? el('div', { class: 'sp-list' }, S.offers.map((x) => row(x, 'offer'))) : el('p', { class: 'cr-sub', text: 'Apar oferte noi după fiecare eveniment.' })),
      S.sponsorLog.length ? el('div', { class: 'cr-card' }, el('h3', { text: 'Contracte încheiate' }), el('div', { class: 'log' }, S.sponsorLog.map((x) => el('div', { text: x.brand + ': ' + x.text + ' → ' + (x.ok ? 'îndeplinit (+' + eur(x.pay) + ')' : 'ratat') })))) : null,
      el('div', { class: 'cr-card' }, el('p', { class: 'cr-note', text: 'Sponsorii sunt partenerii reali ai echipei roLERbot, dar contractele, sumele și obiectivele din joc sunt fictive și există doar în simulare.' })));
  }
  function standings(teams) {
    const sorted = teams.slice().sort((a, b) => b.rp - a.rp || b.pts - a.pts);
    return el('table', { class: 'st' }, el('thead', null, el('tr', null, ['#', 'Echipă', 'RP', 'Puncte', 'V-E-Î'].map((h) => el('th', { text: h })))),
      el('tbody', null, sorted.map((t, i) => el('tr', { class: t.me ? 'me' : '' }, el('td', { class: 'n', text: i + 1 }), el('td', { text: t.name }), el('td', { text: t.rp }), el('td', { text: t.pts }), el('td', { text: t.w + '-' + t.t + '-' + t.l })))));
  }
  function eventView() {
    const ev = S.event, def = nextEvent();
    if (!ev) {
      const left = def.week - S.week;
      return el('div', { class: 'cr-grid' }, el('div', { class: 'cr-card' }, el('div', { class: 'cr-eyebrow', text: 'Calendar sezon ' + S.season }), el('h2', { text: def.name }),
        el('p', { class: 'cr-sub', text: left > 0 ? 'Începe în săptămâna ' + def.week + ' (peste ' + left + ' săptămâni). 4 meciuri de calificare, apoi premii după loc.' : 'Ziua competiției a venit.' }),
        el('div', { class: 'cr-row' }, left > 0 ? el('button', { class: 'cr-btn pri', text: 'Avansează o săptămână (−' + WEEK_COST + ' €)', onclick: advanceWeek }) : el('button', { class: 'cr-btn pri', text: 'Intră în eveniment', onclick: () => { startEvent(); } })),
        el('div', { style: 'margin-top:18px' }, el('div', { class: 'cr-eyebrow', text: 'Premii' }), el('div', { class: 'log' }, ['Locul 1', 'Locul 2', 'Locurile 3–4', 'Restul'].map((l, i) => el('div', { text: l + ': ' + eur(def.pay[i] * (1 + (S.season - 1) * .25)) + ' · +' + def.rep[i] + ' reputație' }))))));
    }
    const r = ev.round, opp = r < 4 ? ev.teams[ev.sched[r]] : null, al = ev.alliances[r] || 'red';
    return el('div', { class: 'cr-grid' },
      el('div', { class: 'cr-card s7' }, el('div', { class: 'cr-eyebrow', text: ev.name + ' · calificări' }), el('h2', { text: r < 4 ? 'Meciul ' + (r + 1) + ' din 4' : 'Calificări încheiate' }),
        opp ? el('div', { class: 'vs' }, el('div', { class: 'side' }, el('b', { class: 'al-' + al, text: S.team.name }), el('small', { text: 'Alianța ' + (al === 'red' ? 'roșie' : 'albastră') })), el('div', { class: 'mid', text: 'VS' }), el('div', { class: 'side r' }, el('b', { class: 'al-' + (al === 'red' ? 'blue' : 'red'), text: opp.name }), el('small', { text: 'Nivel: ' + oppLevel(opp.skill) }))) : null,
        opp ? el('div', { class: 'cr-row' }, el('button', { class: 'cr-btn pri', disabled: !!S.pending, text: 'Joacă meciul ' + (r + 1), onclick: () => launch('qual') }), el('span', { class: 'cr-note', text: 'Se deschide jocul 3D. La final apeși „Continuă cariera”.' })) : null,
        ev.hist.length ? el('div', { style: 'margin-top:16px' }, el('div', { class: 'cr-eyebrow', text: 'Meciurile tale' }), el('div', { class: 'hist' }, ev.hist.map((h, i) => el('div', { class: 'h' }, el('div', null, 'vs ' + h.opp, el('small', { text: 'Meciul ' + (i + 1) })), el('b', { text: h.my + '–' + h.op + ' · +' + h.rp + ' RP' }))))) : null),
      el('div', { class: 'cr-card s5' }, el('h3', { text: 'Clasament' }), standings(ev.teams)));
  }
  function historyView() {
    const st = S.stats;
    return el('div', { class: 'cr-grid' },
      el('div', { class: 'cr-card s5' }, el('div', { class: 'cr-eyebrow', text: 'Statistici' }), el('h2', { text: 'Cariera ta' }),
        el('div', { class: 'log' }, [['Victorii', st.w], ['Egaluri', st.t], ['Înfrângeri', st.l], ['Stupi răsturnați', st.tips], ['Titluri', st.titles], ['Reputație', Math.round(S.rep) + ' (' + repLevel(S.rep) + ')']].map(([a, b]) => el('div', { text: a + ': ' + b })))),
      el('div', { class: 'cr-card s7' }, el('div', { class: 'cr-eyebrow', text: 'Evenimente' }), el('h2', { text: 'Istoric' }),
        S.history.length ? el('div', { class: 'hist' }, S.history.map((h) => el('div', { class: 'h' }, el('div', null, h.name, el('small', { text: 'Sezonul ' + h.season + ' · ' + h.w + '-' + h.t + '-' + h.l + ' · ' + h.rp + ' RP' })), el('b', { text: 'Locul ' + h.rank + ' · +' + eur(h.prize) })))) : el('p', { class: 'cr-sub', text: 'Încă niciun eveniment jucat.' })),
      el('div', { class: 'cr-card' }, el('h3', { text: 'Date' }), el('p', { class: 'cr-note', text: 'Progresul e salvat în acest browser. Dacă ștergi datele site-ului, se pierde.' }),
        el('button', { class: 'cr-btn sm', text: 'Resetează cariera', onclick: () => { if (confirm('Ștergi toată cariera și o iei de la capăt?')) { localStorage.removeItem(KEY); localStorage.removeItem(MATCH_KEY); localStorage.removeItem(RESULT_KEY); S = null; render(); } } })));
  }
  function welcome() {
    const inp = el('input', { class: 'cr-in', value: 'roLERbot', maxlength: 22, placeholder: 'Numele echipei' });
    const go = () => { const n = inp.value.trim() || 'roLERbot'; newState(n); save(); render(); };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    return el('main', { class: 'cr-main' }, el('div', { class: 'welcome' },
      el('div', { class: 'cr-eyebrow', text: 'FTC · BIOBUZZ 2026/27' }),
      el('h1', null, 'Construiește-ți ', el('span', { text: 'echipa' }), '.'),
      el('p', { class: 'cr-sub', text: 'Începi cu un robot simplu și un buget mic. Cumperi hardware mai bun, semnezi sponsori, câștigi evenimente și urci de la echipă locală la campionatul național. Meciurile se joacă în simulatorul 3D, iar upgrade-urile îți schimbă robotul cu adevărat.' }),
      el('div', { class: 'cr-eyebrow', style: 'margin-top:20px', text: 'Numele echipei' }), inp,
      el('div', { class: 'cr-row', style: 'margin-top:14px' }, el('button', { class: 'cr-btn pri', text: 'Începe cariera', onclick: go }), menuLink(), FRAMED ? null : el('a', { class: 'cr-link', href: 'index.html' }, '← Site'))));
  }

  // ---------- popups ----------
  function showMatchResult() {
    const lm = S.lastMatch; if (!lm) return; S.lastMatch = null; save();
    const box = el('div', null, el('div', { class: 'cr-eyebrow', text: lm.kind === 'qual' ? 'Meci de calificare' : 'Antrenament' }),
      el('h2', { text: lm.win ? 'Victorie!' : lm.tie ? 'Egalitate' : 'Înfrângere' }),
      el('div', { class: 'vs' }, el('div', { class: 'side' }, el('b', { text: lm.my }), el('small', { text: S.team.name })), el('div', { class: 'mid', text: '–' }), el('div', { class: 'side r' }, el('b', { text: lm.op }), el('small', { text: lm.opp || 'Adversar' }))),
      lm.kind === 'qual' ? el('p', { class: 'cr-sub', text: '+' + lm.rp + ' puncte de clasament' + (lm.tags.length ? ' (' + lm.tags.join(', ') + ')' : '') + '.' }) : el('p', { class: 'cr-sub', text: '+' + eur(lm.money) + ' din antrenament.' }),
      lm.sponsors.length ? el('p', { class: 'cr-sub', style: 'color:var(--ok)', text: 'Contract îndeplinit: ' + lm.sponsors.join(', ') + '!' }) : null,
      el('div', { class: 'cr-row' }, el('button', { class: 'cr-btn pri', text: 'Continuă', onclick: () => { mm.close(); render(); } })));
    const mm = modal(box);
  }
  function showSummary() {
    const sm = S.summary; if (!sm) return;
    const box = el('div', null, el('div', { class: 'cr-eyebrow', text: sm.name }), el('h2', { text: sm.rank === 1 ? 'Ai câștigat evenimentul!' : 'Ai terminat pe locul ' + sm.rank }),
      el('p', { class: 'cr-sub', text: '+' + eur(sm.prize) + ' premiu și +' + sm.rep + ' reputație.' + (sm.sponsors.length ? ' Contracte îndeplinite: ' + sm.sponsors.join(', ') + '.' : '') }),
      standings(sm.sorted),
      sm.seasonEnd ? el('p', { class: 'cr-sub', style: 'margin-top:12px;color:var(--gold)', text: 'Sezonul s-a încheiat. Începe un sezon nou cu adversari mai puternici și un buget de +500 €.' }) : null,
      el('div', { class: 'cr-row', style: 'margin-top:14px' }, el('button', { class: 'cr-btn pri', text: 'Continuă', onclick: () => { S.summary = null; save(); mm.close(); tab = 'hub'; render(); } })));
    const mm = modal(box);
  }
  function showCard() {
    if (S.card == null) return; const c = CARDS[S.card];
    const box = el('div', null, el('div', { class: 'cr-eyebrow', text: 'Eveniment' }), el('h2', { text: c.t }), el('p', { class: 'cr-sub', text: c.d }),
      el('div', { class: 'choices' }, c.ch.map((ch) => el('button', { class: 'cr-btn', disabled: ch.need && S.money < ch.need, text: ch.l, onclick: () => { ch.fn(S); S.card = null; save(); mm.close(); render(); } }))));
    const mm = modal(box);
  }

  // ---------- render ----------
  function render() {
    document.querySelectorAll('.cr-modal').forEach((m) => m.remove());
    app.replaceChildren();
    if (!S) { app.append(welcome()); return; }
    const views = { hub: hubView, robot: robotView, sponsors: sponsorsView, event: eventView, history: historyView };
    app.append(header(), nav(), el('main', { class: 'cr-main' }, pendingBanner(), views[tab]()));
    if (S.lastMatch) showMatchResult(); else if (S.summary) showSummary(); else if (S.card != null) showCard();
  }

  // ---------- boot: pick up a finished match from the game ----------
  S = load();
  if (S) {
    let res = null; try { res = JSON.parse(localStorage.getItem(RESULT_KEY) || 'null'); } catch (e) { }
    if (res && res.id && applyResult(res)) { localStorage.removeItem(RESULT_KEY); localStorage.removeItem(MATCH_KEY); if (S.event || S.summary) tab = 'event'; }
    else if (res) localStorage.removeItem(RESULT_KEY);
  }
  render();
})();
