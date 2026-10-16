import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Modal from '../layout/Modal';
import { professoresService } from '../professors/components/professoresService';
import { aulasService } from './aulasService';
import TimeSelect from './TimeSelect';
import './AddAgendaEventModal.css';

export default function AddAgendaEventModal({ dia, semana, onClose, onSaved }) {
  const [nome, setNome] = useState('');
  const [professores, setProfessores] = useState([]);
  const [professoresSelecionados, setProfessoresSelecionados] = useState([]);
  const [professorParaAdicionar, setProfessorParaAdicionar] = useState('');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFim, setHoraFim] = useState('09:00');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    professoresService.listar()
      .then((data) => setProfessores((data || []).filter((professor) => professor.ativo)))
      .catch((error) => setErro(error.response?.data?.error || 'Não foi possível carregar os professores ativos.'))
      .finally(() => setCarregando(false));
  }, []);

  const adicionarProfessor = () => {
    if (!professorParaAdicionar) return;
    setProfessoresSelecionados((atuais) => (
      atuais.includes(Number(professorParaAdicionar))
        ? atuais
        : [...atuais, Number(professorParaAdicionar)]
    ));
    setProfessorParaAdicionar('');
  };

  const removerProfessor = (professorId) => {
    setProfessoresSelecionados((atuais) => atuais.filter((id) => id !== professorId));
  };

  const salvar = async () => {
    if (!nome.trim() || !horaInicio || !horaFim || professoresSelecionados.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Preencha os dados',
        text: 'Informe o nome, os horários e selecione pelo menos um professor ativo.',
        confirmButtonColor: '#0f1f3f'
      });
      return;
    }
    const minutosValidos = [horaInicio, horaFim].every((hora) => Number(hora.split(':')[1]) % 15 === 0);
    if (!minutosValidos || horaInicio >= horaFim) {
      await Swal.fire({
        icon: 'warning',
        title: 'Horário inválido',
        text: 'A hora de início deve ser anterior à hora de fim e os minutos devem ser de 15 em 15.',
        confirmButtonColor: '#0f1f3f'
      });
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      await aulasService.criar({
        nome: nome.trim(),
        data: dia.data,
        horaInicio,
        horaFim,
        professorIds: professoresSelecionados,
      });
      onSaved();
    } catch (error) {
      setErro(error.response?.data?.error || 'Não foi possível adicionar o evento.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      title={`Adicionar evento - ${dia.diaSemana}`}
      onClose={onClose}
      onSave={salvar}
      saveLabel={salvando ? 'Salvando...' : 'Adicionar'}
    >
      <p className="agenda-add-contexto">{dia.data} · período {semana.inicio} a {semana.fim}</p>

      <label htmlFor="agenda-nome">Nome do evento</label>
      <input
        id="agenda-nome"
        type="text"
        placeholder="Nome do evento"
        value={nome}
        onChange={(event) => setNome(event.target.value)}
        maxLength={120}
      />

      <label htmlFor="agenda-hora-inicio">Hora de início</label>
      <TimeSelect
        id="agenda-hora-inicio"
        value={horaInicio}
        onChange={setHoraInicio}
      />

      <label htmlFor="agenda-hora-fim">Hora de fim</label>
      <TimeSelect
        id="agenda-hora-fim"
        value={horaFim}
        onChange={setHoraFim}
      />

      <label htmlFor="agenda-professor">Professor</label>
      <div className="agenda-professor-dropdown">
        <select
          id="agenda-professor"
          value={professorParaAdicionar}
          onChange={(event) => setProfessorParaAdicionar(event.target.value)}
          disabled={carregando || professores.length === 0}
        >
          <option value="">Selecione um professor</option>
          {professores.map((professor) => (
            <option
              key={professor.id}
              value={professor.id}
              disabled={professoresSelecionados.includes(professor.id)}
            >
              {professor.nome}
            </option>
          ))}
        </select>
        <button type="button" onClick={adicionarProfessor} disabled={!professorParaAdicionar}>
          Adicionar
        </button>
      </div>

      <div className="agenda-professores-lista">
        {carregando && <span>Carregando professores...</span>}
        {!carregando && professores.length === 0 && <span>Nenhum professor ativo cadastrado.</span>}
        {professoresSelecionados.map((professorId) => {
          const professor = professores.find((item) => item.id === professorId);
          if (!professor) return null;
          return (
            <div key={professor.id} className="agenda-professor-item">
              <span>{professor.nome}</span>
              <button type="button" onClick={() => removerProfessor(professor.id)}>
                Remover
              </button>
            </div>
          );
        })}
      </div>

      {erro && <p className="agenda-add-erro">{erro}</p>}
    </Modal>
  );
}