export default function Topbar({
  pageTitle,
  activePage,
  setLoggedIn,
  profile
})  {
  return (
    <div className="topbar">
      <span className="breadcrumb">
        Home /<span> {pageTitle[activePage]}</span>
      </span>

      <div className="topbar-right">
        <div className="topbar-avatar">
  {profile?.name?.charAt(0).toUpperCase()}
</div>

<span className="topbar-username">
  {profile?.name}
</span>

        <button className="btn-logout" onClick={() => setLoggedIn(false)}>
          Logout
        </button>
      </div>
    </div>
  );
}
