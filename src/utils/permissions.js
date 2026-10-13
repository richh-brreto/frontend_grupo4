import { useCallback, useEffect, useState } from 'react';
import axios from './axiosConfig';
import { lerPermissoes, salvarPermissoes } from './permissionStorage';

export {
  lerPermissoes,
  salvarPermissoes,
  limparPermissoes,
  registrarSessao,
  encerrarSessao,
  temSessao,
} from './permissionStorage';

// Cache em memória: todas as telas que consomem o menu compartilham o mesmo
// cache, então o /me sai uma única vez por sessão em vez de uma vez por tela.
let cache = null;
let requisicaoEmAndamento = null;

// Invalida o cache em memória (logout, troca de usuário)
export function recarregarPermissoes() {
  cache = null;
  requisicaoEmAndamento = null;
}

function carregarDoBackend() {
  if (cache) return Promise.resolve(cache);
  if (requisicaoEmAndamento) return requisicaoEmAndamento;

  requisicaoEmAndamento = axios
    .get('/me')
    .then((res) => {
      cache = salvarPermissoes(res.data?.permissoes);
      return cache;
    })
    .catch((erro) => {
      // Sessão expirada: mantém o cache local para o chamador decidir o redirecionamento
      cache = lerPermissoes();
      throw erro;
    })
    .finally(() => {
      requisicaoEmAndamento = null;
    });

  return requisicaoEmAndamento;
}

// Permissões do usuário logado: vêm do login ou do GET /me e ficam cacheadas
// no navegador para o menu filtrar as telas sem repetir a requisição.
export function usePermissoes() {
  const [permissoes, setPermissoes] = useState(() => cache ?? lerPermissoes());
  const [carregando, setCarregando] = useState(() => cache === null);

  useEffect(() => {
    if (cache !== null) return undefined;

    let ativo = true;

    carregarDoBackend()
      .catch(() => [])
      .finally(() => {
        if (ativo) {
          setPermissoes(cache ?? []);
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  const podeAcessar = useCallback(
    (permissao) => (cache ?? permissoes).includes(permissao),
    [permissoes]
  );

  return { permissoes, carregando, podeAcessar };
}
