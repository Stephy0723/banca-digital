export const sanitizeIdentification = (value = '') =>
  value.toString().replace(/[\s-]/g, '').trim();

export const sanitizeClientCode = (value = '') =>
  value.toString().replace(/\D/g, '').trim();

export const normalizePhone = (value = '') =>
  value.toString().replace(/\D/g, '');

export const normalizeDateInput = (value = '') =>
  value ? value.toString().slice(0, 10) : '';

export const normalizeEmail = (value = '') =>
  value.toString().trim().toLowerCase();

export const normalizeName = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationIdentityInput = ({
  nombres,
  apellidos,
  identificacion,
  fechaNacimiento,
  codigoCliente,
}) => {
  if (!normalizeName(nombres)) {
    return 'Los nombres son obligatorios';
  }

  if (!normalizeName(apellidos)) {
    return 'Los apellidos son obligatorios';
  }

  if (!sanitizeIdentification(identificacion)) {
    return 'La cedula o identificacion es obligatoria';
  }

  if (!normalizeDateInput(fechaNacimiento)) {
    return 'La fecha de nacimiento es obligatoria';
  }

  if (!sanitizeClientCode(codigoCliente)) {
    return 'El codigo de cliente es obligatorio';
  }

  return null;
};

export const validateRegistrationEmailInput = ({ email, registrationToken }) => {
  if (!registrationToken?.trim()) {
    return 'La sesion de registro no es valida';
  }

  if (!normalizeEmail(email)) {
    return 'El correo es obligatorio';
  }

  if (!EMAIL_REGEX.test(normalizeEmail(email))) {
    return 'El correo no es valido';
  }

  return null;
};

export const validateRegistrationCodeInput = ({ code, registrationToken }) => {
  if (!registrationToken?.trim()) {
    return 'La sesion de registro no es valida';
  }

  const normalizedCode = code?.toString().trim() || '';

  if (!normalizedCode) {
    return 'El codigo de validacion es obligatorio';
  }

  if (!/^\d{6}$/.test(normalizedCode)) {
    return 'El codigo debe tener 6 digitos';
  }

  return null;
};

export const validateCompleteRegistrationInput = ({ password, registrationToken }) => {
  if (!registrationToken?.trim()) {
    return 'La sesion de registro no es valida';
  }

  if (!password) {
    return 'La contrasena es obligatoria';
  }

  if (password.length < 8) {
    return 'La contrasena debe tener al menos 8 caracteres';
  }

  return null;
};

export const validateRegisterInput = ({
  identificacion,
  fechaNacimiento,
  password,
}) => {
  if (!sanitizeIdentification(identificacion)) {
    return 'La identificacion es obligatoria';
  }

  if (!normalizeDateInput(fechaNacimiento)) {
    return 'La fecha de nacimiento es obligatoria';
  }

  if (!password) {
    return 'La contrasena es obligatoria';
  }

  if (password.length < 8) {
    return 'La contrasena debe tener al menos 8 caracteres';
  }

  return null;
};

export const validateLoginInput = ({ identificacion, password }) => {
  if (!sanitizeIdentification(identificacion)) {
    return 'La identificacion es obligatoria';
  }

  if (!password) {
    return 'La contrasena es obligatoria';
  }

  return null;
};
