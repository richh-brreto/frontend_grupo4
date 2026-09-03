import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../layout/Modal';
import { horariosService } from './horariosService';
import './ProfessorScheduleModal.css';

const ORDEM_DIAS = [
  'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo',
];

const LABEL_DIA_CURTO = {
  'Segunda-feira': 'Segunda',
  'Terça-feira': 'Terça',
  'Quarta-feira': 'Quarta',
  'Quinta-feira': 'Quinta',
  'Sexta-feira': 'Sexta',
  'Sábado': 'Sábado',
  'Domingo': 'Domingo',
};

const formatarHora = (hora) => (hora ? hora.slice(0, 5) : '');

export default function ProfessorScheduleModal({ onBack, onClose, onConfirm, salvando, erro }) {
  const [horarios, setHorarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(null);
  const [selecionados, setSelecionados] = useState(() => new Set());

  useEffect(() => {
    horariosService.listar()
      .then((data) => setHorarios(data ?? []))
      .catch((err) => setErroCarregamento(err.message))
      .finally(() => setCarregando(false));
  }, []);

  const dias = useMemo(() => {
    const presentes = new Set(horarios.map((h) => h.diaSemana));
    return ORDEM_DIAS.filter((dia) => presentes.has(dia));
  }, [horarios]);

  const horasLinhas = useMemo(() => {
    const mapa = new Map();
    horarios.forEach((h) => {
      if (!mapa.has(h.horaInicio)) mapa.set(h.horaInicio, h.horaFim);
    });
    return Array.from(mapa.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([horaInicio, horaFim]) => ({ horaInicio, horaFim }));
  }, [horarios]);

  const grade = useMemo(() => {
    const mapa = new Map();
    horarios.forEach((h) => mapa.set(`${h.diaSemana}|${h.horaInicio}`, h));
    return mapa;
  }, [horarios]);

  const alternarSlot = (horario) => {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(horario.id)) {
        novo.delete(horario.id);
      } else {
        novo.add(horario.id);
      }
      return novo;
    });
  };

  const handleConfirmar = () => {
    onConfirm(Array.from(selecionados));
  };

  return (
    <Modal
      title="Selecione os horários do professor"
      onClose={onClose}
      hideFooter
      className="schedule-modal"
    >
      {carregando && <p>Carregando horários...</p>}
      {erroCarregamento && <p className="student-form-error">Erro ao carregar horários: {erroCarregamento}</p>}

      {!carregando && !erroCarregamento && (
        <>
          <p className="schedule-instrucao">
            Clique nos blocos para marcar os horários em que o professor estará disponível.
          </p>

          <div className="schedule-scroll">
            <table className="schedule-grid">
              <thead>
                <tr>
                  <th className="schedule-hora-label"></th>
                  {dias.map((dia) => (
                    <th key={dia}>{LABEL_DIA_CURTO[dia] ?? dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horasLinhas.map(({ horaInicio, horaFim }) => (
                  <tr key={horaInicio}>
                    <td className="schedule-hora-label">
                      {formatarHora(horaInicio)} - {formatarHora(horaFim)}
                    </td>
                    {dias.map((dia) => {
                      const horario = grade.get(`${dia}|${horaInicio}`);
                      if (!horario) return <td key={dia} className="schedule-slot schedule-slot-vazio" />;

                      const selecionado = selecionados.has(horario.id);
                      return (
                        <td key={dia} className="schedule-slot-cell">
                          <button
                            type="button"
                            className={`schedule-slot ${selecionado ? 'selecionado' : ''}`}
                            onClick={() => alternarSlot(horario)}
                            aria-pressed={selecionado}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="schedule-contador">{selecionados.size} horário(s) selecionado(s)</p>
        </>
      )}

      {erro && <p className="student-form-error">{erro}</p>}
      {salvando && <p>Salvando...</p>}

      <div className="schedule-actions">
        <button type="button" className="modal-button cancel" onClick={onClose} disabled={salvando}>
          Cancelar cadastro
        </button>
        <button type="button" className="modal-button cancel" onClick={onBack} disabled={salvando}>
          Voltar
        </button>
        <button
          type="button"
          className="modal-button save"
          onClick={handleConfirmar}
          disabled={salvando || selecionados.size === 0}
        >
          Concluir cadastro
        </button>
      </div>
    </Modal>
  );
}
