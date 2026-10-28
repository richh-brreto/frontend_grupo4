import { useState } from 'react';
import Swal from 'sweetalert2';
import Modal from '../../layout/Modal';
import ProfessorScheduleSelector from './ProfessorScheduleSelector';
import SeletorPermissoes from './SeletorPermissoes';
import { ordenarHorarios } from '../../../utils/ordenarHorarios';
import { emailJaCadastrado, MENSAGEM_EMAIL_DUPLICADO } from '../../../utils/emailCadastro';

export default function EditProfessorModal({ professor, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    nome: professor.nome ?? '',
    email: professor.email ?? '',
    telefone: professor.telefone ?? '',
    permissoes: professor.permissoes ?? [],
  });
  const horariosIniciais = professor.horarios ?? [];
  const [horariosIds, setHorariosIds] = useState(
    professor.horariosIds ?? horariosIniciais.map((horario) => horario.id)
  );
  const [horariosSelecionados, setHorariosSelecionados] = useState(horariosIniciais);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const formInicial = {
    nome: professor.nome ?? '',
    email: professor.email ?? '',
    telefone: professor.telefone ?? '',
    permissoes: professor.permissoes ?? [],
  };
  const horariosIdsInicial = professor.horariosIds ?? horariosIniciais.map((horario) => horario.id);

  const temAlteracoes = () => {
    return (
      form.nome.trim() !== formInicial.nome.trim() ||
      form.email.trim() !== formInicial.email.trim() ||
      form.telefone.trim() !== formInicial.telefone.trim() ||
      JSON.stringify(form.permissoes.sort()) !== JSON.stringify(formInicial.permissoes.sort()) ||
      JSON.stringify(horariosIds.sort()) !== JSON.stringify(horariosIdsInicial.sort())
    );
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
      const mensagem = `Verifique os seguintes campos: ${camposInvalidos.join(', ').replace(/, ([^,]*)$/, ' e $1')}.`;
      setErro(mensagem);
      await Swal.fire({
        icon: 'error',
        title: 'Dados inválidos',
        text: mensagem,
        confirmButtonColor: '#0f1f3f'
      });
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const emailNormalizado = form.email.trim().toLowerCase();
      const emailInicialNormalizado = String(professor.email ?? '').trim().toLowerCase();
      if (emailNormalizado !== emailInicialNormalizado
        && await emailJaCadastrado(form.email, { tipo: 'professor', id: professor.id })) {
        setErro(MENSAGEM_EMAIL_DUPLICADO);
        return;
      }
      await onSave({ ...form, telefone: form.telefone, horariosIds });
      onClose();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      title="Editar Professor"
      onClose={handleFechar}
      onSave={handleSalvar}
      onDelete={onDelete}
      saveLabel={salvando ? 'Salvando...' : 'Salvar'}
      className="professor-create-modal"
    >
      <div className="professor-form-panel">
        <label className="modal-field-label" htmlFor="professor-edit-name">Nome:</label>
        <input id="professor-edit-name" className="modal-form-control" type="text" value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} />

        <label className="modal-field-label" htmlFor="professor-edit-email">Email:</label>
        <input id="professor-edit-email" className="modal-form-control" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />

        <label className="modal-field-label" htmlFor="professor-edit-phone">Telefone:</label>
        <input id="professor-edit-phone" className="modal-form-control" type="tel" value={form.telefone} onChange={(event) => setForm({ ...form, telefone: event.target.value })} />

        <SeletorPermissoes
          selecionadas={form.permissoes}
          onChange={(permissoes) => setForm({ ...form, permissoes })}
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
