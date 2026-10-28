import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Container from '../layout/Container';
import { useAlunos } from './components/useAlunos';
import StudentCard from './components/StudentCard';
import AddStudentModal from './components/AddStudentModal';
import EditStudentModal from './components/EditStudentModal';
import ScheduleModal from './components/ScheduleModal';
import Pagination from './components/Pagination';
import { contratosService } from '../contracts/contratosService';
import { turmasService } from '../classes/turmasService';
import { useUsuarioAtual } from '../../utils/permissions';
import { contratoPertenceAoProfessor } from '../../utils/escopoProfessor';
import mostrarSucesso from '../../utils/mostrarSucesso';
import '../agenda/Agenda.css';
import './Students.css';

export default function Students() {
  const navigate = useNavigate();
  const { professorId, ehAdministrador } = useUsuarioAtual();
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
  } = useAlunos({ professorId, ehAdministrador });

  // Ao trocar de página, a lista nova começa do topo
  useEffect(() => {
    frameRef.current?.scrollTo({ top: 0 });
  }, [pagina]);

  const salvarNovoAluno = async (novoAluno) => {
    try {
      const alunoCriado = await adicionarAluno(novoAluno);
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
      await mostrarSucesso({ title: 'Aluno atualizado!', text: 'As alterações foram salvas com sucesso.' });
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'Não foi possível salvar', text: error.message || 'Tente novamente.', confirmButtonColor: '#0f1f3f' });
    }
  };

  const verHorariosAluno = async (aluno) => {
    try {
      const [resposta, turmasResposta] = await Promise.all([
        contratosService.listar(),
        ehAdministrador ? Promise.resolve([]) : turmasService.listar(),
      ]);
      const contratos = Array.isArray(resposta)
        ? resposta
        : Array.isArray(resposta?.content)
          ? resposta.content
          : [];
      const turmas = Array.isArray(turmasResposta)
        ? turmasResposta
        : Array.isArray(turmasResposta?.content)
          ? turmasResposta.content
          : [];
      const contratosDoAluno = contratos.filter((contrato) =>
        String(contrato.aluno?.id ?? contrato.alunoId) === String(aluno.id)
        && (ehAdministrador || contratoPertenceAoProfessor(contrato, professorId, turmas))
      );
      const horarios = contratosDoAluno.flatMap((contrato) =>
        (contrato.horarios ?? (contrato.horario ? [contrato.horario] : [])).map((horario) => ({
          ...horario,
          tipoContrato: contrato.tipo === 'grupo' ? 'Em grupo' : 'Individual',
          responsavel: contrato.tipo === 'grupo'
            ? contrato.turma?.nome || 'Turma não informada'
            : contrato.professor?.nome
              ? `Professor(a) ${contrato.professor.nome}`
              : 'Professor(a) não informado',
          dataInicioContrato: contrato.dataInicio,
          dataFimContrato: contrato.dataFim,
        }))
      );

      setStudentSchedule({ ...aluno, horarios });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Não foi possível carregar as informações',
        text: error.message || 'Tente novamente.',
        confirmButtonColor: '#0f1f3f',
      });
    }
  };

  const excluirAlunoComConfirmacao = async () => {
    const resultado = await Swal.fire({ icon: 'warning', title: 'Excluir aluno?', text: `Tem certeza que deseja excluir o aluno "${selectedStudent.nome}"? Essa ação não pode ser desfeita.`, showCancelButton: true, confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar', confirmButtonColor: '#b91c1c', cancelButtonColor: '#64748b' });
    if (!resultado.isConfirmed) return;
    try {
      await excluirAluno(selectedStudent.id);
      setSelectedStudent(null);
      await mostrarSucesso({ title: 'Aluno excluído!', text: 'O aluno foi removido com sucesso.' });
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
            onVerHorarios={verHorariosAluno}
            onAlternarStatus={alternarStatus}
          />
        )}
      />
    );
  };

  return (
    <>
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
                className="class-search-input"
              />
              <div className="filter-segment" role="group" aria-label="Filtrar alunos por status">
                <Button variant={filtro === 'ativos' ? 'primary' : 'secondary'} aria-pressed={filtro === 'ativos'} onClick={() => setFiltro('ativos')}>
                  Ativos
                </Button>
                <Button variant={filtro === 'inativos' ? 'primary' : 'secondary'} aria-pressed={filtro === 'inativos'} onClick={() => setFiltro('inativos')}>
                  Inativos
                </Button>
              </div>
              <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>Adicionar aluno</Button>
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

    </>
  );
}