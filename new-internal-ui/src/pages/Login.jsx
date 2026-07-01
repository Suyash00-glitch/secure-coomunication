import { useState } from "react";






export default function Login({ setLoggedIn }) {



const [username, setUsername] = useState("");
const [password, setPassword] = useState("");

async function handleLogin() {

  const res = await fetch(
    "http://localhost:3000/api/signin",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    }
  );

  const data = await res.json();

  if (res.ok) {

    localStorage.setItem("token", data.token);

    setLoggedIn(true);

  }

  else{

    alert(data.message);

  }

}























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

            <input
  className="form-input"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>

            <input
  className="form-input"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
          </div>

          <button
  className="btn-primary-full"
  onClick={handleLogin}
>
  Sign In to Portal
</button>
        </div>
      </div>
    </div>
  );
}