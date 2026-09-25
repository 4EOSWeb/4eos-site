"use client";

import { useState } from "react";

export function LoginForm() {
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(false);
    const data = new FormData(event.currentTarget);
    const res = await fetch("/api/command/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: data.get("user"), password: data.get("password") }),
    });
    setPending(false);
    if (!res.ok) {
      setError(true);
      return;
    }
    window.location.href = "/command";
  }

  return (
    <form onSubmit={onSubmit} className="command-login">
      <p className="command-kicker">4EOS command</p>
      <h1>Sign in.</h1>
      <label>
        Username
        <input name="user" autoComplete="username" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error ? <p className="command-empty">That sign-in was refused.</p> : null}
      <button type="submit" disabled={pending}>
        {pending ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}
