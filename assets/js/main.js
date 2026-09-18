/* =========================================================
   JULIEN-1 — interactions
   Vanilla JS, aucune dépendance.
   ========================================================= */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------
     1. Écran de chargement
     --------------------------------------------------- */
  const boot = $('#boot');
  const bootPct = $('#bootPct');
  (function runBoot() {
    if (!boot) return;
    let p = 0;
    const tick = () => {
      p = Math.min(100, p + Math.random() * 13 + 4);
      if (bootPct) bootPct.textContent = String(Math.round(p)).padStart(3, '0');
      if (p < 100) return setTimeout(tick, 90);
      setTimeout(() => {
        boot.classList.add('is-done');
        document.body.classList.add('is-ready');
        startObservers();
      }, 340);
    };
    if (reduced) {
      boot.classList.add('is-done');
      document.body.classList.add('is-ready');
      setTimeout(startObservers, 0);
    } else {
      setTimeout(tick, 180);
    }
  })();

  /* ---------------------------------------------------
     2. Curseur personnalisé + aimantation
     --------------------------------------------------- */
  const cursor = $('.cursor');
  if (cursor && window.matchMedia('(pointer:fine)').matches && !reduced) {
    const dot = $('.cursor__dot', cursor);
    const ring = $('.cursor__ring', cursor);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.classList.add('is-on');
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    }, { passive: true });

    (function loop() {
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    $$('a, button, summary, .card, .plan, .offer, .quote').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hot'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hot'));
    });

    $$('[data-magnetic]').forEach(el => {
      const strength = 0.32;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------
     3. Découpe du texte en lignes (titres)
     --------------------------------------------------- */
  function splitLines(el) {
    if (el.dataset.splitDone) return;
    const html = el.innerHTML;
    el.dataset.original = html;
    const words = html.replace(/<br\s*\/?>/gi, '   ').split(/\s+/).filter(Boolean);
    el.innerHTML = words.map(w => w === ' ' ? '<br>' : `<span class="w">${w}</span>`).join(' ');

    const spans = $$('.w', el);
    const lines = [];
    let top = null, bucket = null;
    spans.forEach(s => {
      const t = Math.round(s.offsetTop);
      if (top === null || Math.abs(t - top) > 4) { top = t; bucket = []; lines.push(bucket); }
      bucket.push(s.outerHTML);
    });
    el.innerHTML = lines.map(l => `<span class="line"><i>${l.join(' ')}</i></span>`).join('');
    el.dataset.splitDone = '1';
  }

  const splitTargets = $$('[data-split]');
  const doSplit = () => splitTargets.forEach(splitLines);
  document.fonts && document.fonts.ready ? document.fonts.ready.then(doSplit) : doSplit();
  setTimeout(doSplit, 600);

  let rsz;
  addEventListener('resize', () => {
    clearTimeout(rsz);
    rsz = setTimeout(() => {
      splitTargets.forEach(el => {
        if (!el.dataset.original) return;
        el.innerHTML = el.dataset.original;
        delete el.dataset.splitDone;
        splitLines(el);
        if (el.dataset.wasIn) el.classList.add('is-in');
      });
    }, 240);
  });

  /* ---------------------------------------------------
     4. Apparitions au défilement
     --------------------------------------------------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const d = Number(el.dataset.delay || 0);
      setTimeout(() => { el.classList.add('is-in'); el.dataset.wasIn = '1'; }, d);
      io.unobserve(el);
    });
  }, { threshold: 0.04, rootMargin: '0px 0px -3% 0px' });

  let observersStarted = false;
  function startObservers() {
    if (observersStarted) return;
    observersStarted = true;
    $$('[data-reveal], [data-split]').forEach(el => io.observe(el));
    $$('[data-count]').forEach(el => counters.observe(el));
    $$('[data-bar]').forEach(el => bars.observe(el));
  }
  window.addEventListener('load', () => setTimeout(startObservers, 2600));

  /* ---------------------------------------------------
     5. Compteurs
     --------------------------------------------------- */
  const counters = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1500;
      const t0 = performance.now();
      const fmt = n => n.toLocaleString('fr-FR');
      const step = now => {
        const p = clamp((now - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(target * eased)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      reduced ? (el.textContent = fmt(target) + suffix) : requestAnimationFrame(step);
      counters.unobserve(el);
    });
  }, { threshold: 0.35 });

  /* ---------------------------------------------------
     6. Barres de benchmark
     --------------------------------------------------- */
  const bars = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.width = e.target.dataset.bar + '%';
      bars.unobserve(e.target);
    });
  }, { threshold: 0.3 });

  /* ---------------------------------------------------
     7. Manifeste — mots qui s'allument
     --------------------------------------------------- */
  const manifeste = $('[data-words]');
  if (manifeste) {
    manifeste.innerHTML = manifeste.textContent.trim().split(/\s+/)
      .map(w => `<w>${w}</w>`).join(' ');
  }
  const words = manifeste ? $$('w', manifeste) : [];

  /* ---------------------------------------------------
     8. Fond réactif à la section courante
     --------------------------------------------------- */
  const THEMES = {
    walnut: { bg: '#100904', bg2: '#1a0f07', glow: 'rgba(220,80,0,.18)' },
    bark:   { bg: '#150d06', bg2: '#2a1a0f', glow: 'rgba(220,80,0,.13)' },
    deep:   { bg: '#0a0502', bg2: '#120a04', glow: 'rgba(110,106,79,.16)' },
    ember:  { bg: '#1a0a03', bg2: '#331506', glow: 'rgba(220,80,0,.34)' }
  };
  const root = document.documentElement;
  const bgIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const t = THEMES[e.target.dataset.bg] || THEMES.walnut;
      root.style.setProperty('--bg', t.bg);
      root.style.setProperty('--bg-2', t.bg2);
      root.style.setProperty('--glow', t.glow);
    });
  }, { threshold: 0.01, rootMargin: '-45% 0px -45% 0px' });
  $$('[data-bg]').forEach(el => bgIO.observe(el));

  /* ---------------------------------------------------
     9. Navigation : masquage + état collé
     --------------------------------------------------- */
  const nav = $('#nav');
  const progress = $('.scroll-progress i');
  let lastY = 0;

  /* ---------------------------------------------------
     10. Menu mobile
     --------------------------------------------------- */
  const burger = $('#burger'), menu = $('#menu');
  if (burger && menu) {
    const toggle = force => {
      const open = force !== undefined ? force : !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggle());
    $$('a', menu).forEach(a => a.addEventListener('click', () => toggle(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
  }

  /* ---------------------------------------------------
     11. Anatomie : étapes + rotation du stylo
     --------------------------------------------------- */
  const steps = $$('.step');
  const penAnatomy = $('.pen--anatomy');
  const penHero = $('.pen--hero');
  const penReveal = $('.pen--reveal');
  const halo = $('.anatomy__halo');
  const ROT = { cap: -8, barrel: 6, ink: -4, tip: 14 };

  /* ---------------------------------------------------
     12. Boucle de défilement (parallaxe, progression, états)
     --------------------------------------------------- */
  let ticking = false;
  function onScroll() {
    const y = scrollY;
    const docH = document.documentElement.scrollHeight - innerHeight;

    if (progress) progress.style.width = clamp(y / docH, 0, 1) * 100 + '%';

    if (nav) {
      nav.classList.toggle('is-stuck', y > 40);
      nav.classList.toggle('is-hidden', y > lastY && y > 520 && !menu?.classList.contains('is-open'));
    }
    lastY = y;

    if (!reduced) {
      if (penHero) {
        const p = clamp(y / innerHeight, 0, 1.4);
        penHero.style.transform = `translateY(${p * 130}px) rotate(${p * 26}deg) scale(${1 - p * 0.08})`;
      }
      if (penReveal) {
        const r = penReveal.closest('section').getBoundingClientRect();
        const p = clamp(1 - (r.top + r.height) / (innerHeight + r.height), 0, 1);
        penReveal.style.transform = `translateY(${(p - .5) * 90}px) rotate(${-14 + p * 30}deg)`;
      }
      // Manifeste : allumage progressif
      if (words.length) {
        const r = manifeste.getBoundingClientRect();
        const p = clamp((innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.22), 0, 1);
        const n = Math.round(p * words.length);
        words.forEach((w, i) => w.classList.toggle('is-lit', i < n));
      }
    }

    // Étape active de l'anatomie
    if (steps.length) {
      let active = null;
      steps.forEach(s => {
        const r = s.getBoundingClientRect();
        if (r.top < innerHeight * 0.62 && r.bottom > innerHeight * 0.18) active = s;
      });
      steps.forEach(s => s.classList.toggle('is-active', s === active));
      if (active && penAnatomy) {
        const key = active.dataset.step;
        penAnatomy.style.transform = `rotate(${ROT[key] ?? 0}deg) translateY(${(ROT[key] ?? 0) * -1.6}px)`;
        if (halo) halo.style.background =
          key === 'tip' ? 'radial-gradient(circle,rgba(247,220,174,.26),transparent 64%)'
                        : 'radial-gradient(circle,rgba(220,80,0,.22),transparent 64%)';
      }
    }
    ticking = false;
  }
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------------------------------------------------
     13. Configurateur
     --------------------------------------------------- */
  const switchBtns = $$('.switch__btn');
  const pill = $('.switch__pill');
  const configSection = $('.config');
  function movePill(btn) {
    if (!pill || !btn) return;
    pill.style.width = btn.offsetWidth + 'px';
    pill.style.transform = `translateX(${btn.offsetLeft - 5}px)`;
  }
  if (switchBtns.length) {
    movePill($('.switch__btn.is-active'));
    addEventListener('resize', () => movePill($('.switch__btn.is-active')));
    switchBtns.forEach(btn => btn.addEventListener('click', () => {
      switchBtns.forEach(b => b.classList.toggle('is-active', b === btn));
      movePill(btn);
      const mode = btn.dataset.mode;
      $$('.config__state').forEach(s => { s.hidden = s.dataset.state !== mode; });
      configSection?.classList.toggle('is-open', mode === 'open');
    }));
  }

  /* ---------------------------------------------------
     14. Cartes : dégradé suivant la souris
     --------------------------------------------------- */
  $$('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---------------------------------------------------
     15. Copie du BibTeX
     --------------------------------------------------- */
  const copyBtn = $('[data-copy]');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const code = $('.code code')?.textContent || '';
      try { await navigator.clipboard.writeText(code); } catch (_) {}
      const old = copyBtn.textContent;
      copyBtn.textContent = 'Copié';
      setTimeout(() => { copyBtn.textContent = old; }, 1600);
    });
  }

  /* ---------------------------------------------------
     16. FAQ : une seule réponse ouverte
     --------------------------------------------------- */
  const qas = $$('.qa');
  qas.forEach(d => d.addEventListener('toggle', () => {
    if (d.open) qas.forEach(o => { if (o !== d) o.open = false; });
  }));
})();
