import Modal from '../../layout/Modal';
import CodigoAcessoBox from '../../codigo-acesso/CodigoAcessoBox';

const cortarSegundos = (hora) => (hora ? hora.slice(0, 5) : '');

const formatarHorario = (h) =>
  `${h.diaSemana}, ${cortarSegundos(h.horaInicio)} - ${cortarSegundos(h.horaFim)}`;

export default function ProfessorProfileModal({ professor, onClose }) {
  const horarios = professor.horarios ?? [];

  return (
    <Modal title="Perfil do Professor" onClose={onClose} showSave={false}>
      <label className="modal-field-label" htmlFor="professor-profile-name">Nome:</label>
      <input id="professor-profile-name" className="modal-form-control" type="text" value={professor.nome} readOnly />

      <label className="modal-field-label" htmlFor="professor-profile-email">Email:</label>
      <input id="professor-profile-email" className="modal-form-control" type="email" value={professor.email} readOnly />

      <label className="modal-field-label" htmlFor="professor-profile-phone">Telefone:</label>
      <input id="professor-profile-phone" className="modal-form-control" type="text" value={professor.telefone} readOnly />

      <label className="modal-field-label" htmlFor="professor-profile-status">Situação:</label>
      <input id="professor-profile-status" className="modal-form-control" type="text" value={professor.ativo ? 'Ativo' : 'Inativo'} readOnly />

      <label className="modal-field-label" htmlFor="professor-profile-access">Status de acesso:</label>
      <input
        id="professor-profile-access"
        className="modal-form-control"
        type="text"
        value={professor.senhaDefinida ? 'Senha configurada' : 'Primeiro acesso pendente'}
        readOnly
      />
      <CodigoAcessoBox codigoAcesso={professor.codigoAcesso} senhaDefinida={professor.senhaDefinida} />

      <p className="modal-field-label">Total de horários: {horarios.length}</p>
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
