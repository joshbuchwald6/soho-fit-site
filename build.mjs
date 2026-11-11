// SOHO Fit static site builder. Zero runtime dependencies.
//   node build.mjs              -> dist/ with clean URLs (deploy)
//   LINKS=file node build.mjs   -> dist/ with explicit index.html links (preview / file://)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { business, studios, services, trainers, testimonials, nav } from './src/data.mjs';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dir, 'src');
const ROOT = SRC; // content copied from the original site archive lives in src/content
const OUT = path.join(__dir, process.env.OUT || 'dist');
const FILE_LINKS = process.env.LINKS === 'file';

const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const imgManifest = readJSON(path.join(SRC, 'img', 'image-manifest.json'));
const faqsAll = readJSON(path.join(ROOT, 'content', 'faqs', 'faqs.json'));
const testimonialsArchive = readJSON(path.join(ROOT, 'content', 'testimonials', 'testimonials.json'));

// ---------- integrity checks: never ship a review that isn't verbatim ----------
for (const t of testimonials) {
  const src = testimonialsArchive.find((x) => x.id === t.id);
  if (!src || src.author !== t.author) throw new Error(`Testimonial ${t.id} author mismatch`);
  const body = t.text.replace(/^…/, '');
  if (!src.quote.includes(body)) throw new Error(`Testimonial ${t.id} is not verbatim`);
}

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let DEPTH = 0; // set per page
const L = (target = '') => {
  // target is site-relative: '' (home), 'training/', 'training/in-studio/', 'assets/x.css', '#id'
  if (target.startsWith('http') || target.startsWith('tel:') || target.startsWith('sms:') || target.startsWith('mailto:') || target.startsWith('#')) return target;
  const up = '../'.repeat(DEPTH);
  let t = target;
  if (FILE_LINKS && (t === '' || t.endsWith('/'))) t += 'index.html';
  if (!FILE_LINKS && t === '') return up || './';
  return up + t;
};

function img(key, { alt, cls = '', sizes = '100vw', lazy = true, pos, duo, trainer } = {}) {
  let entry;
  if (trainer) entry = imgManifest.trainers[key];
  else if (duo) entry = imgManifest.duotones[key];
  else entry = imgManifest.photos[key];
  if (!entry) throw new Error('Missing image ' + key);
  const v = [...entry.variants].sort((a, b) => a.w - b.w);
  const big = v[v.length - 1];
  const srcset = v.map((x) => `${L('assets/img/' + x.file)} ${x.w}w`).join(', ');
  const style = pos ? ` style="object-position:${pos}"` : '';
  return `<img src="${L('assets/img/' + big.file)}" srcset="${srcset}" sizes="${sizes}" width="${big.w}" height="${big.h}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''}${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}${style}>`;
}
const duoOf = (key) => (imgManifest.duotones[key] ? { duo: true } : {});

