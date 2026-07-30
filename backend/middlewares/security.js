/**
 * ==========================================================
 * Enterprise Security Middleware
 * ==========================================================
 *
 * This file centralizes all HTTP security headers.
 *
 * Implemented:
 * - Content Security Policy (CSP)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Referrer-Policy
 * - Permissions-Policy
 * - Cross-Origin-Opener-Policy
 * - Cross-Origin-Resource-Policy
 * - HSTS (Production Only)
 * - Removes X-Powered-By
 *
 * Uses Helmet wherever possible.
 * ==========================================================
 */

const helmet = require("helmet");

const isProduction = process.env.NODE_ENV === "production";

const securityMiddleware = helmet({
  // =====================================================
  // Hide Express fingerprint
  // =====================================================
  hidePoweredBy: true,

  // =====================================================
  // Prevent Clickjacking
  // X-Frame-Options: DENY
  // =====================================================
  frameguard: {
    action: "deny",
  },

  // =====================================================
  // Prevent MIME sniffing
  // X-Content-Type-Options: nosniff
  // =====================================================
  noSniff: true,

  // =====================================================
  // Referrer Policy
  // Prevent leaking internal URLs
  // =====================================================
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },

  // =====================================================
  // Strict Transport Security
  // Enabled ONLY in production
  // =====================================================
  hsts: isProduction
    ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      }
    : false,

  // =====================================================
  // Cross-Origin Opener Policy
  // =====================================================
  crossOriginOpenerPolicy: {
    policy: "same-origin",
  },

  // =====================================================
  // Cross-Origin Resource Policy
  //
  // "same-origin" is safe because your downloads use
  // res.download() instead of exposing static folders.
  // =====================================================
  crossOriginResourcePolicy: {
    policy: "same-origin",
  },

  // =====================================================
  // Content Security Policy
  //
  // Development allows Vite + Socket.IO.
  // Production remains much stricter.
  // =====================================================
  contentSecurityPolicy: {
    useDefaults: true,

    directives: {
      defaultSrc: ["'self'"],

      scriptSrc: ["'self'"],

      styleSrc: ["'self'", "'unsafe-inline'"],

      imgSrc: ["'self'", "data:", "blob:"],

      fontSrc: ["'self'", "data:"],

      objectSrc: ["'none'"],

      frameAncestors: ["'none'"],

      baseUri: ["'self'"],

      formAction: ["'self'"],

      connectSrc: isProduction
        ? ["'self'"]
        : [
            "'self'",
            "http://localhost:3000",
            "ws://localhost:3000",

            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",

            "ws://localhost:5173",
            "ws://localhost:5174",
            "ws://localhost:5175",
          ],
    },
  },
});

// =========================================================
// Permissions Policy
//
// Disable browser capabilities not used by this project.
// =========================================================
function permissionsPolicy(req, res, next) {
  res.setHeader(
    "Permissions-Policy",

    [
      "accelerometer=()",
      "ambient-light-sensor=()",
      "autoplay=()",
      "battery=()",
      "camera=()",
      "display-capture=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "picture-in-picture=()",
      "publickey-credentials-get=()",
      "screen-wake-lock=()",
      "serial=()",
      "speaker-selection=()",
      "usb=()",
      "web-share=()",
      "xr-spatial-tracking=()",
    ].join(", "),
  );

  next();
}

module.exports = {
  securityMiddleware,
  permissionsPolicy,
};
