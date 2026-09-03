import axios from '../../../utils/axiosConfig';

const BASE_URL = '/horarios';

export const horariosService = {
  listar() {
    return axios.get(BASE_URL).then((res) => res.data);
  },
};
