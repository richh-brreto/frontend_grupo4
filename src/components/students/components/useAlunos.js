import { useState, useEffect, useCallback, useRef } from 'react';
import { alunosService } from './alunosService';

const TAMANHO_PAGINA = 10;
const ATRASO_BUSCA_MS = 400;

const alunoEstaAtivo = (aluno) => {
  if (typeof aluno.ativo !== 'undefined') {
    return aluno.ativo === true
      || aluno.ativo === 1
      || aluno.ativo === 'true'
      || aluno.ativo === '1';
  }

  if (typeof aluno.isAtivo !== 'undefined') {
    return aluno.isAtivo === true || aluno.isAtivo === 1 || aluno.isAtivo === 'true';
  }

  return String(aluno.status || '').toUpperCase() === 'ATIVO';
};

const PAGINA_VAZIA = { totalElements: 0, totalPages: 0, first: true, last: true };

export function useAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [paginacao, setPaginacao] = useState(PAGINA_VAZIA);
  const [pagina, setPagina] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltroState] = useState('ativos');
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  // Descarta respostas antigas quando o usuário digita/troca de página mais rápido que a API responde
  const ultimaRequisicao = useRef(0);
  const recarregarRef = useRef(null);

  // Só consulta a API quando o usuário para de digitar; uma busca nova sempre começa na primeira página
  useEffect(() => {
    const termo = busca.trim();
    if (termo === buscaAplicada) return undefined;

    const timer = setTimeout(() => {
      setBuscaAplicada(termo);
      setPagina(0);
    }, ATRASO_BUSCA_MS);
    return () => clearTimeout(timer);
  }, [busca, buscaAplicada]);

  const carregarAlunos = useCallback(() => {
    const requisicao = ++ultimaRequisicao.current;
    setLoading(true);
    setError(null);

    return alunosService.listar({
      page: pagina,
      size: TAMANHO_PAGINA,
      nome: buscaAplicada,
      ativo: filtro === 'ativos',
    })
      .then((data) => {
        if (requisicao !== ultimaRequisicao.current) return;

        // A página ficou vazia (ex: último aluno dela foi inativado): volta para a última que existe
        const conteudo = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data?.data?.content)
              ? data.data.content
              : [];
        const totalPaginas = data?.totalPages ?? data?.data?.totalPages ?? 0;

        if (conteudo.length === 0 && pagina > 0) {
          setPagina(Math.max(0, totalPaginas - 1));
          return;
        }

        const alunosNormalizados = conteudo.map((aluno) => ({
          ...aluno,
          ativo: alunoEstaAtivo(aluno),
        }));
        setAlunos(alunosNormalizados);
        setPaginacao({
          totalElements: data?.totalElements ?? data?.data?.totalElements ?? alunosNormalizados.length,
          totalPages: totalPaginas || 1,
          first: data?.first ?? data?.data?.first ?? pagina === 0,
          last: data?.last ?? data?.data?.last ?? true,
        });
      })
      .catch((err) => {
        if (requisicao === ultimaRequisicao.current) setError(err.message);
      })
      .finally(() => {
        if (requisicao === ultimaRequisicao.current) setLoading(false);
      });
  }, [pagina, buscaAplicada, filtro]);

  useEffect(() => {
    recarregarRef.current = carregarAlunos;
    carregarAlunos();
  }, [carregarAlunos]);

  const setFiltro = (novoFiltro) => {
    if (novoFiltro === filtro) return;
    setFiltroState(novoFiltro);
    setPagina(0);
    setAlunos([]);
  };

  const adicionarAluno = (novoAluno) => {
    return alunosService.criar(novoAluno).then((alunoCriado) => {
      carregarAlunos();
      return { ...alunoCriado, ativo: alunoEstaAtivo(alunoCriado) };
    });
  };

  const editarAluno = (aluno) => {
    return alunosService.atualizar(aluno.id, aluno).then(() => {
      setAlunos((items) => items.map((item) => (item.id === aluno.id ? aluno : item)));
    });
  };

  const excluirAluno = (id) => {
    return alunosService.excluir(id).then(() => carregarAlunos());
  };

  // Alterna o status do aluno chamando o endpoint certo conforme o estado atual.
  // O aluno sai da aba atual, então recarrega a página vinda da API
  const alternarStatus = (aluno) => {
    const chamada = alunoEstaAtivo(aluno)
      ? alunosService.inativar(aluno.id)
      : alunosService.reativar(aluno.id);

    return chamada.then(() => recarregarRef.current());
  };

  return {
    alunos,
    loading,
    error,
    filtro,
    setFiltro,
    busca,
    setBusca,
    pagina,
    setPagina,
    tamanhoPagina: TAMANHO_PAGINA,
    paginacao,
    recarregar: carregarAlunos,
    adicionarAluno,
    editarAluno,
    excluirAluno,
    alternarStatus,
  };
}
