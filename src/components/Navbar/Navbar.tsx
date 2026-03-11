import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notifications } from '../../data/mockData';
import { Search, Moon, Sun, Bell, LogOut, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import './Navbar.css';

const notifIcons = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Hace un momento';
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${Math.floor(hours / 24)}d`;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className="topbar">
      <div className="topbar__search">
        <Search size={16} className="topbar__search-icon" />
        <input
          className="topbar__search-input"
          type="text"
          placeholder="Buscar movimientos, cuentas..."
        />
      </div>

      <div className="topbar__actions">
        <button
          className="topbar__theme-toggle"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="topbar__notifications" ref={dropdownRef}>
          <button
            className="topbar__btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notificaciones"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="topbar__btn-badge" />}
          </button>

          {showNotifications && (
            <div className="topbar__dropdown">
              <div className="topbar__dropdown-header">
                Notificaciones
                <span className="topbar__dropdown-count">{unreadCount} sin leer</span>
              </div>
              {notifications.map(notif => {
                const NotifIcon = notifIcons[notif.type];
                return (
                  <div
                    key={notif.id}
                    className={`topbar__notification-item ${!notif.read ? 'topbar__notification-item--unread' : ''}`}
                  >
                    <NotifIcon size={14} className={`topbar__notification-icon topbar__notification-icon--${notif.type}`} />
                    <div className="topbar__notification-content">
                      <div className="topbar__notification-title">{notif.title}</div>
                      <div className="topbar__notification-message">{notif.message}</div>
                      <div className="topbar__notification-time">{formatTimeAgo(notif.date)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="topbar__divider" />

        <div className="topbar__user" onClick={() => navigate('/profile')}>
          <div className="topbar__avatar">
            {user ? getInitials(user.fullName) : '??'}
          </div>
          <span className="topbar__user-name">{user?.fullName}</span>
        </div>

        <button className="topbar__logout" onClick={handleLogout} title="Cerrar sesión">
          <LogOut size={16} />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
}
