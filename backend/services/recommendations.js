/**
 * Generates concrete, prioritized SEO recommendations based strictly on actual audit findings.
 */

const CATEGORY_PRIORITY = {
  indexability: 1,
  security: 2,
  mobile: 3,
  meta: 4,
  structure: 5,
  content: 6,
  links: 7,
  performance: 8
};

const SPECIFIC_FIXES = {
  title_tag: (site) => ({
    title: 'Add or Optimize Title Tag',
    detail: site.title
      ? `Current title is ${site.title.length} characters (optimal is 30–60). It is the primary signal search engines and AI assistants use.`
      : 'Page title is missing entirely from <head>. Search engines cannot properly index or display this page in results.',
    fix: 'Add a concise, descriptive title inside <head>: <title>Primary Keyword — Brand Name (30–60 chars)</title>'
  }),
  meta_description: (site) => ({
    title: 'Set Meta Description',
    detail: site.metaDescription
      ? `Meta description length is ${site.metaDescription.length} characters (recommended: 120–160).`
      : 'Meta description is missing. Search engines will auto-generate arbitrary snippets from page text.',
    fix: 'Add <meta name="description" content="A compelling 120–160 character summary of this page with target keywords and a clear call to action."> inside <head>.'
  }),
  h1_heading: (site) => ({
    title: 'Fix H1 Heading Structure',
    detail: `Found ${site.h1Count || 0} H1 headings. Every page should feature exactly one main H1 topic headline.`,
    fix: 'Ensure there is exactly one <h1> tag reflecting the primary page topic: <h1>Primary Page Topic</h1>. Convert any secondary H1 tags to <h2>.'
  }),
  meta_robots: () => ({
    title: 'Remove "noindex" Directive',
    detail: 'The meta robots tag specifies "noindex", which explicitly instructs search engines not to index this page.',
    fix: 'Remove "noindex" from your meta robots tag: change to <meta name="robots" content="index, follow"> or remove the tag if defaults apply.'
  }),
  x_robots_tag: () => ({
    title: 'Remove X-Robots-Tag "noindex" Header',
    detail: 'The HTTP server response header contains X-Robots-Tag: noindex, blocking search indexation at the server level.',
    fix: 'Update web server or CDN configuration (nginx, Cloudflare, Express) to remove the "noindex" header for this URL.'
  }),
  robots_txt: () => ({
    title: 'Permit Crawling in Robots.txt',
    detail: 'This URL path is blocked by a Disallow rule in your robots.txt file, preventing search bots from crawling.',
    fix: 'Update /robots.txt to remove disallow rules for this path: Allow: /your-page-path'
  }),
  https: () => ({
    title: 'Enforce HTTPS Encryption',
    detail: 'The page is served over unencrypted plain HTTP, causing security warnings and ranking penalties.',
    fix: 'Install an SSL certificate (e.g. via Let\'s Encrypt) and redirect all HTTP traffic to HTTPS via 301 redirects.'
  }),
  mobile_viewport: () => ({
    title: 'Add Mobile Viewport Tag',
    detail: 'Without a viewport meta tag, mobile devices render the page zoomed out as a desktop layout.',
    fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> inside <head>.'
  }),
  word_count: (site) => ({
    title: 'Expand Thin Content',
    detail: `Page contains only ${site.wordCount || 0} words, which search engines often classify as thin or low-value content.`,
    fix: 'Expand the article to at least 800 words with in-depth answers, relevant subtopics, and structured sections to satisfy search intent.'
  }),
  canonical: (site) => ({
    title: 'Add Canonical Tag',
    detail: 'Missing canonical link tag increases the risk of duplicate content issues across protocol and query parameter variations.',
    fix: `Add <link rel="canonical" href="${site.finalUrl || 'https://example.com/canonical-url'}"> inside <head>.`
  }),
  open_graph: () => ({
    title: 'Add Open Graph Social Metadata',
    detail: 'Missing Open Graph title or description tags prevents rich previews on social networks and messaging apps.',
    fix: 'Add <meta property="og:title" content="..."> and <meta property="og:description" content="..."> inside <head>.'
  }),
  image_alt: (site) => ({
    title: 'Add Image Alt Text',
    detail: `${site.imagesWithoutAlt || 0} image(s) lack alt attributes, reducing accessibility and image search discoverability.`,
    fix: `Add descriptive alt text to all ${site.imagesWithoutAlt || 0} image(s): <img src="..." alt="Descriptive context of image">.`
  }),
  image_src: (site) => ({
    title: 'Fix Empty Image Sources',
    detail: `${site.imagesMissingSrc || 0} image element(s) have missing or empty src attributes.`,
    fix: 'Review your HTML template and ensure every <img> element has a valid, reachable src attribute.'
  }),
  internal_links: () => ({
    title: 'Add Internal Links',
    detail: 'No internal links were found on this page, creating an isolated dead-end for users and crawlers.',
    fix: 'Add contextual links to 2–5 related pages or category hubs on your website: <a href="/related-topic">Learn more</a>.'
  }),
  anchor_quality: (site) => ({
    title: 'Improve Link Anchor Text',
    detail: `${site.linksWithoutText || 0} link(s) lack anchor text or aria-labels.`,
    fix: 'Replace empty links with descriptive anchor text or add an aria-label="Descriptive action" attribute.'
  }),
  broken_links: (site) => ({
    title: 'Fix Broken Links',
    detail: `${(site.brokenLinks || []).length} link(s) failed or returned 4xx/5xx errors during the audit.`,
    fix: 'Update or remove broken hyperlink targets to maintain crawl integrity and user trust.'
  }),
  sitemap: () => ({
    title: 'Create and Reference XML Sitemap',
    detail: 'No XML sitemap was found at /sitemap.xml or referenced in robots.txt.',
    fix: 'Generate /sitemap.xml listing all canonical URLs and append "Sitemap: https://yourdomain.com/sitemap.xml" to robots.txt.'
  }),
  ttfb: (site) => ({
    title: 'Improve Server Response Time',
    detail: `Server response time was ${site.loadTimeMs || 0}ms (recommended: < 800ms).`,
    fix: 'Implement page caching (Redis / CDN / Fastly), optimize database queries, and reduce server-side overhead.'
  }),
  page_size: (site) => ({
    title: 'Reduce Page Weight',
    detail: `HTML payload is ${((site.pageSizeBytes || 0) / (1024 * 1024)).toFixed(2)} MB (recommended: < 1 MB).`,
    fix: 'Minify HTML/CSS/JS, defer non-critical scripts, and convert raster images to modern WebP or AVIF formats.'
  }),
  security_headers: () => ({
    title: 'Configure Security Headers',
    detail: 'The server response lacks essential security headers like HSTS, X-Content-Type-Options, or CSP.',
    fix: 'Configure headers on your web server: Strict-Transport-Security: max-age=31536000, X-Content-Type-Options: nosniff, and X-Frame-Options: SAMEORIGIN.'
  }),
  html_lang: () => ({
    title: 'Specify HTML Language',
    detail: 'The <html> element is missing a lang attribute.',
    fix: 'Add a language attribute to the root html tag: <html lang="en">.'
  }),
  charset: () => ({
    title: 'Declare Character Encoding',
    detail: 'Character encoding is not explicitly specified in the HTML.',
    fix: 'Add <meta charset="utf-8"> as the first element inside <head>.'
  })
};

