import { useState } from 'react';
import { accounts, transactions, formatCurrency, formatDate } from '../../data/mockData';
import type { Account } from '../../types';
import Icon from '../../components/IconMap';
import { X } from 'lucide-react';
import './Accounts.css';

export default function Accounts() {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const getAccountTransactions = (accountId: string) =>
    transactions.filter(t => t.accountId === accountId);

  const typeLabels: Record<string, string> = {
    savings: 'Ahorro',
    checking: 'Aportaciones',
    credit: 'Préstamo',
  };

  return (
    <div className="page-container accounts">
      <div className="page-header">
        <h1>Mis Productos Cooperativos</h1>
        <p>Gestiona tus ahorros, aportaciones y préstamos como socio de CoopEocala</p>
      </div>

      <div className="accounts__grid">
        {accounts.map(account => (
          <div
            key={account.id}
            className="card accounts__card"
            onClick={() => setSelectedAccount(selectedAccount?.id === account.id ? null : account)}
          >
            <div className="accounts__card-header" style={{ background: `linear-gradient(135deg, ${account.color}, ${account.color}cc)` }}>
              <div className="accounts__card-type">
                <Icon name={account.icon} size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                {typeLabels[account.type]}
              </div>
              <div className="accounts__card-balance-label">
                {account.balance >= 0 ? 'Balance Disponible' : 'Saldo Pendiente'}
              </div>
              <div className="accounts__card-balance">
                {formatCurrency(Math.abs(account.balance))}
              </div>
              <div className="accounts__card-number">{account.number}</div>
            </div>
            <div className="accounts__card-body">
              <div className="accounts__card-name">{account.name}</div>
              <div className="accounts__card-status">
                <span className="accounts__card-status-dot" />
                Activa
              </div>
              <div className="accounts__card-activity">
                Último movimiento: {formatDate(account.lastActivity)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedAccount && (
        <div className="card accounts__detail">
          <div className="accounts__detail-header">
            <h2 className="accounts__detail-title">
              Detalle - {selectedAccount.name}
            </h2>
            <button className="btn btn-secondary" onClick={() => setSelectedAccount(null)}>
              <X size={16} /> Cerrar
            </button>
          </div>

          <div className="accounts__detail-grid" style={{ marginBottom: 24 }}>
            <div className="accounts__detail-item">
              <div className="accounts__detail-label">Tipo de Producto</div>
              <div className="accounts__detail-value">{typeLabels[selectedAccount.type]}</div>
            </div>
            <div className="accounts__detail-item">
              <div className="accounts__detail-label">Producto</div>
              <div className="accounts__detail-value">{selectedAccount.name}</div>
            </div>
            <div className="accounts__detail-item">
              <div className="accounts__detail-label">Número</div>
              <div className="accounts__detail-value">{selectedAccount.number}</div>
            </div>
            <div className="accounts__detail-item">
              <div className="accounts__detail-label">Moneda</div>
              <div className="accounts__detail-value">{selectedAccount.currency}</div>
            </div>
            <div className="accounts__detail-item">
              <div className="accounts__detail-label">Estado</div>
              <div className="accounts__detail-value">
                <span className="badge badge-success">Activa</span>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
            Movimientos Recientes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {getAccountTransactions(selectedAccount.id).map(txn => (
              <div key={txn.id} className="dashboard__movement-item" style={{ padding: '10px 8px' }}>
                <div className="dashboard__movement-icon">
                  <Icon name={txn.icon} size={16} />
                </div>
                <div className="dashboard__movement-info">
                  <div className="dashboard__movement-desc">{txn.description}</div>
                  <div className="dashboard__movement-category">{txn.category} · {formatDate(txn.date)}</div>
                </div>
                <div className={`dashboard__movement-amount dashboard__movement-amount--${txn.type}`}>
                  {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
