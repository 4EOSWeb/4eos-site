"use client";

import { useEffect, useState, type ReactNode } from "react";

type RangeKey = "day" | "week" | "month" | "quarter" | "year";
type Pair = { label: string; count: number };
type Report = {
  overview: {
    visitors: number;
    unique: number;
    returning: number;
    new: number;
    avgSessionMs: number;
    pagesPerSession: number;
    bounceRate: number;
    engagementRate: number;
    activeNow: number;
    leads: number;
    conversion: number;
  };
  trend: { t: number; visitors: number; leads: number }[];
  peaks: { hour: number; visitors: number }[];
  devices: Pair[];
  browsers: Pair[];
  systems: Pair[];
  screens: Pair[];
  connections: Pair[];
  places: { countries: Pair[]; regions: Pair[]; cities: Pair[]; isps: Pair[] };
  acquisition: { label: string; visitors: number; leads: number }[];
  pages: { path: string; views: number; entries: number; exits: number; avgEngagementMs: number; avgScroll: number }[];
  services: { label: string; views: number; avgEngagementMs: number; conversion: number; returnRate: number }[];
  industries: { label: string; views: number; avgEngagementMs: number; conversion: number; returnRate: number }[];
  journeys: { path: string; count: number }[];
  support: {
    visits: number;
    unique: number;
    repeat: number;
    avgEngagementMs: number;
    sources: Pair[];
    actions: Pair[];
  };
  leads: { assessment: number; support: number; phone: number; email: number; cta: number; total: number; conversion: number };
  funnels: { name: string; steps: { label: string; count: number }[] }[];
  ai: {
    referrals: Pair[];
    crawlers: Pair[];
    pages: { path: string | null; count: number }[];
    industry: { path: string | null; count: number }[];
    service: { path: string | null; count: number }[];
  };
  companies: { org_name: string; location: string | null; first_seen: number; last_seen: number; visits: number; pages: string }[];
  companyLookup: boolean;
  months: { label: string; visitors: number; leads: number; topIndustry: string; topService: string }[];
  score: { topIndustry: string | null; topService: string | null; bestSource: string | null };
};
type Live = {
  active: number;
  locations: Pair[];
  feed: { at: number; path: string | null; name: string; detail: string | null }[];
  here: { path: string; source: string; device: string | null; where: string | null }[];
};

const RANGES: RangeKey[] = ["day", "week", "month", "quarter", "year"];

