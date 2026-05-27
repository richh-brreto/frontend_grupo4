import "./StatusPieChart.css";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#ef4444", "#22c55e", "#facc15"];

// Gráfico de pizza mostrando distribuição dos professores
export default function StatusPieChart({ data }) {
  return (
    <div className="pie-container">
      <h2>Distribuição de Professores</h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
