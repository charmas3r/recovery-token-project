import type {Route} from './+types/sitemap.custom.$page[.xml]';
import {getAllSEOPages} from '~/data/seo-pages';
import {getAllArticles} from '~/lib/sanity.queries';

/**
 * Static pages not managed by Shopify CMS that need to be
 * included in the sitemap for Google indexing.
 */
const STATIC_PAGES = [
  {url: '/', changeFreq: 'daily', priority: 1.0},
  {url: '/custom-token', changeFreq: 'weekly', priority: 0.9},
  {url: '/about', changeFreq: 'monthly', priority: 0.7},
  {url: '/about/our-story', changeFreq: 'monthly', priority: 0.6},
  {url: '/about/why-tokens-matter', changeFreq: 'monthly', priority: 0.6},
  {url: '/about/testimonials', changeFreq: 'weekly', priority: 0.6},
  {url: '/contact', changeFreq: 'monthly', priority: 0.5},
  {url: '/support', changeFreq: 'monthly', priority: 0.5},
  {url: '/support/faq', changeFreq: 'monthly', priority: 0.5},
  {url: '/support/shipping-returns', changeFreq: 'monthly', priority: 0.5},
  {url: '/resources', changeFreq: 'weekly', priority: 0.6},
  {url: '/resources/glossary', changeFreq: 'monthly', priority: 0.5},
  {url: '/resources/milestone-calculator', changeFreq: 'monthly', priority: 0.5},
  {url: '/resources/articles', changeFreq: 'weekly', priority: 0.6},
  {url: '/reviews', changeFreq: 'weekly', priority: 0.6},
  {url: '/review', changeFreq: 'monthly', priority: 0.5},
] as const;

interface SitemapEntry {
  url: string;
  changeFreq: string;
  priority: number;
  lastmod?: string;
}

/**
 * Last meaningful content/site update (the Custom Milestones rebrand).
 * Bump this when SEO page copy or static pages change so crawlers know to
 * re-fetch. Articles carry their own `updatedAt`.
 */
const SITEMAP_LASTMOD = '2026-06-24';

async function getAllSitemapEntries(): Promise<SitemapEntry[]> {
  const staticEntries: SitemapEntry[] = STATIC_PAGES.map((page) => ({
    ...page,
    lastmod: SITEMAP_LASTMOD,
  }));

  const seoPages = getAllSEOPages();
  const seoEntries: SitemapEntry[] = seoPages.map((page) => ({
    url: `/${page.canonicalPath}`,
    changeFreq: 'weekly',
    priority: page.type === 'commercial' ? 0.8 : page.type === 'milestone' ? 0.7 : 0.6,
    lastmod: SITEMAP_LASTMOD,
  }));

  const articles = await getAllArticles();
  const articleEntries: SitemapEntry[] = articles.map((article) => ({
    url: `/resources/articles/${article.slug}`,
    changeFreq: 'weekly',
    priority: 0.7,
    lastmod: article.updatedAt
      ? new Date(article.updatedAt).toISOString().split('T')[0]
      : SITEMAP_LASTMOD,
  }));

  return [...staticEntries, ...seoEntries, ...articleEntries];
}

export async function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const origin = url.origin;

  const urlEntries = (await getAllSitemapEntries())
    .map(
      (page) =>
        `  <url>
    <loc>${origin}${page.url}</loc>${page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
      'xml-charset': 'UTF-8',
    },
  });
}
