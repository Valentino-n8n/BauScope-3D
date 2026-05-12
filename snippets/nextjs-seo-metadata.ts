/**
 * Next.js App Router SEO files — sitemap.ts and robots.ts
 * =======================================================
 *
 * Two file-based metadata routes the Next.js App Router compiles
 * into /sitemap.xml and /robots.txt at build time.
 *
 * These are TypeScript files that export default functions
 * returning structured objects. No third-party packages, no manual
 * XML, no static text files to keep in sync.
 *
 * Both files live at the top of app/ — same level as layout.tsx
 * and page.tsx.
 *
 * Files:
 *   1. app/sitemap.ts → /sitemap.xml
 *   2. app/robots.ts  → /robots.txt
 *
 * The two examples below are paired — the robots.ts points at the
 * sitemap URL that sitemap.ts produces. Search engines crawl
 * robots.txt first, find the sitemap URL there, then fetch the
 * sitemap.
 */

// ===============================================================
// app/sitemap.ts
// ===============================================================

import { MetadataRoute } from "next";

const BASE_URL = "https://example.com";

/**
 * Static-only sitemap. For a small marketing site, a hardcoded
 * list is fine. For dynamic routes (blog posts, product pages),
 * see the second example below.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/imprint`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}

/**
 * Dynamic sitemap example — combines static routes with content
 * fetched at build time (e.g. from a CMS or database).
 *
 * Replace this with your actual data fetch and uncomment to use:
 */
/*
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch dynamic items, e.g. from a CMS
  const posts = await fetchAllPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1 },
    { url: `${BASE_URL}/about`, priority: 0.8 },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
*/

// ===============================================================
// app/robots.ts (separate file in your project)
// ===============================================================
//
// Move the following to its own app/robots.ts file:

/*
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Always disallow API routes — search engines have no
      // business firing POST requests at your form endpoints.
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://example.com/sitemap.xml',
  };
}
*/

// ===============================================================
// Per-page metadata pattern (in any page.tsx or layout.tsx)
// ===============================================================
//
// Set defaults in the root layout, override per page:

/*
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: { template: '%s — Brand', default: 'Brand' },
  description: 'Default description.',
  openGraph: {
    locale: 'de_DE',
    type: 'website',
    siteName: 'Brand',
  },
};

// app/services/page.tsx
export const metadata: Metadata = {
  title: 'Services',  // becomes "Services — Brand" via the template
  description: 'What we offer.',
  openGraph: {
    images: ['/og-services.jpg'],
  },
};
*/
