"use client";

import Link from "next/link";
import { SignalBackdrop } from "@/components/signal/SignalBackdrop";
import { SignalChapter } from "@/components/signal/SignalChapter";
import { setFocus, setPhase } from "@/components/signal/store";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { PageFade } from "@/components/layout/PageFade";
import { Breath } from "@/components/layout/Sheet";
import { GoldReveal } from "@/components/motion/GoldReveal";
import { SnapTarget } from "@/components/motion/SnapTarget";
import { Accordion } from "@/components/ui/Accordion";
import { PhaseLink } from "@/components/ui/PhaseLink";
import { industries, services, tiers } from "@/lib/content";
import { site } from "@/lib/site";

export function HomeView() {
  return (
    <>
      <SignalBackdrop phase="unmanaged" />
      <Nav />
      <PageFade>
        <main id="main" tabIndex={-1} className="relative z-10 pb-24 outline-none">
          <Hero />
          <Discovery />
          <Ownership />
          <Security />
          <Industries />
          <Response />
          <Strategy />
        </main>
      </PageFade>
      <SnapTarget>
        <Footer />
      </SnapTarget>
    </>
  );
}

function Hero() {
  return (
    <SignalChapter phase="unmanaged" id="chapter-unmanaged">
      <section className="flex min-h-[100svh] flex-col justify-end px-[var(--sheet-inset)] pb-[8vh] pt-[calc(var(--nav-h)+8vh)]">
        <p className="micro text-fg">Fort Wayne · Since {site.founded}</p>
        <h1 className="display mt-6 text-[clamp(3.2rem,10vw,8.4rem)]">
          IT that works
          <br />
          for you.
          <br />
          <span className="text-gold">
            Not the other
            <br />
            way around.
          </span>
        </h1>
        <p className="lede mt-10 max-w-[42ch]">
          Managed IT, cybersecurity, and compliance for Indiana businesses.
          We take ownership of the environment so the team can stay on the work.
        </p>
      </section>
    </SignalChapter>
  );
}

function Discovery() {
  return (
    <>
      <Breath size="sm" />
      <SignalChapter phase="discovery" id="chapter-discovery">
        <section className="px-[var(--sheet-inset)] py-10 md:py-14">
          <GoldReveal
            as="h2"
            className="display-wide chapter-display max-w-[18ch]"
            text="An unmanaged environment is a field of endpoints nobody is watching."
            marks={["unmanaged", "nobody"]}
          />
          <p className="lede mt-6 max-w-[42ch]">
            We start by seeing what is actually there. Then the field resolves
            onto a lattice — the same endpoints, finally accounted for.
          </p>
        </section>
      </SignalChapter>
    </>
  );
}

