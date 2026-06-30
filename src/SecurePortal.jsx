import { useState } from "react";

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

import { notificationList as notificationData } from "./data/notifications";
import { tickets } from "./data/tickets";
import { ticketTimeline } from "./data/ticketTimeline";
import { pageTitle } from "./data/pageTitle";

export default function SecurePortal() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [activePage, setActivePage] = useState("dashboard");

  const [notificationList, setNotificationList] = useState(notificationData);

  const [selectedNotification, setSelectedNotification] = useState(null);

  const [showForwardModal, setShowForwardModal] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);

  const [toast, setToast] = useState("");

  function acknowledgeNotification(id) {
    setNotificationList(
      notificationList.map((n) =>
        n.id === id ? { ...n, status: "Acknowledged" } : n,
      ),
    );

    setToast("Notification acknowledged");

    setTimeout(() => {
      setToast("");
    }, 3000);
  }

  if (!loggedIn) {
    return <Login setLoggedIn={setLoggedIn} />;
  }

  return (
    <div id="main-app">
      <div className="app">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />

        <div className="main">
          <Topbar
            activePage={activePage}
            pageTitle={pageTitle}
            setLoggedIn={setLoggedIn}
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
                selectedTicket={selectedTicket}
                setSelectedTicket={setSelectedTicket}
              />
            )}

            {activePage === "activity" && <ActivityHistory />}

            {activePage === "profile" && <Profile />}

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
            {selectedTicket && (
              <div className="modal-overlay">
                <div className="modal notification-modal">
                  <div className="modal-header">
                    <h2>{selectedTicket.id} - Ticket Details</h2>

                    <button
                      className="modal-close"
                      onClick={() => setSelectedTicket(null)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="modal-content">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Ticket ID</label>
                        <span>{selectedTicket.id}</span>
                      </div>

                      <div className="detail-item">
                        <label>User</label>
                        <span>{selectedTicket.user}</span>
                      </div>

                      <div className="detail-item">
                        <label>Priority</label>
                        <span>{selectedTicket.priority}</span>
                      </div>

                      <div className="detail-item">
                        <label>Status</label>
                        <span>{selectedTicket.status}</span>
                      </div>
                    </div>

                    <div className="subject-box">
                      <label>Issue</label>
                      <div>{selectedTicket.issue}</div>
                    </div>

                    <div className="message-box">
                      <label>Ticket Timeline</label>

                      {ticketTimeline[selectedTicket.id]?.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            gap: "15px",
                            padding: "12px 0",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              background: "#2563eb",
                              marginTop: "6px",
                            }}
                          />

                          <div>
                            <strong>{item.time}</strong>
                            <div>{item.action}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn-close"
                      onClick={() => setSelectedTicket(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
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
