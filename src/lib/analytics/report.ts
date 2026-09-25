import { analyticsDb } from "./db";
import { companyLookupEnabled } from "./enrich";
import { contentOf } from "./paths";

export type RangeKey = "day" | "week" | "month" | "quarter" | "year";

const RANGES: Record<RangeKey, number> = {
  day: 86_400_000,
  week: 7 * 86_400_000,
  month: 30 * 86_400_000,
  quarter: 90 * 86_400_000,
  year: 365 * 86_400_000,
};

export function rangeWindow(key: RangeKey, now = Date.now()) {
  const span = RANGES[key] ?? RANGES.month;
  return { from: now - span, to: now, key };
}

type SessionRow = {
  id: string;
  visitor_id: string;
  started_at: number;
  last_seen: number;
  entry_path: string;
  exit_path: string;
  trail: string;
  source_class: string;
  source_label: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  screen: string | null;
  connection: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  isp: string | null;
  page_count: number;
  engagement_ms: number;
  max_scroll: number;
  lead: number;
};

export function buildReport(key: RangeKey) {
  const { from, to } = rangeWindow(key);
  const db = analyticsDb();
  const sessions = db
    .prepare(
      `SELECT * FROM sessions WHERE kind = 'visitor' AND started_at >= ? AND started_at < ?`,
    )
    .all(from, to) as SessionRow[];

  const visitorIds = new Set(sessions.map((s) => s.visitor_id));
  const firstSeen = new Map<string, number>();
  if (visitorIds.size) {
    const rows = db.prepare("SELECT id, first_seen FROM visitors").all() as { id: string; first_seen: number }[];
    for (const row of rows) firstSeen.set(row.id, row.first_seen);
  }

  let newVisitors = 0;
  let returning = 0;
  for (const id of visitorIds) {
    const first = firstSeen.get(id) ?? from;
    if (first >= from) newVisitors += 1;
    else returning += 1;
  }

  const engaged = sessions.filter((s) => s.engagement_ms >= 10_000 || s.page_count >= 2 || s.lead === 1);
  const bounced = sessions.filter((s) => s.page_count <= 1 && s.engagement_ms < 10_000 && s.lead === 0);
  const duration = sessions.reduce((sum, s) => sum + Math.max(0, s.last_seen - s.started_at), 0);
  const pages = sessions.reduce((sum, s) => sum + s.page_count, 0);
  const leads = sessions.filter((s) => s.lead === 1).length;

  const activeNow = (
    db.prepare("SELECT COUNT(*) AS n FROM sessions WHERE kind = 'visitor' AND last_seen >= ?").get(to - 5 * 60_000) as {
      n: number;
    }
  ).n;

  return {
    range: key,
    from,
    to,
    overview: {
      visitors: sessions.length,
      unique: visitorIds.size,
      returning,
      new: newVisitors,
      avgSessionMs: sessions.length ? Math.round(duration / sessions.length) : 0,
      pagesPerSession: sessions.length ? round1(pages / sessions.length) : 0,
      bounceRate: sessions.length ? round1((bounced.length / sessions.length) * 100) : 0,
      engagementRate: sessions.length ? round1((engaged.length / sessions.length) * 100) : 0,
      activeNow,
      leads,
      conversion: sessions.length ? round1((leads / sessions.length) * 100) : 0,
    },
    trend: trend(sessions, key, from, to),
    peaks: peaks(sessions),
    devices: count(sessions, (s) => s.device || "unknown"),
    browsers: count(sessions, (s) => s.browser || "Other"),
    systems: count(sessions, (s) => s.os || "Other"),
    screens: count(sessions, (s) => s.screen || "Unknown"),
    connections: count(
      sessions.filter((s) => s.connection),
      (s) => s.connection || "",
    ),
    places: {
      countries: count(sessions.filter((s) => s.country), (s) => s.country || ""),
      regions: count(sessions.filter((s) => s.region), (s) => [s.region, s.country].filter(Boolean).join(", ")),
      cities: count(sessions.filter((s) => s.city), (s) => [s.city, s.region].filter(Boolean).join(", ")),
      isps: count(sessions.filter((s) => s.isp), (s) => s.isp || ""),
    },
    acquisition: acquisition(sessions),
    pages: pagesReport(sessions),
    services: topicReport(sessions, "service"),
    industries: topicReport(sessions, "industry"),
    journeys: journeys(sessions),
    support: supportReport(sessions, from, to),
    leads: leadReport(from, to, sessions.length),
    funnels: funnels(sessions),
    ai: aiReport(from, to),
    companies: companyReport(),
    companyLookup: companyLookupEnabled(),
    months: monthCards(),
    score: score(sessions),
  };
}

