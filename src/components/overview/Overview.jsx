import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Sidebar from '../layout/Sidebar';
import Button from "../layout/Button";
import ButtonContainer from "../layout/ButtonContainer";
import Modal from '../layout/Modal';
import { comunicadosService } from './comunicadosService';
import { useItensMenu } from '../../utils/menuItems';
import { usePermissoes } from '../../utils/permissions';
import '../agenda/Agenda.css';
import './Overview.css';



const TITULO_MAX = 100;
const TEXTO_MAX = 5000;

const mensagemErro = (error, padrao) => error.response?.data?.error || padrao;

const formatarData = (dataIso) => {
  if (!dataIso) return '';

  const data = new Date(dataIso);
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  if (data.toDateString() === hoje.toDateString()) return `Hoje • ${hora}`;
  if (data.toDateString() === ontem.toDateString()) return `Ontem • ${hora}`;
  return `${data.toLocaleDateString('pt-BR')} • ${hora}`;
};

export default function Overview() {
  // A tela de comunicados é a TELA_GERAL; quem a vê pode manter os avisos.
  const { podeAcessar, carregando: carregandoPermissoes } = usePermissoes();
  const podeGerenciar = podeAcessar('TELA_GERAL');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Itens do menu sao filtrados pelas telas liberadas no cadastro do professor
  const itensMenu = useItensMenu('/overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [novoComunicado, setNovoComunicado] = useState({ titulo: '', texto: '' });
  const [comunicados, setComunicados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarComunicados = async () => {
      try {
        setComunicados(await comunicadosService.listar());
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Erro ao carregar',
          text: mensagemErro(error, 'Não foi possível carregar os comunicados.'),
          confirmButtonColor: '#0f1f3f'
        });
      } finally {
        setCarregando(false);
      }
    };

    carregarComunicados();
  }, []);

  const abrirModalAdicionar = () => {
    setIsAddModalOpen(true);
  };

  const fecharModalAdicionar = () => {
    setIsAddModalOpen(false);
    setNovoComunicado({ titulo: '', texto: '' });
  };

  const validarComunicado = async ({ titulo, texto }) => {
    if (!titulo.trim() || !texto.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Preencha os dados',
        text: 'Informe o título e o texto do comunicado.',
        confirmButtonColor: '#0f1f3f'
      });
      return false;
    }
    return true;
  };

  const salvarNovoComunicado = async () => {
    if (!(await validarComunicado(novoComunicado))) return;

    try {
      const criado = await comunicadosService.criar({
        titulo: novoComunicado.titulo.trim(),
        texto: novoComunicado.texto.trim()
      });
      setComunicados((items) => [criado, ...items]);
      fecharModalAdicionar();
      await Swal.fire({
        icon: 'success',
        title: 'Comunicado cadastrado!',
        text: 'O comunicado foi cadastrado com sucesso.',
        confirmButtonColor: '#0f1f3f'
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Erro ao cadastrar',
        text: mensagemErro(error, 'Não foi possível cadastrar o comunicado.'),
        confirmButtonColor: '#0f1f3f'
      });
    }
  };

  const abrirModalEdicao = (comunicado) => {
    setSelectedAnnouncement({ ...comunicado });
  };

  const fecharModalEdicao = () => {
    setSelectedAnnouncement(null);
  };

  const salvarEdicao = async () => {
    if (!(await validarComunicado(selectedAnnouncement))) return;

    try {
      const atualizado = await comunicadosService.atualizar(selectedAnnouncement.id, {
        titulo: selectedAnnouncement.titulo.trim(),
        texto: selectedAnnouncement.texto.trim()
      });
      setComunicados((items) =>
        items.map((item) => (item.id === atualizado.id ? atualizado : item))
      );
      fecharModalEdicao();
      await Swal.fire({
        icon: 'success',
        title: 'Comunicado atualizado!',
        text: 'As alterações foram salvas com sucesso.',
        confirmButtonColor: '#0f1f3f'
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Erro ao atualizar',
        text: mensagemErro(error, 'Não foi possível atualizar o comunicado.'),
        confirmButtonColor: '#0f1f3f'
      });
    }
  };

  const excluirComunicado = async () => {
    const resultado = await Swal.fire({
      icon: 'warning',
      title: 'Excluir comunicado?',
      text: `Tem certeza que deseja excluir o comunicado "${selectedAnnouncement.titulo}"? Essa ação não pode ser desfeita.`,
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b91c1c',
      cancelButtonColor: '#64748b'
    });

    if (!resultado.isConfirmed) return;

    try {
      await comunicadosService.excluir(selectedAnnouncement.id);
      setComunicados((items) => items.filter((item) => item.id !== selectedAnnouncement.id));
      fecharModalEdicao();
      await Swal.fire({
        icon: 'success',
        title: 'Comunicado excluído!',
        text: 'O comunicado foi removido com sucesso.',
        confirmButtonColor: '#0f1f3f'
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Erro ao excluir',
        text: mensagemErro(error, 'Não foi possível excluir o comunicado.'),
        confirmButtonColor: '#0f1f3f'
      });
    }
  };

  return (
    <div className="agenda-page overview-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        items={itensMenu}
        carregando={carregandoPermissoes}
      />

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div>
              <h1>Comunicados</h1>
            </div>
            {podeGerenciar && (
              <ButtonContainer>
                <Button onClick={abrirModalAdicionar}>Adicionar comunicado</Button>
              </ButtonContainer>
            )}
          </div>

          <div className="agenda-frame">
            <div className="overview-board">
              {carregando && <p>Carregando...</p>}
              {!carregando && comunicados.length === 0 && <p>Nenhum comunicado cadastrado.</p>}
              {comunicados.map((item) => (
                <article key={item.id} className="announcement-card">
                  <div className="announcement-header">
                    <h2>{item.titulo}</h2>
                    <ButtonContainer>
                      <span>{formatarData(item.dataCriacao)}</span>
                      {podeGerenciar && (
                        <Button onClick={() => abrirModalEdicao(item)}>Editar</Button>
                      )}
                    </ButtonContainer>
                  </div>
                  <p>{item.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <Modal
          title="Adicionar Comunicado"
          onClose={fecharModalAdicionar}
          onSave={salvarNovoComunicado}
        >
          <label>Título:</label>
          <input
            type="text"
            placeholder="Título"
            maxLength={TITULO_MAX}
            value={novoComunicado.titulo}
            onChange={(event) => setNovoComunicado((item) => ({ ...item, titulo: event.target.value }))}
          />

          <label>Texto:</label>
          <input
            type="text"
            placeholder="Texto"
            maxLength={TEXTO_MAX}
            value={novoComunicado.texto}
            onChange={(event) => setNovoComunicado((item) => ({ ...item, texto: event.target.value }))}
          />

          <Button>Adicionar imagem</Button>
        </Modal>
      )}

      {selectedAnnouncement && (
        <Modal
          title="Editar Comunicado"
          onClose={fecharModalEdicao}
          onSave={salvarEdicao}
          onDelete={excluirComunicado}
        >
          <label>Título:</label>
          <input
            type="text"
            maxLength={TITULO_MAX}
            value={selectedAnnouncement.titulo}
            onChange={(event) =>
              setSelectedAnnouncement((item) => ({
                ...item,
                titulo: event.target.value
              }))
            }
          />

          <label>Texto:</label>
          <input
            type="text"
            maxLength={TEXTO_MAX}
            value={selectedAnnouncement.texto}
            onChange={(event) =>
              setSelectedAnnouncement((item) => ({
                ...item,
                texto: event.target.value
              }))
            }
          />
        </Modal>
      )}

    </div>
  );
}
