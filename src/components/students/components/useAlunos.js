import { useState, useEffect, useCallback } from 'react';
import { alunosService } from './alunosService';

const alunoEstaAtivo = (aluno) =>
  aluno.ativo === true || aluno.ativo === 1 || aluno.ativo === 'true' || aluno.ativo === '1';

const ALUNOS_INATIVOS_CACHE = 'alunos-inativos-cache';

const lerAlunosInativosCache = () => {
  try {
    return JSON.parse(localStorage.getItem(ALUNOS_INATIVOS_CACHE) || '[]');
  } catch {
    return [];
  }
};

const salvarAlunosInativosCache = (alunosInativos) => {
  localStorage.setItem(ALUNOS_INATIVOS_CACHE, JSON.stringify(alunosInativos));
};

export function useAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('ativos');

  const carregarAlunos = useCallback(() => {
    setLoading(true);
    alunosService.listar()
      .then((data) => {
        const alunosDaApi = (data ?? []).map((aluno) => ({
          ...aluno,
          ativo: alunoEstaAtivo(aluno),
        }));
        const idsDaApi = new Set(alunosDaApi.map((aluno) => aluno.id));
        const inativosAusentes = lerAlunosInativosCache().filter(
          (aluno) => !idsDaApi.has(aluno.id)
        );

        setAlunos([...alunosDaApi, ...inativosAusentes]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    carregarAlunos();
  }, [carregarAlunos]);

  const adicionarAluno = (novoAluno) => {
    return alunosService.criar(novoAluno).then((alunoCriado) => {
      const alunoNormalizado = { ...alunoCriado, ativo: alunoEstaAtivo(alunoCriado) };
      setAlunos((items) => [...items, alunoNormalizado]);
      return alunoNormalizado;
    });
  };

  const editarAluno = (aluno) => {
    return alunosService.atualizar(aluno.id, aluno).then(() => {
      setAlunos((items) => items.map((item) => (item.id === aluno.id ? aluno : item)));
    });
  };

  const excluirAluno = (id) => {
    return alunosService.excluir(id).then(() => {
      setAlunos((items) => items.filter((item) => item.id !== id));
      salvarAlunosInativosCache(lerAlunosInativosCache().filter((aluno) => aluno.id !== id));
    });
  };

  // Alterna o status do aluno chamando o endpoint certo conforme o estado atual
  const alternarStatus = (aluno) => {
    const ativo = alunoEstaAtivo(aluno);
    const chamada = ativo
      ? alunosService.inativar(aluno.id)
      : alunosService.reativar(aluno.id);

    return chamada
      .then(() => {
        setAlunos((items) => {
          const alunoAtualizado = { ...aluno, ativo: !ativo };
          const alunoEncontrado = items.some((item) => item.id === aluno.id);

          return alunoEncontrado
            ? items.map((item) =>
              item.id === aluno.id ? alunoAtualizado : item
            )
            : [...items, alunoAtualizado];
        });

        const alunosInativos = lerAlunosInativosCache();
        if (ativo) {
          salvarAlunosInativosCache([
            ...alunosInativos.filter((item) => item.id !== aluno.id),
            { ...aluno, ativo: false },
          ]);
        } else {
          salvarAlunosInativosCache(
            alunosInativos.filter((item) => item.id !== aluno.id)
          );
        }
      })
      .catch((err) => setError(err.message));
  };

  const alunosFiltrados = alunos.filter((aluno) =>
    filtro === 'ativos' ? alunoEstaAtivo(aluno) : !alunoEstaAtivo(aluno)
  );

  return {
    alunos: alunosFiltrados,
    loading,
    error,
    setError,
    filtro,
    setFiltro,
    adicionarAluno,
    editarAluno,
    excluirAluno,
    alternarStatus,
  };
}
