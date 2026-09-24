/**
 * The Operational Signal.
 *
 * One point field carries the whole narrative. It never decorates: each
 * formation is a claim about how a business technology environment changes
 * once somebody takes ownership of it.
 *
 * The formation maths lives twice — once here in TypeScript for the static
 * poster that mobile and no-WebGL clients get, and once in GLSL in
 * ./shader.ts for the live field. The two must stay in step; if you change a
 * formation, change both.
 */

export const PHASES = [
  "unmanaged",
  "discovery",
  "ownership",
  "security",
  "industries",
  "response",
  "strategy",
] as const;

export type Phase = (typeof PHASES)[number];

export const PHASE_INDEX = Object.fromEntries(
  PHASES.map((p, i) => [p, i]),
) as Record<Phase, number>;

export const MAX_PHASE = PHASES.length - 1;

/** What each formation is saying, for the poster's accessible description. */
export const PHASE_CAPTION: Record<Phase, string> = {
  unmanaged: "An unstructured field of drifting, unmonitored endpoints.",
  discovery: "The same endpoints resolved onto a regular lattice.",
  ownership:
    "Three coverage rings. The lit ring holds the devices that tier covers.",
  security: "A perimeter closed around the environment.",
  industries:
    "Six industry marks — scales, umbrella, cross, crane, gear, and rising bars — each in its own cloud, set to the right of the names.",
  response: "The disc is whole. A sphere sits in the middle, and the sheet sags there.",
  strategy: "An unstructured field of drifting, unmonitored endpoints.",
};

/** Still descriptions for the six strategy-row pictures. */
export const SERVICE_CAPTION = [
  "One tended cluster turning in a slow orbit.",
  "A closed shell, with no scanning beam.",
  "Three planes of infrastructure, lifted apart.",
  "A desk phone on its cradle, rotary dial forward, cord coiled to the side.",
  "A row of vertical racks.",
  "An open laptop, a tower, and a monitor.",
] as const;

const TAU = Math.PI * 2;

/**
 * Lattice coordinates run 0..1, including both edges, so a grid still meets
 * its frame. On a closed loop those two columns are the same angle and draw
 * a bright seam. This folds the last column to just before the first.
 */
function loop(t: number, n: number) {
  return t * ((n - 1) / Math.max(n, 1)) * TAU;
}

/** How many columns and rows `buildSeeds` lays down for a point count. */
export function latticeSize(count: number) {
  const cols = Math.max(2, Math.round(Math.sqrt((count * 26) / 14)));
  const rows = Math.max(2, Math.floor(count / cols));
  return { cols, rows };
}

/**
 * The six industry clouds travel a sideways oval in the open field.
 * The left edge stays near world x 0.6 so the clouds clear the names.
 * Keep the centre and both radii in step with the GLSL.
 */
export const CLUSTER_CX = 4.2;
export const CLUSTER_CY = 0.2;
export const CLUSTER_RX = 5.8;
export const CLUSTER_RY = 4.3;
/** Radians per second. The six clouds travel around the oval. */
export const CLUSTER_ORBIT = 0.18;
/** Radians per second. The orbs turn inside each cloud. */
export const HALO_ORBIT = 0.62;
/** Share of each cloud's halo that sits on the oval between the clouds. */
export const TRAIL_SHARE = 0.1;

export function clusterCenter(k: number, t = 0): [number, number] {
  const a = (k / 6) * TAU - Math.PI / 2 + t * CLUSTER_ORBIT;
  return [CLUSTER_CX + Math.cos(a) * CLUSTER_RX, CLUSTER_CY + Math.sin(a) * CLUSTER_RY];
}

function yawAboutY(p: Vec3, spin: number): Vec3 {
  const c = Math.cos(spin);
  const s = Math.sin(spin);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}

/**
 * Rectangle outline in the XY plane. `along` walks the four edges, `inset`
 * thickens the stroke toward the centre. Twin of `rectFrame()` in shader.ts.
 */
function rectFrame(
  along: number,
  inset: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  z: number,
  thick: number,
): Vec3 {
  const w = Math.max(x1 - x0, 0.001);
  const h = Math.max(y1 - y0, 0.001);
  const edge = Math.min(3, Math.floor(along * 4));
  const t = fract(along * 4);
  const m = inset * thick;
  const spanW = w - 2 * m;
  const spanH = h - 2 * m;
  if (edge <= 0) return [x0 + m + t * spanW, y0 + m, z];
  if (edge === 1) return [x1 - m, y0 + m + t * spanH, z];
  if (edge === 2) return [x1 - m - t * spanW, y1 - m, z];
  return [x0 + m, y1 - m - t * spanH, z];
}

