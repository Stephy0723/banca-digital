import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Landmark, ArrowLeftRight, CreditCard,
  ClipboardList, User, ShieldCheck, MessageCircle
} from 'lucide-react';
import logo from '../../assets/CoopEocala.jpg';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type NavSection = { section: string };
type NavLink = { path: string; icon: typeof LayoutDashboard; label: string; badge?: string };
type NavItem = NavSection | NavLink;

const navItems: NavItem[] = [
  { section: 'Principal' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/accounts', icon: Landmark, label: 'Mis Cuentas' },
  { path: '/transfers', icon: ArrowLeftRight, label: 'Transferencias' },
  { section: 'Operaciones' },
  { path: '/payments', icon: CreditCard, label: 'Pagos' },
  { path: '/transactions', icon: ClipboardList, label: 'Movimientos' },
  { section: 'Personal' },
  { path: '/profile', icon: User, label: 'Mi Perfil' },
  { path: '/security', icon: ShieldCheck, label: 'Seguridad' },
  { path: '/support', icon: MessageCircle, label: 'Soporte', badge: '1' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <img src={logo} alt="CoopEocala" className="sidebar__logo-img" />
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-name">CoopEocala</span>
            <span className="sidebar__brand-subtitle">Cooperativa Digital</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item, index) => {
            if ('section' in item) {
              return (
                <div key={index} className="sidebar__section-label">
                  {item.section}
                </div>
              );
            }

            const linkItem = item as NavLink;
            const isActive = location.pathname === linkItem.path;
            const Icon = linkItem.icon;

            return (
              <NavLink
                key={linkItem.path}
                to={linkItem.path}
                className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} className="sidebar__link-icon" />
                <span>{linkItem.label}</span>
                {linkItem.badge && (
                  <span className="sidebar__link-badge">{linkItem.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <NavLink to="/profile" className="sidebar__user" onClick={onClose}>
            <div className="sidebar__avatar">
              {user ? getInitials(user.fullName) : '??'}
            </div>
            <div className="sidebar__user-info">
              <div className="sidebar__user-name">{user?.fullName || 'Socio'}</div>
              <div className="sidebar__user-email">{user?.email || ''}</div>
            </div>
          </NavLink>
        </div>
      </aside>

      <button
        className="sidebar-toggle"
        onClick={() => (isOpen ? onClose() : document.dispatchEvent(new CustomEvent('toggle-sidebar')))}
        aria-label="Toggle sidebar"
      >
        {isOpen ? '\u2715' : '\u2630'}
      </button>
    </>
  );
}
