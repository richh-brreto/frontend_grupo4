import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import '../agenda/Agenda.css';
import './Professors.css';

export default function Professors() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const professores = [
    {
      id: 1,
      nome: 'Adriano Oliveira',
      especialidade: 'Inglês Instrumental',
      email: 'adriano@escola.com',
      carga: '82% da carga',
      aulas: '8 aulas/semana',
      status: 'Disponível'
    },
    {
      id: 2,
      nome: 'Maria Silva',
      especialidade: 'Conversação Avançada',
      email: 'maria@escola.com',
      carga: '64% da carga',
      aulas: '5 aulas/semana',
      status: 'Em aula'
    },
    {
      id: 3,
      nome: 'Carlos Souza',
      especialidade: 'Preparatório para Testes',
      email: 'carlos@escola.com',
      carga: '91% da carga',
      aulas: '9 aulas/semana',
      status: 'Sobrecarga'
    },
    {
      id: 4,
      nome: 'Ana Pereira',
      especialidade: 'Gramática Aplicada',
      email: 'ana@escola.com',
      carga: '54% da carga',
      aulas: '4 aulas/semana',
      status: 'Disponível'
    }
  ];

  return (
    <div className="agenda-page professors-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        items={[
          { to: '/', label: 'Geral', short: 'Geral' },
          { to: '/aulas', label: 'Agenda', short: 'AG' },
          { to: '/dashboard', label: 'Dashboard', short: 'Dash' },
          { to: '/professores', label: 'Professores', short: 'Prof', active: true },
          { to: '/turmas', label: 'Turmas', short: 'Tur' },
          { to: '/alunos', label: 'Alunos', short: 'Alu' },
          { to: '/contratos', label: 'Contratos', short: 'Cont' }
        ]}
      />

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div>
              <h1>Professores</h1>
            </div>
            <div className="agenda-tabs">
              <button className="tab-button active">Todos</button>
              <button className="tab-button">Disponíveis</button>
              <button className="tab-button">Indisponíveis</button>
            </div>
          </div>

          <div className="agenda-frame">
            <div className="professors-grid">
              {professores.map(professor => (
                <article key={professor.id} className="professor-card">
                  <div className="professor-card-top">
                    <div className="avatar-circle">{professor.nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}</div>
                    <div className="professor-main-info">
                      <h3>{professor.nome}</h3>
                      <p>{professor.especialidade}</p>
                    </div>
                    <span className={`status-pill ${professor.status.toLowerCase().replace(/\s+/g, '-')}`}>{professor.status}</span>
                  </div>

                  <div className="professor-meta">
                    <div>
                      <span>Email</span>
                      <strong>{professor.email}</strong>
                    </div>
                    <div>
                      <span>Carga</span>
                      <strong>{professor.carga}</strong>
                    </div>
                    <div>
                      <span>Aulas</span>
                      <strong>{professor.aulas}</strong>
                    </div>
                  </div>

                  <div className="professor-card-actions">
                    <button className="tab-button">Editar</button>
                    <button className="tab-button active">Ver perfil</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
