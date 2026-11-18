const CATEGORY_DEFINITIONS = [
  { id: 'meta', name: 'Meta & Tags', weight: 0.22 },
  { id: 'content', name: 'Content Quality', weight: 0.20 },
  { id: 'structure', name: 'Structure & Headings', weight: 0.12 },
  { id: 'links', name: 'Links & Navigation', weight: 0.10 },
  { id: 'indexability', name: 'Crawlability & Indexing', weight: 0.12 },
  { id: 'performance', name: 'Performance & Speed', weight: 0.10 },
  { id: 'security', name: 'Security', weight: 0.07 },
  { id: 'mobile', name: 'Mobile Experience', weight: 0.07 }
];

/**
 * Analyzes scraped website data and produces a weighted category SEO score and detailed audit checks.
 */
function seoAnalyzer(data = {}) {
  const checks = [];

  // ---------------------------------------------------------
  // 1. META (weight: 0.22)
  // ---------------------------------------------------------
  // title_tag (missing=critical, length 30–60=good else warning)
  const title = (data.title || '').trim();
  if (!title) {
    checks.push({
      id: 'title_tag',
      category: 'meta',
      status: 'critical',
      title: 'Title Tag',
      message: 'Page title is missing from <head>.',
      recommendation: 'Add a descriptive <title> tag between 30 and 60 characters.'
    });
  } else if (title.length >= 30 && title.length <= 60) {
    checks.push({
      id: 'title_tag',
      category: 'meta',
      status: 'good',
      title: 'Title Tag',
      message: `Title length (${title.length} chars) is optimal.`,
      recommendation: 'Maintain title length between 30 and 60 characters.'
    });
  } else {
    checks.push({
      id: 'title_tag',
      category: 'meta',
      status: 'warning',
      title: 'Title Tag',
      message: `Title length is ${title.length} characters (optimal is 30–60).`,
      recommendation: title.length < 30
        ? 'Expand your title tag to at least 30 characters with relevant keywords.'
        : 'Shorten your title tag to under 60 characters to avoid SERP truncation.'
    });
  }

  // meta_description (missing=critical, 120–160=good else warning)
  const metaDesc = (data.metaDescription || '').trim();
  if (!metaDesc) {
    checks.push({
      id: 'meta_description',
      category: 'meta',
      status: 'critical',
      title: 'Meta Description',
      message: 'Meta description is missing.',
      recommendation: 'Add a <meta name="description"> tag between 120 and 160 characters summarizing the page.'
    });
  } else if (metaDesc.length >= 120 && metaDesc.length <= 160) {
    checks.push({
      id: 'meta_description',
      category: 'meta',
      status: 'good',
      title: 'Meta Description',
      message: `Meta description length (${metaDesc.length} chars) is optimal.`,
      recommendation: 'Maintain meta description length between 120 and 160 characters.'
    });
  } else {
    checks.push({
      id: 'meta_description',
      category: 'meta',
      status: 'warning',
      title: 'Meta Description',
      message: `Meta description length is ${metaDesc.length} characters (optimal is 120–160).`,
      recommendation: metaDesc.length < 120
        ? 'Expand your meta description to at least 120 characters with a clear value proposition.'
        : 'Shorten your meta description to under 160 characters to prevent truncation in search snippets.'
    });
  }

  // canonical (missing=warning, present=good)
  if (data.canonical) {
    checks.push({
      id: 'canonical',
      category: 'meta',
      status: 'good',
      title: 'Canonical Tag',
      message: `Canonical link specified: ${data.canonical}`,
      recommendation: 'Ensure canonical URL points to the authoritative version of this page.'
    });
  } else {
    checks.push({
      id: 'canonical',
      category: 'meta',
      status: 'warning',
      title: 'Canonical Tag',
      message: 'Missing canonical link tag.',
      recommendation: 'Add <link rel="canonical" href="..."/> in <head> to prevent duplicate content ambiguity.'
    });
  }

  // open_graph (missing og:title/description=warning)
  if (data.ogTitle && data.ogDescription) {
    checks.push({
      id: 'open_graph',
      category: 'meta',
      status: 'good',
      title: 'Open Graph Tags',
      message: 'Open Graph title and description are present.',
      recommendation: 'Keep social metadata synchronized with page updates.'
    });
  } else {
    checks.push({
      id: 'open_graph',
      category: 'meta',
      status: 'warning',
      title: 'Open Graph Tags',
      message: 'Missing Open Graph title or description tag.',
      recommendation: 'Add og:title and og:description meta tags for rich social sharing cards.'
    });
  }

  // twitter_card (missing=info)
  if (data.twitterCard) {
    checks.push({
      id: 'twitter_card',
      category: 'meta',
      status: 'good',
      title: 'Twitter Card',
      message: `Twitter card defined (${data.twitterCard}).`,
      recommendation: 'Maintain Twitter meta tags for rich snippet displays on X.'
    });
  } else {
    checks.push({
      id: 'twitter_card',
      category: 'meta',
      status: 'info',
      title: 'Twitter Card',
      message: 'No Twitter card meta tag found.',
      recommendation: 'Add <meta name="twitter:card" content="summary_large_image"> for rich cards on X/Twitter.'
    });
  }

  // structured_data (present=good, missing=info)
  const hasStructured = Array.isArray(data.structuredData) && data.structuredData.length > 0;
  if (hasStructured) {
    checks.push({
      id: 'structured_data',
      category: 'meta',
      status: 'good',
      title: 'Structured Data (Schema)',
      message: `Structured data detected: ${data.structuredData.join(', ')}.`,
      recommendation: 'Verify schema markup regularly with Google Rich Results Test.'
    });
  } else {
    checks.push({
      id: 'structured_data',
      category: 'meta',
      status: 'info',
      title: 'Structured Data (Schema)',
      message: 'No JSON-LD structured data detected on the page.',
      recommendation: 'Implement Schema.org JSON-LD (e.g. WebSite, Organization, Article) to unlock rich search features.'
    });
  }

  // html_lang (missing=warning)
  if (data.lang) {
    checks.push({
      id: 'html_lang',
      category: 'meta',
      status: 'good',
      title: 'HTML Language',
      message: `HTML lang attribute is set to "${data.lang}".`,
      recommendation: 'Ensure lang attribute matches the primary language of page content.'
    });
  } else {
    checks.push({
      id: 'html_lang',
      category: 'meta',
      status: 'warning',
      title: 'HTML Language',
      message: 'Missing lang attribute on <html> element.',
      recommendation: 'Add a lang attribute to the <html> tag (e.g., <html lang="en">) to aid language targeting.'
    });
  }

  // charset (missing=warning)
  if (data.charset) {
    checks.push({
      id: 'charset',
      category: 'meta',
      status: 'good',
      title: 'Character Encoding',
      message: `Character set declared as ${data.charset}.`,
      recommendation: 'Keep character encoding specified early in the document head.'
    });
  } else {
    checks.push({
      id: 'charset',
      category: 'meta',
      status: 'warning',
      title: 'Character Encoding',
      message: 'Character encoding is not declared in HTML.',
      recommendation: 'Add <meta charset="utf-8"> early inside <head> to prevent rendering glitches.'
    });
  }

  // ---------------------------------------------------------
  // 2. CONTENT (weight: 0.20)
  // ---------------------------------------------------------
  // word_count (>800 good, 300–800 warning, <300 critical)
  const words = data.wordCount || 0;
  if (words > 800) {
    checks.push({
      id: 'word_count',
      category: 'content',
      status: 'good',
      title: 'Word Count',
      message: `Strong content depth (${words} words).`,
      recommendation: 'Continue producing thorough, comprehensive content.'
    });
  } else if (words >= 300) {
    checks.push({
      id: 'word_count',
      category: 'content',
      status: 'warning',
      title: 'Word Count',
      message: `Moderate content length (${words} words).`,
      recommendation: 'Consider expanding content to over 800 words to more comprehensively address search intent.'
    });
  } else {
    checks.push({
      id: 'word_count',
      category: 'content',
      status: 'critical',
      title: 'Word Count',
      message: `Thin content detected (${words} words).`,
      recommendation: 'Expand page copy with in-depth information, FAQs, and explanations (target > 800 words).'
    });
  }

  // readability (Flesch >= 60 good, 30–60 warning, <30 info — never critical)
  const scoreFlesch = typeof data.readability === 'number' ? data.readability : 0;
  if (scoreFlesch >= 60) {
    checks.push({
      id: 'readability',
      category: 'content',
      status: 'good',
      title: 'Readability',
      message: `Flesch Reading Ease estimate: ${scoreFlesch}/100 (accessible & clear).`,
      recommendation: 'Maintain a clear, accessible writing style.'
    });
  } else if (scoreFlesch >= 30) {
    checks.push({
      id: 'readability',
      category: 'content',
      status: 'warning',
      title: 'Readability',
      message: `Flesch Reading Ease estimate: ${scoreFlesch}/100 (moderately complex).`,
      recommendation: 'Use shorter sentences and simplify technical jargon where feasible.'
    });
  } else {
    checks.push({
      id: 'readability',
      category: 'content',
      status: 'info',
      title: 'Readability',
      message: `Flesch Reading Ease estimate: ${scoreFlesch}/100 (dense or academic text).`,
      recommendation: 'Break complex paragraphs into bullet points and shorter sentences to improve readability.'
    });
  }

  // image_alt (0 missing=good, else warning with count)
  const missingAlt = data.imagesWithoutAlt || 0;
  if (missingAlt === 0) {
    checks.push({
      id: 'image_alt',
      category: 'content',
      status: 'good',
      title: 'Image Alt Text',
      message: 'All images include alt attributes.',
      recommendation: 'Ensure all future images include descriptive, contextual alt attributes.'
    });
  } else {
    checks.push({
      id: 'image_alt',
      category: 'content',
      status: 'warning',
      title: 'Image Alt Text',
      message: `${missingAlt} image(s) missing alt attributes.`,
      recommendation: `Add descriptive alt text to the ${missingAlt} image(s) missing attributes to improve accessibility and image SEO.`
    });
  }

  // image_src (missing src=warning)
  const missingSrc = data.imagesMissingSrc || 0;
  if (missingSrc === 0) {
    checks.push({
      id: 'image_src',
      category: 'content',
      status: 'good',
      title: 'Image Source Paths',
      message: 'All image elements have valid src attributes.',
      recommendation: 'Maintain valid asset references.'
    });
  } else {
    checks.push({
      id: 'image_src',
      category: 'content',
      status: 'warning',
      title: 'Image Source Paths',
      message: `${missingSrc} image(s) have missing or empty src attributes.`,
      recommendation: `Fix or remove the ${missingSrc} <img> tag(s) with missing src paths.`
    });
  }

  // ---------------------------------------------------------
  // 3. STRUCTURE (weight: 0.12)
  // ---------------------------------------------------------
  // h1_heading (exactly 1 good, 0 critical, >1 warning)
  const h1Count = data.h1Count !== undefined ? data.h1Count : (Array.isArray(data.h1) ? data.h1.length : 0);
  if (h1Count === 1) {
    checks.push({
      id: 'h1_heading',
      category: 'structure',
      status: 'good',
      title: 'H1 Heading',
      message: 'Exactly one H1 heading found.',
      recommendation: 'Ensure your H1 matches the primary topic and target keyword of the page.'
    });
  } else if (h1Count === 0) {
    checks.push({
      id: 'h1_heading',
      category: 'structure',
      status: 'critical',
      title: 'H1 Heading',
      message: 'No H1 heading found on the page.',
      recommendation: 'Add exactly one <h1> heading near the top of the page reflecting the primary topic.'
    });
  } else {
    checks.push({
      id: 'h1_heading',
      category: 'structure',
      status: 'warning',
      title: 'H1 Heading',
      message: `Found ${h1Count} H1 headings (recommended: exactly one).`,
      recommendation: 'Use only one primary <h1> heading per page, converting secondary headings to <h2>.'
    });
  }

  // heading_hierarchy (h2 present=good else info)
  const h2Count = data.h2Count || 0;
  if (h2Count > 0) {
    checks.push({
      id: 'heading_hierarchy',
      category: 'structure',
      status: 'good',
      title: 'Heading Hierarchy',
      message: `${h2Count} H2 subheadings found.`,
      recommendation: 'Maintain a clear outline structure (H1 -> H2 -> H3).'
    });
  } else {
    checks.push({
      id: 'heading_hierarchy',
      category: 'structure',
      status: 'info',
      title: 'Heading Hierarchy',
      message: 'No H2 subheadings found.',
      recommendation: 'Use <h2> tags to break down content into scannable subtopics.'
    });
  }

  // favicon (present=good else info)
  if (data.favicon) {
    checks.push({
      id: 'favicon',
      category: 'structure',
      status: 'good',
      title: 'Favicon',
      message: 'Favicon link tag detected.',
      recommendation: 'Ensure favicon renders crisply across mobile and desktop browser tabs.'
    });
  } else {
    checks.push({
      id: 'favicon',
      category: 'structure',
      status: 'info',
      title: 'Favicon',
      message: 'No favicon link tag detected in HTML.',
      recommendation: 'Add <link rel="icon" href="/favicon.ico"> to reinforce brand recognition in search results.'
    });
  }

  // ---------------------------------------------------------
  // 4. LINKS (weight: 0.10)
  // ---------------------------------------------------------
  // internal_links (0=warning, else good)
  const internalCount = data.internalLinks || 0;
  if (internalCount > 0) {
    checks.push({
      id: 'internal_links',
      category: 'links',
      status: 'good',
      title: 'Internal Links',
      message: `${internalCount} internal link(s) detected.`,
      recommendation: 'Use descriptive anchor text to link to related internal articles.'
    });
  } else {
    checks.push({
      id: 'internal_links',
      category: 'links',
      status: 'warning',
      title: 'Internal Links',
      message: 'No internal links found on this page.',
      recommendation: 'Add internal links to guide visitors and crawlers to other relevant pages on your site.'
    });
  }

  // external_links (info only)
  const externalCount = data.externalLinks || 0;
  checks.push({
    id: 'external_links',
    category: 'links',
    status: 'info',
    title: 'External Links',
    message: `${externalCount} outbound link(s) detected.`,
    recommendation: 'Cite authoritative external sources when referencing data or claims.'
  });

  // anchor_quality (links without text: 0=good else warning)
  const emptyLinks = data.linksWithoutText || 0;
  if (emptyLinks === 0) {
    checks.push({
      id: 'anchor_quality',
      category: 'links',
      status: 'good',
      title: 'Link Anchor Quality',
      message: 'All links contain anchor text or aria-labels.',
      recommendation: 'Continue using descriptive, keyword-relevant anchor text.'
    });
  } else {
    checks.push({
      id: 'anchor_quality',
      category: 'links',
      status: 'warning',
      title: 'Link Anchor Quality',
      message: `${emptyLinks} link(s) lack anchor text or aria-labels.`,
      recommendation: `Provide descriptive text or aria-labels on the ${emptyLinks} empty link(s) to assist screen readers and search bots.`
    });
  }

  // broken_links (0=good, else warning with count)
  const brokenList = Array.isArray(data.brokenLinks) ? data.brokenLinks : [];
  if (brokenList.length === 0) {
    checks.push({
      id: 'broken_links',
      category: 'links',
      status: 'good',
      title: 'Broken Links',
      message: 'No broken links detected in sampled links.',
      recommendation: 'Periodically monitor outbound URLs for broken targets or 404s.'
    });
  } else {
    checks.push({
      id: 'broken_links',
      category: 'links',
      status: 'warning',
      title: 'Broken Links',
      message: `${brokenList.length} broken or failing link(s) detected.`,
      recommendation: `Update or remove the ${brokenList.length} broken link(s) returning 4xx/5xx status codes.`
    });
  }

  // ---------------------------------------------------------
  // 5. INDEXABILITY (weight: 0.12)
  // ---------------------------------------------------------
  // meta_robots (noindex=critical)
  const metaRobotsStr = (data.robots || '').toLowerCase();
  if (metaRobotsStr.includes('noindex')) {
    checks.push({
      id: 'meta_robots',
      category: 'indexability',
      status: 'critical',
      title: 'Meta Robots Tag',
      message: 'Meta robots contains "noindex" — page is blocked from search engine indexing.',
      recommendation: 'Remove "noindex" from your meta robots tag to allow search engines to index this page.'
    });
  } else {
    checks.push({
      id: 'meta_robots',
      category: 'indexability',
      status: 'good',
      title: 'Meta Robots Tag',
      message: 'Meta robots allows search engine indexing.',
      recommendation: 'Keep indexing directives clear and intentional.'
    });
  }

  // x_robots_tag (noindex=critical)
  const xRobots = (data.headers?.xRobotsTag || '').toLowerCase();
  if (xRobots.includes('noindex')) {
    checks.push({
      id: 'x_robots_tag',
      category: 'indexability',
      status: 'critical',
      title: 'X-Robots-Tag Header',
      message: 'X-Robots-Tag HTTP response header contains "noindex".',
      recommendation: 'Remove "noindex" from server response headers to permit search engine indexation.'
    });
  } else {
    checks.push({
      id: 'x_robots_tag',
      category: 'indexability',
      status: 'good',
      title: 'X-Robots-Tag Header',
      message: 'X-Robots-Tag header does not restrict indexing.',
      recommendation: 'Ensure server response headers do not unintentionally block bots.'
    });
  }

  // robots_txt (blocksUrl=critical, missing robots.txt=info)
  if (data.robotsTxt?.blocksUrl) {
    checks.push({
      id: 'robots_txt',
      category: 'indexability',
      status: 'critical',
      title: 'Robots.txt Crawlability',
      message: 'This URL path is blocked by Disallow rules in robots.txt.',
      recommendation: 'Edit your robots.txt file to allow search crawlers access to this URL.'
    });
  } else if (!data.robotsTxt?.exists) {
    checks.push({
      id: 'robots_txt',
      category: 'indexability',
      status: 'info',
      title: 'Robots.txt Crawlability',
      message: 'No robots.txt file found at /robots.txt.',
      recommendation: 'Create a robots.txt file to instruct crawlers and reference your XML sitemap.'
    });
  } else {
    checks.push({
      id: 'robots_txt',
      category: 'indexability',
      status: 'good',
      title: 'Robots.txt Crawlability',
      message: 'Robots.txt exists and allows crawling of this URL.',
      recommendation: 'Keep robots.txt rules organized as site sections expand.'
    });
  }

  // sitemap (present=good, missing=warning)
  if (data.sitemap?.exists) {
    checks.push({
      id: 'sitemap',
      category: 'indexability',
      status: 'good',
      title: 'XML Sitemap',
      message: 'XML sitemap found or referenced.',
      recommendation: 'Submit your sitemap directly to Google Search Console and Bing Webmaster Tools.'
    });
  } else {
    checks.push({
      id: 'sitemap',
      category: 'indexability',
      status: 'warning',
      title: 'XML Sitemap',
      message: 'No XML sitemap found at /sitemap.xml or referenced in robots.txt.',
      recommendation: 'Generate an XML sitemap and reference it in robots.txt to assist discovery of all URLs.'
    });
  }

  // ---------------------------------------------------------
  // 6. PERFORMANCE (weight: 0.10)
  // ---------------------------------------------------------
  // ttfb (loadTimeMs < 800 good, < 2000 warning, else warning — never critical from one sample)
  const loadMs = data.loadTimeMs || 0;
  if (loadMs < 800) {
    checks.push({
      id: 'ttfb',
      category: 'performance',
      status: 'good',
      title: 'Server Response Time',
      message: `Fast response time (${loadMs}ms).`,
      recommendation: 'Keep backend response times consistently under 800ms.'
    });
  } else if (loadMs < 2000) {
    checks.push({
      id: 'ttfb',
      category: 'performance',
      status: 'warning',
      title: 'Server Response Time',
      message: `Moderate response time (${loadMs}ms).`,
      recommendation: 'Optimize server processing, caching, and database queries to achieve TTFB < 800ms.'
    });
  } else {
    checks.push({
      id: 'ttfb',
      category: 'performance',
      status: 'warning',
      title: 'Server Response Time',
      message: `Slow response time (${loadMs}ms).`,
      recommendation: 'Implement edge caching (CDN), optimize server-side code, and evaluate hosting capacity.'
    });
  }

  // page_size (< 1 MB good, < 2.5 MB warning, else warning)
  const sizeBytes = data.pageSizeBytes || 0;
  const sizeMb = sizeBytes / (1024 * 1024);
  if (sizeMb < 1.0) {
    checks.push({
      id: 'page_size',
      category: 'performance',
      status: 'good',
      title: 'Page Size',
      message: `Lightweight page payload (${(sizeBytes / 1024).toFixed(1)} KB).`,
      recommendation: 'Maintain compact HTML and bundle sizes.'
    });
  } else if (sizeMb < 2.5) {
    checks.push({
      id: 'page_size',
      category: 'performance',
      status: 'warning',
      title: 'Page Size',
      message: `Moderate page payload (${sizeMb.toFixed(2)} MB).`,
      recommendation: 'Compress images, minify scripts and stylesheets to stay under 1 MB.'
    });
  } else {
    checks.push({
      id: 'page_size',
      category: 'performance',
      status: 'warning',
      title: 'Page Size',
      message: `Heavy page payload (${sizeMb.toFixed(2)} MB).`,
      recommendation: 'Significantly reduce HTML payload and defer non-essential assets.'
    });
  }

  // compression (content-encoding header present=good else info)
  const encoding = data.headers?.contentEncoding;
  if (encoding) {
    checks.push({
      id: 'compression',
      category: 'performance',
      status: 'good',
      title: 'Compression',
      message: `HTTP compression enabled (${encoding}).`,
      recommendation: 'Keep modern compression (Brotli/Gzip) active.'
    });
  } else {
    checks.push({
      id: 'compression',
      category: 'performance',
      status: 'info',
      title: 'Compression',
      message: 'No content-encoding header detected on the response.',
      recommendation: 'Enable Brotli or Gzip compression on your web server to reduce data transfer sizes.'
    });
  }

  // ---------------------------------------------------------
  // 7. SECURITY (weight: 0.07)
  // ---------------------------------------------------------
  // https (https=good, plain http=critical)
  if (data.https) {
    checks.push({
      id: 'https',
      category: 'security',
      status: 'good',
      title: 'HTTPS Encryption',
      message: 'Site is served securely over HTTPS.',
      recommendation: 'Maintain valid SSL/TLS certificates and enforce HTTPS redirects.'
    });
  } else {
    checks.push({
      id: 'https',
      category: 'security',
      status: 'critical',
      title: 'HTTPS Encryption',
      message: 'Site is served over insecure HTTP.',
      recommendation: 'Install an SSL certificate and redirect all HTTP traffic to HTTPS.'
    });
  }

  // security_headers (count present: >=2 good, 1 warning, 0 info)
  let secCount = 0;
  const sec = data.headers?.securityHeaders || {};
  if (sec.hasHSTS) secCount++;
  if (sec.hasXContentTypeOptions) secCount++;
  if (sec.hasXFrameOptions) secCount++;
  if (sec.hasContentSecurityPolicy) secCount++;

  if (secCount >= 2) {
    checks.push({
      id: 'security_headers',
      category: 'security',
      status: 'good',
      title: 'Security Headers',
      message: `${secCount} standard security headers detected.`,
      recommendation: 'Maintain current security headers.'
    });
  } else if (secCount === 1) {
    checks.push({
      id: 'security_headers',
      category: 'security',
      status: 'warning',
      title: 'Security Headers',
      message: 'Only 1 standard security header detected.',
      recommendation: 'Add HSTS, Content-Security-Policy, and X-Content-Type-Options headers.'
    });
  } else {
    checks.push({
      id: 'security_headers',
      category: 'security',
      status: 'info',
      title: 'Security Headers',
      message: 'No standard HTTP security headers detected.',
      recommendation: 'Configure HSTS, Content-Security-Policy, and X-Frame-Options headers on your web server.'
    });
  }

  // ---------------------------------------------------------
  // 8. MOBILE (weight: 0.07)
  // ---------------------------------------------------------
  // mobile_viewport (present=good, missing=critical)
  if (data.viewport) {
    checks.push({
      id: 'mobile_viewport',
      category: 'mobile',
      status: 'good',
      title: 'Mobile Viewport',
      message: `Mobile viewport configured (${data.viewport}).`,
      recommendation: 'Ensure responsive design principles are maintained.'
    });
  } else {
    checks.push({
      id: 'mobile_viewport',
      category: 'mobile',
      status: 'critical',
      title: 'Mobile Viewport',
      message: 'Missing mobile viewport meta tag.',
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to enable responsive rendering.'
    });
  }

  // ---------------------------------------------------------
  // SCORING CALCULATION
  // ---------------------------------------------------------
  // Within a category: score = 100 - sum(penalties), where critical=25, warning=12, info=0, good=0; clamped [0, 100].
  const categories = CATEGORY_DEFINITIONS.map(catDef => {
    const catChecks = checks.filter(c => c.category === catDef.id);
    let penalties = 0;
    for (const c of catChecks) {
      if (c.status === 'critical') penalties += 25;
      else if (c.status === 'warning') penalties += 12;
    }
    const catScore = Math.max(0, Math.min(100, 100 - penalties));
    return {
      id: catDef.id,
      name: catDef.name,
      score: catScore,
      weight: catDef.weight,
      checks: catChecks
    };
  });

  // Overall = weighted sum of category scores, rounded
  let weightedSum = 0;
  for (const cat of categories) {
    weightedSum += cat.score * cat.weight;
  }
  const uncappedScore = Math.round(weightedSum);

  let score = uncappedScore;

  // Caps:
  // if plain HTTP, overall caps at 60
  if (data.https === false) {
    score = Math.min(score, 60);
  }

  // if any critical check in indexability is noindex or robots-blocked, overall caps at 40
  const indexabilityCritical = checks.some(c =>
    c.category === 'indexability' &&
    c.status === 'critical' &&
    (c.id === 'meta_robots' || c.id === 'x_robots_tag' || c.id === 'robots_txt')
  );
  if (indexabilityCritical) {
    score = Math.min(score, 40);
  }

  // Categorize issues, passed, counts
  const issues = checks
    .filter(c => c.status === 'critical' || c.status === 'warning')
    .sort((a, b) => {
      if (a.status === 'critical' && b.status !== 'critical') return -1;
      if (a.status !== 'critical' && b.status === 'critical') return 1;
      return 0;
    });

  const passed = checks.filter(c => c.status === 'good');

  const issueCounts = {
    critical: 0,
    warning: 0,
    good: 0,
    info: 0
  };
  for (const c of checks) {
    if (issueCounts[c.status] !== undefined) {
      issueCounts[c.status]++;
    }
  }

  return {
    score,
    uncappedScore,
    categories,
    checks,
    issues,
    passed,
    issueCounts
  };
}

module.exports = seoAnalyzer;
