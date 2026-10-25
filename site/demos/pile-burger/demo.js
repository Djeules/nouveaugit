// ---------- menu data: 52 ingredients ----------
const MENU = [
  ['Pains', ['Brioche sésame', 'Brioche nature', 'Pain au charbon', 'Bun complet', 'Pain bretzel', 'Sans pain (salade)']],
  ['Viandes & galettes', ['Bœuf charolais', 'Double bœuf', 'Poulet croustillant', 'Poulet grillé', 'Porc effiloché', 'Galette végétale', 'Falafel', 'Saumon']],
  ['Fromages', ['Cheddar affiné', 'Comté', 'Raclette', 'Chèvre', "Bleu d'Auvergne", 'Mozzarella', 'Reblochon', 'Emmental']],
  ['Légumes', ['Salade', 'Tomate', 'Oignon rouge', 'Oignons frits', 'Oignons confits', 'Cornichons', 'Jalapeños', 'Avocat', 'Champignons', 'Poivrons grillés', 'Roquette', 'Concombre']],
  ['Extras', ['Bacon croustillant', 'Œuf au plat', 'Rösti', 'Ananas grillé', 'Onion rings', 'Chorizo', 'Magret fumé', 'Galette de maïs']],
  ['Sauces', ['Ketchup maison', "Moutarde à l'ancienne", 'Mayo truffe', 'Sauce burger', 'BBQ fumée', 'Sriracha mayo', 'Sauce au poivre', 'Aïoli', 'Sauce blanche', 'Miel-moutarde']],
];
const TOTAL = MENU.reduce((n, [, items]) => n + items.length, 0);

const names = MENU.flatMap(([, items]) => items);
document.getElementById('track').innerHTML = [...names, ...names].map(n => `<span>${n}</span>`).join('');

const groups = document.getElementById('groups');
groups.innerHTML = MENU.map(([g, items]) => `
  <div class="group"><h3>${g}<span>${items.length}</span></h3>
    <div class="chips">${items.map(i => `<button class="chip" type="button" aria-pressed="false" data-g="${g}">${i}</button>`).join('')}</div>
  </div>`).join('');

const picked = [];
const stack = document.getElementById('stack');
const nEl = document.getElementById('n');
const done = document.getElementById('done');
function renderOrder() {
  nEl.textContent = `${picked.length} ingrédient${picked.length > 1 ? 's' : ''} sur ${TOTAL}`;
  stack.innerHTML = picked.length
    ? picked.map(p => `<li>${p.name}<small>${p.g}</small></li>`).join('')
    : `<li class="empty">Choisissez d'abord un pain.</li>`;
  done.hidden = true;
}
groups.addEventListener('click', e => {
  const b = e.target.closest('.chip'); if (!b) return;
  const on = b.getAttribute('aria-pressed') !== 'true';
  b.setAttribute('aria-pressed', on);
  if (on) picked.push({ name: b.textContent, g: b.dataset.g });
  else picked.splice(picked.findIndex(p => p.name === b.textContent), 1);
  renderOrder();
});
document.getElementById('reset').addEventListener('click', () => {
  picked.length = 0;
  groups.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
  renderOrder();
});
document.getElementById('go').addEventListener('click', () => { if (picked.length) done.hidden = false; });
// example selection so the builder opens in a working state
['Brioche sésame', 'Bœuf charolais', 'Cheddar affiné', 'Salade', 'Tomate', 'Oignon rouge', 'Cornichons', 'Bacon croustillant', 'Sauce burger'].forEach(n => {
  const b = [...groups.querySelectorAll('.chip')].find(c => c.textContent === n);
  if (b) { b.setAttribute('aria-pressed', 'true'); picked.push({ name: n, g: b.dataset.g }); }
});
renderOrder();

