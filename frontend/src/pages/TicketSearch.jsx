import { useState,useEffect } from "react";
import TicketDetail from "../components/TicketDetail.jsx";

export default function TicketSearch({ tickets, onViewDetail, onBack }) {
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [openTickets,setOpenTickets]=useState([]);

  
  async function loadOpenTickets(){

try{

const token=localStorage.getItem("token");

const res=await fetch(

"http://localhost:3000/api/tickets/open?page=1&limit=10",

{

headers:{Authorization:`Bearer ${token}`}
}
);

const data=await res.json();

setOpenTickets(data.tickets||[]);

}

catch(err){console.log(err);}

}





async function handleSearch(){

const q =searchId.trim();

if(!q)
return;

try{

const token =localStorage.getItem("token");


const id = q.startsWith("TKT-") ? q.split("-")[1]:q;

const res = await fetch(
`http://localhost:3000/api/tickets/${Number(id)}`,
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
  loadOpenTickets();
}, []);


if(result){
return(
<TicketDetail
ticket={result}
onBack={()=>{setResult(null);setSearched(false);}}/>
);
}


return (
<div>

<div className="page-header">
<div>
<div className="page-title">
Ticket Search
</div>

<div className="page-sub">
Search by ticket ID or browse open tickets
</div>
</div>
</div>


<div className="card">

<label className="form-label">

Ticket ID

</label>

<div style={{display:"flex",gap:10,alignItems:"center"}}>

<input className="form-input" type="text" placeholder="Enter Ticket ID"
value={searchId}
onChange={(e)=>
setSearchId(e.target.value)}

onKeyDown={handleKeyDown} style={{flex:1}}/>

<button className="btn btn-primary" onClick={handleSearch}>

<i className="ti ti-search"></i>

Search

</button>

</div>


{

searched && !result &&

<div className="not-found">

Ticket not found

</div>

}

</div>


<div className="card" style={{marginTop:20}}>

<div style={{display:"flex",justifyContent:"space-between",marginBottom:15}}>

<div>

<div style={{fontWeight:700,fontSize:22}}>

Open Tickets

</div>

<div className="page-sub">

Latest open tickets

</div>

</div>

<button className="btn btn-secondary">

Refresh

</button>

</div>


<table>

<thead>

<tr>

<th>ID</th>

<th>Title</th>

<th>Status</th>

<th>Created</th>

<th></th>

</tr>

</thead>


<tbody>

{

openTickets.map(

t=>(

<tr key={t.ticket_id}>

<td>

{

t.ticket_number || `TKT-${t.ticket_id}`

}

</td>

<td>

{

t.title

}

</td>

<td>

<span className="badge badge-active">

Open

</span>

</td>

<td>

{

new Date(t.created_at).toLocaleDateString()}

</td>

<td>

<button className="btn btn-primary" onClick={async () => {

const token = localStorage.getItem("token");

const res = await fetch(
`http://localhost:3000/api/tickets/${t.ticket_id}`,
{
headers:{
Authorization:`Bearer ${token}`
}
});

const data = await res.json();

setResult(data);

}}>

View

</button>

</td>

</tr>

)

)

}

</tbody>

</table>


<div style={{marginTop:15}}>
Showing latest
10 open tickets

</div>

</div>

</div>
);







}
