import axios from '../../utils/axiosConfig';

const BASE_URL = '/contratos';

export const contratosService = {
  criar(payload) {
    return axios.post(BASE_URL, payload).then((res) => res.data);
  },
};