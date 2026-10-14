import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import Container from '../layout/Container';
import ScheduleGrid from '../schedule/ScheduleGrid';
import { horariosService } from '../contracts/horariosService';
import { professoresService } from '../professors/components/professoresService';
import { turmasService } from "./turmasService";
import { useItensMenu } from '../../utils/menuItems';
import { usePermissoes } from '../../utils/permissions';
import { ordenarHorarios } from '../../utils/ordenarHorarios';
import '../agenda/Agenda.css';
import './Classes.css';



const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const HORARIOS_MODAL = Array.from({ length: 15 }, (_, index) => `${String(index + 7).padStart(2, '0')}:00`);
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
const abreviarDia = (diaSemana) => {
  const dia = normalizarDia(diaSemana);
  return dia.slice(0, 3);
};

const agruparHorariosPorDia = (horarios = []) => {
  const grupos = [];

  [...horarios].sort(ordenarHorarios).forEach((horario) => {
    const dia = normalizarDia(horario.diaSemana);
    let grupo = grupos.find((item) => item.dia === dia);
    if (!grupo) {
      grupo = { dia, horarios: [] };
      grupos.push(grupo);
    }
    grupo.horarios.push(
      `${normalizarHora(horario.horaInicio)}-${normalizarHora(horario.horaFim)}`
    );
  });

  return grupos;
};

