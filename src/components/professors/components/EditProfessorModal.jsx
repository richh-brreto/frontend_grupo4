import React from 'react';
import Modal from '../../layout/Modal';

export default function EditProfessorModal({ professor, onClose, onSave, onChange }) {
  return (
    <Modal title="Editar Professor" onClose={onClose} onSave={onSave}>
      <label>Nome:</label>
      <input
        type="text"
        value={professor.nome}
        onChange={(e) => onChange({ ...professor, nome: e.target.value })}
      />

      <label>Email:</label>
      <input
        type="email"
        value={professor.email}
        onChange={(e) => onChange({ ...professor, email: e.target.value })}
      />

      <label>Telefone:</label>
      <input
        type="text"
        value={professor.telefone}
        onChange={(e) => onChange({ ...professor, telefone: e.target.value })}
      />

      <label>ID do tipo de professor:</label>
      <input
        type="text"
        value={professor.idTipoProfessor}
        onChange={(e) => onChange({ ...professor, idTipoProfessor: e.target.value })}
      />
    </Modal>
  );
}
