import Modal from '../../layout/Modal';
import CodigoAcessoBox from '../../codigo-acesso/CodigoAcessoBox';

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

      <label>Status de acesso:</label>
      <input
        type="text"
        value={professor.senhaDefinida ? 'Senha configurada' : 'Primeiro acesso pendente'}
        readOnly
      />
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
