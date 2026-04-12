import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { clearSession } from '../services/api';
import '../styles/navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const renderGuestActions = () => {
    if (location.pathname === '/login') {
      return (
        <>
          <Link to="/" className="btn-nav btn-nav--outline">Inicio</Link>
          <Link to="/register" className="btn-nav btn-nav--gold">Activar acceso</Link>
        </>
      );
    }

    if (location.pathname === '/register') {
      return (
        <>
          <Link to="/" className="btn-nav btn-nav--outline">Inicio</Link>
          <Link to="/login" className="btn-nav btn-nav--primary">Iniciar sesion</Link>
        </>
      );
    }

    return (
      <>
        <Link to="/login" className="btn-nav btn-nav--outline">Iniciar sesion</Link>
        <Link to="/register" className="btn-nav btn-nav--gold">Activar acceso</Link>
      </>
    );
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        <Sprout size={26} />
        <span>CoopEocala</span>
      </Link>

      <div className="navbar__actions">
        <button className="theme-toggle" onClick={toggleTheme} title="Cambiar tema">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {isLoggedIn ? (
          <>
            <Link to="/dashboard" className="btn-nav btn-nav--outline">Mi panel</Link>
            <Link to="/perfil" className="btn-nav btn-nav--outline">Perfil</Link>
            <button type="button" className="btn-nav btn-nav--primary" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </>
        ) : (
          renderGuestActions()
        )}
      </div>
    </header>
  );
}

export default Navbar;
