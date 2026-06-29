export default function Topbar({ pageTitle, activePage, setLoggedIn }) {
  return (
    <div className="topbar">
      <span className="breadcrumb">
        Home /<span> {pageTitle[activePage]}</span>
      </span>

      <div className="topbar-right">
        <div className="topbar-avatar">PS</div>

        <span className="topbar-username">Priya Sharma</span>

        <button className="btn-logout" onClick={() => setLoggedIn(false)}>
          Logout
        </button>
      </div>
    </div>
  );
}
