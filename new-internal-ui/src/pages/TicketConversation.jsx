import { useEffect, useState } from "react";

export default function TicketConversation({ ticketId, goBack })  {


  const [ticket, setTicket] = useState(null);

const [conversation, setConversation] = useState([]);

const [responses, setResponses] = useState([]);

const [selectedResponse, setSelectedResponse] = useState(null);

const [showConfirm, setShowConfirm] = useState(false);

async function loadTicket() {

  const token = localStorage.getItem("token");

  const res = await fetch(

    `http://localhost:3000/api/internal/tickets/${ticketId}`,

    {

      headers: {
        Authorization: `Bearer ${token}`
      }

    }

  );

  const data = await res.json();

  if(res.ok){

    setTicket(data);

  }

}

async function loadConversation() {

  const token = localStorage.getItem("token");

  const res = await fetch(

    `http://localhost:3000/api/internal/tickets/${ticketId}/conversation`,

    {

      headers: {

        Authorization:`Bearer ${token}`

      }

    }

  );

  const data = await res.json();

  if(res.ok){

    setConversation(data);

  }

}


async function loadResponses(){

const token=localStorage.getItem("token");

const res=await fetch(

`http://localhost:3000/api/internal/tickets/${ticketId}/responses`,

{

headers:{

Authorization:`Bearer ${token}`

}

}

);

const data=await res.json();

if(res.ok){

setResponses(data);

}

}


useEffect(()=>{

loadTicket();

loadConversation();

loadResponses();

},[ticketId]);






if(!ticket){

return <div>Loading...</div>;

}

  return (

<div className="page active">

<div className="page-header">

<button className="btn" onClick={goBack}>
← Back
</button>

<div>

<div className="page-title">
{ticket.id || `TKT-${ticket.ticket_id}`}
</div>

<div className="page-sub">
Status : {ticket.status_name}
</div>

</div>

</div>

<div className="card">

<h3>Ticket Details</h3>

<div className="detail-grid">

<div className="detail-item">
<label>Ticket ID</label>
<span>{ticket.id || `TKT-${ticket.ticket_id}`}</span>
</div>

<div className="detail-item">
<label>Status</label>
<span>{ticket.status_name}</span>
</div>

<div className="detail-item">
<label>Created By</label>
<span>{ticket.created_by_name}</span>
</div>

<div className="detail-item">
<label>Created On</label>
<span>{new Date(ticket.created_at).toLocaleString()}</span>
</div>

</div>

<div className="subject-box">

<label>Issue</label>

<div>{ticket.title}</div>

</div>

<div className="message-box">

<label>Description</label>

<div>{ticket.description}</div>

</div>

</div>

<div className="card">

<h3>Conversation</h3>

{conversation.map(msg=>(

<div

key={msg.conversation_id}

className={
msg.sender_type==="internal"
? "chat-right"
: "chat-left"
}

>

<strong>{msg.username}</strong>

<p>{msg.message_text}</p>

</div>

))}

</div>

<div className="card">

<h3>Available Responses</h3>

{responses.map((r) => (

<label
  className={`response-option ${
    selectedResponse == r.response_id ? "selected-response" : ""
  }`}
>

  <div className="response-content">

  <input
    type="radio"
    name="response"
    checked={selectedResponse == r.response_id}
    onChange={() => setSelectedResponse(Number(r.response_id))}
  />

  <span>{r.response_text}</span>

</div>

  {r.response_text}

</label>

))}


<div style={{ marginTop: "20px", textAlign: "right" }}>

<button
  className="btn-send-response"
  disabled={!selectedResponse}
  onClick={() => setShowConfirm(true)}
>
  Send Response
</button>

</div>

</div>

<div style={{marginTop:"20px"}}>

<button className="btn btn-danger">

Close Ticket

</button>

</div>



{showConfirm && (

<div className="modal-overlay">

  <div className="modal">

    <h2>Confirm Response</h2>

    <p>
      Are you sure you want to send this response?
    </p>

    <div className="modal-footer">

      <button
        className="btn-close"
        onClick={() => setShowConfirm(false)}
      >
        Cancel
      </button>

      <button
        className="btn-ack"
        onClick={() => {

          // we'll call the backend here later

          setShowConfirm(false);

        }}
      >
        Send
      </button>

    </div>

  </div>

</div>

)}

</div>


  );
}