import { useState } from "react";
import TicketDetail from "../components/TicketDetail.jsx";

export default function TicketSearch({ tickets, onViewDetail, onBack }) {
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);


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
          <div className="page-title">Ticket Search</div>
          <div className="page-sub">Look up a ticket by its ID</div>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <div className="form-full">
          <label className="form-label">Ticket ID</label>
          <input
            className="form-input"
            type="text"
            placeholder="Enter Ticket ID"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
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
            Ticket not found
          </div>
        )}
      </div>
    </div>
  );
}
