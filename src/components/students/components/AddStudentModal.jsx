import { useRef, useState } from 'react';
import Swal from 'sweetalert2';
import Modal from '../../layout/Modal';

const NIVEIS = [
  "Selecione um nível de inglês",
  "A1 - Iniciante",
  "A2 - Iniciante-intermediário",
  "B1 - Intermediário",
  "B2 - Intermediário-avançado",
  "C1 - Avançado",
  "C2 - Proficiente"
  ];

const ESTADO_INICIAL = {
  nome: '',
  email: '',
  telefone: '',
  nivel: NIVEIS[0],
  horariosIds: [0]
};

export default function AddStudentModal({ onClose, onSave }) {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const salvandoRef = useRef(false);

  const temAlteracoes = () => {
    return form.nome.trim() !== '' || form.email.trim() !== '' || form.telefone.trim() !== '' || form.nivel !== NIVEIS[0];
  };

  const handleFechar = async () => {
    if (salvandoRef.current) return;
    if (temAlteracoes()) {
      const resultado = await Swal.fire({
        icon: 'warning',
        title: 'Alterações não salvas',
        text: 'Você tem alterações não salvas. Deseja realmente sair sem salvar?',
        showCancelButton: true,
        confirmButtonText: 'Sim, sair sem salvar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#b91c1c',
        cancelButtonColor: '#64748b'
      });
      if (!resultado.isConfirmed) return;
    }
    onClose();
  };

  const atualizarCampo = (campo) => (event) =>
    setForm((atual) => ({ ...atual, [campo]: event.target.value }));

  const handleSalvar = async () => {
    if (salvandoRef.current) return;
    const telefoneNumeros = form.telefone.replace(/\D/g, '');
    const camposInvalidos = [];

    if (!form.nome.trim()) camposInvalidos.push('nome');
    if (!form.email.trim() || !form.email.includes('@') || !form.email.includes('.')) {
      camposInvalidos.push('e-mail');
    }
    if (![10, 11].includes(telefoneNumeros.length)) {
      camposInvalidos.push('telefone com DDD');
    }
    if (!form.nivel || form.nivel === NIVEIS[0]) camposInvalidos.push('nível de inglês');

    if (camposInvalidos.length > 0) {
      const campos = camposInvalidos.join(', ').replace(/, ([^,]*)$/, ' e $1');
      const mensagem = `Verifique os seguintes campos: ${campos}.`;
      setErro(mensagem);
      await Swal.fire({
        icon: 'error',
        title: 'Dados inválidos',
        text: mensagem,
        confirmButtonColor: '#0f1f3f'
      });
      return;
    }

    const payload = {
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      nivel: form.nivel,
      horariosIds: [0]
    };

    salvandoRef.current = true;
    setSalvando(true);
    setErro(null);

    onSave(payload)
      .then(() => onClose())
      .catch((err) => setErro(err.message))
      .finally(() => {
        salvandoRef.current = false;
        setSalvando(false);
      });
  };

  return (
    <Modal title="Adicionar Aluno" onClose={handleFechar} onSave={handleSalvar} saving={salvando}>
      <label>Nome:</label>
      <input type="text" placeholder="Nome" value={form.nome} onChange={atualizarCampo('nome')} />

      <label>Email:</label>
      <input type="email" placeholder="Email" value={form.email} onChange={atualizarCampo('email')} />

      <label>Telefone:</label>
      <input type="tel" placeholder="Telefone" value={form.telefone} onChange={atualizarCampo('telefone')} />

      <label>Nível:</label>
      <select value={form.nivel} onChange={atualizarCampo('nivel')}>
        {NIVEIS.map((nivel) => (
          <option key={nivel} value={nivel}>
            {nivel}
          </option>
        ))}
      </select>
      {erro && <p className="student-form-error">{erro}</p>}
      {salvando && <p>Salvando...</p>}
    </Modal>
  );
}