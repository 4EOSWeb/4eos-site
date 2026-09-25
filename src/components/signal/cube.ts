/**
 * The industries chapter is one cube. Six faces, one industry each.
 * Local points are built here and in shader.ts — keep the two in step.
 * The live field rotates that local cube with `cubeOrientation`.
 */

export type Vec3 = [number, number, number];
type Quat = [number, number, number, number];

/** Half-edge. Large enough to dominate the right side of the chapter. */
export const CUBE_H = 3.15;
/** Sits right of the names. The left face stays clear of the type. */
export const CUBE_CX = 5.85;
export const CUBE_CY = 0.05;

/** seed.z below this draws the industry mark. */
export const CUBE_ICON = 0.3;
/** seed.z below this draws the face shell. */
export const CUBE_SHELL = 0.78;
/** seed.z below this draws the edge flow. The rest is the interior. */
export const CUBE_EDGE = 0.93;
/** Mark size on a face. Large enough to read across the chapter. */
const ICON_SCALE = 1.85;

const TAU = Math.PI * 2;

function fract(n: number) {
  return n - Math.floor(n);
}

function hash21(x: number, y: number) {
  const n = fract(x * 12.9898 + y * 78.233);
  return fract(n * n * 45.233);
}

/** Outward normal, then the face's right and up axes. */
export function faceBasis(k: number): [Vec3, Vec3, Vec3] {
  if (k <= 0) return [[0, 0, 1], [1, 0, 0], [0, 1, 0]];
  if (k === 1) return [[1, 0, 0], [0, 0, -1], [0, 1, 0]];
  if (k === 2) return [[0, 0, -1], [-1, 0, 0], [0, 1, 0]];
  if (k === 3) return [[-1, 0, 0], [0, 0, 1], [0, 1, 0]];
  if (k === 4) return [[0, 1, 0], [1, 0, 0], [0, 0, -1]];
  return [[0, -1, 0], [1, 0, 0], [0, 0, 1]];
}

function facePoint(k: number, su: number, sv: number, depth: number): Vec3 {
  const [n, u, v] = faceBasis(k);
  const d = CUBE_H - depth;
  const x = su * CUBE_H;
  const y = sv * CUBE_H;
  return [
    n[0] * d + u[0] * x + v[0] * y,
    n[1] * d + u[1] * x + v[1] * y,
    n[2] * d + u[2] * x + v[2] * y,
  ];
}

/**
 * -1..1. Mostly even across the face, with a mild gather at the rim so the
 * silhouette is sharper than the middle without opening a hole around the mark.
 */
function rimCoord(t: number) {
  const a = t * 2 - 1;
  const s = a < 0 ? -1 : 1;
  const m = Math.abs(a);
  return s * Math.pow(m, 0.78);
}

function axisAngle(x: number, y: number, z: number, rad: number): Quat {
  const h = rad * 0.5;
  const s = Math.sin(h);
  const len = Math.hypot(x, y, z) || 1;
  return [(x / len) * s, (y / len) * s, (z / len) * s, Math.cos(h)];
}

