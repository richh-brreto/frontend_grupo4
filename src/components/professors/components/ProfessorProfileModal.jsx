import React from 'react';
import Modal from '../../layout/Modal';

const cortarSegundos = (hora) => (hora ? hora.slice(0, 5) : '');

const formatarHorario = (h) =>
  `${h.diaSemana}, ${cortarSegundos(h.horaInicio)} - ${cortarSegundos(h.horaFim)}`;

export default function ProfessorProfileModal({ professor, onClose }) {
  const horarios = professor.horarios ?? [];

  return (
    <Modal title="Perfil do Professor" onClose={onClose} showSave={false}>
      <label>Nome:</label>
      <input type="text" value={professor.nome} readOnly />

      <label>Tipo:</label>
      <input type="text" value={professor.tipo?.tipoProfessor ?? '-'} readOnly />

      <label>Email:</label>
      <input type="email" value={professor.email} readOnly />

      <label>Telefone:</label>
      <input type="text" value={professor.telefone} readOnly />

      <label>Situação:</label>
      <input type="text" value={professor.ativo ? 'Ativo' : 'Inativo'} readOnly />

      <label>Total de horários: {horarios.length}</label>
      {horarios.length > 0 ? (
        <ul className="student-absence-list">
          {horarios.map((h) => (
            <li key={h.id}>{formatarHorario(h)}</li>
          ))}
        </ul>
      ) : (
        <p className="student-no-absences">Nenhum horário cadastrado.</p>
      )}
    </Modal>
  );
}
