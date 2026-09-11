import axios from '../../utils/axiosConfig';

const BASE_URL = '/turmas';

export const turmasService = {
  listar() {
    return axios.get(BASE_URL).then((res) => res.data);
  },

  listarDisponiveis() {
    return axios.get(`${BASE_URL}/disponiveis`).then((res) => res.data);
  },

  criar(turma) {
    return axios.post(BASE_URL, turma).then((res) => res.data);
  },

  atualizar(id, turma) {
    return axios.put(`${BASE_URL}/${id}`, turma).then((res) => res.data);
  },
};