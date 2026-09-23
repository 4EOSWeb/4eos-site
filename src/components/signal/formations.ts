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
  response: "A pulse that leaves the centre and dies before it reaches the inbox.",
  strategy: "The field leaning forward onto a receding horizon.",
};

/** Still descriptions for the six strategy-row pictures. */
export const SERVICE_CAPTION = [
  "One tended cluster turning in a slow orbit.",
  "A closed shell, with no scanning beam.",
  "Three planes of infrastructure, lifted apart.",
  "A handset lifted off its cradle, with a call traveling outward.",
  "A row of vertical racks.",
  "An open laptop, a tower, and a monitor.",
] as const;

const TAU = Math.PI * 2;

/**
 * The six industry clouds sit in the open space to the right of the names.
 * Keep the centre and radius in step with the GLSL.
 */
export const CLUSTER_CX = 4.2;
export const CLUSTER_CY = 0.2;
export const CLUSTER_R = 3.4;

export function clusterCenter(k: number): [number, number] {
  const a = (k / 6) * TAU - Math.PI / 2;
  return [CLUSTER_CX + Math.cos(a) * CLUSTER_R, CLUSTER_CY + Math.sin(a) * CLUSTER_R];
}

/**
 * Rectangle outline in the XY plane. Points sit on the centreline, spaced
 * in equal steps, so a stroke stays a straight line of even weight.
 * Twin of `rectFrame()` in shader.ts.
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
  const t = fract(along * 4) + inset * thick * 0;
  if (edge <= 0) return [x0 + t * w, y0, z];
  if (edge === 1) return [x1, y0 + t * h, z];
  if (edge === 2) return [x1 - t * w, y1, z];
  return [x0, y1 - t * h, z];
}

/** Twelve edges of a box. Each edge is drawn once. Twin of `boxWire()`. */
function boxWire(
  along: number,
  jitter: number,
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
): Vec3 {
  const edge = Math.min(11, Math.floor(fract(along) * 12));
  const t = 0.06 + fract(jitter) * 0.88;
  const x = x0 + (x1 - x0) * t;
  const y = y0 + (y1 - y0) * t;
  const z = z0 + (z1 - z0) * t;
  if (edge === 0) return [x, y0, z0];
  if (edge === 1) return [x, y0, z1];
  if (edge === 2) return [x, y1, z0];
  if (edge === 3) return [x, y1, z1];
  if (edge === 4) return [x0, y0, z];
  if (edge === 5) return [x1, y0, z];
  if (edge === 6) return [x0, y1, z];
  if (edge === 7) return [x1, y1, z];
  if (edge === 8) return [x0, y, z0];
  if (edge === 9) return [x1, y, z0];
  if (edge === 10) return [x0, y, z1];
  return [x1, y, z1];
}

/** Evenly spaced points on one straight segment. Twin of `rule()`. */
function rule(a: Vec3, b: Vec3, along: number): Vec3 {
  const t = 0.04 + Math.min(1, Math.max(0, along)) * 0.92;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
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
    if (part < 0.74) return boxWire(u, v, -0.9, 0.04, -0.3, 0.9, 1.28, 0.3);
    if (part < 0.88) return rule([0, 0.04, 0], [0, -0.42, 0], u);
    return rule([-0.56, -0.48, 0], [0.56, -0.48, 0], u);
  }
  if (kind === 1) {
    if (part < 0.62) return boxWire(u, v, -0.46, -1.16, -0.58, 0.46, 1.2, 0.58);
    const bay = Math.min(5, Math.floor(u * 6));
    return rule([-0.34, -0.9 + bay * 0.34, 0.58], [0.34, -0.9 + bay * 0.34, 0.58], v);
  }
  if (part < 0.4) return boxWire(u, v, -1.15, 0.1, -0.24, -0.08, 1.2, 0.24);
  if (part < 0.78) return boxWire(u, v, 0.16, -0.66, -0.42, 0.9, 1.24, 0.42);
  if (part < 0.9) return rule([-0.62, 0.1, 0], [-0.62, -0.36, 0], u);
  return rule([-1.0, -0.42, 0], [-0.22, -0.42, 0], u);
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
  const inset = 0.84 + fract(slot * 0.37 + tier * 0.2) * 0.1;
  const cx = Math.cos(a) * ring * 1.8 * inset;
  const cy = Math.sin(a) * ring * inset;
  const local = deviceLocal(kind, seed);
  const scale = 0.95 + tier * 0.08;
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

/** Open laptop, tower, or monitor. Local offset, centred on the piece. */
function hardwareLocal(which: number, seed: Vec3): Vec3 {
  const part = fract(seed[0] * 4.17);
  const u = seed[1];
  const v = seed[2];
  const ang = u * TAU;
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
    return tube([-1.45, -0.98, -0.14], [1.45, -0.98, -0.14], u, ang, 0.06);
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
  if (part < 0.78) return tube([0, 0.05, 0], [0, -0.72, 0], u, ang, 0.075);
  return tube([-0.85, -0.8, 0], [0.85, -0.8, 0], u, ang, 0.07);
}

/**
 * One strategy-row picture. These are not chapter formations: opening a
 * row must not move the chapter phase. Twin of `serviceAt()` in shader.ts.
 */
