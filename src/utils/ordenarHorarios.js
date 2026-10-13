const DIAS_SEMANA = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

const normalizarDia = (dia) => (dia || '').replace('-feira', '');
const obterHora = (hora) => (hora || '').slice(0, 5);

export const ordenarHorarios = (primeiro, segundo) => {
  const primeiroHorario = primeiro.item || primeiro;
  const segundoHorario = segundo.item || segundo;
  const primeiroDia = normalizarDia(primeiro.dia || primeiroHorario.diaSemana);
  const segundoDia = normalizarDia(segundo.dia || segundoHorario.diaSemana);
  const diferencaDias = DIAS_SEMANA.indexOf(primeiroDia) - DIAS_SEMANA.indexOf(segundoDia);

  if (diferencaDias !== 0) return diferencaDias;

  const primeiraHora = obterHora(primeiro.hora || primeiroHorario.horaInicio);
  const segundaHora = obterHora(segundo.hora || segundoHorario.horaInicio);
  return primeiraHora.localeCompare(segundaHora);
};
