import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator, ArrowRight, Clock, DollarSign, Percent,
  ChevronDown, ChevronUp, Eye, EyeOff, TrendingDown,
  CalendarClock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import api, { clearSession } from '../services/api';
import '../styles/pages.css';

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(Number(v || 0));
const fmtDate = (v) => { if (!v) return '---'; const d = new Date(v); return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('es-DO', { dateStyle: 'medium' }); };

const MOCK_PRESTAMOS = [
  {
    contrato: 'PR-3001-2025-001', tipoPrestamo: 'Personal', balanceActual: 120000,
    montoOriginal: 200000, tasaAnual: 18, plazoMeses: 36, cuotaMensual: 7230.09,
    cuotasPagadas: 12, ultimaFechaPago: '2026-03-05', proximoPago: '2026-04-05',
    estado: 'Al dia',
    pagos: [
      { id: 1, fecha: '2026-03-05', cuota: 7230.09, capital: 5430.09, interes: 1800, balance: 120000 },
      { id: 2, fecha: '2026-02-05', cuota: 7230.09, capital: 5348.79, interes: 1881.30, balance: 125430.09 },
      { id: 3, fecha: '2026-01-05', cuota: 7230.09, capital: 5268.46, interes: 1961.63, balance: 130778.88 },
      { id: 4, fecha: '2025-12-05', cuota: 7230.09, capital: 5189.09, interes: 2041.00, balance: 136047.34 },
      { id: 5, fecha: '2025-11-05', cuota: 7230.09, capital: 5110.67, interes: 2119.42, balance: 141236.43 },
    ],
  },
];

const LOAN_TYPES = [
  { icon: DollarSign, name: 'Personal', desc: 'Hasta RD$ 500,000 \u00b7 12-60 meses', rate: '18%' },
  { icon: Clock, name: 'Nomina', desc: 'Descuento directo \u00b7 Aprobacion rapida', rate: '15%' },
  { icon: TrendingDown, name: 'Vehicular', desc: 'Hasta 80% del valor \u00b7 60 meses', rate: '12%' },
  { icon: Percent, name: 'Factoring', desc: 'Descuento de facturas comerciales', rate: '10%' },
];

