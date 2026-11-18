require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect to database
connectDB();

const authRoutes = require("./routes/authRoutes");
const auditRoutes = require("./routes/auditRoutes");
const chatRoutes = require("./routes/chatRoutes");
const keywordRoutes = require("./routes/keywordRoutes");

const app = express();

// Trust proxy for Render deployment (uses first entry in X-Forwarded-For)
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

/**
 * Lightweight in-memory rate limiter (fails open on any unexpected error).
 */
function createRateLimiter({ windowMs, maxRequests }) {
  const store = new Map(); // ip -> { count, resetTime }

  // Periodically prune expired entries
  const pruneTimer = setInterval(() => {
    try {
      const now = Date.now();
      for (const [ip, entry] of store.entries()) {
        if (now > entry.resetTime) {
          store.delete(ip);
        }
      }
    } catch {}
  }, 5 * 60 * 1000);
  if (pruneTimer.unref) pruneTimer.unref();

  return (req, res, next) => {
    try {
      const ip = req.ip || req.connection?.remoteAddress || "unknown";
      const now = Date.now();

      let entry = store.get(ip);
      if (!entry || now > entry.resetTime) {
        entry = { count: 1, resetTime: now + windowMs };
        store.set(ip, entry);
        return next();
      }

      if (entry.count >= maxRequests) {
        return res.status(429).json({
          success: false,
          error: "Too many requests, please try again in a few minutes."
        });
      }

      entry.count++;
      return next();
    } catch (err) {
      console.error("Rate limiter error (failing open):", err);
      return next(); // Fail open
    }
  };
}

// 10-minute rate limiters: /api/audit max 20, /api/auth max 30
const auditLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, maxRequests: 20 });
const authLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, maxRequests: 30 });

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "rankvista-api" });
});

// Mount routers with rate limiters
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/audit", auditLimiter, auditRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/keywords", keywordRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("RankVista API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
