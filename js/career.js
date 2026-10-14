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
  const SBC = window.SUPABASE_CONFIG || {};
  const SBX = window.supabase && SBC.url && SBC.anonKey ? window.supabase.createClient(SBC.url, SBC.anonKey) : null;
  const CLOUD = { user: null, name: '', status: SBX ? 'guest' : 'off', err: '' };
  let cloudTimer = null;
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
  const saveLocal = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
  const save = () => { if (S) S.savedAt = Date.now(); saveLocal(); cloudSoon(); };
  const load = () => { try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); return j && j.v === 1 ? j : null; } catch (e) { return null; } };

  // ---------- account save: table career_saves (each player can only read/write their own row) ----------
  const NOSETUP = /does not exist|schema cache|42P01|PGRST205|PGRST204/i;
  const backToMenu = () => window.parent.postMessage({ rb: 'career-back' }, location.origin);
  const connectAccount = () => { if (FRAMED) window.parent.postMessage({ rb: 'open-online' }, location.origin); else location.href = 'field-sim-3d.html?page=online'; };
  const cloudText = () => ({ guest: '☁ Neconectat', saving: '☁ Se salvează…', ok: '☁ ' + CLOUD.name + ' · salvat', error: '☁ Eroare la salvare', nosetup: '☁ Salvare în cont indisponibilă' }[CLOUD.status] || '');
  function paintCloud() {
    document.querySelectorAll('.cloud-st').forEach((n) => { n.textContent = cloudText(); n.className = 'cr-chip cloud cloud-st ' + CLOUD.status; });
    document.querySelectorAll('.cloud-hint').forEach((n) => { n.textContent = cloudHint(); });
  }
  function cloudHint() {
    if (CLOUD.status === 'guest') return 'Nu ești conectat. Progresul se salvează doar în acest browser. Conectează-te cu contul online ca să-l ai oriunde.';
    if (CLOUD.status === 'ok' || CLOUD.status === 'saving') return 'Progresul se salvează automat în contul tău (' + CLOUD.name + ').';
    if (CLOUD.status === 'nosetup') return 'Salvarea în cont nu e activată încă pe server: rulează supabase/career.sql în Supabase (SQL Editor). Până atunci progresul rămâne în acest browser.';
    if (CLOUD.status === 'error') return 'Nu am putut salva în cont' + (CLOUD.err ? ' (' + CLOUD.err + ')' : '') + '. Se încearcă din nou la următoarea acțiune.';
    return '';
  }
  function cloudClick() {
    if (CLOUD.status === 'guest') return connectAccount();
    if (CLOUD.status === 'nosetup') return toast('Rulează supabase/career.sql în Supabase ca să activezi salvarea în cont.');
    cloudPush().then((ok) => { if (ok) toast('Salvat în cont.'); });
  }
  function cloudChip() { return SBX ? el('button', { class: 'cr-chip cloud cloud-st ' + CLOUD.status, title: 'Salvarea în contul online', onclick: cloudClick, text: cloudText() }) : null; }
  function cloudSoon() { if (!SBX || !CLOUD.user || CLOUD.status === 'nosetup') return; clearTimeout(cloudTimer); cloudTimer = setTimeout(cloudPush, 1200); }
  async function cloudPush() {
    clearTimeout(cloudTimer); cloudTimer = null;
    if (!SBX || !CLOUD.user || !S || CLOUD.status === 'nosetup') return false;
    S.cloudUid = CLOUD.user.id; saveLocal(); CLOUD.status = 'saving'; paintCloud();
    try {
      const r = await SBX.from('career_saves').upsert({ user_id: CLOUD.user.id, data: S, updated_at: new Date().toISOString() });
      if (r.error) { CLOUD.status = NOSETUP.test((r.error.message || '') + (r.error.code || '')) ? 'nosetup' : 'error'; CLOUD.err = r.error.message; paintCloud(); return false; }
      CLOUD.status = 'ok'; CLOUD.err = ''; paintCloud(); return true;
    } catch (e) { CLOUD.status = 'error'; CLOUD.err = e.message; paintCloud(); return false; }
  }
  const flushCloud = (ms) => (CLOUD.user && CLOUD.status !== 'nosetup' ? Promise.race([cloudPush(), new Promise((r) => setTimeout(r, ms))]) : Promise.resolve());
  const sumLine = (s) => s.team.name + ' · sezon ' + s.season + ', săpt. ' + s.week + ' · ' + eur(s.money) + ' · reputație ' + Math.round(s.rep) + (s.savedAt ? ' · salvat ' + new Date(s.savedAt).toLocaleString('ro-RO') : '');
  function adopt(cloud) { S = cloud; S.cloudUid = CLOUD.user.id; saveLocal(); CLOUD.status = 'ok'; paintCloud(); render(); toast('Progres încărcat din contul tău.'); }
  function chooseSave(local, cloud) {
    const box = el('div', null, el('div', { class: 'cr-eyebrow', text: 'Cont online' }), el('h2', { text: 'Ce progres păstrezi?' }),
      el('p', { class: 'cr-sub', text: 'Contul tău are deja o carieră salvată, diferită de cea din acest browser.' }),
      el('div', { class: 'choices' },
        el('button', { class: 'cr-btn pri', onclick: () => { try { localStorage.setItem('rbCareerBackup', JSON.stringify(local)); } catch (e) { } mm.close(); adopt(cloud); } }, el('b', { text: 'Cea din cont' }), el('br'), sumLine(cloud)),
        el('button', { class: 'cr-btn', onclick: async () => { mm.close(); S.cloudUid = CLOUD.user.id; await cloudPush(); toast('Cariera din acest browser a fost salvată în cont.'); } }, el('b', { text: 'Cea din acest browser (înlocuiește contul)' }), el('br'), sumLine(local))));
    const mm = modal(box, true);
  }
  async function cloudSync() {
    const uid = CLOUD.user.id;
    const { data: row, error } = await SBX.from('career_saves').select('data,updated_at').eq('user_id', uid).maybeSingle();
    if (error) { CLOUD.status = NOSETUP.test((error.message || '') + (error.code || '')) ? 'nosetup' : 'error'; CLOUD.err = error.message; paintCloud(); return; }
    const cloud = row && row.data && row.data.v === 1 ? row.data : null;
    if (!cloud) { CLOUD.status = 'ok'; if (S) await cloudPush(); else paintCloud(); return; }
    if (!S) { adopt(cloud); return; }
    if (S.cloudUid === uid) {
      const c = cloud.savedAt || 0, l = S.savedAt || 0;
      if (c > l) adopt(cloud); else if (l > c) await cloudPush(); else { CLOUD.status = 'ok'; paintCloud(); }
      return;
    }
    CLOUD.status = 'ok'; paintCloud(); chooseSave(S, cloud);
  }
  async function cloudInit() {
    if (!SBX) return;
    try {
      const { data } = await SBX.auth.getSession(), u = data && data.session && data.session.user;
      if (!u) { CLOUD.user = null; CLOUD.status = 'guest'; paintCloud(); return; }
      CLOUD.user = u; CLOUD.name = u.email || 'cont';
      try { const p = await SBX.from('profiles').select('username').eq('id', u.id).maybeSingle(); if (p.data && p.data.username) CLOUD.name = p.data.username; } catch (e) { }
      await cloudSync();
    } catch (e) { CLOUD.status = 'error'; CLOUD.err = e.message; paintCloud(); }
  }

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
  async function launch(kind) {
    const id = Date.now() + '-' + irnd(1000, 9999);
    let opp, alliance, label;
    if (kind === 'qual') { const ev = S.event; opp = ev.teams[ev.sched[ev.round]]; alliance = ev.alliances[ev.round]; label = ev.name + ' · meciul ' + (ev.round + 1) + '/4'; }
    else { opp = { name: pick(TEAM_NAMES) + ' (antrenament)', skill: clamp(rnd(0.25, 0.6) + (S.season - 1) * .05, 0, .95) }; alliance = pick(['red', 'blue']); label = 'Antrenament'; }
    S.pending = { id, kind }; save();
    ensureAutos(); const AU = S.autos[S.autoSel], auto = AU && AU.pts.length ? { name: AU.name, pts: alliance === 'blue' ? AU.pts.map(mirrorPt) : clonePts(AU.pts) } : null;
    try { localStorage.setItem(MATCH_KEY, JSON.stringify({ id, type: kind, label, alliance, robot: canTurret() ? S.type : 'strafe', mods: modsOf(S), team: S.team, opp: { name: opp.name, skill: opp.skill }, auto, ts: Date.now() })); localStorage.removeItem(RESULT_KEY); } catch (e) { return toast('Nu pot salva meciul (stocarea e blocată).'); }
    await flushCloud(1800);
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
  function modal(content, keep) {
    const m = el('div', { class: 'cr-modal' + (keep ? ' keep' : '') }, el('div', { class: 'box' }, content)); document.body.append(m);
    return { close: () => m.remove() };
  }
  function bars(m) {
    return el('div', { class: 'cr-bars' }, BARS.map(([k, label]) => el('div', { class: 'cr-bar' }, el('span', { text: label }), el('div', { class: 'track' }, el('i', { style: 'width:' + clamp(barPct(k, m[k]), 0, 100) + '%' })), el('b', { text: barTxt(k, m[k]) }))));
  }
  const tabs = [['hub', 'Acasă'], ['robot', 'Robot și hardware'], ['auto', 'Autonom'], ['sponsors', 'Sponsori'], ['event', 'Eveniment'], ['history', 'Istoric']];

  // ---------- views ----------
  function header() {
    const chips = [el('div', { class: 'cr-chip money' }, el('small', { text: 'Buget' }), el('b', { text: eur(S.money) })),
      el('div', { class: 'cr-chip rep' }, el('small', { text: 'Reputație' }), el('b', { text: Math.round(S.rep) })),
      el('div', { class: 'cr-chip' }, el('small', { text: 'Sezon ' + S.season }), el('b', { text: 'Săpt. ' + S.week })), cloudChip()];
    if (FRAMED) return el('header', { class: 'cr-page' },
      el('button', { class: 'cr-back', onclick: backToMenu }, '← Înapoi'),
      el('div', { class: 'cr-kicker', text: 'BIOBUZZ · CARIERĂ' }), el('h1', { class: 'cr-pt', text: 'Mod carieră' }),
      el('div', { class: 'cr-team2', text: S.team.name + ' · #' + S.team.num + ' · ' + repLevel(S.rep) }), el('div', { class: 'cr-stats' }, chips));
    return el('header', { class: 'cr-top' },
      el('a', { class: 'cr-brand', href: 'index.html', target: FRAMED ? '_top' : null }, 'ro', el('span', { text: 'LER' }), 'bot'),
      el('div', { class: 'cr-team' }, el('b', { text: S.team.name }), el('small', { text: '#' + S.team.num + ' · ' + repLevel(S.rep) })),
      el('div', { class: 'cr-stats' }, chips),
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
      el('label', { class: 'ap-f', style: 'margin-top:14px' }, el('span', { text: 'Autonom la meciuri' }), autoSelect()),
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
        opp ? el('label', { class: 'ap-f', style: 'margin-bottom:12px' }, el('span', { text: 'Autonom la acest meci' }), autoSelect()) : null,
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
      el('div', { class: 'cr-card' }, el('h3', { text: 'Salvare' }), el('p', { class: 'cr-note cloud-hint', text: cloudHint() || 'Progresul e salvat în acest browser.' }),
        el('div', { class: 'cr-row', style: 'margin-top:10px' },
          SBX && CLOUD.status === 'guest' ? el('button', { class: 'cr-btn pri sm', text: 'Conectează-te', onclick: connectAccount }) : null,
          SBX && CLOUD.user ? el('button', { class: 'cr-btn sm', text: 'Salvează acum', onclick: cloudClick }) : null,
          el('button', { class: 'cr-btn sm', text: 'Resetează cariera', onclick: resetAll }))));
  }
  function welcome() {
    const inp = el('input', { class: 'cr-in', value: 'roLERbot', maxlength: 22, placeholder: 'Numele echipei' });
    const go = () => { const n = inp.value.trim() || 'roLERbot'; newState(n); save(); render(); };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    return el('main', { class: 'cr-main' }, FRAMED ? el('button', { class: 'cr-back', onclick: backToMenu }, '← Înapoi') : null, el('div', { class: 'welcome' },
      el('div', { class: 'cr-eyebrow', text: 'FTC · BIOBUZZ 2026/27' }),
      el('h1', null, 'Construiește-ți ', el('span', { text: 'echipa' }), '.'),
      el('p', { class: 'cr-sub', text: 'Începi cu un robot simplu și un buget mic. Cumperi hardware mai bun, semnezi sponsori, câștigi evenimente și urci de la echipă locală la campionatul național. Meciurile se joacă în simulatorul 3D, iar upgrade-urile îți schimbă robotul cu adevărat.' }),
      el('div', { class: 'cr-eyebrow', style: 'margin-top:20px', text: 'Numele echipei' }), inp,
      el('div', { class: 'cr-row', style: 'margin-top:14px' }, el('button', { class: 'cr-btn pri', text: 'Începe cariera', onclick: go }), FRAMED ? null : menuLink(), FRAMED ? null : el('a', { class: 'cr-link', href: 'index.html' }, '← Site')),
      SBX ? el('p', { class: 'cr-note cloud-hint', style: 'margin-top:14px', text: cloudHint() }) : null,
      SBX && CLOUD.status === 'guest' ? el('button', { class: 'cr-btn sm', style: 'margin-top:8px', text: 'Conectează-te ca să-ți încarci progresul', onclick: connectAccount }) : null));
  }
  async function resetAll() {
    if (!confirm('Ștergi toată cariera și o iei de la capăt?')) return;
    if (CLOUD.user && CLOUD.status !== 'nosetup' && confirm('Ștergi și progresul salvat în contul tău? (OK = da, Anulare = îl păstrez în cont)')) { try { await SBX.from('career_saves').delete().eq('user_id', CLOUD.user.id); } catch (e) { } }
    localStorage.removeItem(KEY); localStorage.removeItem(MATCH_KEY); localStorage.removeItem(RESULT_KEY); S = null; render();
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

  // ---------- autonomous editor: draw the path and add actions; the robot follows it in the first 30 s of the match ----------
  const FLD = { IN: 144, R: 10.5, FRAME: { x0: 52.5, x1: 91.5, y0: 47.3, y1: 96.7 }, CELLS: { blue: [{ x: 58.5, y: 59 }, { x: 85.5, y: 59 }], red: [{ x: 58.5, y: 85 }, { x: 85.5, y: 85 }] }, LZ: { blue: { x: 96, y: 0, w: 23, h: 11 }, red: { x: 25, y: 133, w: 23, h: 11 } }, FLOWERS: [[48, 3.2], [141, 48], [3, 96], [96, 141]], START: { x: 70, y: 133.5 } };
  const PRESETS = {
    'Tragere în stup': [{ x: 113, y: 112, h: 'auto', act: [] }, { x: 112.5, y: 85, h: 'cell', act: [{ t: 'shoot', n: 4 }] }],
    'Tragere și mingi din grădină': [{ x: 113, y: 112, h: 'auto', act: [] }, { x: 112.5, y: 85, h: 'cell', act: [{ t: 'shoot', n: 4 }] }, { x: 133, y: 133, h: 0, act: [{ t: 'intake', s: 1.5 }] }, { x: 112.5, y: 85, h: 'cell', act: [{ t: 'shoot', n: 3 }] }, { x: 110, y: 120, h: 'auto', act: [] }, { x: 37, y: 132, h: 'auto', act: [{ t: 'wait', s: 0.5 }] }],
    'Tragere și parcare': [{ x: 113, y: 112, h: 'auto', act: [] }, { x: 112.5, y: 85, h: 'cell', act: [{ t: 'shoot', n: 4 }] }, { x: 113, y: 120, h: 'auto', act: [] }, { x: 60, y: 126, h: 'auto', act: [] }, { x: 37, y: 132, h: 'auto', act: [{ t: 'wait', s: 0.5 }] }],
    'Părăsește peretele': [{ x: 70, y: 108, h: 'auto', act: [] }]
  };
  const PRESET_INFO = { 'Tragere în stup': 'Merge la stup și trage cele 4 mingi.', 'Tragere și mingi din grădină': 'Trage, ia mingile din grădină și trage din nou.', 'Tragere și parcare': 'Trage 4 mingi și parchează.', 'Părăsește peretele': 'Doar iese de lângă perete (LEAVE).' };
  const clonePts = (a) => JSON.parse(JSON.stringify(a));
  const mirrorPt = (p) => ({ x: FLD.IN - p.x, y: FLD.IN - p.y, h: typeof p.h === 'number' ? (p.h + 180) % 360 : p.h, act: clonePts(p.act || []) });
  function ensureAutos() {
    if (!S) return;
    if (!Array.isArray(S.autos)) S.autos = [{ name: 'Tragere în stup', pts: clonePts(PRESETS['Tragere în stup']) }, { name: 'Tragere și mingi din grădină', pts: clonePts(PRESETS['Tragere și mingi din grădină']) }, { name: 'Auto 3', pts: [] }];
    if (typeof S.autoSel !== 'number') S.autoSel = -1;
  }
  let edSlot = 0, edSel = -1, edPlay = null, edCv = null, edMode = 'add', edSnap = false, edUndo = [], edRedo = [], edLast = '', edKeysBound = false, edHover = null, edPick = false;
  const ACT_LABEL = { shoot: 'Trage în stup', intake: 'Intake', deposit: 'Depune în floare', take: 'Ia mingi din floare', wait: 'Așteaptă' };
  const ACT_TAG = { shoot: 'T', intake: 'I', deposit: 'D', take: 'L', wait: 'W' };
  const ACT_SHORT = { shoot: 'Trage', intake: 'Intake', deposit: 'Depune', take: 'Ia mingi', wait: 'Așteaptă' };
  const actDur = (a) => (a.t === 'shoot' ? (a.n || 4) * 0.62 + 0.4 : a.t === 'take' ? (a.n || 1) * 0.7 + 0.3 : a.t === 'wait' || a.t === 'intake' ? a.s || 1 : 0.9);
  const hitsFrame = (ax, ay, bx, by) => { const f = FLD.FRAME, pad = FLD.R + 3; for (let t = 0; t <= 1; t += 0.04) { const x = ax + (bx - ax) * t, y = ay + (by - ay) * t; if (x > f.x0 - pad && x < f.x1 + pad && y > f.y0 - pad && y < f.y1 + pad) return true; } return false; };
  const curPts = () => S.autos[edSlot].pts;
  const sn = (v) => (edSnap ? Math.round(v / 3) * 3 : v);
  const inField = (v) => clamp(v, FLD.R, FLD.IN - FLD.R);
  // ---- undo / redo ----
  function histReset() { edUndo = []; edRedo = []; edLast = JSON.stringify(curPts()); }
  function commit() { const cur = JSON.stringify(curPts()); if (cur !== edLast) { edUndo.push(edLast); if (edUndo.length > 60) edUndo.shift(); edRedo = []; edLast = cur; } save(); }
  function undoEd() { if (!edUndo.length) return; edRedo.push(JSON.stringify(curPts())); S.autos[edSlot].pts = JSON.parse(edUndo.pop()); edLast = JSON.stringify(curPts()); edSel = Math.min(edSel, curPts().length - 1); stopPlay(); save(); refreshAll(); }
  function redoEd() { if (!edRedo.length) return; edUndo.push(JSON.stringify(curPts())); S.autos[edSlot].pts = JSON.parse(edRedo.pop()); edLast = JSON.stringify(curPts()); edSel = Math.min(edSel, curPts().length - 1); stopPlay(); save(); refreshAll(); }
  // ---- geometry / time ----
  function headingOf(p, prev) {
    if (p.h === 'cell') return Math.atan2(FLD.CELLS.red[1].y - p.y, FLD.CELLS.red[1].x - p.x);
    if (p.h === 'flower') { let b = null, bd = 1e9; FLD.FLOWERS.forEach(([x, y]) => { const d = Math.hypot(x - p.x, y - p.y); if (d < bd) { bd = d; b = [x, y]; } }); return Math.atan2(b[1] - p.y, b[0] - p.x); }
    if (typeof p.h === 'number') return p.h * Math.PI / 180;
    return Math.atan2(p.y - prev.y, p.x - prev.x);
  }
  const prevOf = (pts, i) => (i > 0 ? pts[i - 1] : FLD.START);
  function timeline(pts) {
    const m = modsOf(S), v = 62 * m.speed * 0.62; let x = FLD.START.x, y = FLD.START.y, t = 0, bad = 0, pa = -Math.PI / 2; const seg = [], bars = [], shots = [];
    pts.forEach((p, i) => {
      const d = Math.hypot(p.x - x, p.y - y), dt = d / v, a = headingOf(p, { x, y }); if (hitsFrame(x, y, p.x, p.y)) bad++;
      seg.push({ t0: t, t1: t + dt, x0: x, y0: y, x1: p.x, y1: p.y, a, a0: pa }); bars.push({ t0: t, t1: t + dt, k: 'move', i }); t += dt; pa = a;
      (p.act || []).forEach((ac) => { const ad = actDur(ac); if (ac.t === 'shoot') for (let q = 0; q < (ac.n || 4); q++) shots.push(t + 0.25 + q * 0.62); seg.push({ t0: t, t1: t + ad, x0: p.x, y0: p.y, x1: p.x, y1: p.y, a }); bars.push({ t0: t, t1: t + ad, k: ac.t, i }); t += ad; });
      seg.push({ t0: t, t1: t + 0.25, x0: p.x, y0: p.y, x1: p.x, y1: p.y, a }); bars.push({ t0: t, t1: t + 0.25, k: 'settle', i }); t += 0.25; x = p.x; y = p.y;
    });
    return { seg, bars, shots, total: t, bad, err: (1.1 / m.assist) * Math.sqrt(Math.max(t, 1)) };
  }
  const smooth = (k) => k * k * (3 - 2 * k);
  const lerpAng = (a0, a1, k) => a0 + ((((a1 - a0 + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - Math.PI) * k;
  function poseAt(tl, t) {
    for (const s of tl.seg) if (t <= s.t1) {
      const k = s.t1 > s.t0 ? (t - s.t0) / (s.t1 - s.t0) : 1, mv = s.x0 !== s.x1 || s.y0 !== s.y1, ke = mv ? smooth(k) : k;   // ease in/out of every move; turn first, then drive
      return { x: s.x0 + (s.x1 - s.x0) * ke, y: s.y0 + (s.y1 - s.y0) * ke, a: s.a0 === undefined ? s.a : lerpAng(s.a0, s.a, smooth(clamp(k / 0.5, 0, 1))) };
    }
    const l = tl.seg[tl.seg.length - 1]; return l ? { x: l.x1, y: l.y1, a: l.a } : { x: FLD.START.x, y: FLD.START.y, a: -Math.PI / 2 };
  }
  // the red hive during the preview: every 6 balls shot tip it to the other side (like in the game)
  function hiveAt(tl, t) {
    let c = 3, tips = 0, last = -9;   // the up cell starts with 3 preloaded nectar balls
    (tl && tl.shots || []).forEach((st) => { if (st <= t) { c++; if (c >= 6) { c = 0; tips++; last = st; } } });
    const k = tips ? smooth(clamp((t - last) / 0.9, 0, 1)) : 1;
    return { p: tips ? (tips % 2 ? 1 - k : k) : 1, n: c, tips, k, pre: tips ? 0 : 3 };
  }
  // ---- checks: tell the player WHY a point will not work ----
  function checkPts(pts) {
    const out = []; const c = FLD.CELLS.red[1]; let shots = 0, coll = 0;
    pts.forEach((p, i) => {
      const acts = p.act || [], n = i + 1;
      if (acts.some((a) => a.t === 'shoot')) {
        const d = Math.hypot(c.x - p.x, c.y - p.y);
        if (p.x - c.x < 6) out.push({ i, msg: 'Punctul ' + n + ': nu ești în fața părții deschise a celulei, mingile nu intră. Mută-l mai la dreapta (x peste ' + Math.round(c.x + 6) + ').' });
        else if (d < 14) out.push({ i, msg: 'Punctul ' + n + ': prea aproape de stup ca să țintești.' });
        else if (d > 95) out.push({ i, msg: 'Punctul ' + n + ': prea departe de celulă (' + Math.round(d) + ' in).' });
        acts.filter((a) => a.t === 'shoot').forEach((a) => { shots += a.n || 4; });
      }
      if (acts.some((a) => a.t === 'deposit' || a.t === 'take')) {
        let bd = 1e9; FLD.FLOWERS.forEach(([x, y]) => { bd = Math.min(bd, Math.hypot(x - p.x, y - p.y)); });
        if (bd > 22) out.push({ i, msg: 'Punctul ' + n + ': prea departe de o floare (' + Math.round(bd) + ' in; trebuie sub ~22).' });
      }
      if (acts.some((a) => a.t === 'intake' || a.t === 'take')) coll++;
    });
    if (shots > 4 && !coll) out.push({ i: -1, msg: 'Tragi ' + shots + ' mingi, dar robotul pornește doar cu 4 și nu ai niciun punct care colectează mingi.' });
    return out;
  }
  // ---- drawing ----
  function drawEditor() {
    const cv = edCv; if (!cv || !cv.isConnected || !S) return; const ctx = cv.getContext('2d'), W = cv.width, sc = W / FLD.IN, pts = curPts(), X = (v) => v * sc, chk = checkPts(pts), bad = new Set(chk.map((c) => c.i));
    const MONO = '"JetBrains Mono", monospace', fs = (k, w) => (w || 600) + ' ' + Math.round(W / k) + 'px ' + MONO, R = 9;
    ctx.clearRect(0, 0, W, W);
    // ---- field drawn like field-sim.html: black floor, 24 in grid, U-shaped landing zones, hive with yellow arms, hex flowers ----
    const k = W / 960, rrp = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };

    const drawBot = (x, y, ang, col, alpha, glow) => {
      const s = X(R * 2); ctx.save(); ctx.globalAlpha = alpha; ctx.translate(X(x), X(y)); ctx.rotate(ang + Math.PI / 2);
      if (glow) { ctx.shadowColor = col; ctx.shadowBlur = 22 * k; }
      ctx.fillStyle = 'rgba(0,0,0,.45)'; rrp(-s * .42, -s * .42 + s * .04, s * .84, s * .84, s * .06); ctx.fill(); ctx.shadowColor = 'transparent';
      [[-.46, -.27], [.46, -.27], [-.46, .27], [.46, .27]].forEach(([wx, wy]) => { ctx.fillStyle = '#0f1013'; rrp(wx * s - s * .07, wy * s - s * .14, s * .14, s * .28, s * .03); ctx.fill(); ctx.strokeStyle = '#3a3e47'; ctx.lineWidth = 1 * k; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(wx * s - s * .07, wy * s + i * s * .05); ctx.lineTo(wx * s + s * .07, wy * s + i * s * .05 - s * .03); ctx.stroke(); } });
      ctx.fillStyle = '#3b404a'; rrp(-s * .39, -s * .4, s * .78, s * .8, s * .07); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.2 * k; ctx.stroke();
      ctx.fillStyle = col; ctx.fillRect(-s * .39, -s * .4, s * .05, s * .8); ctx.fillRect(s * .34, -s * .4, s * .05, s * .8);
      ctx.fillStyle = '#2a2d34'; rrp(-s * .26, -s * .3, s * .52, s * .6, s * .04); ctx.fill();
      ctx.fillStyle = 'rgba(200,225,240,.16)'; rrp(-s * .17, -s * .34, s * .34, s * .26, s * .03); ctx.fill(); ctx.strokeStyle = 'rgba(210,230,245,.45)'; ctx.stroke();
      ctx.fillStyle = '#17191d'; rrp(-s * .32, -s * .56, s * .64, s * .13, s * .04); ctx.fill(); ctx.save(); rrp(-s * .32, -s * .56, s * .64, s * .13, s * .04); ctx.clip(); ctx.strokeStyle = '#8d93a0'; ctx.lineWidth = 1.2 * k; for (let i = -9; i < 10; i++) { ctx.beginPath(); ctx.moveTo(i * s * .045, -s * .57); ctx.lineTo(i * s * .045 - s * .03, -s * .42); ctx.stroke(); } ctx.restore();
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-s * .39, -s * .4); ctx.lineTo(-s * .22, -s * .4); ctx.lineTo(-s * .39, -s * .24); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(s * .39, -s * .4); ctx.lineTo(s * .22, -s * .4); ctx.lineTo(s * .39, -s * .24); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2f333b'; ctx.beginPath(); ctx.arc(0, s * .1, s * .2, 0, 6.283); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2.2 * k; ctx.stroke();
      ctx.fillStyle = '#4c515c'; rrp(-s * .05, -s * .16, s * .1, s * .26, s * .02); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(-s * .025, -s * .2, s * .05, s * .06);
      ctx.fillStyle = col; ctx.globalAlpha = alpha * .55; rrp(-s * .3, s * .22, s * .6, s * .16, s * .02); ctx.fill(); ctx.globalAlpha = alpha; ctx.fillStyle = '#fff'; ctx.fillRect(-s * .04, s * .26, s * .08, s * .08);
      ctx.restore();
    };
    const fg = ctx.createLinearGradient(0, 0, W, W); fg.addColorStop(0, '#2b3039'); fg.addColorStop(1, '#222630'); ctx.fillStyle = fg; ctx.fillRect(0, 0, W, W);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) if ((r + c) % 2 === 0) { ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fillRect(X(c * 24), X(r * 24), X(24), X(24)); }
    ctx.strokeStyle = edSnap ? 'rgba(210,214,225,.5)' : 'rgba(210,214,225,.34)'; ctx.lineWidth = 2 * k; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(X(i * 24), 0); ctx.lineTo(X(i * 24), W); ctx.moveTo(0, X(i * 24)); ctx.lineTo(W, X(i * 24)); ctx.stroke(); }
    if (edSnap) { ctx.strokeStyle = 'rgba(190,190,200,.1)'; ctx.lineWidth = 1; for (let i = 3; i < FLD.IN; i += 3) { ctx.beginPath(); ctx.moveTo(X(i), 0); ctx.lineTo(X(i), W); ctx.moveTo(0, X(i)); ctx.lineTo(W, X(i)); ctx.stroke(); } }
    [['red', '#ff4d5e'], ['blue', '#3d8bff']].forEach(([al, c]) => {
      const z = FLD.LZ[al]; ctx.fillStyle = c + '1c'; ctx.fillRect(X(z.x), X(z.y), X(z.w), X(z.h)); ctx.strokeStyle = c; ctx.lineWidth = 6 * k; ctx.lineJoin = 'miter'; ctx.beginPath();
      if (al === 'blue') { ctx.moveTo(X(z.x), 0); ctx.lineTo(X(z.x), X(z.h)); ctx.lineTo(X(z.x + z.w), X(z.h)); ctx.lineTo(X(z.x + z.w), 0); } else { ctx.moveTo(X(z.x), W); ctx.lineTo(X(z.x), X(z.y)); ctx.lineTo(X(z.x + z.w), X(z.y)); ctx.lineTo(X(z.x + z.w), W); }
      ctx.stroke(); ctx.fillStyle = c; if (al === 'blue') ctx.fillRect(0, 0, X(3.5), X(23)); else ctx.fillRect(X(FLD.IN - 3.5), X(FLD.IN - 23), X(3.5), X(23));
    });
    const f = FLD.FRAME; ctx.strokeStyle = 'rgba(200,200,210,.55)'; ctx.lineWidth = 3 * k; ctx.strokeRect(X(f.x0), X(f.y0), X(f.x1 - f.x0), X(f.y1 - f.y0)); ctx.beginPath(); ctx.moveTo(X(72), X(f.y0)); ctx.lineTo(X(72), X(f.y1)); ctx.stroke();
    ctx.fillStyle = 'rgba(40,40,46,.9)'; ctx.fillRect(X(70), X(f.y0), X(4), X(f.y1 - f.y0));
    const hv0 = edPlay && (edPlay.t > 0 || edPlay.playing) ? hiveAt(edPlay.tl, edPlay.t) : { p: 1, n: 3, tips: 0, k: 1, pre: 3 };
    [['blue', '#3d8bff'], ['red', '#ff4d5e']].forEach(([al, col]) => {
      const mid = FLD.CELLS[al][0].y, P = al === 'red' ? hv0.p : 0, sh = (P - 0.5) * 3.2; ctx.fillStyle = 'rgba(255,201,51,.9)'; ctx.fillRect(X(67 + sh), X(mid - 11), X(3.2), X(22)); ctx.fillRect(X(74 + sh), X(mid - 11), X(3.2), X(22));
      FLD.CELLS[al].forEach((c, ci) => {
        const h = clamp(ci === 0 ? 1 - P : P, 0, 1), mine = al === 'red' && ci === 1, up = h > .5, sc = 0.84 + 0.3 * h, w = X(16) * sc, hh = X(20) * sc, x = X(c.x) - w / 2, y = X(c.y) - hh / 2;
        ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.65)'; ctx.shadowBlur = (8 + 22 * h) * k; ctx.shadowOffsetY = (3 + 12 * h) * k; ctx.fillStyle = col + (up ? '66' : '22'); rrp(x, y, w, hh, 10 * k * sc); ctx.fill(); ctx.shadowColor = 'transparent';
        ctx.globalAlpha = .45 + .55 * h; ctx.lineWidth = (3 + 3 * h) * k; ctx.strokeStyle = col; rrp(x, y, w, hh, 10 * k * sc); ctx.stroke(); ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(0,0,0,' + (0.45 * (1 - h)) + ')'; rrp(x + 4, y + 4, w - 8, hh - 8, 8 * k * sc); ctx.fill();
        if (al === 'red' && up) { for (let i = 0; i < hv0.n; i++) { ctx.fillStyle = i < hv0.pre ? '#ff4d5e' : '#ffc933'; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + w * (.25 + (i % 3) * .25), y + hh * (.22 + Math.floor(i / 3) * .2), X(1.9) * sc * .8, 0, 6.283); ctx.fill(); ctx.stroke(); }
          ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(x + 6, y + hh - 9, w - 12, 4); ctx.fillStyle = col; ctx.fillRect(x + 6, y + hh - 9, (w - 12) * clamp(hv0.n / 6, 0, 1), 4); }
        ctx.restore();
      });
    });
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = fs(60, 700); ctx.fillText('ZONA ROȘIE', X(37), X(141.4)); ctx.fillText('ZONA ALBASTRĂ', X(107), X(8));
    ctx.fillStyle = 'rgba(255,77,94,.75)'; ctx.fillText('celula ta', X(85.5), X(85) + X(13.5));
    ctx.fillStyle = 'rgba(255,201,51,.5)'; ctx.fillText('grădină', X(133), X(112));
    const selP = edSel >= 0 ? pts[edSel] : null, wantsFl = selP && ((selP.act || []).some((a) => a.t === 'take' || a.t === 'deposit') || selP.h === 'flower');
    const hexP = (cx, cy, rad) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i + Math.PI / 6, x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); };
    FLD.FLOWERS.forEach(([fx, fy], i) => {
      const x = X(fx), y = X(fy), rad = X(4.1), wall = Math.atan2(FLD.IN / 2 - fy, FLD.IN / 2 - fx) + Math.PI;
      if (wantsFl) { ctx.strokeStyle = 'rgba(255,201,51,.28)'; ctx.setLineDash([5, 6]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, X(22), 0, 6.283); ctx.stroke(); ctx.setLineDash([]); }
      ctx.strokeStyle = '#6f6a52'; ctx.lineWidth = 3 * k * 1.1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(wall) * X(6), y + Math.sin(wall) * X(6)); ctx.stroke();
      hexP(x, y, rad); ctx.fillStyle = '#d9b43c'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#8a6f1a'; ctx.stroke();
      ctx.fillStyle = '#17140a'; ctx.beginPath(); ctx.arc(x, y, rad * .58, 0, 6.283); ctx.fill();
      ctx.strokeStyle = '#efe7c6'; ctx.lineWidth = 1.6; for (let j = 0; j < 4; j++) { const a2 = j * Math.PI / 2 + Math.PI / 4; ctx.beginPath(); ctx.moveTo(x + Math.cos(a2) * rad * .58, y + Math.sin(a2) * rad * .58); ctx.lineTo(x + Math.cos(a2) * rad * .86, y + Math.sin(a2) * rad * .86); ctx.stroke(); }
      ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, rad * .58, 0, 6.283); ctx.stroke();
      ctx.lineWidth = 4; ctx.strokeStyle = '#8a8470'; ctx.beginPath(); ctx.arc(x, y, rad * .74, wall - .8, wall + .8); ctx.stroke();
      ctx.fillStyle = '#ffc933'; ctx.beginPath(); ctx.arc(x, y, X(1.5), 0, 6.283); ctx.fill();
      ctx.fillStyle = '#ffc933'; ctx.font = fs(62, 800); ctx.fillText('F' + (i + 1), X(fx < 14 ? fx + 9 : fx > 130 ? fx - 9 : fx), X(fy < 14 ? fy + 11 : fy - 7));
    });
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 4 * k; ctx.strokeRect(2, 2, W - 4, W - 4);
    ctx.save(); ctx.strokeStyle = 'rgba(255,77,94,.7)'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.strokeRect(X(FLD.START.x - R - 1.5), X(FLD.START.y - R - 1.5), X(R * 2 + 3), X(R * 2 + 3)); ctx.restore(); drawBot(FLD.START.x, FLD.START.y, -Math.PI / 2, '#ff4d5e', .9, false);
    ctx.fillStyle = '#ff8a96'; ctx.font = fs(62, 800); ctx.fillText('START', X(FLD.START.x), X(FLD.START.y) + X(R + 4.5));
    // path: glow + line + direction arrows
    let px = FLD.START.x, py = FLD.START.y; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    pts.forEach((p) => {
      const b = hitsFrame(px, py, p.x, p.y), col = b ? '#ff6b7a' : '#7be0a0';
      ctx.strokeStyle = b ? 'rgba(255,107,122,.18)' : 'rgba(123,224,160,.16)'; ctx.lineWidth = 11; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(X(px), X(py)); ctx.lineTo(X(p.x), X(p.y)); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash(b ? [8, 6] : []); ctx.beginPath(); ctx.moveTo(X(px), X(py)); ctx.lineTo(X(p.x), X(p.y)); ctx.stroke(); ctx.setLineDash([]);
      const L = Math.hypot(p.x - px, p.y - py);
      if (L > 14) { const mx = (px + p.x) / 2, my = (py + p.y) / 2, an = Math.atan2(p.y - py, p.x - px); ctx.save(); ctx.translate(X(mx), X(my)); ctx.rotate(an); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(X(2.6), 0); ctx.lineTo(-X(1.8), -X(2.2)); ctx.lineTo(-X(1.8), X(2.2)); ctx.closePath(); ctx.fill(); ctx.restore(); }
      px = p.x; py = p.y;
    });
    pts.forEach((p) => {   // aiming / working lines
      const acts = p.act || [];
      if (acts.some((a) => a.t === 'shoot')) { const c = FLD.CELLS.red[1]; ctx.strokeStyle = 'rgba(249,5,108,.6)'; ctx.setLineDash([4, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(p.x), X(p.y)); ctx.lineTo(X(c.x), X(c.y)); ctx.stroke(); ctx.setLineDash([]); }
      if (acts.some((a) => a.t === 'take' || a.t === 'deposit') || p.h === 'flower') {
        let b = null, bd = 1e9; FLD.FLOWERS.forEach(([x, y]) => { const d = Math.hypot(x - p.x, y - p.y); if (d < bd) { bd = d; b = [x, y]; } });
        ctx.strokeStyle = 'rgba(255,201,51,.7)'; ctx.setLineDash([4, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(p.x), X(p.y)); ctx.lineTo(X(b[0]), X(b[1])); ctx.stroke(); ctx.setLineDash([]);
        const tk = acts.filter((a) => a.t === 'take').reduce((s, a) => s + (a.n || 1), 0); if (tk) { ctx.fillStyle = '#ffc933'; ctx.font = fs(48, 800); ctx.fillText('×' + tk, X((p.x + b[0]) / 2), X((p.y + b[1]) / 2) - X(2)); }
      }
    });
    px = FLD.START.x; py = FLD.START.y;
    pts.forEach((p, i) => {
      const sel = i === edSel, a = headingOf(p, { x: px, y: py });
      drawBot(p.x, p.y, a, sel ? '#ff3d8f' : '#ff4d5e', sel ? 1 : .72, sel);
      ctx.strokeStyle = sel ? '#ff3d8f' : '#b9b5bd'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(p.x), X(p.y)); ctx.lineTo(X(p.x + Math.cos(a) * 8), X(p.y + Math.sin(a) * 8)); ctx.stroke();
      ctx.fillStyle = '#101013'; ctx.strokeStyle = sel ? '#ff3d8f' : bad.has(i) ? '#ffc933' : '#7be0a0'; ctx.lineWidth = sel ? 3.5 : 2.5; ctx.beginPath(); ctx.arc(X(p.x), X(p.y), X(sel ? 4.2 : 3.6), 0, 6.283); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = fs(38, 700); ctx.fillText(String(i + 1), X(p.x), X(p.y) + W / 100);
      const acts = p.act || [];
      acts.forEach((ac, k) => { const cx = X(p.x) + (k - (acts.length - 1) / 2) * 17 * (W / 720), cy = X(p.y) - X(R + 2.2), rr = 8 * (W / 720); ctx.fillStyle = 'rgba(16,16,19,.92)'; ctx.strokeStyle = '#ffc933'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.283); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffc933'; ctx.font = fs(58, 800); ctx.fillText(ACT_TAG[ac.t] || '?', cx, cy + rr * 0.38); });
      if (bad.has(i)) { ctx.fillStyle = '#ffc933'; ctx.font = '800 ' + Math.round(W / 30) + 'px "Bricolage Grotesque", sans-serif'; ctx.fillText('!', X(p.x) + X(6), X(p.y) + X(8)); }
      if (sel) { const hx = p.x + Math.cos(a) * 13, hy = p.y + Math.sin(a) * 13; ctx.strokeStyle = 'rgba(255,61,143,.6)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(X(p.x), X(p.y)); ctx.lineTo(X(hx), X(hy)); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#ff3d8f'; ctx.beginPath(); ctx.arc(X(hx), X(hy), X(2.8), 0, 6.283); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); }
      px = p.x; py = p.y;
    });
    if (edPlay && (edPlay.t > 0 || edPlay.playing)) { const q = poseAt(edPlay.tl, edPlay.t); drawBot(q.x, q.y, q.a, '#ff3d8f', 1, true); }
    if (edHover && !edPlay) { const h = edHover, tx = Math.min(X(h.x) + 12, W - 96), ty = Math.max(X(h.y) - 10, 22); ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(X(h.x), 0); ctx.lineTo(X(h.x), W); ctx.moveTo(0, X(h.y)); ctx.lineTo(W, X(h.y)); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = 'rgba(10,10,13,.88)'; ctx.fillRect(tx - 5, ty - 15, 92, 21); ctx.fillStyle = '#fff'; ctx.font = fs(48, 600); ctx.textAlign = 'left'; ctx.fillText('x ' + Math.round(h.x) + ' · y ' + Math.round(h.y), tx, ty); ctx.textAlign = 'center'; }
  }
  // ---- preview / scrub ----
  function stopPlay() { edPlay = null; updateTlUi(); }
  function ensurePlay() { if (!edPlay) edPlay = { t: 0, last: performance.now(), tl: timeline(curPts()), playing: false }; else edPlay.tl = timeline(curPts()); return edPlay; }
  function playTick(now) {
    if (!edPlay || !edPlay.playing) return; if (!edCv || !edCv.isConnected) { edPlay = null; return; }
    edPlay.t += (now - edPlay.last) / 1000; edPlay.last = now; if (edPlay.t >= edPlay.tl.total + 0.4) { edPlay.t = edPlay.tl.total; edPlay.playing = false; }
    drawEditor(); updateTlUi(); if (edPlay.playing) requestAnimationFrame(playTick);
  }
  function togglePlay() {
    if (!curPts().length) return toast('Adaugă mai întâi puncte pe teren.');
    ensurePlay(); if (edPlay.playing) edPlay.playing = false; else { if (edPlay.t >= edPlay.tl.total) edPlay.t = 0; edPlay.playing = true; edPlay.last = performance.now(); requestAnimationFrame(playTick); }
    updateTlUi();
  }
  function renderTimeline() {
    const host = document.getElementById('apTl'); if (!host) return; const tl = timeline(curPts()), scale = Math.max(30, tl.total);
    host.replaceChildren(...tl.bars.filter((b) => b.t1 - b.t0 > 0.01).map((b) => el('i', { class: 'tl-' + b.k + (b.t0 >= 30 ? ' over' : '') + (b.i === edSel ? ' sel' : ''), style: 'left:' + (b.t0 / scale * 100) + '%;width:' + Math.max(0.5, (b.t1 - b.t0) / scale * 100) + '%', title: 'Punctul ' + (b.i + 1) + ': ' + (b.k === 'move' ? 'mers' : b.k === 'settle' ? 'oprire' : ACT_LABEL[b.k]) + ' · ' + (b.t1 - b.t0).toFixed(1).replace('.', ',') + ' s', onclick: () => { edSel = b.i; refreshAll(); } })),
      el('u', { class: 'tl-30', style: 'left:' + (30 / scale * 100) + '%', title: '30 s: sfârșitul autonomului' }), el('s', { class: 'tl-needle', id: 'apNeedle' }));
    updateTlUi();
  }
  function updateTlUi() {
    const tl = timeline(curPts()), scale = Math.max(30, tl.total), t = edPlay ? edPlay.t : 0, nd = document.getElementById('apNeedle'), sc = document.getElementById('apScrub'), lab = document.getElementById('apTime'), pb = document.getElementById('apPlayBtn');
    if (nd) nd.style.left = (Math.min(t, scale) / scale * 100) + '%'; if (sc) sc.value = String(Math.round(Math.min(t, tl.total) / Math.max(tl.total, 0.1) * 1000));
    if (lab) lab.textContent = t.toFixed(1).replace('.', ',') + ' / ' + tl.total.toFixed(1).replace('.', ',') + ' s'; if (pb) pb.textContent = edPlay && edPlay.playing ? '❚❚' : '▶';
  }
  // ---- editing ----
  function insertPt(p, at) { const A = S.autos[edSlot]; if (A.pts.length >= 14) return toast('Maximum 14 puncte.'); A.pts.splice(at, 0, p); edSel = at; }
  function quickAdd(kind) {
    const A = S.autos[edSlot], last = A.pts.length ? A.pts[A.pts.length - 1] : { x: FLD.START.x, y: FLD.START.y }; let np;
    if (A.pts.length >= 14) return toast('Maximum 14 puncte.');
    if (kind === 'shoot') { const c = FLD.CELLS.red[1]; np = { x: c.x + 27, y: c.y, h: 'cell', act: [{ t: 'shoot', n: 4 }] }; }
    else if (kind === 'garden') np = { x: 133, y: 133, h: 0, act: [{ t: 'intake', s: 1.5 }] };
    else if (kind === 'park') np = { x: 37, y: 132, h: 'auto', act: [{ t: 'wait', s: 0.5 }] };
    else { let b = null, bd = 1e9; FLD.FLOWERS.forEach(([x, y]) => { const d = Math.hypot(x - last.x, y - last.y); if (d < bd) { bd = d; b = [x, y]; } }); const dx = 72 - b[0], dy = 72 - b[1], d = Math.hypot(dx, dy); np = { x: inField(b[0] + dx / d * 16), y: inField(b[1] + dy / d * 16), h: 'flower', act: [{ t: 'take', n: 3 }] }; }
    insertPt(np, edSel >= 0 && edSel < A.pts.length ? edSel + 1 : A.pts.length); stopPlay(); commit(); refreshAll();
  }
  // ---- "+ Comandă nouă": every command becomes a new point (with its action) placed after the selected one ----
  const COMMANDS = [
    ['move', '📍', 'Mergi la un punct', 'Doar deplasare. Apoi apasă pe teren.'],
    ['shoot', '🎯', 'Trage în stup', 'Punct în fața celulei, cu 4 mingi.'],
    ['flower', '🌼', 'Ia mingi din floare', 'Stă cu fața la floare și scoate mingile.'],
    ['deposit', '🌸', 'Depune în floare', 'Pune o minge în floarea din față.'],
    ['garden', '🍯', 'Mingi din grădină', 'Intake în zona de colț.'],
    ['wait', '⏱', 'Așteaptă', 'Pauză de o secundă.'],
    ['park', '🅿', 'Parcare', 'Termină în zona roșie.']
  ];
  function addCommand(kind) {
    const A = S.autos[edSlot];
    if (kind === 'move') { edMode = 'add'; edPick = false; refreshAll(); toast('Apasă pe teren ca să pui punctul.'); return; }
    if (A.pts.length >= 14) return toast('Maximum 14 puncte.');
    if (kind === 'wait') {
      const at0 = edSel >= 0 && A.pts[edSel] ? edSel : A.pts.length - 1;
      if (at0 >= 0) { A.pts[at0].act = A.pts[at0].act || []; A.pts[at0].act.push({ t: 'wait', s: 1 }); edSel = at0; }
      else insertPt({ x: FLD.START.x, y: FLD.START.y - 20, h: 'auto', act: [{ t: 'wait', s: 1 }] }, 0);
      edPick = false; stopPlay(); commit(); refreshAll(); return;
    }
    if (kind === 'deposit') {
      const last = A.pts.length ? A.pts[A.pts.length - 1] : { x: FLD.START.x, y: FLD.START.y }; let b = null, bd = 1e9;
      FLD.FLOWERS.forEach(([x, y]) => { const d = Math.hypot(x - last.x, y - last.y); if (d < bd) { bd = d; b = [x, y]; } });
      const dx = 72 - b[0], dy = 72 - b[1], d = Math.hypot(dx, dy);
      insertPt({ x: inField(b[0] + dx / d * 16), y: inField(b[1] + dy / d * 16), h: 'flower', act: [{ t: 'deposit' }] }, edSel >= 0 && edSel < A.pts.length ? edSel + 1 : A.pts.length);
      edPick = false; stopPlay(); commit(); refreshAll(); return;
    }
    edPick = false; quickAdd(kind);
  }
  function pickerEl() {
    return el('div', { class: 'ap-pick' }, COMMANDS.map(([k, ic, t, d]) => el('button', { class: 'ap-pk', onclick: () => addCommand(k) }, el('span', { class: 'ic', text: ic }), el('b', { text: t }), el('small', { text: d }))));
  }
  function togglePick() { edPick = !edPick; renderAutoPanel(); const h = document.getElementById('apPickHost'); if (h && edPick) h.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  function bindEditor(cv) {
    edCv = cv; let drag = null; cv.tabIndex = 0;
    const at = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * FLD.IN, y: (e.clientY - r.top) / r.height * FLD.IN }; };
    const segDist = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1, t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / l2, 0, 1); return { d: Math.hypot(a.x + dx * t - p.x, a.y + dy * t - p.y), x: a.x + dx * t, y: a.y + dy * t }; };
    cv.addEventListener('pointerdown', (e) => {
      const pts = curPts(), p = at(e); cv.focus();
      if (edSel >= 0 && pts[edSel]) { const q = pts[edSel], a = headingOf(q, prevOf(pts, edSel)); if (Math.hypot(q.x + Math.cos(a) * 13 - p.x, q.y + Math.sin(a) * 13 - p.y) < 4.5) { drag = { k: 'rot', i: edSel }; try { cv.setPointerCapture(e.pointerId); } catch (x) { } stopPlay(); return; } }
      const hit = pts.findIndex((q) => Math.hypot(q.x - p.x, q.y - p.y) < 5.5);
      if (hit >= 0) { edSel = hit; drag = { k: 'move', i: hit }; try { cv.setPointerCapture(e.pointerId); } catch (x) { } stopPlay(); renderAutoPanel(); renderTimeline(); drawEditor(); return; }
      if (edMode === 'add') {
        let at0 = edSel >= 0 && edSel < pts.length ? edSel + 1 : pts.length, x = sn(inField(p.x)), y = sn(inField(p.y));
        let prev = FLD.START, best = 3.2; for (let i = 0; i < pts.length; i++) { const s = segDist(p, prev, pts[i]); if (s.d < best) { best = s.d; at0 = i; x = sn(inField(s.x)); y = sn(inField(s.y)); } prev = pts[i]; }   // click on a line = insert there
        insertPt({ x, y, h: 'auto', act: [] }, at0); stopPlay(); commit();
      } else edSel = -1;
      refreshAll();
    });
    cv.addEventListener('pointermove', (e) => {
      if (!drag) { const h = at(e); edHover = { x: clamp(h.x, 0, FLD.IN), y: clamp(h.y, 0, FLD.IN) }; if (!edPlay || !edPlay.playing) drawEditor(); return; }
      const pts = curPts(), q = pts[drag.i], p = at(e); if (!q) return;
      if (drag.k === 'move') { q.x = sn(inField(p.x)); q.y = sn(inField(p.y)); } else { let d = Math.atan2(p.y - q.y, p.x - q.x) * 180 / Math.PI; d = Math.round(((d % 360) + 360) % 360 / 5) * 5 % 360; q.h = d; }
      drawEditor();
    });
    const up = () => { if (drag) { drag = null; commit(); refreshAll(); } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', () => { edHover = null; if (!drag) drawEditor(); });
    if (!edKeysBound) {
      edKeysBound = true;
      window.addEventListener('keydown', (e) => {
        if (!edCv || !edCv.isConnected || !S || !S.autos || /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) return;
        const pts = curPts(), mod = e.ctrlKey || e.metaKey, k = e.key;
        if (mod && k.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redoEd(); else undoEd(); }
        else if (mod && k.toLowerCase() === 'y') { e.preventDefault(); redoEd(); }
        else if ((k === 'Delete' || k === 'Backspace') && edSel >= 0 && pts[edSel]) { e.preventDefault(); pts.splice(edSel, 1); edSel = Math.min(edSel, pts.length - 1); stopPlay(); commit(); refreshAll(); }
        else if (edSel >= 0 && pts[edSel] && k.startsWith('Arrow')) { e.preventDefault(); const st = e.shiftKey ? 5 : 1, q = pts[edSel]; if (k === 'ArrowLeft') q.x = inField(q.x - st); if (k === 'ArrowRight') q.x = inField(q.x + st); if (k === 'ArrowUp') q.y = inField(q.y - st); if (k === 'ArrowDown') q.y = inField(q.y + st); stopPlay(); commit(); refreshAll(); }
        else if (k === 'Escape' && edSel >= 0) { edSel = -1; refreshAll(); }
      });
    }
  }
  function autoSelect() {
    const sel = el('select', { class: 'cr-in cr-sel', onchange: (e) => { S.autoSel = +e.target.value; save(); toast(S.autoSel < 0 ? 'Autonom oprit: conduci tu de la început.' : 'La meci folosești: ' + S.autos[S.autoSel].name); } },
      el('option', { value: -1, text: 'Manual (conduc eu)', selected: S.autoSel < 0 }), S.autos.map((a, i) => el('option', { value: i, text: a.name + (a.pts.length ? ' · ' + a.pts.length + ' puncte' : ' · gol'), selected: S.autoSel === i })));
    return sel;
  }
  function refreshAll() { renderAutoPanel(); renderTimeline(); drawEditor(); }
  function renderAutoPanel() {
    const host = document.getElementById('autoPanel'); if (!host || !S) return;
    const A = S.autos[edSlot], tl = timeline(A.pts), over = tl.total > 30, active = S.autoSel === edSlot, chk = checkPts(A.pts), badAt = new Set(chk.map((c) => c.i));
    const set = (fn) => (e) => { fn(e); stopPlay(); commit(); refreshAll(); };
    const move = (i, d) => { const j = i + d; if (j < 0 || j >= A.pts.length) return; [A.pts[i], A.pts[j]] = [A.pts[j], A.pts[i]]; edSel = j; stopPlay(); commit(); refreshAll(); };
    const step = (n, title, sub) => el('div', { class: 'ap-step' }, el('b', { text: n }), el('div', null, el('h3', { text: title }), sub ? el('small', { text: sub }) : null));
    const rows = A.pts.map((p, i) => el('div', { class: 'ap-row' + (i === edSel ? ' on' : '') + (badAt.has(i) ? ' warn' : ''), onclick: () => { edSel = i; refreshAll(); } },
      el('b', { text: i + 1 }), el('span', { text: Math.round(p.x) + ', ' + Math.round(p.y) }), el('span', { class: 'ap-tags' }, (p.act || []).map((a) => el('i', { title: ACT_LABEL[a.t], text: ACT_TAG[a.t] }))), badAt.has(i) ? el('em', { title: 'Are o problemă, vezi mai jos', text: '!' }) : null,
      el('span', { class: 'ap-mv' }, el('button', { title: 'Mută mai sus', onclick: (e) => { e.stopPropagation(); move(i, -1); } }, '▲'), el('button', { title: 'Mută mai jos', onclick: (e) => { e.stopPropagation(); move(i, 1); } }, '▼'),
        el('button', { title: 'Șterge punctul', onclick: (e) => { e.stopPropagation(); A.pts.splice(i, 1); edSel = Math.min(edSel, A.pts.length - 1); stopPlay(); commit(); refreshAll(); } }, '✕'))));
    let edit = null;
    if (edSel >= 0 && A.pts[edSel]) {
      const p = A.pts[edSel], hmode = typeof p.h === 'number' ? 'fix' : p.h;
      edit = el('div', { class: 'ap-edit' }, el('div', { class: 'cr-eyebrow', text: 'Punctul ' + (edSel + 1) + ' · ce face aici' }),
        el('label', { class: 'ap-f' }, el('span', { text: 'Încotro se uită robotul (poți trage și mânerul roz de pe teren)' }),
          el('select', { class: 'cr-in cr-sel', onchange: set((e) => { const v = e.target.value; p.h = v === 'fix' ? 0 : v; }) }, [['auto', 'Pe direcția de mers'], ['cell', 'Spre celula stupului (pentru tras)'], ['flower', 'Spre cea mai apropiată floare (pentru a lua mingi)'], ['fix', 'Unghi fix']].map(([v, t]) => el('option', { value: v, text: t, selected: hmode === v })))),
        hmode === 'fix' ? el('label', { class: 'ap-f' }, el('span', { text: 'Unghi (0° = dreapta, 90° = în jos)' }), el('input', { class: 'cr-in', type: 'number', min: 0, max: 359, step: 5, value: p.h, onchange: set((e) => { p.h = ((Math.round(+e.target.value || 0) % 360) + 360) % 360; }) })) : null,
        el('div', { class: 'ap-sub', text: 'Apasă ca să adaugi o acțiune (se fac în ordine)' }),
        el('div', { class: 'ap-chips' }, Object.keys(ACT_LABEL).map((t) => el('button', { class: 'ap-chip', title: ACT_LABEL[t], onclick: () => { p.act = p.act || []; p.act.push(t === 'shoot' ? { t, n: 4 } : t === 'take' ? { t, n: 2 } : t === 'wait' || t === 'intake' ? { t, s: 1 } : { t }); stopPlay(); commit(); refreshAll(); } }, el('i', { text: ACT_TAG[t] }), ACT_SHORT[t]))),
        (p.act || []).length ? el('div', { class: 'ap-acts' }, p.act.map((a, k) => el('div', { class: 'ap-act' }, el('b', { text: (k + 1) + '. ' + ACT_LABEL[a.t] }),
          a.t === 'shoot' ? el('label', null, 'mingi ', el('input', { type: 'number', min: 1, max: 4, value: a.n || 4, onchange: set((e) => { a.n = clamp(Math.round(+e.target.value || 1), 1, 4); }) })) : null,
          a.t === 'take' ? el('label', null, 'mingi ', el('input', { type: 'number', min: 1, max: 4, value: a.n || 1, onchange: set((e) => { a.n = clamp(Math.round(+e.target.value || 1), 1, 4); }) })) : null,
          a.t === 'wait' || a.t === 'intake' ? el('label', null, 'secunde ', el('input', { type: 'number', min: 0.5, max: 8, step: 0.5, value: a.s || 1, onchange: set((e) => { a.s = clamp(+e.target.value || 1, 0.5, 8); }) })) : null,
          el('button', { title: 'Scoate acțiunea', onclick: set(() => { p.act.splice(k, 1); }) }, '✕')))) : el('p', { class: 'cr-note', text: 'Nicio acțiune: robotul doar trece pe aici.' }));
    }
    const atAl = S.atAl === 'blue' ? 'blue' : 'red';
    host.replaceChildren(...[
      step(1, 'Alege autonomul', 'Ai 3 locuri. Cel bifat „activ” se rulează singur la fiecare meci.'),
      el('div', { class: 'ap-slots' }, S.autos.map((a, i) => el('button', { class: 'ap-slot' + (i === edSlot ? ' on' : ''), onclick: () => { edSlot = i; S.edSlot = i; edSel = -1; stopPlay(); histReset(); render(); } },
        el('b', { text: 'Auto ' + (i + 1) }), el('span', { text: a.name }), el('small', { text: a.pts.length ? a.pts.length + ' puncte' : 'gol' }), S.autoSel === i ? el('em', { text: 'activ la meci' }) : null))),
      el('input', { class: 'cr-in', style: 'margin-top:10px', value: A.name, maxlength: 28, title: 'Numele autonomului', onchange: (e) => { A.name = e.target.value.trim() || 'Auto ' + (edSlot + 1); save(); render(); } }),
      el('label', { class: 'ap-switch' }, el('input', { type: 'checkbox', checked: active, onchange: (e) => { S.autoSel = e.target.checked ? edSlot : -1; save(); renderAutoPanel(); toast(S.autoSel < 0 ? 'Autonom oprit: conduci tu de la început.' : A.name + ' e activ la meciuri.'); } }), el('span', { text: 'Folosește acest autonom la meciuri' })),
      step(2, 'Construiește traseul', 'Adaugă comenzi una după alta: robotul le face în ordine.'),
      el('button', { class: 'ap-newcmd' + (edPick ? ' open' : ''), onclick: togglePick }, el('span', { class: 'plus', text: edPick ? '×' : '+' }), el('b', { text: 'Comandă nouă' }), el('small', { text: edPick ? 'alege ce face robotul' : (A.pts.length ? 'după punctul ' + (edSel >= 0 && A.pts[edSel] ? edSel + 1 : A.pts.length) : 'prima comandă') })),
      el('div', { id: 'apPickHost' }, edPick ? pickerEl() : null),
      el('div', { class: 'ap-sub', text: 'Sau începe de la un traseu gata făcut' }),
      el('div', { class: 'ap-presets' }, Object.keys(PRESETS).map((k) => el('button', { class: 'ap-preset', onclick: () => { if (!A.pts.length || confirm('Înlocuiești traseul curent cu „' + k + '”?')) { A.pts = clonePts(PRESETS[k]); edSel = -1; stopPlay(); commit(); refreshAll(); } } }, el('b', { text: k }), el('small', { text: PRESET_INFO[k] })))),
      el('div', { class: 'cr-row', style: 'margin:12px 0 4px' },
        el('button', { class: 'cr-btn sm', text: 'Oglindește', title: 'Stânga ↔ dreapta', onclick: set(() => { A.pts.forEach((p) => { p.x = FLD.IN - p.x; if (typeof p.h === 'number') p.h = ((180 - p.h) % 360 + 360) % 360; }); }) }),
        el('button', { class: 'cr-btn sm', text: 'Golește tot', onclick: set(() => { A.pts = []; edSel = -1; }) })),
      el('div', { class: 'ap-sub', text: 'Puncte (' + A.pts.length + '/14) · apasă ca să-l editezi' }),
      A.pts.length ? el('div', { class: 'ap-list' }, rows) : el('p', { class: 'cr-note', text: 'Niciun punct încă. Apasă pe teren, în stânga, ca să pui primul punct.' }),
      edit,
      chk.length ? el('div', { class: 'ap-checks' }, el('b', { text: 'De rezolvat' }), chk.slice(0, 5).map((c) => el('p', { onclick: () => { if (c.i >= 0) { edSel = c.i; refreshAll(); } }, text: c.msg }))) : (A.pts.length ? el('p', { class: 'cr-note', style: 'color:var(--ok)', text: '✓ Nicio problemă găsită în traseu.' }) : null),
      step(3, 'Testează', 'Vezi cum merge înainte să-l folosești într-un meci.'),
      el('div', { class: 'ap-stats' }, el('div', null, el('small', { text: 'Durată estimată' }), el('b', { class: over ? 'bad' : '', text: tl.total.toFixed(1).replace('.', ',') + ' s din 30 s' })),
        el('div', null, el('small', { text: 'Precizie (după electronică)' }), el('b', { text: '±' + Math.round(tl.err) + ' in' }))),
      tl.bad ? el('p', { class: 'cr-note', style: 'color:var(--gold)', text: tl.bad + ' segment' + (tl.bad > 1 ? 'e trec' : ' trece') + ' prin stup (linie roșie). Robotul le ocolește singur, dar pierde timp.' }) : null,
      over ? el('p', { class: 'cr-note', style: 'color:#ff8a96', text: 'Traseul durează mai mult de 30 s: ultimele puncte nu se vor executa.' }) : null,
      el('div', { class: 'cr-row', style: 'margin:10px 0 6px' }, el('button', { class: 'cr-btn pri big', disabled: !A.pts.length, text: '▶ Testează pe terenul 3D', onclick: testAuto3d })),
      el('div', { class: 'cr-row', style: 'gap:14px' },
        el('div', { class: 'ap-seg' }, ['red', 'blue'].map((al) => el('button', { class: atAl === al ? 'on ' + al : al, onclick: () => { S.atAl = al; save(); renderAutoPanel(); } }, al === 'red' ? 'Alianța roșie' : 'Alianța albastră'))),
        el('label', { class: 'ap-switch', style: 'margin:0' }, el('input', { type: 'checkbox', checked: !!S.atOpp, onchange: (e) => { S.atOpp = e.target.checked; save(); } }), el('span', { text: 'Cu adversar AI' }))),
      el('p', { class: 'cr-note', style: 'margin-top:6px', text: 'Testul se joacă pe terenul 3D, fără meci: vezi robotul urmând traseul, apoi primești puncte, timp și eroarea de poziție.' })
    ].filter(Boolean));
  }
  function testAuto3d() {
    const A = S.autos[edSlot]; if (!A.pts.length) return toast('Adaugă mai întâi puncte pe teren.');
    const alliance = S.atAl === 'blue' ? 'blue' : 'red';
    const payload = { id: 'autotest-' + Date.now(), type: 'autotest', label: 'Test autonom · ' + A.name, alliance, robot: canTurret() ? S.type : 'strafe', mods: modsOf(S), team: S.team, opp: { name: 'Adversar', skill: 0.4, passive: !S.atOpp }, auto: { name: A.name, pts: alliance === 'blue' ? A.pts.map(mirrorPt) : clonePts(A.pts) }, ts: Date.now() };
    try { localStorage.setItem(MATCH_KEY, JSON.stringify(payload)); localStorage.removeItem(RESULT_KEY); } catch (e) { return toast('Nu pot porni testul (stocarea e blocată).'); }
    S.edSlot = edSlot; save(); flushCloud(1200).then(() => goTop('field-sim-3d.html?career=1&test=1'));
  }
  function autoView() {
    ensureAutos(); if (!edLast) histReset();
    const cv = el('canvas', { class: 'ap-cv', width: 900, height: 900 });
    const mapBox = el('div', { class: 'ap-map' }, cv);
    const tb = el('div', { class: 'ap-toolbar' },
      el('div', { class: 'ap-seg' }, [['add', '➕ Adaugă puncte'], ['move', '✋ Doar mută']].map(([m, t]) => el('button', { class: edMode === m ? 'on pink' : '', onclick: (e) => { edMode = m; [...e.target.parentNode.children].forEach((b) => b.classList.remove('on', 'pink')); e.target.classList.add('on', 'pink'); }, title: m === 'add' ? 'Apasă pe teren ca să pui puncte' : 'Apăsările pe teren nu mai adaugă puncte' }, t))),
      el('label', { class: 'ap-switch', style: 'margin:0', title: 'Punctele se lipesc de o grilă de 3 in' }, el('input', { type: 'checkbox', checked: edSnap, onchange: (e) => { edSnap = e.target.checked; drawEditor(); } }), el('span', { text: 'Grilă' })),
      el('span', { style: 'flex:1' }),
      el('button', { class: 'ap-tool', title: 'Anulează (Ctrl+Z)', onclick: undoEd }, '↶'), el('button', { class: 'ap-tool', title: 'Refă (Ctrl+Y)', onclick: redoEd }, '↷'),
      el('button', { class: 'ap-tool', title: 'Șterge punctul selectat (Delete)', onclick: () => { const pts = curPts(); if (edSel < 0 || !pts[edSel]) return toast('Selectează întâi un punct.'); pts.splice(edSel, 1); edSel = Math.min(edSel, pts.length - 1); stopPlay(); commit(); refreshAll(); } }, '🗑'));
    const tlrow = el('div', { class: 'ap-tlrow' }, el('button', { class: 'ap-tool', id: 'apPlayBtn', title: 'Previzualizare', onclick: togglePlay }, '▶'),
      el('input', { type: 'range', id: 'apScrub', min: 0, max: 1000, value: 0, oninput: (e) => { if (!curPts().length) return; ensurePlay(); edPlay.playing = false; edPlay.t = (+e.target.value / 1000) * edPlay.tl.total; drawEditor(); updateTlUi(); } }), el('span', { id: 'apTime', text: '0,0 / 0,0 s' }));
    const legend = el('div', { class: 'ap-legend' },
      el('span', null, el('i', { class: 'lg-line' }), 'traseu'), el('span', null, el('i', { class: 'lg-line bad' }), 'trece prin stup'), el('span', null, el('i', { class: 'lg-sq' }), 'startul'), el('span', null, el('i', { class: 'lg-dot' }), 'mâner direcție (trage-l)'),
      ['T trage în stup', 'D depune în floare', 'L ia mingi din floare', 'I intake', 'W așteaptă'].map((t) => el('span', null, el('i', { class: 'lg-tag', text: t[0] }), t.slice(2))));
    const view = el('div', { class: 'cr-grid' },
      el('div', { class: 'cr-card s7' }, el('div', { class: 'cr-eyebrow', text: 'Terenul · vedere de sus' }), el('h2', { text: 'Autonomul robotului' }),
        el('p', { class: 'cr-sub', text: 'În primele 30 de secunde ale meciului robotul merge singur pe traseul de aici. Pornește de jos, ca alianța roșie; la albastru traseul se oglindește singur. Dacă apeși o tastă de mers în meci, preiei controlul.' }),
        tb, mapBox, tlrow, el('div', { class: 'ap-tl', id: 'apTl' }), legend,
        el('p', { class: 'cr-note', style: 'margin-top:8px', text: 'Scurtături: Delete șterge punctul selectat · săgețile îl mută (Shift = mai mult) · Ctrl+Z anulează · Esc deselectează.' })),
      el('div', { class: 'cr-card s5' }, el('div', { id: 'autoPanel' })));
    setTimeout(() => { bindEditor(cv); renderAutoPanel(); renderTimeline(); drawEditor(); }, 0);
    return view;
  }

  // ---------- render ----------
  function render() {
    document.querySelectorAll('.cr-modal:not(.keep)').forEach((m) => m.remove());
    app.replaceChildren();
    if (!S) { app.append(welcome()); return; }
    ensureAutos();
    const views = { hub: hubView, robot: robotView, auto: autoView, sponsors: sponsorsView, event: eventView, history: historyView };
    app.append(header(), nav(), el('main', { class: 'cr-main' }, pendingBanner(), views[tab]()));
    if (S.lastMatch) showMatchResult(); else if (S.summary) showSummary(); else if (S.card != null) showCard();
  }

  // ---------- boot: pick up a finished match from the game ----------
  S = load();
  { const q = location.search.match(/[?&]tab=(\w+)/); if (q && ['hub', 'robot', 'auto', 'sponsors', 'event', 'history'].includes(q[1])) tab = q[1]; }
  edSlot = clamp((S && S.edSlot) | 0, 0, 2);
  if (S) {
    let res = null; try { res = JSON.parse(localStorage.getItem(RESULT_KEY) || 'null'); } catch (e) { }
    if (res && res.id && applyResult(res)) { localStorage.removeItem(RESULT_KEY); localStorage.removeItem(MATCH_KEY); if (S.event || S.summary) tab = 'event'; }
    else if (res) localStorage.removeItem(RESULT_KEY);
  }
  render();
  cloudInit().then(() => { if (!S) render(); });
  if (SBX) SBX.auth.onAuthStateChange((ev) => { if (ev === 'SIGNED_OUT') { CLOUD.user = null; CLOUD.status = 'guest'; paintCloud(); } });
  addEventListener('pagehide', () => { if (cloudTimer) cloudPush(); });
})();