function md(s = '') {
  // minimal, safe markdown: paragraphs, **b**, *i*, [t](u). Archive answers hard-wrap lines.
  const paras = s.replace(/\r/g, '').split(/\n\s*\n|\s{2,}(?=[A-Z“"])/).map((p) => p.replace(/\n/g, ' ').trim()).filter(Boolean);
  return paras
    .map((p) => {
      let h = esc(p);
      h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
      h = h.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, (m, t, u) => {
        const internal = mapOldUrl(u);
        return internal !== null ? `<a href="${L(internal)}">${t}</a>` : t;
      });
      return `<p>${h}</p>`;
    })
    .join('\n');
}

function mapOldUrl(u) {
  const p = u.replace('https://sohofittampa.com', '').replace(/\?.*$/, '');
  for (const s of services) if (s.old.includes(p)) return `training/${s.slug}/`;
  const tr = trainers.find((t) => p === `/${t.slug}/`);
  if (tr) return `trainers/${tr.slug}/`;
  return null;
}

const lines = (arr, cls = '') => `<span class="lines ${cls}" data-reveal>${arr.map((l) => `<span class="ln"><span>${l}</span></span>`).join('')}</span>`;
const arrow = '<span class="arr" aria-hidden="true">→</span>';
const phonePretty = business.phone;
const dirUrl = (st) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(st.q)}`;
const embedUrl = (st) => `https://www.google.com/maps?q=${encodeURIComponent(st.q)}&z=16&output=embed`;
function mapBlock() {
  return `<div class="smap" data-smap>
    <div class="smap__bar"><div class="smap__tabs" role="tablist" aria-label="Choose a studio">${studios
      .map((st, i) => `<button type="button" role="tab" class="smap__tab" aria-selected="${i === 0}" data-smap-tab="${i}" data-src="${esc(embedUrl(st))}" data-dir="${esc(dirUrl(st))}">${esc(st.name)}</button>`)
      .join('')}</div><a class="tlink smap__dir" href="${esc(dirUrl(studios[0]))}" target="_blank" rel="noopener" data-smap-dir>Directions ↗</a></div>
    <div class="smap__frame" data-smap-frame><p class="smap__ph">${studios.map((st) => `${esc(st.name)}: ${st.street}`).join('<br>')}</p></div>
  </div>`;
}

function marquee(items, size = 'sm') {
  const set = items
    .map((t, i) => `<span class="xp">${esc(t)}</span><span class="dot ${i % 2 ? 'r' : 'b'}"></span>`)
    .join('');
  return `<div class="marquee marquee--${size}" aria-hidden="true" data-marquee><div class="marquee__track"><span class="marquee__set">${set}</span><span class="marquee__set">${set}</span><span class="marquee__set">${set}</span></div></div>`;
}

// ---------- layout ----------
function layout({ title, description, body, path: pagePath, current = '', headTheme = 'paper', jsonld = null, ogImage = null }) {
  const canonical = business.siteUrl + '/' + pagePath;
  const navLinks = nav
    .map((n) => `<a class="hide-sm" href="${L(n.href)}"${current === n.href ? ' aria-current="page"' : ''}>${n.label}</a>`)
    .join('');
  const menuItems = [
    { href: '', label: 'Home' },
    ...nav,
    { href: 'book/', label: 'Book' },
  ]
    .map((n, i) => `<li><a href="${L(n.href)}"${current === n.href ? ' aria-current="page"' : ''}><span class="label">0${i + 1}</span><span class="xp">${n.label}</span></a></li>`)
    .join('');
  const og = ogImage ? `<meta property="og:image" content="${business.siteUrl}/assets/img/${ogImage}">` : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="SOHO Fit Tampa">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
${og}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#d03d4d">
<link rel="icon" href="${L('assets/img/favicon.png')}" type="image/png">
<link rel="preload" href="${L('assets/fonts/archivo-latin-standard-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${L('assets/fonts/inter-tight-latin-wght-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${L('assets/css/site.css')}">
<script>document.documentElement.classList.add('js')</script>
${FILE_LINKS ? '' : `<script type="module">import { inject } from '/assets/js/vercel-analytics.mjs'; inject();</script>`}
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header" data-header data-theme="${headTheme}">
  <a class="logo" href="${L('')}" aria-label="SOHO Fit home">
    <img class="l-dark" src="${L('assets/img/logo-dark.png')}" alt="SOHO Fit Personal Training Fitness Studio" width="1400" height="458">
    <img class="l-light" src="${L('assets/img/logo-light.png')}" alt="" width="1201" height="430">
    <img class="l-white" src="${L('assets/img/logo-white.png')}" alt="" width="1400" height="458">
  </a>
  <nav class="site-nav" aria-label="Main">
    ${navLinks}
    <a class="pill pill--sm" href="${L('book/')}">Book<span class="long">&nbsp;a free consult</span></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu-btn><span class="bars" aria-hidden="true"></span><span data-menu-label>Menu</span></button>
  </nav>
</header>
<div class="menu" id="menu" data-menu hidden>
  <nav aria-label="Full menu"><ol>${menuItems}</ol></nav>
  <div class="menu-foot">
    <a href="${business.phoneHref}">Call or text ${phonePretty}</a>
    <span>${studios.map((s) => `${s.name}: ${s.street}`).join(' · ')}</span>
    <a href="${business.instagram}" rel="noopener">Instagram @sohofittampa</a>
  </div>
</div>
<main id="main">
${body}
</main>
${footer()}
<script src="${L('assets/js/site.js')}" defer></script>
</body>
</html>`;
}

function footer() {
  return `<footer class="site-footer" data-theme="ink">
  <div class="top">
    <img src="${L('assets/img/logo-white.png')}" alt="SOHO Fit Personal Training Fitness Studio" width="1400" height="458" loading="lazy">
    <a class="pill" href="${L('book/')}">Book your free consultation ${arrow}</a>
  </div>
  <div class="cols">
    ${studios
      .map(
        (s) => `<div class="col"><span class="label">${s.name}</span><address style="font-style:normal">${s.street}${s.unit ? ', ' + s.unit : ''}<br>${s.city}</address><a href="${esc(dirUrl(s))}" target="_blank" rel="noopener">Directions ↗</a></div>`
      )
      .join('')}
    <div class="col"><span class="label">Hours</span>${business.hours.map(([d, h]) => `<span>${d}<br>${h}</span>`).join('')}</div>
    <div class="col"><span class="label">Talk to a trainer</span><a href="${business.phoneHref}">Call ${phonePretty}</a><a href="${business.smsHref}">Text ${phonePretty}</a><a href="${business.instagram}" rel="noopener">Instagram ↗</a><a href="${business.giftCards}" rel="noopener">Gift cards ↗</a></div>
    <div class="col"><span class="label">Explore</span><a href="${L('training/')}">Training</a><a href="${L('trainers/')}">Trainers</a><a href="${L('studios/')}">Studios &amp; FAQ</a><a href="${L('book/')}">Book a consultation</a></div>
    <div class="col"><span class="label">Company</span><a href="${L('careers/')}">Careers</a><a href="${L('partnerships/')}">Partnerships</a><a href="${L('privacy/')}">Privacy policy</a></div>
    <div class="col award col--wide"><span class="label">${business.award.label}</span><a href="${business.award.href}" rel="noopener"><span class="badges"><img src="${L('assets/img/bost-2023-ondark.png')}" alt="Voted Best of South Tampa 2023, South Tampa Magazine" width="458" height="360" loading="lazy"><img src="${L('assets/img/bost-2024-ondark.png')}" alt="Voted Best of South Tampa 2024, South Tampa Magazine" width="458" height="360" loading="lazy"><img src="${L('assets/img/bost-2025-ondark.png')}" alt="Best of South Tampa 2025 winner, South Tampa Magazine" width="391" height="360" loading="lazy"></span></a></div>
  </div>
  <div class="legal"><span>© ${new Date().getFullYear()} SOHO Fit Tampa</span><span>${esc(business.policy)}</span></div>
</footer>`;
}

const chapter = (num, name, right = '') => `<div class="chapter label"><span>${num} — ${name}</span>${right ? `<span>${right}</span>` : ''}</div>`;

// ---------- shared sections ----------
function trainingIndex({ full = false } = {}) {
  const rows = services
    .map((s, i) => {
      const k = imgManifest.duotones[s.img] ? s.img : s.img;
      const isDuo = !!imgManifest.duotones[s.img];
      const v = (isDuo ? imgManifest.duotones[k] : imgManifest.photos[k]).variants;
      const small = [...v].sort((a, b) => a.w - b.w)[0];
      return `<li><a href="${L('training/' + s.slug + '/')}">
  <span class="num label">${String(i + 1).padStart(2, '0')}</span>
  <span class="name cd">${esc(s.name)}</span>
  <span class="desc">${esc(full ? s.short + ' ' + s.index : s.index)}</span>
  <span class="go" aria-hidden="true">→</span>
  <span class="thumb photo bw">${img(s.img, { alt: '', sizes: '76px', pos: s.imgPos })}</span>
</a></li>`;
    })
    .join('\n');
  return `<div class="tindex" data-tindex><ol>${rows}</ol></div>`;
}

function finalCTA() {
  return `<section class="on-red final wrap" data-theme="red" aria-labelledby="final-h">
  <h2 id="final-h" class="xp final__title">${lines(['Come train', 'with us.'])}</h2>
  <div class="final__row">
    <p>Your first visit is a free consultation. See the studio, meet a trainer and try a light workout. No pressure, no obligation.</p>
    <div class="acts"><a class="pill" href="${L('book/')}">Book your free consultation ${arrow}</a><a class="tlink" href="${business.phoneHref}">Call or text ${phonePretty}</a></div>
  </div>
</section>
${marquee(['Get fit', 'Stay fit', 'South Tampa', 'One on one'], 'lg')}`;
}

function ctaBand(title, sub, href = 'book/') {
  return `<section class="cta-band on-red wrap" data-theme="red"><div class="grid">
  <h2 class="xp x3">${title}</h2>
  <div class="acts"><p style="margin:0;font-weight:500">${sub}</p><a class="pill" href="${L(href)}">Book your free consultation ${arrow}</a><a class="tlink" href="${business.phoneHref}">Or call / text ${phonePretty}</a></div>
</div></section>`;
}

function faqList(items) {
  return `<div class="faq">${items
    .map((f) => `<details><summary><span>${esc(f.question)}</span><span class="pm" aria-hidden="true"></span></summary><div class="a">${md(f.answer_md)}</div></details>`)
    .join('')}</div>`;
}

// ---------- JSON-LD ----------
const orgLD = {
  '@context': 'https://schema.org',
  '@graph': studios.map((s) => ({
    '@type': 'HealthClub',
    '@id': `${business.siteUrl}/#${s.id}`,
    name: `SOHO Fit ${s.name}`,
    url: business.siteUrl + '/',
    telephone: '+1-813-586-0760',
    image: `${business.siteUrl}/assets/img/logo-dark.png`,
    address: { '@type': 'PostalAddress', streetAddress: s.street + (s.unit ? ', ' + s.unit : ''), addressLocality: 'Tampa', addressRegion: 'FL', postalCode: s.city.slice(-5), addressCountry: 'US' },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '05:00', closes: '21:00' }],
    sameAs: [business.instagram],
  })),
};

