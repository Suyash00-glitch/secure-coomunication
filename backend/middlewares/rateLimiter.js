const rateLimit = require("express-rate-limit");

// =====================================================
// Login Rate Limiter
//
// Protects against brute-force login attempts.
// =====================================================

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

// =====================================================
// Upload Rate Limiter
//
// Prevents upload abuse.
// =====================================================

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 30,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many upload requests. Please try again later.",
  },
});

// =====================================================
// General API Rate Limiter
//
// Protects API from flooding while allowing
// normal enterprise usage.
// =====================================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 300,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please slow down and try again.",
  },
});

module.exports = {
  loginLimiter,
  uploadLimiter,
  apiLimiter,
};
