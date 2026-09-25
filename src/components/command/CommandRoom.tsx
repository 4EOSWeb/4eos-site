"use client";

import { useEffect, useState, type ReactNode } from "react";
import { UsMap } from "./UsMap";

type RangeKey = "day" | "week" | "month" | "quarter" | "year";
type Pair = { label: string; count: number };
type Topic = { label: string; views: number; avgEngagementMs: number; conversion: number; returnRate: number };
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
    visitorsChange: number | null;
    leadsChange: number | null;
  };
  trend: { t: number; visitors: number; leads: number; engaged: number }[];
  places: {
    cities: { label: string; count: number; lat: number | null; lon: number | null }[];
    states: Pair[];
  };
  leadSources: Pair[];
  pages: { path: string; views: number; entries: number; exits: number; avgEngagementMs: number; avgScroll: number }[];
  services: Topic[];
  industries: Topic[];
  journeys: { place: string; steps: string[] }[];
  support: {
    visits: number;
    unique: number;
    repeat: number;
    tickets: number;
    avgEngagementMs: number;
    sources: Pair[];
    actions: Pair[];
  };
  leads: { assessment: number; support: number; phone: number; email: number; cta: number; total: number; conversion: number };
  funnels: { name: string; steps: { label: string; count: number }[] }[];
  ai: {
    referrals: Pair[];
    crawlers: { label: string; count: number; firstSeen: number; lastSeen: number }[];
    crawlerTrend: { t: number; count: number }[];
    pages: { path: string | null; count: number }[];
  };
  companies: { org_name: string; location: string | null; first_seen: number; last_seen: number; visits: number; pages: string }[];
  companyLookup: boolean;
  devices: Pair[];
  browsers: Pair[];
  systems: Pair[];
  screens: Pair[];
  score: { topIndustry: string | null; topService: string | null; bestSource: string | null };
};
type Live = {
  active: number;
  feed: { at: number; path: string | null; name: string; detail: string | null }[];
  here: { path: string; source: string; device: string | null; where: string | null; region: string | null }[];
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
          if (!stop && data?.overview) setReport(data);
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
          if (!stop && data?.feed) setLive(data);
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

  if (!report) return <p className="command-kicker">Reading the record…</p>;

  const topPage = report.pages[0]?.path ?? "—";
  const o = report.overview;

  return (
    <div className="command">
      <header className="command-top">
        <div>
          <p className="command-kicker">4EOS command</p>
          <h1>Executive summary</h1>
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

      <section className="command-hero">
        <article className="command-impact">
          <p className="command-kicker">Business impact</p>
          <strong>{o.visitors}</strong>
          <span>visitors {delta(o.visitorsChange)}</span>
          <strong>{report.leads.total}</strong>
          <span>leads {delta(o.leadsChange)}</span>
          <em>{o.conversion}% conversion</em>
          <ul>
            <li>Top industry <b>{report.score.topIndustry ?? "—"}</b></li>
            <li>Top service <b>{report.score.topService ?? "—"}</b></li>
            <li>Top source <b>{report.score.bestSource ?? "—"}</b></li>
            <li>Opportunities <b>{report.leads.total}</b></li>
          </ul>
        </article>
        <article className="command-panel command-summary">
          <h2>This {range}</h2>
          <dl>
            <div><dt>Visitors</dt><dd>{o.visitors} <small>{delta(o.visitorsChange)}</small></dd></div>
            <div><dt>Leads</dt><dd>{report.leads.total} <small>{delta(o.leadsChange)}</small></dd></div>
            <div><dt>Top industry</dt><dd>{report.score.topIndustry ?? "—"}</dd></div>
            <div><dt>Top service</dt><dd>{report.score.topService ?? "—"}</dd></div>
            <div><dt>Top source</dt><dd>{report.score.bestSource ?? "—"}</dd></div>
            <div><dt>Support usage</dt><dd>{report.support.visits} visits</dd></div>
            <div><dt>Most viewed page</dt><dd>{topPage}</dd></div>
            <div><dt>Active now</dt><dd>{live?.active ?? o.activeNow}</dd></div>
          </dl>
        </article>
        <article className="command-panel">
          <h2>Support portal</h2>
          <dl>
            <div><dt>Visitors</dt><dd>{report.support.visits}</dd></div>
            <div><dt>Unique</dt><dd>{report.support.unique}</dd></div>
            <div><dt>Avg time</dt><dd>{clock(report.support.avgEngagementMs)}</dd></div>
            <div><dt>Tickets</dt><dd>{report.support.tickets}</dd></div>
            <div><dt>Returning</dt><dd>{report.support.repeat}</dd></div>
          </dl>
          <h3>Entry sources</h3>
          <Bars rows={report.support.sources} />
          <h3>Most used actions</h3>
          {report.support.actions.length ? <Bars rows={report.support.actions} /> : <p className="command-empty">No support clicks in this range.</p>}
        </article>
      </section>

      <section className="command-split">
        <Panel title="Traffic and engagement">
          <Trend points={report.trend} />
        </Panel>
        <Panel title="Lead sources">
          <Bars rows={report.leadSources} />
        </Panel>
      </section>

      <section className="command-split">
        <Panel title="United States">
          <UsMap states={report.places.states} liveRegions={(live?.here ?? []).map((row) => row.region).filter((row): row is string => Boolean(row))} />
        </Panel>
        <Panel title="Cities">
          {report.places.cities.length ? (
            <Bars rows={report.places.cities.map((city) => ({ label: city.label, count: city.count }))} />
          ) : (
            <p className="command-empty">City names appear on visits after this update. Private and local addresses stay blank.</p>
          )}
          <h3>Live</h3>
          <ul className="command-feed">
            {(live?.here ?? []).slice(0, 6).map((row, index) => (
              <li key={index}>
                <strong>{row.where || "Active visitor"}</strong>
                <em>{row.path}</em>
              </li>
            ))}
            {!live?.here.length ? <li>Nobody active in the last five minutes.</li> : null}
          </ul>
        </Panel>
      </section>

      <section className="command-split">
        <Panel title="Industries">
          <Heat rows={report.industries} />
        </Panel>
        <Panel title="Services">
          <Heat rows={report.services} />
        </Panel>
      </section>

      <section className="command-split">
        <Panel title="Recent journeys">
          <div className="command-journeys">
            {report.journeys.map((journey, index) => (
              <article key={index}>
                <h3>{journey.place}</h3>
                <ol>
                  {journey.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
          {!report.journeys.length ? <p className="command-empty">A journey appears after someone opens a second page.</p> : null}
        </Panel>
        <Panel title="Funnels">
          {report.funnels.map((funnel) => (
            <Funnel key={funnel.name} name={funnel.name} steps={funnel.steps} />
          ))}
        </Panel>
      </section>

      <Panel title="AI activity">
        <Bars rows={report.ai.referrals} />
        <Trend points={report.ai.crawlerTrend.map((point) => ({ ...point, visitors: point.count, engaged: 0, leads: 0 }))} single />
        <table>
          <thead>
            <tr>
              <th>Crawler</th>
              <th>Hits</th>
              <th>First seen</th>
              <th>Last seen</th>
            </tr>
          </thead>
          <tbody>
            {report.ai.crawlers.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{row.count}</td>
                <td>{new Date(row.firstSeen).toLocaleString()}</td>
                <td>{new Date(row.lastSeen).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!report.ai.crawlers.length ? <p className="command-empty">No known AI crawlers in this range.</p> : null}
        <h3>Pages they requested</h3>
        <Bars rows={report.ai.pages.map((row) => ({ label: row.path || "/", count: row.count }))} />
      </Panel>

      <Panel title="Live activity">
        <ul className="command-feed">
          {(live?.feed ?? []).map((row, index) => (
            <li key={`${row.at}-${index}`}>
              <span>{new Date(row.at).toLocaleTimeString()}</span>
              <strong>{row.path}</strong>
              <em>{row.detail || row.name}</em>
            </li>
          ))}
          {!live?.feed.length ? <li>No activity yet.</li> : null}
        </ul>
      </Panel>

      {report.companyLookup ? (
        <Panel title="Organizations">
          {report.companies.length ? (
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
          )}
        </Panel>
      ) : null}

      <details className="command-panel">
        <summary>Pages, devices, and screens</summary>
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
        <div className="command-split">
          <div><h3>Device</h3><Bars rows={report.devices} /></div>
          <div><h3>Browser</h3><Bars rows={report.browsers} /></div>
          <div><h3>System</h3><Bars rows={report.systems} /></div>
          <div><h3>Screen</h3><Bars rows={report.screens} /></div>
        </div>
      </details>
    </div>
  );
}

function delta(value: number | null) {
  if (value == null) return "";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
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
          <i style={{ width: `${Math.max(row.count ? 6 : 0, (row.count / max) * 100)}%` }} />
          <b>{row.count}</b>
        </li>
      ))}
    </ul>
  );
}

function Heat({ rows }: { rows: Topic[] }) {
  const max = Math.max(1, ...rows.map((row) => row.views));
  if (!rows.length) return <p className="command-empty">No views in this range.</p>;
  return (
    <ul className="command-heat">
      {rows.map((row) => (
        <li key={row.label} style={{ background: `rgba(245, 183, 0, ${0.12 + (row.views / max) * 0.7})` }}>
          <strong>{row.label}</strong>
          <span>{row.views} views</span>
          <span>{clock(row.avgEngagementMs)}</span>
          <span>{row.conversion}% became a lead</span>
        </li>
      ))}
    </ul>
  );
}

function Funnel({ name, steps }: { name: string; steps: { label: string; count: number }[] }) {
  const max = Math.max(1, ...steps.map((step) => step.count));
  return (
    <div className="command-funnel">
      <h3>{name}</h3>
      <ol>
        {steps.map((step) => (
          <li key={step.label}>
            <span>{step.label}</span>
            <i style={{ width: `${Math.max(18, (step.count / max) * 100)}%` }} />
            <strong>{step.count}</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Trend({
  points,
  single,
}: {
  points: { visitors: number; engaged: number }[];
  single?: boolean;
}) {
  if (!points.length) return null;
  const max = Math.max(1, ...points.map((point) => Math.max(point.visitors, point.engaged)));
  const w = 640;
  const h = 180;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const line = (pick: (point: { visitors: number; engaged: number }) => number) =>
    points.map((point, index) => `${index * step},${h - (pick(point) / max) * (h - 16)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="command-trend" role="img" aria-label="Trend">
      <polyline points={line((point) => point.visitors)} fill="none" stroke="currentColor" strokeWidth="2.5" />
      {single ? null : (
        <polyline points={line((point) => point.engaged)} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
      )}
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
