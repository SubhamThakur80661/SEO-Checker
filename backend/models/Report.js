const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  seoScore: {
    type: Number,
    required: true
  },
  siteData: {
    title: String,
    metaDescription: String,
    h1Count: Number,
    h2Count: Number,
    h3Count: Number,
    wordCount: Number,
    statusCode: Number,
    loadTimeMs: Number,
    https: Boolean,
    finalUrl: String,
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    twitterCard: String,
    viewport: String,
    lang: String,
    favicon: Boolean,
    hasStructuredData: Boolean,
    internalLinks: Number,
    externalLinks: Number,
    brokenLinks: Number,
    imageCount: Number,
    imagesWithoutAlt: Number
  },
  checks: {
    type: mongoose.Schema.Types.Mixed
  },
  categories: {
    type: mongoose.Schema.Types.Mixed
  },
  issueCounts: {
    type: mongoose.Schema.Types.Mixed
  },
  recommendations: {
    type: mongoose.Schema.Types.Mixed
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  aiSuggestions: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