// ======================================================
// PAGES
// ======================================================
const pages = [];
const page = (p, fn) => pages.push({ path: p, fn });

// ---------- HOME ----------
page('', () => {
  const st = trainers[0];
  const flexLines = (arr) =>
    arr.map((line) => `<span class="fl" aria-hidden="true">${line.split(' ').map((w) => `<span class="wd">${[...w].map((c) => `<span class="ch">${esc(c)}</span>`).join('')}</span>`).join(' ')}</span>`).join('');

  const steps = [
    ['Meet', 'A free consultation and fitness assessment. Your trainer learns your goals, your history, how you eat and how you move.', 'studio-glove'],
    ['Plan', 'A program written for you, around your body, your goals and your calendar. Sessions run 30, 45 or 60 minutes.', 'studio-doors'],
    ['Train', 'One on one, with cardio, strength and core in every session. Difficulty adjusts as you get stronger, with homework between visits.', 'studio-rack'],
    ['Measure', 'Regular InBody scans of fat, muscle and water by body segment, sent to an app on your phone. Progress in real data.', 'studio-room'],
  ];

  return {
    title: 'SOHO Fit · Private Personal Training in South Tampa',
    description:
      'Private 1-on-1 personal training in South Tampa. Two studios in Hyde Park (SoHo) and Westshore, at-home training, and twelve career trainers. Book a free consultation.',
    headTheme: 'ink',
    jsonld: orgLD,
    ogImage: 'studio-trx-blue-1800.webp',
    body: `
<section class="hero on-ink" data-theme="ink" data-hero aria-labelledby="hero-h">
  <div class="hero__media">${img('studio-doors', { alt: 'The SOHO Fit Hyde Park studio', lazy: false, sizes: 'max(100vw, 214vh)', pos: '40% 60%' })}</div>
  <div class="hero__content wrap">
    <div class="hero__award label"><span aria-hidden="true">★</span> ${business.award.label}<span class="more"> · ${business.award.detail}</span></div>
    <h1 id="hero-h" class="xp hero__title" data-flex><span class="sr">Get fit, stay fit. Private personal training in South Tampa.</span>${flexLines(['Get fit,', 'Stay fit.'])}</h1>
    <div class="hero__foot">
      <p class="hero__lede">Private 1-on-1 personal training in the heart of South Tampa’s SoHo. No crowds. No waiting. Just you and your trainer.</p>
      <div class="hero__acts"><a class="pill" href="${L('book/')}">Book<span class="long">&nbsp;your</span>&nbsp;free consultation ${arrow}</a><a class="tlink" href="${business.phoneHref}">Call or text ${phonePretty}</a></div>
    </div>
  </div>
</section>

<section class="stats wrap" data-theme="paper" aria-label="SOHO Fit by the numbers">
  <div class="stats__row" data-reveal="rise">
    <div class="stat"><span class="cd stat__n"><span data-countup="10">10</span>+</span><span class="stat__l">Years training South Tampa</span></div>
    <div class="stat"><span class="cd stat__n"><span data-countup="12">12</span></span><span class="stat__l">Career personal trainers</span></div>
    <div class="stat"><span class="cd stat__n"><span data-countup="3">3</span>×</span><span class="stat__l">Voted Best of South Tampa, 2023 to 2025</span></div>
    <div class="stat"><span class="cd stat__n"><span data-countup="2">2</span></span><span class="stat__l">Private studios: Hyde Park &amp; Westshore</span></div>
  </div>
</section>

<section class="section intro-sec wrap" data-theme="paper" aria-labelledby="intro-h">
  ${chapter('01', 'The studio', 'South Tampa · SoHo')}
  <div class="intro">
    <div class="intro__copy">
      <h2 id="intro-h" class="intro__statement" data-reveal="rise">For over a decade, SOHO Fit has helped Tampa <span class="hl-red">get fit</span> and <span class="hl-blue">stay fit</span>, one client and one trainer at a time.</h2>
      <p class="intro__body" data-reveal="rise">Private means no waiting for equipment and no worrying about who’s watching. Our trainers are career personal trainers who studied health and fitness in college. They build your program around your goals and your busy professional and personal life.</p>
      <ol class="pillars3" data-reveal="rise">
        <li><span class="cd">01</span><strong>Private</strong><span>No crowds, no waiting, no one watching.</span></li>
        <li><span class="cd">02</span><strong>Personal</strong><span>A program written around you and your calendar.</span></li>
        <li><span class="cd">03</span><strong>Measured</strong><span>InBody scans so you see progress in real data.</span></li>
      </ol>
      <a class="tlink" href="${L('studios/')}">Visit the studios ${arrow}</a>
    </div>
    <figure class="intro__fig">
      <div class="photo bw aperture" data-reveal>${img('studio-glove', { alt: 'Boxing gloves resting on a bench in the SOHO Fit studio', sizes: '(max-width: 900px) 120vw, 60vw', pos: '62% 50%' })}</div>
    </figure>
  </div>
</section>

<section class="section wrap" data-theme="paper" aria-labelledby="train-h" style="padding-top:0">
  ${chapter('02', 'Training', '8 programs')}
  <div class="grid" style="margin-bottom:clamp(40px,5vw,72px);row-gap:24px;align-items:end">
    <h2 id="train-h" class="xp x2" style="grid-column:1/span 9">${lines(['Eight ways', 'to train.'])}</h2>
    <p class="muted" style="grid-column:10/span 3;margin:0">Every program starts with the same free consultation.</p>
  </div>
  ${trainingIndex()}
</section>

<section class="section on-blue tr" data-theme="blue" aria-labelledby="tr-h" data-rail>
  <div class="wrap">
    ${chapter('03', 'The trainers', '12 career coaches')}
    <div class="tr__head">
      <h2 id="tr-h" class="xp tr__title">${lines(['Pick your', 'trainer.'])}</h2>
      <p class="tr__lede">Career trainers with college degrees in health and fitness. We’ll match you on goals, schedule and personality, and you can switch any time.</p>
      <div class="tr__nav"><button type="button" class="rbtn" aria-label="Previous trainers" data-rail-prev>←</button><button type="button" class="rbtn" aria-label="Next trainers" data-rail-next>→</button></div>
    </div>
  </div>
  <div class="rail" data-rail-track tabindex="0" role="region" aria-label="Trainers, scroll sideways">
    <ul class="rail__list">${trainers
      .map(
        (t, i) => `<li class="card"><a href="${L('trainers/' + t.slug + '/')}">
        <span class="card__photo">${img(t.slug, { trainer: true, alt: '', sizes: '(max-width: 600px) 78vw, 320px' })}<span class="card__num label">${String(i + 1).padStart(2, '0')}/${trainers.length}</span><span class="card__name xp">${esc(t.first)}<br>${esc(t.last)}</span></span>
        <span class="card__role label">${esc(t.role)}</span>
        <span class="card__line">${esc(t.line)}</span>
        <span class="card__go">Meet ${esc(t.first)} <span aria-hidden="true">→</span></span>
      </a></li>`
      )
      .join('')}
    </ul>
  </div>
  <div class="wrap tr__foot"><div class="rail__progress" aria-hidden="true"><span data-rail-bar></span></div><a class="tlink" href="${L('trainers/')}">All trainers ${arrow}</a></div>
</section>

<section class="on-ink wrap" data-theme="ink" aria-labelledby="exp-h" data-exp>
  <div class="exp">
    <div class="exp__media"><div class="photo">${steps.map((s, i) => img(s[2], { duo: true, alt: '', sizes: '(max-width: 900px) 100vw, 84vw', cls: i === 0 ? 'is-current' : '' })).join('')}</div></div>
    <div class="exp__steps">
      <div class="exp__intro">
        <div class="label hl-blue" style="margin-bottom:24px">04 — How it works</div>
        <h2 id="exp-h" class="xp" style="font-size:clamp(32px,9.6cqw,78px);line-height:.86">${lines(['Private', 'training,', 'start to finish.'])}</h2>
      </div>
      ${steps.map((s, i) => `<div class="step" data-step="${i}"><span class="cd n" aria-hidden="true">0${i + 1}</span><h3 class="cd">${s[0]}</h3><p>${s[1]}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="section tint-red wrap" data-theme="paper" aria-labelledby="rev-h" data-proof>
  ${chapter('05', 'Reviews', '5-star reviews on Google')}
  <h2 id="rev-h" class="sr">What clients say</h2>
  <div class="proof">
    <div class="proof__quote" aria-live="polite">
      ${testimonials
        .map(
          (t, i) => `<figure class="proof__item${i === 0 ? ' is-current' : ''}" data-quote${i ? ' aria-hidden="true"' : ''} style="margin:0"><blockquote><span class="q">“</span>${esc(t.text)}”</blockquote><figcaption class="proof__by"><span class="label">${esc(t.author)}</span><span class="muted">trains with ${esc(t.trainer)}</span></figcaption></figure>`
        )
        .join('')}
    </div>
    <div class="proof__controls">
      <button type="button" aria-label="Previous review" data-prev>←</button>
      <button type="button" aria-label="Next review" data-next>→</button>
      <span class="proof__count label" data-count>01 / ${String(testimonials.length).padStart(2, '0')}</span>
      <div class="proof__award">
        <a href="${business.award.href}" rel="noopener"><span class="badges"><img src="${L('assets/img/bost-2023-onlight.png')}" alt="Voted Best of South Tampa 2023, South Tampa Magazine" width="458" height="360" loading="lazy"><img src="${L('assets/img/bost-2024-onlight.png')}" alt="Voted Best of South Tampa 2024, South Tampa Magazine" width="458" height="360" loading="lazy"><img src="${L('assets/img/bost-2025-onlight.png')}" alt="Best of South Tampa 2025 winner, South Tampa Magazine" width="391" height="360" loading="lazy"></span></a>
        <a class="tlink" href="${business.googleReviews}" rel="noopener">Read every review on Google ↗</a>
      </div>
    </div>
  </div>
</section>

<section class="section tint-blue wrap" data-theme="paper" aria-labelledby="loc-h">
  ${chapter('06', 'Two studios', 'South Tampa')}
  <h2 id="loc-h" class="sr">Locations and hours</h2>
  <div class="locs">
    ${studios
      .map(
        (s) => `<div class="loc"><span class="label">${esc(s.tag)}</span><h3 class="xp">${esc(s.name)}</h3><address>${s.street}${s.unit ? ', ' + s.unit : ''}<br>${s.city}<br><span class="muted">${esc(s.landmark)}</span></address><div class="actions"><a class="tlink" href="${esc(dirUrl(s))}" target="_blank" rel="noopener">Get directions ↗</a><a class="tlink" href="${L('book/')}?studio=${s.id}">Book here</a></div></div>`
      )
      .join('')}
    <div class="hours">
      ${business.hours.map(([d, h]) => `<div><div class="label muted">${d}</div><div style="font-size:21px;font-weight:600">${h}</div></div>`).join('')}
      <p class="policy" style="margin:0">Also training at your home or community gym anywhere in the Tampa area. <a href="${L('training/at-home/')}">At-home training</a>.</p>
    </div>
  </div>
  <div class="mt-m">${mapBlock()}</div>
</section>

${finalCTA()}`,
  };
});

// ---------- TRAINING INDEX ----------
page('training/', () => ({
  title: 'Training · SOHO Fit Tampa',
  description: 'Private 1-on-1 personal training in-studio and at home, plus corporate wellness, nutrition coaching, body composition, assisted stretch, youth and pre/postnatal training in South Tampa.',
  current: 'training/',
  headTheme: 'paper',
  body: `
<section class="phead wrap" data-theme="paper">
  <div class="crumb label"><a href="${L('')}">Home</a><span>/</span><span>Training</span></div>
  <h1 class="xp">${lines(['Eight ways', 'to train.'])}</h1>
  <div class="phead__row"><p class="lede">Everything at SOHO Fit is built around one idea: a dedicated trainer and a program written for you. Pick where and how. We’ll handle the rest.</p><div class="acts"><a class="pill" href="${L('book/')}">Book your free consultation ${arrow}</a></div></div>
</section>
<section class="section wrap" data-theme="paper">
  ${trainingIndex({ full: true })}
  <div class="grid mt-l" style="row-gap:24px">
    <div style="grid-column:1/span 5"><div class="label hl-red" style="margin-bottom:16px">Partner training</div><p class="big-text" style="font-size:clamp(24px,2.4vw,36px);margin:0">Train with a friend, spouse or family member.</p></div>
    <p style="grid-column:7/span 5;margin:0" class="muted">SOHO Fit specializes in private, one-on-one training, and also offers Partner Training. Your trainer structures and modifies each session for both of you, so you train together without losing personal coaching.</p>
  </div>
</section>
${ctaBand('Not sure<br>where to start?', 'Tell us your goal. We’ll match you with the right trainer and program.')}`,
}));

// ---------- SERVICE PAGES ----------
services.forEach((s, i) => {
  const next = services[(i + 1) % services.length];
  const theme = 'paper';
  let faqs = faqsAll.filter((f) => f.page_slug === s.archive);
  // archive repeats a question heading for the corporate pricing answer; label it by its content
  faqs = faqs.map((f, k) => (s.slug === 'corporate-wellness' && /cost structure/.test(f.answer_md) ? { ...f, question: 'How much does a corporate program cost?' } : f));
  const words = s.name.split(' ');
  const h1 = words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [s.name];
  const trainerLink = s.trainerLink ? trainers.find((t) => t.slug === s.trainerLink) : null;
  page(`training/${s.slug}/`, () => ({
    title: `${s.name} · SOHO Fit Tampa`,
    description: s.lede,
    current: 'training/',
    headTheme: 'paper',
    body: `
<section class="phead wrap" data-theme="paper">
  <div class="crumb label"><a href="${L('')}">Home</a><span>/</span><a href="${L('training/')}">Training</a><span>/</span><span>${String(i + 1).padStart(2, '0')}</span></div>
  <h1 class="xp">${lines(h1.map(esc))}</h1>
  <div class="phead__row"><p class="lede">${esc(s.lede)}</p><div class="acts"><a class="pill" href="${L('book/')}?interest=${s.slug}">Book a free consultation ${arrow}</a></div></div>
</section>
<div class="banner-wrap wrap"${['assisted-stretch', 'nutrition-coaching'].includes(s.slug) ? ' style="max-width:1168px"' : ''}><div class="banner photo bw aperture" data-reveal>${img(s.img, { alt: `${s.name} at SOHO Fit`, sizes: '(max-width: 1488px) 100vw, 1400px', pos: s.imgPos, lazy: false })}</div></div>
<section class="section wrap" data-theme="paper">
  <dl class="facts" data-reveal="rise">${s.facts.map(([k, v]) => `<div><dt class="label">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <ol class="blocks mt-l">${s.blocks.map((b, k) => `<li data-reveal="rise"><span class="n cd" aria-hidden="true">0${k + 1}</span><h3 class="cd">${esc(b.h)}</h3><p>${esc(b.p)}</p></li>`).join('')}</ol>
  ${trainerLink ? `<p class="mt-m"><a class="tlink" href="${L('trainers/' + trainerLink.slug + '/')}">Meet ${trainerLink.first} ${trainerLink.last}, our pre &amp; postnatal specialist ${arrow}</a></p>` : ''}
  ${s.disclaimer ? `<p class="disclaimer mt-m">${esc(s.disclaimer)}</p>` : ''}
  ${faqs.length ? `<div class="grid mt-l" style="row-gap:32px"><h2 class="cd c2" style="grid-column:1/span 4">Questions</h2><div style="grid-column:5/span 8">${faqList(faqs)}</div></div>` : ''}
</section>
${ctaBand(`Start with a<br>conversation.`, 'Free, no pressure, no obligation. Meet a trainer and see if it’s a fit.', `book/?interest=${s.slug}`)}
<section class="section--tight wrap" data-theme="paper"><a class="next" href="${L('training/' + next.slug + '/')}"><span class="label muted">Next program</span><br><span class="xp">${esc(next.name)} →</span></a></section>`,
  }));
});

