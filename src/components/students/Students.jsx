import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Modal from '../layout/Modal';
import Container from '../layout/Container';
import '../agenda/Agenda.css';
import './Students.css';

export default function Students() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAbsences, setStudentAbsences] = useState(null);
  const [studentFilter, setStudentFilter] = useState('ativos');
  const [alunos, setAlunos] = useState([
    {
      id: 1,
      nome: 'Adriano Oliveira Santos',
      email: 'adriano.santos@escola.com',
      telefone: '(11) 98765-4321',
      turma: '3º Ano A',
      diaHorario: 'Segunda-feira, 08:00 - 10:00',
      faltas: [
        'Segunda-feira, dia 03',
        'Segunda-feira, dia 17',
        'Segunda-feira, dia 31'
      ],
      ativo: true
    },
    {
      id: 2,
      nome: 'Mariana Costa Lima',
      email: 'mariana.lima@escola.com',
      telefone: '(11) 97654-3210',
      turma: '2º Ano B',
      diaHorario: 'Terça-feira, 10:00 - 12:00',
      faltas: [
        'Terça-feira, dia 11'
      ],
      ativo: false
    },
    {
      id: 3,
      nome: 'Lucas Almeida Rocha',
      email: 'lucas.rocha@escola.com',
      telefone: '(11) 96543-2109',
      turma: '1º Ano A',
      diaHorario: 'Quarta-feira, 13:00 - 15:00',
      faltas: [],
      ativo: true
    },
    {
      id: 4,
      nome: 'Beatriz Mendes Silva',
      email: 'beatriz.silva@escola.com',
      telefone: '(11) 95432-1098',
      turma: '3º Ano B',
      diaHorario: 'Quinta-feira, 15:00 - 17:00',
      faltas: [
        'Quinta-feira, dia 06',
        'Quinta-feira, dia 20'
      ],
      ativo: false
    }
  ]);

  const abrirModalAdicionar = () => {
    setIsAddModalOpen(true);
  };

  const fecharModalAdicionar = () => {
    setIsAddModalOpen(false);
  };

  const abrirModalEdicao = (aluno) => {
    setSelectedStudent({ ...aluno });
  };

  const fecharModalEdicao = () => {
    setSelectedStudent(null);
  };

  const salvarEdicao = () => {
    setAlunos((items) =>
      items.map((item) =>
        item.id === selectedStudent.id ? selectedStudent : item
      )
    );
    fecharModalEdicao();
  };

  const alterarStatus = (id) => {
    setAlunos((items) =>
      items.map((aluno) =>
        aluno.id === id ? { ...aluno, ativo: !aluno.ativo } : aluno
      )
    );
  };

  const abrirModalFaltas = (aluno) => {
    setStudentAbsences(aluno);
  };

  const fecharModalFaltas = () => {
    setStudentAbsences(null);
  };

  const alunosFiltrados = alunos.filter((aluno) =>
    studentFilter === 'ativos' ? aluno.ativo : !aluno.ativo
  );

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
            <div>
              <h1>Alunos</h1>
            </div>
            <ButtonContainer>
              <Button
                active={studentFilter === 'ativos'}
                onClick={() => setStudentFilter('ativos')}
              >
                Ativos
              </Button>
              <Button
                active={studentFilter === 'inativos'}
                onClick={() => setStudentFilter('inativos')}
              >
                Inativos
              </Button>
              <Button onClick={abrirModalAdicionar}>Adicionar aluno</Button>
            </ButtonContainer>
          </div>

          <div className="agenda-frame">
            <Container
              items={alunosFiltrados}
              className="students-grid"
              getItemKey={(aluno) => aluno.id}
              renderItem={(aluno) => (
                <article className="student-card">
                  <div className="student-card-top">
                    <div className="student-avatar-circle">
                      {aluno.nome
                        .split(' ')
                        .map((nome) => nome[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>

                    <div className="student-main-info">
                      <h3>{aluno.nome}</h3>
                      <p>Aluno</p>
                    </div>

                    <span className={`student-status-pill ${aluno.ativo ? 'ativo' : 'inativo'}`}>
                      {aluno.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="student-meta">
                    <div>
                      <span>Email</span>
                      <strong>{aluno.email}</strong>
                    </div>
                    <div>
                      <span>Turma</span>
                      <strong>{aluno.turma}</strong>
                    </div>
                    <div>
                      <span>Faltas</span>
                      <strong>{aluno.faltas.length}</strong>
                    </div>
                  </div>

                  <ButtonContainer>
                    <Button onClick={() => abrirModalEdicao(aluno)}>Editar</Button>
                    <Button active onClick={() => abrirModalFaltas(aluno)}>Visualizar faltas</Button>
                  </ButtonContainer>
                </article>
              )}
            />
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

      {selectedStudent && (
        <Modal
          title="Editar Aluno"
          onClose={fecharModalEdicao}
          onSave={salvarEdicao}
        >
          <label>Nome:</label>
          <input
            type="text"
            value={selectedStudent.nome}
            onChange={(event) =>
              setSelectedStudent((aluno) => ({ ...aluno, nome: event.target.value }))
            }
          />

          <label>Email:</label>
          <input
            type="text"
            value={selectedStudent.email}
            onChange={(event) =>
              setSelectedStudent((aluno) => ({ ...aluno, email: event.target.value }))
            }
          />

          <label>Telefone:</label>
          <input
            type="text"
            value={selectedStudent.telefone}
            onChange={(event) =>
              setSelectedStudent((aluno) => ({ ...aluno, telefone: event.target.value }))
            }
          />

          <label>Situação:</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={selectedStudent.ativo}
              onChange={(event) =>
                setSelectedStudent((aluno) => ({
                  ...aluno,
                  ativo: event.target.checked
                }))
              }
            />
            <span className="slider" />
          </label>

        </Modal>
      )}

      {studentAbsences && (
        <Modal
          title="Faltas do Aluno"
          onClose={fecharModalFaltas}
          showSave={false}
        >
          <label>Aluno:</label>
          <input type="text" value={studentAbsences.nome} readOnly />

          <label>Turma:</label>
          <input type="text" value={studentAbsences.turma} readOnly />

          <label>Total de faltas: {studentAbsences.faltas.length}</label>
          {studentAbsences.faltas.length > 0 ? (
            <ul className="student-absence-list">
              {studentAbsences.faltas.map((falta) => (
                <li key={falta}>{falta}</li>
              ))}
            </ul>
          ) : (
            <p className="student-no-absences">Nenhuma falta registrada.</p>
          )}
        </Modal>
      )}

    </div>
  );
}
