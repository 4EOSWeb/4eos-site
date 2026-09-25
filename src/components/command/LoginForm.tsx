"use client";

import { useState } from "react";

export function LoginForm() {
  const [error, setError] = useState<"refused" | "unconfigured" | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const res = await fetch("/api/analytics/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: data.get("user"), password: data.get("password") }),
    });
    const body = (await res.json().catch(() => null)) as { reason?: string } | null;
    setPending(false);
    if (!res.ok) {
      setError(body?.reason === "unconfigured" ? "unconfigured" : "refused");
      return;
    }
    window.location.href = "/analytics";
  }

  return (
    <form onSubmit={onSubmit} className="command-login">
      <h1>Sign in.</h1>
      <label>
        Username
        <input name="user" autoComplete="username" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error === "unconfigured" ? (
        <p className="command-empty">The server has no ANALYTICS_USER or ANALYTICS_PASSWORD. Add both to .env and restart next start.</p>
      ) : null}
      {error === "refused" ? (
        <p className="command-empty">That sign-in was refused. The username must match ANALYTICS_USER exactly.</p>
      ) : null}
      <button type="submit" disabled={pending}>
        {pending ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}
