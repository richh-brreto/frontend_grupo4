import React, { useState } from 'react';
import Modal from '../../layout/Modal';

const ESTADO_INICIAL = {
  nome: '',
  email: '',
  telefone: '',
  senha: '',
  idTipoProfessor: '',
  horariosIds: '',
};

export default function AddProfessorModal({ onClose, onSave }) {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const atualizarCampo = (campo) => (event) =>
    setForm((atual) => ({ ...atual, [campo]: event.target.value }));

  const handleSalvar = () => {
    const payload = {
      nome: form.nome,
      email: form.email,
      telefone: Number(form.telefone),
      senha: form.senha,
      idTipoProfessor: Number(form.idTipoProfessor),
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
    <Modal title="Adicionar Professor" onClose={onClose} onSave={handleSalvar}>
      <label>Nome:</label>
      <input type="text" placeholder="Nome" value={form.nome} onChange={atualizarCampo('nome')} />

      <label>Email:</label>
      <input type="text" placeholder="Email" value={form.email} onChange={atualizarCampo('email')} />

      <label>Telefone:</label>
      <input type="text" placeholder="Telefone" value={form.telefone} onChange={atualizarCampo('telefone')} />

      <label>Senha:</label>
      <input type="password" placeholder="Senha" value={form.senha} onChange={atualizarCampo('senha')} />

      <label>ID do tipo de professor:</label>
      <input
        type="text"
        placeholder="Ex: 1"
        value={form.idTipoProfessor}
        onChange={atualizarCampo('idTipoProfessor')}
      />

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
