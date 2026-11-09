import { NextResponse } from "next/server";
import { Resend } from "resend";
import { recordFormLead } from "@/lib/analytics/ingest";
import { salesEmail } from "@/lib/content";
import { site } from "@/lib/site";
import { sendTicketMail, smtpReady, ticketText, type TicketInput } from "@/lib/ticket-mail";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type Payload = {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  message?: string;
  company_url?: string;
  topic?: string;
  intent?: "assessment" | "support";
  /** "quiz" when the request came from the risk quiz result card. */
  detail?: string;
};

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Honeypot: bots fill this, people never see it.
  if (body.company_url) return NextResponse.json({ ok: true });

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  if (name.length < 2 || !email.includes("@") || message.length < 8) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const support = body.intent === "support";
  const intent = support ? "Support" : "Assessment";
  const to = support ? (process.env.INTAKE_TO?.trim() || site.helpdesk) : salesEmail;
  const topic = body.topic ? String(body.topic).slice(0, 80) : undefined;
  const ticket: TicketInput = {
    intent,
    name,
    email,
    company: body.company?.trim() || undefined,
    phone: body.phone?.trim() || undefined,
    topic,
    message,
  };
  const text = ticketText(ticket);

  if (smtpReady()) {
    try {
      const sent = await sendTicketMail(ticket, to);
      if (!sent.ok) return NextResponse.json({ ok: false }, { status: 502 });
    } catch (error) {
      console.error("[smtp]", error);
      return NextResponse.json({ ok: false }, { status: 502 });
    }
  } else if (resend) {
    const from = process.env.INTAKE_FROM ?? "4EOS Website <onboarding@resend.dev>";
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `${intent}: ${name}`.slice(0, 200),
      text,
    });
    if (error) {
      console.error(error);
      return NextResponse.json({ ok: false }, { status: 502 });
    }
  } else {
    console.log("[intake]", text);
    return NextResponse.json({ ok: true });
  }

  try {
    const kind = support ? "support" : body.detail === "quiz" ? "quiz" : "assessment";
    recordFormLead(kind, request.headers.get("cookie"));
  } catch (error) {
    console.error("[signal]", error);
  }

  return NextResponse.json({ ok: true });
}
