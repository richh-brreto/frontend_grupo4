import { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import Modal from '../../layout/Modal';

const NIVEIS = [
  'Selecione um nível de inglês',
  'A1 - Iniciante',
  'A2 - Iniciante-intermediário',
  'B1 - Intermediário',
  'B2 - Intermediário-avançado',
  'C1 - Avançado',
  'C2 - Proficiente'
];

export default function EditStudentModal({ aluno, onClose, onSave, onChange, onDelete }) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const alunoInicialRef = useRef({
    nome: aluno.nome ?? '',
    email: aluno.email ?? '',
    telefone: aluno.telefone ?? '',
    nivel: aluno.nivel ?? NIVEIS[0],
  });

  const temAlteracoes = () => {
    return (
      (aluno.nome ?? '') !== alunoInicialRef.current.nome ||
      (aluno.email ?? '') !== alunoInicialRef.current.email ||
      (aluno.telefone ?? '') !== alunoInicialRef.current.telefone ||
      (aluno.nivel ?? NIVEIS[0]) !== alunoInicialRef.current.nivel
    );
  };

  const handleFechar = async () => {
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

  const handleSalvar = async () => {
    const telefoneNumeros = (aluno.telefone || '').replace(/\D/g, '');
    const camposInvalidos = [];

    if (!aluno.nome?.trim()) camposInvalidos.push('nome');
    if (!aluno.email?.trim() || !aluno.email.includes('@') || !aluno.email.includes('.')) {
      camposInvalidos.push('e-mail');
    }
    if (![10, 11].includes(telefoneNumeros.length)) {
      camposInvalidos.push('telefone com DDD');
    }
    if (!aluno.nivel || aluno.nivel === NIVEIS[0]) camposInvalidos.push('nível de inglês');

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

    setSalvando(true);
    setErro(null);
    try {
      await onSave(aluno);
      onClose();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      title="Editar Aluno"
      onClose={handleFechar}
      onSave={handleSalvar}
      onDelete={onDelete}
      saveLabel={salvando ? 'Salvando...' : 'Salvar'}
    >
      <label>Nome:</label>
      <input
        type="text"
        value={aluno.nome}
        onChange={(e) => onChange({ ...aluno, nome: e.target.value })}
      />

      <label>Email:</label>
      <input
        type="text"
        value={aluno.email}
        onChange={(e) => onChange({ ...aluno, email: e.target.value })}
      />

      <label>Telefone:</label>
      <input
        type="text"
        value={aluno.telefone}
        onChange={(e) => onChange({ ...aluno, telefone: e.target.value })}
      />

      <label>Nível:</label>
      <select
        value={aluno.nivel ?? NIVEIS[0]}
        onChange={(e) => onChange({ ...aluno, nivel: e.target.value })}
      >
        {NIVEIS.map((nivel) => (
          <option key={nivel} value={nivel}>
            {nivel}
          </option>
        ))}
      </select>
      {erro && <p className="student-form-error">{erro}</p>}
    </Modal>
  );
}
