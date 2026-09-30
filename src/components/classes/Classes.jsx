import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import Container from '../layout/Container';
import { horariosService } from '../contracts/horariosService';
import { professoresService } from '../professors/components/professoresService';
import { turmasService } from "./turmasService";
import { useItensMenu } from '../../utils/menuItems';
import { usePermissoes } from '../../utils/permissions';
import '../agenda/Agenda.css';
import './Classes.css';



const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const HORARIOS_MODAL = Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, '0')}:00`);
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

export default function Classes() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Itens do menu sao filtrados pelas telas liberadas no cadastro do professor
  const itensMenu = useItensMenu('/turmas');
  const { carregando: carregandoPermissoes } = usePermissoes();
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
  const [busca, setBusca] = useState('');

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
    setHorariosSelecionados([]);
  };

  const alternarHorario = (horario) => {
    setHorariosSelecionados((atual) =>
      atual.includes(horario.id)
        ? atual.filter((id) => id !== horario.id)
        : [...atual, horario.id]
    );
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

      await Swal.fire({
        icon: 'success',
        title: 'Turma criada!',
        text: 'A turma foi cadastrada com sucesso.',
        confirmButtonColor: '#0f1f3f'
      });

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
      await Swal.fire({
        icon: 'success',
        title: 'Turma atualizada!',
        text: 'As alterações foram salvas com sucesso.',
        confirmButtonColor: '#0f1f3f'
      });
    } catch (error) {
      console.error('Erro ao atualizar turma:', error.response?.data ?? error.message);
      alert('Não foi possível salvar as alterações da turma.');
    }
  };

  const excluirTurma = async () => {
    if (!selectedClass) return;

    const resultado = await Swal.fire({
      icon: 'warning',
      title: 'Excluir turma?',
      text: `Tem certeza que deseja excluir a turma "${selectedClass.nome}"? Essa ação não pode ser desfeita.`,
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b91c1c',
      cancelButtonColor: '#64748b'
    });

    if (!resultado.isConfirmed) return;

    try {
      await turmasService.excluir(selectedClass.id);
      setTurmas((items) => items.filter((item) => item.id !== selectedClass.id));
      fecharModalEdicao();
      await Swal.fire({
        icon: 'success',
        title: 'Turma excluída!',
        text: 'A turma foi removida com sucesso.',
        confirmButtonColor: '#0f1f3f'
      });
    } catch (error) {
      console.error('Erro ao excluir turma:', error.response?.data ?? error.message);
      alert('Não foi possível excluir a turma. Tente novamente.');
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

  const buscaNormalizada = normalizar(busca.trim());
  const turmasFiltradas = buscaNormalizada
    ? turmas.filter((turma) => normalizar(turma.nome).includes(buscaNormalizada))
    : turmas;

  const horariosPorSlot = horarios.reduce((slots, horario) => {
    const chave = `${normalizarDia(horario.diaSemana)}-${normalizarHora(horario.horaInicio)}`;
    slots[chave] = [...(slots[chave] || []), horario];
    return slots;
  }, {});

  return (
    <div className="agenda-page classes-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        items={itensMenu}
        carregando={carregandoPermissoes}
      />

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div>
              <h1>Turmas</h1>
            </div>
            <ButtonContainer>
              <input
                type="text"
                placeholder="Buscar turma por nome..."
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                className="class-search-input"
              />
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
              items={turmasFiltradas}
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

          {horariosError && <p className="classes-load-error">{horariosError}</p>}
          {cadastroError && <p className="classes-load-error">{cadastroError}</p>}

          <div className="class-schedule">
            <div className="class-week-grid">
              <div className="class-hours-header">Horários</div>
              {DIAS_SEMANA.map((dia) => (
                <div key={dia} className="class-day-header">{dia}</div>
              ))}

              <div className="class-hours-column">
                {HORARIOS_MODAL.map((hora) => (
                  <div key={`hora-${hora}`} className="class-hour-label">{hora}</div>
                ))}
              </div>

              {DIAS_SEMANA.map((dia) => (
                <div key={dia} className="class-day-column">
                  {HORARIOS_MODAL.map((hora) => {
                    const opcoes = horariosPorSlot[`${dia}-${hora}`] || [];
                    const horario = opcoes[0];
                    const isSelected = opcoes.some((item) => horariosSelecionados.includes(item.id));

                    return (
                      <button
                        key={`${dia}-${hora}`}
                        type="button"
                        className={`class-slot-cell ${horario ? 'filled' : 'empty'} ${isSelected ? 'selected' : ''}`}
                        onClick={() => horario && alternarHorario(horario)}
                        disabled={!horario}
                      >
                        {horario ? (
                          <>
                            <span>{normalizarHora(horario.horaInicio)} - {normalizarHora(horario.horaFim)}</span>
                            <strong>{isSelected ? 'Selecionado' : 'Disponível'}</strong>
                          </>
                        ) : (
                          <span>Horário não disponível</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

        </Modal>
      )}

      {selectedClass && (
        <Modal
          title="Editar Turma"
          onClose={fecharModalEdicao}
          onSave={salvarEdicao}
          onDelete={excluirTurma}
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
