import React from 'react';
import Modal from '../../layout/Modal';

export default function DeleteConfirmModal({ aluno, onClose, onConfirm }) {
  return (
    <Modal title="Excluir Aluno" onClose={onClose} onSave={onConfirm}>
      <p>
        Tem certeza que deseja excluir <strong>{aluno.nome}</strong>? Essa ação não pode ser desfeita.
      </p>
    </Modal>
  );
}