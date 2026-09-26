import { CUBE_ICON, posterFacing } from "./cube";
import {
  buildSeeds,
  formation,
  PHASE_CAPTION,
  PHASE_INDEX,
  SERVICE_CAPTION,
  serviceFormation,
  type Phase,
} from "./formations";

/**
 * Server-rendered still of one formation, for phones and anything without
 * WebGL. Same maths as the live field, projected through the same camera, so
 * the fallback is the real thing held still rather than a different picture.
 */

const VB_W = 1200;
const VB_H = 800;
const CAM_Z = 20;
const FOV = 45;
const ASPECT = VB_W / VB_H;
const FOCAL = 1 / Math.tan(((FOV / 2) * Math.PI) / 180);

type PosterProps = {
  phase: Phase;
  /** Strategy-row still, 0..5. Draws that picture instead of the chapter. */
  scene?: number;
  /** Point count. The live field uses tens of thousands; this needs enough
   *  to read as a field and few enough to stay small in the HTML. */
  points?: number;
  className?: string;
};

export function SignalPoster({
  phase,
  scene,
  points = scene !== undefined ? 900 : phase === "industries" ? 1400 : 320,
  className = "",
}: PosterProps) {
  const index = PHASE_INDEX[phase];
  const showScene = scene !== undefined && scene >= 0 && scene <= 5;
  const seeds = buildSeeds(points);

  const dots: string[] = [];

  for (const s of seeds) {
    const [x, y, z] = showScene
      ? serviceFormation(scene, s, 0)
      : formation(index, s, 0);
    const depth = CAM_Z - z;
    if (depth <= 0.2) continue;

    const ndcX = ((FOCAL / ASPECT) * x) / depth;
    const ndcY = (FOCAL * y) / depth;
    if (Math.abs(ndcX) > 1.25 || Math.abs(ndcY) > 1.25) continue;

    const px = Math.round((ndcX * 0.5 + 0.5) * VB_W);
    const py = Math.round((0.5 - ndcY * 0.5) * VB_H);
    // The poster is not additive and carries two orders of magnitude fewer
    // points, so it is drawn larger and more opaque than the live field to
    // land at the same apparent density.
    let r = Math.round(Math.max(0.8, (1.4 + s.rand * 1.6) * (20 / depth)) * 10) / 10;

    let gold = s.gold > 0.955;
    let o = Math.round((gold ? 0.7 : 0.26 + s.rand * 0.18) * 100) / 100;
    if (!showScene && phase === "ownership") {
      const tier = Math.floor(s.rand * 3);
      const devicePick = s.rand * 19.1;
      const device = tier === 0 && devicePick - Math.floor(devicePick) <= 0.2;
      o = device ? 0.92 : tier === 0 ? Math.min(1, o * 1.2) : o * 0.28;
    }
    if (!showScene && phase === "response" && s.rand < 0.04) {
      gold = true;
      o = 0.45;
    }
    if (!showScene && phase === "industries") {
      gold = false;
      const k = Math.min(5, Math.floor(s.rand * 6));
      const glyph = s.seed[2] < CUBE_ICON;
      const facing = posterFacing(k);
      const glow = 0.35 + 0.65 * Math.min(1, facing / 0.5);
      o = Math.round(((glyph ? 0.72 : 0.06) + glow * (glyph ? 0.28 : 0.55)) * 100) / 100;
      r = Math.round(r * (glyph ? 1.2 : 0.55 + glow * 0.7) * 10) / 10;
    }
    dots.push(
      `<circle cx="${px}" cy="${py}" r="${r}" fill="${gold ? "#F5B700" : "#4F86B4"}" opacity="${o}"/>`,
    );
  }

  return (
    <svg
      className={className}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={showScene ? SERVICE_CAPTION[scene] : PHASE_CAPTION[phase]}
      // The markup is generated above rather than mapped to JSX because a few
      // hundred <circle> elements as React nodes is a lot of reconciler work
      // for something that never changes.
      dangerouslySetInnerHTML={{ __html: dots.join("") }}
    />
  );
}
