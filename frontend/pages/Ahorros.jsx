import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PiggyBank, TrendingUp, ArrowRight, ArrowDownLeft,
  ArrowUpRight, Eye, EyeOff, ChevronDown, ChevronUp,
  Clock, Filter,
} from 'lucide-react';
import api, { clearSession } from '../services/api';
import '../styles/pages.css';

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(Number(v || 0));
const fmtDate = (v) => { if (!v) return '---'; const d = new Date(v); return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('es-DO', { dateStyle: 'medium' }); };

const MOCK_CUENTAS = [
  {
    contrato: 'AH-2040-0012-3456', tipoCuenta: 'Ahorro Corriente', balanceActual: 62450.75,
    ultimaFechaMovimiento: '2026-03-20', tasa: 3.5,
    transacciones: [
      { id: 1, desc: 'Deposito de nomina', date: '2026-03-20', amount: 18000, type: 'in' },
      { id: 2, desc: 'Pago servicios electricos', date: '2026-03-12', amount: 3800, type: 'out' },
      { id: 3, desc: 'Transferencia recibida', date: '2026-03-15', amount: 14000, type: 'in' },
      { id: 4, desc: 'Compra supermercado', date: '2026-03-08', amount: 2400, type: 'out' },
      { id: 5, desc: 'Deposito efectivo', date: '2026-03-05', amount: 5000, type: 'in' },
      { id: 6, desc: 'Pago agua', date: '2026-03-03', amount: 850, type: 'out' },
    ],
  },
  {
    contrato: 'AH-2040-0012-7890', tipoCuenta: 'Ahorro Navideno', balanceActual: 25000,
    ultimaFechaMovimiento: '2026-03-01', tasa: 5.0,
    transacciones: [
      { id: 1, desc: 'Deposito mensual', date: '2026-03-01', amount: 5000, type: 'in' },
      { id: 2, desc: 'Deposito mensual', date: '2026-02-01', amount: 5000, type: 'in' },
      { id: 3, desc: 'Deposito mensual', date: '2026-01-01', amount: 5000, type: 'in' },
    ],
  },
];

const TIPOS_AHORRO = [
  { nombre: 'Ahorro Corriente', desc: 'Disponibilidad inmediata', tasa: '3.5%', icon: PiggyBank },
  { nombre: 'Ahorro Navideno', desc: 'Disponible en noviembre', tasa: '5.0%', icon: Clock },
  { nombre: 'Ahorro Programado', desc: 'Depositos fijos mensuales', tasa: '6.0%', icon: TrendingUp },
];

