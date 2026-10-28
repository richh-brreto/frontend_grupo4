export const obterProfessorIdTurma = (turma) =>
  turma?.professorId
  ?? turma?.idProfessor
  ?? turma?.professor_id
  ?? turma?.id_professor
  ?? turma?.professor?.id
  ?? turma?.professorResponsavel?.id
  ?? turma?.teacher?.id;

const obterProfessorIdContrato = (contrato) =>
  contrato?.professorId
  ?? contrato?.idProfessor
  ?? contrato?.professor_id
  ?? contrato?.id_professor
  ?? contrato?.professor?.id;

const obterTurmaIdContrato = (contrato) =>
  contrato?.turmaId
  ?? contrato?.idTurma
  ?? contrato?.turma_id
  ?? contrato?.id_turma
  ?? contrato?.turma?.id;

export const obterAlunoIdContrato = (contrato) =>
  contrato?.alunoId
  ?? contrato?.idAluno
  ?? contrato?.aluno_id
  ?? contrato?.id_aluno
  ?? contrato?.aluno?.id;

export function contratoPertenceAoProfessor(contrato, professorId, turmas = []) {
  if (professorId == null) return false;

  const turmaId = obterTurmaIdContrato(contrato);
  const tipo = String(contrato?.tipo ?? '').toLowerCase();
  const ehGrupo = tipo === 'grupo' || (tipo !== 'individual' && turmaId != null);

  if (ehGrupo) {
    const turma = contrato?.turma
      ?? turmas.find((item) => String(item.id) === String(turmaId));
    return String(obterProfessorIdTurma(turma) ?? '') === String(professorId);
  }

  return String(obterProfessorIdContrato(contrato) ?? '') === String(professorId);
}