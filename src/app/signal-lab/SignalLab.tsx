"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PHASES } from "@/components/signal/formations";
import { setPhase, signal } from "@/components/signal/store";

const SignalField = dynamic(
  () => import("@/components/signal/SignalField"),
  { ssr: false },
);

export function SignalLab() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setPhase(value);
    signal.rendered = value;
  }, [value]);

  // Hook for the screenshot script.
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__setSignalPhase = setValue;
  }, []);

  return (
    <>
      <SignalField tier="full" />
      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-3 bg-black/70 p-4 backdrop-blur">
        <input
          type="range"
          min={0}
          max={6}
          step={0.01}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full"
          aria-label="Signal phase"
        />
        <div className="flex justify-between micro text-fg-muted">
          {PHASES.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => setValue(i)}
              className={i === Math.round(value) ? "text-gold" : ""}
            >
              {i} {p}
            </button>
          ))}
        </div>
        <p className="micro text-fg-faint">phase {value.toFixed(2)}</p>
      </div>
    </>
  );
}
