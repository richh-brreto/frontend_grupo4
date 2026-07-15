import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/dashboard/Dashboard";
import Dashboard1 from "./components/dashboard1/Dashboard1";
import Agenda from "./components/agenda/Agenda";
import Contracts from "./components/contracts/Contracts";
import Students from "./components/students/Students";
import Classes from "./components/classes/Classes";
import Professors from "./components/professors/Professors";
import Overview from "./components/overview/Overview";

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;
const savedToken = localStorage.getItem("authToken");
if (savedToken) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}

function App() {
    return (
        <Router>
            <Routes>
                {/* Rota pública de Agenda */}
                <Route path="/aulas" element={<Agenda />} />
                
                {/* Rotas protegidas */}
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/dashboard" element={<Navigate to="/dashboard1" replace />} />
                <Route path="/dashboard2" element={<Dashboard />} />
                <Route path="/dashboard1" element={<Dashboard1 />} />
                <Route path="/overview" element={<Overview />} />
                
                <Route path="/contratos" element={<Contracts />} />
                <Route path="/alunos" element={<Students />} />
                <Route path="/turmas" element={<Classes />} />
                <Route path="/professores" element={<Professors />} />
                {/* Redirecionar para home */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
