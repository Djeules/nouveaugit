/* « L'ordre change tout » — la séquence suit le défilement, image par image.
 *
 * 120 images rendues en 3D (tools/dressing/scene.py), en trois jeux : paysage
 * (assets/frames/d, 1440 × 810), paysage haute définition pour les écrans
 * denses ou larges (assets/frames/h, 2560 × 1440) et portrait
 * (assets/frames/m, 720 × 1280). Un visiteur ne charge qu'un seul jeu.
 * L'image i correspond à la progression p = i / (N − 1) × P_END ; au-delà de
 * P_END la scène est immobile et seul le titre bouge.
 *
 * - progression lissée (amortissement exponentiel, indépendant de la cadence) ;
 * - fondu entre les deux images voisines : le mouvement reste continu même
 *   entre deux rendus ;
 * - chargement du grossier au fin (1 image sur 8, puis 4, 2, 1) : la séquence
 *   est jouable dès les premières secondes, dans les deux sens ;
 * - la boucle requestAnimationFrame s'arrête quand plus rien ne bouge.
 */
(() => {
  const N = 120, P_END = 0.88;
  const root = document.documentElement;
  root.classList.remove('no-js');

  const $ = s => document.querySelector(s);
  const film = $('#film'), cv = $('#cv'), ctx = cv.getContext('2d', { alpha: false });
  const loader = $('#loader'), pct = $('#pct'), hint = $('#hint'), bar = $('#bar'), veil = $('#veil');
  const chapters = [...document.querySelectorAll('#chapters li')];
  const title = $('#title'), sub = $('#sub'), reveal = $('#reveal');
  const rm = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - clamp(t), 3);
  const pad = n => String(n).padStart(3, '0');

  /* ---------- titre : chaque mot monte derrière son propre masque ---------- */
  const words = [];
  title.textContent.trim().split(/\s+/).forEach((w, i, all) => {
    const mask = document.createElement('span'), inner = document.createElement('span');
    mask.className = 'w'; inner.textContent = w; mask.appendChild(inner);
    words.push(inner);
    if (i === 0) title.textContent = '';
    title.appendChild(mask);
    if (i < all.length - 1) title.appendChild(document.createTextNode(' '));
  });
  title.setAttribute('aria-label', 'L’ordre change tout.');
  reveal.classList.add('ready');

  /* ---------- images ---------- */
  let set = null, frames = [], prev = [], loaded = 0, gen = 0;
  // paysage : 1440 × 810 suffit jusqu'à ~1700 pixels physiques de large ; au-delà
  // (écrans retina, 1920 et plus) l'image serait agrandie et floue → jeu « h », 2560 × 1440
  const pickSet = () => (innerWidth / innerHeight < 0.9 ? 'm' : W > 1700 ? 'h' : 'd');

  function load(s) {
    gen++; const my = gen;
    prev = frames.some(Boolean) ? frames : prev;
    set = s; frames = new Array(N); loaded = 0;
    loader.classList.remove('done');
    const order = [], seen = new Set();
    for (const step of [8, 4, 2, 1]) for (let i = 0; i < N; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
    // la dernière image tôt : un visiteur pressé qui file en bas voit le résultat
    order.splice(order.indexOf(N - 1), 1); order.splice(1, 0, N - 1);
    let k = 0;
    const next = () => {
      if (my !== gen || k >= order.length) return;
      const i = order[k++], im = new Image();
      im.src = `assets/frames/${s}/f${pad(i)}.webp`;
      im.decode().then(() => { if (my !== gen) return; frames[i] = im; done(); })
        .catch(() => { if (my === gen) done(); });
      function done() {
        loaded++;
        pct.textContent = Math.round(loaded / N * 100);
        if (loaded === N) { loader.classList.add('done'); prev = []; }
        need = true; wake(); next();
      }
    };
    for (let j = 0; j < 6; j++) next();
  }

  // image la plus proche déjà chargée (sinon celle de l'ancien jeu, pendant un changement d'orientation)
  function get(i) {
    if (frames[i]) return frames[i];
    for (let d = 1; d < N; d++) { if (frames[i - d]) return frames[i - d]; if (frames[i + d]) return frames[i + d]; }
    return prev[i] || null;
  }

  /* ---------- canevas ---------- */
  let W = 0, H = 0;
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
    const dw = iw * sc, dh = ih * sc;
    // recadrage : on rogne d'abord le sol, pour garder le mur où se pose le titre
    const ay = iw > ih ? 0.3 : 0.35;
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

  /* ---------- surcouche : chapitres, titre, progression ---------- */
  let chap = -1;
  function overlay(p) {
    const c = p < 0.15 ? 0 : p < 0.75 ? 1 : 2;
    if (c !== chap) { chapters.forEach((li, i) => li.classList.toggle('on', i === c)); chap = c; }
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
    hint.classList.toggle('gone', p > 0.015);
    veil.style.opacity = ease((p - 0.83) / 0.1).toFixed(3);
    const still = rm.matches;
    words.forEach((w, i) => {
      const t = ease((p - 0.86 - i * 0.01) / 0.07);
      w.style.transform = still ? 'none' : `translate3d(0, ${((1 - t) * 110).toFixed(2)}%, 0)`;
      w.style.opacity = still ? t.toFixed(3) : '1';
    });
    const ts = ease((p - 0.91) / 0.06);
    sub.style.opacity = ts.toFixed(3);
    sub.style.transform = still ? 'none' : `translate3d(0, ${((1 - ts) * 14).toFixed(1)}px, 0)`;
  }

  /* ---------- boucle ---------- */
  let target = 0, cur = 0, shown = -1, need = true, running = false, last = 0;
  function progress() {
    const r = film.getBoundingClientRect(), span = r.height - innerHeight;
    return span > 0 ? clamp(-r.top / span) : 0;
  }
  function frame(t) {
    const dt = last ? Math.min(0.064, (t - last) / 1000) : 0.016; last = t;
    target = progress();
    // amortissement ~0,1 s : la molette par crans devient un glissé continu
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

  // « Revoir le rangement » : on remonte en douceur — le désordre revient en marche arrière
  $('#again').addEventListener('click', e => {
    e.preventDefault();
    scrollTo({ top: film.offsetTop, behavior: rm.matches ? 'auto' : 'smooth' });
  });

  size();
  cur = target = progress();
  overlay(cur);
  wake();
})();
