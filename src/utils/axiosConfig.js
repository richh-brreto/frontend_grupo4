import axios from 'axios';
import { encerrarSessao } from './permissionStorage';
import { recarregarPermissoes } from './permissions';

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;

// A autenticação é feita por cookie HttpOnly (o /login não devolve token no
// corpo), então não injetamos mais Authorization a partir do localStorage.

// Interceptor para tratamento de erros
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // 401 = não autenticado em qualquer endpoint; 403 no bootstrap (/me)
    // significa cookie ausente/expirado. Nesses casos a sessão morreu.
    const sessaoInvalida = status === 401 || (status === 403 && url.endsWith('/me'));

    if (sessaoInvalida) {
      localStorage.removeItem("authToken");
      delete axios.defaults.headers.common["Authorization"];
      // Sessão morta: as permissões cacheadas não podem continuar valendo
      encerrarSessao();
      recarregarPermissoes();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axios;
