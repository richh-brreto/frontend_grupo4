import { useState, useEffect, useCallback, useRef } from 'react';
import { alunosService } from './alunosService';
import { contratosService } from '../../contracts/contratosService';
import { turmasService } from '../../classes/turmasService';
import { contratoPertenceAoProfessor, obterAlunoIdContrato } from '../../../utils/escopoProfessor';

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
const extrairLista = (resposta) => {
  if (Array.isArray(resposta)) return resposta;
  if (Array.isArray(resposta?.content)) return resposta.content;
  if (Array.isArray(resposta?.data)) return resposta.data;
  if (Array.isArray(resposta?.data?.content)) return resposta.data.content;
  return [];
};
const normalizarTexto = (texto) => String(texto ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

export function useAlunos({ professorId, ehAdministrador }) {
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

    const requisicaoAlunos = ehAdministrador
      ? alunosService.listar({
          page: pagina,
          size: TAMANHO_PAGINA,
          nome: buscaAplicada,
          ativo: filtro === 'ativos',
        })
      : professorId == null
        ? Promise.resolve([])
        : Promise.all([
            alunosService.listarTodos({ ativo: filtro === 'ativos' }),
            contratosService.listar(),
            turmasService.listar(),
          ]);

    return requisicaoAlunos
      .then((data) => {
        if (requisicao !== ultimaRequisicao.current) return;

        if (!ehAdministrador) {
          if (professorId == null) {
            setAlunos([]);
            setPaginacao(PAGINA_VAZIA);
            return;
          }

          const [alunosRecebidos, contratosResposta, turmasResposta] = data;
          const contratos = extrairLista(contratosResposta);
          const turmas = extrairLista(turmasResposta);
          const idsAlunosDoProfessor = new Set(contratos
            .filter((contrato) => contratoPertenceAoProfessor(contrato, professorId, turmas))
            .map(obterAlunoIdContrato)
            .filter((id) => id != null)
            .map(String));
          const buscaNormalizada = normalizarTexto(buscaAplicada.trim());
          const alunosDoProfessor = alunosRecebidos
            .filter((aluno) => idsAlunosDoProfessor.has(String(aluno.id)))
            .filter((aluno) => !buscaNormalizada || normalizarTexto(aluno.nome).includes(buscaNormalizada));
          const totalPaginas = Math.max(1, Math.ceil(alunosDoProfessor.length / TAMANHO_PAGINA));

          if (alunosDoProfessor.length === 0 && pagina > 0) {
            setPagina(Math.max(0, totalPaginas - 1));
            return;
          }

          const alunosDaPagina = alunosDoProfessor.slice(
            pagina * TAMANHO_PAGINA,
            (pagina + 1) * TAMANHO_PAGINA
          );
          setAlunos(alunosDaPagina.map((aluno) => ({
            ...aluno,
            ativo: alunoEstaAtivo(aluno),
          })));
          setPaginacao({
            totalElements: alunosDoProfessor.length,
            totalPages: totalPaginas,
            first: pagina === 0,
            last: pagina >= totalPaginas - 1,
          });
          return;
        }

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
  }, [pagina, buscaAplicada, filtro, professorId, ehAdministrador]);

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
