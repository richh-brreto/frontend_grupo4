import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
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
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        items={[
          { to: '/overview', label: 'Geral', short: 'Geral' },
          { to: '/aulas', label: 'Agenda', short: 'AG' },
          { to: '/dashboard', label: 'Dashboard', short: 'Dash' },
          { to: '/professores', label: 'Professores', short: 'Prof' },
          { to: '/turmas', label: 'Turmas', short: 'Tur' },
          { to: '/alunos', label: 'Alunos', short: 'Alu', active: true },
          { to: '/contratos', label: 'Contratos', short: 'Cont' }
        ]}
      />

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
