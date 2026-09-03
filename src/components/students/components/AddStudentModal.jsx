import React, { useState } from 'react';
import Modal from '../../layout/Modal';

const NIVEIS = ['A1', 'A2', 'B1', 'B2'];

const ESTADO_INICIAL = {
  nome: '',
  email: '',
  telefone: '',
  nivel: NIVEIS[0],
  horariosIds: '',
};

export default function AddStudentModal({ onClose, onSave }) {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const atualizarCampo = (campo) => (event) =>
    setForm((atual) => ({ ...atual, [campo]: event.target.value }));

  const handleSalvar = () => {
    const payload = {
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      nivel: form.nivel,
      horariosIds: form.horariosIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
        .map(Number),
    };

    setSalvando(true);
    setErro(null);

    onSave(payload)
      .then(() => onClose())
      .catch((err) => setErro(err.message))
      .finally(() => setSalvando(false));
  };

  return (
    <Modal title="Adicionar Aluno" onClose={onClose} onSave={handleSalvar}>
      <label>Nome:</label>
      <input type="text" placeholder="Nome" value={form.nome} onChange={atualizarCampo('nome')} />

      <label>Email:</label>
      <input type="text" placeholder="Email" value={form.email} onChange={atualizarCampo('email')} />

      <label>Telefone:</label>
      <input type="text" placeholder="Telefone" value={form.telefone} onChange={atualizarCampo('telefone')} />

      <label>Nível:</label>
      <select value={form.nivel} onChange={atualizarCampo('nivel')}>
        {NIVEIS.map((nivel) => (
          <option key={nivel} value={nivel}>
            {nivel}
          </option>
        ))}
      </select>

      <label>IDs dos horários (separados por vírgula):</label>
      <input
        type="text"
        placeholder="Ex: 1, 2"
        value={form.horariosIds}
        onChange={atualizarCampo('horariosIds')}
      />

      {erro && <p className="student-form-error">{erro}</p>}
      {salvando && <p>Salvando...</p>}
    </Modal>
  );
}
