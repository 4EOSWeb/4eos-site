/**
 * The industries chapter is one cube. Six faces, one industry each.
 * Local points are built here and in shader.ts — keep the two in step.
 * The live field rotates that local cube with `cubeOrientation`.
 */

export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];

/** Half-edge. Large enough to dominate the right side of the chapter. */
export const CUBE_H = 3.15;
/** Sits right of the names. The left face stays clear of the type. */
export const CUBE_CX = 5.85;
export const CUBE_CY = 0.05;

/** seed.z below this is the carved mark (floor and walls). */
export const CUBE_ICON = 0.38;
/** seed.z below this is a flat face. */
export const CUBE_SHELL = 0.72;
/** seed.z below this is a rounded edge. The rest is a rounded corner. */
export const CUBE_EDGE = 0.9;
/** Mark size in world units. The carve uses the same space. */
const ICON_SCALE = 1.28;
/** How far under the skin the mark sits. */
const POCKET = 0.62;
/** Corner radius. The flat face ends at CUBE_H - DIE_R. */
const DIE_R = 1.02;

const TAU = Math.PI * 2;

function fract(n: number) {
  return n - Math.floor(n);
}

function hash21(x: number, y: number) {
  const n = fract(x * 12.9898 + y * 78.233);
  return fract(n * n * 45.233);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

const DIE_A = CUBE_H - DIE_R;

function sdCapsule(px: number, py: number, ax: number, ay: number, bx: number, by: number, r: number) {
  const abx = bx - ax;
  const aby = by - ay;
  const ab2 = abx * abx + aby * aby || 1e-4;
  const t = clamp(((px - ax) * abx + (py - ay) * aby) / ab2, 0, 1);
  return Math.hypot(px - (ax + abx * t), py - (ay + aby * t)) - r;
}

function sdBox(px: number, py: number, cx: number, cy: number, hx: number, hy: number) {
  const dx = Math.abs(px - cx) - hx;
  const dy = Math.abs(py - cy) - hy;
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0);
}

/** Signed distance to one industry mark, in the mark's own units. Negative is inside. */
function iconSDF(k: number, x: number, y: number) {
  if (k <= 0) {
    let d = sdCapsule(x, y, 0, -0.95, 0, 0.5, 0.2);
    d = Math.min(d, sdCapsule(x, y, -0.28, -1.08, 0.28, -1.08, 0.16));
    d = Math.min(d, sdCapsule(x, y, -0.98, 0.5, 0.98, 0.5, 0.16));
    d = Math.min(d, sdCapsule(x, y, -0.66, 0.5, -0.66, 0.02, 0.1));
    d = Math.min(d, sdCapsule(x, y, 0.66, 0.5, 0.66, 0.02, 0.1));
    d = Math.min(d, Math.hypot(x + 0.66, y + 0.16) - 0.4);
    d = Math.min(d, Math.hypot(x - 0.66, y + 0.16) - 0.4);
    return d;
  }
  if (k === 1) {
    const ex = x / 0.98;
    const ey = (y - 0.12) / 0.82;
    let d = Math.hypot(ex, ey) - 1;
    if (y < 0.12) d = Math.max(d, 0.12 - y);
    d = Math.min(d, sdCapsule(x, y, 0, 0.2, 0, -0.92, 0.14));
    d = Math.min(d, sdCapsule(x, y, 0, -0.92, 0.36, -1.28, 0.12));
    d = Math.min(d, sdCapsule(x, y, 0.36, -1.28, 0.62, -0.78, 0.12));
    return d;
  }
  if (k === 2) {
    return Math.min(
      sdCapsule(x, y, -1.05, 0, 1.05, 0, 0.4),
      sdCapsule(x, y, 0, -1.05, 0, 1.05, 0.4),
    );
  }
  if (k === 3) {
    let d = sdCapsule(x, y, -0.52, -1.1, -0.52, 0.98, 0.24);
    d = Math.min(d, sdCapsule(x, y, -0.52, 0.86, 1.12, 0.62, 0.2));
    d = Math.min(d, sdCapsule(x, y, -0.52, 0.86, -1.1, 0.7, 0.18));
    d = Math.min(d, sdCapsule(x, y, 0.7, 0.72, 0.7, -0.22, 0.1));
    d = Math.min(d, Math.hypot(x - 0.7, y + 0.32) - 0.2);
    return d;
  }
  if (k === 4) {
    const r = Math.hypot(x, y);
    const tooth = Math.cos(Math.atan2(y, x) * 8);
    const outer = 0.76 + Math.max(tooth, 0) * 0.4;
    return Math.max(0.2 - r, r - outer);
  }
  let d = sdBox(x, y, -0.78, -0.42, 0.32, 0.38);
  d = Math.min(d, sdBox(x, y, 0, -0.18, 0.32, 0.62));
  d = Math.min(d, sdBox(x, y, 0.78, 0.06, 0.32, 0.86));
  return d;
}

