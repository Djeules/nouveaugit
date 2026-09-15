import { initUI } from './ui.js';

const loader = document.getElementById('loader');
const fill = document.getElementById('loader-fill');
const count = document.getElementById('loader-count');
const status = document.getElementById('loader-status');

let target = 0;
let shown = 0;
let done = false;

function setProgress(value, text) {
  target = Math.max(target, value);
  if (text && status) status.textContent = text;
}

function tickLoader() {
  shown += (target - shown) * 0.12;
  if (fill) fill.style.width = `${shown.toFixed(1)}%`;
  if (count) count.textContent = `${Math.round(shown)}%`;
  if (!done || shown < 99.4) requestAnimationFrame(tickLoader);
}
tickLoader();

function finish() {
  if (done) return;
  done = true;
  setProgress(100, 'Dolor sit amet');
  setTimeout(() => {
    loader?.classList.add('is-done');
    document.body.classList.remove('is-loading');
    // first reveals fire once the page is visible
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('resize'));
  }, 320);
}

/* the page must stay usable even if the CDN or WebGL is unavailable */
const safety = setTimeout(() => {
  document.documentElement.classList.add('no-webgl');
  finish();
}, 12000);

async function boot() {
  initUI();
  setProgress(18, 'Lorem ipsum');

  let scene = null;
  try {
    const { createScene } = await import('./scene.js');
    setProgress(52, 'Consectetur');

    scene = createScene({
      canvas: document.getElementById('gl'),
      bubbleEl: document.getElementById('bubble'),
      bubbleTextEl: document.getElementById('bubble-text'),
      onFirstFrame: () => { clearTimeout(safety); setProgress(100); finish(); },
    });
    setProgress(84, 'Adipiscing elit');
  } catch (err) {
    console.warn('[loremcats] 3D disabled:', err);
    document.documentElement.classList.add('no-webgl');
    clearTimeout(safety);
    finish();
    return;
  }

  let last = performance.now();
  let elapsed = 0;
  let running = true;

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { last = performance.now(); requestAnimationFrame(frame); }
  });

  function frame(now) {
    if (!running) return;
    // rAF timestamps can predate performance.now() on the very first frame,
    // so the delta is clamped to a sane positive window
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
    last = now;
    elapsed += dt;
    scene.render(dt, elapsed);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

boot();
