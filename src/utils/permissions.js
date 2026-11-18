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
let usuarioCache = null;
let usuarioCarregado = false;
const PERMISSOES_ADMINISTRADOR = [
  'TELA_GERAL',
  'TELA_AGENDA',
  'TELA_DASHBOARD',
  'TELA_PROFESSORES',
  'TELA_TURMAS',
  'TELA_ALUNOS',
  'TELA_CONTRATOS',
];

// Invalida o cache em memória (logout, troca de usuário)
export function recarregarPermissoes() {
  cache = null;
  usuarioCache = null;
  usuarioCarregado = false;
  requisicaoEmAndamento = null;
}

const normalizarUsuario = (resposta) => {
  const dados = resposta?.data ?? resposta;
  return dados?.usuario
    ?? dados?.user
    ?? dados?.professor
    ?? dados?.usuarioLogado
    ?? dados?.professorLogado
    ?? dados;
};

const ehUsuarioAluno = (usuario) => {
  const dados = usuario?.data ?? usuario;
  return String(dados?.tipo ?? '').toUpperCase() === 'ALUNO';
};

const obterIdProfessor = (usuario) => {
  // Aluno não tem id de professor; sem isso o fallback para "id" poderia
  // confundir o aluno de id 1 com o administrador.
  if (ehUsuarioAluno(usuario)) return undefined;
  const dados = usuario?.data ?? usuario;
  const identidade = dados?.professor
    ?? dados?.usuario
    ?? dados?.user
    ?? dados?.professorLogado
    ?? dados?.usuarioLogado
    ?? dados?.dadosProfessor
    ?? dados;
  return identidade?.professorId
    ?? identidade?.idProfessor
    ?? identidade?.professorID
    ?? identidade?.professor_id
    ?? identidade?.id_professor
    ?? identidade?.id;
};

const extrairLista = (resposta) => {
  if (Array.isArray(resposta)) return resposta;
  if (Array.isArray(resposta?.content)) return resposta.content;
  if (Array.isArray(resposta?.data)) return resposta.data;
  if (Array.isArray(resposta?.data?.content)) return resposta.data.content;
  return [];
};

const obterEmailUsuario = (usuario) => {
  const identidade = usuario?.usuario ?? usuario?.user ?? usuario;
  return identidade?.email ?? identidade?.login ?? usuario?._emailSessao;
};

export function definirUsuarioAtual(usuario, emailSessao) {
  usuarioCache = {
    ...(normalizarUsuario(usuario) ?? {}),
    ...(emailSessao ? { _emailSessao: emailSessao.trim().toLowerCase() } : {}),
  };
  usuarioCarregado = true;
}

function carregarDoBackend() {
  if (cache !== null && usuarioCarregado) return Promise.resolve(cache);
  if (requisicaoEmAndamento) return requisicaoEmAndamento;

  requisicaoEmAndamento = axios
    .get('/me')
    .then(async (res) => {
      usuarioCache = {
        ...(usuarioCache ?? {}),
        ...(normalizarUsuario(res.data) ?? {}),
      };

      const email = obterEmailUsuario(usuarioCache);
      if (email && !ehUsuarioAluno(usuarioCache)) {
        try {
          const respostaProfessores = await axios.get('/professores');
          const professorAtual = extrairLista(respostaProfessores.data).find(
            (professor) => String(professor.email ?? '').trim().toLowerCase() === String(email).trim().toLowerCase()
          );
          if (professorAtual?.id != null) {
            usuarioCache = { ...usuarioCache, professorId: professorAtual.id };
          }
        } catch {
          // Mantém a identidade recebida pelo login ou pelo /me.
        }
      }

      usuarioCarregado = true;
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
  const [usuario, setUsuario] = useState(() => usuarioCache);
  const [carregando, setCarregando] = useState(() => cache === null || !usuarioCarregado);
  const ehAdministrador = String(obterIdProfessor(usuario) ?? '') === '1';
  const permissoesEfetivas = ehAdministrador ? PERMISSOES_ADMINISTRADOR : permissoes;

  useEffect(() => {
    if (cache !== null && usuarioCarregado) return undefined;

    let ativo = true;

    carregarDoBackend()
      .catch(() => [])
      .finally(() => {
        if (ativo) {
          setPermissoes(cache ?? []);
          setUsuario(usuarioCache);
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  const podeAcessar = useCallback(
    (permissao) => String(obterIdProfessor(usuario) ?? '') === '1'
      || (cache ?? permissoes).includes(permissao),
    [permissoes, usuario]
  );

  return { permissoes: permissoesEfetivas, usuario, carregando, podeAcessar };
}

export function useUsuarioAtual() {
  const { usuario, carregando } = usePermissoes();
  const professorId = obterIdProfessor(usuario);

  return {
    usuario,
    professorId,
    ehAdministrador: String(professorId ?? '') === '1',
    ehAluno: ehUsuarioAluno(usuario),
    carregando,
  };
}