function slerp(a: Quat, b: Quat, t: number): Quat {
  let bx = b[0];
  let by = b[1];
  let bz = b[2];
  let bw = b[3];
  let cos = a[0] * bx + a[1] * by + a[2] * bz + a[3] * bw;
  if (cos < 0) {
    cos = -cos;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  if (cos > 0.9995) {
    const x = a[0] + (bx - a[0]) * t;
    const y = a[1] + (by - a[1]) * t;
    const z = a[2] + (bz - a[2]) * t;
    const w = a[3] + (bw - a[3]) * t;
    const len = Math.hypot(x, y, z, w) || 1;
    return [x / len, y / len, z / len, w / len];
  }
  const theta = Math.acos(Math.min(1, cos));
  const s = Math.sin(theta);
  const w1 = Math.sin((1 - t) * theta) / s;
  const w2 = Math.sin(t * theta) / s;
  return [a[0] * w1 + bx * w2, a[1] * w1 + by * w2, a[2] * w1 + bz * w2, a[3] * w1 + bw * w2];
}

/** Pose that turns face k straight at the camera (+Z). */
function faceQuat(k: number): Quat {
  if (k <= 0) return [0, 0, 0, 1];
  if (k === 1) return axisAngle(0, 1, 0, -Math.PI / 2);
  if (k === 2) return axisAngle(0, 1, 0, Math.PI);
  if (k === 3) return axisAngle(0, 1, 0, Math.PI / 2);
  if (k === 4) return axisAngle(1, 0, 0, Math.PI / 2);
  return axisAngle(1, 0, 0, -Math.PI / 2);
}

/** Slow tumble on an axis that is not a face normal, so every side comes around. */
function tumbleQuat(t: number): Quat {
  return axisAngle(0.16, 1, 0.22, t * 0.18 + 1.05);
}

/**
 * Row-major 3x3. `turn` 0 is the tumble, 1 locks `face` perpendicular
 * to the camera. Hover sits between the two.
 */
export function cubeOrientation(t: number, face: number, turn: number): number[] {
  const spin = tumbleQuat(t);
  const aimed = face >= 0 && face < 6 ? faceQuat(face) : spin;
  const q = slerp(spin, aimed, Math.min(1, Math.max(0, turn)));
  const [x, y, z, w] = q;
  const xx = x * x;
  const yy = y * y;
  const zz = z * z;
  const xy = x * y;
  const xz = x * z;
  const yz = y * z;
  const wx = w * x;
  const wy = w * y;
  const wz = w * z;
  return [
    1 - 2 * (yy + zz),
    2 * (xy - wz),
    2 * (xz + wy),
    2 * (xy + wz),
    1 - 2 * (xx + zz),
    2 * (yz - wx),
    2 * (xz - wy),
    2 * (yz + wx),
    1 - 2 * (xx + yy),
  ];
}

export function mulMatPoint(m: number[], p: Vec3): Vec3 {
  return [
    m[0] * p[0] + m[1] * p[1] + m[2] * p[2],
    m[3] * p[0] + m[4] * p[1] + m[5] * p[2],
    m[6] * p[0] + m[7] * p[1] + m[8] * p[2],
  ];
}

/** How squarely this face points at the camera in the still poster. */
export function posterFacing(k: number) {
  const m = cubeOrientation(0, -1, 0);
  const n = faceBasis(Math.min(5, Math.max(0, k)))[0];
  return Math.max(0, m[6] * n[0] + m[7] * n[1] + m[8] * n[2]);
}

/**
 * One particle in cube-local space, before the cube's rotation.
 * Twin of cubeLocal() in shader.ts.
 */
export function cubeLocal(
  k: number,
  seed: Vec3,
  extra: number,
  glyph: Vec3 | null,
  t: number,
): Vec3 {
  if (glyph) {
    const [n, u, v] = faceBasis(k);
    const base = facePoint(k, 0, 0, -0.14);
    return [
      base[0] + u[0] * glyph[0] * ICON_SCALE + v[0] * glyph[1] * ICON_SCALE + n[0] * glyph[2] * 0.34,
      base[1] + u[1] * glyph[0] * ICON_SCALE + v[1] * glyph[1] * ICON_SCALE + n[1] * glyph[2] * 0.34,
      base[2] + u[2] * glyph[0] * ICON_SCALE + v[2] * glyph[1] * ICON_SCALE + n[2] * glyph[2] * 0.34,
    ];
  }

  if (seed[2] < CUBE_SHELL) {
    const drift = Math.sin(t * 0.32 + seed[0] * 11) * 0.045;
    return facePoint(k, rimCoord(seed[0]) + drift, rimCoord(seed[1]), Math.pow(hash21(seed[0], seed[1]), 1.5) * 0.72);
  }

  if (seed[2] < CUBE_EDGE) {
    const which = Math.min(3, Math.floor(seed[0] * 4));
    const along = fract(seed[1] + t * 0.07) * 2 - 1;
    const jitter = (hash21(seed[1], extra) - 0.5) * 0.16;
    let su = along;
    let sv = 0.985;
    if (which === 1) sv = -0.985;
    else if (which === 2) {
      su = 0.985;
      sv = along;
    } else if (which === 3) {
      su = -0.985;
      sv = along;
    }
    if (which < 2) su += jitter;
    else sv += jitter;
    return facePoint(k, su, sv, 0.02 + hash21(seed[0], extra) * 0.16);
  }

  const span = CUBE_H * 1.56;
  return [
    (seed[0] - 0.5) * span + Math.sin(t * 0.16 + seed[1] * TAU) * 0.1,
    (seed[1] - 0.5) * span + Math.cos(t * 0.13 + seed[0] * TAU) * 0.1,
    (hash21(seed[0], seed[1]) - 0.5) * span,
  ];
}