function Prestamos() {
  const [prestamos, setPrestamos] = useState(MOCK_PRESTAMOS);
  const [showBalance, setShowBalance] = useState(true);
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [showCalc, setShowCalc] = useState(false);
  const [monto, setMonto] = useState(100000);
  const [plazo, setPlazo] = useState(24);
  const [tasa, setTasa] = useState(18);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        const { data } = await api.get('/accounts/me');
        if (!ignore && data.prestamos) setPrestamos(data.prestamos);
      } catch (error) {
        if (error.response?.status === 401) { clearSession(); navigate('/login'); }
      }
    };
    fetchData();
    return () => { ignore = true; };
  }, [navigate]);

  const totalDeuda = prestamos.reduce((s, p) => s + (p.balanceActual || 0), 0);
  const totalOriginal = prestamos.reduce((s, p) => s + (p.montoOriginal || 0), 0);
  const pctPagado = totalOriginal > 0 ? (((totalOriginal - totalDeuda) / totalOriginal) * 100).toFixed(1) : 0;

  const tasaMensual = tasa / 100 / 12;
  const cuota = tasaMensual > 0 ? (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo)) : monto / plazo;
  const totalPagar = cuota * plazo;
  const interesTotal = totalPagar - monto;

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Prestamos</h1>
          <p className="page-subtitle">Consulta tus prestamos, pagos y planifica nuevas solicitudes</p>
        </div>
        <button className="balance-vis-btn" onClick={() => setShowBalance(!showBalance)}>
          {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
          {showBalance ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {/* Summary */}
      <div className="summary-cards">
        <div className="summary-card summary-card--danger">
          <div className="summary-card__icon"><Calculator size={22} /></div>
          <div>
            <span className="summary-card__label">Deuda total</span>
            <h3 className="summary-card__value">{showBalance ? fmt(totalDeuda) : '\u2022\u2022\u2022\u2022'}</h3>
          </div>
        </div>
        <div className="summary-card summary-card--success">
          <div className="summary-card__icon"><CheckCircle2 size={22} /></div>
          <div>
            <span className="summary-card__label">Pagado</span>
            <h3 className="summary-card__value">{showBalance ? fmt(totalOriginal - totalDeuda) : '\u2022\u2022\u2022\u2022'}</h3>
          </div>
        </div>
        <div className="summary-card summary-card--primary">
          <div className="summary-card__icon"><TrendingDown size={22} /></div>
          <div>
            <span className="summary-card__label">Progreso</span>
            <h3 className="summary-card__value">{pctPagado}%</h3>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card__icon"><CalendarClock size={22} /></div>
          <div>
            <span className="summary-card__label">Prestamos activos</span>
            <h3 className="summary-card__value">{prestamos.length}</h3>
          </div>
        </div>
      </div>

      {/* Loan cards */}
      {prestamos.map((loan) => {
        const isExpanded = expandedLoan === loan.contrato;
        const progress = loan.montoOriginal ? (((loan.montoOriginal - loan.balanceActual) / loan.montoOriginal) * 100).toFixed(1) : 0;

        return (
          <div key={loan.contrato} className="account-card">
            <div className="account-card__header" onClick={() => setExpandedLoan(isExpanded ? null : loan.contrato)}>
              <div className="account-card__left">
                <div className="account-card__icon account-card__icon--loan"><Calculator size={20} /></div>
                <div>
                  <h3>Prestamo</h3>
                  <span className="account-card__contrato">{loan.contrato}</span>
                </div>
              </div>
              <div className="account-card__right">
                <div className="account-card__balance">
                  <span className="account-card__balance-label">Balance pendiente</span>
                  <strong>{showBalance ? fmt(loan.balanceActual) : '\u2022\u2022\u2022\u2022'}</strong>
                </div>
                <span className={`account-card__status ${loan.estado === 'Al dia' ? 'account-card__status--ok' : 'account-card__status--warn'}`}>
                  {loan.estado === 'Al dia' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {loan.estado || 'Activo'}
                </span>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {isExpanded && (
              <div className="account-card__body">
                {/* Progress bar */}
                <div className="loan-progress">
                  <div className="loan-progress__header">
                    <span>Progreso de pago</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="loan-progress__bar">
                    <div className="loan-progress__fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="loan-progress__labels">
                    <span>{showBalance ? fmt(loan.montoOriginal - loan.balanceActual) : '\u2022\u2022'} pagado</span>
                    <span>{showBalance ? fmt(loan.montoOriginal) : '\u2022\u2022'} total</span>
                  </div>
                </div>

                <div className="account-card__meta">
                  <div><span>Monto original</span><strong>{showBalance ? fmt(loan.montoOriginal) : '\u2022\u2022\u2022\u2022'}</strong></div>
                  <div><span>Tasa anual</span><strong>{loan.tasaAnual || 0}%</strong></div>
                  <div><span>Plazo</span><strong>{loan.plazoMeses || 0} meses</strong></div>
                  <div><span>Cuota mensual</span><strong>{showBalance ? fmt(loan.cuotaMensual) : '\u2022\u2022\u2022\u2022'}</strong></div>
                  <div><span>Cuotas pagadas</span><strong>{loan.cuotasPagadas || 0} de {loan.plazoMeses || 0}</strong></div>
                  <div><span>Proximo pago</span><strong>{fmtDate(loan.proximoPago)}</strong></div>
                </div>

                {/* Payment history */}
                {loan.pagos && loan.pagos.length > 0 && (
                  <>
                    <h4 className="account-card__section-title">Historial de pagos</h4>
                    <div className="payment-table-wrap">
                      <table className="cert-table">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Cuota</th>
                            <th>Capital</th>
                            <th>Interes</th>
                            <th>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loan.pagos.map((p) => (
                            <tr key={p.id}>
                              <td>{fmtDate(p.fecha)}</td>
                              <td style={{ fontWeight: 600 }}>{fmt(p.cuota)}</td>
                              <td>{fmt(p.capital)}</td>
                              <td>{fmt(p.interes)}</td>
                              <td>{showBalance ? fmt(p.balance) : '\u2022\u2022\u2022\u2022'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Loan types */}
      <div className="section-card">
        <div className="section-card__header">
          <h2>Tipos de Prestamo Disponibles</h2>
        </div>
        <div className="loan-types-grid">
          {LOAN_TYPES.map((lt) => (
            <div className="loan-type-card" key={lt.name}>
              <div className="loan-type-card__icon"><lt.icon size={20} /></div>
              <div className="loan-type-card__content">
                <h4>{lt.name}</h4>
                <p>{lt.desc}</p>
              </div>
              <span className="loan-type-card__rate">{lt.rate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calculator */}
      <div className="section-card">
        <div className="section-card__header section-card__header--clickable" onClick={() => setShowCalc(!showCalc)}>
          <h2><Calculator size={16} /> Calculadora de Prestamos</h2>
          {showCalc ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {showCalc && (
          <>
            <div className="calc-grid">
              <div className="input-group">
                <label>Monto (RD$)</label>
                <input type="number" value={monto} onChange={(e) => setMonto(Number(e.target.value))} min="10000" max="5000000" step="10000" />
              </div>
              <div className="input-group">
                <label>Plazo (meses)</label>
                <select value={plazo} onChange={(e) => setPlazo(Number(e.target.value))}>
                  {[6, 12, 18, 24, 36, 48, 60].map((m) => <option key={m} value={m}>{m} meses</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Tasa anual (%)</label>
                <input type="number" value={tasa} onChange={(e) => setTasa(Number(e.target.value))} min="1" max="50" step="0.5" />
              </div>
            </div>
            <div className="calc-result">
              <p>Cuota mensual estimada</p>
              <h2>{fmt(cuota)}</h2>
              <div className="calc-result__details">
                <span>Total a pagar: <strong>{fmt(totalPagar)}</strong></span>
                <span>Interes total: <strong>{fmt(interesTotal)}</strong></span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      <div className="cta-card">
        <div className="cta-card__content">
          <h3>Listo para solicitar tu prestamo?</h3>
          <p>Visitanos o contactanos para iniciar tu solicitud.</p>
        </div>
        <div className="cta-card__actions">
          <a href="https://wa.me/18094433140?text=Hola%2C%20me%20interesa%20solicitar%20un%20prestamo" target="_blank" rel="noopener noreferrer" className="btn btn--primary">
            Solicitar por WhatsApp <ArrowRight size={16} />
          </a>
          <a href="tel:+18095443140" className="btn btn--outline">(809) 544-3140</a>
        </div>
      </div>
    </>
  );
}

export default Prestamos;
