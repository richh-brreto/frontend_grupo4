import "./StatusIndicator.css";

function StatusIndicator({ percent, direction, color }) {
  // direction: "up" ou "down"
  // color: "green", "red" ou "neutral"

  const arrow = direction === "up" ? "▲" : "▼";

  return (
    <div className={`status-indicator ${color}`}>
      <span className="dot"></span>
      <span className="arrow">{arrow}</span>
      <span className="percent">{percent}%</span>
    </div>
  );
}

export default StatusIndicator;
