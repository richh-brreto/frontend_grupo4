import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import Container from '../layout/Container';
import { alunosService } from '../students/components/alunosService';
import '../agenda/Agenda.css';
import './Contracts.css';

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const HORARIOS_MODAL = Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, '0')}:00`);

const DISPONIBILIDADE = [
  {
    dia: 'Segunda',
    horarios: [
      { hora: '08:00 - 10:00', titulo: 'Turma 10', professor: 'Adriano Oliveira' },
      { hora: '10:00 - 12:00', titulo: 'Turma 5', professor: 'Maria Silva' },
      { hora: '16:00 - 17:00', titulo: 'Professor', professor: 'Carlos Souza' }
    ]
  },
  {
    dia: 'Terça',
    horarios: [
      { hora: '09:00 - 11:00', titulo: 'Turma 8', professor: 'Fernando Costa' },
      { hora: '13:00 - 15:00', titulo: 'Turma 10', professor: 'Patrícia Nunes' }
    ]
  },
  {
    dia: 'Quarta',
    horarios: [
      { hora: '08:00 - 09:30', titulo: 'Professor', professor: 'Ricardo Lima' },
      { hora: '14:00 - 16:00', titulo: 'Turma 5', professor: 'Luiza Martins' }
    ]
  },
  {
    dia: 'Quinta',
    horarios: [
      { hora: '07:00 - 09:00', titulo: 'Turma 8', professor: 'Beatriz Silva' },
      { hora: '15:00 - 17:00', titulo: 'Professor', professor: 'Paulo Rocha' }
    ]
  },
  {
    dia: 'Sexta',
    horarios: [
      { hora: '10:00 - 12:00', titulo: 'Turma 10', professor: 'João Pereira' },
      { hora: '18:00 - 19:00', titulo: 'Professor', professor: 'Mateus Ribeiro' }
    ]
  },
  {
    dia: 'Sábado',
    horarios: [
      { hora: '09:00 - 11:00', titulo: 'Turma 5', professor: 'Ana Paula' },
      { hora: '11:00 - 12:00', titulo: 'Professor', professor: 'Camila Torres' }
    ]
  },
  {
    dia: 'Domingo',
    horarios: [
      { hora: '08:00 - 10:00', titulo: 'Turma 8', professor: 'Daniel Moreira' }
    ]
  }
];

export default function Contracts() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(
    () => Boolean(location.state?.openContractSetup)
  );
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState(
    () => String(location.state?.alunoCadastro?.id || '')
  );
  const [contractType, setContractType] = useState('individual');
  const [contractFilter, setContractFilter] = useState('ativos');
  const [contratos, setContratos] = useState([
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
  ]);

  useEffect(() => {
    alunosService.listar().then((alunosCarregados) => {
      setAlunos(alunosCarregados);
    });
  }, []);

  const alunoSelecionado = alunos.find(
    (aluno) => String(aluno.id) === alunoSelecionadoId
  ) || location.state?.alunoCadastro;

  const abrirModalAdicionar = () => {
    setIsScheduleModalOpen(true);
  };

  const fecharModalAgendamento = () => {
    setIsScheduleModalOpen(false);
    setSelectedSchedule(null);
  };

  const abrirModalEdicao = (contrato) => {
    setSelectedContract({
      ...contrato,
      turma: { ...contrato.turma },
      professor: { ...contrato.professor },
      aluno: { ...contrato.aluno }
    });
  };

  const fecharModalEdicao = () => {
    setSelectedContract(null);
  };

  const salvarEdicao = () => {
    setContratos((items) =>
      items.map((item) =>
        item.id === selectedContract.id ? selectedContract : item
      )
    );
    fecharModalEdicao();
  };

  const excluirContrato = () => {
    setContratos((items) =>
      items.filter((item) => item.id !== contractToDelete.id)
    );
    setContractToDelete(null);
  };

  const contratosFiltrados = contratos.filter((contrato) =>
    contractFilter === 'ativos' ? contrato.aluno.ativo : !contrato.aluno.ativo
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
                    <span className={`contract-status-pill ${contrato.aluno.ativo ? 'ativo' : 'inativo'}`}>
                      {contrato.aluno.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="contract-meta">
                    <div>
                      <span>Turma</span>
                      <strong>{contrato.turma.nome}</strong>
                    </div>
                    <div>
                      <span>Aluno</span>
                      <strong>{contrato.aluno.nome}</strong>
                    </div>
                    <div>
                      <span>Professor</span>
                      <strong>{contrato.professor.nome}</strong>
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
          </div>
        </div>
      </main>

      {isScheduleModalOpen && (
        <Modal
          title="Configurar contrato"
          onClose={fecharModalAgendamento}
          onSave={fecharModalAgendamento}
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
                onChange={() => setContractType('individual')}
              />
              <span>Aulas individuais</span>
            </label>

            <label className={`contract-option ${contractType === 'group' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="contractType"
                value="group"
                checked={contractType === 'group'}
                onChange={() => setContractType('group')}
              />
              <span>Aulas em grupo</span>
            </label>
          </div>

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

              {DIAS_SEMANA.map((dia) => {
                const agendaDoDia = DISPONIBILIDADE.find((item) => item.dia === dia)?.horarios || [];

                return (
                  <div key={dia} className="mini-day-column">
                    {HORARIOS_MODAL.map((hora) => {
                      const slot = agendaDoDia.find((item) => item.hora.startsWith(hora));
                      const isSelected = selectedSchedule === `${dia}-${slot?.hora ?? hora}`;

                      return (
                        <button
                          key={`${dia}-${hora}`}
                          type="button"
                          className={`mini-slot-cell ${slot ? 'filled' : 'empty'} ${isSelected ? 'selected' : ''}`}
                          onClick={() => slot && setSelectedSchedule(`${dia}-${slot.hora}`)}
                          disabled={!slot}
                        >
                          {slot ? (
                            <>
                              <span>{slot.hora}</span>
                              <strong>{slot.titulo}</strong>
                              <small>{slot.professor}</small>
                            </>
                          ) : (
                            <span>—</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
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
            value={selectedContract.aluno.nome}
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
            value={selectedContract.professor.nome}
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
