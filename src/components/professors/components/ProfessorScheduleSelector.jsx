import { useEffect, useMemo, useState } from 'react';
import { horariosService } from './horariosService';
import ScheduleGrid from '../../schedule/ScheduleGrid';
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

export default function ProfessorScheduleSelector({ selecionados, onChange }) {
  const [horarios, setHorarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(null);

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
      if (h.horaInicio.slice(0, 5) < '07:00') return;
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
    const novo = selecionados.includes(horario.id)
      ? selecionados.filter((id) => id !== horario.id)
      : [...selecionados, horario.id];
    onChange(novo, horarios.filter((item) => novo.includes(item.id)));
  };

  if (carregando) return <p>Carregando horários...</p>;
  if (erroCarregamento) return <p className="student-form-error">Erro ao carregar horários: {erroCarregamento}</p>;

  return (
    <>
      <p className="schedule-instrucao">
        Clique nos blocos para marcar os horários em que o professor estará disponível.
      </p>

      <div className="schedule-scroll">
        <ScheduleGrid
          variant="table"
          className="schedule-grid"
          hourLabelClassName="schedule-hora-label"
          days={dias.map((dia) => ({ value: dia, label: LABEL_DIA_CURTO[dia] ?? dia }))}
          hours={horasLinhas.map(({ horaInicio }) => ({
            value: horaInicio,
            label: <span>{formatarHora(horaInicio)}</span>,
          }))}
          getSlot={(dia, horaInicio) => grade.get(`${dia}|${horaInicio}`)}
          renderSlot={({ slot: horario, key }) => {
            if (!horario) {
              return <td key={key} className="schedule-slot schedule-slot-vazio" />;
            }

            const selecionado = selecionados.includes(horario.id);
            return (
              <td key={key} className="schedule-slot-cell">
                <button
                  type="button"
                  className={`schedule-slot ${selecionado ? 'selecionado' : ''}`}
                  onClick={() => alternarSlot(horario)}
                  aria-pressed={selecionado}
                />
              </td>
            );
          }}
        />
      </div>

      <p className="schedule-contador">{selecionados.length} horário(s) selecionado(s)</p>
    </>
  );
}
