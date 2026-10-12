import type { Metadata } from "next";
import { CommandRoom } from "@/components/command/CommandRoom";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export default function CommandPage() {
  return (
    <main id="main" className="command-shell">
      <CommandRoom />
    </main>
  );
}
