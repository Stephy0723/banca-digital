import { useState } from 'react';
import {
  KeyRound, ShieldCheck, ShieldAlert, CheckCircle,
  Monitor, Smartphone, Globe, ClipboardList
} from 'lucide-react';
import './Security.css';

export default function Security() {
  const [twoFA, setTwoFA] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);

  const sessions = [
    { icon: Monitor, name: 'Chrome - Windows 11', location: 'Santo Domingo, DO', time: 'Ahora (sesión actual)', current: true },
    { icon: Smartphone, name: 'Safari - iPhone 15', location: 'Santo Domingo, DO', time: 'Hace 2 horas', current: false },
    { icon: Monitor, name: 'Firefox - MacOS', location: 'Santiago, DO', time: 'Hace 1 día', current: false },
  ];

  const activityLog = [
    { type: 'success', text: 'Inicio de sesión exitoso', time: 'Hoy, 9:00 AM' },
    { type: 'info', text: 'Cambio de contraseña', time: 'Ayer, 3:30 PM' },
    { type: 'warning', text: 'Intento de inicio de sesión fallido', time: '07 Mar, 10:00 PM' },
    { type: 'success', text: 'Transferencia autorizada - RD$15,000', time: '07 Mar, 4:45 PM' },
    { type: 'info', text: 'Actualización de perfil', time: '06 Mar, 2:00 PM' },
    { type: 'error', text: 'Inicio de sesión desde ubicación desconocida (bloqueado)', time: '05 Mar, 11:30 PM' },
    { type: 'success', text: 'Verificación 2FA completada', time: '05 Mar, 9:00 AM' },
  ];

  const dotColors: Record<string, string> = {
    success: 'var(--color-accent)',
    info: 'var(--color-primary-light)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPasswordSuccess(true);
    setTimeout(() => setShowPasswordSuccess(false), 3000);
  };

  return (
    <div className="page-container security">
      <div className="page-header">
        <h1>Seguridad</h1>
        <p>Administra la seguridad de tu cuenta, contraseña y sesiones activas</p>
      </div>

      <div className="security__grid">
        {/* Change password */}
        <form className="card security__card" onSubmit={handleChangePassword}>
          <h2 className="security__card-title"><KeyRound size={18} /> Cambiar Contraseña</h2>

          <div className="security__form-group">
            <label className="security__form-label">Contraseña actual</label>
            <input className="input" type="password" placeholder="••••••••" />
          </div>
          <div className="security__form-group">
            <label className="security__form-label">Nueva contraseña</label>
            <input className="input" type="password" placeholder="Mínimo 8 caracteres" />
          </div>
          <div className="security__form-group">
            <label className="security__form-label">Confirmar nueva contraseña</label>
            <input className="input" type="password" placeholder="Repetir contraseña" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
            Actualizar Contraseña
          </button>

          {showPasswordSuccess && (
            <div className="badge badge-success" style={{ marginTop: 12, padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> Contraseña actualizada exitosamente
            </div>
          )}
        </form>

        {/* 2FA */}
        <div className="card security__card">
          <h2 className="security__card-title"><ShieldCheck size={18} /> Autenticación de Dos Factores</h2>

          <div className="security__2fa-status">
            <div
              className="security__2fa-icon"
              style={{ background: twoFA ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: twoFA ? 'var(--color-accent)' : 'var(--color-error)' }}
            >
              {twoFA ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
            </div>
            <div className="security__2fa-info">
              <div className="security__2fa-title">
                {twoFA ? 'Activado' : 'Desactivado'}
              </div>
              <div className="security__2fa-desc">
                {twoFA
                  ? 'Tu cuenta está protegida con verificación en dos pasos.'
                  : 'Activa la verificación en dos pasos para mayor seguridad.'}
              </div>
            </div>
          </div>

          <button
            className={`btn ${twoFA ? 'btn-danger' : 'btn-accent'}`}
            style={{ width: '100%' }}
            onClick={() => setTwoFA(!twoFA)}
          >
            {twoFA ? 'Desactivar 2FA' : 'Activar 2FA'}
          </button>

          <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              Métodos disponibles:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: Smartphone, label: 'App de autenticación (Google Auth, Authy)' },
                { icon: Globe, label: 'Código por email' },
                { icon: Smartphone, label: 'Código por SMS' },
              ].map((m, i) => (
                <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <m.icon size={14} /> {m.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active sessions */}
        <div className="card security__card">
          <h2 className="security__card-title"><Monitor size={18} /> Sesiones Activas</h2>
          <div className="security__session-list">
            {sessions.map((session, i) => (
              <div key={i} className="security__session">
                <span className="security__session-icon" style={{ color: 'var(--text-secondary)' }}>
                  <session.icon size={20} />
                </span>
                <div className="security__session-info">
                  <div className="security__session-device">
                    {session.name}
                    {session.current && <span className="badge badge-success" style={{ marginLeft: 8 }}>Actual</span>}
                  </div>
                  <div className="security__session-details">
                    {session.location} · {session.time}
                  </div>
                </div>
                {!session.current && (
                  <button className="security__session-close">Cerrar</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Activity log */}
        <div className="card security__card">
          <h2 className="security__card-title"><ClipboardList size={18} /> Registro de Actividad</h2>
          <div className="security__log-list">
            {activityLog.map((log, i) => (
              <div key={i} className="security__log-item">
                <div className="security__log-dot" style={{ background: dotColors[log.type] }} />
                <div>
                  <div className="security__log-text">{log.text}</div>
                  <div className="security__log-time">{log.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
