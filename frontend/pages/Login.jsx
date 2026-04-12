import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck, Sprout } from 'lucide-react';
import api, { saveSession } from '../services/api';
import '../styles/login.css';

const INITIAL_FORM = { identificacion: '', password: '' };
const INITIAL_2FA = { code: '', recoveryCode: '' };

function Login() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [twoFactorForm, setTwoFactorForm] = useState(INITIAL_2FA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const inTwoFactorStep = Boolean(twoFactorToken);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    if (!location.state?.notice) {
      return;
    }

    setNotice(location.state.notice);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleTwoFactorChange = (event) => {
    setTwoFactorForm({
      ...twoFactorForm,
      [event.target.name]: event.target.value,
    });
  };

  const resetTwoFactorStep = () => {
    setTwoFactorToken('');
    setPendingUser(null);
    setTwoFactorForm(INITIAL_2FA);
    setUseRecoveryCode(false);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', form);

      if (data.requiresTwoFactor) {
        setTwoFactorToken(data.twoFactorToken);
        setPendingUser(data.user);
        setTwoFactorForm(INITIAL_2FA);
        return;
      }

      saveSession(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    try {
      setLoading(true);
      const payload = {
        twoFactorToken,
        code: useRecoveryCode ? '' : twoFactorForm.code,
        recoveryCode: useRecoveryCode ? twoFactorForm.recoveryCode : '',
      };
      const { data } = await api.post('/auth/login/2fa', payload);
      saveSession(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al validar el segundo factor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form
        className="login-box"
        onSubmit={inTwoFactorStep ? handleTwoFactorSubmit : handleSubmit}
      >
        <div className="login-brand-icon">
          <Sprout size={26} />
        </div>

        {!inTwoFactorStep ? (
          <>
            <h1>Acceso de socios</h1>
            <p>Ingresa con tu identificacion y contrasena web</p>

            <input
              type="text"
              name="identificacion"
              placeholder="Cedula o identificacion"
              value={form.identificacion}
              onChange={handleChange}
              required
              autoFocus
            />
            <input
              type="password"
              name="password"
              placeholder="Contrasena"
              value={form.password}
              onChange={handleChange}
              required
            />
          </>
        ) : (
          <>
            <h1>Verificacion 2FA</h1>
            <p>Confirma tu acceso con tu app autenticadora o un codigo de respaldo.</p>

            {pendingUser?.fullName && (
              <div className="login-user-chip">
                <ShieldCheck size={15} />
                <span>{pendingUser.fullName}</span>
              </div>
            )}

            <div className="login-step-hint">
              {useRecoveryCode
                ? 'Usa uno de los codigos de respaldo que guardaste al activar 2FA.'
                : 'Abre tu app autenticadora, copia el codigo de 6 digitos y colocalo aqui.'}
            </div>

            {useRecoveryCode ? (
              <input
                type="text"
                name="recoveryCode"
                placeholder="Codigo de respaldo"
                value={twoFactorForm.recoveryCode}
                onChange={handleTwoFactorChange}
                required
                autoFocus
              />
            ) : (
              <input
                type="text"
                name="code"
                placeholder="Codigo de 6 digitos"
                value={twoFactorForm.code}
                onChange={handleTwoFactorChange}
                required
                autoFocus
              />
            )}
          </>
        )}

        {error && <div className="login-error">{error}</div>}
        {notice && <div className="login-notice">{notice}</div>}

        <button type="submit" disabled={loading}>
          {loading
            ? 'Procesando...'
            : inTwoFactorStep
              ? 'Confirmar acceso'
              : 'Iniciar sesion'}{' '}
          {!loading && <ArrowRight size={16} />}
        </button>

        {inTwoFactorStep ? (
          <>
            <div className="login-actions-row">
              <button
                type="button"
                className="login-link-btn"
                onClick={() => setUseRecoveryCode((value) => !value)}
              >
                <KeyRound size={14} />
                {useRecoveryCode ? 'Usar codigo de la app' : 'Usar codigo de respaldo'}
              </button>
              <button
                type="button"
                className="login-link-btn"
                onClick={resetTwoFactorStep}
              >
                <ArrowLeft size={14} />
                Volver
              </button>
            </div>
            <div className="auth-switch">
              Si no tienes acceso a tus codigos, contacta a CoopEocala.
            </div>
          </>
        ) : (
          <div className="auth-switch">
            No tienes acceso web? <Link to="/register">Activalo aqui</Link>
          </div>
        )}
      </form>
    </div>
  );
}

export default Login;
