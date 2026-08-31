import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import Container from '../layout/Container';
import '../agenda/Agenda.css';
import './Professors.css';

export default function Professors() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [professorProfile, setProfessorProfile] = useState(null);
  const [professorFilter, setProfessorFilter] = useState('todos');
  const [professores, setProfessores] = useState([
    {
  id: 1,
  nome: 'Adriano Oliveira',
  especialidade: 'Inglês Instrumental',
  email: 'adriano@escola.com',
  telefone: '(11) 98765-4321',
  senha: 'adriano123',
  turma: '3º Ano A',
  diaHorario: 'Segunda-feira, 08:00 - 10:00',
  faltas: [
    'Segunda-feira, dia 03',
    'Segunda-feira, dia 17',
    'Segunda-feira, dia 31'
  ],
  carga: '82% da carga',
  aulas: '8 aulas/semana',
  status: 'Disponível',
  ativo: true
},
{
  id: 2,
  nome: 'Maria Silva',
  especialidade: 'Conversação Avançada',
  email: 'maria@escola.com',
  telefone: '(11) 97654-3210',
  senha: 'maria123',
  turma: '2º Ano B',
  diaHorario: 'Terça-feira, 10:00 - 12:00',
  faltas: [
    'Terça-feira, dia 11'
  ],
  carga: '64% da carga',
  aulas: '5 aulas/semana',
  status: 'Em aula',
  ativo: false
},
{
  id: 3,
  nome: 'Carlos Souza',
  especialidade: 'Preparatório para Testes',
  email: 'carlos@escola.com',
  telefone: '(11) 96543-2109',
  senha: 'carlos123',
  turma: '1º Ano A',
  diaHorario: 'Quarta-feira, 13:00 - 15:00',
  faltas: [],
  carga: '91% da carga',
  aulas: '9 aulas/semana',
  status: 'Sobrecarga',
  ativo: true
},
{
  id: 4,
  nome: 'Ana Pereira',
  especialidade: 'Gramática Aplicada',
  email: 'ana@escola.com',
  telefone: '(11) 95432-1098',
  senha: 'ana123',
  turma: '3º Ano B',
  diaHorario: 'Quinta-feira, 15:00 - 17:00',
  faltas: [
    'Quinta-feira, dia 06',
    'Quinta-feira, dia 20'
  ],
  carga: '54% da carga',
  aulas: '4 aulas/semana',
  status: 'Disponível',
  ativo: true
}
  ]);

  const abrirModalAdicionar = () => {
    setIsAddModalOpen(true);
  };

  const fecharModalAdicionar = () => {
    setIsAddModalOpen(false);
  };

  const abrirModalEdicao = (professor) => {
    setSelectedProfessor({ ...professor });
  };

  const fecharModalEdicao = () => {
    setSelectedProfessor(null);
  };

  const salvarEdicao = () => {
    setProfessores((items) =>
      items.map((item) =>
        item.id === selectedProfessor.id ? selectedProfessor : item
      )
    );
    fecharModalEdicao();
  };

  const abrirPerfil = (professor) => {
    setProfessorProfile(professor);
  };

  const fecharPerfil = () => {
    setProfessorProfile(null);
  };

  const professoresFiltrados = professores.filter((professor) => {
    if (professorFilter === 'disponiveis') {
      return professor.status === 'Disponível';
    }

    if (professorFilter === 'indisponiveis') {
      return professor.status !== 'Disponível';
    }

    return true;
  });

  return (
    <div className="agenda-page professors-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        items={[
          { to: '/overview', label: 'Geral', short: 'Geral' },
          { to: '/aulas', label: 'Agenda', short: 'AG' },
          { to: '/dashboard', label: 'Dashboard', short: 'Dash' },
          { to: '/professores', label: 'Professores', short: 'Prof', active: true },
          { to: '/turmas', label: 'Turmas', short: 'Tur' },
          { to: '/alunos', label: 'Alunos', short: 'Alu' },
          { to: '/contratos', label: 'Contratos', short: 'Cont' }
        ]}
      />

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div>
              <h1>Professores</h1>
            </div>
            <ButtonContainer>
              <Button
                active={professorFilter === 'todos'}
                onClick={() => setProfessorFilter('todos')}
              >
                Todos
              </Button>
              <Button
                active={professorFilter === 'disponiveis'}
                onClick={() => setProfessorFilter('disponiveis')}
              >
                Disponíveis
              </Button>
              <Button
                active={professorFilter === 'indisponiveis'}
                onClick={() => setProfessorFilter('indisponiveis')}
              >
                Indisponíveis
              </Button>
              <Button onClick={abrirModalAdicionar}>Adicionar professor</Button>
            </ButtonContainer>
          </div>

          <div className="agenda-frame">
            <Container
              items={professoresFiltrados}
              className="professors-grid"
              getItemKey={(professor) => professor.id}
              renderItem={(professor) => (
                <article className="professor-card">
                  <div className="professor-card-top">
                    <div className="avatar-circle">
                      {professor.nome
                        .split(' ')
                        .map((nome) => nome[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>

                    <div className="professor-main-info">
                      <h3>{professor.nome}</h3>
                      <p>{professor.especialidade}</p>
                    </div>

                    <span
                      className={`status-pill ${professor.status
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {professor.status}
                    </span>
                  </div>

                  <div className="professor-meta">
                    <div>
                      <span>Email</span>
                      <strong>{professor.email}</strong>
                    </div>
                    <div>
                      <span>Carga</span>
                      <strong>{professor.carga}</strong>
                    </div>
                    <div>
                      <span>Aulas</span>
                      <strong>{professor.aulas}</strong>
                    </div>
                  </div>

                  <ButtonContainer>
                    <Button onClick={() => abrirModalEdicao(professor)}>Editar</Button>
                    <Button active onClick={() => abrirPerfil(professor)}>Ver detalhes</Button>
                  </ButtonContainer>
                </article>
              )}
            />
          </div>

        </div>
      </main>

      {isAddModalOpen && (
        <Modal
          title="Adicionar Professor"
          onClose={fecharModalAdicionar}
        >
          <label>Nome:</label>
          <input type="text" placeholder="Nome" />

          <label>Email:</label>
          <input type="text" placeholder="Email" />

          <label>Telefone:</label>
          <input type="text" placeholder="Telefone" />

          <label>Senha:</label>
          <input type="text" placeholder="Senha" />

          <label>Dia e horário</label>
          <input type="text" placeholder="Dia e horário" />
        </Modal>
      )}

      {selectedProfessor && (
        <Modal
          title="Editar Professor"
          onClose={fecharModalEdicao}
          onSave={salvarEdicao}
        >
          <label>Nome:</label>
          <input
            type="text"
            value={selectedProfessor.nome}
            onChange={(event) =>
              setSelectedProfessor((professor) => ({
                ...professor,
                nome: event.target.value
              }))
            }
          />

          <label>Email:</label>
          <input
            type="email"
            value={selectedProfessor.email}
            onChange={(event) =>
              setSelectedProfessor((professor) => ({
                ...professor,
                email: event.target.value
              }))
            }
          />

          <label>Telefone:</label>
          <input
            type="text"
            value={selectedProfessor.telefone}
            onChange={(event) =>
              setSelectedProfessor((professor) => ({
                ...professor,
                telefone: event.target.value
              }))
            }
          />

          <label>Senha:</label>
          <input
            type="text"
            value={selectedProfessor.senha}
            onChange={(event) =>
              setSelectedProfessor((professor) => ({
                ...professor,
                senha: event.target.value
              }))
            }
          />

          <label>Dia e horário:</label>
          <input
            type="text"
            value={selectedProfessor.diaHorario}
            onChange={(event) =>
              setSelectedProfessor((professor) => ({
                ...professor,
                diaHorario: event.target.value
              }))
            }
          />
        </Modal>
      )}

      {professorProfile && (
        <Modal
          title="Perfil do Professor"
          onClose={fecharPerfil}
          showSave={false}
        >
          <label>Nome:</label>
          <input type="text" value={professorProfile.nome} readOnly />

          <label>Especialidade:</label>
          <input type="text" value={professorProfile.especialidade} readOnly />

          <label>Email:</label>
          <input type="email" value={professorProfile.email} readOnly />

          <label>Carga:</label>
          <input type="text" value={professorProfile.carga} readOnly />

          <label>Aulas:</label>
          <input type="text" value={professorProfile.aulas} readOnly />

          <label>Status:</label>
          <input type="text" value={professorProfile.status} readOnly />
        </Modal>
      )}

    </div>
  );
}
