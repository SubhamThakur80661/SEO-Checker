const axios = require("axios");
const cheerio = require("cheerio");
const { URL } = require("url");
const { assertPublicUrl } = require("./urlguard");

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Approximate syllable count for a word using vowel groups.
 */
function countWordSyllables(word) {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return 0;
  if (cleaned.length <= 3) return 1;

  // Match vowel groups
  const matches = cleaned.match(/[aeiouy]+/g);
  let count = matches ? matches.length : 1;

  // Subtract silent 'e' at end
  if (cleaned.endsWith('e') && !cleaned.endsWith('le') && count > 1) {
    count--;
  }
  return Math.max(1, count);
}

/**
 * Computes Flesch Reading Ease score from visible text.
 */
function calculateFleschReadingEase(text) {
  const words = text.split(/\s+/).filter(w => /[a-zA-Z0-9]/.test(w));
  if (words.length === 0) return 0;

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  const wordCount = words.length;

  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countWordSyllables(w);
  }

  const score = Math.round(206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (totalSyllables / wordCount));
  return Math.max(0, Math.min(100, score));
}

/**
 * Extracts @type values recursively from parsed JSON-LD.
 */
function extractSchemaTypes(obj, types = new Set()) {
  if (!obj || typeof obj !== 'object') return types;
  if (Array.isArray(obj)) {
    for (const item of obj) extractSchemaTypes(item, types);
    return types;
  }
  if (obj['@type']) {
    if (Array.isArray(obj['@type'])) {
      for (const t of obj['@type']) {
        if (typeof t === 'string' && t.trim()) types.add(t.trim());
      }
    } else if (typeof obj['@type'] === 'string' && obj['@type'].trim()) {
      types.add(obj['@type'].trim());
    }
  }
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      extractSchemaTypes(obj[key], types);
    }
  }
  return types;
}

/**
 * Evaluates whether a robots.txt rule pattern matches a given URL path.
 * Supports '*' wildcards and '$' end-of-string anchor.
 */
