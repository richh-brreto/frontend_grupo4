import React from 'react';
import Modal from '../../layout/Modal';
import SeletorPermissoes from './SeletorPermissoes';

export default function EditProfessorModal({ professor, onClose, onSave, onChange, onDelete }) {
  return (
    <Modal title="Editar Professor" onClose={onClose} onSave={onSave} onDelete={onDelete}>
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

      <SeletorPermissoes
        selecionadas={professor.permissoes ?? []}
        onChange={(novas) => onChange({ ...professor, permissoes: novas })}
      />
    </Modal>
  );
}
