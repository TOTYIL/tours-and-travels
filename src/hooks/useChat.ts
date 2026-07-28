import { useState, useEffect } from 'react';

export type ChatMessage = {
  id: string;
  sender: 'customer' | 'support';
  text: string;
  timestamp: number;
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const stored = localStorage.getItem('support_chats');
        if (stored) {
          setMessages(JSON.parse(stored));
        }
      } catch (e) {}
    };
    load();

    const handler = (e: StorageEvent) => {
      if (e.key === 'support_chats') {
        load();
      }
    };
    window.addEventListener('storage', handler);
    
    // Poll to ensure same-tab updates work too
    const interval = setInterval(load, 1000);

    return () => {
      window.removeEventListener('storage', handler);
      clearInterval(interval);
    };
  }, []);

  const sendMessage = (sender: 'customer' | 'support', text: string) => {
    try {
      const stored = localStorage.getItem('support_chats');
      const current = stored ? JSON.parse(stored) : [];
      const newMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        sender,
        text,
        timestamp: Date.now()
      };
      const updated = [...current, newMsg];
      localStorage.setItem('support_chats', JSON.stringify(updated));
      setMessages(updated);
    } catch (e) {}
  };

  const clearChat = () => {
    localStorage.removeItem('support_chats');
    setMessages([]);
  };

  return { messages, sendMessage, clearChat };
}
