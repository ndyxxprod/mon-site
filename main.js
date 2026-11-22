'use strict';
/* ==================================================================
   PORTFOLIO NDIMBY — main.js
   Construit les pages à partir de contenu.js. Pas besoin de modifier ce fichier.
   Pages : accueil (index.html) et projets (projets.html).
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
  const page = document.body.dataset.page;
  const fullName = `${S.firstName} ${S.lastName}`;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* stockage indisponible */ } }
  };
  const watchVisible = (el, cb) => {
    if (!el || !('IntersectionObserver' in window)) return cb(true);
    new IntersectionObserver((e) => cb(e[0].isIntersecting), { rootMargin: '120px' }).observe(el);
  };

  /* ================= AMBIANCE (palette) ================= */
  const palettes = S.palettes || {};
  function applyPalette(key) {
    const p = palettes[key];
    if (!p) return;
    const root = document.documentElement.style;
    // chaque ambiance change les fonds, les textes et les couleurs vives de tout le site
    ['bg', 'bg2', 'fg', 'paper', 'ink', 'c1', 'c2', 'c3'].forEach((k) => {
      if (p[k]) root.setProperty(k === 'bg2' ? '--bg-2' : `--${k}`, p[k]);
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && p.bg) meta.setAttribute('content', p.bg);
    document.documentElement.dataset.palette = key;
    const name = $('#palette-name');
    if (name) name.textContent = p.name;
    $$('.swatch').forEach((s) => s.setAttribute('aria-pressed', s.dataset.key === key));
  }
  const savedPalette = S.showPalettePicker ? store.get('ndy-palette') : null;
  applyPalette(palettes[savedPalette] ? savedPalette : S.palette);
  if (S.showPalettePicker && Object.keys(palettes).length > 1) {
    const picker = $('#palette');
    $('#palette-swatches').innerHTML = Object.entries(palettes).map(([k, p]) =>
      `<button type="button" class="swatch" data-key="${esc(k)}" aria-label="Ambiance ${esc(p.name)}" aria-pressed="${k === document.documentElement.dataset.palette}"
        style="--sb:${p.bg};--s1:${p.c1};--s2:${p.c2}"></button>`).join('');
    picker.hidden = false;
    picker.addEventListener('click', (e) => {
      const sw = e.target.closest('.swatch');
      if (!sw) return;
      applyPalette(sw.dataset.key);
      store.set('ndy-palette', sw.dataset.key);
    });
  }

  /* ================= VIDÉOS ET IMAGES ================= */
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
  function ytId(url) {
    const m = (url || '').match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : '';
  }
  S.projects.forEach((p) => {
    // plusieurs séries de photos : la galerie à plat sert à la visionneuse
    if (p.galleries && p.galleries.length) p.gallery = p.galleries.flatMap((g) => g.photos);
    // sans photo, la miniature YouTube sert de couverture
    const id = ytId(p.video);
    if (!p.cover && id) { p.cover = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`; p.coverFallback = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; }
  });
  const byId = (id) => S.projects.findIndex((p) => p.id === id);

  // Affiche générée quand il n'y a pas de photo
  function posterHtml(p, { play = false } = {}) {
    const [c1, c2] = p.colors || ['#333', '#111'];
    return `<div class="poster" style="--p1:${c1};--p2:${c2}">
      <div class="poster-top"><span>${esc(p.type)}</span><span>${esc(p.year)}</span></div>
      ${play ? '<span class="poster-play">▶</span>' : ''}
      <div class="poster-title">${esc(p.short || p.title)}</div>
    </div>`;
  }
  // Image d'un projet : vignette légère si elle existe, sinon la couverture, sinon une affiche
  function imgHtml(p) {
    const src = p.thumb || p.cover;
    if (!src) return posterHtml(p);
    // si la miniature ne charge pas : image de secours, puis on la cache (le fond de la tuile reste propre)
    const fb = !p.thumb && p.coverFallback ? esc(p.coverFallback) : '';
    return `<img src="${esc(src)}" alt="" loading="lazy" draggable="false" onerror="if(!this.dataset.f&&'${fb}'){this.dataset.f=1;this.src='${fb}';}else{this.style.visibility='hidden';}" />`;
  }

  /* ================= ACCUEIL ================= */
  if (page === 'home') {
    $('#hero-kicker').textContent = `${fullName} · ${S.city}`;
    $('#hero-status').textContent = S.status;
    const lines = S.heroLines && S.heroLines.length ? S.heroLines : [S.firstName];
    $('#hero-title').innerHTML = lines.map((l, i) => `<span class="line"><span class="word" style="--i:${i}">${esc(l)}</span></span>`).join('');
    $('#hero-title').setAttribute('aria-label', lines.join(' '));

    /* ---------- Photos autour du titre : une par projet, cliquables ---------- */
    (() => {
      const wrap = $('#hero-floats');
      wrap.innerHTML = (S.heroPhotos || []).map((ph) => {
        const i = byId(ph.p);
        const p = S.projects[i];
        if (!p) return '';
        const inner = ph.img ? `<img src="${esc(ph.img)}" alt="" draggable="false" />` : imgHtml(p);
        return `<button class="float ${esc(ph.slot)}" type="button" data-index="${i}" data-cursor="Voir" aria-label="${esc(p.title)} — voir le projet">${inner}</button>`;
      }).join('');
      // elles apparaissent une seule fois, l'une après l'autre, puis restent en place
      $$('.float', wrap).filter((el) => getComputedStyle(el).display !== 'none')
        .forEach((el, k) => setTimeout(() => el.classList.add('is-on'), 600 + k * 240));
      wrap.addEventListener('click', (e) => {
        const b = e.target.closest('.float');
        if (b) openProject(+b.dataset.index);
      });
    })();

    /* ---------- Projets sélectionnés : bandeau qui défile ---------- */
    (() => {
      const track = $('#work-track');
      const shapes = ['l', 'l', 'p', 'p', 'l', 'l', 's'];
      const drops = [70, 0, 120, 30, 90, 10, 60];
      const one = (p, i, clone) => `
        <li class="tile tile-${shapes[i % shapes.length]}" style="--dy:${drops[i % drops.length]}px"${clone ? ' aria-hidden="true"' : ''}>
          <button class="tile-btn" type="button" data-index="${i}" data-cursor="Voir"${clone ? ' tabindex="-1"' : ''} aria-label="${esc(p.title)} — voir le projet">
            <span class="tile-img">${imgHtml(p)}</span>
            <span class="tile-cap"><span>${esc(p.short || p.title)}</span><span>${esc(p.year)}</span></span>
          </button>
        </li>`;
      track.innerHTML = S.projects.map((p, i) => one(p, i, false)).join('') + S.projects.map((p, i) => one(p, i, true)).join('');
      track.addEventListener('click', (e) => {
        const b = e.target.closest('.tile-btn');
        if (b) openProject(+b.dataset.index);
      });
      const section = $('#selection');
      watchVisible(section, (v) => section.classList.toggle('is-offscreen', !v));
    })();

    /* ---------- Phrase géante : un aperçu suit la souris ---------- */
    (() => {
      const st = $('#statement');
      st.innerHTML = (S.statement || []).map((t) => (typeof t === 'string'
        ? esc(t)
        : `<button class="kw" type="button" data-p="${esc(t.p)}">${esc(t.w)}</button>`)).join('');
      st.addEventListener('click', (e) => {
        const kw = e.target.closest('.kw');
        if (kw && byId(kw.dataset.p) >= 0) openProject(byId(kw.dataset.p));
      });
      if (!finePointer) return;
      const pv = $('#preview');
      let tx = 0, ty = 0, x = 0, y = 0, on = false, raf = 0;
      const loop = () => {
        x += (tx - x) * 0.17; y += (ty - y) * 0.17;
        pv.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        raf = Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;   // s'arrête quand la souris est immobile
      };
      const move = (e) => {
        tx = e.clientX; ty = e.clientY - 150;
        if (on && !raf) raf = requestAnimationFrame(loop);
      };
      const kinds = $('#categories');
      kinds.addEventListener('mousemove', move, { passive: true });
      st.addEventListener('mouseover', (e) => {
        const kw = e.target.closest('.kw');
        if (!kw) return;
        const p = S.projects[byId(kw.dataset.p)];
        if (!p) return;
        pv.innerHTML = imgHtml(p);
        on = true;
        if (!pv.classList.contains('is-visible')) { x = tx; y = ty; }
        pv.classList.add('is-visible');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      st.addEventListener('mouseout', (e) => {
        if (e.target.closest('.kw') && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.kw'))) {
          on = false; pv.classList.remove('is-visible');
        }
      });
    })();

    /* ---------- Ils m'ont fait confiance ---------- */
    $('#client-grid').innerHTML = (S.clients || []).map((c) => {
      const i = byId(c.p);
      const p = S.projects[i];
      const bg = c.img ? `<img src="${esc(c.img)}" alt="" loading="lazy" draggable="false" />` : imgHtml(p);
      return `<li class="client">
        <button class="client-btn" type="button" data-index="${i}" aria-label="${esc(c.name)} — voir le projet">
          <span class="client-bg">${bg}</span>
          <span class="client-name">${esc(c.name)}</span>
          <span class="client-kind">${esc(c.kind)}</span>
        </button>
      </li>`;
    }).join('') + `<li class="client client-cta"><a class="client-btn" href="#contact"><span class="client-name">Et vous&nbsp;?</span><span class="client-kind">Parlons de votre projet →</span></a></li>`;
    $('#client-grid').addEventListener('click', (e) => {
      const b = e.target.closest('.client-btn');
      if (b && +b.dataset.index >= 0) openProject(+b.dataset.index);
    });
  }

  /* ================= PAGE PROJETS ================= */
  if (page === 'works') {
    const track = $('#works-track');
    const strip = $('#works-strip');
    track.innerHTML = S.projects.map((p, i) => `
      <li class="wt">
        <button class="wt-btn" type="button" data-index="${i}" data-cursor="Voir" aria-label="${esc(p.title)} — voir le projet">
          <span class="wt-img">${imgHtml(p)}</span>
          <span class="wt-meta"><span>${esc((p.tags && p.tags[0]) || p.type)}</span><span>${esc(p.year)}</span></span>
          <span class="wt-title">${esc(p.short || p.title)}</span>
        </button>
      </li>`).join('');
    $('#works-count').textContent = `(${pad(S.projects.length)}) projets`;
    track.addEventListener('click', (e) => {
      if (strip._dragged) return;
      const b = e.target.closest('.wt-btn');
      if (b) openProject(+b.dataset.index);
    });

    // Le mot « Projets » remplit toute la largeur de l'écran
    const title = $('#works-title');
    const word = $('#works-word');
    const gutter = () => parseFloat(getComputedStyle(title).paddingLeft) || 20;
    function fitTitle() {
      title.style.fontSize = '100px';
      const w = word.getBoundingClientRect().width;
      if (w > 0) title.style.fontSize = `${(100 * (innerWidth - gutter() * 2)) / w}px`;
    }
    fitTitle();
    addEventListener('resize', fitTitle);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitle);

    // Défilement horizontal : glisser, molette, flèches, barre de progression
    const bar = $('#works-bar');
    const progress = () => {
      const max = strip.scrollWidth - strip.clientWidth;
      bar.style.transform = `scaleX(${max > 0 ? clamp(strip.scrollLeft / max, 0, 1) : 1})`;
    };
    strip.addEventListener('scroll', progress, { passive: true });
    addEventListener('resize', progress);
    progress();
    strip.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = strip.scrollWidth - strip.clientWidth;
      if ((strip.scrollLeft <= 0 && e.deltaY < 0) || (strip.scrollLeft >= max - 1 && e.deltaY > 0)) return;
      e.preventDefault();
      strip.scrollLeft += e.deltaY;
    }, { passive: false });
    $$('[data-w]').forEach((b) => b.addEventListener('click', () => {
      const w = $('.wt', strip).offsetWidth + 40;
      strip.scrollBy({ left: +b.dataset.w * w * 1.5, behavior: reduceMotion ? 'auto' : 'smooth' });
    }));
    let down = null;
    strip.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = { x: e.clientX, left: strip.scrollLeft };
      strip._dragged = false;
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (Math.abs(dx) > 6) { strip._dragged = true; strip.classList.add('is-drag'); }
      if (strip._dragged) strip.scrollLeft = down.left - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = null;
      strip.classList.remove('is-drag');
      setTimeout(() => { strip._dragged = false; }, 0);
    });
  }

  /* ================= CURSEUR (bulle « Voir ») ================= */
  const cursor = $('#cursor');
  const cursorLabel = $('#cursor-label');
  if (finePointer && cursor) {
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, following = false;
    const follow = () => {
      cx += (mx - cx) * 0.35; cy += (my - cy) * 0.35;
      cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      if (Math.abs(mx - cx) > 0.3 || Math.abs(my - cy) > 0.3) requestAnimationFrame(follow);
      else following = false;
    };
    addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.classList.add('is-visible');
      if (!following) { following = true; requestAnimationFrame(follow); }
    }, { passive: true });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
    document.addEventListener('mouseover', (e) => {
      const label = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, .chip');
      cursor.classList.toggle('is-label', !!label);
      cursor.classList.toggle('is-hover', !label && !!link);
      cursorLabel.textContent = label ? label.dataset.cursor : '';
    });
  }

  /* ================= FICHE PROJET ================= */
  const modal = $('#modal');
  let lastFocus = null;
  let currentGallery = null;
  let currentVideos = null;
  function showModal() {
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    $('.modal-panel', modal).scrollTop = 0;
    $('.modal-close', modal).focus({ preventScroll: true });
  }
  function openProject(i) {
    const p = S.projects[i];
    if (!p) return;
    const media = $('#modal-media');
    if (p.video) {
      media.innerHTML = playerHtml(p.video);
    } else if (p.gallery && p.gallery.length) {
      media.innerHTML = `<button class="modal-hero" type="button" data-gal="${Math.max(0, p.gallery.indexOf(p.cover))}" aria-label="Voir les photos en grand"><img src="${esc(p.cover || p.gallery[0])}" alt="${esc(p.title)}" /></button>`;
    } else {
      media.innerHTML = posterHtml(p);
      media.firstElementChild.insertAdjacentHTML('beforeend', p.link
        ? `<a class="btn btn-light modal-link" href="${esc(p.link.url)}" target="_blank" rel="noopener">${esc(p.link.label)} <span>↗</span></a>`
        : `<span class="modal-soon">${p.type === 'Photo' ? 'Photos' : 'Vidéo'} bientôt en ligne</span>`);
    }
    const facts = [['Client', p.client], ['Rôle', p.role], ['Durée', p.duration], ['Outils', (p.tools || []).join(', ')]]
      .filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    const prev = (i - 1 + S.projects.length) % S.projects.length;
    const next = (i + 1) % S.projects.length;
    $('#modal-body').innerHTML = `
      <p class="pj-meta">${esc(p.category === 'pro' ? 'Projet pro' : 'Projet scolaire')} · ${esc(p.year)}</p>
      <h2 class="pj-title" id="modal-title">${esc(p.title)}${p.kind ? ` <em>| ${esc(p.kind)}</em>` : ''}</h2>
      <div class="pj-desc"><i aria-hidden="true"></i><p>${esc(p.description)}</p></div>
      <dl class="pj-facts">${facts}</dl>
      ${p.link ? `<p class="pj-extra"><a class="btn" href="${esc(p.link.url)}" target="_blank" rel="noopener">${esc(p.link.label)} ↗</a></p>` : ''}
      ${p.videos && p.videos.length > 1 ? `
      <div class="modal-gallery">
        <p class="pj-meta">${p.videos.length} vidéos · clique pour lancer</p>
        <div class="vid-list">${p.videos.map((v, k) => {
          const id = ytId(v.url);
          return `<button class="vid-item${k === 0 ? ' is-active' : ''}" type="button" data-vid="${k}">
            ${id ? `<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" />` : '<span class="vid-ph"></span>'}
            <span class="vid-play">▶</span>
            <span class="vid-title"><em>${pad(k + 1)}</em>${esc(v.title)}</span>
          </button>`;
        }).join('')}</div>
      </div>` : ''}
      ${p.gallery && p.gallery.length ? `
      <div class="modal-gallery">
        <p class="pj-meta">${p.gallery.length} photos · clique pour agrandir</p>
        ${(p.galleries && p.galleries.length ? p.galleries : [{ title: '', photos: p.gallery }]).map((g, gi, all) => {
          const start = all.slice(0, gi).reduce((n, x) => n + x.photos.length, 0);
          return `${g.title ? `<h3 class="gal-title">${esc(g.title)}<span>${g.photos.length} photos</span></h3>` : ''}
          <div class="gal-grid">${g.photos.map((src, k) => `<button class="gal-item" type="button" data-gal="${start + k}" aria-label="${esc(g.title || 'Photo')} — photo ${k + 1} sur ${g.photos.length}"><img src="${esc(src)}" alt="" loading="lazy" /></button>`).join('')}</div>`;
        }).join('')}
      </div>` : ''}
      <div class="pj-nav">
        <button type="button" data-go="${prev}">← ${esc(S.projects[prev].short)}</button>
        <button type="button" data-go="${next}">${esc(S.projects[next].short)} →</button>
      </div>`;
    currentGallery = p.gallery && p.gallery.length ? p.gallery : null;
    currentVideos = p.videos && p.videos.length > 1 ? p.videos : null;
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
  modal.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) return openProject(+go.dataset.go);
    const vid = e.target.closest('[data-vid]');
    if (vid && currentVideos) {
      $('#modal-media').innerHTML = playerHtml(currentVideos[+vid.dataset.vid].url);
      $$('.vid-item', modal).forEach((b) => b.classList.toggle('is-active', b === vid));
      $('.modal-panel', modal).scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }
    const gal = e.target.closest('[data-gal]');
    if (gal && currentGallery) return openLightbox(currentGallery, +gal.dataset.gal);
    if (e.target.closest('[data-close]')) closeModal();
  });

  /* ================= VISIONNEUSE ================= */
  const lightbox = $('#lightbox');
  let lbList = [], lbIndex = 0, lbTitle = '';
  function showLb() {
    const img = $('#lightbox-img');
    img.src = lbList[lbIndex];
    img.alt = lbList.length > 1 ? `Photo ${lbIndex + 1} sur ${lbList.length}` : `Planche — ${lbTitle}`;
    $('#lb-count').textContent = lbList.length > 1 ? `${lbIndex + 1} / ${lbList.length}` : '';
    lightbox.classList.toggle('is-single', lbList.length < 2);
  }
  function openLightbox(src, start) {
    // openLightbox('planche.jpg', 'Titre') ou openLightbox([photos], index)
    if (Array.isArray(src)) { lbList = src; lbIndex = start || 0; lbTitle = ''; }
    else { lbList = [src]; lbIndex = 0; lbTitle = start || ''; }
    showLb();
    lightbox.hidden = false;
    document.body.classList.add('no-scroll');
  }
  function stepLb(d) {
    if (lbList.length < 2) return;
    lbIndex = (lbIndex + d + lbList.length) % lbList.length;
    showLb();
  }
  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    if (modal.hidden) document.body.classList.remove('no-scroll');
  }
  lightbox.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-lb]');
    if (nav) return stepLb(+nav.dataset.lb);
    if (e.target.id === 'lightbox-img' && lbList.length > 1) return stepLb(1);
    closeLightbox();
  });
  let lbTouch = null;
  lightbox.addEventListener('touchstart', (e) => { lbTouch = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (lbTouch === null) return;
    const dx = e.changedTouches[0].clientX - lbTouch;
    if (Math.abs(dx) > 50) stepLb(dx < 0 ? 1 : -1);
    lbTouch = null;
  });

  /* ================= À PROPOS : un clap de cinéma ================= */
  if (page === 'home') {
    $('#about-lead').innerHTML = `<span>Moi c'est ${esc(S.firstName)},</span><span>${esc(S.role.toLowerCase())}.</span>`;
    $('#clap-photo').innerHTML = S.avatar ? `<img src="${esc(S.avatar)}" alt="Portrait de ${esc(fullName)}" loading="lazy" />` : '';
    $('#clap-year').textContent = new Date().getFullYear();
    const formation = (S.path.find((x) => /BUT|IUT/i.test(x.title)) || {}).title;
    $('#clap-facts').innerHTML = [['Réalisateur', fullName], ['Base', S.city], ['Formation', formation], ['Statut', S.status]]
      .filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    $('#clap').classList.add('reveal');
    // le texte « à propos », en trois scènes
    $('#scenes').innerHTML = [['Depuis toujours', S.manifesto], ['Aujourd\'hui', S.bio[0]], ['Mon métier', S.bio[1]]]
      .filter(([, t]) => t).map(([t, txt], i) => `
      <article class="scene reveal"><span class="scene-n">${pad(i + 1)}</span><div><h3>${esc(t)}</h3><p>${esc(txt)}</p></div></article>`).join('');
    const li = (arr) => arr.map((x) => `<li>${esc(x)}</li>`).join('');
    $('#skills').innerHTML = li(S.skills);
    $('#tools').innerHTML = li(S.tools);
    $('#path').innerHTML = `<div class="about-col"><h3>Parcours</h3></div>` + S.path.map((p) => `
      <div class="path-item reveal"><span class="path-year">${esc(p.year)}</span><div><h4>${esc(p.title)}</h4><p>${esc(p.text)}</p></div></div>`).join('');
  }

  /* ================= CONTACT ================= */
  const emailLink = $('#contact-email');
  emailLink.textContent = S.email;
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
  ['hero', 'contact'].forEach((id) => {
    const el = document.getElementById(id);
    watchVisible(el, (v) => el && el.classList.toggle('is-offscreen', !v));
  });

  /* ================= TIMELINE DE MONTAGE ================= */
  // Chaque section = un clip sur la timeline ; la tête de lecture suit le scroll
  const chapters = page === 'home'
    ? [['hero', 'Intro'], ['selection', 'Projets'], ['categories', 'Métier'], ['clients', 'Clients'], ['a-propos', 'À propos'], ['contact', 'Contact']]
    : [['top', 'Projets'], ['contact', 'Contact']];
  const tlTrack = $('#tl-track');
  const tlHead = $('#tl-head');
  const tlTc = $('#tl-tc');
  const toTC = (f) => `${pad(Math.floor(f / 90000))}:${pad(Math.floor(f / 1500) % 60)}:${pad(Math.floor(f / 25) % 60)}:${pad(f % 25)}`;
  tlTrack.innerHTML = chapters.map(([id, label], i) => `<a class="tl-clip" href="#${id}" style="--k:${i}"><span>${label}</span></a>`).join('');
  const tlClips = $$('.tl-clip', tlTrack);
  let tlTops = [];
  function layoutTimeline() {
    const total = document.documentElement.scrollHeight;
    tlTops = chapters.map(([id]) => {
      const el = document.getElementById(id);
      return el ? el.getBoundingClientRect().top + scrollY : 0;
    });
    tlClips.forEach((clip, i) => {
      const end = tlTops[i + 1] !== undefined ? tlTops[i + 1] : total;
      clip.style.flexGrow = Math.max(1, end - tlTops[i]);
    });
  }
  function updateTimeline() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const k = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
    tlHead.style.setProperty('--p', k);
    tlTc.textContent = toTC(Math.floor(k * 210 * 25));   // la page dure 3 min 30
    let cur = 0;
    tlTops.forEach((t, i) => { if (scrollY + innerHeight * 0.4 >= t) cur = i; });
    tlClips.forEach((c, i) => c.classList.toggle('is-current', i === cur));
  }
  addEventListener('resize', layoutTimeline);
  addEventListener('load', () => { layoutTimeline(); updateTimeline(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layoutTimeline(); updateTimeline(); });

  /* ================= MENU ET NAVIGATION ================= */
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

  // Le menu se cache quand on descend et revient quand on remonte
  const nav = $('#nav');
  let lastY = 0, ticking = false;
  function onScroll() {
    const y = scrollY;
    if (y < 80) nav.classList.remove('is-hidden');
    else if (y > lastY + 6 && !menu.classList.contains('is-open')) nav.classList.add('is-hidden');
    else if (y < lastY - 6) nav.classList.remove('is-hidden');
    nav.classList.toggle('is-solid', y > (page === 'home' ? innerHeight * 0.6 : 60));
    updateTimeline();
    if (Math.abs(y - lastY) > 6) lastY = y;
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  layoutTimeline();
  onScroll();

  addEventListener('keydown', (e) => {
    if (!lightbox.hidden && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) return stepLb(e.key === 'ArrowRight' ? 1 : -1);
    if (e.key !== 'Escape') return;
    if (!lightbox.hidden) closeLightbox();
    else if (!modal.hidden) closeModal();
    else if (menu.classList.contains('is-open')) setMenu(false);
  });

  /* ================= APPARITIONS AU SCROLL ================= */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('is-in'));
  }

  // Lien direct vers une section (ex. index.html#contact) une fois la page construite
  addEventListener('load', () => {
    if (location.hash) { const t = document.querySelector(location.hash); if (t) t.scrollIntoView(); }
  });
})();
