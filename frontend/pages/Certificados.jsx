import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, ArrowRight, TrendingUp, Eye, EyeOff,
  ChevronDown, ChevronUp, CalendarClock, BarChart3,
  Clock, CheckCircle2,
} from 'lucide-react';
import api, { clearSession } from '../services/api';
import '../styles/pages.css';

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(Number(v || 0));
const fmtDate = (v) => { if (!v) return '---'; const d = new Date(v); return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('es-DO', { dateStyle: 'medium' }); };

const MOCK_CERTS = [
  {
    contrato: 'CD-5001-2024-001', tipoCertificado: 'Plazo Fijo 12M', balanceActual: 500000,
    montoInicial: 500000, tasaAnual: 9.5, plazoMeses: 12,
    fechaApertura: '2025-06-15', fechaVencimiento: '2026-06-15',
    ultimaFechaPago: '2026-03-15', interesAcumulado: 35625, estado: 'Vigente',
    pagosInteres: [
      { id: 1, fecha: '2026-03-15', monto: 3958.33 },
      { id: 2, fecha: '2026-02-15', monto: 3958.33 },
      { id: 3, fecha: '2026-01-15', monto: 3958.33 },
      { id: 4, fecha: '2025-12-15', monto: 3958.33 },
      { id: 5, fecha: '2025-11-15', monto: 3958.33 },
    ],
  },
  {
    contrato: 'CD-5001-2024-002', tipoCertificado: 'Plazo Fijo 6M', balanceActual: 200000,
    montoInicial: 200000, tasaAnual: 8.0, plazoMeses: 6,
    fechaApertura: '2025-10-28', fechaVencimiento: '2026-04-28',
    ultimaFechaPago: '2026-02-28', interesAcumulado: 6666.67, estado: 'Vigente',
    pagosInteres: [
      { id: 1, fecha: '2026-02-28', monto: 1333.33 },
      { id: 2, fecha: '2026-01-28', monto: 1333.33 },
      { id: 3, fecha: '2025-12-28', monto: 1333.33 },
    ],
  },
];

const CERT_OPTIONS = [
  { plazo: '3 meses', tasa: '6.5%', minimo: 'RD$ 10,000' },
  { plazo: '6 meses', tasa: '8.0%', minimo: 'RD$ 10,000' },
  { plazo: '12 meses', tasa: '9.5%', minimo: 'RD$ 25,000' },
  { plazo: '24 meses', tasa: '10.5%', minimo: 'RD$ 50,000' },
];

