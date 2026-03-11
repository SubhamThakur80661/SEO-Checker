const scrapeWebsite = require("../services/scraper");
const seoAnalyzer = require("../services/seoAnalyzer");
const generateSuggestions = require("../services/aiEngine");
const Report = require("../models/Report");

exports.auditSite = async (req,res)=>{
  try{
    const {url} = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    const data = await scrapeWebsite(url);
    const analysis = seoAnalyzer(data);
    const ai = await generateSuggestions(data);

    // If user is authenticated via middleware (assuming optional protection for this route to allow guests to try it)
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
          wordCount: data.wordCount || 0
        },
        aiSuggestions: ai
      });
      savedReportId = report._id;
    }

    res.json({
      success: true,
      reportId: savedReportId,
      site: data,
      seo: analysis,
      aiSuggestions: ai
    });

  }catch(error){
    console.log(error);
    res.status(500).json({success: false, error: "Audit failed"})
  }
}

// Add history endpoint
exports.getAuditHistory = async (req, res) => {
  try {
    const history = await Report.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: history.length, data: history });
  } catch(error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
}