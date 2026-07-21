require("dotenv").config();
const nodemailer = require("nodemailer");

/**
 * Small, single-purpose mail helper for the Admin "Create User" flow.
 *
 * Reads SMTP configuration from backend environment variables only
 * (never from the frontend / VITE_* vars). No credentials are hardcoded
 * here — if SMTP_* is not configured, sendNewAccountEmail() will throw,
 * which the caller (userController.createUser) already handles as a
 * non-fatal "account created, email failed" outcome.
 */

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
}

// role (as stored on the JWT / users.role) -> { label, urlEnvVar }
const ROLE_PORTAL_MAP = {
  admin: { label: "Admin Portal", urlEnvVar: "ADMIN_PORTAL_URL" },
  secure: { label: "Internal Portal", urlEnvVar: "INTERNAL_PORTAL_URL" },
  outside: { label: "External Portal", urlEnvVar: "EXTERNAL_PORTAL_URL" },
};

function resolvePortal(role) {
  const normalizedRole = String(role || "").toLowerCase();
  const entry = ROLE_PORTAL_MAP[normalizedRole];

  if (!entry) {
    return { label: "Secure Communication", url: "" };
  }

  return {
    label: entry.label,
    url: process.env[entry.urlEnvVar] || "",
  };
}

function buildEmailBody({ username, temporaryPassword, portalLabel, portalUrl }) {
  return `Hello,

An account has been created for you on Secure Communication by Manipal Technologies Limited.

Portal: ${portalLabel}
Username: ${username}
Temporary Password: ${temporaryPassword}

Login URL:
${portalUrl}

For security, we recommend changing your temporary password after your first login.

Regards,
Manipal Technologies Limited`;
}

/**
 * Sends the new-account credential email.
 *
 * @param {Object} params
 * @param {string} params.to - recipient email address (request-only, never persisted)
 * @param {string} params.username - the newly created username
 * @param {string} params.temporaryPassword - the plaintext temporary password (never persisted, never logged)
 * @param {string} params.role - the user's role ("admin" | "secure" | "outside")
 *
 * Throws on failure — callers should catch this and treat it as a
 * non-fatal "email not sent" outcome rather than rolling back user creation.
 */
async function sendNewAccountEmail({ to, username, temporaryPassword, role }) {
  const { label: portalLabel, url: portalUrl } = resolvePortal(role);

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to,
    subject: "Your Secure Communication Account",
    text: buildEmailBody({ username, temporaryPassword, portalLabel, portalUrl }),
  };

  const transporter = getTransporter();
  await transporter.sendMail(mailOptions);
}

module.exports = { sendNewAccountEmail };
