import { useState, useEffect, useCallback } from 'react';
import { professoresService } from './professoresService';

export function useProfessores() {
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('ativos');

  const carregarProfessores = useCallback(() => {
    setLoading(true);
    professoresService.listar()
      .then((data) => setProfessores(data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    carregarProfessores();
  }, [carregarProfessores]);

  // O POST devolve a entidade crua (com senha e tipo em outro formato), então
  // recarregamos a lista para manter o mesmo formato usado pelo GET
  const adicionarProfessor = (novoProfessor) => {
    return professoresService.criar(novoProfessor).then((professorCriado) => {
      carregarProfessores();
      return professorCriado;
    });
  };

  const editarProfessor = (professor) => {
    const payload = {
      nome: professor.nome,
      email: professor.email,
      telefone: Number(professor.telefone),
      idTipoProfessor: Number(professor.idTipoProfessor),
    };

    return professoresService.atualizar(professor.id, payload).then((professorAtualizado) => {
      setProfessores((items) =>
        items.map((item) => (item.id === professor.id ? professorAtualizado : item))
      );
    });
  };

  const excluirProfessor = (id) => {
    return professoresService.excluir(id).then(() => {
      setProfessores((items) => items.filter((item) => item.id !== id));
    });
  };

  // Inativa (soft delete) ou reativa o professor conforme o estado atual
  const alternarStatus = (professor) => {
    const chamada = professor.ativo
      ? professoresService.excluir(professor.id)
      : professoresService.reativar(professor.id);

    return chamada
      .then(() => {
        setProfessores((items) =>
          items.map((item) =>
            item.id === professor.id ? { ...item, ativo: !item.ativo } : item
          )
        );
      })
      .catch((err) => setError(err.message));
  };

  const professoresFiltrados = professores.filter((professor) =>
    filtro === 'ativos' ? professor.ativo : !professor.ativo
  );

  return {
    professores: professoresFiltrados,
    loading,
    error,
    setError,
    filtro,
    setFiltro,
    adicionarProfessor,
    editarProfessor,
    excluirProfessor,
    alternarStatus,
  };
}
