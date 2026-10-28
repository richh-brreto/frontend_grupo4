import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import Container from '../layout/Container';
import ScheduleGrid from '../schedule/ScheduleGrid';
import { horariosService } from '../contracts/horariosService';
import { professoresService } from '../professors/components/professoresService';
import { turmasService } from "./turmasService";
import { ordenarHorarios } from '../../utils/ordenarHorarios';
import '../agenda/Agenda.css';
import './Classes.css';



const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const obterNivelTurma = (turma) => turma.nivel ?? turma.nivelIngles ?? turma.nivel_ingles ?? turma.level ?? '';
const obterTipoTurma = (turma) => turma.tipo ?? turma.tipoTurma ?? turma.tipo_turma ?? turma.classType ?? '';
const obterProfessorTurma = (turma) => turma.professor ?? turma.professorResponsavel ?? turma.teacher ?? null;
const obterProfessorIdTurma = (turma) =>
  turma.professorId ?? turma.idProfessor ?? turma.professor_id ?? turma.id_professor ?? obterProfessorTurma(turma)?.id ?? '';
const obterNomeProfessorTurma = (turma) =>
  turma.nomeProfessor ?? turma.professorNome ?? turma.nome_professor ?? obterProfessorTurma(turma)?.nome ?? '';
const obterHorarioId = (horario) =>
  typeof horario === 'object' && horario !== null
    ? horario.id ?? horario.horarioId ?? horario.idHorario
    : horario;
