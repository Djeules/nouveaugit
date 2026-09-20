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

    const done = () => {
      boot.classList.add('is-done');
      document.body.classList.add('is-ready');
      startObservers();
    };

    // Le compteur durait 1,4 s en moyenne et jusqu'à 2,8 s, pour un délai
    // entièrement fabriqué : la page était prête. Au-delà d'une seconde,
    // le rebond décroche. Il est plafonné à ~600 ms, et il ne se joue
    // qu'une fois par session — celui qui revient ne le revoit pas.
    let seen = false;
    try { seen = sessionStorage.getItem('julien:boot') === '1'; } catch (e) {}

    if (reduced || seen) {
      done();
      if (reduced) setTimeout(startObservers, 0);
      return;
    }
    try { sessionStorage.setItem('julien:boot', '1'); } catch (e) {}

    let p = 0;
    const tick = () => {
      p = Math.min(100, p + Math.random() * 22 + 14);
      if (bootPct) bootPct.textContent = String(Math.round(p)).padStart(3, '0');
      if (p < 100) return setTimeout(tick, 60);
      setTimeout(done, 200);
    };
    setTimeout(tick, 120);
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
  const mockup = $('.mockup');
  const mockPen = $('.mockup__pen');
  const penReveal = $('.pen--reveal');
  const halo = $('.anatomy__halo');

  /* ---------------------------------------------------
     12. Boucle de défilement (parallaxe, progression, états)
     --------------------------------------------------- */
  let ticking = false;

  const navCta = $('.nav__cta');
  const revelation = $('#revelation');
  // Une seule source pour l'adresse de réservation : celle du lien de la
  // section Contact. Elle n'est donc jamais dupliquée dans le script.
  const BOOKING = $('[data-booking]')?.getAttribute('href') || '#contact';
  let ctaLive = false;

  function onScroll() {
    const y = scrollY;
    const docH = document.documentElement.scrollHeight - innerHeight;

    if (progress) progress.style.width = clamp(y / docH, 0, 1) * 100 + '%';

    if (nav) {
      nav.classList.toggle('is-stuck', y > 40);
      nav.classList.toggle('is-hidden', y > lastY && y > 520 && !menu?.classList.contains('is-open'));
    }

    // Avant la Divulgation, le bouton appartient à la fiction. Après, il
    // devient le seul chemin réel — sans quoi la réservation n'apparaît
    // qu'à 94 % de la page, après vingt-six écrans de défilement.
    if (navCta && revelation) {
      const past = y + innerHeight * 0.6 > revelation.offsetTop;
      if (past !== ctaLive) {
        ctaLive = past;
        const label = navCta.querySelector('span');
        if (past) {
          navCta.href = BOOKING;
          navCta.target = '_blank';
          navCta.rel = 'noopener';
          if (label) label.textContent = 'Réserver trente minutes';
        } else {
          navCta.href = '#revelation';
          navCta.removeAttribute('target');
          navCta.removeAttribute('rel');
          if (label) label.textContent = 'Précommander';
        }
      }
    }
    lastY = y;

    if (!reduced) {
      if (mockup) {
        const p = clamp(y / innerHeight, 0, 1);
        mockup.style.transform = `translateY(${p * -54}px) scale(${1 + p * 0.07})`;
        if (mockPen) mockPen.style.transform = `rotate(${20 + p * 14}deg) translate(${p * -18}px, ${p * 26}px)`;
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
      if (active && halo) {
        halo.style.background = active.dataset.step === 'tip'
          ? 'radial-gradient(circle,rgba(247,220,174,.26),transparent 64%)'
          : 'radial-gradient(circle,rgba(220,80,0,.22),transparent 64%)';
      }
    }

    // Titres qui montent en lumière à mesure qu'ils entrent dans la fenêtre
    for (const el of lits) {
      const r = el.getBoundingClientRect();
      const q = clamp((innerHeight * 0.9 - r.top) / (r.height + innerHeight * 0.34), 0, 1);
      el.style.opacity = (0.2 + 0.8 * q).toFixed(3);
    }

    if (pens.pop) {
      const r = $('#portable').getBoundingClientRect();
      const q = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1);
      drawPen(pens.pop, reduced ? 26 : -60 + q * 340, 10, 0.58);
    }

    // Stylo 3D de la section Anatomie : rotation et échelle sur toute la traversée
    if (pens.anatomy) {
      const sec = $('#stylo');
      const r = sec.getBoundingClientRect();
      const p = clamp((innerHeight * 0.5 - r.top) / (r.height - innerHeight * 0.5), 0, 1);
      if (reduced) {
        drawPen(pens.anatomy, 18, -8, 1);
      } else {
        drawPen(pens.anatomy, -20 + p * 400, -14 + Math.sin(p * Math.PI) * 26, 0.92 + p * 0.3);
      }
    }
    ticking = false;
  }
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

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
     19. Stylo 3D — prisme hexagonal construit en CSS
     --------------------------------------------------- */
  const PEN = {
    W: 30,        // largeur d'une face du corps
    CAP: 168,     // hauteur du capuchon
    BARREL: 402,  // hauteur du corps
    TIP: 62,      // hauteur de la pointe conique
    INK: 7,       // demi-largeur du réservoir
    LIGHT: -36    // direction de la lumière, en degrés
  };
  const APO = w => w * 0.8660254;   // apothème d'un hexagone régulier

  function buildPen(host) {
    const { W, CAP, BARREL, TIP, INK } = PEN;
    const R = APO(W), total = CAP + BARREL + TIP, half = total / 2;
    const capY    = -half + CAP / 2;
    const barrelY = -half + CAP + BARREL / 2;
    const tipY    = -half + CAP + BARREL + TIP / 2;
    const ballY   = -half + total + 3;
    const discY   = -half;

    const rot = document.createElement('div');
    rot.className = 'pen3d__rot';
    const faces = [];

    const face = (cls, w, h, angle, radius, y, extra = '') => {
      const d = document.createElement('div');
      d.className = 'p-face ' + cls;
      d.style.cssText = `width:${w}px;height:${h}px;margin-left:${-w / 2}px;margin-top:${-h / 2}px;`;
      d.dataset.a = angle;
      d.dataset.t = `translateY(${y}px) rotateY(${angle}deg) translateZ(${radius}px)${extra}`;
      d.style.transform = d.dataset.t;
      rot.appendChild(d);
      faces.push(d);
      return d;
    };

    for (let k = 0; k < 6; k++) {
      const a = k * 60;
      face('p-cap',    W + 1.6, CAP,    a, APO(W + 1.6), capY);
      face('p-barrel', W,       BARREL, a, R,            barrelY).dataset.fres = '1';
      face('p-ink',    INK * 2, BARREL - 26, a, APO(INK * 2), barrelY);
      // pointe : trapèze incliné vers l'axe
      const rTop = R, rBot = R * 0.26;
      const tilt = Math.atan2(rTop - rBot, TIP) * 180 / Math.PI;
      const f = face('p-tip', W, TIP, a, (rTop + rBot) / 2, tipY, ` rotateX(${-tilt}deg)`);
      f.style.clipPath = 'polygon(0% 0%, 100% 0%, 63% 100%, 37% 100%)';
    }

    // disque supérieur du capuchon
    const disc = face('p-disc', W * 2, W * 2, 0, 0, discY, ' rotateX(90deg)');
    disc.style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
    disc.dataset.flat = '1';

    // clip du capuchon : boîte fine de quatre faces
    const clipY = capY - 4, CH = 96, CW = 9, CD = 5;
    face('p-clip', CW, CH,   0, APO(W + 1.6) + CD, clipY);
    face('p-clip', CD, CH,  90, CW / 2,            clipY).style.opacity = '.85';
    face('p-clip', CD, CH, 270, CW / 2,            clipY).style.opacity = '.85';

    const ball = document.createElement('div');
    ball.className = 'p-ball';
    ball.style.cssText = 'width:9px;height:9px;margin-left:-4.5px;margin-top:-4.5px;';
    ball.dataset.y = ballY;
    rot.appendChild(ball);

    const glow = document.createElement('div');
    glow.className = 'pen3d__glow';

    host.replaceChildren(glow, rot);
    return { host, rot, faces, ball, scale: 1 };
  }

  function drawPen(inst, rotY, tiltX, scale) {
    inst.rot.style.transform =
      `translateZ(-40px) rotateX(${tiltX}deg) rotateY(${rotY}deg) scale3d(${scale},${scale},${scale})`;
    // éclairage : chaque face s'éclaire selon l'angle qu'elle présente à la lumière
    for (const f of inst.faces) {
      if (f.dataset.flat) { f.style.setProperty('--l', 0.42); continue; }
      const a = +f.dataset.a;
      const lum = (Math.cos((a + rotY - PEN.LIGHT) * Math.PI / 180) + 1) / 2;
      f.style.setProperty('--l', (0.07 + 0.93 * Math.pow(lum, 1.45)).toFixed(3));
      // Fresnel : une face vue de biais renvoie plus de lumière qu'une face de face.
      // C'est ce qui fait lire un tube transparent par ses bords.
      if (f.dataset.fres) {
        const view = Math.abs(Math.cos((a + rotY) * Math.PI / 180));
        f.style.setProperty('--f', Math.pow(1 - view, 0.75).toFixed(3));
      }
    }
    inst.ball.style.transform =
      `translateY(${inst.ball.dataset.y}px) rotateY(${-rotY}deg) rotateX(${-tiltX}deg)`;
  }

  // graduations imprimées du tapis de découpe
  $$('[data-ruler]').forEach(r => {
    const n = r.dataset.ruler === 'y' ? 8 : 12;
    r.innerHTML = Array.from({ length: n }, (_, i) => `<span>${(i + 2) * 10}</span>`).join('');
  });

  const lits = $$('[data-lit]');
  const pens = {};
  $$('[data-pen3d]').forEach(host => { pens[host.dataset.pen3d] = buildPen(host); });

  /* ---------------------------------------------------
     18. « Précommander » — le bouton répond au lieu de sauter
     --------------------------------------------------- */
  const preorder = $('[data-preorder]');
  const ctaReply = $('#ctaReply');
  if (preorder && ctaReply) {
    const REPLIES = [
      "Aucun stylo n'est vendu ici. Continuez à défiler, vous comprendrez pourquoi.",
      "Toujours aucun stylo. Mais j'aime votre insistance.",
      "C'est exactement l'énergie qu'on travaille en formation.",
      "Bon. Vous l'aurez voulu — cliquez encore et je vous y emmène."
    ];
    let step = 0;
    preorder.addEventListener('click', e => {
      if (step >= REPLIES.length) return;   // au-delà, le lien reprend son cours
      e.preventDefault();
      ctaReply.classList.remove('is-in');
      const line = REPLIES[step++];
      setTimeout(() => {
        ctaReply.textContent = line;
        ctaReply.classList.add('is-in');
      }, reduced ? 0 : 180);
    });
  }

  /* ---------------------------------------------------
     17. L'épreuve — quiz de vente
     --------------------------------------------------- */
  const quiz = $('#quiz');
  if (quiz) {
    const qs        = $$('.q', quiz);
    const total     = qs.length;
    const maxScore  = qs.reduce((sum, q) => sum + Math.max(...$$('.opt', q).map(o => +o.dataset.points)), 0);
    const stage     = $('#quizStage');
    const bar       = $('#quizBar');
    const idxLabel  = $('#quizIdx');
    const backBtn   = $('#quizBack');
    const resultBox = $('#quizResult');
    const nav       = $('.quiz__nav', quiz);
    const meta      = $('.quiz__meta', quiz);

    const TIERS = [
      { min: 0, max: 3, title: 'À retravailler',
        msg: "Vos réflexes actuels parlent du produit : ses qualités, son prix, ses usages. Aucun ne parle de la personne en face. C'est la correction la plus rentable qui existe, et c'est aussi la plus rapide — elle se voit dès le rendez‑vous suivant." },
      { min: 4, max: 6, title: 'De bons réflexes',
        msg: "Vous savez déjà ne pas vendre n'importe comment. Ce qui vous manque n'est pas l'intuition, c'est la méthode qui la rend reproductible un mardi à 17 h, face à un acheteur pressé, quand l'intuition ne répond plus." },
      { min: 7, max: 9, title: 'Vous êtes performant',
        msg: "Vous vendez bien, et vous le savez. La marche suivante ne se joue plus sur les arguments mais sur le cadrage : qui mène l'entretien, à partir de quelle question, et à quel moment vous cessez de parler." },
      { min: 10, max: 99, title: 'Soyez redoutable',
        msg: "Score maximal. Vous n'avez pas besoin qu'on vous apprenne à vendre — vous avez besoin qu'on vous apprenne à faire vendre les autres. C'est un métier différent, et c'est celui sur lequel se jouent les chiffres d'une équipe." }
    ];

    let idx = 0;
    const picks = new Array(total).fill(null);

    const paint = () => {
      qs.forEach((q, i) => { q.hidden = i !== idx; });
      idxLabel.textContent = String(idx + 1);
      bar.style.width = ((idx + 1) / total) * 100 + '%';
      backBtn.hidden = idx === 0;
    };

    const finish = () => {
      const score = picks.reduce((a, p) => a + (p ? p.points : 0), 0);
      const tier  = TIERS.find(t => score >= t.min && score <= t.max) || TIERS[0];

      $('#quizScore').textContent = score;
      $('.quiz__score em', quiz).textContent = '/ ' + maxScore;
      $('#quizVerdict').textContent = tier.title;
      $('#quizMsg').textContent = tier.msg;

      const meter = $('#quizMeter');
      meter.innerHTML = Array.from({ length: maxScore }, (_, i) =>
        `<i class="${i < score ? 'is-on' : ''}"></i>`).join('');

      $('#quizRecap').innerHTML = qs.map((q, i) => {
        const pick = picks[i];
        const best = q.dataset.best;
        const good = pick && pick.letter === best;
        return `<div class="rec">
          <span class="rec__mark ${good ? 'is-good' : ''}">${good ? '✓' : pick.letter}</span>
          <p class="rec__k">${q.dataset.short}</p>
          <span class="rec__pts">${pick.points} / 3 · bonne réponse : ${best}</span>
          <p class="rec__why">${$('.q__why', q).innerHTML}</p>
        </div>`;
      }).join('');

      stage.hidden = true;
      nav.hidden = true;
      meta.hidden = true;
      resultBox.hidden = false;
      bar.style.width = '100%';
      if (!reduced) quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    qs.forEach((q, i) => {
      const opts = $$('.opt', q);
      opts.forEach(opt => opt.addEventListener('click', () => {
        if (picks[i]) return;
        picks[i] = { points: +opt.dataset.points, letter: opt.dataset.letter };
        opts.forEach(o => { o.disabled = true; });
        opt.classList.add('is-picked');
        setTimeout(() => {
          if (idx < total - 1) { idx++; paint(); } else { finish(); }
        }, reduced ? 0 : 560);
      }));
    });

    backBtn.addEventListener('click', () => {
      if (idx === 0) return;
      idx--;
      picks[idx] = null;
      $$('.opt', qs[idx]).forEach(o => { o.disabled = false; o.classList.remove('is-picked'); });
      paint();
    });

    $('#quizReplay').addEventListener('click', () => {
      picks.fill(null);
      qs.forEach(q => $$('.opt', q).forEach(o => { o.disabled = false; o.classList.remove('is-picked'); }));
      idx = 0;
      resultBox.hidden = true;
      stage.hidden = false;
      nav.hidden = false;
      meta.hidden = false;
      paint();
      if (!reduced) quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    paint();
  }

  /* ---------------------------------------------------
     20. Carrousels de témoignages
     Il y en a deux : celui de la fiction, avant la Divulgation,
     et celui des vraies voix, après. Même composant, aucun
     identifiant unique — tout se résout dans le carrousel courant.
     --------------------------------------------------- */
  $$('.carousel').forEach(car => {
    const view  = $('.carousel__viewport', car);
    const cards = $$('.quote', car);
    const dots  = $('.carousel__dots', car);
    const arrows = $$('.carousel__arrow', car);
    if (!view || !dots || !cards.length || arrows.length < 2) return;
    let index = 0, timer = null, engaged = false;

    cards.forEach((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', `Témoignage ${i + 1}`);
      d.addEventListener('click', () => { engage(); goTo(i); });
      dots.appendChild(d);
    });
    const dotEls = $$('button', dots);

    const centerOf = i => {
      const c = cards[i];
      return c.offsetLeft - (view.clientWidth - c.offsetWidth) / 2;
    };
    const goTo = (i, smooth = true) => {
      index = clamp(i, 0, cards.length - 1);
      view.scrollTo({ left: centerOf(index), behavior: smooth && !reduced ? 'smooth' : 'auto' });
      sync();
    };
    const nearest = () => {
      // aux extrémités, le défilement est borné : la carte du milieu n'est plus la bonne référence
      if (view.scrollLeft <= 2) return 0;
      if (view.scrollLeft >= view.scrollWidth - view.clientWidth - 2) return cards.length - 1;
      const mid = view.scrollLeft + view.clientWidth / 2;
      let best = 0, dist = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < dist) { dist = d; best = i; }
      });
      return best;
    };
    const sync = () => {
      dotEls.forEach((d, i) => d.classList.toggle('is-on', i === index));
      arrows[0].disabled = index === 0;
      arrows[1].disabled = index === cards.length - 1;
    };

    arrows.forEach(a => a.addEventListener('click', () => { engage(); goTo(index + (+a.dataset.dir)); }));

    view.addEventListener('scroll', () => {
      const i = nearest();
      if (i !== index) { index = i; sync(); }
    }, { passive: true });

    // glisser-déposer à la souris ; le tactile utilise le défilement natif
    let down = false, startX = 0, startLeft = 0, moved = 0;
    view.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch') return;
      down = true; moved = 0; startX = e.clientX; startLeft = view.scrollLeft;
      view.setPointerCapture(e.pointerId);
      engage();
    });
    view.addEventListener('pointermove', e => {
      if (!down) return;
      moved = e.clientX - startX;
      if (Math.abs(moved) > 4) view.classList.add('is-dragging');
      view.scrollLeft = startLeft - moved;
    });
    const release = () => {
      if (!down) return;
      down = false;
      view.classList.remove('is-dragging');
      goTo(nearest());
    };
    view.addEventListener('pointerup', release);
    view.addEventListener('pointercancel', release);

    // défilement automatique, suspendu dès la première interaction
    function engage() { engaged = true; clearInterval(timer); }
    if (!reduced) {
      timer = setInterval(() => {
        if (engaged || document.hidden) return;
        goTo(index >= cards.length - 1 ? 0 : index + 1);
      }, 5200);
      car.addEventListener('pointerenter', () => clearInterval(timer));
    }

    addEventListener('resize', () => goTo(index, false));
    requestAnimationFrame(() => goTo(0, false));
  });

  /* premier rendu, une fois tous les composants construits */
  requestAnimationFrame(onScroll);

  /* ---------------------------------------------------
     16. FAQ : une seule réponse ouverte
     --------------------------------------------------- */
  const qas = $$('.qa');
  qas.forEach(d => d.addEventListener('toggle', () => {
    if (d.open) qas.forEach(o => { if (o !== d) o.open = false; });
  }));
})();
