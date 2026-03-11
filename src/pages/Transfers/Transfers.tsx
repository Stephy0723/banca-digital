import { useState } from 'react';
import { accounts, formatCurrency } from '../../data/mockData';
import './Transfers.css';

const recentContacts = [
  { name: 'Juan Pérez', bank: 'Banco Popular', color: '#3b82f6', lastAmount: 15000 },
  { name: 'María López', bank: 'Banreservas', color: '#8b5cf6', lastAmount: 25000 },
  { name: 'Carlos Reyes', bank: 'BHD León', color: '#10b981', lastAmount: 8000 },
  { name: 'Ana García', bank: 'Scotiabank', color: '#f59e0b', lastAmount: 12000 },
];

export default function Transfers() {
  const [fromAccount, setFromAccount] = useState(accounts[0].id);
  const [toType, setToType] = useState<'own' | 'third'>('third');
  const [toAccount, setToAccount] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedFrom = accounts.find(a => a.id === fromAccount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setShowSuccess(true);
  };

  const handleClose = () => {
    setShowSuccess(false);
    setAmount('');
    setConcept('');
    setToAccount('');
    setBeneficiary('');
  };

  return (
    <div className="page-container transfers">
      <div className="page-header">
        <h1>Transferencias</h1>
        <p>Envía dinero a tus cuentas o a terceros de manera segura</p>
      </div>

      <div className="transfers__grid">
        <form className="card transfers__form-card" onSubmit={handleSubmit}>
          <div className="transfers__form-title">🔄 Nueva Transferencia</div>

          {/* Type toggle */}
          <div className="transfers__form-group">
            <label className="transfers__form-label">Tipo de transferencia</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`btn ${toType === 'own' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setToType('own')}
              >
                Entre mis cuentas
              </button>
              <button
                type="button"
                className={`btn ${toType === 'third' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setToType('third')}
              >
                A terceros
              </button>
            </div>
          </div>

          <div className="transfers__form-group">
            <label className="transfers__form-label">Cuenta origen</label>
            <select
              className="transfers__select"
              value={fromAccount}
              onChange={e => setFromAccount(e.target.value)}
            >
              {accounts.filter(a => a.balance > 0).map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} - {formatCurrency(a.balance)}
                </option>
              ))}
            </select>
          </div>

          {toType === 'own' ? (
            <div className="transfers__form-group">
              <label className="transfers__form-label">Cuenta destino</label>
              <select
                className="transfers__select"
                value={toAccount}
                onChange={e => setToAccount(e.target.value)}
              >
                <option value="">Seleccionar cuenta</option>
                {accounts.filter(a => a.id !== fromAccount).map(a => (
                  <option key={a.id} value={a.id}>{a.name} - {a.number}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="transfers__form-group">
                <label className="transfers__form-label">Beneficiario</label>
                <input
                  className="input"
                  placeholder="Nombre del beneficiario"
                  value={beneficiary}
                  onChange={e => setBeneficiary(e.target.value)}
                />
              </div>
              <div className="transfers__form-group">
                <label className="transfers__form-label">Cuenta destino</label>
                <input
                  className="input"
                  placeholder="Número de cuenta"
                  value={toAccount}
                  onChange={e => setToAccount(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="transfers__form-group">
            <label className="transfers__form-label">Monto</label>
            <div className="transfers__amount-wrapper">
              <span className="transfers__amount-currency">RD$</span>
              <input
                className="input transfers__amount-input"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="transfers__form-group">
            <label className="transfers__form-label">Concepto (opcional)</label>
            <input
              className="input"
              placeholder="Descripción de la transferencia"
              value={concept}
              onChange={e => setConcept(e.target.value)}
            />
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="transfers__summary">
              <div className="transfers__summary-row">
                <span className="transfers__summary-label">Monto</span>
                <span className="transfers__summary-value">{formatCurrency(parseFloat(amount))}</span>
              </div>
              <div className="transfers__summary-row">
                <span className="transfers__summary-label">Comisión</span>
                <span className="transfers__summary-value">{formatCurrency(0)}</span>
              </div>
              <div className="transfers__summary-row transfers__summary-total">
                <span className="transfers__summary-label" style={{ fontWeight: 700 }}>Total</span>
                <span className="transfers__summary-value" style={{ color: 'var(--color-primary)' }}>
                  {formatCurrency(parseFloat(amount))}
                </span>
              </div>
              {selectedFrom && (
                <div className="transfers__summary-row">
                  <span className="transfers__summary-label">Balance después</span>
                  <span className="transfers__summary-value">
                    {formatCurrency(selectedFrom.balance - parseFloat(amount))}
                  </span>
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-accent transfers__submit">
            Confirmar Transferencia
          </button>
        </form>

        <div className="card transfers__recent">
          <div className="transfers__recent-title">Contactos Frecuentes</div>
          <div className="transfers__contact-list">
            {recentContacts.map(contact => (
              <div
                key={contact.name}
                className="transfers__contact"
                onClick={() => setBeneficiary(contact.name)}
              >
                <div className="transfers__contact-avatar" style={{ background: contact.color }}>
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="transfers__contact-info">
                  <div className="transfers__contact-name">{contact.name}</div>
                  <div className="transfers__contact-bank">{contact.bank}</div>
                </div>
                <div className="transfers__contact-amount">
                  {formatCurrency(contact.lastAmount)}
                </div>
              </div>
            ))}
          </div>

          <div className="transfers__recent-title" style={{ marginTop: 20 }}>Últimas Transferencias</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'Juan Pérez', amount: 15000, date: '10 Mar 2026', type: 'sent' },
              { name: 'María López', amount: 25000, date: '07 Mar 2026', type: 'received' },
              { name: 'Carlos Reyes', amount: 8000, date: '05 Mar 2026', type: 'sent' },
            ].map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)'
              }}>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t.type === 'sent' ? '↗️' : '↙️'} {t.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{t.date}</div>
                </div>
                <div style={{
                  fontSize: '0.875rem', fontWeight: 700,
                  color: t.type === 'received' ? 'var(--color-accent)' : 'var(--color-error)'
                }}>
                  {t.type === 'received' ? '+' : '-'}{formatCurrency(t.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="transfers__modal-overlay" onClick={handleClose}>
          <div className="transfers__modal" onClick={e => e.stopPropagation()}>
            <div className="transfers__modal-icon">✅</div>
            <div className="transfers__modal-title">Transferencia Exitosa</div>
            <div className="transfers__modal-message">
              Se han transferido {formatCurrency(parseFloat(amount))} exitosamente.
              Referencia: TRF-{Date.now().toString().slice(-8)}
            </div>
            <button className="btn btn-primary" onClick={handleClose}>Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
}
