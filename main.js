'use strict';
/* ==================================================================
   PORTFOLIO NDIMBY — main.js
   Construit la page à partir de contenu.js. Pas besoin de modifier ce fichier.
   Les grosses animations sont dans anim.js (le site marche aussi sans).
   ================================================================== */

(() => {
  const S = SITE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const fullName = `${S.firstName} ${S.lastName}`;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* stockage indisponible */ } }
  };

  /* ================= AMBIANCE (palette) ================= */
  const palettes = S.palettes || {};
  function applyPalette(key) {
    const p = palettes[key];
    if (!p) return;
    const root = document.documentElement.style;
    root.setProperty('--c1', p.c1);
    root.setProperty('--c2', p.c2);
    root.setProperty('--c3', p.c3);
    document.documentElement.dataset.palette = key;
    const name = $('#palette-name');
    if (name) name.textContent = p.name;
    $$('.swatch').forEach((s) => s.setAttribute('aria-pressed', s.dataset.key === key));
    document.dispatchEvent(new CustomEvent('palette:change', { detail: p }));
  }
  const savedPalette = S.showPalettePicker ? store.get('ndy-palette') : null;
  applyPalette(palettes[savedPalette] ? savedPalette : S.palette);

  if (S.showPalettePicker && Object.keys(palettes).length > 1) {
    const picker = $('#palette');
    $('#palette-swatches').innerHTML = Object.entries(palettes).map(([k, p]) =>
      `<button type="button" class="swatch" data-key="${esc(k)}" aria-label="Ambiance ${esc(p.name)}" aria-pressed="${k === document.documentElement.dataset.palette}"
        style="--s1:${p.c1};--s2:${p.c2};--s3:${p.c3}"></button>`).join('');
    picker.hidden = false;
    picker.addEventListener('click', (e) => {
      const sw = e.target.closest('.swatch');
      if (!sw) return;
      applyPalette(sw.dataset.key);
      store.set('ndy-palette', sw.dataset.key);
    });
  }

  /* ---------- Vidéos : fichier, YouTube ou Vimeo ---------- */
  function embedUrl(url) {
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`;
    const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
    return '';
  }
  function playerHtml(url) {
    const embed = embedUrl(url);
    if (embed) return `<iframe src="${embed}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Lecteur vidéo"></iframe>`;
    return `<video src="${esc(url)}" controls autoplay playsinline></video>`;
  }

  /* ---------- Affiche d'un projet (couverture ou affiche générée) ---------- */
  function posterHtml(p, { play = false } = {}) {
    if (p.cover) return `<img src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy" />`;
    const [c1, c2] = p.colors || ['#333', '#111'];
    return `<div class="poster" style="--p1:${c1};--p2:${c2}">
      <div class="poster-top"><span>${esc(p.type)}</span><span>${esc(p.year)}</span></div>
      ${play ? '<span class="poster-play">▶</span>' : ''}
      <div class="poster-title">${esc(p.short || p.title)}</div>
    </div>`;
  }

  /* ================= ACCUEIL ================= */
  $('#hero-kicker').textContent = `${S.role} — ${S.city}`;
  $('#hero-first').textContent = S.firstName;
  $('#hero-last').textContent = S.lastName;
  $('#hero-status').textContent = S.status;

  const actions = [`<a class="btn btn-light" href="#projets">Voir les projets <span>→</span></a>`];
  if (S.showreel && S.showreel.video) {
    actions.unshift(`<button class="btn" id="showreel-btn" type="button">▶ Voir le showreel</button>`);
    if (!embedUrl(S.showreel.video)) {
      $('#hero-bg').insertAdjacentHTML('afterbegin', `<video src="${esc(S.showreel.video)}" autoplay muted loop playsinline></video>`);
      document.documentElement.classList.add('has-reel');
    }
  } else {
    actions.push(`<a class="btn" href="#contact">Me contacter</a>`);
  }
  $('#hero-actions').innerHTML = actions.join('');

  // Timecode du viseur (25 images par seconde)
  const tc = $('#timecode');
  const toTC = (f) => `${pad(Math.floor(f / 90000))}:${pad(Math.floor(f / 1500) % 60)}:${pad(Math.floor(f / 25) % 60)}:${pad(f % 25)}`;
  const t0 = performance.now();
  (function tick() {
    tc.textContent = toTC(Math.floor(((performance.now() - t0) / 1000) * 25));
    requestAnimationFrame(tick);
  })();

  /* ================= MANIFESTE ================= */
  // Chaque mot passe du flou au net (mise au point) et prend la couleur du dégradé
  const manifesto = $('#manifesto-text');
  const mWords = S.manifesto.split(/\s+/);
  manifesto.innerHTML = mWords.map((w, i) => {
    const k = i / Math.max(1, mWords.length - 1);
    const mix = k < 0.5
      ? `color-mix(in oklab, var(--c2) ${Math.round(k * 200)}%, var(--fg))`
      : `color-mix(in oklab, var(--c1) ${Math.round((k - 0.5) * 200)}%, var(--c2))`;
    return `<span style="--lit:${mix}">${esc(w)} </span>`;
  }).join('');
  const words = $$('span', manifesto);
  function lightWords() {
    const r = manifesto.getBoundingClientRect();
    const vh = innerHeight;
    const progress = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
    const lit = Math.round(progress * words.length);
    words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
  }

  /* ================= BANDEAUX ================= */
  const tapeItems = (arr) => arr.map((m) => `<span>${esc(m)}</span>`).join('');
  $('#marquee-a').innerHTML = tapeItems(S.marquee).repeat(2);
  $('#marquee-b').innerHTML = tapeItems([...S.marquee].reverse()).repeat(2);

  /* ================= PROJETS ================= */
  const list = $('#project-list');
  $('#projects-count').textContent = `(${pad(S.projects.length)})`;
  list.innerHTML = S.projects.map((p, i) => `
    <li data-category="${esc(p.category)}">
      <button class="project-row" type="button" data-index="${i}" aria-label="${esc(p.title)} — voir le projet"
        style="--p1:${(p.colors || [])[0] || 'var(--c1)'};--p2:${(p.colors || [])[1] || 'var(--c2)'}">
        <span class="p-thumb">${posterHtml(p)}</span>
        <span class="p-num">${pad(i + 1)}</span>
        <span class="p-title"><span class="roll"><span class="roll-a">${esc(p.title)}</span><span class="roll-b" aria-hidden="true">${esc(p.title)}</span></span></span>
        <span class="p-client">${esc(p.client)}</span>
        <span class="p-type">${esc(p.tags[0] || p.type)}</span>
        <span class="p-year">${esc(p.year)}</span>
      </button>
    </li>`).join('');

  $$('.filter').forEach((btn) => btn.addEventListener('click', () => {
    $$('.filter').forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', b === btn); });
    const f = btn.dataset.filter;
    $$('li', list).forEach((li) => li.classList.toggle('is-hidden', f !== 'all' && li.dataset.category !== f));
    document.dispatchEvent(new Event('layout:change'));
  }));

  /* ---------- Curseur et aperçu flottant ---------- */
  const cursor = $('#cursor');
  const cursorLabel = $('#cursor-label');
  const preview = $('#preview');
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, px = mx, py = my;

  if (finePointer) {
    addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; cursor.classList.add('is-visible'); });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
    (function follow() {
      cx += (mx - cx) * 0.35; cy += (my - cy) * 0.35;
      const vx = mx - px;
      px += vx * 0.12; py += (my - py) * 0.12;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      preview.style.left = `${px}px`; preview.style.top = `${py}px`;
      // l'aperçu penche dans le sens du mouvement
      preview.style.setProperty('--rot', `${clamp(vx * 0.08, -14, 14)}deg`);
      requestAnimationFrame(follow);
    })();

    document.addEventListener('mouseover', (e) => {
      const label = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, .chip');
      cursor.classList.toggle('is-label', !!label);
      cursor.classList.toggle('is-hover', !label && !!link);
      cursorLabel.textContent = label ? label.dataset.cursor : '';
    });

    let current = -1;
    $$('.project-row', list).forEach((row) => {
      row.dataset.cursor = 'Voir';
      row.addEventListener('mouseenter', () => {
        list.classList.add('has-hover');
        const i = +row.dataset.index;
        if (i !== current) {
          const p = S.projects[i];
          preview.innerHTML = `<div class="preview-inner">${p.preview ? `<video src="${esc(p.preview)}" autoplay muted loop playsinline></video>` : posterHtml(p)}</div>`;
          current = i;
        }
        preview.classList.add('is-visible');
      });
    });
    list.addEventListener('mouseleave', () => { list.classList.remove('has-hover'); preview.classList.remove('is-visible'); });
  }

  /* ---------- Fiche projet ---------- */
  const modal = $('#modal');
  let lastFocus = null;
  let lastClick = null;
  addEventListener('pointerdown', (e) => { lastClick = { x: e.clientX, y: e.clientY }; }, true);
  function showModal() {
    const wasHidden = modal.hidden;
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    $('.modal-panel', modal).scrollTop = 0;
    $('.modal-close', modal).focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('modal:open', { detail: { from: wasHidden ? lastClick : null } }));
  }
  function openProject(i) {
    const p = S.projects[i];
    const media = $('#modal-media');
    if (p.video) {
      media.innerHTML = playerHtml(p.video);
    } else if (p.gallery && p.gallery.length) {
      media.innerHTML = `<img src="${esc(p.gallery[0])}" alt="${esc(p.title)}" />`;
    } else {
      media.innerHTML = posterHtml(p);
      media.firstElementChild.insertAdjacentHTML('beforeend', `<span class="modal-soon">${p.type === 'Photo' ? 'Photos' : 'Vidéo'} bientôt en ligne</span>`);
    }
    const specs = [['Client', p.client], ['Année', p.year], ['Rôle', p.role], ['Durée', p.duration], ['Outils', (p.tools || []).join(', ')]]
      .filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    const prev = (i - 1 + S.projects.length) % S.projects.length;
    const next = (i + 1) % S.projects.length;
    const sb = p.storyboard ? `<a class="btn" href="#storyboards" data-close>Voir le storyboard</a>` : '';
    $('#modal-body').innerHTML = `
      <div>
        <p class="eyebrow">${pad(i + 1)} — ${esc(p.category === 'pro' ? 'Projet pro' : 'Projet scolaire')}</p>
        <h2 id="modal-title">${esc(p.title)}</h2>
        <p>${esc(p.description)}</p>
        <div class="modal-tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
      </div>
      <dl class="modal-specs">${specs}</dl>
      <div class="modal-nav">
        <button class="btn" type="button" data-go="${prev}">← ${esc(S.projects[prev].short)}</button>
        ${sb}
        <button class="btn" type="button" data-go="${next}">${esc(S.projects[next].short)} →</button>
      </div>`;
    if (modal.hidden) lastFocus = document.activeElement;
    showModal();
  }
  function closeModal() {
    if (modal.hidden) return;
    $('#modal-media').innerHTML = '';
    modal.hidden = true;
    document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  list.addEventListener('click', (e) => {
    const row = e.target.closest('.project-row');
    if (row) openProject(+row.dataset.index);
  });
  modal.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) return openProject(+go.dataset.go);
    if (e.target.closest('[data-close]')) closeModal();
  });

  /* ================= STORYBOARDS ================= */
  // Une seule pellicule : une carte de présentation par storyboard, puis ses plans
  let frameCount = 0;
  $('#sb-strip').innerHTML = S.storyboards.map((sb) => {
    const linked = sb.project ? S.projects.findIndex((p) => p.id === sb.project) : -1;
    const intro = `
      <article class="sb-card sb-intro" id="${esc(sb.id)}" data-chapter="${esc(sb.title)}">
        <p class="sb-meta">${esc(sb.date)} · ${sb.frames.length} plans</p>
        <h3 class="sb-title">${esc(sb.title)}</h3>
        <p class="sb-desc">${esc(sb.description)}</p>
        <div class="sb-actions">
          ${sb.page ? `<button class="btn" type="button" data-page="${esc(sb.page)}" data-title="${esc(sb.title)}">Voir la planche</button>` : ''}
          ${linked >= 0 ? `<button class="btn" type="button" data-open="${linked}">Le projet →</button>` : ''}
        </div>
      </article>`;
    const frames = sb.frames.map((f) => {
      frameCount += 1;
      return `
      <figure class="sb-card frame" data-chapter="${esc(sb.title)}" data-n="${frameCount}">
        <div class="frame-img${f.image ? '' : ' is-empty'}">
          ${f.image ? `<img src="${esc(f.image)}" alt="${esc(f.framing)}" loading="lazy" draggable="false" />` : `<span>${esc(f.framing)}</span>`}
          <span class="frame-shot">${esc(f.shot)}</span>
        </div>
        <figcaption class="frame-info">
          <p class="frame-framing">${esc(f.framing)} <em>${esc(f.move)}</em></p>
          <p class="frame-text">${esc(f.text)}</p>
        </figcaption>
      </figure>`;
    }).join('');
    return intro + frames;
  }).join('');
  $('#sb-total').textContent = pad(frameCount);
  $('#sb-chapter').textContent = S.storyboards[0] ? S.storyboards[0].title : '';

  $('#sb-strip').addEventListener('click', (e) => {
    const page = e.target.closest('[data-page]');
    if (page) openLightbox(page.dataset.page, page.dataset.title);
    const open = e.target.closest('[data-open]');
    if (open) openProject(+open.dataset.open);
  });

  const lightbox = $('#lightbox');
  function openLightbox(src, title) {
    const img = $('#lightbox-img');
    img.src = src; img.alt = `Planche — ${title}`;
    lightbox.hidden = false;
    document.body.classList.add('no-scroll');
  }
  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    if (modal.hidden) document.body.classList.remove('no-scroll');
  }
  lightbox.addEventListener('click', closeLightbox);

  /* ================= SERVICES ================= */
  const icons = {
    film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="4"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3"/></svg>'
  };
  $('#service-grid').innerHTML = S.services.map((s, i) => `
    <div class="service">
      <span class="service-num">${pad(i + 1)}</span>
      ${icons[s.icon] || icons.film}
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.text)}</p>
    </div>`).join('');

  /* ================= À PROPOS ================= */
  $('#about-photo').innerHTML = S.avatar
    ? `<div class="about-photo-inner"><img src="${esc(S.avatar)}" alt="Portrait de ${esc(fullName)}" loading="lazy" /></div><figcaption>${esc(S.city)}</figcaption>`
    : '';
  $('#about-bio').innerHTML = [`Moi c'est ${S.firstName}, ${S.role.toLowerCase()}.`, ...S.bio]
    .map((b) => `<p class="reveal">${esc(b)}</p>`).join('');
  $('#stats').innerHTML = S.stats.map((s) => `<div class="stat reveal"><div class="stat-value" data-value="${esc(s.value)}">${esc(s.value)}</div><div class="stat-label">${esc(s.label)}</div></div>`).join('');
  const li = (arr) => arr.map((x) => `<li>${esc(x)}</li>`).join('');
  $('#skills').innerHTML = li(S.skills);
  $('#tools').innerHTML = li(S.tools);
  $('#path').innerHTML = `<div class="about-col"><h3>Parcours</h3></div>` + S.path.map((p) => `
    <div class="path-item reveal"><span class="path-year">${esc(p.year)}</span><div><h4>${esc(p.title)}</h4><p>${esc(p.text)}</p></div></div>`).join('');

  /* ================= CONTACT ================= */
  const emailLink = $('#contact-email');
  emailLink.innerHTML = [...S.email].map((c) => `<span class="ch">${esc(c)}</span>`).join('');
  emailLink.setAttribute('aria-label', S.email);
  emailLink.href = `mailto:${S.email}`;
  emailLink.dataset.cursor = 'Copier';
  emailLink.addEventListener('click', async (e) => {
    if (!navigator.clipboard) return;   // pas de presse-papiers : le lien mailto s'ouvre
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(S.email);
      $('#copy-hint').textContent = 'Adresse copiée ✓';
    } catch {
      location.href = `mailto:${S.email}`;
    }
  });

  const socials = S.socials.filter((s) => s.url);
  $('#contact-info').innerHTML = `<dl>
      <dt>E-mail</dt><dd><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></dd>
      ${S.phone ? `<dt>Téléphone</dt><dd><a href="tel:${esc(S.phone.replace(/\s/g, ''))}">${esc(S.phone)}</a></dd>` : ''}
      <dt>Basé à</dt><dd>${esc(S.city)}</dd>
      ${socials.length ? `<dt>Réseaux</dt><dd>${socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.network)}</a>`).join(' · ')}</dd>` : ''}
    </dl>
    ${S.cv ? `<a class="btn" href="${esc(S.cv)}" target="_blank" rel="noopener">Télécharger mon CV <span>↓</span></a>` : ''}`;

  const types = S.services.map((s) => s.title).concat('Autre');
  $('#chips').innerHTML = types.map((t) => `<button type="button" class="chip" aria-pressed="false">${esc(t)}</button>`).join('');
  $('#chips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip) chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') !== 'true');
  });

  const form = $('#contact-form');
  const status = $('#form-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;
    ['name', 'email', 'message'].forEach((n) => {
      const input = form.elements[n];
      const bad = !input.value.trim() || (n === 'email' && !input.checkValidity());
      input.closest('.field').classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) { status.textContent = 'Merci de remplir ton nom, ton e-mail et ton message.'; return; }

    const chosen = $$('.chip[aria-pressed="true"]').map((c) => c.textContent);
    const data = { name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), type: chosen.join(', '), message: form.elements.message.value.trim() };

    if (S.formEndpoint) {
      status.textContent = 'Envoi…';
      try {
        const res = await fetch(S.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error();
        form.reset(); $$('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
        status.textContent = 'Message envoyé, merci ! Je te réponds vite.';
      } catch {
        status.textContent = `L'envoi n'a pas marché. Écris-moi directement à ${S.email}.`;
      }
      return;
    }
    const subject = `Projet vidéo — ${data.name}${data.type ? ` (${data.type})` : ''}`;
    const body = `${data.message}\n\n— ${data.name}\n${data.email}`;
    location.href = `mailto:${S.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Ta messagerie s\'ouvre avec le message prêt à envoyer.';
  });

  /* ================= PIED DE PAGE ================= */
  $('#footer-copy').textContent = `© ${new Date().getFullYear()} ${fullName}`;
  const clock = $('#local-time');
  const fmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
  const updateClock = () => { clock.textContent = fmt.format(new Date()); };
  updateClock(); setInterval(updateClock, 30000);

  /* ================= TIMELINE DE MONTAGE ================= */
  // Chaque section = un clip sur la timeline ; la tête de lecture suit le scroll
  const chapters = [['hero', 'Intro'], ['manifeste', 'Approche'], ['projets', 'Projets'], ['storyboards', 'Storyboards'], ['services', 'Services'], ['a-propos', 'À propos'], ['contact', 'Contact']];
  const track = $('#tl-track');
  const head = $('#tl-head');
  const tlTc = $('#tl-tc');
  track.innerHTML = chapters.map(([id, label], i) =>
    `<a class="tl-clip" href="#${id}" style="--k:${i}"><span>${label}</span></a>`).join('');
  function layoutTimeline() {
    const total = document.documentElement.scrollHeight;
    $$('.tl-clip', track).forEach((clip, i) => {
      const el = document.getElementById(chapters[i][0]);
      const next = chapters[i + 1] ? document.getElementById(chapters[i + 1][0]) : null;
      const top = el.getBoundingClientRect().top + scrollY;
      const end = next ? next.getBoundingClientRect().top + scrollY : total;
      clip.style.flexGrow = Math.max(1, end - top);
    });
  }
  function updateTimeline() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const k = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
    head.style.setProperty('--p', k);
    tlTc.textContent = toTC(Math.floor(k * 210 * 25));   // la page dure 3 min 30
  }
  addEventListener('resize', layoutTimeline);
  document.addEventListener('layout:change', layoutTimeline);
  document.addEventListener('timeline:layout', layoutTimeline);
  addEventListener('load', layoutTimeline);

  /* ================= MENU MOBILE ================= */
  const burger = $('#burger');
  const menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('no-scroll', open);
  }
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ================= CLAVIER ================= */
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!lightbox.hidden) closeLightbox();
    else if (!modal.hidden) closeModal();
    else if (menu.classList.contains('is-open')) setMenu(false);
  });

  /* ================= SHOWREEL ================= */
  const reelBtn = $('#showreel-btn');
  if (reelBtn) reelBtn.addEventListener('click', () => {
    lastFocus = reelBtn;
    $('#modal-media').innerHTML = playerHtml(S.showreel.video);
    $('#modal-body').innerHTML = `<div><p class="eyebrow">Showreel</p><h2 id="modal-title">${esc(fullName)}</h2></div>`;
    showModal();
  });

  /* ================= SCROLL ================= */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      lightWords(); updateTimeline();
      $('#nav').classList.toggle('is-solid', scrollY > innerHeight * 0.6);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  layoutTimeline(); lightWords(); updateTimeline();

  /* ================= CHARGEMENT ================= */
  const loader = $('#loader');
  const num = $('#loader-num');
  const bar = $('#loader-bar');
  const duration = reduceMotion || document.documentElement.classList.contains('lite') ? 0 : 1500;
  const start = performance.now();
  let finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    layoutTimeline();
    // Lien direct vers une section (ex. index.html#contact)
    if (location.hash) { const t = document.querySelector(location.hash); if (t) t.scrollIntoView(); }
  }
  (function load(now) {
    const k = duration ? Math.min(1, (now - start) / duration) : 1;
    const eased = 1 - Math.pow(1 - k, 3);
    num.textContent = pad(Math.round(eased * 100));
    bar.style.width = `${eased * 100}%`;
    // attend (4 s maximum) les bibliothèques d'animation si elles chargent encore
    const waiting = window.__animWait && !window.__animWait.done && now - start < 4000;
    if (k < 1 || waiting) return requestAnimationFrame(load);
    // anim.js remplace la sortie simple par l'ouverture du diaphragme
    if (typeof window.__intro === 'function') {
      try { return window.__intro(loader, finish); } catch (err) { console.error(err); }
    }
    plainExit();
  })(start);
  function plainExit() {
    loader.classList.add('is-done');
    finish();
    setTimeout(() => loader.remove(), 1400);
  }
  // Filet de sécurité : quoi qu'il arrive, le site s'affiche
  setTimeout(() => {
    if (!document.body.contains(loader) && finished) return;
    $$('.hero .ch, .hero-kicker, .hero-status, .hero-actions > *, .hero-scroll, .viewfinder *').forEach((el) => { el.style.opacity = 1; });
    if (document.body.contains(loader)) plainExit();
  }, 9000);
})();
