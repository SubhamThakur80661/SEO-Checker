const express = require("express");
const router = express.Router();
const { auditSite, getAuditHistory } = require("../controllers/auditController");
const { protect } = require("../middlewares/auth");

// Custom optional auth middleware for audit route
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_change_me');
      req.user = await User.findById(decoded.id);
    } catch (e) {
      console.log("Optional auth invalid token");
    }
  }
  next();
};

router.post("/", optionalAuth, auditSite);
router.get("/history", protect, getAuditHistory);

module.exports = router;