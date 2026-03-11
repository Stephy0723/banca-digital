import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Profile.css';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    documentId: user?.documentId || '',
  });

  const [prefs, setPrefs] = useState({
    emailNotif: true,
    smsNotif: false,
    pushNotif: true,
    biometric: false,
  });

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleSave = () => {
    updateUser(formData);
    setEditing(false);
  };

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="page-container profile">
      <div className="page-header">
        <h1>Mi Perfil</h1>
        <p>Gestiona tu información personal y preferencias</p>
      </div>

      <div className="profile__grid">
        {/* Left: Profile card */}
        <div>
          <div className="card profile__card">
            <div className="profile__avatar">
              {user ? getInitials(user.fullName) : '??'}
            </div>
            <div className="profile__name">{user?.fullName}</div>
            <div className="profile__email">{user?.email}</div>
            <span className="badge badge-success">Cuenta Verificada</span>

            <div className="profile__meta">
              <div className="profile__meta-item">
                <div className="profile__meta-icon">📱</div>
                <div>
                  <div className="profile__meta-label">Teléfono</div>
                  <div className="profile__meta-value">{user?.phone || 'No registrado'}</div>
                </div>
              </div>
              <div className="profile__meta-item">
                <div className="profile__meta-icon">🪪</div>
                <div>
                  <div className="profile__meta-label">Documento</div>
                  <div className="profile__meta-value">{user?.documentId || 'No registrado'}</div>
                </div>
              </div>
              <div className="profile__meta-item">
                <div className="profile__meta-icon">📅</div>
                <div>
                  <div className="profile__meta-label">Miembro desde</div>
                  <div className="profile__meta-value">{user?.joinDate || '2024'}</div>
                </div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-danger"
            style={{ width: '100%', marginTop: 12 }}
            onClick={logout}
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Right: Settings */}
        <div className="profile__sections">
          {/* Personal info */}
          <div className="card profile__section">
            <div className="profile__section-header">
              <h2 className="profile__section-title">👤 Información Personal</h2>
              <button
                className={`btn ${editing ? 'btn-accent' : 'btn-secondary'}`}
                onClick={() => editing ? handleSave() : setEditing(true)}
              >
                {editing ? 'Guardar' : 'Editar'}
              </button>
            </div>

            <div className="profile__form-grid">
              <div className="profile__form-group">
                <label className="profile__form-label">Nombre completo</label>
                <input
                  className="input"
                  value={formData.fullName}
                  onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                  disabled={!editing}
                />
              </div>
              <div className="profile__form-group">
                <label className="profile__form-label">Correo electrónico</label>
                <input
                  className="input"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  disabled={!editing}
                />
              </div>
              <div className="profile__form-group">
                <label className="profile__form-label">Teléfono</label>
                <input
                  className="input"
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  disabled={!editing}
                />
              </div>
              <div className="profile__form-group">
                <label className="profile__form-label">Documento de identidad</label>
                <input
                  className="input"
                  value={formData.documentId}
                  onChange={e => setFormData(p => ({ ...p, documentId: e.target.value }))}
                  disabled={!editing}
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="card profile__section">
            <div className="profile__section-header">
              <h2 className="profile__section-title">⚙️ Preferencias</h2>
            </div>

            <div className="profile__pref-list">
              <div className="profile__pref-item">
                <div className="profile__pref-info">
                  <div className="profile__pref-name">
                    {theme === 'light' ? '🌙' : '☀️'} Tema {theme === 'light' ? 'Oscuro' : 'Claro'}
                  </div>
                  <div className="profile__pref-desc">Cambiar la apariencia de la plataforma</div>
                </div>
                <div
                  className={`profile__toggle ${theme === 'dark' ? 'profile__toggle--active' : ''}`}
                  onClick={toggleTheme}
                />
              </div>

              <div className="profile__pref-item">
                <div className="profile__pref-info">
                  <div className="profile__pref-name">📧 Notificaciones por email</div>
                  <div className="profile__pref-desc">Recibir alertas y resúmenes por correo</div>
                </div>
                <div
                  className={`profile__toggle ${prefs.emailNotif ? 'profile__toggle--active' : ''}`}
                  onClick={() => togglePref('emailNotif')}
                />
              </div>

              <div className="profile__pref-item">
                <div className="profile__pref-info">
                  <div className="profile__pref-name">📱 Notificaciones SMS</div>
                  <div className="profile__pref-desc">Alertas de seguridad y transacciones</div>
                </div>
                <div
                  className={`profile__toggle ${prefs.smsNotif ? 'profile__toggle--active' : ''}`}
                  onClick={() => togglePref('smsNotif')}
                />
              </div>

              <div className="profile__pref-item">
                <div className="profile__pref-info">
                  <div className="profile__pref-name">🔔 Notificaciones push</div>
                  <div className="profile__pref-desc">Alertas en tiempo real en el navegador</div>
                </div>
                <div
                  className={`profile__toggle ${prefs.pushNotif ? 'profile__toggle--active' : ''}`}
                  onClick={() => togglePref('pushNotif')}
                />
              </div>

              <div className="profile__pref-item">
                <div className="profile__pref-info">
                  <div className="profile__pref-name">🔐 Autenticación biométrica</div>
                  <div className="profile__pref-desc">Usar huella o reconocimiento facial</div>
                </div>
                <div
                  className={`profile__toggle ${prefs.biometric ? 'profile__toggle--active' : ''}`}
                  onClick={() => togglePref('biometric')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
