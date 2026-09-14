import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import Container from '../layout/Container';
import { alunosService } from '../students/components/alunosService';
import { professoresDisponiveisService } from './professoresDisponiveisService';
import { turmasDisponiveisService } from './turmasDisponiveisService';
import { contratosService } from './contratosService';
import '../agenda/Agenda.css';
import './Contracts.css';

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const HORARIOS_MODAL = Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, '0')}:00`);

// A API manda "Segunda-feira", "Terça-feira" etc. Normaliza pro formato curto usado no grid.
const DIA_SEMANA_MAP = {
  'Segunda-feira': 'Segunda',
  'Terça-feira': 'Terça',
  'Quarta-feira': 'Quarta',
  'Quinta-feira': 'Quinta',
  'Sexta-feira': 'Sexta',
  'Sábado': 'Sábado',
  'Domingo': 'Domingo'
};

const normalizarDia = (diaSemana) => DIA_SEMANA_MAP[diaSemana] || diaSemana;
const normalizarHora = (hora) => (hora ? hora.slice(0, 5) : hora);
const dataHoje = () => new Date().toISOString().split('T')[0];

// O ContratoResponse da API não envia "aluno.ativo"; determina a vigência pela data fim.
const contratoEhAtivo = (contrato) => {
  if (typeof contrato?.aluno?.ativo === 'boolean') return contrato.aluno.ativo;
  const hoje = dataHoje();
  return Boolean(contrato?.dataInicio && contrato?.dataFim) &&
    hoje >= contrato.dataInicio && hoje <= contrato.dataFim;
};

export default function Contracts() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(
    () => Boolean(location.state?.openContractSetup)
  );
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractToDelete, setContractToDelete] = useState(null);

  const hoje = dataHoje();
  const [dataInicioContrato, setDataInicioContrato] = useState(hoje);
  const [dataFimContrato, setDataFimContrato] = useState(hoje);

  // horário selecionado no mini-calendário: { dia, hora, item }
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  // quando um slot tem mais de uma opção (professores/turmas), guarda qual slot está "aberto" pra escolher
  const [openSlot, setOpenSlot] = useState(null); // { dia, hora }

  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState(
    () => String(location.state?.alunoCadastro?.id || '')
  );
  const [contractType, setContractType] = useState('individual');
  const [contractFilter, setContractFilter] = useState('ativos');

  const [professoresDisponiveis, setProfessoresDisponiveis] = useState([]);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState([]);
  const [carregandoDisponibilidade, setCarregandoDisponibilidade] = useState(false);
  const [erroDisponibilidade, setErroDisponibilidade] = useState(null);

  const [contratos, setContratos] = useState([]);
  const [carregandoContratos, setCarregandoContratos] = useState(true);
  const [erroContratos, setErroContratos] = useState(null);
  const [carregandoOperacao, setCarregandoOperacao] = useState(false);

  // Carregar alunos
  useEffect(() => {
    alunosService.listar().then((alunosCarregados) => {
      setAlunos(alunosCarregados);
    }).catch((erro) => {
      console.error('Erro ao carregar alunos:', erro);
    });
  }, []);

  // Carregar contratos da API
  useEffect(() => {
    carregarContratos();
  }, []);

  const carregarContratos = () => {
    setCarregandoContratos(true);
    setErroContratos(null);
    contratosService.listar()
      .then((dados) => {
        setContratos(Array.isArray(dados) ? dados : []);
      })
      .catch((erro) => {
        console.error('Erro ao carregar contratos:', erro);
        setErroContratos(erro.message || 'Erro ao carregar contratos');
      })
      .finally(() => {
        setCarregandoContratos(false);
      });
  };

  const alunoSelecionado = alunos.find(
    (aluno) => String(aluno.id) === alunoSelecionadoId
  ) || location.state?.alunoCadastro;

  // Busca as duas listas quando o modal de agendamento abre
  useEffect(() => {
    if (!isScheduleModalOpen) return;

    let cancelado = false;
    setCarregandoDisponibilidade(true);
    setErroDisponibilidade(null);

    const payload = {
      alunoHorariosIds: alunoSelecionado?.horariosIds || [0]
    };

    Promise.all([
      professoresDisponiveisService.listar(payload).catch((erro) => {
        throw new Error(erro.message || 'Falha ao buscar professores disponíveis');
      }),
      turmasDisponiveisService.listar().catch((erro) => {
        throw new Error(erro.message || 'Falha ao buscar turmas disponíveis');
      })
    ])
      .then(([professores, turmas]) => {
        if (cancelado) return;
        setProfessoresDisponiveis(Array.isArray(professores) ? professores : []);
        setTurmasDisponiveis(Array.isArray(turmas) ? turmas : []);
      })
      .catch((erro) => {
        if (cancelado) return;
        setErroDisponibilidade(erro.message || 'Erro ao carregar disponibilidade');
      })
      .finally(() => {
        if (!cancelado) setCarregandoDisponibilidade(false);
      });

    return () => {
      cancelado = true;
    };
  }, [isScheduleModalOpen, alunoSelecionado]);

  // Monta o mapa dia+hora -> lista de opções (professor OU turma), dependendo do contractType
  const gradeDisponibilidade = useMemo(() => {
    const grade = {};

    const registrarHorario = (item, horario, tipo) => {
      const dia = normalizarDia(horario.diaSemana);
      const hora = normalizarHora(horario.horaInicio);
      const chave = `${dia}-${hora}`;

      if (!grade[chave]) grade[chave] = [];

      grade[chave].push({
        tipo, // 'individual' | 'group'
        horarioId: horario.id,
        horaInicio: normalizarHora(horario.horaInicio),
        horaFim: normalizarHora(horario.horaFim),
        id: item.id,
        nome: tipo === 'individual' ? item.nome : item.nome,
        detalhe:
          tipo === 'individual'
            ? item.tipo?.tipoProfessor
            : `${item.nivel} · ${item.nomeProfessor}`
      });
    };

    if (contractType === 'individual') {
      professoresDisponiveis.forEach((professor) => {
        (professor.horarios || []).forEach((horario) => registrarHorario(professor, horario, 'individual'));
      });
    } else {
      turmasDisponiveis.forEach((turma) => {
        (turma.horarios || []).forEach((horario) => registrarHorario(turma, horario, 'group'));
      });
    }

    return grade;
  }, [contractType, professoresDisponiveis, turmasDisponiveis]);

  const abrirModalAdicionar = () => {
    setIsScheduleModalOpen(true);
  };

  const fecharModalAgendamento = () => {
    setIsScheduleModalOpen(false);
    setSelectedSchedule(null);
    setOpenSlot(null);
    setDataInicioContrato(dataHoje());
    setDataFimContrato(dataHoje());
  };

  const salvarNovoContrato = async () => {
    if (!alunoSelecionado || !selectedSchedule) {
      alert('Por favor, selecione um aluno e um horário');
      return;
    }

    if (!dataInicioContrato || !dataFimContrato) {
      alert('Por favor, preencha as datas de início e fim do contrato');
      return;
    }

    if (dataFimContrato < dataInicioContrato) {
      alert('A data de fim deve ser maior ou igual à data de início');
      return;
    }

    setCarregandoOperacao(true);
    try {
      // Payload de acordo com o contrato da API
      const novoContrato = {
        dataInicio: dataInicioContrato,
        dataFim: dataFimContrato,
        tipo: contractType === 'individual' ? 'individual' : 'group',
        alunoId: parseInt(alunoSelecionado.id),
        turmaId: 0,
        professorId: 0,
        horariosIds: [parseInt(selectedSchedule.item.horarioId)]
      };

      // Adicionar professor para contratos individuais ou turma para contratos em grupo
      if (contractType === 'individual') {
        novoContrato.professorId = parseInt(selectedSchedule.item.id);
      } else {
        novoContrato.turmaId = parseInt(selectedSchedule.item.id);
      }

      console.log('Enviando contrato:', novoContrato);

      const contratoInfo = await contratosService.criar(novoContrato);
      
      console.log('Contrato criado:', contratoInfo);
      
      // Recarregar a lista de contratos
      await carregarContratos();
      
      fecharModalAgendamento();
      setAlunoSelecionadoId('');
      setContractType('individual');
      alert('Contrato criado com sucesso!');
    } catch (erro) {
      console.error('Erro ao criar contrato:', erro.response?.data || erro.message);
      alert('Erro ao criar contrato: ' + (erro.response?.data?.message || erro.message || 'Tente novamente'));
    } finally {
      setCarregandoOperacao(false);
    }
  };

  const trocarTipoContrato = (tipo) => {
    setContractType(tipo);
    setSelectedSchedule(null);
    setOpenSlot(null);
  };

  const selecionarOpcaoSlot = (dia, hora, opcao) => {
    setSelectedSchedule({ dia, hora, item: opcao });
    setOpenSlot(null);
  };

  const clicarSlot = (dia, hora, opcoes) => {
    if (!opcoes || opcoes.length === 0) return;

    if (opcoes.length === 1) {
      selecionarOpcaoSlot(dia, hora, opcoes[0]);
      return;
    }

    const jaEstaAberto = openSlot?.dia === dia && openSlot?.hora === hora;
    setOpenSlot(jaEstaAberto ? null : { dia, hora });
  };

  const abrirModalEdicao = (contrato) => {
    setSelectedContract({
      ...contrato,
      turma: contrato.turma ? { ...contrato.turma } : null,
      professor: contrato.professor ? { ...contrato.professor } : null,
      aluno: contrato.aluno ? { ...contrato.aluno } : {}
    });
  };

  const fecharModalEdicao = () => {
    setSelectedContract(null);
  };

  const salvarEdicao = () => {
    if (!selectedContract.id) return;
    
    setCarregandoOperacao(true);
    contratosService.atualizar(selectedContract.id, selectedContract)
      .then((contratoAtualizado) => {
        setContratos((items) =>
          items.map((item) =>
            item.id === contratoAtualizado.id ? contratoAtualizado : item
          )
        );
        fecharModalEdicao();
      })
      .catch((erro) => {
        console.error('Erro ao atualizar contrato:', erro);
        alert('Erro ao atualizar contrato: ' + (erro.message || 'Tente novamente'));
      })
      .finally(() => {
        setCarregandoOperacao(false);
      });
  };

  const excluirContrato = () => {
    if (!contractToDelete?.id) return;
    
    setCarregandoOperacao(true);
    contratosService.deletar(contractToDelete.id)
      .then(() => {
        setContratos((items) =>
          items.filter((item) => item.id !== contractToDelete.id)
        );
        setContractToDelete(null);
      })
      .catch((erro) => {
        console.error('Erro ao deletar contrato:', erro);
        alert('Erro ao deletar contrato: ' + (erro.message || 'Tente novamente'));
      })
      .finally(() => {
        setCarregandoOperacao(false);
      });
  };

  const contratosFiltrados = contratos.filter((contrato) =>
    contractFilter === 'ativos' ? contratoEhAtivo(contrato) : !contratoEhAtivo(contrato)
  );

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
          <div className="agenda-topbar">
            <div>
              <h1>Contratos</h1>
            </div>
            <ButtonContainer>
              <Button
                active={contractFilter === 'ativos'}
                onClick={() => setContractFilter('ativos')}
              >
                Ativos
              </Button>
              <Button
                active={contractFilter === 'inativos'}
                onClick={() => setContractFilter('inativos')}
              >
                Inativos
              </Button>
              <Button onClick={abrirModalAdicionar}>Adicionar Contrato</Button>
            </ButtonContainer>
          </div>

          <div className="agenda-frame">
            {carregandoContratos && (
              <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                Carregando contratos...
              </p>
            )}
            {erroContratos && (
              <p style={{ padding: '20px', textAlign: 'center', color: '#d00' }}>
                Erro ao carregar contratos: {erroContratos}
              </p>
            )}
            {!carregandoContratos && !erroContratos && (
              <Container
                items={contratosFiltrados}
                className="contracts-grid"
                getItemKey={(contrato) => contrato.id}
                renderItem={(contrato) => (
                  <article className="contract-card">
                    <div className="contract-card-head">
                      <div>
                        <p className="contract-eyebrow">Contrato {contrato.id + 1}</p>
                        <h3>{contrato.tipo}</h3>
                      </div>
                      <span className={`contract-status-pill ${contratoEhAtivo(contrato) ? 'ativo' : 'inativo'}`}>
                      {contratoEhAtivo(contrato) ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="contract-meta">
                    <div>
                      <span>Turma</span>
                      <strong>{contrato.turma?.nome || '—'}</strong>
                    </div>
                    <div>
                      <span>Aluno</span>
                      <strong>{contrato.aluno?.nome || '—'}</strong>
                    </div>
                    <div>
                      <span>Professor</span>
                      <strong>{contrato.professor?.nome || '—'}</strong>
                    </div>
                    <div>
                      <span>Vigência</span>
                      <strong>{contrato.dataInicio} a {contrato.dataFim}</strong>
                    </div>
                  </div>

                  <ButtonContainer>
                    <Button active onClick={() => abrirModalEdicao(contrato)}>Editar</Button>
                    <Button onClick={() => setContractToDelete(contrato)}>Excluir</Button>
                  </ButtonContainer>
                </article>
              )}
            />
            )}
          </div>
        </div>
      </main>

      {isScheduleModalOpen && (
        <Modal
          title="Configurar contrato"
          onClose={fecharModalAgendamento}
          onSave={salvarNovoContrato}
          saveLabel="Continuar"
        >
          <label htmlFor="contract-student">Aluno:</label>
          <select
            id="contract-student"
            className="contract-student-select"
            value={alunoSelecionadoId}
            onChange={(event) => setAlunoSelecionadoId(event.target.value)}
          >
            <option value="">Selecione um aluno</option>
            {alunos.map((aluno) => (
              <option key={aluno.id} value={aluno.id}>
                {aluno.nome}
              </option>
            ))}
          </select>

          {alunoSelecionado?.nome && (
            <p className="contract-selected-student">
              Aluno selecionado: <strong>{alunoSelecionado.nome}</strong>
            </p>
          )}

          <div className="contract-type-options">
            <label className={`contract-option ${contractType === 'individual' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="contractType"
                value="individual"
                checked={contractType === 'individual'}
                onChange={() => trocarTipoContrato('individual')}
              />
              <span>Aulas individuais</span>
            </label>

            <label className={`contract-option ${contractType === 'group' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="contractType"
                value="group"
                checked={contractType === 'group'}
                onChange={() => trocarTipoContrato('group')}
              />
              <span>Aulas em grupo</span>
            </label>
          </div>

          <div className="contract-dates">
            <label className="contract-date-field">
              <span>Data início:</span>
              <input
                type="date"
                value={dataInicioContrato}
                min={dataHoje()}
                onChange={(event) => {
                  setDataInicioContrato(event.target.value);
                  if (dataFimContrato < event.target.value) {
                    setDataFimContrato(event.target.value);
                  }
                }}
              />
            </label>

            <label className="contract-date-field">
              <span>Data fim:</span>
              <input
                type="date"
                value={dataFimContrato}
                min={dataInicioContrato}
                onChange={(event) => setDataFimContrato(event.target.value)}
              />
            </label>
          </div>

          {carregandoDisponibilidade && (
            <p className="contract-disponibilidade-status">Carregando disponibilidade...</p>
          )}
          {erroDisponibilidade && (
            <p className="contract-disponibilidade-status contract-disponibilidade-erro">
              {erroDisponibilidade}
            </p>
          )}

          {selectedSchedule && (
            <p className="contract-selected-student">
              Selecionado: <strong>{selectedSchedule.dia} {selectedSchedule.item.horaInicio} - {selectedSchedule.item.horaFim}</strong>
              {' · '}
              <strong>{selectedSchedule.item.nome}</strong>
            </p>
          )}

          <div className="mini-schedule">
            <div className="mini-week-grid">
              <div className="mini-hours-header">Horários</div>
              {DIAS_SEMANA.map((dia) => (
                <div key={dia} className="mini-day-header">{dia}</div>
              ))}

              <div className="mini-hours-column">
                {HORARIOS_MODAL.map((hora) => (
                  <div key={`hora-${hora}`} className="mini-hour-label">{hora}</div>
                ))}
              </div>

              {DIAS_SEMANA.map((dia) => (
                <div key={dia} className="mini-day-column">
                  {HORARIOS_MODAL.map((hora) => {
                    const chave = `${dia}-${hora}`;
                    const opcoes = gradeDisponibilidade[chave] || [];
                    const temOpcoes = opcoes.length > 0;
                    const isSelected =
                      selectedSchedule?.dia === dia && selectedSchedule?.hora === hora;
                    const estaAberto = openSlot?.dia === dia && openSlot?.hora === hora;

                    return (
                      <div key={`${dia}-${hora}`} className="mini-slot-wrapper">
                        <button
                          type="button"
                          className={`mini-slot-cell ${temOpcoes ? 'filled' : 'empty'} ${isSelected ? 'selected' : ''}`}
                          onClick={() => clicarSlot(dia, hora, opcoes)}
                          disabled={!temOpcoes}
                        >
                          {temOpcoes ? (
                            opcoes.length === 1 ? (
                              <>
                                <span>{opcoes[0].horaInicio} - {opcoes[0].horaFim}</span>
                                <strong>{opcoes[0].nome}</strong>
                                <small>{opcoes[0].detalhe}</small>
                              </>
                            ) : (
                              <>
                                <span>{opcoes[0].horaInicio} - {opcoes[0].horaFim}</span>
                                <strong>{opcoes.length} disponíveis</strong>
                              </>
                            )
                          ) : (
                            <span>Horário não disponível</span>
                          )}
                        </button>

                        {estaAberto && (
                          <div className="mini-slot-options">
                            {opcoes.map((opcao) => (
                              <button
                                key={`${opcao.tipo}-${opcao.id}-${opcao.horarioId}`}
                                type="button"
                                className="mini-slot-option"
                                onClick={() => selecionarOpcaoSlot(dia, hora, opcao)}
                              >
                                <strong>{opcao.nome}</strong>
                                <small>{opcao.detalhe}</small>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {selectedContract && (
        <Modal
          title="Editar Contrato"
          onClose={fecharModalEdicao}
          onSave={salvarEdicao}
        >
          <label>Tipo:</label>
          <input
            type="text"
            value={selectedContract.tipo}
            onChange={(event) =>
              setSelectedContract((contrato) => ({ ...contrato, tipo: event.target.value }))
            }
          />

          <label>Aluno:</label>
          <input
            type="text"
            value={selectedContract.aluno?.nome || ''}
            onChange={(event) =>
              setSelectedContract((contrato) => ({
                ...contrato,
                aluno: { ...contrato.aluno, nome: event.target.value }
              }))
            }
          />

          <label>Professor:</label>
          <input
            type="text"
            value={selectedContract.professor?.nome || ''}
            onChange={(event) =>
              setSelectedContract((contrato) => ({
                ...contrato,
                professor: { ...contrato.professor, nome: event.target.value }
              }))
            }
          />

          <label>Data início:</label>
          <input
            type="date"
            value={selectedContract.dataInicio}
            onChange={(event) =>
              setSelectedContract((contrato) => ({ ...contrato, dataInicio: event.target.value }))
            }
          />

          <label>Data fim:</label>
          <input
            type="date"
            value={selectedContract.dataFim}
            onChange={(event) =>
              setSelectedContract((contrato) => ({ ...contrato, dataFim: event.target.value }))
            }
          />
        </Modal>
      )}

      {contractToDelete && (
        <Modal
          title="Excluir Contrato"
          onClose={() => setContractToDelete(null)}
          onSave={excluirContrato}
        >
          <p>
            Tem certeza que deseja excluir o contrato de{' '}
            <strong>{contractToDelete.aluno.nome}</strong>?
          </p>
        </Modal>
      )}

    </div>
  );
}