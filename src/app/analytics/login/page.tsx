import type { Metadata } from "next";
import { LoginForm } from "@/components/command/LoginForm";

export const metadata: Metadata = {
  title: "Analytics sign in",
  robots: { index: false, follow: false },
};

export default function CommandLoginPage() {
  return (
    <main id="main" className="command-shell command-gate">
      <LoginForm />
    </main>
  );
}
