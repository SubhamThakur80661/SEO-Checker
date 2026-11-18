const express = require("express");
const router = express.Router();

const KNOWLEDGE_BASE = [
  {
    id: "seo_score",
    phrases: ["seo score", "score meaning", "how is score calculated", "overall score", "score"],
    keywords: ["score", "grade", "calculation", "weights", "scoring", "points", "percentage"],
    answer: "Your RankVista SEO score (0–100) is a weighted calculation across 8 core categories: Meta & Tags (22%), Content Quality (20%), Structure & Headings (12%), Indexability (12%), Links (10%), Performance (10%), Security (7%), and Mobile Experience (7%). Each category starts at 100 points, deducting 25 points for critical issues and 12 for warnings. Note that critical indexability blocks (like a noindex tag or robots.txt block) cap the overall score at 40, and plain HTTP caps it at 60."
  },
  {
    id: "title_tag",
    phrases: ["title tag", "page title", "missing title", "short title", "title length"],
    keywords: ["title", "titles", "head"],
    answer: "The <title> tag is one of the most critical on-page SEO ranking factors. For optimal display in search engine results and AI citations: keep it between 30 and 60 characters, place your primary keyword near the beginning, and end with your brand name (e.g., <title>Primary Keyword — Brand Name</title>). Titles shorter than 30 characters miss ranking context, while titles over 60 characters are typically truncated by Google."
  },
  {
    id: "meta_description",
    phrases: ["meta description", "description tag", "snippet description"],
    keywords: ["description", "meta", "snippet"],
    answer: "Meta descriptions should ideally be between 120 and 160 characters. While not a direct Google ranking factor, a well-crafted meta description directly impacts click-through rate (CTR) and informs AI answer summaries. Include your main value proposition, primary target keyword, and a compelling call to action: <meta name=\"description\" content=\"Your 120–160 character description here.\">."
  },
  {
    id: "h1_heading",
    phrases: ["h1 heading", "h1 tag", "multiple h1", "missing h1", "h1 rules"],
    keywords: ["h1", "heading", "headings", "headline"],
    answer: "Every webpage should have exactly one <h1> heading near the top of the body. Your H1 represents the primary topic of the page and should align with your <title> tag and main target keyword. Subtopics should use <h2> headings, and sub-sections within those should use <h3>. Having multiple H1 tags dilutes topical focus."
  },
  {
    id: "alt_text",
    phrases: ["alt text", "alt attribute", "image alt", "missing alt"],
    keywords: ["alt", "images", "image", "pictures", "photos"],
    answer: "Image alt text (<img alt=\"...\">) provides essential context for visually impaired users using screen readers and helps search engines understand image content for Google Images. Keep alt text descriptive and concise (under 125 characters), avoiding generic phrases like 'image of' or keyword stuffing. Decorative images should have an empty alt=\"\"."
  },
  {
    id: "canonical",
    phrases: ["canonical tag", "rel canonical", "duplicate content"],
    keywords: ["canonical", "canonicals", "duplicate"],
    answer: "A canonical tag (<link rel=\"canonical\" href=\"https://example.com/page\">) indicates to search engines which version of a URL is the authoritative master copy. It prevents duplicate content penalties that arise from URL parameters (UTM tags, sorting), trailing slash variations, or HTTP vs HTTPS duplicates."
  },
  {
    id: "robots_txt",
    phrases: ["robots txt", "robots.txt", "crawl block", "disallow"],
    keywords: ["robots", "crawl", "crawling", "crawler", "disallow", "bot", "bots"],
    answer: "Robots.txt is a plain text file hosted at /robots.txt that instructs search engine crawlers which parts of your site they can or cannot visit. A Disallow rule like 'Disallow: /admin/' protects private directories, but be careful not to disallow important content pages or your entire site ('Disallow: /'), which prevents search engines from indexing your content."
  },
  {
    id: "sitemap",
    phrases: ["xml sitemap", "sitemap xml", "submit sitemap"],
    keywords: ["sitemap", "sitemaps"],
    answer: "An XML sitemap (usually at /sitemap.xml) is a machine-readable directory of all canonical URLs on your site that you want indexed. It accelerates discovery for new and updated pages. You should reference your sitemap in your robots.txt file with 'Sitemap: https://yourdomain.com/sitemap.xml' and submit it directly to Google Search Console and Bing Webmaster Tools."
  },
  {
    id: "https_ssl",
    phrases: ["https", "ssl certificate", "tls encryption", "plain http"],
    keywords: ["https", "ssl", "tls", "security", "http", "certificate", "encryption", "secure"],
    answer: "HTTPS encrypts communication between the visitor's browser and your web server using SSL/TLS. HTTPS is a confirmed Google ranking signal and essential for user security. Running on plain HTTP triggers 'Not Secure' browser warnings and caps your RankVista SEO score at 60. Install a free SSL certificate (via Let's Encrypt or your host) and set a 301 redirect from HTTP to HTTPS."
  },
  {
    id: "page_speed",
    phrases: ["page speed", "server response time", "load time", "ttfb", "slow site"],
    keywords: ["speed", "ttfb", "fast", "slow", "performance", "timing", "latency", "load"],
    answer: "Fast page load times improve user experience and crawl efficiency. Time to First Byte (TTFB) should be under 800ms. To speed up your site: enable server-side caching or use a CDN (Cloudflare, Fastly), compress responses with Gzip/Brotli, optimize database queries, minify CSS/JS files, and convert images to modern WebP or AVIF formats."
  },
  {
    id: "security_headers",
    phrases: ["security headers", "hsts", "x frame options", "content security policy"],
    keywords: ["headers", "hsts", "csp", "nosniff", "xframe"],
    answer: "HTTP security headers harden your server against cross-site scripting (XSS), clickjacking, and code injection attacks. Key recommended headers include: Strict-Transport-Security (HSTS), X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, and Content-Security-Policy (CSP)."
  },
  {
    id: "open_graph",
    phrases: ["open graph", "og tags", "twitter card", "social preview"],
    keywords: ["og", "social", "facebook", "twitter", "linkedin", "preview", "share"],
    answer: "Open Graph (og:title, og:description, og:image) and Twitter Card tags define how your content appears when shared across social networks (LinkedIn, X/Twitter, Facebook, Slack) and AI agents. Adding high-resolution preview images (1200x630px) and clear descriptions dramatically increases click-through rates from social shares."
  },
  {
    id: "mobile_viewport",
    phrases: ["mobile viewport", "viewport meta", "mobile responsive"],
    keywords: ["viewport", "mobile", "responsive", "phone", "tablet"],
    answer: "Google uses mobile-first indexing, meaning the mobile version of your page determines rankings. The viewport meta tag (<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">) instructs mobile browsers to render the page to the device's screen width rather than zooming out to a desktop canvas."
  },
  {
    id: "structured_data",
    phrases: ["structured data", "schema markup", "json ld", "rich results"],
    keywords: ["schema", "structured", "jsonld", "rich", "snippets"],
    answer: "Structured data using Schema.org vocabulary in JSON-LD format (<script type=\"application/ld+json\">) helps search engines and AI assistants understand specific entities on your page (such as Organization, WebSite, Article, Product, or FAQPage). It can also make your page eligible for rich results in Google Search."
  },
  {
    id: "content_length",
    phrases: ["word count", "content length", "thin content"],
    keywords: ["words", "length", "thin", "content", "depth"],
    answer: "Comprehensive content tends to rank better because it answers search intent thoroughly. RankVista checks that pages have at least 800 words for primary content pieces. Pages under 300 words are flagged as thin content, which may struggle to rank unless they are purely functional utility pages."
  },
  {
    id: "broken_links",
    phrases: ["broken links", "dead links", "404 links"],
    keywords: ["broken", "dead", "404", "anchor", "links"],
    answer: "Broken links (links returning 404, 500, or unreachable targets) waste crawl budget, hurt user experience, and diminish search engine trust. RankVista samples links on your audited page and checks their HTTP status codes so you can quickly fix or remove broken targets."
  },
  {
    id: "how_to_use",
    phrases: ["how to use", "how does this app work", "how do i use rankvista", "app features"],
    keywords: ["app", "rankvista", "use", "features", "audit", "guide"],
    answer: "RankVista helps you audit and optimize webpages in 4 simple steps:\n1. Audit: Enter any public URL on the Dashboard to get a comprehensive real-time SEO report.\n2. Recommendations: Review concrete code fixes ordered by priority (critical vs. warnings).\n3. Keywords: Use the Keyword Ideas generator to explore high-intent search terms for your topic.\n4. Share & History: Logged-in users can view past audits under History and toggle public sharing to share live report links with clients or colleagues."
  },
  {
    id: "keywords_feature",
    phrases: ["keyword ideas", "keyword generator", "keyword search", "keyword research"],
    keywords: ["keyword", "keywords", "generator", "ideas", "intent"],
    answer: "The RankVista Keyword Idea Generator produces high-relevance search terms grouped by search intent (Informational, Commercial, and Transactional). It provides question forms ('how to...', 'what is...'), modifier patterns ('best', 'guide', 'tools'), and long-tail combinations. Note that it is an idea generator for content planning; it does not estimate private search volumes."
  },
  {
    id: "sharing_reports",
    phrases: ["share report", "share audit", "public link", "shareable report"],
    keywords: ["share", "sharing", "public", "shareable", "link"],
    answer: "To share an audit report: Log in to your account, run an audit (or select one from your History), and click 'Share Report'. This toggles the report to public and generates a unique shareable link (e.g. /report/:id). Anyone with the link can view the read-only audit without needing an account. You can toggle it back to private at any time."
  },
  {
    id: "what_we_dont_measure",
    phrases: ["what do you not measure", "do you track rankings", "backlink check", "traffic data", "limitations"],
    keywords: ["rankings", "traffic", "backlinks", "analytics", "ranking", "limitations", "da", "dr"],
    answer: "To be completely transparent, RankVista audits on-page technical health, structure, and content quality. We do NOT measure: live Google keyword rankings (which require daily rank tracking APIs), private organic traffic numbers (which require Google Analytics access), or external backlink profiles (which require multi-terabyte web crawls). We focus on what you can directly measure and control on your own webpage."
  }
];

