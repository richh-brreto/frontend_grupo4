import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../agenda/Agenda.css';
import './Students.css';

export default function Students() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const alunos = new Array(4).fill(0).map((_, i) => ({
    id: i,
    nome: 'Adriano Oliveira Santos',
    faltas: 3,
    ativo: i % 2 === 0
  }));

  return (
    <div className={`agenda-page students-page`}>
      <aside className={`agenda-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">Logo</div>
          <button
            type="button"
            className="sidebar-collapse"
            onClick={() => setSidebarCollapsed(prev => !prev)}
          >
            {sidebarCollapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className="sidebar-item" data-short="Geral">Geral</Link>
          <Link to="/aulas" className="sidebar-item" data-short="AG">Agenda</Link>
          <Link to="/dashboard" className="sidebar-item" data-short="Dash">Dashboards</Link>
          <Link to="/professores" className="sidebar-item" data-short="Prof">Professores</Link>
          <Link to="/turmas" className="sidebar-item" data-short="Tur">Turmas</Link>
          <Link to="/alunos" className="sidebar-item active" data-short="Alu">Alunos</Link>
          <Link to="/contratos" className="sidebar-item" data-short="Cont">Contratos</Link>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item">Logout</button>
        </div>
      </aside>

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button className="tab-button" style={{ borderRadius: 10 }}>Adicionar aluno</button>
            </div>
          </div>

          <div className="agenda-frame">
            <div style={{ padding: '22px 36px', display: 'grid', gap: 18 }}>
              {alunos.map(a => (
                <div key={a.id} className="student-row">
                  <div className="student-left">
                    <div className="student-text">Aluno: {a.nome} | Faltas: {a.faltas} |</div>
                    <div className="student-ativo">
                      <span className="ativo-label">Ativo</span>
                      <label className="switch">
                        <input type="checkbox" defaultChecked={a.ativo} />
                        <span className="slider" />
                      </label>
                    </div>
                  </div>

                  <div className="student-controls">
                    <button className="tab-button">Editar</button>
                    <button className="tab-button" style={{ marginLeft: 8 }}>Visualizar faltas</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
