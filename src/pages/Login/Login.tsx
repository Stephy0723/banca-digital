import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Zap, TrendingUp } from 'lucide-react';
import logo from '../../assets/CoopEocala.jpg';
import './Login.css';

type AuthMode = 'login' | 'register';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('Ana Martinez');
  const [email, setEmail] = useState('ana@coopeocala.com');
  const [password, setPassword] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName =
      fullName.trim() || email.split('@')[0].replace(/[._-]/g, ' ');

    login({
      email: email.trim() || 'socio@coopeocala.com',
      fullName: normalizedName,
    });
    navigate('/dashboard');
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <img src={logo} alt="CoopEocala" className="auth-panel__logo" />
        <span className="auth-panel__pill">Cooperativa Digital</span>
        <h1>Tu cooperativa digital, moderna y confiable.</h1>
        <p>
          Ahorro, crédito y servicios múltiples al alcance de tu mano.
          Accede como socio para gestionar tus productos cooperativos.
        </p>

        <div className="auth-panel__highlights">
          <article>
            <div className="auth-panel__highlight-icon">
              <Shield size={18} />
            </div>
            <div>
              <strong>Certificada por la UAF</strong>
              <span>Sujeto obligado con verificación segura.</span>
            </div>
          </article>
          <article>
            <div className="auth-panel__highlight-icon">
              <Zap size={18} />
            </div>
            <div>
              <strong>Servicios múltiples</strong>
              <span>Ahorros, préstamos, seguros, recargas y marbetes.</span>
            </div>
          </article>
          <article>
            <div className="auth-panel__highlight-icon">
              <TrendingUp size={18} />
            </div>
            <div>
              <strong>Financiamiento vehicular</strong>
              <span>Hasta 80% del valor, plazos de hasta 60 meses.</span>
            </div>
          </article>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'auth-tab auth-tab--active' : 'auth-tab'}
            onClick={() => setMode('login')}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'auth-tab auth-tab--active' : 'auth-tab'}
            onClick={() => setMode('register')}
          >
            Hazte Socio
          </button>
        </div>

        <div className="auth-card__header">
          <p className="auth-card__eyebrow">
            {mode === 'login' ? 'Acceso de socios' : 'Nuevo socio'}
          </p>
          <h2>{mode === 'login' ? 'Bienvenido de vuelta' : 'Únete a CoopEocala'}</h2>
          <p>
            {mode === 'login'
              ? 'Ingresa tus credenciales para acceder a tu cuenta cooperativa.'
              : 'Regístrate como socio y accede a todos nuestros servicios.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="auth-field">
              <span>Nombre completo</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </label>
          )}

          <label className="auth-field">
            <span>Correo electrónico</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="socio@coopeocala.com"
            />
          </label>

          <label className="auth-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
            />
          </label>

          <button className="auth-submit" type="submit">
            {mode === 'login' ? 'Acceder a mi cuenta' : 'Crear cuenta de socio'}
          </button>
        </form>
      </div>
    </div>
  );
}
