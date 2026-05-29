import { useState } from "react";
import axios from "axios";
import "./ClassRegistration.css";
import Input from "../login/input/Input";
import Button from "../login/button/Button";

export default function ClassRegistration({ onBack }) {
  const [nome, setNome] = useState("");
  const [nivel, setNivel] = useState("");
  const [tipo, setTipo] = useState("");
  const [limiteAlunos, setLimiteAlunos] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!nome || !nivel || !tipo || !limiteAlunos) {
      alert("Por favor, preencha todos os campos para cadastrar a turma.");
      return;
    }

    const turma = {
      nome,
      nivel,
      tipo,
      limiteAlunos: Number(limiteAlunos),
      horariosIds: [1],
    };

    try {
      const config = {
        withCredentials: true,
        headers: {},
      };

      const savedToken = localStorage.getItem("authToken");
      if (savedToken) {
        config.headers.Authorization = `Bearer ${savedToken}`;
      }

      await axios.post("http://localhost:8080/turmas", turma, config);
      alert("Turma cadastrada com sucesso!");
      setNome("");
      setNivel("");
      setTipo("");
      setLimiteAlunos("");
    } catch (error) {
      console.error("Erro ao cadastrar turma:", error.response?.data ?? error.message);
      alert("Falha ao cadastrar turma. Verifique os dados e tente novamente.");
    }
  }

  return (
    <div className="page registration-page">
      <div className="registration-card">
        <div className="registration-header">
          <div>
            <h2>Cadastrar Turma</h2>
            <p>Preencha os dados abaixo para criar uma nova turma.</p>
          </div>
          <button type="button" className="backButton" onClick={onBack}>
            Voltar
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <Input
            label="Nome"
            type="text"
            id="nome"
            placeholder="Nome da turma"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Input
            label="Nível"
            type="text"
            id="nivel"
            placeholder="Básico, Intermediário, Avançado"
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
          />
          <Input
            label="Tipo"
            type="text"
            id="tipo"
            placeholder="Individual em Grupo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          />
          <Input
            label="Limite de Alunos"
            type="number"
            id="limiteAlunos"
            placeholder="10"
            value={limiteAlunos}
            onChange={(e) => setLimiteAlunos(e.target.value)}
          />
          <Button type="submit">Cadastrar Turma</Button>
        </form>
      </div>
    </div>
  );
}
