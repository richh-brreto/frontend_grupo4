import { useState } from 'react';
import Modal from '../../layout/Modal';
import ProfessorScheduleSelector from './ProfessorScheduleSelector';
import SeletorPermissoes from './SeletorPermissoes';

const ESTADO_INICIAL = {
  nome: '',
  email: '',
  telefone: '',
  permissoes: [],
};

export default function AddProfessorModal({ onClose, onSave }) {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [horariosIds, setHorariosIds] = useState([]);
  const [horariosSelecionados, setHorariosSelecionados] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const atualizarCampo = (campo) => (event) =>
    setForm((atual) => ({ ...atual, [campo]: event.target.value }));

  const handleSalvar = () => {
    if (horariosIds.length === 0) {
      setErro('Selecione pelo menos um horário.');
      return;
    }

    const payload = {
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      horariosIds: horariosIds,
      // Telas escolhidas aqui viram linhas em professor_permissao
      permissoes: form.permissoes,
    };

    setSalvando(true);
    setErro(null);

    onSave(payload)
      .then(() => onClose())
      .catch((err) => setErro(err.message))
      .finally(() => setSalvando(false));
  };

  return (
    <Modal title="Adicionar Professor" onClose={onClose} onSave={handleSalvar} saveLabel={salvando ? 'Salvando...' : 'Concluir cadastro'} className="professor-create-modal">
      <div className="professor-form-panel">
        <label>Nome:</label>
        <input type="text" placeholder="Nome" value={form.nome} onChange={atualizarCampo('nome')} />

        <label>Email:</label>
        <input type="text" placeholder="Email" value={form.email} onChange={atualizarCampo('email')} />

        <label>Telefone:</label>
        <input type="text" placeholder="Telefone" value={form.telefone} onChange={atualizarCampo('telefone')} />

        <SeletorPermissoes
          selecionadas={form.permissoes}
          onChange={(novas) => setForm((atual) => ({ ...atual, permissoes: novas }))}
        />

        {horariosSelecionados.length > 0 && (
          <div className="professor-selected-schedule">
            <span className="professor-selected-schedule-title">Selecionados</span>
            <div className="professor-selected-schedule-list">
              {horariosSelecionados.map((horario) => (
                <div key={horario.id} className="professor-selected-schedule-item">
                  <strong>{horario.diaSemana.replace('-feira', '')}</strong>
                  <span>{horario.horaInicio.slice(0, 5)} - {horario.horaFim.slice(0, 5)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {erro && <p className="student-form-error">{erro}</p>}
      </div>
      <div className="professor-schedule-panel">
        <ProfessorScheduleSelector
          selecionados={horariosIds}
          onChange={(ids, horarios) => {
            setHorariosIds(ids);
            setHorariosSelecionados(horarios);
          }}
        />
      </div>
    </Modal>
  );
}
