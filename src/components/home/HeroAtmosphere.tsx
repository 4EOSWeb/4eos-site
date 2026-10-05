import type { ReactNode } from "react";

/**
 * Still stand-in for the particle field. The live field is mounted once for
 * the whole site; this drawing shows only when that field cannot run.
 */
export function HeroAtmosphere({ children }: { children: ReactNode }) {
  return (
    <div className="hero-atmos" aria-hidden="true">
      <div className="static-net-layer">{children}</div>
    </div>
  );
}
