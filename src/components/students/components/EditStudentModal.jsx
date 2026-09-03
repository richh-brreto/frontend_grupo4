import React from 'react';
import Modal from '../../layout/Modal';

const NIVEIS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function EditStudentModal({ aluno, onClose, onSave, onChange }) {
  return (
    <Modal title="Editar Aluno" onClose={onClose} onSave={onSave}>
      <label>Nome:</label>
      <input
        type="text"
        value={aluno.nome}
        onChange={(e) => onChange({ ...aluno, nome: e.target.value })}
      />

      <label>Email:</label>
      <input
        type="text"
        value={aluno.email}
        onChange={(e) => onChange({ ...aluno, email: e.target.value })}
      />

      <label>Telefone:</label>
      <input
        type="text"
        value={aluno.telefone}
        onChange={(e) => onChange({ ...aluno, telefone: e.target.value })}
      />

      <label>Nível:</label>
      <select
        value={aluno.nivel ?? NIVEIS[0]}
        onChange={(e) => onChange({ ...aluno, nivel: e.target.value })}
      >
        {NIVEIS.map((nivel) => (
          <option key={nivel} value={nivel}>
            {nivel}
          </option>
        ))}
      </select>

      <label>Situação:</label>
      <label className="switch">
        <input
          type="checkbox"
          checked={aluno.ativo}
          onChange={(e) => onChange({ ...aluno, ativo: e.target.checked })}
        />
        <span className="slider" />
      </label>
    </Modal>
  );
}
