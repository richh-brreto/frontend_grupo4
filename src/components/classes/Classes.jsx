import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import '../agenda/Agenda.css';
import './Classes.css';

export default function Classes() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const turmas = [
    {
      id: 1,
      codigo: 'TURMA 10',
      nome: 'Inglês Instrumental',
      professor: 'Adriano Oliveira',
      horario: 'Terça e Quinta • 18:30',
      alunos: '18 alunos',
      sala: 'Sala 2',
      status: 'Ativa'
    },
    {
      id: 2,
      codigo: 'TURMA 12',
      nome: 'Conversação Avançada',
      professor: 'Maria Silva',
      horario: 'Segunda e Quarta • 20:00',
      alunos: '14 alunos',
      sala: 'Sala 4',
      status: 'Em andamento'
    },
    {
      id: 3,
      codigo: 'TURMA 08',
      nome: 'Preparatório para Testes',
      professor: 'Carlos Souza',
      horario: 'Sábado • 09:00',
      alunos: '22 alunos',
      sala: 'Sala 1',
      status: 'Pendente'
    },
    {
      id: 4,
      codigo: 'TURMA 15',
      nome: 'Gramática Aplicada',
      professor: 'Ana Pereira',
      horario: 'Quarta e Sexta • 16:00',
      alunos: '11 alunos',
      sala: 'Sala 3',
      status: 'Ativa'
    }
  ];

  return (
    <div className="agenda-page classes-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        items={[
          { to: '/overview', label: 'Geral', short: 'Geral' },
          { to: '/aulas', label: 'Agenda', short: 'AG' },
          { to: '/dashboard', label: 'Dashboard', short: 'Dash' },
          { to: '/professores', label: 'Professores', short: 'Prof' },
          { to: '/turmas', label: 'Turmas', short: 'Tur', active: true },
          { to: '/alunos', label: 'Alunos', short: 'Alu' },
          { to: '/contratos', label: 'Contratos', short: 'Cont' }
        ]}
      />

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div>
              <h1>Turmas</h1>
            </div>
            <div className="agenda-tabs">
              <button className="tab-button active">Todas</button>
              <button className="tab-button">Em andamento</button>
              <button className="tab-button">Finalizadas</button>
            </div>
          </div>

          <div className="agenda-frame">
            <div className="classes-grid">
              {turmas.map(turma => (
                <article key={turma.id} className="class-card">
                  <div className="class-card-head">
                    <div>
                      <p className="class-eyebrow">{turma.codigo}</p>
                      <h3>{turma.nome}</h3>
                    </div>
                    <span className={`status-pill ${turma.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {turma.status}
                    </span>
                  </div>

                  <div className="class-meta">
                    <div>
                      <span>Professor</span>
                      <strong>{turma.professor}</strong>
                    </div>
                    <div>
                      <span>Horário</span>
                      <strong>{turma.horario}</strong>
                    </div>
                    <div>
                      <span>Alunos</span>
                      <strong>{turma.alunos}</strong>
                    </div>
                    <div>
                      <span>Sala</span>
                      <strong>{turma.sala}</strong>
                    </div>
                  </div>

                  <div className="class-card-actions">
                    <button className="tab-button">Editar</button>
                    <button className="tab-button active">Ver detalhes</button>
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