function Ownership() {
  return (
    <>
      <Breath size="sm" />
      <SignalChapter phase="ownership" id="chapter-ownership">
        <section className="px-[var(--sheet-inset)] py-10 md:py-14">
          <h2 className="display chapter-display max-w-[16ch]">
            CompleteCare is not support. It is a system.
          </h2>
          <p className="lede mt-5 max-w-[44ch]">
            Three tiers. The field organises around whichever one the
            environment needs — Base, Pro, or Premium.
          </p>
          <div className="mt-10">
            <Accordion
              items={tiers.map((tier) => ({
                id: tier.name,
                title: tier.name,
                statement: tier.statement,
                children: (
                  <ul className="space-y-3">
                    {tier.points.map((p, i) => (
                      <li key={p} className="flex gap-4 text-sm tracking-tight">
                        <span className="micro">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                ),
              }))}
              onChange={(i) => setFocus(i)}
            />
          </div>
        </section>
      </SignalChapter>
    </>
  );
}

function Security() {
  return (
    <>
      <Breath size="sm" />
      <SignalChapter phase="security" id="chapter-security">
        <section className="px-[var(--sheet-inset)] py-10 md:py-14">
          <GoldReveal
            as="h2"
            className="display chapter-display max-w-[18ch]"
            text="A perimeter forms. Threats are absorbed, not just reported."
            marks={["absorbed"]}
          />
          <p className="lede mt-6 max-w-[42ch]">
            NIST Cybersecurity Framework. HIPAA, PCI, and SEC compliance
            support.
          </p>
          <div className="mt-10 max-w-[42ch]">
            <h3 className="display text-[clamp(1.6rem,3vw,2.4rem)]">
              <span className="text-gold">SecureAI</span>
            </h3>
            <p className="lede mt-4">
              Sixty-plus models on one platform, with the data staying yours.
            </p>
            <Link
              href="/secureai"
              className="micro mt-5 inline-flex items-center gap-3 text-gold"
            >
              Read SecureAI <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </SignalChapter>
    </>
  );
}

function Industries() {
  return (
    <>
      <Breath size="sm" />
      <SignalChapter phase="industries" id="chapter-industries">
        <section className="px-[var(--sheet-inset)] py-10 md:py-14">
          <p className="lede max-w-[44ch]">
            Six practices. The field splits because the work is not generic,
            and neither is the environment.
          </p>
          <ol className="mt-10 divide-y divide-hairline border-y border-hairline">
            {industries.map((ind, i) => (
              <li key={ind.slug}>
                <PhaseLink
                  href={`/industries/${ind.slug}`}
                  phase="industries"
                  focus={i}
                  className="group flex items-baseline gap-[3vw] py-4 transition-colors hover:text-gold"
                >
                  <span className="micro w-8 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="display text-[clamp(1.4rem,2.8vw,2.2rem)]">
                    {ind.title}
                  </span>
                </PhaseLink>
              </li>
            ))}
          </ol>
        </section>
      </SignalChapter>
    </>
  );
}

function Response() {
  return (
    <>
      <Breath size="sm" />
      <SignalChapter phase="response" id="chapter-response">
        <section className="px-[var(--sheet-inset)] py-10 md:py-14">
          <GoldReveal
            as="h2"
            className="display chapter-display max-w-[18ch]"
            text="A pulse travels out. Most issues never reach the inbox."
            marks={["never"]}
          />
          <p className="lede mt-6 max-w-[42ch]">
            Continuous monitoring. Live U.S.-based support. Eyes On Site
            when the work still needs someone in the room. Existing client
            with an issue — the help desk picks it up.
          </p>
          <div className="mt-8 flex flex-wrap gap-8">
            <Link href="/support" className="micro text-gold">
              Request support →
            </Link>
                <Link href="/contact" className="micro hover:text-gold">
              New client →
            </Link>
          </div>
        </section>
      </SignalChapter>
    </>
  );
}

function Strategy() {
  return (
    <>
      <Breath size="sm" />
      <SignalChapter phase="strategy" id="chapter-strategy">
      <section className="px-[var(--sheet-inset)] pb-12">
        <h2 className="display chapter-display max-w-[16ch]">
          A partner, <span className="text-gold">not a vendor.</span>
        </h2>
        <p className="lede mt-6 max-w-[42ch]">
          Founded in Fort Wayne in {site.founded}. Largest Dell reseller in
          Northeast Indiana. One family of companies: 4EOS, Midwest VoIP,
          SafeHouse DataCenter. One number to call.
        </p>
        <Link href="/why-4eos" className="micro mt-8 inline-flex text-gold">
          Why 4EOS →
        </Link>
        <div className="mt-12">
          <Accordion
            items={services.map((s, i) => ({
              id: s.slug,
              index: String(i + 1).padStart(2, "0"),
              title: s.title,
              statement: s.statement,
              children: (
                <>
                  <p className="body-sm">{s.lede}</p>
                  <Link
                    href={`/services/${s.slug}`}
                    className="micro mt-6 inline-flex text-gold"
                  >
                    Read →
                  </Link>
                </>
              ),
            }))}
            onChange={(i) => setPhase(services[i].phase)}
          />
        </div>
      </section>
      </SignalChapter>
    </>
  );
}
