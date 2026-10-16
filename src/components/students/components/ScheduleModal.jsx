import Modal from '../../layout/Modal';
import CodigoAcessoBox from '../../codigo-acesso/CodigoAcessoBox';

const cortarSegundos = (hora) => (hora ? hora.slice(0, 5) : '');

const formatarHorario = (h) =>
  `${h.diaSemana}, ${cortarSegundos(h.horaInicio)} - ${cortarSegundos(h.horaFim)}`;

export default function ScheduleModal({ aluno, onClose }) {
  const horarios = aluno.horarios ?? [];

  return (
    <Modal title="Informações do Aluno" onClose={onClose} hideFooter>
      <label>Aluno:</label>
      <div className="profile-detail-value">{aluno.nome}</div>

      <label>Nível:</label>
      <div className="profile-detail-value">{aluno.nivel ?? '-'}</div>

      <label>Status de acesso:</label>
      <div className="profile-detail-value">
        {aluno.senhaDefinida ? 'Senha configurada' : 'Primeiro acesso pendente'}
      </div>
      <CodigoAcessoBox codigoAcesso={aluno.codigoAcesso} senhaDefinida={aluno.senhaDefinida} />

      <label>Total de horários: {horarios.length}</label>
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
