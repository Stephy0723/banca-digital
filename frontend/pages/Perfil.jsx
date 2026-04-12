import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Phone, Calendar, Shield, Wallet, Mail, MapPin,
  Clock, CheckCircle2, AlertTriangle, CreditCard,
  Award, Calculator, ChevronRight, FileText, Layers3,
  Settings, Eye, EyeOff,
} from 'lucide-react';
import api, { clearSession } from '../services/api';
import '../styles/pages.css';

const fmt = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 }).format(Number(v || 0));

const MOCK = {
  user: {
    fullName: 'Carlos Mendez', nombres: 'Carlos', apellidos: 'Mendez',
    identificacion: '001-1234567-8', tipoIdent: 'Cedula',
    fechaNacimiento: '1990-05-15', telefono: '809-555-1234',
    email: 'carlos.mendez@email.com', codigoCliente: '2040',
  },
  stats: { totalProductos: 8, balanceCuentas: 87450.75, balanceCertificados: 700000, balancePrestamos: 120000 },
  cuentas: [
    { contrato: 'AH-2040-0012-3456', tipoCuenta: 'Ahorro Corriente', balanceActual: 62450.75 },
    { contrato: 'AH-2040-0012-7890', tipoCuenta: 'Ahorro Navideno', balanceActual: 25000 },
  ],
  certificados: [
    { contrato: 'CD-5001-2024-001', tipoCertificado: 'Plazo Fijo 12M', balanceActual: 500000 },
    { contrato: 'CD-5001-2024-002', tipoCertificado: 'Plazo Fijo 6M', balanceActual: 200000 },
  ],
  prestamos: [
    { contrato: 'PR-3001-2025-001', tipoPrestamo: 'Personal', balanceActual: 120000 },
  ],
  recentLogins: [
    { date: '2026-03-23 09:12', device: 'Chrome \u00b7 Windows 11', ip: '192.168.1.45' },
    { date: '2026-03-22 14:30', device: 'Safari \u00b7 iPhone 15', ip: '10.0.0.12' },
    { date: '2026-03-20 08:45', device: 'Chrome \u00b7 Windows 11', ip: '192.168.1.45' },
  ],
};

