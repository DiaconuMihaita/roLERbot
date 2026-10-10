/* roLERbot — modern interactions. Vanilla, no dependencies. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- split text into letters ---------- */
  $$('[data-split]').forEach((el) => {
    const text = el.textContent.trim();
    const pinkFrom = el.dataset.pinkFrom ? parseInt(el.dataset.pinkFrom, 10) : -1;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    el.classList.add('js-split');
    [...text].forEach((c, i) => {
      const w = document.createElement('span');
      w.className = 'ch' + (pinkFrom >= 0 && i >= pinkFrom ? ' is-pink' : '');
      w.setAttribute('aria-hidden', 'true');
      w.style.setProperty('--i', i);
      const inner = document.createElement('i');
      inner.textContent = c;
      w.appendChild(inner);
      el.appendChild(w);
    });
  });

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$('[data-reveal], .js-split, .footer-mark');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }
  // timeline items + team photo
  const tlIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); tlIO.unobserve(e.target); } });
  }, { threshold: 0.25 });
  $$('.tl-item, .team-photo').forEach((el) => tlIO.observe(el));

  /* ---------- counters ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target;
      const to = parseFloat(el.dataset.count);
      const from = parseFloat(el.dataset.from || 0);
      const dur = 1800;
      const t0 = performance.now();
      const step = (t) => {
        const p = clamp((t - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.firstChild.nodeValue = String(Math.round(lerp(from, to, eased)));
        if (p < 1 && !reduced) requestAnimationFrame(step);
        else el.firstChild.nodeValue = String(to);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => { el.prepend(document.createTextNode(el.dataset.from || '0')); countIO.observe(el); });

  /* ---------- nav ---------- */
  const nav = $('.nav');
  const progress = $('.scroll-progress');
  const links = $$('.nav-links a[href^="#"], .nav-links a[data-page]');
  const pill = $('.nav-pill');
  const linkBox = $('.nav-links');

  const movePill = (a) => {
    if (!pill || !a) { if (pill) pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  let activeLink = null;
  const setActive = (a) => { activeLink = a; links.forEach((l) => l.classList.toggle('is-active', l === a)); movePill(a); };
  if (linkBox) {
    links.forEach((a) => {
      a.addEventListener('mouseenter', () => movePill(a));
    });
    linkBox.addEventListener('mouseleave', () => movePill(activeLink));
  }
  const sections = links.map((a) => a.getAttribute('href').startsWith('#') ? $(a.getAttribute('href')) : null);
  const pagePath = location.pathname.split('/').pop() || 'index.html';
  const pageLink = links.find((a) => a.dataset.page && a.dataset.page === pagePath);
  if (pageLink) setActive(pageLink);

  /* ---------- scroll loop (progress, nav hide, parallax, timeline) ---------- */
  const parallaxEls = $$('[data-parallax]');
  const hero = $('.hero');
  const heroTitle = $('.hero-title');
  const tl = $('.tl');
  let lastY = scrollY, ticking = false;

  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    if (nav) {
      nav.classList.toggle('is-hidden', y > lastY && y > 400 && !document.body.classList.contains('menu-open'));
    }
    lastY = y;

    if (!reduced) {
      parallaxEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const speed = parseFloat(el.dataset.parallax) || 0.1;
        const center = r.top + r.height / 2 - innerHeight / 2;
        el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)${el.dataset.rot ? ` rotate(${el.dataset.rot}deg)` : ''}`;
      });
      if (hero && heroTitle && y < innerHeight * 1.2) {
        const p = clamp(y / innerHeight, 0, 1);
        const media = $('.hero-media', hero);
        if (media) media.style.transform = `translate3d(0, ${y * 0.25}px, 0) scale(${1 + p * 0.08})`;
        heroTitle.style.transform = `translate3d(0, ${y * -0.12}px, 0)`;
      }
    }

    if (tl) {
      const r = tl.getBoundingClientRect();
      const p = clamp((innerHeight * 0.55 - r.top) / r.height, 0, 1);
      tl.style.setProperty('--p', p.toFixed(4));
    }

    // active section
    if (!pageLink) {
      let cur = null;
      sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = links[i]; });
      if (cur !== activeLink) setActive(cur);
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => movePill(activeLink));
  onScroll();

  /* ---------- mobile menu ---------- */
  const toggle = $('.nav-toggle');
  const body = document.body;
  const closeMenu = () => { body.classList.remove('menu-open'); toggle && toggle.setAttribute('aria-expanded', 'false'); };
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('.menu-sheet a').forEach((a) => a.addEventListener('click', closeMenu));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- magnetic buttons + tilt ---------- */
  if (finePointer && !reduced) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `rotateY(${px * 14}deg) rotateX(${-py * 14}deg) translateZ(14px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- draggable rails ---------- */
  $$('[data-rail]').forEach((rail) => {
    const bar = rail.parentElement.querySelector('.rail-bar i');
    const prev = rail.parentElement.querySelector('[data-rail-prev]') || document.querySelector('[data-rail-prev]');
    const next = rail.parentElement.querySelector('[data-rail-next]') || document.querySelector('[data-rail-next]');
    const step = () => (rail.firstElementChild && rail.children[1] ? rail.children[2].getBoundingClientRect().left - rail.children[1].getBoundingClientRect().left : 400) || 400;
    let down = false, sx = 0, sl = 0, moved = 0;
    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      down = true; moved = 0; sx = e.clientX; sl = rail.scrollLeft;
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) rail.classList.add('is-drag');
      rail.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return; down = false;
      setTimeout(() => rail.classList.remove('is-drag'), 0);
    });
    const upd = () => {
      if (!bar) return;
      const max = rail.scrollWidth - rail.clientWidth;
      const w = clamp(rail.clientWidth / rail.scrollWidth, 0.1, 1);
      bar.style.width = (w * 100) + '%';
      const track = bar.parentElement.clientWidth;
      bar.style.transform = `translateX(${max > 0 ? (rail.scrollLeft / max) * (track - track * w) : 0}px)`;
    };
    rail.addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd); upd();
    if (prev) prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));
    // wheel: vertical → horizontal when the rail is hovered with shift only (keep page scroll natural)
  });

  /* ---------- hero: match-clock HUD + sound ---------- */
  const clock = $('[data-clock]');
  if (clock) {
    const phase = $('[data-phase]');
    const bars = $$('.hud-bars i', clock.closest('.hud') || document);
    const TOTAL = 150; // 30s auto + 2:00 teleop (endgame = last 30s)
    const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    // run 6x faster than real time so the visitor actually sees the phases change
    const speed = 6;
    const start = performance.now();
    const tickFast = () => {
      const el = (((performance.now() - start) / 1000) * speed) % (TOTAL + 8);
      const t = Math.min(el, TOTAL);
      const left = TOTAL - t;
      clock.textContent = fmt(left);
      let name = 'TELEOP';
      if (t < 30) name = 'AUTONOMOUS'; else if (left <= 30) name = 'ENDGAME';
      if (el > TOTAL) name = 'MATCH END';
      if (phase) phase.textContent = name;
      bars.forEach((b, i) => b.classList.toggle('f', (i + 1) / bars.length <= t / TOTAL));
    };
    setInterval(tickFast, 100); tickFast();
  }

  const video = $('.hero-media video');
  const snd = $('.sound-toggle');
  if (video) {
    video.muted = true;
    const p = video.play(); if (p && p.catch) p.catch(() => {});
    if (snd) snd.addEventListener('click', () => {
      video.muted = !video.muted;
      snd.setAttribute('aria-pressed', String(!video.muted));
      if (!video.muted) video.play().catch(() => {});
    });
  }

  /* ---------- easter egg ---------- */
  const duck = $('#rain-button');
  const rain = () => {
    const box = document.createElement('div'); box.className = 'chicken-rain';
    document.body.appendChild(box);
    for (let i = 0; i < 70; i++) {
      const c = document.createElement('div'); c.className = 'chicken'; c.textContent = '🐥';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.fontSize = 22 + Math.random() * 26 + 'px';
      c.style.animationDuration = 2.6 + Math.random() * 2.4 + 's';
      c.style.animationDelay = Math.random() * 1.2 + 's';
      box.appendChild(c);
    }
    setTimeout(() => box.remove(), 8000);
  };
  if (duck) duck.addEventListener('click', rain);

  /* ---------- seasons (blog) ---------- */
  const modal = $('#seasonModal');
  if (modal) {
    const tabs = ['proba', 'robot', 'activitati', 'meeturi'];
    const t = (k) => (window.translate ? window.translate(k) : k);
    let current = null;
    const fill = () => {
      if (!current) return;
      tabs.forEach((tab) => {
        const el = $('#tab-' + tab);
        const key = `season.${current}.${tab}`;
        const html = t(key);
        el.dataset.i18n = key;
        el.innerHTML = html === key ? '' : html;
      });
    };
    window.switchTab = (name) => {
      $$('.tab-content').forEach((el) => el.classList.remove('active'));
      $$('.tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
      const el = $('#tab-' + name);
      if (el) el.classList.add('active');
      const bodyEl = $('.modal-body'); if (bodyEl) bodyEl.scrollTop = 0;
    };
    window.openSeasonModal = (season) => {
      current = season;
      $('#modalSeasonYear').textContent = season;
      fill();
      // hide tabs with no content (2025-2026 has no separate robot tab)
      $$('.tab-btn').forEach((b) => {
        const has = $('#tab-' + b.dataset.tab).innerHTML.trim().length > 0;
        b.style.display = has ? '' : 'none';
      });
      window.switchTab('proba');
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    };
    window.closeSeasonModal = () => { modal.classList.remove('active'); document.body.style.overflow = ''; };
    modal.addEventListener('click', (e) => { if (e.target === modal) window.closeSeasonModal(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) window.closeSeasonModal(); });
    $$('.tab-btn').forEach((b) => b.addEventListener('click', () => window.switchTab(b.dataset.tab)));
    $$('[data-season]').forEach((s) => s.addEventListener('click', () => window.openSeasonModal(s.dataset.season)));
    addEventListener('languageChanged', () => { if (modal.classList.contains('active')) fill(); });

  }
})();
