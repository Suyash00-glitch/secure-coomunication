/**
 * Sidebar navigation — structure and class names preserved from original.
 */
export default function Sidebar({ currentPage, onNavigate }) {
  const navActive = (id) => (currentPage === id ? "nav-item active" : "nav-item");

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-box">
          <div className="logo-icon"><i className="ti ti-building-bank"></i></div>
          <div>
            <div className="logo-text">Test Portal</div>
            <div className="logo-sub">External Application</div>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className={navActive("dashboard")} onClick={() => onNavigate("dashboard")}>
          <i className="ti ti-layout-dashboard"></i> Dashboard
        </div>
        <div className="nav-section">Tickets</div>
        <div className={navActive("ticket-list")} onClick={() => onNavigate("ticket-list")}>
          <i className="ti ti-ticket"></i> Ticket List
        </div>
        <div className={navActive("create-ticket")} onClick={() => onNavigate("create-ticket")}>
          <i className="ti ti-plus"></i> Create Ticket
        </div>
        <div className="nav-section">Notifications</div>
        <div className={navActive("notif-list")} onClick={() => onNavigate("notif-list")}>
          <i className="ti ti-bell"></i> Notification List
        </div>
        <div className={navActive("create-notif")} onClick={() => onNavigate("create-notif")}>
          <i className="ti ti-send"></i> Create Notification
        </div>
        <div className="nav-section">Administration</div>
        <div className={navActive("user-master")} onClick={() => onNavigate("user-master")}>
          <i className="ti ti-users"></i> User Master
        </div>
        <div className={navActive("dept-master")} onClick={() => onNavigate("dept-master")}>
          <i className="ti ti-building"></i> Department Master
        </div>
      </nav>
    </div>
  );
}
