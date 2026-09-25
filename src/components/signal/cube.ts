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

/** seed.z below this draws the industry mark. */
export const CUBE_ICON = 0.3;
/** seed.z below this draws the face shell. */
export const CUBE_SHELL = 0.78;
/** seed.z below this draws the edge flow. The rest is the interior. */
export const CUBE_EDGE = 0.93;
/** Mark size. It sits inside the face pocket, clear of the rim. */
const ICON_SCALE = 1.5;
/** How far under the skin the mark sits. */
const POCKET = 0.55;
/** Radius of the recessed well, in face units (-1..1). */
const WELL = 0.66;

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

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
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
    const [n, u, v] = faceBasis(k);
    // The mark lives in the pocket. Its own thickness stays under the skin.
    const base = facePoint(k, 0, 0, POCKET);
    const sink = glyph[2] * 0.18;
    return [
      base[0] + u[0] * glyph[0] * ICON_SCALE + v[0] * glyph[1] * ICON_SCALE + n[0] * sink,
      base[1] + u[1] * glyph[0] * ICON_SCALE + v[1] * glyph[1] * ICON_SCALE + n[1] * sink,
      base[2] + u[2] * glyph[0] * ICON_SCALE + v[2] * glyph[1] * ICON_SCALE + n[2] * sink,
    ];
  }

  // The wall of the recess, from the lip down to the floor of the pocket.
  if (seed[2] < 0.42) {
    const ang = seed[0] * TAU;
    return facePoint(k, Math.cos(ang) * WELL, Math.sin(ang) * WELL, 0.05 + seed[1] * 0.52);
  }

  if (seed[2] < CUBE_SHELL) {
    const drift = Math.sin(t * 0.32 + seed[0] * 11) * 0.02;
    let su = clamp(rimCoord(seed[0]) + drift, -0.92, 0.92);
    let sv = clamp(rimCoord(seed[1]), -0.92, 0.92);
    const r = Math.hypot(su, sv);
    let depth = Math.pow(hash21(seed[0], seed[1]), 1.5) * 0.22;
    if (r < WELL) {
      const rad = WELL + 0.02;
      su = (su / Math.max(r, 0.001)) * rad;
      sv = (sv / Math.max(r, 0.001)) * rad;
      depth = 0.02;
    }
    return facePoint(k, su, sv, depth);
  }

  if (seed[2] < CUBE_EDGE) {
    const which = Math.min(3, Math.floor(seed[0] * 4));
    // Stop short of the corner so the edge does not shoot past it.
    const along = clamp((fract(seed[1] + t * 0.07) * 2 - 1) * 0.86, -0.86, 0.86);
    const jitter = (hash21(seed[1], extra) - 0.5) * 0.04;
    let su = along;
    let sv = 0.92;
    if (which === 1) sv = -0.92;
    else if (which === 2) {
      su = 0.92;
      sv = along;
    } else if (which === 3) {
      su = -0.92;
      sv = along;
    }
    if (which < 2) su = clamp(su + jitter, -0.86, 0.86);
    else sv = clamp(sv + jitter, -0.86, 0.86);
    return facePoint(k, su, sv, 0.04 + hash21(seed[0], extra) * 0.06);
  }

  const span = CUBE_H * 1.56;
  return [
    (seed[0] - 0.5) * span + Math.sin(t * 0.16 + seed[1] * TAU) * 0.1,
    (seed[1] - 0.5) * span + Math.cos(t * 0.13 + seed[0] * TAU) * 0.1,
    (hash21(seed[0], seed[1]) - 0.5) * span,
  ];
}
