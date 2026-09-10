
"USAR SEMPRE EM TODAS PAGINAS QUE PRECISAM DE AUTENTICAÇÃO!! ELE MANDA PRO LOGIN DNV QUANDO A SESSÃO EXPIRA"

"import axios from '.../utils/axiosConfig';  basta dar esse import"

import axios from 'axios';

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;

const savedToken = localStorage.getItem("authToken");
if (savedToken) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("authToken");
      delete axios.defaults.headers.common["Authorization"];
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axios;