import { Link } from 'react-router-dom';
import '../agenda/Agenda.css';

export default function Sidebar({ collapsed, onToggle, items }) {
  return (
    <aside className={`agenda-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">Logo</div>
        <button
          type="button"
          className="sidebar-collapse"
          onClick={onToggle}
          aria-label="toggle sidebar"
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          if (item.type === 'button') {
            return (
              <button key={item.label} className={`sidebar-item ${item.active ? 'active' : ''}`} data-short={item.short}>
                {item.label}
              </button>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-item ${item.active ? 'active' : ''}`}
              data-short={item.short}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-item">Logout</button>
      </div>
    </aside>
  );
}