export function CommandRoom() {
  const [range, setRange] = useState<RangeKey>("month");
  const [report, setReport] = useState<Report | null>(null);
  const [live, setLive] = useState<Live | null>(null);

  useEffect(() => {
    let stop = false;
    const load = () => {
      void fetch(`/api/command/report?range=${range}`)
        .then((res) => res.json())
        .then((data) => {
          if (!stop) setReport(data);
        });
    };
    load();
    const timer = window.setInterval(load, 30_000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [range]);

  useEffect(() => {
    let stop = false;
    const load = () => {
      void fetch("/api/command/live")
        .then((res) => res.json())
        .then((data) => {
          if (!stop) setLive(data);
        });
    };
    load();
    const timer = window.setInterval(load, 8_000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  async function logout() {
    await fetch("/api/command/logout", { method: "POST" });
    window.location.href = "/command/login";
  }

  if (!report) {
    return <p className="command-kicker">Reading the record…</p>;
  }

  const o = report.overview;
  return (
    <div className="command">
      <header className="command-top">
        <div>
          <p className="command-kicker">4EOS command</p>
          <h1>How the site is working.</h1>
        </div>
        <div className="command-ranges">
          {RANGES.map((item) => (
            <button key={item} type="button" className={item === range ? "is-on" : ""} onClick={() => setRange(item)}>
              {item}
            </button>
          ))}
          <button type="button" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="command-grid">
        <Stat label="Visitors" value={String(o.visitors)} note={`${o.unique} unique`} />
        <Stat label="New" value={String(o.new)} note={`${o.returning} returning`} />
        <Stat label="Session" value={clock(o.avgSessionMs)} note={`${o.pagesPerSession} pages`} />
        <Stat label="Bounce" value={`${o.bounceRate}%`} note={`${o.engagementRate}% engaged`} />
        <Stat label="Leads" value={String(o.leads)} note={`${o.conversion}% of sessions`} />
        <Stat label="Active now" value={String(live?.active ?? o.activeNow)} note="Last five minutes" />
        <Stat label="Top industry" value={report.score.topIndustry ?? "—"} />
        <Stat label="Top service" value={report.score.topService ?? "—"} />
        <Stat label="Best source" value={report.score.bestSource ?? "—"} note="Most leads, then visits" />
      </section>

      <section className="command-split">
        <Panel title="Visitor trend">
          <Trend points={report.trend} />
        </Panel>
        <Panel title="Peak hours (UTC)">
          <Bars rows={report.peaks.map((row) => ({ label: String(row.hour).padStart(2, "0"), count: row.visitors }))} />
        </Panel>
      </section>

      <section className="command-split">
        <Panel title="Live activity">
          <ul className="command-feed">
            {(live?.feed ?? []).map((row, i) => (
              <li key={`${row.at}-${i}`}>
                <span>{new Date(row.at).toLocaleTimeString()}</span>
                <strong>{row.path}</strong>
                <em>{row.detail || row.name}</em>
              </li>
            ))}
            {!live?.feed.length ? <li>No activity yet.</li> : null}
          </ul>
        </Panel>
        <Panel title="Active locations">
          {live?.locations.length ? (
            <Bars rows={live.locations} />
          ) : (
            <p className="command-empty">
              {live?.here.length
                ? `${live.here.length} active. City is stored only when a local GeoIP database is present.`
                : "Nobody active in the last five minutes."}
            </p>
          )}
          <ul className="command-feed">
            {(live?.here ?? []).slice(0, 6).map((row, i) => (
              <li key={i}>
                <strong>{row.path}</strong>
                <em>{[row.where, row.source, row.device].filter(Boolean).join(" · ")}</em>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="command-split">
        <Panel title="Where they came from">
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Visits</th>
                <th>Leads</th>
              </tr>
            </thead>
            <tbody>
              {report.acquisition.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td>{row.visitors}</td>
                  <td>{row.leads}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!report.acquisition.length ? <p className="command-empty">No sessions in this range.</p> : null}
        </Panel>
        <Panel title="Audience">
          <h3>Device</h3>
          <Bars rows={report.devices} />
          <h3>Browser</h3>
          <Bars rows={report.browsers} />
          <h3>System</h3>
          <Bars rows={report.systems} />
          <h3>Screen</h3>
          <Bars rows={report.screens} />
          <h3>Connection</h3>
          {report.connections.length ? <Bars rows={report.connections} /> : <p className="command-empty">Not reported by the browser.</p>}
        </Panel>
      </section>

      <section className="command-split">
        <Panel title="Geography">
          <Geo title="Country" rows={report.places.countries} />
          <Geo title="State" rows={report.places.regions} />
          <Geo title="City" rows={report.places.cities} />
          <Geo title="ISP" rows={report.places.isps} />
        </Panel>
        <Panel title="Industries">
          <Heat rows={report.industries} />
        </Panel>
      </section>

      <Panel title="Services">
        <Heat rows={report.services} />
      </Panel>

      <Panel title="Pages">
        <table>
          <thead>
            <tr>
              <th>Page</th>
              <th>Views</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Time</th>
              <th>Scroll</th>
            </tr>
          </thead>
          <tbody>
            {report.pages.map((row) => (
              <tr key={row.path}>
                <td>{row.path}</td>
                <td>{row.views}</td>
                <td>{row.entries}</td>
                <td>{row.exits}</td>
                <td>{clock(row.avgEngagementMs)}</td>
                <td>{row.avgScroll}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <section className="command-split">
        <Panel title="Journeys">
          <ol className="command-paths">
            {report.journeys.map((row) => (
              <li key={row.path}>
                <span>{row.path}</span>
                <strong>{row.count}</strong>
              </li>
            ))}
          </ol>
          {!report.journeys.length ? <p className="command-empty">Journeys appear after a visitor opens a second page.</p> : null}
        </Panel>
        <Panel title="Funnels">
          {report.funnels.map((funnel) => (
            <div key={funnel.name} className="command-funnel">
              <h3>{funnel.name}</h3>
              <ol>
                {funnel.steps.map((step) => (
                  <li key={step.label}>
                    <span>{step.label}</span>
                    <strong>{step.count}</strong>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </Panel>
      </section>

      <Panel title="Support">
        <section className="command-grid">
          <Stat label="Support visits" value={String(report.support.visits)} />
          <Stat label="Unique" value={String(report.support.unique)} />
          <Stat label="Repeat visitors" value={String(report.support.repeat)} />
          <Stat label="Time on support" value={clock(report.support.avgEngagementMs)} />
        </section>
        <div className="command-split">
          <div>
            <h3>Entry sources</h3>
            <Bars rows={report.support.sources} />
          </div>
          <div>
            <h3>Clicked actions</h3>
            {report.support.actions.length ? <Bars rows={report.support.actions} /> : <p className="command-empty">No support clicks in this range.</p>}
          </div>
        </div>
      </Panel>

      <Panel title="Leads">
        <section className="command-grid">
          <Stat label="Assessments" value={String(report.leads.assessment)} />
          <Stat label="Support requests" value={String(report.leads.support)} />
          <Stat label="Phone clicks" value={String(report.leads.phone)} />
          <Stat label="Email clicks" value={String(report.leads.email)} />
          <Stat label="Contact clicks" value={String(report.leads.cta)} />
          <Stat label="Lead rate" value={`${report.leads.conversion}%`} note="Forms, phone, and email" />
        </section>
      </Panel>

      <section className="command-split">
        <Panel title="AI visibility">
          <h3>Referrals</h3>
          {report.ai.referrals.length ? <Bars rows={report.ai.referrals} /> : <p className="command-empty">No AI site referrals in this range.</p>}
          <h3>Crawlers</h3>
          {report.ai.crawlers.length ? <Bars rows={report.ai.crawlers} /> : <p className="command-empty">No known AI crawlers in this range.</p>}
          <h3>Pages they requested</h3>
          <Bars rows={report.ai.pages.map((row) => ({ label: row.path || "/", count: row.count }))} />
        </Panel>
        <Panel title="Companies">
          {report.companyLookup ? (
            report.companies.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Visits</th>
                    <th>Location</th>
                    <th>Latest</th>
                  </tr>
                </thead>
                <tbody>
                  {report.companies.map((row) => (
                    <tr key={row.org_name}>
                      <td>{row.org_name}</td>
                      <td>{row.visits}</td>
                      <td>{row.location || "—"}</td>
                      <td>{new Date(row.last_seen).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="command-empty">The lookup key is set. No organization has been returned.</p>
            )
          ) : (
            <p className="command-empty">Company lookup is off until COMPANY_ENRICHMENT_KEY is set. Personal names are never stored.</p>
          )}
        </Panel>
      </section>

      <Panel title="Month scorecards">
        <section className="command-grid">
          {report.months.map((month) => (
            <article key={month.label} className="command-stat">
              <p>{month.label}</p>
              <strong>{month.visitors} visitors</strong>
              <span>{month.leads} leads</span>
              <span>
                {month.topIndustry} · {month.topService}
              </span>
            </article>
          ))}
        </section>
      </Panel>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <article className="command-stat">
      <p>{label}</p>
      <strong>{value}</strong>
      {note ? <span>{note}</span> : null}
    </article>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="command-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Bars({ rows }: { rows: Pair[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  if (!rows.length) return <p className="command-empty">Nothing in this range.</p>;
  return (
    <ul className="command-bars">
      {rows.map((row) => (
        <li key={row.label}>
          <span>{row.label}</span>
          <i style={{ width: `${(row.count / max) * 100}%` }} />
          <b>{row.count}</b>
        </li>
      ))}
    </ul>
  );
}

function Heat({ rows }: { rows: Report["industries"] }) {
  const max = Math.max(1, ...rows.map((row) => row.views));
  if (!rows.length) return <p className="command-empty">No views in this range.</p>;
  return (
    <ul className="command-heat">
      {rows.map((row) => (
        <li key={row.label} style={{ opacity: 0.45 + (row.views / max) * 0.55 }}>
          <strong>{row.label}</strong>
          <span>{row.views} views</span>
          <span>{clock(row.avgEngagementMs)}</span>
          <span>{row.conversion}% to a lead</span>
          <span>{row.returnRate}% returning</span>
        </li>
      ))}
    </ul>
  );
}

function Geo({ title, rows }: { title: string; rows: Pair[] }) {
  return (
    <div>
      <h3>{title}</h3>
      {rows.length ? <Bars rows={rows} /> : <p className="command-empty">No {title.toLowerCase()} data until a local GeoIP database is added.</p>}
    </div>
  );
}

function Trend({ points }: { points: { t: number; visitors: number; leads: number }[] }) {
  if (!points.length) return null;
  const max = Math.max(1, ...points.map((point) => point.visitors));
  const w = 640;
  const h = 160;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const line = points.map((point, i) => `${i * step},${h - (point.visitors / max) * (h - 12)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="command-trend" role="img" aria-label="Visitors over time">
      <polyline points={line} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function clock(ms: number) {
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes <= 0) return `${rest}s`;
  return `${minutes}m ${rest}s`;
}
