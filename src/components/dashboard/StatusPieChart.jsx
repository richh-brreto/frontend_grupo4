import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import "./StatusPieChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ["#ef4444", "#22c55e", "#facc15"];

export default function StatusPieChart({ data }) {
  const chartData = {
    labels: data.map((entry) => entry.name),
    datasets: [
      {
        data: data.map((entry) => entry.value),
        backgroundColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div className="pie-container">
      <h2 className="pie-title">Distribuição de Professores</h2>
      <Pie data={chartData} options={options} />
    </div>
  );
}
