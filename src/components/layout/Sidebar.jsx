import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from '../../utils/axiosConfig';
import { encerrarSessao } from '../../utils/permissionStorage';
import { recarregarPermissoes } from '../../utils/permissions';
import logo from '../../assets/Boost.png';
import '../agenda/Agenda.css';
import './Sidebar.css';

export default function Sidebar({ collapsed, onToggle, items, carregando }) {
  const [logoutEmAndamento, setLogoutEmAndamento] = useState(false);

  async function handleLogout() {
    if (logoutEmAndamento) return;
    setLogoutEmAndamento(true);
    await axios.post('/logout').catch(() => null);
    encerrarSessao();
    recarregarPermissoes();
    window.location.replace('/login');
  }

  return (
    <aside className={`agenda-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={onToggle}
            aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="16" y2="12" />
                <line x1="4" y1="18" x2="12" y2="18" />
              </svg>
            )}
          </button>
        </div>

        <div className="sidebar-logo">
          <img src={logo} alt="Boost English" />
        </div>
      </div>

      <nav className="sidebar-nav">
        {carregando && <p className="sidebar-status">Carregando acessos...</p>}

        {!carregando && items.length === 0 && (
          <p className="sidebar-status">Nenhuma tela liberada.</p>
        )}

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
        <button
          type="button"
          className="sidebar-item sidebar-exit"
          onClick={handleLogout}
          disabled={logoutEmAndamento}
          aria-label="Encerrar sessão"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {logoutEmAndamento ? 'Saindo...' : 'Sair'}
        </button>
      </div>
    </aside>
  );
}
