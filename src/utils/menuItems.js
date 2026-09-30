import { useMemo } from 'react';
import { usePermissoes } from './permissions';

// Fonte única da verdade do menu lateral: cada item declara qual tela do
// catálogo (tabela permissao) ele exige. Para liberar uma tela nova basta
// cadastrar a permissão no banco e apontar o item para ela.
export const MENU_ITEMS = [
  { to: '/overview', label: 'Geral', short: 'Geral', permissao: 'TELA_GERAL' },
  { to: '/aulas', label: 'Agenda', short: 'AG', permissao: 'TELA_AGENDA' },
  { to: '/dashboard', label: 'Dashboard', short: 'Dash', permissao: 'TELA_DASHBOARD' },
  { to: '/professores', label: 'Professores', short: 'Prof', permissao: 'TELA_PROFESSORES' },
  { to: '/turmas', label: 'Turmas', short: 'Tur', permissao: 'TELA_TURMAS' },
  { to: '/alunos', label: 'Alunos', short: 'Alu', permissao: 'TELA_ALUNOS' },
  { to: '/contratos', label: 'Contratos', short: 'Cont', permissao: 'TELA_CONTRATOS' },
];

// Rota -> permissão, usado para bloquear o acesso direto pela URL
export const ROTAS_PROTEGIDAS = MENU_ITEMS.map(({ to, permissao }) => ({ to, permissao }));

// Itens do menu que o usuário pode ver (o item da rota atual é marcado como ativo)
export function useItensMenu(caminhoAtual) {
  const { permissoes, carregando } = usePermissoes();

  return useMemo(() => {
    // Enquanto o /me não volta, nada é desenhado: evita piscar telas bloqueadas
    if (carregando) return [];

    return MENU_ITEMS.filter((item) => permissoes.includes(item.permissao)).map((item) => ({
      ...item,
      active: item.to === caminhoAtual,
    }));
  }, [permissoes, carregando, caminhoAtual]);
}

// Primeira tela que o usuário pode abrir (destino quando a rota atual é negada)
export function primeiraRotaLiberada(permissoes = []) {
  return ROTAS_PROTEGIDAS.find((rota) => permissoes.includes(rota.permissao))?.to ?? null;
}
