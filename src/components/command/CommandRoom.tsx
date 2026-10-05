"use client";

import { useEffect, useState, type ReactNode } from "react";
import { UsMap } from "./UsMap";

type RangeKey = "day" | "week" | "month" | "quarter" | "year";
type Mode = "executive" | "advanced";
type Pair = { label: string; count: number };
type Topic = { label: string; views: number; avgEngagementMs: number; conversion: number; returnRate: number };
type Report = {
  overview: {
    visitors: number;
    unique: number;
    returning: number;
    avgSessionMs: number;
    pagesPerSession: number;
    engagementRate: number;
    activeNow: number;
    leads: number;
    conversion: number;
    visitorsChange: number | null;
    leadsChange: number | null;
  };
  places: {
    cities: { label: string; count: number }[];
    states: Pair[];
    networks: Pair[];
  };
  leadSources: Pair[];
  pages: { path: string; views: number; entries: number; exits: number; avgEngagementMs: number; avgScroll: number }[];
  services: Topic[];
  industries: Topic[];
  journeys: { place: string; steps: string[] }[];
  support: { visits: number; unique: number; repeat: number; tickets: number; avgEngagementMs: number; sources: Pair[]; actions: Pair[] };
  leads: { total: number };
  funnels: { name: string; steps: { label: string; count: number }[] }[];
  ai: {
    referrals: Pair[];
    crawlers: { label: string; count: number; firstSeen: number; lastSeen: number }[];
    pages: { path: string | null; count: number }[];
  };
  companies: { org_name: string; location: string | null; last_seen: number; visits: number }[];
  companyLookup: boolean;
  devices: Pair[];
  browsers: Pair[];
  systems: Pair[];
  screens: Pair[];
  score: { topIndustry: string | null; topService: string | null; bestSource: string | null };
  engagement: { score: number; label: string };
  repeats: { label: string; count: number }[];
  trending: { label: string; views: number; change: number | null }[];
};
type LiveHere = {
  path: string;
  page: string;
  where: string | null;
  region: string | null;
  engagementMs: number;
  scroll: number;
  interest: string;
};
type Live = { active: number; feed: { at: number; path: string | null; name: string; detail: string | null }[]; here: LiveHere[] };

const RANGES: RangeKey[] = ["day", "week", "month", "quarter", "year"];

