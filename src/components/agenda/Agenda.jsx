import { useState, useEffect } from 'react';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import './Agenda.css';

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const HORAS = Array.from({ length: 24 }, (_, i) => `${String(0 + i).padStart(2, '0')}:00`);
const ALTURA_HORA = 48; // pixels por hora
const ALUNOS_POR_TURMA = {
  'Turma 5': ['Beatriz Lima', 'Gabriel Alves', 'Juliana Costa', 'Rafael Souza'],
  'Turma 8': ['Amanda Rocha', 'Caio Martins', 'Larissa Freitas', 'Vinicius Nunes'],
  'Turma 10': ['Ana Silva', 'Bruno Oliveira', 'Camila Santos', 'Diego Pereira']
};

export default function Agenda() {
  const [aulas, setAulas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [dataAtual, setDataAtual] = useState(new Date('2026-07-08'));
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

  const abrirModalAusencia = () => {
    if (!selectedAula) return;

    setAlunosAusentes(selectedAula.ausencias || []);
    setIsEditModalOpen(false);
    setIsAusenciaModalOpen(true);
  };

  const fecharModalAusencia = () => {
    setIsAusenciaModalOpen(false);
    setSelectedAula(null);
    setAlunosAusentes([]);
  };

  const alternarAusencia = (aluno) => {
    setAlunosAusentes(ausenciasAtuais => (
      ausenciasAtuais.includes(aluno)
        ? ausenciasAtuais.filter(alunoAusente => alunoAusente !== aluno)
        : [...ausenciasAtuais, aluno]
    ));
  };

  const salvarAusencias = () => {
    if (!selectedAula) return;

    setAulas(aulasAtuais => aulasAtuais.map(aula => (
      aula.id === selectedAula.id ? { ...aula, ausencias: alunosAusentes } : aula
    )));
    fecharModalAusencia();
  };

  const cancelarAula = () => {
    if (!selectedAula) return;

    setAulas(aulasAtuais => aulasAtuais.filter(aula => aula.id !== selectedAula.id));
    fecharModalEditar();
  };

  const abrirModalRemarcar = () => {
    setIsEditModalOpen(false);
    setIsRescheduleModalOpen(true);
  };

  const fecharModalRemarcar = () => {
    setIsRescheduleModalOpen(false);
  };

  useEffect(() => {
    const fetchAulas = async () => {
      try {
        setCarregando(true);
        // Por enquanto usando dados mockados
        // const response = await axios.get('/aulas');
        // setAulas(response.data);

        const exemploAulas = [
          {
            id: 0,
            data: '2026-07-08',
            horaInicio: '08:00',
            horaFim: '10:00',
            status: 'AGENDADA',
            presenca: true,
            contratoId: 0,
            conta: 'Conta 1',
            professor: 'Prof. João',
            turma: 'Turma 10'
          },
          {
            id: 1,
            data: '2026-07-08',
            horaInicio: '10:00',
            horaFim: '12:00',
            status: 'AGENDADA',
            presenca: true,
            contratoId: 1,
            conta: 'Conta 2',
            professor: 'Prof. Maria',
            turma: 'Turma 5'
          },
          {
            id: 2,
            data: '2026-07-08',
            horaInicio: '16:00',
            horaFim: '18:00',
            status: 'AGENDADA',
            presenca: false,
            contratoId: 2,
            conta: 'Conta 1',
            professor: 'Prof. Carlos',
            turma: 'Turma 10'
          },
          {
            id: 3,
            data: '2026-07-10',
            horaInicio: '09:00',
            horaFim: '11:00',
            status: 'AGENDADA',
            presenca: true,
            contratoId: 3,
            conta: 'Conta 3',
            professor: 'Prof. Ana',
            turma: 'Turma 8'
          },
          {
            id: 4,
            data: '2026-07-12',
            horaInicio: '15:00',
            horaFim: '17:00',
            status: 'AGENDADA',
            presenca: true,
            contratoId: 4,
            conta: 'Conta 2',
            professor: 'Prof. Pedro',
            turma: 'Turma 10'
          }
        ];

        setAulas(exemploAulas);
      } catch (error) {
        console.error('Erro ao buscar aulas:', error);
      } finally {
        setCarregando(false);
      }
    };

    fetchAulas();
  }, [dataAtual]);

  const obterDiasSemana = () => {
    const dias = [];
    const dataInicio = new Date(dataAtual);
    const diaSemana = dataInicio.getDay();
    const segunda = new Date(dataInicio);
    segunda.setDate(dataInicio.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));

    for (let i = 0; i < 7; i++) {
      const dia = new Date(segunda);
      dia.setDate(segunda.getDate() + i);
      dias.push({
        data: dia.toISOString().split('T')[0],
        diaSemana: DIAS_SEMANA[i],
        dia: dia.getDate(),
        mes: dia.getMonth() + 1
      });
    }

    return dias;
  };

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

  const diasSemana = obterDiasSemana();

  if (carregando) {
    return <div className="agenda-container">Carregando...</div>;
  }

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
                            className="evento"
                            style={{
                              ...aula.estilo,
                              width: `calc((100% - ${(aula.numColunas - 1) * 4}px) / ${aula.numColunas})`,
                              left: `calc((100% - ${(aula.numColunas - 1) * 4}px) / ${aula.numColunas} * ${aula.coluna} + ${aula.coluna * 2}px)`
                            }}
                          >
                            <div className="evento-label">{aula.conta}</div>
                            <div className="evento-label">{aula.turma}</div>
                            <button
                              type="button"
                              className="evento-action"
                              onClick={() => abrirModalEditar(aula)}
                            >
                              Editar
                            </button>
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

      {isRescheduleModalOpen && (
        <Modal
          title="Remarcar aula"
          onClose={fecharModalRemarcar}
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

      {isAusenciaModalOpen && (
        <Modal
          title={`Marcar ausências - ${selectedAula?.turma}`}
          onClose={fecharModalAusencia}
          onSave={salvarAusencias}
        >
          <p className="ausencia-instrucao">Selecione os alunos que estavam ausentes.</p>
          <div className="lista-alunos-ausencia">
            {(ALUNOS_POR_TURMA[selectedAula?.turma] || []).map(aluno => (
              <label key={aluno} className="aluno-ausencia-item">
                <input
                  type="checkbox"
                  checked={alunosAusentes.includes(aluno)}
                  onChange={() => alternarAusencia(aluno)}
                />
                <span>{aluno}</span>
              </label>
            ))}
          </div>
        </Modal>
      )}

    </div>
  );
}
