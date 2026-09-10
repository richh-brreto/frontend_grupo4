import axios from '../../utils/axiosConfig';

const BASE_URL = '/turmas/disponiveis';

export const turmasDisponiveisService = {
  listar() {
    return axios.get(BASE_URL).then((res) => res.data);
  },
};
