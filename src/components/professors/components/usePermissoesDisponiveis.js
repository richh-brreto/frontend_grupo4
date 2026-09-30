import { useEffect, useState } from 'react';
import axios from '../../../utils/axiosConfig';

// Catálogo de telas vindo do banco (GET /permissoes). Nada de lista fixa aqui:
// o que existe na tabela permissao é o que aparece para marcar.
export function usePermissoesDisponiveis() {
  const [disponiveis, setDisponiveis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ignorar = false;

    axios
      .get('/permissoes')
      .then((res) => {
        if (!ignorar) setDisponiveis(res.data ?? []);
      })
      .catch((err) => {
        if (!ignorar) setErro(err.response?.data?.message ?? err.message);
      })
      .finally(() => {
        if (!ignorar) setCarregando(false);
      });

    return () => {
      ignorar = true;
    };
  }, []);

  return { disponiveis, carregando, erro };
}
