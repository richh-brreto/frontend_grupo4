import { useState } from 'react';
import Button from '../../layout/Button';
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
      size="fullscreen"
      className="schedule-modal"
      saving={salvando}
      footerActions={(
        <>
          <Button onClick={onClose} disabled={salvando}>Cancelar cadastro</Button>
          <Button onClick={onBack} disabled={salvando}>Voltar</Button>
          <Button
            active
            onClick={handleConfirmar}
            disabled={salvando || selecionados.length === 0}
          >
            Concluir cadastro
          </Button>
        </>
      )}
    >
      <ProfessorScheduleSelector selecionados={selecionados} onChange={setSelecionados} />

      {erro && <p className="student-form-error">{erro}</p>}
      {salvando && <p>Salvando...</p>}
    </Modal>
  );
}
