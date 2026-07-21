const pool = require("../db.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwt_secret } = require("../config.js");
const { sendNewAccountEmail } = require("../utils/mailer.js");
const { logActivity } = require("../services/activityLogService.js");

// Simple RFC-5322-ish format check — good enough to reject obvious typos
// without pulling in a dependency just for this. Backend validation must
// not rely solely on the frontend's type="email" check.
const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value) {
  return typeof value === "string" && EMAIL_FORMAT_REGEX.test(value.trim());
}

const passwordResetCodes = new Map();

function buildAuthResponse(res, user) {
  const token = jwt.sign(
    {
      user_id: user.user_id,
      role: String(user.role).toLowerCase(),
      department_id: user.department_id,
    },
    jwt_secret,
  );

  return res.status(200).json({
    message: "user signed in",
    token,
    user: {
      user_id: user.user_id,
      role: String(user.role).toLowerCase(),
      department_id: user.department_id,
      username: user.username,
    },
  });
}


async function verifyAuth(user, password) {
  console.log("verifyAuth auth_type:", user.auth_type, "has password:", !!user.password);
  if (user.auth_type === "ldap") {
    return true;
  }
  if (!user.password) return false;
  const result = await bcrypt.compare(password, user.password);
  console.log("bcrypt result:", result);
  return result;
}




async function authenticateUser(req, res, expectedRole) {

  
 

  const { username, password } = req.body;
   console.log("authenticateUser:", username, expectedRole);
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE username=?", [username]);
     console.log("found user:", rows[0]?.username, "auth_type:", rows[0]?.auth_type);

    if (rows.length === 0) return res.status(401).json({ message: "Incorrect Credentials" });

    const user = rows[0];
    const normalizedRole = String(user.role || "").toLowerCase();
    if (expectedRole && normalizedRole !== expectedRole) {
      return res.status(401).json({ message: "Incorrect Credentials" });
    }

    const ok = await verifyAuth(user, password);
     console.log("verifyAuth:", ok);

    if (!ok) return res.status(401).json({ message: "Incorrect Credentials" });

    return buildAuthResponse(res, { ...user, role: expectedRole || normalizedRole });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}