/** Slide a face sample out of the mark so the opening keeps the mark's outline. */
function clearIcon(k: number, su: number, sv: number): [number, number] {
  const span = DIE_A / ICON_SCALE;
  let x = su * span;
  let y = sv * span;
  const sd = iconSDF(k, x, y);
  if (sd < 0.1) {
    const e = 0.045;
    const dx = iconSDF(k, x + e, y) - iconSDF(k, x - e, y);
    const dy = iconSDF(k, x, y + e) - iconSDF(k, x, y - e);
    const gl = Math.hypot(dx, dy) || 1;
    x += (dx / gl) * (0.12 - sd);
    y += (dy / gl) * (0.12 - sd);
  }
  return [clamp(x / span, -1, 1), clamp(y / span, -1, 1)];
}

/** Flat face of the die. su, sv are -1..1 across the flat panel. */
function skinPoint(k: number, su: number, sv: number, depth: number): Vec3 {
  const [n, u, v] = faceBasis(k);
  const d = CUBE_H - depth;
  return [
    n[0] * d + u[0] * su * DIE_A + v[0] * sv * DIE_A,
    n[1] * d + u[1] * su * DIE_A + v[1] * sv * DIE_A,
    n[2] * d + u[2] * su * DIE_A + v[2] * sv * DIE_A,
  ];
}

function edgePoint(which: number, along: number, ang: number): Vec3 {
  const axis = which % 3;
  const quad = Math.floor(which / 3);
  const s1 = quad % 2 === 0 ? -1 : 1;
  const s2 = quad < 2 ? -1 : 1;
  const t = along * DIE_A;
  const c = DIE_A + Math.cos(ang) * DIE_R;
  const s = DIE_A + Math.sin(ang) * DIE_R;
  if (axis === 0) return [t, s1 * c, s2 * s];
  if (axis === 1) return [s2 * s, t, s1 * c];
  return [s1 * c, s2 * s, t];
}

function cornerPoint(which: number, u: number, v: number): Vec3 {
  const sx = which % 2 === 0 ? -1 : 1;
  const sy = (which & 2) === 0 ? -1 : 1;
  const sz = which < 4 ? -1 : 1;
  const phi = u * (Math.PI / 2);
  const th = v * (Math.PI / 2);
  const dx = Math.sin(th) * Math.cos(phi);
  const dy = Math.sin(th) * Math.sin(phi);
  const dz = Math.cos(th);
  return [sx * (DIE_A + DIE_R * dx), sy * (DIE_A + DIE_R * dy), sz * (DIE_A + DIE_R * dz)];
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

/** Tumble, or the quaternion that parks face `k` square to the camera. */
export function cubeGoal(t: number, face: number): Quat {
  if (face >= 0 && face < 6) return faceQuat(face);
  return tumbleQuat(t);
}

export function slerpQuat(a: Quat, b: Quat, t: number): Quat {
  return slerp(a, b, t);
}

/** Absolute dot. 1 means the two poses are the same. */
export function quatDot(a: Quat, b: Quat) {
  return Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]);
}

export function quatToMat(q: Quat): number[] {
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

/** Still of the free tumble. The live field eases toward a face on its own. */
export function cubeOrientation(t: number, face: number, turn: number): number[] {
  return quatToMat(slerp(tumbleQuat(t), face >= 0 && face < 6 ? faceQuat(face) : tumbleQuat(t), Math.min(1, Math.max(0, turn))));
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
    const su = clamp((glyph[0] * ICON_SCALE) / DIE_A, -0.96, 0.96);
    const sv = clamp((glyph[1] * ICON_SCALE) / DIE_A, -0.96, 0.96);
    // Floor of the carve, then the wall that rises to the skin in the mark's shape.
    const depth = seed[2] < 0.22 ? POCKET : 0.06 + ((seed[2] - 0.22) / 0.16) * (POCKET - 0.06);
    return skinPoint(k, su, sv, depth);
  }

  if (seed[2] < CUBE_SHELL) {
    const opened = clearIcon(k, seed[0] * 2 - 1, seed[1] * 2 - 1);
    return skinPoint(k, opened[0], opened[1], Math.pow(hash21(seed[0], seed[1]), 1.6) * 0.14);
  }

  if (seed[2] < CUBE_EDGE) {
    const which = Math.min(11, Math.floor(fract(extra * 12.17 + seed[0]) * 12));
    const along = fract(seed[1] + t * 0.04) * 2 - 1;
    const ang = hash21(seed[0], extra) * (Math.PI / 2);
    return edgePoint(which, along, ang);
  }

  const which = Math.min(7, Math.floor(fract(extra * 8.17 + seed[1]) * 8));
  return cornerPoint(which, seed[0], hash21(seed[0], seed[1]));
}
