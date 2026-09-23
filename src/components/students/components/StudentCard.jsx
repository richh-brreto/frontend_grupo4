import { useState } from 'react';
import Button from '../../layout/Button';
import ButtonContainer from '../../layout/ButtonContainer';
import { copiarTexto } from '../../../utils/clipboard';

export default function StudentCard({ aluno, onEditar, onVerHorarios, onAlternarStatus }) {
  const [copiado, setCopiado] = useState(false);
  const senhaPendente = !aluno.senhaDefinida;
  const iniciais = aluno.nome
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const copiarCodigo = async () => {
    const ok = await copiarTexto(aluno.codigoAcesso);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <article className="student-card">
      <div className="student-card-top">
        <div className="student-avatar-circle">{iniciais}</div>

        <div className="student-main-info">
          <h3>{aluno.nome}</h3>
          <p>Aluno</p>
        </div>

        <div className="student-card-badges">
          <span className={`student-status-pill ${aluno.ativo ? 'ativo' : 'inativo'}`}>
            {aluno.ativo ? 'Ativo' : 'Inativo'}
          </span>
          <span className={`student-access-pill ${senhaPendente ? 'pendente' : 'configurado'}`}>
            {senhaPendente ? 'primeiro acesso pendente' : 'senha configurada'}
          </span>
        </div>
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
      </div>

      <ButtonContainer>
        <Button onClick={() => onEditar(aluno)}>Editar</Button>
        <Button active onClick={() => onVerHorarios(aluno)}>Ver detalhes</Button>
        {senhaPendente && aluno.codigoAcesso && (
          <Button onClick={copiarCodigo}>{copiado ? 'Código copiado!' : 'Copiar código de acesso'}</Button>
        )}
        <Button onClick={() => onAlternarStatus(aluno)}>
          {aluno.ativo ? 'Inativar' : 'Reativar'}
        </Button>
      </ButtonContainer>
    </article>
  );
}
