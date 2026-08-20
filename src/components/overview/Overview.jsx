import React, { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Button from "../layout/Button";
import ButtonContainer from "../layout/ButtonContainer";
import Modal from '../layout/Modal';
import '../agenda/Agenda.css';
import './Overview.css';

export default function Overview() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [comunicados, setComunicados] = useState([
    {
      titulo: 'Atualização de calendário',
      data: 'Hoje • 08:30',
      texto: 'As aulas da semana estarão reorganizadas para melhor distribuição dos horários.'
    },
    {
      titulo: 'Nova turma disponível',
      data: 'Ontem • 16:10',
      texto: 'Uma nova turma de conversação foi aberta e já está disponível para inscrição.'
    },
    {
      titulo: 'Lembrete de documentação',
      data: 'Ontem • 10:00',
      texto: 'Professores devem enviar os documentos pendentes até o fim da tarde.'
    }
  ]);

  const abrirModalAdicionar = () => {
    setIsAddModalOpen(true);
  };

  const fecharModalAdicionar = () => {
    setIsAddModalOpen(false);
  };

  const abrirModalEdicao = (index) => {
    setSelectedAnnouncement({ ...comunicados[index], index });
  };

  const fecharModalEdicao = () => {
    setSelectedAnnouncement(null);
  };

  const salvarEdicao = () => {
    setComunicados((items) =>
      items.map((item, index) =>
        index === selectedAnnouncement.index
          ? {
              titulo: selectedAnnouncement.titulo,
              data: item.data,
              texto: selectedAnnouncement.texto
            }
          : item
      )
    );
    fecharModalEdicao();
  };

  return (
    <div className="agenda-page overview-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
        items={[
          { to: '/overview', label: 'Geral', short: 'Geral', active: true },
          { to: '/aulas', label: 'Agenda', short: 'AG' },
          { to: '/dashboard1', label: 'Dashboard', short: 'Dash' },
          { to: '/professores', label: 'Professores', short: 'Prof' },
          { to: '/turmas', label: 'Turmas', short: 'Tur' },
          { to: '/alunos', label: 'Alunos', short: 'Alu' },
          { to: '/contratos', label: 'Contratos', short: 'Cont' }
        ]}
      />

      <main className="agenda-content">
        <div className="agenda-panel">
          <div className="agenda-topbar">
            <div>
              <h1>Comunicados</h1>
            </div>
            <ButtonContainer>
              <Button onClick={abrirModalAdicionar}>Adicionar comunicado</Button>
            </ButtonContainer>
          </div>

          <div className="agenda-frame">
            <div className="overview-board">
              {comunicados.map((item, index) => (
                <article key={`${item.titulo}-${index}`} className="announcement-card">
                  <div className="announcement-header">
                    <h2>{item.titulo}</h2>
                    <ButtonContainer>
                      <span>{item.data}</span>
                      <Button onClick={() => abrirModalEdicao(index)}>Editar</Button>
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
        >
          <label>Título:</label>
          <input type="text" placeholder="Título" />

          <label>Texto:</label>
          <input type="text" placeholder="Texto" />

          <Button>Adicionar imagem</Button>
        </Modal>
      )}

      {selectedAnnouncement && (
        <Modal
          title="Editar Comunicado"
          onClose={fecharModalEdicao}
          onSave={salvarEdicao}
        >
          <label>Título:</label>
          <input
            type="text"
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
