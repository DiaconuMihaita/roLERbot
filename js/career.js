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
  const STAGES = {
    meet: { n: 6, skill: [0.14, 0.62], pay: [900, 550, 300, 120], rep: [4, 3, 2, 1], lvl: 0 },
    reg: { name: 'League Tournament (regionala)', n: 6, skill: [0.30, 0.76], pay: [4200, 2600, 1500, 500], rep: [18, 12, 8, 3], lvl: 1, qual: 3 },
    nat: { name: 'Campionatul național', n: 6, skill: [0.52, 0.90], pay: [7500, 4500, 2600, 800], rep: [28, 18, 12, 4], lvl: 2, qual: 2 },
    wld: { name: 'Campionatul mondial', n: 6, skill: [0.70, 0.98], pay: [12000, 8000, 5000, 1500], rep: [50, 35, 22, 8], lvl: 2 }
  };
  const MEET_WEEKS = [2, 4, 6, 8, 10];
  const buildCal = () => MEET_WEEKS.map((w, i) => ({ id: 'm' + (i + 1), type: 'meet', no: i + 1, week: w, enrolled: false, done: false })).concat([{ id: 'reg', type: 'reg', week: 13, done: false }, { id: 'nat', type: 'nat', week: 17, done: false, off: true }, { id: 'wld', type: 'wld', week: 21, done: false, off: true }]);
  const BRANDS = [['Recumed', 'recumed.png'], ['Primăria Vaslui', 'vaslui.png'], ['Domeniile Averești', 'domnav.png'], ['WoodlineMob', 'woodline.png'], ['Specialistul', 'specialistu.png'], ['Mixcod', 'mixcod.png'], ['Gold Studio', 'gold.png'], ['Curs Festiv Events', 'cfe.png'], ['Apisrom', 'apis.png'], ['Safir', 'safir.png']];
  const TEAM_NAMES = ['Gear Gliders', 'Byte Bees', 'Torque Titans', 'Servo Storm', 'Circuit Swarm', 'Pollen Patrol', 'Nectar Knights', 'Hive Hackers', 'Flywheel Foxes', 'Orbit Owls', 'Mecanum Monsters', 'Delta Drivers', 'Quantum Quills', 'Bolt Brigade', 'Alpha Apiary', 'Rotor Rangers'];
  const KINDS = {
    score: { text: (t) => 'Scorează cel puțin ' + t + ' puncte într-un singur meci', target: (e, z) => [20, 30, 40][e] + z * 4, pay: (t) => 600 + t * 14, rep: 4 },
    wins: { text: (t) => 'Câștigă cel puțin ' + t + ' din 6 meciuri de calificare la un eveniment', target: (e) => [3, 4, 4][e], pay: (t) => 900 + t * 350, rep: 6 },
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
  const cloudText = () => ({ guest: 'Neconectat', saving: 'Se salvează…', ok: '' + CLOUD.name + ' · salvat', error: 'Eroare la salvare', nosetup: 'Salvare în cont indisponibilă' }[CLOUD.status] || '');
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
  function newState(team, region) {
    const s = { v: 1, region, team: { name: team.name, num: String(team.num) }, cal: buildCal(), mscores: [], money: 3000, rep: 0, week: 1, season: 1, evCount: 0, hw: { chassis: 0, motors: 0, intake: 0, launcher: 0, software: 0 }, build: [], type: 'strafe', sponsors: [], offers: [], sponsorLog: [], event: null, pending: null, buffs: [], practiceWeek: 0, history: [], log: [], stats: { w: 0, l: 0, t: 0, tips: 0, titles: 0 }, summary: null, lastMatch: null, card: null };
    S = s; s.offers = genOffers(); s.notifs = []; initExtras(s); log('Ai fondat echipa ' + team.name + ' (#' + s.team.num + '), regiunea ' + regionOf(region).name + '. Sezonul 1 începe.');
    notify({ app: 'meets', ic: '📅', title: 'Meet-urile sezonului #11 sunt publicate', text: 'Înscrie-te la 2–5 meet-uri. Regionala e în săptămâna 13.' }, true);
    notify({ app: 'shop', ic: '🛠️', title: 'Reduceri de început de sezon', text: '−10% la piese și teren de antrenament în săptămânile 1–2.' }, true);
    if (s.offers[0]) notify({ app: 'sponsors', ic: '🤝', title: s.offers[0].brand + ' te caută', text: 'Au o ofertă de sponsorizare pentru echipa ta.', act: { t: 'offer', id: s.offers[0].id, label: 'Acceptă oferta' } }, true);
    notify({ app: 'shop', ic: '🟩', title: 'Comandă terenul de antrenament', text: 'Fără el nu poți testa autonomul sau face antrenamente. Livrarea durează 1 săptămână.' }, true);
    s.alertNew = true; return s;
  }
  function migrate() {   // saves made before the season structure (meets / regional / national) existed
    if (!S) return;
    if (!Array.isArray(S.cal)) { S.cal = buildCal(); S.event = null; S.pending = null; S.week = 1; S.evCount = S.evCount || 0; }
    if (!Array.isArray(S.mscores)) S.mscores = [];
    initExtras(S); S.build.forEach((b) => { if (!b.stage) b.stage = 'build'; });
    if (S.event && !S.event.matches) { S.event = null; S.pending = null; }   // event started before the 2v2 schedule existed
  }
  function modsOf(s, withBuffs = true) {
    const m = { speed: 1, accel: 1, turn: 1, intake: 1, reload: 1, spread: 1, assist: 1 };
    for (const c in HW) { const fx = HW[c].tiers[s.hw[c]].fx; for (const k in fx) m[k] *= fx[k]; }
    if (withBuffs) for (const b of s.buffs) m[b.mod] *= b.mul;
    if (s.crew) { const d = crewLv(s, 'driver'), pr = crewLv(s, 'prog'), b = crewLv(s, 'build'); m.speed *= 1 + .02 * d; m.turn *= 1 + .02 * d; m.assist *= 1 + .04 * pr; m.accel *= 1 + .02 * b; m.intake *= 1 + .02 * b; }
    for (const k in m) m[k] = Math.round(clamp(m[k], CAP[k][0], CAP[k][1]) * 1000) / 1000;
    return m;
  }
  const barPct = (k, v) => { const [lo, hi] = CAP[k]; return Math.round(((k === 'reload' || k === 'spread') ? (1 - v) / (1 - lo) : (v - 1) / (hi - 1)) * 100); };
  const barTxt = (k, v) => ((k === 'reload' || k === 'spread') ? '−' + Math.round((1 - v) * 100) + '%' : '+' + Math.round((v - 1) * 100) + '%');
  const canTurret = () => S.hw.launcher >= 2;
  const activeSponsors = () => S.sponsors.filter((x) => x.status === 'active');

  // ---------- sponsors ----------
  function genOffers() {
    const ne = S && nextEvent(), e = ne ? STAGES[ne.type].lvl : 0, z = S ? S.season - 1 : 0, taken = new Set((S ? activeSponsors() : []).map((x) => x.brand));
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
    if (ok) { if (S.ss) S.ss.sp++; S.money += sp.pay; S.rep += sp.rep; log(sp.brand + ' e mulțumit: +' + eur(sp.pay) + ', +' + sp.rep + ' reputație.'); }
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
  const shipWk = (t) => Math.ceil(t.wk / 2);                                        // delivery of the parts
  const asmWk = (t) => Math.max(1, t.wk - (crewLv(S, 'build') >= 3 ? 1 : 0));        // assembly in the workshop (a level 3 builder saves a week)
  const STAGE_NAMES = ['Comandat', 'Livrare', 'Piese sosite', 'Montaj', 'Gata'];
  function buy(cat, express) {   // buys the PARTS: they ship (or arrive at once with express), then you still have to build the upgrade
    const cur = S.hw[cat], t = HW[cat].tiers[cur + 1]; if (!t || pendingFor(cat)) return;
    const cost = priceOf(t, express);
    if (S.rep < t.rep) return toast('Ai nevoie de ' + t.rep + ' reputație.');
    if (S.money < cost) return toast('Nu ai destui bani (' + eur(cost) + ').');
    S.money -= cost;
    S.build.push({ cat, tier: cur + 1, stage: express ? 'stock' : 'ship', ready: S.week + shipWk(t) });
    log(express ? 'Comandat express: ' + t.n + ' (−' + eur(cost) + '). Piesele au sosit, montează-le în atelier.' : 'Comandat: ' + t.n + ' (−' + eur(cost) + '). Piesele ajung în ' + shipWk(t) + ' săpt., apoi montajul durează ' + asmWk(t) + '.');
    save(); render();
  }
  function startBuild(b) {
    if (S.build.some((x) => x.stage === 'build')) return toast('Atelierul e ocupat: termină montajul curent.');
    const t = HW[b.cat].tiers[b.tier], d = asmWk(t); b.stage = 'build'; b.ready = S.week + d; log('Montaj început: ' + t.n + ' (' + d + ' săpt.).'); gainXp('build', 5); save(); render();
  }
  function installReady() {
    for (const b of S.build.slice()) {
      if (!b.stage) b.stage = 'build'; const t = HW[b.cat].tiers[b.tier];
      if (b.stage === 'ship' && b.ready <= S.week) { b.stage = 'stock'; log('Au sosit piesele: ' + t.n + '.'); notify({ app: 'shop', ic: '📦', title: 'Piesele au sosit', text: t.n + '. Începe montajul în atelier (montajul durează ' + asmWk(t) + ' săpt.).' }); }
      else if (b.stage === 'build' && b.ready <= S.week) { S.hw[b.cat] = b.tier; S.build = S.build.filter((x) => x !== b); log('Montat: ' + t.n + '. Robotul e mai bun.'); gainXp('build', 15); notify({ app: 'shop', ic: '🔧', title: 'Upgrade montat', text: t.n + ' e pe robot.' }); }
    }
    if (S.fieldOrder && S.fieldOrder.ready <= S.week) { S.field = true; S.fieldOrder = null; log('A ajuns terenul de antrenament.'); notify({ app: 'shop', ic: '🟩', title: 'Terenul a ajuns', text: 'Poți testa autonomul și face antrenamente (2 pe săptămână).' }); }
    if (!canTurret()) S.type = 'strafe';
  }
  const stageIdx = (b) => (b.stage === 'ship' ? 1 : b.stage === 'stock' ? 2 : 3);
  function stageLabel(b) { const t = HW[b.cat].tiers[b.tier]; return b.stage === 'ship' ? 'În livrare · sosesc în săpt. ' + b.ready : b.stage === 'stock' ? 'Piese sosite · montajul durează ' + asmWk(t) + ' săpt.' : 'Montaj în curs · gata în săpt. ' + b.ready; }
  function orderRow(b) {
    const t = HW[b.cat].tiers[b.tier], idx = stageIdx(b), busy = S.build.some((x) => x.stage === 'build');
    return el('div', { class: 'order' }, el('div', { class: 'ord-h' }, el('b', { text: HW[b.cat].name + ' · ' + t.n }), el('small', { text: stageLabel(b) })),
      el('div', { class: 'ord-steps' }, STAGE_NAMES.map((n, i) => el('span', { class: i < idx ? 'done' : i === idx ? 'now' : '', text: n }))),
      b.stage === 'stock' ? el('button', { class: 'cr-btn sm pri', disabled: busy, text: busy ? 'Atelierul e ocupat' : 'Începe montajul (' + asmWk(t) + ' săpt.)', onclick: () => startBuild(b) }) : null);
  }
  function fieldStatus() { return S.field ? ['ok', 'Ai teren de antrenament'] : S.fieldOrder ? ['wait', 'Terenul ajunge în săpt. ' + S.fieldOrder.ready] : ['no', 'Nu ai teren de antrenament']; }
  function workshopCard() {
    const fs = fieldStatus();
    return el('div', { class: 'cr-card' }, cardHead('Atelier', S.build.length ? S.build.length + (S.build.length === 1 ? ' comandă în lucru' : ' comenzi în lucru') : 'Nicio comandă în lucru'),
      el('div', { class: 'fld ' + fs[0] }, tile('field', null, 'fi'), el('div', null, el('b', { text: fs[1] }), el('small', { text: S.field ? 'Poți antrena și testa autonomul.' : 'Fără teren nu poți testa autonomul sau face antrenamente.' })),
        !S.field && !S.fieldOrder ? el('button', { class: 'cr-btn sm pri', text: 'Comandă', onclick: () => openPhone('shop') }) : null),
      S.build.length ? el('div', { class: 'orders' }, S.build.map(orderRow)) : el('p', { class: 'cr-note', style: 'margin-top:10px', text: 'Caută piese în magazin (tableta → Piese). Livrarea durează, apoi montajul încă o perioadă.' }),
      el('div', { class: 'cr-row', style: 'margin-top:10px' }, el('button', { class: 'cr-btn sm', text: 'Magazin de piese', onclick: () => openPhone('shop') }), el('button', { class: 'cr-btn sm', text: 'Upgrade-uri', onclick: () => { tab = 'robot'; render(); } })));
  }

  // ---------- calendar / events: sezon #11 FTC România = League Meets → League Tournament (regionala) → Campionat național → Mondiale ----------
  const itemName = (it) => (it.type === 'meet' ? 'League Meet #' + it.no : STAGES[it.type].name);
  const nextEvent = () => ((S && S.cal) || []).find((it) => !it.done && !it.off && (it.type !== 'meet' || it.enrolled)) || null;
  const regionOf = (id) => { const R = window.CAREER_REGIONS || []; return R.find((r) => r.id === id) || R[0] || { id: 'x', name: '—', teams: [] }; };
  const hash = (n) => { let x = (Number(n) * 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const baseSkill = (num) => 0.7 * hash(num) + 0.3 * hash(Number(num) + S.season * 131);   // stable per team (fictional strength, not real rankings)
  const skillFor = (num, st, jitter) => { const d = STAGES[st]; return clamp(d.skill[0] + (d.skill[1] - d.skill[0]) * baseSkill(num) + (S.season - 1) * 0.04 + (jitter ? rnd(-.03, .03) : 0), 0, 0.98); };
  const regionPool = (id) => regionOf(id).teams.map(([name, num]) => ({ name, num }));
  const isMe = (t) => String(t.num) === String(S.team.num);
  function fillPool(arr, k) {
    const out = arr.slice(), used = new Set(out.map((t) => t.name)); let i = 0;
    while (out.length < k) { const nm = TEAM_NAMES[i % TEAM_NAMES.length] + (i >= TEAM_NAMES.length ? ' ' + (Math.floor(i / TEAM_NAMES.length) + 1) : ''); i++; if (!used.has(nm)) { used.add(nm); out.push({ name: nm, num: 30000 + i * 37 }); } }
    return out;
  }
  function buildField(it) {
    const own = regionPool(it.type === 'meet' && it.host ? it.host : S.region).filter((t) => !isMe(t)); let opp;
    if (it.type === 'meet') { const k = irnd(8, 20) - 1; opp = shuffle(fillPool(own, k)).slice(0, k); }
    else if (it.type === 'reg') opp = fillPool(own, 11);
    else if (it.type === 'nat') { const all = (window.CAREER_REGIONS || []).flatMap((r) => r.teams.map(([name, num]) => ({ name, num }))).filter((t) => !isMe(t)); opp = shuffle(fillPool(all, 27)).slice(0, 27); }
    else opp = fillPool([], 23);
    return [{ name: S.team.name, num: S.team.num, me: true, rp: 0, pts: 0, played: 0, w: 0, l: 0, t: 0 }].concat(opp.map((t) => ({ name: t.name, num: t.num, skill: skillFor(t.num, it.type, true), rp: 0, pts: 0, played: 0, w: 0, l: 0, t: 0 })));
  }
  // ranking of the region by the sum of the best 10 matches over all meets (the rule for the regional)
  const topTen = () => S.mscores.slice().sort((a, b) => b - a).slice(0, 10).reduce((a, b) => a + b, 0);
  function meetBoard() {
    const n = Math.max(6, S.mscores.length);
    const rows = regionPool(S.region).filter((t) => !isMe(t)).map((t) => {
      const sk = skillFor(t.num, 'meet', false), r = rng(Number(t.num) * 7919 + S.season * 31), sc = [];
      for (let i = 0; i < n; i++) sc.push(Math.max(0, Math.round(12 + 54 * sk + (r() + r() + r() + r() - 2) * 0.9 * 10)));
      sc.sort((a, b) => b - a); return { name: t.name, sum: sc.slice(0, 10).reduce((a, b) => a + b, 0) };
    });
    rows.push({ name: S.team.name, sum: topTen(), me: true }); rows.sort((a, b) => b.sum - a.sum);
    return rows;
  }
  function advanceWeek() {
    const ev = nextEvent(); if (ev && S.week >= ev.week) return;
    S.week++; S.money -= WEEK_COST; installReady(); log('Săptămâna ' + S.week + ': cheltuieli de echipă −' + eur(WEEK_COST) + '.');
    if (Math.random() < 0.32 && (!ev || S.week < ev.week)) S.card = Math.floor(Math.random() * CARDS.length);
    weekNotifs(); save(); render();
  }
  function weekNotifs() {
    S.cal.forEach((it) => {
      if (it.done || it.off) return; const d = it.week - S.week;
      if (it.type === 'meet') {
        if (it.enrolled && d === 1) notify({ app: 'meets', ic: '📅', title: itemName(it) + ' e săptămâna viitoare', text: 'Confirmă participarea: ' + dateOf(it.week) + '.' });
        else if (it.enrolled && d === 0) notify({ app: 'meets', ic: '🏁', title: 'Azi e ' + itemName(it), text: 'Intră în eveniment din tabul Eveniment.' });
        else if (!it.enrolled && d === 2) notify({ app: 'meets', ic: '📅', title: itemName(it) + ' și-a deschis înscrierile', text: dateOf(it.week) + ' · ' + regionOf(S.region).name + '. Mai sunt locuri.', act: { t: 'enroll', id: it.id, label: 'Înscrie-te' } });
      } else if (d === 1 || d === 0) notify({ app: 'meets', ic: '🏆', title: d ? itemName(it) + ' e săptămâna viitoare' : 'Azi: ' + itemName(it), text: dateOf(it.week) });
    });
    if (Math.random() < 0.5) genMsg();
    if (Math.random() < 0.3 && S.offers.length && activeSponsors().length < MAX_SPONSORS) { const o = pick(S.offers); notify({ app: 'sponsors', ic: '🤝', title: o.brand + ' te caută', text: 'Ofertă nouă: ' + KINDS[o.kind].text(o.target) + '.', act: { t: 'offer', id: o.id, label: 'Acceptă oferta' } }); }
  }
  function toggleEnroll(it) { enrollAt(it, S.region); }
  // un meci = 2 alianțe de câte 2 roboți (2 roșii + 2 albaștri). La începutul evenimentului se generează lista TUTUROR meciurilor; fiecare echipă joacă n meciuri,
  // cu parteneri și culori diferite (poate fi de ex. 4× albastru + 2× roșu).
  function genSchedule(N, n) {
    const matches = [], per = Math.ceil(N / 4);
    for (let r = 0; r < n; r++) {
      const order = shuffle([...Array(N).keys()]);
      for (let c = 0; c < per; c++) {
        const grp = order.slice(c * 4, c * 4 + 4), sur = [];   // when N is not a multiple of 4, some slots are filled by "surrogate" teams whose extra match does not count
        while (grp.length < 4) { let t; do { t = 1 + Math.floor(Math.random() * (N - 1)); } while (grp.includes(t)); grp.push(t); sur.push(t); }
        const g = shuffle(grp); matches.push({ no: matches.length + 1, red: g.slice(0, 2), blue: g.slice(2), sur, done: false });
      }
    }
    return matches;
  }
  const allScore = (a, b) => Math.max(0, Math.round(12 + 54 * ((a.skill || 0) + (b.skill || 0)) / 2 + gauss() * 10));
  function applyAlliance(ev, m, sr, sb, extra) {
    const res = sr > sb ? [3, 0] : sr < sb ? [0, 3] : [1, 1];
    [['red', 0, sr], ['blue', 1, sb]].forEach(([al, k, sc]) => m[al].forEach((ti) => {
      if (m.sur.includes(ti)) return; const t = ev.teams[ti];
      t.rp += res[k] + (extra[al] || 0); t.pts += sc; t.played++; if (res[k] === 3) t.w++; else if (res[k] === 1) t.t++; else t.l++;
    }));
    m.sr = sr; m.sb = sb; m.done = true;
  }
  function simMatch(ev, m) {
    const sr = allScore(ev.teams[m.red[0]], ev.teams[m.red[1]]), sb = allScore(ev.teams[m.blue[0]], ev.teams[m.blue[1]]);
    applyAlliance(ev, m, sr, sb, { red: sr >= 45 && Math.random() < .6 ? 1 : 0, blue: sb >= 45 && Math.random() < .6 ? 1 : 0 });
  }
  const simUpTo = (ev, no) => { ev.matches.forEach((m) => { if (!m.done && m.no < no && !m.red.concat(m.blue).includes(0)) simMatch(ev, m); }); };
  const myMatch = (ev) => ev.matches.find((x) => x.no === ev.mine[ev.round]);
  const myColor = (m) => (m.red.includes(0) ? 'red' : 'blue');
  function startEvent() {
    const it = nextEvent(); if (!it) return; const def = STAGES[it.type], teams = buildField(it);
    const matches = genSchedule(teams.length, def.n), mine = matches.filter((m) => m.red.concat(m.blue).includes(0) && !m.sur.includes(0)).map((m) => m.no);
    let seed = 0;
    if (it.type === 'reg' && S.mscores.length) { const b = meetBoard(), rk = b.findIndex((x) => x.me) + 1, f = rk / b.length; seed = f <= .15 ? 3 : f <= .4 ? 2 : f <= .7 ? 1 : 0; teams[0].rp = seed; }
    timeSchedule(matches);
    if (it.type !== 'meet') notify({ app: 'portfolio', ic: '📓', title: 'Jurizarea începe', text: 'Ai interviu cu juriul. Caietul tehnic acum: ' + pfTotal() + '%.' });
    S.event = { host: it.type === 'meet' && it.host ? it.host : S.region, id: it.id, judge: it.type !== 'meet' ? { done: false } : null, type: it.type, name: itemName(it), when: dateOf(it.week), n: def.n, teams, matches, mine, round: 0, hist: [], po: null, seed };
    notify({ app: 'ftc', ic: '📋', title: 'Lista meciurilor a fost publicată', text: matches.length + ' meciuri. Primul tău meci: #' + mine[0] + ', ora ' + fmtT(matches.find((m) => m.no === mine[0]).t) + '.' });
    log('Ai intrat la ' + S.event.name + ' (' + teams.length + ' echipe, ' + matches.length + ' meciuri, tu joci ' + def.n + ').' + (seed ? ' Bonus de seed din Top 10 meciuri: +' + seed + ' RP.' : '')); save(); render();
  }
  const simAlliance = (p, q) => { const sa = allScore(p.cap, p.par), sb = allScore(q.cap, q.par); return sa > sb || (sa === sb && (p.cap.rp || 0) >= (q.cap.rp || 0)) ? 0 : 1; };
  const qualSorted = (ev) => ev.teams.slice().sort((a, b) => b.rp - a.rp || b.pts - a.pts);
  const asAI = (t) => ({ name: t.name, skill: t.skill == null ? 0.5 : t.skill, num: t.num });
  async function launch(kind, msg) {
    const id = Date.now() + '-' + irnd(1000, 9999), ev = S.event;
    let opp, alliance, label, partner = null, opps = null;
    if (kind === 'qual') {
      const m = myMatch(ev), col = myColor(m), oc = col === 'red' ? 'blue' : 'red', mate = m[col].find((i) => i !== 0);
      alliance = col; partner = asAI(ev.teams[mate]); opps = m[oc].map((i) => asAI(ev.teams[i])); opp = opps[0];
      label = ev.name + ' · meciul ' + (ev.round + 1) + '/' + ev.n + ' (meci #' + m.no + ')';
    } else if (kind === 'playoff') {
      const po = ev.po; alliance = po.al; partner = asAI(po.partner); opps = [asAI(po.opp), asAI(po.oppPartner)]; opp = opps[0];
      label = ev.name + ' · ' + (po.phase === 'sf' ? 'semifinală' : 'finala');
    } else if (kind === 'friendly' && msg) { opp = { name: msg.team.name, skill: msg.team.skill, num: msg.team.num }; alliance = pick(['red', 'blue']); label = 'Meci amical vs ' + msg.team.name;
    } else { if (!S.field) return toast('Ai nevoie de un teren de antrenament.'); opp = { name: pick(TEAM_NAMES) + ' (antrenament)', skill: clamp(rnd(0.25, 0.6) + (S.season - 1) * .05, 0, .95) }; alliance = pick(['red', 'blue']); label = 'Antrenament'; }
    S.pending = { id, kind, msgId: msg && msg.id }; save();
    ensureAutos(); const AU = S.autos[S.autoSel], auto = AU && AU.pts.length ? { name: AU.name, pts: alliance === 'blue' ? AU.pts.map(mirrorPt) : clonePts(AU.pts) } : null;
    try { localStorage.setItem(MATCH_KEY, JSON.stringify({ id, type: kind, label, alliance, robot: canTurret() ? S.type : 'strafe', mods: modsOf(S), team: S.team, opp: { name: opp.name, skill: opp.skill, num: opp.num }, partner, opps, plan: S.plan || 'bal', auto, ts: Date.now() })); localStorage.removeItem(RESULT_KEY); } catch (e) { return toast('Nu pot salva meciul (stocarea e blocată).'); }
    await flushCloud(1800);
    goTop('field-sim-3d.html?career=1');
  }
  function applyResult(res) {
    const p = S.pending; if (!p || p.id !== res.id) return false;
    const my = res.my, op = res.opp, ev = S.event; let win = my > op; const tie = my === op;
    if (p.kind === 'playoff' && ev && ev.po && tie) win = ev.po.mySeed < ev.po.oppSeed;
    let rp = win ? 3 : tie ? 1 : 0; const tags = [];
    if (p.kind !== 'playoff') { if ((res.lp || 0) >= 16) { rp++; tags.push('SWARM'); } if ((res.tips || 0) >= 4) { rp++; tags.push('POLLINATOR 1'); } if ((res.tips || 0) >= 7) { rp++; tags.push('POLLINATOR 2'); } }
    if (p.kind === 'qual' || p.kind === 'playoff') { if (win) S.ss.w++; gainXp('driver', win ? 12 : 7); } else { gainXp('driver', 5); gainXp('prog', 3); gainXp('build', 3); }
    S.ss.best = Math.max(S.ss.best, my); S.mlog.push({ s: S.season, my, op, w: win ? 1 : tie ? .5 : 0 }); if (S.mlog.length > 150) S.mlog.shift();
    S.stats.tips += res.tips || 0; if (win) S.stats.w++; else if (tie && p.kind !== 'playoff') S.stats.t++; else S.stats.l++;
    const lm = { kind: p.kind, my, op, win, tie: tie && p.kind !== 'playoff', rp, tags, flowers: res.flowers || 0, tips: res.tips || 0, opp: null, partner: null, money: 0, sponsors: [], eventDone: false, po: null };
    if (p.kind === 'qual' && ev) {
      const m = myMatch(ev), col = myColor(m), oc = col === 'red' ? 'blue' : 'red', mate = m[col].find((i) => i !== 0);
      simUpTo(ev, m.no);
      lm.opp = m[oc].map((i) => ev.teams[i].name).join(' + '); lm.partner = ev.teams[mate].name;
      const extra = { red: 0, blue: 0 }; extra[col] = rp - (win ? 3 : tie ? 1 : 0); extra[oc] = op >= 45 && Math.random() < .6 ? 1 : 0;
      applyAlliance(ev, m, col === 'red' ? my : op, col === 'red' ? op : my, extra);
      ev.round++; S.mscores.push(my);
      if (ev.round < ev.n) { const nm = ev.matches.find((x) => x.no === ev.mine[ev.round]); notify({ app: 'ftc', ic: '⏱', title: 'Următorul tău meci: #' + nm.no, text: 'Începe la ' + fmtT(nm.t) + '. Pregătește robotul.' }); }
      log('Meci ' + ev.round + '/' + ev.n + ' (' + (col === 'red' ? 'roșu' : 'albastru') + ', cu ' + lm.partner + ') vs ' + lm.opp + ': ' + my + '–' + op + (win ? ' (victorie)' : tie ? ' (egal)' : ' (înfrângere)') + ', +' + rp + ' RP.');
    } else if (p.kind === 'playoff' && ev && ev.po) {
      const po = ev.po; lm.opp = po.opp.name + ' + ' + po.oppPartner.name; lm.partner = po.partner.name; lm.po = po.phase; lm.rp = 0;
      ev.hist.push({ opp: lm.opp, partner: lm.partner, my, op, po: po.phase });
      log((po.phase === 'sf' ? 'Semifinală' : 'Finală') + ' vs ' + lm.opp + ': ' + my + '–' + op + (win ? ' (câștigată)' : ' (pierdută)') + '.');
    } else if (p.kind === 'practice' || p.kind === 'friendly') {
      const gain = 120 + Math.min(my, 40) * 5 + (win ? 100 : 0); S.money += gain; lm.money = gain; if (win) S.rep += 1; if (p.kind === 'practice') { S.practiceN = (S.practiceWeek === S.week ? (S.practiceN || 1) : 0) + 1; S.practiceWeek = S.week; } else { const fm = (S.msgs || []).find((x) => x.id === p.msgId); if (fm) fm.done = true; }
      log('Antrenament: ' + my + '–' + op + ', +' + eur(gain) + (win ? ', +1 reputație' : '') + '.');
    }
    lm.sponsors = evalSponsors({ kind: 'match', res });
    S.pending = null;
    if (res.rep) { try { localStorage.setItem('rbCareerReplay', JSON.stringify(Object.assign({}, res.rep, { label: (ev && p.kind !== 'practice' && p.kind !== 'friendly' ? ev.name + ' · ' : '') + (p.kind === 'practice' ? 'antrenament' : p.kind === 'friendly' ? 'meci amical' : p.kind === 'playoff' ? 'playoff' : 'meciul ' + (ev ? ev.round : '')) }))); lm.replay = true; } catch (e) { } }
    if (p.kind === 'qual' && ev && ev.round >= ev.n) {
      simUpTo(ev, Infinity);   // the rest of the schedule is played by the other teams
      const sorted = qualSorted(ev), rank = sorted.findIndex((t) => t.me) + 1;
      if (rank <= 4 && ev.type !== 'meet') {
        startAlliance(ev, sorted, rank);
        lm.po = 'start'; log('Calificări încheiate: locul ' + rank + '. Alegi partenerul de playoff.');
      } else { lm.eventDone = true; finishEvent(null); }
    } else if (p.kind === 'playoff' && ev && ev.po) {
      const po = ev.po;
      if (po.phase === 'sf') {
        if (win) {
          const o = [1, 2, 3, 4].filter((s) => s !== po.mySeed && s !== po.oppSeed), ws = o[simAlliance(po.pairs[o[0] - 1], po.pairs[o[1] - 1])];
          po.phase = 'f'; po.oppSeed = ws; po.opp = po.pairs[ws - 1].cap; po.oppPartner = po.pairs[ws - 1].par; po.al = pick(['red', 'blue']);
        } else { lm.eventDone = true; finishEvent(3); }
      } else { lm.eventDone = true; finishEvent(win ? 1 : 2); }
    }
    checkGoals(); S.lastMatch = lm; save(); return true;
  }
  function finishEvent(place) {
    const ev = S.event, it = S.cal.find((x) => x.id === ev.id), def = STAGES[it.type], z = 1 + (S.season - 1) * .25;
    const sorted = qualSorted(ev), qrank = sorted.findIndex((t) => t.me) + 1, rank = place || qrank, k = rank === 1 ? 0 : rank === 2 ? 1 : rank <= 4 ? 2 : 3;
    const prize = Math.round(def.pay[k] * z), repGain = def.rep[k], me = ev.teams[0];
    S.money += prize; S.rep += repGain; if (rank === 1 && it.type !== 'meet') S.stats.titles++;
    const done = evalSponsors({ kind: 'event', rank, wins: me.w });
    S.buffs.forEach((b) => { b.events--; }); S.buffs = S.buffs.filter((b) => b.events > 0);
    const others = ev.teams.filter((t) => !t.me && t.played), regAvg = others.length ? Math.round(others.reduce((a, t) => a + t.pts / t.played, 0) / others.length * 10) / 10 : 0;
    S.evCount++; it.done = true; S.history.unshift({ season: S.season, name: ev.name, rank, rp: me.rp, w: me.w, l: me.l, t: me.t, prize, avg: regAvg, myAvg: me.played ? Math.round(me.pts / me.played * 10) / 10 : 0 });
    for (const sp of activeSponsors()) if (sp.expires <= S.evCount) finishSponsor(sp, false);
    let aw = [];
    if (it.type !== 'meet') {
      aw = computeAwards(ev, rank, ev.teams.length); if (it.type === 'reg') S.ss.regRank = rank;
      aw.forEach((a) => { const m = (a.id === 'inspire' ? 1500 : 500) * (1 + STAGES[it.type].lvl * .5); S.money += Math.round(m); S.rep += a.id === 'inspire' ? 10 : 4; S.awards.push({ season: S.season, event: ev.name, award: a.name }); S.ss.awards++; });
      if (aw.length) notify({ app: 'ftc', ic: '🏆', title: 'Premiu: ' + aw.map((a) => a.name).join(' + '), text: ev.name + ' · ceremonia de premiere.' });
    }
    let qualified = null;
    if (def.qual && (rank <= def.qual || aw.some((a) => a.id === 'inspire' || a.id === 'think'))) { const nx = S.cal.find((x) => x.type === (it.type === 'reg' ? 'nat' : 'wld')); if (nx) { nx.off = false; qualified = itemName(nx); } }
    let board = null; if (it.type === 'meet') { const b = meetBoard(); board = { rank: b.findIndex((x) => x.me) + 1, of: b.length, sum: topTen() }; }
    S.summary = { name: ev.name, rank, qrank, sorted: sorted.map((t) => ({ name: t.name, rp: t.rp, pts: t.pts, w: t.w, l: t.l, t: t.t, me: !!t.me })), prize, rep: repGain, sponsors: done, seasonEnd: false, qualified, needQual: def.qual || 0, board, playoffs: !!place, awards: aw };
    log(ev.name + ': locul ' + rank + ' (+' + eur(prize) + ', +' + repGain + ' reputație).' + (qualified ? ' Te-ai calificat la ' + qualified + '!' : ''));
    notify({ app: 'ftc', ic: '📊', title: 'Rezultate publicate: ' + ev.name, text: 'Ai terminat pe locul ' + rank + '.' + (qualified ? ' Calificat la ' + qualified + '!' : '') });
    S.week = it.week + 1; S.lastEv = ev; S.event = null;
    if (!nextEvent()) { S.summary.seasonEnd = true; S.season++; S.cal = buildCal(); S.mscores = []; S.week = 1; S.ss = { w: 0, best: 0, sp: 0, regRank: 0, awards: 0 }; S.goals = shuffle(GOAL_POOL).slice(0, 4).map((g) => ({ id: g.id, got: false })); S.money += 500; log('Sezonul s-a încheiat. Buget nou de sezon: +' + eur(500) + '. Adversarii devin mai puternici.'); }
    S.offers = genOffers(); installReady(); checkGoals();
    if (S.offers[0]) notify({ app: 'sponsors', ic: '🤝', title: S.offers[0].brand + ' te caută', text: 'Sponsori noi au apărut după eveniment.', act: { t: 'offer', id: S.offers[0].id, label: 'Acceptă oferta' } });
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
  // ---------- views ----------
  // ---------- shell: bara laterală (navigare), bara de sus (resurse + acțiunea principală) ----------
  // ---------- iconițe (desen propriu, stil linie, 24×24) + plăcuțe de aplicație ----------
  const ICONS = {
    home: 'M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z',
    trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5.5a2.5 2.5 0 0 0 2.6 4M16 6h2.5a2.5 2.5 0 0 1-2.6 4M12 13v4M9 20.5h6M10 17h4',
    robot: 'M6 8.5h12a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7.5a2 2 0 0 1 2-2zM12 4.5v4M9.5 13.5v1M14.5 13.5v1M2 13v3M22 13v3',
    route: 'M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 16V10a3 3 0 0 1 3-3h7M18 8v6a3 3 0 0 1-3 3H8',
    people: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.2A6.5 6.5 0 0 1 21.5 20',
    briefcase: 'M3.5 8h17v11.5h-17zM9 8V5.5h6V8M3.5 13h17',
    chart: 'M5 20V11M11 20V5M17 20v-6M3 20.5h18',
    calendar: 'M4 6h16v14.5H4zM4 10.5h16M8.5 3.5v4M15.5 3.5v4',
    map: 'M9 4.5 3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2zM9 4.5v13M15 6.5v13',
    wrench: 'M14.7 6.3a4.2 4.2 0 0 0 5 5.2l-1.6-1.6M14.7 6.3l1.6 1.6M14.7 6.3a4.2 4.2 0 0 0-5.4 5.4L4 17a2.1 2.1 0 0 0 3 3l5.3-5.3a4.2 4.2 0 0 0 5.4-5.4',
    book: 'M5 4.5h9.5a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h9.5',
    message: 'M4 5h16v11H10l-6 4.5z',
    flag: 'M5.5 21V4M5.5 4.5h11l-2.2 4 2.2 4h-11',
    bell: 'M6 16v-5a6 6 0 0 1 12 0v5l1.8 2H4.2zM10 20.5a2 2 0 0 0 4 0',
    bellOff: 'M6 16v-5a6 6 0 0 1 12 0v5l1.8 2H4.2zM10 20.5a2 2 0 0 0 4 0M3 3l18 18',
    tablet: 'M6.5 3h11a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-15A1.5 1.5 0 0 1 6.5 3zM11 18h2',
    search: 'M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4.5-4.5',
    play: 'M8 5.5v13l10.5-6.5z',
    forward: 'M5 6v12l7.5-6zM12.5 6v12l7.5-6z',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z',
    lock: 'M6 11h12v9.5H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    pin: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    cart: 'M3 4.5h2.2l2.3 10.5h10.3L20 7.5H6.4M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    box: 'M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4zM3.5 7.5 12 11.5l8.5-4M12 11.5v9',
    field: 'M4 4h16v16H4zM4 12h16M12 4v16',
    battery: 'M3 8h15v8H3zM21 11v2',
    plug: 'M9 3v5M15 3v5M7 8h10v3.5a5 5 0 0 1-10 0zM12 16.5V21',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1',
    bulb: 'M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1V16h5v-.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z',
    globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9M12 3C9.5 5.6 8.3 8.6 8.3 12s1.2 6.4 3.7 9',
    coin: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM14.8 9.3c-.6-.9-1.6-1.3-2.8-1.3-1.6 0-2.8.8-2.8 2s1.2 1.7 2.8 2 2.8.8 2.8 2-1.2 2-2.8 2c-1.2 0-2.3-.5-2.9-1.4M12 6v12',
    cpu: 'M7 7h10v10H7zM10 10h4v4h-4zM9.5 3v4M14.5 3v4M9.5 17v4M14.5 17v4M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2',
    cloud: 'M7 18.5a4 4 0 0 1-.6-8A6 6 0 0 1 18 9.6a4.5 4.5 0 0 1-.6 8.9z',
    chevronR: 'M9.5 5.5 16 12l-6.5 6.5', chevronL: 'M14.5 5.5 8 12l6.5 6.5', chevronD: 'M6 9.5l6 6 6-6',
    x: 'M6 6l12 12M18 6 6 18', plus: 'M12 5v14M5 12h14', more: 'M5 12h.01M12 12h.01M19 12h.01',
    refresh: 'M19.5 11a7.5 7.5 0 1 0-2.2 5.3M19.5 4.5V11H13',
    palette: 'M12 21a9 9 0 1 1 9-9c0 1.9-1.4 3-3 3h-2a2 2 0 0 0-1.5 3.3c.5.6.2 2.7-2.5 2.7zM7.5 11.5h.01M10 7.5h.01M14.5 7.5h.01M17 11h.01',
    bolt: 'M13 3 5 13.5h6L10 21l8-10.5h-6z', doc: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5'
  };
  ICONS.spark = 'M12 2.5c.7 5.2 2.9 7.8 9.5 9.5-6.6 1.7-8.8 4.3-9.5 9.5-.7-5.2-2.9-7.8-9.5-9.5 6.6-1.7 8.8-4.3 9.5-9.5z';
  const FILLED = new Set(['play', 'forward', 'spark']);
  function icon(name, cls) {
    const filled = FILLED.has(name);
    return sv('svg', { viewBox: '0 0 24 24', class: 'ico' + (cls ? ' ' + cls : ''), 'aria-hidden': 'true', fill: filled ? 'currentColor' : 'none', stroke: filled ? 'none' : 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sv('path', { d: ICONS[name] || ICONS.more }));
  }
  const APP_ICON = { ftc: 'trophy', meets: 'flag', teams: 'globe', sponsors: 'briefcase', shop: 'cart', portfolio: 'book', crew: 'people', msgs: 'message', map: 'map', calendar: 'calendar', stats: 'chart', bell: 'bell', search: 'search' };
  const tile = (name, col, size) => el('span', { class: 'tile' + (size ? ' ' + size : ''), style: col ? '--c:' + col : null }, icon(name));
  const appTile = (id, size) => tile(APP_ICON[id] || 'bell', APP_COL[id] || null, size);
  const PF_ICON = { design: 'wrench', code: 'cpu', strategy: 'bulb', outreach: 'globe', team: 'people', fin: 'coin' };
  const SHOP_ICON = { bat: 'battery', cab: 'plug', bel: 'gear' };
  const CREW_COL = { driver: '#ff9500', prog: '#5856d6', build: '#34c759' };

  // ---------- aspect: automat (după sistem), luminos sau întunecat ----------
  const getTheme = () => { try { return localStorage.getItem('rbTheme') || 'auto'; } catch (e) { return 'auto'; } };
  function applyTheme() { const t = getTheme(); if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); }
  function themeSeg() {
    const t = getTheme();
    return el('div', { class: 'seg', role: 'group', 'aria-label': 'Aspect' }, [['auto', 'Auto'], ['light', 'Luminos'], ['dark', 'Întunecat']].map(([v, l]) => el('button', { class: t === v ? 'on' : '', 'aria-pressed': t === v ? 'true' : 'false', onclick: () => { try { localStorage.setItem('rbTheme', v); } catch (e) { } applyTheme(); render(); } }, l)));
  }
  function openMore() {   // pe telefon: bara de jos are 4 secțiuni + „Mai mult”
    const ov = el('div', { class: 'cr-modal sheet-ov', onclick: (e) => { if (e.target === ov) ov.remove(); } },
      el('div', { class: 'sheet', role: 'dialog', 'aria-label': 'Mai mult' }, el('div', { class: 'grabber' }), el('h3', { text: 'Mai mult' }),
        el('div', { class: 'group' }, NAV.slice(4).map(([id, l, ic]) => el('button', { class: 'row', onclick: () => { ov.remove(); go(id); } }, icon(ic), el('span', { text: l }), navDot(id) ? el('i', { class: 'dot' }) : null, icon('chevronR', 'chev'))),
          el('button', { class: 'row', onclick: () => { ov.remove(); openPhone(null); } }, icon('tablet'), el('span', { text: 'Tableta echipei' }), unread() ? el('i', { class: 'badge', text: unread() }) : null, icon('chevronR', 'chev'))),
        el('div', { class: 'sheet-foot' }, el('small', { text: 'Aspect' }), themeSeg())));
    document.body.append(ov);
  }

  const NAV = [['hub', 'Acasă', 'home'], ['event', 'Sezon', 'trophy'], ['robot', 'Robot', 'robot'], ['auto', 'Autonom', 'route'], ['team', 'Echipă', 'people'], ['sponsors', 'Sponsori', 'briefcase'], ['history', 'Statistici', 'chart']];
  const go = (id) => {
    const run = () => { tab = id; render(); window.scrollTo(0, 0); };
    if (id !== tab && document.startViewTransition && innerWidth > 900 && !matchMedia('(prefers-reduced-motion: reduce)').matches) { try { const vt = document.startViewTransition(run); [vt.ready, vt.finished, vt.updateCallbackDone].forEach((pr) => pr.catch(() => { })); setTimeout(() => { if (tab !== id) run(); }, 600); return; } catch (e) { } }
    run();
  };
  const cardHead = (eyebrow, title, action) => el('div', { class: 'ch-head' }, el('div', null, el('div', { class: 'cr-eyebrow', text: eyebrow }), el('h2', { text: title })), action || null);
  const withCls = (node, c) => { if (node) node.classList.add(...c.split(' ')); return node; };
  const pill = (ic, k, v, c) => el('div', { class: 'pill ' + (c || '') }, el('span', { class: 'pi', text: ic }), el('div', null, el('small', { text: k }), el('b', { text: v })));
  const initials = () => (S.team.name.replace(/[^\p{L}\p{N} ]/gu, ' ').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2) || 'RB').toUpperCase();
  function navDot(id) {
    const nx = nextEvent();
    if (id === 'event') return !!S.event || (!!nx && S.week >= nx.week);
    if (id === 'sponsors') return S.offers.length > 0 && activeSponsors().length < MAX_SPONSORS;
    if (id === 'robot') return S.build.some((b) => b.stage === 'stock');
    if (id === 'team') return S.pfWeek !== S.week && pfTotal() < 60;
    return false;
  }
  const shortName = (it) => (it.type === 'meet' ? 'Meet #' + it.no : it.type === 'reg' ? 'Regionala' : it.type === 'nat' ? 'Naționala' : 'Mondiale');
  // profil: echipa, aspect, salvare online și legături (în rail rămâne doar avatarul)
  function openProfile() {
    document.querySelectorAll('.prof-pop').forEach((n) => n.remove());
    const close = () => { pop.remove(); document.removeEventListener('mousedown', away, true); document.removeEventListener('keydown', esc, true); };
    const away = (e) => { if (!pop.contains(e.target) && !e.target.closest('.sd-prof')) close(); };
    const esc = (e) => { if (e.key === 'Escape') close(); };
    const pop = el('div', { class: 'prof-pop', role: 'dialog', 'aria-label': 'Profil' },
      el('div', { class: 'pp-team' }, el('div', { class: 'sd-av', text: initials() }), el('div', null, el('b', { text: S.team.name }), el('small', { text: '#' + S.team.num + ' · ' + regionOf(S.region).name + ' · ' + repLevel(S.rep) }))),
      el('div', { class: 'pp-set' }, el('small', { text: 'Aspect' }), themeSeg()),
      cloudChip(),
      el('div', { class: 'pp-links' }, FRAMED ? el('button', { class: 'cr-link', onclick: backToMenu }, '← Meniul jocului') : menuLink(), FRAMED ? null : el('a', { class: 'cr-link', href: 'index.html' }, 'Site')));
    document.body.append(pop);
    document.addEventListener('mousedown', away, true); document.addEventListener('keydown', esc, true);
  }
  function sidebar() {
    return el('aside', { class: 'cr-side' },
      el('div', { class: 'sd-top' }, FRAMED ? el('button', { class: 'sd-back', onclick: backToMenu }, icon('chevronL'), 'Meniul jocului') : el('a', { class: 'cr-brand', href: 'index.html' }, 'ro', el('span', { text: 'LER' }), 'bot'), el('span', { class: 'sd-orb', title: 'roLERbot · mod carieră' }, icon('spark'))),
      el('div', { class: 'sd-team' }, el('div', { class: 'sd-av', text: initials() }), el('div', null, el('b', { text: S.team.name }), el('small', { text: '#' + S.team.num + ' · ' + regionOf(S.region).name + ' · ' + repLevel(S.rep) }))),
      el('nav', { class: 'sd-nav', 'aria-label': 'Secțiuni' },
        NAV.map(([id, label, ic], i) => el('button', { class: 'sd-it' + (tab === id ? ' on' : '') + (i >= 4 ? ' extra' : ''), title: label, 'aria-label': label, 'aria-current': tab === id ? 'page' : null, onclick: () => go(id) }, tab === id ? el('i', { class: 'sd-pill' }) : null, icon(ic), el('span', { class: 'lb', text: label }), navDot(id) ? el('i', { class: 'dot', title: 'Necesită atenție' }) : null)),
        el('button', { class: 'sd-it more' + (NAV.slice(4).some((n) => n[0] === tab) ? ' on' : ''), onclick: openMore }, icon('more'), el('span', { class: 'lb', text: 'Mai mult' }), NAV.slice(4).some((n) => navDot(n[0])) ? el('i', { class: 'dot' }) : null)),
      el('div', { class: 'sd-foot' },
        el('button', { class: 'sd-row', title: 'Tableta echipei', 'aria-label': 'Tableta echipei', onclick: () => openPhone(null) }, icon('tablet'), el('span', { text: 'Tableta echipei' }), unread() ? el('i', { class: 'badge', text: unread() }) : null),
        el('button', { class: 'sd-prof', title: S.team.name + ' · profil și setări', 'aria-label': 'Profil și setări', onclick: openProfile }, initials()),
        el('div', { class: 'sd-set' }, el('small', { text: 'Aspect' }), themeSeg()),
        cloudChip(), FRAMED ? null : el('div', { class: 'sd-links' }, menuLink(), el('a', { class: 'cr-link', href: 'index.html' }, 'Site'))));
  }
  function primaryAction() {
    const nx = nextEvent(), left = nx ? nx.week - S.week : 0;
    if (S.pending) return null;
    if (S.event) return el('button', { class: 'cr-btn pri cta', onclick: () => go('event') }, icon('flag'), el('span', { text: 'Continuă evenimentul' }));
    if (nx && left <= 0) return el('button', { class: 'cr-btn pri cta', onclick: () => { startEvent(); go('event'); } }, icon('flag'), el('span', { text: 'Intră în eveniment' }));
    if (nx) return el('button', { class: 'cr-btn pri cta', title: 'Cheltuieli de echipă: ' + WEEK_COST + ' €', onclick: advanceWeek }, icon('forward'), el('span', { text: 'Săptămâna următoare' }), el('span', { class: 'sub', text: '−' + WEEK_COST + ' €' }));
    return null;
  }
  function topbar() {
    const nx = nextEvent(), left = nx ? nx.week - S.week : 0, label = (NAV.find((n) => n[0] === tab) || NAV[0])[1];
    const stat = (k, v, cls) => el('div', { class: 'tb-stat' }, el('small', { text: k }), el('b', { class: cls || '', text: v }));
    return el('header', { class: 'cr-tb' }, el('div', { class: 'tb-title' }, el('h1', { text: label }), el('small', { text: 'Sezonul ' + S.season + ' · Săptămâna ' + S.week + ' · ' + dateOf(S.week) })),
      el('div', { class: 'tb-res' }, stat('Buget', eur(S.money), 'ok'), stat('Reputație', String(Math.round(S.rep))), stat('Următorul', nx ? shortName(nx) + (left > 0 ? ' · ' + left + ' săpt.' : ' · azi') : '—')),
      primaryAction());
  }
  function practiceBtn() {
    const practiced = (S.practiceWeek === S.week ? (S.practiceN || 1) : 0) >= (S.field ? 2 : 1);
    return el('button', { class: 'cr-btn', disabled: practiced || !!S.pending || !S.field, title: S.field ? 'Meci 1 contra 1 pentru bani și experiență' : 'Ai nevoie de teren de antrenament (magazinul de piese)', onclick: () => launch('practice') }, icon(S.field ? 'target' : 'lock'), el('span', { text: !S.field ? 'Antrenament: fără teren' : practiced ? 'Antrenamente făcute' : 'Antrenament' }));
  }

  // ---------- Acasă ----------
  function heroCard() {
    const ev = nextEvent(), left = ev ? ev.week - S.week : 0, played = S.cal.filter((x) => x.type === 'meet' && x.done).length, enr = S.cal.filter((x) => x.type === 'meet' && x.enrolled && !x.done).length;
    const when = S.event ? 'În desfășurare' : !ev ? '' : left > 0 ? 'Peste ' + left + (left === 1 ? ' săptămână' : ' săptămâni') : 'Azi';
    const status = S.event ? 'Joacă meciul următor din pagina Sezon.' : !ev ? 'Sezonul s-a încheiat.' : left > 0 ? 'Până atunci: piese noi, antrenamente și autonom.' : 'Intră în eveniment din bara de sus.';
    return el('section', { class: 'cr-card s8 hero' },
      el('div', { class: 'hero-top' }, ev ? dateBlock(ev.week) : null, el('div', { class: 'hero-txt' }, el('small', { class: 'hero-k', text: S.event ? 'Eveniment în desfășurare' : 'Următorul eveniment' }), el('h2', { text: S.event ? S.event.name : ev ? itemName(ev) : 'Sezon încheiat' }),
        el('p', { class: 'hero-meta' }, when ? el('span', { class: 'hc' + (left <= 0 || S.event ? ' now' : ''), text: when }) : null, el('span', null, icon('pin'), regionOf((ev && ev.host) || S.region).name), el('span', null, icon('flag'), played + ' meet-uri jucate · ' + enr + ' înscrise')))),
      el('p', { class: 'cr-sub hero-status', text: status }),
      el('div', { class: 'hero-act' }, el('button', { class: 'cr-btn', onclick: () => go('event') }, icon('calendar'), el('span', { text: 'Calendar' })), practiceBtn(), hasReplay() ? el('button', { class: 'cr-btn', onclick: openReplay }, icon('play'), el('span', { text: 'Replay' })) : null),
      el('div', { class: 'setup' }, el('label', { class: 'ap-f' }, el('span', { text: 'Autonom la meciuri' }), autoSelect()), el('label', { class: 'ap-f' }, el('span', { text: 'Strategie cu partenerul AI' }), planSelect())),
      S.buffs.length ? el('div', { class: 'buffs' }, S.buffs.map((b) => el('span', null, icon('bolt'), b.label + ' (' + (b.mul < 1 ? (b.mod === 'spread' || b.mod === 'reload' ? '+' : '−') : '+') + Math.round(Math.abs(1 - b.mul) * 100) + '% ' + b.mod + ')'))) : null);
  }
  function robotSnap() {
    const fs = fieldStatus(), stock = S.build.filter((b) => b.stage === 'stock').length;
    return el('div', { class: 'cr-card s4' }, cardHead('Robotul tău', 'Performanță', el('button', { class: 'cr-btn sm', onclick: () => go('robot') }, 'Robot →')), bars(modsOf(S)),
      el('div', { class: 'fld mini ' + fs[0] }, tile('field', null, 'fi'), el('div', null, el('b', { text: fs[1] }), el('small', { text: S.build.length ? S.build.length + ' comenzi în atelier' + (stock ? ' · ' + stock + ' de montat' : '') : 'Nicio comandă în atelier' }))));
  }
  function sponsorSnap() {
    const sp = activeSponsors();
    return el('div', { class: 'cr-card s4' }, cardHead('Sponsori', sp.length + '/' + MAX_SPONSORS + ' contracte', el('button', { class: 'cr-btn sm', onclick: () => go('sponsors') }, 'Oferte →')),
      sp.length ? el('div', { class: 'mini-list' }, sp.map((x) => el('div', { class: 'mini' }, el('img', { src: 'assets/img/portfolio/' + x.logo, alt: x.brand }), el('div', null, el('b', { text: x.brand }), el('small', { text: KINDS[x.kind].text(x.target) })), el('em', { text: eur(x.pay) }))))
        : el('p', { class: 'cr-sub', text: S.offers.length ? S.offers.length + ' sponsori îți oferă contracte. Alege unul ca să primești bani când îndeplinești obiectivul.' : 'Apar oferte noi după fiecare eveniment.' }));
  }
  function logSnap() {
    return el('div', { class: 'cr-card s4' }, cardHead('Jurnal', 'Ce s-a întâmplat'), el('div', { class: 'log' }, S.log.slice(0, 7).map((l) => el('div', { text: l }))));
  }
  function hubView() {
    return el('div', { class: 'cr-grid hub' }, heroCard(), withCls(seasonStrip(), 's8'), el('div', { class: 'cr-col c4 tall' }, robotSnap(), goalsCard()), sponsorSnap(), logSnap());
  }

  // ---------- Robot ----------
  function robotView() {
    const m = modsOf(S);
    const cards = Object.keys(HW).map((cat) => {
      const H = HW[cat], cur = S.hw[cat], pend = pendingFor(cat);
      return el('div', { class: 'hw' }, el('div', { class: 'hw-head' }, el('h3', { text: H.name }), el('span', { class: 'hw-cur', text: 'Montat: ' + H.tiers[cur].n })),
        el('div', { class: 'tiers' }, H.tiers.map((t, i) => {
          const installed = i <= cur, building = pend && pend.tier === i, next = i === cur + 1 && !pend, locked = !installed && !building && !next;
          const fx = Object.keys(t.fx).map((k) => { const lab = { speed: 'viteză', accel: 'accel.', turn: 'rotire', intake: 'intake', reload: 'cadență', spread: 'precizie', assist: 'țintire' }[k], v = t.fx[k]; return lab + ' ' + (v < 1 ? '−' : '+') + Math.round(Math.abs(1 - v) * 100) + '%'; }).join(' · ');
          const rep = S.rep >= t.rep;
          return el('div', { class: 'tier ' + (installed ? 'installed' : building ? 'building' : locked ? 'locked' : 'next') },
            el('span', { class: 'tag ' + (installed ? '' : building ? 'gold' : 'dim'), text: installed ? (i === cur ? 'Montat' : 'Depășit') : building ? stageLabel(pend) : 'Treapta ' + (i + 1) }),
            el('b', { text: t.n }), el('p', { text: t.d }), fx ? el('div', { class: 'fx', text: fx }) : null,
            next ? el('button', { class: 'cr-btn sm pri', disabled: !rep, text: rep ? 'Caută piesele · de la ' + eur(priceOf(t)) : '' + t.rep + ' reputație', onclick: () => openPhone('shop') }) : null,
            building && pend.stage === 'stock' ? el('button', { class: 'cr-btn sm pri', disabled: S.build.some((x) => x.stage === 'build'), text: 'Începe montajul', onclick: () => startBuild(pend) }) : null,
            !installed && !building && !next && i > cur + 1 ? el('div', { class: 'cr-note', text: 'Mai întâi treapta anterioară' }) : null);
        })));
    });
    return el('div', { class: 'cr-grid' },
      el('div', { class: 'cr-card s4' }, cardHead('Statistici', 'Robotul acum'), bars(m),
        el('div', { class: 'cfg' }, el('div', { class: 'cr-eyebrow', text: 'Configurație' }),
          el('div', { class: 'seg2' }, ['strafe', 'turret'].map((t) => el('button', { class: S.type === t ? 'on' : '', disabled: t === 'turret' && !canTurret(), text: t === 'strafe' ? 'Full strafe' : 'Turelă independentă', onclick: () => { S.type = t; save(); render(); } }))),
          !canTurret() ? el('p', { class: 'cr-note', style: 'margin-top:8px', text: 'Turela se deblochează cu lansatorul „Flywheel cu PID” (treapta 3).' }) : null)),
      withCls(workshopCard(), 's8'),
      el('div', { class: 'cr-card' }, cardHead('Upgrade-uri', 'Arborele de hardware', el('button', { class: 'cr-btn sm pri', onclick: () => openPhone('shop') }, 'Magazin de piese')),
        el('p', { class: 'cr-sub', text: 'Întâi cauți piesele în magazin și le comanzi (livrarea durează). Când ajung, le montezi în atelier. Express: piesele ajung imediat, cu 40% mai mult. Treptele de sus cer reputație.' }),
        el('div', { class: 'hw-grid' }, cards)));
  }

  // ---------- Echipă: membrii, caietul tehnic, obiectivele ----------
  function crewCards() {
    return S.crew.map((m) => { const d = CREW_DEF.find((x) => x.id === m.id), lv = crewXpLv(m.xp), nxt = lv >= 5 ? 1 : (m.xp - lv * lv * 25) / (((lv + 1) * (lv + 1) - lv * lv) * 25);
      return el('div', { class: 'shop-card crew' }, el('div', { class: 'cw-top' }, el('span', { class: 'av-i', style: '--c:' + CREW_COL[m.id] }, m.name[0]), el('div', null, el('b', { text: m.name }), el('small', { class: 'cat', text: d.role + ' · nivel ' + lv + '/5' }))), el('div', { class: 'prog' }, el('i', { style: 'width:' + clamp(nxt * 100, 0, 100) + '%' })), el('p', { text: d.desc + ' ' + d.bonus + '.' }),
        el('button', { class: 'cr-btn sm', disabled: lv >= 5 || S.money < 100, text: lv >= 5 ? 'Nivel maxim' : 'Antrenează · 100 €', onclick: () => { if (S.money < 100) return; S.money -= 100; gainXp(m.id, 25); log('Antrenament intens pentru ' + m.name + '.'); save(); checkGoals(); render(); } })); });
  }
  function pfCards() {
    const left = 2 - (S.pfWeek === S.week ? S.pfN || 0 : 0);
    return PF_SECS.map(([id, name, ic]) => { const v = pfSec(id), man = (S.pf[id] || 0);
      return el('div', { class: 'shop-card' }, el('div', { class: 'cw-top' }, tile(PF_ICON[id]), el('div', null, el('b', { text: name }), el('small', { class: 'cat', text: v + '% · scris de tine ' + man + '/50' }))), el('div', { class: 'prog' }, el('i', { style: 'width:' + v + '%' })),
        el('button', { class: 'cr-btn sm pri', disabled: left <= 0 || man >= 50, text: man >= 50 ? 'Complet' : 'Scrie · +15%', onclick: () => workPortfolio(id) })); });
  }
  function teamView() {
    const tot = pfTotal(), left = Math.max(0, 2 - (S.pfWeek === S.week ? S.pfN || 0 : 0));
    return el('div', { class: 'cr-grid' },
      el('div', { class: 'cr-card s8' }, cardHead('Echipa ta', 'Membrii echipei'), el('p', { class: 'cr-sub', text: 'Cresc cu meciurile, antrenamentele și caietul tehnic. Fiecare nivel îți îmbunătățește robotul.' }), el('div', { class: 'crew-grid' }, crewCards())),
      withCls(goalsCard(), 's4'),
      el('div', { class: 'cr-card' }, cardHead('Caiet tehnic', tot + '% completat', el('div', { class: 'ring', style: '--v:' + tot }, el('b', { text: tot + '%' }))),
        el('p', { class: 'cr-sub', text: 'Contează la jurizare (regională, național, mondiale). Poți scrie de 2 ori pe săptămână (' + left + ' rămase). Restul crește singur din upgrade-uri, meciuri, sponsori și echipă.' }), el('div', { class: 'pf-grid' }, pfCards())));
  }

  function pendingBanner() {
    if (!S.pending) return null;
    return el('div', { class: 'banner' }, el('span', { text: 'Ai un meci început și nefinalizat. Îl poți relua sau îl poți abandona (se numără ca înfrângere).' }),
      el('div', { class: 'cr-row' }, el('button', { class: 'cr-btn pri sm', text: 'Reia meciul', onclick: () => { const p = S.pending; S.pending = null; launch(p.kind, (S.msgs || []).find((x) => x.id === p.msgId)); } }), el('button', { class: 'cr-btn sm', text: 'Abandonează', onclick: forfeit })));
  }
  function calList() {
    return el('div', { class: 'cal' }, S.cal.map((it) => {
      const past = S.week > it.week && !it.done, nxt = nextEvent() === it;
      const st = it.done ? 'Jucat' : it.off ? 'Prin calificare' : it.type === 'meet' ? (it.enrolled ? 'Înscris' : past ? 'Sărit' : 'Liber') : 'Obligatoriu';
      return el('div', { class: 'cal-row' + (nxt ? ' next' : '') + (it.done ? ' done' : '') + (it.off || (past && it.type === 'meet' && !it.enrolled) ? ' off' : '') },
        el('b', { text: 'Săpt. ' + it.week }), el('span', { text: itemName(it) }), el('em', { text: st }),
        it.type === 'meet' && !it.done && S.week < it.week ? el('button', { class: 'cr-btn sm' + (it.enrolled ? '' : ' pri'), text: it.enrolled ? 'Retrage-te' : 'Înscrie-te', onclick: () => toggleEnroll(it) }) : null);
    }));
  }
  function boardCard() {
    if (!S.mscores.length) return null;
    const b = meetBoard(), me = b.findIndex((x) => x.me), rows = b.slice(0, 8); if (me >= 8) rows.push(b[me]);
    return el('div', { class: 'cr-card s5' }, el('div', { class: 'cr-eyebrow', text: 'Regiunea ' + regionOf(S.region).name }), el('h2', { text: 'Top 10 meciuri' }),
      el('p', { class: 'cr-note', text: 'Pentru regională se adună cele mai bune 10 scoruri din toate meet-urile. Locul tău: ' + (me + 1) + ' din ' + b.length + '.' }),
      el('div', { class: 'st-scroll' }, el('table', { class: 'st' }, el('thead', null, el('tr', null, ['#', 'Echipă', 'Top 10'].map((h) => el('th', { text: h })))),
        el('tbody', null, rows.map((t) => el('tr', { class: t.me ? 'me' : '' }, el('td', { class: 'n', text: b.indexOf(t) + 1 }), el('td', { text: t.name }), el('td', { text: t.sum })))))));
  }
  const RULES = 'Un meci se joacă 2 contra 2 (2 roboți roșii, 2 albaștri). La începutul fiecărui eveniment primești lista tuturor meciurilor; fiecare echipă joacă 6, cu parteneri și culori diferite (poate fi de ex. 4 albastre și 2 roșii). Meet: 6 meciuri, 8–20 echipe, în orice regiune; recomandat 2–5 meet-uri, câte unul pe săptămână. Pentru regională contează cele mai bune 10 meciuri din toate meet-urile (în joc: bonus de seed). Regionala: 6 meciuri de calificare și playoff pentru primele 4 locuri; primele 3 merg la Național, iar primele 2 de la Național la Mondiale.';
  function seasonStrip() {
    const meets = S.cal.filter((x) => x.type === 'meet'), played = meets.filter((x) => x.done).length, enr = meets.filter((x) => x.enrolled && !x.done).length, nx = nextEvent();
    const st = (it) => (it.done ? 'done' : it.off ? 'lock' : nx && nx.id === it.id ? 'now' : 'todo');
    const reg = S.cal.find((x) => x.id === 'reg'), nat = S.cal.find((x) => x.id === 'nat'), wld = S.cal.find((x) => x.id === 'wld');
    const meetState = nx && nx.type === 'meet' ? 'now' : played && (!nx || nx.type !== 'meet') ? 'done' : 'todo';
    const step = (ic, title, sub, state) => el('div', { class: 'step ' + state }, el('span', { class: 'ic' }, state === 'done' ? icon('check') : state === 'lock' ? icon('lock') : ic), el('div', null, el('b', { text: title }), el('small', { text: sub })));
    return el('div', { class: 'cr-card strip' }, el('div', { class: 'cr-eyebrow', text: 'Sezonul ' + S.season + ' · drumul spre mondiale' }),
      el('div', { class: 'steps' }, step('1', 'League Meet-uri', played + ' jucate · ' + enr + ' înscrise', meetState), step('2', 'Regionala', 'Săpt. ' + reg.week, st(reg)), step('3', 'Națională', nat.off ? 'top 3 de la regională' : 'Săpt. ' + nat.week, st(nat)), step('4', 'Mondiale', wld.off ? 'top 2 de la național' : 'Săpt. ' + wld.week, st(wld))));
  }
  function sponsorsView() {
    const act = activeSponsors();
    const row = (x, kind) => el('div', { class: 'sp ' + (x.status || '') }, el('img', { src: 'assets/img/portfolio/' + x.logo, alt: x.brand }),
      el('div', null, el('h4', { text: x.brand }), el('p', { text: KINDS[x.kind].text(x.target) }),
        el('div', { class: 'meta', text: (kind === 'offer' ? 'Semnare ' + eur(x.signing) + ' · la final ' : 'La final ') + eur(x.pay) + ' · +' + x.rep + ' reputație · valabil ' + Math.max(1, x.expires - S.evCount) + ' evenimente' }),
        kind === 'active' && x.kind === 'tips' ? el('div', { class: 'prog' }, el('i', { style: 'width:' + clamp(x.progress / x.target * 100, 0, 100) + '%' })) : null),
      kind === 'offer' ? el('button', { class: 'cr-btn pri sm', disabled: act.length >= MAX_SPONSORS, text: act.length >= MAX_SPONSORS ? 'Locuri pline' : 'Acceptă', onclick: () => acceptOffer(x) }) : el('em', { class: 'sp-on', text: 'Activ' }));
    const slots = []; for (let i = 0; i < MAX_SPONSORS; i++) slots.push(act[i] ? row(act[i], 'active') : el('div', { class: 'sp-empty' }, el('b', { text: 'Loc liber' }), el('small', { text: 'Acceptă o ofertă ca să-l ocupi.' })));
    return el('div', { class: 'cr-grid' },
      el('div', { class: 'cr-card s5' }, cardHead('Contracte', 'Active ' + act.length + '/' + MAX_SPONSORS), el('div', { class: 'sp-list' }, slots)),
      el('div', { class: 'cr-card s7' }, cardHead('Oferte', S.offers.length ? S.offers.length + ' sponsori interesați' : 'Nicio ofertă acum'), S.offers.length ? el('div', { class: 'sp-list' }, S.offers.map((x) => row(x, 'offer'))) : el('p', { class: 'cr-sub', text: 'Apar oferte noi după fiecare eveniment.' })),
      S.sponsorLog.length ? el('div', { class: 'cr-card' }, cardHead('Istoric', 'Contracte încheiate'), el('div', { class: 'log' }, S.sponsorLog.map((x) => el('div', { text: x.brand + ': ' + x.text + ' → ' + (x.ok ? 'îndeplinit (+' + eur(x.pay) + ')' : 'ratat') })))) : null,
      el('p', { class: 'cr-note foot-note', text: 'Sponsorii sunt partenerii reali ai echipei roLERbot, dar contractele, sumele și obiectivele din joc sunt fictive și există doar în simulare.' }));
  }
  function standings(teams) {
    const sorted = teams.slice().sort((a, b) => b.rp - a.rp || b.pts - a.pts);
    return el('div', { class: 'st-scroll' }, el('table', { class: 'st' }, el('thead', null, el('tr', null, ['#', 'Echipă', 'RP', 'Puncte', 'V-E-Î'].map((h) => el('th', { text: h })))),
      el('tbody', null, sorted.map((t, i) => el('tr', { class: t.me ? 'me' : '' }, el('td', { class: 'n', text: i + 1 }), el('td', { text: t.name }), el('td', { text: t.rp }), el('td', { text: t.pts }), el('td', { text: t.w + '-' + t.t + '-' + t.l }))))));
  }
  function scheduleCard(ev) {
    return el('div', { class: 'cr-card' }, el('div', { class: 'cr-eyebrow', text: 'Lista meciurilor · ' + ev.matches.length + ' meciuri, fiecare echipă joacă ' + ev.n }),
      el('p', { class: 'cr-note', text: 'Un meci = 2 roboți roșii + 2 roboți albaștri. Meciurile tale sunt evidențiate. Participanții și clasamentul sunt și în tabletă (butonul din dreapta sus).' }),
      el('div', { class: 'ftc light' }, ftcMatches(ev)), el('div', { class: 'cr-row', style: 'margin-top:12px' }, el('button', { class: 'cr-btn sm', text: 'Deschide pe tabletă', onclick: () => openTablet('ftc') })));
  }
  function eventView() {
    const ev = S.event, nx = nextEvent();
    if (!ev) {
      const left = nx ? nx.week - S.week : 0, few = nx && nx.type === 'reg' && S.cal.filter((x) => x.type === 'meet' && x.done).length < 2;
      const prize = nx ? el('div', { class: 'cr-card' }, cardHead('Premii', itemName(nx)), el('div', { class: 'prize' }, ['Locul 1', 'Locul 2', 'Locurile 3–4', 'Restul'].map((l, i) => el('div', null, el('span', { text: l }), el('b', { text: eur(STAGES[nx.type].pay[i] * (1 + (S.season - 1) * .25)) }), el('em', { text: '+' + STAGES[nx.type].rep[i] + ' rep.' }))))) : null;
      return el('div', { class: 'cr-grid' },
        el('div', { class: 'cr-card s8' }, cardHead('Calendarul sezonului ' + S.season, nx ? 'Urmează: ' + itemName(nx) : 'Sezon încheiat', nx && left <= 0 ? el('button', { class: 'cr-btn pri', onclick: () => startEvent() }, 'Intră în eveniment') : el('button', { class: 'cr-btn sm', onclick: () => openPhone('map') }, 'Meet-uri pe hartă')),
          el('p', { class: 'cr-sub', text: nx ? (left > 0 ? dateOf(nx.week) + ' · peste ' + left + (left === 1 ? ' săptămână' : ' săptămâni') + '. Înscrie-te la meet-uri aici sau pe hartă, la alte regiuni.' : 'Ziua competiției a venit.') : '' }),
          calList(),
          few ? el('p', { class: 'warn', text: 'Ai jucat sub 2 meet-uri (recomandat 2–5): fără scoruri bune din meet-uri nu primești bonus de seed la regională.' }) : null,
          el('details', { class: 'rules' }, el('summary', { text: 'Regulile sezonului' }), el('p', { text: RULES }))),
        el('div', { class: 'cr-col c4' }, boardCard(), prize));
    }
    if (ev.po && ev.po.phase === 'pick') return allianceView(ev);
    const r = ev.round, po = ev.po, inQual = r < ev.n, m = inQual ? myMatch(ev) : null, T = (i) => ev.teams[i].name;
    let me2, op2, al, meta;
    if (inQual) { al = myColor(m); const oc = al === 'red' ? 'blue' : 'red'; me2 = [S.team.name, T(m[al].find((i) => i !== 0))]; op2 = m[oc].map(T); meta = 'Meci #' + m.no + ' din ' + ev.matches.length; }
    else if (po) { al = po.al; me2 = [S.team.name, po.partner.name]; op2 = [po.opp.name, po.oppPartner.name]; meta = 'Seed ' + po.mySeed + ' vs seed ' + po.oppSeed; }
    const title = inQual ? 'Meciul tău ' + (r + 1) + ' din ' + ev.n : po ? (po.phase === 'sf' ? 'Playoff · semifinală' : 'Playoff · finala') : 'Calificări încheiate';
    const prog = ev.mine.map((no, i) => { const mm = ev.matches.find((x) => x.no === no), col = myColor(mm), oc = col === 'red' ? 'blue' : 'red'; return el('div', { class: 'h' + (i === r ? ' now' : '') }, el('div', null, 'Meci #' + no + ' · ' + (col === 'red' ? 'roșu' : 'albastru') + ' · cu ' + T(mm[col].find((x) => x !== 0)), el('small', { text: 'vs ' + mm[oc].map(T).join(' + ') })), el('b', { text: mm.done ? (col === 'red' ? mm.sr + '–' + mm.sb : mm.sb + '–' + mm.sr) : i === r ? 'urmează' : '' })); });
    return el('div', { class: 'cr-grid' },
      el('div', { class: 'cr-card s7' }, el('div', { class: 'cr-eyebrow', text: ev.name + (inQual ? ' · calificări' : ' · playoff') }), el('h2', { text: title }),
        me2 ? el('div', { class: 'vs2' }, el('div', { class: 'side' }, el('small', { text: 'Alianța ' + (al === 'red' ? 'roșie' : 'albastră') + ' · ' + meta }), me2.map((n, i) => el('b', { class: 'al-' + al, text: (i ? '+ ' : '') + n }))), el('div', { class: 'mid', text: 'VS' }), el('div', { class: 'side r' }, el('small', { text: 'Alianța ' + (al === 'red' ? 'albastră' : 'roșie') }), op2.map((n, i) => el('b', { class: 'al-' + (al === 'red' ? 'blue' : 'red'), text: (i ? '+ ' : '') + n })))) : null,
        me2 ? el('label', { class: 'ap-f', style: 'margin-bottom:12px' }, el('span', { text: 'Autonom la acest meci' }), autoSelect()) : null, me2 ? planLabel() : null,
        me2 ? el('div', { class: 'cr-row' }, el('button', { class: 'cr-btn pri', disabled: !!S.pending, text: inQual ? 'Joacă meciul ' + (r + 1) : po.phase === 'sf' ? 'Joacă semifinala' : 'Joacă finala', onclick: () => launch(inQual ? 'qual' : 'playoff') }), el('span', { class: 'cr-note', text: 'Se deschide jocul 3D, 2 contra 2. La final apeși „Continuă cariera”.' })) : null,
        judgeBlock(ev),
        el('div', { style: 'margin-top:16px' }, el('div', { class: 'cr-eyebrow', text: 'Programul tău' }), el('div', { class: 'hist' }, prog)),
        ev.hist.length ? el('div', { style: 'margin-top:12px' }, el('div', { class: 'cr-eyebrow', text: 'Playoff' }), el('div', { class: 'hist' }, ev.hist.map((h) => el('div', { class: 'h' }, el('div', null, 'cu ' + h.partner, el('small', { text: (h.po === 'sf' ? 'Semifinală' : 'Finala') + ' vs ' + h.opp })), el('b', { text: h.my + '–' + h.op }))))) : null),
      el('div', { class: 'cr-card s5' }, el('h3', { text: 'Clasament' }), standings(ev.teams)),
      scheduleCard(ev));
  }
  function historyView() {
    const st = S.stats, kv = [['Victorii', st.w], ['Egaluri', st.t], ['Înfrângeri', st.l], ['Stupi răsturnați', st.tips], ['Titluri', st.titles], ['Reputație', Math.round(S.rep) + ' · ' + repLevel(S.rep)]];
    return el('div', { class: 'cr-grid' },
      el('div', { class: 'cr-card' }, cardHead('Statistici pe sezon', 'Grafice'), statsView()),
      el('div', { class: 'cr-card s7' }, cardHead('Evenimente', 'Istoric'),
        S.history.length ? el('div', { class: 'hist' }, S.history.map((h) => el('div', { class: 'h' }, el('div', null, h.name, el('small', { text: 'Sezonul ' + h.season + ' · ' + h.w + '-' + h.t + '-' + h.l + ' · ' + h.rp + ' RP' })), el('b', { text: 'Locul ' + h.rank + ' · +' + eur(h.prize) })))) : el('p', { class: 'cr-sub', text: 'Încă niciun eveniment jucat.' })),
      el('div', { class: 'cr-card s5' }, cardHead('Cariera ta', 'Totaluri'), el('div', { class: 'kv-grid' }, kv.map(([k, v]) => el('div', null, el('small', { text: k }), el('b', { text: v }))))),
      el('div', { class: 'cr-card' }, cardHead('Salvare', 'Progresul tău'), el('p', { class: 'cr-note cloud-hint', text: cloudHint() || 'Progresul e salvat în acest browser.' }),
        el('div', { class: 'cr-row', style: 'margin-top:12px' },
          SBX && CLOUD.status === 'guest' ? el('button', { class: 'cr-btn pri sm', text: 'Conectează-te', onclick: connectAccount }) : null,
          SBX && CLOUD.user ? el('button', { class: 'cr-btn sm', text: 'Salvează acum', onclick: cloudClick }) : null,
          el('button', { class: 'cr-btn sm', text: 'Exportă în fișier', onclick: exportCareer }), el('button', { class: 'cr-btn sm', text: 'Importă din fișier', onclick: importCareer }),
          el('button', { class: 'cr-btn sm danger', text: 'Resetează cariera', onclick: resetAll }))));
  }
  // ---------- alegerea echipei: regiune → echipă din listă (sau introdusă manual) ----------
  const PK = { reg: 'b1', q: '', sel: null, manual: false, mname: '', mnum: '' };
  function teamPicker() {
    const list = el('div', { class: 'tp-list' }), tabsEl = el('div', { class: 'tp-regs' }), manualBox = el('div', { class: 'tp-manual' });
    const q = el('input', { class: 'cr-in', placeholder: 'Caută echipa (nume sau număr)…', oninput: (e) => { PK.q = e.target.value; paintList(); } });
    const mn = el('input', { class: 'cr-in', placeholder: 'Numele echipei', maxlength: 28, value: PK.mname, oninput: (e) => { PK.mname = e.target.value; } });
    const mnum = el('input', { class: 'cr-in', placeholder: 'Număr echipă (ex. 21031)', inputmode: 'numeric', maxlength: 6, value: PK.mnum, oninput: (e) => { PK.mnum = e.target.value.replace(/\D/g, ''); e.target.value = PK.mnum; } });
    function paintTabs() { tabsEl.replaceChildren(...(window.CAREER_REGIONS || []).map((r) => el('button', { class: 'tp-reg' + (PK.reg === r.id ? ' on' : ''), onclick: () => { PK.reg = r.id; PK.sel = null; PK.q = ''; q.value = ''; paintTabs(); paintList(); } }, r.name, el('small', { text: r.teams.length ? r.teams.length + ' echipe' : 'în curând' })))); }
    function paintList() {
      const r = regionOf(PK.reg), t = PK.q.trim().toLowerCase(), items = r.teams.filter(([n, num]) => !t || n.toLowerCase().includes(t) || String(num).includes(t));
      list.replaceChildren(...(r.teams.length ? (items.length ? items.map(([n, num]) => el('button', { class: 'tp-team' + (!PK.manual && PK.sel && PK.sel[1] === num ? ' on' : ''), onclick: () => { PK.sel = [n, num]; PK.manual = false; paintList(); paintManual(); } }, el('b', { text: n }), el('small', { text: '#' + num }))) : [el('p', { class: 'cr-note', text: 'Nicio echipă găsită.' })]) : [el('p', { class: 'cr-note', text: 'Lista echipelor din ' + r.name + ' nu e publicată încă. Introdu-ți echipa manual mai jos.' })]));
      q.style.display = r.teams.length ? '' : 'none';
    }
    function paintManual() { manualBox.classList.toggle('on', PK.manual); manualBox.replaceChildren(...[el('label', { class: 'ap-switch', style: 'margin:0' }, el('input', { type: 'checkbox', checked: PK.manual, onchange: (e) => { PK.manual = e.target.checked; if (PK.manual) PK.sel = null; paintList(); paintManual(); } }), el('span', { text: 'Echipa mea nu e în listă' })), PK.manual ? el('div', { class: 'tp-mrow' }, mn, mnum) : null].filter(Boolean)); }
    paintTabs(); paintList(); paintManual();
    return el('div', { class: 'tp' }, el('div', { class: 'cr-eyebrow', text: 'Regiunea sezonului #11' }), tabsEl, q, list, manualBox);
  }
  function pickedTeam() {
    if (PK.manual || (!PK.sel && !regionOf(PK.reg).teams.length)) { const name = PK.mname.trim(); if (!name) { toast('Scrie numele echipei.'); return null; } return { name, num: PK.mnum || String(irnd(10000, 29999)), region: PK.reg }; }
    if (!PK.sel) { toast('Alege echipa ta din listă.'); return null; }
    return { name: PK.sel[0], num: String(PK.sel[1]), region: PK.reg };
  }
  function pickView() {   // old save without a region: choose the team and keep the progress
    return el('main', { class: 'cr-main' }, el('div', { class: 'welcome' }, el('div', { class: 'cr-eyebrow', text: 'Sezonul #11 FTC România' }), el('h1', null, 'Alege-ți ', el('span', { text: 'echipa' }), '.'),
      el('p', { class: 'cr-sub', text: 'Cariera ta se joacă acum după structura oficială: meet-uri, regională, național. Alege regiunea și echipa cu care concurezi. Progresul și banii rămân.' }), teamPicker(),
      el('div', { class: 'cr-row', style: 'margin-top:14px' }, el('button', { class: 'cr-btn pri', text: 'Continuă cu această echipă', onclick: () => { const t = pickedTeam(); if (!t) return; S.team = { name: t.name, num: t.num }; S.region = t.region; log('Echipa ta: ' + t.name + ' (#' + t.num + '), regiunea ' + regionOf(t.region).name + '.'); save(); render(); } }))));
  }
  function welcome() {
    const go = () => { const t = pickedTeam(); if (!t) return; newState({ name: t.name, num: t.num }, t.region); save(); render(); };
    return el('main', { class: 'cr-main' }, FRAMED ? el('button', { class: 'cr-back', onclick: backToMenu }, '← Înapoi') : null, el('div', { class: 'welcome' },
      el('div', { class: 'cr-eyebrow', text: 'FTC România · Sezonul #11' }),
      el('h1', null, 'Alege-ți ', el('span', { text: 'echipa' }), '.'),
      el('p', { class: 'cr-sub', text: 'Concurezi cu o echipă reală din regiunea ta: League Meet-uri, apoi regionala, campionatul național și mondialele. Cumperi hardware mai bun, semnezi sponsori și îți antrenezi robotul. Meciurile se joacă în simulatorul 3D.' }),
      teamPicker(),
      el('div', { class: 'cr-row', style: 'margin-top:14px' }, el('button', { class: 'cr-btn pri', text: 'Începe cariera', onclick: go }), FRAMED ? null : menuLink(), FRAMED ? null : el('a', { class: 'cr-link', href: 'index.html' }, '← Site')),
      SBX ? el('p', { class: 'cr-note cloud-hint', style: 'margin-top:14px', text: cloudHint() }) : null,
      SBX && CLOUD.status === 'guest' ? el('button', { class: 'cr-btn sm', style: 'margin-top:8px', text: 'Conectează-te ca să-ți încarci progresul', onclick: connectAccount }) : null,
      el('button', { class: 'cr-btn sm', style: 'margin:8px 0 0 8px', text: 'Importă o carieră din fișier', onclick: importCareer })));
  }
  function exportCareer() {
    if (!S) return; saveLocal();
    const blob = new Blob([JSON.stringify(S)], { type: 'application/json' }), a = el('a', { href: URL.createObjectURL(blob), download: 'rolerbot-cariera-' + S.team.name.replace(/\W+/g, '-') + '.json' });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); toast('Cariera a fost exportată.');
  }
  function importCareer() {
    const inp = el('input', { type: 'file', accept: 'application/json,.json', style: 'display:none' });
    inp.addEventListener('change', async () => {
      const f = inp.files && inp.files[0]; inp.remove(); if (!f) return;
      try {
        const j = JSON.parse(await f.text()); if (!j || j.v !== 1 || !j.team || !j.hw) throw new Error('format');
        if (S && !confirm('Înlocuiești cariera curentă cu cea din fișier?')) return;
        S = j; migrate(); saveLocal(); cloudSoon(); render(); toast('Cariera a fost importată.');
      } catch (e) { toast('Fișier invalid: nu e o carieră roLERbot.'); }
    });
    document.body.append(inp); inp.click();
  }
  async function resetAll() {
    if (!confirm('Ștergi toată cariera și o iei de la capăt?')) return;
    if (CLOUD.user && CLOUD.status !== 'nosetup' && confirm('Ștergi și progresul salvat în contul tău? (OK = da, Anulare = îl păstrez în cont)')) { try { await SBX.from('career_saves').delete().eq('user_id', CLOUD.user.id); } catch (e) { } }
    localStorage.removeItem(KEY); localStorage.removeItem(MATCH_KEY); localStorage.removeItem(RESULT_KEY); S = null; render();
  }

  // ---------- tableta echipei: accesezi site-urile (FTC Events, meet-uri, echipe, sponsori) ca într-un browser ----------
  const fmtT = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  const dateOf = (week) => { const d = new Date(2026, 9, 3 + (week - 1) * 7); return ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'][d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1); };
  function timeSchedule(matches) { let t = 10 * 60 + 30; const half = Math.floor(matches.length / 2); matches.forEach((m, i) => { m.t = t; t += 13 + (m.no % 3 === 0 ? 2 : 0); if (i + 1 === half) t += 70; }); }
  function ftcMatches(ev, mineOnly) {
    const T = (i, m, win) => { const t = ev.teams[i]; return el('td', { class: 'tm ' + (win ? 'win' : '') + (t.me ? ' me' : '') }, el('b', { text: t.num }), el('span', { text: t.name + (m.sur.includes(i) ? ' (sur.)' : '') })); };
    const cur = ev.round < ev.n ? ev.mine[ev.round] : -1;
    return el('div', { class: 'ftc-scroll' }, el('table', { class: 'ftc-tbl' }, el('thead', null, el('tr', null, el('th', { text: 'Meci #' }), el('th', { class: 'r', colspan: 2, text: 'Roșu' }), el('th', { class: 'b', colspan: 2, text: 'Albastru' }), el('th', { text: 'Scor' }))),
      el('tbody', null, ev.matches.filter((m) => !mineOnly || (m.red.concat(m.blue).includes(0) && !m.sur.includes(0))).map((m) => {
        const mine = m.red.concat(m.blue).includes(0) && !m.sur.includes(0), rw = m.done && m.sr > m.sb, bw = m.done && m.sb > m.sr;
        return el('tr', { class: (mine ? 'mine ' : '') + (m.no === cur ? 'cur' : '') },
          el('td', { class: 'mn' }, el('a', { text: 'Calificare ' + m.no }), el('small', { text: (ev.when || '') + ' · ' + (m.t != null ? fmtT(m.t) : '') })),
          T(m.red[0], m, rw), T(m.red[1], m, rw), T(m.blue[0], m, bw), T(m.blue[1], m, bw),
          el('td', { class: 'sc' }, m.done ? [el('div', { class: 'r' + (rw ? ' w' : ''), text: m.sr }), el('div', { class: 'b' + (bw ? ' w' : ''), text: m.sb })] : null));
      }))));
  }
  function ftcParticipants(ev) {
    const sorted = ev.teams.slice().sort((a, b) => Number(a.num) - Number(b.num));
    return el('div', { class: 'ftc-panel' }, el('div', { class: 'ftc-ph' }, 'Participanți ', el('em', { text: ev.teams.length })),
      el('div', { class: 'ftc-scroll sm' }, el('table', { class: 'ftc-tbl plain' }, el('thead', null, el('tr', null, ['Număr', 'Nume', 'Regiune', 'Țară'].map((h) => el('th', { text: h })))),
        el('tbody', null, sorted.map((t) => el('tr', { class: t.me ? 'mine' : '' }, el('td', { class: 'num' }, el('a', { text: t.num })), el('td', { class: 'nm', text: t.name }), el('td', { text: regionOf(ev.host || S.region).name }), el('td', { text: 'România' })))))));
  }
  function ftcRanks(ev) {
    const sorted = ev.teams.slice().sort((a, b) => b.rp - a.rp || b.pts - a.pts);
    return el('div', { class: 'ftc-panel' }, el('div', { class: 'ftc-ph' }, 'Clasament calificări'),
      el('div', { class: 'ftc-scroll sm' }, el('table', { class: 'ftc-tbl plain' }, el('thead', null, el('tr', null, ['#', 'Echipă', 'RP', 'Puncte', 'Meciuri', 'V-E-Î'].map((h) => el('th', { text: h })))),
        el('tbody', null, sorted.map((t, i) => el('tr', { class: t.me ? 'mine' : '' }, el('td', { text: i + 1 }), el('td', { class: 'nm' }, el('a', { text: t.num }), ' ' + t.name), el('td', { text: t.rp }), el('td', { text: t.pts }), el('td', { text: t.played }), el('td', { text: t.w + '-' + t.t + '-' + t.l })))))));
  }
  const TAPPS = [
    { id: 'ftc', name: 'FTC Events', ic: '🏁', url: () => 'ftc-events.firstinspires.org/2026/RO · simulare', light: true },
    { id: 'meets', name: 'Meet-uri', ic: '📅', url: () => 'natie.ro/meets · simulare', light: true },
    { id: 'teams', name: 'Echipe', ic: '👥', url: () => 'natie.ro/teams · simulare', light: true },
    { id: 'sponsors', name: 'Sponsori', ic: '🤝', url: () => 'portal de sponsori · contracte fictive', light: false },
    { id: 'shop', name: 'Piese', ic: '🛠️', url: () => 'magazin de piese · fictiv', light: false },
    { id: 'portfolio', name: 'Caiet', ic: '📓', url: () => 'caiet tehnic · intern', light: false },
    { id: 'crew', name: 'Echipa', ic: '🧑‍🔧', url: () => 'echipa ta · intern', light: false },
    { id: 'msgs', name: 'Mesaje', ic: '💬', url: () => 'mesaje · intern', light: false },
    { id: 'map', name: 'Hartă', ic: '🗺️', url: () => 'hartă · regiuni și meet-uri', light: false },
    { id: 'calendar', name: 'Calendar', ic: '🗓️', url: () => 'calendar · sezonul tău', light: false },
    { id: 'stats', name: 'Statistici', ic: '📈', url: () => 'statistici · intern', light: false }
  ];
  let tabletApp = null, tabletTeamReg = null, tabletTeamQ = '';
  const dateParts = (week) => { const d = new Date(2026, 9, 3 + (week - 1) * 7); return { dow: ['DUM', 'LUN', 'MAR', 'MIE', 'JOI', 'VIN', 'SÂM'][d.getDay()], day: d.getDate(), mon: ['IAN', 'FEB', 'MAR', 'APR', 'MAI', 'IUN', 'IUL', 'AUG', 'SEP', 'OCT', 'NOI', 'DEC'][d.getMonth()] }; };
  const dateBlock = (week) => { const d = dateParts(week); return el('div', { class: 'dblk' }, el('small', { text: d.dow }), el('b', { text: d.day }), el('small', { text: d.mon })); };
  let ftcTab = 'matches', ftcMine = false;
  function ftcRegion() {
    const b = meetBoard(), me = b.findIndex((x) => x.me) + 1;
    return el('div', { class: 'ftc-panel' }, el('div', { class: 'ftc-ph' }, 'Regiunea ' + regionOf(S.region).name + ' · Top 10 meciuri ', el('em', { text: b.length })),
      el('p', { class: 'cr-note', style: 'color:#444;margin:10px 14px', text: S.mscores.length ? 'Suma celor mai bune 10 scoruri din toate meet-urile. Locul tău: ' + me + ' din ' + b.length + '.' : 'Joacă un meet ca să apari în clasament. Ceilalți au deja scoruri simulate.' }),
      el('div', { class: 'ftc-scroll sm' }, el('table', { class: 'ftc-tbl plain' }, el('thead', null, el('tr', null, ['#', 'Echipă', 'Top 10'].map((h) => el('th', { text: h })))),
        el('tbody', null, b.map((t, i) => el('tr', { class: t.me ? 'mine' : '' }, el('td', { text: i + 1 }), el('td', { class: 'nm', text: t.name }), el('td', { text: t.sum })))))));
  }
  function tFtc() {
    const ev = S.event || S.lastEv;
    if (!ev) return el('div', { class: 'ftc' }, el('div', { class: 'ftc-head' }, el('h2', { text: 'FTC Events · Sezon #11' }), el('p', { text: 'România · ' + regionOf(S.region).name })),
      el('div', { class: 'ftc-empty' }, el('p', { text: 'Niciun eveniment jucat încă. După ce intri la un meet sau la regională, aici apar participanții, lista meciurilor și clasamentul.' }), el('div', { class: 'dim-cal' }, calList())), ftcRegion());
    const me = ev.teams[0], sorted = ev.teams.slice().sort((a, b) => b.rp - a.rp || b.pts - a.pts), rank = sorted.findIndex((t) => t.me) + 1;
    const tabsEl = el('div', { class: 'ftc-tabs' }, [['matches', 'Meciuri'], ['teams', 'Participanți'], ['rank', 'Clasament'], ['region', 'Regiune']].map(([id, t]) => el('button', { class: ftcTab === id ? 'on' : '', onclick: () => { ftcTab = id; paintPhone(); } }, t)));
    let bodyEl;
    if (ftcTab === 'region') bodyEl = ftcRegion();
    else if (ftcTab === 'teams') bodyEl = ftcParticipants(ev);
    else if (ftcTab === 'rank') bodyEl = ftcRanks(ev);
    else bodyEl = el('div', { class: 'ftc-panel' }, el('div', { class: 'ftc-ph' }, 'Meciuri de calificare ', el('em', { text: ev.matches.length }), el('label', { class: 'ftc-chk' }, el('input', { type: 'checkbox', checked: ftcMine, onchange: (e) => { ftcMine = e.target.checked; paintPhone(); } }), ' doar ale mele')), ftcMatches(ev, ftcMine));
    return el('div', { class: 'ftc' }, el('div', { class: 'ftc-head' }, el('div', null, el('h2', { text: ev.name }), el('p', { text: (ev.when || '') + ' · ' + regionOf(ev.host || S.region).name + ' · ' + (S.event ? 'în desfășurare' : 'încheiat') })),
      el('div', { class: 'ftc-chips' }, el('span', null, el('b', { text: ev.teams.length }), 'echipe'), el('span', null, el('b', { text: ev.matches.length }), 'meciuri'), el('span', null, el('b', { text: me.w + '-' + me.t + '-' + me.l }), 'V-E-Î'), el('span', null, el('b', { text: '#' + rank }), 'locul tău'))),
      tabsEl, bodyEl);
  }
  function tMeets() {
    const cap = (it) => 8 + Math.floor(hash(it.no * 17 + S.season * 5) * 13), R = window.CAREER_REGIONS || [];
    const meetCard = (it) => {
      const past = S.week > it.week && !it.done, canEnroll = it.type === 'meet' && !it.done && S.week < it.week, n = it.type === 'meet' ? Math.min(20, cap(it) + (it.enrolled ? 1 : 0)) : null;
      const st = it.done ? ['Jucat', 'ok'] : it.off ? ['Prin calificare', 'dim'] : it.type === 'meet' ? (it.enrolled ? ['Înscris', 'on'] : past ? ['Sărit', 'dim'] : n >= 20 ? ['Listă de așteptare', 'warn'] : ['Înscrieri deschise', 'open']) : ['Obligatoriu', 'on'];
      return el('div', { class: 'mt-card' + (it.enrolled ? ' on' : '') + (it.done || past ? ' done' : '') }, dateBlock(it.week),
        el('div', { class: 'mt-info' }, el('b', { text: itemName(it) }), el('small', { text: regionOf(it.host || S.region).name + ' · săpt. ' + it.week + (it.type === 'meet' ? ' · 6 meciuri' : ' · 6 meciuri + playoff') }),
          n != null ? el('div', { class: 'mt-cap' }, el('i', { style: 'width:' + (n / 20 * 100) + '%' }), el('span', { text: n + '/20 echipe' })) : null),
        el('div', { class: 'mt-side' }, el('em', { class: st[1], text: st[0] }), canEnroll ? el('button', { class: 'cr-btn sm' + (it.enrolled ? '' : ' pri'), text: it.enrolled ? 'Retrage-te' : 'Înscrie-te', onclick: () => toggleEnroll(it) }) : null));
    };
    return el('div', { class: 'ftc natie' }, el('div', { class: 'nt-head' }, el('div', { class: 'nt-brand' }, el('i'), 'natie.ro'), el('nav', null, el('b', { text: 'Meet-uri' }), el('button', { onclick: () => { tabletApp = 'teams'; paintPhone(); } }, 'Echipe'))),
      el('div', { class: 'nt-hero' }, el('h2', { text: 'Meet-uri și regionale · Sezon #11' }), el('p', { text: 'Recomandat 2–5 meet-uri, 6 meciuri la fiecare, 8–20 echipe, în orice regiune. Unul pe săptămână. Retragere cu minim 7 zile înainte. Pentru regională contează cele mai bune 10 meciuri.' })),
      el('div', { class: 'nt-body' }, el('div', { class: 'nt-sec', text: 'Calendarul tău' }), el('div', { class: 'mt-grid' }, S.cal.map(meetCard)),
        el('div', { class: 'nt-sec', text: 'Orașele gazdă ale regionalelor' }),
        el('div', { class: 'nt-cities' }, R.map((r) => el('span', { class: r.id === S.region ? 'me' : '' }, r.name, r.id === S.region ? el('em', { text: 'regiunea ta' }) : null))),
        el('p', { class: 'cr-note', style: 'color:#555;margin-top:10px', text: 'Primele 3 locuri de la regională merg la Campionatul național, iar primele 2 de la național la Mondiale.' })));
  }
  function tSponsors() {
    const act = activeSponsors(), full = act.length >= MAX_SPONSORS;
    const card = (x, kind) => el('div', { class: 'sp-card ' + (x.status || '') }, el('img', { src: 'assets/img/portfolio/' + x.logo, alt: x.brand }),
      el('div', { class: 'sp-in' }, el('b', { text: x.brand }), el('p', { text: KINDS[x.kind].text(x.target) }),
        el('small', { text: (kind === 'offer' ? 'Semnare ' + eur(x.signing) + ' · ' : '') + 'La final ' + eur(x.pay) + ' · +' + x.rep + ' reputație · valabil ' + Math.max(1, x.expires - S.evCount) + ' evenimente' }),
        kind === 'active' && x.kind === 'tips' ? el('div', { class: 'prog' }, el('i', { style: 'width:' + clamp(x.progress / x.target * 100, 0, 100) + '%' })) : null),
      kind === 'offer' ? el('button', { class: 'cr-btn pri sm', disabled: full, text: full ? 'Plin' : 'Acceptă', onclick: () => acceptOffer(x) }) : el('em', { text: 'Activ' }));
    return el('div', { class: 'ftc spw' }, el('div', { class: 'sp-head' }, el('div', null, el('h2', { text: 'Portal parteneri' }), el('p', { text: 'Contracte fictive cu partenerii reali ai echipei roLERbot.' })), el('div', { class: 'sp-slots' }, el('b', { text: act.length + '/' + MAX_SPONSORS }), 'contracte active')),
      el('div', { class: 'sp-body' }, el('div', { class: 'nt-sec dark', text: 'Contracte active' }), act.length ? el('div', { class: 'sp-grid' }, act.map((x) => card(x, 'active'))) : el('p', { class: 'cr-note', text: 'Niciun contract activ. Alege o ofertă mai jos.' }),
        el('div', { class: 'nt-sec dark', text: 'Oferte noi' }), S.offers.length ? el('div', { class: 'sp-grid' }, S.offers.map((x) => card(x, 'offer'))) : el('p', { class: 'cr-note', text: 'Apar oferte noi după fiecare eveniment.' }),
        S.sponsorLog.length ? [el('div', { class: 'nt-sec dark', text: 'Istoric' }), el('div', { class: 'log' }, S.sponsorLog.slice(0, 6).map((x) => el('div', { text: x.brand + ': ' + x.text + ' → ' + (x.ok ? 'îndeplinit (+' + eur(x.pay) + ')' : 'ratat') })))] : null));
  }
  function tTeams() {
    const R = window.CAREER_REGIONS || []; if (!tabletTeamReg) tabletTeamReg = S.region;
    const reg = regionOf(tabletTeamReg), q = tabletTeamQ.trim().toLowerCase(), list = reg.teams.filter(([n, num]) => !q || n.toLowerCase().includes(q) || String(num).includes(q));
    const inp = el('input', { class: 'cr-in', placeholder: 'Caută echipa…', value: tabletTeamQ, oninput: (e) => { tabletTeamQ = e.target.value; const cur = e.target.selectionStart; paintTablet(); const n = document.querySelector('#phone .cr-in'); if (n) { n.focus(); n.setSelectionRange(cur, cur); } } });
    return el('div', { class: 'ftc' }, el('div', { class: 'ftc-head' }, el('h2', { text: 'Echipe pe regiuni' }), el('p', { text: 'Regiunile sezonului #11.' })),
      el('div', { class: 'tp-regs' }, R.map((r) => el('button', { class: 'tp-reg' + (tabletTeamReg === r.id ? ' on' : ''), onclick: () => { tabletTeamReg = r.id; paintTablet(); } }, r.name, el('small', { text: r.teams.length ? r.teams.length + ' echipe' : 'în curând' })))), inp,
      el('div', { class: 'ftc-panel' }, el('div', { class: 'ftc-ph' }, reg.name + ' ', el('em', { text: reg.teams.length })),
        el('div', { class: 'ftc-scroll sm' }, el('table', { class: 'ftc-tbl plain' }, el('thead', null, el('tr', null, ['Număr', 'Nume'].map((h) => el('th', { text: h })))),
          el('tbody', null, list.map(([n, num]) => el('tr', { class: String(num) === String(S.team.num) ? 'mine' : '' }, el('td', { class: 'num' }, el('a', { text: num })), el('td', { class: 'nm', text: n }))))))));
  }
  // ---------- telefonul / tableta: stă în colțul din dreapta jos ca în GTA, iese în sus la notificări (cu vibrație și sunet), la click se face cât ecranul ----------
  let phoneMode = 'dock', peekTimer = null;
  const isMuted = () => { try { return localStorage.getItem('rbPhoneMute') === '1'; } catch (e) { return false; } };
  const setMuted = (v) => { try { localStorage.setItem('rbPhoneMute', v ? '1' : '0'); } catch (e) { } };
  const TONES = { sponsors: [[0, .14, 180], [.22, .14, 180]], meets: [[0, .18, 128], [.28, .18, 128], [.56, .18, 128]], msgs: [[0, .1, 330], [.14, .1, 330]], crew: [[0, .12, 200], [.16, .12, 250]], portfolio: [[0, .2, 150], [.3, .2, 150]], teams: [[0, .3, 170]], ftc: [[0, .55, 110]], shop: [[0, .1, 230], [.16, .1, 230], [.32, .1, 260]], def: [[0, .22, 128], [.3, .22, 128], [.6, .22, 128]] };
  function buzz(kind) {   // "bzzt" like a phone on a table (a different rhythm per app) + real vibration on phones
    const pat = TONES[kind] || TONES.def;
    try { if (navigator.vibrate) navigator.vibrate(pat.flatMap((x, i) => (i ? [Math.round((x[0] - pat[i - 1][0] - pat[i - 1][1]) * 1000), Math.round(x[1] * 1000)] : [Math.round(x[1] * 1000)]))); } catch (e) { }
    if (isMuted()) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; const a = buzz.ctx || (buzz.ctx = new AC()); if (a.state === 'suspended') a.resume();
      const t0 = a.currentTime + 0.02;
      pat.forEach(([off, dur, hz]) => {
        const o = a.createOscillator(), g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain(), f = a.createBiquadFilter();
        o.type = 'sawtooth'; o.frequency.value = hz; lfo.frequency.value = 52; lg.gain.value = 0.07; f.type = 'lowpass'; f.frequency.value = 900;
        lfo.connect(lg); lg.connect(g.gain); g.gain.setValueAtTime(0.0001, t0 + off); g.gain.linearRampToValueAtTime(0.14, t0 + off + 0.02); g.gain.setValueAtTime(0.14, t0 + off + dur - 0.03); g.gain.linearRampToValueAtTime(0.0001, t0 + off + dur + 0.01);
        o.connect(f); f.connect(g); g.connect(a.destination); o.start(t0 + off); lfo.start(t0 + off); o.stop(t0 + off + dur + 0.03); lfo.stop(t0 + off + dur + 0.03);
      });
    } catch (e) { }
  }
  const unread = () => ((S && S.notifs) || []).filter((n) => !n.read).length;
  function notify(n, silent) {
    if (!S) return; S.notifs = S.notifs || [];
    S.notifs.unshift({ id: Date.now() + '-' + irnd(10, 99), app: n.app || null, ic: n.ic || '🔔', title: n.title, text: n.text || '', wk: S.week, read: false, act: n.act || null }); S.notifs = S.notifs.slice(0, 30);
    if (!silent) alertPhone(n.app, n.title);
  }
  function alertPhone(kind, title) {
    const p = document.getElementById('phone'); if (!p) { if (S) S.alertNew = true; return; }
    buzz(kind); paintPhone();
    if (window.matchMedia('(max-width: 900px)').matches) { if (title) toast(title); return; }   // pe telefon tableta se deschide din „Mai mult”; notificarea apare ca banner
    if (phoneMode === 'dock') { p.classList.add('peek', 'ring'); clearTimeout(peekTimer); setTimeout(() => p.classList.remove('ring'), 1100); peekTimer = setTimeout(() => p.classList.remove('peek'), 6500); }
  }
  function ensurePhone() {
    let p = document.getElementById('phone');
    if (!p) {
      p = el('div', { id: 'phone', class: 'phone dock', onclick: () => { if (phoneMode === 'dock') openPhone(null); } });
      document.body.append(el('div', { id: 'phoneBd', class: 'phone-bd', onclick: closePhone }), p);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && phoneMode === 'full') closePhone(); });
    }
    return p;
  }
  function openPhone(app) { phoneMode = 'full'; tabletApp = app || null; const p = ensurePhone(); p.classList.remove('peek', 'ring'); p.className = 'phone full'; document.getElementById('phoneBd').classList.add('on'); paintPhone(); }
  function closePhone() { phoneMode = 'dock'; const p = document.getElementById('phone'); if (!p) return; p.className = 'phone dock'; document.getElementById('phoneBd').classList.remove('on'); paintPhone(); }
  const openTablet = openPhone, closeTablet = closePhone;
  function readNotif(n) { n.read = true; save(); if (n.app) { tabletApp = n.app; } openPhone(n.app || null); }
  function doAct(n) {
    const a = n.act; if (!a || n.done) return;
    if (a.t === 'enroll') { const it = S.cal.find((x) => x.id === a.id); if (!it || it.enrolled || S.week >= it.week) toast('Înscrierile s-au închis.'); else { it.enrolled = true; it.host = S.region; log('Te-ai înscris la ' + itemName(it) + '.'); toast('Te-ai înscris la ' + itemName(it) + '.'); } }
    else if (a.t === 'offer') { const o = S.offers.find((x) => x.id === a.id); if (!o) toast('Oferta a expirat.'); else acceptOffer(o); }
    n.done = true; n.read = true; save(); render();
  }
  function notifCard(n, mini) {
    return el('div', { class: 'ph-n' + (n.read ? '' : ' new') + (mini ? ' mini' : ''), role: 'button', tabindex: 0, onclick: (e) => { e.stopPropagation(); readNotif(n); } }, appTile(n.app || 'bell', 'sm'),
      el('div', null, el('b', { text: n.title }), el('small', { text: n.text }), n.act && !n.done && !mini ? el('button', { class: 'cr-btn sm pri', style: 'margin-top:8px', text: n.act.label, onclick: (e) => { e.stopPropagation(); doAct(n); } }) : null), el('em', { text: n.done ? 'făcut' : 'săpt. ' + n.wk }));
  }
  const PH_THEMES = ['#f9056c', '#3d8bff', '#19b6a4', '#ffc933', '#9a6bff'];
  const phTheme = () => { try { return clamp(parseInt(localStorage.getItem('rbPhoneTheme') || '0', 10) || 0, 0, PH_THEMES.length - 1); } catch (e) { return 0; } };
  const cycleTheme = () => { try { localStorage.setItem('rbPhoneTheme', String((phTheme() + 1) % PH_THEMES.length)); } catch (e) { } paintPhone(); };
  const APP_COL = { ftc: '#2f7bff', meets: '#19b6a4', teams: '#9a6bff', sponsors: '#ffc933', shop: '#ff7a3d', portfolio: '#f2c14e', crew: '#4fd1c5', msgs: '#ff5d8f', map: '#58c26a', calendar: '#ff8a5c', stats: '#7aa7ff' };
  function paintPhone() {
    if (!S || !S.region) return; const p = ensurePhone(); p.style.setProperty('--ph', (() => { try { const v = localStorage.getItem('rbPhoneTheme'); if (v != null) return PH_THEMES[phTheme()]; } catch (e) { } return 'var(--pink)'; })());
    const now = new Date(), clock = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'), un = unread(), list = S.notifs || [];
    if (phoneMode === 'dock') {
      p.replaceChildren(el('div', { class: 'ph-handle' }, icon('tablet', 'ph-ic'), el('b', { text: clock }), el('span', { class: 'ph-txt', text: un ? un + ' notificări noi' : 'Tableta echipei' }), un ? el('i', { class: 'ph-badge', text: un }) : null),
        el('div', { class: 'ph-lock' }, list.length ? list.slice(0, 3).map((n) => notifCard(n, true)) : el('p', { class: 'cr-note', text: 'Nicio notificare.' }),
          el('div', { class: 'ph-hint', text: 'Apasă ca să deschizi tableta' })));
      return;
    }
    const app = TAPPS.find((a) => a.id === tabletApp);
    const status = el('div', { class: 'tb-status' }, el('span', { text: clock }), el('b', { text: S.team.name + ' · tabletă' }), el('span', { class: 'tb-sys' }, el('button', { class: 'tb-mute', title: 'Schimbă culoarea tabletei', onclick: cycleTheme }, icon('palette')), el('button', { class: 'tb-mute', title: isMuted() ? 'Sunet oprit' : 'Sunet pornit', onclick: () => { setMuted(!isMuted()); paintPhone(); } }, icon(isMuted() ? 'bellOff' : 'bell')), icon('battery', 'bat')));
    const bar = el('div', { class: 'tb-bar' }, el('button', { class: 'tb-btn', title: 'Acasă', onclick: () => { tabletApp = null; paintPhone(); } }, icon('home')), app ? el('div', { class: 'tb-url' }, '' + app.url()) : el('div', { class: 'tb-url dim', text: 'Ecran principal' }), app ? el('button', { class: 'tb-btn', title: 'Reîncarcă', onclick: () => paintPhone() }, icon('refresh')) : null, el('button', { class: 'tb-btn', title: 'Coboară tableta (Esc)', onclick: (e) => { e.stopPropagation(); closePhone(); } }, icon('chevronD')));
    const dotFor = (id) => (id === 'sponsors' && S.offers.length && activeSponsors().length < MAX_SPONSORS) || (id === 'meets' && nextEvent() && nextEvent().type === 'meet' && !nextEvent().enrolled) || (id === 'shop' && S.week <= 2) || (id === 'msgs' && (S.msgs || []).some((m) => m.kind === 'challenge' && !m.done)) ? el('i', { class: 'dot' }) : null;
    let body;
    if (!app) {
      const nx = nextEvent(), left = nx ? nx.week - S.week : 0, lv = repLevel(S.rep);
      const widgets = el('div', { class: 'tb-wid' },
        el('div', { class: 'w clock' }, el('b', { text: clock }), el('small', { text: 'Sezonul ' + S.season + ' · săptămâna ' + S.week + ' · ' + dateOf(S.week) })),
        el('div', { class: 'w team' }, el('small', { text: 'Echipa ta' }), el('b', { text: S.team.name }), el('span', { text: '#' + S.team.num + ' · ' + regionOf(S.region).name }),
          el('div', { class: 'kv' }, el('div', null, el('small', { text: 'Buget' }), el('b', { class: 'ok', text: eur(S.money) })), el('div', null, el('small', { text: 'Reputație' }), el('b', { class: 'gold', text: Math.round(S.rep) })), el('div', null, el('small', { text: 'Nivel' }), el('b', { text: lv })))),
        el('div', { class: 'w next' }, el('small', { text: 'Următorul eveniment' }), el('b', { text: nx ? itemName(nx) : 'Sezon încheiat' }), nx ? el('span', { text: left > 0 ? dateOf(nx.week) + ' · peste ' + left + ' săpt.' : 'Azi! Intră din tabul Eveniment.' }) : null,
          nx && left > 0 ? el('button', { class: 'cr-btn sm pri', style: 'margin-top:10px', text: 'Avansează o săptămână (−' + WEEK_COST + ' €)', onclick: advanceWeek }) : null));
      body = el('div', { class: 'tb-home' }, widgets, el('div', { class: 'tb-main' }, searchBox(),
        el('div', { class: 'tb-apps' }, TAPPS.map((a) => el('button', { class: 'tb-app', style: '--c:' + APP_COL[a.id], onclick: () => setApp(a.id) }, appTile(a.id), a.name, dotFor(a.id)))),
        el('div', { class: 'tb-nh' }, el('span', { class: 'cr-eyebrow', text: 'Notificări' }), list.some((n) => !n.read) ? el('button', { class: 'cr-btn sm', text: 'Marchează ca citite', onclick: () => { list.forEach((n) => { n.read = true; }); save(); paintPhone(); } }) : null),
        list.length ? el('div', { class: 'ph-list' }, list.slice(0, 12).map((n) => notifCard(n, false))) : el('p', { class: 'cr-note', text: 'Nicio notificare încă. Meet-urile, sponsorii și meciurile îți scriu aici.' })));
    } else body = el('div', { class: 'tb-body' + (app.light ? ' light' : '') }, { ftc: tFtc, meets: tMeets, teams: tTeams, sponsors: tSponsors, shop: tShop, portfolio: tPortfolio, crew: tCrew, msgs: tMsgs, map: tMap, calendar: tCalendar, stats: tStats }[app.id]());
    const dock = el('div', { class: 'tb-dock' }, el('button', { class: 'dk' + (!app ? ' on' : ''), title: 'Acasă', onclick: () => { tabletApp = null; paintPhone(); } }, el('span', { text: '⌂' })),
      TAPPS.map((a) => el('button', { class: 'dk' + (tabletApp === a.id ? ' on' : ''), style: '--c:' + APP_COL[a.id], title: a.name, onclick: () => setApp(a.id) }, appTile(a.id, 'sm'), dotFor(a.id))));
    p.replaceChildren(status, bar, body, dock);
  }

  let shopTab = 'hw';
  function tShop() {
    const hw = Object.keys(HW).map((cat) => {
      const H = HW[cat], cur = S.hw[cat], t = H.tiers[cur + 1], pend = pendingFor(cat);
      if (!t) return el('div', { class: 'shop-card done' }, el('small', { class: 'cat', text: H.name }), el('b', { text: H.tiers[cur].n }), el('em', { class: 'st', text: 'Treapta maximă' }));
      const rep = S.rep >= t.rep;
      return el('div', { class: 'shop-card' }, el('small', { class: 'cat', text: H.name + ' · treapta ' + (cur + 2) }), el('b', { text: t.n }), el('p', { text: t.d }),
        pend ? orderRow(pend) : !rep ? el('em', { class: 'st', text: 'Necesită ' + t.rep + ' reputație' }) : el('div', { class: 'cr-row' },
          el('button', { class: 'cr-btn sm pri', disabled: S.money < priceOf(t), text: eur(priceOf(t)) + ' · livrare ' + shipWk(t) + ' săpt.', onclick: () => buy(cat, false) }),
          el('button', { class: 'cr-btn sm', disabled: S.money < priceOf(t, true), title: 'Piesele ajung imediat, +40%', text: 'Express ' + eur(priceOf(t, true)), onclick: () => buy(cat, true) })), !pend && rep ? el('small', { class: 'cat', text: 'Apoi montaj ' + asmWk(t) + ' săpt.' }) : null);
    });
    const cons = SHOP_ITEMS.map((it) => el('div', { class: 'shop-card' }, tile(SHOP_ICON[it.id]), el('b', { text: it.name }), el('p', { text: it.d }), el('button', { class: 'cr-btn sm pri', disabled: S.money < Math.round(it.cost * saleF()), text: eur(Math.round(it.cost * saleF())), onclick: () => buyItem(it) })));
    const fcost = Math.round(FIELD_COST * saleF()), field = [el('div', { class: 'shop-card' + (S.field ? ' done' : '') }, tile('field'), el('b', { text: 'Teren oficial 12×12 ft (kit elemente de joc)' }), el('p', { text: 'Fără teren nu poți testa autonomul și nu poți face antrenamente. Cu el: 2 antrenamente pe săptămână. Livrare 1 săptămână.' }),
      S.field ? el('em', { class: 'st', text: 'Ai terenul în atelier' }) : S.fieldOrder ? el('em', { class: 'st', text: 'În livrare · ajunge în săpt. ' + S.fieldOrder.ready }) : el('div', { class: 'cr-row' }, el('button', { class: 'cr-btn sm pri', disabled: S.money < fcost, text: eur(fcost) + ' · 1 săpt.', onclick: () => buyField(false) }), el('button', { class: 'cr-btn sm', disabled: S.money < Math.round(fcost * 1.4), title: 'Livrare imediată, +40%', text: 'Express ' + eur(Math.round(fcost * 1.4)), onclick: () => buyField(true) })))];
    const tabsEl = el('div', { class: 'shop-tabs' }, [['hw', 'Piese robot', hw.length], ['cons', 'Consumabile', cons.length], ['field', 'Teren de antrenament', 1]].map(([id, t, n]) => el('button', { class: shopTab === id ? 'on' : '', onclick: () => { shopTab = id; paintPhone(); } }, t, el('em', { text: n }))));
    const pending = S.build.length ? el('div', { class: 'orders', style: 'margin:12px 16px 0' }, S.build.map(orderRow)) : null;
    return el('div', { class: 'ftc shopw' }, el('div', { class: 'shop-head' }, el('div', null, el('h2', { text: 'Magazin de piese' }), el('p', { text: 'Magazin fictiv de robotică · livrare standard sau express' })), el('div', { class: 'shop-bud' }, el('small', { text: 'Buget' }), el('b', { text: eur(S.money) }))),
      saleF() < 1 ? el('div', { class: 'sale-bar', text: 'Reduceri de început de sezon: −10% la tot, doar în săptămânile 1–2' }) : null, tabsEl, pending,
      el('div', { class: 'shop-grid' }, shopTab === 'hw' ? hw : shopTab === 'cons' ? cons : field));
  }

  const paintTablet = paintPhone;

  // ---------- magazinul de piese (fictiv, inspirat de magazinele de robotică): upgrade-uri, consumabile și terenul de antrenament ----------
  const saleF = () => (S && S.week <= 2 ? 0.9 : 1);   // reducere de început de sezon
  const priceOf = (t, ex) => Math.round(t.cost * saleF() * (ex ? 1.4 : 1));
  const SHOP_ITEMS = [
    { id: 'bat', ic: '🔋', name: 'Set baterii noi 12V', cost: 150, d: 'Accelerație +8% la următorul eveniment.', fn: (s) => addBuff(s, 'accel', 1.08, 'Baterii noi') },
    { id: 'cab', ic: '🔌', name: 'Cabluri și conectori noi', cost: 90, d: 'Precizie +6% la următorul eveniment.', fn: (s) => addBuff(s, 'spread', 0.94, 'Cablaj curat') },
    { id: 'bel', ic: '⚙️', name: 'Curele și rulmenți', cost: 130, d: 'Viteză +5% la următorul eveniment.', fn: (s) => addBuff(s, 'speed', 1.05, 'Transmisie nouă') }
  ];
  const FIELD_COST = 900;
  function buyItem(it) {
    const cost = Math.round(it.cost * saleF());
    if (S.buffs.some((b) => b.label === { bat: 'Baterii noi', cab: 'Cablaj curat', bel: 'Transmisie nouă' }[it.id])) return toast('Ai deja efectul ăsta activ.');
    if (S.money < cost) return toast('Nu ai destui bani (' + eur(cost) + ').');
    S.money -= cost; it.fn(S); log('Magazin: ' + it.name + ' (−' + eur(cost) + ').'); save(); render();
  }
  function buyField(express) {
    if (S.field || S.fieldOrder) return; const cost = Math.round(FIELD_COST * saleF() * (express ? 1.4 : 1)); if (S.money < cost) return toast('Nu ai destui bani (' + eur(cost) + ').');
    S.money -= cost;
    if (express) { S.field = true; log('Ai cumpărat un teren de antrenament express (−' + eur(cost) + ').'); notify({ app: 'shop', ic: '🟩', title: 'Terenul a ajuns', text: 'Poți testa autonomul și face antrenamente (2 pe săptămână).' }); }
    else { S.fieldOrder = { ready: S.week + 1 }; log('Ai comandat terenul de antrenament (−' + eur(cost) + '). Ajunge în 1 săptămână.'); }
    save(); render();
  }

  // ---------- echipa (crew), caiet tehnic, jurizare și premii, obiective de sezon, mesaje, alegerea alianței ----------
  const CREW_DEF = [
    { id: 'driver', role: 'Șofer', ic: '🎮', desc: 'Conduce robotul în meci.', bonus: '+2% viteză și rotire pe nivel' },
    { id: 'prog', role: 'Programator', ic: '💻', desc: 'Autonom și țintire.', bonus: '+4% ajutor la țintire pe nivel' },
    { id: 'build', role: 'Constructor', ic: '🔧', desc: 'Montează și repară robotul.', bonus: '+2% accelerație și intake pe nivel' }];
  const CREW_NAMES = ['Andrei', 'Maria', 'Matei', 'Ioana', 'Luca', 'Elena', 'David', 'Sofia', 'Radu', 'Ana', 'Tudor', 'Bianca', 'Vlad', 'Daria', 'Alex', 'Teodora'];
  const crewXpLv = (xp) => Math.min(5, Math.floor(Math.sqrt((xp || 0) / 25)));
  const crewLv = (s, id) => { const m = (s.crew || []).find((c) => c.id === id); return m ? crewXpLv(m.xp) : 0; };
  function gainXp(id, n) {
    const m = (S.crew || []).find((c) => c.id === id); if (!m) return; const before = crewXpLv(m.xp); m.xp = (m.xp || 0) + n; const after = crewXpLv(m.xp);
    if (after > before) { const d = CREW_DEF.find((x) => x.id === id); log(m.name + ' (' + d.role + ') a ajuns la nivelul ' + after + '.'); notify({ app: 'crew', ic: d.ic, title: m.name + ' a avansat', text: d.role + ': nivel ' + after + '. ' + d.bonus + '.' }); }
  }
  function initExtras(s) {
    if (!Array.isArray(s.crew)) { const nm = shuffle(CREW_NAMES); s.crew = CREW_DEF.map((d, i) => ({ id: d.id, name: nm[i], xp: 0 })); }
    if (!Array.isArray(s.mlog)) s.mlog = [];
    if (!s.pf) s.pf = {}; if (!Array.isArray(s.awards)) s.awards = []; if (!Array.isArray(s.msgs)) s.msgs = []; if (!s.ss) s.ss = { w: 0, best: 0, sp: 0, regRank: 0, awards: 0 };
    if (!Array.isArray(s.goals)) s.goals = shuffle(GOAL_POOL).slice(0, 4).map((g) => ({ id: g.id, got: false }));
  }

  // ---- caiet tehnic (engineering portfolio): crește singur cu ce faci, plus ce scrii tu; contează la jurizare ----
  const PF_SECS = [['design', 'Design robot', '🛠️'], ['code', 'Software și autonom', '💻'], ['strategy', 'Strategie de joc', '🧠'], ['outreach', 'Outreach și comunitate', '🌍'], ['team', 'Echipă și management', '👥'], ['fin', 'Finanțe și sponsori', '💶']];
  function pfSec(id) {
    const hwSum = Object.values(S.hw).reduce((a, b) => a + b, 0), st = S.stats, played = st.w + st.t + st.l, manual = (S.pf && S.pf[id]) || 0, doneSp = S.sponsorLog.filter((x) => x.ok).length, crewSum = (S.crew || []).reduce((a, c) => a + crewXpLv(c.xp), 0);
    const auto = { design: hwSum * 8, code: S.hw.software * 14 + ((S.autos || []).some((a) => a.pts.length) ? 20 : 0), strategy: Math.min(60, played * 3), outreach: doneSp * 8 + (S.outreach || 0) * 15, team: crewSum * 7, fin: Math.min(60, S.rep * 0.8) + doneSp * 5 }[id];
    return clamp(Math.round(auto + manual), 0, 100);
  }
  const pfTotal = () => Math.round(PF_SECS.reduce((a, x) => a + pfSec(x[0]), 0) / PF_SECS.length);
  function workPortfolio(id) {
    if (S.pfWeek === S.week && (S.pfN || 0) >= 2) return toast('Ai lucrat deja de 2 ori la caiet săptămâna asta.');
    if ((S.pf[id] || 0) >= 50) return toast('Ai scris deja tot ce se poate acum aici. Crești restul prin upgrade-uri, meciuri și sponsori.');
    S.pf[id] = (S.pf[id] || 0) + 15; S.pfN = (S.pfWeek === S.week ? S.pfN || 0 : 0) + 1; S.pfWeek = S.week;
    gainXp(id === 'code' ? 'prog' : id === 'design' ? 'build' : 'driver', 6); log('Ai lucrat la caiet: ' + PF_SECS.find((x) => x[0] === id)[1] + '.'); save(); checkGoals(); render();
  }
  function tPortfolio() {
    const tot = pfTotal(), left = 2 - (S.pfWeek === S.week ? S.pfN || 0 : 0);
    return el('div', { class: 'ftc shopw' }, el('div', { class: 'shop-head' }, el('div', null, el('h2', { text: 'Caiet tehnic' }), el('p', { text: 'Contează la jurizare la regională, național și mondiale.' })), el('div', { class: 'shop-bud' }, el('small', { text: 'Completat' }), el('b', { text: tot + '%' }))),
      el('div', { class: 'shop-grid' }, pfCards()),
      el('p', { class: 'cr-note', style: 'margin:0 16px 16px', text: 'Poți lucra de 2 ori pe săptămână (' + Math.max(0, left) + ' rămase). Restul crește singur: upgrade-uri montate, meciuri, sponsori îndeplinite, echipa și reputația.' }));
  }

  // ---- jurizare: interviu cu 3 întrebări ----
  const QPOOL = [
    { q: 'Cum ați ales designul robotului?', a: [['Am construit și testat mai multe prototipuri, apoi am ales după date.', 3], ['Am adaptat ideea unei echipe mai bune.', 1], ['Primul care a mers a rămas.', 0]] },
    { q: 'Ce ați învățat dintr-un meci pierdut?', a: [['Am analizat înregistrarea, am găsit cauza și am schimbat strategia.', 3], ['Am încercat mai tare data viitoare.', 1], ['Nu prea am învățat nimic.', 0]] },
    { q: 'Cum lucrați ca echipă?', a: [['Fiecare are un rol, ținem ședințe și notăm deciziile în caiet.', 3], ['Lucrăm împreună când avem timp.', 1], ['Unul dintre noi face aproape tot.', 0]] },
    { q: 'Ce ați făcut pentru comunitate?', a: [['Ateliere în școli și o demonstrație publică, cu feedback notat.', 3], ['Am povestit colegilor despre robotică.', 1], ['Încă nu am apucat.', 0]] },
    { q: 'Cum folosiți autonomul?', a: [['Îl testăm pe teren, măsurăm precizia și îl îmbunătățim după fiecare meci.', 3], ['Avem unul simplu care merge uneori.', 1], ['Nu folosim autonom.', 0]] },
    { q: 'Cum v-ați gestionat bugetul?', a: [['Am prioritizat piesele cu cel mai mare impact și am căutat sponsori.', 3], ['Am cumpărat ce ne-a plăcut.', 1], ['N-am ținut evidența.', 0]] },
    { q: 'Cum ați făcut robotul fiabil?', a: [['Cablaj ordonat, piese de rezervă și verificări înainte de fiecare meci.', 3], ['Reparăm când se strică.', 1], ['Ne rugăm să meargă.', 0]] },
    { q: 'Ce plan aveți pentru anul viitor?', a: [['Un plan clar de mentorat, mai mulți membri noi și un robot mai simplu.', 3], ['Vedem noi.', 1], ['Nu ne-am gândit.', 0]] }];
  function runInterview() {
    const ev = S.event; if (!ev || !ev.judge || ev.judge.done) return; const qs = shuffle(QPOOL).slice(0, 3); let i = 0, pts = 0; const box = el('div'), mm = modal(box, true);
    const show = () => {
      if (i >= qs.length) { ev.judge = { done: true, iv: pts, pf: pfTotal() }; log('Interviu de jurizare: ' + pts + '/9, caiet ' + pfTotal() + '%.'); gainXp('prog', 6); save(); box.replaceChildren(el('div', { class: 'cr-eyebrow', text: 'Jurizare' }), el('h2', { text: pts >= 7 ? 'Interviu foarte bun' : pts >= 4 ? 'Interviu decent' : 'Interviu slab' }), el('p', { class: 'cr-sub', text: 'Juriul a notat ' + pts + ' din 9 la interviu. Împreună cu caietul tehnic (' + pfTotal() + '%), asta contează la premii.' }), el('button', { class: 'cr-btn pri', text: 'Continuă', onclick: () => { mm.close(); render(); } })); return; }
      const Q = qs[i]; box.replaceChildren(el('div', { class: 'cr-eyebrow', text: 'Interviu de jurizare · ' + (i + 1) + '/3' }), el('h2', { text: Q.q }), el('div', { class: 'choices' }, shuffle(Q.a).map((a) => el('button', { class: 'cr-btn', text: a[0], onclick: () => { pts += a[1]; i++; show(); } }))));
    };
    show();
  }
  const judgeScore = (ev) => { const j = ev.judge || {}, iv = j.done ? j.iv : 0, pf = j.done ? j.pf : pfTotal(); return Math.round(clamp(pf * 0.5 + iv / 9 * 40 + Math.min(10, S.rep / 10), 0, 100)); };
  const AWARDS = [['inspire', 'Inspire', '🏆'], ['think', 'Think', '💡'], ['control', 'Control', '🎛️'], ['connect', 'Connect', '🤝'], ['design', 'Design', '📐'], ['innovate', 'Innovate', '🚀'], ['motivate', 'Motivate', '🔥']];
  function computeAwards(ev, rank, n) {
    const J = judgeScore(ev), perf = Math.round(100 * (1 - (rank - 1) / Math.max(1, n - 1))), hwSum = Object.values(S.hw).reduce((a, b) => a + b, 0), iv = ev.judge && ev.judge.done ? ev.judge.iv : 0, doneSp = S.sponsorLog.filter((x) => x.ok).length;
    const sc = { inspire: J * 0.55 + perf * 0.3 + pfSec('outreach') * 0.15, think: (pfSec('design') + pfSec('code') + pfSec('strategy')) / 3, control: S.hw.software * 18 + (S.autoSel >= 0 ? 25 : 0) + crewLv(S, 'prog') * 8 + 10, connect: pfSec('outreach') * 0.7 + doneSp * 10, design: pfSec('design') * 0.6 + hwSum * 3, innovate: iv / 9 * 50 + hwSum * 3 + 10, motivate: pfSec('team') * 0.6 + S.rep * 0.4 };
    const lvl = STAGES[ev.type].lvl, won = [];
    AWARDS.forEach(([id, name, ic]) => { const best = rnd(36, 62) + lvl * 10 + (id === 'inspire' ? 6 : 0); if (sc[id] > best) won.push({ id, name, ic, score: Math.round(sc[id]) }); });
    return won.slice(0, 2);
  }

  // ---- obiective de sezon ----
  const GOAL_POOL = [
    { id: 'w3', t: 'Câștigă 3 meciuri în sezon', prog: (s) => Math.min(3, s.ss.w) + '/3', done: (s) => s.ss.w >= 3, reward: [500, 3] },
    { id: 'sc40', t: 'Marchează 40+ puncte într-un meci', prog: (s) => Math.min(40, s.ss.best) + '/40', done: (s) => s.ss.best >= 40, reward: [400, 3] },
    { id: 'm3', t: 'Joacă 3 League Meet-uri', prog: (s) => Math.min(3, s.cal.filter((x) => x.type === 'meet' && x.done).length) + '/3', done: (s) => s.cal.filter((x) => x.type === 'meet' && x.done).length >= 3, reward: [600, 4] },
    { id: 'sp2', t: 'Îndeplinește 2 contracte cu sponsori', prog: (s) => Math.min(2, s.ss.sp) + '/2', done: (s) => s.ss.sp >= 2, reward: [700, 4] },
    { id: 'reg5', t: 'Termină în top 5 la regională', prog: (s) => (s.ss.regRank ? 'locul ' + s.ss.regRank : '—'), done: (s) => s.ss.regRank > 0 && s.ss.regRank <= 5, reward: [900, 6] },
    { id: 'pf60', t: 'Adu caietul tehnic la 60%', prog: () => Math.min(60, pfTotal()) + '/60%', done: () => pfTotal() >= 60, reward: [500, 3] },
    { id: 'crew3', t: 'Adu un membru al echipei la nivelul 3', prog: (s) => 'max ' + Math.min(3, Math.max(...s.crew.map((c) => crewXpLv(c.xp)))) + '/3', done: (s) => s.crew.some((c) => crewXpLv(c.xp) >= 3), reward: [500, 3] },
    { id: 'award', t: 'Câștigă un premiu la o competiție mare', prog: (s) => Math.min(1, s.ss.awards) + '/1', done: (s) => s.ss.awards >= 1, reward: [1200, 8] }];
  function checkGoals() {
    (S.goals || []).forEach((g) => {
      if (g.got) return; const d = GOAL_POOL.find((x) => x.id === g.id);
      if (d && d.done(S)) { g.got = true; S.money += d.reward[0]; S.rep += d.reward[1]; log('Obiectiv atins: ' + d.t + ' (+' + eur(d.reward[0]) + ', +' + d.reward[1] + ' reputație).'); notify({ app: null, ic: '🎯', title: 'Obiectiv atins', text: d.t + ' · +' + eur(d.reward[0]) }); }
    });
  }
  function goalsCard() {
    return el('div', { class: 'cr-card' }, el('div', { class: 'cr-eyebrow', text: 'Obiective de sezon' }), el('h2', { text: (S.goals || []).filter((g) => g.got).length + '/' + (S.goals || []).length + ' atinse' }),
      el('div', { class: 'goals' }, (S.goals || []).map((g) => { const d = GOAL_POOL.find((x) => x.id === g.id); return el('div', { class: 'goal' + (g.got ? ' got' : '') }, el('span', { class: 'ck', text: g.got ? '✓' : '○' }), el('div', null, el('b', { text: d.t }), el('small', { text: (g.got ? 'Atins' : d.prog(S)) + ' · +' + eur(d.reward[0]) + ' · +' + d.reward[1] + ' rep.' }))); })));
  }

  // ---- mesaje: provocări la meci amical, sfaturi de la antrenor ----
  function addMsg(m) { S.msgs = S.msgs || []; S.msgs.unshift(Object.assign({ id: Date.now() + '-' + irnd(10, 99), wk: S.week, done: false }, m)); S.msgs = S.msgs.slice(0, 25); notify({ app: 'msgs', ic: m.ic || '💬', title: m.from, text: m.text.slice(0, 80) }); }
  function genMsg() {
    const r = Math.random(), pool = regionPool(S.region).filter((t) => !isMe(t));
    if (r < 0.4 && pool.length && !S.msgs.some((x) => x.kind === 'challenge' && !x.done)) { const t = pick(pool); addMsg({ from: t.name, ic: '🤖', kind: 'challenge', text: 'Salut! Vrem un meci amical înainte de următorul eveniment. Accepți?', team: { name: t.name, num: t.num, skill: clamp(skillFor(t.num, 'meet', false) + rnd(-.05, .05), 0, .95) } }); return; }
    const enr = S.cal.filter((x) => x.type === 'meet' && x.enrolled && !x.done).length, tips = [];
    if (enr < 2 && S.cal.some((x) => x.type === 'meet' && !x.done && S.week < x.week)) tips.push('Ești înscris la prea puține meet-uri. Recomandat 2–5: cele mai bune 10 meciuri te ajută la regională.');
    if (pfTotal() < 40) tips.push('Caietul tehnic e sub 40%. Lucrează la el înainte de regională, contează mult la jurizare.');
    if (S.hw.software < 1) tips.push('Un IMU cu PID ți-ar ușura mult tragerea. Verifică magazinul de piese.');
    if (!S.field && !S.fieldOrder) tips.push('Nu ai teren de antrenament. Comandă-l din magazinul de piese ca să poți testa autonomul și să te antrenezi.');
    if (S.build.some((b) => b.stage === 'stock')) tips.push('Ai piese sosite care așteaptă în atelier. Începe montajul ca să le ai pe robot.');
    if (!(S.autos || []).some((a) => a.pts.length)) tips.push('Nu ai niciun autonom desenat. Chiar și unul simplu aduce puncte de la început.');
    tips.push('Odihnește-te înaintea unui meet: un cablaj verificat valorează cât un upgrade.', 'Notează ce a mers prost după fiecare meci. Juriul adoră asta.');
    addMsg({ from: 'Antrenorul', ic: '🧑‍🏫', kind: 'coach', text: pick(tips) });
  }
  function tMsgs() {
    const list = S.msgs || [];
    return el('div', { class: 'ftc shopw' }, el('div', { class: 'shop-head' }, el('div', null, el('h2', { text: 'Mesaje' }), el('p', { text: 'Provocări la meciuri amicale și sfaturi de la antrenor.' }))),
      el('div', { class: 'msgs' }, list.length ? list.map((m) => el('div', { class: 'msg ' + m.kind }, el('span', { class: 'av', text: m.ic }), el('div', { class: 'bub' }, el('b', { text: m.from + ' · săpt. ' + m.wk }), el('p', { text: m.text }),
        m.kind === 'challenge' && !m.done ? el('div', { class: 'cr-row' }, el('button', { class: 'cr-btn sm pri', disabled: !!S.pending || !!S.event, title: S.event ? 'Termină evenimentul întâi' : '', text: 'Acceptă meciul amical', onclick: () => launch('friendly', m) }), el('button', { class: 'cr-btn sm', text: 'Refuză', onclick: () => { m.done = true; save(); render(); } })) : m.kind === 'challenge' ? el('em', { text: 'Rezolvat' }) : null))) : el('p', { class: 'cr-note', style: 'padding:16px', text: 'Niciun mesaj încă. Apar în fiecare săptămână.' })));
  }
  function tCrew() {
    return el('div', { class: 'ftc shopw' }, el('div', { class: 'shop-head' }, el('div', null, el('h2', { text: 'Echipa mea' }), el('p', { text: 'Fiecare membru crește cu meciurile și antrenamentele și îți îmbunătățește robotul.' })), el('div', { class: 'shop-bud' }, el('small', { text: 'Buget' }), el('b', { text: eur(S.money) }))),
      el('div', { class: 'shop-grid' }, crewCards()));
  }
  // ---- alegerea alianței la playoff: seed-urile mai bune aleg primele, tu alegi când îți vine rândul ----
  const bestOf = (arr) => { arr.sort((a, b) => (b.skill || 0) + rnd(-.06, .06) - (a.skill || 0)); return arr.shift(); };
  function startAlliance(ev, sorted, rank) {
    const avail = sorted.slice(4).map((t) => Object.assign({}, t)), picks = {};
    for (let s = 1; s < rank; s++) picks[s] = bestOf(avail);
    ev.po = { phase: 'pick', mySeed: rank, sorted, avail, picks, al: pick(['red', 'blue']) };
  }
  function finishAlliance(ev, mate) {
    const po = ev.po; po.picks[po.mySeed] = mate; po.avail = po.avail.filter((t) => t.name !== mate.name);
    for (let s = po.mySeed + 1; s <= 4; s++) po.picks[s] = bestOf(po.avail);
    po.pairs = [1, 2, 3, 4].map((s) => ({ cap: po.sorted[s - 1], par: po.picks[s] }));
    const os = 5 - po.mySeed; po.oppSeed = os; po.partner = po.picks[po.mySeed]; po.opp = po.pairs[os - 1].cap; po.oppPartner = po.pairs[os - 1].par; po.phase = 'sf';
    log('Alianță pentru playoff: ' + mate.name + '.'); save(); render();
  }
  function allianceView(ev) {
    const po = ev.po, took = Object.keys(po.picks).map((s) => 'seed ' + s + ' → ' + po.picks[s].name).join(' · ');
    return el('div', { class: 'cr-grid' }, el('div', { class: 'cr-card' }, el('div', { class: 'cr-eyebrow', text: ev.name + ' · alegerea alianței' }), el('h2', { text: 'Ești seed ' + po.mySeed + '. Alege-ți partenerul' }),
      el('p', { class: 'cr-sub', text: 'Primele 4 echipe din calificări își aleg câte un partener pentru playoff. ' + (took ? 'Au ales deja: ' + took + '.' : 'Tu alegi primul.') + ' Un partener mai puternic îți dă șanse mai mari.' }),
      el('div', { class: 'pick-grid' }, po.avail.slice().sort((a, b) => b.rp - a.rp || b.pts - a.pts).map((t, i) => el('button', { class: 'pick-card', onclick: () => finishAlliance(ev, t) }, el('b', { text: t.name }), el('small', { text: '#' + t.num + ' · RP ' + t.rp + ' · ' + t.pts + ' puncte'  }), el('em', { text: 'Nivel: ' + oppLevel(t.skill || 0.5) }))))));
  }
  function judgeBlock(ev) {
    if (!ev.judge) return null; const j = ev.judge;
    return el('div', { class: 'judge' }, el('div', { class: 'cr-eyebrow', text: 'Jurizare' }), j.done ? el('p', { class: 'cr-sub', style: 'margin:0', text: 'Interviu: ' + j.iv + '/9 · caiet tehnic: ' + j.pf + '% · scor jurizare: ' + judgeScore(ev) + '/100.' }) : [
      el('p', { class: 'cr-sub', style: 'margin:0 0 10px', text: 'Juriul te așteaptă la interviu. Caietul tehnic acum: ' + pfTotal() + '%. Fără interviu pierzi punctele de jurizare.' }), el('button', { class: 'cr-btn sm pri', text: 'Mergi la interviul de jurizare', onclick: runInterview })]);
  }

  // ---------- listă derulantă proprie (în loc de <select>, ca să arate la fel în ambele teme) ----------
  function dropdown(opts, cur, cb) {
    let val = String(cur), menu = null, idx = 0;
    const find = () => opts.find((o) => String(o[0]) === val) || opts[0];
    const txt = el('span', { class: 'dd-t', text: find()[1] });
    const btn = el('button', { type: 'button', class: 'cr-in dd-btn', 'aria-haspopup': 'listbox', 'aria-expanded': 'false' }, txt, icon('chevronD', 'dd-ch'));
    const mark = () => { if (menu) [...menu.children].forEach((c, i) => c.classList.toggle('hot', i === idx)); };
    function close() {
      if (!menu) return;
      menu.remove(); menu = null; btn.setAttribute('aria-expanded', 'false'); btn.classList.remove('open');
      document.removeEventListener('mousedown', away, true); document.removeEventListener('keydown', key, true); window.removeEventListener('resize', close); document.removeEventListener('scroll', close, true);
    }
    function away(e) { if (menu && !menu.contains(e.target) && !btn.contains(e.target)) close(); }
    function pick(o) { val = String(o[0]); txt.textContent = o[1]; close(); btn.focus(); cb(o[0], o[1]); }
    function key(e) {
      if (!menu) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); btn.focus(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); idx = (idx + 1) % opts.length; mark(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); idx = (idx - 1 + opts.length) % opts.length; mark(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(opts[idx]); }
    }
    function open() {
      if (menu) return close();
      idx = Math.max(0, opts.findIndex((o) => String(o[0]) === val));
      menu = el('div', { class: 'dd-menu', role: 'listbox' }, opts.map((o) => el('button', { type: 'button', role: 'option', class: 'dd-opt' + (String(o[0]) === val ? ' sel' : ''), 'aria-selected': String(o[0]) === val ? 'true' : 'false', onclick: () => pick(o) },
        el('span', { class: 'dd-l' }, el('b', { text: o[1] }), o[2] ? el('small', { text: o[2] }) : null), String(o[0]) === val ? icon('check', 'dd-ck') : null)));
      document.body.append(menu);
      const r = btn.getBoundingClientRect(), h = menu.offsetHeight, below = innerHeight - r.bottom - 12, up = below < h && r.top > below;
      menu.style.minWidth = r.width + 'px'; menu.style.left = Math.max(8, Math.min(r.left, innerWidth - menu.offsetWidth - 8)) + 'px';
      menu.style.top = (up ? Math.max(8, r.top - h - 6) : r.bottom + 6) + 'px'; menu.style.maxHeight = Math.max(160, up ? r.top - 14 : below) + 'px';
      btn.setAttribute('aria-expanded', 'true'); btn.classList.add('open'); mark();
      const sel = menu.querySelector('.sel'); if (sel) sel.scrollIntoView({ block: 'nearest' });
      document.addEventListener('mousedown', away, true); document.addEventListener('keydown', key, true); window.addEventListener('resize', close); document.addEventListener('scroll', close, true);
    }
    btn.addEventListener('click', (e) => { e.preventDefault(); open(); });
    return btn;
  }

  // ---------- strategie cu partenerul AI + replay-ul ultimului meci ----------
  function planSelect() {
    return dropdown([['bal', 'Echilibrat', 'Implicit: partenerul alege singur când trage'], ['shoot', 'Trage imediat', 'Partenerul trage de cum are o minge'], ['collect', 'Adună, apoi rafală', 'Partenerul ia 4 mingi și trage toate odată']], S.plan || 'bal', (v, t) => { S.plan = v; save(); toast('Strategie: ' + t); });
  }
  const planLabel = () => el('label', { class: 'ap-f', style: 'margin-top:10px' }, el('span', { text: 'Strategie cu partenerul AI' }), planSelect());
  const hasReplay = () => { try { return !!localStorage.getItem('rbCareerReplay'); } catch (e) { return false; } };
  function openReplay() {
    let R = null; try { R = JSON.parse(localStorage.getItem('rbCareerReplay') || 'null'); } catch (e) { }
    if (!R || !R.s || !R.s.length) return toast('Nu există replay pentru ultimul meci.');
    const N = R.s.length, W = 720, k = W / FLD.IN, X = (v) => v * k, cv = el('canvas', { class: 'rp-cv', width: W, height: W }), ctx = cv.getContext('2d');
    let pos = 0, playing = true, speed = 1, last = performance.now();
    const ov = el('div', { class: 'cr-modal keep rp-ov', onclick: (e) => { if (e.target === ov) ov.remove(); } });
    const lab = el('div', { class: 'rp-lab' }), scrub = el('input', { type: 'range', min: 0, max: N - 1, step: 0.01, value: 0, oninput: (e) => { pos = +e.target.value; playing = false; pb.textContent = '▶'; paintR(); } });
    const pb = el('button', { class: 'ap-tool', title: 'Play / pauză', onclick: () => { if (pos >= N - 1) pos = 0; playing = !playing; last = performance.now(); pb.textContent = playing ? '❚❚' : '▶'; } }, '❚❚');
    const spd = [1, 2, 4].map((v) => el('button', { class: 'ap-tool' + (v === 1 ? ' on' : ''), onclick: (e) => { speed = v; spd.forEach((b) => b.classList.remove('on')); e.target.classList.add('on'); } }, v + '×'));
    const lerp = (a, b, f) => a + (b - a) * f;
    function paintR() {
      const i = Math.min(N - 1, Math.floor(pos)), j = Math.min(N - 1, i + 1), f = pos - i, tt = pos * 0.5;
      ctx.clearRect(0, 0, W, W); const bg = ctx.createLinearGradient(0, 0, W, W); bg.addColorStop(0, '#2b3039'); bg.addColorStop(1, '#222630'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, W);
      ctx.strokeStyle = 'rgba(210,214,225,.28)'; ctx.lineWidth = 1.5; for (let g = 1; g < 6; g++) { ctx.beginPath(); ctx.moveTo(X(g * 24), 0); ctx.lineTo(X(g * 24), W); ctx.moveTo(0, X(g * 24)); ctx.lineTo(W, X(g * 24)); ctx.stroke(); }
      [['red', '#ff4d5e'], ['blue', '#3d8bff']].forEach(([al, c]) => { const z = FLD.LZ[al]; ctx.fillStyle = c + '30'; ctx.fillRect(X(z.x), X(z.y), X(z.w), X(z.h)); ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.strokeRect(X(z.x), X(z.y), X(z.w), X(z.h)); });
      const f0 = FLD.FRAME; ctx.strokeStyle = 'rgba(200,200,210,.55)'; ctx.lineWidth = 3; ctx.strokeRect(X(f0.x0), X(f0.y0), X(f0.x1 - f0.x0), X(f0.y1 - f0.y0));
      ['blue', 'red'].forEach((al) => FLD.CELLS[al].forEach((c) => { ctx.fillStyle = (al === 'red' ? '#ff4d5e' : '#3d8bff') + '33'; ctx.strokeStyle = al === 'red' ? '#ff4d5e' : '#3d8bff'; ctx.lineWidth = 3; ctx.fillRect(X(c.x - 8), X(c.y - 10), X(16), X(20)); ctx.strokeRect(X(c.x - 8), X(c.y - 10), X(16), X(20)); }));
      FLD.FLOWERS.forEach(([fx, fy]) => { ctx.fillStyle = '#d9b43c'; ctx.beginPath(); for (let q = 0; q < 6; q++) { const a = Math.PI / 3 * q + Math.PI / 6; ctx[q ? 'lineTo' : 'moveTo'](X(fx) + Math.cos(a) * X(4.1), X(fy) + Math.sin(a) * X(4.1)); } ctx.closePath(); ctx.fill(); });
      const s0 = R.s[i], s1 = R.s[j]; const sz = X(18);
      s0.forEach((r0, n) => {
        const r1 = s1[n], x = lerp(r0[0], r1[0], f), y = lerp(r0[1], r1[1], f); let da = r1[2] - r0[2]; da = Math.atan2(Math.sin(da), Math.cos(da)); const a = r0[2] + da * f, col = R.als && R.als[n] === 'blue' ? '#3d8bff' : '#ff4d5e';
        ctx.save(); ctx.translate(X(x), X(y)); ctx.rotate(a + Math.PI / 2); ctx.fillStyle = col + '55'; ctx.strokeStyle = col; ctx.lineWidth = n === 0 ? 4 : 2.5; ctx.fillRect(-sz / 2, -sz / 2, sz, sz); ctx.strokeRect(-sz / 2, -sz / 2, sz, sz); ctx.fillStyle = col; ctx.fillRect(-sz / 2, -sz / 2, sz, sz * 0.16); ctx.restore();
        ctx.fillStyle = '#fff'; ctx.font = '700 12px "JetBrains Mono",monospace'; ctx.textAlign = 'center'; ctx.fillText(n === 0 ? 'TU' : String((R.names && R.names[n]) || '').slice(0, 10), X(x), X(y) - sz * 0.62);
        if (n === 0) { ctx.strokeStyle = '#fff'; ctx.setLineDash([4, 5]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(x), X(y), sz * 0.78, 0, 6.283); ctx.stroke(); ctx.setLineDash([]); }
      });
      const sc = R.sc[i] || [0, 0], tip = (R.ev || []).find((e) => Math.abs(e[0] - tt) < 1.3);
      if (tip) { ctx.fillStyle = tip[2] === 'blue' ? '#3d8bff' : '#ff4d5e'; ctx.font = '800 34px "Bricolage Grotesque",sans-serif'; ctx.textAlign = 'center'; ctx.fillText('HIVE TIP!', W / 2, 60); }
      const ph = tt < 30 ? 'AUTONOM' : tt < 38 ? 'PAUZĂ' : tt >= 158 - 60 ? 'FLORI DESCHISE' : 'TELEOP';
      lab.replaceChildren(el('b', { class: 'al-red', text: 'ROȘU ' + sc[0] }), el('span', { text: ph + ' · ' + Math.floor(tt / 60) + ':' + String(Math.floor(tt % 60)).padStart(2, '0') }), el('b', { class: 'al-blue', text: sc[1] + ' ALBASTRU' }));
      scrub.value = String(pos);
    }
    function tick(now) { if (!ov.isConnected) return; if (playing) { pos += (now - last) / 500 * speed; last = now; if (pos >= N - 1) { pos = N - 1; playing = false; pb.textContent = '▶'; } paintR(); } else last = now; requestAnimationFrame(tick); }
    ov.append(el('div', { class: 'box rp-box' }, el('div', { class: 'cr-eyebrow', text: 'Replay · ' + (R.label || 'ultimul meci') }), lab, cv, el('div', { class: 'ap-tlrow' }, pb, scrub, ...spd), el('div', { class: 'cr-row', style: 'margin-top:10px' }, el('span', { class: 'cr-note', text: 'Cercul alb punctat ești tu. Culorile: roșu și albastru ca la meci.' }), el('button', { class: 'cr-btn sm', text: 'Închide', onclick: () => ov.remove() }))));
    document.body.append(ov); paintR(); requestAnimationFrame(tick);
  }

  // ---------- hartă, calendar, căutare, teme pe sezon, sunete pe aplicații, statistici ----------
  function sv(tag, attrs, ...kids) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in (attrs || {})) { const v = attrs[k]; if (v == null || v === false) continue; if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v); else e.setAttribute(k, v); }
    kids.flat().forEach((c) => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c))); }); return e;
  }
  const weekDate = (week) => new Date(2026, 9, 3 + (week - 1) * 7);
  const RO_BORDER = [[20.27, 46.13], [20.8, 46.35], [21.45, 46.3], [21.8, 47.0], [22.35, 47.5], [22.9, 47.95], [23.9, 47.97], [24.9, 47.75], [25.9, 47.99], [26.7, 48.25], [27.4, 47.6], [27.7, 47.3], [28.2, 46.65], [28.1, 45.5], [28.7, 45.25], [29.7, 45.2], [29.6, 44.8], [29.0, 44.0], [28.6, 43.75], [27.9, 43.95], [27.0, 44.15], [26.1, 43.95], [25.3, 43.65], [24.4, 43.7], [23.4, 43.85], [22.7, 44.2], [22.5, 44.45], [21.6, 44.75], [21.4, 45.0], [21.1, 45.3], [20.8, 45.75]];
  const CITY = { b1: [44.43, 26.10, 'București'], b2: [44.43, 26.10, 'București'], pl: [44.94, 26.03, 'Ploiești'], md: [46.16, 24.35, 'Mediaș'], br: [45.27, 27.97, 'Brăila'], cj: [46.77, 23.59, 'Cluj-Napoca'], pn: [46.93, 26.37, 'Piatra Neamț'] };
  const mapXY = (lon, lat) => [(lon - 20) * 77, (48.5 - lat) * 111];
  const kmBetween = (a, b) => { const A = CITY[a], B = CITY[b]; if (!A || !B) return 0; const r = (x) => x * Math.PI / 180, dl = r(B[0] - A[0]), dg = r(B[1] - A[1]), h = Math.sin(dl / 2) ** 2 + Math.cos(r(A[0])) * Math.cos(r(B[0])) * Math.sin(dg / 2) ** 2; return Math.round(12742 * Math.asin(Math.sqrt(h))); };
  const travelCost = (from, to) => { const km = kmBetween(from, to); return km < 30 ? 0 : Math.round(40 + km * 0.35); };
  const hKey = (id) => [...id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7);
  function meetHosts(it) {   // every meet is held in a few regions; you can go to any of them (travel costs money)
    const ids = (window.CAREER_REGIONS || []).map((r) => r.id).filter((id) => CITY[id] && CITY[id][2] !== CITY[S.region][2]);
    ids.sort((a, b) => hash(hKey(a) + it.no * 7 + S.season) - hash(hKey(b) + it.no * 7 + S.season));
    return [S.region].concat(ids.slice(0, 2));
  }
  function enrollAt(it, host) {
    if (S.week >= it.week) return toast('Înscrierile la acest meet s-au închis.');
    if (it.enrolled) { S.money += it.paid || 0; it.enrolled = false; it.paid = 0; it.host = null; log('Te-ai retras de la ' + itemName(it) + '.'); }
    else { const c = travelCost(S.region, host); if (S.money < c) return toast('Nu ai destui bani pentru deplasare (' + eur(c) + ').'); S.money -= c; it.paid = c; it.enrolled = true; it.host = host; log('Te-ai înscris la ' + itemName(it) + ' în ' + regionOf(host).name + (c ? ' (deplasare −' + eur(c) + ')' : '') + '.'); }
    save(); render();
  }
  let mapSel = null;
  function tMap() {
    const R = window.CAREER_REGIONS || [], sel = mapSel || S.region, selR = regionOf(sel), pts = RO_BORDER.map(([lo, la]) => mapXY(lo, la).map((v) => v.toFixed(1)).join(',')).join(' ');
    const dots = {}; R.forEach((r) => { const c = CITY[r.id]; (dots[c[2]] = dots[c[2]] || { c, regs: [] }).regs.push(r); });
    const svg = sv('svg', { viewBox: '0 0 780 560', class: 'rmap' }, sv('polygon', { points: pts, class: 'ro' }), sv('text', { x: 14, y: 540, class: 'rcap' }, 'Hartă schematică, nu la scară'),
      Object.values(dots).map((d) => { const [x, y] = mapXY(d.c[1], d.c[0]), isSel = d.regs.some((r) => r.id === sel), mine = d.regs.some((r) => r.id === S.region), nt = d.regs.reduce((a, r) => a + r.teams.length, 0);
        return sv('g', { class: 'city' + (isSel ? ' sel' : '') + (mine ? ' mine' : ''), transform: 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')', onclick: () => { mapSel = d.regs.find((r) => r.id === sel) ? sel : d.regs[0].id; paintPhone(); } },
          sv('circle', { r: isSel ? 15 : 11, class: 'dot' }), sv('text', { y: 4, class: 'n' }, d.regs.length > 1 ? '1·2' : d.regs[0].name[0]), sv('text', { y: -20, class: 'lbl' }, d.c[2]), sv('text', { y: 30, class: 'sub' }, nt ? nt + ' echipe' : 'în curând')); }));
    const meets = S.cal.filter((it) => it.type === 'meet' && !it.done && S.week < it.week && meetHosts(it).includes(sel));
    const cost = travelCost(S.region, sel);
    const info = el('div', { class: 'map-info' }, el('div', { class: 'tp-regs' }, R.map((r) => el('button', { class: 'tp-reg' + (sel === r.id ? ' on' : ''), onclick: () => { mapSel = r.id; paintPhone(); } }, r.name, el('small', { text: CITY[r.id][2] })))),
      el('h3', { text: selR.name + ' · ' + CITY[sel][2] }), el('p', { class: 'cr-note', text: (selR.teams.length ? selR.teams.length + ' echipe înscrise' : 'Lista echipelor nu e publicată') + (sel === S.region ? ' · regiunea ta' : ' · ' + kmBetween(S.region, sel) + ' km de tine · deplasare ' + (cost ? eur(cost) : 'gratis')) }),
      sel === S.region ? el('p', { class: 'map-reg', text: 'Regionala ta: ' + CITY[sel][2] + ', ' + dateOf(S.cal.find((x) => x.id === 'reg').week) }) : el('p', { class: 'map-reg dim', text: 'Regionala acestei regiuni se joacă la ' + CITY[sel][2] + '. La regională concurezi doar în regiunea ta.' }),
      el('div', { class: 'cr-eyebrow', style: 'margin:12px 0 6px', text: 'Meet-uri găzduite aici' }),
      meets.length ? el('div', { class: 'map-meets' }, meets.map((it) => { const on = it.enrolled && (it.host || S.region) === sel, elsewhere = it.enrolled && !on;
        return el('div', { class: 'map-meet' + (on ? ' on' : '') }, dateBlock(it.week), el('div', null, el('b', { text: itemName(it) }), el('small', { text: elsewhere ? 'Înscris în ' + regionOf(it.host || S.region).name : (cost ? 'Deplasare ' + eur(cost) : 'Fără deplasare') })),
          elsewhere ? el('em', { text: 'altă regiune' }) : el('button', { class: 'cr-btn sm' + (on ? '' : ' pri'), text: on ? 'Retrage-te' : 'Înscrie-te aici', onclick: () => enrollAt(it, sel) })); })) : el('p', { class: 'cr-note', text: 'Niciun meet liber aici. Meet-urile deja jucate sau pe care nu le mai poți prinde nu apar.' }));
    return el('div', { class: 'ftc shopw' }, el('div', { class: 'shop-head' }, el('div', null, el('h2', { text: 'Hartă · Sezon #11' }), el('p', { text: 'Regiunile, orașele gazdă și meet-urile din fiecare. Poți merge la un meet în orice regiune.' }))), el('div', { class: 'map-wrap' }, el('div', { class: 'map-box' }, svg), info));
  }

  // ---- calendar pe lună + export .ics ----
  let calM = null;
  const MONTHS = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
  function downloadIcs(items) {
    const pad = (n) => String(n).padStart(2, '0'), ds = (d) => d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()), stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//roLERbot//Cariera//RO', 'CALSCALE:GREGORIAN'];
    items.forEach((it) => { const d = weekDate(it.week), e = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1); lines.push('BEGIN:VEVENT', 'UID:' + it.id + '-s' + S.season + '@rolerbot', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + ds(d), 'DTEND;VALUE=DATE:' + ds(e), 'SUMMARY:' + itemName(it) + ' (carieră roLERbot)', 'DESCRIPTION:Eveniment simulat din cariera roLERbot · ' + regionOf(it.host || S.region).name, 'END:VEVENT'); });
    lines.push('END:VCALENDAR'); const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' }), a = el('a', { href: URL.createObjectURL(blob), download: items.length === 1 ? 'rolerbot-' + items[0].id + '.ics' : 'rolerbot-evenimente.ics' });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); toast('Fișier de calendar descărcat (' + items.length + (items.length === 1 ? ' eveniment' : ' evenimente') + ').');
  }
  function tCalendar() {
    const cur = weekDate(S.week), curM = (cur.getFullYear() - 2026) * 12 + cur.getMonth() - 9; if (calM == null) calM = curM; calM = clamp(calM, 0, 8);
    const y = 2026 + Math.floor((9 + calM) / 12), mo = (9 + calM) % 12, first = new Date(y, mo, 1), pad0 = (first.getDay() + 6) % 7, days = new Date(y, mo + 1, 0).getDate();
    const byDay = {}; S.cal.forEach((it) => { const d = weekDate(it.week); if (d.getFullYear() === y && d.getMonth() === mo) (byDay[d.getDate()] = byDay[d.getDate()] || []).push(it); });
    const short = (it) => (it.type === 'meet' ? 'Meet ' + it.no : it.type === 'reg' ? 'Regională' : it.type === 'nat' ? 'Național' : 'Mondiale'), cls = (it) => (it.done ? 'done' : it.off ? 'off' : it.type === 'meet' ? (it.enrolled ? 'on' : 'free') : 'main');
    const cells = []; for (let i = 0; i < pad0; i++) cells.push(el('div', { class: 'cd empty' })); for (let d = 1; d <= days; d++) { const isToday = cur.getFullYear() === y && cur.getMonth() === mo && cur.getDate() === d;
      cells.push(el('div', { class: 'cd' + (isToday ? ' today' : '') }, el('span', { text: d }), (byDay[d] || []).map((it) => el('b', { class: 'ev ' + cls(it), title: itemName(it), text: short(it) })))); }
    const month = S.cal.filter((it) => { const d = weekDate(it.week); return d.getFullYear() === y && d.getMonth() === mo; }), mine = S.cal.filter((it) => !it.done && !it.off && (it.type !== 'meet' || it.enrolled));
    return el('div', { class: 'ftc shopw' }, el('div', { class: 'shop-head' }, el('div', null, el('h2', { text: 'Calendar' }), el('p', { text: 'Datele sezonului din carieră. Evenimentele se țin sâmbăta.' })), el('button', { class: 'cr-btn sm', disabled: !mine.length, text: 'Adaugă toate în calendarul meu', onclick: () => downloadIcs(mine) })),
      el('div', { class: 'cal-nav' }, el('button', { class: 'cr-btn sm', disabled: calM <= 0, text: '‹', onclick: () => { calM--; paintPhone(); } }), el('b', { text: MONTHS[mo] + ' ' + y }), el('button', { class: 'cr-btn sm', disabled: calM >= 8, text: '›', onclick: () => { calM++; paintPhone(); } })),
      el('div', { class: 'cgrid' }, ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'].map((d) => el('div', { class: 'ch', text: d })), cells),
      el('div', { class: 'cal-list' }, month.length ? month.map((it) => el('div', { class: 'cl-row' }, dateBlock(it.week), el('div', null, el('b', { text: itemName(it) }), el('small', { text: dateOf(it.week) + ' · ' + regionOf(it.host || S.region).name + ' · ' + (it.done ? 'jucat' : it.off ? 'prin calificare' : it.type === 'meet' ? (it.enrolled ? 'înscris' : 'liber') : 'obligatoriu') })),
        el('button', { class: 'cr-btn sm', text: 'Adaugă în calendar', onclick: () => downloadIcs([it]) }))) : el('p', { class: 'cr-note', style: 'padding:12px 16px', text: 'Niciun eveniment în luna asta.' })));
  }

  // ---- căutare globală: echipe, sponsori, evenimente, aplicații ----
  function searchHits(q) {
    q = q.trim().toLowerCase(); if (q.length < 2) return []; const out = [], has = (s) => String(s).toLowerCase().includes(q);
    TAPPS.forEach((a) => { if (has(a.name)) out.push({ app: a.id, t: a.name, sub: 'Aplicație', go: () => setApp(a.id) }); });
    S.cal.forEach((it) => { if (has(itemName(it)) || has(dateOf(it.week))) out.push({ app: 'calendar', t: itemName(it), sub: dateOf(it.week) + ' · săpt. ' + it.week, go: () => setApp('calendar') }); });
    BRANDS.forEach(([name]) => { if (has(name)) out.push({ app: 'sponsors', t: name, sub: 'Sponsor', go: () => setApp('sponsors') }); });
    (window.CAREER_REGIONS || []).forEach((r) => { if (has(r.name)) out.push({ app: 'map', t: r.name, sub: 'Regiune · ' + CITY[r.id][2], go: () => { mapSel = r.id; setApp('map'); } }); r.teams.forEach(([n, num]) => { if (has(n) || String(num).includes(q)) out.push({ app: 'teams', t: n, sub: '#' + num + ' · ' + r.name, go: () => { tabletTeamReg = r.id; tabletTeamQ = n; setApp('teams'); } }); }); });
    return out.slice(0, 14);
  }
  function searchBox() {
    const res = el('div', { class: 'srch-res' }), inp = el('input', { class: 'cr-in srch', placeholder: 'Caută echipă, sponsor, eveniment, aplicație…' });
    inp.addEventListener('input', () => { const hits = searchHits(inp.value); res.replaceChildren(...(inp.value.trim().length < 2 ? [] : hits.length ? hits.map((h) => el('button', { class: 'srch-hit', onclick: h.go }, appTile(h.app || 'search', 'sm'), el('div', null, el('b', { text: h.t }), el('small', { text: h.sub })))) : [el('p', { class: 'cr-note', text: 'Niciun rezultat.' })])); });
    return el('div', { class: 'srch-box' }, inp, res);
  }

  // ---- teme de culoare pe sezon + sunet la deschiderea aplicațiilor ----
  const SEASON_THEMES = [['#f9056c', '#ff3d8f'], ['#3d8bff', '#6aa5ff'], ['#19b6a4', '#4fd1c5'], ['#ffc933', '#ffd966'], ['#9a6bff', '#b592ff']];
  const SEASON_THEME_NAMES = ['roz', 'albastru', 'turcoaz', 'auriu', 'violet'];
  function applySeasonTheme() { if (!S) return; const r = document.documentElement; r.style.removeProperty('--pink'); r.style.removeProperty('--pink-hi'); r.dataset.season = String(((S.season - 1) % SEASON_THEMES.length) + 1); }
  const BLIP = { ftc: 660, meets: 520, teams: 440, sponsors: 760, shop: 600, portfolio: 360, crew: 480, msgs: 880, map: 560, calendar: 700, stats: 420 };
  function blip(id) {
    if (isMuted()) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; const a = buzz.ctx || (buzz.ctx = new AC()); if (a.state === 'suspended') a.resume();
      const o = a.createOscillator(), g = a.createGain(), t = a.currentTime, f = BLIP[id] || 500; o.type = 'triangle'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.09);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 0.16);
    } catch (e) { }
  }
  function setApp(id) { tabletApp = id; if (id) blip(id); paintPhone(); }

  // ---- statistici: grafice pe sezon, comparație cu media regiunii ----
  function statsView() {
    const H = S.history.slice().reverse().filter((h) => h.avg != null), M = S.mlog || [], st = S.stats, played = st.w + st.t + st.l;
    const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0), myAvg = avg(H.map((h) => h.myAvg)), regAvg = avg(H.map((h) => h.avg)), best = M.length ? Math.max(...M.map((m) => m.my)) : 0;
    const tile = (k, v, sub) => el('div', { class: 'stile' }, el('small', { text: k }), el('b', { text: v }), sub ? el('em', { class: sub[0], text: sub[1] }) : null);
    const diff = myAvg - regAvg, tiles = el('div', { class: 'stiles' }, tile('Meciuri', played), tile('Victorii', played ? Math.round(st.w / played * 100) + '%' : '—'), tile('Scor mediu / meci', myAvg ? myAvg.toFixed(1).replace('.', ',') : '—', H.length ? [diff >= 0 ? 'up' : 'down', (diff >= 0 ? '▲ ' : '▼ ') + Math.abs(diff).toFixed(1).replace('.', ',') + ' vs regiune'] : null),
      tile('Cel mai bun scor', best || '—'), tile('Titluri', st.titles), tile('Premii', (S.awards || []).length));
    const lab = (h) => { const m = /Meet #(\d)/.exec(h.name); return m ? 'M' + m[1] : /regional/i.test(h.name) ? 'REG' : /naționa/i.test(h.name) ? 'NAT' : 'MOND'; };
    const Wc = 560, Hc = 200, pad = { l: 34, r: 10, t: 14, b: 26 }, iw = Wc - pad.l - pad.r, ih = Hc - pad.t - pad.b;
    function bars() {
      const d = H.slice(-8), mx = Math.max(10, ...d.map((h) => Math.max(h.myAvg, h.avg))) * 1.1, gw = iw / Math.max(d.length, 1);
      return sv('svg', { viewBox: '0 0 ' + Wc + ' ' + Hc, class: 'schart' }, [0, .5, 1].map((f) => [sv('line', { x1: pad.l, x2: Wc - pad.r, y1: pad.t + ih * (1 - f), y2: pad.t + ih * (1 - f), class: 'gl' }), sv('text', { x: pad.l - 6, y: pad.t + ih * (1 - f) + 4, class: 'ax', 'text-anchor': 'end' }, Math.round(mx * f))]),
        d.map((h, i) => { const x = pad.l + gw * i + gw * .15, bw = gw * .3; return [sv('rect', { x, y: pad.t + ih * (1 - h.myAvg / mx), width: bw, height: ih * h.myAvg / mx, style: 'fill:var(--pink)', rx: 3 }), sv('rect', { x: x + bw + 3, y: pad.t + ih * (1 - h.avg / mx), width: bw, height: ih * h.avg / mx, class: 'reg', rx: 3 }), sv('text', { x: pad.l + gw * i + gw / 2, y: Hc - 8, class: 'ax', 'text-anchor': 'middle' }, lab(h))]; }));
    }
    function ranks() {
      const d = H.slice(-8), mx = Math.max(6, ...d.map((h) => h.rank)), gw = iw / Math.max(d.length - 1, 1), py = (r) => pad.t + ih * ((r - 1) / (mx - 1)), pts = d.map((h, i) => [pad.l + (d.length > 1 ? gw * i : iw / 2), py(h.rank)]);
      return sv('svg', { viewBox: '0 0 ' + Wc + ' ' + Hc, class: 'schart' }, [1, Math.ceil(mx / 2), mx].map((r) => [sv('line', { x1: pad.l, x2: Wc - pad.r, y1: py(r), y2: py(r), class: 'gl' }), sv('text', { x: pad.l - 6, y: py(r) + 4, class: 'ax', 'text-anchor': 'end' }, '#' + r)]),
        sv('polyline', { points: pts.map((p) => p.join(',')).join(' '), class: 'ln' }), pts.map((p, i) => [sv('circle', { cx: p[0], cy: p[1], r: 5, style: 'fill:var(--pink)' }), sv('text', { x: p[0], y: Hc - 8, class: 'ax', 'text-anchor': 'middle' }, lab(d[i]))]));
    }
    function trend() {
      const d = M.slice(-40), mx = Math.max(20, ...d.map((m) => m.my)) * 1.1, step = iw / Math.max(d.length - 1, 1), py = (v) => pad.t + ih * (1 - v / mx), ma = d.map((_, i) => { const w = d.slice(Math.max(0, i - 4), i + 1); return avg(w.map((m) => m.my)); });
      return sv('svg', { viewBox: '0 0 ' + Wc + ' ' + Hc, class: 'schart' }, [0, .5, 1].map((f) => [sv('line', { x1: pad.l, x2: Wc - pad.r, y1: pad.t + ih * (1 - f), y2: pad.t + ih * (1 - f), class: 'gl' }), sv('text', { x: pad.l - 6, y: pad.t + ih * (1 - f) + 4, class: 'ax', 'text-anchor': 'end' }, Math.round(mx * f))]),
        d.map((m, i) => sv('circle', { cx: pad.l + step * i, cy: py(m.my), r: 3.2, class: m.w === 1 ? 'win' : m.w === .5 ? 'tie' : 'loss' })), sv('polyline', { points: ma.map((v, i) => (pad.l + step * i) + ',' + py(v)).join(' '), class: 'ln' }));
    }
    const card = (title, sub, chart, legend) => el('div', { class: 'schart-card' }, el('b', { text: title }), el('small', { text: sub }), chart, legend ? el('div', { class: 'slegend' }, legend) : null);
    return el('div', { class: 'stats' }, tiles,
      H.length ? [card('Scor mediu pe eveniment', 'Tu față de media celorlalte echipe din eveniment', bars(), [el('span', null, el('i', { style: 'background:var(--pink)' }), 'Tu'), el('span', null, el('i', { class: 'regc' }), 'Media regiunii')]),
        card('Locul la evenimente', 'Mai sus = mai bine (#1 e primul)', ranks())] : el('p', { class: 'cr-note', text: 'Joacă un eveniment ca să apară graficele pe eveniment.' }),
      M.length ? card('Scorul pe meciuri', 'Ultimele ' + Math.min(40, M.length) + ' meciuri: verde victorie, roșu înfrângere, linia = media pe 5 meciuri', trend()) : null,
      S.awards && S.awards.length ? el('div', { class: 'schart-card' }, el('b', { text: 'Premii' }), el('div', { class: 'awd' }, S.awards.map((a) => el('span', { text: '' + a.award + ' · sezon ' + a.season })))) : null);
  }
  function tStats() { return el('div', { class: 'ftc shopw' }, el('div', { class: 'shop-head' }, el('div', null, el('h2', { text: 'Statistici' }), el('p', { text: 'Rezultatele tale pe sezon și comparația cu regiunea.' }))), el('div', { style: 'padding:16px' }, statsView())); }

  // ---------- popups ----------
  function showMatchResult() {
    const lm = S.lastMatch; if (!lm) return; S.lastMatch = null; save();
    const box = el('div', null, el('div', { class: 'cr-eyebrow', text: lm.kind === 'qual' ? 'Meci de calificare' : lm.kind === 'playoff' ? 'Playoff' : 'Antrenament' }),
      el('h2', { text: lm.win ? 'Victorie!' : lm.tie ? 'Egalitate' : 'Înfrângere' }),
      el('div', { class: 'vs' }, el('div', { class: 'side' }, el('b', { text: lm.my }), el('small', { text: S.team.name })), el('div', { class: 'mid', text: '–' }), el('div', { class: 'side r' }, el('b', { text: lm.op }), el('small', { text: lm.opp || 'Adversar' }))),
      lm.kind === 'qual' ? el('p', { class: 'cr-sub', text: 'Alianță cu ' + lm.partner + '. +' + lm.rp + ' puncte de clasament' + (lm.tags.length ? ' (' + lm.tags.join(', ') + ')' : '') + '.' + (lm.po === 'start' ? ' Calificările s-au încheiat: intri în playoff!' : '') }) : lm.kind === 'playoff' ? el('p', { class: 'cr-sub', text: lm.eventDone ? (lm.win ? 'Ai câștigat finala!' : 'Playoff încheiat.') : 'Treci în finală!' }) : el('p', { class: 'cr-sub', text: '+' + eur(lm.money) + ' din antrenament.' }),
      lm.sponsors.length ? el('p', { class: 'cr-sub', style: 'color:var(--ok)', text: 'Contract îndeplinit: ' + lm.sponsors.join(', ') + '!' }) : null,
      el('div', { class: 'cr-row' }, el('button', { class: 'cr-btn pri', text: 'Continuă', onclick: () => { mm.close(); render(); } }), lm.replay ? el('button', { class: 'cr-btn', text: 'Vezi replay-ul', onclick: openReplay }) : null));
    const mm = modal(box);
  }
  function showSummary() {
    const sm = S.summary; if (!sm) return;
    const box = el('div', null, el('div', { class: 'cr-eyebrow', text: sm.name }), el('h2', { text: sm.rank === 1 ? 'Ai câștigat evenimentul!' : 'Ai terminat pe locul ' + sm.rank }),
      el('p', { class: 'cr-sub', text: '+' + eur(sm.prize) + ' premiu și +' + sm.rep + ' reputație.' + (sm.sponsors.length ? ' Contracte îndeplinite: ' + sm.sponsors.join(', ') + '.' : '') }),
      sm.awards && sm.awards.length ? el('p', { class: 'cr-sub', style: 'color:var(--gold)', text: 'Premii câștigate: ' + sm.awards.map((a) => a.name).join(' · ') + '.' }) : null,
      sm.board ? el('p', { class: 'cr-sub', text: 'Top 10 meciuri în regiune: locul ' + sm.board.rank + ' din ' + sm.board.of + ' (' + sm.board.sum + ' puncte).' }) : null,
      sm.qualified ? el('p', { class: 'cr-sub', style: 'color:var(--ok)', text: 'Te-ai calificat la: ' + sm.qualified + '!' }) : sm.needQual ? el('p', { class: 'cr-sub', style: 'color:#ff8a96', text: 'Nu te-ai calificat mai departe (trebuia un loc în top ' + sm.needQual + '). Sezonul se termină aici.' }) : null,
      el('p', { class: 'cr-note', text: 'Clasamentul de după calificări:' }), standings(sm.sorted),
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
  let edGhost = false, edSlot = 0, edSel = -1, edPlay = null, edCv = null, edMode = 'add', edSnap = false, edUndo = [], edRedo = [], edLast = '', edKeysBound = false, edHover = null, edPick = false;
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
    if (edGhost && S.autoSel >= 0 && S.autoSel !== edSlot && S.autos[S.autoSel] && S.autos[S.autoSel].pts.length) {   // the route used in matches, faint, for comparison
      const gp = S.autos[S.autoSel].pts; ctx.save(); ctx.strokeStyle = 'rgba(154,107,255,.8)'; ctx.setLineDash([7, 6]); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X(FLD.START.x), X(FLD.START.y)); gp.forEach((q) => ctx.lineTo(X(q.x), X(q.y))); ctx.stroke(); ctx.setLineDash([]);
      gp.forEach((q) => { ctx.fillStyle = 'rgba(154,107,255,.9)'; ctx.beginPath(); ctx.arc(X(q.x), X(q.y), X(1.9), 0, 6.283); ctx.fill(); }); ctx.restore();
    }
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
  function autoCode() { const A = S.autos[edSlot]; return 'RBA1:' + btoa(unescape(encodeURIComponent(JSON.stringify({ n: A.name, p: A.pts })))); }
  async function shareAuto() {
    if (!curPts().length) return toast('Traseul e gol.'); const code = autoCode();
    try { await navigator.clipboard.writeText(code); toast('Cod copiat. Trimite-l prietenilor.'); } catch (e) { prompt('Copiază codul traseului:', code); }
  }
  function importAuto() {
    const c = prompt('Lipește codul traseului:'); if (!c) return;
    try {
      const j = JSON.parse(decodeURIComponent(escape(atob(c.trim().replace(/^RBA1:/, ''))))); if (!Array.isArray(j.p)) throw new Error('format');
      const num = (v, d) => (Number.isFinite(+v) ? +v : d), pts = j.p.slice(0, 14).map((q) => ({ x: clamp(num(q.x, 72), FLD.R, FLD.IN - FLD.R), y: clamp(num(q.y, 72), FLD.R, FLD.IN - FLD.R), h: ['auto', 'cell', 'flower'].includes(q.h) ? q.h : (Number.isFinite(+q.h) ? ((Math.round(+q.h) % 360) + 360) % 360 : 'auto'),
        act: (Array.isArray(q.act) ? q.act : []).filter((a) => a && ACT_LABEL[a.t]).slice(0, 6).map((a) => ({ t: a.t, n: clamp(Math.round(num(a.n, 1)), 1, 4), s: clamp(num(a.s, 1), 0.5, 8) })) }));
      if (!pts.length) throw new Error('empty');
      S.autos[edSlot] = { name: String(j.n || 'Importat').slice(0, 28), pts }; edSel = -1; stopPlay(); histReset(); save(); render(); toast('Traseu importat în Auto ' + (edSlot + 1) + '.');
    } catch (e) { toast('Cod invalid.'); }
  }
  function autoSelect() {
    return dropdown([[-1, 'Manual (conduc eu)', 'Fără autonom: conduci de la început']].concat(S.autos.map((a, i) => [i, a.name, a.pts.length ? a.pts.length + ' puncte' : 'Gol, încă nu ai desenat traseul'])), S.autoSel, (v) => { S.autoSel = +v; save(); toast(S.autoSel < 0 ? 'Autonom oprit: conduci tu de la început.' : 'La meci folosești: ' + S.autos[S.autoSel].name); });
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
          dropdown([['auto', 'Pe direcția de mers'], ['cell', 'Spre celula stupului', 'Pentru tras'], ['flower', 'Spre cea mai apropiată floare', 'Pentru a lua mingi'], ['fix', 'Unghi fix']], hmode, set((v) => { p.h = v === 'fix' ? 0 : v; }))),
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
      chk.length ? el('div', { class: 'ap-checks' }, el('b', { text: 'De rezolvat' }), chk.slice(0, 5).map((c) => el('p', { onclick: () => { if (c.i >= 0) { edSel = c.i; refreshAll(); } }, text: c.msg }))) : (A.pts.length ? el('p', { class: 'cr-note', style: 'color:var(--ok)', text: 'Nicio problemă găsită în traseu.' }) : null),
      step(3, 'Testează', 'Vezi cum merge înainte să-l folosești într-un meci.'),
      el('div', { class: 'ap-stats' }, el('div', null, el('small', { text: 'Durată estimată' }), el('b', { class: over ? 'bad' : '', text: tl.total.toFixed(1).replace('.', ',') + ' s din 30 s' })),
        el('div', null, el('small', { text: 'Precizie (după electronică)' }), el('b', { text: '±' + Math.round(tl.err) + ' in' }))),
      tl.bad ? el('p', { class: 'cr-note', style: 'color:var(--gold)', text: tl.bad + ' segment' + (tl.bad > 1 ? 'e trec' : ' trece') + ' prin stup (linie roșie). Robotul le ocolește singur, dar pierde timp.' }) : null,
      over ? el('p', { class: 'cr-note', style: 'color:#ff8a96', text: 'Traseul durează mai mult de 30 s: ultimele puncte nu se vor executa.' }) : null,
      el('div', { class: 'cr-row', style: 'margin:10px 0 6px' }, el('button', { class: 'cr-btn pri big', disabled: !A.pts.length || !S.field, text: S.field ? 'Testează pe terenul 3D' : 'Testul cere teren de antrenament', onclick: testAuto3d })),
      !S.field ? el('div', { class: 'fld ' + (S.fieldOrder ? 'wait' : 'no') }, tile('field', null, 'fi'), el('div', null, el('b', { text: S.fieldOrder ? 'Terenul ajunge în săpt. ' + S.fieldOrder.ready : 'Nu ai teren de antrenament' }), el('small', { text: 'Poți desena traseul și îl vezi în previzualizare, dar ca să-l testezi pe terenul 3D trebuie să-ți vină terenul.' })), !S.fieldOrder ? el('button', { class: 'cr-btn sm pri', text: 'Comandă terenul', onclick: () => openPhone('shop') }) : null) : null,
      el('div', { class: 'cr-row', style: 'gap:14px' },
        el('div', { class: 'ap-seg' }, ['red', 'blue'].map((al) => el('button', { class: atAl === al ? 'on ' + al : al, onclick: () => { S.atAl = al; save(); renderAutoPanel(); } }, al === 'red' ? 'Alianța roșie' : 'Alianța albastră'))),
        el('label', { class: 'ap-switch', style: 'margin:0' }, el('input', { type: 'checkbox', checked: !!S.atOpp, onchange: (e) => { S.atOpp = e.target.checked; save(); } }), el('span', { text: 'Cu adversar AI' }))),
      el('p', { class: 'cr-note', style: 'margin-top:6px', text: 'Testul se joacă pe terenul 3D, fără meci: vezi robotul urmând traseul, apoi primești puncte, timp și eroarea de poziție.' })
    ].filter(Boolean));
  }
  function testAuto3d() {
    if (!S.field) return toast('Ai nevoie de teren de antrenament ca să testezi autonomul.');
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
      el('label', { class: 'ap-switch', style: 'margin:0', title: 'Arată traseul activ la meciuri, estompat' }, el('input', { type: 'checkbox', checked: edGhost, onchange: (e) => { edGhost = e.target.checked; drawEditor(); } }), el('span', { text: 'Fantomă' })),
      el('span', { style: 'flex:1' }),
      el('button', { class: 'ap-tool', title: 'Anulează (Ctrl+Z)', onclick: undoEd }, '↶'), el('button', { class: 'ap-tool', title: 'Refă (Ctrl+Y)', onclick: redoEd }, '↷'),
      el('button', { class: 'ap-tool', title: 'Șterge punctul selectat (Delete)', onclick: () => { const pts = curPts(); if (edSel < 0 || !pts[edSel]) return toast('Selectează întâi un punct.'); pts.splice(edSel, 1); edSel = Math.min(edSel, pts.length - 1); stopPlay(); commit(); refreshAll(); } }, '🗑'),
      el('button', { class: 'ap-tool', title: 'Copiază codul traseului (îl poți trimite altcuiva)', onclick: shareAuto }, '🔗'), el('button', { class: 'ap-tool', title: 'Lipește un cod de traseu', onclick: importAuto }, '📥'));
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
  let renderedTab = null, booted = false, lastMoney = null;
  function tweenMoney(node, from, to) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    node.classList.add(to > from ? 'flash-up' : 'flash-down');
    const t0 = performance.now(), dur = 700;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); if (!node.isConnected) return; node.textContent = eur(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(step); else node.textContent = eur(to); };
    requestAnimationFrame(step);
  }
  // lumina de pe panouri urmărește cursorul (un singur listener, throttled pe cadru)
  { let raf = 0; document.addEventListener('pointermove', (e) => { if (raf || !e.target.closest) return; const c = e.target.closest('.cr-card'); if (!c) return; raf = requestAnimationFrame(() => { raf = 0; const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); }, { passive: true }); }
  function render() {
    document.querySelectorAll('.cr-modal:not(.keep), .prof-pop').forEach((m) => m.remove());
    app.replaceChildren();
    if (!S || !S.region) { ['phone', 'phoneBd'].forEach((i) => { const n = document.getElementById(i); if (n) n.remove(); }); }
    if (!S) { app.append(welcome()); return; }
    if (!S.region) { app.append(pickView()); return; }
    ensureAutos(); applyTheme(); applySeasonTheme();
    const views = { hub: hubView, robot: robotView, auto: autoView, team: teamView, sponsors: sponsorsView, event: eventView, history: historyView };
    if (!views[tab]) tab = 'hub';
    const shell = el('div', { class: 'cr-shell' }, sidebar(), el('div', { class: 'cr-body' }, topbar(), el('main', { class: 'cr-main' }, pendingBanner(), views[tab]())));
    app.append(shell);
    if (!booted) { booted = true; shell.classList.add('boot'); setTimeout(() => shell.classList.remove('boot'), 1400); }
    const mb = shell.querySelector('.tb-stat b.ok');
    if (mb) { if (lastMoney !== null && lastMoney !== S.money) tweenMoney(mb, lastMoney, S.money); lastMoney = S.money; }
    if (renderedTab !== tab) { renderedTab = tab; const mn = app.querySelector('.cr-main'); if (mn) { mn.classList.add('enter'); setTimeout(() => mn.classList.remove('enter'), 1300); } }
    if (S.lastMatch) showMatchResult(); else if (S.summary) showSummary(); else if (S.card != null) showCard();
    ensurePhone(); if (S.alertNew) { S.alertNew = false; alertPhone(); } else paintPhone();
  }

  // ---------- boot: pick up a finished match from the game ----------
  applyTheme();
  S = load(); migrate();
  { const q = location.search.match(/[?&]tab=(\w+)/); if (q && ['hub', 'robot', 'auto', 'team', 'sponsors', 'event', 'history'].includes(q[1])) tab = q[1]; }
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