// ---------- scroll-scrubbed image sequence ----------
// FRAMES: with a handful of keyframes we crossfade between them; with a full video sequence (dozens of frames) each scroll step shows one frame.
const FRAMES = ["frames/f001.webp", "frames/f002.webp", "frames/f003.webp", "frames/f004.webp", "frames/f005.webp", "frames/f006.webp", "frames/f007.webp", "frames/f008.webp", "frames/f009.webp", "frames/f010.webp", "frames/f011.webp", "frames/f012.webp", "frames/f013.webp", "frames/f014.webp", "frames/f015.webp", "frames/f016.webp", "frames/f017.webp", "frames/f018.webp", "frames/f019.webp", "frames/f020.webp", "frames/f021.webp", "frames/f022.webp", "frames/f023.webp", "frames/f024.webp", "frames/f025.webp", "frames/f026.webp", "frames/f027.webp", "frames/f028.webp", "frames/f029.webp", "frames/f030.webp", "frames/f031.webp", "frames/f032.webp", "frames/f033.webp", "frames/f034.webp", "frames/f035.webp", "frames/f036.webp", "frames/f037.webp", "frames/f038.webp", "frames/f039.webp", "frames/f040.webp", "frames/f041.webp", "frames/f042.webp", "frames/f043.webp", "frames/f044.webp", "frames/f045.webp", "frames/f046.webp", "frames/f047.webp", "frames/f048.webp", "frames/f049.webp", "frames/f050.webp", "frames/f051.webp", "frames/f052.webp", "frames/f053.webp", "frames/f054.webp", "frames/f055.webp", "frames/f056.webp", "frames/f057.webp", "frames/f058.webp", "frames/f059.webp", "frames/f060.webp", "frames/f061.webp", "frames/f062.webp", "frames/f063.webp", "frames/f064.webp", "frames/f065.webp", "frames/f066.webp", "frames/f067.webp", "frames/f068.webp", "frames/f069.webp", "frames/f070.webp", "frames/f071.webp", "frames/f072.webp", "frames/f073.webp", "frames/f074.webp", "frames/f075.webp", "frames/f076.webp", "frames/f077.webp", "frames/f078.webp", "frames/f079.webp", "frames/f080.webp", "frames/f081.webp", "frames/f082.webp", "frames/f083.webp", "frames/f084.webp", "frames/f085.webp", "frames/f086.webp", "frames/f087.webp", "frames/f088.webp", "frames/f089.webp", "frames/f090.webp", "frames/f091.webp", "frames/f092.webp", "frames/f093.webp", "frames/f094.webp", "frames/f095.webp", "frames/f096.webp", "frames/f097.webp", "frames/f098.webp", "frames/f099.webp", "frames/f100.webp", "frames/f101.webp", "frames/f102.webp", "frames/f103.webp", "frames/f104.webp", "frames/f105.webp", "frames/f106.webp", "frames/f107.webp", "frames/f108.webp", "frames/f109.webp", "frames/f110.webp", "frames/f111.webp", "frames/f112.webp", "frames/f113.webp", "frames/f114.webp", "frames/f115.webp", "frames/f116.webp", "frames/f117.webp", "frames/f118.webp", "frames/f119.webp", "frames/f120.webp", "frames/f121.webp", "frames/f122.webp", "frames/f123.webp", "frames/f124.webp", "frames/f125.webp", "frames/f126.webp", "frames/f127.webp", "frames/f128.webp", "frames/f129.webp", "frames/f130.webp", "frames/f131.webp", "frames/f132.webp", "frames/f133.webp", "frames/f134.webp", "frames/f135.webp", "frames/f136.webp", "frames/f137.webp", "frames/f138.webp", "frames/f139.webp", "frames/f140.webp", "frames/f141.webp", "frames/f142.webp", "frames/f143.webp", "frames/f144.webp", "frames/f145.webp", "frames/f146.webp", "frames/f147.webp", "frames/f148.webp", "frames/f149.webp", "frames/f150.webp", "frames/f151.webp", "frames/f152.webp", "frames/f153.webp"];
const BLEND = FRAMES.length <= 8;
const CONTENT_W = 900; // width of the burger area inside each 1280px video frame

const canvas = document.getElementById('seq');
const ctx = canvas.getContext('2d');
const story = document.getElementById('story');
const panels = [...document.querySelectorAll('.panel')];
const bars = [...document.querySelectorAll('.meter i')];
const counter = document.getElementById('counter');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => t * t * (3 - 2 * t);

// Each frame is pre-drawn with feathered edges so it melts into the page background at any size.
const feathered = [];
function feather(img) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'destination-in';
  g.save();
  g.translate(c.width / 2, c.height / 2);
  g.scale(c.width / c.height, 1);
  const r = c.height / 2;
  const grad = g.createRadialGradient(0, 0, r * 0.62, 0, 0, r * 1.02);
  grad.addColorStop(0, 'rgba(0,0,0,1)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(-c.width, -c.height, c.width * 2, c.height * 2);
  g.restore();
  return c;
}
FRAMES.forEach((src, i) => {
  const img = new Image();
  img.onload = () => { feathered[i] = feather(img); draw(true); };
  img.src = src;
});

let W = 0, H = 0, dpr = 1;
function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  draw(true);
}
addEventListener('resize', resize);

function layout(fh) {
  const phone = W <= 760;
  let s = phone ? (W * 1.02) / CONTENT_W : Math.min((W * 0.56) / CONTENT_W, (H * 0.92) / fh);
  if (!phone) s = Math.max(s, (H * 0.7) / fh);
  return { s, cx: phone ? W * 0.5 : W * 0.65, cy: phone ? H * 0.3 : H * 0.52 };
}
function progress() {
  const r = story.getBoundingClientRect();
  return clamp(-r.top / (r.height - innerHeight));
}

let shown = -1, current = progress();
function draw(force) {
  const target = progress();
  current = reduce ? target : current + (target - current) * 0.18;
  if (!force && Math.abs(current - shown) < 0.0005) return;
  shown = current;
  const p = current;

  const n = panels.length;
  panels.forEach((el, i) => {
    const d = Math.abs(p - i / (n - 1)) * (n - 1);
    const op = clamp(1 - (d - 0.22) / 0.2);
    el.style.opacity = op.toFixed(3);
    el.style.translate = `0 ${((p < i / (n - 1) ? 1 : -1) * (1 - op) * 22).toFixed(1)}px`;
    el.style.pointerEvents = op > 0.6 ? 'auto' : 'none';
  });
  bars.forEach((b, i) => b.style.setProperty('--f', clamp(p * (n - 1) - i).toFixed(3)));
  counter.textContent = Math.round(TOTAL * ease(clamp((p - 0.45) / 0.2)));

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (!feathered[0]) return;
  const f = p * (FRAMES.length - 1);
  const i = Math.min(FRAMES.length - 1, Math.floor(f));
  const t = BLEND ? ease(clamp((f - i - 0.2) / 0.6)) : 0; // hold each keyframe, then crossfade
  const a = feathered[i] || feathered[0];
  const b = feathered[Math.min(i + 1, FRAMES.length - 1)];
  const { s, cx, cy } = layout(a.height);
  const zoom = 1 + 0.05 * p; // slow push-in across the whole story
  const drawFrame = (img, alpha) => {
    if (!img || alpha <= 0) return;
    const w = img.width * s * zoom, h = img.height * s * zoom;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  };
  drawFrame(a, 1);
  if (BLEND && t > 0 && b !== a) drawFrame(b, t);
  ctx.globalAlpha = 1;
}
function loop() { draw(false); requestAnimationFrame(loop); }
resize();
loop();
