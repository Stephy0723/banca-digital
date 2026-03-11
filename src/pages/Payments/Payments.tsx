import { useState } from 'react';
import { paymentServices, accounts, formatCurrency } from '../../data/mockData';
import type { PaymentService } from '../../types';
import Icon from '../../components/IconMap';
import { CheckCircle, X } from 'lucide-react';
import './Payments.css';

const recentPayments = [
  { icon: 'zap', name: 'Electricidad - EDENORTE', date: '09 Mar 2026', amount: 3450, color: '#f59e0b' },
  { icon: 'droplets', name: 'Agua - CAASD', date: '08 Mar 2026', amount: 1200, color: '#3b82f6' },
  { icon: 'wifi', name: 'Internet - Claro', date: '07 Mar 2026', amount: 2500, color: '#8b5cf6' },
  { icon: 'credit', name: 'Tarjeta de Crédito', date: '05 Mar 2026', amount: 15000, color: '#7c3aed' },
];

export default function Payments() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedService, setSelectedService] = useState<PaymentService | null>(null);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = ['Todos', ...new Set(paymentServices.map(s => s.category))];

  const filteredServices = activeCategory === 'Todos'
    ? paymentServices
    : paymentServices.filter(s => s.category === activeCategory);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setShowSuccess(true);
  };

  const handleClose = () => {
    setShowSuccess(false);
    setSelectedService(null);
    setAmount('');
    setReference('');
  };

  return (
    <div className="page-container payments">
      <div className="page-header">
        <h1>Pagos de Servicios</h1>
        <p>Paga tus servicios, tarjetas y préstamos en un solo lugar</p>
      </div>

      {/* Categories */}
      <div className="payments__categories">
        {categories.map(cat => (
          <button
            key={cat}
            className={`payments__category-btn ${activeCategory === cat ? 'payments__category-btn--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services grid */}
      <div className="payments__services-grid">
        {filteredServices.map(service => (
          <div
            key={service.id}
            className="card payments__service-card"
            onClick={() => setSelectedService(service)}
          >
            <div
              className="payments__service-icon"
              style={{ background: `${service.color}15`, color: service.color }}
            >
              <Icon name={service.icon} size={22} />
            </div>
            <div className="payments__service-name">{service.name}</div>
            <div className="payments__service-category">{service.category}</div>
          </div>
        ))}
      </div>

      {/* Recent payments */}
      <div className="card payments__recent">
        <div className="payments__recent-title">Pagos Recientes</div>
        <div className="payments__recent-list">
          {recentPayments.map((payment, i) => (
            <div key={i} className="payments__recent-item">
              <div className="payments__recent-icon" style={{ background: `${payment.color}15`, color: payment.color }}>
                <Icon name={payment.icon} size={18} />
              </div>
              <div className="payments__recent-info">
                <div className="payments__recent-name">{payment.name}</div>
                <div className="payments__recent-date">{payment.date}</div>
              </div>
              <div className="payments__recent-amount">-{formatCurrency(payment.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment modal */}
      {selectedService && !showSuccess && (
        <div className="payments__modal-overlay" onClick={() => setSelectedService(null)}>
          <form className="payments__modal" onClick={e => e.stopPropagation()} onSubmit={handlePay}>
            <div className="payments__modal-header">
              <div className="payments__modal-title">
                <Icon name={selectedService.icon} size={18} /> Pagar {selectedService.name}
              </div>
              <button type="button" className="payments__modal-close" onClick={() => setSelectedService(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="payments__form-group">
              <label className="payments__form-label">Cuenta a debitar</label>
              <select className="input" style={{ appearance: 'none' }}>
                {accounts.filter(a => a.balance > 0).map(a => (
                  <option key={a.id} value={a.id}>{a.name} - {formatCurrency(a.balance)}</option>
                ))}
              </select>
            </div>

            <div className="payments__form-group">
              <label className="payments__form-label">Número de referencia / contrato</label>
              <input
                className="input"
                placeholder="Ej: 123456789"
                value={reference}
                onChange={e => setReference(e.target.value)}
              />
            </div>

            <div className="payments__form-group">
              <label className="payments__form-label">Monto a pagar (RD$)</label>
              <input
                className="input"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{ fontSize: '1.1rem', fontWeight: 700 }}
              />
            </div>

            <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: 8, padding: 14 }}>
              Confirmar Pago
            </button>
          </form>
        </div>
      )}

      {/* Success modal */}
      {showSuccess && (
        <div className="payments__modal-overlay" onClick={handleClose}>
          <div className="payments__modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 16 }}>
              <CheckCircle size={48} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div className="payments__modal-title" style={{ justifyContent: 'center', fontSize: '1.25rem', marginBottom: 8 }}>
              Pago Exitoso
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
              Se pagaron {formatCurrency(parseFloat(amount))} a {selectedService?.name}.
              <br />Referencia: PAG-{Date.now().toString().slice(-8)}
            </p>
            <button className="btn btn-primary" onClick={handleClose}>Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
}