const obterHorariosIdsTurma = (turma) => [
  ...new Set([
    ...(Array.isArray(turma?.horariosIds) ? turma.horariosIds : []),
    ...(Array.isArray(turma?.horarios) ? turma.horarios : []),
  ].map(obterHorarioId).filter((id) => id != null).map(String)),
];

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const HORARIOS_MODAL = Array.from({ length: 15 }, (_, index) => `${String(index + 7).padStart(2, '0')}:00`);
const NIVEIS_TURMA = [
  'A1 - Iniciante',
  'A2 - Iniciante-intermediário',
  'B1 - Intermediário',
  'B2 - Intermediário-avançado',
  'C1 - Avançado',
  'C2 - Proficiente',
];
const TIPOS_TURMA = ['Inglês para negócios', 'Inglês geral'];
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
const horarioDisponivelParaProfessor = (horario, professor) => {
  const horariosProfessor = Array.isArray(professor?.horarios) ? professor.horarios : [];
  const horariosIds = [
    ...(Array.isArray(professor?.horariosIds) ? professor.horariosIds : []),
    ...horariosProfessor.map(obterHorarioId),
  ].filter((id) => id != null).map(String);
  if (horariosIds.includes(String(horario.id))) return true;

  return horariosProfessor.some((item) => typeof item === 'object' && item !== null &&
    normalizarDia(item.diaSemana) === normalizarDia(horario.diaSemana)
    && normalizarHora(item.horaInicio) === normalizarHora(horario.horaInicio)
  );
};
const horarioOcupadoPorOutraTurma = (horario, professorId, turmas, turmaIdIgnorada) =>
  turmas.some((turma) => {
    if (String(obterProfessorIdTurma(turma)) !== String(professorId)) return false;
    if (turmaIdIgnorada != null && String(turma.id) === String(turmaIdIgnorada)) return false;

    if (obterHorariosIdsTurma(turma).includes(String(horario.id))) return true;
    return (Array.isArray(turma.horarios) ? turma.horarios : []).some((alocado) =>
      alocado && typeof alocado === 'object' && alocado.diaSemana
        && normalizarDia(alocado.diaSemana) === normalizarDia(horario.diaSemana)
        && normalizarHora(alocado.horaInicio) === normalizarHora(horario.horaInicio)
    );
  });
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
  const horarioPodeSerAlocado = (horario, professor, turmaIdIgnorada) => {
    const turmaAtual = turmaIdIgnorada == null
      ? null
      : turmas.find((turma) => String(turma.id) === String(turmaIdIgnorada));
    const horarioJaAlocadoNaTurmaAtual = obterProfessorIdTurma(turmaAtual ?? {}) != null
      && String(obterProfessorIdTurma(turmaAtual ?? {})) === String(professor?.id)
      && obterHorariosIdsTurma(turmaAtual).includes(String(horario.id));

    return (horarioDisponivelParaProfessor(horario, professor) || horarioJaAlocadoNaTurmaAtual)
      && !horarioOcupadoPorOutraTurma(horario, professor?.id, turmas, turmaIdIgnorada);
  };

  const [novaTurma, setNovaTurma] = useState({
    nome: '',
    nivel: '',
    limiteAlunos: '',
    tipo: '',
    professorId: ''
  });
  const [novaTurmaInicial, setNovaTurmaInicial] = useState({
    nome: '',
    nivel: '',
    limiteAlunos: '',
    tipo: '',
    professorId: ''
  });

  const temAlteracoesNovaTurma = () => {
    return (
      novaTurma.nome.trim() !== novaTurmaInicial.nome.trim() ||
      novaTurma.nivel !== novaTurmaInicial.nivel ||
      novaTurma.limiteAlunos !== novaTurmaInicial.limiteAlunos ||
      novaTurma.tipo !== novaTurmaInicial.tipo ||
      novaTurma.professorId !== novaTurmaInicial.professorId ||
      horariosSelecionados.length > 0
    );
  };

  const abrirModalAdicionar = async () => {
    setIsAddModalOpen(true);
    setHorariosError('');
    setProfessoresError('');
    setNovaTurma({ nome: '', nivel: '', limiteAlunos: '', tipo: '', professorId: '' });
    setNovaTurmaInicial({ nome: '', nivel: '', limiteAlunos: '', tipo: '', professorId: '' });
    setHorariosSelecionados([]);

    const [horariosResult, professoresResult] = await Promise.allSettled([
      horariosService.listar(),
      professoresService.listar()
    ]);

    if (horariosResult.status === 'fulfilled') {
      const data = horariosResult.value;
      setHorarios(Array.isArray(data) ? data : data.content ?? []);
    } else {
      console.error('Erro ao buscar horários:', horariosResult.reason?.response?.data ?? horariosResult.reason?.message);
      setHorariosError('Não foi possível carregar os horários disponíveis.');
    }

    if (professoresResult.status === 'fulfilled') {
      const data = professoresResult.value;
      setProfessores(Array.isArray(data) ? data : data.content ?? []);
    } else {
      console.error('Erro ao buscar professores:', professoresResult.reason?.response?.data ?? professoresResult.reason?.message);
      setProfessoresError('Não foi possível carregar os professores disponíveis.');
    }
  };

  const fecharModalAdicionar = async () => {
    if (temAlteracoesNovaTurma()) {
      const resultado = await Swal.fire({
        icon: 'warning',
        title: 'Alterações não salvas',
        text: 'Você tem alterações não salvas. Deseja realmente sair sem salvar?',
        showCancelButton: true,
        confirmButtonText: 'Sim, sair sem salvar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#b91c1c',
        cancelButtonColor: '#64748b'
      });
      if (!resultado.isConfirmed) return;
    }
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
    if (!novaTurma.professorId) camposInvalidos.push('professor');
    if (
      !novaTurma.limiteAlunos ||
      Number.isNaN(limiteAlunos) ||
      limiteAlunos < 1 ||
      limiteAlunos > 10
    ) {
      camposInvalidos.push('limite de alunos (entre 1 e 10)');
    }
    if (horariosSelecionados.length === 0) camposInvalidos.push('horários');
    const professorSelecionado = professores.find(
      (professor) => String(professor.id) === String(novaTurma.professorId)
    );
    if (horariosSelecionados.some((id) => {
      const horario = horarios.find((item) => String(item.id) === String(id));
      return !horario || !horarioPodeSerAlocado(horario, professorSelecionado);
    })) {
      camposInvalidos.push('horários disponíveis para o professor');
    }

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
      const payloadTurma = {
        ...novaTurma,
        limiteAlunos,
        horariosIds: horariosSelecionados,
      };
      const turmaCriada = await turmasService.criar(payloadTurma);

      if (turmaCriada?.id) {
        setTurmas((items) => [...items, {
          ...turmaCriada,
          ...payloadTurma,
          nomeProfessor: professorSelecionado.nome,
          professor: professorSelecionado,
        }]);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Turma criada!',
        text: 'A turma foi cadastrada com sucesso.',
        confirmButtonColor: '#0f1f3f'
      });

      setNovaTurma({ nome: '', nivel: '', limiteAlunos: '', tipo: '', professorId: '' });
      setNovaTurmaInicial({ nome: '', nivel: '', limiteAlunos: '', tipo: '', professorId: '' });
      setHorariosSelecionados([]);
      setIsAddModalOpen(false);
      setCadastroError('');
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
    const turmaParaEdicao = {
      ...turma,
      nivel: obterNivelTurma(turma),
      tipo: obterTipoTurma(turma),
      professorId: obterProfessorIdTurma(turma),
      nomeProfessor: obterNomeProfessorTurma(turma),
    };
    setSelectedClass(turmaParaEdicao);
    setHorariosEdicaoSelecionados([]);
    setProfessoresError('');
    
    // Store initial values for change detection
    setSelectedClass(prev => ({ ...prev, 
      _initialNome: turmaParaEdicao.nome,
      _initialNivel: turmaParaEdicao.nivel,
      _initialLimiteAlunos: turmaParaEdicao.limiteAlunos,
      _initialTipo: turmaParaEdicao.tipo,
      _initialProfessorId: turmaParaEdicao.professorId,
      _initialHorariosIds: obterHorariosIdsTurma(turma)
    }));

    try {
      const horariosData = await horariosService.listar();
      const horariosCarregados = Array.isArray(horariosData) ? horariosData : horariosData.content ?? [];
      setHorarios(horariosCarregados);
      const data = await professoresService.listar();
      const professoresCarregados = Array.isArray(data) ? data : data.content ?? [];
      setProfessores(professoresCarregados);

      const nomeProfessor = obterNomeProfessorTurma(turma);
      const professorAtual = professoresCarregados.find(
        (professor) => String(professor.id) === String(turmaParaEdicao.professorId)
      ) ?? professoresCarregados.find(
        (professor) => normalizar(professor.nome.trim()) === normalizar(nomeProfessor.trim())
      );
      const professorId = professorAtual?.id ?? turmaParaEdicao.professorId;
      const horariosDisponiveis = horariosCarregados.filter(
        (horario) => horarioPodeSerAlocado(horario, professorAtual, turmaParaEdicao.id)
      );
      const horariosSalvos = Array.isArray(turma.horarios) ? turma.horarios : [];
      const horariosSalvosIds = obterHorariosIdsTurma(turma);
      const horariosIniciais = horariosDisponiveis
        .filter((horario) => horariosSalvosIds.includes(String(horario.id))
          || horariosSalvos.some((salvo) =>
          String(obterHorarioId(salvo)) === String(horario.id)
          || (salvo?.diaSemana
            && normalizarDia(salvo.diaSemana) === normalizarDia(horario.diaSemana)
            && normalizarHora(salvo.horaInicio) === normalizarHora(horario.horaInicio))
        ))
        .map((horario) => horario.id);

      setSelectedClass((atual) => String(atual?.id) === String(turma.id)
        ? {
            ...atual,
            professorId,
            _initialProfessorId: professorId,
            _initialHorariosIds: horariosIniciais,
          }
        : atual);
      setHorariosEdicaoSelecionados(horariosIniciais);
    } catch (error) {
      console.error('Erro ao buscar professores:', error.response?.data ?? error.message);
      setProfessoresError('Não foi possível carregar os professores disponíveis.');
    }
  };

  const temAlteracoesEdicaoTurma = () => {
    if (!selectedClass) return false;
    return (
      selectedClass.nome?.trim() !== selectedClass._initialNome?.trim() ||
      selectedClass.nivel !== selectedClass._initialNivel ||
      selectedClass.limiteAlunos !== selectedClass._initialLimiteAlunos ||
      selectedClass.tipo !== selectedClass._initialTipo ||
      selectedClass.professorId !== selectedClass._initialProfessorId ||
      JSON.stringify([...horariosEdicaoSelecionados].sort()) !== JSON.stringify([...(selectedClass._initialHorariosIds || [])].sort())
    );
  };

  const fecharModalEdicao = async () => {
    if (temAlteracoesEdicaoTurma()) {
      const resultado = await Swal.fire({
        icon: 'warning',
        title: 'Alterações não salvas',
        text: 'Você tem alterações não salvas. Deseja realmente sair sem salvar?',
        showCancelButton: true,
        confirmButtonText: 'Sim, sair sem salvar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#b91c1c',
        cancelButtonColor: '#64748b'
      });
      if (!resultado.isConfirmed) return;
    }
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
    const professorSelecionado = professores.find(
      (professor) => String(professor.id) === String(selectedClass.professorId)
    );
    if (horariosEdicaoSelecionados.some((id) => {
      const horario = horarios.find((item) => String(item.id) === String(id));
      return !horario || !horarioPodeSerAlocado(horario, professorSelecionado, selectedClass.id);
    })) {
      camposInvalidos.push('horários disponíveis para o professor');
    }
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
      const payloadAtualizacao = {
        nome: selectedClass.nome,
        nivel: selectedClass.nivel,
        tipo: selectedClass.tipo,
        limiteAlunos,
        horariosIds: horariosEdicaoSelecionados,
        professorId: selectedClass.professorId || null,
      };
      const turmaAtualizada = await turmasService.atualizar(selectedClass.id, payloadAtualizacao);
      setTurmas((items) =>
        items.map((item) =>
          String(item.id) === String(selectedClass.id)
            ? {
                ...item,
                ...turmaAtualizada,
                ...payloadAtualizacao,
                nomeProfessor: professorSelecionado?.nome ?? obterNomeProfessorTurma(item),
                professor: professorSelecionado ?? obterProfessorTurma(item),
              }
            : item
        )
      );
      setSelectedClass(null);
      setHorariosEdicaoSelecionados([]);
      await Swal.fire({
        icon: 'success',
        title: 'Turma atualizada!',
        text: 'As alterações foram salvas com sucesso.',
        confirmButtonColor: '#0f1f3f'
      });
    } catch (error) {
      console.error('Erro ao atualizar turma:', error.response?.data ?? error.message);
      await Swal.fire({
        icon: 'error',
        title: 'Não foi possível atualizar a turma',
        text: error.response?.data?.message || error.message || 'Tente novamente.',
        confirmButtonColor: '#0f1f3f'
      });
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
      setSelectedClass(null);
      setHorariosEdicaoSelecionados([]);
      await Swal.fire({
        icon: 'success',
        title: 'Turma excluída!',
        text: 'A turma foi removida com sucesso.',
        confirmButtonColor: '#0f1f3f'
      });
    } catch (error) {
      console.error('Erro ao excluir turma:', error.response?.data ?? error.message);
      await Swal.fire({
        icon: 'error',
        title: 'Não foi possível excluir a turma',
        text: error.response?.data?.message || error.message || 'Tente novamente.',
        confirmButtonColor: '#0f1f3f'
      });
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
        const turmasCarregadas = Array.isArray(data) ? data : data.content ?? [];
        setTurmas(turmasCarregadas.map((turma) => ({
          ...turma,
          nivel: obterNivelTurma(turma),
          tipo: obterTipoTurma(turma),
          professorId: obterProfessorIdTurma(turma),
          nomeProfessor: obterNomeProfessorTurma(turma),
        })));
      })
      .catch(error => {
        console.error('Erro ao buscar as turmas:', error.response?.data ?? error.message);
      });

    professoresService.listar()
      .then((data) => setProfessores(Array.isArray(data) ? data : data.content ?? []))
      .catch((error) => {
        console.error('Erro ao buscar os professores:', error.response?.data ?? error.message);
      });
  }, []);

  const buscaNormalizada = normalizar(busca.trim());
  const turmasFiltradas = buscaNormalizada
    ? turmas.filter((turma) => normalizar(turma.nome).includes(buscaNormalizada))
    : turmas;

  const professorNovo = professores.find(
    (professor) => String(professor.id) === String(novaTurma.professorId)
  );
  const horariosDisponiveisNovo = horarios.filter(
    (horario) => horarioPodeSerAlocado(horario, professorNovo)
  );
  const horariosPorSlot = horariosDisponiveisNovo.reduce((slots, horario) => {
    const chave = `${normalizarDia(horario.diaSemana)}-${normalizarHora(horario.horaInicio)}`;
    slots[chave] = [...(slots[chave] || []), horario];
    return slots;
  }, {});
  const professorEdicao = professores.find(
    (professor) => String(professor.id) === String(selectedClass?.professorId)
  );
  const horariosDisponiveisEdicao = horarios.filter(
    (horario) => horarioPodeSerAlocado(horario, professorEdicao, selectedClass?.id)
  );
  const horariosPorSlotEdicao = horariosDisponiveisEdicao.reduce((slots, horario) => {
    const chave = `${normalizarDia(horario.diaSemana)}-${normalizarHora(horario.horaInicio)}`;
    slots[chave] = [...(slots[chave] || []), horario];
    return slots;
  }, {});

  return (
    <>
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div>
              <h1>Turmas</h1>
            </div>
            <ButtonContainer>
              <input
                type="text"
                placeholder="Buscar turma por nome..."
                aria-label="Buscar turma por nome"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                className="class-search-input"
              />
            
              <Button variant="primary" onClick={abrirModalAdicionar}>Adicionar turma</Button>
              
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
                      <strong>
                        {turma.nomeProfessor
                          || obterNomeProfessorTurma(turma)
                          || professores.find((professor) => String(professor.id) === String(obterProfessorIdTurma(turma)))?.nome
                          || 'Não alocado'}
                      </strong>
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

      {isAddModalOpen && (
        <Modal
          title="Adicionar Turma"
          onClose={fecharModalAdicionar}
          onSave={salvarNovaTurma}
          saveLabel={salvandoTurma ? 'Salvando...' : 'Salvar'}
          className="class-create-modal"
        >
          <div className="class-form-panel">
          <label className="modal-field-label" htmlFor="class-create-name">Nome:</label>
          <input
            id="class-create-name" className="modal-form-control"
            type="text" placeholder="Nome" value={novaTurma.nome}
            onChange={(event) =>
              setNovaTurma({
                ...novaTurma,
                nome: event.target.value
              })
            }
          />

          <label className="modal-field-label" htmlFor="class-create-level">Nível de Inglês:</label>
          <select
            id="class-create-level" className="modal-form-control"
            value={novaTurma.nivel}
            onChange={(event) =>
              setNovaTurma({
                ...novaTurma,
                nivel: event.target.value
              })
            }
          >
            <option value="">Selecione um nível de inglês</option>
            {NIVEIS_TURMA.map((nivel) => <option key={nivel} value={nivel}>{nivel}</option>)}
          </select>

          <label className="modal-field-label" htmlFor="class-create-capacity">Limite de alunos:</label>
          <input
            id="class-create-capacity" className="modal-form-control"
            type="number" min={1} max={10} placeholder="Limite de alunos" value={novaTurma.limiteAlunos}
            onChange={(event) =>
              setNovaTurma({
                ...novaTurma,
                limiteAlunos: event.target.value
              })
            }
          />

          <label className="modal-field-label" htmlFor="class-create-type">Tipo de turma:</label>
          <select
            id="class-create-type" className="modal-form-control"
            value={novaTurma.tipo}
            onChange={(event) =>
              setNovaTurma({
                ...novaTurma,
                tipo: event.target.value
              })
            }
          >
            <option value="">Selecione um tipo de turma</option>
            {TIPOS_TURMA.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>

          <label className="modal-field-label" htmlFor="class-create-professor">Professor:</label>
          <select
            id="class-create-professor" className="modal-form-control"
            value={novaTurma.professorId}
            onChange={(event) => {
              const professorId = Number(event.target.value) || '';
              const professor = professores.find((item) => String(item.id) === String(professorId));
              const horariosPermitidos = new Set(
                horarios
                  .filter((horario) => horarioPodeSerAlocado(horario, professor))
                  .map((horario) => String(horario.id))
              );
              setNovaTurma((turma) => ({ ...turma, professorId }));
              setHorariosSelecionados((atual) =>
                atual.filter((id) => horariosPermitidos.has(String(id)))
              );
            }}
          >
            <option value="">Selecione um professor</option>
            {professores.map((professor) => (
              <option key={professor.id} value={professor.id}>{professor.nome}</option>
            ))}
          </select>

          {horariosError && <p className="classes-load-error">{horariosError}</p>}
          {professoresError && <p className="classes-load-error">{professoresError}</p>}
          {cadastroError && <p className="classes-load-error">{cadastroError}</p>}

          <div className="class-selected-schedule">
            <span className="class-selected-schedule-title">Selecionados</span>
            <div className="class-selected-schedule-item">
              <strong>Professor alocado</strong>
              <span>{professorNovo?.nome || 'Nenhum professor selecionado'}</span>
            </div>
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
              {professorNovo
                ? `Disponibilidade de ${professorNovo.nome}. Selecione os horários da turma.`
                : 'Selecione um professor para ver a disponibilidade de horários.'}
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
                      aria-label={horario
                        ? `${normalizarDia(horario.diaSemana)} às ${normalizarHora(horario.horaInicio)}`
                        : 'Sem disponibilidade do professor'}
                    >
                    </button>
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
            <label className="modal-field-label" htmlFor="class-edit-name">Nome:</label>
            <input id="class-edit-name" className="modal-form-control" type="text" value={selectedClass.nome} onChange={(event) => setSelectedClass((turma) => ({ ...turma, nome: event.target.value }))} />
            <label className="modal-field-label" htmlFor="class-edit-level">Nível:</label>
            <select id="class-edit-level" className="modal-form-control" value={selectedClass.nivel} onChange={(event) => setSelectedClass((turma) => ({ ...turma, nivel: event.target.value }))}>
              <option value="">Selecione um nível</option>
              {selectedClass.nivel && !NIVEIS_TURMA.includes(selectedClass.nivel) && (
                <option value={selectedClass.nivel}>{selectedClass.nivel}</option>
              )}
              {NIVEIS_TURMA.map((nivel) => <option key={nivel} value={nivel}>{nivel}</option>)}
            </select>
            <label className="modal-field-label" htmlFor="class-edit-capacity">Limite de alunos:</label>
            <input id="class-edit-capacity" className="modal-form-control" type="number" min={1} max={10} value={selectedClass.limiteAlunos} onChange={(event) => setSelectedClass((turma) => ({ ...turma, limiteAlunos: event.target.value }))} />
            <label className="modal-field-label" htmlFor="class-edit-type">Tipo de turma:</label>
            <select id="class-edit-type" className="modal-form-control" value={selectedClass.tipo ?? ''} onChange={(event) => setSelectedClass((turma) => ({ ...turma, tipo: event.target.value }))}>
              <option value="">Selecione um tipo de turma</option>
              {selectedClass.tipo && !TIPOS_TURMA.includes(selectedClass.tipo) && (
                <option value={selectedClass.tipo}>{selectedClass.tipo}</option>
              )}
              {TIPOS_TURMA.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
            </select>
            <label className="modal-field-label" htmlFor="class-edit-professor">Professor:</label>
            <select id="class-edit-professor" className="modal-form-control" value={selectedClass.professorId ?? ''} onChange={(event) => {
              const professorId = Number(event.target.value) || '';
              const professor = professores.find((item) => String(item.id) === String(professorId));
              const horariosPermitidos = new Set(
                horarios
                  .filter((horario) => horarioPodeSerAlocado(horario, professor, selectedClass.id))
                  .map((horario) => String(horario.id))
              );
              setSelectedClass((turma) => ({ ...turma, professorId }));
              setHorariosEdicaoSelecionados((atual) =>
                atual.filter((id) => horariosPermitidos.has(String(id)))
              );
            }}>
              <option value="">Selecione um professor</option>
              {selectedClass.professorId && !professores.some(
                (professor) => String(professor.id) === String(selectedClass.professorId)
              ) && (
                <option value={selectedClass.professorId}>
                  {selectedClass.nomeProfessor || selectedClass.professor?.nome || 'Professor atual'}
                </option>
              )}
              {professores.map((professor) => <option key={professor.id} value={professor.id}>{professor.nome}</option>)}
            </select>
            {professoresError && <p className="classes-load-error">{professoresError}</p>}
            <div className="class-selected-schedule">
              <span className="class-selected-schedule-title">Selecionados</span>
              <div className="class-selected-schedule-item">
                <strong>Professor alocado</strong>
                <span>{professorEdicao?.nome || 'Nenhum professor selecionado'}</span>
              </div>
              {horariosEdicaoSelecionados.length > 0 ? horariosDisponiveisEdicao.filter((horario) => horariosEdicaoSelecionados.includes(horario.id)).sort(ordenarHorarios).map((horario) => (
                <div key={horario.id} className="class-selected-schedule-item"><strong>{normalizarDia(horario.diaSemana)}</strong><span>{normalizarHora(horario.horaInicio)} - {normalizarHora(horario.horaFim)}</span></div>
              )) : <span className="class-selected-schedule-empty">Nenhum horário selecionado</span>}
            </div>
          </div>
          <div className="class-schedule class-schedule-panel">
            <p className="class-schedule-instruction">
              {professorEdicao
                ? `Disponibilidade de ${professorEdicao.nome}. Selecione os horários da turma.`
                : 'Selecione um professor para ver a disponibilidade de horários.'}
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
                getSlot={(dia, hora) => (horariosPorSlotEdicao[`${dia}-${hora}`] || [])[0]}
                renderSlot={({ slot: horario, day, hour, key }) => {
                  const opcoes = horariosPorSlotEdicao[`${day}-${hour}`] || [];
                  const selecionado = opcoes.some((item) => horariosEdicaoSelecionados.includes(item.id));
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`class-slot-cell ${horario ? 'filled' : 'empty'} ${selecionado ? 'selected' : ''}`}
                      onClick={() => horario && setHorariosEdicaoSelecionados((atual) => atual.includes(horario.id) ? atual.filter((id) => id !== horario.id) : [...atual, horario.id])}
                      disabled={!horario}
                      aria-label={horario
                        ? `${normalizarDia(horario.diaSemana)} às ${normalizarHora(horario.horaInicio)}`
                        : 'Sem disponibilidade do professor'}
                    >
                    </button>
                  );
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

          <label className="modal-field-label" htmlFor="class-details-name">Nome:</label>
          <input id="class-details-name" className="modal-form-control" type="text" value={classDetails.nome} readOnly />

          <label className="modal-field-label" htmlFor="class-details-level">Nível:</label>
          <input id="class-details-level" className="modal-form-control" type="text" value={classDetails.nivel} readOnly />

          <label className="modal-field-label" htmlFor="class-details-type">Tipo:</label>
          <input id="class-details-type" className="modal-form-control" type="text" value={classDetails.tipo} readOnly />

          <label className="modal-field-label" htmlFor="class-details-capacity">Limite de alunos:</label>
          <input id="class-details-capacity" className="modal-form-control" type="text" value={classDetails.limiteAlunos} readOnly />

          <label className="modal-field-label" htmlFor="class-details-professor">Professor:</label>
          <input id="class-details-professor" className="modal-form-control" type="text" value={classDetails.nomeProfessor} readOnly />

          <span className="modal-field-label">Horário:</span>
          {agruparHorariosPorDia(classDetails.horarios).map((grupo, index) => (
            <input
              key={grupo.dia}
              id={`class-details-schedule-${index}`}
              className="modal-form-control"
              aria-label={`Horário ${grupo.dia}`}
              type="text"
              value={`${abreviarDia(grupo.dia)}: ${grupo.horarios.join(' · ')}`}
              readOnly
            />
          ))}
        </Modal>
      )}

    </>
  );
}
