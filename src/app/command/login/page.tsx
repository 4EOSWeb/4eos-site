import type { Metadata } from "next";
import { LoginForm } from "@/components/command/LoginForm";

export const metadata: Metadata = {
  title: "Command sign in",
  robots: { index: false, follow: false },
};

export default function CommandLoginPage() {
  return (
    <main id="main" className="command-shell">
      <LoginForm />
    </main>
  );
}
