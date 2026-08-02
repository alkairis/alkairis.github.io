import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { logout } from '../api/api';
import { SECTIONS } from '../admin/sections';
import '../admin/admin.css';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/sign-me', { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">Admin</div>

        <NavLink to="/admin-me" end className="admin-nav-link">
          Dashboard
        </NavLink>

        {SECTIONS.map((section) => (
          <NavLink
            key={section.key}
            to={`/admin-me/${section.key}`}
            className="admin-nav-link"
          >
            {section.label}
          </NavLink>
        ))}

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-btn admin-btn-ghost admin-btn-full"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
