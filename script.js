/* =========================================================
   JULES SIMERAY — PORTFOLIO
   script.js
   ========================================================= */

'use strict';

/* ---------------------------------------------------------
   1. HEADER — scroll state
   --------------------------------------------------------- */
const header = document.getElementById('header');

function handleHeaderScroll() {
  header.classList.toggle('scrolled', window.scrollY > 20);
}

window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();

/* ---------------------------------------------------------
   2. NAV — burger toggle (mobile)
   --------------------------------------------------------- */
const burger  = document.getElementById('nav-burger');
const navMenu = document.getElementById('nav-menu');

if (burger && navMenu) {
  /* Backdrop injecté dans le body */
  const backdrop = document.createElement('div');
  backdrop.className = 'nav__backdrop';
  document.body.appendChild(backdrop);

  /* Référence de la position d'origine du menu dans le nav */
  const navParent  = navMenu.parentElement;
  const navAnchor  = navMenu.nextSibling; // le bouton burger

  function closeMenu() {
    navMenu.classList.remove('open');
    backdrop.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    /* Remettre le menu dans le nav après la transition */
    navMenu.addEventListener('transitionend', function restore() {
      navMenu.removeEventListener('transitionend', restore);
      if (!navMenu.classList.contains('open')) {
        navParent.insertBefore(navMenu, navAnchor);
      }
    }, { once: true });
  }

  function openMenu() {
    /* Déplacer le menu dans le body → sort du stacking context du header */
    document.body.appendChild(navMenu);
    /* Forcer un reflow pour que la transition de départ soit prise en compte */
    navMenu.getBoundingClientRect();
    navMenu.classList.add('open');
    backdrop.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  burger.addEventListener('click', () => {
    navMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  backdrop.addEventListener('click', closeMenu);

  navMenu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMenu();
      burger.focus();
    }
  });
}

