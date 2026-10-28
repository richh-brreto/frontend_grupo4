import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useItensMenu } from '../../utils/menuItems';
import { usePermissoes } from '../../utils/permissions';
import '../agenda/Agenda.css';

const PAGE_CLASSES = {
  '/turmas': 'classes-page',
  '/contratos': 'contracts-page',
  '/dashboard': 'dashboard1-page',
  '/overview': 'overview-page',
  '/professores': 'professors-page',
  '/alunos': 'students-page',
};

export default function ProtectedLayout() {
  const { pathname } = useLocation();
  const { carregando } = usePermissoes();
  const itensMenu = useItensMenu(pathname);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  );

  const alternarSidebar = () => {
    setSidebarCollapsed((atual) => {
      const novoEstado = !atual;
      localStorage.setItem('sidebar-collapsed', String(novoEstado));
      return novoEstado;
    });
  };

  return (
    <div className={`agenda-page ${PAGE_CLASSES[pathname] ?? ''}`.trim()}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={alternarSidebar}
        items={itensMenu}
        carregando={carregando}
      />
      <main className="agenda-content">
        <Outlet />
      </main>
    </div>
  );
}