// ---------- TRAINERS INDEX ----------
page('trainers/', () => ({
  title: 'Trainers · SOHO Fit Tampa',
  description: 'Meet the SOHO Fit team: twelve career personal trainers in South Tampa with college degrees in health and fitness.',
  current: 'trainers/',
  headTheme: 'paper',
  body: `
<section class="phead wrap" data-theme="paper">
  <div class="crumb label"><a href="${L('')}">Home</a><span>/</span><span>Trainers</span></div>
  <h1 class="xp">${lines(['Meet the', 'trainers.'])}</h1>
  <div class="phead__row"><p class="lede">Career personal trainers who went to college for health and fitness and have trained their whole careers. We’ll match you by goals, schedule, coaching style and personality, and you can switch any time.</p></div>
</section>
<section class="section wrap" data-theme="paper">
  <ul class="tgal">${trainers
    .map(
      (t) => `<li data-reveal="rise"><a href="${L('trainers/' + t.slug + '/')}"><span class="frame"><span class="photo">${img(t.slug, { trainer: true, alt: `${t.first} ${t.last}`, sizes: '(max-width: 900px) 50vw, 32vw' })}</span></span><span class="label rl">${esc(t.role)}</span><span class="nm xp">${esc(t.first)}<br>${esc(t.last)}</span><span class="ln">${esc(t.line)}</span></a></li>`
    )
    .join('')}</ul>
</section>
${ctaBand('Find your<br>trainer.', 'Tell us your goals and schedule. We’ll suggest the right fit.')}`,
}));

