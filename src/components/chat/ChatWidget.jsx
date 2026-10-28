import { useCallback, useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Swal from 'sweetalert2';
import { chatService } from './chatService';
import { useChat } from './chatContext';
import { usePermissoes, useUsuarioAtual } from '../../utils/permissions';
import './ChatWidget.css';

const mensagemErro = (error, padrao) => error.response?.data?.error || padrao;

export default function ChatWidget() {
  const { podeAcessar } = usePermissoes();
  const { ehAdministrador } = useUsuarioAtual();
  const { aberto, modo, periodo, relatorioSolicitacao, abrirChat, fecharChat } = useChat();

  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [baixando, setBaixando] = useState(false);

  const solicitacaoTratada = useRef(0);
  const fimListaRef = useRef(null);

  const adicionarMensagem = useCallback((autor, conteudo) => {
    setMensagens((atuais) => [
      ...atuais,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        autor,
        ...conteudo
      }
    ]);
  }, []);

  const executarRelatorio = useCallback(async () => {
    setCarregando(true);
    try {
      const resposta = await chatService.gerarRelatorio();
      adicionarMensagem('bot', { texto: resposta?.resposta || 'Sem resposta.' });
    } catch (error) {
      adicionarMensagem('bot', { erro: mensagemErro(error, 'Não foi possível gerar o relatório.') });
    } finally {
      setCarregando(false);
    }
  }, [adicionarMensagem]);

  const pedirResposta = useCallback(async (pergunta) => {
    setCarregando(true);
    try {
      const resposta = await chatService.perguntar(pergunta);
      adicionarMensagem('bot', { texto: resposta?.resposta || 'Sem resposta.' });
    } catch (error) {
      adicionarMensagem('bot', { erro: mensagemErro(error, 'Não foi possível consultar o assistente.') });
    } finally {
      setCarregando(false);
    }
  }, [adicionarMensagem]);

  useEffect(() => {
    if (!aberto || modo !== 'RELATORIO') return;
    if (relatorioSolicitacao === 0 || relatorioSolicitacao === solicitacaoTratada.current) return;

    solicitacaoTratada.current = relatorioSolicitacao;
    executarRelatorio();
  }, [aberto, modo, relatorioSolicitacao, executarRelatorio]);

  useEffect(() => {
    fimListaRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, carregando, aberto]);

  const enviarPergunta = (event) => {
    event.preventDefault();

    const pergunta = texto.trim();
    if (!pergunta || carregando) return;

    adicionarMensagem('usuario', { texto: pergunta });
    setTexto('');
    pedirResposta(pergunta);
  };

  const baixarCsv = async () => {
    setBaixando(true);
    try {
      await chatService.baixarCsv(periodo);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Erro ao baixar',
        text: mensagemErro(error, 'Não foi possível baixar o CSV.'),
        confirmButtonColor: '#0f1f3f'
      });
    } finally {
      setBaixando(false);
    }
  };

  const limparConversa = () => setMensagens([]);

  if (!ehAdministrador || !podeAcessar('TELA_DASHBOARD')) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={`chat-fab ${aberto ? 'aberto' : ''}`}
        onClick={aberto ? fecharChat : abrirChat}
        aria-label={aberto ? 'Fechar assistente' : 'Abrir assistente'}
      >
        {aberto ? '×' : 'Chat IA'}
      </button>

      {aberto && (
        <section className="chat-panel" aria-label="Assistente de dados">
          <header className="chat-header">
            <div className="chat-header-info">
              <strong>Assistente de dados</strong>
              <span>{modo === 'RELATORIO' ? 'Relatório da dashboard' : 'Pergunte sobre a dashboard'}</span>
            </div>
            <button
              type="button"
              className="chat-close"
              onClick={fecharChat}
              aria-label="Fechar assistente"
            >
              ×
            </button>
          </header>

          <div className="chat-toolbar">
            <button
              type="button"
              className="chat-secondary"
              onClick={baixarCsv}
              disabled={baixando}
            >
              {baixando ? 'Baixando...' : 'Baixar CSV'}
            </button>
            <button
              type="button"
              className="chat-secondary"
              onClick={limparConversa}
              disabled={carregando || mensagens.length === 0}
            >
              Limpar
            </button>
          </div>

          <div className="chat-messages">
            {mensagens.length === 0 && !carregando && (
              <p className="chat-empty">
                Pergunte algo sobre a carga dos professores ou peça o relatório.
              </p>
            )}

            {mensagens.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.autor}`}>
                {msg.autor === 'bot' ? (
                  msg.erro ? (
                    <p className="chat-error">{msg.erro}</p>
                  ) : (
                    <div className="chat-markdown">
                      <Markdown remarkPlugins={[remarkGfm]}>{msg.texto}</Markdown>
                    </div>
                  )
                ) : (
                  <p>{msg.texto}</p>
                )}
              </div>
            ))}

            {carregando && (
              <div className="chat-message bot">
                <span className="chat-typing"><i /><i /><i /></span>
              </div>
            )}

            <div ref={fimListaRef} />
          </div>

          <form className="chat-input" onSubmit={enviarPergunta}>
            <input
              type="text"
              placeholder="Escreva sua pergunta..."
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              disabled={carregando}
            />
            <button type="submit" disabled={carregando || !texto.trim()}>
              Enviar
            </button>
          </form>
        </section>
      )}
    </>
  );
}
