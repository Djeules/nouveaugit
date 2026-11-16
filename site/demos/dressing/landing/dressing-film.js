/* Dressing film : la séquence 3D avance au fil du défilement, image par image.
 *
 * Utilisation : un élément <section class="dzf" data-dressing-film data-frames="assets/frames">
 * (structure complète dans snippet.html). Plusieurs films peuvent cohabiter.
 *
 * Attributs facultatifs sur la section :
 *   data-frames   dossier qui contient d/, h/ et m/ (défaut : assets/frames)
 *   data-count    nombre d'images par jeu (défaut : 120)
 *   data-end      part du défilement consacrée à la séquence, 0 à 1 (défaut : 0.86)
 *
 * Trois jeux d'images, un seul chargé par visiteur :
 *   d : paysage 1440 × 810 ; h : paysage 2560 × 1440 (retina, écrans larges) ;
 *   m : portrait 720 × 1280 (mobile).
 * Chargement du grossier au fin (1 image sur 8, puis 4, 2, 1) : la séquence se
 * joue dès les premières secondes, et se précise pendant le téléchargement.
 * Le chargement ne démarre qu'à l'approche du film (IntersectionObserver).
 */
(() => {
  const rm = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - clamp(t), 3);
  const pad = n => String(n).padStart(3, '0');

  function film(root) {
    const N = +root.dataset.count || 120;
    const P_END = +root.dataset.end || 0.86;
    const base = (root.dataset.frames || 'assets/frames').replace(/\/$/, '');
    root.classList.add('is-js');

    const q = s => root.querySelector(s);
    const stage = q('.dzf__stage'), cv = q('canvas'), ctx = cv.getContext('2d', { alpha: false });
    const loader = q('.dzf__loader'), pct = q('.dzf__pct'), hint = q('.dzf__hint');
    const bar = q('.dzf__bar'), dl = q('.dzf__dl'), veil = q('.dzf__veil'), intro = q('.dzf__intro');
    const chapters = [...root.querySelectorAll('.dzf__chapters li')];
    const title = q('.dzf__title'), sub = q('.dzf__sub'), reveal = q('.dzf__reveal');

    /* titre : chaque mot monte derrière son propre masque */
    const words = [];
    if (title) {
      const text = title.textContent.trim();
      title.textContent = '';
      text.split(/\s+/).forEach((w, i, all) => {
        const mask = document.createElement('span'), inner = document.createElement('span');
        mask.className = 'w'; inner.textContent = w; mask.appendChild(inner);
        words.push(inner); title.appendChild(mask);
        if (i < all.length - 1) title.appendChild(document.createTextNode(' '));
      });
      title.setAttribute('aria-label', text);
      reveal.classList.add('ready');
    }

    /* images */
    let set = null, frames = [], prev = [], loaded = 0, gen = 0, started = false;
    let W = 0, H = 0;
    const pickSet = () => (innerWidth / innerHeight < 0.9 ? 'm' : W > 1700 ? 'h' : 'd');
    const poster = s => { stage.style.backgroundImage = `url("${base}/${s}/f000.webp")`; };

    function load(s) {
      gen++; const my = gen;
      prev = frames.some(Boolean) ? frames : prev;
      set = s; frames = new Array(N); loaded = 0;
      poster(s);
      if (!started) return;
      loader?.classList.remove('done'); dl?.classList.remove('done');
      const order = [], seen = new Set();
      for (const step of [8, 4, 2, 1]) for (let i = 0; i < N; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
      order.splice(order.indexOf(N - 1), 1); order.splice(1, 0, N - 1);
      let k = 0;
      const next = () => {
        if (my !== gen || k >= order.length) return;
        const i = order[k++], im = new Image();
        im.src = `${base}/${s}/f${pad(i)}.webp`;
        im.decode().then(() => { if (my !== gen) return; frames[i] = im; done(); })
          .catch(() => { if (my === gen) done(); });
        function done() {
          loaded++;
          const r = loaded / N;
          if (pct) pct.textContent = Math.round(r * 100);
          if (dl) dl.style.transform = `scaleX(${r.toFixed(3)})`;
          if (loaded === N) { loader?.classList.add('done'); dl?.classList.add('done'); prev = []; }
          need = true; wake(); next();
        }
      };
      for (let j = 0; j < 6; j++) next();
    }
    function get(i) {
      if (frames[i]) return frames[i];
      for (let d = 1; d < N; d++) { if (frames[i - d]) return frames[i - d]; if (frames[i + d]) return frames[i + d]; }
      return prev[i] || null;
    }

    /* canevas */
    function size() {
      const dpr = Math.min(devicePixelRatio || 1, 1.75);
      W = cv.width = Math.round(cv.clientWidth * dpr);
      H = cv.height = Math.round(cv.clientHeight * dpr);
      ctx.imageSmoothingQuality = 'high';
      const s = pickSet();
      if (s !== set) load(s);
      need = true;
    }
    function draw(im, alpha) {
      const iw = im.naturalWidth, ih = im.naturalHeight, sc = Math.max(W / iw, H / ih);
      const dw = iw * sc, dh = ih * sc, ay = iw > ih ? 0.3 : 0.35;
      ctx.globalAlpha = alpha;
      ctx.drawImage(im, (W - dw) / 2, (H - dh) * ay, dw, dh);
    }
    function paint(p) {
      const f = clamp(p / P_END) * (N - 1), i0 = Math.floor(f), a = f - i0;
      const im0 = get(i0);
      if (!im0) return false;
      draw(im0, 1);
      const im1 = a > 0.002 && i0 + 1 < N ? frames[i0 + 1] : null;
      if (im1 && frames[i0]) draw(im1, a);
      ctx.globalAlpha = 1;
      return true;
    }

    /* surcouche */
    let chap = -1;
    function overlay(p) {
      const still = rm.matches;
      const c = p < 0.15 ? 0 : p < 0.72 ? 1 : 2;
      if (c !== chap && chapters.length) { chapters.forEach((li, i) => li.classList.toggle('on', i === c)); chap = c; }
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      hint?.classList.toggle('gone', p > 0.015);
      if (intro) {
        const t = clamp(p / 0.08);
        intro.style.opacity = (1 - t).toFixed(3);
        intro.style.transform = still ? 'none' : `translate3d(0, ${(-t * 24).toFixed(1)}px, 0)`;
      }
      if (veil) veil.style.opacity = ease((p - P_END + 0.04) / 0.1).toFixed(3);
      words.forEach((w, i) => {
        const t = ease((p - P_END + 0.01 - i * 0.01) / 0.07);
        w.style.transform = still ? 'none' : `translate3d(0, ${((1 - t) * 110).toFixed(2)}%, 0)`;
        w.style.opacity = still ? t.toFixed(3) : '1';
      });
      if (sub) {
        const ts = ease((p - P_END - 0.04) / 0.06);
        sub.style.opacity = ts.toFixed(3);
        sub.style.transform = still ? 'none' : `translate3d(0, ${((1 - ts) * 14).toFixed(1)}px, 0)`;
      }
    }

    /* boucle : s'arrête quand plus rien ne bouge */
    let target = 0, cur = 0, shown = -1, need = true, running = false, last = 0;
    function progress() {
      const r = root.getBoundingClientRect(), span = r.height - innerHeight;
      return span > 0 ? clamp(-r.top / span) : 0;
    }
    function frame(t) {
      const dt = last ? Math.min(0.064, (t - last) / 1000) : 0.016; last = t;
      target = progress();
      cur = rm.matches ? target : cur + (target - cur) * (1 - Math.exp(-dt / 0.1));
      if (Math.abs(target - cur) < 0.00005) cur = target;
      if (need || Math.abs(cur - shown) > 0.00001) {
        if (paint(cur)) { shown = cur; need = false; }
        overlay(cur);
      }
      if (cur !== target || need) requestAnimationFrame(frame);
      else { running = false; last = 0; }
    }
    function wake() { if (!running) { running = true; requestAnimationFrame(frame); } }

    addEventListener('scroll', wake, { passive: true });
    addEventListener('resize', () => { size(); wake(); });
    rm.addEventListener?.('change', () => { need = true; wake(); });

    function start() { if (started) return; started = true; set = null; size(); wake(); }
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: '100% 0px' });
      io.observe(root);
    } else start();

    size();
    cur = target = progress();
    overlay(cur);
    wake();
  }

  const init = () => document.querySelectorAll('[data-dressing-film]').forEach(el => { if (!el.dataset.dzfReady) { el.dataset.dzfReady = '1'; film(el); } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
