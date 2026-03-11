const KeywordSearch = require('../models/KeywordSearch');

exports.generateKeywords = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    // In a high-end app, this would call an external API (like DataForSEO)
    // For now, we simulate an advanced generation based on intent.
    const generated = [
      { keyword: `${topic} tools`, intent: 'Commercial' },
      { keyword: `${topic} examples`, intent: 'Informational' },
      { keyword: `${topic} strategy`, intent: 'Informational' },
      { keyword: `best ${topic}`, intent: 'Commercial' },
      { keyword: `${topic} marketing`, intent: 'Navigational' },
      { keyword: `${topic} guide`, intent: 'Informational' },
      { keyword: `how to use ${topic}`, intent: 'Informational' },
      { keyword: `${topic} software`, intent: 'Transactional' },
      { keyword: `${topic} comparison`, intent: 'Commercial' }
    ];

    // Save search history
    if (req.user) {
      await KeywordSearch.create({
        user: req.user.id,
        topic,
        results: generated
      });
    }

    res.status(200).json({
      success: true,
      data: generated
    });
  } catch (error) {
    console.error(error);
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
