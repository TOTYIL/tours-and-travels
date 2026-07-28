import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useChat } from '../hooks/useChat';

export default function DevChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage('support', input);
    setInput('');
  };

  const unreadCount = messages.filter(m => m.sender === 'customer').length; // very simple notification

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 mb-4 overflow-hidden flex flex-col"
            style={{ height: '450px' }}
          >
            <div className="bg-emerald-950 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Customer Support
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={clearChat} className="text-xs text-emerald-300 hover:text-white px-2 py-1 rounded bg-emerald-900/50">Clear</button>
                <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 text-xs mt-10">
                  Waiting for customer messages...
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'support' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 text-xs ${m.sender === 'support' ? 'bg-emerald-800 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm shadow-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type reply..."
                className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
              <button 
                onClick={handleSend}
                className="bg-emerald-800 text-white p-2 rounded-lg hover:bg-emerald-900 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-emerald-950 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform relative"
      >
        <MessageSquare className="w-6 h-6" />
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