export function CommandRoom() {
  const [range, setRange] = useState<RangeKey>("month");
  const [mode, setMode] = useState<Mode>("executive");
  const [report, setReport] = useState<Report | null>(null);
  const [live, setLive] = useState<Live | null>(null);

  useEffect(() => {
    let stop = false;
    const load = () => {
      void fetch(`/api/analytics/report?range=${range}`)
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
      void fetch("/api/analytics/live")
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
    await fetch("/api/analytics/logout", { method: "POST" });
    window.location.href = "/analytics/login";
  }

  if (!report) return <p className="command-kicker">Reading the record…</p>;

  const o = report.overview;
  const leads = report.leads.total;
  const aiHits = report.ai.referrals.reduce((sum, row) => sum + row.count, 0) + report.ai.crawlers.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="command">
      <header className="command-top">
        <div>
          <p className="command-kicker">4EOS analytics</p>
          <h1>{mode === "executive" ? "Executive summary" : "Advanced detail"}</h1>
        </div>
        <div className="command-ranges">
          <button type="button" className={mode === "executive" ? "is-on" : ""} onClick={() => setMode("executive")}>
            Executive
          </button>
          <button type="button" className={mode === "advanced" ? "is-on" : ""} onClick={() => setMode("advanced")}>
            Advanced
          </button>
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

      {mode === "executive" ? (
        <>
          <section className="command-hero">
            <article className="command-impact">
              <p className="command-kicker">Business impact</p>
              <strong>{o.visitors}</strong>
              <span>visitors {delta(o.visitorsChange)}</span>
              {leads > 0 ? (
                <>
                  <strong>{leads}</strong>
                  <span>leads {delta(o.leadsChange)}</span>
                  <em>{o.conversion}% conversion</em>
                </>
              ) : (
                <p className="command-quiet">Lead tracking is on. No leads in this period.</p>
              )}
              <ul>
                <li>Engagement <b>{report.engagement.score}/100</b> {report.engagement.label}</li>
                <li>Top industry <b>{report.score.topIndustry ?? "—"}</b></li>
                <li>Top service <b>{report.score.topService ?? "—"}</b></li>
                <li>Support <b>{report.support.visits ? `${report.support.visits} visits` : "No visits yet"}</b></li>
                <li>Active now <b>{live?.active ?? o.activeNow}</b></li>
              </ul>
            </article>
            <article className="command-panel command-summary">
              <h2>{range === "day" ? "Today" : `This ${range}`}</h2>
              <dl>
                <div><dt>Visitors</dt><dd>{o.visitors} <small>{delta(o.visitorsChange)}</small></dd></div>
                <div><dt>Returning</dt><dd>{o.returning}</dd></div>
                <div><dt>Session</dt><dd>{clock(o.avgSessionMs)}</dd></div>
                <div><dt>Top industry</dt><dd>{report.score.topIndustry ?? "—"}</dd></div>
                <div><dt>Top service</dt><dd>{report.score.topService ?? "—"}</dd></div>
                <div><dt>Top source</dt><dd>{report.score.bestSource ?? "—"}</dd></div>
                <div><dt>Most viewed</dt><dd>{pageLabel(report.pages[0]?.path)}</dd></div>
              </dl>
            </article>
            <article className="command-panel">
              <h2>Live activity</h2>
              {(live?.here ?? []).length ? (
                <ul className="command-live">
                  {live!.here.slice(0, 5).map((row, index) => (
                    <li key={index}>
                      <strong>{row.where || "Visitor"}</strong>
                      <span>Viewing {row.page}</span>
                      <span>Time on site {clock(row.engagementMs)}</span>
                      <span>{row.scroll}% scroll</span>
                      <em>{row.interest}</em>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="command-quiet">Nobody is on the site in the last five minutes.</p>
              )}
            </article>
          </section>

          <Panel title="Recent journeys">
            {report.journeys.length ? (
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
            ) : (
              <p className="command-quiet">Journey tracking is on. A path appears after a second page.</p>
            )}
          </Panel>

          <section className="command-split">
            <Panel title="United States">
              {report.places.states.length ? (
                <UsMap states={report.places.states} liveRegions={(live?.here ?? []).map((row) => row.region).filter((row): row is string => Boolean(row))} />
              ) : (
                <p className="command-quiet">Location tracking is on. No state has been recorded in this period.</p>
              )}
            </Panel>
            <Panel title="Repeat visitors">
              {report.repeats.length ? (
                <Bars rows={report.repeats.map((row) => ({ label: row.label, count: row.count }))} />
              ) : (
                <p className="command-quiet">No city has a second visit in this period.</p>
              )}
            </Panel>
          </section>

          <section className="command-split">
            <Panel title="Industries">
              <Ranks rows={report.industries} empty="No industry page has been opened in this period." />
            </Panel>
            <Panel title="Services">
              <Ranks rows={report.services} empty="No service page has been opened in this period." />
            </Panel>
          </section>

          {report.trending.some((row) => row.change != null) ? (
            <Panel title="Trending">
              <ul className="command-trend-list">
                {report.trending.filter((row) => row.change != null).map((row) => (
                  <li key={row.label}>
                    <span>{row.change! > 0 ? "↑" : row.change! < 0 ? "↓" : "·"} {row.label}</span>
                    <b>{row.change! > 0 ? "+" : ""}{row.change}%</b>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          {report.support.visits > 0 ? (
            <Panel title="Support">
              <dl>
                <div><dt>Visits</dt><dd>{report.support.visits}</dd></div>
                <div><dt>Unique</dt><dd>{report.support.unique}</dd></div>
                <div><dt>Time</dt><dd>{clock(report.support.avgEngagementMs)}</dd></div>
                <div><dt>Tickets</dt><dd>{report.support.tickets}</dd></div>
                <div><dt>Returning</dt><dd>{report.support.repeat}</dd></div>
              </dl>
              {report.support.sources.length ? <Bars rows={report.support.sources} /> : null}
            </Panel>
          ) : (
            <p className="command-quiet">Support tracking is on. No support visits in this period.</p>
          )}

          {leads > 0 ? (
            <Panel title="Lead sources">
              <Bars rows={report.leadSources} />
            </Panel>
          ) : null}

          {aiHits > 0 ? (
            <Panel title="AI activity">
              <Bars rows={report.ai.referrals.filter((row) => row.count > 0)} />
            </Panel>
          ) : (
            <p className="command-quiet">AI tracking is on. No AI referrals in this period.</p>
          )}
        </>
      ) : (
        <>
          <section className="command-split">
            <Panel title="Browsers"><Bars rows={report.browsers} /></Panel>
            <Panel title="Systems"><Bars rows={report.systems} /></Panel>
            <Panel title="Screens"><Bars rows={report.screens} /></Panel>
            <Panel title="Devices"><Bars rows={report.devices} /></Panel>
          </section>
          <Panel title="Networks">
            {report.places.networks.length ? <Bars rows={report.places.networks} /> : <p className="command-quiet">No network name recorded in this period.</p>}
          </Panel>
          <Panel title="Crawlers and AI">
            {report.ai.crawlers.length ? (
              <table>
                <thead><tr><th>Crawler</th><th>Hits</th><th>First</th><th>Last</th></tr></thead>
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
            ) : (
              <p className="command-quiet">No known AI crawler in this period.</p>
            )}
            <Bars rows={report.ai.pages.map((row) => ({ label: row.path || "/", count: row.count }))} />
          </Panel>
          <Panel title="Event log">
            <ul className="command-feed">
              {(live?.feed ?? []).map((row, index) => (
                <li key={`${row.at}-${index}`}>
                  <span>{new Date(row.at).toLocaleTimeString()}</span>
                  <strong>{row.path}</strong>
                  <em>{row.detail || row.name}</em>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Pages">
            <table>
              <thead><tr><th>Page</th><th>Views</th><th>Entry</th><th>Exit</th><th>Time</th><th>Scroll</th></tr></thead>
              <tbody>
                {report.pages.map((row) => (
                  <tr key={row.path}>
                    <td>{row.path}</td><td>{row.views}</td><td>{row.entries}</td><td>{row.exits}</td>
                    <td>{clock(row.avgEngagementMs)}</td><td>{row.avgScroll}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <Panel title="Funnels">
            {report.funnels.map((funnel) => (
              <Funnel key={funnel.name} name={funnel.name} steps={funnel.steps} />
            ))}
          </Panel>
          {report.companyLookup ? (
            <Panel title="Organizations">
              {report.companies.length ? (
                <table>
                  <thead><tr><th>Organization</th><th>Visits</th><th>Location</th></tr></thead>
                  <tbody>
                    {report.companies.map((row) => (
                      <tr key={row.org_name}><td>{row.org_name}</td><td>{row.visits}</td><td>{row.location || "—"}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="command-quiet">The lookup key is set. No organization has been returned.</p>}
            </Panel>
          ) : null}
        </>
      )}
    </div>
  );
}

function pageLabel(path: string | undefined) {
  if (!path) return "—";
  const names: Record<string, string> = {
    "/": "Homepage",
    "/services/completecare": "CompleteCare",
    "/services/cybersecurity": "Cybersecurity",
    "/managed-it": "Managed IT",
    "/cybersecurity": "Cybersecurity",
    "/cloud-microsoft-365": "Cloud & M365",
    "/it-strategy": "IT Strategy",
    "/secureai": "SecureAI",
    "/support": "Support",
    "/contact": "Contact",
  };
  return names[path] ?? path;
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
  if (!rows.length) return null;
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

function Ranks({ rows, empty }: { rows: Topic[]; empty: string }) {
  if (!rows.length) return <p className="command-quiet">{empty}</p>;
  return (
    <ol className="command-ranks">
      {rows.map((row, index) => (
        <li key={row.label}>
          <strong>#{index + 1} {row.label}</strong>
          <span>{row.views} {row.views === 1 ? "visitor" : "visitors"}</span>
          <span>{clock(row.avgEngagementMs)} avg engagement</span>
        </li>
      ))}
    </ol>
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

function clock(ms: number) {
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes <= 0) return `${rest}s`;
  return `${minutes}m ${rest}s`;
}
