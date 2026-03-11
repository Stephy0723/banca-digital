import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../types';
import './Support.css';

const faqs = [
  {
    q: '¿Cómo realizo una transferencia a terceros?',
    a: 'Ve a la sección de Transferencias, selecciona "A terceros", ingresa los datos del beneficiario, el monto y confirma la operación. Las transferencias son procesadas de forma inmediata.',
  },
  {
    q: '¿Cómo activo la autenticación de dos factores?',
    a: 'Dirígete a Seguridad > Autenticación de Dos Factores y haz clic en "Activar 2FA". Puedes usar una app de autenticación, SMS o correo electrónico.',
  },
  {
    q: '¿Cuáles son los límites de transferencia?',
    a: 'Los límites dependen del tipo de cuenta: Cuenta de Ahorro hasta RD$500,000 diarios, Cuenta Corriente hasta RD$1,000,000 diarios. Puedes solicitar un aumento contactando soporte.',
  },
  {
    q: '¿Cómo puedo exportar mis movimientos?',
    a: 'En la sección de Transacciones, utiliza los botones de exportación (CSV o TXT) para descargar tu historial de movimientos filtrado.',
  },
  {
    q: '¿Qué hago si detecto una transacción no reconocida?',
    a: 'Bloquea tu tarjeta inmediatamente desde la sección de Seguridad y contacta soporte a través del chat o llamando al *611. Investigaremos el caso en 24-48 horas.',
  },
];

const botResponses: Record<string, string> = {
  hola: 'Hola! ¿En qué puedo ayudarte hoy? Puedo asistirte con transferencias, pagos, seguridad de tu cuenta y más.',
  transferencia: 'Para realizar una transferencia, ve a la sección "Transferencias" en el menú lateral. Ahí podrás enviar dinero entre tus cuentas o a terceros.',
  contraseña: 'Para cambiar tu contraseña, ve a Seguridad > Cambiar Contraseña. Necesitarás tu contraseña actual y la nueva debe tener mínimo 8 caracteres.',
  tarjeta: 'Puedes gestionar tus tarjetas desde la sección "Cuentas". Si necesitas bloquear tu tarjeta de emergencia, ve a "Seguridad".',
  límite: 'Los límites de transferencia dependen de tu tipo de cuenta. Para solicitar un aumento, puedo escalarlo a un agente humano.',
};

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'agent',
      message: 'Hola! Soy el asistente virtual de Banca Digital. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Bot response
    setTimeout(() => {
      const lower = input.toLowerCase();
      let response = 'Gracias por tu mensaje. Déjame revisar eso para ti. ¿Podrías darme más detalles sobre tu consulta?';

      for (const [key, value] of Object.entries(botResponses)) {
        if (lower.includes(key)) {
          response = value;
          break;
        }
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        message: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page-container support">
      <div className="page-header">
        <h1>Centro de Soporte</h1>
        <p>Encuentra respuestas rápidas o chatea con nuestro asistente</p>
      </div>

      <div className="support__grid">
        <div className="support__help">
          {/* Contact cards */}
          <div className="support__contact-cards">
            <div className="card-elevated support__contact-card">
              <div className="support__contact-icon">📞</div>
              <div className="support__contact-title">Llámanos</div>
              <div className="support__contact-desc">*611 desde tu celular<br />24/7 disponible</div>
            </div>
            <div className="card-elevated support__contact-card">
              <div className="support__contact-icon">📧</div>
              <div className="support__contact-title">Email</div>
              <div className="support__contact-desc">soporte@bancadigital.com<br />Respuesta en 24h</div>
            </div>
            <div className="card-elevated support__contact-card">
              <div className="support__contact-icon">🏢</div>
              <div className="support__contact-title">Sucursal</div>
              <div className="support__contact-desc">Encuentra la más cercana<br />L-V 8am - 5pm</div>
            </div>
          </div>

          {/* FAQ */}
          <div className="card support__faq">
            <div className="support__faq-title">Preguntas Frecuentes</div>
            <div className="support__faq-list">
              {faqs.map((faq, i) => (
                <div key={i} className="support__faq-item">
                  <button
                    className="support__faq-question"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {faq.q}
                    <span className={`support__faq-arrow ${openFaq === i ? 'support__faq-arrow--open' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="support__faq-answer">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="card support__chat">
          <div className="support__chat-header">
            <div className="support__chat-avatar">🤖</div>
            <div className="support__chat-info">
              <div className="support__chat-name">Asistente Virtual</div>
              <div className="support__chat-status">
                <span className="support__chat-status-dot" />
                En línea
              </div>
            </div>
          </div>

          <div className="support__chat-messages">
            {messages.map(msg => (
              <div key={msg.id}>
                <div className={`support__chat-bubble support__chat-bubble--${msg.sender}`}>
                  {msg.message}
                </div>
                <div className="support__chat-time" style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="support__chat-input-area">
            <input
              className="support__chat-input"
              placeholder="Escribe tu mensaje..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className="support__chat-send" onClick={handleSend}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
