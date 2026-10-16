import Modal from '../../layout/Modal';
import CodigoAcessoBox from '../../codigo-acesso/CodigoAcessoBox';

const cortarSegundos = (hora) => (hora ? hora.slice(0, 5) : '');

const formatarHorario = (h) =>
  `${h.diaSemana}, ${cortarSegundos(h.horaInicio)} - ${cortarSegundos(h.horaFim)}`;

export default function ProfessorProfileModal({ professor, onClose }) {
  const horarios = professor.horarios ?? [];

  return (
    <Modal title="Perfil do Professor" onClose={onClose} hideFooter>
      <label>Nome:</label>
      <div className="profile-detail-value">{professor.nome}</div>

      <label>Email:</label>
      <div className="profile-detail-value">{professor.email}</div>

      <label>Telefone:</label>
      <div className="profile-detail-value">{professor.telefone}</div>

      <label>Situação:</label>
      <div className="profile-detail-value">{professor.ativo ? 'Ativo' : 'Inativo'}</div>

      <label>Status de acesso:</label>
      <div className="profile-detail-value">
        {professor.senhaDefinida ? 'Senha configurada' : 'Primeiro acesso pendente'}
      </div>
      <CodigoAcessoBox codigoAcesso={professor.codigoAcesso} senhaDefinida={professor.senhaDefinida} />

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
