# BauScope 3D: Frontend Patterns

A reference for building a Next.js 15 B2B landing page with Framer
Motion animations, Microsoft Graph email integration, and proper
SEO setup.

This repository documents the **frontend patterns** behind BauScope
3D, a German-language B2B landing page concept I designed and built
for an internal product idea around Matterport Pro3 scanning. The
prototype was never deployed to production. The patterns and code
snippets below are extracted from it, sanitized and generalized.

> The full source code of the prototype is **not** published here.
> This repository contains documentation and selected pattern
> snippets, not a deployable product. Real contact details, internal
> identifiers, and product imagery are not included.

---

## What this repo documents

A B2B landing page is more than a static site. Done well, it's:

- **Animated**: Framer Motion + IntersectionObserver patterns to
  make the page feel alive without being noisy.
- **Performant**: Next.js 15 App Router with proper metadata,
  sitemap, robots, structured data.
- **Functional**: a real contact form that actually delivers email
  via Microsoft Graph + Azure AD, not a mailto link.
- **Polished**: typography, scroll-snap sections, focus states
  built carefully.

The patterns extracted here are the reusable parts that any modern
B2B landing page benefits from.

---

## Repository structure

```
.
├── README.md                                  ← you are here
├── LICENSE                                    ← MIT
├── docs/
│   ├── architecture.md                        ← Next.js 15 App Router shape
│   ├── microsoft-graph-email.md               ← Azure AD client_credentials + sendMail
│   ├── scroll-animation-patterns.md           ← Framer Motion + IntersectionObserver
│   └── seo-structured-data.md                 ← JSON-LD + sitemap.ts + robots.ts
└── snippets/
    ├── README.md
    ├── api-contact-graph.ts                   ← API route: send email via Microsoft Graph
    ├── reveal-on-scroll.tsx                   ← Framer Motion reveal wrapper
    ├── typewriter-on-view.tsx                 ← Typewriter animation triggered by viewport
    ├── structured-data-jsonld.tsx             ← JSON-LD LocalBusiness schema
    └── nextjs-seo-metadata.ts                 ← sitemap.ts + robots.ts patterns
```

---

## Tech stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom theme tokens
- **Animation:** Framer Motion + native IntersectionObserver
- **Email backend:** Microsoft Graph + Azure AD client credentials
- **SEO:** JSON-LD structured data + sitemap + robots metadata files

---

## What this repo does NOT contain

To be honest about scope:

- **The full Next.js application**: the actual page composition,
  hero copy, services list, pricing tiers, gallery, and process
  illustration are not published. This repo documents the patterns
  that make those sections work, not the sections themselves.
- **Real contact data**: email addresses, phone numbers, and
  addresses in the snippets are placeholders. The real ones lived in
  `.env.local`.
- **Brand assets**: logos, custom imagery, and team photos used in
  the prototype are not included.
- **Vendor folders**: `node_modules/` is excluded; install via
  `npm install` if reusing snippets in your own project.

---

## About

Built by [Valentino Veljanovski](https://valentinoveljanovski.de),
self-taught automation developer based in München. Companion case
study at
[valentinoveljanovski.de/projects/bauscope-landing](https://valentinoveljanovski.de/projects/bauscope-landing).

Companion repositories on the same profile cover related work:

- [`Valentino-Veljanovski/DISPO`](https://github.com/Valentino-Veljanovski/DISPO):
  Microsoft 365 + DocuSign + AI-assisted operations
- [`Valentino-Veljanovski/Reklamation`](https://github.com/Valentino-Veljanovski/Reklamation):
  Slack-based case management
- [`Valentino-Veljanovski/BauScope-Control-Center`](https://github.com/Valentino-Veljanovski/BauScope-Control-Center):
  Role-based Slack platform with DocuSign HMAC

---

## Scope and Disclaimer

This repository contains **independent reference implementations** of
common industry patterns, written for educational and portfolio purposes.

The code in this repository:

- Is **not extracted** from any employer codebase.
- **Does not represent** the production source code of any system.
- **Does not contain** proprietary business logic, customer data,
  credentials, internal identifiers, environment-specific
  configuration, or workflow exports.
- Demonstrates **generic engineering patterns**: such as REST integrations,
  webhook signature verification, OAuth credential flows, document
  lifecycle handling, and message-queue style design, which are
  commonly applied across the industry and freely documented in
  vendor SDKs, RFC specifications, and other public technical material.

Specifically, this material is **author-original**: the patterns shown
here were written from scratch as illustrative examples to accompany the
author's portfolio case studies and design documentation. Any visual
similarity to internal systems at any specific employer is incidental;
the implementations here use only public APIs (Microsoft Graph, DocuSign
REST, Slack Web API, etc.) in the manner those vendors document.

## Viewing Notice

This repository is published for **portfolio demonstration and
educational viewing only**.

All code, documentation, diagrams, and content in this repository
remain the intellectual property of the author. **All rights reserved.**

No license is granted, expressed or implied, for reuse, redistribution,
modification, or commercial use of any material in this repository
without prior written permission from the author.

For licensing or collaboration inquiries, contact:
[valentinoveljanovski@outlook.com](mailto:valentinoveljanovski@outlook.com)
