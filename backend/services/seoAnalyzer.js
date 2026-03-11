function seoAnalyzer(data) {
  let score = 0;
  let issues = [];
  let passed = [];

  // TITLE (Max 20)
  if (!data.title) {
    issues.push("Missing Title tag");
  } else if (data.title.length >= 30 && data.title.length <= 60) {
    score += 20;
    passed.push("Optimal Title length");
  } else {
    score += 10;
    issues.push(`Title length is ${data.title.length} characters (Optimal is 30-60)`);
  }

  // META DESCRIPTION (Max 20)
  if (!data.metaDescription) {
    issues.push("Missing Meta Description");
  } else if (data.metaDescription.length >= 120 && data.metaDescription.length <= 160) {
    score += 20;
    passed.push("Optimal Meta Description length");
  } else {
    score += 10;
    issues.push(`Meta Description length is ${data.metaDescription.length} characters (Optimal is 120-160)`);
  }

  // HEADINGS (Max 20)
  if (data.h1Count === 1) {
    score += 20;
    passed.push("Exactly one H1 heading found");
  } else if (data.h1Count === 0) {
    issues.push("Missing H1 heading");
  } else {
    score += 5;
    issues.push(`Found ${data.h1Count} H1 headings (Should be exactly one)`);
  }

  // CONTENT LENGTH (Max 20)
  if (data.wordCount > 800) {
    score += 20;
    passed.push("Good content length (> 800 words)");
  } else if (data.wordCount > 300) {
    score += 10;
    issues.push(`Content length is borderline (${data.wordCount} words)`);
  } else {
    score += 5;
    issues.push(`Thin content detected (${data.wordCount} words)`);
  }

  // TECHNICAL SEO (Max 20)
  let techScore = 0;
  if (data.canonical) {
    techScore += 10;
    passed.push("Canonical tag present");
  } else {
    issues.push("Missing Canonical tag");
  }

  if (data.imagesWithoutAlt === 0) {
    techScore += 10;
    passed.push("All images have alt attributes");
  } else {
    issues.push(`Found ${data.imagesWithoutAlt} images missing alt attributes`);
  }

  score += techScore;

  // Bonus/Penalties
  if (data.h2Count > 0) passed.push(`Found ${data.h2Count} H2 headings`);
  if (data.robots && data.robots.includes('noindex')) issues.push("WARNING: Page is blocked from indexing (noindex)");

  return {
    score,
    issues,
    passed
  };
}

module.exports = seoAnalyzer;