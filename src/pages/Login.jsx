export default function Login({ setLoggedIn }) {
  return (
    <div id="login-screen">
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon">🔒</div>

            <div className="login-badge">Internal Staff Portal</div>

            <h2>Department Portal</h2>

            <p>Secure Ticketing & Notification Management</p>
          </div>

          <div className="form-group">
            <label className="form-label">Staff Username</label>

            <input className="form-input" defaultValue="priya.sharma" />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>

            <input
              className="form-input"
              type="password"
              defaultValue="password"
            />
          </div>

          <button
            className="btn-primary-full"
            onClick={() => setLoggedIn(true)}
          >
            Sign In to Portal
          </button>
        </div>
      </div>
    </div>
  );
}
