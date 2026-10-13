// Persistência das permissões no navegador. Módulo sem dependência de axios
// para poder ser importado tanto pelo interceptor de requests quanto pelos hooks.
const CHAVE_PERMISSOES = 'boost.permissoes';
const CHAVE_SESSAO = 'boost.sessao';

function normalizar(lista) {
  if (!Array.isArray(lista)) return [];
  return [...new Set(lista.filter((item) => typeof item === 'string' && item.trim()))];
}

export function lerPermissoes() {
  try {
    return normalizar(JSON.parse(localStorage.getItem(CHAVE_PERMISSOES)));
  } catch {
    return [];
  }
}

export function salvarPermissoes(lista) {
  const permissoes = normalizar(lista);
  localStorage.setItem(CHAVE_PERMISSOES, JSON.stringify(permissoes));
  return permissoes;
}

export function limparPermissoes() {
  localStorage.removeItem(CHAVE_PERMISSOES);
}

export function registrarSessao() {
  localStorage.setItem(CHAVE_SESSAO, 'ativa');
}

export function encerrarSessao() {
  localStorage.removeItem(CHAVE_SESSAO);
  localStorage.removeItem(CHAVE_PERMISSOES);
}

export function temSessao() {
  return localStorage.getItem(CHAVE_SESSAO) === 'ativa';
}
