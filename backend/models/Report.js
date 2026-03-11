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
    wordCount: Number
  },
  aiSuggestions: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
