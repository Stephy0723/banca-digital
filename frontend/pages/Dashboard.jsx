import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet, Layers3, ShieldCheck, Award, Calculator,
  Eye, EyeOff, TrendingUp, TrendingDown,
  ChevronRight, PiggyBank, BarChart3,
  CalendarClock, ArrowUpRight, ArrowDownLeft,
} from 'lucide-react';
import TransactionItem from '../components/TransactionItem';
import api, { clearSession } from '../services/api';
import '../styles/dashboard.css';

const currencyFormatter = new Intl.NumberFormat('es-DO', {
  style: 'currency', currency: 'DOP', minimumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat('es-DO', { dateStyle: 'medium' });
const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));
const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? 'Fecha no disponible' : dateFormatter.format(d);
};

const MOCK_DATA = {
  user: { fullName: 'Carlos Mendez', identificacion: '001-1234567-8' },
  stats: {
    balanceCuentas: 87450.75,
    balanceCertificados: 700000,
    balancePrestamos: 120000,
    totalProductos: 8,
    ingresosMes: 32000,
    egresosMes: 14500,
    ahorroMes: 17500,
    rendimientoCertificados: 5500,
  },
  cuentas: [
    { contrato: 'AH-2040-0012-3456', tipoCuenta: 'Ahorro Corriente', balanceActual: 62450.75, ultimaFechaMovimiento: '2026-03-20' },
    { contrato: 'AH-2040-0012-7890', tipoCuenta: 'Ahorro Navideno', balanceActual: 25000, ultimaFechaMovimiento: '2026-03-01' },
  ],
  certificados: [
    { contrato: 'CD-5001-2024-001', tipoCertificado: 'Plazo Fijo 12M', balanceActual: 500000, ultimaFechaPago: '2026-03-15' },
    { contrato: 'CD-5001-2024-002', tipoCertificado: 'Plazo Fijo 6M', balanceActual: 200000, ultimaFechaPago: '2026-02-28' },
  ],
  prestamos: [
    { contrato: 'PR-3001-2025-001', tipoPrestamo: 'Personal', balanceActual: 120000, montoOriginal: 200000, ultimaFechaPago: '2026-03-05' },
  ],
  recentActivity: [
    { id: 1, title: 'Deposito de nomina', subtitle: 'AH-2040-0012-3456', amount: 18000, type: 'in', date: '2026-03-20' },
    { id: 2, title: 'Pago prestamo personal', subtitle: 'PR-3001-2025-001', amount: 5200, type: 'out', date: '2026-03-18' },
    { id: 3, title: 'Transferencia recibida', subtitle: 'AH-2040-0012-3456', amount: 14000, type: 'in', date: '2026-03-15' },
    { id: 4, title: 'Pago servicios electricos', subtitle: 'AH-2040-0012-3456', amount: 3800, type: 'out', date: '2026-03-12' },
    { id: 5, title: 'Intereses certificado', subtitle: 'CD-5001-2024-001', amount: 2100, type: 'in', date: '2026-03-10' },
    { id: 6, title: 'Compra supermercado', subtitle: 'AH-2040-0012-3456', amount: 2400, type: 'out', date: '2026-03-08' },
  ],
  upcomingPayments: [
    { id: 1, label: 'Cuota prestamo personal', dueDate: '2026-04-05', amount: 5200, contrato: 'PR-3001-2025-001' },
    { id: 2, label: 'Vencimiento certificado 6M', dueDate: '2026-04-28', amount: 200000, contrato: 'CD-5001-2024-002' },
  ],
};

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    let ignore = false;

    const load = async () => {
      try {
        const { data } = await api.get('/accounts/me');
        if (!ignore) {
          setSummary(data);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (error) {
        if (error.response?.status === 401) {
          clearSession();
          navigate('/login');
          return;
        }
        if (!ignore) {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          setSummary({ ...MOCK_DATA, user: { ...MOCK_DATA.user, ...stored } });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => { ignore = true; };
  }, [navigate]);

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-loading__spinner" />
        <p>Cargando tus productos...</p>
      </div>
    );
  }

  const stats = summary?.stats ?? {};
  const cuentas = summary?.cuentas ?? [];
  const certificados = summary?.certificados ?? [];
  const prestamos = summary?.prestamos ?? [];
  const recentActivity = summary?.recentActivity ?? [];
  const upcomingPayments = summary?.upcomingPayments ?? [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos dias' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <>
      {/* Header */}
      <header className="dash__header">
        <div>
          <p className="dash__greeting">{greeting},</p>
          <h1 className="dash__name">{summary?.user?.fullName || 'Socio'}</h1>
        </div>
        <div className="dash__header-date">
          {new Date().toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* Balance card */}
      <section className="balance-card">
        <div className="balance-card__glow" />
        <div className="balance-card__pattern" />
        <div className="balance-card__content">
          <div className="balance-card__top">
            <div>
              <p className="balance-label">Balance total en cuentas</p>
              <div className="balance-amount-row">
                <h2 className="balance-amount">
                  {showBalance ? formatCurrency(stats.balanceCuentas) : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                </h2>
                <button className="balance-toggle" onClick={() => setShowBalance(!showBalance)}>
                  {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="balance-card__account">
              <p>Identificacion</p>
              <span>{summary?.user?.identificacion || '---'}</span>
            </div>
          </div>
          <div className="balance-card__bottom">
            <div className="balance-stat">
              <div className="balance-stat__icon balance-stat__icon--in"><Award size={16} /></div>
              <div>
                <p>Certificados</p>
                <strong>{showBalance ? formatCurrency(stats.balanceCertificados) : '\u2022\u2022\u2022\u2022'}</strong>
              </div>
            </div>
            <div className="balance-divider" />
            <div className="balance-stat">
              <div className="balance-stat__icon balance-stat__icon--out"><Calculator size={16} /></div>
              <div>
                <p>Prestamos</p>
                <strong>{showBalance ? formatCurrency(stats.balancePrestamos) : '\u2022\u2022\u2022\u2022'}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metricas mensuales */}
      <section className="metrics-row">
        <div className="metric-card metric-card--income">
          <div className="metric-card__icon"><TrendingUp size={18} /></div>
          <div>
            <p>Ingresos del mes</p>
            <h4>{showBalance ? formatCurrency(stats.ingresosMes) : '\u2022\u2022\u2022\u2022'}</h4>
          </div>
        </div>
        <div className="metric-card metric-card--expense">
          <div className="metric-card__icon"><TrendingDown size={18} /></div>
          <div>
            <p>Egresos del mes</p>
            <h4>{showBalance ? formatCurrency(stats.egresosMes) : '\u2022\u2022\u2022\u2022'}</h4>
          </div>
        </div>
        <div className="metric-card metric-card--savings">
          <div className="metric-card__icon"><PiggyBank size={18} /></div>
          <div>
            <p>Ahorro neto</p>
            <h4>{showBalance ? formatCurrency(stats.ahorroMes) : '\u2022\u2022\u2022\u2022'}</h4>
          </div>
        </div>
        <div className="metric-card metric-card--yield">
          <div className="metric-card__icon"><BarChart3 size={18} /></div>
          <div>
            <p>Rendimiento certificados</p>
            <h4>{showBalance ? formatCurrency(stats.rendimientoCertificados) : '\u2022\u2022\u2022\u2022'}</h4>
          </div>
        </div>
      </section>

      {/* Tarjetas de productos clickeables */}
      <section className="product-cards">
        <Link to="/ahorros" className="product-card">
          <div className="product-card__header">
            <div className="product-card__icon product-card__icon--primary"><Wallet size={20} /></div>
            <span className="product-card__badge">{cuentas.length}</span>
          </div>
          <h3>Cuentas de Ahorro</h3>
          <p className="product-card__balance">{showBalance ? formatCurrency(stats.balanceCuentas) : '\u2022\u2022\u2022\u2022'}</p>
          <span className="product-card__link">Ver ahorros <ChevronRight size={14} /></span>
        </Link>
        <Link to="/certificados" className="product-card">
          <div className="product-card__header">
            <div className="product-card__icon product-card__icon--gold"><Award size={20} /></div>
            <span className="product-card__badge product-card__badge--gold">{certificados.length}</span>
          </div>
          <h3>Certificados</h3>
          <p className="product-card__balance">{showBalance ? formatCurrency(stats.balanceCertificados) : '\u2022\u2022\u2022\u2022'}</p>
          <span className="product-card__link">Ver certificados <ChevronRight size={14} /></span>
        </Link>
        <Link to="/prestamos" className="product-card">
          <div className="product-card__header">
            <div className="product-card__icon product-card__icon--info"><ShieldCheck size={20} /></div>
            <span className="product-card__badge product-card__badge--info">{prestamos.length}</span>
          </div>
          <h3>Prestamos</h3>
          <p className="product-card__balance">{showBalance ? formatCurrency(stats.balancePrestamos) : '\u2022\u2022\u2022\u2022'}</p>
          <span className="product-card__link">Ver prestamos <ChevronRight size={14} /></span>
        </Link>
      </section>

      {/* Two-column: Actividad reciente + Proximos pagos */}
      <div className="dash-two-col">
        <section className="transactions-section">
          <div className="section-header">
            <h3>Actividad reciente</h3>
            <Link to="/ahorros" className="btn btn--ghost">Ver todo <ChevronRight size={14} /></Link>
          </div>
          <div className="transactions-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((a) => (
                <TransactionItem
                  key={a.id}
                  name={a.title}
                  date={`${formatDate(a.date)} \u00b7 ${a.subtitle}`}
                  amount={a.amount}
                  type={a.type}
                />
              ))
            ) : (
              <p className="transactions-empty">No hay actividad reciente para mostrar.</p>
            )}
          </div>
        </section>

        <div className="dash-right-col">
          {/* Proximos pagos */}
          <section className="upcoming-section">
            <div className="section-header">
              <h3><CalendarClock size={16} /> Proximos pagos</h3>
            </div>
            <div className="upcoming-list">
              {upcomingPayments.length > 0 ? upcomingPayments.map((p) => (
                <div key={p.id} className="upcoming-item">
                  <div className="upcoming-item__date">
                    <span className="upcoming-item__day">{new Date(p.dueDate).getDate()}</span>
                    <span className="upcoming-item__month">{new Date(p.dueDate).toLocaleDateString('es-DO', { month: 'short' })}</span>
                  </div>
                  <div className="upcoming-item__info">
                    <h4>{p.label}</h4>
                    <span>{p.contrato}</span>
                  </div>
                  <strong className="upcoming-item__amount">{showBalance ? formatCurrency(p.amount) : '\u2022\u2022\u2022\u2022'}</strong>
                </div>
              )) : (
                <p className="transactions-empty">Sin pagos pendientes</p>
              )}
            </div>
          </section>

          {/* Resumen de productos */}
          <section className="portfolio-section">
            <div className="section-header">
              <h3><Layers3 size={16} /> Mi portafolio</h3>
            </div>
            <div className="portfolio-bars">
              <PortfolioBar label="Ahorros" value={stats.balanceCuentas || 0} total={(stats.balanceCuentas || 0) + (stats.balanceCertificados || 0)} color="var(--primary)" />
              <PortfolioBar label="Certificados" value={stats.balanceCertificados || 0} total={(stats.balanceCuentas || 0) + (stats.balanceCertificados || 0)} color="var(--accent)" />
            </div>
            <div className="portfolio-total">
              <span>Patrimonio total</span>
              <strong>{showBalance ? formatCurrency((stats.balanceCuentas || 0) + (stats.balanceCertificados || 0)) : '\u2022\u2022\u2022\u2022'}</strong>
            </div>
          </section>
        </div>
      </div>

      {/* Detalle de productos */}
      <ProductSection
        title="Cuentas del socio"
        icon={Wallet}
        items={cuentas}
        linkTo="/ahorros"
        emptyMessage="No hay cuentas registradas."
        getSubtitle={(c) => `Ult. mov.: ${formatDate(c.ultimaFechaMovimiento)}`}
        getAmount={(c) => formatCurrency(c.balanceActual)}
        getIcon={() => <ArrowDownLeft size={14} />}
      />
      <ProductSection
        title="Certificados"
        icon={Award}
        items={certificados}
        linkTo="/certificados"
        emptyMessage="No hay certificados registrados."
        getSubtitle={(c) => `Ult. pago: ${formatDate(c.ultimaFechaPago)}`}
        getAmount={(c) => formatCurrency(c.balanceActual)}
        getIcon={() => <ArrowUpRight size={14} />}
      />
      <ProductSection
        title="Prestamos"
        icon={Calculator}
        items={prestamos}
        linkTo="/prestamos"
        emptyMessage="No hay prestamos registrados."
        getSubtitle={(p) => `Ult. pago: ${formatDate(p.ultimaFechaPago)}`}
        getAmount={(p) => formatCurrency(p.balanceActual)}
        getIcon={() => <ArrowUpRight size={14} />}
      />
    </>
  );
}

function PortfolioBar({ label, value, total, color }) {
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  return (
    <div className="portfolio-bar">
      <div className="portfolio-bar__header">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="portfolio-bar__track">
        <div className="portfolio-bar__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function ProductSection({ title, icon: Icon, items, emptyMessage, getSubtitle, getAmount, linkTo, getIcon }) {
  return (
    <section className="transactions-section">
      <div className="section-header">
        <h3>{Icon && <Icon size={16} />} {title}</h3>
        {linkTo && items.length > 0 && (
          <Link to={linkTo} className="btn btn--ghost">Ver todos <ChevronRight size={16} /></Link>
        )}
      </div>
      <div className="transactions-list">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.contrato} className="transaction-item">
              <div className="transaction-item__left">
                {getIcon && <div className="transaction-item__icon">{getIcon(item)}</div>}
                <div>
                  <h4>{item.contrato}</h4>
                  <span>{getSubtitle(item)}</span>
                </div>
              </div>
              <strong className="product-amount">{getAmount(item)}</strong>
            </div>
          ))
        ) : (
          <p className="transactions-empty">{emptyMessage}</p>
        )}
      </div>
    </section>
  );
}

export default Dashboard;
