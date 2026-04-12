import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Calculator, Award, User, Settings, LogOut,
  LayoutDashboard, HelpCircle, Phone, PiggyBank,
} from 'lucide-react';
import { clearSession, closeServerSession } from '../services/api';
import ChatAgent from './ChatAgent';
import '../styles/dashboard.css';

const NAV_SECTIONS = [
  {
    label: 'General',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Resumen' },
    ],
  },
  {
    label: 'Servicios',
    items: [
      { to: '/ahorros', icon: PiggyBank, label: 'Ahorros' },
      { to: '/prestamos', icon: Calculator, label: 'Préstamos' },
      { to: '/certificados', icon: Award, label: 'Certificados' },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { to: '/perfil', icon: User, label: 'Mi Perfil' },
      { to: '/configuracion', icon: Settings, label: 'Configuración' },
    ],
  },
];

const MOBILE_NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/ahorros', icon: PiggyBank, label: 'Ahorros' },
  { to: '/prestamos', icon: Calculator, label: 'Prestamos' },
  { to: '/certificados', icon: Award, label: 'Certificados' },
  { to: '/perfil', icon: User, label: 'Perfil' },
];

function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();
  const profileName = (storedUser.fullName || [storedUser.nombres, storedUser.apellidos].filter(Boolean).join(' '))
    .toString()
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ') || 'Mi perfil';

  const handleLogout = async () => {
    await closeServerSession();
    clearSession();
    navigate('/login');
  };

  return (
    <div className="dash dash--with-chat">
      <aside className="dash__sidebar">
        {/* Brand */}
        <div className="sidebar__brand">
          <div className="sidebar__brand-icon">CE</div>
          <Link to="/perfil" className="sidebar__brand-info sidebar__brand-info--profile">
            <span className="sidebar__brand-name">{profileName}</span>
            <span className="sidebar__brand-sub">Ver perfil</span>
          </Link>
        </div>

        {/* Navigation sections */}
        <nav className="sidebar__nav">
          {NAV_SECTIONS.map((section) => (
            <div className="sidebar__section" key={section.label}>
              <span className="sidebar__section-label">{section.label}</span>
              {section.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-item ${location.pathname === item.to ? 'nav-item--active' : ''}`}
                >
                  <item.icon size={17} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          <a
            href="https://wa.me/18094433140"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item nav-item--support"
          >
            <HelpCircle size={17} />
            <span>Soporte</span>
          </a>
          <a href="tel:+18095443140" className="nav-item nav-item--support">
            <Phone size={17} />
            <span>(809) 544-3140</span>
          </a>
          <button className="nav-item nav-item--logout" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="dash__main">
        {children}
      </main>

      <nav className="mobile-nav" aria-label="Navegacion movil">
        {MOBILE_NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`mobile-nav__item ${location.pathname === item.to ? 'mobile-nav__item--active' : ''}`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <aside className="dash__chat">
        <ChatAgent />
      </aside>
    </div>
  );
}

export default DashboardLayout;