/* ---------------------------------------------------------
   3. ACTIVE NAV LINK — IntersectionObserver on sections
   --------------------------------------------------------- */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === `#${entry.target.id}`
      );
    });
  });
}, {
  rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '68')}px 0px -55% 0px`,
  threshold: 0,
});

sections.forEach(s => sectionObserver.observe(s));

/* ---------------------------------------------------------
   4. SCROLL REVEAL — fade-in elements
   --------------------------------------------------------- */
const fadeEls = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    /* Stagger siblings inside the same parent */
    const siblings = [...entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)')];
    const delay    = siblings.indexOf(entry.target) * 80;

    setTimeout(() => {
      entry.target.classList.add('visible');
    }, Math.min(delay, 320));

    fadeObserver.unobserve(entry.target);
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px',
});

fadeEls.forEach(el => fadeObserver.observe(el));

/* ---------------------------------------------------------
   5. SKILL BARS — animate when visible
   --------------------------------------------------------- */
const skillFills = document.querySelectorAll('.skill__fill');

const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const fill  = entry.target;
    const width = fill.dataset.width || 0;
    /* Slight delay to let fade-in play first */
    setTimeout(() => {
      fill.style.width = `${width}%`;
    }, 200);
    barObserver.unobserve(fill);
  });
}, { threshold: 0.5 });

skillFills.forEach(fill => barObserver.observe(fill));

/* ---------------------------------------------------------
   6. SMOOTH SCROLL — with offset for fixed header
   --------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '68');
    const top    = target.getBoundingClientRect().top + window.scrollY - navH;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ---------------------------------------------------------
   7. MICRO-INTERACTIONS — card tilt on hover (desktop only)
   --------------------------------------------------------- */
if (window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.card:not(.skill-cat)').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      const cx   = rect.width / 2;
      const cy   = rect.height / 2;
      const rotX = ((y - cy) / cy) * -4;
      const rotY = ((x - cx) / cx) *  4;

      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ---------------------------------------------------------
   8. PASSION CARDS — subtle parallax on visual block
   --------------------------------------------------------- */
if (window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
  const passionCards = document.querySelectorAll('.passion-card');

  passionCards.forEach(card => {
    const visual = card.querySelector('.passion-card__visual');
    if (!visual) return;

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      visual.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
    });

    card.addEventListener('mouseleave', () => {
      visual.style.transform = '';
    });
  });
}

/* ---------------------------------------------------------
   9. PROCESS PHOTOS — carousel scroll + compteur
   --------------------------------------------------------- */
(function () {
  document.querySelectorAll('.process-photos').forEach(strip => {
    const slides = strip.querySelectorAll('.process-photo');
    if (slides.length <= 1) return;

    strip.dataset.count = `1 / ${slides.length}`;

    strip.addEventListener('scroll', () => {
      const index = Math.round(strip.scrollLeft / strip.clientWidth) + 1;
      strip.dataset.count = `${index} / ${slides.length}`;
    }, { passive: true });
  });
})();

/* ---------------------------------------------------------
   10. PEINTURE LIGHTBOX
   --------------------------------------------------------- */
(function () {
  const gallery = document.querySelector('.peinture-gallery');
  if (!gallery) return;

  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lb-img');
  const lbClose   = document.getElementById('lb-close');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');
  const lbCounter = document.getElementById('lb-counter');

  const items = [...gallery.querySelectorAll('.peinture-img-wrap img')];
  let current = 0;

  function open(index) {
    current = index;
    update();
    lightbox.classList.add('lightbox--open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('lightbox--open');
    document.body.style.overflow = '';
  }

  function update() {
    const img  = items[current];
    lbImg.src  = img.src;
    lbImg.alt  = img.alt;
    lbCounter.textContent = `${current + 1} / ${items.length}`;
    lbPrev.style.visibility = current === 0                  ? 'hidden' : 'visible';
    lbNext.style.visibility = current === items.length - 1  ? 'hidden' : 'visible';
  }

  function prev() { if (current > 0)                 { current--; update(); } }
  function next() { if (current < items.length - 1)  { current++; update(); } }

  gallery.querySelectorAll('.peinture-img-wrap').forEach((wrap, i) => {
    wrap.addEventListener('click', () => open(i));
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click',  prev);
  lbNext.addEventListener('click',  next);

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('lightbox--open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });
})();

/* ---------------------------------------------------------
   10. PROCESS LIGHTBOX
   --------------------------------------------------------- */
(function () {
  const section = document.querySelector('.process-section');
  if (!section) return;

  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lb-img');
  const lbClose   = document.getElementById('lb-close');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');
  const lbCounter = document.getElementById('lb-counter');

  const items = [...section.querySelectorAll('.process-photo img')].filter(img => img.getAttribute('src'));
  if (!items.length) return;

  let current = 0;

  function open(index) {
    current = index;
    update();
    lightbox.classList.add('lightbox--open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('lightbox--open');
    document.body.style.overflow = '';
  }

  function update() {
    const img = items[current];
    lbImg.src  = img.src;
    lbImg.alt  = img.alt;
    lbCounter.textContent = `${current + 1} / ${items.length}`;
    lbPrev.style.visibility = current === 0                 ? 'hidden' : 'visible';
    lbNext.style.visibility = current === items.length - 1  ? 'hidden' : 'visible';
  }

  function prev() { if (current > 0)                { current--; update(); } }
  function next() { if (current < items.length - 1) { current++; update(); } }

  items.forEach((img, i) => {
    img.closest('.process-photo').addEventListener('click', () => open(i));
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click',  prev);
  lbNext.addEventListener('click',  next);

  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('lightbox--open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });
})();

/* ---------------------------------------------------------
   11. EASTER EGG — The Pillar Men (tapez "pilar" n'importe où)
   --------------------------------------------------------- */
(function () {

  /* --- Styles injectés --- */
  const s = document.createElement('style');
  s.textContent = `
    #pilar-egg {
      position: fixed; inset: 0; z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      background: #040302;
      opacity: 0; pointer-events: none;
      transition: opacity 0.7s ease;
      overflow: hidden;
    }
    #pilar-egg.pilar-on { opacity: 1; pointer-events: all; }

    #pilar-egg::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 70% 55% at 50% 50%, rgba(180,130,8,0.2) 0%, transparent 70%);
    }
    #pilar-egg::after {
      content: '';
      position: absolute; inset: 0;
      background-image:
        repeating-linear-gradient(rgba(200,169,110,0.04) 1px, transparent 1px),
        repeating-linear-gradient(90deg, rgba(200,169,110,0.04) 1px, transparent 1px);
      background-size: 44px 44px;
    }

    .pilar-body {
      position: relative; z-index: 1;
      text-align: center;
      transform: translateY(50px);
      opacity: 0;
      transition: transform 1s cubic-bezier(0.16,1,0.3,1) 0.1s,
                  opacity  0.9s ease 0.1s;
    }
    #pilar-egg.pilar-on .pilar-body { transform: translateY(0); opacity: 1; }

    .pilar-eyebrow {
      display: block;
      font-family: 'Inter', sans-serif;
      font-size: 0.68rem; font-weight: 600;
      letter-spacing: 0.38em; text-transform: uppercase;
      color: rgba(200,169,110,0.45);
      margin-bottom: 2.2rem;
    }

    .pilar-bars {
      display: flex; gap: 7px; justify-content: center;
      margin-bottom: 2rem;
    }
    .pilar-bars span {
      display: block; width: 2px;
      background: linear-gradient(to bottom, transparent, #c8a96e, transparent);
      animation: pilarBarAnim 1.8s ease-in-out infinite;
    }
    .pilar-bars span:nth-child(1){ height:22px; animation-delay:0s;     }
    .pilar-bars span:nth-child(2){ height:38px; animation-delay:0.12s;  }
    .pilar-bars span:nth-child(3){ height:55px; animation-delay:0.24s;  }
    .pilar-bars span:nth-child(4){ height:38px; animation-delay:0.36s;  }
    .pilar-bars span:nth-child(5){ height:22px; animation-delay:0.48s;  }
    @keyframes pilarBarAnim {
      0%,100%{ opacity:.22; transform:scaleY(.55); }
      50%    { opacity:1;   transform:scaleY(1.2); }
    }

    .pilar-title {
      display: block;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(2.8rem, 9vw, 7rem);
      font-weight: 700; line-height: 1;
      color: #c8a96e;
      text-shadow: 0 0 40px rgba(200,169,110,.65), 0 0 90px rgba(200,169,110,.3);
      margin-bottom: 0.5rem;
    }

    .pilar-awaken {
      display: block;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(1rem, 2.8vw, 1.9rem);
      font-weight: 400; letter-spacing: 0.65em; text-transform: uppercase;
      color: rgba(255,215,120,.85);
      margin-bottom: 3.5rem;
      animation: pilarGlow 2.5s ease-in-out infinite;
    }
    @keyframes pilarGlow {
      0%,100%{ text-shadow: 0 0 18px rgba(200,169,110,.3); }
      50%    { text-shadow: 0 0 50px rgba(200,169,110,.9), 0 0 90px rgba(200,169,110,.4); }
    }

    .pilar-btn {
      background: none;
      border: 1px solid rgba(200,169,110,.32);
      color: rgba(200,169,110,.62);
      padding: .5rem 2.2rem;
      font-family: 'Inter', sans-serif;
      font-size: .7rem; font-weight: 600;
      letter-spacing: .18em; text-transform: uppercase;
      cursor: pointer; border-radius: 4px;
      transition: all .3s ease;
    }
    .pilar-btn:hover {
      border-color: rgba(200,169,110,.9); color: #c8a96e;
      background: rgba(200,169,110,.08);
      box-shadow: 0 0 22px rgba(200,169,110,.18);
    }

    #pilar-yt { display: none; }
  `;
  document.head.appendChild(s);

  /* --- HTML injecté --- */
  const overlay = document.createElement('div');
  overlay.id = 'pilar-egg';
  overlay.innerHTML = `
    <div class="pilar-body">
      <span class="pilar-eyebrow">JoJo's Bizarre Adventure · Battle Tendency</span>
      <div class="pilar-bars">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <span class="pilar-title">THE PILLAR MEN</span>
      <span class="pilar-awaken">— Awaken —</span>
      <button class="pilar-btn" id="pilar-btn">Fermer</button>
    </div>
    <div id="pilar-yt"></div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('pilar-btn').addEventListener('click', closePilar);

  /* --- Audio local --- */
  const pilarAudio = new Audio('theme musique/pilar.opus');
  pilarAudio.loop = false;

  /* --- Détection du mot-clé --- */
  let buf = '';
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('pilar-on')) {
      closePilar(); return;
    }
    if (overlay.classList.contains('pilar-on')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    buf += e.key.toLowerCase();
    if (buf.length > 5) buf = buf.slice(-5);
    if (buf === 'pilar') { openPilar(); buf = ''; }
  });

  function openPilar() {
    overlay.classList.add('pilar-on');
    document.body.style.overflow = 'hidden';
    pilarAudio.currentTime = 0;
    pilarAudio.play();
  }

  function closePilar() {
    overlay.classList.remove('pilar-on');
    document.body.style.overflow = '';
    pilarAudio.pause();
    pilarAudio.currentTime = 0;
  }

