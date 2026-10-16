import { useCallback, useMemo, useState } from 'react';
import { ChatContext } from './chatContext';

export default function ChatProvider({ children }) {
  const [aberto, setAberto] = useState(false);
  const [modo, setModo] = useState('PERGUNTA');
  const [periodo, setPeriodo] = useState({ inicio: '', fim: '' });
  const [relatorioSolicitacao, setRelatorioSolicitacao] = useState(0);

  const abrirChat = useCallback(() => {
    setModo('PERGUNTA');
    setAberto(true);
  }, []);

  const abrirRelatorio = useCallback((escolhido = {}) => {
    setPeriodo({
      inicio: escolhido.dataInicio ?? escolhido.inicio ?? '',
      fim: escolhido.dataFim ?? escolhido.fim ?? ''
    });
    setModo('RELATORIO');
    setRelatorioSolicitacao((atual) => atual + 1);
    setAberto(true);
  }, []);

  const fecharChat = useCallback(() => setAberto(false), []);
  const alternarChat = useCallback(() => setAberto((atual) => !atual), []);

  const value = useMemo(() => ({
    aberto,
    modo,
    periodo,
    relatorioSolicitacao,
    abrirChat,
    abrirRelatorio,
    fecharChat,
    alternarChat
  }), [aberto, modo, periodo, relatorioSolicitacao, abrirChat, abrirRelatorio, fecharChat, alternarChat]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
