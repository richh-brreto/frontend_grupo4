import "./MetricCard.css";

export default function MetricCard({ titulo, valor, color, extra }) {
  return (
    <div className="metric-card">
      <h2>{titulo}</h2>
      <p style={{ color: color || "inherit" }}>{valor}</p>
      {extra && <div className="extra">{extra}</div>}
    </div>
  );
}