export function serviceFormation(scene: number, p: PointSeed, t = 0): Vec3 {
  const { seed, u, v, rand } = p;

  if (scene <= 0) {
    // CompleteCare — one tended cluster in a slow orbit.
    const a = u * TAU + t * 0.15;
    const r = 1.2 + Math.pow(rand, 0.6) * 2.4;
    return [Math.cos(a) * r * 1.25, Math.sin(a) * r, (seed[2] - 0.5) * 1.1];
  }
  if (scene === 1) {
    // Cybersecurity — a closed shell, no beam.
    const a = u * TAU + t * 0.04;
    const b = v * TAU;
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
    // VoIP — a vertical handset over a cradle, and a call leaving in rings.
    if (rand < 0.22) {
      const part = fract(seed[0] * 5.1);
      const ang = v * TAU;
      let local: Vec3;
      if (part < 0.26) {
        const rr = 0.42 + u * 0.32;
        local = [Math.cos(ang) * rr * 1.25, 1.95 + Math.sin(ang) * rr * 0.78, (seed[2] - 0.5) * 0.3];
      } else if (part < 0.52) {
        const rr = 0.36 + u * 0.28;
        local = [Math.cos(ang) * rr * 1.1, -1.95 + Math.sin(ang) * rr * 0.72, (seed[2] - 0.5) * 0.3];
      } else if (part < 0.78) {
        const grip = tube([0, 1.42, 0], [0, -1.42, 0], u, ang, 0.16);
        local = [grip[0] + Math.sin(grip[1] * 0.7) * 0.08, grip[1], grip[2]];
      } else {
        local = [(u - 0.5) * 2.6, -2.7 + (v - 0.5) * 0.28, (seed[2] - 0.5) * 0.35];
      }
      local[1] += 0.16 + Math.sin(t * 1.1) * 0.14;
      const spin = Math.sin(t * 0.7) * 0.2;
      const c = Math.cos(spin);
      const s = Math.sin(spin);
      return [local[0] * c + local[2] * s, local[1], -local[0] * s + local[2] * c];
    }
    if (rand > 0.5) return [0, -40, 0];
    const travel = fract(t * 0.32 + seed[1] * 0.65);
    if (travel > 0.9) return [0, -40, 0];
    const rad = 1.6 + travel * 6.4 + (v - 0.5) * 0.38;
    const a = u * TAU;
    return [Math.cos(a) * rad, Math.sin(a) * rad * 0.72, (seed[2] - 0.5) * 0.22];
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
/** Mark size inside the cloud. Small enough that the object reads as a speck. */
const MARK_SCALE = 0.22;
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
  /** Lattice coordinates in [0,1]. */
  u: number;
  v: number;
  /** One more random, used for tier, cluster and ring membership. */
  rand: number;
  /** Accent membership, kept independent of `rand` so the accent does not
   *  correlate with cluster or tier selection. */
  gold: number;
};

export function buildSeeds(count: number, seedValue = 0x4e05): PointSeed[] {
  const rnd = mulberry32(seedValue);
  // Lattice proportioned to the widescreen framing of the discovery state.
  const cols = Math.max(2, Math.round(Math.sqrt((count * 26) / 14)));
  const rows = Math.max(2, Math.ceil(count / cols));
  const out: PointSeed[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      seed: [rnd(), rnd(), rnd()],
      u: (i % cols) / (cols - 1),
      v: Math.floor(i / cols) / (rows - 1),
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
      const a = u * TAU + tier * 0.6 + t * (0.05 + tier * 0.02);
      return [Math.cos(a) * r * 1.8, Math.sin(a) * r, (seed[0] - 0.5) * 0.8];
    }
    case 3: {
      // Security: a perimeter closes around the interior.
      const onRing = rand >= 0.3;
      const a = u * TAU + t * 0.06;
      const r = onRing
        ? 6.4 + (seed[1] - 0.5) * 0.28
        : Math.sqrt(seed[0]) * 5.9;
      return [Math.cos(a) * r * 1.8, Math.sin(a) * r, (seed[2] - 0.5) * 0.7];
    }
    case 4: {
      // Industries: six marks (scales, umbrella, cross, crane, gear, bars),
      // each surrounded by its own field. The live shader yaws a focused
      // mark while zoomed; the still pose here is the unzoomed one.
      const k = Math.min(5, Math.floor(rand * 6));
      const a = (k / 6) * TAU - Math.PI / 2;
      const extra = fract(rand * 6);
      const mark = industryGlyph(k, seed, extra);
      const local =
        seed[2] < ICON_CUT
          ? ([mark[0] * MARK_SCALE, mark[1] * MARK_SCALE, mark[2] * MARK_SCALE] as Vec3)
          : industryHalo(seed);
      return [
        CLUSTER_CX + Math.cos(a) * CLUSTER_R + local[0],
        CLUSTER_CY + Math.sin(a) * CLUSTER_R + local[1],
        local[2],
      ];
    }
    case 5: {
      // Response: a calm disc. A few issues leave the rim and go out
      // before a tight inbox at the centre. The pulse itself is drawn
      // in the shader; this is only the endpoints.
      if (rand < 0.07) {
        const a = seed[0] * TAU;
        const rad = Math.sqrt(seed[1]) * 0.55;
        return [Math.cos(a) * rad * 1.15, Math.sin(a) * rad, (seed[2] - 0.5) * 0.22];
      }
      if (rand > 0.93) {
        const travel = fract(t * 0.35 + seed[1]);
        if (travel > 0.72) return [0, -40, 0];
        const a = u * TAU;
        const rad = 7.2 - travel * 6.39;
        return [Math.cos(a) * rad * 1.55, Math.sin(a) * rad, (seed[2] - 0.5) * 0.3];
      }
      const a = u * TAU + t * 0.015;
      const rad = Math.sqrt(seed[0]) * 6.5;
      return [Math.cos(a) * rad * 1.55, Math.sin(a) * rad, (seed[2] - 0.5) * 0.45];
    }
    default: {
      // Strategy: the field leans forward onto a receding horizon.
      const depth = v;
      return [
        (u - 0.5) * 34 * (0.3 + depth * 0.95),
        -4.2 + depth * 6.4,
        -depth * 13,
      ];
    }
  }
}
