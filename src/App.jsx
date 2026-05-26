import "./App.css";

import MetricCard from "./components/MetricCard";
// import ProfessoresBarChart from "./components/ProfessoresBarChart";
// import StatusPieChart from "./components/StatusPieChart";
import ProfessoresTable from "./components/ProfessoresTable";

export default function App() {
  const professores = [
    { nome: "Carlos", turmas: 8, horas: 32, livres: 8, status: "Sobrecarregado" },
    { nome: "Fernanda", turmas: 5, horas: 20, livres: 20, status: "Equilibrado" },
    { nome: "Marina", turmas: 3, horas: 12, livres: 28, status: "Subutilizado" },
    { nome: "Lucas", turmas: 7, horas: 30, livres: 10, status: "Sobrecarregado" },
  ];




  const totalHorasLivres = professores.reduce((acc, p) => acc + p.livres, 0);
  const totalTurmas = professores.reduce((acc, p) => acc + p.turmas, 0);

  return (
    <div className="app">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          marginRight: "200px"
        }}  >
        <h1>Dashboard de Carga dos Professores</h1>

        <div style={{ display: "flex", gap: "16px" }}>
          <div>
            <label htmlFor="data-inicio">Data Início </label>
            <input type="date" id="data-inicio" name="dataInicio" />
          </div>

          <div>
            <label htmlFor="data-fim">Data Fim </label>
            <input type="date" id="data-fim" name="dataFim" />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="cards-grid">
        <MetricCard titulo="Total de Professores" valor={professores.length} />
        <MetricCard titulo="Total de Turmas" valor={totalTurmas} />
        <MetricCard titulo="Total/h Livres" valor={`${totalHorasLivres}h`} />
        <MetricCard titulo="Professores Sobrecarregados" valor={2} color="red" />
      </div>

      {/* Tabela */}
      <ProfessoresTable professores={professores} />
    </div>
  );


}