export function buildLive() {
  const db = analyticsDb();
  const since = Date.now() - 5 * 60_000;
  const active = db
    .prepare(
      `SELECT city, region, country, device, source_label, exit_path FROM sessions
       WHERE kind = 'visitor' AND last_seen >= ? ORDER BY last_seen DESC LIMIT 40`,
    )
    .all(since) as {
    city: string | null;
    region: string | null;
    country: string | null;
    device: string | null;
    source_label: string;
    exit_path: string;
  }[];
  const feed = db
    .prepare(
      `SELECT at, path, detail, name FROM events
       WHERE kind = 'visitor' AND name != 'heartbeat' ORDER BY at DESC LIMIT 18`,
    )
    .all() as { at: number; path: string | null; detail: string | null; name: string }[];
  const locations = new Map<string, number>();
  for (const row of active) {
    const label = [row.city, row.region, row.country].filter(Boolean).join(", ");
    if (!label) continue;
    locations.set(label, (locations.get(label) ?? 0) + 1);
  }
  return {
    active: active.length,
    locations: [...locations.entries()].map(([label, count]) => ({ label, count })),
    feed: feed.map((row) => ({
      at: row.at,
      path: row.path,
      name: row.name,
      detail: row.detail,
    })),
    here: active.map((row) => ({
      path: row.exit_path,
      source: row.source_label,
      device: row.device,
      where: [row.city, row.region].filter(Boolean).join(", ") || null,
    })),
  };
}

function score(sessions: SessionRow[]) {
  const industries = topicReport(sessions, "industry");
  const services = topicReport(sessions, "service");
  const sources = acquisition(sessions);
  const bestSource = [...sources].sort((a, b) => b.leads - a.leads || b.visitors - a.visitors)[0];
  return {
    topIndustry: industries[0]?.label ?? null,
    topService: services[0]?.label ?? null,
    bestSource: bestSource?.label ?? null,
  };
}

function trend(sessions: SessionRow[], key: RangeKey, from: number, to: number) {
  const buckets = new Map<number, { t: number; visitors: number; leads: number }>();
  const step = key === "day" ? 3_600_000 : key === "year" ? 30 * 86_400_000 : key === "quarter" ? 7 * 86_400_000 : 86_400_000;
  for (let t = from; t < to; t += step) buckets.set(t, { t, visitors: 0, leads: 0 });
  for (const session of sessions) {
    const slot = from + Math.floor((session.started_at - from) / step) * step;
    const bucket = buckets.get(slot);
    if (!bucket) continue;
    bucket.visitors += 1;
    if (session.lead) bucket.leads += 1;
  }
  return [...buckets.values()];
}

function peaks(sessions: SessionRow[]) {
  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, visitors: 0 }));
  for (const session of sessions) hours[new Date(session.started_at).getUTCHours()]!.visitors += 1;
  return hours;
}

function count(rows: SessionRow[], pick: (row: SessionRow) => string) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = pick(row);
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

function acquisition(sessions: SessionRow[]) {
  const map = new Map<string, { label: string; visitors: number; leads: number }>();
  for (const session of sessions) {
    const key = `${session.source_class}:${session.source_label}`;
    const row = map.get(key) ?? { label: session.source_label, visitors: 0, leads: 0 };
    row.visitors += 1;
    if (session.lead) row.leads += 1;
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => b.visitors - a.visitors);
}

