import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout, ArrowRight, ArrowLeft, Mail, Lock, UserCheck,
  ShieldCheck, ExternalLink, MessageCircle, Eye, EyeOff,
  CheckCircle2, Loader2,
} from 'lucide-react';
import api from '../services/api';
import '../styles/login.css';

const SUPPORT_URL = 'https://coopeocala.com/registro-de-socios';
const WHATSAPP_URL = 'https://wa.me/18094433140?text=Hola%20CoopeOcala%2C%20necesito%20ayuda%20para%20registrarme%20en%20la%20banca%20digital.';

const STEPS = [
  { label: 'Identidad', icon: UserCheck },
  { label: 'Correo', icon: Mail },
  { label: 'Contraseña', icon: Lock },
];

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registrationToken, setRegistrationToken] = useState('');
  const [clientInfo, setClientInfo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [codeResending, setCodeResending] = useState(false);

  // Step 1 fields
  const [identity, setIdentity] = useState({
    nombres: '', apellidos: '', identificacion: '',
    fechaNacimiento: '', codigoCliente: '',
  });

  // Step 2 fields
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Step 3 fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/dashboard');
  }, [navigate]);

  const handleIdentityChange = (e) => {
    setIdentity({ ...identity, [e.target.name]: e.target.value });
  };

  /* ── Step 1: Identify client ── */
  const handleIdentify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/identify', identity);
      setRegistrationToken(data.registrationToken);
      setClientInfo(data.client);
      setStep(1);
      setSuccess('');
    } catch (err) {
      const res = err.response;
      if (res?.status === 404 && res?.data?.contactSupport) {
        setError('NOT_FOUND');
      } else if (res?.data?.goToLogin) {
        setError('ALREADY_REGISTERED');
      } else {
        setError(res?.data?.message || 'Error al validar los datos');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2a: Send code ── */
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim()) return setError('Ingresa tu correo electronico');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/send-code', {
        registrationToken, email,
      });
      setRegistrationToken(data.registrationToken);
      setCodeSent(true);
      setSuccess(data.message || 'Codigo enviado a tu correo.');
    } catch (err) {
      const res = err.response;
      if (res?.data?.goToLogin) {
        setError('ALREADY_REGISTERED');
      } else {
        setError(res?.data?.message || 'Error al enviar el codigo');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2b: Verify code ── */
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!code.trim()) return setError('Ingresa el codigo de 6 digitos');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/verify-code', {
        registrationToken, code: code.trim(),
      });
      setRegistrationToken(data.registrationToken);
      setEmailVerified(true);
      setSuccess('Correo verificado correctamente.');
      setTimeout(() => { setStep(2); setSuccess(''); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al verificar el codigo');
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend code ── */
  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setCodeResending(true);
    try {
      const { data } = await api.post('/auth/register/send-code', {
        registrationToken, email,
      });
      setRegistrationToken(data.registrationToken);
      setCode('');
      setSuccess('Nuevo codigo enviado a tu correo.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reenviar el codigo');
    } finally {
      setCodeResending(false);
    }
  };

  /* ── Step 3: Complete registration ── */
  const handleComplete = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password.length < 8) return setError('La contrasena debe tener al menos 8 caracteres');
    if (password !== confirmPassword) return setError('Las contrasenas no coinciden');
    setLoading(true);
    try {
      await api.post('/auth/register/complete', { registrationToken, password });
      setSuccess('Cuenta creada exitosamente. Redirigiendo al inicio de sesion...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const res = err.response;
      if (res?.data?.goToLogin) {
        setError('ALREADY_REGISTERED');
      } else {
        setError(res?.data?.message || 'Error al completar el registro');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Error renderers ── */
  const renderError = () => {
    if (!error) return null;

    if (error === 'NOT_FOUND') {
      return (
        <div className="register-alert register-alert--warning">
          <p>No pudimos validar tus datos en nuestra base de socios.</p>
          <p className="register-alert__hint">
            Si aun no eres socio, puedes registrarte o contactar a nuestro equipo:
          </p>
          <div className="register-alert__actions">
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="register-alert__link">
              <ExternalLink size={14} /> Ir a la pagina web
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="register-alert__link register-alert__link--wa">
              <MessageCircle size={14} /> Hablar con un experto
            </a>
          </div>
        </div>
      );
    }

    if (error === 'ALREADY_REGISTERED') {
      return (
        <div className="register-alert register-alert--info">
          <p>Este socio ya tiene acceso web activo.</p>
          <Link to="/login" className="register-alert__link">
            <ArrowRight size={14} /> Ir a iniciar sesion
          </Link>
        </div>
      );
    }

    return <div className="login-error">{error}</div>;
  };

  return (
    <div className="login-page">
      <div className="login-box register-box">
        <div className="login-brand-icon"><Sprout size={26} /></div>
        <h1>Activa tu acceso web</h1>
        <p className="register-subtitle">Completa los pasos para crear tu acceso a la banca digital</p>

        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => {
            const StepIcon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.label} className={`stepper__step ${done ? 'stepper__step--done' : ''} ${active ? 'stepper__step--active' : ''}`}>
                <div className="stepper__circle">
                  {done ? <CheckCircle2 size={16} /> : <StepIcon size={16} />}
                </div>
                <span className="stepper__label">{s.label}</span>
                {i < STEPS.length - 1 && <div className="stepper__line" />}
              </div>
            );
          })}
        </div>

        {renderError()}
        {success && <div className="register-success">{success}</div>}

        {/* ═══ Step 1: Identity ═══ */}
        {step === 0 && (
          <form onSubmit={handleIdentify} className="register-form">
            <div className="register-field-group">
              <div className="register-field">
                <label>Nombres</label>
                <input
                  type="text" name="nombres" placeholder="Ej: Juan Carlos"
                  value={identity.nombres} onChange={handleIdentityChange} required autoFocus
                />
              </div>
              <div className="register-field">
                <label>Apellidos</label>
                <input
                  type="text" name="apellidos" placeholder="Ej: Perez Gomez"
                  value={identity.apellidos} onChange={handleIdentityChange} required
                />
              </div>
            </div>
            <div className="register-field">
              <label>Cedula o identificacion</label>
              <input
                type="text" name="identificacion" placeholder="Ej: 001-1234567-8"
                value={identity.identificacion} onChange={handleIdentityChange} required
              />
            </div>
            <div className="register-field-group">
              <div className="register-field">
                <label>Fecha de nacimiento</label>
                <input
                  type="date" name="fechaNacimiento"
                  value={identity.fechaNacimiento} onChange={handleIdentityChange} required
                />
              </div>
              <div className="register-field">
                <label>Codigo de cliente</label>
                <input
                  type="text" name="codigoCliente" placeholder="Ej: 1234"
                  value={identity.codigoCliente} onChange={handleIdentityChange} required
                />
              </div>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? <><Loader2 size={16} className="spin" /> Validando...</> : <>Siguiente <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* ═══ Step 2: Email + Code ═══ */}
        {step === 1 && (
          <div className="register-form">
            {clientInfo && (
              <div className="register-client-card">
                <ShieldCheck size={18} />
                <div>
                  <strong>{clientInfo.fullName}</strong>
                  <span>{clientInfo.identificacion}</span>
                </div>
              </div>
            )}

            {!codeSent ? (
              <form onSubmit={handleSendCode}>
                <div className="register-field">
                  <label>Correo electronico</label>
                  <input
                    type="email" placeholder="tucorreo@ejemplo.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
                  />
                  <span className="register-field__hint">Te enviaremos un codigo de 6 digitos para verificar tu correo.</span>
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? <><Loader2 size={16} className="spin" /> Enviando...</> : <>Enviar codigo <Mail size={16} /></>}
                </button>
              </form>
            ) : !emailVerified ? (
              <form onSubmit={handleVerifyCode}>
                <div className="register-field">
                  <label>Codigo de verificacion</label>
                  <input
                    type="text" inputMode="numeric" maxLength={6} placeholder="000000"
                    value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required autoFocus className="register-code-input"
                  />
                  <span className="register-field__hint">
                    Ingresa el codigo de 6 digitos enviado a <strong>{email}</strong>
                  </span>
                </div>
                <button type="submit" disabled={loading || code.length < 6}>
                  {loading ? <><Loader2 size={16} className="spin" /> Verificando...</> : <>Verificar codigo <ShieldCheck size={16} /></>}
                </button>
                <button
                  type="button" className="register-resend-btn"
                  onClick={handleResendCode} disabled={codeResending}
                >
                  {codeResending ? 'Reenviando...' : 'Reenviar codigo'}
                </button>
              </form>
            ) : (
              <div className="register-verified">
                <CheckCircle2 size={32} />
                <p>Correo verificado correctamente</p>
              </div>
            )}

            {!emailVerified && (
              <button type="button" className="register-back-btn" onClick={() => { setStep(0); setError(''); setSuccess(''); }}>
                <ArrowLeft size={14} /> Volver
              </button>
            )}
          </div>
        )}

        {/* ═══ Step 3: Password ═══ */}
        {step === 2 && (
          <form onSubmit={handleComplete} className="register-form">
            <div className="register-client-card">
              <CheckCircle2 size={18} />
              <div>
                <strong>{clientInfo?.fullName}</strong>
                <span>{email}</span>
              </div>
            </div>
            <div className="register-field">
              <label>Contrasena</label>
              <div className="register-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'} placeholder="Minimo 8 caracteres"
                  value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus
                />
                <button type="button" className="register-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="register-field">
              <label>Confirmar contrasena</label>
              <div className="register-password-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'} placeholder="Repite tu contrasena"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                />
                <button type="button" className="register-eye" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {password.length > 0 && (
              <div className="register-strength">
                <div className={`register-strength__bar ${password.length >= 8 ? 'register-strength__bar--ok' : ''}`} />
                <span>{password.length < 8 ? `${8 - password.length} caracteres mas` : 'Longitud valida'}</span>
              </div>
            )}
            <button type="submit" disabled={loading}>
              {loading ? <><Loader2 size={16} className="spin" /> Creando cuenta...</> : <>Crear acceso <Lock size={16} /></>}
            </button>
            <button type="button" className="register-back-btn" onClick={() => { setStep(1); setError(''); setSuccess(''); }}>
              <ArrowLeft size={14} /> Volver
            </button>
          </form>
        )}

        <div className="auth-switch">
          Ya tienes acceso? <Link to="/login">Inicia sesion aqui</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
