import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import { aulasService } from './aulasService';
import { isCoordenador } from '../../utils/auth';
import './Agenda.css';

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const HORAS = Array.from({ length: 24 }, (_, i) => `${String(0 + i).padStart(2, '0')}:00`);
const ALTURA_HORA = 48; // pixels por hora

// YYYY-MM-DD no fuso local (toISOString converte para UTC e pode trocar o dia)
const formatarDataLocal = (data) => [
  data.getFullYear(),
  String(data.getMonth() + 1).padStart(2, '0'),
  String(data.getDate()).padStart(2, '0')
].join('-');

// Em contratos de grupo cada aluno tem o próprio contrato e, portanto, as próprias aulas.
// Na agenda, as aulas da mesma turma no mesmo dia e horário viram um único evento.
const agruparAulas = (aulas) => {
  const grupos = new Map();

  aulas.forEach(aula => {
    const horaInicio = aula.horaInicio?.slice(0, 5);
    const horaFim = aula.horaFim?.slice(0, 5);
    const chave = aula.turmaId
      ? `turma-${aula.turmaId}-${aula.data}-${horaInicio}-${horaFim}`
      : `aula-${aula.id}`;

    if (!grupos.has(chave)) {
      grupos.set(chave, {
        ...aula,
        id: chave,
        horaInicio,
        horaFim,
        aulaIds: [],
        participantes: [],
        professor: aula.professor || 'Sem professor'
      });
    }

    const grupo = grupos.get(chave);
    grupo.aulaIds.push(aula.id);
    grupo.participantes.push({
      aulaId: aula.id,
      alunoId: aula.alunoId,
      aluno: aula.aluno,
      presenca: aula.presenca,
      status: aula.status
    });
  });

  return [...grupos.values()].map(grupo => {
    // O encontro só aparece como cancelado quando todas as aulas estão canceladas
    const ativos = grupo.participantes.filter(p => p.status !== 'CANCELADA');
    return { ...grupo, status: ativos.length ? ativos[0].status : 'CANCELADA', ativos };
  }).map(grupo => (
    grupo.turmaId
      ? {
          ...grupo,
          conta: grupo.turma,
          turma: `${grupo.participantes.length} aluno${grupo.participantes.length === 1 ? '' : 's'}`
        }
      : {
          ...grupo,
          conta: grupo.aluno || `Contrato #${grupo.contratoId}`,
          turma: 'Individual'
        }
  ));
};

