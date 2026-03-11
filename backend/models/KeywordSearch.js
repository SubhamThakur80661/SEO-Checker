const mongoose = require('mongoose');

const keywordSearchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  results: [{
    keyword: String,
    intent: String // e.g., Informational, Transactional
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('KeywordSearch', keywordSearchSchema);
