import type { ReactNode } from "react";
import type { ServiceSlug } from "@/lib/content";

/* Hand-built service diagrams. Each one is labelled for assistive tech and
   carries no claim that is not already in the page copy. */

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 480 340" className="diagram" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

function Node({ x, y, w = 112, h = 44, label, gold = false }: { x: number; y: number; w?: number; h?: number; label: string; gold?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} className={gold ? "dg-node dg-node-gold" : "dg-node"} />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" className="dg-text">
        {label}
      </text>
    </g>
  );
}

function Managed() {
  const rows = ["Servers", "Endpoints", "Network", "Backups", "Patching"];
  return (
    <Frame label="Monitoring board: servers, endpoints, network, backups, and patching watched continuously, with issues resolved before staff notice them">
      <rect x="20" y="20" width="440" height="300" rx="8" className="dg-panel" />
      <text x="44" y="56" className="dg-text dg-text-strong">CompleteCare · 24/7</text>
      {rows.map((r, i) => (
        <g key={r} transform={`translate(44 ${84 + i * 46})`}>
          <text x="0" y="16" className="dg-text">{r}</text>
          <line x1="100" y1="12" x2="350" y2="12" className="dg-line" />
          {Array.from({ length: 9 }).map((_, j) => (
            <circle key={j} cx={108 + j * 29} cy="12" r="4" className={i === 3 && j === 6 ? "dg-dot-gold" : "dg-dot"} />
          ))}
          <text x="372" y="16" className="dg-text">{i === 3 ? "Fixed" : "OK"}</text>
        </g>
      ))}
    </Frame>
  );
}

function Backup() {
  return (
    <Frame label="Backup flow: your systems are backed up and verified, an immutable cloud copy and SafeHouse DataCenter hold recovery points, and restores are tested back to your systems">
      <Node x={24} y={148} label="Your systems" />
      <Node x={184} y={148} label="Verified backup" gold />
      <Node x={344} y={72} label="Immutable copy" />
      <Node x={344} y={224} label="SafeHouse DC" />
      <path d="M136 170h48" className="dg-line" markerEnd="url(#dg-arrow)" />
      <path d="M296 160c20 0 24-66 48-66" className="dg-line" markerEnd="url(#dg-arrow)" />
      <path d="M296 180c20 0 24 66 48 66" className="dg-line" markerEnd="url(#dg-arrow)" />
      <path d="M400 268c0 40-320 40-320-76" className="dg-gold" markerEnd="url(#dg-arrow-gold)" />
      <text x="240" y="318" textAnchor="middle" className="dg-text dg-text-gold">Restore tested and documented</text>
      <Defs />
    </Frame>
  );
}

function Network() {
  const sites = [
    { x: 24, y: 40, l: "Main office" },
    { x: 344, y: 40, l: "Second site" },
    { x: 24, y: 256, l: "Plant or job site" },
    { x: 344, y: 256, l: "Remote staff" },
  ];
  return (
    <Frame label="Network topology: a managed core connects the main office, additional sites, plants or job sites, and remote staff">
      {sites.map((s) => (
        <line key={s.l} x1={s.x + 56} y1={s.y + 22} x2="240" y2="170" className="dg-line" />
      ))}
      <circle cx="240" cy="170" r="52" className="dg-node dg-node-gold" />
      <text x="240" y="166" textAnchor="middle" className="dg-text dg-text-strong">Managed</text>
      <text x="240" y="182" textAnchor="middle" className="dg-text">network</text>
      {sites.map((s) => (
        <Node key={s.l} x={s.x} y={s.y} label={s.l} />
      ))}
    </Frame>
  );
}

function Security() {
  const rings = ["Recover", "Respond", "Detect", "Protect", "Identify"];
  return (
    <Frame label="NIST Cybersecurity Framework as layered rings: identify, protect, detect, respond, and recover around your business">
      {rings.map((r, i) => {
        const radius = 150 - i * 26;
        return (
          <g key={r}>
            <circle cx="240" cy="170" r={radius} className={i === 2 ? "dg-ring dg-ring-gold" : "dg-ring"} />
            <text x="240" y={170 - radius + 17} textAnchor="middle" className={i === 2 ? "dg-text dg-text-gold" : "dg-text"}>
              {r}
            </text>
          </g>
        );
      })}
      <text x="240" y="176" textAnchor="middle" className="dg-text dg-text-strong">Your business</text>
    </Frame>
  );
}

function Cloud() {
  return (
    <Frame label="Microsoft 365, Azure, and on-premise systems managed as one environment with shared security, backup, and support">
      <Node x={24} y={40} label="Microsoft 365" />
      <Node x={184} y={40} label="Azure" />
      <Node x={344} y={40} label="On-premise" />
      {[80, 240, 400].map((x) => (
        <line key={x} x1={x} y1="84" x2={x} y2="150" className="dg-line" />
      ))}
      <rect x="24" y="150" width="432" height="56" rx="8" className="dg-node dg-node-gold" />
      <text x="240" y="183" textAnchor="middle" className="dg-text dg-text-strong">One managed environment</text>
      <g className="dg-text">
        <text x="80" y="246" textAnchor="middle">Security</text>
        <text x="240" y="246" textAnchor="middle">Backup</text>
        <text x="400" y="246" textAnchor="middle">Support</text>
      </g>
      {[80, 240, 400].map((x) => (
        <line key={`b${x}`} x1={x} y1="206" x2={x} y2="230" className="dg-line" />
      ))}
      <line x1="40" y1="290" x2="440" y2="290" className="dg-line" />
      <text x="240" y="314" textAnchor="middle" className="dg-text">Licensing and cost reviewed</text>
    </Frame>
  );
}