// ---------- TRAINER PROFILES ----------
function trainerBio(slug) {
  const d = readJSON(path.join(ROOT, 'content', 'trainers', slug + '.json'));
  if (d.bio_qa && d.bio_qa.length) return d.bio_qa.map((q) => ({ q: q.question.replace(/\s*\n\s*/g, ' '), a: q.answer_md }));
  const out = [];
  let cur = null;
  for (const p of d.bio_intro_md || []) {
    const m = p.match(/^\*\*(.+?)\*\*\s*\n([\s\S]*)$/);
    if (m) { cur = { q: m[1], a: m[2] }; out.push(cur); }
    else if (cur) cur.a += '\n\n' + p;
    else { cur = { q: null, a: p }; out.push(cur); }
  }
  return out;
}
trainers.forEach((t, i) => {
  const next = trainers[(i + 1) % trainers.length];
  const bio = trainerBio(t.slug);
  page(`trainers/${t.slug}/`, () => ({
    title: `${t.first} ${t.last} · Personal Trainer · SOHO Fit Tampa`,
    description: `${t.first} ${t.last}, ${t.role.toLowerCase()} personal trainer at SOHO Fit in South Tampa. ${t.line}`,
    current: 'trainers/',
    headTheme: 'paper',
    jsonld: { '@context': 'https://schema.org', '@type': 'Person', name: `${t.first} ${t.last}`, jobTitle: 'Personal Trainer', worksFor: { '@type': 'Organization', name: 'SOHO Fit Tampa', url: business.siteUrl } },
    body: `
<section class="section wrap" data-theme="paper" style="padding-top:calc(var(--header-h) + clamp(32px,5vw,72px))">
  <div class="prof">
    <div class="prof__photo"><div class="photo aperture" data-reveal>${img(t.slug, { trainer: true, alt: `${t.first} ${t.last}, SOHO Fit trainer`, sizes: '(max-width: 900px) 80vw, 40vw', lazy: false })}</div></div>
    <div class="prof__body">
      <div class="label"><a href="${L('trainers/')}" style="text-decoration:none">Trainers</a> / ${esc(t.role)}</div>
      <h1 class="xp" style="font-size:clamp(36px,11cqw,112px);margin:16px 0 24px">${lines([esc(t.first), `<span class="hl-red">${esc(t.last)}</span>`])}</h1>
      <p class="lede">${esc(t.line)}</p>
      <div class="stage__tags" style="margin:24px 0 36px;color:var(--ink)">${t.tags.map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div>
      <div style="display:flex;gap:16px 28px;flex-wrap:wrap;align-items:center"><a class="pill" href="${L('book/')}?trainer=${t.slug}">Train with ${esc(t.first)} ${arrow}</a><a class="tlink" href="${business.phoneHref}">Call or text ${phonePretty}</a></div>
      <div class="qa prose mt-l">${bio.map((b) => `<section>${b.q ? `<h2>${esc(b.q)}</h2>` : ''}${md(b.a)}</section>`).join('')}</div>
    </div>
  </div>
</section>
<section class="section--tight wrap" data-theme="paper"><a class="next" href="${L('trainers/' + next.slug + '/')}"><span class="label muted">Next trainer</span><br><span class="xp">${esc(next.first)} ${esc(next.last)} →</span></a></section>`,
  }));
});

