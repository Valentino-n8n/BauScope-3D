# Architecture

Next.js 15 with the App Router. One marketing site, one API route,
nothing more complex than that. The interesting parts are in how
the pieces connect, not how many pieces there are.

## High-level shape

```
┌── app/ ─────────────────────────────────────────────────────────┐
│                                                                  │
│  layout.tsx          ← Root layout, fonts, structured data tag   │
│  page.tsx            ← Main landing page (composed of sections)  │
│                                                                  │
│  kontakt/page.tsx    ← Contact page (uses the same form)         │
│  impressum/page.tsx  ← Required German Impressum                 │
│  datenschutz/page.tsx← Privacy policy                            │
│  agb/page.tsx        ← Terms & conditions                        │
│  logo-export/page.tsx← Internal logo export tool                 │
│                                                                  │
│  api/contact/route.ts← POST endpoint, sends email via Graph API  │
│                                                                  │
│  sitemap.ts          ← Dynamic sitemap                           │
│  robots.ts           ← Dynamic robots.txt                        │
│  globals.css         ← Tailwind + custom CSS variables           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌── components/ ──────────────────────────────────────────────────┐
│                                                                  │
│  Hero, Header, Footer    ← layout primitives                     │
│  Leistungen (Services)   ← service grid                          │
│  Pakete (Pricing)        ← three-tier pricing cards              │
│  Galerie (Gallery)       ← image gallery                         │
│  Prozess (Process)       ← step-by-step illustration             │
│  UeberUns (About)        ← team / company section                │
│  KontaktForm             ← contact form (client-side)            │
│                                                                  │
│  Reveal                  ← Framer Motion scroll-reveal wrapper   │
│  TypewriterOnView        ← Typewriter triggered by viewport      │
│  Typewriter              ← Underlying typewriter primitive       │
│  Section                 ← Snap-scroll section primitive         │
│  Logo                    ← Animated SVG logo                     │
│  StructuredData          ← JSON-LD <script> tag                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Why this shape

Three boring decisions that pay off:

**1. App Router, not Pages Router.** Next.js 15's App Router gives
file-based metadata (`sitemap.ts` and `robots.ts` as regular
TypeScript files instead of static XML/text), server components by
default (smaller client bundles), and clean API route conventions
(`route.ts` next to `page.tsx`).

**2. Section components composed on `page.tsx`, not split across
routes.** A landing page is a single scroll. Splitting Hero,
Services, Pricing, Gallery, etc. into separate routes would break
that. Keeping them as components composed on one page lets each
section animate as it scrolls into view, with the URL staying at `/`.

**3. One API route, server-only secrets.** The contact form posts
to `/api/contact`, which runs on the server. The Azure AD secrets
that send the email never reach the browser. The form on the client
only knows the endpoint URL and what to POST.

## Snap scrolling

Each section is a `snap-start` block in the body. The user scrolls,
the browser locks each section to the top of the viewport. Combined
with `Reveal` and `TypewriterOnView`, each section animates into
view as the user lands on it. See
[`scroll-animation-patterns.md`](./scroll-animation-patterns.md).

## SEO setup

Three coordinated pieces:

- **Per-route metadata** via `layout.tsx` and per-page `metadata`
  exports — sets title, description, Open Graph, Twitter cards.
- **`sitemap.ts`** — emits the XML sitemap. As pages grow, they
  add themselves here.
- **`robots.ts`** — emits robots.txt with allow/disallow rules,
  pointing to the sitemap.
- **`StructuredData` component** — injects a JSON-LD `<script>` in
  the root layout for `LocalBusiness` schema. Search engines and
  AI crawlers parse this for rich results.

See [`seo-structured-data.md`](./seo-structured-data.md) for the
full pattern.

## Email backend

The contact form's API route uses Azure AD's client credentials
flow to obtain a Microsoft Graph token, then calls
`/users/{senderEmail}/sendMail` with a fully-formatted HTML email.

This is more work than mailto, more work than a simple SMTP
nodemailer setup, but it has real benefits:

- **No SMTP credentials in env vars.** OAuth client secret instead,
  rotatable via Azure AD.
- **Mail goes through the company's Microsoft 365 tenant.**
  Deliverability is the same as any internal email — recipients
  trust it because it's from a real domain account.
- **Sent items are saved to the sender's Outlook.** A real audit
  trail in the company's existing systems, no separate database
  needed.

See [`microsoft-graph-email.md`](./microsoft-graph-email.md).

## What's not in this architecture

A few things this prototype deliberately doesn't have:

- **No CMS.** Copy is hardcoded in components. For a marketing site
  that changes weekly, you'd want Contentful / Sanity / etc.
  Concept-stage projects don't need that overhead.
- **No analytics.** Not because it's bad, just not added yet.
- **No A/B testing framework.** Same reason.
- **No i18n.** German-only for the target audience. A future
  multilingual version would use `next-intl`.
- **No newsletter.** Contact form only.
