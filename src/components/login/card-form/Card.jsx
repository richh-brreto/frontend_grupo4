import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "./Card.css";
import Input from "../input/Input";
import Button from "../button/Button";

function Card({ onLoginSuccess }) {
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    useEffect(() => {
        if (location.state?.primeiroAcessoSucesso) {
            Swal.fire({
                icon: "success",
                title: "Senha configurada com sucesso!",
                text: "Agora entre com seu e-mail e sua nova senha.",
                confirmButtonColor: "#0f1f3f",
            });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:8080/login",
                { email, senha },
                { withCredentials: true }
            );

            const token = response.data?.token || response.data?.accessToken || response.data?.jwt;
            if (token) {
                localStorage.setItem("authToken", token);
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            }

            console.log("Login bem-sucedido:", response.data);
            onLoginSuccess(true);
        } catch (error) {
            console.error("Erro no login:", error.response?.data ?? error.message);
            alert("Falha no login. Verifique suas credenciais.");
        }
    }

    return (
        <div className="page">
            <img className="logo" src="src/assets/Boost-White.png" alt="Boost Logo" />
            <form className="card" onSubmit={handleSubmit}>
                <Input
                    label="E-mail"
                    type="email"
                    id="email"
                    placeholder="usuario@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                    label="Senha"
                    type="password"
                    id="senha"
                    placeholder="********"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                />
                <Button type="submit">Entrar</Button>
                <div className="login-first-access-link">
                    Primeiro acesso? <Link to="/primeiro-acesso">Definir senha</Link>
                </div>
            </form>
        </div>
    );
}

export default Card;