// ---------- STUDIOS (About & Locations + FAQ) ----------
page('studios/', () => {
  const homeFaqs = faqsAll.filter((f) => f.page_slug === 'home');
  return {
    title: 'Studios, About & FAQ · SOHO Fit Tampa',
    description: 'SOHO Fit has two private personal training studios in South Tampa: Hyde Park (715 S Howard Ave) and Westshore (3431 S Westshore Blvd). Hours, directions and FAQ.',
    current: 'studios/',
    headTheme: 'ink',
    jsonld: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: homeFaqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer_md.replace(/\*\*/g, '') } })),
    },
    body: `
<section class="phead on-ink wrap" data-theme="ink">
  <div class="crumb label"><a href="${L('')}">Home</a><span>/</span><span>Studios</span></div>
  <h1 class="xp">${lines(['Two studios.', 'South Tampa.'])}</h1>
  <div class="phead__row"><p class="lede">Private personal training studios in Hyde Park’s SoHo and in Westshore. Same trainers, same programs, same one-on-one experience at both.</p><div class="acts"><a class="pill" href="${L('book/')}">Book a visit ${arrow}</a></div></div>
</section>
<section class="section wrap" data-theme="paper">
  ${studios
    .map(
      (s, i) => `<div class="studio">
    <h2 class="xp">${esc(s.name)}</h2>
    <div class="det">
      <span class="label ${i ? 'hl-blue' : 'hl-red'}">${esc(s.tag)}</span>
      <address>${s.street}${s.unit ? ', ' + s.unit : ''}<br>${s.city}</address>
      <p class="muted" style="margin:0">${esc(s.landmark)}</p>
      <div style="display:flex;gap:4px 28px;flex-wrap:wrap"><a class="tlink" href="${esc(dirUrl(s))}" target="_blank" rel="noopener">Get directions ↗</a><a class="tlink" href="${L('book/')}?studio=${s.id}">Book at ${esc(s.name)}</a></div>
    </div>
    ${i === 0 ? `<div class="photo bw aperture" data-reveal>${img('studio-floor', { alt: 'Training floor at SOHO Fit', sizes: 'max(100vw, 120vh)' })}</div>` : ''}
  </div>`
    )
    .join('')}
  <div class="grid mt-m" style="row-gap:24px">
    <div style="grid-column:1/span 5"><div class="label muted" style="margin-bottom:12px">Hours</div>${business.hours.map(([d, h]) => `<p style="margin:0 0 8px"><strong>${d}</strong><br>${h}</p>`).join('')}</div>
    <div style="grid-column:7/span 6"><div class="label muted" style="margin-bottom:12px">Good to know</div><p>${esc(business.policy)}</p><p>Can’t make it to a studio? We train at your home or community gym anywhere in the Tampa area. <a href="${L('training/at-home/')}">At-home training</a>.</p></div>
  </div>
  <div class="mt-m">${mapBlock()}</div>
</section>
<section class="section tint-blue wrap" data-theme="paper">
  ${chapter('About', 'SOHO Fit')}
  <div class="grid" style="row-gap:40px">
    <h2 class="xp x3" style="grid-column:1/span 7">${lines(['Private,', 'personal,', 'proven.'])}</h2>
    <div class="prose" style="grid-column:8/span 5">
      <p>SOHO Fit is a private personal training company based in Tampa. For over a decade we’ve helped clients lose weight, tone, gain muscle or simply get healthier, in private studios built for one-on-one coaching.</p>
      <p>Our clients range from complete beginners and busy professionals to parents, athletes and seniors. Beyond the studios, we train in homes, offices and residential communities across Tampa.</p>
      <p>We sell training and nothing else. You’ll never be asked to buy anything extra, and we don’t accept money for referrals.</p>
    </div>
  </div>
  <div class="pillars mt-l">
    <div><h3>Private</h3><p style="margin:0">No crowds, no waiting for equipment, no one watching.</p></div>
    <div><h3>Personal</h3><p style="margin:0">A program built around your goals, body and calendar.</p></div>
    <div><h3>Measured</h3><p style="margin:0">InBody scans and benchmarks, tracked in your app.</p></div>
    <div><h3>Recognized</h3><p style="margin:0">${business.award.label}, ${business.award.detail}.</p></div>
  </div>
</section>
<section class="section wrap" data-theme="paper" aria-labelledby="faq-h">
  <div class="grid" style="row-gap:32px">
    <h2 id="faq-h" class="xp x3" style="grid-column:1/span 4">FAQ</h2>
    <div style="grid-column:5/span 8">${faqList(homeFaqs)}</div>
  </div>
</section>
${finalCTA()}`,
  };
});

