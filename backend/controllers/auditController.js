const mongoose = require("mongoose");
const { assertPublicUrl } = require("../services/urlguard");
const scrapeWebsite = require("../services/scraper");
const seoAnalyzer = require("../services/seoAnalyzer");
const { buildRecommendations, recommendationsToText } = require("../services/recommendations");
const Report = require("../models/Report");

exports.auditSite = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    // Validate URL against SSRF guard before attempting scrape
    try {
      await assertPublicUrl(url);
    } catch (guardError) {
      return res.status(400).json({ success: false, error: guardError.message });
    }

    const data = await scrapeWebsite(url);
    const analysis = seoAnalyzer(data);
    const recommendations = buildRecommendations(data, analysis);
    const aiSuggestions = recommendationsToText(recommendations);

    let savedReportId = null;
    if (req.user) {
      const report = await Report.create({
        user: req.user.id,
        url,
        seoScore: analysis.score,
        siteData: {
          title: data.title,
          metaDescription: data.metaDescription,
          h1Count: data.h1Count || 0,
          h2Count: data.h2Count || 0,
          h3Count: data.h3Count || 0,
          wordCount: data.wordCount || 0,
          statusCode: data.statusCode,
          loadTimeMs: data.loadTimeMs,
          https: data.https,
          finalUrl: data.finalUrl,
          ogTitle: data.ogTitle,
          ogDescription: data.ogDescription,
          ogImage: data.ogImage,
          twitterCard: data.twitterCard,
          viewport: data.viewport,
          lang: data.lang,
          favicon: data.favicon,
          hasStructuredData: Boolean(data.structuredData && data.structuredData.length > 0),
          internalLinks: data.internalLinks || 0,
          externalLinks: data.externalLinks || 0,
          brokenLinks: Array.isArray(data.brokenLinks) ? data.brokenLinks.length : 0,
          imageCount: data.imageCount || 0,
          imagesWithoutAlt: data.imagesWithoutAlt || 0
        },
        checks: analysis.checks,
        categories: analysis.categories,
        issueCounts: analysis.issueCounts,
        recommendations: recommendations,
        aiSuggestions: aiSuggestions
      });
      savedReportId = report._id;
    }

    res.json({
      success: true,
      reportId: savedReportId,
      site: data,
      seo: analysis,
      recommendations,
      aiSuggestions
    });
  } catch (error) {
    console.error("Audit error:", error.message);
    res.status(500).json({ success: false, error: error.message || "Audit failed" });
  }
};

exports.getAuditHistory = async (req, res) => {
  try {
    const history = await Report.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getPublicReport = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const report = await Report.findById(id);
    if (!report || !report.isPublic) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.toggleShare = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    if (report.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to modify this report' });
    }

    const { isPublic } = req.body;
    report.isPublic = typeof isPublic === 'boolean' ? isPublic : !report.isPublic;
    await report.save();

    res.status(200).json({ success: true, isPublic: report.isPublic });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    if (report.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this report' });
    }

    await report.deleteOne();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
