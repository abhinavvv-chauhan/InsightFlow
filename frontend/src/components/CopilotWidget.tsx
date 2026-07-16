import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, Send, X, Loader2, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  data?: any[];
};

const CopilotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am the InsightFlow AI Copilot. Ask me anything about your data.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/api/copilot', { question: userMessage });
      const { finding, sql, data, error } = res.data;
      
      if (error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${error}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: finding, sql, data }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Failed to connect to the Copilot API." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-surface border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col z-50"
            style={{ height: '500px', maxHeight: '80vh' }}
          >
            <div className="bg-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Bot size={20} /> AI Copilot
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${
                    m.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-surface border border-white/10 text-white rounded-bl-none'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                    {m.sql && (
                      <div className="mt-2 text-xs bg-black/30 p-2 rounded border border-white/5 font-mono text-muted">
                        <div className="flex items-center gap-1 mb-1 text-primary"><Database size={12}/> SQL</div>
                        {m.sql}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface border border-white/10 p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                    <Loader2 size={16} className="text-primary animate-spin" />
                    <span className="text-sm text-muted">Analyzing data...</span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="p-4 bg-surface border-t border-white/5">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 bg-background border border-white/10 rounded-full px-4 py-2"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="bg-transparent border-none outline-none text-white flex-1 text-sm placeholder:text-muted"
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading}
                  className="text-primary disabled:text-muted disabled:cursor-not-allowed hover:text-primary/80 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 z-50"
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </button>
    </>
  );
};

export default CopilotWidget;
