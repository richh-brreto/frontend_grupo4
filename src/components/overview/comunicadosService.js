import axios from '../../utils/axiosConfig';

const BASE_URL = '/comunicados';

export const comunicadosService = {
  listar() {
    return axios.get(BASE_URL).then((res) => res.data);
  },

  criar(comunicado) {
    return axios.post(BASE_URL, comunicado).then((res) => res.data);
  },

  atualizar(id, comunicado) {
    return axios.put(`${BASE_URL}/${id}`, comunicado).then((res) => res.data);
  },

  excluir(id) {
    return axios.delete(`${BASE_URL}/${id}`);
  },
};