/**
 * Frame of one face of a box. `plane` 0 is the front (XY), 1 a side (ZY),
 * 2 the top (XZ). Twin of `faceFrame()` in shader.ts.
 */
function faceFrame(
  along: number,
  inset: number,
  u0: number,
  u1: number,
  v0: number,
  v1: number,
  fixed: number,
  plane: number,
  thick: number,
): Vec3 {
  const f = rectFrame(along, inset, u0, v0, u1, v1, fixed, thick);
  if (plane === 1) return [f[2], f[1], f[0]];
  if (plane === 2) return [f[0], f[2], f[1]];
  return f;
}

/**
 * Stand neck. A straight vertical bar, the same weight as the bezel,
 * without the bright clumps a round tube makes. Twin of `standNeck()`.
 */
function standNeck(x: number, y0: number, y1: number, along: number, across: number): Vec3 {
  const t = Math.min(1, Math.max(0, along));
  return [x + (across - 0.5) * 0.11, y0 + (y1 - y0) * t, 0];
}

/** Straight bar along X. `along` and `across` are independent, so it cannot twist. */
function barX(
  x0: number,
  x1: number,
  y: number,
  z: number,
  along: number,
  across: number,
  width: number,
): Vec3 {
  const t = Math.min(1, Math.max(0, along));
  return [x0 + (x1 - x0) * t, y + (across - 0.5) * width, z];
}

/** Straight bar along Y. Twin of `barY()` in shader.ts. */
function barY(
  x: number,
  y0: number,
  y1: number,
  z: number,
  along: number,
  across: number,
  width: number,
): Vec3 {
  const t = Math.min(1, Math.max(0, along));
  return [x + (across - 0.5) * width, y0 + (y1 - y0) * t, z];
}

/**
 * Point-built machines that ride the lit ownership ring.
 * Kind 0 is a desktop monitor, 1 a server, 2 a workstation.
 * Each is a box with a front, sides, and a top, so a turn shows depth.
 * Keep in step with `deviceLocal()` in shader.ts.
 * Returns null when this point stays on the ring.
 */
function deviceLocal(kind: number, seed: Vec3): Vec3 {
  const part = fract(seed[0] * 4.17);
  const u = seed[1];
  const v = seed[2];

  if (kind <= 0) {
    if (part < 0.22) return faceFrame(u, v, -0.92, 0.92, 0.02, 1.32, 0.36, 0, 0.09);
    if (part < 0.36) return faceFrame(u, v, -0.68, 0.68, 0.22, 1.12, 0.4, 0, 0.045);
    if (part < 0.5) return faceFrame(u, v, -0.86, 0.86, 0.08, 1.26, -0.36, 0, 0.07);
    if (part < 0.68) {
      const side = u < 0.5 ? -0.92 : 0.92;
      return faceFrame(fract(u * 2), v, -0.36, 0.36, 0.02, 1.32, side, 1, 0.06);
    }
    if (part < 0.8) return faceFrame(u, v, -0.92, 0.92, -0.36, 0.36, 1.32, 2, 0.06);
    if (part < 0.88) return standNeck(0, 0.02, -0.42, u, v);
    return faceFrame(u, v, -0.64, 0.64, -0.38, 0.38, -0.5, 2, 0.05);
  }
  if (kind === 1) {
    if (part < 0.18) return faceFrame(u, v, -0.5, 0.5, -1.22, 1.24, 0.68, 0, 0.07);
    if (part < 0.4) {
      const bay = Math.min(5, Math.floor(u * 6));
      return [(v - 0.5) * 0.78, -0.92 + bay * 0.36, 0.72];
    }
    if (part < 0.58) return faceFrame(u, v, -0.68, 0.68, -1.22, 1.24, 0.5, 1, 0.06);
    if (part < 0.74) return faceFrame(u, v, -0.68, 0.68, -1.22, 1.24, -0.5, 1, 0.06);
    if (part < 0.88) return faceFrame(u, v, -0.5, 0.5, -0.68, 0.68, 1.24, 2, 0.055);
    return faceFrame(u, v, -0.44, 0.44, -1.16, 1.18, -0.68, 0, 0.06);
  }
  if (part < 0.14) return faceFrame(u, v, -1.2, -0.12, 0.12, 1.22, 0.28, 0, 0.07);
  if (part < 0.24) return faceFrame(u, v, -0.28, 0.28, 0.12, 1.22, -1.2, 1, 0.05);
  if (part < 0.32) return faceFrame(u, v, -1.2, -0.12, -0.28, 0.28, 1.22, 2, 0.05);
  if (part < 0.46) return faceFrame(u, v, 0.18, 0.95, -0.7, 1.28, 0.48, 0, 0.06);
  if (part < 0.6) {
    const bay = Math.min(3, Math.floor(u * 4));
    return [0.28 + v * 0.55, -0.42 + bay * 0.4, 0.52];
  }
  if (part < 0.74) return faceFrame(u, v, -0.48, 0.48, -0.7, 1.28, 0.95, 1, 0.05);
  if (part < 0.82) return faceFrame(u, v, 0.18, 0.95, -0.48, 0.48, 1.28, 2, 0.05);
  if (part < 0.88) return standNeck(-0.62, 0.12, -0.5, u, v);
  return [-1.2 + u * 1.16, -0.5, -0.42 + v * 0.84];
}

