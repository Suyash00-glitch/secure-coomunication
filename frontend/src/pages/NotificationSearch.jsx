import { useState , useEffect } from "react";
import NotificationDetail from "../components/NotificationDetail.jsx";

export default function NotificationSearch() {
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [notifications, setNotifications] = useState([]);
  //const [selected, setSelected] = useState(null);


async function loadNotifications() {

const token = localStorage.getItem("token");

const res = await fetch(
"http://localhost:3000/api/notifications/latest?page=1&limit=10",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

const data = await res.json();

setNotifications(data.notifications || []);

}




async function handleSearch(){

const q =searchId.trim();

if(!q)
return;


try{

const token =localStorage.getItem("token");


const id = q.startsWith("NOT-")? q.split("-")[1]:q;


const res =

await fetch(`http://localhost:3000/api/notifications/${Number(id)}`,

{

headers:{

Authorization:`Bearer ${token}`}}

);


if(res.ok){

const data =await res.json();

setResult(data);

}

else{

setResult(null);

}


setSearched(true);

}

catch(err){

console.log(err);

setResult(null);

}

}



  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  function handleReset() {
    setSearchId("");
    setResult(null);
    setSearched(false);
  }

useEffect(() => {
loadNotifications();
}, []);



if(result){

return(
<NotificationDetail
notification={result}
onBack={()=>{setResult(null);setSearched(false);}}/>
);

}


  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Notification Search</div>
          <div className="page-sub">Look up a notification by its ID</div>
        </div>
      </div>
      <div className="card">
        
<label className="form-label">
  Notification ID
</label>

<div
  style={{
    display: "flex",
    gap: 10,
    alignItems: "center",
  }}
>
  <input
    className="form-input"
    type="text"
    placeholder="Enter Notification ID"
    value={searchId}
    onChange={e => setSearchId(e.target.value)}
    onKeyDown={handleKeyDown}
    style={{ flex: 1 }}
  />

  <button className="btn btn-primary" onClick={handleSearch}>
    <i className="ti ti-search"></i> Search
  </button>

  {searched && (
    <button className="btn btn-secondary" onClick={handleReset}>
      <i className="ti ti-arrow-back"></i> Back
    </button>
  )}
</div>


        {searched && !result && (
          <div className="not-found">
            <i className="ti ti-alert-triangle"></i>
            Notification not found
          </div>
        )}
      </div>

    <div className="card" style={{ marginTop: 20 }}>

<div style={{ display:"flex", justifyContent:"space-between", marginBottom:15}}
>

<div>

<div style={{fontWeight:700, fontSize:22}}>

Latest Notifications

</div>

<div className="page-sub">

Latest 10 notifications

</div>

</div>

<button className="btn btn-secondary" onClick={loadNotifications}>

Refresh

</button>

</div>


<table>

<thead>

<tr>

<th>ID</th>

<th>Title</th>

<th>Created</th>

<th></th>

</tr>

</thead>

<tbody>

{

notifications.map(

n=>(

<tr key={n.notification_id}>

<td>

{n.notification_number || `NOT-${n.notification_id}`}

</td>

<td>

{

n.title

}

</td>

<td>

{ new Date(n.created_at).toLocaleDateString()}

</td>

<td>

<button className="btn btn-primary" onClick={async()=>{

const token=localStorage.getItem("token");

const res=await fetch( `http://localhost:3000/api/notifications/${n.notification_id}`,

{

headers:{ Authorization:`Bearer ${token}`}});

const data=await res.json();

setResult(data);}}>

View

</button>

</td>

</tr>))}

</tbody>

</table>

<div style={{marginTop:15}}>

Showing latest 10 notifications

</div>

</div>



    </div>
  );
}
