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

Tickets are opened by a Rewst workflow, which talks to ConnectWise. Set `REWST_WEBHOOK_URL` to the Core webhook trigger URL (`https://engine.rewst.io/webhooks/custom/trigger/{TriggerID}/{OrganizationID}`). The form posts name, email, message, and `request_type` (`assessment` or `support`), plus company and phone when they were typed. The workflow sends an assessment to the sales board and a support request to the help desk board. If the trigger waits for the workflow and returns `ticket_id`, the form shows that number. Until the URL is set, the form only sends the email.

## Stack

Next.js App Router · React Three Fiber · GSAP + Lenis · Resend · MDX
