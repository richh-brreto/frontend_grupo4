import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import '../agenda/Agenda.css';
import './Students.css';

export default function Students() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const abrirModalAdicionar = () => {
    setIsAddModalOpen(true);
  };

  const fecharModalAdicionar = () => {
    setIsAddModalOpen(false);
  };

  const alunos = new Array(4).fill(0).map((_, i) => ({
    id: i,
    nome: 'Adriano Oliveira Santos',
    faltas: 3,
    ativo: i % 2 === 0
  }));

  return (
    <div className={`agenda-page students-page`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        items={[
          { to: '/overview', label: 'Geral', short: 'Geral' },
          { to: '/aulas', label: 'Agenda', short: 'AG' },
          { to: '/dashboard', label: 'Dashboard', short: 'Dash' },
          { to: '/professores', label: 'Professores', short: 'Prof' },
          { to: '/turmas', label: 'Turmas', short: 'Tur' },
          { to: '/alunos', label: 'Alunos', short: 'Alu', active: true },
          { to: '/contratos', label: 'Contratos', short: 'Cont' }
        ]}
      />

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div />
            <ButtonContainer>
              <Button active>Ativos</Button>
              <Button>Inativos</Button>
              <Button onClick={abrirModalAdicionar}>Adicionar aluno</Button>
            </ButtonContainer>
          </div>

          <div className="agenda-frame">
            <div style={{ padding: '22px 36px', display: 'grid', gap: 18 }}>
              {alunos.map(a => (
                <div key={a.id} className="student-row">
                  <div className="student-left">
                    <div className="student-text">Aluno: {a.nome} | Faltas: {a.faltas} |</div>
                    <div className="student-ativo">
                      <span className="ativo-label">Ativo</span>
                      <label className="switch">
                        <input type="checkbox" defaultChecked={a.ativo} />
                        <span className="slider" />
                      </label>
                    </div>
                  </div>

                  <ButtonContainer>
                    <Button>Editar</Button>
                    <Button>Visualizar faltas</Button>
                  </ButtonContainer>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <Modal
          title="Adicionar Aluno"
          onClose={fecharModalAdicionar}
        >
          <label>Nome:</label>
          <input type="text" placeholder="Nome" />

          <label>Email:</label>
          <input type="text" placeholder="Email" />

          <label>Telefone:</label>
          <input type="text" placeholder="Telefone" />

          <label>Nível:</label>
          <input type="text" placeholder="Nível" />

          <label>Dia e horário</label>
          <input type="text" placeholder="Dia e horário" />
        </Modal>
      )}

    </div>
  );
}
