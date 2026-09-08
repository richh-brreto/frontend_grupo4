
import axios from '../../utils/axiosConfig';

const BASE_URL = '/professores';

export const professoresService = {
  listarDisponiveis() {
    return axios.get(`${BASE_URL}/disponiveis`).then((res) => res.data);
  },
};