import React, { useMemo, useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import { useChat } from '../chat/chatContext';
import { useUsuarioAtual } from '../../utils/permissions';
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
  if (normalized.includes('sobre') && !normalized.includes('subu')) return 'status-overload';
  if (normalized.includes('dispo') || normalized.includes('available')) return 'status-available';
  if (normalized.includes('subu')) return 'status-underutilized';
  if (normalized.includes('equil') || normalized.includes('balanced')) return 'status-balanced';
  return 'status-balanced';
}

export default function Dashboard1({ dashboardData: externalDashboardData = null }) {
  const { abrirRelatorio } = useChat();
  const { professorId, ehAdministrador } = useUsuarioAtual();
  const [periodo, setPeriodo] = useState({ dataInicio: '', dataFim: '' });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Buscar dados do backend ao montar o componente
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/dashboard/professores');
        
        // Adaptar os dados da API para o formato esperado
        const adaptedData = {
          totalProfessores: response.data.totalProfessores,
          totalAulas: response.data.totalAulas,
          totalHorasLivres: response.data.totalHorasLivres,
          professoresSobrecarregados: response.data.professoresSobrecarregados,
          detalhes: response.data.detalhes.map(detalhe => ({
            professorId: detalhe.professorId,
            nome: detalhe.nome,
            aulasCount: detalhe.aulasCount,
            horasSemanais: detalhe.horasSemanais,
            horasLivres: detalhe.horasLivres,
            status: detalhe.status
          }))
        };
        
        setDashboardData(adaptedData);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
        setError(err.response?.data?.message || err.message || 'Erro ao carregar dados do dashboard');
        setDashboardData(import.meta.env.DEV ? defaultPayload : null);
      } finally {
        setLoading(false);
      }
    };

    // Só faz a requisição se não houver dados externos
    if (!externalDashboardData) {
      fetchDashboardData();
    } else {
      setDashboardData(externalDashboardData);
      setError(null);
      setLoading(false);
    }
  }, [externalDashboardData, retryCount]);

  const data = useMemo(() => {
    const source = dashboardData ?? (import.meta.env.DEV ? defaultPayload : {});
    return {
      ...source,
      detalhes: (source.detalhes || []).map((item, index) => ({
        ...item,
        professorId: item.professorId ?? index + 1
      }))
    };
  }, [dashboardData]);

  const detalhesVisiveis = ehAdministrador
    ? data.detalhes
    : data.detalhes.filter((item) => professorId != null
      && String(item.professorId) === String(professorId));

  // A dashboard é um snapshot semanal (grade contratada x disponibilidade),
  // então não filtramos por período aqui. As datas acima servem só para o
  // "Exportar relatório".
  const resumo = {
    detalhes: detalhesVisiveis,
    totalProfessores: ehAdministrador
      ? data.totalProfessores ?? new Set(detalhesVisiveis.map(item => item.professorId)).size
      : detalhesVisiveis.length,
    totalAulas: ehAdministrador
      ? data.totalAulas ?? detalhesVisiveis.reduce((total, item) => total + Number(item.aulasCount || 0), 0)
      : detalhesVisiveis.reduce((total, item) => total + Number(item.aulasCount || 0), 0),
    totalHorasLivres: ehAdministrador
      ? data.totalHorasLivres ?? detalhesVisiveis.reduce((total, item) => total + Number(item.horasLivres || 0), 0)
      : detalhesVisiveis.reduce((total, item) => total + Number(item.horasLivres || 0), 0),
    professoresSobrecarregados: ehAdministrador
      ? data.professoresSobrecarregados ?? detalhesVisiveis.filter(item => getStatusClass(item.status) === 'status-overload').length
      : detalhesVisiveis.filter(item => getStatusClass(item.status) === 'status-overload').length
  };

  const maxHours = Math.max(...resumo.detalhes.map(item => Number(item.horasSemanais || 0)), 40);

  const atualizarPeriodo = (campo, valor) => {
    setPeriodo(periodoAtual => ({ ...periodoAtual, [campo]: valor }));
  };

  if (loading) {
    return (
      <div className="agenda-panel dashboard1-panel">
        <p style={{ textAlign: 'center', padding: '20px' }}>Carregando dados...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="agenda-panel dashboard1-panel">
        <div className="dashboard1-error" role="alert">
          <p>Não foi possível carregar os dados do painel. {error}</p>
          <Button active onClick={() => setRetryCount((count) => count + 1)}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="agenda-panel dashboard1-panel">
          <div className="dashboard1-header">
            <div>
              <p className="dashboard1-eyebrow">Painel de carga</p>
              <h1>Dashboard operacional</h1>
            </div>
            {ehAdministrador && <div className="dashboard1-actions">
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
                <Button active onClick={() => abrirRelatorio(periodo)}>Exportar relatório</Button>
              </ButtonContainer>
            </div>}
          </div>

          {error && import.meta.env.DEV && (
            <div className="dashboard1-demo-warning" role="status">
              {error}. Exibindo dados de exemplo apenas em desenvolvimento.
            </div>
          )}

          <div className="dashboard1-metrics">
            <article className="metric-card-large">
              <span>{ehAdministrador ? 'Total de professores' : 'Perfil'}</span>
              <strong>{resumo.totalProfessores}</strong>
              <small>{ehAdministrador ? 'Ativos no sistema' : 'Professor'}</small>
            </article>
            <article className="metric-card-large">
              <span>Total de aulas</span>
              <strong>{resumo.totalAulas}</strong>
              <small>Aulas por semana (grade)</small>
            </article>
            <article className="metric-card-large">
              <span>Horas livres</span>
              <strong>{resumo.totalHorasLivres.toFixed(1)}h</strong>
              <small>Disponibilidade semanal</small>
            </article>
            <article className="metric-card-large accent">
              <span>{ehAdministrador ? 'Professores sobrecarregados' : 'Status de carga'}</span>
              <strong>{resumo.professoresSobrecarregados}</strong>
              <small>{ehAdministrador ? 'Necessitam revisão' : 'Aulas acima da capacidade'}</small>
            </article>
          </div>

          <div className="dashboard1-grid">
            <section className="dashboard1-card chart-card">
              <div className="dashboard1-card-header">
                <h2>{ehAdministrador ? 'Horas semanais por professor' : 'Sua carga semanal'}</h2>
                <span>Grade contratada x disponibilidade</span>
              </div>

              <div className="bars-chart">
                {resumo.detalhes.map(item => {
                  const horasSemanais = Number(item.horasSemanais || 0);
                  const horasLivres = Number(item.horasLivres || 0);
                  const horasAlocadas = horasSemanais - horasLivres; // Horas já usadas com aulas
                  
                  // A barra track (total) tem tamanho baseado em horasSemanais
                  const trackWidth = Math.max((horasSemanais / maxHours) * 100, 11);
                  
                  // A barra fill (pintada) tem tamanho proporcional às horas alocadas
                  // Só aparece se houver horas alocadas (horasAlocadas > 0)
                  const fillWidth = horasSemanais > 0 ? (horasAlocadas / horasSemanais) * 100 : 0;
                  
                  return (
                    <div key={item.professorId} className="bar-row">
                      <div className="bar-labels">
                        <strong>{item.nome}</strong>
                        <span>{horasAlocadas}h de {horasSemanais}h ocupadas</span>
                      </div>
                      <div className="bar-track" style={{ width: `${trackWidth}%` }}>
                        {fillWidth > 0 && <div className="bar-fill" style={{ width: `${fillWidth}%` }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="dashboard1-card summary-card">
              <div className="dashboard1-card-header">
                <h2>{ehAdministrador ? 'Resumo por professor' : 'Seu resumo'}</h2>
                <span>{ehAdministrador ? 'Carga semanal por professor' : 'Sua carga semanal'}</span>
              </div>

              <div className="summary-list">
                {resumo.detalhes.map(item => (
                  <div key={item.professorId} className="summary-item">
                    <div>
                      <strong>{item.nome}</strong>
                      <p>{item.aulasCount} aulas/semana • {item.horasLivres}h livres</p>
                    </div>
                    <span className={`status-pill ${getStatusClass(item.status)}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
    </div>
  );
}
