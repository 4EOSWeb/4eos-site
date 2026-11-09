"use client";

import { useState, type FormEvent } from "react";
import { ninjaSessionUrl } from "@/lib/ninja";

const ERROR = "Enter the numeric code your technician gave you.";

export function NinjaConnect() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const destination = ninjaSessionUrl(code);
    if (!destination) {
      setError(ERROR);
      return;
    }
    window.location.assign(destination);
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex w-full min-w-0 flex-col gap-3"
      aria-label="Start a NinjaOne remote support session"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="support-code" className="micro block text-fg-faint">
          Support code
        </label>
        <input
          id="support-code"
          name="code"
          value={code}
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          spellCheck={false}
          enterKeyHint="go"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "support-code-error" : "support-code-hint"}
          placeholder="0000000000"
          onChange={(event) => {
            setCode(event.target.value);
            if (error) setError(null);
          }}
          className="h-20 w-full min-w-0 rounded-[4px] border border-hairline-strong bg-bone/14 px-3 text-center text-[clamp(1.15rem,4.6vw,2.75rem)] tracking-[0.08em] text-fg placeholder:text-fg-faint focus:border-gold focus:outline-none sm:px-4 sm:tracking-[0.18em]"
        />
      </div>
      <p id="support-code-hint" className="body-sm">
        Numbers only. Your technician reads this code to you.
      </p>
      {error ? (
        <p id="support-code-error" className="body-sm text-gold" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        className="bar-btn bar-btn-fill mt-3 flex w-full"
        style={{ whiteSpace: "normal", height: "3.5rem", fontSize: "1.05rem" }}
      >
        Connect
      </button>
    </form>
  );
}
