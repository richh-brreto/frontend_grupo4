import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import Container from '../layout/Container';
import ScheduleGrid from '../schedule/ScheduleGrid';
import { alunosService } from '../students/components/alunosService';
import { professoresDisponiveisService } from './professoresDisponiveisService';
import { turmasDisponiveisService } from './turmasDisponiveisService';
import { contratosService } from './contratosService';
import { turmasService } from '../classes/turmasService';
import { ordenarHorarios } from '../../utils/ordenarHorarios';
import mostrarCodigoAcesso from '../../utils/mostrarCodigoAcesso';
import { useUsuarioAtual } from '../../utils/permissions';
import { contratoPertenceAoProfessor } from '../../utils/escopoProfessor';
import '../agenda/Agenda.css';
import './Contracts.css';



const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const HORARIOS_MODAL = Array.from({ length: 15 }, (_, index) => `${String(index + 7).padStart(2, '0')}:00`);

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

const normalizarNivel = (nivel) =>
  String(nivel || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

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
  const navigate = useNavigate();
  const { professorId, ehAdministrador } = useUsuarioAtual();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(
    () => Boolean(location.state?.openContractSetup)
  );
  const [alunoFixoNoCadastro, setAlunoFixoNoCadastro] = useState(
    () => location.state?.openContractSetup ? location.state?.alunoCadastro || null : null
  );
  const [selectedContract, setSelectedContract] = useState(null);

  const hoje = dataHoje();
  const [dataInicioContrato, setDataInicioContrato] = useState(hoje);
  const [dataFimContrato, setDataFimContrato] = useState(hoje);

  // horários selecionados no mini-calendário: [{ dia, hora, item }]
  const [selectedSchedule, setSelectedSchedule] = useState([]);
  const [editScheduleByType, setEditScheduleByType] = useState({});
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
  const [turmasDoSistema, setTurmasDoSistema] = useState([]);

  // Refs para detectar alterações não salvas nos modais
  const scheduleInicialRef = useRef([]);
  const contractFormInicialRef = useRef(null);
  const salvandoNovoContratoRef = useRef(false);
  const confirmandoSaidaRef = useRef(false);

  // Carregar alunos
  useEffect(() => {
    if (!ehAdministrador) {
      setAlunos([]);
      return;
    }

    const alunoDoCadastro = location.state?.openContractSetup
      ? location.state?.alunoCadastro
      : null;

    if (alunoDoCadastro) {
      setAlunos([alunoDoCadastro]);
      return;
    }

    alunosService.listarTodos().then((alunosCarregados) => {
      setAlunos(alunosCarregados);
    }).catch((erro) => {
      console.error('Erro ao carregar alunos:', erro);
    });
  }, [location.state, ehAdministrador]);

  // Carregar contratos da API
  useEffect(() => {
    carregarContratos();
  }, []);

  useEffect(() => {
    if (ehAdministrador) return;
    turmasService.listar()
      .then((dados) => setTurmasDoSistema(Array.isArray(dados) ? dados : dados?.content ?? []))
      .catch((erro) => console.error('Erro ao carregar turmas do professor:', erro));
  }, [ehAdministrador]);

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
  ) || alunoFixoNoCadastro;

  // Busca as duas listas quando o modal de agendamento abre
  useEffect(() => {
    if (!ehAdministrador || (!isScheduleModalOpen && !selectedContract)) return;

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
        const horariosDoContrato = selectedContract?.horarios
          || (selectedContract?.horario ? [selectedContract.horario] : []);
        if (horariosDoContrato.length) {
          const tipo = selectedContract.tipo === 'grupo' ? 'grupo' : 'individual';
          const itemId = tipo === 'grupo' ? selectedContract.turma?.id : selectedContract.professor?.id;
          const disponiveis = tipo === 'grupo' ? turmas : professores;
          const horariosEditados = horariosDoContrato.map((horario) => ({
            dia: normalizarDia(horario.diaSemana),
            hora: normalizarHora(horario.horaInicio),
            item: {
              tipo,
              id: itemId,
              horarioId: horario.id,
              horaInicio: normalizarHora(horario.horaInicio),
              horaFim: normalizarHora(horario.horaFim),
              nome: disponiveis.find((item) => item.id === itemId)?.nome || '',
              detalhe: tipo === 'individual'
                ? disponiveis.find((item) => item.id === itemId)?.email || ''
                : `${disponiveis.find((item) => item.id === itemId)?.nivel || ''} · ${disponiveis.find((item) => item.id === itemId)?.nomeProfessor || ''}`,
            }
          }));
          setSelectedSchedule(horariosEditados);
          setEditScheduleByType({
            individual: tipo === 'individual' ? horariosEditados : [],
            grupo: tipo === 'grupo' ? horariosEditados : [],
          });
        }
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
  }, [isScheduleModalOpen, alunoSelecionado, selectedContract, ehAdministrador]);

  // Monta o mapa dia+hora -> lista de opções (professor OU turma), dependendo do contractType
  const gradeDisponibilidade = useMemo(() => {
    const grade = {};

    const registrarHorario = (item, horario, tipo) => {
      const dia = normalizarDia(horario.diaSemana);
      const hora = normalizarHora(horario.horaInicio);
      const chave = `${dia}-${hora}`;

      if (!grade[chave]) grade[chave] = [];

      grade[chave].push({
        tipo, // 'individual' | 'grupo'
        horarioId: horario.id,
        horaInicio: normalizarHora(horario.horaInicio),
        horaFim: normalizarHora(horario.horaFim),
        id: item.id,
        nome: tipo === 'individual' ? item.nome : item.nome,
        detalhe:
          tipo === 'individual'
            ? item.email
            : `${item.nivel} · ${item.nomeProfessor}`
      });
    };

    if (contractType === 'individual') {
      professoresDisponiveis.forEach((professor) => {
        (professor.horarios || []).forEach((horario) => registrarHorario(professor, horario, 'individual'));
      });
    } else {
      const nivelAluno = normalizarNivel(alunoSelecionado?.nivel);
      const turmasDoNivel = turmasDisponiveis.filter(
        (turma) => nivelAluno && normalizarNivel(turma.nivel) === nivelAluno
      );

      turmasDoNivel.forEach((turma) => {
        (turma.horarios || []).forEach((horario) => registrarHorario(turma, horario, 'grupo'));
      });
    }

    return grade;
  }, [alunoSelecionado?.nivel, contractType, professoresDisponiveis, turmasDisponiveis]);

  const abrirModalAdicionar = () => {
    if (!ehAdministrador) return;
    if (salvandoNovoContratoRef.current) return;
    setAlunoFixoNoCadastro(null);
    setAlunoSelecionadoId('');
    setIsScheduleModalOpen(true);
  };

  const temAlteracoesNovoContrato = () => {
    return (
      alunoSelecionadoId !== '' ||
      contractType !== 'individual' ||
      dataInicioContrato !== dataHoje() ||
      dataFimContrato !== dataHoje() ||
      selectedSchedule.length > 0
    );
  };

  const concluirCadastroContrato = () => {
    setIsScheduleModalOpen(false);
    setAlunoFixoNoCadastro(null);
    setSelectedSchedule([]);
    setOpenSlot(null);
    setDataInicioContrato(dataHoje());
    setDataFimContrato(dataHoje());
    setAlunoSelecionadoId('');
    setContractType('individual');
    if (location.state?.openContractSetup) {
      navigate(location.pathname, { replace: true, state: null });
    }
  };

  const fecharModalAgendamento = async () => {
    if (salvandoNovoContratoRef.current || confirmandoSaidaRef.current) return;
    confirmandoSaidaRef.current = true;
    try {
      if (alunoFixoNoCadastro || temAlteracoesNovoContrato()) {
        const resultado = await Swal.fire({
          icon: 'warning',
          title: alunoFixoNoCadastro ? 'Sair sem criar o contrato?' : 'Alterações não salvas',
          text: alunoFixoNoCadastro
            ? 'O aluno já foi criado. Deseja concluir o cadastro sem criar um contrato?'
            : 'Você tem alterações não salvas. Deseja realmente sair sem salvar?',
          showCancelButton: true,
          confirmButtonText: alunoFixoNoCadastro ? 'Sim, concluir sem contrato' : 'Sim, sair sem salvar',
          cancelButtonText: 'Continuar cadastro',
          confirmButtonColor: '#b91c1c',
          cancelButtonColor: '#64748b'
        });
        if (!resultado.isConfirmed) return;
      }
      const alunoCriado = alunoFixoNoCadastro;
      concluirCadastroContrato();
      if (alunoCriado) {
        await mostrarCodigoAcesso({ ...alunoCriado, titulo: 'Aluno criado!' });
      }
    } finally {
      confirmandoSaidaRef.current = false;
    }
  };

  const salvarNovoContrato = async () => {
    if (salvandoNovoContratoRef.current || confirmandoSaidaRef.current) return;
    if (!alunoSelecionado || selectedSchedule.length === 0) {
      await Swal.fire({ icon: 'error', title: 'Dados incompletos', text: 'Por favor, selecione um aluno e um horário.', confirmButtonColor: '#0f1f3f' });
      return;
    }

    if (!dataInicioContrato || !dataFimContrato) {
      await Swal.fire({ icon: 'error', title: 'Dados incompletos', text: 'Por favor, preencha as datas de início e fim do contrato.', confirmButtonColor: '#0f1f3f' });
      return;
    }

    if (dataFimContrato < dataInicioContrato) {
      await Swal.fire({ icon: 'error', title: 'Datas inválidas', text: 'A data de fim deve ser maior ou igual à data de início.', confirmButtonColor: '#0f1f3f' });
      return;
    }

    salvandoNovoContratoRef.current = true;
    setCarregandoOperacao(true);
    setIsScheduleModalOpen(false);
    try {
      // Payload de acordo com o contrato da API
      const novoContrato = {
        dataInicio: dataInicioContrato,
        dataFim: dataFimContrato,
        tipo: contractType === 'individual' ? 'individual' : 'grupo',
        alunoId: parseInt(alunoSelecionado.id),
        turmaId: 0,
        professorId: 0,
        horariosIds: selectedSchedule.map(({ item }) => parseInt(item.horarioId))
      };

      // Adicionar professor para contratos individuais ou turma para contratos em grupo
      if (contractType === 'individual') {
        novoContrato.professorId = parseInt(selectedSchedule[0].item.id);
      } else {
        novoContrato.turmaId = parseInt(selectedSchedule[0].item.id);
      }

      console.log('Enviando contrato:', novoContrato);

      const contratoInfo = await contratosService.criar(novoContrato);
      
      console.log('Contrato criado:', contratoInfo);
      
      // Recarregar a lista de contratos
      await carregarContratos();
      
      const alunoCriado = alunoFixoNoCadastro;
      concluirCadastroContrato();
      if (alunoCriado) {
        await mostrarCodigoAcesso({ ...alunoCriado, titulo: 'Aluno e contrato criados!' });
      } else {
        await Swal.fire({ icon: 'success', title: 'Contrato criado!', text: 'O contrato foi cadastrado com sucesso.', confirmButtonColor: '#0f1f3f' });
      }
    } catch (erro) {
      console.error('Erro ao criar contrato:', erro.response?.data || erro.message);
      setIsScheduleModalOpen(true);
      await Swal.fire({ icon: 'error', title: 'Não foi possível cadastrar', text: erro.response?.data?.message || erro.message || 'Tente novamente', confirmButtonColor: '#0f1f3f' });
    } finally {
      salvandoNovoContratoRef.current = false;
      setCarregandoOperacao(false);
    }
  };

  const trocarTipoContrato = (tipo) => {
    if (selectedContract) {
      setEditScheduleByType((atual) => ({
        ...atual,
        [contractType]: selectedSchedule,
      }));
      setSelectedSchedule(editScheduleByType[tipo] || []);
    } else {
      setSelectedSchedule([]);
    }
    setContractType(tipo);
    setOpenSlot(null);
  };

  const trocarAluno = (event) => {
    setAlunoSelecionadoId(event.target.value);
    setSelectedSchedule([]);
    setOpenSlot(null);
  };

  const selecionarOpcaoSlot = (dia, hora, opcao) => {
    setSelectedSchedule((atual) => {
      const indice = atual.findIndex((selecionado) => selecionado.item.horarioId === opcao.horarioId);
      if (indice >= 0) return atual.filter((_, itemIndex) => itemIndex !== indice);
      return [...atual, { dia, hora, item: opcao }];
    });
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
    if (!ehAdministrador) return;
    const contratoCompleto = {
      ...contrato,
      turma: contrato.turma ? { ...contrato.turma } : null,
      professor: contrato.professor ? { ...contrato.professor } : null,
      aluno: contrato.aluno ? { ...contrato.aluno } : {}
    };
    setSelectedContract(contratoCompleto);
    setAlunoSelecionadoId(String(contrato.aluno?.id || ''));
    setContractType(contrato.tipo === 'grupo' ? 'grupo' : 'individual');
    setDataInicioContrato(contrato.dataInicio || hoje);
    setDataFimContrato(contrato.dataFim || hoje);
    setSelectedSchedule([]);
    setEditScheduleByType({});
    setOpenSlot(null);

    // Store initial values for unsaved changes detection
    contractFormInicialRef.current = {
      alunoSelecionadoId: String(contrato.aluno?.id || ''),
      contractType: contrato.tipo === 'grupo' ? 'grupo' : 'individual',
      dataInicioContrato: contrato.dataInicio || hoje,
      dataFimContrato: contrato.dataFim || hoje,
      selectedSchedule: [...selectedSchedule]
    };
  };

  const temAlteracoesEdicaoContrato = () => {
    if (!contractFormInicialRef.current || !selectedContract) return false;
    const inicial = contractFormInicialRef.current;
    return (
      alunoSelecionadoId !== inicial.alunoSelecionadoId ||
      contractType !== inicial.contractType ||
      dataInicioContrato !== inicial.dataInicioContrato ||
      dataFimContrato !== inicial.dataFimContrato ||
      JSON.stringify([...selectedSchedule].sort((a,b) => a.item.horarioId - b.item.horarioId)) !== 
      JSON.stringify([...inicial.selectedSchedule].sort((a,b) => a.item.horarioId - b.item.horarioId))
    );
  };

  const fecharModalEdicao = async () => {
    if (temAlteracoesEdicaoContrato()) {
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
    setSelectedContract(null);
    setSelectedSchedule([]);
    setEditScheduleByType({});
    setOpenSlot(null);
    contractFormInicialRef.current = null;
  };

  const salvarEdicao = async () => {
    if (!selectedContract.id) return;

    const camposInvalidos = [];
    if (!alunoSelecionadoId) camposInvalidos.push('aluno');
    if (!dataInicioContrato) camposInvalidos.push('data de início');
    if (!dataFimContrato) camposInvalidos.push('data de fim');
    if (dataFimContrato < dataInicioContrato) camposInvalidos.push('data de fim posterior ou igual à data de início');
    if (selectedSchedule.length === 0) camposInvalidos.push('horários');
    if (camposInvalidos.length > 0) {
      const mensagem = `Verifique os seguintes campos: ${camposInvalidos.join(', ').replace(/, ([^,]*)$/, ' e $1')}.`;
      await Swal.fire({ icon: 'error', title: 'Dados inválidos', text: mensagem, confirmButtonColor: '#0f1f3f' });
      return;
    }

    setCarregandoOperacao(true);
    try {
      const itemSelecionado = selectedSchedule[0].item;
      const contratoAtualizado = await contratosService.atualizar(selectedContract.id, {
        dataInicio: dataInicioContrato,
        dataFim: dataFimContrato,
        tipo: contractType,
        alunoId: parseInt(alunoSelecionadoId),
        turmaId: contractType === 'grupo' ? parseInt(itemSelecionado.id) : 0,
        professorId: contractType === 'individual' ? parseInt(itemSelecionado.id) : 0,
        horariosIds: selectedSchedule.map(({ item }) => parseInt(item.horarioId))
      });
      setContratos((items) => items.map((item) => item.id === contratoAtualizado.id ? contratoAtualizado : item));
      setSelectedContract(null);
      setSelectedSchedule([]);
      setEditScheduleByType({});
      setOpenSlot(null);
      contractFormInicialRef.current = null;
      await Swal.fire({ icon: 'success', title: 'Contrato atualizado!', text: 'As alterações foram salvas com sucesso.', confirmButtonColor: '#0f1f3f' });
    } catch (erro) {
      console.error('Erro ao atualizar contrato:', erro);
      await Swal.fire({ icon: 'error', title: 'Não foi possível salvar', text: erro.response?.data?.message || erro.message || 'Tente novamente.', confirmButtonColor: '#0f1f3f' });
    } finally {
      setCarregandoOperacao(false);
    }
  };

  const excluirContrato = async () => {
    if (!selectedContract?.id) return;

    const resultado = await Swal.fire({ icon: 'warning', title: 'Excluir contrato?', text: `Tem certeza que deseja excluir o contrato do aluno "${selectedContract.aluno?.nome || 'selecionado'}"? Essa ação não pode ser desfeita.`, showCancelButton: true, confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar', confirmButtonColor: '#b91c1c', cancelButtonColor: '#64748b' });
    if (!resultado.isConfirmed) return;

    setCarregandoOperacao(true);
    try {
      await contratosService.deletar(selectedContract.id);
      setContratos((items) => items.filter((item) => item.id !== selectedContract.id));
      fecharModalEdicao();
      await Swal.fire({ icon: 'success', title: 'Contrato excluído!', text: 'O contrato foi removido com sucesso.', confirmButtonColor: '#0f1f3f' });
    } catch (erro) {
      console.error('Erro ao deletar contrato:', erro);
      await Swal.fire({ icon: 'error', title: 'Não foi possível excluir', text: erro.response?.data?.message || erro.message || 'Tente novamente.', confirmButtonColor: '#0f1f3f' });
    } finally {
      setCarregandoOperacao(false);
    }
  };

  const contratosFiltrados = contratos
    .filter((contrato) => ehAdministrador
      || contratoPertenceAoProfessor(contrato, professorId, turmasDoSistema))
    .filter((contrato) => contractFilter === 'ativos'
      ? contratoEhAtivo(contrato)
      : !contratoEhAtivo(contrato));

  return (
    <>
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div>
              <h1>Contratos</h1>
            </div>
            <ButtonContainer>
              <div className="filter-segment" role="group" aria-label="Filtrar contratos por status">
                <Button
                  variant={contractFilter === 'ativos' ? 'primary' : 'secondary'}
                  aria-pressed={contractFilter === 'ativos'}
                  onClick={() => setContractFilter('ativos')}
                >
                  Ativos
                </Button>
                <Button
                  variant={contractFilter === 'inativos' ? 'primary' : 'secondary'}
                  aria-pressed={contractFilter === 'inativos'}
                  onClick={() => setContractFilter('inativos')}
                >
                  Inativos
                </Button>
              </div>
              {ehAdministrador && (
                <Button variant="primary" onClick={abrirModalAdicionar} disabled={carregandoOperacao}>Adicionar Contrato</Button>
              )}
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
                    {ehAdministrador && (
                      <Button active onClick={() => abrirModalEdicao(contrato)}>Editar</Button>
                    )}
                  </ButtonContainer>
                </article>
              )}
            />
            )}
          </div>
        </div>

      {ehAdministrador && isScheduleModalOpen && (
        <Modal
          title="Configurar contrato"
          onClose={fecharModalAgendamento}
          onSave={salvarNovoContrato}
          saveLabel="Salvar"
          className="contract-create-modal"
        >
          <div className="contract-form-panel">
          <label htmlFor="contract-student">Aluno:</label>
          {alunoFixoNoCadastro ? (
            <input
              id="contract-student"
              className="contract-student-select modal-form-control"
              type="text"
              value={alunoSelecionado?.nome || ''}
              readOnly
            />
          ) : (
            <select
              id="contract-student"
              className="contract-student-select modal-form-control"
              value={alunoSelecionadoId}
              onChange={trocarAluno}
            >
              <option value="">Selecione um aluno</option>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome}
                </option>
              ))}
            </select>
          )}

          {alunoSelecionado?.nome && (
            <p className="contract-selected-student">
              Aluno selecionado: <strong>{alunoSelecionado.nome}</strong>
            </p>
          )}

          <span className="contract-type-label">Tipo de aula</span>
          <div className="contract-type-options">
            <label className={`contract-option ${contractType === 'individual' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="contractType"
                value="individual"
                checked={contractType === 'individual'}
                onChange={() => trocarTipoContrato('individual')}
              />
              <span>Individual</span>
            </label>

            <label className={`contract-option ${contractType === 'grupo' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="contractType"
                value="grupo"
                checked={contractType === 'grupo'}
                onChange={() => trocarTipoContrato('grupo')}
              />
              <span>Em grupo</span>
            </label>
          </div>

          <div className="contract-dates">
            <label className="contract-date-field">
              <span>Data início:</span>
              <input
                className="modal-form-control"
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
                className="modal-form-control"
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

          <div className="contract-selected-schedule">
            <span className="contract-selected-schedule-title">Selecionados</span>
            {selectedSchedule.length > 0 ? (
              <div className="contract-selected-schedule-list">
                {[...selectedSchedule].sort(ordenarHorarios).map(({ dia, item }) => (
                  <div key={item.horarioId} className="contract-selected-schedule-item">
                    <strong>{dia}</strong>
                    <span>{item.horaInicio} - {item.horaFim}</span>
                    <small>{item.nome}</small>
                  </div>
                ))}
              </div>
            ) : (
              <span className="contract-selected-schedule-empty">Nenhum horário selecionado</span>
            )}
          </div>
          </div>

          <div className="contract-schedule-panel mini-schedule">
            <p className="contract-schedule-instruction">
              Clique nos blocos para marcar os horários em que o aluno terá aulas.
            </p>
            <div className="contract-schedule-scroll">
              <ScheduleGrid
                className="mini-week-grid"
                hoursHeaderClassName="mini-hours-header"
                dayHeaderClassName="mini-day-header"
                hourLabelClassName="mini-hours-column"
                hourItemClassName="mini-hour-label"
                dayColumnClassName="mini-day-column"
                days={DIAS_SEMANA}
                hours={HORARIOS_MODAL.map((hora) => ({ value: hora, label: hora, key: `hora-${hora}` }))}
                getSlot={(dia, hora) => gradeDisponibilidade[`${dia}-${hora}`] || []}
                renderSlot={({ slot: opcoes, day: dia, hour: hora, key }) => {
                  const temOpcoes = opcoes.length > 0;
                  const isSelected = selectedSchedule.some(
                    (selecionado) => selecionado.dia === dia && selecionado.hora === hora
                  );
                  const estaAberto = openSlot?.dia === dia && openSlot?.hora === hora;

                  return (
                    <div key={key} className="mini-slot-wrapper">
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
                              <strong>{opcoes.length} opções</strong>
                            </>
                          )
                        ) : null}
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
                }}
              />
            </div>
            <p className="contract-schedule-counter">
              {selectedSchedule.length} horário(s) selecionado(s)
            </p>
          </div>
        </Modal>
      )}

      {ehAdministrador && selectedContract && (
        <Modal
          title="Editar Contrato"
          onClose={fecharModalEdicao}
          onSave={salvarEdicao}
          onDelete={excluirContrato}
          className="contract-create-modal"
        >
          <div className="contract-form-panel">
            <label htmlFor="edit-contract-student">Aluno:</label>
            <input
              id="edit-contract-student"
              className="modal-form-control"
              type="text"
              value={selectedContract.aluno?.nome || ''}
              readOnly
            />

            <span className="contract-type-label">Tipo de aula</span>
            <div className="contract-type-options">
              {['individual', 'grupo'].map((tipo) => (
                <label key={tipo} className={`contract-option ${contractType === tipo ? 'selected' : ''}`}>
                  <input type="radio" name="editContractType" value={tipo} checked={contractType === tipo} onChange={() => trocarTipoContrato(tipo)} />
                  <span>{tipo === 'individual' ? 'Individual' : 'Em grupo'}</span>
                </label>
              ))}
            </div>

            <div className="contract-dates">
              <label className="contract-date-field">
                <span>Data início:</span>
                <input className="modal-form-control" type="date" value={dataInicioContrato} min={dataHoje()} onChange={(event) => setDataInicioContrato(event.target.value)} />
              </label>
              <label className="contract-date-field">
                <span>Data fim:</span>
                <input className="modal-form-control" type="date" value={dataFimContrato} min={dataInicioContrato} onChange={(event) => setDataFimContrato(event.target.value)} />
              </label>
            </div>

            {carregandoDisponibilidade && <p className="contract-disponibilidade-status">Carregando disponibilidade...</p>}
            {erroDisponibilidade && <p className="contract-disponibilidade-status contract-disponibilidade-erro">{erroDisponibilidade}</p>}
            <div className="contract-selected-schedule">
              <span className="contract-selected-schedule-title">Selecionados</span>
              {selectedSchedule.length > 0 ? selectedSchedule.map(({ dia, item }) => (
                <div key={item.horarioId} className="contract-selected-schedule-item">
                  <strong>{dia}</strong><span>{item.horaInicio} - {item.horaFim}</span><small>{item.nome}</small>
                </div>
              )) : <span className="contract-selected-schedule-empty">Nenhum horário selecionado</span>}
            </div>
          </div>

          <div className="contract-schedule-panel mini-schedule">
            <p className="contract-schedule-instruction">Clique nos blocos para marcar os horários em que o aluno terá aulas.</p>
            <div className="contract-schedule-scroll">
              <ScheduleGrid
                className="mini-week-grid"
                hoursHeaderClassName="mini-hours-header"
                dayHeaderClassName="mini-day-header"
                hourLabelClassName="mini-hours-column"
                hourItemClassName="mini-hour-label"
                dayColumnClassName="mini-day-column"
                days={DIAS_SEMANA}
                hours={HORARIOS_MODAL.map((hora) => ({ value: hora, label: hora, key: `hora-${hora}` }))}
                getSlot={(dia, hora) => gradeDisponibilidade[`${dia}-${hora}`] || []}
                renderSlot={({ slot: opcoes, day: dia, hour: hora, key }) => {
                  const temOpcoes = opcoes.length > 0;
                  const isSelected = selectedSchedule.some((selecionado) => selecionado.dia === dia && selecionado.hora === hora);
                  const estaAberto = openSlot?.dia === dia && openSlot?.hora === hora;
                  return (
                    <div key={key} className="mini-slot-wrapper">
                      <button type="button" className={`mini-slot-cell ${temOpcoes ? 'filled' : 'empty'} ${isSelected ? 'selected' : ''}`} onClick={() => clicarSlot(dia, hora, opcoes)} disabled={!temOpcoes}>
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
                              <strong>{opcoes.length} opções</strong>
                            </>
                          )
                        ) : null}
                      </button>
                      {estaAberto && <div className="mini-slot-options">{opcoes.map((opcao) => (
                        <button key={`${opcao.tipo}-${opcao.id}-${opcao.horarioId}`} type="button" onClick={() => selecionarOpcaoSlot(dia, hora, opcao)}>
                          {opcao.nome} ({opcao.horaInicio} - {opcao.horaFim})
                        </button>
                      ))}</div>}
                    </div>
                  );
                }}
              />
            </div>
            <p className="contract-schedule-counter">{selectedSchedule.length} horário(s) selecionado(s)</p>
          </div>
        </Modal>
      )}

    </>
  );
}