/* ---------------------------------------------------------
   13. THEME SWITCHER
   --------------------------------------------------------- */
const THEMES = {
  gold:  { accent: '#c8a96e', accent2: '#8b6f3c' },
  blue:  { accent: '#00ff41', accent2: '#00cc33' },
  rose:  { accent: '#d4547b', accent2: '#9e3254' },
};

/* ----- Matrix rain — RAF + frame throttle à 24 fps ----- */
let _matrixCanvas = null, _matrixRafId = null;

function startMatrixRain() {
  if (_matrixCanvas) return;
  _matrixCanvas = document.createElement('canvas');
  _matrixCanvas.id = 'vp-matrix';
  Object.assign(_matrixCanvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '3', opacity: '0.08',
    willChange: 'contents',
  });
  document.body.prepend(_matrixCanvas);

  const ctx = _matrixCanvas.getContext('2d', { alpha: false });
  const CHARS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿ01アイウエオ{}<>[]#$%&';
  const SZ = 18; /* plus grand = moins de colonnes = moins de draws */
  let cols, drops;

  function resize() {
    _matrixCanvas.width  = window.innerWidth;
    _matrixCanvas.height = window.innerHeight;
    cols  = Math.floor(_matrixCanvas.width / SZ);
    drops = Array(cols).fill(1);
  }
  resize();
  window.addEventListener('resize', resize);

  const TARGET_FPS = 24;
  const FRAME_MS   = 1000 / TARGET_FPS;
  let lastT = 0;

  function loop(t) {
    if (!_matrixCanvas) return;
    _matrixRafId = requestAnimationFrame(loop);
    if (t - lastT < FRAME_MS) return;
    lastT = t;

    ctx.fillStyle = 'rgba(0,9,0,0.06)';
    ctx.fillRect(0, 0, _matrixCanvas.width, _matrixCanvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = SZ + 'px monospace';
    for (let i = 0; i < cols; i++) {
      ctx.fillText(CHARS[Math.random() * CHARS.length | 0], i * SZ, drops[i] * SZ);
      if (drops[i] * SZ > _matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  _matrixRafId = requestAnimationFrame(loop);
}

function stopMatrixRain() {
  cancelAnimationFrame(_matrixRafId); _matrixRafId = null;
  if (_matrixCanvas) { _matrixCanvas.remove(); _matrixCanvas = null; }
}

/* ----- Text scramble on scroll — textContent only, pas d'innerHTML ----- */
const SCRAMBLE_CHARS = '!<>[]{}=+-*?#$@/\\01ｱｲｳｴｵ';
let _scrambleObs = null;

function scrambleEl(el) {
  if (el.dataset.vpDone) return;
  el.dataset.vpDone = '1';
  const orig = el.textContent;
  let frame = 0;
  const total = Math.min(orig.length * 2, 44);

  (function tick() {
    if (document.documentElement.getAttribute('data-theme') !== 'vaporwave') {
      el.textContent = orig; return;
    }
    frame++;
    if (frame >= total) { el.textContent = orig; return; }
    const progress = frame / total;
    let out = '';
    for (let i = 0; i < orig.length; i++) {
      if (orig[i] === ' ' || orig[i] === '\n') { out += orig[i]; continue; }
      out += i / orig.length < progress
        ? orig[i]
        : SCRAMBLE_CHARS[Math.random() * SCRAMBLE_CHARS.length | 0];
    }
    el.textContent = out; /* textContent évite le parsing HTML + reflow */
    requestAnimationFrame(tick);
  })();
}

function initVaporwaveEffects() {
  startMatrixRain();
  const sel = [
    '.section__label', '.section__title',
    '.timeline__role', '.timeline__company', '.timeline__date',
    '.passion-card__title', '.passion-card__cta',
    '.exp-block__label', '.exp-hero__company', '.exp-hero__date',
    '.footer__name', '.footer__copy',
    '.outils__item__name', '.nav__link',
  ].join(',');

  _scrambleObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) scrambleEl(e.target); });
  }, { threshold: 0.4 });

  document.querySelectorAll(sel).forEach(el => _scrambleObs.observe(el));
}

