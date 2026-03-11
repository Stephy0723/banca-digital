import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { accounts, transactions, formatCurrency, formatDate } from '../../data/mockData';
import Icon from '../../components/IconMap';
import { Wallet, TrendingUp, TrendingDown, CreditCard, ArrowLeftRight, ClipboardList, Landmark, User, ShieldCheck } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalSavings = accounts.filter(a => a.balance > 0).reduce((sum, acc) => sum + acc.balance, 0);
  const totalDebt = accounts.filter(a => a.balance < 0).reduce((sum, acc) => sum + Math.abs(acc.balance), 0);
  const monthIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = transactions.slice(0, 6);

  const quickActions = [
    { icon: ArrowLeftRight, label: 'Transferir', path: '/transfers' },
    { icon: CreditCard, label: 'Pagar', path: '/payments' },
    { icon: ClipboardList, label: 'Movimientos', path: '/transactions' },
    { icon: Landmark, label: 'Productos', path: '/accounts' },
    { icon: User, label: 'Mi Perfil', path: '/profile' },
    { icon: ShieldCheck, label: 'Seguridad', path: '/security' },
  ];

  return (
    <div className="page-container dashboard">
      <div className="dashboard__welcome">
        <h1>Bienvenido, {user?.fullName?.split(' ')[0]}</h1>
        <p>Resumen de tu cuenta cooperativa al {new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="dashboard__stats">
        <div className="card dashboard__stat-card">
          <div className="dashboard__stat-icon" style={{ background: 'rgba(45,162,72,0.1)', color: '#2da248' }}>
            <Wallet size={22} />
          </div>
          <div className="dashboard__stat-info">
            <div className="dashboard__stat-label">Total Ahorros</div>
            <div className="dashboard__stat-value">{formatCurrency(totalSavings)}</div>
            <div className="dashboard__stat-change dashboard__stat-change--positive">Ahorro + Aportaciones</div>
          </div>
        </div>

        <div className="card dashboard__stat-card">
          <div className="dashboard__stat-icon" style={{ background: 'rgba(45,162,72,0.1)', color: '#2da248' }}>
            <TrendingUp size={22} />
          </div>
          <div className="dashboard__stat-info">
            <div className="dashboard__stat-label">Ingresos del Mes</div>
            <div className="dashboard__stat-value">{formatCurrency(monthIncome)}</div>
            <div className="dashboard__stat-change dashboard__stat-change--positive">Nómina, transferencias e intereses</div>
          </div>
        </div>

        <div className="card dashboard__stat-card">
          <div className="dashboard__stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
            <TrendingDown size={22} />
          </div>
          <div className="dashboard__stat-info">
            <div className="dashboard__stat-label">Gastos del Mes</div>
            <div className="dashboard__stat-value">{formatCurrency(monthExpenses)}</div>
            <div className="dashboard__stat-change dashboard__stat-change--negative">Servicios, cuotas y pagos</div>
          </div>
        </div>

        <div className="card dashboard__stat-card">
          <div className="dashboard__stat-icon" style={{ background: 'rgba(26,74,110,0.1)', color: '#1a4a6e' }}>
            <CreditCard size={22} />
          </div>
          <div className="dashboard__stat-info">
            <div className="dashboard__stat-label">Préstamos Activos</div>
            <div className="dashboard__stat-value">{formatCurrency(totalDebt)}</div>
            <div className="dashboard__stat-change dashboard__stat-change--positive">Nómina y financiamiento</div>
          </div>
        </div>
      </div>

      <div className="dashboard__grid">
        <div className="dashboard__left">
          <div className="card dashboard__accounts" style={{ marginBottom: 20 }}>
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Mis Productos Cooperativos</h2>
              <span className="dashboard__section-link" onClick={() => navigate('/accounts')}>Ver todos</span>
            </div>
            <div className="dashboard__account-list">
              {accounts.map(account => (
                <div
                  key={account.id}
                  className="dashboard__account-item"
                  onClick={() => navigate('/accounts')}
                >
                  <div className="dashboard__account-icon" style={{ background: `${account.color}15`, color: account.color }}>
                    <Icon name={account.icon} size={20} />
                  </div>
                  <div className="dashboard__account-info">
                    <div className="dashboard__account-name">{account.name}</div>
                    <div className="dashboard__account-number">{account.number}</div>
                  </div>
                  <div className="dashboard__account-balance">
                    <div className="dashboard__account-amount">{formatCurrency(Math.abs(account.balance))}</div>
                    <div className={`dashboard__account-status badge ${account.balance >= 0 ? 'badge-success' : 'badge-warning'}`}>
                      {account.balance >= 0 ? 'Disponible' : 'Saldo pendiente'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card dashboard__movements">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Últimos Movimientos</h2>
              <span className="dashboard__section-link" onClick={() => navigate('/transactions')}>Ver todos</span>
            </div>
            <div className="dashboard__movement-list">
              {recentTransactions.map(txn => (
                <div key={txn.id} className="dashboard__movement-item">
                  <div className="dashboard__movement-icon">
                    <Icon name={txn.icon} size={16} />
                  </div>
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

        <div className="dashboard__right">
          <div className="card dashboard__quick-actions">
            <div className="dashboard__section-header">
              <h2 className="dashboard__section-title">Acciones Rápidas</h2>
            </div>
            <div className="dashboard__actions-grid">
              {quickActions.map(action => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.path}
                    className="dashboard__action-btn"
                    onClick={() => navigate(action.path)}
                  >
                    <ActionIcon size={22} className="dashboard__action-icon" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card dashboard__promo">
            <div className="dashboard__promo-title">Certificado de Depósito a Plazo Fijo</div>
            <div className="dashboard__promo-text">
              Invierte con tasas competitivas. Certificados desde 3 meses con rendimiento garantizado exclusivo para socios de CoopEocala.
            </div>
            <button className="dashboard__promo-btn">Solicitar ahora</button>
          </div>

          <div className="card dashboard__promo" style={{ background: 'linear-gradient(135deg, #0b2a41, #1a4a6e)' }}>
            <div className="dashboard__promo-title">Financiamiento de Vehículo</div>
            <div className="dashboard__promo-text">
              Hasta el 80% del valor del vehículo, con plazos de hasta 60 meses. Tasa preferencial para socios.
            </div>
            <button className="dashboard__promo-btn">Calcular cuota</button>
          </div>
        </div>
      </div>
    </div>
  );
}
