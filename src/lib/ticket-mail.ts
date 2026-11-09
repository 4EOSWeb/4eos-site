/**
 * Form submissions open a ticket by emailing the help desk or sales mailbox
 * through the company SMTP server. ConnectWise (or whatever reads that
 * mailbox) creates the ticket. Nothing is sent until SMTP_HOST is set.
 *
 * SMTP_HOST, SMTP_PORT (587), SMTP_USER, SMTP_PASSWORD, SMTP_FROM.
 * SMTP_SECURE=true for implicit TLS on port 465. Port 587 uses STARTTLS.
 */

import nodemailer from "nodemailer";

export type TicketInput = {
  intent: "Assessment" | "Support";
  name: string;
  email: string;
  company?: string;
  phone?: string;
  topic?: string;
  message: string;
};

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

function oneLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function smtpReady() {
  return smtpConfig() !== null;
}

export function smtpConfig() {
  const host = env("SMTP_HOST");
  if (!host) return null;

  const port = Number(env("SMTP_PORT") || "587");
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;

  const secureFlag = env("SMTP_SECURE").toLowerCase();
  const secure = secureFlag === "true" || secureFlag === "1" || (secureFlag === "" && port === 465);
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASSWORD");
  const from = env("SMTP_FROM") || env("INTAKE_FROM") || user;
  if (!from) return null;

  return { host, port, secure, user, pass, from };
}

export function ticketText(input: TicketInput) {
  return [
    `${input.intent} from ${input.name}`,
    `Email: ${input.email}`,
    input.company ? `Company: ${input.company}` : null,
    input.phone ? `Phone: ${input.phone}` : null,
    input.topic ? `Topic: ${input.topic}` : null,
    "",
    input.message,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** Sends one ticket email. Returns false when the server rejects it. */
export async function sendTicketMail(input: TicketInput, to: string) {
  const config = smtpConfig();
  if (!config) return { ok: false as const };

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user ? { user: config.user, pass: config.pass } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  try {
    await transport.sendMail({
      from: config.from,
      to,
      replyTo: oneLine(input.email),
      subject: `${input.intent}: ${oneLine(input.name)}`.slice(0, 200),
      text: ticketText(input),
    });
    return { ok: true as const };
  } finally {
    transport.close();
  }
}
