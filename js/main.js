/* ============================================================
   RAW CAPTURE BY — v3  Photo-First JS
   Loader · Nav · Reveal · Lightbox · Form
   ============================================================ */
'use strict';

// ── LOADER ────────────────────────────────────────────────────
const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  setTimeout(() => loader.classList.add('hidden'), 1400);
});

// ── NAV SCROLL ────────────────────────────────────────────────
const nav      = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

const onScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);

  // active link
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── MOBILE MENU ───────────────────────────────────────────────
const burger     = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');
const mmLinks    = document.querySelectorAll('.mm-link');

const toggleMenu = (open) => {
  mobileMenu.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  const [s1, s2, s3] = burger.querySelectorAll('span');
  if (open) {
    s1.style.transform = 'rotate(45deg) translate(4px, 4px)';
    s2.style.opacity   = '0';
    s3.style.transform = 'rotate(-45deg) translate(4px, -4px)';
  } else {
    [s1, s2, s3].forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
};

burger.addEventListener('click', () => toggleMenu(!mobileMenu.classList.contains('open')));
mmLinks.forEach(a => a.addEventListener('click', () => toggleMenu(false)));

// ── REVEAL ON SCROLL ──────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── LIGHTBOX ──────────────────────────────────────────────────
const lightbox  = document.getElementById('lightbox');
// 1x1 transparent GIF. <img> requires a src: an empty one resolves to
// the page URL and refetches the document as an image, and omitting it
// is invalid HTML. This is inert and costs no request.
const BLANK_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const lbImg     = document.getElementById('lbImg');
const lbCaption = document.getElementById('lbCaption');
const lbClose   = document.getElementById('lbClose');
const lbPrev    = document.getElementById('lbPrev');
const lbNext    = document.getElementById('lbNext');

let lbItems   = [];
let lbCurrent = 0;

const showLb = () => {
  const item  = lbItems[lbCurrent];
  lbImg.src   = item.src;
  lbImg.alt   = item.alt || '';
  lbCaption.textContent = item.caption || '';
  lbPrev.hidden = lbItems.length < 2;
  lbNext.hidden = lbItems.length < 2;
};

const openLb = (items, idx) => {
  lbItems   = items;
  lbCurrent = idx;
  showLb();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeLb = () => {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lbImg.src = BLANK_PIXEL; }, 360);
};

const prevLb = () => { lbCurrent = (lbCurrent - 1 + lbItems.length) % lbItems.length; showLb(); };
const nextLb = () => { lbCurrent = (lbCurrent + 1) % lbItems.length; showLb(); };

lbClose.addEventListener('click', closeLb);
lbPrev.addEventListener('click', prevLb);
lbNext.addEventListener('click', nextLb);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLb();
  if (e.key === 'ArrowLeft')  prevLb();
  if (e.key === 'ArrowRight') nextLb();
});

// Wire grid items to lightbox
document.querySelectorAll('[data-category]').forEach(strip => {
  const imgs  = [...strip.querySelectorAll('img')];
  const items = imgs.map(img => ({
    src:     img.currentSrc || img.src,
    alt:     img.alt,
    caption: img.getAttribute('data-alt') || ''
  }));
  imgs.forEach((img, i) => {
    const cell = img.closest('.grid-item');
    if (cell) cell.addEventListener('click', () => {
      // use currentSrc for WebP if loaded
      const liveItems = imgs.map(im => ({
        src:     im.currentSrc || im.src,
        alt:     im.alt,
        caption: im.getAttribute('data-alt') || ''
      }));
      openLb(liveItems, i);
    });
  });
});

// ── CONTACT FORM ──────────────────────────────────────────────
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Gesendet ✓';
    btn.style.opacity = '0.5';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Nachricht senden →';
      btn.style.opacity = '';
      btn.disabled = false;
      form.reset();
    }, 3000);
  });
}

// ── SMOOTH SCROLL ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    if (!id) { window.scrollTo({ top: 0, behavior: 'smooth' }); e.preventDefault(); return; }
    const target = document.getElementById(id);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
