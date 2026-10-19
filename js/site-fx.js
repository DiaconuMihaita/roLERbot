/* roLERbot · site: animații legate de scroll. Fără dependențe. Folosește proprietățile `translate`/`scale`/`rotate` (nu `transform`),
   ca să nu intre în conflict cu reveal-urile și efectele de înclinare din modern.js. O singură buclă rAF, doar pentru elementele din ecran. */
(() => {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const small = () => innerWidth < 700;
  const items = [];
  const add = (el, fn) => { if (el) items.push({ el, fn }); };
  // p: 0 când elementul intră pe jos, 1 când iese pe sus
  const prog = (r) => clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);

  const hero = document.querySelector('.hero');
  const heroTitle = document.querySelector('.hero-title');

  // titluri mari: alunecă lateral, în sensuri alternante
  $$('.h-lg').forEach((h, i) => add(h, (p) => { h.style.translate = ((p - 0.5) * 2 * (small() ? 1 : 2.4) * (i % 2 ? -1 : 1)).toFixed(2) + 'vw 0'; }));
  add(document.querySelector('.tl-end a'), (p, el) => { el.style.translate = ((p - 0.5) * 2 * 2).toFixed(2) + 'vw 0'; });

  // echipa: poza urcă și se înclină ușor, insigna se rotește
  $$('.team-photo').forEach((el) => add(el, (p) => { el.style.translate = `0 ${((0.5 - p) * 90).toFixed(1)}px`; el.style.rotate = ((p - 0.5) * -3).toFixed(2) + 'deg'; }));
  $$('.team-badge-wrap').forEach((el) => add(el, (p) => { el.style.rotate = (p * 240).toFixed(1) + 'deg'; }));
  // statistici: fiecare coloană urcă cu altă viteză
  $$('.stat-n').forEach((el, i) => add(el, (p) => { el.style.translate = `0 ${((0.5 - p) * (10 + i * 8)).toFixed(1)}px`; }));
  // sponsori: coloanele se mișcă diferit
  $$('.sponsor img').forEach((el, i) => add(el.parentElement, (p) => { el.style.translate = `0 ${((0.5 - p) * (i % 2 ? 22 : 12)).toFixed(1)}px`; }));
  // timeline: pozele se mișcă în ramă
  $$('.tl-img img').forEach((el) => add(el.parentElement, (p) => { el.style.translate = `0 ${((0.5 - p) * 44).toFixed(1)}px`; }));
  $$('.tl-year').forEach((el) => add(el, (p) => { el.style.opacity = (0.55 + Math.sin(p * Math.PI) * 0.45).toFixed(2); }));
  // subsol: litera mare urcă din jos
  $$('.footer-mark').forEach((el) => add(el, (p) => { el.style.translate = `0 ${((1 - p) * 46).toFixed(1)}%`; }));
  // text care se umple pe măsură ce derulezi
  $$('.team-copy p:first-child, .sec-head .sub').forEach((el) => { el.classList.add('scrub'); add(el, (p, e, r) => { e.style.setProperty('--sp', clamp((innerHeight * 0.88 - r.top) / (r.height + innerHeight * 0.3), 0, 1).toFixed(3)); }); });

  // blogul de pe prima pagină: cardurile se derulează orizontal pe măsură ce treci prin secțiune
  const box = document.querySelector('#team [data-rail]');
  let touched = 0;
  if (box && fine) {
    box.classList.add('is-driven');
    ['pointerdown', 'wheel', 'keydown'].forEach((ev) => box.addEventListener(ev, () => { touched = performance.now(); }, { passive: true }));
    let cur = 0;
    add(box.parentElement.parentElement, (p) => {
      if (performance.now() - touched < 2500) { cur = box.scrollLeft; return; }
      const max = box.scrollWidth - box.clientWidth, t = clamp((p - 0.3) / 0.4, 0, 1) * max;
      cur = t; box.scrollLeft = cur;
    });
  }

  // eroul rămâne pe loc și se întunecă pe măsură ce secțiunile îl acoperă
  const heroPass = () => {
    if (!hero) return;
    const y = clamp(scrollY / innerHeight, 0, 1);
    hero.style.setProperty('--cover', (y * 0.8).toFixed(3));
    if (heroTitle) heroTitle.style.scale = (1 - y * 0.1).toFixed(3);
  };

  // banda înclinată merge mai repede când derulezi
  const track = document.querySelector('.marquee-track');
  let last = scrollY, vel = 0, anim = null;

  let ticking = false;
  const run = () => {
    ticking = false;
    heroPass();
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      if (r.bottom < -300 || r.top > innerHeight + 300) continue;
      it.fn(prog(r), it.el, r);
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  run();

  if (track && track.getAnimations) {
    const tick = () => {
      anim = anim || track.getAnimations()[0];
      const y = scrollY; vel = vel * 0.9 + (y - last) * 0.1; last = y;
      if (anim) anim.playbackRate = 1 + Math.min(Math.abs(vel) * 0.9, 7) * (vel < 0 ? -1 : 1);
      if (!document.hidden) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(tick); });
  }
})();
