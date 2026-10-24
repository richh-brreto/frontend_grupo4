import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import AulaDetailModal from './AulaDetailModal';
import RemarcarScheduleSelector from './RemarcarScheduleSelector';
import { aulasService } from './aulasService';
import { professoresService } from '../professors/components/professoresService';
import { useItensMenu } from '../../utils/menuItems';
import { usePermissoes } from '../../utils/permissions';
import './Agenda.css';



const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const HORA_INICIO = 7;
const HORA_FIM = 23;
const HORAS = Array.from({ length: HORA_FIM - HORA_INICIO }, (_, i) => `${String(HORA_INICIO + i).padStart(2, '0')}:00`);
const ALTURA_HORA = 65; // pixels por hora
const ADICIONAR_EVENTOS_HABILITADO = false;

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
        professor: aula.professor?.trim() || (aula.turmaId ? null : 'Sem professor')
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

const renderizarTextoAula = (aula) => (
  <>
    <div className="evento-label">
      {aula.turmaId ? aula.conta : 'Individual'}
      {aula.professor && ` · Prof. ${aula.professor}`}
    </div>
    <div className="evento-label">
      {aula.turmaId ? aula.turma : `Aluno(a) ${aula.conta}`}
    </div>
  </>
);

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
  // Itens do menu sao filtrados pelas telas liberadas no cadastro do professor
  const itensMenu = useItensMenu('/aulas');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAusenciaModalOpen, setIsAusenciaModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedAula, setSelectedAula] = useState(null);
  const [alunosAusentes, setAlunosAusentes] = useState([]);
  const [remarcacao, setRemarcacao] = useState({ novaData: '', novaHoraInicio: '', novaHoraFim: '', motivo: '', horarioSelecionado: null });
  const salvandoRemarcacaoRef = useRef(false);
  const [versaoAulas, setVersaoAulas] = useState(0);
  const [expandedSlots, setExpandedSlots] = useState(new Set());
  const [novoEvento, setNovoEvento] = useState({ nome: '', descricao: '', professorId: '', horaInicio: '07:00', horaFim: '08:00' });
  const [professoresDisponiveis, setProfessoresDisponiveis] = useState([]);
  // Quem enxerga a agenda é quem tem a tela liberada (o menu já protege a rota).
  const { podeAcessar, carregando: carregandoPermissoes } = usePermissoes();
  const podeGerenciar = podeAcessar('TELA_AGENDA');

  const temAlteracoesNovoEvento = () => {
    return novoEvento.nome.trim() !== '' || novoEvento.descricao.trim() !== '' || novoEvento.professorId !== '';
  };

  const abrirModalAdicionar = (dia) => {
    setSelectedDay(dia);
    setNovoEvento({ nome: '', descricao: '', professorId: '', horaInicio: '07:00', horaFim: '08:00' });
    
    professoresService.listar()
      .then((data) => setProfessoresDisponiveis((data || []).filter(p => p.ativo !== false)))
      .catch(() => setProfessoresDisponiveis([]));
    
    setIsAddModalOpen(true);
  };

  const fecharModalAdicionar = async () => {
    if (temAlteracoesNovoEvento()) {
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
    setSelectedDay(null);
    setNovoEvento({ nome: '', descricao: '', professorId: '', horaInicio: '07:00', horaFim: '08:00' });
    setProfessoresDisponiveis([]);
  };

  const abrirModalEditar = (aula) => {
    if (salvandoRemarcacaoRef.current) return;
    setSelectedAula(aula);
    setIsEditModalOpen(true);
  };

  const fecharModalEditar = () => {
    setIsEditModalOpen(false);
    setSelectedAula(null);
  };

  const abrirModalDetalhe = (aula) => {
    if (salvandoRemarcacaoRef.current) return;
    setSelectedAula(aula);
    setIsDetailModalOpen(true);
  };

  const fecharModalDetalhe = () => {
    setIsDetailModalOpen(false);
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

  const temAlteracoesRemarcacao = () => {
    return remarcacao.motivo.trim() !== '' || remarcacao.horarioSelecionado !== null;
  };

  const abrirModalRemarcar = () => {
    if (salvandoRemarcacaoRef.current) return;
    setRemarcacao({
      novaData: selectedAula.data,
      novaHoraInicio: selectedAula.horaInicio,
      novaHoraFim: selectedAula.horaFim,
      motivo: '',
      horarioSelecionado: null
    });
    setIsEditModalOpen(false);
    setIsRescheduleModalOpen(true);
  };

  const fecharModalRemarcar = async () => {
    if (salvandoRemarcacaoRef.current) return;
    if (temAlteracoesRemarcacao()) {
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
    setIsRescheduleModalOpen(false);
    setSelectedAula(null);
    setRemarcacao({ novaData: '', novaHoraInicio: '', novaHoraFim: '', motivo: '', horarioSelecionado: null });
  };

  const atualizarRemarcacao = (campo, valor) => {
    setRemarcacao(atual => ({ ...atual, [campo]: valor }));
  };

  const selecionarHorarioRemarcacao = async (horario) => {
    const semana = obterDiasSemana(new Date(`${selectedAula.data}T12:00:00`));
    const diaSelecionado = semana.find(dia => dia.diaSemana === horario.diaSemana.replace('-feira', ''));
    if (!diaSelecionado) {
      await mostrarErro(new Error('Não foi possível identificar a data do horário selecionado.'), 'Horário inválido');
      return;
    }
    setRemarcacao(atual => ({
      ...atual,
      novaData: diaSelecionado.data,
      horarioSelecionado: horario
    }));
  };

  const salvarNovoEvento = async () => {
    if (!selectedDay) return;

    const { nome, descricao, professorId, horaInicio, horaFim } = novoEvento;
    if (!nome.trim() || !horaInicio || !horaFim) {
      await Swal.fire({
        icon: 'warning',
        title: 'Preencha os dados',
        text: 'Informe o nome e os horários de início e fim.',
        confirmButtonColor: '#0f1f3f'
      });
      return;
    }
    if (horaInicio >= horaFim) {
      await Swal.fire({
        icon: 'warning',
        title: 'Horário inválido',
        text: 'A hora de início deve ser anterior à hora de fim.',
        confirmButtonColor: '#0f1f3f'
      });
      return;
    }

    try {
      const professorSelecionado = professoresDisponiveis.find(p => p.id === professorId);
      await aulasService.criar({
        data: selectedDay.data,
        horaInicio,
        horaFim,
        conta: nome,
        descricao,
        professorId,
        professor: professorSelecionado?.nome || 'Sem professor',
        turma: 'Individual',
        status: 'AGENDADA'
      });
      fecharModalAdicionar();
      recarregarAulas();
      await Swal.fire({
        icon: 'success',
        title: 'Evento adicionado!',
        text: 'O evento foi adicionado à agenda com sucesso.',
        confirmButtonColor: '#0f1f3f'
      });
    } catch (error) {
      await mostrarErro(error, 'Erro ao adicionar evento');
    }
  };

  const salvarRemarcacao = async () => {
    if (!selectedAula || salvandoRemarcacaoRef.current) return;

    const { novaData, horarioSelecionado, motivo } = remarcacao;
    if (!novaData) {
      await Swal.fire({
        icon: 'warning',
        title: 'Selecione uma data',
        text: 'Escolha a nova data para a aula.',
        confirmButtonColor: '#0f1f3f'
      });
      return;
    }
    if (!horarioSelecionado) {
      await Swal.fire({
        icon: 'warning',
        title: 'Selecione um horário',
        text: 'Escolha um horário disponível na grade para remarcar a aula.',
        confirmButtonColor: '#0f1f3f'
      });
      return;
    }

    salvandoRemarcacaoRef.current = true;
    setIsRescheduleModalOpen(false);
    try {
      await aulasService.remarcar(selectedAula, {
        novaData,
        novaHoraInicio: horarioSelecionado.horaInicio,
        novaHoraFim: horarioSelecionado.horaFim,
        motivo: motivo.trim() || null
      });
      setSelectedAula(null);
      setRemarcacao({ novaData: '', novaHoraInicio: '', novaHoraFim: '', motivo: '', horarioSelecionado: null });
      recarregarAulas();
      await Swal.fire({
        icon: 'success',
        title: 'Aula remarcada!',
        text: 'A aula foi remarcada com sucesso.',
        confirmButtonColor: '#0f1f3f'
      });
    } catch (error) {
      setIsRescheduleModalOpen(true);
      await mostrarErro(error, 'Erro ao remarcar');
    } finally {
      salvandoRemarcacaoRef.current = false;
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
          text: error.response?.data?.error || error.message || 'Não foi possível carregar as aulas.',
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

    const minutoInicio = (horaI - HORA_INICIO) * 60 + minutoI;
    const minutoFim = (horaF - HORA_INICIO) * 60 + minutoF;
    const duracao = minutoFim - minutoInicio;

    return {
      top: `${(minutoInicio / 60) * ALTURA_HORA + 4}px`,
      height: `${(duracao / 60) * ALTURA_HORA - 8}px`,
      minHeight: '38px'
    };
  };

  const aulasFiltradas = aulas.filter(aula => (
    (!filtros.dataInicio || aula.data >= filtros.dataInicio)
    && (!filtros.dataFim || aula.data <= filtros.dataFim)
    && (!filtros.conta || aula.conta.toLowerCase().includes(filtros.conta.toLowerCase()))
    && (!filtros.professor || aula.professor === filtros.professor)
  ));

  const professores = [...new Set(aulas.map(aula => aula.professor).filter(Boolean))];

  const atualizarFiltro = (campo, valor) => {
    setFiltros(filtrosAtuais => ({ ...filtrosAtuais, [campo]: valor }));
  };

  const limparFiltros = () => {
    setFiltros({ dataInicio: '', dataFim: '', conta: '', professor: '' });
  };

  const obterAulasPorDia = (dataDia) => aulasFiltradas.filter(aula => aula.data === dataDia);

  const alternarSlotExpandido = (dataDia, horaInicio, horaFim) => {
    const chave = `${dataDia}|${horaInicio}|${horaFim}`;
    setExpandedSlots(prev => {
      const novo = new Set(prev);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  };

  const slotExpandido = (dataDia, horaInicio, horaFim) => {
    return expandedSlots.has(`${dataDia}|${horaInicio}|${horaFim}`);
  };

  const obterAulasComPosicao = (dataDia) => {
    const aulasDia = obterAulasPorDia(dataDia).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    
    const slotsMap = new Map();
    aulasDia.forEach(aula => {
      const chave = `${aula.horaInicio}|${aula.horaFim}`;
      if (!slotsMap.has(chave)) slotsMap.set(chave, []);
      slotsMap.get(chave).push(aula);
    });

    const slotsOrdenados = Array.from(slotsMap.entries())
      .sort(([chaveA], [chaveB]) => chaveA.localeCompare(chaveB))
      .map(([chave, aulasNoSlot]) => {
        const [horaInicio, horaFim] = chave.split('|');
        const estilo = calcularEstiloEvento(horaInicio, horaFim);
        return { horaInicio, horaFim, aulas: aulasNoSlot, estilo };
      });

    const slotsComPosicao = [];
    slotsOrdenados.forEach(slot => {
      let coluna = 0;
      let maxColuna = 0;

      slotsComPosicao.forEach(item => {
        const temConflito = !(slot.horaFim <= item.slot.horaInicio || slot.horaInicio >= item.slot.horaFim);
        if (temConflito && item.coluna >= coluna) {
          coluna = item.coluna + 1;
        }
        maxColuna = Math.max(maxColuna, item.coluna);
      });

      slotsComPosicao.push({ slot, estilo: slot.estilo, coluna, numColunas: Math.max(coluna + 1, maxColuna + 1) });
    });

    const numColunasTotal = slotsComPosicao.length ? Math.max(...slotsComPosicao.map(item => item.coluna)) + 1 : 1;

    return slotsComPosicao.map(item => ({
      horaInicio: item.slot.horaInicio,
      horaFim: item.slot.horaFim,
      aulas: item.slot.aulas,
      estilo: item.estilo,
      coluna: item.coluna,
      numColunas: numColunasTotal,
      count: item.slot.aulas.length
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
        items={itensMenu}
        carregando={carregandoPermissoes}
      />

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div>
              <h1>Agenda - {MESES[diasSemana[0].mes - 1]}</h1>
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
                    <span>{dia.diaSemana.slice(0, 3)} - {dia.dia}</span>
                    {ADICIONAR_EVENTOS_HABILITADO && (
                      <Button onClick={() => abrirModalAdicionar(dia)}>+</Button>
                    )}
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
                        {obterAulasComPosicao(dia.data).map((slot, slotIdx) => {
                          const isExpanded = slotExpandido(dia.data, slot.horaInicio, slot.horaFim);
                          const primeiraAula = slot.aulas[0];
                          const isCancelada = slot.aulas.every(aula => aula.status === 'CANCELADA');
                          const slotId = `${dia.data}|${slot.horaInicio}|${slot.horaFim}`;
                          
                          return (
                            <div key={slotIdx} className="slot-container">
<div
                                 className={`evento ${isCancelada ? 'evento-cancelado' : ''} ${slot.count > 1 ? 'slot-multiplo' : ''}`.trim()}
                                 title={slot.count === 1 && isCancelada ? 'Aula cancelada' : undefined}
                                 style={{
                                   ...slot.estilo,
                                   width: `calc(100% / ${slot.numColunas} - 8px)`,
                                   left: `calc(100% / ${slot.numColunas} * ${slot.coluna} + 4px)`
                                 }}
                                onClick={(e) => {
                                  if (slot.count > 1) {
                                    e.stopPropagation();
                                    alternarSlotExpandido(dia.data, slot.horaInicio, slot.horaFim);
                                  } else {
                                    abrirModalDetalhe(primeiraAula);
                                  }
                                }}
                              >
                                {slot.count > 1
                                  ? <div className="evento-label">{slot.count} aulas</div>
                                  : renderizarTextoAula(primeiraAula)}
                                {slot.count > 1 && (
                                  <span className="slot-expand-icon">{isExpanded ? '▲' : '▼'}</span>
                                )}
                              </div>
                              
                              {isExpanded && slot.count > 1 && (
                                <div className="slot-expandido" style={{
                                  ...slot.estilo,
                                  top: `${parseFloat(slot.estilo.top) + parseFloat(slot.estilo.height) + 4}px`,
                                  width: `calc(100% / ${slot.numColunas} - 8px)`,
                                  left: `calc(100% / ${slot.numColunas} * ${slot.coluna} + 4px)`
                                }}>
                                  {slot.aulas.map((aula, aulaIdx) => (
                                    <div
                                      key={aulaIdx}
                                      className={`evento evento-expandido ${aula.status === 'CANCELADA' ? 'evento-cancelado' : ''}`}
                                      title={aula.status === 'CANCELADA' ? 'Aula cancelada' : undefined}
                                      onClick={() => abrirModalDetalhe(aula)}
                                    >
                                      {renderizarTextoAula(aula)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
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
          <input
            type="text"
            placeholder="Nome do evento"
            value={novoEvento.nome}
            onChange={(e) => setNovoEvento(prev => ({ ...prev, nome: e.target.value }))}
          />

          <label>Descrição</label>
          <input
            type="text"
            placeholder="Descrição"
            value={novoEvento.descricao}
            onChange={(e) => setNovoEvento(prev => ({ ...prev, descricao: e.target.value }))}
          />

          <label>Professor</label>
          <select
            value={novoEvento.professorId}
            onChange={(e) => setNovoEvento(prev => ({ ...prev, professorId: e.target.value }))}
          >
            <option value="">Selecione um professor</option>
            {professoresDisponiveis.map((professor) => (
              <option key={professor.id} value={professor.id}>{professor.nome}</option>
            ))}
          </select>

          {selectedDay && (
            <div className="evento-data-info">
              <label>Data</label>
              <input type="text" value={selectedDay.data.split('-').reverse().join('/')} readOnly />
            </div>
          )}

          <div className="evento-horarios">
            <div>
              <label>Hora de início</label>
              <div className="hora-select-group">
                <select
                  value={novoEvento.horaInicio.split(':')[0]}
                  onChange={(e) => setNovoEvento(prev => ({ ...prev, horaInicio: `${e.target.value}:${prev.horaInicio.split(':')[1]}` }))}
                >
                  {Array.from({ length: 15 }, (_, i) => i + 7).map((h) => (
                    <option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}</option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={novoEvento.horaInicio.split(':')[1]}
                  onChange={(e) => setNovoEvento(prev => ({ ...prev, horaInicio: `${prev.horaInicio.split(':')[0]}:${e.target.value}` }))}
                >
                  <option value="00">00</option>
                  <option value="30">30</option>
                </select>
              </div>
            </div>
            <div>
              <label>Hora de fim</label>
              <div className="hora-select-group">
                <select
                  value={novoEvento.horaFim.split(':')[0]}
                  onChange={(e) => setNovoEvento(prev => ({ ...prev, horaFim: `${e.target.value}:${prev.horaFim.split(':')[1]}` }))}
                >
                  {Array.from({ length: 16 }, (_, i) => i + 7).map((h) => (
                    <option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}</option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={novoEvento.horaFim.split(':')[1]}
                  onChange={(e) => setNovoEvento(prev => ({ ...prev, horaFim: `${prev.horaFim.split(':')[0]}:${e.target.value}` }))}
                >
                  <option value="00">00</option>
                  <option value="30">30</option>
                </select>
              </div>
            </div>
          </div>
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
          className="professor-create-modal"
        >
          <div className="professor-form-panel">
            <div className="remarcar-info-atual">
              <h4>Horário atual</h4>
              <p>{selectedAula.data.split('-').reverse().join('/')}, {selectedAula.horaInicio.slice(0, 5)} - {selectedAula.horaFim.slice(0, 5)}</p>
            </div>
            <div className="remarcar-info-atual">
              <h4>Turma/Aluno</h4>
              <p>{selectedAula.conta}</p>
            </div>
            <label htmlFor="nova-data">Nova data</label>
            <input
              id="nova-data"
              type="date"
              value={remarcacao.novaData}
              readOnly
            />
            <label htmlFor="motivo-remarcacao">Motivo (opcional)</label>
            <input
              id="motivo-remarcacao"
              type="text"
              placeholder="Motivo da remarcação"
              maxLength={500}
              value={remarcacao.motivo}
              onChange={event => atualizarRemarcacao('motivo', event.target.value)}
            />
          </div>
          <div className="professor-schedule-panel">
            <RemarcarScheduleSelector
              aulaAtual={selectedAula}
              horarioSelecionado={remarcacao.horarioSelecionado}
              onSelect={selecionarHorarioRemarcacao}
            />
          </div>
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

      {isDetailModalOpen && (
        <AulaDetailModal
          aula={selectedAula}
          onClose={fecharModalDetalhe}
          onEditar={abrirModalEditar}
          podeGerenciar={podeGerenciar}
        />
      )}

    </div>
  );
}