function pagesReport(sessions: SessionRow[]) {
  const map = new Map<string, { path: string; views: number; entries: number; exits: number; engagement: number; scroll: number; n: number }>();
  for (const session of sessions) {
    for (const path of session.trail.split("|")) {
      const row = map.get(path) ?? { path, views: 0, entries: 0, exits: 0, engagement: 0, scroll: 0, n: 0 };
      row.views += 1;
      map.set(path, row);
    }
    const entry = map.get(session.entry_path);
    if (entry) entry.entries += 1;
    const exit = map.get(session.exit_path);
    if (exit) {
      exit.exits += 1;
      exit.engagement += session.engagement_ms;
      exit.scroll += session.max_scroll;
      exit.n += 1;
    }
  }
  return [...map.values()]
    .map((row) => ({
      path: row.path,
      views: row.views,
      entries: row.entries,
      exits: row.exits,
      avgEngagementMs: row.n ? Math.round(row.engagement / row.n) : 0,
      avgScroll: row.n ? Math.round(row.scroll / row.n) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 16);
}

function topicReport(sessions: SessionRow[], kind: "service" | "industry") {
  const map = new Map<string, { label: string; views: number; engagement: number; leads: number; returning: number; visitors: Set<string> }>();
  for (const session of sessions) {
    const seen = new Set<string>();
    for (const path of session.trail.split("|")) {
      const topic = contentOf(path);
      if (!topic || topic.kind !== kind || topic.label === "Services" || topic.label === "Industries") continue;
      if (seen.has(topic.label)) continue;
      seen.add(topic.label);
      const row = map.get(topic.label) ?? {
        label: topic.label,
        views: 0,
        engagement: 0,
        leads: 0,
        returning: 0,
        visitors: new Set<string>(),
      };
      row.views += 1;
      row.engagement += session.engagement_ms;
      if (session.lead) row.leads += 1;
      row.visitors.add(session.visitor_id);
      map.set(topic.label, row);
    }
  }
  const db = analyticsDb();
  return [...map.values()]
    .map((row) => {
      let prior = 0;
      for (const id of row.visitors) {
        const first = db.prepare("SELECT first_seen FROM visitors WHERE id = ?").get(id) as { first_seen: number } | undefined;
        const session = sessions.find((s) => s.visitor_id === id);
        if (first && session && first.first_seen < session.started_at - 60_000) prior += 1;
      }
      return {
        label: row.label,
        views: row.views,
        avgEngagementMs: row.views ? Math.round(row.engagement / row.views) : 0,
        conversion: row.views ? round1((row.leads / row.views) * 100) : 0,
        returnRate: row.visitors.size ? round1((prior / row.visitors.size) * 100) : 0,
      };
    })
    .sort((a, b) => b.views - a.views);
}

function journeys(sessions: SessionRow[]) {
  const map = new Map<string, number>();
  for (const session of sessions) {
    const trail = session.trail.split("|").filter(Boolean);
    if (trail.length < 2) continue;
    const key = trail.join(" → ");
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function supportReport(sessions: SessionRow[], from: number, to: number) {
  const hits = sessions.filter((s) => s.trail.split("|").includes("/support"));
  const visitors = new Set(hits.map((s) => s.visitor_id));
  const db = analyticsDb();
  let repeat = 0;
  for (const id of visitors) {
    const n = db
      .prepare(
        `SELECT COUNT(*) AS n FROM sessions WHERE visitor_id = ? AND kind = 'visitor' AND trail LIKE '%/support%' AND started_at < ?`,
      )
      .get(id, to) as { n: number };
    if (n.n > 1) repeat += 1;
  }
  const sources = new Map<string, number>();
  let time = 0;
  for (const session of hits) {
    sources.set(session.source_label, (sources.get(session.source_label) ?? 0) + 1);
    time += session.engagement_ms;
  }
  const actions = db
    .prepare(
      `SELECT detail, COUNT(*) AS n FROM events
       WHERE kind = 'visitor' AND name = 'click' AND path = '/support' AND at >= ? AND at < ?
       GROUP BY detail ORDER BY n DESC`,
    )
    .all(from, to) as { detail: string | null; n: number }[];
  return {
    visits: hits.length,
    unique: visitors.size,
    repeat,
    avgEngagementMs: hits.length ? Math.round(time / hits.length) : 0,
    sources: [...sources.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
    actions: actions.map((row) => ({ label: row.detail || "click", count: row.n })),
  };
}

function leadReport(from: number, to: number, sessions: number) {
  const db = analyticsDb();
  const rows = db
    .prepare(
      `SELECT name, detail, COUNT(*) AS n FROM events
       WHERE kind = 'visitor' AND at >= ? AND at < ? AND name IN ('form_submit', 'click')
       GROUP BY name, detail`,
    )
    .all(from, to) as { name: string; detail: string | null; n: number }[];
  const pick = (name: string, detail: string) => rows.find((row) => row.name === name && row.detail === detail)?.n ?? 0;
  const assessment = pick("form_submit", "assessment");
  const support = pick("form_submit", "support");
  const phone = pick("click", "tel");
  const email = pick("click", "mailto");
  const cta = pick("click", "cta");
  const total = assessment + support + phone + email;
  return {
    assessment,
    support,
    phone,
    email,
    cta,
    total,
    conversion: sessions ? round1((total / sessions) * 100) : 0,
  };
}

function funnels(sessions: SessionRow[]) {
  const defs = [
    { name: "Industry, then service, then contact", test: [/\/industries\/[^/]+/, /\/services\/[^/]+|\/secureai/, /\/contact/] },
    { name: "Service, then contact", test: [/\/services\/[^/]+|\/secureai/, /\/contact/] },
    { name: "Support, then a service", test: [/\/support/, /\/services\/[^/]+|\/secureai/] },
  ];
  return defs.map((def) => {
    const steps = def.test.map(() => 0);
    for (const session of sessions) {
      const trail = session.trail.split("|");
      let at = 0;
      for (const path of trail) {
        if (at < def.test.length && def.test[at]!.test(path)) {
          steps[at] += 1;
          at += 1;
        }
      }
    }
    return {
      name: def.name,
      steps: def.test.map((pattern, index) => ({
        label: labelFor(pattern),
        count: steps[index] ?? 0,
      })),
    };
  });
}

function labelFor(pattern: RegExp) {
  const source = pattern.source;
  if (source.includes("industries")) return "Industry";
  if (source.includes("support")) return "Support";
  if (source.includes("contact")) return "Contact";
  return "Service";
}

function aiReport(from: number, to: number) {
  const db = analyticsDb();
  const referrals = db
    .prepare(
      `SELECT source_label AS label, COUNT(*) AS n FROM sessions
       WHERE kind = 'visitor' AND source_class = 'ai' AND started_at >= ? AND started_at < ?
       GROUP BY source_label ORDER BY n DESC`,
    )
    .all(from, to) as { label: string; n: number }[];
  const crawlers = db
    .prepare(
      `SELECT detail AS label, COUNT(*) AS n FROM events
       WHERE kind = 'crawler' AND at >= ? AND at < ? GROUP BY detail ORDER BY n DESC`,
    )
    .all(from, to) as { label: string | null; n: number }[];
  const pages = db
    .prepare(
      `SELECT path, COUNT(*) AS n FROM events
       WHERE kind = 'crawler' AND at >= ? AND at < ? GROUP BY path ORDER BY n DESC LIMIT 12`,
    )
    .all(from, to) as { path: string | null; n: number }[];
  const industry = pages.filter((row) => row.path?.startsWith("/industries/"));
  const service = pages.filter((row) => row.path?.startsWith("/services/") || row.path === "/secureai");
  return {
    referrals: referrals.map((row) => ({ label: row.label, count: row.n })),
    crawlers: crawlers.map((row) => ({ label: row.label || "Crawler", count: row.n })),
    pages: pages.map((row) => ({ path: row.path, count: row.n })),
    industry: industry.map((row) => ({ path: row.path, count: row.n })),
    service: service.map((row) => ({ path: row.path, count: row.n })),
  };
}

function companyReport() {
  if (!companyLookupEnabled()) return [];
  const db = analyticsDb();
  return db
    .prepare("SELECT org_name, location, first_seen, last_seen, visits, pages FROM companies ORDER BY last_seen DESC LIMIT 20")
    .all() as {
    org_name: string;
    location: string | null;
    first_seen: number;
    last_seen: number;
    visits: number;
    pages: string;
  }[];
}

function monthCards() {
  const db = analyticsDb();
  const now = new Date();
  const cards = [];
  for (let i = 0; i < 3; i += 1) {
    const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1);
    const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1);
    const sessions = db
      .prepare("SELECT * FROM sessions WHERE kind = 'visitor' AND started_at >= ? AND started_at < ?")
      .all(start, end) as SessionRow[];
    const leads = sessions.filter((s) => s.lead).length;
    const industries = topicReport(sessions, "industry");
    const services = topicReport(sessions, "service");
    cards.push({
      label: new Date(start).toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
      visitors: sessions.length,
      leads,
      topIndustry: industries[0]?.label ?? "—",
      topService: services[0]?.label ?? "—",
    });
  }
  return cards;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
