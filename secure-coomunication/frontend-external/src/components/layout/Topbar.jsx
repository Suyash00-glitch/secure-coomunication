import { pageNames, pageSections } from "../../constants";
import { useState } from "react";
/**
 * Top bar — breadcrumb, notification bell, avatar, logout.
 * `user` comes from the login response or a dedicated /me endpoint.
 */
export default function Topbar({  currentPage,
  user,
  onLogout }) {


  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="topbar">
      <div>
        <span className="breadcrumb" id="breadcrumb">
          {pageSections[currentPage]} / <span>{pageNames[currentPage]}</span>
        </span>
      </div>
      <div className="topbar-right">
        <div className="tb-icon" title="Notifications">
          <i className="ti ti-bell" style={{ fontSize: 18 }}></i>
          <span className="badge-dot"></span>
        </div>
        <div className="tb-icon" title="Settings">
          <i className="ti ti-settings" style={{ fontSize: 18 }}></i>
        </div>
        <div className="avatar" title={user?.name || "User"}>
          {initials}
        </div>
        <button
  className="btn-logout"
  onClick={() => setShowLogoutModal(true)}
>
  Logout
</button>
      </div>


      {showLogoutModal && (
  <div className="modal-overlay">
    <div className="modal">

      <h2>Confirm Logout</h2>

      <p>Are you sure you want to logout?</p>

      <div className="modal-footer">

        <button
  type="button"
  className="btn-close"
  onClick={() => setShowLogoutModal(false)}
>
  Cancel
</button>

<button
  type="button"
  className="btn-ack"
  onClick={() => {
    setShowLogoutModal(false);
    onLogout();
  }}
>
  Logout
</button>

      </div>

    </div>
  </div>
)}


    </div>
  );
}
