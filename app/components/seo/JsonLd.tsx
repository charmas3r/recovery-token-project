/**
 * JSON-LD Component
 * 
 * Renders structured data for search engines.
 * Used for Product, Review, Breadcrumb, Organization schemas.
 */

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({data}: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  );
}
