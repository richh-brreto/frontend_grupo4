import { useState, useEffect, useCallback } from 'react';
import { alunosService } from './alunosService';

export function useAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('ativos');

  const carregarAlunos = useCallback(() => {
    setLoading(true);
    alunosService.listar()
      .then((data) => setAlunos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    carregarAlunos();
  }, [carregarAlunos]);

  const adicionarAluno = (novoAluno) => {
    return alunosService.criar(novoAluno).then((alunoCriado) => {
      setAlunos((items) => [...items, alunoCriado]);
      return alunoCriado;
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
    });
  };

  // Alterna o status do aluno chamando o endpoint certo conforme o estado atual
  const alternarStatus = (aluno) => {
    const chamada = aluno.ativo
      ? alunosService.inativar(aluno.id)
      : alunosService.reativar(aluno.id);

    return chamada
      .then(() => {
        setAlunos((items) =>
          items.map((item) =>
            item.id === aluno.id ? { ...item, ativo: !item.ativo } : item
          )
        );
      })
      .catch((err) => setError(err.message));
  };

  const alunosFiltrados = alunos.filter((aluno) =>
    filtro === 'ativos' ? aluno.ativo : !aluno.ativo
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
