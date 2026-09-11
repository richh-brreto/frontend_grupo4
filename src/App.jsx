import axios from "axios";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/home/Home";
import Card from "./components/login/card-form/Card";
import Dashboard from "./components/dashboard1/Dashboard1";
import Agenda from "./components/agenda/Agenda";
import Contracts from "./components/contracts/Contracts";
import Students from "./components/students/Students";
import Classes from "./components/classes/Classes.jsx";
import Professors from "./components/professors/Professors";
import Overview from "./components/overview/Overview";

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;
const savedToken = localStorage.getItem("authToken");
if (savedToken) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!savedToken);

    return (
        <Router>
            <Routes>
                {/* Rotas públicas */}
                <Route path="/" element={<Home />} />
                <Route
                    path="/login"
                    element={
                        isLoggedIn ? (
                            <Navigate to="/overview" replace />
                        ) : (
                            <Card onLoginSuccess={() => setIsLoggedIn(true)} />
                        )
                    }
                />

                {/* Rotas protegidas */}
                {isLoggedIn && (
                    <>
                        <Route path="/aulas" element={<Agenda />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/overview" element={<Overview />} />
                        <Route path="/contratos" element={<Contracts />} />
                        <Route path="/alunos" element={<Students />} />
                        <Route path="/turmas" element={<Classes />} />
                        <Route path="/professores" element={<Professors />} />
                    </>
                )}

                {/* Sem sessão, qualquer rota protegida cai no login */}
                <Route
                    path="*"
                    element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />}
                />
            </Routes>
        </Router>
    );
}

export default App;
