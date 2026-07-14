import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../agenda/Agenda.css';
import './Contracts.css';

export default function Contracts() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const contratos = [
    {
      id: 0,
      tipo: 'Mensal',
      dataInicio: '2026-07-01',
      dataFim: '2026-12-31',
      turma: { id: 1, nome: 'Turma 10' },
      professor: { id: 1, nome: 'Adriano Oliveira' },
      aluno: { id: 1, nome: 'Adriano Oliveira', ativo: true },
      horarios: []
    },
    {
      id: 1,
      tipo: 'Aula Avulsa',
      dataInicio: '2026-07-10',
      dataFim: '2026-07-10',
      turma: { id: 2, nome: 'Turma 5' },
      professor: { id: 2, nome: 'Maria Silva' },
      aluno: { id: 2, nome: 'Maria Silva', ativo: false },
      horarios: []
    },
    {
      id: 2,
      tipo: 'Mensal',
      dataInicio: '2026-06-01',
      dataFim: '2026-12-01',
      turma: { id: 3, nome: 'Turma 8' },
      professor: { id: 3, nome: 'Carlos Souza' },
      aluno: { id: 3, nome: 'Carlos Souza', ativo: true },
      horarios: []
    }
  ];

  return (
    <div className={`agenda-page contracts-page`}>
      <aside className={`agenda-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">Logo</div>
          <button
            type="button"
            className="sidebar-collapse"
            onClick={() => setSidebarCollapsed(prev => !prev)}
            aria-label="toggle sidebar"
          >
            {sidebarCollapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className="sidebar-item" data-short="Geral">Geral</Link>
          <Link to="/aulas" className="sidebar-item" data-short="AG">Agenda</Link>
          <Link to="/dashboard" className="sidebar-item" data-short="Dash">Dashboards</Link>
          <Link to="#" className="sidebar-item" data-short="Prof">Professores</Link>
          <Link to="#" className="sidebar-item" data-short="Tur">Turmas</Link>
          <Link to="/alunos" className="sidebar-item" data-short="Alu">Alunos</Link>
          <Link to="/contratos" className="sidebar-item active" data-short="Cont">Contratos</Link>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item">Logout</button>
        </div>
      </aside>

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar" style={{ alignItems: 'center' }}>
            <div />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button className="tab-button" style={{ borderRadius: 10 }}>Adicionar Contrato</button>
            </div>
          </div>

          <div className="agenda-frame">
            <div style={{ padding: '22px 36px', display: 'grid', gap: 18 }}>
              {contratos.map(c => (
                <div key={c.id} className="contract-row">
                  <div className="contract-left">
                    <div className="contract-text">Contrato: {c.tipo} | Turma: {c.turma?.nome} | Aluno: {c.aluno?.nome}</div>
                    <div className="contract-ativo">
                      <span className="ativo-label">Ativo</span>
                      <label className="switch">
                        <input type="checkbox" defaultChecked={!!c.aluno?.ativo} />
                        <span className="slider" />
                      </label>
                    </div>
                  </div>

                  <div className="contract-controls">
                    <button className="tab-button">Editar</button>
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
