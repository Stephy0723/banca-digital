import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../types';
import { Phone, Mail, Building2, ChevronDown, Bot, Send } from 'lucide-react';
import './Support.css';

const faqs = [
  {
    q: '¿Cómo me hago socio de CoopEocala?',
    a: 'Puedes registrarte desde la plataforma digital o visitando nuestra oficina en Av. Gustavo Mejia Ricart No. 71, Edificio Caromang, Local 207, Piantini, Santo Domingo. Necesitarás tu cédula y un depósito inicial en aportaciones.',
  },
  {
    q: '¿Qué tipos de ahorro ofrece CoopEocala?',
    a: 'Ofrecemos: Ahorro Eocala (libre), Ahorro en Aportaciones, Ahorro Infantil, Ahorro Vía Nómina, Ahorro Programado y Certificados de Depósito a Plazo Fijo con tasas competitivas.',
  },
  {
    q: '¿Cómo solicito un préstamo de nómina?',
    a: 'Ve a la sección de Pagos > Préstamos o visita nuestra oficina. Los préstamos de nómina se descuentan directamente de tu salario. Puedes calcular tu cuota con nuestra calculadora en línea.',
  },
  {
    q: '¿Cómo funciona el financiamiento de vehículos?',
    a: 'Financiamos hasta el 80% del valor del vehículo con plazos de hasta 60 meses. Incluye seguro vehicular. Consulta las tasas y requisitos en nuestra oficina o con el asistente virtual.',
  },
  {
    q: '¿Qué servicios puedo pagar desde la plataforma?',
    a: 'Puedes pagar electricidad, agua, internet, teléfono, cable TV, gas, seguros de vehículo y salud, cuotas de préstamos, marbetes vehiculares, recargas telefónicas y servicios de factoring.',
  },
  {
    q: '¿Cuál es el horario de atención?',
    a: 'Lunes a viernes de 9:00 AM a 5:30 PM y sábados de 9:00 AM a 12:30 PM. La plataforma digital está disponible 24/7.',
  },
];

const botResponses: Record<string, string> = {
  hola: 'Hola! Soy el asistente de CoopEocala. Puedo ayudarte con ahorros, préstamos, aportaciones, seguros, recargas y más.',
  transferencia: 'Para realizar una transferencia, ve a la sección "Transferencias" en el menú lateral. Puedes enviar dinero entre tus cuentas de ahorro o a terceros.',
  contraseña: 'Para cambiar tu contraseña, ve a Seguridad > Cambiar Contraseña. Necesitarás tu contraseña actual y la nueva debe tener mínimo 8 caracteres.',
  préstamo: 'CoopEocala ofrece préstamos de nómina, préstamos personales y financiamiento de vehículos hasta 80% del valor. Puedes calcular tu cuota desde la plataforma.',
  ahorro: 'Tenemos varias opciones: Ahorro Eocala, Ahorro Programado, Ahorro Infantil, Ahorro Vía Nómina y Certificados de Depósito a Plazo Fijo.',
  aportación: 'Las aportaciones son tu participación como socio en la cooperativa. Son obligatorias y representan tu capital social en CoopEocala.',
  vehículo: 'Ofrecemos financiamiento vehicular hasta el 80% del valor con plazos de hasta 60 meses, más seguro y marbete incluidos.',
  seguro: 'Vendemos seguros de vehículos y puedes pagarlos directamente desde tu cuenta de ahorro. Consulta las opciones disponibles.',
  marbete: 'Puedes comprar tu marbete vehicular desde la sección de Pagos > Servicios. Es rápido y seguro.',
  recarga: 'Las recargas telefónicas están disponibles en la sección de Pagos > Recargas para todas las operadoras.',
};

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'agent',
      message: 'Hola! Soy el asistente virtual de CoopEocala. ¿En qué puedo ayudarte hoy?',
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
              <div className="support__contact-icon"><Phone size={22} /></div>
              <div className="support__contact-title">Llámanos</div>
              <div className="support__contact-desc">(809) 544-3140<br />(809) 443-3140</div>
            </div>
            <div className="card-elevated support__contact-card">
              <div className="support__contact-icon"><Mail size={22} /></div>
              <div className="support__contact-title">Email</div>
              <div className="support__contact-desc">soporte@coopeocala.com<br />Respuesta en 24h</div>
            </div>
            <div className="card-elevated support__contact-card">
              <div className="support__contact-icon"><Building2 size={22} /></div>
              <div className="support__contact-title">Oficina</div>
              <div className="support__contact-desc">Piantini, Santo Domingo<br />L-V 9am - 5:30pm, S 9am - 12:30pm</div>
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
                      <ChevronDown size={16} />
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
            <div className="support__chat-avatar"><Bot size={22} /></div>
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
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
