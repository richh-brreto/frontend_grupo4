import { useEffect, useMemo, useState } from 'react';
import { horariosService } from '../professors/components/horariosService';
import ScheduleGrid from '../schedule/ScheduleGrid';
import '../professors/components/ProfessorScheduleModal.css';


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

export default function RemarcarScheduleSelector({ aulaAtual, horarioSelecionado, onSelect }) {
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

  const handleSlotClick = (horario) => {
    onSelect(horario);
  };

  const isSlotDisponivel = (horario) => {
    if (!horario) return false;
    if (aulaAtual && horario.id === aulaAtual.horarioId) return true;
    return true;
  };

  if (carregando) return <p className="schedule-instrucao">Carregando horários...</p>;
  if (erroCarregamento) return <p className="student-form-error">Erro ao carregar horários: {erroCarregamento}</p>;

  return (
    <>
      <p className="schedule-instrucao">
        Clique em um horário disponível para selecionar. Apenas um horário pode ser selecionado.
        {' '}A nova data acompanha o dia escolhido na semana da aula original.
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

            const selecionado = horarioSelecionado?.id === horario.id;
            const disponivel = isSlotDisponivel(horario);

            return (
              <td key={key} className="schedule-slot-cell">
                <button
                  type="button"
                  className={`schedule-slot ${selecionado ? 'selecionado' : ''} ${!disponivel ? 'indisponivel' : ''}`}
                  onClick={() => handleSlotClick(horario)}
                  disabled={!disponivel}
                  aria-pressed={selecionado}
                />
              </td>
            );
          }}
        />
      </div>

      {horarioSelecionado && (
        <div className="schedule-contador">
          Horário selecionado: {LABEL_DIA_CURTO[horarioSelecionado.diaSemana] ?? horarioSelecionado.diaSemana}, {formatarHora(horarioSelecionado.horaInicio)} - {formatarHora(horarioSelecionado.horaFim)}
        </div>
      )}
    </>
  );
}