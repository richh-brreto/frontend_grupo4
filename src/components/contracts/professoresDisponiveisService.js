import axios from '../../utils/axiosConfig';

const BASE_URL = '/professores/disponiveis/horarios';

export const professoresDisponiveisService = {
  listar(payload = {}) {
    return axios.post(BASE_URL, payload).then((res) => res.data);
  },
};
