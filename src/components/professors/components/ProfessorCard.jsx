import { useState } from 'react';
import Button from '../../layout/Button';
import ButtonContainer from '../../layout/ButtonContainer';
import { copiarTexto } from '../../../utils/clipboard';

export default function ProfessorCard({ professor, onEditar, onVerPerfil, onAlternarStatus }) {
  const [copiado, setCopiado] = useState(false);
  const senhaPendente = !professor.senhaDefinida;
  const iniciais = professor.nome
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const copiarCodigo = async () => {
    const ok = await copiarTexto(professor.codigoAcesso);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <article className="professor-card">
      <div className="professor-card-top">
        <div className="avatar-circle">{iniciais}</div>

        <div className="professor-main-info">
          <h3>{professor.nome}</h3>
          <p>
            {professor.permissoes?.length
              ? `${professor.permissoes.length} tela(s) liberada(s)`
              : 'sem telas liberadas'}
          </p>
        </div>

        <div className="professor-card-badges">
          <span className={`status-pill ${professor.ativo ? 'ativo' : 'inativo'}`}>
            {professor.ativo ? 'Ativo' : 'Inativo'}
          </span>
          <span className={`professor-access-pill ${senhaPendente ? 'pendente' : 'configurado'}`}>
            {senhaPendente ? 'primeiro acesso pendente' : 'senha configurada'}
          </span>
        </div>
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
        {senhaPendente && professor.codigoAcesso && (
          <Button onClick={copiarCodigo}>{copiado ? 'Código copiado!' : 'Copiar código de acesso'}</Button>
        )}
        <Button onClick={() => onAlternarStatus(professor)}>
          {professor.ativo ? 'Inativar' : 'Reativar'}
        </Button>
      </ButtonContainer>
    </article>
  );
}
