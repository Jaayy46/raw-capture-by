/* ─────────────────────────────────────────
   Livio Raschle Photography — v2 Main Script
   ───────────────────────────────────────── */

/* LOADER */
window.addEventListener('load', () =>
  setTimeout(() => document.getElementById('loader').classList.add('out'), 550)
);

/* NAV SCROLL */
const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => {
  navEl.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* MOBILE MENU */
const ham = document.getElementById('nav-ham');
const mob = document.getElementById('nav-mob');
let menuOpen = false;
function toggleMenu() {
  menuOpen = !menuOpen;
  ham.classList.toggle('open', menuOpen);
  mob.classList.toggle('open', menuOpen);
  mob.setAttribute('aria-hidden', !menuOpen);
  ham.setAttribute('aria-expanded', menuOpen);
  ham.setAttribute('aria-label', menuOpen ? 'Menü schliessen' : 'Menü öffnen');
  document.body.style.overflow = menuOpen ? 'hidden' : '';
}
ham.addEventListener('click', toggleMenu);
mob.querySelectorAll('.mob-link').forEach(a =>
  a.addEventListener('click', () => { if (menuOpen) toggleMenu(); })
);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuOpen) toggleMenu();
});

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* INTERSECTION OBSERVER — REVEAL */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('vis'); revObs.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* EXPAND / COLLAPSE */
document.querySelectorAll('.btn-more').forEach(btn => {
  btn.addEventListener('click', () => {
    const extra = document.getElementById(btn.dataset.extra);
    const isOpen = extra.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    const txt = btn.querySelector('.btn-more-txt');
    const ico = btn.querySelector('.btn-more-ico');
    txt.textContent = isOpen ? 'Weniger anzeigen' : `Alle ${btn.dataset.total} Bilder ansehen`;
    ico.textContent = isOpen ? '↑' : '↓';
    if (isOpen) {
      extra.querySelectorAll('.reveal:not(.vis)').forEach(el =>
        setTimeout(() => revObs.observe(el), 80)
      );
    }
  });
});

/* LIGHTBOX */
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
let lbImgs = [], lbIdx = 0;

document.querySelectorAll('.card img, .col-card img').forEach(img => {
  if (img.closest('[aria-hidden="true"]')) return;
  const idx = lbImgs.length;
  lbImgs.push({ src: img.currentSrc || img.src, alt: img.alt });
  const parent = img.closest('.card, .col-card');
  if (parent) {
    if (!parent.getAttribute('tabindex')) parent.setAttribute('tabindex', '0');
    if (!parent.getAttribute('role')) parent.setAttribute('role', 'button');
    parent.addEventListener('click', () => openLB(idx));
    parent.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(idx); }
    });
  }
});

function openLB(i) {
  lbIdx = i;
  lbImg.src = lbImgs[i].src;
  lbImg.alt = lbImgs[i].alt;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('lb-close').focus();
}
function closeLB() {
  lb.classList.remove('open');
  document.body.style.overflow = '';
}
function prevImg() {
  lbIdx = (lbIdx - 1 + lbImgs.length) % lbImgs.length;
  lbImg.src = lbImgs[lbIdx].src; lbImg.alt = lbImgs[lbIdx].alt;
}
function nextImg() {
  lbIdx = (lbIdx + 1) % lbImgs.length;
  lbImg.src = lbImgs[lbIdx].src; lbImg.alt = lbImgs[lbIdx].alt;
}
document.getElementById('lb-close').addEventListener('click', closeLB);
document.getElementById('lb-prev').addEventListener('click', prevImg);
document.getElementById('lb-next').addEventListener('click', nextImg);
lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLB();
  if (e.key === 'ArrowLeft')  prevImg();
  if (e.key === 'ArrowRight') nextImg();
});

/* CONTACT FORM */
const cform = document.getElementById('cform');
const ferr  = document.getElementById('ferr');
const sbtn  = document.getElementById('sbtn');
if (cform) {
  cform.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('fn').value.trim();
    const email = document.getElementById('fe').value.trim();
    ferr.style.display = 'none';
    if (!name)  { ferr.textContent = 'Bitte gib deinen Namen ein.'; ferr.style.display = 'block'; document.getElementById('fn').focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { ferr.textContent = 'Bitte gib eine gültige E-Mail-Adresse ein.'; ferr.style.display = 'block'; document.getElementById('fe').focus(); return; }
    sbtn.disabled = true; sbtn.textContent = 'Wird gesendet…';
    setTimeout(() => {
      sbtn.classList.add('sent'); sbtn.textContent = 'Gesendet ✓'; cform.reset();
      setTimeout(() => { sbtn.classList.remove('sent'); sbtn.textContent = 'Anfrage senden'; sbtn.disabled = false; }, 4000);
    }, 1200);
  });
}

/* IMAGE PROTECTION */
document.addEventListener('contextmenu', e => {
  if (e.target.tagName === 'IMG' || e.target.closest('.card,.col-card,#lightbox')) {
    e.preventDefault(); return false;
  }
});
document.querySelectorAll('img').forEach(img => {
  img.setAttribute('draggable', 'false');
  img.addEventListener('dragstart', e => e.preventDefault());
});
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && ['s','u','p'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});
