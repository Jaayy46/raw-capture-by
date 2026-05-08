/* ─────────────────────────────────────────
   Livio Raschle Photography — Main Script
   ───────────────────────────────────────── */

/* LOADER */
window.addEventListener('load', () =>
  setTimeout(() => document.getElementById('loader').classList.add('out'), 800)
);

/* CURSOR */
const cdot = document.getElementById('cdot'), cring = document.getElementById('cring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cdot.style.left = mx + 'px'; cdot.style.top = my + 'px';
});
(function loop() {
  rx += (mx - rx) * .11; ry += (my - ry) * .11;
  cring.style.left = rx + 'px'; cring.style.top = ry + 'px';
  requestAnimationFrame(loop);
})();
document.querySelectorAll('.card,.spc').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('chover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('chover'));
});
document.querySelectorAll('a,button').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('clink'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('clink'));
});

/* HERO IMAGE REF (parallax handled by scroll-scrubbed block below) */
const himg = document.getElementById('hero-img');

/* PROGRESS — SVG viewport border (ported from mohitvirli.github.io ProgressLoader) */
const progRect = document.getElementById('prog-rect');
let _perim = 0;
function initProg() {
  const pad = 10, w = innerWidth - pad * 2, h = innerHeight - pad * 2;
  progRect.setAttribute('x', pad);
  progRect.setAttribute('y', pad);
  progRect.setAttribute('width', w);
  progRect.setAttribute('height', h);
  _perim = 2 * (w + h);
  progRect.style.strokeDasharray = _perim;
  updateProg();
}
function updateProg() {
  const ratio = scrollY / (document.documentElement.scrollHeight - innerHeight);
  progRect.style.strokeDashoffset = _perim - _perim * Math.min(ratio, 1);
}
initProg();
window.addEventListener('resize', initProg, { passive: true });
window.addEventListener('scroll', updateProg, { passive: true });

/* NAV SCROLLED STATE */
const navEl = document.querySelector('nav[aria-label="Hauptnavigation"]');
window.addEventListener('scroll', () => {
  if (navEl) navEl.classList.toggle('scrolled', scrollY > 60);
}, { passive: true });

/* MENU */
const mbtn = document.getElementById('mbtn'), mov = document.getElementById('moverlay');
let mopen = false;
function toggleMenu() {
  mopen = !mopen;
  mbtn.classList.toggle('open', mopen);
  mov.classList.toggle('open', mopen);
  mbtn.setAttribute('aria-expanded', mopen);
  mbtn.setAttribute('aria-label', mopen ? 'Menü schliessen' : 'Menü öffnen');
  document.body.style.overflow = mopen ? 'hidden' : '';
}
mbtn.addEventListener('click', toggleMenu);
mov.querySelectorAll('.mlink').forEach(a => a.addEventListener('click', () => { if (mopen) toggleMenu(); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && mopen) toggleMenu(); });

/* BG MORPH */
const bgel = document.getElementById('bg');
const bgObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      bgel.style.background = e.target.dataset.bg || '#0a0a0a';
      pf.style.background = e.target.dataset.accent || '#c8965a';
    }
  });
}, { threshold: .35 });
document.querySelectorAll('[data-bg]').forEach(s => bgObs.observe(s));
new IntersectionObserver(e => {
  if (e[0].isIntersecting) { bgel.style.background = '#0a0a0a'; pf.style.background = '#c8965a'; }
}, { threshold: .4 }).observe(document.getElementById('hero'));

/* SECTION REVEAL */
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: .12 });
document.querySelectorAll('.section').forEach(s => secObs.observe(s));

/* FADE-IN */
const fiObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('vis'); fiObs.unobserve(e.target); }
  });
}, { threshold: .05, rootMargin: '0px 0px -20px 0px' });
document.querySelectorAll('.fi').forEach(el => fiObs.observe(el));

/* 3D TILT ON CARDS (mouse-driven, no Three.js) */
const tiltEls = document.querySelectorAll('.card:not([aria-hidden]), .spc');
const tiltMax = 8;
tiltEls.forEach(el => {
  let raf = 0;
  const enter = () => el.classList.add('tilt');
  const leave = () => {
    el.classList.remove('tilt');
    el.style.setProperty('--tx', '0deg');
    el.style.setProperty('--ty', '0deg');
  };
  const move = e => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      el.style.setProperty('--ty', (px * tiltMax) + 'deg');
      el.style.setProperty('--tx', (-py * tiltMax) + 'deg');
    });
  };
  el.addEventListener('mouseenter', enter);
  el.addEventListener('mousemove', move);
  el.addEventListener('mouseleave', leave);
});

/* SCROLL-SCRUBBED HERO (parallax + scale + fade) */
const heroSec = document.getElementById('hero');
const heroContent = document.querySelector('.hero-content');
window.addEventListener('scroll', () => {
  const r = heroSec.getBoundingClientRect();
  const p = Math.max(0, Math.min(1, -r.top / r.height));
  if (himg) {
    himg.style.transform = `translateY(${p * 30}vh) scale(${1 + p * .15})`;
    himg.style.filter = `brightness(${.4 - p * .3}) saturate(${1.1 - p * .3})`;
  }
  if (heroContent) heroContent.style.opacity = 1 - p * 1.5;
}, { passive: true });