function placeDevice(
  tier: number,
  slot: number,
  count: number,
  kind: number,
  seed: Vec3,
  t: number,
): Vec3 {
  const ring = 2.2 + tier * 1.75;
  const spin = t * (0.05 + tier * 0.02);
  const a = (slot / count) * TAU + tier * 0.55 + spin;
  const inset = 0.7 + fract(slot * 0.37 + tier * 0.2) * 0.08;
  const cx = Math.cos(a) * ring * 1.8 * inset;
  const cy = Math.sin(a) * ring * inset;
  const local = deviceLocal(kind, seed);
  const scale = 0.48 + tier * 0.04;
  const yaw = a + 0.85;
  const pitch = 0.4;
  const x = local[0] * scale;
  let y = local[1] * scale;
  let z = local[2] * scale;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const y2 = y * cp - z * sp;
  const z2 = y * sp + z * cp;
  y = y2;
  z = z2;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return [cx + x * c + z * s, cy + y, -x * s + z * c];
}

export function ownershipDevice(tier: number, p: PointSeed, time = 0): Vec3 | null {
  if (fract(p.rand * 19.1) > 0.2) return null;
  const f = fract(p.rand * 13.7);
  const t = Math.min(2, Math.max(0, tier));
  let count = 3;
  let slot = 0;
  let kind = 0;
  if (t <= 0) {
    slot = Math.min(2, Math.floor(f * 3));
  } else if (t === 1) {
    count = 5;
    slot = Math.min(4, Math.floor(f * 5));
    kind = slot === 0 ? 1 : 0;
  } else {
    count = 7;
    slot = Math.min(6, Math.floor(f * 7));
    kind = slot <= 2 ? 1 : 2;
  }
  return placeDevice(t, slot, count, kind, p.seed, time);
}

/**
 * Rotary desk phone, in the pose of the reference: low base, handset across
 * the cradle, dial on the front, coil leaving the left earpiece.
 * Twin of `phoneLocal()` in shader.ts.
 */
