"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/site/Button";
import { Glyph } from "@/components/site/Glyph";
import { topics, type TopicValue } from "@/lib/content";
import { site } from "@/lib/site";

type Fields = {
  name: string;
  email: string;
  company: string;
  phone: string;
  topic: TopicValue;
  message: string;
  company_url: string;
};

type Key = "name" | "email" | "message";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(key: Key, value: string): string | null {
  const v = value.trim();
  if (key === "name") return v.length > 1 ? null : "Enter your name so we know who to reply to.";
  if (key === "email") {
    if (!v) return "Enter an email address so we can reply.";
    return EMAIL.test(v) ? null : "That email address looks incomplete. Check it and try again.";
  }
  return v.length > 8 ? null : "Add a sentence or two about what you need, so the right person replies.";
}

export function IntakeForm({
  endpoint,
  intent,
  submitLabel = "Send",
  defaultTopic = "assessment",
  showTopic = true,
  compact = false,
}: {
  endpoint: "/api/contact" | "/api/support";
  intent: "assessment" | "support";
  submitLabel?: string;
  defaultTopic?: TopicValue;
  showTopic?: boolean;
  compact?: boolean;
}) {
  const uid = useId();
  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    company: "",
    phone: "",
    topic: defaultTopic,
    message: "",
    company_url: "",
  });
  const [touched, setTouched] = useState<Record<Key, boolean>>({ name: false, email: false, message: false });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [ticketId, setTicketId] = useState<string | null>(null);

  const errors: Record<Key, string | null> = {
    name: validate("name", fields.name),
    email: validate("email", fields.email),
    message: validate("message", fields.message),
  };

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ name: true, email: true, message: true });
    const first = (["name", "email", "message"] as Key[]).find((k) => errors[k]);
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const topicLabel = topics.find((t) => t.value === fields.topic)?.label;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, topic: showTopic ? topicLabel : undefined, intent }),
      });
      if (!res.ok) throw new Error("send failed");
      const data = (await res.json().catch(() => null)) as { ticketId?: unknown } | null;
      setTicketId(typeof data?.ticketId === "string" ? data.ticketId : null);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="form-status" data-tone="success" role="status">
        <Glyph name="check" size={20} />
        <div>
          <p className="font-semibold">Thank you. Your message is with the {intent === "support" ? "help desk" : "4EOS team"}.</p>
          <p className="body-sm mt-1">
            {ticketId ? `Your reference is ${ticketId}. ` : ""}
            {intent === "support"
              ? `If systems are down, call ${site.phone} now. Outages get priority.`
              : "Someone will reply within one business day."}
          </p>
        </div>
      </div>
    );
  }

  const sending = status === "sending";
  const field = (key: Key) => ({
    id: `${uid}-${key}`,
    name: key,
    value: fields[key],
    required: true,
    "aria-required": true,
    "aria-invalid": touched[key] && errors[key] ? true : undefined,
    "aria-describedby": `${uid}-${key}-help`,
    onBlur: () => setTouched((t) => ({ ...t, [key]: true })),
    disabled: sending,
    className: "input",
  });

  return (
    <form onSubmit={onSubmit} noValidate className="form" aria-describedby={`${uid}-privacy`}>
      <div className="form-row">
        <div className="field">
          <label htmlFor={`${uid}-name`} className="field-label">
            Name
          </label>
          <input {...field("name")} type="text" autoComplete="name" onChange={(e) => update("name", e.target.value)} />
          <Help id={`${uid}-name-help`} error={touched.name ? errors.name : null} />
        </div>
        <div className="field">
          <label htmlFor={`${uid}-email`} className="field-label">
            Work email
          </label>
          <input
            {...field("email")}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="name@company.com"
            onChange={(e) => update("email", e.target.value)}
          />
          <Help id={`${uid}-email-help`} error={touched.email ? errors.email : null} />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor={`${uid}-company`} className="field-label">
            Company <span>(optional)</span>
          </label>
          <input
            id={`${uid}-company`}
            name="company"
            type="text"
            autoComplete="organization"
            className="input"
            value={fields.company}
            disabled={sending}
            onChange={(e) => update("company", e.target.value)}
          />
          {compact ? null : <Help id={`${uid}-company-help`} />}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-phone`} className="field-label">
            Phone <span>(optional)</span>
          </label>
          <input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="(260) 555-0100"
            className="input"
            value={fields.phone}
            disabled={sending}
            onChange={(e) => update("phone", e.target.value)}
          />
          {compact ? null : <Help id={`${uid}-phone-help`} />}
        </div>
      </div>
      {showTopic ? (
        <div className="field">
          <label htmlFor={`${uid}-topic`} className="field-label">
            What can we help with?
          </label>
          <select
            id={`${uid}-topic`}
            name="topic"
            className="input"
            value={fields.topic}
            disabled={sending}
            onChange={(e) => update("topic", e.target.value as TopicValue)}
          >
            {topics.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="field">
        <label htmlFor={`${uid}-message`} className="field-label">
          {intent === "support" ? "What is happening?" : "Tell us about your business and what you need"}
        </label>
        <textarea {...field("message")} onChange={(e) => update("message", e.target.value)} />
        <Help
          id={`${uid}-message-help`}
          error={touched.message ? errors.message : null}
          hint={intent === "support" ? "Include the device or system and when it started." : "Team size, locations, and what is not working are all useful."}
        />
      </div>
      <div className="honeypot" aria-hidden="true">
        <label>
          Company website
          <input
            name="company_url"
            tabIndex={-1}
            autoComplete="off"
            value={fields.company_url}
            onChange={(e) => update("company_url", e.target.value)}
          />
        </label>
      </div>
      {status === "error" ? (
        <div className="form-status" data-tone="error" role="alert">
          <Glyph name="alert" size={20} />
          <p>
            Your message did not send. Try again, or call{" "}
            <a href={site.phoneHref} className="text-link">
              {site.phone}
            </a>
            .
          </p>
        </div>
      ) : null}
      <div className="actions">
        <Button type="submit" size="lg" loading={sending} disabled={sending}>
          {sending ? "Sending" : submitLabel}
        </Button>
      </div>
      <p id={`${uid}-privacy`} className="body-sm">
        We use these details only to reply. We never sell them.{" "}
        <Link href="/privacy" className="text-link">
          Read the privacy policy
        </Link>
        .
      </p>
    </form>
  );
}

function Help({ id, error, hint }: { id: string; error?: string | null; hint?: string }) {
  return (
    <p id={id} className="field-help" data-error={error ? "true" : undefined} aria-live="polite">
      {error ?? hint ?? ""}
    </p>
  );
}
