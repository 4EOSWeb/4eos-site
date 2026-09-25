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

Set `RESEND_API_KEY` and `INTAKE_TO` in the Vercel project so the contact and support forms actually send. Without them the route still returns 200 and logs the message.

The private analytics page is `/analytics`. Set `ANALYTICS_USER` and `ANALYTICS_PASSWORD` in `.env`, then restart `next start`. The SQLite file is created at `data/analytics/` on that restart. Leave `COMPANY_ENRICHMENT_KEY` empty until a lookup provider is chosen. `IPINFO_TOKEN` sends the visit address to IPinfo for city, state, and network, then drops the address.

Tickets are opened by a Rewst workflow, which talks to ConnectWise. Put `REWST_WEBHOOK_URL` in `.env` next to `package.json` (see `.env.example`). The value is the Core webhook trigger URL, `https://engine.rewst.io/webhooks/custom/trigger/{TriggerID}/{OrganizationID}`. Restart `next start` after changing that file. The form posts name, email, message, `request_type` (`assessment` or `support`), company, and phone. Company and phone are empty strings when left blank. The workflow sends an assessment to the sales board and a support request to the help desk board. Until the URL is set, the form only sends the email.

## Stack

Next.js App Router · React Three Fiber · GSAP + Lenis · Resend · MDX
