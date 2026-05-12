# SEO with Next.js App Router

Three coordinated pieces give a Next.js 15 site solid SEO without
adding any third-party dependencies:

1. **Per-route metadata** — `metadata` exports for title, description,
   Open Graph, Twitter cards.
2. **`sitemap.ts`** — file-based dynamic sitemap.
3. **`robots.ts`** — file-based dynamic robots.txt.
4. **JSON-LD structured data** — `<script type="application/ld+json">`
   in the root layout for `LocalBusiness` schema.

All four are built into the Next.js App Router. No `next-sitemap`
package, no `react-helmet`, no manual XML files.

## Per-route metadata

In the App Router, every `page.tsx` and `layout.tsx` can export a
`metadata` object that Next compiles into proper `<head>` tags:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title — Brand",
  description: "Short, accurate description that shows in search results.",
  openGraph: {
    title: "Page Title — Brand",
    description: "Short, accurate description that shows in search results.",
    images: ["/og-image.jpg"],
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Title — Brand",
    description: "Short, accurate description that shows in search results.",
    images: ["/og-image.jpg"],
  },
};
```

The root layout sets the **defaults**; per-page metadata overrides
specific fields. Useful pattern: the layout sets the brand name in
the title template (`title: { template: "%s — Brand", default: "Brand" }`),
each page just sets its own title and the brand suffix is appended
automatically.

## `sitemap.ts`

A regular TypeScript file in `app/sitemap.ts`:

```ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://example.com";
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/impressum`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
```

Next compiles this into a real `/sitemap.xml` at build time. For a
small static site, returning a hardcoded list is fine. For a site
with dynamic content (blog posts, product pages), call your CMS or
database here and emit URLs for everything.

The full pattern, with both static and dynamic routes, is in
[`../snippets/nextjs-seo-metadata.ts`](../snippets/nextjs-seo-metadata.ts).

## `robots.ts`

Same pattern, different file:

```ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

Compiled to `/robots.txt`. The `sitemap` field is the absolute URL
that `sitemap.ts` will produce — Google's crawler reads
`robots.txt` first, finds the sitemap URL, and goes from there.

**Always disallow `/api/`.** Search engines have no business
crawling your form-submission endpoint. They'll fire POST requests
that can spam your downstream systems if the endpoint isn't
properly guarded.

## JSON-LD structured data

Search engines want more than your `<title>` and `<description>` —
they want machine-readable claims about who you are. JSON-LD is the
standard format. Drop a `<script type="application/ld+json">` in
your layout with a [`schema.org`](https://schema.org/docs/full.html)
object. Schemas Google specifically rewards: `LocalBusiness`,
`Organization`, `Product`, `FAQ`, `Article`, `Recipe`, `Event`.

For a B2B service business, `LocalBusiness` is the right choice:

```tsx
export default function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Your Business",
    description: "What you do, in one sentence.",
    url: "https://example.com",
    telephone: "+49-XX-XXXXXXX",
    email: "info@example.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "City",
      addressRegion: "Region",
      addressCountry: "DE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 48.1351,
      longitude: 11.582,
    },
    priceRange: "€€",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    sameAs: [
      "https://www.linkedin.com/company/...",
      "https://www.instagram.com/...",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

Drop this `<StructuredData />` somewhere in your root `layout.tsx`,
inside the `<body>`. It renders as a `<script>` tag with the JSON
inside; search engines parse it.

Validate your schema with Google's
[Rich Results Test](https://search.google.com/test/rich-results).

## What this setup does NOT do

- **It doesn't get you to page 1 of Google.** Real SEO is content
  + backlinks + technical correctness + time. This is the technical
  correctness piece, the floor. Without it, content can't rank.
  With only it, content still won't rank without the rest.
- **It doesn't track conversions.** Add Plausible, Umami, or
  Google Analytics separately.
- **It doesn't replace a sitemap submission.** Submit your sitemap
  URL via Google Search Console after deployment. The robots.txt
  link helps but explicit submission is faster.
- **It doesn't prevent spam crawlers.** Bad bots ignore robots.txt.
  For real protection, rate-limit at the edge (Vercel, Cloudflare).

## Failure modes

| Failure | Cause | Fix |
|---|---|---|
| Search Console says sitemap can't be parsed | Invalid `lastModified` (string instead of Date), wrong domain in URLs | Validate with the Search Console "Test sitemap" button |
| OG preview shows old image | Facebook cached the OG image | Use Facebook's [Sharing Debugger](https://developers.facebook.com/tools/debug/) to force re-fetch |
| Google ignores structured data | Schema validation errors, or schema for content that doesn't exist on the page | Run Rich Results Test, fix the errors |
| Twitter cards show no image | Image is `og:image` but not `twitter:image:src`, or image is too small | Twitter wants images at least 144×144 for `summary`, 300×157 for `summary_large_image` |