function destroyVaporwaveEffects() {
  stopMatrixRain();
  if (_scrambleObs) { _scrambleObs.disconnect(); _scrambleObs = null; }
  document.querySelectorAll('[data-vp-done]').forEach(el => delete el.dataset.vpDone);
}

function applyTheme(name) {
  const t = THEMES[name] || THEMES.gold;
  document.documentElement.style.setProperty('--accent', t.accent);
  document.documentElement.style.setProperty('--accent-2', t.accent2);

  if (name === 'blue') {
    document.documentElement.setAttribute('data-theme', 'vaporwave');
    if (!document.getElementById('font-vaporwave')) {
      const link = document.createElement('link');
      link.id = 'font-vaporwave';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap';
      document.head.appendChild(link);
    }
    initVaporwaveEffects();
  } else {
    document.documentElement.removeAttribute('data-theme');
    destroyVaporwaveEffects();
  }

  localStorage.setItem('portfolio-theme', name);
}

/* Apply saved theme on every page load */
applyTheme(localStorage.getItem('portfolio-theme') || 'gold');

/* Switcher UI (only present on index.html) */
const themeToggle   = document.getElementById('theme-toggle');
const themeDropdown = document.getElementById('theme-dropdown');

if (themeToggle && themeDropdown) {
  /* Mark the currently active swatch */
  const saved = localStorage.getItem('portfolio-theme') || 'gold';
  themeDropdown.querySelector(`[data-theme="${saved}"]`)?.classList.add('active');

  themeToggle.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = themeDropdown.classList.toggle('open');
    themeToggle.setAttribute('aria-expanded', String(isOpen));
  });

  themeDropdown.addEventListener('click', e => {
    e.stopPropagation();
    const swatch = e.target.closest('.theme-swatch');
    if (!swatch) return;
    applyTheme(swatch.dataset.theme);
    themeDropdown.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    themeDropdown.classList.remove('open');
    themeToggle.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('click', () => {
    themeDropdown.classList.remove('open');
    themeToggle.setAttribute('aria-expanded', 'false');
  });
}

})();
