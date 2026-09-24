import axios from '../../utils/axiosConfig';

const BASE_URL = '/aulas';

// Evento de turma: o backend localiza as aulas pela turma + dia/horário atuais.
const encontroDaTurma = (evento) => ({
  data: evento.data,
  horaInicio: evento.horaInicio,
  horaFim: evento.horaFim
});

export const aulasService = {
  listarPorPeriodo(inicio, fim) {
    return axios.get(BASE_URL, { params: { inicio, fim } }).then((res) => res.data);
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