function Ahorros() {
  const [cuentas, setCuentas] = useState(MOCK_CUENTAS);
  const [showBalance, setShowBalance] = useState(true);
  const [expandedAccount, setExpandedAccount] = useState(null);
  const [txFilter, setTxFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        const { data } = await api.get('/accounts/me');
        if (!ignore && data.cuentas) setCuentas(data.cuentas);
      } catch (error) {
        if (error.response?.status === 401) { clearSession(); navigate('/login'); }
      }
    };
    fetchData();
    return () => { ignore = true; };
  }, [navigate]);

  const balanceTotal = cuentas.reduce((sum, c) => sum + (c.balanceActual || 0), 0);
  const ingresosMes = cuentas.reduce((sum, c) => sum + (c.transacciones || []).filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0), 0);
  const egresosMes = cuentas.reduce((sum, c) => sum + (c.transacciones || []).filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0), 0);

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Ahorros</h1>
          <p className="page-subtitle">Consulta tus cuentas de ahorro y movimientos</p>
        </div>
        <button className="balance-vis-btn" onClick={() => setShowBalance(!showBalance)}>
          {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
          {showBalance ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="summary-cards">
        <div className="summary-card summary-card--primary">
          <div className="summary-card__icon"><PiggyBank size={22} /></div>
          <div>
            <span className="summary-card__label">Balance total</span>
            <h3 className="summary-card__value">{showBalance ? fmt(balanceTotal) : '\u2022\u2022\u2022\u2022\u2022\u2022'}</h3>
          </div>
        </div>
        <div className="summary-card summary-card--success">
          <div className="summary-card__icon"><ArrowDownLeft size={22} /></div>
          <div>
            <span className="summary-card__label">Ingresos del mes</span>
            <h3 className="summary-card__value">{showBalance ? fmt(ingresosMes) : '\u2022\u2022\u2022\u2022'}</h3>
          </div>
        </div>
        <div className="summary-card summary-card--danger">
          <div className="summary-card__icon"><ArrowUpRight size={22} /></div>
          <div>
            <span className="summary-card__label">Egresos del mes</span>
            <h3 className="summary-card__value">{showBalance ? fmt(egresosMes) : '\u2022\u2022\u2022\u2022'}</h3>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card__icon"><TrendingUp size={22} /></div>
          <div>
            <span className="summary-card__label">Cuentas activas</span>
            <h3 className="summary-card__value">{cuentas.length}</h3>
          </div>
        </div>
      </div>

      {/* Account cards with transactions */}
      {cuentas.map((cuenta) => {
        const isExpanded = expandedAccount === cuenta.contrato;
        const txs = cuenta.transacciones || [];
        const filtered = txFilter === 'all' ? txs : txs.filter((t) => t.type === txFilter);

        return (
          <div key={cuenta.contrato} className="account-card">
            <div className="account-card__header" onClick={() => setExpandedAccount(isExpanded ? null : cuenta.contrato)}>
              <div className="account-card__left">
                <div className="account-card__icon"><PiggyBank size={20} /></div>
                <div>
                  <h3>Cuenta de Ahorro</h3>
                  <span className="account-card__contrato">{cuenta.contrato}</span>
                </div>
              </div>
              <div className="account-card__right">
                <div className="account-card__balance">
                  <span className="account-card__balance-label">Balance</span>
                  <strong>{showBalance ? fmt(cuenta.balanceActual) : '\u2022\u2022\u2022\u2022'}</strong>
                </div>
                {cuenta.tasa && <span className="account-card__rate">{cuenta.tasa}% anual</span>}
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {isExpanded && (
              <div className="account-card__body">
                <div className="account-card__meta">
                  <div><span>Ultimo movimiento</span><strong>{fmtDate(cuenta.ultimaFechaMovimiento)}</strong></div>
                  <div><span>Tasa de interes</span><strong>{cuenta.tasa || 0}% anual</strong></div>
                  <div><span>Movimientos del mes</span><strong>{txs.length}</strong></div>
                </div>

                <div className="account-card__tx-header">
                  <h4>Historial de movimientos</h4>
                  <div className="tx-filter">
                    <Filter size={13} />
                    <button className={txFilter === 'all' ? 'active' : ''} onClick={() => setTxFilter('all')}>Todos</button>
                    <button className={txFilter === 'in' ? 'active' : ''} onClick={() => setTxFilter('in')}>Ingresos</button>
                    <button className={txFilter === 'out' ? 'active' : ''} onClick={() => setTxFilter('out')}>Egresos</button>
                  </div>
                </div>

                <div className="tx-list">
                  {filtered.length > 0 ? filtered.map((tx) => (
                    <div key={tx.id} className="tx-item">
                      <div className={`tx-item__icon tx-item__icon--${tx.type}`}>
                        {tx.type === 'in' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      </div>
                      <div className="tx-item__info">
                        <h4>{tx.desc}</h4>
                        <span>{fmtDate(tx.date)}</span>
                      </div>
                      <strong className={`tx-item__amount tx-item__amount--${tx.type}`}>
                        {tx.type === 'in' ? '+' : '-'}{fmt(tx.amount)}
                      </strong>
                    </div>
                  )) : (
                    <p className="transactions-empty">No hay movimientos con este filtro.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Tipos de ahorro */}
      <div className="section-card">
        <div className="section-card__header">
          <h2>Tipos de Ahorro Disponibles</h2>
        </div>
        <div className="savings-types">
          {TIPOS_AHORRO.map((tipo) => (
            <div className="savings-type-card" key={tipo.nombre}>
              <div className="savings-type-card__rate">{tipo.tasa}</div>
              <div>
                <h4>{tipo.nombre}</h4>
                <p>{tipo.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-card">
        <div className="cta-card__content">
          <h3>Quieres abrir una nueva cuenta de ahorro?</h3>
          <p>Contactanos para conocer los requisitos y abrir tu cuenta.</p>
        </div>
        <div className="cta-card__actions">
          <a href="https://wa.me/18094433140?text=Hola%2C%20me%20interesa%20abrir%20una%20cuenta%20de%20ahorro" target="_blank" rel="noopener noreferrer" className="btn btn--primary">
            Solicitar por WhatsApp <ArrowRight size={16} />
          </a>
          <a href="tel:+18095443140" className="btn btn--outline">(809) 544-3140</a>
        </div>
      </div>
    </>
  );
}

export default Ahorros;
