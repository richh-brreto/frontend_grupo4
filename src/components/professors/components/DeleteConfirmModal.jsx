import React from 'react';
import Modal from '../../layout/Modal';

export default function DeleteConfirmModal({ professor, onClose, onConfirm }) {
  return (
    <Modal title="Excluir Professor" onClose={onClose} onSave={onConfirm}>
      <p>
        Tem certeza que deseja excluir <strong>{professor.nome}</strong>? Essa ação não pode ser desfeita.
      </p>
    </Modal>
  );
}
