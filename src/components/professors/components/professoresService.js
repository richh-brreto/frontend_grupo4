import axios from '../../../utils/axiosConfig';

const BASE_URL = '/professores';

export const professoresService = {
  listar() {
    return axios.get(BASE_URL).then((res) => res.data);
  },

  criar(professor) {
    return axios.post(BASE_URL, professor).then((res) => res.data);
  },

  atualizar(id, professor) {
    return axios.put(`${BASE_URL}/${id}`, professor).then((res) => res.data);
  },

  excluir(id) {
    return axios.delete(`${BASE_URL}/${id}`);
  },

  reativar(id) {
    return axios.patch(`${BASE_URL}/${id}/reativar`).then((res) => res.data);
  },
};
