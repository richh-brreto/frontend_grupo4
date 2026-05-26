import "./ProfessoresTable.css";

// Tabela com os dados dos professores
export default function ProfessoresTable({ professores }) {
  return (
    <div className="table-container">
      <h2>Detalhamento dos Professores</h2>

      <table>
        <thead>
          <tr>
            <th>Professor</th>
            <th>Turmas</th>
            <th>Horas Semanais</th>
            <th>Horários Livres</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {professores.map((prof, index) => (
            <tr key={index}>
              <td>{prof.nome}</td>
              <td>{prof.turmas}</td>
              <td>{prof.horas}h</td>
              <td>{prof.livres}h</td>
              <td>
                <span
                  className={`status ${
                    prof.status === "Sobrecarregado"? "danger":
                    prof.status === "Subutilizado"? "warning": "success"
                  }`}
                >
                  {prof.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
