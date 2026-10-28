import { useEffect, useState } from "react";
import axios from "../../../utils/axiosConfig";
import { useLocation, Link } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../../../assets/Boost-White.png";
import { definirUsuarioAtual, registrarSessao, salvarPermissoes } from "../../../utils/permissions";
import "./Card.css";
import Input from "../input/Input";
import Button from "../button/Button";

function Card({ onLoginSuccess }) {
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [entrando, setEntrando] = useState(false);

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
        if (entrando) return;

        setErro("");
        setEntrando(true);

        try {
            const response = await axios.post(
                "/login",
                { email, senha }
            );

            // O token chega no cookie HttpOnly; o corpo traz as telas liberadas
            const token = response.data?.token || response.data?.accessToken || response.data?.jwt;
            if (token) {
                localStorage.setItem("authToken", token);
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            }

            salvarPermissoes(response.data?.permissoes ?? []);
            definirUsuarioAtual(response.data, email);
            registrarSessao();

            onLoginSuccess(true);
        } catch (error) {
            console.error("Erro no login:", error.response?.data ?? error.message);
            setErro("E-mail ou senha inválidos. Confira os dados e tente novamente.");
        } finally {
            setEntrando(false);
        }
    }

    return (
        <div className="login-page">
            <img className="login-logo" src={logo} alt="Boost Logo" />
            <form className="login-card" onSubmit={handleSubmit}>
                <Input
                    label="E-mail"
                    type="email"
                    id="email"
                    placeholder="usuario@email.com"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setErro("");
                    }}
                />
                <Input
                    label="Senha"
                    type="password"
                    id="senha"
                    placeholder="********"
                    value={senha}
                    onChange={(e) => {
                        setSenha(e.target.value);
                        setErro("");
                    }}
                />
                {erro && <p className="login-error" role="alert">{erro}</p>}
                <Button type="submit" disabled={entrando}>
                    {entrando ? "Entrando..." : "Entrar"}
                </Button>
                <div className="login-first-access-link">
                    Primeiro acesso? <Link to="/primeiro-acesso">Definir senha</Link>
                </div>
            </form>
        </div>
    );
}

export default Card;