/* WORD-BY-WORD REVEAL on descriptions */
document.querySelectorAll('.sec-desc, .hero-eye').forEach(el => {
  const txt = el.textContent;
  el.innerHTML = txt.split(/\s+/).map((w, i) =>
    `<span class="word" style="transition-delay:${i * 40}ms">${w}</span>`
  ).join(' ');
});

/* (image reveal removed — images visible by default, card scroll-timeline handles fade) */

/* IMAGE PROTECTION */
document.addEventListener('contextmenu', e => {
  if (e.target.tagName === 'IMG' || e.target.closest('.card,.spc,#lb')) {
    e.preventDefault(); return false;
  }
});
document.querySelectorAll('img').forEach(img => {
  img.setAttribute('draggable', 'false');
  img.addEventListener('dragstart', e => e.preventDefault());
});
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && ['s', 'u', 'p'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});

/* LIGHTBOX */
const lb = document.getElementById('lb'), lbimg = document.getElementById('lbimg'), lbctr = document.getElementById('lbctr');
let imgs = [], lidx = 0;
document.querySelectorAll('.card:not([aria-hidden]) img, .spc:not([aria-hidden]) img').forEach(img => {
  if (!img.closest('[aria-hidden="true"]')) {
    const idx = imgs.length;
    imgs.push({ src: img.currentSrc || img.src, alt: img.alt });
    const card = img.closest('.card,.spc');
    if (card) {
      card.addEventListener('click', () => openLB(idx));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(idx); }
      });
    }
  }
});
function openLB(i) {
  lidx = i; lbimg.src = imgs[i].src; lbimg.alt = imgs[i].alt;
  lb.classList.add('open'); document.body.style.overflow = 'hidden';
  updLB(); document.getElementById('lbx').focus();
}
function closeLB() { lb.classList.remove('open'); document.body.style.overflow = ''; }
function prevImg() { lidx = (lidx - 1 + imgs.length) % imgs.length; lbimg.src = imgs[lidx].src; lbimg.alt = imgs[lidx].alt; updLB(); }
function nextImg() { lidx = (lidx + 1) % imgs.length; lbimg.src = imgs[lidx].src; lbimg.alt = imgs[lidx].alt; updLB(); }
function updLB() { lbctr.textContent = (lidx + 1) + ' / ' + imgs.length; }
document.getElementById('lbx').addEventListener('click', closeLB);
document.getElementById('lbprev').addEventListener('click', prevImg);
document.getElementById('lbnext').addEventListener('click', nextImg);
lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLB();
  if (e.key === 'ArrowLeft') prevImg();
  if (e.key === 'ArrowRight') nextImg();
});

/* DOT NAV */
const dnItems = document.querySelectorAll('.dn-item');
const dnSections = ['hero', 'landschaft', 'konzerte', 'sport', 'motorsport', 'wildlife', 'architektur', 'contact'];
const dnObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      dnItems.forEach(a => a.classList.toggle('act', a.dataset.target === id));
    }
  });
}, { threshold: .35 });
dnSections.forEach(id => { const el = document.getElementById(id); if (el) dnObs.observe(el); });

/* SECTION EXPAND / COLLAPSE */
document.querySelectorAll('.btn-expand').forEach(btn => {
  btn.addEventListener('click', () => {
    const extraId = btn.dataset.extra;
    const total   = btn.dataset.total;
    const extra   = document.getElementById(extraId);
    const isOpen  = extra.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
    const txt = btn.querySelector('.btn-expand-txt');
    txt.textContent = isOpen
      ? 'Weniger anzeigen'
      : `Alle ${total} Bilder ansehen`;
    // trigger lazy reveal on newly visible images
    if (isOpen) {
      extra.querySelectorAll('img:not(.loaded)').forEach(img => {
        if (img.complete && img.naturalWidth > 0) img.classList.add('loaded');
      });
    }
  });
});

/* LENIS SMOOTH SCROLL */
if (typeof Lenis !== 'undefined') {
  const lenis = new Lenis({
    lerp: 0.075,
    smoothWheel: true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.2,
  });
  (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  // Anchor nav — let Lenis handle smooth jump
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = id === '#' ? document.body : document.querySelector(id);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.4, easing: t => t < .5 ? 2*t*t : -1+(4-2*t)*t });
      }
    });
  });
}

/* CONTACT FORM */
const cform = document.getElementById('cform'), ferr = document.getElementById('ferr'), sbtn = document.getElementById('sbtn');
cform.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('fn').value.trim(), email = document.getElementById('fe').value.trim();
  ferr.style.display = 'none';
  if (!name) { ferr.textContent = 'Bitte gib deinen Namen ein.'; ferr.style.display = 'block'; document.getElementById('fn').focus(); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { ferr.textContent = 'Bitte gib eine gültige E-Mail-Adresse ein.'; ferr.style.display = 'block'; document.getElementById('fe').focus(); return; }
  sbtn.disabled = true; sbtn.textContent = 'Wird gesendet…';
  setTimeout(() => {
    sbtn.classList.add('sent'); sbtn.textContent = 'Gesendet ✓'; cform.reset();
    setTimeout(() => { sbtn.classList.remove('sent'); sbtn.textContent = 'Anfrage senden'; sbtn.disabled = false; }, 4000);
  }, 1200);
});