function phoneLocal(seed: Vec3): Vec3 {
  const part = fract(seed[0] * 6.4);
  const sub = fract(seed[0] * 17.3);
  const u = seed[1];
  const v = seed[2];
  const spin = v * TAU * 0.992;

  if (part < 0.16) {
    if (sub < 0.18) return faceFrame(u, v, -2.6, 2.6, -2.15, -1.2, 1.55, 0, 0.07);
    if (sub < 0.36) return faceFrame(u, v, -2.6, 2.6, -2.15, -1.2, -1.45, 0, 0.07);
    if (sub < 0.5) return faceFrame(u, v, -1.45, 1.55, -2.15, -1.2, -2.6, 1, 0.06);
    if (sub < 0.64) return faceFrame(u, v, -1.45, 1.55, -2.15, -1.2, 2.6, 1, 0.06);
    if (sub < 0.84) return faceFrame(u, v, -2.6, 2.6, -1.45, 1.55, -1.2, 2, 0.06);
    return faceFrame(u, v, -2.6, 2.6, -1.45, 1.55, -2.15, 2, 0.05);
  }
  if (part < 0.3) {
    if (sub < 0.4) return faceFrame(u, v, -1.35, 1.35, -1.15, 0.4, 1.62, 0, 0.06);
    if (sub < 0.62) return faceFrame(u, v, -1.5, 1.5, -0.75, 0.8, 0.62, 2, 0.055);
    const c = Math.min(3, Math.floor(u * 4));
    const left = c < 2;
    const back = c % 2 === 0;
    const t = v;
    return [
      (left ? -2.15 : 2.15) + ((left ? -1.5 : 1.5) - (left ? -2.15 : 2.15)) * t,
      -1.2 + 1.82 * t,
      (back ? -1.2 : 1.45) + ((back ? -0.75 : 0.8) - (back ? -1.2 : 1.45)) * t,
    ];
  }
  if (part < 0.48) {
    if (sub < 0.28) {
      const r = 0.42 + u * 0.28;
      return [-2.15 + Math.cos(spin) * r, 1.2 + Math.sin(spin) * r * 0.75, 0.1];
    }
    if (sub < 0.54) {
      const r = 0.38 + u * 0.24;
      return [2.15 + Math.cos(spin) * r, 1.12 + Math.sin(spin) * r * 0.7, 0.1];
    }
    const x = -1.75 + u * 3.5;
    const arch = Math.sin(u * Math.PI) * 0.38;
    const w = (v - 0.5) * 0.32;
    return [x, 1.28 + arch + w * 0.35, w];
  }
  if (part < 0.68) {
    const cx = 0.05;
    const cy = -0.42;
    const cz = 1.72;
    if (sub < 0.32) {
      const r = 1.05 + (u - 0.5) * 0.1;
      return [cx + Math.cos(spin) * r, cy + Math.sin(spin) * r, cz];
    }
    if (sub < 0.48) {
      const r = 0.32 + u * 0.12;
      return [cx + Math.cos(spin) * r, cy + Math.sin(spin) * r, cz + 0.05];
    }
    if (sub < 0.9) {
      const hole = Math.min(9, Math.floor(u * 10));
      const a0 = -1.15 + (hole / 10) * 5.1;
      const rr = 0.1 + v * 0.06;
      return [
        cx + Math.cos(a0) * 0.66 + Math.cos(spin) * rr,
        cy + Math.sin(a0) * 0.66 + Math.sin(spin) * rr,
        cz + 0.06,
      ];
    }
    const stop = -0.7 + u * 0.55;
    return [cx + Math.cos(stop) * (0.85 + v * 0.28), cy + Math.sin(stop) * (0.85 + v * 0.28), cz + 0.06];
  }
  if (part < 0.76) {
    const side = u < 0.5 ? -1.55 : 1.6;
    return [side + (fract(u * 2) - 0.5) * 0.12, 0.55 + v * 0.78, 0.02];
  }
  // Coil in the plane we see: round loops along a cord that leaves the left earpiece.
  const uu = Math.min(1, Math.max(0, (u - 0.05) / 0.95));
  const turns = 11;
  const a = uu * turns * TAU;
  const rad = 0.4;
  const x0 = -2.2;
  const y0 = 1.15;
  const x1 = -6.5;
  const y1 = -1.55;
  const cx = x0 + (x1 - x0) * uu;
  const cy = y0 + (y1 - y0) * uu;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  return [cx + Math.cos(a) * px * rad, cy + Math.cos(a) * py * rad, 0.2 + Math.sin(a) * rad * 0.75];
}

/** Open laptop, tower, or monitor. Local offset, centred on the piece. */
function hardwareLocal(which: number, seed: Vec3): Vec3 {
  const part = fract(seed[0] * 4.17);
  const u = seed[1];
  const v = seed[2];
  // Same weight on the hinge, the neck, and the foot.
  const w = 0.16;
  if (which <= 0) {
    if (part < 0.32) {
      const deck = rectFrame(u, v, -1.55, -0.1, 1.55, 1.55, 0, 0.09);
      return [deck[0], -1.05, deck[1]];
    }
    if (part < 0.48) {
      const col = Math.min(7, Math.floor(u * 8));
      const row = Math.min(3, Math.floor(v * 4));
      return [-1.22 + col * 0.34, -0.96, 0.08 + row * 0.32];
    }
    if (part < 0.92) {
      const frame = rectFrame(u, v, -1.45, 0.02, 1.45, 2.35, 0, 0.1);
      const sy = frame[1];
      return [frame[0], -0.98 + sy * 1.08, -0.12 - sy * 0.28];
    }
    return barX(-1.45, 1.45, -0.98, -0.14, u, v, w);
  }
  if (which === 1) {
    if (part < 0.28) return rectFrame(u, v, -0.62, -1.85, 0.62, 1.9, 0.34, 0.08);
    if (part < 0.46) {
      const corner = Math.min(3, Math.floor(u * 4));
      const sx = corner < 2 ? -0.62 : 0.62;
      const sz = corner % 2 === 0 ? -0.32 : 0.34;
      return [sx, -1.85 + v * 3.75, sz];
    }
    if (part < 0.9) {
      const bay = Math.min(6, Math.floor(u * 7));
      return [(v - 0.5) * 0.96, -1.48 + bay * 0.46, 0.4];
    }
    return [(u - 0.5) * 1.24, 1.9, (v - 0.5) * 0.56];
  }
  if (part < 0.6) return rectFrame(u, v, -1.6, 0.05, 1.6, 2.15, 0, 0.1);
  if (part < 0.78) return barY(0, 0.05, -0.72, 0, u, v, w);
  return barX(-0.85, 0.85, -0.8, 0, u, v, w);
}

