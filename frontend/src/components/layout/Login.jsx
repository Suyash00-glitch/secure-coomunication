import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function Login() {
  const [loginType, setLoginType] = useState("local");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const roleDashboards = {
    admin: "/admin/dashboard",
    outside: "/external/dashboard",
    secure: "/internal/dashboard",
  };

  async function handleSignIn(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, login_type: loginType }),
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

          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab ${loginType === "local" ? "login-tab-active" : ""}`}
              onClick={() => setLoginType("local")}
            >
              <i className="ti ti-key"></i> Username / Password
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
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{ color: "red", marginBottom: "12px", textAlign: "center", fontSize: "13px" }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary-full" type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="forgot">Forgot password?</p>
        </div>
      </div>
    </div>
  );
}
