import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, HelpCircle, X, MessageCircle } from 'lucide-react';
import api from '../services/api';

const SUGGESTIONS = [
  'Cuales son las tasas de ahorro?',
  'Como solicito un prestamo?',
  'Cual es el horario de atencion?',
  'Que certificados tienen disponibles?',
];

function ChatAgent() {
  const getInitialOpenState = () =>
    (typeof window !== 'undefined' ? window.innerWidth > 1100 : true);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hola! Soy el asistente virtual de CoopEocala. Puedo ayudarte con consultas sobre tus productos, tasas, requisitos y mas. En que te puedo ayudar?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(getInitialOpenState);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat', {
        message: msg,
        history: messages.slice(-10),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu consulta. Por favor intenta de nuevo o contacta a soporte al (809) 544-3140.',
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button className="chat-fab" onClick={() => setIsOpen(true)}>
        <MessageCircle size={22} />
        <span>Asistente</span>
      </button>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <div className="chat-panel__header-left">
          <div className="chat-panel__avatar">
            <Sparkles size={16} />
          </div>
          <div>
            <h3>Asistente CoopEocala</h3>
            <span className="chat-panel__status">En linea</span>
          </div>
        </div>
        <button className="chat-panel__close" onClick={() => setIsOpen(false)}>
          <X size={16} />
        </button>
      </div>

      <div className="chat-panel__messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
            <div className="chat-msg__avatar">
              {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className="chat-msg__bubble">
              {msg.content.split('\n').map((line, j) => (
                <p key={j}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg chat-msg--assistant">
            <div className="chat-msg__avatar"><Bot size={14} /></div>
            <div className="chat-msg__bubble chat-msg__typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="chat-panel__suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chat-suggestion" onClick={() => sendMessage(s)}>
              <HelpCircle size={12} />
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="chat-panel__input">
        <input
          ref={inputRef}
          type="text"
          placeholder="Escribe tu consulta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="chat-send-btn"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

export default ChatAgent;
