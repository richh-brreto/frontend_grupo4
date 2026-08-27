import { useEffect, useState } from 'react';
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
  const [turmas, setTurmas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [horariosSelecionados, setHorariosSelecionados] = useState([]);

  const [novaTurma, setNovaTurma] = useState({
    nome: '',
    nivel: '',
    limiteAlunos: '',
    tipo: ''
  });

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

  useEffect(() => {
    fetch("http://localhost:8080/turmas")
      .then(response => {
        if (!response.ok) {
          throw new Error("Erro ao buscar turmas");
        }

        return response.json();
      })
      .then(data => {
        console.log("Turmas recebidas:", data);
        setTurmas(data);
      })
      .catch(error => {
        console.error("Erro ao buscar as turmas:", error);
      });
  }, []);


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
              <Button onClick={abrirModalAdicionar}>Adicionar turma</Button>
            </ButtonContainer>
          </div>

          <div className="agenda-frame">
            <Container
              items={turmas}
              className="classes-grid"
              getItemKey={(turma) => turma.id}
              renderItem={(turma) => (
                <article key={turma.id} className="class-card">
                  <div className="class-card-head">
                    <div>
                      <h3>{turma.nome}</h3>
                    </div>
                    <span className="status-pill">
                      Em andamento
                    </span>
                  </div>

                  <div className="class-meta">
                    <div>
                      <span>Professor</span>
                      <strong>{turma.nomeProfessor}</strong>
                    </div>

                    <div>
                      <span>Nível</span>
                      <strong>{turma.nivel}</strong>
                    </div>

                    <div>
                      <span>Tipo</span>
                      <strong>{turma.tipo}</strong>
                    </div>

                    <div>
                      <span>Horário</span>
                      <strong>
                        {turma.horarios?.map((horario, index) => (
                          <span key={horario.id}>
                            {index > 0 && ' / '}
                            {horario.diaSemana} das {horario.horaInicio} às {horario.horaFim}
                          </span>
                        ))}
                      </strong>
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
            value={selectedClass.nomeProfessor}
            onChange={(event) =>
              setSelectedClass((turma) => ({ ...turma, nomeProfessor: event.target.value }))
            }
          />

          <label>Horário:</label>
          {selectedClass.horarios?.map((horario) => (
            <input
              key={horario.id}
              type="text"
              value={`${horario.diaSemana} das ${horario.horaInicio} às ${horario.horaFim}`}
              readOnly
            />
          ))}
        </Modal>
      )}

      {classDetails && (
        <Modal
          title={`Detalhes da Turma ${classDetails.nome}`}
          onClose={fecharDetalhes}
          showSave={false}
        >

          <label>Nome:</label>
          <input type="text" value={classDetails.nome} readOnly />

          <label>Nível:</label>
          <input type="text" value={classDetails.nivel} readOnly />

          <label>Tipo:</label>
          <input type="text" value={classDetails.tipo} readOnly />

          <label>Limite de alunos:</label>
          <input type="text" value={classDetails.limiteAlunos} readOnly />

          <label>Professor:</label>
          <input type="text" value={classDetails.nomeProfessor} readOnly />

          <label>Horário:</label>
          {classDetails.horarios?.map((horario) => (
            <input
              key={horario.id}
              type="text"
              value={`${horario.diaSemana} das ${horario.horaInicio} às ${horario.horaFim}`}
              readOnly
            />
          ))}
        </Modal>
      )}

    </div>
  );
}
