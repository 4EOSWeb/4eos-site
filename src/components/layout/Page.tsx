import type { ReactNode } from "react";
import { SignalBackdrop } from "@/components/signal/SignalBackdrop";
import type { Phase } from "@/components/signal/formations";
import { FocusPin } from "./FocusPin";
import { Footer } from "./Footer";
import { Nav } from "./Nav";
import { PageFade } from "./PageFade";
import { PhasePin } from "./PhasePin";

/**
 * Every public page is a Signal, a nav, a content column, and a footer.
 * The live field is mounted once in the root layout; pages pin a formation
 * and keep a still poster for the no-JS / pre-WebGL frame.
 */
export function Page({
  phase,
  children,
  tone = "light",
  focus,
  zoom = false,
}: {
  phase: Phase;
  children: ReactNode;
  tone?: "light" | "dark";
  focus?: number;
  zoom?: boolean;
}) {
  return (
    <>
      <PhasePin phase={phase} />
      <FocusPin focus={focus} zoom={zoom} />
      <SignalBackdrop phase={phase} />
      <Nav tone={tone} />
      <PageFade>
        <main id="main" tabIndex={-1} className="relative z-10 pt-[var(--nav-h)] outline-none">
          {children}
        </main>
      </PageFade>
      <Footer />
    </>
  );
}