/**
 * Builds an array of up to 5 prioritized, concrete recommendations from audit results.
 */
function buildRecommendations(site = {}, analysis = {}) {
  const issues = (analysis.issues || []).slice();

  if (issues.length === 0) {
    return [
      {
        priority: 'low',
        title: 'Clean Audit — Maintain Page Health',
        detail: 'No critical or warning issues were detected during the audit. All standard SEO checks passed.',
        fix: 'Track this page over time — re-run the audit after your next content update or major site migration.',
        checkId: 'all_passed'
      }
    ];
  }

  // Sort issues: critical first, then by category importance
  issues.sort((a, b) => {
    if (a.status === 'critical' && b.status !== 'critical') return -1;
    if (a.status !== 'critical' && b.status === 'critical') return 1;
    const catA = CATEGORY_PRIORITY[a.category] || 99;
    const catB = CATEGORY_PRIORITY[b.category] || 99;
    return catA - catB;
  });

  const topIssues = issues.slice(0, 5);

  return topIssues.map(issue => {
    const priority = issue.status === 'critical' ? 'high' : 'medium';
    const specificFn = SPECIFIC_FIXES[issue.id];
    if (specificFn) {
      const specific = specificFn(site);
      return {
        priority,
        title: specific.title,
        detail: specific.detail,
        fix: specific.fix,
        checkId: issue.id
      };
    }

    return {
      priority,
      title: issue.title,
      detail: issue.message,
      fix: issue.recommendation,
      checkId: issue.id
    };
  });
}

/**
 * Formats recommendations into a numbered text block for backward compatibility.
 */
function recommendationsToText(recommendations = []) {
  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    return 'No recommendations available.';
  }

  return recommendations
    .map((rec, index) => {
      const pLabel = (rec.priority || 'medium').toUpperCase();
      return `${index + 1}. [${pLabel}] ${rec.title}\n   Issue: ${rec.detail}\n   Action: ${rec.fix}`;
    })
    .join('\n\n');
}

module.exports = {
  buildRecommendations,
  recommendationsToText
};
