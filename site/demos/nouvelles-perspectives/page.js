// ---------- scroll-scrubbed video frames ----------
const FRAMES = ["frames/f001.webp", "frames/f002.webp", "frames/f003.webp", "frames/f004.webp", "frames/f005.webp", "frames/f006.webp", "frames/f007.webp", "frames/f008.webp", "frames/f009.webp", "frames/f010.webp", "frames/f011.webp", "frames/f012.webp", "frames/f013.webp", "frames/f014.webp", "frames/f015.webp", "frames/f016.webp", "frames/f017.webp", "frames/f018.webp", "frames/f019.webp", "frames/f020.webp", "frames/f021.webp", "frames/f022.webp", "frames/f023.webp", "frames/f024.webp", "frames/f025.webp", "frames/f026.webp", "frames/f027.webp", "frames/f028.webp", "frames/f029.webp", "frames/f030.webp", "frames/f031.webp", "frames/f032.webp", "frames/f033.webp", "frames/f034.webp", "frames/f035.webp", "frames/f036.webp", "frames/f037.webp", "frames/f038.webp", "frames/f039.webp", "frames/f040.webp", "frames/f041.webp", "frames/f042.webp", "frames/f043.webp", "frames/f044.webp", "frames/f045.webp", "frames/f046.webp", "frames/f047.webp", "frames/f048.webp", "frames/f049.webp", "frames/f050.webp", "frames/f051.webp", "frames/f052.webp", "frames/f053.webp", "frames/f054.webp", "frames/f055.webp", "frames/f056.webp", "frames/f057.webp", "frames/f058.webp", "frames/f059.webp", "frames/f060.webp", "frames/f061.webp", "frames/f062.webp", "frames/f063.webp", "frames/f064.webp", "frames/f065.webp", "frames/f066.webp", "frames/f067.webp", "frames/f068.webp", "frames/f069.webp", "frames/f070.webp", "frames/f071.webp", "frames/f072.webp", "frames/f073.webp", "frames/f074.webp", "frames/f075.webp", "frames/f076.webp", "frames/f077.webp", "frames/f078.webp", "frames/f079.webp", "frames/f080.webp", "frames/f081.webp", "frames/f082.webp", "frames/f083.webp", "frames/f084.webp", "frames/f085.webp", "frames/f086.webp", "frames/f087.webp", "frames/f088.webp", "frames/f089.webp", "frames/f090.webp", "frames/f091.webp", "frames/f092.webp", "frames/f093.webp", "frames/f094.webp", "frames/f095.webp", "frames/f096.webp", "frames/f097.webp", "frames/f098.webp", "frames/f099.webp", "frames/f100.webp", "frames/f101.webp", "frames/f102.webp", "frames/f103.webp", "frames/f104.webp", "frames/f105.webp", "frames/f106.webp", "frames/f107.webp", "frames/f108.webp", "frames/f109.webp", "frames/f110.webp", "frames/f111.webp", "frames/f112.webp", "frames/f113.webp", "frames/f114.webp", "frames/f115.webp", "frames/f116.webp", "frames/f117.webp", "frames/f118.webp", "frames/f119.webp", "frames/f120.webp", "frames/f121.webp", "frames/f122.webp", "frames/f123.webp", "frames/f124.webp"]; // 124 frames, 1600×678, watermarks removed
const FW = 1600, FH = 678;

const canvas = document.getElementById('seq');
const ctx = canvas.getContext('2d');
const story = document.getElementById('story');
const beats = [...document.querySelectorAll('.line span')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => t * t * (3 - 2 * t);

const imgs = FRAMES.map((src, i) => {
  const img = new Image();
  img.onload = () => { if (i === 0) draw(true); };
  img.src = src;
  return img;
});

let W = 0, H = 0, dpr = 1;
function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  draw(true);
}
addEventListener('resize', resize);

function progress() {
  const r = story.getBoundingClientRect();
  return clamp(-r.top / (r.height - innerHeight));
}

// desktop: cover the screen; phone: fit the frame to the upper part, keeping the hand in view
function rect() {
  if (W > 760) {
    const s = Math.max(W / FW, H / FH);
    const spare = (FW * s - W) / 2; // what the cover crop leaves past each side
    const shift = Math.min(spare, W * 0.15); // push the hand right, away from the sentence, without opening a gap
    return [(W - FW * s) / 2 + shift, (H - FH * s) / 2, FW * s, FH * s];
  }
  const h = H * 0.6, s = h / FH, w = FW * s;
  return [W / 2 - w * 0.56, 0, w, h];
}

let shown = -1, current = progress();
function draw(force) {
  const target = progress();
  current = reduce ? target : current + (target - current) * 0.18;
  if (!force && Math.abs(current - shown) < 0.0005) return;
  shown = current;
  const p = current;

  // the sentence builds in three beats, then holds
  [0, 0.22, 0.5].forEach((at, i) => {
    const t = i === 0 ? 1 : ease(clamp((p - at) / 0.14));
    beats[i].style.opacity = t.toFixed(3);
    beats[i].style.transform = `translateY(${((1 - t) * 24).toFixed(1)}px)`;
  });

  // the video plays over the first 85% of the scroll, then holds its last frame
  const f = Math.round(clamp(p / 0.85) * (FRAMES.length - 1));
  const img = imgs[f].complete && imgs[f].naturalWidth ? imgs[f] : imgs.slice(0, f).reverse().find(i => i.complete && i.naturalWidth);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (!img) return;
  const [x, y, w, h] = rect();
  ctx.drawImage(img, x, y, w, h);
  if (W <= 760) {
    // melt the frame's lower edge into the page
    const g = ctx.createLinearGradient(0, y + h * 0.7, 0, y + h);
    g.addColorStop(0, 'rgba(196,0,16,0)');
    g.addColorStop(1, 'rgba(196,0,16,1)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y + h * 0.7, W, h * 0.3 + 1);
  }
}
function loop() { draw(false); requestAnimationFrame(loop); }
resize();
loop();