const FALLBACK_MESSAGE = `I am RankVista's built-in SEO assistant. I can answer questions about:
• How the SEO score and category weights are calculated
• On-page SEO: Title tags, Meta descriptions, H1 headings, and Word count
• Technical SEO: Robots.txt, XML sitemaps, Canonical tags, and Structured data (JSON-LD)
• Security & Performance: HTTPS, Security headers, Page size, and TTFB
• Images & Links: Alt text, image sources, and broken link detection
• App Features: Running audits, Keyword ideas, Audit history, and Sharing reports
• What RankVista does and does NOT measure (e.g. rankings, backlinks, traffic)

How can I help you optimize your website today?`;

/**
 * Finds the best matching answer in the knowledge base using keyword and phrase overlap.
 */
function findAnswer(message) {
  if (!message || typeof message !== "string") {
    return FALLBACK_MESSAGE;
  }

  const normalized = message.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return FALLBACK_MESSAGE;
  }

  const words = normalized.split(" ").filter(w => w.length > 1);
  let bestEntry = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;

    // Check exact phrase matches (weight: +3)
    for (const phrase of entry.phrases) {
      if (normalized.includes(phrase)) {
        score += 3;
      }
    }

    // Check keyword matches (weight: +1)
    for (const kw of entry.keywords) {
      if (words.includes(kw)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  // Threshold: must have a score >= 2 to avoid spurious single-word accidental matches
  if (bestEntry && bestScore >= 2) {
    return bestEntry.answer;
  }

  return FALLBACK_MESSAGE;
}

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    const answer = findAnswer(message);
    res.json({ answer });
  } catch (error) {
    console.error("Chat error:", error);
    // Never return a 500 status code per specification
    res.json({ answer: FALLBACK_MESSAGE });
  }
});

module.exports = router;
