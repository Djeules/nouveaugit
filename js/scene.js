import * as THREE from 'three';
import { CatAvatar } from './cat.js';

const BUBBLES = [
  'Lorem !', 'Ipsum…', 'Dolor sit amet ?', 'Consectetur !',
  'Adipiscing elit', 'Sed do eiusmod', 'Tempor incididunt !',
];

/**
 * Scroll choreography — one keyframe per <section data-index>.
 * `mob` is the placement used on narrow screens, where the copy stacks
 * vertically and the avatar has to move out of its way.
 */
const KEYFRAMES = [
  { pos: [0.3, -0.16, 0],  scale: 0.8, mob: [0, -1.2, 0], mobScale: 0.74,
    sweater: '#2478d8', collar: '#3a8ce8',
    bg: ['#cfeaf8', '#8cc4de', '#2f6f8f'] },
  { pos: [1.75, -0.2, -0.6], scale: 0.66, mob: [0, -1.5, -0.6], mobScale: 0.7,
    sweater: '#1f9e93', collar: '#33b7aa',
    bg: ['#dff1f5', '#9ad2d4', '#2c8080'] },
  { pos: [2.75, 1.45, -2.4], scale: 0.52, mob: [0, 1.75, -3.0], mobScale: 0.5,
    sweater: '#6a5fb0', collar: '#8478c8',
    bg: ['#f1ecf8', '#c3bde6', '#6a5fa8'] },
  { pos: [0.15, -2.15, 0.7], scale: 0.95, mob: [0, -2.35, 0.7], mobScale: 0.95,
    sweater: '#d4645f', collar: '#e8807a',
    bg: ['#f0b9a4', '#d98f8c', '#9c5270'] },
  { pos: [2.25, -1.2, -0.9], scale: 0.6, mob: [0.5, -1.7, -0.9], mobScale: 0.62,
    sweater: '#2b4bc0', collar: '#3f61da',
    bg: ['#dbe7fb', '#9aaee8', '#3a4f9e'] },
];

