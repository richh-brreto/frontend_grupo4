import { useState } from "react";
import axios from "axios";
import "./Card.css";
import Input from "../input/Input";
import Button from "../button/Button";

function Card() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    async function handleSubmit() {
        try {
            const response = await axios.post("http://localhost:8080/login", { email, senha });
            console.log("Login bem-sucedido:", response.data);
        } catch (error) {
            console.error("Erro no login:", error.response?.data ?? error.message);
        }
    }

    return (
        <div className="page">
            <div className="card">
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
                <Button onClick={handleSubmit}>Entrar</Button>
            </div>
        </div>
    );
}

export default Card;
