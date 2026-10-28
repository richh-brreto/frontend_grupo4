import axios from "./utils/axiosConfig";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/home/Home";
import Card from "./components/login/card-form/Card";
import FirstAccess from "./components/first-access/FirstAccess";
import Dashboard from "./components/dashboard1/Dashboard1";
import Agenda from "./components/agenda/Agenda";
import Contracts from "./components/contracts/Contracts";
import Students from "./components/students/Students";
import Classes from "./components/classes/Classes.jsx";
import Professors from "./components/professors/Professors";
import Overview from "./components/overview/Overview";
import ChatProvider from "./components/chat/ChatProvider";
import ChatWidget from "./components/chat/ChatWidget";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import { primeiraRotaLiberada } from "./utils/menuItems";
import { usePermissoes, temSessao } from "./utils/permissions";

// Bloqueia a rota quando o professor não tem a permissão da tela.
// O menu some o item, mas sem isto daria para abrir a URL na mão.
function RotaProtegida({ permissao, children }) {
    const { permissoes, carregando, podeAcessar } = usePermissoes();

    if (carregando) {
        return <p className="app-status">Carregando...</p>;
    }

    if (podeAcessar(permissao)) {
        return children;
    }

    const destino = primeiraRotaLiberada(permissoes);

    // Sem nenhuma tela liberada não há para onde mandar: avisa em vez de loopar redirecionamento
    return destino ? <Navigate to={destino} replace /> : <p className="app-status">Você não tem nenhuma tela liberada.</p>;
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(temSessao());

    return (
        <Router>
            <ChatProvider>
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
                <Route path="/primeiro-acesso" element={<FirstAccess />} />

                {/* Rotas protegidas por tela */}
                {isLoggedIn && (
                    <Route element={<ProtectedLayout />}>
                        <Route
                            path="/aulas"
                            element={
                                <RotaProtegida permissao="TELA_AGENDA">
                                    <Agenda />
                                </RotaProtegida>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <RotaProtegida permissao="TELA_DASHBOARD">
                                    <Dashboard />
                                </RotaProtegida>
                            }
                        />
                        <Route
                            path="/overview"
                            element={
                                <RotaProtegida permissao="TELA_GERAL">
                                    <Overview />
                                </RotaProtegida>
                            }
                        />
                        <Route
                            path="/contratos"
                            element={
                                <RotaProtegida permissao="TELA_CONTRATOS">
                                    <Contracts />
                                </RotaProtegida>
                            }
                        />
                        <Route
                            path="/alunos"
                            element={
                                <RotaProtegida permissao="TELA_ALUNOS">
                                    <Students />
                                </RotaProtegida>
                            }
                        />
                        <Route
                            path="/turmas"
                            element={
                                <RotaProtegida permissao="TELA_TURMAS">
                                    <Classes />
                                </RotaProtegida>
                            }
                        />
                        <Route
                            path="/professores"
                            element={
                                <RotaProtegida permissao="TELA_PROFESSORES">
                                    <Professors />
                                </RotaProtegida>
                            }
                        />
                    </Route>
                )}

                {/* Sem sessão, qualquer rota protegida cai no login */}
                <Route
                    path="*"
                    element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />}
                />
            </Routes>
            {isLoggedIn && <ChatWidget />}
            </ChatProvider>
        </Router>
    );
}

export default App;
