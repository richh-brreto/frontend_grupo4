import { useEffect, useRef, useState } from 'react';
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
import Pagination from './components/Pagination';
import mostrarCodigoAcesso from '../../utils/mostrarCodigoAcesso';
import { useItensMenu } from '../../utils/menuItems';
import { usePermissoes } from '../../utils/permissions';
import '../agenda/Agenda.css';
import './Students.css';

export default function Students() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Itens do menu sao filtrados pelas telas liberadas no cadastro do professor
  const itensMenu = useItensMenu('/alunos');
  const { carregando: carregandoPermissoes } = usePermissoes();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSchedule, setStudentSchedule] = useState(null);
  const frameRef = useRef(null);

  const {
    alunos,
    loading,
    error,
    filtro,
    setFiltro,
    busca,
    setBusca,
    pagina,
    setPagina,
    tamanhoPagina,
    paginacao,
    recarregar,
    adicionarAluno,
    editarAluno,
    excluirAluno,
    alternarStatus,
  } = useAlunos();

  // Ao trocar de página, a lista nova começa do topo
  useEffect(() => {
    frameRef.current?.scrollTo({ top: 0 });
  }, [pagina]);

  const salvarNovoAluno = async (novoAluno) => {
    try {
      const alunoCriado = await adicionarAluno(novoAluno);
      await mostrarCodigoAcesso({
        nome: alunoCriado.nome,
        codigoAcesso: alunoCriado.codigoAcesso,
      });
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

  const renderizarLista = () => {
    if (error) {
      return (
        <div className="student-list-state">
          <p>Erro ao carregar alunos: {error}</p>
          <Button onClick={recarregar}>Tentar novamente</Button>
        </div>
      );
    }

    if (loading && alunos.length === 0) {
      return <p className="student-list-state">Carregando alunos...</p>;
    }

    if (alunos.length === 0) {
      return (
        <p className="student-list-state">
          {busca.trim()
            ? `Nenhum aluno ${filtro === 'ativos' ? 'ativo' : 'inativo'} encontrado para "${busca.trim()}".`
            : `Nenhum aluno ${filtro === 'ativos' ? 'ativo' : 'inativo'} cadastrado.`}
        </p>
      );
    }

    return (
      <Container
        items={alunos}
        className={`students-grid ${loading ? 'carregando' : ''}`}
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
    );
  };

  return (
    <div className="agenda-page students-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
        items={itensMenu}
        carregando={carregandoPermissoes}
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

          <div className="agenda-frame" ref={frameRef}>
            {renderizarLista()}
          </div>

          {!error && (
            <Pagination
              pagina={pagina}
              totalPaginas={paginacao.totalPages}
              totalItens={paginacao.totalElements}
              tamanhoPagina={tamanhoPagina}
              onChange={setPagina}
              disabled={loading}
            />
          )}
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