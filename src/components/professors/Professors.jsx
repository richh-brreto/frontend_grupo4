import { useState } from 'react';
import Swal from 'sweetalert2';
import Sidebar from '../layout/Sidebar';
import Button from '../layout/Button';
import ButtonContainer from '../layout/ButtonContainer';
import Container from '../layout/Container';
import { useProfessores } from './components/useProfessores';
import ProfessorCard from './components/ProfessorCard';
import AddProfessorModal from './components/AddProfessorModal';
import EditProfessorModal from './components/EditProfessorModal';
import ProfessorProfileModal from './components/ProfessorProfileModal';
import mostrarCodigoAcesso from '../../utils/mostrarCodigoAcesso';
import { useItensMenu } from '../../utils/menuItems';
import { usePermissoes } from '../../utils/permissions';
import '../agenda/Agenda.css';
import './Professors.css';



const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export default function Professors() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Itens do menu sao filtrados pelas telas liberadas no cadastro do professor
  const itensMenu = useItensMenu('/professores');
  const { carregando: carregandoPermissoes } = usePermissoes();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [professorProfile, setProfessorProfile] = useState(null);
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
    recarregar,
  } = useProfessores();

  const buscaNormalizada = normalizar(busca.trim());
  const professoresFiltrados = buscaNormalizada
    ? professores.filter((professor) => normalizar(professor.nome).includes(buscaNormalizada))
    : professores;

  const abrirModalEdicao = (professor) => {
    setSelectedProfessor({ ...professor });
  };

  const salvarNovoProfessor = async (professor) => {
    try {
      const professorCriado = await adicionarProfessor(professor);
      await mostrarCodigoAcesso({
        nome: professorCriado.nome,
        codigoAcesso: professorCriado.codigoAcesso,
      });
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'Não foi possível cadastrar', text: error.message || 'Tente novamente.', confirmButtonColor: '#0f1f3f' });
      throw error;
    }
  };

  const salvarEdicaoProfessor = async (dados) => {
    try {
      await editarProfessor({ ...selectedProfessor, ...dados });
      setSelectedProfessor(null);
      await Swal.fire({ icon: 'success', title: 'Professor atualizado!', text: 'As alterações foram salvas com sucesso.', confirmButtonColor: '#0f1f3f' });
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'Não foi possível salvar', text: error.response?.data?.message || error.message || 'Tente novamente.', confirmButtonColor: '#0f1f3f' });
      throw error;
    }
  };

  const alternarStatusComAviso = async (professor) => {
    try {
      await alternarStatus(professor);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Não foi possível alterar o status',
        text: error.response?.data?.message || error.message || 'Tente novamente.',
        toast: true,
        position: 'top-end',
        timer: 4000,
        showConfirmButton: false,
      });
    }
  };

  const excluirProfessorComConfirmacao = async () => {
    const resultado = await Swal.fire({ icon: 'warning', title: 'Excluir professor?', text: `Tem certeza que deseja excluir o professor "${selectedProfessor.nome}"? Essa ação não pode ser desfeita.`, showCancelButton: true, confirmButtonText: 'Sim, excluir', cancelButtonText: 'Cancelar', confirmButtonColor: '#b91c1c', cancelButtonColor: '#64748b' });
    if (!resultado.isConfirmed) return;
    try {
      await excluirProfessor(selectedProfessor.id);
      setSelectedProfessor(null);
      await Swal.fire({ icon: 'success', title: 'Professor excluído!', text: 'O professor foi removido com sucesso.', confirmButtonColor: '#0f1f3f' });
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'Não foi possível excluir', text: error.message || 'Tente novamente.', confirmButtonColor: '#0f1f3f' });
    }
  };

  const renderizarLista = () => {
    if (loading) {
      return (
        <div className="professors-loading" aria-label="Carregando professores">
          {[1, 2, 3, 4].map((item) => <div key={item} className="professor-skeleton" />)}
        </div>
      );
    }

    if (error) {
      return (
        <div className="professor-list-state">
          <strong>Não foi possível carregar os professores.</strong>
          <span>{error}</span>
          <Button onClick={recarregar}>Tentar novamente</Button>
        </div>
      );
    }

    if (professoresFiltrados.length === 0) {
      return (
        <div className="professor-list-state">
          <strong>{buscaNormalizada ? 'Nenhum professor encontrado.' : 'Nenhum professor nesta lista.'}</strong>
          <span>
            {buscaNormalizada
              ? `Não encontramos resultados para "${busca.trim()}".`
              : 'Cadastre um professor ou alterne entre ativos e inativos.'}
          </span>
          {buscaNormalizada && <Button onClick={() => setBusca('')}>Limpar busca</Button>}
          {!buscaNormalizada && <Button onClick={() => setFiltro(filtro === 'ativos' ? 'inativos' : 'ativos')}>Ver {filtro === 'ativos' ? 'inativos' : 'ativos'}</Button>}
        </div>
      );
    }

    return (
      <Container
        items={professoresFiltrados}
        className="professors-grid"
        getItemKey={(professor) => professor.id}
        renderItem={(professor) => (
          <ProfessorCard
            professor={professor}
            onEditar={abrirModalEdicao}
            onVerPerfil={setProfessorProfile}
            onAlternarStatus={alternarStatusComAviso}
          />
        )}
      />
    );
  };

  return (
    <div className="agenda-page professors-page">
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
            {renderizarLista()}
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <AddProfessorModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={salvarNovoProfessor}
        />
      )}

      {selectedProfessor && (
        <EditProfessorModal
          professor={selectedProfessor}
          onChange={setSelectedProfessor}
          onClose={() => setSelectedProfessor(null)}
          onSave={salvarEdicaoProfessor}
          onDelete={excluirProfessorComConfirmacao}
        />
      )}

      {professorProfile && (
        <ProfessorProfileModal professor={professorProfile} onClose={() => setProfessorProfile(null)} />
      )}

    </div>
  );
}
