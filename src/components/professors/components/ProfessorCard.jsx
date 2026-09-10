import React from 'react';
import Button from '../../layout/Button';
import ButtonContainer from '../../layout/ButtonContainer';

export default function ProfessorCard({ professor, onEditar, onVerPerfil, onExcluir, onAlternarStatus }) {
  const iniciais = professor.nome
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article className="professor-card">
      <div className="professor-card-top">
        <div className="avatar-circle">{iniciais}</div>

        <div className="professor-main-info">
          <h3>{professor.nome}</h3>
          <p>{professor.tipo?.tipoProfessor ?? '-'}</p>
        </div>

        <span className={`status-pill ${professor.ativo ? 'ativo' : 'inativo'}`}>
          {professor.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <div className="professor-meta">
        <div>
          <span>Email</span>
          <strong>{professor.email}</strong>
        </div>
        <div>
          <span>Telefone</span>
          <strong>{professor.telefone}</strong>
        </div>
        <div>
          <span>Horários</span>
          <strong>{professor.horarios?.length ?? 0}</strong>
        </div>
      </div>

      <ButtonContainer>
        <Button onClick={() => onEditar(professor)}>Editar</Button>
        <Button active onClick={() => onVerPerfil(professor)}>Ver detalhes</Button>
        <Button onClick={() => onAlternarStatus(professor)}>
          {professor.ativo ? 'Inativar' : 'Reativar'}
        </Button>
        <Button onClick={() => onExcluir(professor)}>Excluir</Button>
      </ButtonContainer>
    </article>
  );
}
