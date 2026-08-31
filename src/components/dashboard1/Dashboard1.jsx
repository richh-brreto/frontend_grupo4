import React, { useMemo, useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import '../agenda/Agenda.css';
import './Dashboard1.css';

const defaultPayload = {
  totalProfessores: 24,
  totalAulas: 186,
  totalHorasLivres: 76.5,
  professoresSobrecarregados: 3,
  detalhes: [
    {
      professorId: 1,
      nome: 'Adriano Oliveira',
      data: '2026-07-06',
      aulasCount: 8,
      horasSemanais: 32,
      horasLivres: 8,
      status: 'Equilibrado'
    },
    {
      professorId: 2,
      nome: 'Maria Silva',
      data: '2026-07-08',
      aulasCount: 5,
      horasSemanais: 20,
      horasLivres: 20,
      status: 'Disponível'
    },
    {
      professorId: 3,
      nome: 'Carlos Souza',
      data: '2026-07-10',
      aulasCount: 9,
      horasSemanais: 36,
      horasLivres: 4,
      status: 'Sobrecarregado'
    },
    {
      professorId: 4,
      nome: 'Ana Pereira',
      data: '2026-07-12',
      aulasCount: 4,
      horasSemanais: 16,
      horasLivres: 24,
      status: 'Disponível'
    }
  ]
};

function getStatusClass(status) {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('sobre')) return 'status-overload';
  if (normalized.includes('dispo')) return 'status-available';
  return 'status-balanced';
}

export default function Dashboard1({ dashboardData = defaultPayload }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [periodo, setPeriodo] = useState({ dataInicio: '', dataFim: '' });

  const data = useMemo(() => ({
    ...defaultPayload,
    ...dashboardData,
    detalhes: (dashboardData?.detalhes || defaultPayload.detalhes).map((item, index) => ({
      ...item,
      professorId: item.professorId ?? index + 1
    }))
  }), [dashboardData]);

  const detalhesFiltrados = data.detalhes.filter(item => (
    (!periodo.dataInicio || !item.data || item.data >= periodo.dataInicio)
    && (!periodo.dataFim || !item.data || item.data <= periodo.dataFim)
  ));

  const dadosDoPeriodo = {
    detalhes: detalhesFiltrados,
    totalProfessores: new Set(detalhesFiltrados.map(item => item.professorId)).size,
    totalAulas: detalhesFiltrados.reduce((total, item) => total + Number(item.aulasCount || 0), 0),
    totalHorasLivres: detalhesFiltrados.reduce((total, item) => total + Number(item.horasLivres || 0), 0),
    professoresSobrecarregados: detalhesFiltrados.filter(item => getStatusClass(item.status) === 'status-overload').length
  };

  const maxHours = Math.max(...dadosDoPeriodo.detalhes.map(item => Number(item.horasSemanais || 0)), 40);

  const atualizarPeriodo = (campo, valor) => {
    setPeriodo(periodoAtual => ({ ...periodoAtual, [campo]: valor }));
  };

  return (
    <div className="agenda-page dashboard1-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        items={[
          { to: '/overview', label: 'Geral', short: 'Geral' },
          { to: '/aulas', label: 'Agenda', short: 'AG' },
          { to: '/dashboard1', label: 'Dashboard', short: 'Dash', active: true },
          { to: '/professores', label: 'Professores', short: 'Prof' },
          { to: '/turmas', label: 'Turmas', short: 'Tur' },
          { to: '/alunos', label: 'Alunos', short: 'Alu' },
          { to: '/contratos', label: 'Contratos', short: 'Cont' }
        ]}
      />

      <main className="agenda-content">
        <div className="agenda-panel dashboard1-panel">
          <div className="dashboard1-header">
            <div>
              <p className="dashboard1-eyebrow">Painel de carga</p>
              <h1>Dashboard operacional</h1>
            </div>
            <div className="dashboard1-actions">
              <label>
                <span>Data início</span>
                <input
                  type="date"
                  value={periodo.dataInicio}
                  onChange={event => atualizarPeriodo('dataInicio', event.target.value)}
                />
              </label>
              <label>
                <span>Data fim</span>
                <input
                  type="date"
                  min={periodo.dataInicio}
                  value={periodo.dataFim}
                  onChange={event => atualizarPeriodo('dataFim', event.target.value)}
                />
              </label>
              <ButtonContainer>
                <Button active>Exportar relatório</Button>
              </ButtonContainer>
            </div>
          </div>

          <div className="dashboard1-metrics">
            <article className="metric-card-large">
              <span>Total de professores</span>
              <strong>{dadosDoPeriodo.totalProfessores}</strong>
              <small>Ativos no sistema</small>
            </article>
            <article className="metric-card-large">
              <span>Total de aulas</span>
              <strong>{dadosDoPeriodo.totalAulas}</strong>
              <small>Programadas no período</small>
            </article>
            <article className="metric-card-large">
              <span>Horas livres</span>
              <strong>{dadosDoPeriodo.totalHorasLivres.toFixed(1)}h</strong>
              <small>Disponibilidade no período</small>
            </article>
            <article className="metric-card-large accent">
              <span>Professores sobrecarregados</span>
              <strong>{dadosDoPeriodo.professoresSobrecarregados}</strong>
              <small>Necessitam revisão</small>
            </article>
          </div>

          <div className="dashboard1-grid">
            <section className="dashboard1-card chart-card">
              <div className="dashboard1-card-header">
                <h2>Horas semanais por professor</h2>
                <span>Dados vindos do backend</span>
              </div>

              <div className="bars-chart">
                {dadosDoPeriodo.detalhes.map(item => {
                  const width = Math.max((Number(item.horasSemanais || 0) / maxHours) * 100, 11);
                  return (
                    <div key={item.professorId} className="bar-row">
                      <div className="bar-labels">
                        <strong>{item.nome}</strong>
                        <span>{item.horasSemanais}h / {item.horasLivres}h livres</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="dashboard1-card summary-card">
              <div className="dashboard1-card-header">
                <h2>Resumo por professor</h2>
                <span>Baseado no payload recebido</span>
              </div>

              <div className="summary-list">
                {dadosDoPeriodo.detalhes.map(item => (
                  <div key={item.professorId} className="summary-item">
                    <div>
                      <strong>{item.nome}</strong>
                      <p>{item.aulasCount} aulas • {item.horasSemanais}h semanais</p>
                    </div>
                    <span className={`status-pill ${getStatusClass(item.status)}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
