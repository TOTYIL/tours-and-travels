import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Phone, Send, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useChat } from '../hooks/useChat';

export default function Support({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'main' | 'enquiry'>('main');
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === 'enquiry') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, view]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage('customer', input);
    setInput('');
  };

  return (
    <div className="w-full flex-grow flex flex-col items-center py-12 px-4 max-w-4xl mx-auto">
      {view === 'main' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-emerald-950 mb-4">How can we help?</h1>
            <p className="text-slate-500">We're here to assist you with your bookings and rides.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <button 
              onClick={() => setView('enquiry')}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-lg transition-all text-center flex flex-col items-center gap-4 group cursor-pointer"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-800 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-950 mb-2">Enquiry</h3>
                <p className="text-sm text-slate-500">Chat with our support team</p>
              </div>
            </button>

            <a 
              href="tel:+919876543210"
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-lg transition-all text-center flex flex-col items-center gap-4 group"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-800 group-hover:scale-110 transition-transform">
                <Phone className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-950 mb-2">Roadside Assistance</h3>
                <p className="text-sm text-slate-500">Call us for immediate help</p>
              </div>
            </a>
          </div>
        </motion.div>
      )}

      {view === 'enquiry' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px] max-h-[70vh]"
        >
          <div className="bg-emerald-900 p-4 flex items-center gap-4">
            <button onClick={() => setView('main')} className="text-white hover:text-emerald-200">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-white">
              <h3 className="font-bold">Support Chat</h3>
              <p className="text-xs text-emerald-200/80">We typically reply in a few minutes</p>
            </div>
          </div>
          
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 text-sm mt-10">
                Send a message to start chatting.
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 text-sm ${m.sender === 'customer' ? 'bg-emerald-800 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm shadow-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
            <button 
              onClick={handleSend}
              className="bg-emerald-800 text-white p-3 rounded-xl hover:bg-emerald-900 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
