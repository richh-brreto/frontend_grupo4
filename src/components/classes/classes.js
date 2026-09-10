import axios from '../../utils/axiosConfig';

const BASE_URL = '/turmas';

export const turmasService = {
  listarDisponiveis() {
    return axios.get(`${BASE_URL}/disponiveis`).then((res) => res.data);
  },
};