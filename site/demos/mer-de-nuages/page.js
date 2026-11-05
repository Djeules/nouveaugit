(() => {
  const N = 180, pad = n => String(n).padStart(3, '0');
  const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  const climb = document.getElementById('climb'), loader = document.getElementById('loader'), hint = document.getElementById('hint');
  const altEl = document.getElementById('alt'), clockEl = document.getElementById('clock');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = Math.max(innerWidth, innerHeight) * Math.min(devicePixelRatio || 1, 2) < 1500;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* images : d'abord 1 sur 8, puis on remplit, pour que le scroll soit vite jouable */
  const frames = new Array(N); let loaded = 0, need = true;
  const order = [], seen = new Set();
  for (const step of [8, 4, 2, 1]) for (let i = 0; i < N; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
  let k = 0;
  const next = () => { if (k >= order.length) return; const i = order[k++]; const im = new Image(); im.decoding = 'async';
    im.onload = () => { frames[i] = im; loaded++; loader.textContent = `Chargement ${Math.round(loaded / N * 100)} %`; if (loaded === N) loader.style.opacity = 0; need = true; next(); };
    im.onerror = () => { loaded++; next(); };
    im.src = `${small ? 'images-m' : 'images'}/f${pad(i + 1)}.webp`; };
  for (let j = 0; j < 6; j++) next();
  const get = i => { if (frames[i]) return frames[i]; for (let d = 1; d < N; d++) { if (frames[i - d]) return frames[i - d]; if (frames[i + d]) return frames[i + d]; } return null; };

  let W = 0, H = 0;
  function size() { const dpr = Math.min(devicePixelRatio || 1, 2); W = cv.width = Math.round(cv.clientWidth * dpr); H = cv.height = Math.round(cv.clientHeight * dpr); need = true; }
  function draw(im, a, zoom) {
    const s = Math.max(W / im.naturalWidth, H / im.naturalHeight) * zoom, dw = im.naturalWidth * s, dh = im.naturalHeight * s;
    ctx.globalAlpha = a; ctx.drawImage(im, (W - dw) / 2, (H - dh) * 0.42, dw, dh);
  }

  /* mots : chaque ligne apparaît mot à mot, en sortant de la brume */
  const lines = [...document.querySelectorAll('.line')].map(el => ({ el, a: +el.dataset.a, b: +el.dataset.b, words: [] }));
  lines.forEach(L => {
    L.el.querySelectorAll('h1, h2, p').forEach(node => {
      const walk = (n) => [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) { const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            const s = document.createElement('span'); s.className = 'wd'; s.textContent = t; frag.appendChild(s); L.words.push(s); });
          c.replaceWith(frag);
        } else walk(c);
      });
      walk(node);
    });
  });
  function words(p) {
    lines.forEach((L, idx) => {
      const t = (p - L.a) / (L.b - L.a), last = idx === lines.length - 1, first = idx === 0;
      const write = first ? 1 : clamp(t / 0.4, 0, 1), fade = last ? 1 : 1 - clamp((t - 0.78) / 0.22, 0, 1);
      const vis = t > -0.02 && t < 1.02 && fade > 0; L.el.style.visibility = vis ? 'visible' : 'hidden'; if (!vis) return;
      const n = L.words.length, head = write * (n + 2);
      L.words.forEach((w, i) => { const k = clamp((head - i) / 2, 0, 1);
        w.style.opacity = (k * fade).toFixed(3);
        w.style.filter = reduce ? 'none' : `blur(${((1 - k) * 10 + (1 - fade) * 8).toFixed(1)}px)`;
        w.style.transform = reduce ? 'none' : `translate3d(0, ${((1 - k) * 0.4 - (1 - fade) * 0.3).toFixed(3)}em, 0)`; });
    });
    // instruments : on monte, l'heure avance
    altEl.textContent = `${Math.round(1850 + 652 * clamp(p / 0.7, 0, 1)).toLocaleString('fr-FR')} m`;
    const min = Math.round(5 * 60 + 40 + p * 92); clockEl.textContent = `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;
    hint.style.opacity = p > 0.03 ? 0 : 0.85;
  }

  let target = 0, cur = 0, last = -1;
  const read = () => { const r = climb.getBoundingClientRect(); target = clamp(-r.top / (climb.offsetHeight - innerHeight), 0, 1); };
  function tick() {
    cur += (target - cur) * (reduce ? 1 : 0.1); if (Math.abs(target - cur) < 0.00004) cur = target;
    if (need || cur !== last) {
      const f = cur * (N - 1), i0 = Math.floor(f), i1 = Math.min(N - 1, i0 + 1), fr = f - i0;
      const zoom = 1 + (reduce ? 0 : 0.08 * cur);
      const a = get(i0), b = get(i1);
      if (a) { draw(a, 1, zoom); if (b && b !== a && fr > 0.02) draw(b, fr, zoom); ctx.globalAlpha = 1; }
      words(cur); last = cur; need = false;
    }
    requestAnimationFrame(tick);
  }
  addEventListener('scroll', read, { passive: true });
  addEventListener('resize', () => { size(); read(); });
  size(); read(); cur = target; requestAnimationFrame(tick);

  /* phrase qui s'allume mot à mot */
  const glow = document.getElementById('glow'); const warm = new Set(['silence,', 'soleil', 'nuages']);
  const ws = glow.textContent.trim().split(/\s+/); glow.textContent = '';
  const sp = ws.map((w, i) => { const s = document.createElement('span'); s.textContent = w; if (warm.has(w)) s.dataset.w = 1; glow.appendChild(s); if (i < ws.length - 1) glow.appendChild(document.createTextNode(' ')); return s; });
  const top = document.getElementById('top-bar');
  function onScroll() {
    const r = glow.getBoundingClientRect(); const t = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3), 0, 1); const k = Math.round(t * sp.length);
    sp.forEach((s, i) => { s.classList.toggle('lit', i < k); s.classList.toggle('warm', i < k && s.dataset.w === '1'); });
    top.classList.toggle('solid', climb.getBoundingClientRect().bottom < 70);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  document.getElementById('form').addEventListener('submit', e => {
    e.preventDefault(); const nom = document.getElementById('nom').value.trim();
    const d = document.querySelector('input[name=d]:checked').closest('label').querySelector('span').textContent;
    const done = document.getElementById('done');
    done.textContent = `${nom ? nom + ', ta' : 'Ta'} place est gardée pour le ${d.toLowerCase()}. Rendez-vous à 4 h 30. (Page de démonstration : rien n'est envoyé.)`;
    done.hidden = false;
  });
})();
