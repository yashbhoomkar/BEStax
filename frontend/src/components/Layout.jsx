import { NavLink, Outlet } from "react-router-dom";

import { SIDEBAR_LINKS } from "../lib/constants";

function Layout() {
  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-badge">BS</div>
          <div>
            <h1 className="sidebar-title">BEProjectStax</h1>
            <p className="sidebar-subtitle">LLM Evaluation Workspace</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {SIDEBAR_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>Build, evaluate, and manage your query-quality workflows from one place.</p>
        </div>
      </aside>
      <main className="page-content">
        <div className="page-surface">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
