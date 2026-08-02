import { Link } from 'react-router-dom';

import { SECTIONS } from '../admin/sections';
import '../admin/admin.css';

const AdminHome = () => (
  <div>
    <div className="admin-header">
      <h1>Dashboard</h1>
    </div>

    <p className="admin-muted">
      Select a section to view existing records and create new ones.
    </p>

    <div className="admin-cards" style={{ marginTop: 18 }}>
      {SECTIONS.map((section) => (
        <Link
          key={section.key}
          to={`/admin-me/${section.key}`}
          className="admin-dash-card"
        >
          <div className="t">{section.label}</div>
          <div className="s">Manage {section.label.toLowerCase()}</div>
        </Link>
      ))}
    </div>
  </div>
);

export default AdminHome;
