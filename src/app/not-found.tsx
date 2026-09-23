import Link from "next/link";
import { Page } from "@/components/layout/Page";

export default function NotFound() {
  return (
    <Page phase="unmanaged">
      <section className="px-[var(--sheet-inset)] py-[20vh]">
        <p className="micro text-fg-muted">404</p>
        <h1 className="display page-display mt-5 max-w-[14ch]">
          This page is not on the lattice.
        </h1>
        <Link href="/" className="micro mt-10 inline-flex text-gold">
          ← Home
        </Link>
      </section>
    </Page>
  );
}
