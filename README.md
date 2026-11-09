# 4EOS — The Operational Signal

The 4eos.com rebuild. Next.js, TypeScript, Tailwind v4. A persistent WebGL
point field carries the narrative; content lives on floating sheets above it.

## Local

```bash
npm install
npm run dev
```

Forms log to the console unless `RESEND_API_KEY` is set. See `.env.example`.

## Signal

`/signal-lab` is a noindex harness for the seven formations. It is not linked
from the site.

## Deploy

The production build is `npm run build`. Vercel is the host.

```bash
npx vercel login
npx vercel --prod
```

Contact and support forms email a ticket through SMTP. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` (see `.env.example`). On the Azure web app, set those same names under Configuration. Restart `next start` after changing the local file. Support goes to `INTAKE_TO`, or `helpdesk@4eos.com` when that is empty. An assessment goes to `sales@4eos.com`. The visitor's address is the reply-to. The form sends name, email, message, company, and phone. Company and phone are omitted when left blank. Without `SMTP_HOST` the form falls back to Resend when `RESEND_API_KEY` is set, and otherwise logs the message and returns 200.

The private analytics page is `/analytics`. Set `ANALYTICS_USER` and `ANALYTICS_PASSWORD` in `.env`, then restart `next start`. The SQLite file is created at `data/analytics/` on that restart. Leave `COMPANY_ENRICHMENT_KEY` empty until a lookup provider is chosen. `IPINFO_TOKEN` sends the visit address to IPinfo for city, state, and network, then drops the address.

## Stack

Next.js App Router · React Three Fiber · GSAP + Lenis · SMTP · MDX
