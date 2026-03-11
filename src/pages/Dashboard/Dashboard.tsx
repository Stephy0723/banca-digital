import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { accounts, transactions, formatCurrency, formatDate } from '../../data/mockData';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance > 0 ? acc.balance : 0), 0);
  const totalDebt = accounts.reduce((sum, acc) => sum + (acc.balance < 0 ? Math.abs(acc.balance) : 0), 0);
  const monthIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = transactions.slice(0, 6);

  const quickActions = [
    { icon: '🔄', label: 'Transferir', path: '/transfers' },
    { icon: '💳', label: 'Pagar', path: '/payments' },
    { icon: '📋', label: 'Movimientos', path: '/transactions' },
    { icon: '🏦', label: 'Cuentas', path: '/accounts' },
    { icon: '👤', label: 'Mi Perfil', path: '/profile' },
    { icon: '🔒', label: 'Seguridad', path: '/security' },
  ];

  return (
    <div className="page-container dashboard">
      <div className="dashboard__welcome">
        <h1>Bienvenido, {user?.fullName?.split(' ')[0]}</h1>
        <p>Aquí tienes un resumen de tus finanzas al {new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats Cards */}
      <div className="dashboard__stats">
        <div className="card dashboard__stat-card">
          <div className="dashboard__stat-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>💰</div>
          <div className="dashboard__stat-info">
            <div className="dashboard__stat-label">Balance Total</div>
            <div className="dashboard__stat-value">{formatCurrency(totalBalance)}</div>
            <div className="dashboard__stat-change dashboard__stat-change--positive">+2.5% este mes</div>
          </div>
        </div>

        <div className="card dashboard__stat-card">
          <div className="dashboard__stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>📈</div>
          <div className="dashboard__stat-info">
            <div className="dashboard__stat-label">Ingresos del Mes</div>
            <div className="dashboard__stat-value">{formatCurrency(monthIncome)}</div>
            <div className="dashboard__stat-change dashboard__stat-change--positive">+12% vs mes anterior</div>
          </div>
        </div>

        <div className="card dashboard__stat-card">
          <div className="dashboard__stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>📉</div>
          <div className="dashboard__stat-info">
            <div className="dashboard__stat-label">Gastos del Mes</div>
            <div className="dashboard__stat-value">{formatCurrency(monthExpenses)}</div>
            <div className="dashboard__stat-change dashboard__stat-change--negative">-8% vs mes anterior</div>
          </div>
        </div>

        <div className="card dashboard__stat-card">
          <div className="dashboard__stat-icon" style={{ background: 'rgba(124,58,237,0.1)' }}>💳</div>
          <div className="dashboard__stat-info">
            <div className="dashboard__stat-label">Deuda Tarjetas</div>
            <div className="dashboard__stat-value">{formatCurrency(totalDebt)}</div>
            <div className="dashboard__stat-change dashboard__stat-change--positive">-15% vs mes anterior</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard__grid">
        <div className="dashboard__left">
          {/* Accounts */}
          <div className="card dashboard__accounts" style={{ marginBottom: 20 }}>
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Mis Cuentas</h2>
              <span className="dashboard__section-link" onClick={() => navigate('/accounts')}>Ver todas</span>
            </div>
            <div className="dashboard__account-list">
              {accounts.map(account => (
                <div
                  key={account.id}
                  className="dashboard__account-item"
                  onClick={() => navigate('/accounts')}
                >
                  <div className="dashboard__account-icon" style={{ background: `${account.color}15`, color: account.color }}>
                    {account.icon}
                  </div>
                  <div className="dashboard__account-info">
                    <div className="dashboard__account-name">{account.name}</div>
                    <div className="dashboard__account-number">{account.number}</div>
                  </div>
                  <div className="dashboard__account-balance">
                    <div className="dashboard__account-amount">{formatCurrency(Math.abs(account.balance))}</div>
                    <div className={`dashboard__account-status badge ${account.balance >= 0 ? 'badge-success' : 'badge-error'}`}>
                      {account.balance >= 0 ? 'Disponible' : 'Saldo a pagar'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent movements */}
          <div className="card dashboard__movements">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Últimos Movimientos</h2>
              <span className="dashboard__section-link" onClick={() => navigate('/transactions')}>Ver todos</span>
            </div>
            <div className="dashboard__movement-list">
              {recentTransactions.map(txn => (
                <div key={txn.id} className="dashboard__movement-item">
                  <div className="dashboard__movement-icon">{txn.icon}</div>
                  <div className="dashboard__movement-info">
                    <div className="dashboard__movement-desc">{txn.description}</div>
                    <div className="dashboard__movement-category">{txn.category} · {txn.accountName}</div>
                  </div>
                  <div>
                    <div className={`dashboard__movement-amount dashboard__movement-amount--${txn.type}`}>
                      {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </div>
                    <div className="dashboard__movement-date">{formatDate(txn.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="dashboard__right">
          <div className="card dashboard__quick-actions">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Acciones Rápidas</h2>
            </div>
            <div className="dashboard__actions-grid">
              {quickActions.map(action => (
                <button
                  key={action.path}
                  className="dashboard__action-btn"
                  onClick={() => navigate(action.path)}
                >
                  <span className="dashboard__action-icon">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card dashboard__promo">
            <div className="dashboard__promo-title">Tarjeta Platinum</div>
            <div className="dashboard__promo-text">
              Obtén acceso a salas VIP, cashback del 3% y seguro de viaje internacional. Solicítala ahora sin costo de emisión.
            </div>
            <button className="dashboard__promo-btn">Solicitar ahora</button>
          </div>
        </div>
      </div>
    </div>
  );
}
