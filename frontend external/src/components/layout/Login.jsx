import { useState } from "react";

/**
 * Login screen — supports LDAP and Local authentication.
 * Authenticates via POST /signin with login_type included.
 * On success the backend is expected to return a token and user info (including role).
 */
export default function Login({ onLogin }) {
  const [loginType, setLoginType] = useState("local"); // "ldap" | "local"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, login_type: loginType }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store token for subsequent API calls
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        onLogin(data);
      } else {
        setError(data.error || data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="login-screen">
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon"><i className="ti ti-building-bank"></i></div>
            <h2>Test Portal</h2>
            <p>External Ticket &amp; Notification System</p>
          </div>

          {/* Login type tabs */}
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab ${loginType === "local" ? "login-tab-active" : ""}`}
              onClick={() => setLoginType("local")}
            >
              <i className="ti ti-lock"></i> Local Login
            </button>
            <button
              type="button"
              className={`login-tab ${loginType === "ldap" ? "login-tab-active" : ""}`}
              onClick={() => setLoginType("ldap")}
            >
              <i className="ti ti-shield-lock"></i> LDAP Login
            </button>
          </div>

          <form onSubmit={handleSignIn}>
            <div className="form-group">
              <label className="form-label">
                {loginType === "ldap" ? "LDAP Username" : "Username"}
              </label>
              <input
                className="form-input"
                id="text-1"
                placeholder={loginType === "ldap" ? "Enter LDAP username" : "Enter username"}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                {loginType === "ldap" ? "LDAP Password" : "Password"}
              </label>
              <input
                className="form-input"
                id="password-2"
                placeholder={loginType === "ldap" ? "Enter LDAP password" : "Enter password"}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p style={{ color: "#ef4444", fontSize: 12, marginBottom: 12, textAlign: "center" }}>
                {error}
              </p>
            )}
            <button className="btn btn-primary-full" id="button-3" type="submit" disabled={loading}>
              <i className="ti ti-login"></i> {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <p className="forgot">Forgot password?</p>
        </div>
      </div>
    </div>
  );
}
