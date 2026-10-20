'use strict';
/* ==================================================================
   PORTFOLIO NDIMBY — anim.js
   Toutes les animations (GSAP + ScrollTrigger + Lenis).
   Si ces bibliothèques ne chargent pas, le site reste complet, sans animation.
   ================================================================== */

(() => {
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  if (!gsap || !ST || document.documentElement.classList.contains('lite') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ST);

  const html = document.documentElement;
  html.classList.add('has-anim');
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cssVar = (name) => getComputedStyle(html).getPropertyValue(name).trim();
  // ?sans=lenis,canvas,pin,tapes,intro : coupe un module (sert à trouver ce qui gêne un navigateur)
  const off = new Set((new URLSearchParams(location.search).get('sans') || '').split(','));
  if (off.has('canvas')) html.classList.add('no-canvas');

  /* ---------- Découpe un texte en mots (.w) et lettres (.ch) ---------- */
  function split(el) {
    const chars = [];
    [...el.childNodes].forEach((node) => {
      if (node.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      node.textContent.split(/([ \n\t]+)/).forEach((part) => {
        if (!part) return;
        if (/^[ \n\t]+$/.test(part)) { frag.append(' '); return; }
        const w = document.createElement('span');
        w.className = 'w';
        [...part].forEach((c) => {
          const s = document.createElement('span');
          s.className = 'ch';
          s.textContent = c;
          w.append(s);
          chars.push(s);
        });
        frag.append(w);
      });
      node.replaceWith(frag);
    });
    return chars;
  }

  /* ================= DÉFILEMENT FLUIDE ================= */
  let lenis = null;
  if (window.Lenis && !off.has('lenis')) {
    lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on('scroll', ST.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    const sync = () => {
      const locked = document.body.classList.contains('no-scroll') || document.body.classList.contains('is-loading');
      locked ? lenis.stop() : lenis.start();
    };
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    sync();
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
      const id = a.getAttribute('href');
      const target = id === '#top' || id === '#' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.8, force: true, easing: (t) => 1 - Math.pow(1 - t, 4) });
    });
  }

  // Vitesse de scroll (sert aux bandeaux, à la pellicule…)
  let vel = 0;
  ST.create({ start: 0, end: 'max', onUpdate: (self) => { vel = self.getVelocity(); } });
  gsap.ticker.add(() => { vel *= 0.92; });

  /* ================= DIAPHRAGME D'OUVERTURE ================= */
  const irisG = $('#iris-g');
  const HEX = [0, 1, 2, 3, 4, 5].map((i) => (Math.PI / 3) * i + Math.PI / 6);
  function drawIris(r, rot) {
    const pts = HEX.map((a) => [Math.cos(a + rot) * r, Math.sin(a + rot) * r]);
    const hole = `M${pts.map((p) => p.map((v) => v.toFixed(3)).join(',')).join('L')}Z`;
    // chaque côté de l'hexagone se prolonge : ce sont les lamelles
    const blades = pts.map((p, i) => {
      const q = pts[(i + 1) % 6];
      const dx = q[0] - p[0], dy = q[1] - p[1];
      const len = Math.hypot(dx, dy) || 1;
      return `<line x1="${p[0].toFixed(3)}" y1="${p[1].toFixed(3)}" x2="${(q[0] + (dx / len) * 400).toFixed(3)}" y2="${(q[1] + (dy / len) * 400).toFixed(3)}"/>`;
    }).join('');
    irisG.innerHTML = `<path class="iris-fill" fill-rule="evenodd" d="M-400,-400H400V400H-400Z ${hole}"/>${blades}`;
  }
  const iris = { r: 0, rot: 0 };
  drawIris(0, 0);

  if (off.has('intro')) window.__intro = (loader, finish) => { loader.remove(); finish(); heroIntro(); };
  else window.__intro = (loader, finish) => {
    const tl = gsap.timeline();
    tl.to(['.loader-name', '.loader-count', '.loader-bar'], { opacity: 0, y: -24, duration: 0.45, stagger: 0.05, ease: 'power3.in' })
      .to('#flash', { opacity: 0.55, duration: 0.07 })
      .to('#flash', { opacity: 0, duration: 0.5 })
      .to(iris, {
        r: 150, rot: Math.PI * 0.6, duration: 1.7, ease: 'power3.inOut',
        onUpdate: () => drawIris(iris.r, iris.rot)
      }, '<-0.25')
      .add(() => { finish(); heroIntro(); }, '-=1.15')
      .add(() => loader.remove());
  };

  /* ================= ACCUEIL ================= */
  const hero = $('#hero');
  const title = $('#hero-title');
  const first = split($('#hero-first'));
  const last = split($('#hero-last'));
  const heroBits = ['#hero-kicker', '.hero-status', '.hero-actions > *', '.hero-scroll'];
  gsap.set([...first, ...last, ...$$(heroBits.join(',')), '.vf-corner', '.vf-top', '.vf-bottom'], { opacity: 0 });

  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo(first, { yPercent: 115, rotateX: -95, opacity: 0 },
      { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.7, stagger: 0.075, transformOrigin: '50% 100%' })
      .fromTo(last, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.3, stagger: { each: 0.035, from: 'center' } }, '-=1.4')
      .fromTo(heroBits, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, '-=1.05')
      .fromTo('.vf-corner', { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.3, stagger: 0.05 }, 0.05)
      .to(['.vf-top', '.vf-bottom'], { opacity: 1, duration: 0.8 }, 0.5)
      .add(() => gsap.set('.hero-title .line', { overflow: 'visible' }));
  }

  // Les lettres sautent quand on les survole
  const fg = cssVar('--fg') || '#f3f0ea';
  first.forEach((ch) => ch.addEventListener('mouseenter', () => {
    if (gsap.isTweening(ch)) return;
    gsap.timeline()
      .to(ch, { yPercent: -16, scaleY: 1.1, color: cssVar('--c1'), duration: 0.28, ease: 'power3.out' })
      .to(ch, { yPercent: 0, scaleY: 1, duration: 1.2, ease: 'elastic.out(1, 0.3)' })
      .to(ch, { color: fg, duration: 0.8, clearProps: 'color' }, '<0.2');
  }));

  // Le titre suit la souris en 3D
  if (fine) {
    const rx = gsap.quickTo(title, 'rotationX', { duration: 0.9, ease: 'power3' });
    const ry = gsap.quickTo(title, 'rotationY', { duration: 0.9, ease: 'power3' });
    gsap.set(title, { transformPerspective: 1100 });
    hero.addEventListener('mousemove', (e) => {
      ry((e.clientX / innerWidth - 0.5) * 12);
      rx(-(e.clientY / innerHeight - 0.5) * 9);
    });
    hero.addEventListener('mouseleave', () => { rx(0); ry(0); });
  }

  // Au scroll, le prénom éclate et le viseur s'ouvre
  const mid = (first.length - 1) / 2;
  gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 } })
    .to(first, { x: (i) => (i - mid) * 110, y: (i) => (i % 2 ? -60 : 40), rotation: (i) => (i - mid) * 9, ease: 'none' }, 0)
    .to('.hero-title .line', { opacity: 0, ease: 'power1.in' }, 0)
    .to(last, { x: (i) => (i - (last.length - 1) / 2) * 14, ease: 'none' }, 0)
    .to('.hero-foot, #hero-kicker', { y: -80, opacity: 0, ease: 'none' }, 0)
    .to('#viewfinder', { scale: 1.15, opacity: 0, ease: 'none' }, 0)
    .to('#hero-canvas', { scale: 1.25, ease: 'none' }, 0);

  /* ---------- Fond vivant : taches de lumière qui suivent la souris ---------- */
  const cv = $('#hero-canvas');
  const ctx = cv.getContext('2d');
  const RES = 0.22;
  let W = 0, H = 0, heroActive = true;
  const sizeCanvas = () => {
    W = cv.width = Math.max(1, Math.ceil(hero.clientWidth * RES));
    H = cv.height = Math.max(1, Math.ceil(hero.clientHeight * RES));
  };
  sizeCanvas();
  addEventListener('resize', sizeCanvas);
  const hexToRgb = (hex) => {
    const m = hex.replace('#', '').match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
    return m ? m.slice(1).map((v) => parseInt(v, 16)) : [255, 255, 255];
  };
  let target = [];
  let colors = [];
  const readColors = () => {
    target = ['--c1', '--c2', '--c3'].map((v) => hexToRgb(cssVar(v)));
    if (!colors.length) colors = target.map((c) => c.slice());
  };
  readColors();
  document.addEventListener('palette:change', readColors);
  const blobs = [
    { c: 0, x: 0.18, y: 0.28, r: 0.62, sp: 0.00021, ph: 0 },
    { c: 1, x: 0.82, y: 0.35, r: 0.55, sp: 0.00017, ph: 2 },
    { c: 2, x: 0.55, y: 0.92, r: 0.5, sp: 0.00025, ph: 4 },
    { c: 1, x: 0.4, y: 0.6, r: 0.34, sp: 0.0003, ph: 1 }
  ];
  let mxN = 0.5, myN = 0.5, fx = 0.5, fy = 0.5;
  addEventListener('mousemove', (e) => { mxN = e.clientX / innerWidth; myN = e.clientY / innerHeight; });
  ST.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: (s) => { heroActive = s.isActive; } });
  if (!off.has('canvas')) gsap.ticker.add((time) => {
    if (!heroActive) return;
    const t = time * 1000;
    colors.forEach((c, i) => c.forEach((v, j) => { c[j] = v + (target[i][j] - v) * 0.06; }));
    fx += (mxN - fx) * 0.04; fy += (myN - fy) * 0.04;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'screen';
    blobs.forEach((b, i) => {
      const follow = i === 3;
      const x = (follow ? fx : b.x + Math.sin(t * b.sp + b.ph) * 0.16) * W;
      const y = (follow ? fy : b.y + Math.cos(t * b.sp * 1.3 + b.ph) * 0.14) * H;
      const r = b.r * Math.max(W, H) * (1 + Math.sin(t * b.sp * 2 + b.ph) * 0.08);
      const [cr, cg, cb] = colors[b.c].map(Math.round);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${cr},${cg},${cb},${follow ? 0.55 : 0.75})`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });
  });

  /* ================= TITRES ET APPARITIONS ================= */
  $$('[data-split]').forEach((el) => {
    const chars = split(el);
    gsap.fromTo(chars, { yPercent: 118, rotate: 10, opacity: 0 }, {
      yPercent: 0, rotate: 0, opacity: 1, duration: 1.3, ease: 'expo.out', stagger: 0.035,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  gsap.set('.reveal', { y: 50, opacity: 0 });
  ST.batch('.reveal', {
    start: 'top 92%', once: true,
    onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.09, overwrite: true })
  });

  /* ================= BANDEAUX CROISÉS ================= */
  let tapeDir = 1;
  if (!off.has('tapes')) $$('.tape .marquee-track').forEach((track, i) => {
    const dir = i ? 1 : -1;
    let x = 0;
    gsap.ticker.add(() => {
      const w = track.scrollWidth / 2;
      if (!w) return;
      if (Math.abs(vel) > 40) tapeDir = vel > 0 ? 1 : -1;
      const speed = 1.1 * (1 + Math.min(Math.abs(vel) / 220, 10));
      x = gsap.utils.wrap(-w, 0, x + dir * tapeDir * speed);
      gsap.set(track, { x });
    });
  });
  gsap.fromTo('.tape-a', { rotate: -7 }, { rotate: -2, ease: 'none', scrollTrigger: { trigger: '.tapes', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.tape-b', { rotate: 7 }, { rotate: 2.5, ease: 'none', scrollTrigger: { trigger: '.tapes', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ================= PROJETS ================= */
  const rows = $$('.project-list li');
  gsap.set(rows, { y: 70, opacity: 0 });
  ST.batch(rows, {
    start: 'top 92%', once: true,
    onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.09 })
  });

  // Titre qui « roule » au survol : la version colorée remplace la blanche lettre par lettre
  $$('.project-row').forEach((row) => {
    const a = split($('.roll-a', row));
    const b = split($('.roll-b', row));
    const n = Math.max(1, b.length - 1);
    b.forEach((ch, i) => { ch.style.color = `color-mix(in oklab, var(--p2) ${Math.round((i / n) * 100)}%, var(--p1))`; });
    gsap.set(b, { yPercent: 105 });
    const over = () => {
      gsap.to(a, { yPercent: -105, duration: 0.55, stagger: 0.012, ease: 'power3.inOut', overwrite: true });
      gsap.to(b, { yPercent: 0, duration: 0.55, stagger: 0.012, ease: 'power3.inOut', overwrite: true });
    };
    const out = () => {
      gsap.to(a, { yPercent: 0, duration: 0.5, stagger: 0.008, ease: 'power3.inOut', overwrite: true });
      gsap.to(b, { yPercent: 105, duration: 0.5, stagger: 0.008, ease: 'power3.inOut', overwrite: true });
    };
    row.addEventListener('mouseenter', over);
    row.addEventListener('focus', over);
    row.addEventListener('mouseleave', out);
    row.addEventListener('blur', out);
  });

  /* ================= STORYBOARDS : PELLICULE 3D ================= */
  const strip = $('#sb-strip');
  const viewport = $('#sb-viewport');
  const cards = $$('.sb-card', strip);
  const frames = cards.filter((c) => c.classList.contains('frame'));
  const bar = $('#sb-bar');
  const current = $('#sb-current');
  const chapter = $('#sb-chapter');
  const pad = (n) => String(n).padStart(2, '0');

  gsap.fromTo(cards.slice(0, 6), { x: 260, opacity: 0, rotationY: -50 }, {
    x: 0, opacity: 1, rotationY: 0, duration: 1.4, ease: 'expo.out', stagger: 0.08,
    scrollTrigger: { trigger: '#storyboards', start: 'top 70%', once: true },
    clearProps: 'rotationY'
  });

  const mm = gsap.matchMedia();
  if (!off.has('pin')) mm.add('(min-width: 900px)', () => {
    html.classList.add('has-pin');
    const dist = () => Math.max(0, strip.scrollWidth - viewport.clientWidth);
    const st = ST.create({
      trigger: '#sb-pin', pin: true, start: 'top top', end: () => `+=${dist() * 0.55}`,
      scrub: 0.9, invalidateOnRefresh: true,
      animation: gsap.to(strip, { x: () => -dist(), ease: 'none' }),
      onUpdate: (self) => { bar.style.transform = `scaleX(${self.progress})`; }
    });
    const update = () => {
      const half = viewport.clientWidth / 2;
      const sx = gsap.getProperty(strip, 'x');
      let best = null, bestD = Infinity;
      cards.forEach((card) => {
        const center = card.offsetLeft + card.offsetWidth / 2 + sx;
        const d = (center - half) / half;
        const ad = Math.abs(d);
        gsap.set(card, {
          transformPerspective: 1400,
          rotationY: clamp(-d * 32, -40, 40),
          scale: 1 - Math.min(ad, 1.2) * 0.12,
          opacity: clamp(1.6 - ad, 0.25, 1)
        });
        if (ad < bestD) { bestD = ad; best = card; }
      });
      if (best) {
        chapter.textContent = best.dataset.chapter || '';
        const n = best.dataset.n || (frames.find((f) => f.offsetLeft > best.offsetLeft)?.dataset.n ?? frames.length);
        current.textContent = pad(n);
      }
    };
    const tick = () => { if (st.isActive) update(); };
    gsap.ticker.add(tick);
    update();
    return () => {
      gsap.ticker.remove(tick);
      html.classList.remove('has-pin');
      gsap.set([strip, ...cards], { clearProps: 'transform,opacity' });
    };
  });

  /* ================= SERVICES ================= */
  gsap.fromTo('.services', { clipPath: 'inset(8% 6% 0% 6% round 64px)' }, {
    clipPath: 'inset(0% 0% 0% 0% round 36px)', ease: 'none',
    scrollTrigger: { trigger: '.services', start: 'top bottom', end: 'top 25%', scrub: true }
  });
  gsap.fromTo('.service', { rotationX: -75, y: 110, opacity: 0, transformOrigin: '50% 0%', transformPerspective: 900 }, {
    rotationX: 0, y: 0, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: 0.12,
    scrollTrigger: { trigger: '.service-grid', start: 'top 82%', once: true }
  });
  if (fine) $$('.service').forEach((card) => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 14);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 14);
    });
    card.addEventListener('mouseleave', () => { rx(0); ry(0); });
  });

  /* ================= À PROPOS ================= */
  const photo = $('.about-photo-inner');
  if (photo) {
    gsap.fromTo(photo, { clipPath: 'inset(100% 0% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut',
      scrollTrigger: { trigger: photo, start: 'top 82%', once: true }
    });
    gsap.fromTo($('img', photo), { scale: 1.5 }, { scale: 1, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: photo, start: 'top 82%', once: true } });
    gsap.fromTo($('img', photo), { filter: 'grayscale(1) contrast(1.05)' }, {
      filter: 'grayscale(0) contrast(1.05)', ease: 'none',
      scrollTrigger: { trigger: '.about', start: 'top 40%', end: 'center center', scrub: true }
    });
  }
  $$('.stat-value').forEach((el) => {
    const end = parseFloat(el.dataset.value);
    if (Number.isNaN(end)) return;
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = Math.round(o.v); }
    });
  });

  /* ================= CONTACT ================= */
  gsap.fromTo('.contact', { clipPath: 'inset(6% 5% 0% 5% round 64px)' }, {
    clipPath: 'inset(0% 0% 0% 0% round 36px)', ease: 'none',
    scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'top 30%', scrub: true }
  });
  const lines = innerWidth >= 900 ? $$('.ct-line') : [];
  if (lines[0]) gsap.fromTo(lines[0], { xPercent: -8 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true } });
  if (lines[1]) gsap.fromTo(lines[1], { xPercent: 8 }, { xPercent: -4, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true } });

  // L'adresse e-mail ondule sous la souris
  const email = $('#contact-email');
  const mailChars = $$('.ch', email);
  gsap.fromTo(mailChars, { yPercent: 100, opacity: 0 }, {
    yPercent: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.025,
    scrollTrigger: { trigger: email, start: 'top 90%', once: true }
  });
  if (fine) {
    const ys = mailChars.map((c) => gsap.quickTo(c, 'y', { duration: 0.45, ease: 'power3' }));
    email.addEventListener('mousemove', (e) => {
      mailChars.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const k = Math.max(0, 1 - Math.abs(e.clientX - (r.left + r.width / 2)) / 150);
        ys[i](-k * 30);
        c.style.color = k > 0.05 ? `color-mix(in oklab, #ffffff ${Math.round((1 - k) * 100)}%, var(--c3))` : '';
      });
    });
    email.addEventListener('mouseleave', () => mailChars.forEach((c, i) => { ys[i](0); c.style.color = ''; }));
  }

  /* ================= PIED DE PAGE ================= */
  const big = split($('#footer-big'));
  const bn = Math.max(1, big.length - 1);
  big.forEach((ch, i) => {
    const k = i / bn;
    ch.style.color = k < 0.5
      ? `color-mix(in oklab, var(--c2) ${Math.round(k * 200)}%, var(--c1))`
      : `color-mix(in oklab, var(--c3) ${Math.round((k - 0.5) * 200)}%, var(--c2))`;
  });
  gsap.fromTo(big, { yPercent: 110, rotate: 12 }, {
    yPercent: 0, rotate: 0, duration: 1.6, ease: 'expo.out', stagger: 0.07,
    scrollTrigger: { trigger: '.footer', start: 'top 85%', once: true }
  });
  big.forEach((ch) => ch.addEventListener('mouseenter', () => {
    if (gsap.isTweening(ch)) return;
    gsap.fromTo(ch, { yPercent: 0 }, { yPercent: -18, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' });
  }));

  /* ================= BOUTONS MAGNÉTIQUES ================= */
  if (fine) {
    const bound = new WeakSet();
    document.addEventListener('mouseover', (e) => {
      const el = e.target.closest('.btn, .nav-cta, .swatch, .filter, .modal-close');
      if (!el || bound.has(el)) return;
      bound.add(el);
      const xT = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      const yT = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('mousemove', (ev) => {
        const r = el.getBoundingClientRect();
        xT((ev.clientX - r.left - r.width / 2) * 0.3);
        yT((ev.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('mouseleave', () => { xT(0); yT(0); });
    });
  }

  /* ================= FICHE PROJET ================= */
  document.addEventListener('modal:open', (e) => {
    const panel = $('.modal-panel');
    const from = e.detail && e.detail.from;
    if (from) {
      const r = panel.getBoundingClientRect();
      const x = clamp(from.x - r.left, 0, r.width);
      const y = clamp(from.y - r.top, 0, r.height);
      const R = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y));
      gsap.fromTo(panel, { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${R}px at ${x}px ${y}px)`, duration: 0.95, ease: 'expo.inOut', clearProps: 'clipPath' });
      gsap.fromTo('.modal-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.5 });
    }
    gsap.fromTo('#modal-media > *', { scale: 1.25 }, { scale: 1, duration: 1.5, ease: 'expo.out' });
    gsap.fromTo('#modal-body > *', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.08, delay: from ? 0.3 : 0 });
  });

  /* ================= RECALCULS ================= */
  document.addEventListener('layout:change', () => ST.refresh());
  ST.addEventListener('refresh', () => document.dispatchEvent(new Event('timeline:layout')));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ST.refresh());
  addEventListener('load', () => ST.refresh());
})();
