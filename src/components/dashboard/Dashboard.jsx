import { useEffect, useState } from "react";
import "./Dashboard.css";

import MetricCard from "./MetricCard";
// import ProfessoresBarChart from "./ProfessoresBarChart";
// import StatusPieChart from "./StatusPieChart";
import ProfessoresTable from "./ProfessoresTable";
import ClassRegistration from "../class-registration/ClassRegistration";

export default function Dashboard() {
  const [showRegistration, setShowRegistration] = useState(false);

  // Date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Dashboard data
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base (set VITE_API_BASE_URL in .env if needed)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const fetchDashboard = async (sDate = "", eDate = "") => {
    try {
      setLoading(true);
      setError(null);

      const url = new URL(`${API_BASE}/dashboard/professores`);
      if (sDate) url.searchParams.append("startDate", sDate);
      if (eDate) url.searchParams.append("endDate", eDate);

      // Attach JWT from localStorage (if present) so protected endpoints accept the request
      const token = localStorage.getItem("authToken");
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // include credentials in case the server uses cookies in addition to tokens
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Map backend detalhes to UI-friendly professores
      const mappedProfessores = (data.detalhes || []).map((d) => ({
        nome: d.nome,
        turmas: d.turmas ?? 0,
        // backend might expose horasSemanais or horas
        horas: d.horas ?? d.horasSemanais ?? 0,
        // backend might expose horasLivres or livres
        livres: d.livres ?? d.horasLivres ?? 0,
        status: d.status ?? "",
      }));

      setDashboard({
        totalProfessores: data.totalProfessores ?? mappedProfessores.length,
        totalTurmas: data.totalTurmas ?? mappedProfessores.reduce((acc, p) => acc + (p.turmas || 0), 0),
        totalHorasLivres: data.totalHorasLivres ?? mappedProfessores.reduce((acc, p) => acc + (p.livres || 0), 0),
        sobrecarregados: data.sobrecarregados ?? mappedProfessores.filter(p => p.horas > 40).length,
        detalhes: mappedProfessores,
      });
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Não foi possível carregar dados do servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const professores = dashboard?.detalhes ?? [];
  const totalHorasLivres = dashboard?.totalHorasLivres ?? professores.reduce((acc, p) => acc + (p.livres || 0), 0);
  const totalTurmas = dashboard?.totalTurmas ?? professores.reduce((acc, p) => acc + (p.turmas || 0), 0);

  if (showRegistration) {
    return <ClassRegistration onBack={() => setShowRegistration(false)} />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard de Carga dos Professores</h1>
        </div>

        <div className="dashboard-actions">
          <button
            type="button"
            className="secondaryButton"
            onClick={() => setShowRegistration(true)}
          >
            Cadastrar Turma
          </button>

          <div className="dateFilters">
            <div>
              <label htmlFor="data-inicio">Data Início</label>
              <input type="date" id="data-inicio" name="dataInicio"
                     value={startDate}
                     onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="data-fim">Data Fim</label>
              <input type="date" id="data-fim" name="dataFim"
                     value={endDate}
                     onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <button onClick={() => fetchDashboard(startDate, endDate)}>Filtrar</button>
              <button onClick={() => { setStartDate(""); setEndDate(""); fetchDashboard(); }}>Limpar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="cards-grid">
        <MetricCard titulo="Total de Professores" valor={dashboard?.totalProfessores ?? professores.length} />
        <MetricCard titulo="Total de Turmas" valor={totalTurmas} />
        <MetricCard titulo="Total/h Livres" valor={`${totalHorasLivres}h`} />
        <MetricCard titulo="Professores Sobrecarregados" valor={dashboard?.sobrecarregados ?? professores.filter(p => p.horas > 40).length} color="red" />
      </div>

      {loading && <div style={{ padding: '12px' }}>Carregando...</div>}
      {error && <div style={{ padding: '12px', color: 'red' }}>{error}</div>}

      {/* Tabela */}
      <ProfessoresTable professores={professores} />
    </div>
  );
}
