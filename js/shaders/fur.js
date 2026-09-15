/**
 * Shell-based fur shader.
 *
 * The same geometry is drawn N times (instanced); each instance ("shell") is
 * pushed a little further along the surface normal and carves itself into
 * hair strands with a procedural cell noise. Stacked together the shells read
 * as soft fluffy fur — the trick used for plush characters in real-time.
 */

export const furVertex = /* glsl */ `
attribute float aShell;

uniform float uShells;
uniform float uThickness;
uniform float uPuff;      // extra fluff on hover / reaction
uniform vec3  uGravity;   // object-space droop applied to the tips
uniform float uWind;
uniform float uTime;

varying vec3  vNormal;
varying vec3  vViewPos;
varying vec2  vUv;
varying float vH;

void main(){
  float h = aShell / max(uShells - 1.0, 1.0);
  vH = h;

  vec3 n = normalize(normal);
  vec3 pos = position + n * (h * uThickness * (1.0 + uPuff));

  // tips droop and sway more than roots
  float k = h * h;
  pos += uGravity * k;
  pos.x += sin(uTime * 1.9 + position.y * 3.4) * uWind * k;
  pos.z += cos(uTime * 1.5 + position.x * 3.1) * uWind * k;

  vUv     = uv;
  vNormal = normalize(normalMatrix * n);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vViewPos = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const furFragment = /* glsl */ `
uniform vec3  uColor;
uniform vec3  uTipColor;
uniform vec3  uRimColor;
uniform vec3  uLightDir;     // view space
uniform vec3  uLightColor;
uniform vec3  uFillDir;      // view space
uniform vec3  uFillColor;
uniform vec3  uAmbientSky;
uniform vec3  uAmbientGround;
uniform float uDensity;
uniform float uRimPower;

varying vec3  vNormal;
varying vec3  vViewPos;
varying vec2  vUv;
varying float vH;

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main(){
  // ---- strand carving (shell 0 stays solid: it is the skin) ----
  if (vH > 0.001) {
    vec2  st   = vUv * uDensity;
    vec2  cell = floor(st);
    float r    = hash21(cell);
    float len  = 0.46 + 0.54 * r;            // per-strand length
    if (vH > len) discard;

    vec2  f   = fract(st) - 0.5;
    float rad = 0.5 * (1.0 - (vH / len) * 0.88) * (0.52 + 0.48 * hash21(cell + 7.13));
    if (dot(f, f) > rad * rad) discard;
  }

  vec3 N = normalize(vNormal);
  vec3 V = normalize(-vViewPos);

  // soft "wrapped" diffuse reads better than lambert on fur
  float key  = max(dot(N, uLightDir), 0.0);
  float wrap = dot(N, uLightDir) * 0.5 + 0.5;
  float fill = max(dot(N, uFillDir), 0.0);
  float rim  = pow(1.0 - max(dot(N, V), 0.0), uRimPower);

  vec3 amb = mix(uAmbientGround, uAmbientSky, N.y * 0.5 + 0.5);
  vec3 col = mix(uColor, uTipColor, vH);
  col *= mix(0.52, 1.0, vH);                 // root darkening, fake AO

  vec3 lit = col * (amb + uLightColor * (key * 0.55 + wrap * 0.55) + uFillColor * fill * 0.35);
  lit += uRimColor * rim * (0.28 + 0.72 * vH);

  gl_FragColor = vec4(lit, 1.0);
  #include <colorspace_fragment>
}
`;
