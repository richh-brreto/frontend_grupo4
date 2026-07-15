import axios from "axios";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Card from "./components/login/card-form/Card";
import Dashboard from "./components/dashboard/Dashboard";
import Agenda from "./components/agenda/Agenda";
import Contracts from "./components/contracts/Contracts";
import Students from "./components/students/Students";
import Classes from "./components/classes/Classes";
import Professors from "./components/professors/Professors";

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;
const savedToken = localStorage.getItem("authToken");
if (savedToken) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}

function App() {
    const [ isLoggedIn, setIsLoggedIn ] = useState(false);

    return (
        <Router>
            <Routes>
                {/* Rota pública de Agenda */}
                <Route path="/aulas" element={<Agenda />} />
                
                {/* Rotas protegidas */}
                <Route
                    path="/"
                    element={
                        isLoggedIn ? (
                            <Dashboard />
                        ) : (
                            <Card onLoginSuccess={setIsLoggedIn} />
                        )
                    }
                />
                <Route path="/dashboard" element={<Dashboard />} />
                
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