export default function Classes() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Itens do menu sao filtrados pelas telas liberadas no cadastro do professor
  const itensMenu = useItensMenu('/turmas');
  const { carregando: carregandoPermissoes } = usePermissoes();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [horariosSelecionados, setHorariosSelecionados] = useState([]);
  const [horariosEdicaoSelecionados, setHorariosEdicaoSelecionados] = useState([]);
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
    const limiteAlunos = Number(novaTurma.limiteAlunos);
    const camposInvalidos = [];

    if (!novaTurma.nome.trim()) camposInvalidos.push('nome');
    if (!novaTurma.nivel) camposInvalidos.push('nível de inglês');
    if (!novaTurma.tipo) camposInvalidos.push('tipo de turma');
    if (
      !novaTurma.limiteAlunos ||
      Number.isNaN(limiteAlunos) ||
      limiteAlunos < 1 ||
      limiteAlunos > 10
    ) {
      camposInvalidos.push('limite de alunos (entre 1 e 10)');
    }
    if (horariosSelecionados.length === 0) camposInvalidos.push('horários');

    if (camposInvalidos.length > 0) {
      const campos = camposInvalidos.join(', ').replace(/, ([^,]*)$/, ' e $1');
      const mensagem = `Verifique os seguintes campos: ${campos}.`;
      setCadastroError(mensagem);
      await Swal.fire({
        icon: 'error',
        title: 'Dados inválidos',
        text: mensagem,
        confirmButtonColor: '#0f1f3f'
      });
      return;
    }

    setSalvandoTurma(true);
    setCadastroError('');

    try {
      const turmaCriada = await turmasService.criar({
        ...novaTurma,
        limiteAlunos,
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
      const mensagem = error.response?.data?.message
        || error.response?.data?.error
        || error.message
        || 'Não foi possível cadastrar a turma. Verifique os dados e tente novamente.';
      setCadastroError(mensagem);
      await Swal.fire({
        icon: 'error',
        title: 'Não foi possível cadastrar',
        text: mensagem,
        confirmButtonColor: '#0f1f3f'
      });
    } finally {
      setSalvandoTurma(false);
    }
  };

  const abrirModalEdicao = async (turma) => {
    setSelectedClass({
      ...turma,
      professorId: turma.professorId ?? turma.professor?.id ?? '',
    });
    setHorariosEdicaoSelecionados(turma.horarios?.map((horario) => horario.id) ?? []);
    setProfessoresError('');

    try {
      const horariosData = await horariosService.listar();
      setHorarios(Array.isArray(horariosData) ? horariosData : horariosData.content ?? []);
      const data = await professoresService.listar();
      setProfessores(Array.isArray(data) ? data : data.content ?? []);
    } catch (error) {
      console.error('Erro ao buscar professores:', error.response?.data ?? error.message);
      setProfessoresError('Não foi possível carregar os professores disponíveis.');
    }
  };

  const fecharModalEdicao = () => {
    setSelectedClass(null);
    setHorariosEdicaoSelecionados([]);
  };

  const salvarEdicao = async () => {
    if (!selectedClass) return;

    const limiteAlunos = Number(selectedClass.limiteAlunos);
    const camposInvalidos = [];
    const nivelInvalido = !selectedClass.nivel
      || /^Selecione\b/i.test(String(selectedClass.nivel).trim());
    const tipoInvalido = !selectedClass.tipo
      || /^Selecione\b/i.test(String(selectedClass.tipo).trim());
    const professorInvalido = !selectedClass.professorId
      || /^Selecione\b/i.test(String(selectedClass.professorId).trim());

    if (!selectedClass.nome?.trim()) camposInvalidos.push('nome');
    if (nivelInvalido) camposInvalidos.push('nível de inglês');
    if (tipoInvalido) camposInvalidos.push('tipo de turma');
    if (professorInvalido) camposInvalidos.push('professor');
    if (!selectedClass.limiteAlunos || Number.isNaN(limiteAlunos) || limiteAlunos < 1 || limiteAlunos > 10) {
      camposInvalidos.push('limite de alunos (entre 1 e 10)');
    }
    if (horariosEdicaoSelecionados.length === 0) camposInvalidos.push('horários');
    if (camposInvalidos.length > 0) {
      const mensagem = `Verifique os seguintes campos: ${camposInvalidos.join(', ').replace(/, ([^,]*)$/, ' e $1')}.`;
      await Swal.fire({ icon: 'error', title: 'Dados inválidos', text: mensagem, confirmButtonColor: '#0f1f3f' });
      return;
    }

    try {
      const turmaAtualizada = await turmasService.atualizar(selectedClass.id, {
        nome: selectedClass.nome,
        nivel: selectedClass.nivel,
        tipo: selectedClass.tipo,
        limiteAlunos,
        horariosIds: horariosEdicaoSelecionados,
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
                        {agruparHorariosPorDia(turma.horarios).map((grupo, index) => (
                          <a key={grupo.dia}>
                            {index > 0 && ' | '}
                            {abreviarDia(grupo.dia)}: {grupo.horarios.join(' · ')}
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
          className="class-create-modal"
        >
          <div className="class-form-panel">
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

          <label>Nível de Inglês:</label>
          <select
            value={novaTurma.nivel}
            onChange={(event) =>
              setNovaTurma({
                ...novaTurma,
                nivel: event.target.value
              })
            }
          >
            <option value="Selecione um nível de inglês">Selecione um nível de inglês</option>
            <option value="A1 - Iniciante">A1 - Iniciante</option>
            <option value="A2 - Iniciante-intermediário">A2 - Iniciante-intermediário</option>
            <option value="B1 - Intermediário">B1 - Intermediário</option>
            <option value="B2 - Intermediário-avançado">B2 - Intermediário-avançado</option>
            <option value="C1 - Avançado">C1 - Avançado</option>
            <option value="C2 - Proficiente">C2 - Proficiente</option>
          </select>

          <label>Limite de alunos:</label>
          <input
            type="number" min={1} max={10} placeholder="Limite de alunos" value={novaTurma.limiteAlunos}
            onChange={(event) =>
              setNovaTurma({
                ...novaTurma,
                limiteAlunos: event.target.value
              })
            }
          />

          <label>Tipo de turma:</label>
          <select
            value={novaTurma.tipo}
            onChange={(event) =>
              setNovaTurma({
                ...novaTurma,
                tipo: event.target.value
              })
            }
          >
            <option value="">Selecione um tipo de turma</option>
            <option value="Inglês para negócios">Inglês para negócios</option>
            <option value="Inglês geral">Inglês geral</option>
          </select>


          {horariosError && <p className="classes-load-error">{horariosError}</p>}
          {cadastroError && <p className="classes-load-error">{cadastroError}</p>}

          <div className="class-selected-schedule">
            <span className="class-selected-schedule-title">Selecionados</span>
            {horariosSelecionados.length > 0 ? (
              <div className="class-selected-schedule-list">
                {[...horarios]
                  .filter((horario) => horariosSelecionados.includes(horario.id))
                  .sort(ordenarHorarios)
                  .map((horario) => (
                    <div key={horario.id} className="class-selected-schedule-item">
                      <strong>{normalizarDia(horario.diaSemana)}</strong>
                      <span>{normalizarHora(horario.horaInicio)} - {normalizarHora(horario.horaFim)}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <span className="class-selected-schedule-empty">Nenhum horário selecionado</span>
            )}
          </div>
          </div>

          <div className="class-schedule class-schedule-panel">
            <p className="class-schedule-instruction">
              Clique nos blocos para marcar os horários em que a turma estará disponível.
            </p>
            <div className="class-schedule-scroll">
              <ScheduleGrid
                className="class-week-grid"
                hoursHeaderClassName="class-hours-header"
                dayHeaderClassName="class-day-header"
                hourLabelClassName="class-hours-column"
                hourItemClassName="class-hour-label"
                dayColumnClassName="class-day-column"
                days={DIAS_SEMANA}
                hours={HORARIOS_MODAL.map((hora) => ({ value: hora, label: hora, key: `hora-${hora}` }))}
                getSlot={(dia, hora) => (horariosPorSlot[`${dia}-${hora}`] || [])[0]}
                renderSlot={({ slot: horario, day, hour, key }) => {
                  const opcoes = horariosPorSlot[`${day}-${hour}`] || [];
                  const isSelected = opcoes.some((item) => horariosSelecionados.includes(item.id));

                  return (
                    <button
                      key={key}
                      type="button"
                      className={`class-slot-cell ${horario ? 'filled' : 'empty'} ${isSelected ? 'selected' : ''}`}
                      onClick={() => horario && alternarHorario(horario)}
                      disabled={!horario}
                    />
                  );
                }}
              />
            </div>
            <p className="class-schedule-counter">
              {horariosSelecionados.length} horário(s) selecionado(s)
            </p>
          </div>

        </Modal>
      )}

      {selectedClass && (
        <Modal
          title="Editar Turma"
          onClose={fecharModalEdicao}
          onSave={salvarEdicao}
          onDelete={excluirTurma}
          className="class-create-modal"
        >
          <div className="class-form-panel">
            <label>Nome:</label>
            <input type="text" value={selectedClass.nome} onChange={(event) => setSelectedClass((turma) => ({ ...turma, nome: event.target.value }))} />
            <label>Nível:</label>
            <select value={selectedClass.nivel} onChange={(event) => setSelectedClass((turma) => ({ ...turma, nivel: event.target.value }))}>
              <option value="">Selecione um nível</option>
              <option value="Iniciante - A1">Iniciante - A1</option>
              <option value="Iniciante-intermediário - A2">Iniciante-intermediário - A2</option>
              <option value="Intermediário - B1">Intermediário - B1</option>
              <option value="Intermediário-avançado - B2">Intermediário-avançado - B2</option>
              <option value="Avançado - C1">Avançado - C1</option>
              <option value="Proficiente - C2">Proficiente - C2</option>
            </select>
            <label>Limite de alunos:</label>
            <input type="number" min={1} max={10} value={selectedClass.limiteAlunos} onChange={(event) => setSelectedClass((turma) => ({ ...turma, limiteAlunos: event.target.value }))} />
            <label>Tipo de turma:</label>
            <select value={selectedClass.tipo ?? ''} onChange={(event) => setSelectedClass((turma) => ({ ...turma, tipo: event.target.value }))}>
              <option value="">Selecione um tipo de turma</option>
              <option value="Inglês para negócios">Inglês para negócios</option>
              <option value="Inglês geral">Inglês geral</option>
            </select>
            <label>Professor:</label>
            <select value={selectedClass.professorId} onChange={(event) => setSelectedClass((turma) => ({ ...turma, professorId: Number(event.target.value) || '' }))}>
              <option value="">Selecione um professor</option>
              {professores.map((professor) => <option key={professor.id} value={professor.id}>{professor.nome}</option>)}
            </select>
            {professoresError && <p className="classes-load-error">{professoresError}</p>}
            <div className="class-selected-schedule">
              <span className="class-selected-schedule-title">Selecionados</span>
              {horariosEdicaoSelecionados.length > 0 ? horarios.filter((horario) => horariosEdicaoSelecionados.includes(horario.id)).sort(ordenarHorarios).map((horario) => (
                <div key={horario.id} className="class-selected-schedule-item"><strong>{normalizarDia(horario.diaSemana)}</strong><span>{normalizarHora(horario.horaInicio)} - {normalizarHora(horario.horaFim)}</span></div>
              )) : <span className="class-selected-schedule-empty">Nenhum horário selecionado</span>}
            </div>
          </div>
          <div className="class-schedule class-schedule-panel">
            <p className="class-schedule-instruction">Clique nos blocos para marcar os horários em que a turma estará disponível.</p>
            <div className="class-schedule-scroll">
              <ScheduleGrid
                className="class-week-grid"
                hoursHeaderClassName="class-hours-header"
                dayHeaderClassName="class-day-header"
                hourLabelClassName="class-hours-column"
                hourItemClassName="class-hour-label"
                dayColumnClassName="class-day-column"
                days={DIAS_SEMANA}
                hours={HORARIOS_MODAL.map((hora) => ({ value: hora, label: hora, key: `hora-${hora}` }))}
                getSlot={(dia, hora) => (horarios.filter((item) => normalizarDia(item.diaSemana) === dia && normalizarHora(item.horaInicio) === hora)[0])}
                renderSlot={({ slot: horario, day, hour, key }) => {
                  const opcoes = horarios.filter((item) => normalizarDia(item.diaSemana) === day && normalizarHora(item.horaInicio) === hour);
                  const selecionado = opcoes.some((item) => horariosEdicaoSelecionados.includes(item.id));
                  return <button key={key} type="button" className={`class-slot-cell ${horario ? 'filled' : 'empty'} ${selecionado ? 'selected' : ''}`} onClick={() => horario && setHorariosEdicaoSelecionados((atual) => atual.includes(horario.id) ? atual.filter((id) => id !== horario.id) : [...atual, horario.id])} disabled={!horario}><strong>{horario ? `${normalizarHora(horario.horaInicio)} - ${normalizarHora(horario.horaFim)}` : 'Indisponível'}</strong></button>;
                }}
              />
            </div>
          </div>
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
          {agruparHorariosPorDia(classDetails.horarios).map((grupo) => (
            <input
              key={grupo.dia}
              type="text"
              value={`${abreviarDia(grupo.dia)}: ${grupo.horarios.join(' · ')}`}
              readOnly
            />
          ))}
        </Modal>
      )}

    </div>
  );
}
