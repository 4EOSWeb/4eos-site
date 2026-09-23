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
  ownership: "The lattice organised into three concentric tiers of coverage.",
  security: "A perimeter closed around the environment.",
  industries: "The field separated into six industry clusters.",
  response: "A pulse travelling out from the centre and back.",
  strategy: "The field leaning forward onto a receding horizon.",
};

const TAU = Math.PI * 2;

/** Polar layout of the six industry clusters. Keep in step with the GLSL. */
export const CLUSTER_RX = 9.5;
export const CLUSTER_RY = 4.7;

export function clusterCenter(k: number): [number, number] {
  const a = (k / 6) * TAU;
  return [Math.cos(a) * CLUSTER_RX, Math.sin(a) * CLUSTER_RY];
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
      const tier = Math.floor(rand * 3);
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
      // Industries: six distinct clusters, scattered polar so they read as
      // clusters rather than as six squares.
      const k = Math.floor(rand * 6);
      const a = (k / 6) * TAU;
      const ja = seed[0] * TAU;
      const jr = Math.pow(seed[1], 1.5) * 2.3;
      return [
        Math.cos(a) * CLUSTER_RX + Math.cos(ja) * jr * 1.35,
        Math.sin(a) * CLUSTER_RY + Math.sin(ja) * jr,
        (seed[2] - 0.5) * 1.6,
      ];
    }
    case 5: {
      // Response: radial spokes carrying a travelling pulse.
      const spokes = 28;
      const a = (Math.floor(v * spokes) / spokes) * TAU;
      const rad = 1.5 + Math.pow(u, 0.85) * 6.6;
      return [Math.cos(a) * rad * 1.7, Math.sin(a) * rad, (seed[2] - 0.5) * 0.5];
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
