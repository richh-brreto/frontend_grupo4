import { useState } from 'react';
import Modal from '../../layout/Modal';
import ProfessorScheduleSelector from './ProfessorScheduleSelector';
import './ProfessorScheduleModal.css';

export default function ProfessorScheduleModal({ onBack, onClose, onConfirm, salvando, erro }) {
  const [selecionados, setSelecionados] = useState([]);

  const handleConfirmar = () => {
    onConfirm(Array.from(selecionados));
  };

  return (
    <Modal
      title="Selecione os horários do professor"
      onClose={onClose}
      hideFooter
      className="schedule-modal"
    >
      <ProfessorScheduleSelector selecionados={selecionados} onChange={setSelecionados} />

      {erro && <p className="student-form-error">{erro}</p>}
      {salvando && <p>Salvando...</p>}

      <div className="schedule-actions">
        <button type="button" className="modal-button cancel" onClick={onClose} disabled={salvando}>
          Cancelar cadastro
        </button>
        <button type="button" className="modal-button cancel" onClick={onBack} disabled={salvando}>
          Voltar
        </button>
        <button
          type="button"
          className="modal-button save"
          onClick={handleConfirmar}
          disabled={salvando || selecionados.length === 0}
        >
          Concluir cadastro
        </button>
      </div>
    </Modal>
  );
}
