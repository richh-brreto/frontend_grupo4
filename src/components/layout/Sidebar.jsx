import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from '../../utils/axiosConfig';
import { encerrarSessao } from '../../utils/permissionStorage';
import { recarregarPermissoes } from '../../utils/permissions';
import '../agenda/Agenda.css';

export default function Sidebar({ collapsed, onToggle, items, carregando }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const salvo = localStorage.getItem('sidebar-collapsed');
    return salvo === null ? collapsed : salvo === 'true';
  });

  const alternarSidebar = () => {
    setSidebarCollapsed((atual) => {
      const novoEstado = !atual;
      localStorage.setItem('sidebar-collapsed', String(novoEstado));
      return novoEstado;
    });
    onToggle();
  };

  function handleLogout() {
    const encerrar = () => {
      encerrarSessao();
      recarregarPermissoes();
      window.location.href = '/login';
    };

    axios.post('/logout').finally(encerrar);
  }

  return (
    <aside className={`agenda-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">Logo</div>
        <button
          type="button"
          className="sidebar-collapse"
          onClick={alternarSidebar}
          aria-label="toggle sidebar"
        >
          {sidebarCollapsed ? '›' : '‹'}
        </button>
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
        <button type="button" className="sidebar-item" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
