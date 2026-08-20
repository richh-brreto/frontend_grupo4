import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import Container from '../layout/Container';
import '../agenda/Agenda.css';
import './Contracts.css';

export default function Contracts() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractFilter, setContractFilter] = useState('ativos');
  const [contratos, setContratos] = useState([
    {
      id: 0,
      tipo: 'Mensal',
      dataInicio: '2026-07-01',
      dataFim: '2026-12-31',
      turma: { id: 1, nome: 'Turma 10' },
      professor: { id: 1, nome: 'Adriano Oliveira' },
      aluno: { id: 1, nome: 'Adriano Oliveira', ativo: true },
      horarios: []
    },
    {
      id: 1,
      tipo: 'Aula Avulsa',
      dataInicio: '2026-07-10',
      dataFim: '2026-07-10',
      turma: { id: 2, nome: 'Turma 5' },
      professor: { id: 2, nome: 'Maria Silva' },
      aluno: { id: 2, nome: 'Maria Silva', ativo: false },
      horarios: []
    },
    {
      id: 2,
      tipo: 'Mensal',
      dataInicio: '2026-06-01',
      dataFim: '2026-12-01',
      turma: { id: 3, nome: 'Turma 8' },
      professor: { id: 3, nome: 'Carlos Souza' },
      aluno: { id: 3, nome: 'Carlos Souza', ativo: true },
      horarios: []
    }
  ]);

  const abrirModalAdicionar = () => {
    setIsAddModalOpen(true);
  };

  const fecharModalAdicionar = () => {
    setIsAddModalOpen(false);
  };

  const abrirModalEdicao = (contrato) => {
    setSelectedContract({
      ...contrato,
      turma: { ...contrato.turma },
      professor: { ...contrato.professor },
      aluno: { ...contrato.aluno }
    });
  };

  const fecharModalEdicao = () => {
    setSelectedContract(null);
  };

  const salvarEdicao = () => {
    setContratos((items) =>
      items.map((item) =>
        item.id === selectedContract.id ? selectedContract : item
      )
    );
    fecharModalEdicao();
  };

  const contratosFiltrados = contratos.filter((contrato) =>
    contractFilter === 'ativos' ? contrato.aluno.ativo : !contrato.aluno.ativo
  );

  return (
    <div className={`agenda-page contracts-page`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        items={[
          { to: '/overview', label: 'Geral', short: 'Geral' },
          { to: '/aulas', label: 'Agenda', short: 'AG' },
          { to: '/dashboard', label: 'Dashboard', short: 'Dash' },
          { to: '/professores', label: 'Professores', short: 'Prof' },
          { to: '/turmas', label: 'Turmas', short: 'Tur' },
          { to: '/alunos', label: 'Alunos', short: 'Alu' },
          { to: '/contratos', label: 'Contratos', short: 'Cont', active: true }
        ]}
      />

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div>
              <h1>Contratos</h1>
            </div>
            <ButtonContainer>
              <Button
                active={contractFilter === 'ativos'}
                onClick={() => setContractFilter('ativos')}
              >
                Ativos
              </Button>
              <Button
                active={contractFilter === 'inativos'}
                onClick={() => setContractFilter('inativos')}
              >
                Inativos
              </Button>
              <Button onClick={abrirModalAdicionar}>Adicionar Contrato</Button>
            </ButtonContainer>
          </div>

          <div className="agenda-frame">
            <Container
              items={contratosFiltrados}
              className="contracts-grid"
              getItemKey={(contrato) => contrato.id}
              renderItem={(contrato) => (
                <article className="contract-card">
                  <div className="contract-card-head">
                    <div>
                      <p className="contract-eyebrow">Contrato {contrato.id + 1}</p>
                      <h3>{contrato.tipo}</h3>
                    </div>
                    <span className={`contract-status-pill ${contrato.aluno.ativo ? 'ativo' : 'inativo'}`}>
                      {contrato.aluno.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="contract-meta">
                    <div>
                      <span>Turma</span>
                      <strong>{contrato.turma.nome}</strong>
                    </div>
                    <div>
                      <span>Aluno</span>
                      <strong>{contrato.aluno.nome}</strong>
                    </div>
                    <div>
                      <span>Professor</span>
                      <strong>{contrato.professor.nome}</strong>
                    </div>
                    <div>
                      <span>Vigência</span>
                      <strong>{contrato.dataInicio} a {contrato.dataFim}</strong>
                    </div>
                  </div>

                  <ButtonContainer>
                    <Button active onClick={() => abrirModalEdicao(contrato)}>Editar</Button>
                  </ButtonContainer>
                </article>
              )}
            />
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <Modal
          title="Adicionar Contrato"
          onClose={fecharModalAdicionar}
        >
          <label>Data início:</label>
          <input type="text" placeholder="Data início" />

          <label>Data fim:</label>
          <input type="text" placeholder="Data fim" />

          <label>Tipo:</label>
          <input type="text" placeholder="Tipo" />

          <label>Aluno:</label>
          <input type="text" placeholder="Aluno" />

          <label>Professor:</label>
          <input type="text" placeholder="Professor" />

          <label>Dia e horário</label>
          <input type="text" placeholder="Dia e horário" />
        </Modal>
      )}

      {selectedContract && (
        <Modal
          title="Editar Contrato"
          onClose={fecharModalEdicao}
          onSave={salvarEdicao}
        >
          <label>Tipo:</label>
          <input
            type="text"
            value={selectedContract.tipo}
            onChange={(event) =>
              setSelectedContract((contrato) => ({ ...contrato, tipo: event.target.value }))
            }
          />

          <label>Aluno:</label>
          <input
            type="text"
            value={selectedContract.aluno.nome}
            onChange={(event) =>
              setSelectedContract((contrato) => ({
                ...contrato,
                aluno: { ...contrato.aluno, nome: event.target.value }
              }))
            }
          />

          <label>Professor:</label>
          <input
            type="text"
            value={selectedContract.professor.nome}
            onChange={(event) =>
              setSelectedContract((contrato) => ({
                ...contrato,
                professor: { ...contrato.professor, nome: event.target.value }
              }))
            }
          />

          <label>Data início:</label>
          <input
            type="date"
            value={selectedContract.dataInicio}
            onChange={(event) =>
              setSelectedContract((contrato) => ({ ...contrato, dataInicio: event.target.value }))
            }
          />

          <label>Data fim:</label>
          <input
            type="date"
            value={selectedContract.dataFim}
            onChange={(event) =>
              setSelectedContract((contrato) => ({ ...contrato, dataFim: event.target.value }))
            }
          />
        </Modal>
      )}

    </div>
  );
}
