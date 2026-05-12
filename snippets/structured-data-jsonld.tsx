/**
 * JSON-LD Structured Data — LocalBusiness schema
 * ==============================================
 *
 * Injects a <script type="application/ld+json"> tag with a
 * schema.org LocalBusiness object. Search engines parse this for
 * rich-result eligibility (knowledge panel, business hours, etc.).
 *
 * Drop <StructuredData /> in your root layout.tsx, inside <body>.
 * Validate the output with Google's Rich Results Test:
 *   https://search.google.com/test/rich-results
 *
 * Schema reference:
 *   https://schema.org/LocalBusiness
 *
 * For non-business sites, swap @type for the appropriate schema:
 *   - "Organization" for a company/brand without a physical location
 *   - "Person" for a personal site
 *   - "Product" for a product page
 *   - "Article" for a blog post
 *   - "FAQPage" for an FAQ page
 *   - "Recipe", "Event", "Course"... see schema.org for the full list
 */

export default function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Your Business Name",
    description: "One-sentence description of what you do.",
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
      latitude: 48.1351, // example: München
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
      "https://www.linkedin.com/company/example",
      "https://www.instagram.com/example",
    ],
  };

  return (
    <script
      type="application/ld+json"
      // dangerouslySetInnerHTML is the canonical Next.js way to
      // emit a <script> tag with raw JSON content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
