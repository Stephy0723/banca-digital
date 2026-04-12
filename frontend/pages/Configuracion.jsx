import { useEffect, useState } from 'react';
import {
  Sun, Moon, Bell, Shield, Globe, Lock, Eye, EyeOff,
  AlertTriangle, CheckCircle2, Smartphone, LogOut,
  Monitor, Clock, ChevronDown, ChevronUp, Mail, Copy, RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api, { clearSession } from '../services/api';
import '../styles/pages.css';

const INITIAL_PASSWORD_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const formatDateTime = (value) => {
  if (!value) {
    return 'Sin actividad reciente';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-DO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

function Configuracion() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState(INITIAL_PASSWORD_FORM);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passMessage, setPassMessage] = useState(null);
  const [securityMessage, setSecurityMessage] = useState(null);
  const [securityLoading, setSecurityLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [securityData, setSecurityData] = useState({
    user: null,
    twoFactorEnabled: false,
    recoveryCodesRemaining: 0,
    sessions: [],
  });
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  const handleUnauthorized = () => {
    clearSession();
    navigate('/login');
  };

  const loadSecurity = async () => {
    try {
      const { data } = await api.get('/auth/security');
      setSecurityData(data);

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      setSecurityMessage({
        type: 'error',
        text: error.response?.data?.message || 'No pudimos cargar tu configuracion de seguridad.',
      });
    } finally {
      setSecurityLoading(false);
    }
  };

  useEffect(() => {
    loadSecurity();
  }, []);

  const copyText = async (text, successText) => {
    try {
      await navigator.clipboard.writeText(text);
      setSecurityMessage({ type: 'success', text: successText });
    } catch {
      setSecurityMessage({
        type: 'error',
        text: 'No fue posible copiar el contenido automaticamente.',
      });
    }
  };

  const handlePrepareTwoFactor = async () => {
    setSecurityMessage(null);
    setBackupCodes([]);
    setActionLoading('setup-2fa');

    try {
      const { data } = await api.post('/auth/2fa/setup');
      setTwoFactorSetup(data);
      setTwoFactorCode('');
    } catch (error) {
      setSecurityMessage({
        type: 'error',
        text: error.response?.data?.message || 'No pudimos preparar la configuracion 2FA.',
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleEnableTwoFactor = async (event) => {
    event.preventDefault();
    setSecurityMessage(null);
    setActionLoading('enable-2fa');

    try {
      const { data } = await api.post('/auth/2fa/enable', { code: twoFactorCode });
      setBackupCodes(data.recoveryCodes || []);
      setTwoFactorSetup(null);
      setTwoFactorCode('');
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      setSecurityMessage({ type: 'success', text: data.message });
      await loadSecurity();
    } catch (error) {
      setSecurityMessage({
        type: 'error',
        text: error.response?.data?.message || 'No pudimos activar 2FA.',
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleDisableTwoFactor = async () => {
    setSecurityMessage(null);
    setActionLoading('disable-2fa');

    try {
      const { data } = await api.post('/auth/2fa/disable', {
        password: disablePassword,
      });
      setDisablePassword('');
      setTwoFactorSetup(null);
      setBackupCodes([]);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      setSecurityMessage({ type: 'success', text: data.message });
      await loadSecurity();
    } catch (error) {
      setSecurityMessage({
        type: 'error',
        text: error.response?.data?.message || 'No pudimos desactivar 2FA.',
      });
    } finally {
      setActionLoading('');
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPassMessage(null);

    if (passwordForm.newPassword.length < 8) {
      setPassMessage({
        type: 'error',
        text: 'La contrasena debe tener al menos 8 caracteres',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassMessage({
        type: 'error',
        text: 'Las contrasenas no coinciden',
      });
      return;
    }

    setActionLoading('change-password');

    try {
      const { data } = await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPassMessage({ type: 'success', text: data.message });
      setPasswordForm(INITIAL_PASSWORD_FORM);
    } catch (error) {
      setPassMessage({
        type: 'error',
        text: error.response?.data?.message || 'No pudimos cambiar la contrasena.',
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleSessionClose = async (sessionId, current) => {
    setSecurityMessage(null);
    setActionLoading(`session-${sessionId}`);

    try {
      await api.delete(`/auth/sessions/${sessionId}`);

      if (current) {
        clearSession();
        navigate('/login', {
          replace: true,
          state: { notice: 'Tu sesion fue cerrada correctamente.' },
        });
        return;
      }

      setSecurityMessage({
        type: 'success',
        text: 'La sesion seleccionada fue cerrada.',
      });
      await loadSecurity();
    } catch (error) {
      setSecurityMessage({
        type: 'error',
        text: error.response?.data?.message || 'No pudimos cerrar la sesion seleccionada.',
      });
    } finally {
      setActionLoading('');
    }
  };

  return (
    <>
      <h1 className="page-title">Configuracion</h1>
      <p className="page-subtitle">Gestiona tu seguridad, tus sesiones y tu experiencia en la web.</p>

      <div className="config-grid">
        <div className="config-col">
          <div className="section-card">
            <div className="section-card__header">
              <h2>{theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} Apariencia</h2>
            </div>
            <div className="setting-row">
              <div className="setting-row__info">
                <h4>{theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}</h4>
                <p>Cambia entre el tema claro y oscuro</p>
              </div>
              <button className={`toggle ${theme === 'dark' ? 'toggle--on' : ''}`} onClick={toggleTheme} />
            </div>
          </div>

          <div className="section-card">
            <div className="section-card__header">
              <h2><Bell size={16} /> Notificaciones</h2>
            </div>
            <div className="setting-row">
              <div className="setting-row__info">
                <h4><Mail size={14} /> Notificaciones por correo</h4>
                <p>Recibe alertas de movimientos en tu cuenta</p>
              </div>
              <button className={`toggle ${emailNotif ? 'toggle--on' : ''}`} onClick={() => setEmailNotif(!emailNotif)} />
            </div>
            <div className="setting-row">
              <div className="setting-row__info">
                <h4><Smartphone size={14} /> Notificaciones push</h4>
                <p>Alertas en tiempo real en tu dispositivo</p>
              </div>
              <button className={`toggle ${notifications ? 'toggle--on' : ''}`} onClick={() => setNotifications(!notifications)} />
            </div>
            <div className="setting-row">
              <div className="setting-row__info">
                <h4><Shield size={14} /> Alertas de inicio de sesion</h4>
                <p>Recibe un aviso cuando se detecte un nuevo acceso</p>
              </div>
              <button className={`toggle ${loginAlerts ? 'toggle--on' : ''}`} onClick={() => setLoginAlerts(!loginAlerts)} />
            </div>
          </div>

          <div className="section-card">
            <div className="section-card__header">
              <h2><Globe size={16} /> Preferencias</h2>
            </div>
            <div className="setting-row">
              <div className="setting-row__info">
                <h4>Idioma</h4>
                <p>Espanol (Republica Dominicana)</p>
              </div>
              <span className="setting-badge">ES-DO</span>
            </div>
            <div className="setting-row">
              <div className="setting-row__info">
                <h4>Zona horaria</h4>
                <p>America/Santo_Domingo (UTC-4)</p>
              </div>
              <span className="setting-badge">AST</span>
            </div>
            <div className="setting-row">
              <div className="setting-row__info">
                <h4>Moneda</h4>
                <p>Peso Dominicano</p>
              </div>
              <span className="setting-badge">DOP</span>
            </div>
          </div>
        </div>

        <div className="config-col">
          <div className="section-card">
            <div className="section-card__header">
              <h2><Shield size={16} /> Seguridad</h2>
              {!securityLoading && (
                <span className={`inline-badge ${securityData.twoFactorEnabled ? 'inline-badge--success' : 'inline-badge--warning'}`}>
                  {securityData.twoFactorEnabled ? '2FA activo' : '2FA inactivo'}
                </span>
              )}
            </div>

            {securityMessage && (
              <div className={`password-form__msg password-form__msg--${securityMessage.type}`}>
                {securityMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                {securityMessage.text}
              </div>
            )}

            <div className="setting-row setting-row--column">
              <div className="setting-row__top">
                <div className="setting-row__info">
                  <h4><Shield size={14} /> Autenticacion de dos factores (2FA)</h4>
                  <p>Protege tu acceso con tu app autenticadora y codigos de respaldo.</p>
                </div>
                {!securityData.twoFactorEnabled ? (
                  <button className="btn btn--primary btn--sm" onClick={handlePrepareTwoFactor} disabled={actionLoading === 'setup-2fa'}>
                    <RefreshCw size={14} className={actionLoading === 'setup-2fa' ? 'spin' : ''} />
                    {twoFactorSetup ? 'Regenerar QR' : 'Configurar 2FA'}
                  </button>
                ) : null}
              </div>

              {securityLoading ? (
                <div className="twofa-active">
                  <RefreshCw size={16} className="spin" />
                  <span>Cargando configuracion de seguridad...</span>
                </div>
              ) : securityData.twoFactorEnabled ? (
                <div className="twofa-setup">
                  <div className="twofa-active">
                    <CheckCircle2 size={16} />
                    <span>2FA esta activa. Te quedan {securityData.recoveryCodesRemaining} codigos de respaldo disponibles.</span>
                  </div>
                  <div className="twofa-inline-actions">
                    <input
                      type="password"
                      value={disablePassword}
                      onChange={(event) => setDisablePassword(event.target.value)}
                      placeholder="Contrasena actual para desactivar 2FA"
                    />
                    <button className="btn btn--ghost btn--sm btn--danger-text" onClick={handleDisableTwoFactor} disabled={actionLoading === 'disable-2fa'}>
                      <LogOut size={13} />
                      {actionLoading === 'disable-2fa' ? 'Desactivando...' : 'Desactivar 2FA'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="twofa-warning">
                  <div className="twofa-warning__header">
                    <AlertTriangle size={18} />
                    <h4>2FA aun no esta activa</h4>
                  </div>
                  <p>Genera tu codigo QR, escanealo con Google Authenticator, Microsoft Authenticator o una app similar, y valida un codigo para activar la proteccion.</p>
                </div>
              )}

              {twoFactorSetup && !securityData.twoFactorEnabled && (
                <form className="twofa-setup" onSubmit={handleEnableTwoFactor}>
                  <div className="twofa-qr-card">
                    <img src={twoFactorSetup.qrCodeDataUrl} alt="Codigo QR de 2FA" className="twofa-qr-image" />
                    <div className="twofa-qr-copy">
                      <span>Si no puedes escanear el QR, usa esta clave manual:</span>
                      <div className="twofa-manual-key">{twoFactorSetup.manualKey}</div>
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => copyText(twoFactorSetup.manualKey, 'Clave manual copiada.')}>
                        <Copy size={14} /> Copiar clave
                      </button>
                    </div>
                  </div>

                  <div className="register-field">
                    <label>Codigo de 6 digitos</label>
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={(event) => setTwoFactorCode(event.target.value)}
                      placeholder="Ingresa el codigo de tu app"
                      required
                    />
                    <span className="register-field__hint">Despues de validar este codigo te entregaremos varios codigos de respaldo.</span>
                  </div>

                  <button type="submit" className="btn btn--primary btn--sm" disabled={actionLoading === 'enable-2fa'}>
                    <Shield size={14} /> {actionLoading === 'enable-2fa' ? 'Activando...' : 'Activar 2FA'}
                  </button>
                </form>
              )}

              {backupCodes.length > 0 && (
                <div className="twofa-backups">
                  <div className="twofa-warning__header">
                    <CheckCircle2 size={18} />
                    <h4>Codigos de respaldo</h4>
                  </div>
                  <p>Guardalos en un lugar seguro. Cada codigo puede usarse una sola vez para iniciar sesion.</p>
                  <div className="twofa-backups__grid">
                    {backupCodes.map((code) => (
                      <code key={code}>{code}</code>
                    ))}
                  </div>
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => copyText(backupCodes.join('\n'), 'Codigos de respaldo copiados.')}>
                    <Copy size={14} /> Copiar codigos
                  </button>
                </div>
              )}

              <div className="setting-row setting-row--column">
                <div className="setting-row__top" onClick={() => setShowPasswordForm(!showPasswordForm)} style={{ cursor: 'pointer' }}>
                  <div className="setting-row__info">
                    <h4><Lock size={14} /> Cambiar contrasena</h4>
                    <p>Al cambiarla, las otras sesiones activas se cerraran por seguridad.</p>
                  </div>
                  {showPasswordForm ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {showPasswordForm && (
                  <form className="password-form" onSubmit={handlePasswordChange}>
                    {passMessage && (
                      <div className={`password-form__msg password-form__msg--${passMessage.type}`}>
                        {passMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                        {passMessage.text}
                      </div>
                    )}
                    <div className="password-form__field">
                      <label>Contrasena actual</label>
                      <div className="password-form__input-wrap">
                        <input type={showCurrent ? 'text' : 'password'} value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} placeholder="Ingresa tu contrasena actual" />
                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="password-form__eye">
                          {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <div className="password-form__field">
                      <label>Nueva contrasena</label>
                      <div className="password-form__input-wrap">
                        <input type={showNew ? 'text' : 'password'} value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} placeholder="Minimo 8 caracteres" />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="password-form__eye">
                          {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <div className="password-form__field">
                      <label>Confirmar nueva contrasena</label>
                      <input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} placeholder="Repite tu nueva contrasena" />
                    </div>
                    <button type="submit" className="btn btn--primary btn--sm" disabled={actionLoading === 'change-password'}>
                      <Lock size={14} /> {actionLoading === 'change-password' ? 'Actualizando...' : 'Actualizar contrasena'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card__header">
              <h2><Monitor size={16} /> Sesiones activas</h2>
            </div>
            <div className="sessions-list">
              {(securityData.sessions || []).map((session) => (
                <div key={session.id} className={`session-item ${session.current ? 'session-item--current' : ''}`}>
                  <div className="session-item__icon">
                    {session.device.includes('iPhone') || session.device.includes('Android')
                      ? <Smartphone size={16} />
                      : <Monitor size={16} />
                    }
                  </div>
                  <div className="session-item__info">
                    <h4>
                      {session.device}
                      {session.current && <span className="inline-badge inline-badge--success">Actual</span>}
                    </h4>
                    <span><Clock size={11} /> {formatDateTime(session.lastActiveAt)} · IP: {session.ip}</span>
                  </div>
                  <button className="btn btn--ghost btn--sm btn--danger-text" onClick={() => handleSessionClose(session.id, session.current)} disabled={actionLoading === `session-${session.id}`}>
                    <LogOut size={13} /> {session.current ? 'Cerrar actual' : 'Cerrar'}
                  </button>
                </div>
              ))}
              {!securityLoading && (!securityData.sessions || securityData.sessions.length === 0) && (
                <div className="twofa-warning">
                  <p>No hay sesiones activas para mostrar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Configuracion;
