import axios from '../../utils/axiosConfig';
import { turmasService } from '../classes/turmasService';

const BASE_URL = '/aulas';

// Evento de turma: o backend localiza as aulas pela turma + dia/horário atuais.
const encontroDaTurma = (evento) => ({
  data: evento.data,
  horaInicio: evento.horaInicio,
  horaFim: evento.horaFim
});

export const aulasService = {
  async listarPorPeriodo(inicio, fim) {
    const { data: aulas } = await axios.get(BASE_URL, { params: { inicio, fim } });
    const faltaProfessorDaTurma = (aula) => aula.turmaId && !aula.professor?.trim();
    if (!aulas.some(faltaProfessorDaTurma)) return aulas;

    const resposta = await turmasService.listar();
    const turmas = Array.isArray(resposta) ? resposta : resposta.content;
    if (!Array.isArray(turmas)) {
      throw new Error('Não foi possível consultar os professores das turmas.');
    }
    const turmasPorId = new Map(turmas.map((turma) => [String(turma.id), turma]));

    return aulas.map((aula) => {
      if (!faltaProfessorDaTurma(aula)) return aula;
      const professor = turmasPorId.get(String(aula.turmaId))?.nomeProfessor;
      return { ...aula, professor: professor?.trim() || null };
    });
  },

  criar(evento) {
    return axios.post(BASE_URL, evento).then((res) => res.data);
  },

  cancelar(evento, motivo) {
    if (evento.turmaId) {
      return axios
        .patch(`${BASE_URL}/turma/${evento.turmaId}/cancelar`, { ...encontroDaTurma(evento), motivo })
        .then((res) => res.data);
    }
    return axios.patch(`${BASE_URL}/${evento.aulaIds[0]}/cancelar`, { motivo }).then((res) => res.data);
  },

  remarcar(evento, remarcacao) {
    if (evento.turmaId) {
      return axios
        .patch(`${BASE_URL}/turma/${evento.turmaId}/remarcar`, { ...encontroDaTurma(evento), ...remarcacao })
        .then((res) => res.data);
    }
    return axios.patch(`${BASE_URL}/${evento.aulaIds[0]}/remarcar`, remarcacao).then((res) => res.data);
  },

  registrarAusencias(evento, alunosAusentesIds) {
    if (evento.turmaId) {
      return axios
        .patch(`${BASE_URL}/turma/${evento.turmaId}/presenca`, { ...encontroDaTurma(evento), alunosAusentesIds })
        .then((res) => res.data);
    }
    const ausente = alunosAusentesIds.includes(evento.participantes[0]?.alunoId);
    return axios.patch(`${BASE_URL}/${evento.aulaIds[0]}/presenca`, { presenca: !ausente }).then((res) => res.data);
  },
};
