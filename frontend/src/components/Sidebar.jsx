const NAV_ITEMS = [
  { id: "dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
  { id: "user-master", icon: "ti-users", label: "User Master", section: "Administration" },
  { id: "dept-master", icon: "ti-building", label: "Department Master" },
  { id: "ticket-search", icon: "ti-search", label: "Ticket Search", section: "Search" },
  { id: "notif-search", icon: "ti-bell", label: "Notification Search" },
];

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-box">
          <div className="logo-icon"><i className="ti ti-building-bank"></i></div>
          <div>
            <div className="logo-text">Admin Portal</div>
            <div className="logo-sub">Administration</div>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <div key={item.id}>
            {item.section && <div className="nav-section">{item.section}</div>}
            <div
              className={`nav-item${currentPage === item.id ? " active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <i className={`ti ${item.icon}`}></i> {item.label}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
