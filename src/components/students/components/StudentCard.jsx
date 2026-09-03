import React from 'react';
import Button from '../../layout/Button';
import ButtonContainer from '../../layout/ButtonContainer';

export default function StudentCard({ aluno, onEditar, onVerHorarios, onExcluir, onAlternarStatus }) {
  const iniciais = aluno.nome
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article className="student-card">
      <div className="student-card-top">
        <div className="student-avatar-circle">{iniciais}</div>

        <div className="student-main-info">
          <h3>{aluno.nome}</h3>
          <p>Aluno</p>
        </div>

        <span className={`student-status-pill ${aluno.ativo ? 'ativo' : 'inativo'}`}>
          {aluno.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <div className="student-meta">
        <div>
          <span>Email</span>
          <strong>{aluno.email}</strong>
        </div>
        <div>
          <span>Nível</span>
          <strong>{aluno.nivel ?? '-'}</strong>
        </div>
        <div>
          <span>Horários</span>
          <strong>{aluno.horarios?.length ?? 0}</strong>
        </div>
      </div>

      <ButtonContainer>
        <Button onClick={() => onEditar(aluno)}>Editar</Button>
        <Button active onClick={() => onVerHorarios(aluno)}>Visualizar horários</Button>
        <Button onClick={() => onAlternarStatus(aluno)}>
          {aluno.ativo ? 'Inativar' : 'Reativar'}
        </Button>
        <Button onClick={() => onExcluir(aluno)}>Excluir</Button>
      </ButtonContainer>
    </article>
  );
}
