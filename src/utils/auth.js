import { useEffect, useState } from 'react';
import axios from './axiosConfig';

// O token fica só no cookie HttpOnly, então o perfil vem do backend (GET /me).
// Serve apenas para ajustar a interface (ex.: esconder botões);
// a autorização real é sempre feita no backend.
export function useIsCoordenador() {
  const [isCoordenador, setIsCoordenador] = useState(false);

  useEffect(() => {
    let ignorar = false;

    axios.get('/me')
      .then((res) => {
        if (!ignorar) setIsCoordenador(res.data?.perfil === 'COORDENADOR');
      })
      .catch(() => {
        if (!ignorar) setIsCoordenador(false);
      });

    return () => {
      ignorar = true;
    };
  }, []);

  return isCoordenador;
}
