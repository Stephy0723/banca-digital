import { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';
import Configuracion from './pages/Configuracion';
import Prestamos from './pages/Prestamos';
import Certificados from './pages/Certificados';
import Ahorros from './pages/Ahorros';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';
import api, { clearSession, closeServerSession } from './services/api';

const PUBLIC_PAGES = ['/', '/login', '/register'];
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPublic = PUBLIC_PAGES.includes(location.pathname);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const validateStoredSession = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setCheckingSession(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/validate');
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch (error) {
        clearSession();
      } finally {
        setCheckingSession(false);
      }
    };

    validateStoredSession();
  }, []);

  useEffect(() => {
    if (checkingSession || isPublic || !localStorage.getItem('token')) {
      return undefined;
    }

    let inactivityTimer;
    let sessionClosed = false;

    const resetInactivityTimer = () => {
      window.clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(() => {
        if (sessionClosed) {
          return;
        }

        sessionClosed = true;
        closeServerSession().finally(() => {
          clearSession();
          navigate('/login', {
            replace: true,
            state: {
              notice: 'Tu sesion se cerro automaticamente despues de 10 minutos sin actividad.',
            },
          });
        });
      }, INACTIVITY_TIMEOUT_MS);
    };

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      window.clearTimeout(inactivityTimer);
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
    };
  }, [checkingSession, isPublic, navigate, location.pathname]);

  if (checkingSession) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          color: '#0d7c5f',
          fontWeight: 700,
        }}
      >
        Validando sesion...
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      {isPublic ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      ) : (
        <DashboardLayout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="/prestamos" element={<Prestamos />} />
            <Route path="/certificados" element={<Certificados />} />
            <Route path="/ahorros" element={<Ahorros />} />
          </Routes>
        </DashboardLayout>
      )}
    </div>
  );
}

export default App;
