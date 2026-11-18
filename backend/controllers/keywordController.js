const KeywordSearch = require('../models/KeywordSearch');

/**
 * Generates keyword ideas across question forms, commercial modifiers, and long-tail combinations.
 */
function buildKeywordIdeas(topic) {
  const t = topic.trim();

  const candidates = [
    // Question forms (Informational)
    { keyword: `how to use ${t}`, intent: 'Informational' },
    { keyword: `what is ${t}`, intent: 'Informational' },
    { keyword: `why use ${t}`, intent: 'Informational' },
    { keyword: `how does ${t} work`, intent: 'Informational' },

    // Modifiers & commercial terms
    { keyword: `best ${t} tools`, intent: 'Commercial' },
    { keyword: `top ${t} software`, intent: 'Commercial' },
    { keyword: `best ${t}`, intent: 'Commercial' },
    { keyword: `${t} tools`, intent: 'Commercial' },
    { keyword: `free ${t} template`, intent: 'Transactional' },
    { keyword: `buy ${t} software`, intent: 'Transactional' },

    // Educational / Guides (Informational)
    { keyword: `${t} guide for beginners`, intent: 'Informational' },
    { keyword: `${t} tutorial`, intent: 'Informational' },
    { keyword: `${t} checklist`, intent: 'Informational' },
    { keyword: `${t} examples`, intent: 'Informational' },

    // Long-tail combinations
    { keyword: `${t} for small business`, intent: 'Commercial' },
    { keyword: `${t} step by step`, intent: 'Informational' },
    { keyword: `${t} pricing and plans`, intent: 'Commercial' },
    { keyword: `${t} strategy`, intent: 'Informational' }
  ];

  // Deduplicate and cap at 15 ideas
  const seen = new Set();
  const deduped = [];
  for (const item of candidates) {
    const key = item.keyword.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
    if (deduped.length >= 15) break;
  }

  return deduped;
}

exports.generateKeywords = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    const generated = buildKeywordIdeas(topic);

    // Save search history when authenticated
    if (req.user) {
      await KeywordSearch.create({
        user: req.user.id,
        topic: topic.trim(),
        results: generated
      });
    }

    res.status(200).json({
      success: true,
      data: generated
    });
  } catch (error) {
    console.error("Keyword generation error:", error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getSearchHistory = async (req, res) => {
  try {
    const history = await KeywordSearch.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
