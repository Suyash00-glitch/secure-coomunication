import { useState , useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import NotificationModal from "./components/NotificationModal";
import ForwardModal from "./components/ForwardModal";

import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import Tickets from "./pages/Tickets";
import ActivityHistory from "./pages/ActivityHistory";
import Profile from "./pages/Profile";
import Login from "./pages/Login";


import TicketConversation from "./pages/TicketConversation";

import { pageTitle } from "./data/pageTitle";

export default function SecurePortal() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [activePage, setActivePage] = useState("dashboard");

  const [notificationList, setNotificationList] = useState([]);

  const [tickets, setTickets] = useState([]);

  const [selectedNotification, setSelectedNotification] = useState(null);

  const [showForwardModal, setShowForwardModal] = useState(false);

  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const [toast, setToast] = useState("");

  const [profile, setProfile] = useState(null);

  
  async function loadNotifications() {

  try {

    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:3000/api/internal/notifications",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    if (!res.ok) {console.log(data);return;}

setNotificationList(

  data.map(n => ({

    notification_id: n.notification_id,

    id: `NTF-${String(n.notification_id).padStart(4, "0")}`,

    sender: n.created_by,

    subject: n.title,

    datetime: new Date(n.created_at).toLocaleString(),

    description: n.description,

    priority: n.priority,

    status: n.is_acknowledged
    ? "Acknowledged"
    : "Unacknowledged"

  }))

);

  }

  catch(err){

    console.log(err);

  }

}







async function loadTickets() {

  try {

    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:3000/api/internal/tickets",
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

    setTickets(

      data.map(t => ({

        ticket_id: t.ticket_id,

        id: `TKT-${String(t.ticket_id).padStart(4,"0")}`,

        user: t.created_by,

        issue: t.title,

        description: t.description,

        status: t.status_name,

        updated: new Date(t.created_at).toLocaleString(),

        acknowledged: t.acknowledgement_at !== null,

        acknowledgement_at: t.acknowledgement_at

      }))

    );

  }

  catch(err){

    console.log(err);

  }

}


async function loadProfile() {

  try {

    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost:3000/api/internal/profile",
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

    setProfile(data);

  }

  catch(err){

    console.log(err);

  }

}



  useEffect(() => {

    if (loggedIn) {
        loadNotifications(),loadTickets(),loadProfile();
    }

}, [loggedIn]);




async function acknowledgeNotification(id) {

  try {

    const token = localStorage.getItem("token");

    const res = await fetch(

      `http://localhost:3000/api/internal/notifications/${id}/acknowledge`,

      {

        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`
        }

      }

    );

    if (!res.ok) {
      throw new Error("Failed to acknowledge");
    }

    loadNotifications();

    setToast("Notification acknowledged");

    setTimeout(() => {
      setToast("");
    }, 3000);

  }

  catch(err){

    console.log(err);

  }

}




function openTicket(id) {

  setSelectedTicketId(id);

  setActivePage("ticket-conversation");

}




  if (!loggedIn) {
    return <Login setLoggedIn={setLoggedIn} />;
  }

  return (
    <div id="main-app">
      <div className="app">
       <Sidebar
  activePage={activePage}
  setActivePage={setActivePage}
  profile={profile}
/>
        <div className="main">
         <Topbar
  activePage={activePage}
  pageTitle={pageTitle}
  setLoggedIn={setLoggedIn}
  profile={profile}
/>

          <div className="content">
            {activePage === "dashboard" && (
              <Dashboard
                notificationList={notificationList}
                tickets={tickets}
                setActivePage={setActivePage}
              />
            )}


            

            {activePage === "notifications" && (
              <Notifications
                notificationList={notificationList}
                setSelectedNotification={setSelectedNotification}
                acknowledgeNotification={acknowledgeNotification}
                setShowForwardModal={setShowForwardModal}
              />
            )}

            {activePage === "tickets" && (
             <Tickets
    tickets={tickets}
    openTicket={openTicket}
/>
            )}

            {activePage === "ticket-conversation" && (
  <TicketConversation
    ticketId={selectedTicketId}
    goBack={() => {
      setActivePage("tickets");
      loadTickets();
    }}
  />
)}

            {activePage === "activity" && <ActivityHistory />}

            {activePage === "profile" && (
  <Profile
    profile={profile}
  />
)}

            {toast && (
              <div
                style={{
                  position: "fixed",
                  top: "20px",
                  right: "20px",
                  background: "#16a34a",
                  color: "#fff",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  zIndex: 9999,
                  boxShadow: "0 8px 25px rgba(0,0,0,.15)",
                }}
              >
                {toast}
              </div>
            )}
            

            <NotificationModal
              selectedNotification={selectedNotification}
              setSelectedNotification={setSelectedNotification}
              acknowledgeNotification={acknowledgeNotification}
              setShowForwardModal={setShowForwardModal}
            />

            <ForwardModal
              showForwardModal={showForwardModal}
              selectedNotification={selectedNotification}
              setShowForwardModal={setShowForwardModal}
              setSelectedNotification={setSelectedNotification}
              setToast={setToast}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
