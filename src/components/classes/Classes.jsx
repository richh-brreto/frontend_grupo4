import { useEffect, useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import Container from '../layout/Container';
import { horariosService } from '../contracts/horariosService';
import { professoresService } from '../professors/components/professoresService';
import { turmasService } from './classes';
import '../agenda/Agenda.css';
import './Classes.css';

export default function Classes() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [classFilter, setClassFilter] = useState('todas');
  const [turmas, setTurmas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [horariosSelecionados, setHorariosSelecionados] = useState([]);
  const [horariosError, setHorariosError] = useState('');
  const [cadastroError, setCadastroError] = useState('');
  const [salvandoTurma, setSalvandoTurma] = useState(false);
  const [professores, setProfessores] = useState([]);
  const [professoresError, setProfessoresError] = useState('');

  const [novaTurma, setNovaTurma] = useState({
    nome: '',
    nivel: '',
    limiteAlunos: '',
    tipo: ''
  });

  const abrirModalAdicionar = async () => {
    setIsAddModalOpen(true);
    setHorariosError('');

    try {
      const data = await horariosService.listar();
      setHorarios(Array.isArray(data) ? data : data.content ?? []);
    } catch (error) {
      console.error('Erro ao buscar horários:', error.response?.data ?? error.message);
      setHorariosError('Não foi possível carregar os horários disponíveis.');
    }
  };

  const fecharModalAdicionar = () => {
    setIsAddModalOpen(false);
    setCadastroError('');
  };

  const salvarNovaTurma = async () => {
    if (!novaTurma.nome || !novaTurma.nivel || !novaTurma.tipo || !novaTurma.limiteAlunos) {
      setCadastroError('Preencha todos os dados da turma.');
      return;
    }

    if (horariosSelecionados.length === 0) {
      setCadastroError('Selecione pelo menos um dia e horário.');
      return;
    }

    setSalvandoTurma(true);
    setCadastroError('');

    try {
      const turmaCriada = await turmasService.criar({
        ...novaTurma,
        limiteAlunos: Number(novaTurma.limiteAlunos),
        horariosIds: horariosSelecionados,
      });

      if (turmaCriada?.id) {
        setTurmas((items) => [...items, turmaCriada]);
      }

      setNovaTurma({ nome: '', nivel: '', limiteAlunos: '', tipo: '' });
      setHorariosSelecionados([]);
      fecharModalAdicionar();
    } catch (error) {
      console.error('Erro ao cadastrar turma:', error.response?.data ?? error.message);
      setCadastroError('Não foi possível cadastrar a turma. Verifique os dados e tente novamente.');
    } finally {
      setSalvandoTurma(false);
    }
  };

  const abrirModalEdicao = async (turma) => {
    setSelectedClass({
      ...turma,
      professorId: turma.professorId ?? turma.professor?.id ?? '',
    });
    setProfessoresError('');

    try {
      const data = await professoresService.listar();
      setProfessores(Array.isArray(data) ? data : data.content ?? []);
    } catch (error) {
      console.error('Erro ao buscar professores:', error.response?.data ?? error.message);
      setProfessoresError('Não foi possível carregar os professores disponíveis.');
    }
  };

  const fecharModalEdicao = () => {
    setSelectedClass(null);
  };

  const salvarEdicao = async () => {
    if (!selectedClass) return;

    try {
      const turmaAtualizada = await turmasService.atualizar(selectedClass.id, {
        nome: selectedClass.nome,
        nivel: selectedClass.nivel,
        tipo: selectedClass.tipo,
        limiteAlunos: Number(selectedClass.limiteAlunos),
        horariosIds: selectedClass.horarios?.map((horario) => horario.id) ?? [],
        professorId: selectedClass.professorId || null,
      });
      setTurmas((items) =>
        items.map((item) =>
          item.id === selectedClass.id ? (turmaAtualizada?.id ? turmaAtualizada : selectedClass) : item
        )
      );
      fecharModalEdicao();
    } catch (error) {
      console.error('Erro ao atualizar turma:', error.response?.data ?? error.message);
      alert('Não foi possível salvar as alterações da turma.');
    }
  };

  const abrirDetalhes = (turma) => {
    setClassDetails(turma);
  };

  const fecharDetalhes = () => {
    setClassDetails(null);
  };

  useEffect(() => {
    turmasService.listar()
      .then(data => {
        setTurmas(Array.isArray(data) ? data : data.content ?? []);
      })
      .catch(error => {
        console.error('Erro ao buscar as turmas:', error.response?.data ?? error.message);
      });
  }, []);

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
            <ButtonContainer>
              <Button
                active={classFilter === 'todas'}
                onClick={() => setClassFilter('todas')}
              >
                Todas
              </Button>
              <Button onClick={abrirModalAdicionar}>Adicionar turma</Button>
            </ButtonContainer>
          </div>

          <div className="agenda-frame">
            <Container
              items={turmas}
              className="classes-grid"
              getItemKey={(turma) => turma.id}
              renderItem={(turma) => (
                <article key={turma.id} className="class-card">
                  <div className="class-card-head">
                    <div>
                      <h3>{turma.nome}</h3>
                    </div>
                    <span className="status-pill">
                      Em andamento
                    </span>
                  </div>

                  <div className="class-meta">
                    <div>
                      <span>Professor</span>
                      <strong>{turma.nomeProfessor}</strong>
                    </div>

                    <div>
                      <span>Nível</span>
                      <strong>{turma.nivel}</strong>
                    </div>

                    <div>
                      <span>Tipo</span>
                      <strong>{turma.tipo}</strong>
                    </div>

                    <div>
                      <span>Horário</span>
                      <strong>
                        {turma.horarios?.map((horario, index) => (
                          <a key={horario.id}>
                            {index > 0 && ' | '}
                            {horario.diaSemana} das {horario.horaInicio} às {horario.horaFim}
                          </a>
                        ))}
                      </strong>
                    </div>
                  </div>

                  <ButtonContainer>
                    <Button onClick={() => abrirModalEdicao(turma)}>Editar</Button>
                    <Button active onClick={() => abrirDetalhes(turma)}>Ver detalhes</Button>
                  </ButtonContainer>
                </article>
              )}
            />
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <Modal
          title="Adicionar Turma"
          onClose={fecharModalAdicionar}
          onSave={salvarNovaTurma}
          saveLabel={salvandoTurma ? 'Salvando...' : 'Salvar'}
        >
          <label>Nome:</label>
          <input
            type="text" placeholder="Nome" value={novaTurma.nome}
            onChange={(event) =>
              setNovaTurma({
                ...novaTurma,
                nome: event.target.value
              })
            }
          />

          <label>Nível:</label>
          <select
            value={novaTurma.nivel}
            onChange={(event) =>
              setNovaTurma({
                ...novaTurma,
                nivel: event.target.value
              })
            }
          >
            <option value="">Selecione um nível</option>
            <option value="Iniciante - A1">Iniciante - A1</option>
            <option value="Iniciante-intermediário - A2">Iniciante-intermediário - A2</option>
            <option value="Intermediário - B1">Intermediário - B1</option>
            <option value="Intermediário-avançado - B2">Intermediário-avançado - B2</option>
            <option value="Avançado - C1">Avançado - C1</option>
            <option value="Proficiente - C2">Proficiente - C2</option>
          </select>

          <label>Limite de alunos:</label>
          <input
            type="text" placeholder="Limite de alunos" value={novaTurma.limiteAlunos}
            onChange={(event) =>
              setNovaTurma({
                ...novaTurma,
                limiteAlunos: event.target.value
              })
            }
          />

          <label>Tipo:</label>
          <input
            type="text" placeholder="Tipo" value={novaTurma.tipo}
            onChange={(event) =>
              setNovaTurma({
                ...novaTurma,
                tipo: event.target.value
              })
            }
          />

          <label>Dia e horário:</label>

          <select
            value=""
            onChange={(event) => {
              const id = Number(event.target.value);

              if (!id) return;

              if (!horariosSelecionados.includes(id)) {
                setHorariosSelecionados((atual) => [...atual, id]);
              }
            }}
          >
            <option value="">Selecione um horário</option>

            {horarios.map((horario) => (
              <option
                key={horario.id}
                value={horario.id}
                disabled={horariosSelecionados.includes(horario.id)}
              >
                {horario.diaSemana} das {horario.horaInicio} às {horario.horaFim}
              </option>
            ))}
          </select>

          {horariosError && <p className="classes-load-error">{horariosError}</p>}
          {cadastroError && <p className="classes-load-error">{cadastroError}</p>}

          <div>
            {horariosSelecionados.map((id) => {
              const horario = horarios.find((h) => h.id === id);

              if (!horario) return null;

              return (
                <div key={id}>
                  <span>
                    {horario.diaSemana} das {horario.horaInicio} às {horario.horaFim}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setHorariosSelecionados((atual) =>
                        atual.filter((horarioId) => horarioId !== id)
                      );
                    }}
                  >
                    Remover
                  </button>
                </div>
              );
            })}
          </div>

        </Modal>
      )}

      {selectedClass && (
        <Modal
          title="Editar Turma"
          onClose={fecharModalEdicao}
          onSave={salvarEdicao}
        >
          <label>Nome:</label>
          <input
            type="text"
            value={selectedClass.nome}
            onChange={(event) =>
              setSelectedClass((turma) => ({ ...turma, nome: event.target.value }))
            }
          />

          <label>Nível:</label>
          <select
            value={selectedClass.nivel}
            onChange={(event) =>
              setSelectedClass((turma) => ({ ...turma, nivel: event.target.value }))
            }
          >
            <option value="">Selecione um nível</option>
            <option value="Iniciante - A1">Iniciante - A1</option>
            <option value="Iniciante-intermediário - A2">Iniciante-intermediário - A2</option>
            <option value="Intermediário - B1">Intermediário - B1</option>
            <option value="Intermediário-avançado - B2">Intermediário-avançado - B2</option>
            <option value="Avançado - C1">Avançado - C1</option>
            <option value="Proficiente - C2">Proficiente - C2</option>
          </select>

          <label>Professor:</label>
          <select
            value={selectedClass.professorId}
            onChange={(event) =>
              setSelectedClass((turma) => ({ ...turma, professorId: Number(event.target.value) || '' }))
            }
          >
            <option value="">Selecione um professor</option>
            {professores.map((professor) => (
              <option key={professor.id} value={professor.id}>
                {professor.nome}
              </option>
            ))}
          </select>

          {professoresError && <p className="classes-load-error">{professoresError}</p>}

          <label>Horário:</label>
          {selectedClass.horarios?.map((horario) => (
            <input
              key={horario.id}
              type="text"
              value={`${horario.diaSemana} das ${horario.horaInicio} às ${horario.horaFim}`}
              readOnly
            />
          ))}
        </Modal>
      )}

      {classDetails && (
        <Modal
          title={`Detalhes da Turma ${classDetails.nome}`}
          onClose={fecharDetalhes}
          showSave={false}
        >

          <label>Nome:</label>
          <input type="text" value={classDetails.nome} readOnly />

          <label>Nível:</label>
          <input type="text" value={classDetails.nivel} readOnly />

          <label>Tipo:</label>
          <input type="text" value={classDetails.tipo} readOnly />

          <label>Limite de alunos:</label>
          <input type="text" value={classDetails.limiteAlunos} readOnly />

          <label>Professor:</label>
          <input type="text" value={classDetails.nomeProfessor} readOnly />

          <label>Horário:</label>
          {classDetails.horarios?.map((horario) => (
            <input
              key={horario.id}
              type="text"
              value={`${horario.diaSemana} das ${horario.horaInicio} às ${horario.horaFim}`}
              readOnly
            />
          ))}
        </Modal>
      )}

    </div>
  );
}
