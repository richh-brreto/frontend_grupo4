import Modal from '../layout/Modal';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';

const cortarSegundos = (hora) => (hora ? hora.slice(0, 5) : '');

const formatarParticipantes = (aula) => {
  if (!aula.ativos || aula.ativos.length === 0) return 'Sem participantes';
  return aula.ativos.map(p => p.aluno).join(', ');
};

export default function AulaDetailModal({ aula, onClose, onEditar, podeGerenciar }) {
  if (!aula) return null;

  const isTurma = !!aula.turmaId;
  const titulo = isTurma ? `Turma: ${aula.conta}` : `Aula individual: ${aula.conta}`;

  return (
    <Modal
      title="Detalhes da Aula"
      onClose={onClose}
      showSave={false}
      showCancel={false}
      hideFooter
      className="aula-detail-modal"
    >
      <div className="aula-detail-content">
        <div className="aula-detail-section">
          <h3>{titulo}</h3>
          
          <div className="aula-detail-field">
            <label>Data:</label>
            <span>{aula.data ? aula.data.split('-').reverse().join('/') : ''}</span>
          </div>

          <div className="aula-detail-field">
            <label>Horário:</label>
            <span>{cortarSegundos(aula.horaInicio)} - {cortarSegundos(aula.horaFim)}</span>
          </div>

          <div className="aula-detail-field">
            <label>Professor:</label>
            <span>{aula.professor || 'Sem professor'}</span>
          </div>

          <div className="aula-detail-field">
            <label>{isTurma ? 'Alunos' : 'Aluno'}:</label>
            <span>{formatarParticipantes(aula)}</span>
          </div>

          {aula.status === 'CANCELADA' && (
            <div className="aula-detail-field aula-cancelada">
              <label>Status:</label>
              <span className="status-cancelado">Cancelada</span>
            </div>
          )}
        </div>

        {podeGerenciar && aula.status !== 'CANCELADA' && (
          <div className="aula-detail-actions">
            <ButtonContainer>
              <Button active onClick={() => { onClose(); onEditar(aula); }}>
                Editar
              </Button>
            </ButtonContainer>
          </div>
        )}
      </div>
    </Modal>
  );
}