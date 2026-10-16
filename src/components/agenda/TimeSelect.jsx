const HORAS = Array.from({ length: 16 }, (_, index) => String(index + 7).padStart(2, '0'));
const MINUTOS = ['00', '15', '30', '45'];

export default function TimeSelect({ id, value, onChange }) {

  const atualizarParte = (parte, novoValor) => {
    const [horaAtual, minutoAtual] = (value || '07:00').split(':');
    const novoHorario = parte === 'hora'
      ? `${novoValor}:${minutoAtual}`
      : `${horaAtual}:${novoValor}`;
    onChange(novoHorario);
  };

  return (
    <div className="agenda-time-select" id={id}>
      <select
        aria-label="Hora"
        value={value?.slice(0, 2) || ''}
        onChange={(event) => atualizarParte('hora', event.target.value)}
      >
        <option value="" disabled>Hora</option>
        {HORAS.map((hora) => (
          <option key={hora} value={hora}>{hora}h</option>
        ))}
      </select>
      <span>:</span>
      <select
        aria-label="Minutos"
        value={value?.slice(3, 5) || ''}
        onChange={(event) => atualizarParte('minuto', event.target.value)}
      >
        <option value="" disabled>Min</option>
        {MINUTOS.map((minuto) => (
          <option key={minuto} value={minuto}>{minuto}</option>
        ))}
      </select>
    </div>
  );
}