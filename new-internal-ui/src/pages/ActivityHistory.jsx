import { useEffect, useState } from "react";

export default function ActivityHistory() {

const [activities, setActivities] = useState([]);

async function loadActivity() {

  try {

    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:3000/api/internal/activity",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.log(data);
      return;
    }

    setActivities(data);

  }

  catch(err){

    console.log(err);

  }

}

useEffect(() => {

  loadActivity();

}, []);

return (

<div className="page active">

<div className="page-header">

<div>

<div className="page-title">
Activity History
</div>

<div className="page-sub">
Department audit trail
</div>

</div>

</div>

<div className="card">

{activities.length === 0 ? (

<p>No activity found.</p>

) : (

activities.map((a,index)=>(

<div
className="activity-item"
key={index}
>

<div>

<div className="act-text">

<strong>

{a.type==="notification"

? `NTF-${String(a.item_id).padStart(4,"0")}`

: `TKT-${String(a.item_id).padStart(4,"0")}`}

</strong>

{" — "}

{a.action}

{" by "}

<strong>{a.performed_by}</strong>

</div>

<div className="act-time">

{new Date(a.performed_at).toLocaleString()}

</div>

</div>

</div>

))

)}

</div>

</div>

);

}