function Strategy() {
  const cols = [
    { l: "Now", items: ["Fix top risks", "Backup testing"] },
    { l: "Next", items: ["Microsoft 365 review", "Network refresh"] },
    { l: "Later", items: ["New site", "Hardware cycle"] },
  ];
  return (
    <Frame label="Technology roadmap with now, next, and later columns, reviewed at quarterly business reviews">
      <line x1="24" y1="70" x2="456" y2="70" className="dg-line" />
      {cols.map((c, i) => (
        <g key={c.l} transform={`translate(${24 + i * 148} 0)`}>
          <circle cx="8" cy="70" r="6" className={i === 0 ? "dg-dot-gold" : "dg-dot"} />
          <text x="0" y="50" className={i === 0 ? "dg-text dg-text-gold" : "dg-text dg-text-strong"}>{c.l}</text>
          {c.items.map((it, j) => (
            <Node key={it} x={0} y={100 + j * 60} w={136} label={it} gold={i === 0 && j === 0} />
          ))}
        </g>
      ))}
      {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
        <g key={q}>
          <rect x={24 + i * 111} y="270" width="98" height="30" rx="15" className="dg-pill" />
          <text x={73 + i * 111} y="290" textAnchor="middle" className="dg-text">{q} review</text>
        </g>
      ))}
    </Frame>
  );
}

function Voip() {
  return (
    <Frame label="Call flow: an incoming call reaches the auto attendant, then a queue or ring group, then a desk phone or the mobile app">
      <Node x={24} y={148} w={100} label="Incoming call" />
      <Node x={150} y={148} w={110} label="Auto attendant" gold />
      <Node x={290} y={72} w={80} label="Queue" />
      <Node x={290} y={224} w={80} label="Ring group" />
      <Node x={394} y={40} w={70} label="Desk" />
      <Node x={394} y={120} w={70} label="Mobile" />
      <Node x={394} y={200} w={70} label="Desk" />
      <Node x={394} y={268} w={70} label="Mobile" />
      <path d="M124 170h26" className="dg-line" markerEnd="url(#dg-arrow)" />
      <path d="M260 160c14 0 14-66 30-66" className="dg-line" markerEnd="url(#dg-arrow)" />
      <path d="M260 180c14 0 14 66 30 66" className="dg-line" markerEnd="url(#dg-arrow)" />
      <path d="M370 94l24-32M370 94l24 48M370 246l24-24M370 246l24 44" className="dg-line" />
      <Defs />
    </Frame>
  );
}

function Rack() {
  return (
    <Frame label="Rack elevation in SafeHouse DataCenter: full rack, partial rack, and 4EOS-administered hosted systems">
      {[0, 1, 2].map((r) => (
        <g key={r} transform={`translate(${44 + r * 140} 24)`}>
          <rect x="0" y="0" width="112" height="272" rx="6" className="dg-panel" />
          {Array.from({ length: 10 }).map((_, u) => {
            const filled = r === 0 ? true : r === 1 ? u < 5 : u % 3 !== 2;
            return (
              <rect
                key={u}
                x="10"
                y={12 + u * 25}
                width="92"
                height="18"
                rx="3"
                className={filled ? (r === 2 && u === 0 ? "dg-node dg-node-gold" : "dg-node") : "dg-empty"}
              />
            );
          })}
          <text x="56" y="316" textAnchor="middle" className="dg-text">
            {r === 0 ? "Full rack" : r === 1 ? "Partial rack" : "Hosted by 4EOS"}
          </text>
        </g>
      ))}
    </Frame>
  );
}

function Hardware() {
  const steps = ["Specify", "Procure", "Install", "Support", "Replace"];
  return (
    <Frame label="Hardware lifecycle: specify, procure, install, support, and replace on a planned cycle">
      <circle cx="240" cy="170" r="118" className="dg-ring" />
      {steps.map((s, i) => {
        const a = (-90 + i * 72) * (Math.PI / 180);
        const x = 240 + Math.cos(a) * 118;
        const y = 170 + Math.sin(a) * 118;
        return <Node key={s} x={x - 48} y={y - 18} w={96} h={36} label={s} gold={i === 0} />;
      })}
      <text x="240" y="166" textAnchor="middle" className="dg-text dg-text-strong">Planned in</text>
      <text x="240" y="184" textAnchor="middle" className="dg-text dg-text-strong">the roadmap</text>
    </Frame>
  );
}

function Defs() {
  return (
    <defs>
      <marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0l10 5-10 5z" className="dg-arrowhead" />
      </marker>
      <marker id="dg-arrow-gold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0l10 5-10 5z" className="dg-arrowhead-gold" />
      </marker>
    </defs>
  );
}

const MAP: Record<ServiceSlug, () => React.JSX.Element> = {
  "managed-it": Managed,
  "backup-disaster-recovery": Backup,
  "network-infrastructure": Network,
  cybersecurity: Security,
  "cloud-microsoft-365": Cloud,
  "it-strategy": Strategy,
  voip: Voip,
  "data-center": Rack,
  hardware: Hardware,
};

export function Diagram({ slug }: { slug: ServiceSlug }) {
  const D = MAP[slug];
  return <D />;
}
