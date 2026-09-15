import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Container from '../layout/Container';
import { useAlunos } from './components/useAlunos';
import StudentCard from './components/StudentCard';
import AddStudentModal from './components/AddStudentModal';
import EditStudentModal from './components/EditStudentModal';
import ScheduleModal from './components/ScheduleModal';
import '../agenda/Agenda.css';
import './Students.css';

const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export default function Students() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSchedule, setStudentSchedule] = useState(null);
  const [busca, setBusca] = useState('');

  const {
    alunos,
    loading,
    error,
    filtro,
    setFiltro,
    adicionarAluno,
    editarAluno,
    excluirAluno,
    alternarStatus,
  } = useAlunos();

  if (loading) return <p>Carregando alunos...</p>;
  if (error) return <p>Erro ao carregar alunos: {error}</p>;

  const salvarNovoAluno = async (novoAluno) => {
    try {
      const alunoCriado = await adicionarAluno(novoAluno);
      await Swal.fire({ icon: 'success', title: 'Aluno cadastrado!', text: 'O aluno foi cadastrado com sucesso.', confirmButtonColor: '#0f1f3f' });
      setIsAddModalOpen(false);
      navigate('/contratos', {
        replace: true,
        state: {
          openContractSetup: true,
          alunoCadastro: alunoCriado,
        },
      });
      return alunoCriado;
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'Não foi possível cadastrar', text: error.message || 'Tente novamente.', confirmButtonColor: '#0f1f3f' });
      throw error;
    }
  };

  const salvarEdicaoAluno = async () => {
    try {
      await editarAluno(selectedStudent);
      setSelectedStudent(null);
      await Swal.fire({ icon: 'success', title: 'Aluno atualizado!', text: 'As alterações foram salvas com sucesso.', confirmButtonColor: '#0f1f3f' });
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'Não foi possível salvar', text: error.message || 'Tente novamente.', confirmButtonColor: '#0f1f3f' });
    }
  };

  const excluirAlunoComConfirmacao = async () => {
    const resultado = await Swal.fire({ icon: 'warning', title: 'Excluir aluno?', text: `Tem certeza que deseja excluir o aluno "${selectedStudent.nome}"? Essa ação não pode ser desfeita.`, showCancelButton: true, confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar', confirmButtonColor: '#b91c1c', cancelButtonColor: '#64748b' });
    if (!resultado.isConfirmed) return;
    try {
      await excluirAluno(selectedStudent.id);
      setSelectedStudent(null);
      await Swal.fire({ icon: 'success', title: 'Aluno excluído!', text: 'O aluno foi removido com sucesso.', confirmButtonColor: '#0f1f3f' });
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'Não foi possível excluir', text: error.message || 'Tente novamente.', confirmButtonColor: '#0f1f3f' });
    }
  };

  const buscaNormalizada = normalizar(busca.trim());
  const alunosFiltrados = buscaNormalizada
    ? alunos.filter((aluno) => normalizar(aluno.nome).includes(buscaNormalizada))
    : alunos;

  return (
    <div className="agenda-page students-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        items={[
          { to: '/overview', label: 'Geral', short: 'Geral' },
          { to: '/aulas', label: 'Agenda', short: 'AG' },
          { to: '/dashboard', label: 'Dashboard', short: 'Dash' },
          { to: '/professores', label: 'Professores', short: 'Prof' },
          { to: '/turmas', label: 'Turmas', short: 'Tur' },
          { to: '/alunos', label: 'Alunos', short: 'Alu', active: true },
          { to: '/contratos', label: 'Contratos', short: 'Cont' },
        ]}
      />

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div>
              <h1>Alunos</h1>
            </div>
            <ButtonContainer>
              <input
                type="text"
                placeholder="Buscar aluno por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="student-search-input"
              />
              <Button active={filtro === 'ativos'} onClick={() => setFiltro('ativos')}>
                Ativos
              </Button>
              <Button active={filtro === 'inativos'} onClick={() => setFiltro('inativos')}>
                Inativos
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)}>Adicionar aluno</Button>
            </ButtonContainer>
          </div>

          <div className="agenda-frame">
            <Container
              items={alunosFiltrados}
              className="students-grid"
              getItemKey={(aluno) => aluno.id}
              renderItem={(aluno) => (
                <StudentCard
                  aluno={aluno}
                  onEditar={setSelectedStudent}
                  onVerHorarios={setStudentSchedule}
                  onAlternarStatus={alternarStatus}
                />
              )}
            />
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <AddStudentModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={salvarNovoAluno}
        />
      )}

      {selectedStudent && (
        <EditStudentModal
          aluno={selectedStudent}
          onChange={setSelectedStudent}
          onClose={() => setSelectedStudent(null)}
          onSave={salvarEdicaoAluno}
          onDelete={excluirAlunoComConfirmacao}
        />
      )}

      {studentSchedule && (
        <ScheduleModal aluno={studentSchedule} onClose={() => setStudentSchedule(null)} />
      )}

    </div>
  );
}