function Perfil() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        const { data: res } = await api.get('/accounts/me');
        if (!ignore) { setData(res); localStorage.setItem('user', JSON.stringify(res.user)); }
      } catch (error) {
        if (error.response?.status === 401) { clearSession(); navigate('/login'); return; }
        if (!ignore) {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          setData({ ...MOCK, user: { ...MOCK.user, ...stored } });
        }
      } finally { if (!ignore) setLoading(false); }
    };
    fetchData();
    return () => { ignore = true; };
  }, [navigate]);

  if (loading) {
    return <div className="dash-loading"><div className="dash-loading__spinner" /><p>Cargando perfil...</p></div>;
  }

  const user = data?.user || {};
  const stats = data?.stats || {};
  const cuentas = data?.cuentas || [];
  const certificados = data?.certificados || [];
  const prestamos = data?.prestamos || [];
  const logins = data?.recentLogins || MOCK.recentLogins;

  const initials = user.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'S';

  const twoFAEnabled = Boolean(user.twoFactorEnabled);
  const patrimonio = (stats.balanceCuentas || 0) + (stats.balanceCertificados || 0);

  return (
    <div className="perfil-page">
      {/* Profile header card */}
      <div className="perfil-header">
        <div className="perfil-header__bg" />
        <div className="perfil-header__content">
          <div className="perfil-header__top">
            <div className="perfil-header__avatar">{initials}</div>
            <div className="perfil-header__info">
              <h1>{user.fullName || 'Socio'}</h1>
              <p><Shield size={13} /> {user.tipoIdent || 'Cedula'}: {user.identificacion || '---'}</p>
            </div>
            <div className="perfil-header__actions">
              <Link to="/configuracion" className="perfil-header__btn">
                <Settings size={15} /> Configuracion
              </Link>
            </div>
          </div>
          <div className="perfil-header__badges">
            <span className="perfil-badge perfil-badge--active"><CheckCircle2 size={11} /> Socio activo</span>
            {user.codigoCliente && <span className="perfil-badge perfil-badge--code">COD: {user.codigoCliente}</span>}
            {user.email && <span className="perfil-badge perfil-badge--email"><Mail size={11} /> {user.email}</span>}
            {twoFAEnabled
              ? <span className="perfil-badge perfil-badge--active"><Shield size={11} /> 2FA</span>
              : <span className="perfil-badge perfil-badge--warn"><AlertTriangle size={11} /> Sin 2FA</span>
            }
          </div>
        </div>
      </div>

      {/* Patrimonio */}
      <div className="perfil-patrimonio">
        <div className="perfil-patrimonio__main">
          <span className="perfil-patrimonio__label">Patrimonio total</span>
          <div className="perfil-patrimonio__row">
            <h2>{showBalance ? fmt(patrimonio) : '\u2022\u2022\u2022\u2022\u2022\u2022'}</h2>
            <button className="perfil-patrimonio__toggle" onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="perfil-patrimonio__items">
          <div className="perfil-patrimonio__item">
            <Wallet size={16} />
            <div>
              <span>Ahorros</span>
              <strong>{showBalance ? fmt(stats.balanceCuentas) : '\u2022\u2022\u2022\u2022'}</strong>
            </div>
          </div>
          <div className="perfil-patrimonio__divider" />
          <div className="perfil-patrimonio__item">
            <Award size={16} />
            <div>
              <span>Certificados</span>
              <strong>{showBalance ? fmt(stats.balanceCertificados) : '\u2022\u2022\u2022\u2022'}</strong>
            </div>
          </div>
          <div className="perfil-patrimonio__divider" />
          <div className="perfil-patrimonio__item">
            <Calculator size={16} />
            <div>
              <span>Prestamos</span>
              <strong>{showBalance ? fmt(stats.balancePrestamos) : '\u2022\u2022\u2022\u2022'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="perfil-grid">
        {/* Personal info */}
        <div className="section-card">
          <div className="section-card__header">
            <h2><User size={16} /> Datos personales</h2>
          </div>
          <div className="profile-info-list">
            <InfoRow icon={User} label="Nombre completo" value={user.fullName || '---'} />
            <InfoRow icon={Shield} label="Identificacion" value={`${user.tipoIdent || 'Cedula'}: ${user.identificacion || '---'}`} />
            <InfoRow icon={Calendar} label="Fecha de nacimiento" value={user.fechaNacimiento || '---'} />
            <InfoRow icon={Phone} label="Telefono" value={user.telefono || 'No registrado'} />
            <InfoRow icon={Mail} label="Correo electronico" value={user.email || 'No registrado'} />
            <InfoRow icon={MapPin} label="Codigo de cliente" value={user.codigoCliente || '---'} />
          </div>
          <div className="profile-info-note">
            <AlertTriangle size={13} />
            <span>Para actualizar tus datos personales, contacta a la cooperativa.</span>
          </div>
        </div>

        {/* Products */}
        <div className="section-card">
          <div className="section-card__header">
            <h2><CreditCard size={16} /> Mis productos</h2>
            <span className="section-card__count">{stats.totalProductos || 0} activos</span>
          </div>
          <div className="profile-products">
            <ProductRow icon={Wallet} label="Cuentas de ahorro" count={cuentas.length} amount={showBalance ? fmt(stats.balanceCuentas) : '\u2022\u2022\u2022\u2022'} to="/ahorros" color="primary" />
            <ProductRow icon={Award} label="Certificados" count={certificados.length} amount={showBalance ? fmt(stats.balanceCertificados) : '\u2022\u2022\u2022\u2022'} to="/certificados" color="gold" />
            <ProductRow icon={Calculator} label="Prestamos" count={prestamos.length} amount={showBalance ? fmt(stats.balancePrestamos) : '\u2022\u2022\u2022\u2022'} to="/prestamos" color="info" />
          </div>
        </div>

        {/* Security */}
        <div className="section-card">
          <div className="section-card__header">
            <h2><Shield size={16} /> Seguridad</h2>
            <Link to="/configuracion" className="btn btn--ghost btn--sm">Gestionar</Link>
          </div>
          <div className="security-items">
            <div className="security-item">
              <div className={`security-item__status ${twoFAEnabled ? 'security-item__status--ok' : 'security-item__status--warn'}`}>
                {twoFAEnabled ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              </div>
              <div>
                <h4>Autenticacion de dos factores</h4>
                <p>{twoFAEnabled ? 'Activada' : 'Inactiva \u2014 activa 2FA para mayor seguridad'}</p>
              </div>
            </div>
            <div className="security-item">
              <div className="security-item__status security-item__status--ok"><CheckCircle2 size={16} /></div>
              <div>
                <h4>Contrasena</h4>
                <p>Ultima actualizacion hace 30 dias</p>
              </div>
            </div>
            <div className="security-item">
              <div className="security-item__status security-item__status--ok"><CheckCircle2 size={16} /></div>
              <div>
                <h4>Correo verificado</h4>
                <p>{user.email || 'No registrado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent logins */}
        <div className="section-card">
          <div className="section-card__header">
            <h2><Clock size={16} /> Accesos recientes</h2>
          </div>
          <div className="login-history">
            {logins.map((l, i) => (
              <div key={i} className="login-history__item">
                <div className="login-history__dot" />
                <div>
                  <h4>{l.device}</h4>
                  <span>{l.date} \u00b7 IP: {l.ip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="perfil-support">
        <div>
          <h3><FileText size={16} /> Necesitas ayuda?</h3>
          <p>Si necesitas actualizar tus datos o tienes alguna consulta, contactanos.</p>
        </div>
        <div className="contact-block">
          <a href="tel:+18095443140"><Phone size={14} /> (809) 544-3140</a>
          <a href="https://wa.me/18094433140" target="_blank" rel="noopener noreferrer">
            <Mail size={14} /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="profile-info-row">
      <div className="profile-info-row__icon"><Icon size={14} /></div>
      <div>
        <span className="profile-info-row__label">{label}</span>
        <span className="profile-info-row__value">{value}</span>
      </div>
    </div>
  );
}

function ProductRow({ icon: Icon, label, count, amount, to, color }) {
  return (
    <Link to={to} className="profile-product-row">
      <div className={`profile-product-row__icon profile-product-row__icon--${color}`}><Icon size={16} /></div>
      <div className="profile-product-row__info">
        <h4>{label}</h4>
        <span>{count} {count === 1 ? 'activo' : 'activos'}</span>
      </div>
      <strong>{amount}</strong>
      <ChevronRight size={14} className="profile-product-row__arrow" />
    </Link>
  );
}

export default Perfil;
