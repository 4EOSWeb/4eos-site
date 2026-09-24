import { Page } from "@/components/layout/Page";
import { BackLink } from "@/components/ui/BackLink";

export default function NotFound() {
  return (
    <Page phase="unmanaged">
      <section className="px-[var(--sheet-inset)] py-[12vh]">
        <BackLink href="/" label="Home" />
        <p className="micro field-copy mt-6 text-fg-muted">404</p>
        <h1 className="display page-display mt-5 max-w-[14ch]">
          This page is not on the lattice.
        </h1>
      </section>
    </Page>
  );
}
