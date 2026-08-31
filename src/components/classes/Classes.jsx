import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import Container from '../layout/Container';
import '../agenda/Agenda.css';
import './Classes.css';

export default function Classes() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [classFilter, setClassFilter] = useState('todas');
  const [turmas, setTurmas] = useState([
    {
      id: 1,
      codigo: 'TURMA 10',
      nome: 'Inglês Instrumental',
      professor: 'Adriano Oliveira',
      horario: 'Terça e Quinta • 18:30',
      alunos: '18 alunos',
      sala: 'Sala 2',
      status: 'Ativa'
    },
    {
      id: 2,
      codigo: 'TURMA 12',
      nome: 'Conversação Avançada',
      professor: 'Maria Silva',
      horario: 'Segunda e Quarta • 20:00',
      alunos: '14 alunos',
      sala: 'Sala 4',
      status: 'Em andamento'
    },
    {
      id: 3,
      codigo: 'TURMA 08',
      nome: 'Preparatório para Testes',
      professor: 'Carlos Souza',
      horario: 'Sábado • 09:00',
      alunos: '22 alunos',
      sala: 'Sala 1',
      status: 'Pendente'
    },
    {
      id: 4,
      codigo: 'TURMA 15',
      nome: 'Gramática Aplicada',
      professor: 'Ana Pereira',
      horario: 'Quarta e Sexta • 16:00',
      alunos: '11 alunos',
      sala: 'Sala 3',
      status: 'Ativa'
    }
  ]);

  const abrirModalAdicionar = () => {
    setIsAddModalOpen(true);
  };

  const fecharModalAdicionar = () => {
    setIsAddModalOpen(false);
  };

  const abrirModalEdicao = (turma) => {
    setSelectedClass({ ...turma });
  };

  const fecharModalEdicao = () => {
    setSelectedClass(null);
  };

  const salvarEdicao = () => {
    setTurmas((items) =>
      items.map((item) =>
        item.id === selectedClass.id ? selectedClass : item
      )
    );
    fecharModalEdicao();
  };

  const abrirDetalhes = (turma) => {
    setClassDetails(turma);
  };

  const fecharDetalhes = () => {
    setClassDetails(null);
  };

  const turmasFiltradas = turmas.filter((turma) => {
    if (classFilter === 'em-andamento') {
      return turma.status === 'Em andamento';
    }

    if (classFilter === 'finalizadas') {
      return turma.status === 'Finalizada';
    }

    return true;
  });

  return (
    <div className="agenda-page classes-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        items={[
          { to: '/overview', label: 'Geral', short: 'Geral' },
          { to: '/aulas', label: 'Agenda', short: 'AG' },
          { to: '/dashboard', label: 'Dashboard', short: 'Dash' },
          { to: '/professores', label: 'Professores', short: 'Prof' },
          { to: '/turmas', label: 'Turmas', short: 'Tur', active: true },
          { to: '/alunos', label: 'Alunos', short: 'Alu' },
          { to: '/contratos', label: 'Contratos', short: 'Cont' }
        ]}
      />

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div>
              <h1>Turmas</h1>
            </div>
            <ButtonContainer>
              <Button
                active={classFilter === 'todas'}
                onClick={() => setClassFilter('todas')}
              >
                Todas
              </Button>
              <Button
                active={classFilter === 'em-andamento'}
                onClick={() => setClassFilter('em-andamento')}
              >
                Em andamento
              </Button>
              <Button
                active={classFilter === 'finalizadas'}
                onClick={() => setClassFilter('finalizadas')}
              >
                Finalizadas
              </Button>
              <Button onClick={abrirModalAdicionar}>Adicionar turma</Button>
            </ButtonContainer>
          </div>

          <div className="agenda-frame">
            <Container
              items={turmasFiltradas}
              className="classes-grid"
              getItemKey={(turma) => turma.id}
              renderItem={(turma) => (
                <article key={turma.id} className="class-card">
                  <div className="class-card-head">
                    <div>
                      <p className="class-eyebrow">{turma.codigo}</p>
                      <h3>{turma.nome}</h3>
                    </div>
                    <span className={`status-pill ${turma.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {turma.status}
                    </span>
                  </div>

                  <div className="class-meta">
                    <div>
                      <span>Professor</span>
                      <strong>{turma.professor}</strong>
                    </div>
                    <div>
                      <span>Horário</span>
                      <strong>{turma.horario}</strong>
                    </div>
                    <div>
                      <span>Alunos</span>
                      <strong>{turma.alunos}</strong>
                    </div>
                    <div>
                      <span>Sala</span>
                      <strong>{turma.sala}</strong>
                    </div>
                  </div>

                  <ButtonContainer>
                    <Button onClick={() => abrirModalEdicao(turma)}>Editar</Button>
                    <Button active onClick={() => abrirDetalhes(turma)}>Ver detalhes</Button>
                  </ButtonContainer>
                </article>
              )}
            />
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <Modal
          title="Adicionar Turma"
          onClose={fecharModalAdicionar}
        >
          <label>Nome:</label>
          <input type="text" placeholder="Nome" />

          <label>Nível:</label>
          <input type="text" placeholder="Nível" />

          <label>Limite de alunos:</label>
          <input type="text" placeholder="Limite de alunos" />

          <label>Tipo:</label>
          <input type="text" placeholder="Tipo" />

          <label>Dia e horário</label>
          <input type="text" placeholder="Dia e horário" />
        </Modal>
      )}

      {selectedClass && (
        <Modal
          title="Editar Turma"
          onClose={fecharModalEdicao}
          onSave={salvarEdicao}
        >
          <label>Nome:</label>
          <input
            type="text"
            value={selectedClass.nome}
            onChange={(event) =>
              setSelectedClass((turma) => ({ ...turma, nome: event.target.value }))
            }
          />

          <label>Professor:</label>
          <input
            type="text"
            value={selectedClass.professor}
            onChange={(event) =>
              setSelectedClass((turma) => ({ ...turma, professor: event.target.value }))
            }
          />

          <label>Horário:</label>
          <input
            type="text"
            value={selectedClass.horario}
            onChange={(event) =>
              setSelectedClass((turma) => ({ ...turma, horario: event.target.value }))
            }
          />

          <label>Sala:</label>
          <input
            type="text"
            value={selectedClass.sala}
            onChange={(event) =>
              setSelectedClass((turma) => ({ ...turma, sala: event.target.value }))
            }
          />

          <label>Status:</label>
          <input
            type="text"
            value={selectedClass.status}
            onChange={(event) =>
              setSelectedClass((turma) => ({ ...turma, status: event.target.value }))
            }
          />
        </Modal>
      )}

      {classDetails && (
        <Modal
          title="Detalhes da Turma"
          onClose={fecharDetalhes}
          showSave={false}
        >
          <label>Código:</label>
          <input type="text" value={classDetails.codigo} readOnly />

          <label>Nome:</label>
          <input type="text" value={classDetails.nome} readOnly />

          <label>Professor:</label>
          <input type="text" value={classDetails.professor} readOnly />

          <label>Horário:</label>
          <input type="text" value={classDetails.horario} readOnly />

          <label>Alunos:</label>
          <input type="text" value={classDetails.alunos} readOnly />

          <label>Sala:</label>
          <input type="text" value={classDetails.sala} readOnly />

          <label>Status:</label>
          <input type="text" value={classDetails.status} readOnly />
        </Modal>
      )}

    </div>
  );
}
