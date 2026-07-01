import { useState } from "react";

export default function Login({ onLogin }) {

  const [loginType, setLoginType] = useState("local");

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSignIn(e) {

    e.preventDefault();

    setLoading(true);

    setError("");

    try {

      const res = await fetch(

        "http://localhost:3000/api/signin",

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json"

          },

          body: JSON.stringify({

            username,

            password,

            login_type: loginType

          })

        }

      );

      const data = await res.json();

      if (!res.ok) {

        setError(data.message || "Invalid username or password");

        return;

      }

      if (data.token) {

        localStorage.setItem("token", data.token);

      }

      onLogin(data);

    }

    catch(err){

      console.log(err);

      setError("Unable to connect to server.");

    }

    finally{

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

            <h2>Test Portal</h2>

            <p>External Ticket & Notification System</p>

          </div>

          <div className="login-tabs">

            <button

              type="button"

              className={`login-tab ${loginType==="local"?"login-tab-active":""}`}

              onClick={()=>setLoginType("local")}

            >

              Local Login

            </button>

            <button

              type="button"

              className={`login-tab ${loginType==="ldap"?"login-tab-active":""}`}

              onClick={()=>setLoginType("ldap")}

            >

              LDAP Login

            </button>

          </div>

          <form onSubmit={handleSignIn}>

            <div className="form-group">

              <label className="form-label">

                Username

              </label>

              <input

                className="form-input"

                value={username}

                onChange={(e)=>setUsername(e.target.value)}

                required

              />

            </div>

            <div className="form-group">

              <label className="form-label">

                Password

              </label>

              <input

                type="password"

                className="form-input"

                value={password}

                onChange={(e)=>setPassword(e.target.value)}

                required

              />

            </div>

            {error &&

              <div

                style={{

                  color:"red",

                  marginBottom:"12px",

                  textAlign:"center"

                }}

              >

                {error}

              </div>

            }

            <button

              className="btn btn-primary-full"

              type="submit"

              disabled={loading}

            >

              {loading ? "Signing In..." : "Sign In"}

            </button>

          </form>

        </div>

      </div>

    </div>

  );

}