async function signup(req, res) {
  const { username, password, role } = req.body;
  try {
    const hashed_password = await bcrypt.hash(password, 10);
    await pool.query(
      "insert into users(username,password,role) values (?,?,?)",
      [username, hashed_password, role || "OUTSIDE"],
    );
    res.json({ message: "signedup" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function loginAdmin(req, res) {
  return authenticateUser(req, res, "admin");
}

async function loginExternal(req, res) {
  return authenticateUser(req, res, "outside");
}



async function ldapLogin(req, res) {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE username=?", [username]);
    if (rows.length === 0) return res.status(401).json({ message: "Incorrect Credentials" });

    const user = rows[0];
    const normalizedRole = String(user.role || "").toLowerCase();
    if (normalizedRole !== "secure") return res.status(401).json({ message: "Incorrect Credentials" });

    const ok = await verifyAuth(user, password);
    if (!ok) return res.status(401).json({ message: "Incorrect Credentials" });

    await logActivity({
      user_id: user.user_id,
      department_id: user.department_id,
      action: "Login",
      item_type: "user",
      item_id: user.user_id,
    });

    return buildAuthResponse(res, { ...user, role: "secure" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}



async function loginInternal(req, res) {
  return ldapLogin(req, res);
}

async function signin(req, res) {
   console.log("signin body:", req.body);


  const loginType = String(
    req.body?.loginType || req.body?.login_type || "",
  ).toLowerCase();
  console.log("loginType:", loginType);

  if (loginType === "admin") {
    return loginAdmin(req, res);
  }

  if (
    loginType === "internal" ||
    loginType === "ldap" ||
    loginType === "secure"
  ) {
    return loginInternal(req, res);
  }

  return loginExternal(req, res);
}

async function forgotPassword(req, res) {
  const { email, username } = req.body || {};
  const lookupValue = email || username;

  if (!lookupValue) {
    return res.status(400).json({ message: "Email or username is required" });
  }

  try {
    const [rows] = await pool.query("select * from users where username=?", [
      lookupValue,
    ]);

    if (rows.length === 0) {
      return res.json({
        message: "If an account exists, a reset code has been generated.",
      });
    }

    const user = rows[0];
    const normalizedRole = String(user.role || "").toLowerCase();

    if (normalizedRole === "secure") {
      return res
        .status(400)
        .json({ message: "Internal users do not use this flow." });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    passwordResetCodes.set(String(lookupValue).toLowerCase(), {
      userId: user.user_id,
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    return res.json({
      message: "Password reset code generated.",
      otp,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function resetPassword(req, res) {
  const { email, username, otp, newPassword } = req.body || {};
  const lookupValue = email || username;

  if (!lookupValue || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email, OTP, and new password are required" });
  }

  try {
    const resetRequest = passwordResetCodes.get(
      String(lookupValue).toLowerCase(),
    );

    if (!resetRequest || resetRequest.otp !== String(otp)) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    if (Date.now() > resetRequest.expiresAt) {
      passwordResetCodes.delete(String(lookupValue).toLowerCase());
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("update users set password=? where user_id=?", [
      hashedPassword,
      resetRequest.userId,
    ]);

    passwordResetCodes.delete(String(lookupValue).toLowerCase());
    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getUsers(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, username, role, department_id, is_active, auth_type FROM users`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
}

async function updateUser(req, res) {
  try {
    const id = req.params.id;
    const updatedBy = req.user.user_id;
    await pool.query(
      `update users set username=?, role=?, department_id=?, is_active=?, updated_by=? where user_id=?`,
      [
        req.body.username,
        req.body.role,
        req.body.department_id,
        req.body.is_active,
        updatedBy,
        id,
      ],
    );
    res.json({ message: "user updated" });
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
}

async function deactivateUser(req, res) {
  try {
    await pool.query(
      `update users set is_active=false, updated_by=? where user_id=?`,
      [req.user.user_id, req.params.id],
    );
    res.json({ message: "user deactivated" });
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
}

/**
 * POST /api/users (auth, adminOnly)
 *
 * The request additionally carries an `email` field used ONLY to deliver
 * the new account's credentials via Nodemailer. It is:
 *   - never included in the INSERT below (existing `users` columns only —
 *     no schema change, no migration)
 *   - never written to any other table or file
 *   - never logged
 *   - out of scope entirely once this request finishes
 *
 * The plaintext `password` is used only to (1) hash it for storage and
 * (2) include it in the one-time credential email — never persisted or
 * logged in plaintext, never returned by this or any later endpoint.
 *
 * User creation and email delivery are intentionally decoupled: if SMTP
 * delivery fails, the already-created account is NOT rolled back. The
 * response's `emailSent` flag tells the Admin which case occurred.
 */
async function createUser(req, res) {
  console.log("createUser body:", req.body);
  try {
    const { username, password, role, department_id, email, auth_type, ldap_user_id } = req.body;

    if (!password || !password.trim()) {
      return res.status(400).json({ message: "password is required" });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "email is required" });
    }

    const normalizedEmail = email.trim();
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "a valid email address is required" });
    }

    const created_by = req.user.user_id;
    const hashed_password = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users(username, password, role, department_id, created_by, auth_type, ldap_user_id) VALUES(?,?,?,?,?,?,?)`,
      [username, hashed_password, role, department_id, created_by, auth_type || "local", ldap_user_id || null]
    );

    let emailSent = false;
    try {
      await sendNewAccountEmail({
        to: normalizedEmail,
        username,
        temporaryPassword: password,
        role,
      });
      emailSent = true;
    } catch (mailErr) {
      console.log("createUser: credential email failed:", mailErr.message);
    }

    return res.json({
      message: emailSent
        ? "User created and credentials sent."
        : "User created but email could not be sent.",
      emailSent,
    });

  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
}


async function activateUser(req, res) {
  try {
    await pool.query(
      `UPDATE users SET is_active = true, updated_by = ? WHERE user_id = ?`,
      [req.user.user_id, req.params.id],
    );
    res.json({ message: "user activated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

async function getProfile(req, res) {
  try {
    const userId = req.user.user_id;
    const [[user]] = await pool.query(
      `SELECT u.user_id, u.username, u.name, u.role, u.department_id, d.department_name
FROM users u
LEFT JOIN departments d ON u.department_id = d.department_id
WHERE u.user_id = ?`,
      [userId],
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [[stats]] = await pool.query(
      `SELECT
(SELECT COUNT(*) FROM notification_master WHERE department_id = ?) notifications,
(SELECT COUNT(*) FROM tickets WHERE assigned_department = ?) tickets,
(SELECT COUNT(*) FROM tickets t JOIN status_master sm ON t.status_id = sm.status_id
WHERE t.assigned_department = ? AND LOWER(sm.status_name) <> 'closed') pending`,
      [user.department_id, user.department_id, user.department_id],
    );

    res.json({ ...user, stats });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/internal/logout (auth, internalOnly)
 *
 * Internal auth is stateless JWT — the frontend just discards the token
 * client-side, so there was previously no backend call to hang activity
 * logging off of. This endpoint does nothing except record the Logout
 * activity; it exists purely so that action shows up in Activity History.
 */
async function logoutInternal(req, res) {
  await logActivity({
    user_id: req.user.user_id,
    department_id: req.user.department_id,
    action: "Logout",
    item_type: "user",
    item_id: req.user.user_id,
  });
  res.json({ message: "logged out" });
}

/**
 * PATCH /api/internal/change-password
 *
 * Protected by `auth` + `internalOnly` (see routes/user.js). The user whose
 * password is changed is always req.user.user_id from the verified JWT —
 * the request body is never trusted for that. Updates the same
 * users.password field that loginInternal()/ldapLogin() already checks via
 * bcrypt.compare(), since Internal auth here is a simulated DB-backed
 * bcrypt flow rather than a real external LDAP server.
 */
async function changeInternalPassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirmation do not match" });
    }

    const userId = req.user.user_id;

    const [rows] = await pool.query(
      "select password from users where user_id=?",
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentMatches = await bcrypt.compare(
      currentPassword,
      rows[0].password,
    );

    if (!currentMatches) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const sameAsCurrent = await bcrypt.compare(newPassword, rows[0].password);
    if (sameAsCurrent) {
      return res.status(400).json({
        message: "New password must be different from the current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("update users set password=? where user_id=?", [
      hashedPassword,
      userId,
    ]);

    await logActivity({
      user_id: req.user.user_id,
      department_id: req.user.department_id,
      action: "Profile Password Changed",
      item_type: "user",
      item_id: userId,
    });

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  signup,
  signin,
  loginAdmin,
  loginExternal,
  loginInternal,
  ldapLogin,
  forgotPassword,
  resetPassword,
  getUsers,
  updateUser,
  deactivateUser,
  createUser,
  activateUser,
  getProfile,
  changeInternalPassword,
  logoutInternal,
};