function Certificados() {
  const [certificados, setCertificados] = useState(MOCK_CERTS);
  const [showBalance, setShowBalance] = useState(true);
  const [expandedCert, setExpandedCert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        const { data } = await api.get('/accounts/me');
        if (!ignore && data.certificados) setCertificados(data.certificados);
      } catch (error) {
        if (error.response?.status === 401) { clearSession(); navigate('/login'); }
      }
    };
    fetchData();
    return () => { ignore = true; };
  }, [navigate]);

  const totalBalance = certificados.reduce((s, c) => s + (c.balanceActual || 0), 0);
  const totalInteres = certificados.reduce((s, c) => s + (c.interesAcumulado || 0), 0);

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Certificados</h1>
          <p className="page-subtitle">Consulta tus certificados de deposito e intereses</p>
        </div>
        <button className="balance-vis-btn" onClick={() => setShowBalance(!showBalance)}>
          {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
          {showBalance ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      {/* Summary */}
      <div className="summary-cards">
        <div className="summary-card summary-card--gold">
          <div className="summary-card__icon"><Award size={22} /></div>
          <div>
            <span className="summary-card__label">Capital invertido</span>
            <h3 className="summary-card__value">{showBalance ? fmt(totalBalance) : '\u2022\u2022\u2022\u2022'}</h3>
          </div>
        </div>
        <div className="summary-card summary-card--success">
          <div className="summary-card__icon"><TrendingUp size={22} /></div>
          <div>
            <span className="summary-card__label">Interes acumulado</span>
            <h3 className="summary-card__value">{showBalance ? fmt(totalInteres) : '\u2022\u2022\u2022\u2022'}</h3>
          </div>
        </div>
        <div className="summary-card summary-card--primary">
          <div className="summary-card__icon"><BarChart3 size={22} /></div>
          <div>
            <span className="summary-card__label">Rendimiento</span>
            <h3 className="summary-card__value">{totalBalance > 0 ? ((totalInteres / totalBalance) * 100).toFixed(2) : 0}%</h3>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card__icon"><CalendarClock size={22} /></div>
          <div>
            <span className="summary-card__label">Certificados activos</span>
            <h3 className="summary-card__value">{certificados.length}</h3>
          </div>
        </div>
      </div>

      {/* Certificate cards */}
      {certificados.map((cert) => {
        const isExpanded = expandedCert === cert.contrato;
        const now = new Date();
        const start = new Date(cert.fechaApertura);
        const end = new Date(cert.fechaVencimiento);
        const totalDays = Math.max((end - start) / 86400000, 1);
        const elapsed = Math.min(Math.max((now - start) / 86400000, 0), totalDays);
        const progress = ((elapsed / totalDays) * 100).toFixed(1);
        const daysLeft = Math.max(Math.ceil((end - now) / 86400000), 0);

        return (
          <div key={cert.contrato} className="account-card account-card--cert">
            <div className="account-card__header" onClick={() => setExpandedCert(isExpanded ? null : cert.contrato)}>
              <div className="account-card__left">
                <div className="account-card__icon account-card__icon--cert"><Award size={20} /></div>
                <div>
                  <h3>Certificado</h3>
                  <span className="account-card__contrato">{cert.contrato}</span>
                </div>
              </div>
              <div className="account-card__right">
                <div className="account-card__balance">
                  <span className="account-card__balance-label">Capital</span>
                  <strong>{showBalance ? fmt(cert.balanceActual) : '\u2022\u2022\u2022\u2022'}</strong>
                </div>
                <span className="account-card__rate account-card__rate--gold">{cert.tasaAnual}% anual</span>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>

            {isExpanded && (
              <div className="account-card__body">
                {/* Maturity progress */}
                <div className="cert-maturity">
                  <div className="cert-maturity__header">
                    <span>Progreso hasta vencimiento</span>
                    <strong>{daysLeft} dias restantes</strong>
                  </div>
                  <div className="cert-maturity__bar">
                    <div className="cert-maturity__fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="cert-maturity__labels">
                    <span>{fmtDate(cert.fechaApertura)}</span>
                    <span>{fmtDate(cert.fechaVencimiento)}</span>
                  </div>
                </div>

                <div className="account-card__meta">
                  <div><span>Monto inicial</span><strong>{showBalance ? fmt(cert.montoInicial) : '\u2022\u2022\u2022\u2022'}</strong></div>
                  <div><span>Tasa anual</span><strong>{cert.tasaAnual}%</strong></div>
                  <div><span>Plazo</span><strong>{cert.plazoMeses} meses</strong></div>
                  <div><span>Interes acumulado</span><strong className="text-success">{showBalance ? fmt(cert.interesAcumulado) : '\u2022\u2022\u2022\u2022'}</strong></div>
                  <div>
                    <span>Estado</span>
                    <strong>
                      <span className={`inline-status ${cert.estado === 'Vigente' ? 'inline-status--ok' : ''}`}>
                        <CheckCircle2 size={12} /> {cert.estado}
                      </span>
                    </strong>
                  </div>
                  <div><span>Vencimiento</span><strong>{fmtDate(cert.fechaVencimiento)}</strong></div>
                </div>

                {/* Interest payments */}
                {cert.pagosInteres && cert.pagosInteres.length > 0 && (
                  <>
                    <h4 className="account-card__section-title">Pagos de interes</h4>
                    <div className="payment-table-wrap">
                      <table className="cert-table">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cert.pagosInteres.map((p) => (
                            <tr key={p.id}>
                              <td>{fmtDate(p.fecha)}</td>
                              <td className="text-success" style={{ fontWeight: 600 }}>+{fmt(p.monto)}</td>
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

      {/* Options */}
      <div className="section-card">
        <div className="section-card__header">
          <h2><Clock size={16} /> Opciones de Certificados</h2>
        </div>
        <div className="cert-options-grid">
          {CERT_OPTIONS.map((opt) => (
            <div className="cert-opt-card" key={opt.plazo}>
              <div className="cert-opt-card__rate">{opt.tasa}</div>
              <h4>{opt.plazo}</h4>
              <span>Minimo: {opt.minimo}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-card cta-card--gold">
        <div className="cta-card__content">
          <h3>Quieres abrir un nuevo certificado?</h3>
          <p>Contactanos para conocer las tasas vigentes.</p>
        </div>
        <div className="cta-card__actions">
          <a href="https://wa.me/18094433140?text=Hola%2C%20me%20interesa%20abrir%20un%20certificado" target="_blank" rel="noopener noreferrer" className="btn btn--gold">
            Solicitar por WhatsApp <ArrowRight size={16} />
          </a>
          <a href="tel:+18095443140" className="btn btn--outline">(809) 544-3140</a>
        </div>
      </div>
    </>
  );
}

export default Certificados;
