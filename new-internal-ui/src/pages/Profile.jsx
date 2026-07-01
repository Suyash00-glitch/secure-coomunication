import { useEffect, useState } from "react";

export default function Profile() {

const [profile,setProfile]=useState(null);

async function loadProfile(){

try{

const token=localStorage.getItem("token");

const res=await fetch(

"http://localhost:3000/api/internal/profile",

{

headers:{
Authorization:`Bearer ${token}`
}

}

);

const data=await res.json();

if(!res.ok){

console.log(data);
return;

}

setProfile(data);

}

catch(err){

console.log(err);

}

}

useEffect(()=>{

loadProfile();

},[]);

if(!profile){

return <div className="page active">Loading...</div>;

}

return (

<div className="page active">

<div className="page-header">

<div>

<div className="page-title">
My Profile
</div>

<div className="page-sub">
View and manage account information
</div>

</div>

</div>

<div className="profile-card">

<div className="profile-avatar">

{profile.name
? profile.name.charAt(0).toUpperCase()
: profile.username.charAt(0).toUpperCase()}

</div>

<div style={{flex:1}}>

<div className="profile-name">

{profile.name}

</div>

<div className="profile-meta">

{profile.department_name} · {profile.role}

</div>



</div>

<button className="btn btn-primary">

Edit Profile

</button>

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"20px"
}}
>

<div className="card">

<div className="card-header">

<span className="card-title">

Account Details

</span>

</div>

<div className="info-row">

<span className="info-key">

Staff ID

</span>

<span>

{profile.user_id}

</span>

</div>

<div className="info-row">

<span className="info-key">

Username

</span>

<span>

{profile.username}

</span>

</div>

<div className="info-row">

<span className="info-key">

Department

</span>

<span>

{profile.department_name}

</span>

</div>

<div className="info-row">

<span className="info-key">

Role

</span>

<span>

{profile.role}

</span>

</div>

</div>

<div className="card">

<div className="card-header">

<span className="card-title">

My Stats

</span>

</div>

<div className="info-row">

<span className="info-key">

Notifications Assigned

</span>

<span>

{profile.stats.notifications}

</span>

</div>

<div className="info-row">

<span className="info-key">

Tickets Assigned

</span>

<span>

{profile.stats.tickets}

</span>

</div>

<div className="info-row">

<span className="info-key">

Pending Tickets

</span>

<span>

{profile.stats.pending}

</span>

</div>

</div>

</div>

</div>

);

}