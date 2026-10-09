import { useState, useEffect, useCallback, useRef } from 'react';
import { alunosService } from './alunosService';

const TAMANHO_PAGINA = 10;
const ATRASO_BUSCA_MS = 400;

const alunoEstaAtivo = (aluno) =>
  aluno.ativo === true || aluno.ativo === 1 || aluno.ativo === 'true' || aluno.ativo === '1';

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
        if (data.content.length === 0 && pagina > 0 && data.totalPages > 0) {
          setPagina(data.totalPages - 1);
          return;
        }

        setAlunos(data.content.map((aluno) => ({ ...aluno, ativo: alunoEstaAtivo(aluno) })));
        setPaginacao({
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          first: data.first,
          last: data.last,
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
    carregarAlunos();
  }, [carregarAlunos]);

  const setFiltro = (novoFiltro) => {
    setFiltroState(novoFiltro);
    setPagina(0);
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
      ? alunosService.excluir(aluno.id)
      : alunosService.reativar(aluno.id);

    return chamada
      .then(() => carregarAlunos())
      .catch((err) => setError(err.message));
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
