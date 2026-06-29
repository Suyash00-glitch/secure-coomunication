const PAGE_META = {
  "dashboard":       { section: "Home",           name: "Dashboard" },
  "user-master":     { section: "Administration", name: "User Master" },
  "dept-master":     { section: "Administration", name: "Department Master" },
  "ticket-search":   { section: "Search",         name: "Ticket Search" },
  "notif-search":    { section: "Search",         name: "Notification Search" },
  "ticket-detail":   { section: "Search",         name: "Ticket Detail" },
  "notif-detail":    { section: "Search",         name: "Notification Detail" },
};

export default function Topbar({ currentPage, user, onLogout }) {
  const meta = PAGE_META[currentPage] || { section: "", name: "" };

  return (
    <div className="topbar">
      <div>
        <span className="breadcrumb">
          {meta.section} / <span>{meta.name}</span>
        </span>
      </div>
      <div className="topbar-right">
        <div className="avatar" title={user?.name || "Admin"}>
          {user?.name ? user.name.split(" ").map(w => w[0]).join("") : "AD"}
        </div>
        <div className="tb-icon" onClick={onLogout} style={{ cursor: "pointer" }} title="Logout">
          <i className="ti ti-logout" style={{ fontSize: 18 }}></i>
        </div>
      </div>
    </div>
  );
}
