import "./MetricCard.css";

// Componente simples para mostrar uma métrica
export default function MetricCard({ titulo, valor, color }) {
  return (
    <div className="metric-card">
      <h2>{titulo}</h2>
      <p className={`metric-value ${color || ""}`}>{valor}</p>
    </div>
  );
}
