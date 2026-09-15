import * as THREE from 'three';
import { furVertex, furFragment } from './shaders/fur.js';

/**
 * CatAvatar — a fully procedural fluffy character.
 *
 * Nothing is loaded: head, ears, eyes, muzzle and sweater are built from
 * primitives, the coat comes from the shell-fur shader. The avatar reacts to
 * the pointer (head + eye tracking), to hover (ears perk, coat puffs up),
 * to clicks (squash & stretch pop) and to drag (spin with inertia).
 */
export class CatAvatar {
  constructor({ quality = 'high' } = {}) {
    this.quality = quality;
    const hi = quality === 'high';

    this.root = new THREE.Group();
    this.furMaterials = [];

    /* ---- uniforms shared by every fur patch (lighting + global motion) ---- */
    this.shared = {
      uTime:          { value: 0 },
      uWind:          { value: 0.01 },
      uPuff:          { value: 0 },
      uLightDir:      { value: new THREE.Vector3(0.45, 0.7, 0.55).normalize() },
      uLightColor:    { value: new THREE.Color('#fff3e2') },
      uFillDir:       { value: new THREE.Vector3(-0.6, 0.15, -0.6).normalize() },
      uFillColor:     { value: new THREE.Color('#bfe6ff') },
      uAmbientSky:    { value: new THREE.Color('#cbe7f7').multiplyScalar(0.62) },
      uAmbientGround: { value: new THREE.Color('#5c86a0').multiplyScalar(0.5) },
    };

    this._buildHead(hi);
    this._buildEars(hi);
    this._buildFace(hi);
    this._buildBody(hi);

    /* ------------------------------ state ------------------------------ */
    this.state = {
      tx: 0, ty: 0, px: 0, py: 0,
      hover: 0, hoverTarget: 0,
      dragYaw: 0, dragVel: 0, dragging: false,
      squash: 0, squashVel: 0,
      blinkT: -1, nextBlink: 1.8 + Math.random() * 3,
      twitch: 0,
      poked: 0,
    };

    this.baseScale = 1;
    this.targetPos = new THREE.Vector3(0, 0, 0);
    this.targetScale = 1;
    this._headWorld = new THREE.Vector3();
  }

  /* ===================================================================== */
  /* building blocks                                                        */
  /* ===================================================================== */

  _fur(geometry, shells, opts = {}) {
    const inst = new THREE.InstancedBufferGeometry().copy(geometry);
    inst.instanceCount = shells;

    const idx = new Float32Array(shells);
    for (let i = 0; i < shells; i++) idx[i] = i;
    inst.setAttribute('aShell', new THREE.InstancedBufferAttribute(idx, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: furVertex,
      fragmentShader: furFragment,
      uniforms: {
        ...this.shared,
        uShells:    { value: shells },
        uThickness: { value: opts.thickness ?? 0.085 },
        uDensity:   { value: opts.density ?? 150 },
        uRimPower:  { value: opts.rimPower ?? 2.1 },
        uGravity:   { value: opts.gravity ?? new THREE.Vector3(0, -0.02, 0) },
        uColor:     { value: new THREE.Color(opts.color ?? '#e9dcc7') },
        uTipColor:  { value: new THREE.Color(opts.tip ?? '#fffaf0') },
        uRimColor:  { value: new THREE.Color(opts.rim ?? '#bfe4ff') },
      },
    });

    const mesh = new THREE.Mesh(inst, material);
    mesh.frustumCulled = false;   // shells expand past the source bounds
    this.furMaterials.push(material);
    return mesh;
  }

  _buildHead(hi) {
    this.headPivot = new THREE.Group();
    this.headPivot.position.set(0, 0.28, 0);
    this.root.add(this.headPivot);

    const geo = new THREE.SphereGeometry(1, hi ? 72 : 44, hi ? 52 : 32);
    geo.scale(1.18, 0.97, 0.9);

    // flatten the face, widen the cheeks — a round Persian muzzle
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const front = Math.max(0, v.z);
      v.z -= front * front * 0.14;
      v.y += front * front * 0.02;
      const cheek = Math.max(0, 1 - Math.abs(v.y + 0.22) * 2.1) * Math.max(0, v.z);
      v.x *= 1 + cheek * 0.1;
      v.y -= cheek * 0.04;
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();

    this.head = this._fur(geo, hi ? 18 : 10, {
      thickness: 0.088,
      density: hi ? 182 : 104,
      gravity: new THREE.Vector3(0, -0.03, 0),
    });
    this.headPivot.add(this.head);
  }

