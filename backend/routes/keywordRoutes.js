const express = require('express');
const { generateKeywords, getSearchHistory } = require('../controllers/keywordController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, generateKeywords); // Protect route so only logged in users can search
router.get('/history', protect, getSearchHistory);

module.exports = router;
