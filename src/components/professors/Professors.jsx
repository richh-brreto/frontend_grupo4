import { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Container from '../layout/Container';
import { useProfessores } from './components/useProfessores';
import ProfessorCard from './components/ProfessorCard';
import AddProfessorModal from './components/AddProfessorModal';
import EditProfessorModal from './components/EditProfessorModal';
import ProfessorProfileModal from './components/ProfessorProfileModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import '../agenda/Agenda.css';
import './Professors.css';

const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export default function Professors() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [professorProfile, setProfessorProfile] = useState(null);
  const [professorParaExcluir, setProfessorParaExcluir] = useState(null);
  const [busca, setBusca] = useState('');

  const {
    professores,
    loading,
    error,
    filtro,
    setFiltro,
    adicionarProfessor,
    editarProfessor,
    excluirProfessor,
    alternarStatus,
  } = useProfessores();

  if (loading) return <p>Carregando professores...</p>;
  if (error) return <p>Erro ao carregar professores: {error}</p>;

  const buscaNormalizada = normalizar(busca.trim());
  const professoresFiltrados = buscaNormalizada
    ? professores.filter((professor) => normalizar(professor.nome).includes(buscaNormalizada))
    : professores;

  const abrirModalEdicao = (professor) => {
    setSelectedProfessor({ ...professor, idTipoProfessor: professor.tipo?.id ?? '' });
  };

  return (
    <div className="agenda-page professors-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        items={[
          { to: '/overview', label: 'Geral', short: 'Geral' },
          { to: '/aulas', label: 'Agenda', short: 'AG' },
          { to: '/dashboard', label: 'Dashboard', short: 'Dash' },
          { to: '/professores', label: 'Professores', short: 'Prof', active: true },
          { to: '/turmas', label: 'Turmas', short: 'Tur' },
          { to: '/alunos', label: 'Alunos', short: 'Alu' },
          { to: '/contratos', label: 'Contratos', short: 'Cont' },
        ]}
      />

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div>
              <h1>Professores</h1>
            </div>
            <ButtonContainer>
              <input
                type="text"
                placeholder="Buscar professor por nome..."
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                className="professor-search-input"
              />
              <Button active={filtro === 'ativos'} onClick={() => setFiltro('ativos')}>
                Ativos
              </Button>
              <Button active={filtro === 'inativos'} onClick={() => setFiltro('inativos')}>
                Inativos
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)}>Adicionar professor</Button>
            </ButtonContainer>
          </div>

          <div className="agenda-frame">
            <Container
              items={professoresFiltrados}
              className="professors-grid"
              getItemKey={(professor) => professor.id}
              renderItem={(professor) => (
                <ProfessorCard
                  professor={professor}
                  onEditar={abrirModalEdicao}
                  onVerPerfil={setProfessorProfile}
                  onExcluir={setProfessorParaExcluir}
                  onAlternarStatus={alternarStatus}
                />
              )}
            />
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <AddProfessorModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={adicionarProfessor}
        />
      )}

      {selectedProfessor && (
        <EditProfessorModal
          professor={selectedProfessor}
          onChange={setSelectedProfessor}
          onClose={() => setSelectedProfessor(null)}
          onSave={() => editarProfessor(selectedProfessor).then(() => setSelectedProfessor(null))}
        />
      )}

      {professorProfile && (
        <ProfessorProfileModal professor={professorProfile} onClose={() => setProfessorProfile(null)} />
      )}

      {professorParaExcluir && (
        <DeleteConfirmModal
          professor={professorParaExcluir}
          onClose={() => setProfessorParaExcluir(null)}
          onConfirm={() =>
            excluirProfessor(professorParaExcluir.id).then(() => setProfessorParaExcluir(null))
          }
        />
      )}
    </div>
  );
}
