import { createContext, useContext } from 'react';

export const ChatContext = createContext(null);

export function useChat() {
  const contexto = useContext(ChatContext);

  if (!contexto) {
    throw new Error('useChat precisa ser usado dentro de <ChatProvider>.');
  }

  return contexto;
}
