import Modal from '../../layout/Modal';
import CodigoAcessoBox from '../../codigo-acesso/CodigoAcessoBox';

const cortarSegundos = (hora) => (hora ? hora.slice(0, 5) : '');

const formatarHorario = (h) =>
  `${h.diaSemana}, ${cortarSegundos(h.horaInicio)} - ${cortarSegundos(h.horaFim)}`;

export default function ScheduleModal({ aluno, onClose }) {
  const horarios = aluno.horarios ?? [];

  return (
    <Modal title="Horários do Aluno" onClose={onClose} showSave={false}>
      <label>Aluno:</label>
      <input type="text" value={aluno.nome} readOnly />

      <label>Nível:</label>
      <input type="text" value={aluno.nivel ?? '-'} readOnly />

      <label>Status de acesso:</label>
      <input
        type="text"
        value={aluno.senhaDefinida ? 'Senha configurada' : 'Primeiro acesso pendente'}
        readOnly
      />
      <CodigoAcessoBox codigoAcesso={aluno.codigoAcesso} senhaDefinida={aluno.senhaDefinida} />

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
