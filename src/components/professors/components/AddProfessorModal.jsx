import React, { useState } from 'react';
import Modal from '../../layout/Modal';
import ProfessorScheduleModal from './ProfessorScheduleModal';

const ESTADO_INICIAL = {
  nome: '',
  email: '',
  telefone: '',
  senha: '',
  idTipoProfessor: '',
};

export default function AddProfessorModal({ onClose, onSave }) {
  const [etapa, setEtapa] = useState('dados');
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const atualizarCampo = (campo) => (event) =>
    setForm((atual) => ({ ...atual, [campo]: event.target.value }));

  const avancarParaAgenda = () => {
    setErro(null);
    setEtapa('agenda');
  };

  const handleConfirmarAgenda = (horariosIds) => {
    const payload = {
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      senha: form.senha,
      idTipoProfessor: Number(form.idTipoProfessor),
      horariosIds,
    };

    setSalvando(true);
    setErro(null);

    onSave(payload)
      .then(() => onClose())
      .catch((err) => setErro(err.message))
      .finally(() => setSalvando(false));
  };

  if (etapa === 'agenda') {
    return (
      <ProfessorScheduleModal
        onBack={() => setEtapa('dados')}
        onClose={onClose}
        onConfirm={handleConfirmarAgenda}
        salvando={salvando}
        erro={erro}
      />
    );
  }

  return (
    <Modal title="Adicionar Professor" onClose={onClose} onSave={avancarParaAgenda}>
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

      {erro && <p className="student-form-error">{erro}</p>}
    </Modal>
  );
}