  _buildEars(hi) {
    this.ears = [];

    // a sphere tapered into a teardrop: keeps clean UVs for the fur shells
    const geo = new THREE.SphereGeometry(0.3, hi ? 26 : 16, hi ? 18 : 12);
    {
      const pos = geo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const t = THREE.MathUtils.clamp((v.y + 0.3) / 0.6, 0, 1);
        const taper = Math.pow(1 - t, 0.62);
        v.x *= taper * 1.25;
        v.z *= taper * 0.6;
        v.y = (v.y + 0.3) * 0.95;
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
    }

    const innerGeo = new THREE.ConeGeometry(0.13, 0.26, 16);
    innerGeo.scale(1, 1, 0.45);
    innerGeo.translate(0, 0.16, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: '#dfb3ad', roughness: 0.95, metalness: 0,
    });

    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.54, 0.7, -0.05);
      pivot.rotation.z = side * -0.22;
      pivot.rotation.x = -0.1;

      const shell = this._fur(geo, hi ? 8 : 5, {
        thickness: 0.038,
        density: hi ? 52 : 34,
        gravity: new THREE.Vector3(0, -0.01, 0),
      });
      pivot.add(shell);

      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.position.set(0, 0.04, 0.05);
      inner.scale.set(0.82, 0.85, 1);
      pivot.add(inner);

      pivot.userData.rest = pivot.rotation.clone();
      this.headPivot.add(pivot);
      this.ears.push(pivot);
    }
  }

  _buildFace(hi) {
    /* ------------------------------- eyes ------------------------------ */
    this.eyes = [];
    const ballGeo = new THREE.SphereGeometry(0.19, hi ? 32 : 20, hi ? 24 : 14);
    ballGeo.scale(1.08, 0.82, 0.38);
    const pupilGeo = new THREE.SphereGeometry(0.072, hi ? 26 : 16, hi ? 18 : 12);
    pupilGeo.scale(0.8, 1.2, 0.5);
    const specGeo = new THREE.SphereGeometry(0.028, 12, 10);

    const irisMat = new THREE.MeshPhysicalMaterial({
      color: '#2e83e0', roughness: 0.06, metalness: 0,
      clearcoat: 1, clearcoatRoughness: 0.04,
      emissive: new THREE.Color('#0d3f7a'), emissiveIntensity: 0.25,
    });
    const pupilMat = new THREE.MeshStandardMaterial({ color: '#0b1020', roughness: 0.25 });
    const specMat  = new THREE.MeshBasicMaterial({ color: '#ffffff' });

    const lidGeo = new THREE.SphereGeometry(0.25, hi ? 26 : 16, hi ? 18 : 12);
    lidGeo.scale(1.16, 0.44, 0.56);

    for (const side of [-1, 1]) {
      const eye = new THREE.Group();
      eye.position.set(side * 0.33, -0.02, 0.86);
      eye.rotation.y = side * 0.22;
      eye.rotation.z = side * 0.12;

      const ball = new THREE.Mesh(ballGeo, irisMat);
      eye.add(ball);

      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.position.z = 0.05;
      eye.add(pupil);

      const spec = new THREE.Mesh(specGeo, specMat);
      spec.position.set(-side * 0.05, 0.062, 0.085);
      eye.add(spec);

      this.headPivot.add(eye);

      /* grumpy lid: inner corner dips toward the nose */
      const lid = this._fur(lidGeo, hi ? 7 : 4, {
        thickness: 0.042,
        density: hi ? 96 : 60,
        color: '#e3d4bb',
        tip: '#f4ebdb',
        rim: '#a9cbe6',
        rimPower: 3.2,
        gravity: new THREE.Vector3(0, -0.012, 0),
      });
      lid.position.set(side * 0.33, 0.095, 0.845);
      lid.rotation.z = side * 0.42;
      lid.userData.restY = lid.position.y;
      this.headPivot.add(lid);

      this.eyes.push({ group: eye, pupil, lid, side, rest: eye.position.clone() });
    }

    /* ------------------------------- nose ------------------------------ */
    const noseGeo = new THREE.ConeGeometry(0.088, 0.075, 3);
    noseGeo.rotateX(Math.PI);
    noseGeo.rotateY(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, new THREE.MeshStandardMaterial({
      color: '#e79b8b', roughness: 0.55,
    }));
    nose.position.set(0, -0.15, 0.92);
    nose.rotation.x = -0.35;
    this.headPivot.add(nose);

    /* ------------------------------- mouth ----------------------------- */
    const mouthGeo = new THREE.TorusGeometry(0.058, 0.0115, 6, 14, Math.PI);
    const mouthMat = new THREE.MeshStandardMaterial({ color: '#8a6357', roughness: 0.8 });
    this.mouth = new THREE.Group();
    for (const side of [-1, 1]) {
      const m = new THREE.Mesh(mouthGeo, mouthMat);
      m.position.set(side * 0.052, -0.245, 0.88);
      m.rotation.z = Math.PI;
      m.rotation.y = side * 0.2;
      this.mouth.add(m);
    }
    this.headPivot.add(this.mouth);

    /* ----------------------------- whiskers ---------------------------- */
    const wGeo = new THREE.CylinderGeometry(0.0038, 0.0012, 0.78, 4);
    wGeo.translate(0, 0.39, 0);
    const wMat = new THREE.MeshBasicMaterial({
      color: '#ffffff', transparent: true, opacity: 0.55,
    });
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const w = new THREE.Mesh(wGeo, wMat);
        w.position.set(side * 0.3, -0.16 + i * 0.075, 0.76);
        w.rotation.z = side * (Math.PI / 2) + (i - 1) * 0.16 * -side;
        w.rotation.x = -0.35;
        this.headPivot.add(w);
      }
    }
  }

  _buildBody(hi) {
    this.body = new THREE.Group();
    this.root.add(this.body);

    const pts = [];
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = -0.55 - t * 3.4;
      const r = 0.33 + Math.sin(Math.min(1, t * 2.6) * Math.PI * 0.5) * 0.5;
      pts.push(new THREE.Vector2(r, y));
    }
    const sweaterGeo = new THREE.LatheGeometry(pts, hi ? 48 : 28);
    this.sweaterMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2478d8'), roughness: 0.92, metalness: 0,
    });
    this.sweaterTarget = this.sweaterMat.color.clone();
    this.body.add(new THREE.Mesh(sweaterGeo, this.sweaterMat));

    const collarGeo = new THREE.TorusGeometry(0.35, 0.088, 12, hi ? 40 : 22);
    collarGeo.rotateX(Math.PI / 2);
    this.collarMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3a8ce8'), roughness: 0.88,
    });
    this.collarTarget = this.collarMat.color.clone();
    const collar = new THREE.Mesh(collarGeo, this.collarMat);
    collar.position.y = -0.52;
    this.body.add(collar);
  }

  /* ===================================================================== */
  /* interaction API                                                        */
  /* ===================================================================== */

  setPointer(x, y) { this.state.tx = x; this.state.ty = y; }
  setHover(on)     { this.state.hoverTarget = on ? 1 : 0; }

  poke() {
    this.state.squashVel += 6.2;
    this.state.twitch = 1;
    this.state.poked = 1;
    this.state.blinkT = 0;
  }

  dragStart() { this.state.dragging = true; }
  dragMove(dx) { this.state.dragVel += dx * 0.00035; }
  dragEnd()   { this.state.dragging = false; }

  setSweater(colorA, colorB) {
    this.sweaterTarget.copy(colorA);
    this.collarTarget.copy(colorB);
  }

  get headWorldPosition() {
    return this.headPivot.getWorldPosition(this._headWorld);
  }

  /* ===================================================================== */
  /* frame update                                                           */
  /* ===================================================================== */

  update(dt, t) {
    const s = this.state;
    const d = Math.max(0, Math.min(dt, 1 / 30));

    /* pointer smoothing --------------------------------------------------*/
    s.px += (s.tx - s.px) * Math.min(1, d * 6.5);
    s.py += (s.ty - s.py) * Math.min(1, d * 6.5);
    s.hover += (s.hoverTarget - s.hover) * Math.min(1, d * 7);

    /* drag inertia -------------------------------------------------------*/
    s.dragYaw += s.dragVel;
    s.dragVel *= s.dragging ? 0.55 : 0.94;
    if (!s.dragging) s.dragYaw *= 0.955;

    /* squash & stretch spring -------------------------------------------*/
    s.squashVel += (-s.squash * 165 - s.squashVel * 13) * d;
    s.squash += s.squashVel * d;
    s.poked *= 0.94;
    s.twitch *= 0.9;

    /* blinking -----------------------------------------------------------*/
    s.nextBlink -= d;
    if (s.blinkT >= 0) {
      s.blinkT += d;
      if (s.blinkT > 0.19) { s.blinkT = -1; s.nextBlink = 1.9 + Math.random() * 3.6; }
    } else if (s.nextBlink <= 0) {
      s.blinkT = 0;
    }
    const blink = s.blinkT >= 0 ? Math.sin((s.blinkT / 0.19) * Math.PI) : 0;

    /* head tracking ------------------------------------------------------*/
    const idle = Math.sin(t * 0.55) * 0.035;
    const yaw = s.px * (0.44 + s.hover * 0.08) + s.dragYaw + idle;
    const pitch = -s.py * 0.32 + Math.sin(t * 0.8) * 0.02;

    this.headPivot.rotation.y += (yaw - this.headPivot.rotation.y) * Math.min(1, d * 9);
    this.headPivot.rotation.x += (pitch - this.headPivot.rotation.x) * Math.min(1, d * 9);
    this.headPivot.rotation.z += ((-s.px * 0.1 + s.twitch * 0.05) - this.headPivot.rotation.z) * Math.min(1, d * 8);

    this.body.rotation.y += (yaw * 0.22 - this.body.rotation.y) * Math.min(1, d * 4);
    this.body.rotation.z += (-s.px * 0.045 - this.body.rotation.z) * Math.min(1, d * 4);

    /* eyes ---------------------------------------------------------------*/
    for (const eye of this.eyes) {
      eye.pupil.position.x = s.px * 0.035;
      eye.pupil.position.y = -s.py * 0.028;
      const widen = 1 + s.hover * 0.1 + s.poked * 0.25;
      eye.group.scale.set(widen, widen * (1 - blink * 0.94), 1);
      eye.lid.position.y = eye.lid.userData.restY - blink * 0.19 - s.hover * 0.04;
      eye.lid.rotation.z = eye.side * (0.42 - s.hover * 0.16 - s.poked * 0.24);
    }

    /* ears ---------------------------------------------------------------*/
    this.ears.forEach((ear, i) => {
      const side = i === 0 ? -1 : 1;
      const rest = ear.userData.rest;
      const perk = s.hover * 0.16 + s.poked * 0.22;
      const flick = Math.sin(t * 7.5 + i * 2.1) * s.twitch * 0.25;
      ear.rotation.z += ((rest.z - side * perk + flick) - ear.rotation.z) * Math.min(1, d * 10);
      ear.rotation.x += ((rest.x - perk * 0.5) - ear.rotation.x) * Math.min(1, d * 10);
    });

    /* mouth ---------------------------------------------------------------*/
    const open = s.poked * 0.9;
    this.mouth.scale.set(1 + open * 0.5, 1 + open * 1.4, 1);
    this.mouth.position.y = -open * 0.04;

    /* coat ---------------------------------------------------------------*/
    this.shared.uTime.value = t;
    this.shared.uPuff.value = s.hover * 0.22 + s.poked * 0.35;
    this.shared.uWind.value = 0.012 + s.hover * 0.01 + s.poked * 0.05 + Math.abs(s.dragVel) * 6;

    const ease = Math.min(1, d * 3);
    this.sweaterMat.color.lerp(this.sweaterTarget, ease);
    this.collarMat.color.lerp(this.collarTarget, ease);

    /* body placement -----------------------------------------------------*/
    const bob = Math.sin(t * 1.15) * 0.04 + s.hover * 0.03;
    this.root.position.x += (this.targetPos.x - this.root.position.x) * Math.min(1, d * 3.2);
    this.root.position.y += (this.targetPos.y + bob - this.root.position.y) * Math.min(1, d * 3.2);
    this.root.position.z += (this.targetPos.z - this.root.position.z) * Math.min(1, d * 3.2);

    this.baseScale += (this.targetScale - this.baseScale) * Math.min(1, d * 3.2);
    const sq = s.squash;
    this.root.scale.set(
      this.baseScale * (1 - sq * 0.11),
      this.baseScale * (1 + sq * 0.16),
      this.baseScale * (1 - sq * 0.11),
    );
  }

  /** view-space light directions, refreshed when the camera moves */
  syncLights(camera) {
    this.shared.uLightDir.value
      .set(0.45, 0.7, 0.55).normalize().transformDirection(camera.matrixWorldInverse);
    this.shared.uFillDir.value
      .set(-0.6, 0.15, -0.6).normalize().transformDirection(camera.matrixWorldInverse);
  }

  dispose() {
    this.root.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material.dispose();
      }
    });
  }
}
