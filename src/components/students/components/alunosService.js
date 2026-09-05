import axios from '../../../utils/axiosConfig';

const BASE_URL = '/alunos';

export const alunosService = {
  listar() {
    return axios.get(BASE_URL).then((res) => res.data);
  },

  criar(aluno) {
    return axios.post(BASE_URL, aluno).then((res) => res.data);
  },

  atualizar(id, aluno) {
    return axios.put(`${BASE_URL}/${id}`, aluno).then((res) => res.data);
  },

  excluir(id) {
    return axios.delete(`${BASE_URL}/${id}`);
  },

  reativar(id) {
    return axios.patch(`${BASE_URL}/${id}/reativar`).then((res) => res.data);
  },

  inativar(id) {
    return axios.delete(`${BASE_URL}/${id}`);
  },
};