/**
 * One strategy-row picture. These are not chapter formations: opening a
 * row must not move the chapter phase. Twin of `serviceAt()` in shader.ts.
 */
export function serviceFormation(scene: number, p: PointSeed, t = 0): Vec3 {
  const { seed, u, v, rand } = p;

  if (scene <= 0) {
    // CompleteCare — one tended cluster in a slow orbit.
    const a = loop(u, p.cols) + t * 0.15;
    const r = 1.2 + Math.pow(rand, 0.6) * 2.4;
    return [Math.cos(a) * r * 1.25, Math.sin(a) * r, (seed[2] - 0.5) * 1.1];
  }
  if (scene === 1) {
    // Cybersecurity — a closed shell, no beam.
    const a = loop(u, p.cols) + t * 0.04;
    const b = loop(v, p.rows);
    const R = 4.1;
    const tubeR = 0.62;
    const ring = R + tubeR * Math.cos(b);
    return [ring * Math.cos(a), ring * Math.sin(a) * 0.72, tubeR * Math.sin(b)];
  }
  if (scene === 2) {
    // Cloud — three lifted planes.
    const layer = Math.min(2, Math.floor(rand * 3));
    return [
      (u - 0.5) * 11,
      (v - 0.5) * 3.1 + (layer - 1) * 2.35,
      layer * 1.5,
    ];
  }
  if (scene === 3) {
    // VoIP — the desk phone from the reference, turned a little so the dial faces us.
    if (fract(rand * 13.7) > 0.5) return [0, -40, 0];
    const local = phoneLocal(seed);
    const yaw = -0.58 + Math.sin(t * 0.4) * 0.1;
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);
    return [1.5 + local[0] * c + local[2] * s, local[1] - 0.1, -local[0] * s + local[2] * c];
  }
  if (scene === 4) {
    // Data center — vertical racks.
    const rack = Math.min(4, Math.floor(rand * 5));
    const x = (rack - 2) * 1.55;
    return [x + (seed[0] - 0.5) * 0.42, (v - 0.5) * 6.6, (seed[2] - 0.5) * 0.65];
  }
  // Hardware — an open laptop, a tower, and a monitor.
  const which = Math.min(2, Math.floor(rand * 3));
  const x = (which - 1) * 5.2;
  if (fract(rand * 19.1) > 0.36) return [x, -40, 0];
  const local = hardwareLocal(which, seed);
  const yaw = which === 1 ? 0.42 : which === 2 ? -0.2 : 0.62;
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return [x + local[0] * c + local[2] * s, local[1], -local[0] * s + local[2] * c];
}

/**
 * Industry marks. Keep every constant in step with `glyph()` in shader.ts.
 * `seed.z < ICON_CUT` builds the mark; the rest is the surrounding field.
 * `extra` is fract(rand * 6), a third uniform that is not seed.z (seed.z is
 * the role split and is biased once the cut is applied).
 */
const ICON_CUT = 0.34;
/** Mark size inside the cloud. Large enough to read as the industry. */
const MARK_SCALE = 0.62;
/** Outer radius of the industry cloud. Keep in step with the GLSL halo. */
const SPHERE_OUTER = 2.5;

function fract(n: number) {
  return n - Math.floor(n);
}

function hash21(x: number, y: number) {
  const n = fract(x * 12.9898 + y * 78.233);
  return fract(n * n * 45.233);
}

