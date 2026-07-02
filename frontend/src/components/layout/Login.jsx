import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function Login() {
  const [loginType, setLoginType] = useState("external");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotPasswordValue, setForgotPasswordValue] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotStatus, setForgotStatus] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const roleDashboards = {
    admin: "/admin/dashboard",
    outside: "/external/dashboard",
    secure: "/internal/dashboard",
  };

  const showForgotPassword = loginType !== "internal";

  async function handleSignIn(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, loginType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid username or password");
        return;
      }

      // Store token and user via auth context
      login(data);

      // Redirect based on role from backend response
      const userRole = data.user?.role;
      if (userRole && roleDashboards[userRole]) {
        navigate(roleDashboards[userRole]);
      } else {
        // Fallback: if backend doesn't return role, default to login error
        setError("Unable to determine user role. Contact administrator.");
      }
    } catch (err) {
      console.log(err);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setForgotLoading(true);
    setForgotStatus("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, username: forgotEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setForgotStatus(data.message || "Unable to process reset request.");
        return;
      }

      setForgotStatus(data.message || "Reset code generated.");
      if (data.otp) {
        setForgotStatus(`${data.message} Demo OTP: ${data.otp}`);
      }
    } catch (err) {
      console.log(err);
      setForgotStatus("Unable to connect to server.");
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setForgotLoading(true);
    setForgotStatus("");

    if (forgotPasswordValue !== forgotConfirmPassword) {
      setForgotStatus("Passwords do not match.");
      setForgotLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          username: forgotEmail,
          otp: forgotOtp,
          newPassword: forgotPasswordValue,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setForgotStatus(data.message || "Unable to reset password.");
        return;
      }

      setForgotStatus(data.message || "Password reset successfully.");
      setForgotMode(false);
      setForgotEmail("");
      setForgotOtp("");
      setForgotPasswordValue("");
      setForgotConfirmPassword("");
    } catch (err) {
      console.log(err);
      setForgotStatus("Unable to connect to server.");
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <div id="login-screen">
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon">
              <i className="ti ti-building-bank"></i>
            </div>
            <h2>SecureComm Portal</h2>
            <p>Ticket & Notification Management System</p>
          </div>

          <div className="login-tabs" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
            <button
              type="button"
              className={`login-tab ${loginType === "internal" ? "login-tab-active" : ""}`}
              onClick={() => setLoginType("internal")}
            >
              <i className="ti ti-shield-lock"></i> Internal Employee
            </button>
            <button
              type="button"
              className={`login-tab ${loginType === "external" ? "login-tab-active" : ""}`}
              onClick={() => setLoginType("external")}
            >
              <i className="ti ti-user"></i> External User
            </button>
            <button
              type="button"
              className={`login-tab ${loginType === "admin" ? "login-tab-active" : ""}`}
              onClick={() => setLoginType("admin")}
            >
              <i className="ti ti-key"></i> Administrator
            </button>
          </div>

          <form onSubmit={handleSignIn}>
            <div className="form-group">
              <label className="form-label">Login Type</label>
              <select className="form-input" value={loginType} onChange={(e) => setLoginType(e.target.value)}>
                <option value="internal">Internal Employee</option>
                <option value="external">External User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div
                style={{
                  color: "red",
                  marginBottom: "12px",
                  textAlign: "center",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}

            <button
              className="btn btn-primary-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {loginType === "internal" ? (
            <p style={{ marginTop: "12px", fontSize: "13px", color: "#64748b", textAlign: "center" }}>
              Corporate passwords are managed by the organization's IT department. Please contact IT Support to reset your password.
            </p>
          ) : showForgotPassword ? (
            <>
              {!forgotMode ? (
                <button
                  type="button"
                  className="forgot"
                  onClick={() => {
                    setForgotMode(true);
                    setForgotStatus("");
                  }}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  Forgot password?
                </button>
              ) : (
                <form onSubmit={forgotMode && forgotOtp ? handleResetPassword : handleForgotPassword} style={{ marginTop: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">{forgotOtp ? "OTP" : "Email"}</label>
                    {forgotOtp ? (
                      <input
                        className="form-input"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        required
                      />
                    ) : (
                      <input
                        className="form-input"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    )}
                  </div>

                  {forgotOtp && (
                    <>
                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-input"
                          value={forgotPasswordValue}
                          onChange={(e) => setForgotPasswordValue(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                          type="password"
                          className="form-input"
                          value={forgotConfirmPassword}
                          onChange={(e) => setForgotConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}

                  {forgotStatus && (
                    <div style={{ color: "#0f766e", marginBottom: "8px", fontSize: "13px", textAlign: "center" }}>
                      {forgotStatus}
                    </div>
                  )}

                  <button className="btn btn-primary-full" type="submit" disabled={forgotLoading}>
                    {forgotLoading ? "Processing..." : forgotOtp ? "Reset Password" : "Send Reset Code"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ marginTop: "8px", width: "100%" }}
                    onClick={() => {
                      setForgotMode(false);
                      setForgotEmail("");
                      setForgotOtp("");
                      setForgotPasswordValue("");
                      setForgotConfirmPassword("");
                      setForgotStatus("");
                    }}
                  >
                    Back to Login
                  </button>
                </form>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