const formatarDiaMes = (dataIso) => {
  const [, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}`;
};

const obterDiasSemana = (dataAtual) => {
  const dias = [];
  const dataInicio = new Date(dataAtual);
  const diaSemana = dataInicio.getDay();
  const segunda = new Date(dataInicio);
  segunda.setDate(dataInicio.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));

  for (let i = 0; i < 7; i++) {
    const dia = new Date(segunda);
    dia.setDate(segunda.getDate() + i);
    dias.push({
      data: formatarDataLocal(dia),
      diaSemana: DIAS_SEMANA[i],
      dia: dia.getDate(),
      mes: dia.getMonth() + 1
    });
  }

  return dias;
};

export default function Agenda() {
  const [aulas, setAulas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [dataAtual, setDataAtual] = useState(new Date());
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filtros, setFiltros] = useState({ dataInicio: '', dataFim: '', conta: '', professor: '' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAusenciaModalOpen, setIsAusenciaModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedAula, setSelectedAula] = useState(null);
  const [alunosAusentes, setAlunosAusentes] = useState([]);
  const [remarcacao, setRemarcacao] = useState({ novaData: '', novaHoraInicio: '', novaHoraFim: '', motivo: '' });
  const [versaoAulas, setVersaoAulas] = useState(0);
  const podeGerenciar = isCoordenador();

  const abrirModalAdicionar = (dia) => {
    setSelectedDay(dia);
    setIsAddModalOpen(true);
  };

  const fecharModalAdicionar = () => {
    setIsAddModalOpen(false);
    setSelectedDay(null);
  };

  const abrirModalEditar = (aula) => {
    setSelectedAula(aula);
    setIsEditModalOpen(true);
  };

  const fecharModalEditar = () => {
    setIsEditModalOpen(false);
    setSelectedAula(null);
  };

  const recarregarAulas = () => setVersaoAulas(versao => versao + 1);

  const mostrarErro = (error, titulo) => Swal.fire({
    icon: 'error',
    title: titulo,
    text: error.response?.data?.error || 'Não foi possível concluir a operação.',
    confirmButtonColor: '#0f1f3f'
  });

  const abrirModalAusencia = () => {
    if (!selectedAula) return;

    setAlunosAusentes([]);
    setIsEditModalOpen(false);
    setIsAusenciaModalOpen(true);
  };

  const fecharModalAusencia = () => {
    setIsAusenciaModalOpen(false);
    setSelectedAula(null);
    setAlunosAusentes([]);
  };

  const alternarAusencia = (alunoId) => {
    setAlunosAusentes(ausenciasAtuais => (
      ausenciasAtuais.includes(alunoId)
        ? ausenciasAtuais.filter(id => id !== alunoId)
        : [...ausenciasAtuais, alunoId]
    ));
  };

  const salvarAusencias = async () => {
    if (!selectedAula) return;

    try {
      await aulasService.registrarAusencias(selectedAula, alunosAusentes);
      fecharModalAusencia();
      recarregarAulas();
      await Swal.fire({
        icon: 'success',
        title: 'Ausências salvas!',
        text: 'A presença dos alunos foi registrada com sucesso.',
        confirmButtonColor: '#0f1f3f'
      });
    } catch (error) {
      await mostrarErro(error, 'Erro ao salvar ausências');
    }
  };

  const cancelarAula = async () => {
    if (!selectedAula) return;

    const resultado = await Swal.fire({
      icon: 'warning',
      title: 'Cancelar aula?',
      text: selectedAula.turmaId
        ? `A aula será cancelada para todos os alunos de ${selectedAula.conta}.`
        : 'A aula será cancelada.',
      input: 'textarea',
      inputPlaceholder: 'Motivo (opcional)',
      inputAttributes: { maxlength: '500' },
      showCancelButton: true,
      confirmButtonText: 'Sim, cancelar aula',
      cancelButtonText: 'Voltar',
      confirmButtonColor: '#b91c1c',
      cancelButtonColor: '#64748b'
    });

    if (!resultado.isConfirmed) return;

    try {
      await aulasService.cancelar(selectedAula, resultado.value?.trim() || null);
      fecharModalEditar();
      recarregarAulas();
      await Swal.fire({
        icon: 'success',
        title: 'Aula cancelada!',
        text: 'A aula foi cancelada com sucesso.',
        confirmButtonColor: '#0f1f3f'
      });
    } catch (error) {
      await mostrarErro(error, 'Erro ao cancelar');
    }
  };

  const abrirModalRemarcar = () => {
    setRemarcacao({
      novaData: selectedAula.data,
      novaHoraInicio: selectedAula.horaInicio,
      novaHoraFim: selectedAula.horaFim,
      motivo: ''
    });
    setIsEditModalOpen(false);
    setIsRescheduleModalOpen(true);
  };

  const fecharModalRemarcar = () => {
    setIsRescheduleModalOpen(false);
    setSelectedAula(null);
  };

  const atualizarRemarcacao = (campo, valor) => {
    setRemarcacao(atual => ({ ...atual, [campo]: valor }));
  };

  const salvarNovoEvento = async () => {
    fecharModalAdicionar();
    await Swal.fire({
      icon: 'success',
      title: 'Evento adicionado!',
      text: 'O evento foi adicionado à agenda com sucesso.',
      confirmButtonColor: '#0f1f3f'
    });
  };

  const salvarRemarcacao = async () => {
    if (!selectedAula) return;

    const { novaData, novaHoraInicio, novaHoraFim, motivo } = remarcacao;
    if (!novaData || !novaHoraInicio || !novaHoraFim) {
      await Swal.fire({
        icon: 'warning',
        title: 'Preencha os dados',
        text: 'Informe a nova data e os novos horários de início e fim.',
        confirmButtonColor: '#0f1f3f'
      });
      return;
    }
    if (novaHoraInicio >= novaHoraFim) {
      await Swal.fire({
        icon: 'warning',
        title: 'Horário inválido',
        text: 'A hora de início deve ser anterior à hora de fim.',
        confirmButtonColor: '#0f1f3f'
      });
      return;
    }

    try {
      await aulasService.remarcar(selectedAula, {
        novaData,
        novaHoraInicio,
        novaHoraFim,
        motivo: motivo.trim() || null
      });
      fecharModalRemarcar();
      recarregarAulas();
      await Swal.fire({
        icon: 'success',
        title: 'Aula remarcada!',
        text: 'A aula foi remarcada com sucesso.',
        confirmButtonColor: '#0f1f3f'
      });
    } catch (error) {
      await mostrarErro(error, 'Erro ao remarcar');
    }
  };

  useEffect(() => {
    const fetchAulas = async () => {
      try {
        setCarregando(true);
        const semana = obterDiasSemana(dataAtual);
        const resposta = await aulasService.listarPorPeriodo(semana[0].data, semana[semana.length - 1].data);

        if (!ignorar) setAulas(agruparAulas(resposta));
      } catch (error) {
        if (ignorar) return;
        console.error('Erro ao buscar aulas:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Erro ao carregar',
          text: error.response?.data?.error || 'Não foi possível carregar as aulas.',
          confirmButtonColor: '#0f1f3f'
        });
      } finally {
        if (!ignorar) setCarregando(false);
      }
    };

    // Descarta a resposta se o usuário já mudou de semana antes dela chegar
    let ignorar = false;
    fetchAulas();
    return () => {
      ignorar = true;
    };
  }, [dataAtual, versaoAulas]);

  const calcularEstiloEvento = (horaInicio, horaFim) => {
    const [horaI, minutoI] = horaInicio.split(':').map(Number);
    const [horaF, minutoF] = horaFim.split(':').map(Number);

    const minutoInicio = (horaI - 1) * 60 + minutoI;
    const minutoFim = (horaF - 1) * 60 + minutoF;
    const duracao = minutoFim - minutoInicio;

    return {
      top: `${(minutoInicio / 60) * ALTURA_HORA}px`,
      height: `${(duracao / 60) * ALTURA_HORA}px`,
      minHeight: '38px'
    };
  };

  const aulasFiltradas = aulas.filter(aula => (
    (!filtros.dataInicio || aula.data >= filtros.dataInicio)
    && (!filtros.dataFim || aula.data <= filtros.dataFim)
    && (!filtros.conta || aula.conta.toLowerCase().includes(filtros.conta.toLowerCase()))
    && (!filtros.professor || aula.professor === filtros.professor)
  ));

  const professores = [...new Set(aulas.map(aula => aula.professor))];

  const atualizarFiltro = (campo, valor) => {
    setFiltros(filtrosAtuais => ({ ...filtrosAtuais, [campo]: valor }));
  };

  const limparFiltros = () => {
    setFiltros({ dataInicio: '', dataFim: '', conta: '', professor: '' });
  };

  const obterAulasPorDia = (dataDia) => aulasFiltradas.filter(aula => aula.data === dataDia);

  const obterAulasComPosicao = (dataDia) => {
    const aulasDia = obterAulasPorDia(dataDia).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    const aulasComPosicao = [];

    aulasDia.forEach(aula => {
      const estilo = calcularEstiloEvento(aula.horaInicio, aula.horaFim);
      let coluna = 0;
      let maxColuna = 0;

      aulasComPosicao.forEach(item => {
        const temConflito = !(aula.horaFim <= item.aula.horaInicio || aula.horaInicio >= item.aula.horaFim);
        if (temConflito && item.coluna >= coluna) {
          coluna = item.coluna + 1;
        }
        maxColuna = Math.max(maxColuna, item.coluna);
      });

      aulasComPosicao.push({ aula, estilo, coluna, numColunas: Math.max(coluna + 1, maxColuna + 1) });
    });

    const numColunasTotal = aulasComPosicao.length ? Math.max(...aulasComPosicao.map(item => item.coluna)) + 1 : 1;

    return aulasComPosicao.map(item => ({
      ...item.aula,
      estilo: item.estilo,
      coluna: item.coluna,
      numColunas: numColunasTotal
    }));
  };

  const diasSemana = obterDiasSemana(dataAtual);
  const intervaloSemana = `${formatarDiaMes(diasSemana[0].data)} – ${formatarDiaMes(diasSemana[6].data)}/${diasSemana[6].data.slice(0, 4)}`;

  const mudarSemana = (deslocamento) => {
    setDataAtual(dataAnterior => {
      const novaData = new Date(dataAnterior);
      novaData.setDate(novaData.getDate() + deslocamento * 7);
      return novaData;
    });
  };


  return (
    <div className="agenda-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        items={[
          { to: '/overview', label: 'Geral', short: 'Geral' },
          { to: '/aulas', label: 'Agenda', short: 'AG', active: true },
          { to: '/dashboard', label: 'Dashboard', short: 'Dash' },
          { to: '/professores', label: 'Professores', short: 'Prof' },
          { to: '/turmas', label: 'Turmas', short: 'Tur' },
          { to: '/alunos', label: 'Alunos', short: 'Alu' },
          { to: '/contratos', label: 'Contratos', short: 'Cont' }
        ]}
      />

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div>
              <h1>Agenda</h1>
            </div>
            <div className="agenda-tabs">
              <div className="agenda-semana-nav">
                <button type="button" className="tab-button" onClick={() => mudarSemana(-1)} aria-label="Semana anterior">
                  ‹
                </button>
                <button type="button" className="tab-button" onClick={() => setDataAtual(new Date())}>
                  Hoje
                </button>
                <button type="button" className="tab-button" onClick={() => mudarSemana(1)} aria-label="Próxima semana">
                  ›
                </button>
                <span className="agenda-semana-label">
                  {carregando ? 'Carregando...' : intervaloSemana}
                </span>
              </div>
              <button
                className={`tab-button ${isFiltersOpen ? 'active' : ''}`}
                type="button"
                aria-pressed={isFiltersOpen}
                onClick={() => setIsFiltersOpen(aberto => !aberto)}
              >
                Filtros
              </button>
            </div>
          </div>

          <div className="agenda-workspace">
            <div className="agenda-frame">
              <div className="agenda-dias-header">
                <div className="agenda-horarios-label"></div>
                {diasSemana.map((dia, idx) => (
                  <div key={idx} className="agenda-dia-label">
                    <span>{dia.diaSemana}</span>
                    <Button onClick={() => abrirModalAdicionar(dia)}>+</Button>
                  </div>
                ))}
              </div>

              <div className="agenda-scroll">
                <div className="agenda-grid">
                  <div className="agenda-horarios">
                    {HORAS.map((hora, idx) => (
                      <div key={idx} className="hora-slot" style={{ height: `${ALTURA_HORA}px` }}>
                        <span>{hora}</span>
                      </div>
                    ))}
                  </div>

                  {diasSemana.map((dia, diaIdx) => (
                    <div key={diaIdx} className="agenda-coluna-dia">
                      {HORAS.map((hora, horaIdx) => (
                        <div
                          key={`${diaIdx}-${horaIdx}`}
                          className="hora-slot"
                          style={{ height: `${ALTURA_HORA}px` }}
                        />
                      ))}

                      <div className="agenda-eventos">
                        {obterAulasComPosicao(dia.data).map((aula) => (
                          <div
                            key={aula.id}
                            className={`evento ${aula.status === 'CANCELADA' ? 'evento-cancelado' : ''}`.trim()}
                            style={{
                              ...aula.estilo,
                              width: `calc((100% - ${(aula.numColunas - 1) * 4}px) / ${aula.numColunas})`,
                              left: `calc((100% - ${(aula.numColunas - 1) * 4}px) / ${aula.numColunas} * ${aula.coluna} + ${aula.coluna * 2}px)`
                            }}
                          >
                            <div className="evento-label">{aula.conta}</div>
                            <div className="evento-label">
                              {aula.status === 'CANCELADA' ? 'Cancelada' : aula.turma}
                            </div>
                            {podeGerenciar && aula.status !== 'CANCELADA' && (
                              <button
                                type="button"
                                className="evento-action"
                                onClick={() => abrirModalEditar(aula)}
                              >
                                Editar
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isFiltersOpen && (
              <aside className="agenda-filters" aria-label="Filtros da agenda">
                <div className="agenda-filters-header">
                  <h2>Filtros</h2>
                  <button
                    type="button"
                    className="agenda-filters-close"
                    onClick={() => setIsFiltersOpen(false)}
                    aria-label="Fechar filtros"
                  >
                    X
                  </button>
                </div>

                <label htmlFor="data-inicio">Data de início</label>
                <input
                  id="data-inicio"
                  type="date"
                  value={filtros.dataInicio}
                  onChange={event => atualizarFiltro('dataInicio', event.target.value)}
                />

                <label htmlFor="data-fim">Data de fim</label>
                <input
                  id="data-fim"
                  type="date"
                  value={filtros.dataFim}
                  min={filtros.dataInicio}
                  onChange={event => atualizarFiltro('dataFim', event.target.value)}
                />

                <label htmlFor="professor">Professor</label>
                <select
                  id="professor"
                  value={filtros.professor}
                  onChange={event => atualizarFiltro('professor', event.target.value)}
                >
                  <option value="">Todos os professores</option>
                  {professores.map(professor => (
                    <option key={professor} value={professor}>{professor}</option>
                  ))}
                </select>

                <button type="button" className="agenda-filters-clear" onClick={limparFiltros}>
                  Limpar filtros
                </button>
              </aside>
            )}
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <Modal
          title="Adicionar evento"
          onClose={fecharModalAdicionar}
          onSave={salvarNovoEvento}
        >
          <label>Nome</label>
          <input type="text" placeholder="Nome" />

          <label>Descrição</label>
          <input type="text" placeholder="Descrição" />

          <label>Adicionar professor</label>
          <input type="text" placeholder="Adicionar professor" />

          <label>Dia e horário</label>
          <input type="text" placeholder="Dia e horário" />
        </Modal>
      )}

      {isEditModalOpen && selectedAula && (
        <Modal
          title="Editar evento"
          onClose={fecharModalEditar}
        >
          <Button active onClick={cancelarAula}>Cancelar aula</Button>
          <Button active onClick={abrirModalRemarcar}>Remarcar aula</Button>
          <Button active onClick={abrirModalAusencia}>Marcar ausências</Button>
        </Modal>
      )}

      {isRescheduleModalOpen && selectedAula && (
        <Modal
          title={`Remarcar aula - ${selectedAula.conta}`}
          onClose={fecharModalRemarcar}
          onSave={salvarRemarcacao}
        >
          <label htmlFor="nova-data">Nova data</label>
          <input
            id="nova-data"
            type="date"
            value={remarcacao.novaData}
            onChange={event => atualizarRemarcacao('novaData', event.target.value)}
          />

          <label htmlFor="nova-hora-inicio">Hora de início</label>
          <input
            id="nova-hora-inicio"
            type="time"
            value={remarcacao.novaHoraInicio}
            onChange={event => atualizarRemarcacao('novaHoraInicio', event.target.value)}
          />

          <label htmlFor="nova-hora-fim">Hora de fim</label>
          <input
            id="nova-hora-fim"
            type="time"
            value={remarcacao.novaHoraFim}
            onChange={event => atualizarRemarcacao('novaHoraFim', event.target.value)}
          />

          <label htmlFor="motivo-remarcacao">Motivo</label>
          <input
            id="motivo-remarcacao"
            type="text"
            placeholder="Motivo (opcional)"
            maxLength={500}
            value={remarcacao.motivo}
            onChange={event => atualizarRemarcacao('motivo', event.target.value)}
          />
        </Modal>
      )}

      {isAusenciaModalOpen && (
        <Modal
          title={`Marcar ausências - ${selectedAula?.conta}`}
          onClose={fecharModalAusencia}
          onSave={salvarAusencias}
        >
          <p className="ausencia-instrucao">Selecione os alunos que estavam ausentes.</p>
          <div className="lista-alunos-ausencia">
            {(selectedAula?.ativos || []).map(participante => (
              <label key={participante.aulaId} className="aluno-ausencia-item">
                <input
                  type="checkbox"
                  checked={alunosAusentes.includes(participante.alunoId)}
                  onChange={() => alternarAusencia(participante.alunoId)}
                />
                <span>{participante.aluno}</span>
              </label>
            ))}
          </div>
        </Modal>
      )}

    </div>
  );
}
