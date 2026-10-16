import React, { useEffect, useRef, useState } from 'react';
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
const comunicadoInicial = { titulo: '', texto: '', imagem: '' };

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

const obterImagem = (comunicado) => {
  const imagem = comunicado.imagem
    || comunicado.imagemUrl
    || comunicado.image
    || comunicado.urlImagem;

  if (typeof imagem === 'string') return imagem;
  return imagem?.url || imagem?.src || '';
};

function ComunicadoPreview({ comunicado }) {
  return (
    <div className="comunicado-preview">
      <span className="comunicado-preview-label">Pré-visualização</span>
      <article className="comunicado-preview-card">
        <h2>{comunicado.titulo.trim() || 'Título do comunicado'}</h2>
        {obterImagem(comunicado) && (
          <img src={obterImagem(comunicado)} alt="Imagem do comunicado" loading="lazy" />
        )}
        <p>{comunicado.texto.trim() || 'O texto do comunicado aparecerá aqui.'}</p>
      </article>
    </div>
  );
}

export default function Overview() {
  // A tela de comunicados é a TELA_GERAL; quem a vê pode manter os avisos.
  const { podeAcessar, carregando: carregandoPermissoes } = usePermissoes();
  const podeGerenciar = podeAcessar('TELA_GERAL');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Itens do menu sao filtrados pelas telas liberadas no cadastro do professor
  const itensMenu = useItensMenu('/overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [novoComunicado, setNovoComunicado] = useState(comunicadoInicial);
  const [comunicados, setComunicados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const imagemAdicionarRef = useRef(null);
  const imagemEdicaoRef = useRef(null);

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
    setNovoComunicado(comunicadoInicial);
  };

  const selecionarImagem = (arquivo, atualizar) => {
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/')) {
      Swal.fire({
        icon: 'warning',
        title: 'Arquivo inválido',
        text: 'Selecione uma imagem para o comunicado.',
        confirmButtonColor: '#0f1f3f'
      });
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => atualizar((item) => ({ ...item, imagem: leitor.result }));
    leitor.readAsDataURL(arquivo);
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
        texto: novoComunicado.texto.trim(),
        imagem: novoComunicado.imagem || null
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
        texto: selectedAnnouncement.texto.trim(),
        imagem: selectedAnnouncement.imagem || null
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
                  {obterImagem(item) && (
                    <img className="announcement-image" src={obterImagem(item)} alt="Imagem do comunicado" loading="lazy" />
                  )}
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
          className="comunicado-modal"
        >
          <div className="comunicado-editor-layout">
            <div className="comunicado-editor">
              <label htmlFor="novo-comunicado-titulo">Título:</label>
              <input
                id="novo-comunicado-titulo"
                type="text"
                placeholder="Título"
                maxLength={TITULO_MAX}
                value={novoComunicado.titulo}
                onChange={(event) => setNovoComunicado((item) => ({ ...item, titulo: event.target.value }))}
              />

              <label htmlFor="novo-comunicado-texto">Texto:</label>
              <textarea
                id="novo-comunicado-texto"
                placeholder="Escreva o comunicado"
                maxLength={TEXTO_MAX}
                value={novoComunicado.texto}
                onChange={(event) => setNovoComunicado((item) => ({ ...item, texto: event.target.value }))}
              />
              <span className="comunicado-contador">{novoComunicado.texto.length}/{TEXTO_MAX}</span>

              <input
                ref={imagemAdicionarRef}
                className="comunicado-image-input"
                type="file"
                accept="image/*"
                onChange={(event) => selecionarImagem(event.target.files[0], setNovoComunicado)}
              />
              <Button onClick={() => imagemAdicionarRef.current?.click()}>Adicionar imagem</Button>
            </div>
            <ComunicadoPreview comunicado={novoComunicado} />
          </div>
        </Modal>
      )}

      {selectedAnnouncement && (
        <Modal
          title="Editar Comunicado"
          onClose={fecharModalEdicao}
          onSave={salvarEdicao}
          onDelete={excluirComunicado}
          className="comunicado-modal"
        >
          <div className="comunicado-editor-layout">
            <div className="comunicado-editor">
              <label htmlFor="editar-comunicado-titulo">Título:</label>
              <input
                id="editar-comunicado-titulo"
                type="text"
                maxLength={TITULO_MAX}
                value={selectedAnnouncement.titulo}
                onChange={(event) =>
                  setSelectedAnnouncement((item) => ({ ...item, titulo: event.target.value }))
                }
              />

              <label htmlFor="editar-comunicado-texto">Texto:</label>
              <textarea
                id="editar-comunicado-texto"
                maxLength={TEXTO_MAX}
                value={selectedAnnouncement.texto}
                onChange={(event) =>
                  setSelectedAnnouncement((item) => ({ ...item, texto: event.target.value }))
                }
              />
              <span className="comunicado-contador">{selectedAnnouncement.texto.length}/{TEXTO_MAX}</span>

              <input
                ref={imagemEdicaoRef}
                className="comunicado-image-input"
                type="file"
                accept="image/*"
                onChange={(event) => selecionarImagem(event.target.files[0], setSelectedAnnouncement)}
              />
              <Button onClick={() => imagemEdicaoRef.current?.click()}>Adicionar imagem</Button>
            </div>
            <ComunicadoPreview comunicado={selectedAnnouncement} />
          </div>
        </Modal>
      )}

    </div>
  );
}
