import axios from '../../utils/axiosConfig';

const BASE_URL = '/contratos';

export const contratosService = {
  listar() {
    return axios.get(BASE_URL).then((res) => res.data);
  },

  obter(id) {
    return axios.get(`${BASE_URL}/${id}`).then((res) => res.data);
  },

  criar(payload) {
    return axios.post(BASE_URL, payload).then((res) => res.data);
  },

  atualizar(id, payload) {
    return axios.put(`${BASE_URL}/${id}`, payload).then((res) => res.data);
  },

  deletar(id) {
    return axios.delete(`${BASE_URL}/${id}`).then((res) => res.data);
  }
};