import { useState } from 'react';
import Swal from 'sweetalert2';
import Modal from '../../layout/Modal';
import ProfessorScheduleSelector from './ProfessorScheduleSelector';
import SeletorPermissoes from './SeletorPermissoes';
import { ordenarHorarios } from '../../../utils/ordenarHorarios';

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

  const temAlteracoes = () => {
    return form.nome.trim() !== '' || form.email.trim() !== '' || form.telefone.trim() !== '' || form.permissoes.length > 0 || horariosIds.length > 0;
  };

  const handleFechar = async () => {
    if (temAlteracoes()) {
      const resultado = await Swal.fire({
        icon: 'warning',
        title: 'Alterações não salvas',
        text: 'Você tem alterações não salvas. Deseja realmente sair sem salvar?',
        showCancelButton: true,
        confirmButtonText: 'Sim, sair sem salvar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#b91c1c',
        cancelButtonColor: '#64748b'
      });
      if (!resultado.isConfirmed) return;
    }
    onClose();
  };

  const atualizarCampo = (campo) => (event) =>
    setForm((atual) => ({ ...atual, [campo]: event.target.value }));

  const handleSalvar = async () => {
    const telefoneNumeros = form.telefone.replace(/\D/g, '');
    const camposInvalidos = [];

    if (!form.nome.trim()) camposInvalidos.push('nome');
    if (!form.email.trim() || !form.email.includes('@') || !form.email.includes('.')) {
      camposInvalidos.push('e-mail');
    }
    if (![10, 11].includes(telefoneNumeros.length)) camposInvalidos.push('telefone com DDD');
    if (form.permissoes.length === 0) camposInvalidos.push('telas liberadas');
    if (horariosIds.length === 0) camposInvalidos.push('horários');

    if (camposInvalidos.length > 0) {
      const campos = camposInvalidos.join(', ').replace(/, ([^,]*)$/, ' e $1');
      const mensagem = `Verifique os seguintes campos: ${campos}.`;
      setErro(mensagem);
      await Swal.fire({
        icon: 'error',
        title: 'Dados inválidos',
        text: mensagem,
        confirmButtonColor: '#0f1f3f'
      });
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
    <Modal title="Adicionar Professor" onClose={handleFechar} onSave={handleSalvar} saveLabel={salvando ? 'Salvando...' : 'Salvar'} className="professor-create-modal">
      <div className="professor-form-panel">
        <label>Nome:</label>
        <input type="text" placeholder="Nome" value={form.nome} onChange={atualizarCampo('nome')} />

        <label>Email:</label>
        <input type="email" placeholder="Email" value={form.email} onChange={atualizarCampo('email')} />

        <label>Telefone:</label>
        <input type="tel" placeholder="Telefone" value={form.telefone} onChange={atualizarCampo('telefone')} />

        <SeletorPermissoes
          selecionadas={form.permissoes}
          onChange={(novas) => setForm((atual) => ({ ...atual, permissoes: novas }))}
        />

        <div className="professor-selected-schedule">
          <span className="professor-selected-schedule-title">Selecionados</span>
          {horariosSelecionados.length > 0 ? (
            <div className="professor-selected-schedule-list">
              {[...horariosSelecionados].sort(ordenarHorarios).map((horario) => (
                <div key={horario.id} className="professor-selected-schedule-item">
                  <strong>{horario.diaSemana.replace('-feira', '')}</strong>
                  <span>{horario.horaInicio.slice(0, 5)} - {horario.horaFim.slice(0, 5)}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="professor-selected-schedule-empty">Nenhum horário selecionado</span>
          )}
        </div>

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
