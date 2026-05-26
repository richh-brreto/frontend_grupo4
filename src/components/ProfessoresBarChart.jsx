import "./ProfessoresBarChart.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ProfessoresBarChart({ data }) {
  return (
    <div className="chart-container">
      <h2>Horas Semanais por Professor</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nome" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="horas" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
