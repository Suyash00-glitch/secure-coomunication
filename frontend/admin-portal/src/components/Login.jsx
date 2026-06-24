
import {useState}
from "react";


export default function Login({

onLogin

}){


const [username,setUsername]=useState("");


const [password,setPassword]=useState("");


function submit(){

onLogin(username,password);

}


return(

<div id="login-screen">

<div className="login-wrap">

<div className="login-card">

<div className="login-logo">

<div className="login-logo-icon">

<i className="ti ti-building-bank"></i>

</div>

<h2>

Admin Portal

</h2>

<p>

Administration Panel

</p>

</div>


<div className="form-group">

<label className="form-label">

Username

</label>

<input className="form-input"

placeholder="Enter username"

type="text" value={username}

onChange={e=>setUsername(e.target.value)}/>

</div>


<div className="form-group">

<label className="form-label">

Password

</label>

<input className="form-input" placeholder="Enter password" type="password"

value={password}

onChange={e=>

setPassword(e.target.value)}/>

</div>

<button className="btn btn-primary-full" onClick={submit}>

<i className="ti ti-login"></i>

Sign In

</button>


<p className="forgot">

Forgot password?

</p>

</div>

</div>

</div>

);

}

