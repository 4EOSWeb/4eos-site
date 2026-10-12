/**
 * Form submissions open a ConnectWise ticket through a Rewst webhook.
 * Rewst owns the Manage connection. This stays off until the URL is set.
 *
 * REWST_WEBHOOK_URL   https://engine.rewst.io/webhooks/custom/trigger/{TriggerID}/{OrganizationID}
 *
 * The body is name, email, message, request_type (`assessment` or
 * `support`), company, and phone. Company and phone are empty strings when
 * the person left them blank, so the workflow can fall back to Catchall.
 * Assessment goes to the sales board and support goes to the help desk.
 * The trigger answers before the ticket exists, so a ticket id comes back
 * only if the workflow includes one in its response.
 */

export type TicketInput = {
  intent: "Assessment" | "Support";
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
};

export function rewstWebhookUrl() {
  // Bracket access stays a runtime read. A static process.env.REWST_WEBHOOK_URL
  // lookup can be frozen at `next build`, which would ignore a .env added later.
  const value = process.env["REWST_WEBHOOK_URL"]?.trim();
  if (!value?.startsWith("https://")) return null;
  return value;
}

export function rewstPayload(input: TicketInput) {
  return {
    name: input.name,
    email: input.email,
    message: input.message,
    request_type: input.intent === "Support" ? "support" : "assessment",
    company: input.company?.trim() ?? "",
    phone: input.phone?.trim() ?? "",
  };
}

function ticketIdFrom(value: unknown, depth = 0): string | null {
  if (!value || typeof value !== "object" || depth > 2) return null;
  const record = value as Record<string, unknown>;
  for (const key of ["ticket_id", "ticketId"]) {
    const found = record[key];
    if (typeof found === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(found.trim())) {
      return found.trim();
    }
    if (typeof found === "number" && Number.isInteger(found) && found > 0) {
      return String(found);
    }
  }
  return ticketIdFrom(record.data, depth + 1) ?? ticketIdFrom(record.result, depth + 1);
}

/** Posts one submission. Returns false when Rewst rejects it. */
export async function postRewstTicket(input: TicketInput) {
  const url = rewstWebhookUrl();
  if (!url) return { ok: false as const, ticketId: null };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rewstPayload(input)),
    signal: AbortSignal.timeout(20_000),
  });

  const detail = await response.text();
  if (!response.ok) {
    console.error("[rewst]", response.status, detail.slice(0, 500));
    return { ok: false as const, ticketId: null };
  }

  let ticketId: string | null = null;
  if (detail.trim()) {
    try {
      ticketId = ticketIdFrom(JSON.parse(detail));
    } catch {
      ticketId = null;
    }
  }
  return { ok: true as const, ticketId };
}
