import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createConnectWiseTicket, connectwiseConfig } from "@/lib/connectwise";
import { salesEmail } from "@/lib/content";
import { site } from "@/lib/site";

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
  intent?: "assessment" | "support";
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
  const to = support ? (process.env.INTAKE_TO ?? site.helpdesk) : salesEmail;
  const from = process.env.INTAKE_FROM ?? "4EOS Website <onboarding@resend.dev>";

  const text = [
    `${intent} from ${name}`,
    `Email: ${email}`,
    body.company ? `Company: ${body.company}` : null,
    body.phone ? `Phone: ${body.phone}` : null,
    "",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  const company = body.company?.trim() || undefined;
  const phone = body.phone?.trim() || undefined;
  const connectwise = connectwiseConfig() !== null;
  let ticketOk = !connectwise;
  if (connectwise) {
    try {
      ticketOk = await createConnectWiseTicket({
        intent,
        name,
        email,
        company,
        phone,
        message,
      });
    } catch (error) {
      console.error("[connectwise]", error);
      ticketOk = false;
    }
  }

  let emailOk = !resend;
  if (resend) {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `${intent} — ${name}`,
      text,
    });
    emailOk = !error;
    if (error) console.error(error);
  }

  if (!connectwise && !resend) {
    console.log("[intake]", text);
    return NextResponse.json({ ok: true });
  }
  if (connectwise && !ticketOk) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  if (!connectwise && !emailOk) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
