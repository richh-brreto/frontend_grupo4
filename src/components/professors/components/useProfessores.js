import { useState, useEffect, useCallback } from 'react';
import { professoresService } from './professoresService';
import { horariosService } from './horariosService';

const extrairLista = (resposta) => {
  if (Array.isArray(resposta)) return resposta;
  if (Array.isArray(resposta?.content)) return resposta.content;
  if (Array.isArray(resposta?.data)) return resposta.data;
  if (Array.isArray(resposta?.data?.content)) return resposta.data.content;
  return [];
};

const obterHorarioId = (horario) =>
  typeof horario === 'object' && horario !== null
    ? horario.id ?? horario.horarioId ?? horario.idHorario
    : horario;

const normalizarProfessor = (professor, horariosCatalogo) => {
  const horariosRecebidos = Array.isArray(professor.horarios) ? professor.horarios : [];
  const horariosIds = [
    ...(Array.isArray(professor.horariosIds) ? professor.horariosIds : []),
    ...horariosRecebidos.map(obterHorarioId),
  ].filter((id) => id != null);
  const horariosPorId = new Map(
    [...horariosCatalogo, ...horariosRecebidos.filter((item) => item && typeof item === 'object')]
      .filter((horario) => horario.id != null)
      .map((horario) => [String(horario.id), horario])
  );
  const horarios = [...new Set(horariosIds.map(String))]
    .map((id) => horariosPorId.get(id))
    .filter(Boolean);

  return {
    ...professor,
    horariosIds: horarios.length > 0 ? horarios.map((horario) => horario.id) : horariosIds,
    horarios,
  };
};

export function useProfessores() {
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('ativos');

  const carregarProfessores = useCallback(() => {
    setLoading(true);
    Promise.all([
      professoresService.listar(),
      horariosService.listar().catch(() => []),
    ])
      .then(([data, horariosData]) => {
        const horariosCatalogo = extrairLista(horariosData);
        setProfessores(extrairLista(data).map((professor) =>
          normalizarProfessor(professor, horariosCatalogo)
        ));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    carregarProfessores();
  }, [carregarProfessores]);

  // O POST devolve a entidade crua (com a senha fora do formato de tela), então
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
      telefone: professor.telefone,
      permissoes: professor.permissoes,
      horariosIds: professor.horariosIds,
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
      ? professoresService.inativar(professor.id)
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