function tube(a: Vec3, b: Vec3, along: number, ang: number, rad: number): Vec3 {
  const dir: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const t = Math.min(1, Math.max(0, along));
  const p: Vec3 = [a[0] + dir[0] * t, a[1] + dir[1] * t, a[2] + dir[2] * t];
  const dlen = Math.hypot(dir[0], dir[1], dir[2]);
  const nDir: Vec3 =
    dlen > 1e-4
      ? [dir[0] / dlen, dir[1] / dlen, dir[2] / dlen]
      : [0, 1, 0];
  const up: Vec3 = Math.abs(nDir[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const side: Vec3 = [
    nDir[1] * up[2] - nDir[2] * up[1],
    nDir[2] * up[0] - nDir[0] * up[2],
    nDir[0] * up[1] - nDir[1] * up[0],
  ];
  const sl = Math.hypot(side[0], side[1], side[2]) || 1;
  side[0] /= sl;
  side[1] /= sl;
  side[2] /= sl;
  const bin: Vec3 = [
    nDir[1] * side[2] - nDir[2] * side[1],
    nDir[2] * side[0] - nDir[0] * side[2],
    nDir[0] * side[1] - nDir[1] * side[0],
  ];
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return [
    p[0] + (side[0] * c + bin[0] * s) * rad,
    p[1] + (side[1] * c + bin[1] * s) * rad,
    p[2] + (side[2] * c + bin[2] * s) * rad,
  ];
}

/** Hemispherical bowl, opening upward. `phi` 0 is the rim, π/2 is the bottom. */
function bowl(cx: number, rimY: number, along: number, ang: number, fill: number): Vec3 {
  const phi = along * (Math.PI / 2);
  const shell = 0.32 + fill * 0.12;
  const horiz = Math.cos(phi) * shell;
  return [
    cx + Math.cos(ang) * horiz,
    rimY - Math.sin(phi) * shell,
    Math.sin(ang) * horiz,
  ];
}

/** Local offset of one orb inside an industry mark. */
function industryGlyph(k: number, seed: Vec3, extra: number): Vec3 {
  const along = seed[0];
  const ang = seed[1] * TAU;
  const fill = Math.sqrt(hash21(seed[0], seed[1]));

  if (k === 0) {
    // Legal — a standing balance. Foot, post, beam, hangers, two bowls.
    if (extra < 0.1) return tube([0, -1.08, 0], [0, -0.9, 0], along, ang, 0.1 + fill * 0.22);
    if (extra < 0.3) return tube([0, -0.9, 0], [0, 0.5, 0], along, ang, fill * 0.13);
    if (extra < 0.48) return tube([-0.92, 0.5, 0], [0.92, 0.5, 0], along, ang, fill * 0.11);
    if (extra < 0.55) return tube([-0.66, 0.5, 0], [-0.66, 0.02, 0], along, ang, fill * 0.05);
    if (extra < 0.62) return tube([0.66, 0.5, 0], [0.66, 0.02, 0], along, ang, fill * 0.05);
    return bowl(extra < 0.81 ? -0.66 : 0.66, 0.0, along, ang, fill);
  }

  if (k === 1) {
    // Insurance — a dome, a shaft, and a cane crook. The crook leaves
    // the shaft to the right and the tip comes back up.
    if (extra < 0.55) {
      const phi = along * (Math.PI / 2);
      const shell = 0.86 + fill * 0.14;
      const horiz = Math.sin(phi) * shell;
      return [Math.cos(ang) * horiz, Math.cos(phi) * shell * 0.88 + 0.12, Math.sin(ang) * horiz];
    }
    if (extra < 0.76) return tube([0, 0.55, 0], [0, -0.92, 0], along, ang, fill * 0.09);
    const sweep = Math.PI * 1.2;
    const a = along * sweep;
    const crook = 0.36;
    const hx = (1 - Math.cos(a)) * crook;
    const hy = -0.92 - Math.sin(a) * crook;
    const thick = 0.045 + fill * 0.04;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    return [hx + Math.cos(a) * c * thick, hy + Math.sin(a) * c * thick, s * thick];
  }

  if (k === 2) {
    // Healthcare — two round bars. Vertical arms stop at the bar
    // so the centre is not sampled twice.
    const rad = 0.16 + fill * 0.18;
    if (extra < 0.5) return tube([-0.95, 0, 0], [0.95, 0, 0], along, ang, rad);
    if (along < 0.5) return tube([0, -0.95, 0], [0, -0.32, 0], along * 2, ang, rad);
    return tube([0, 0.32, 0], [0, 0.95, 0], (along - 0.5) * 2, ang, rad);
  }

  if (k === 3) {
    // Construction — solid mast and jib, thin cable, a small hook.
    if (extra < 0.32) return tube([-0.52, -1.02, 0], [-0.52, 0.92, 0], along, ang, 0.08 + fill * 0.14);
    if (extra < 0.6) return tube([-0.52, 0.84, 0], [1.05, 0.64, 0], along, ang, 0.06 + fill * 0.12);
    if (extra < 0.72) return tube([-0.52, 0.84, 0], [-1.02, 0.72, 0], along, ang, 0.06 + fill * 0.12);
    if (extra < 0.9) return tube([0.7, 0.7, 0], [0.7, -0.05, 0], along, ang, fill * 0.05);
    const rr = fill * 0.14;
    return [0.7 + Math.cos(ang) * rr, -0.16 - Math.abs(Math.sin(ang)) * rr, (hash21(along, extra) - 0.5) * 0.16];
  }

  if (k === 4) {
    // Manufacturing — a thick gear, not a flat washer.
    const z = (hash21(seed[0], extra) - 0.5) * 0.62;
    if (extra < 0.52) {
      const a = along * TAU;
      const r = 0.4 + fill * 0.3;
      return [Math.cos(a) * r, Math.sin(a) * r, z];
    }
    const tooth = Math.min(7, Math.floor(along * 8));
    const a = ((tooth + 0.5) / 8) * TAU;
    const r = 0.68 + fract(along * 8) * 0.4;
    const w = (hash21(extra, seed[1]) - 0.5) * 0.28;
    return [Math.cos(a) * r - Math.sin(a) * w, Math.sin(a) * r + Math.cos(a) * w, z];
  }

  // Private equity — three rising boxes.
  const bar = Math.min(2, Math.floor(extra * 3));
  const h = 0.62 + bar * 0.48;
  const jx = (hash21(seed[0], extra) - 0.5) * 0.38;
  const jz = (hash21(seed[1], extra) - 0.5) * 0.55;
  return [(bar - 1) * 0.78 + jx, -0.72 + along * h, jz];
}

/**
 * Spherical cloud around the mark. Radius is biased inward (exponent above
 * 1/3) so the middle is dense and the rim is a sparse dusting.
 */
function industryHalo(seed: Vec3): Vec3 {
  const hz = (seed[2] - ICON_CUT) / (1 - ICON_CUT);
  const az = seed[0] * TAU;
  const cosP = hz * 2 - 1;
  const sinP = Math.sqrt(Math.max(0, 1 - cosP * cosP));
  const R = SPHERE_OUTER * Math.pow(seed[1], 0.72);
  return [Math.cos(az) * sinP * R, cosP * R, Math.sin(az) * sinP * R];
}

export type Vec3 = [number, number, number];

/** Deterministic PRNG so the poster and the live field agree. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type PointSeed = {
  /** Three independent randoms, used for volume placement and jitter. */
  seed: Vec3;
  /** Lattice coordinates in [0,1], including both edges. */
  u: number;
  v: number;
  /** Column and row counts for this seed set. Shared by every point. */
  cols: number;
  rows: number;
  /** One more random, used for tier, cluster and ring membership. */
  rand: number;
  /** Accent membership, kept independent of `rand` so the accent does not
   *  correlate with cluster or tier selection. */
  gold: number;
};

export function buildSeeds(count: number, seedValue = 0x4e05): PointSeed[] {
  const rnd = mulberry32(seedValue);
  // A complete rectangle, including both edges. A short final row would stop
  // the top line of the discovery lattice before the right edge. Spare points
  // are scattered, so they do not pile onto the first row.
  const { cols, rows } = latticeSize(count);
  const cells = cols * rows;
  const out: PointSeed[] = [];
  for (let i = 0; i < count; i++) {
    const j = (i * 13) % cells;
    out.push({
      seed: [rnd(), rnd(), rnd()],
      u: (j % cols) / (cols - 1),
      v: Math.floor(j / cols) / (rows - 1),
      cols,
      rows,
      rand: rnd(),
      gold: rnd(),
    });
  }
  return out;
}

/**
 * Position of one point in one formation. Mirrors `formation()` in the
 * vertex shader. `t` is elapsed seconds; pass 0 for a still frame.
 */
export function formation(phase: number, p: PointSeed, t = 0): Vec3 {
  const { seed, u, v, rand } = p;

  switch (phase) {
    case 0: {
      // Unmanaged: an unstructured cloud with slow, aimless drift.
      return [
        (seed[0] - 0.5) * 30 + Math.sin(t * 0.18 + seed[1] * TAU) * 0.9,
        (seed[1] - 0.5) * 17 + Math.cos(t * 0.15 + seed[2] * TAU) * 0.7,
        (seed[2] - 0.5) * 12,
      ];
    }
    case 1: {
      // Discovery: the cloud resolves onto a regular lattice.
      return [
        (u - 0.5) * 26,
        (v - 0.5) * 13.6,
        Math.sin(u * 7 + t * 0.35) * 0.55,
      ];
    }
    case 2: {
      // Ownership: three concentric tiers — Base, Pro, Premium.
      // The still shows the Base devices already settled. The live field
      // drops the lit tier's devices in from above.
      const tier = Math.floor(rand * 3);
      if (tier === 0) {
        const dev = ownershipDevice(0, p, t);
        if (dev) return dev;
      }
      const r = 2.2 + tier * 1.75 + (seed[2] - 0.5) * 0.3;
      const a = loop(u, p.cols) + tier * 0.6 + t * (0.05 + tier * 0.02);
      return [Math.cos(a) * r * 1.8, Math.sin(a) * r, (seed[0] - 0.5) * 0.8];
    }
    case 3: {
      // Security: a perimeter closes around the interior.
      const onRing = rand >= 0.3;
      const a = loop(u, p.cols) + t * 0.06;
      const r = onRing
        ? 6.4 + (seed[1] - 0.5) * 0.28
        : Math.sqrt(seed[0]) * 5.9;
      return [Math.cos(a) * r * 1.8, Math.sin(a) * r, (seed[2] - 0.5) * 0.7];
    }
    case 4: {
      // Industries: six marks, each in a cloud. The clouds travel a
      // sideways oval, and the orbs turn inside each cloud. A thin share
      // of the halo sits on the oval between the clouds.
      const k = Math.min(5, Math.floor(rand * 6));
      const a = (k / 6) * TAU - Math.PI / 2 + t * CLUSTER_ORBIT;
      const onTrail = seed[2] >= ICON_CUT && fract(seed[0] * 17.13) < TRAIL_SHARE;
      if (onTrail) {
        const along = 0.32 + fract(seed[1] * 13.1) * 0.36;
        const trailA = a + along * (TAU / 6);
        const jitter = (fract(seed[0] * 7.7) - 0.5) * 0.55;
        return [
          CLUSTER_CX + Math.cos(trailA) * (CLUSTER_RX + jitter),
          CLUSTER_CY + Math.sin(trailA) * (CLUSTER_RY + jitter * 0.35),
          (seed[2] - 0.5) * 0.35,
        ];
      }
      const extra = fract(rand * 6);
      const mark = industryGlyph(k, seed, extra);
      let local: Vec3 =
        seed[2] < ICON_CUT
          ? [mark[0] * MARK_SCALE, mark[1] * MARK_SCALE, mark[2] * MARK_SCALE]
          : industryHalo(seed);
      if (seed[2] >= ICON_CUT) local = yawAboutY(local, t * HALO_ORBIT);
      return [
        CLUSTER_CX + Math.cos(a) * CLUSTER_RX + local[0],
        CLUSTER_CY + Math.sin(a) * CLUSTER_RY + local[1],
        local[2],
      ];
    }
    case 5: {
      // Response: the filled disc stays flat past the middle. Only the
      // neighbourhood of the sphere sags. Spokes meet at the bottom.
      if (rand < 0.04) {
        const az = seed[0] * TAU;
        const cosP = seed[1] * 2 - 1;
        const sinP = Math.sqrt(Math.max(0, 1 - cosP * cosP));
        const R = 0.55 * Math.pow(seed[2], 0.7);
        return [Math.cos(az) * sinP * R, cosP * R, Math.sin(az) * sinP * R];
      }
      let a = loop(u, p.cols) + t * 0.015;
      let rad = Math.sqrt(seed[0]) * 6.5;
      if (fract(rand * 7.13) < 0.22) {
        const spoke = fract(rand * 3.1) >= 0.5;
        const ring = Math.min(9, Math.floor(seed[1] * 10));
        const ringR = 1.15 + ring * 0.55;
        const spokeR = seed[0] * 6.48;
        const keep = spoke ? 0.5 + 0.5 * (spokeR / 6.48) : 0.55 + 0.45 * (ringR / 6.1);
        if (fract(seed[2] * 13.7) <= keep) {
          if (spoke) {
            const spk = Math.min(11, Math.floor(seed[1] * 12));
            a = (spk / 12) * TAU + t * 0.015;
            rad = spokeR;
          } else {
            rad = ringR;
          }
        }
      }
      const well = 1.7 * Math.exp(-(rad * rad) / 1.5);
      return [
        Math.cos(a) * rad * 1.55,
        Math.sin(a) * rad - well,
        (seed[2] - 0.5) * 0.28 - well * 0.45,
      ];
    }
    default: {
      // Strategy pages use the same drifting cloud as Unmanaged.
      return [
        (seed[0] - 0.5) * 30 + Math.sin(t * 0.18 + seed[1] * TAU) * 0.9,
        (seed[1] - 0.5) * 17 + Math.cos(t * 0.15 + seed[2] * TAU) * 0.7,
        (seed[2] - 0.5) * 12,
      ];
    }
  }
}
