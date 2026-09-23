import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Input from '../login/input/Input';
import Button from '../login/button/Button';
import './FirstAccess.css';

export default function FirstAccess() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    codigoAcesso: '',
    novaSenha: '',
    confirmacaoSenha: '',
  });
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const atualizarCampo = (campo) => (event) => {
    setErro(null);
    setForm((atual) => ({ ...atual, [campo]: event.target.value }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setErro(null);

    if (form.novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (form.novaSenha !== form.confirmacaoSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setEnviando(true);
    try {
      await axios.post('http://localhost:8080/first-access', {
        email: form.email,
        codigoAcesso: form.codigoAcesso,
        novaSenha: form.novaSenha,
        confirmacaoSenha: form.confirmacaoSenha,
      });
      navigate('/login', { replace: true, state: { primeiroAcessoSucesso: true } });
    } catch (error) {
      setErro(error.response?.data?.error || 'Não foi possível concluir o primeiro acesso. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="page first-access-page">
      <img className="logo" src="src/assets/Boost-White.png" alt="Boost Logo" />

      <form className="card first-access-card" onSubmit={handleSubmit}>
        <h1 className="first-access-title">Primeiro Acesso</h1>
        <p className="first-access-subtitle">
          Informe seu e-mail e o código de acesso recebido para cadastrar a sua senha.
        </p>

        <Input
          label="E-mail"
          type="email"
          id="primeiro-acesso-email"
          placeholder="usuario@email.com"
          value={form.email}
          onChange={atualizarCampo('email')}
        />
        <Input
          label="Código de acesso"
          id="primeiro-acesso-codigo"
          placeholder="Código recebido"
          value={form.codigoAcesso}
          onChange={atualizarCampo('codigoAcesso')}
        />
        <Input
          label="Nova senha"
          type="password"
          id="primeiro-acesso-nova-senha"
          placeholder="Mínimo de 6 caracteres"
          value={form.novaSenha}
          onChange={atualizarCampo('novaSenha')}
        />
        <Input
          label="Confirmar nova senha"
          type="password"
          id="primeiro-acesso-confirmacao"
          placeholder="Repita a nova senha"
          value={form.confirmacaoSenha}
          onChange={atualizarCampo('confirmacaoSenha')}
        />

        {erro && <p className="first-access-error">{erro}</p>}

        <Button type="submit">
          {enviando ? 'Enviando...' : 'Definir senha'}
        </Button>

        <div className="first-access-login-link">
          Já possui senha? <Link to="/login">Entrar</Link>
        </div>
      </form>
    </div>
  );
}