function matchesRobotsRule(path, pattern) {
  if (!pattern) return false;
  // Escape regex special chars except * and $
  let regexStr = '^' + pattern
    .replace(/[-[\]{}()+?.,\\^|#\s]/g, '\\$&')
    .replace(/\*/g, '.*');

  if (pattern.endsWith('$')) {
    regexStr = regexStr.slice(0, -2) + '$'; // remove escaped \$ and use literal $
  }

  try {
    const regex = new RegExp(regexStr);
    return regex.test(path);
  } catch {
    return path.startsWith(pattern);
  }
}

/**
 * Parses robots.txt text to check if target path is disallowed.
 */
function parseRobotsTxt(content, targetPath) {
  const lines = content.split(/\r?\n/);
  let inRelevantGroup = false;
  let hasRelevantGroup = false;
  const rules = []; // { type: 'allow'|'disallow', pattern, length }
  let sitemapFound = false;

  for (let rawLine of lines) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const directive = line.slice(0, colonIdx).trim().toLowerCase();
    const value = line.slice(colonIdx + 1).trim();

    if (directive === 'sitemap') {
      sitemapFound = true;
    }

    if (directive === 'user-agent') {
      const ua = value.toLowerCase();
      if (ua === '*' || ua === 'googlebot') {
        inRelevantGroup = true;
        hasRelevantGroup = true;
      } else {
        inRelevantGroup = false;
      }
      continue;
    }

    if (inRelevantGroup) {
      if (directive === 'disallow') {
        if (value) {
          rules.push({ type: 'disallow', pattern: value, length: value.length });
        }
      } else if (directive === 'allow') {
        if (value) {
          rules.push({ type: 'allow', pattern: value, length: value.length });
        }
      }
    }
  }

  // If no user-agent * or googlebot group found, check all directives
  if (!hasRelevantGroup) {
    for (let rawLine of lines) {
      const line = rawLine.replace(/#.*$/, '').trim();
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const directive = line.slice(0, colonIdx).trim().toLowerCase();
      const value = line.slice(colonIdx + 1).trim();
      if (directive === 'disallow' && value) {
        rules.push({ type: 'disallow', pattern: value, length: value.length });
      } else if (directive === 'allow' && value) {
        rules.push({ type: 'allow', pattern: value, length: value.length });
      }
    }
  }

  // Longest matching rule wins; Allow wins ties
  let matchingRules = rules.filter(r => matchesRobotsRule(targetPath, r.pattern));
  matchingRules.sort((a, b) => {
    if (b.length !== a.length) return b.length - a.length;
    return a.type === 'allow' ? -1 : 1;
  });

  const blocksUrl = matchingRules.length > 0 && matchingRules[0].type === 'disallow';
  return { blocksUrl, sitemapFound };
}

/**
 * Scrapes a website and gathers comprehensive SEO and technical audit data.
 */
async function scrapeWebsite(url) {
  try {
    await assertPublicUrl(url);

    const startTime = Date.now();
    const response = await axios.get(url, {
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 12000,
      maxContentLength: 5 * 1024 * 1024,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400
    });
    const loadTimeMs = Date.now() - startTime;

    const finalUrl = response.request?.res?.responseUrl || response.config?.url || url;
    const statusCode = response.status;
    const https = finalUrl.toLowerCase().startsWith('https://');
    const respHeaders = response.headers || {};
    const contentType = respHeaders['content-type'] || '';
    const rawData = response.data;
    const pageSizeBytes = Buffer.byteLength(typeof rawData === 'string' ? rawData : JSON.stringify(rawData) || '', 'utf8');

    const htmlString = typeof rawData === 'string' ? rawData : '';
    const $ = cheerio.load(htmlString);

    // Meta & Headings
    const title = $("title").first().text().trim();
    const metaDescription = $('meta[name="description" i]').attr("content")?.trim() || "";
    const canonical = $('link[rel="canonical" i]').attr("href")?.trim() || null;
    const robots = $('meta[name="robots" i]').attr("content")?.trim() || null;

    const h1 = [];
    $("h1").each((i, el) => {
      h1.push($(el).text().trim());
    });
    const h1Count = h1.length;
    const h2Count = $("h2").length;
    const h3Count = $("h3").length;

    // Open Graph
    const ogTitle = $('meta[property="og:title" i]').attr("content")?.trim() || $('meta[name="og:title" i]').attr("content")?.trim() || null;
    const ogDescription = $('meta[property="og:description" i]').attr("content")?.trim() || $('meta[name="og:description" i]').attr("content")?.trim() || null;
    const ogImage = $('meta[property="og:image" i]').attr("content")?.trim() || $('meta[name="og:image" i]').attr("content")?.trim() || null;

    // Twitter Card
    const twitterCard = $('meta[name="twitter:card" i]').attr("content")?.trim() || $('meta[property="twitter:card" i]').attr("content")?.trim() || null;
    const twitterTitle = $('meta[name="twitter:title" i]').attr("content")?.trim() || $('meta[property="twitter:title" i]').attr("content")?.trim() || null;
    const twitterDescription = $('meta[name="twitter:description" i]').attr("content")?.trim() || $('meta[property="twitter:description" i]').attr("content")?.trim() || null;

    // Technical Head tags
    const viewport = $('meta[name="viewport" i]').attr("content")?.trim() || null;
    const lang = $('html').attr('lang')?.trim() || null;
    const charset = $('meta[charset]').attr('charset')?.trim()
      || $('meta[http-equiv="Content-Type" i]').attr('content')?.match(/charset=([^\s;]+)/i)?.[1]?.trim()
      || null;

    // Favicon link tag check (do NOT fetch /favicon.ico)
    const favicon = $('link[rel~="icon" i]').length > 0 || $('link[rel*="icon" i]').length > 0;

    // Structured Data (application/ld+json)
    const structuredDataTypes = new Set();
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const rawJson = $(el).contents().text().trim();
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          extractSchemaTypes(parsed, structuredDataTypes);
        }
      } catch {
        // Ignore invalid JSON defensively
      }
    });
    const structuredData = Array.from(structuredDataTypes);

    // Images
    const imageCount = $('img').length;
    let imagesWithoutAlt = 0;
    let imagesMissingSrc = 0;
    $('img').each((_, el) => {
      const alt = $(el).attr('alt');
      if (alt === undefined || alt === null || alt.trim() === '') {
        imagesWithoutAlt++;
      }
      const src = $(el).attr('src');
      if (!src || src.trim() === '') {
        imagesMissingSrc++;
      }
    });

    // Content & Readability
    $('script, style, noscript, svg').remove();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordList = bodyText.split(/\s+/).filter(w => /[a-zA-Z0-9]/.test(w));
    const wordCount = wordList.length;
    const readability = calculateFleschReadingEase(bodyText);

    // Links Analysis
    let internalLinks = 0;
    let externalLinks = 0;
    let linksWithoutText = 0;
    const internalCandidates = [];
    const externalCandidates = [];
    let parsedFinalUrl;
    try {
      parsedFinalUrl = new URL(finalUrl);
    } catch {
      parsedFinalUrl = new URL(url);
    }
    const baseHost = parsedFinalUrl.hostname.toLowerCase();

    $('a').each((_, el) => {
      const text = $(el).text().trim();
      const ariaLabel = $(el).attr('aria-label')?.trim() || $(el).attr('title')?.trim();
      if (!text && !ariaLabel) {
        linksWithoutText++;
      }

      const href = $(el).attr('href')?.trim();
      if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
        return;
      }

      try {
        const resolved = new URL(href, finalUrl);
        if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
          if (resolved.hostname.toLowerCase() === baseHost) {
            internalLinks++;
            if (!internalCandidates.includes(resolved.href)) {
              internalCandidates.push(resolved.href);
            }
          } else {
            externalLinks++;
            if (!externalCandidates.includes(resolved.href)) {
              externalCandidates.push(resolved.href);
            }
          }
        }
      } catch {
        // Ignore unparseable hrefs
      }
    });

    // Select up to 8 links to probe for broken links (prefer internal, then external)
    const probeUrls = [];
    for (const link of internalCandidates) {
      if (probeUrls.length < 8) probeUrls.push(link);
    }
    for (const link of externalCandidates) {
      if (probeUrls.length < 8) probeUrls.push(link);
    }

    // Response Headers & Security
    const xRobotsTag = respHeaders['x-robots-tag'] || null;
    const contentEncoding = respHeaders['content-encoding'] || null;
    const securityHeaders = {
      hasHSTS: Boolean(respHeaders['strict-transport-security']),
      hasXContentTypeOptions: Boolean(respHeaders['x-content-type-options']),
      hasXFrameOptions: Boolean(respHeaders['x-frame-options']),
      hasContentSecurityPolicy: Boolean(respHeaders['content-security-policy'])
    };
    const headers = {
      xRobotsTag,
      contentEncoding,
      securityHeaders
    };

    // Concurrent probes: Robots.txt, Sitemap, and Broken Links
    let robotsTxt = { exists: false, blocksUrl: false };
    let sitemap = { exists: false };
    let brokenLinks = [];

    const probeRobots = async () => {
      try {
        const robotsUrl = new URL('/robots.txt', finalUrl).toString();
        await assertPublicUrl(robotsUrl);
        const res = await axios.get(robotsUrl, {
          headers: { 'User-Agent': BROWSER_UA },
          timeout: 5000,
          validateStatus: (s) => s === 200
        });
        if (typeof res.data === 'string') {
          const parsedPath = parsedFinalUrl.pathname + parsedFinalUrl.search;
          const { blocksUrl, sitemapFound } = parseRobotsTxt(res.data, parsedPath || '/');
          robotsTxt = { exists: true, blocksUrl };
          if (sitemapFound) {
            sitemap.exists = true;
          }
        }
      } catch {
        robotsTxt = { exists: false, blocksUrl: false };
      }
    };

    const probeSitemap = async () => {
      if (sitemap.exists) return;
      try {
        const sitemapUrl = new URL('/sitemap.xml', finalUrl).toString();
        await assertPublicUrl(sitemapUrl);
        let exists = false;
        try {
          const headRes = await axios.head(sitemapUrl, {
            headers: { 'User-Agent': BROWSER_UA },
            timeout: 5000,
            validateStatus: (s) => s >= 200 && s < 400
          });
          exists = headRes.status >= 200 && headRes.status < 400;
        } catch {
          // Fallback to GET with small range
          const getRes = await axios.get(sitemapUrl, {
            headers: { 'User-Agent': BROWSER_UA, Range: 'bytes=0-500' },
            timeout: 5000,
            validateStatus: (s) => s >= 200 && s < 400
          });
          exists = getRes.status >= 200 && getRes.status < 400;
        }
        if (exists) {
          sitemap.exists = true;
        }
      } catch {
        // sitemap remains false
      }
    };

    const probeBrokenLinks = async () => {
      const results = [];
      const linkChecks = probeUrls.map(async (linkUrl) => {
        try {
          await assertPublicUrl(linkUrl);
          let status = 0;
          try {
            const headRes = await axios.head(linkUrl, {
              headers: { 'User-Agent': BROWSER_UA },
              timeout: 3000,
              maxRedirects: 3,
              validateStatus: () => true
            });
            status = headRes.status;
            // 405 Method Not Allowed fallback to GET
            if (status === 405) {
              const getRes = await axios.get(linkUrl, {
                headers: { 'User-Agent': BROWSER_UA, Range: 'bytes=0-100' },
                timeout: 3000,
                maxRedirects: 3,
                validateStatus: () => true
              });
              status = getRes.status;
            }
          } catch {
            status = 0;
          }
          if (status === 0 || status >= 400) {
            results.push({ url: linkUrl, status });
          }
        } catch {
          // Blocked or failed public URL check -> skip or record
        }
      });

      await Promise.allSettled(linkChecks);
      brokenLinks = results;
    };

    // Run probes concurrently with Promise.allSettled
    await Promise.allSettled([
      probeRobots().then(() => probeSitemap()),
      probeBrokenLinks()
    ]);

    return {
      title,
      metaDescription,
      canonical,
      robots,
      h1,
      h1Count,
      h2Count,
      h3Count,
      imagesWithoutAlt,
      imagesMissingSrc,
      imageCount,
      wordCount,
      readability,
      statusCode,
      finalUrl,
      loadTimeMs,
      https,
      pageSizeBytes,
      contentType,
      ogTitle,
      ogDescription,
      ogImage,
      twitterCard,
      twitterTitle,
      twitterDescription,
      viewport,
      lang,
      charset,
      favicon,
      structuredData,
      internalLinks,
      externalLinks,
      linksWithoutText,
      brokenLinks,
      robotsTxt,
      sitemap,
      headers
    };
  } catch (error) {
    console.error("Scraper Error:", error.message);
    throw new Error("Unable to scrape the provided URL. Make sure it is valid and publicly accessible.");
  }
}

module.exports = scrapeWebsite;
