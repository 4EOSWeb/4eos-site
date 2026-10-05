import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

export function PageHero({
  crumbs,
  title,
  lede,
  actions,
  figure,
  kicker,
}: {
  crumbs: Crumb[];
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  figure?: ReactNode;
  /** A brand mark or short line above the title, for the family pages. */
  kicker?: ReactNode;
}) {
  return (
    <header className="surface-ink">
      <div className="wrap">
        <div className="pt-8">
          <Breadcrumbs items={crumbs} />
        </div>
        <div className="page-hero-grid">
          <div>
            {kicker ? <div>{kicker}</div> : null}
            <h1 className="display t-page">{title}</h1>
            {lede ? <p className="lede">{lede}</p> : null}
            {actions ? <div className="actions pt-3">{actions}</div> : null}
          </div>
          {figure ? <div className="page-hero-figure">{figure}</div> : null}
        </div>
      </div>
    </header>
  );
}
