/* A still data network: a jittered lattice with near-neighbour links and a
   few gold nodes. Seeded so the server and client draw the same picture. */

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COLS = 11;
const ROWS = 8;
const W = 640;
const H = 520;

const rand = rng(0x4e05);
const nodes = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  return {
    x: 24 + (c / (COLS - 1)) * (W - 48) + (rand() - 0.5) * 34,
    y: 24 + (r / (ROWS - 1)) * (H - 48) + (rand() - 0.5) * 34,
    gold: rand() < 0.06,
    keep: rand(),
  };
}).filter((n) => n.keep > 0.12);

const edges: [number, number][] = [];
nodes.forEach((a, i) => {
  nodes.forEach((b, j) => {
    if (j <= i) return;
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 70 && (a.keep + b.keep) % 1 > 0.25) edges.push([i, j]);
  });
});

export function StaticNetwork() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMid slice" className="static-net" aria-hidden="true" focusable="false">
      {edges.map(([i, j]) => (
        <line
          key={`${i}-${j}`}
          x1={nodes[i].x.toFixed(1)}
          y1={nodes[i].y.toFixed(1)}
          x2={nodes[j].x.toFixed(1)}
          y2={nodes[j].y.toFixed(1)}
          className="edge"
        />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x.toFixed(1)} cy={n.y.toFixed(1)} r={n.gold ? 3 : 1.8} className={n.gold ? "node-gold" : "node"} />
      ))}
    </svg>
  );
}