export function createScene({ canvas, bubbleEl, bubbleTextEl, onFirstFrame }) {
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const quality = (isCoarse || window.innerWidth < 760) ? 'low' : 'high';

  /* ------------------------------ renderer ------------------------------ */
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: quality === 'high', powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : 1.6));
  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 7.4);

  /* ------------------------------- lights ------------------------------- */
  scene.add(new THREE.HemisphereLight('#d6ecfa', '#3f6d88', 1.05));

  const key = new THREE.DirectionalLight('#fff4e4', 1.7);
  key.position.set(2.4, 3.2, 3.0);
  scene.add(key);

  const rim = new THREE.DirectionalLight('#bfe6ff', 1.5);
  rim.position.set(-3.0, 1.0, -2.6);
  scene.add(rim);

  /* ------------------------------- avatar ------------------------------- */
  const cat = new CatAvatar({ quality });
  scene.add(cat.root);

  /* ------------------------------ pointer ------------------------------- */
  const pointer = new THREE.Vector2(0, 0);
  const rayDir = new THREE.Vector3();
  const toHead = new THREE.Vector3();
  let hovering = false;
  let dragging = false;
  let lastX = 0;
  let moved = 0;

  const listeners = [];
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    listeners.push(() => target.removeEventListener(type, fn, opts));
  };

  function updatePointer(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    cat.setPointer(pointer.x, pointer.y);
  }

  function testHover() {
    // cheap ray/sphere test against the head instead of a full raycast
    rayDir.set(pointer.x, -pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
    toHead.copy(cat.headWorldPosition).sub(camera.position);
    const tca = toHead.dot(rayDir);
    if (tca <= 0) return false;
    const d2 = toHead.lengthSq() - tca * tca;
    const r = 1.25 * cat.baseScale;
    return d2 < r * r;
  }

  on(window, 'pointermove', (e) => {
    updatePointer(e);
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      cat.dragMove(dx);
    }
    refreshHover();
  }, { passive: true });

  function refreshHover() {
    const h = testHover();
    if (h === hovering) return;
    hovering = h;
    cat.setHover(h);
    document.documentElement.classList.toggle('avatar-hot', h);
  }

  on(window, 'pointerdown', (e) => {
    updatePointer(e);
    if (testHover()) {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      cat.dragStart();
    }
  }, { passive: true });

  on(window, 'pointerup', () => {
    if (dragging && moved < 8) react();
    dragging = false;
    cat.dragEnd();
  }, { passive: true });

  on(window, 'pointercancel', () => { dragging = false; cat.dragEnd(); }, { passive: true });

  /* click anywhere on the page still wakes the avatar up */
  on(window, 'click', (e) => {
    if (e.target.closest('a, button')) return;
    if (!dragging) react();
  }, { passive: true });

  let bubbleTimer = 0;
  let bubbleIdx = Math.floor(Math.random() * BUBBLES.length);

  function react() {
    cat.poke();
    bubbleIdx = (bubbleIdx + 1 + Math.floor(Math.random() * 2)) % BUBBLES.length;
    if (bubbleTextEl) bubbleTextEl.textContent = BUBBLES[bubbleIdx];
    if (bubbleEl) bubbleEl.classList.add('is-on');
    bubbleTimer = 1.8;
  }

  /* ------------------------------- scroll ------------------------------- */
  const sections = Array.from(document.querySelectorAll('.section[data-index]'));
  let tops = [];
  const measure = () => { tops = sections.map((el) => el.offsetTop); };

  const colTmp = new THREE.Color();
  const colA = new THREE.Color();
  const colB = new THREE.Color();
  const bgOut = [new THREE.Color(), new THREE.Color(), new THREE.Color()];
  const swA = new THREE.Color();
  const swB = new THREE.Color();
  let lastBg = '';

  function applyChoreography() {
    if (!tops.length) return;
    // f == 0 when a section fills the viewport, 1 when the next one does
    const y = window.scrollY;

    let i = 0;
    while (i < tops.length - 2 && y >= tops[i + 1]) i++;
    const span = Math.max(1, (tops[i + 1] ?? (tops[i] + window.innerHeight)) - tops[i]);
    const f = THREE.MathUtils.clamp((y - tops[i]) / span, 0, 1);
    const t = f * f * (3 - 2 * f);   // smoothstep between keyframes

    const a = KEYFRAMES[Math.min(i, KEYFRAMES.length - 1)];
    const b = KEYFRAMES[Math.min(i + 1, KEYFRAMES.length - 1)];

    const narrow = window.innerWidth < 980;
    const pa = (narrow && a.mob) ? a.mob : a.pos;
    const pb = (narrow && b.mob) ? b.mob : b.pos;
    const sa = (narrow && a.mobScale) ? a.mobScale : a.scale;
    const sb = (narrow && b.mobScale) ? b.mobScale : b.scale;

    cat.targetPos.set(
      THREE.MathUtils.lerp(pa[0], pb[0], t),
      THREE.MathUtils.lerp(pa[1], pb[1], t),
      THREE.MathUtils.lerp(pa[2], pb[2], t),
    );
    cat.targetScale = THREE.MathUtils.lerp(sa, sb, t) * fit();

    swA.set(a.sweater).lerp(colTmp.set(b.sweater), t);
    swB.set(a.collar).lerp(colTmp.set(b.collar), t);
    cat.setSweater(swA, swB);

    for (let k = 0; k < 3; k++) {
      colA.set(a.bg[k]);
      colB.set(b.bg[k]);
      bgOut[k].copy(colA).lerp(colB, t);
    }
    const css = bgOut.map((c) => '#' + c.getHexString()).join('|');
    if (css !== lastBg) {
      lastBg = css;
      const root = document.documentElement.style;
      root.setProperty('--bg-top', '#' + bgOut[0].getHexString());
      root.setProperty('--bg-mid', '#' + bgOut[1].getHexString());
      root.setProperty('--bg-deep', '#' + bgOut[2].getHexString());
      document.querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', '#' + bgOut[1].getHexString());
    }
  }

  const fit = () => THREE.MathUtils.clamp(window.innerWidth / 1280, 0.68, 1.05);

  on(window, 'scroll', applyChoreography, { passive: true });

  /* ------------------------------- resize ------------------------------- */
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.position.z = w / h < 1 ? 9.2 : 7.4;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    measure();
    applyChoreography();
  }
  on(window, 'resize', resize);
  on(window, 'orientationchange', () => setTimeout(resize, 120));

  /* ------------------------------- bubble ------------------------------- */
  const proj = new THREE.Vector3();
  function placeBubble(dt) {
    if (!bubbleEl) return;
    if (bubbleTimer > 0) {
      bubbleTimer -= dt;
      if (bubbleTimer <= 0) bubbleEl.classList.remove('is-on');
    }
    proj.copy(cat.headWorldPosition);
    proj.y += 1.5 * cat.baseScale;
    proj.project(camera);
    const x = (proj.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-proj.y * 0.5 + 0.5) * window.innerHeight;
    bubbleEl.style.transform =
      `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }

  /* -------------------------------- loop -------------------------------- */
  let first = true;
  function render(dt, t) {
    refreshHover();     // the avatar moves under the cursor while scrolling
    cat.update(reduced ? Math.min(dt, 1 / 60) * 0.65 : dt, t);
    cat.syncLights(camera);
    placeBubble(dt);
    renderer.render(scene, camera);
    if (first) { first = false; onFirstFrame?.(); }
  }

  resize();
  renderer.compile(scene, camera);

  // handy for tweaking from the console
  window.__loremcats = { scene, camera, cat, renderer, render };

  return {
    render,
    resize,
    react,
    isHovering: () => hovering,
    dispose() {
      listeners.forEach((off) => off());
      cat.dispose();
      renderer.dispose();
    },
  };
}
