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

Tickets are created in ConnectWise Manage on the North America site, na.myconnectwise.net. Set `CONNECTWISE_COMPANY_ID`, `CONNECTWISE_PUBLIC_KEY`, `CONNECTWISE_PRIVATE_KEY`, `CONNECTWISE_CLIENT_ID`, `CONNECTWISE_TICKET_COMPANY_ID`, `CONNECTWISE_SALES_BOARD_ID`, and `CONNECTWISE_SUPPORT_BOARD_ID`. An assessment uses the sales board. A support request uses the help desk board. Until those are all set, the form only sends the email.

## Stack

Next.js App Router · React Three Fiber · GSAP + Lenis · Resend · MDX
