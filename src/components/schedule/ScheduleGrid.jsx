export default function ScheduleGrid({
  variant = 'columns',
  days,
  hours,
  getSlot,
  renderSlot,
  className,
  hourLabelClassName,
  hourItemClassName,
  dayHeaderClassName,
  hoursHeaderClassName,
  dayColumnClassName,
}) {
  if (variant === 'table') {
    return (
      <table className={className}>
        <thead>
          <tr>
            <th className={hourLabelClassName}></th>
            {days.map((day) => (
              <th key={day.key ?? day}>{day.label ?? day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour.key ?? hour}>
              <td className={hourLabelClassName}>
                {hour.label ?? hour}
              </td>
              {days.map((day) => {
                const dayValue = day.value ?? day;
                const hourValue = hour.value ?? hour;
                const slot = getSlot(dayValue, hourValue);

                return renderSlot({
                  day: dayValue,
                  hour: hourValue,
                  slot,
                  key: day.key ?? dayValue,
                });
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className={className}>
      <div className={hoursHeaderClassName} aria-hidden="true" />
      {days.map((day) => (
        <div key={day.key ?? day} className={dayHeaderClassName}>
          {day.label ?? day}
        </div>
      ))}

      <div className={hourLabelClassName}>
        {hours.map((hour) => (
          <div key={hour.key ?? hour} className={hourItemClassName}>
            {hour.label ?? hour}
          </div>
        ))}
      </div>

      {days.map((day) => {
        const dayValue = day.value ?? day;

        return (
          <div key={day.key ?? dayValue} className={dayColumnClassName}>
            {hours.map((hour) => {
              const hourValue = hour.value ?? hour;
              const slot = getSlot(dayValue, hourValue);

              return renderSlot({
                day: dayValue,
                hour: hourValue,
                slot,
                key: `${day.key ?? dayValue}-${hour.key ?? hourValue}`,
              });
            })}
          </div>
        );
      })}
    </div>
  );
}
