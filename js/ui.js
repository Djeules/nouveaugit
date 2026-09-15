/**
 * DOM layer: custom cursor, text splitting, scroll reveals, magnetic buttons,
 * card tilt, scroll progress and nav highlighting. No dependencies.
 */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const lerp = (a, b, t) => a + (b - a) * t;

/* ------------------------------------------------------------------ */
/* split headings into lines / words                                   */
/* ------------------------------------------------------------------ */
function splitText() {
  document.querySelectorAll('[data-split]').forEach((el) => {
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    let n = 0;
    el.innerHTML = lines.map((line) => {
      const words = line.trim().split(/\s+/).filter(Boolean).map((w) => {
        const delay = (n++ * 0.06).toFixed(2);
        return `<span class="split__word" style="transition-delay:${delay}s">${w}</span>`;
      }).join(' ');
      return `<span class="split__line">${words}</span>`;
    }).join('');
    el.classList.add('split');
  });
}

/* ------------------------------------------------------------------ */
/* reveal on scroll                                                    */
/* ------------------------------------------------------------------ */
function setupReveals() {
  const items = document.querySelectorAll('[data-reveal], .split');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  items.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------------ */
/* custom cursor                                                       */
/* ------------------------------------------------------------------ */
function setupCursor() {
  const el = document.getElementById('cursor');
  if (!el || !fine) return;

  const ring = el.querySelector('.cursor__ring');
  const dot = el.querySelector('.cursor__dot');
  const label = el.querySelector('.cursor__label');

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let rx = x;
  let ry = y;

  window.addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY;
    const link = e.target.closest('a, button, [data-tilt]');
    el.classList.toggle('is-link', !!link && !document.documentElement.classList.contains('avatar-hot'));
  }, { passive: true });

  window.addEventListener('pointerdown', () => el.classList.add('is-down'), { passive: true });
  window.addEventListener('pointerup', () => el.classList.remove('is-down'), { passive: true });

  let hot = false;
  const tick = () => {
    rx = lerp(rx, x, 0.18);
    ry = lerp(ry, y, 0.18);
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    label.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;

    const nowHot = document.documentElement.classList.contains('avatar-hot');
    if (nowHot !== hot) {
      hot = nowHot;
      el.classList.toggle('is-hot', hot);
      if (hot) el.classList.remove('is-link');
    }
    requestAnimationFrame(tick);
  };
  tick();
}

/* ------------------------------------------------------------------ */
/* magnetic buttons                                                    */
/* ------------------------------------------------------------------ */
function setupMagnetic() {
  if (!fine || reduced) return;
  const els = Array.from(document.querySelectorAll('[data-magnetic]'));

  els.forEach((el) => {
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;

    const animate = () => {
      cx = lerp(cx, tx, 0.18);
      cy = lerp(cy, ty, 0.18);
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      if (Math.abs(cx - tx) > 0.1 || Math.abs(cy - ty) > 0.1) raf = requestAnimationFrame(animate);
      else raf = 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(animate); };

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * 0.3;
      ty = (e.clientY - (r.top + r.height / 2)) * 0.4;
      kick();
    });
    el.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  });
}

/* ------------------------------------------------------------------ */
/* 3D tilt on cards                                                    */
/* ------------------------------------------------------------------ */
function setupTilt() {
  if (!fine || reduced) return;
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform =
        `perspective(700px) rotateY(${(px * 13).toFixed(2)}deg) rotateX(${(-py * 13).toFixed(2)}deg) translateZ(8px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ------------------------------------------------------------------ */
/* scroll progress + nav state                                         */
/* ------------------------------------------------------------------ */
function setupScrollState() {
  const fill = document.getElementById('progress-fill');
  const links = Array.from(document.querySelectorAll('.nav__link'));
  const sections = Array.from(document.querySelectorAll('.section[data-index]'));
  let ticking = false;

  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (fill) fill.style.height = `${(p * 100).toFixed(2)}%`;

    const mid = window.scrollY + window.innerHeight * 0.5;
    let current = sections[0];
    sections.forEach((s) => { if (s.offsetTop <= mid) current = s; });
    const id = current?.id;
    let marked = false;                     // several links may share a target
    links.forEach((l) => {
      const hit = !marked && l.getAttribute('href') === `#${id}`;
      if (hit) marked = true;
      l.classList.toggle('is-active', hit);
    });
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ------------------------------------------------------------------ */
export function initUI() {
  splitText();
  setupReveals();
  setupCursor();
  setupMagnetic();
  setupTilt();
  setupScrollState();
}
