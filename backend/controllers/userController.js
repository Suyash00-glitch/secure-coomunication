const pool = require("../db.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwt_secret } = require("../config.js");

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

async function authenticateUser(req, res, expectedRole) {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query("select * from users where username=?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Incorrect Credentials" });
    }

    const user = rows[0];
    const normalizedRole = String(user.role || "").toLowerCase();

    if (expectedRole && normalizedRole !== expectedRole) {
      return res.status(401).json({ message: "Incorrect Credentials" });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(401).json({ message: "Incorrect Credentials" });
    }

    return buildAuthResponse(res, {
      ...user,
      role: expectedRole || normalizedRole,
    });
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
    // Simulated employee lookup against the existing user records.
    // Replace this block with a real LDAP/Active Directory integration later.
    const [rows] = await pool.query("select * from users where username=?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Incorrect Credentials" });
    }

    const user = rows[0];
    const normalizedRole = String(user.role || "").toLowerCase();

    if (normalizedRole !== "secure") {
      return res.status(401).json({ message: "Incorrect Credentials" });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(401).json({ message: "Incorrect Credentials" });
    }

    return buildAuthResponse(res, {
      ...user,
      role: "secure",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function loginInternal(req, res) {
  return ldapLogin(req, res);
}

async function signin(req, res) {
  const loginType = String(
    req.body?.loginType || req.body?.login_type || "",
  ).toLowerCase();

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
      `select user_id, username, role, department_id, is_active from users`,
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

async function createUser(req, res) {
  try {
    const { username, password, role, department_id } = req.body;
    if (!password || !password.trim()) {
      return res.status(400).json({ message: "password is required" });
    }
    const created_by = req.user.user_id;
    const hashed_password = await bcrypt.hash(password, 10);
    await pool.query(
      `insert into users(username, password, role, department_id, created_by) values(?,?,?,?,?)`,
      [username, hashed_password, role, department_id, created_by],
    );
    res.json({ message: "user created" });
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
};
