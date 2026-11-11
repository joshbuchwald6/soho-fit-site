/* SOHO Fit — interactions. Vanilla, no dependencies. Everything degrades to plain content. */
(() => {
  'use strict';

  // Form delivery. Leave empty to fall back to the visitor's email app (no fake success).
  // Set to a form backend URL (Formspree, Basin, a serverless function) to post JSON instead.
  const FORM_ENDPOINT = '';
  const FORM_EMAIL = 'benjamin@sohofittampa.com';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Every new page starts at the top (also when the site is shown inside a frame).
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const toTop = () => { if (!location.hash) { window.scrollTo(0, 0); try { document.documentElement.scrollIntoView({ block: 'start' }); } catch (e) {} } };
  toTop();
  window.addEventListener('pageshow', toTop);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  /* ---------- reveal on enter (only elements that opt in) ---------- */
  const revealEls = $$('[data-reveal]');
  revealEls.forEach((el) => {
    const kind = el.getAttribute('data-reveal');
    if (kind === 'rise') el.classList.add('rise');
    el.classList.add('is-armed');
  });
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in', 'is-done'));
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { const t = e.target; t.classList.add('is-in'); setTimeout(() => t.classList.add('is-done'), 1500); io.unobserve(t); }
      }),
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- header: theme follows the section underneath, hides on scroll down ---------- */
  const header = $('[data-header]');
  const themed = $$('[data-theme]').filter((el) => el !== header);
  let lastY = window.scrollY;
  function setHeaderTheme() {
    const probe = (header?.offsetHeight || 76) / 2;
    let theme = 'paper';
    for (const el of themed) {
      const r = el.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { theme = el.getAttribute('data-theme'); }
    }
    header.classList.toggle('on-dark', theme === 'red' || theme === 'ink');
    header.classList.toggle('on-red', theme === 'red');
    header.classList.toggle('on-blue', theme === 'blue');
  }
  function onScrollHeader() {
    const y = window.scrollY;
    header.classList.toggle('is-solid', y > 8);
    if (!document.body.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;
    setHeaderTheme();
  }

  /* ---------- menu ---------- */
  const menu = $('[data-menu]');
  const menuBtn = $('[data-menu-btn]');
  if (menu && menuBtn) {
    menu.hidden = false;
    menu.setAttribute('aria-hidden', 'true');
    menu.inert = true;
    const toggle = (open) => {
      document.body.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      $('[data-menu-label]', menuBtn).textContent = open ? 'Close' : 'Menu';
      menu.setAttribute('aria-hidden', String(!open));
      menu.inert = !open;
      header.classList.remove('is-hidden');
      if (open) $('a', menu)?.focus({ preventScroll: true });
    };
    menuBtn.addEventListener('click', () => toggle(!document.body.classList.contains('menu-open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { toggle(false); menuBtn.focus(); } });
  }

  /* ---------- marquees: steady drift, nudged by scroll velocity ---------- */
  const marquees = $$('[data-marquee]').map((el) => ({ track: $('.marquee__track', el), x: 0, el }));
  let scrollVel = 0;

  /* ---------- hero ---------- */
  const hero = $('[data-hero]');
  let heroVisible = true;

  /* ---------- flexing headline: the type contracts and extends like a muscle ---------- */
  // Archivo is variable in width and weight. Letters load condensed and light, then flex out to
  // expanded black. Near the cursor they contract. On touch screens a slow wave runs through them.
  // Archivo is variable in width and weight. Letters load condensed and light, then flex out to
  // expanded black. After that they contract near the cursor; on touch screens a slow wave runs through.
  const flexers = [];
  function initFlex(h1) {
    if (!h1) return;
    const chars = $$('.ch', h1).map((el, i) => ({ el, i, w: 62, wt: 300, cx: 0, cy: 0 }));
    h1.classList.add('is-flexed');
    if (reduce) return;
    const t0 = performance.now();
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let px = -9999, py = -9999;
    if (fine) {
      hero.addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; });
      hero.addEventListener('pointerleave', () => { px = py = -9999; });
    }
    const introEnd = 120 + chars.length * 45 + 900;
    flexers.push((now) => {
      const el = now - t0;
      const settled = el > introEnd;
      for (const c of chars) {
        const k = ease(clamp((el - 120 - c.i * 45) / 900));
        let tw = 62 + 63 * k, twt = 300 + 600 * k;
        if (settled) {
          let inf = 0;
          if (fine && px > -9999) {
            const r = c.el.getBoundingClientRect();
            const d = Math.hypot(px - (r.left + r.width / 2), (py - (r.top + r.height / 2)) * 1.6);
            inf = Math.exp(-Math.pow(d / 230, 2));
          } else if (!fine) {
            const phase = (now / 1000) * 1.1 - c.i * 0.32;
            inf = Math.pow(Math.max(0, Math.sin(phase)), 12) * 0.85;
          }
          tw = 125 - 58 * inf; twt = 900 - 260 * inf;
          c.w = lerp(c.w, tw, 0.16); c.wt = lerp(c.wt, twt, 0.16);
        } else { c.w = tw; c.wt = twt; }
        c.el.style.setProperty('--w', c.w.toFixed(1) + '%');
        c.el.style.setProperty('--wt', c.wt.toFixed(0));
        c.el.style.opacity = settled ? '' : String(clamp(k * 3));
      }
    });
  }
  if (hero) {
    new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; }).observe(hero);
    $$('[data-flex]', hero).forEach((el) => initFlex(el));
  }

  /* ---------- the one rAF loop ---------- */
  let lastScroll = window.scrollY;
  let lastT = performance.now();
  function frame(now) {
    const dt = Math.min(64, now - lastT); lastT = now;
    const y = window.scrollY;
    const v = (y - lastScroll) / Math.max(dt, 1);
    lastScroll = y;
    scrollVel = lerp(scrollVel, v, 0.1);
    if (!reduce) {
      for (const m of marquees) {
        if (!m.track) continue;
        const setW = m.track.firstElementChild.offsetWidth;
        m.x -= (0.04 + Math.abs(scrollVel) * 0.35) * dt;
        if (-m.x >= setW) m.x += setW;
        m.track.style.transform = `translate3d(${m.x}px,0,0)`;
      }
    }
    if (heroVisible) flexers.forEach((f) => f(now));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- training index: image preview follows the hovered row ---------- */
  $$('[data-tindex]').forEach((idx) => {
    const box = $('[data-tindex-preview]', idx);
    if (!box || !window.matchMedia('(hover: hover) and (min-width: 900px)').matches) return;
    const cache = new Map();
    $$('a[data-preview]', idx).forEach((a) => {
      const src = a.getAttribute('data-preview');
      const show = () => {
        let im = cache.get(src);
        if (!im) { im = new Image(); im.src = src; im.alt = ''; box.appendChild(im); cache.set(src, im); }
        $$('img', box).forEach((x) => x.classList.toggle('is-current', x === im));
        const top = a.offsetTop + a.offsetHeight / 2 - box.offsetHeight / 2;
        box.style.transform = `translateY(${top}px)`;
        box.classList.add('is-on');
      };
      a.addEventListener('mouseenter', show);
      a.addEventListener('focus', show);
    });
    idx.addEventListener('mouseleave', () => box.classList.remove('is-on'));
    idx.addEventListener('focusout', (e) => { if (!idx.contains(e.relatedTarget)) box.classList.remove('is-on'); });
  });

  /* ---------- metrics count up once ---------- */
  const counts = $$('[data-countup]');
  if (counts.length && !reduce && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      const el = e.target, to = +el.getAttribute('data-countup'), t0 = performance.now(), dur = 1400;
      const tick = (now) => { const k = ease(clamp((now - t0) / dur)); el.textContent = String(Math.round(to * k)); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }), { threshold: 0.4 });
    counts.forEach((el) => co.observe(el));
  }

  /* ---------- trainers rail: arrows, drag-to-scroll, progress ---------- */
  const railSec = $('[data-rail]');
  if (railSec) {
    const rail = $('[data-rail-track]', railSec);
    const prev = $('[data-rail-prev]', railSec), next = $('[data-rail-next]', railSec);
    const bar = $('[data-rail-bar]', railSec);
    const step = () => { const c = $('.card', rail); return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle($('.rail__list', rail)).columnGap || 16) : 300; };
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const frac = rail.clientWidth / rail.scrollWidth;
      const p = max > 0 ? rail.scrollLeft / max : 0;
      if (bar) { bar.style.setProperty('--pw', `${Math.max(frac, 0.08) * 100}%`); bar.style.setProperty('--px', `${p * (1 / Math.max(frac, 0.08) - 1) * 100}%`); }
      if (prev) prev.disabled = rail.scrollLeft <= 2;
      if (next) next.disabled = rail.scrollLeft >= max - 2;
    };
    prev && prev.addEventListener('click', () => rail.scrollBy({ left: -step() * 2, behavior: reduce ? 'auto' : 'smooth' }));
    next && next.addEventListener('click', () => rail.scrollBy({ left: step() * 2, behavior: reduce ? 'auto' : 'smooth' }));
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    // drag with a mouse (touch and trackpads scroll natively)
    let down = false, sx = 0, sl = 0, moved = false;
    rail.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
    window.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; rail.classList.add('is-dragging'); } rail.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => rail.classList.remove('is-dragging'), 0); });
    rail.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; } }, true);
    rail.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); rail.scrollBy({ left: step(), behavior: 'smooth' }); } if (e.key === 'ArrowLeft') { e.preventDefault(); rail.scrollBy({ left: -step(), behavior: 'smooth' }); } });
  }

  /* ---------- trainers stage ---------- */
  const stage = $('[data-stage]');
  if (stage) {
    const slides = $$('[data-stage-slides] .slide', stage);
    const photos = $$('[data-stage-photos] img', stage);
    const btns = $$('[data-trainer]', stage);
    let cur = 0;
    const wrap = $('.roster-wrap', stage);
    const bar = $('[data-roster-bar]', stage);
    const lis = $$('.roster li', stage);
    const placeBar = () => {
      if (!bar) return;
      const wr = wrap.getBoundingClientRect(), r = lis[cur].getBoundingClientRect();
      bar.style.setProperty('--bx', `${r.left - wr.left}px`);
      bar.style.setProperty('--bw', `${r.width}px`);
    };
    const go = (i) => {
      if (i === cur) return;
      cur = i;
      placeBar();
      btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
      photos.forEach((p, k) => p.classList.toggle('is-current', k === i));
      if (photos[i].loading === 'lazy') photos[i].loading = 'eager';
      slides.forEach((sl, k) => {
        const on = k === i;
        sl.classList.toggle('is-current', on);
        sl.setAttribute('aria-hidden', String(!on));
        $$('a', sl).forEach((a) => (on ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1')));
      });
    };
    placeBar();
    window.addEventListener('resize', placeBar);
    if (document.fonts) document.fonts.ready.then(placeBar);
    btns.forEach((b) => {
      const i = +b.getAttribute('data-trainer');
      b.addEventListener('click', () => go(i));
      b.addEventListener('mouseenter', () => { if (window.matchMedia('(hover: hover)').matches) go(i); });
    });
    // warm the next few portraits once the section is near
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { photos.forEach((p) => (p.loading = 'eager')); o.disconnect(); } }, { rootMargin: '400px' }).observe(stage);
  }

  /* ---------- how it works: sticky image follows the active step ---------- */
  const exp = $('[data-exp]');
  if (exp && 'IntersectionObserver' in window) {
    const imgs = $$('.exp__media img', exp);
    const steps = $$('[data-step]', exp);
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = +e.target.getAttribute('data-step');
        steps.forEach((s, k) => s.classList.toggle('is-current', k === i));
        imgs.forEach((im, k) => im.classList.toggle('is-current', k === i));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => io.observe(s));
  }

  /* ---------- reviews ---------- */
  const proof = $('[data-proof]');
  if (proof) {
    const items = $$('[data-quote]', proof);
    const count = $('[data-count]', proof);
    let i = 0;
    const show = (n) => {
      i = (n + items.length) % items.length;
      items.forEach((it, k) => { it.classList.toggle('is-current', k === i); it.setAttribute('aria-hidden', String(k !== i)); });
      count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    };
    $('[data-prev]', proof).addEventListener('click', () => show(i - 1));
    $('[data-next]', proof).addEventListener('click', () => show(i + 1));
  }

  /* ---------- studio map: loads when near the viewport, one iframe per studio, cached ---------- */
  $$('[data-smap]').forEach((wrap) => {
    const frame = $('[data-smap-frame]', wrap);
    const tabs = $$('[data-smap-tab]', wrap);
    const dir = $('[data-smap-dir]', wrap);
    const frames = {};
    let active = 0, ready = false;
    const show = (i) => {
      active = i;
      tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
      if (dir) dir.href = tabs[i].dataset.dir;
      if (!ready) return;
      if (!frames[i]) {
        const f = document.createElement('iframe');
        f.src = tabs[i].dataset.src;
        f.title = `Map: SOHO Fit ${tabs[i].textContent}`;
        f.loading = 'lazy';
        f.referrerPolicy = 'no-referrer-when-downgrade';
        f.allowFullscreen = true;
        frame.appendChild(f);
        frames[i] = f;
      }
      Object.entries(frames).forEach(([k, f]) => (f.hidden = Number(k) !== i));
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => show(i)));
    const go = () => { if (ready) return; ready = true; show(active); };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { go(); io.disconnect(); } }, { rootMargin: '600px 0px' });
      io.observe(wrap);
    } else go();
  });

  /* ---------- booking form ---------- */
  const form = $('[data-book-form]');
  if (form) {
    const q = new URLSearchParams(location.search);
    if (q.get('interest')) form.interest.value = q.get('interest');
    if (q.get('trainer')) form.trainer.value = q.get('trainer');
    if (q.get('studio')) { const r = $(`input[name="studio"][value="${CSS.escape(q.get('studio'))}"]`, form); if (r) r.checked = true; }

    const setErr = (name, msg) => {
      const input = form[name];
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      const e = $(`[data-err="${name}"]`, form);
      e.textContent = msg;
      if (msg) { e.id = `err-${name}`; input.setAttribute('aria-describedby', e.id); } else input.removeAttribute('aria-describedby');
    };
    const validate = () => {
      let ok = true, first = null;
      const need = (n, test, msg) => { const bad = !test(form[n].value.trim()); setErr(n, bad ? msg : ''); if (bad) { ok = false; first = first || form[n]; } };
      need('name', (v) => v.length > 1, 'Please add your name.');
      need('phone', (v) => v.replace(/\D/g, '').length >= 10, 'Please add a phone number we can call or text.');
      need('email', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Please add a valid email.');
      if (first) first.focus();
      return ok;
    };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) return;
      const fd = Object.fromEntries(new FormData(form).entries());
      const label = (sel) => sel.options[sel.selectedIndex]?.text || '';
      const studio = $('input[name="studio"]:checked', form)?.parentElement.textContent.trim() || '';
      const done = $('[data-form-done]');
      if (FORM_ENDPOINT) {
        try {
          const res = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...fd, studio }) });
          if (!res.ok) throw new Error('bad status');
          $('h2', done).textContent = 'Thank you.';
          $('[data-done-msg]', done).textContent = 'We have your request. A trainer will be in touch soon to set up your free consultation.';
        } catch {
          $('[data-form-note]', form).textContent = 'Something went wrong sending that. Please call or text 813-586-0760.';
          return;
        }
      } else {
        const body = [
          `Name: ${fd.name}`, `Phone: ${fd.phone}`, `Email: ${fd.email}`,
          `Where: ${studio}`, `Interested in: ${label(form.interest)}`, `Trainer: ${label(form.trainer)}`,
          '', fd.message || '',
        ].join('\n');
        location.href = `mailto:${FORM_EMAIL}?subject=${encodeURIComponent('Free consultation request: ' + fd.name)}&body=${encodeURIComponent(body)}`;
      }
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
  }
})();
