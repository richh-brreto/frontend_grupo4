import Modal from '../../layout/Modal';
import CodigoAcessoBox from '../../codigo-acesso/CodigoAcessoBox';

const cortarSegundos = (hora) => (hora ? hora.slice(0, 5) : '');

const formatarHorario = (h) =>
  `${h.diaSemana}, ${cortarSegundos(h.horaInicio)} - ${cortarSegundos(h.horaFim)}`;

export default function ScheduleModal({ aluno, onClose }) {
  const horarios = aluno.horarios ?? [];

  return (
    <Modal title="Informações do Aluno" onClose={onClose} showSave={false}>
      <label className="modal-field-label" htmlFor="student-schedule-name">Aluno:</label>
      <input id="student-schedule-name" className="modal-form-control" type="text" value={aluno.nome} readOnly />

      <label className="modal-field-label" htmlFor="student-schedule-level">Nível:</label>
      <input id="student-schedule-level" className="modal-form-control" type="text" value={aluno.nivel ?? '-'} readOnly />

      <label className="modal-field-label" htmlFor="student-schedule-access">Status de acesso:</label>
      <input
        id="student-schedule-access"
        className="modal-form-control"
        type="text"
        value={aluno.senhaDefinida ? 'Senha configurada' : 'Primeiro acesso pendente'}
        readOnly
      />
      <CodigoAcessoBox codigoAcesso={aluno.codigoAcesso} senhaDefinida={aluno.senhaDefinida} />

      <p className="modal-field-label">Total de horários: {horarios.length}</p>
      {horarios.length > 0 ? (
        <ul className="student-absence-list">
          {horarios.map((h) => (
            <li key={`${h.id}-${h.tipoContrato || ''}`}>
              <strong>{formatarHorario(h)}</strong>
              <span>
                {h.tipoContrato || 'Aula'} · {h.responsavel || 'Responsável não informado'}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="student-no-absences">Nenhum horário cadastrado.</p>
      )}
    </Modal>
  );
}