// ---------- BOOK ----------
page('book/', () => ({
  title: 'Book a Free Consultation · SOHO Fit Tampa',
  description: 'Book a free, no-pressure consultation at SOHO Fit. See the studio, meet a trainer and try a light workout. Or call or text 813-586-0760.',
  current: 'book/',
  headTheme: 'red',
  body: `
<section class="phead on-red wrap" data-theme="red">
  <div class="crumb label"><a href="${L('')}">Home</a><span>/</span><span>Book</span></div>
  <h1 class="xp">${lines(['Your first', 'visit is free.'])}</h1>
  <div class="phead__row"><p class="lede">A free, no pressure, no obligation consultation. Send the form and a trainer will reach out, or skip the form and talk to us now.</p><div class="acts"><a class="pill" href="${business.phoneHref}">Call ${phonePretty}</a><a class="tlink" href="${business.smsHref}">Text us</a></div></div>
</section>
<section class="section wrap" data-theme="paper">
  <div class="book">
    <div class="book__info">
      <h2 class="cd c2">What happens</h2>
      <ol class="book__steps">
        <li><span class="cd">01</span><div><strong>We reach out</strong><br><span class="muted">A trainer calls or texts to find a time that works.</span></div></li>
        <li><span class="cd">02</span><div><strong>You see the studio</strong><br><span class="muted">Meet your trainer at Hyde Park, Westshore or your home.</span></div></li>
        <li><span class="cd">03</span><div><strong>A light workout</strong><br><span class="muted">Your trainer takes you through it to see if it’s a good fit.</span></div></li>
      </ol>
      <p class="muted mt-m" style="font-size:15px">Hours: Monday to Friday 5:00am to 9:00pm. Weekends by appointment.</p>
    </div>
    <div class="book__form">
      <form class="form" data-book-form novalidate>
        <div class="row2">
          <div class="field"><label for="f-name">Name</label><input id="f-name" name="name" autocomplete="name" required><span class="err" data-err="name"></span></div>
          <div class="field"><label for="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" required><span class="err" data-err="phone"></span></div>
        </div>
        <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required><span class="err" data-err="email"></span></div>
        <fieldset class="field"><legend>Where would you like to train?</legend><div class="chips">
          ${[['hyde-park', 'Hyde Park'], ['westshore', 'Westshore'], ['at-home', 'At home'], ['not-sure', 'Not sure yet']].map(([v, l], k) => `<label><input type="radio" name="studio" value="${v}"${k === 3 ? ' checked' : ''}><span>${l}</span></label>`).join('')}
        </div></fieldset>
        <div class="row2">
          <div class="field"><label for="f-interest">Interested in <span class="opt">(optional)</span></label><select id="f-interest" name="interest"><option value="">Personal training</option>${services.map((s) => `<option value="${s.slug}">${esc(s.name)}</option>`).join('')}</select></div>
          <div class="field"><label for="f-trainer">Trainer <span class="opt">(optional)</span></label><select id="f-trainer" name="trainer"><option value="">No preference</option>${trainers.map((t) => `<option value="${t.slug}">${esc(t.first + ' ' + t.last)}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label for="f-msg">Goals or questions <span class="opt">(optional)</span></label><textarea id="f-msg" name="message" rows="4"></textarea></div>
        <div><button class="pill" type="submit">Request my free consultation ${arrow}</button></div>
        <p class="note" data-form-note>We’ll only use your details to set up your consultation. <a href="${L('privacy/')}">Privacy policy</a>.</p>
      </form>
      <div class="form-done" data-form-done hidden tabindex="-1">
        <h2 class="cd c2">Almost there.</h2>
        <p class="lede" data-done-msg>Your request is ready in your email app. Hit send and a trainer will be in touch soon.</p>
        <p>Prefer to talk now? <a href="${business.phoneHref}">Call</a> or <a href="${business.smsHref}">text</a> ${phonePretty}.</p>
      </div>
    </div>
  </div>
</section>`,
}));

// ---------- CAREERS ----------
page('careers/', () => ({
  title: 'Careers · SOHO Fit Tampa',
  description: 'Join South Tampa’s award-winning private personal training team.',
  headTheme: 'paper',
  body: `
<section class="phead wrap" data-theme="paper">
  <div class="crumb label"><a href="${L('')}">Home</a><span>/</span><span>Careers</span></div>
  <h1 class="xp">${lines(['Coach', 'with us.'])}</h1>
  <div class="phead__row"><p class="lede">SOHO Fit is South Tampa’s leading private training studio for busy professionals, parents and high achievers. We look for high-level fitness professionals who prioritize client results and want a serious, lasting career.</p></div>
</section>
<section class="section wrap" data-theme="paper">
  <div class="pillars">
    <div><h3>Work with purpose</h3><p style="margin:0">Coach in a premium environment with systems, support and structure, so you can focus on results.</p></div>
    <div><h3>Growth &amp; income</h3><p style="margin:0">Competitive, performance-based pay, with top trainers earning six figures, and a brand that attracts new clients.</p></div>
    <div><h3>Support</h3><p style="margin:0">A growth-focused team culture that helps you stay sharp, share ideas and keep developing your craft.</p></div>
    <div><h3>Award-winning</h3><p style="margin:0">Recognized as South Tampa’s best three years running, with a reputation for professionalism and results.</p></div>
  </div>
  <div class="grid mt-l" style="row-gap:24px;align-items:end">
    <h2 class="xp x3" style="grid-column:1/span 7">Apply</h2>
    <div style="grid-column:8/span 5;display:grid;gap:14px;justify-items:start"><p style="margin:0">Send your resume and a few lines about you. If it looks like a fit, we’ll set up a quick intro call to walk through the role and next steps.</p><a class="pill" href="mailto:${business.email}?subject=${encodeURIComponent('Trainer application')}">Email your resume ${arrow}</a></div>
  </div>
</section>`,
}));

// ---------- PARTNERSHIPS ----------
page('partnerships/', () => ({
  title: 'Partnerships · SOHO Fit Tampa',
  description: 'SOHO Fit works with community partners to refer clients, at their request, to services that support their fitness and lifestyle.',
  headTheme: 'ink',
  body: `
<section class="phead on-ink wrap" data-theme="ink">
  <div class="crumb label"><a href="${L('')}">Home</a><span>/</span><span>Partnerships</span></div>
  <h1 class="xp">${lines(['Stronger', 'together.'])}</h1>
  <div class="phead__row"><p class="lede">We work with partners in the community to point clients, at their request, to services that support their fitness and lifestyle.</p></div>
</section>
<section class="section wrap textpage" data-theme="paper">
  <div class="prose">
    <p>SOHO Fit does not sell anything in our studio other than fitness training. You will not be asked to buy anything additional, and we do not accept money from third parties for referring clients.</p>
    <p>Any partner we refer provides a valuable service in our community, and we are happy to recommend them when clients ask.</p>
    <h2>Partner with SOHO Fit</h2>
    <p>Would you like to partner with SOHO Fit Tampa? Get in touch with our team to discuss a potential partnership.</p>
    <p><a class="pill" href="mailto:${business.email}?subject=${encodeURIComponent('Partnership inquiry')}" style="color:#fff">Email the team ${arrow}</a></p>
  </div>
</section>`,
}));

// ---------- PRIVACY (verbatim from archive) ----------
page('privacy/', () => {
  const raw = fs.readFileSync(path.join(ROOT, 'content', 'pages', 'privacy-policy.md'), 'utf8');
  const start = raw.indexOf('Effective Date');
  const end = raw.indexOf('## [Section 2]');
  const chunk = raw.slice(start, end).replace(/<!--.*?-->/g, '');
  const out = [];
  let list = [];
  const flush = () => { if (list.length) { out.push('<ul>' + list.map((x) => `<li>${x}</li>`).join('') + '</ul>'); list = []; } };
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\((mailto:[^)]+)\)/g, '<a href="$2">$1</a>');
  for (const lineRaw of chunk.split('\n')) {
    const line = lineRaw.trim();
    if (!line) { flush(); continue; }
    if (line.startsWith('- ')) { list.push(inline(line.slice(2))); continue; }
    flush();
    const h = line.match(/^\*\*(.+)\*\*$/);
    if (h) out.push(`<h2>${esc(h[1])}</h2>`);
    else out.push(`<p>${inline(line)}</p>`);
  }
  flush();
  return {
    title: 'Privacy Policy · SOHO Fit Tampa',
    description: 'How SOHO Fit collects, uses and protects your personal information.',
    headTheme: 'paper',
    body: `<section class="section wrap textpage" data-theme="paper" style="padding-top:calc(var(--header-h) + clamp(48px,7vw,104px))"><div class="label muted" style="margin-bottom:24px">Legal</div><h1 class="xp x2" style="margin-bottom:48px">Privacy policy</h1><div class="prose">${out.join('\n')}</div></section>`,
  };
});

// ---------- 404 ----------
page('404.html', () => ({
  title: 'Page not found · SOHO Fit Tampa',
  description: 'This page moved or no longer exists.',
  headTheme: 'red',
  body: `<section class="phead on-red wrap" data-theme="red" style="min-height:90vh"><h1 class="xp">${lines(['Off', 'the grid.'])}</h1><div class="phead__row"><p class="lede">That page moved or no longer exists.</p><div class="acts"><a class="pill" href="${L('')}">Back to home ${arrow}</a></div></div></section>`,
}));

// ======================================================
// WRITE
// ======================================================
fs.rmSync(OUT, { recursive: true, force: true });
const write = (rel, content) => {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
};

for (const pg of pages) {
  const isFile = pg.path.endsWith('.html');
  DEPTH = isFile ? 0 : pg.path.split('/').filter(Boolean).length;
  if (pg.path === '404.html' && !FILE_LINKS) DEPTH = 0;
  const data = pg.fn();
  const html = layout({ ...data, path: isFile ? pg.path : pg.path });
  write(isFile ? pg.path : path.join(pg.path, 'index.html'), html);
}

// assets
const copyDir = (from, to, filter = () => true) => {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) if (filter(f)) fs.copyFileSync(path.join(from, f), path.join(to, f));
};
copyDir(path.join(SRC, 'css'), path.join(OUT, 'assets/css'));
copyDir(path.join(SRC, 'js'), path.join(OUT, 'assets/js'));
copyDir(path.join(SRC, 'img'), path.join(OUT, 'assets/img'), (f) => !f.endsWith('.json'));
const nm = path.join(__dir, 'node_modules');
fs.mkdirSync(path.join(OUT, 'assets/fonts'), { recursive: true });
for (const [pkg, file] of [
  ['@fontsource-variable/archivo', 'archivo-latin-standard-normal.woff2'],
  ['@fontsource-variable/inter-tight', 'inter-tight-latin-wght-normal.woff2'],
]) fs.copyFileSync(path.join(nm, pkg, 'files', file), path.join(OUT, 'assets/fonts', file));
// note: best-of-south-tampa-2025.png ships from src/img (copied from public/assets/graphics/2025_Best_of_South_Tampa_Winner.png)

// ship only images a page actually references
{
  const used = new Set();
  const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) for (const m of fs.readFileSync(p, 'utf8').matchAll(/assets\/img\/([^" ,)]+)/g)) used.add(m[1]); } };
  walk(OUT);
  for (const f of fs.readdirSync(path.join(OUT, 'assets/img'))) if (!used.has(f)) fs.rmSync(path.join(OUT, 'assets/img', f));
}

// redirects (Netlify / Cloudflare Pages format) from every original URL
const redirects = [
  ['/kristin/', '/trainers/kristin-blanchard/'],
  ['/bayli-monck/', '/trainers/bayli-king/'],
  ['/welcome/', '/book/'],
  ['/thank-you/', '/book/'],
  ['/coming-soon/', '/'],
  ['/privacy-policy/', '/privacy/'],
  ['/careers/', '/careers/'],
];
for (const s of services) for (const o of s.old) redirects.push([o, `/training/${s.slug}/`]);
for (const t of trainers) redirects.push([`/${t.slug}/`, `/trainers/${t.slug}/`]);
write('_redirects', redirects.filter(([a, b]) => a !== b).map(([a, b]) => `${a} ${b} 301`).join('\n') + '\n');
// Vercel Web Analytics: vanilla inject() from @vercel/analytics (no framework). Skipped in the file:// preview.
if (!FILE_LINKS) fs.copyFileSync(path.join(nm, '@vercel/analytics/dist/index.mjs'), path.join(OUT, 'assets/js/vercel-analytics.mjs'));
// Vercel reads vercel.json from the repo root: output dir, trailing slashes, same 301s as _redirects
fs.writeFileSync(
  path.join(__dir, 'vercel.json'),
  JSON.stringify(
    {
      $schema: 'https://openapi.vercel.sh/vercel.json',
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
      trailingSlash: true,
      redirects: redirects.filter(([a, b]) => a !== b).map(([source, destination]) => ({ source, destination, permanent: true })),
    },
    null,
    2
  ) + '\n'
);

// sitemap + robots
const urls = pages.filter((p) => !p.path.endsWith('.html')).map((p) => `${business.siteUrl}/${p.path}`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${business.siteUrl}/sitemap.xml\n`);

console.log(`Built ${pages.length} pages -> ${path.relative(process.cwd(), OUT)} (${FILE_LINKS ? 'file links' : 'clean URLs'})`);
