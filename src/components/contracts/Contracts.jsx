import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
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
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        items={[
          { to: '/overview', label: 'Geral', short: 'Geral' },
          { to: '/aulas', label: 'Agenda', short: 'AG' },
          { to: '/dashboard', label: 'Dashboard', short: 'Dash' },
          { to: '/professores', label: 'Professores', short: 'Prof' },
          { to: '/turmas', label: 'Turmas', short: 'Tur' },
          { to: '/alunos', label: 'Alunos', short: 'Alu' },
          { to: '/contratos', label: 'Contratos', short: 'Cont', active: true }
        ]}
      />

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
