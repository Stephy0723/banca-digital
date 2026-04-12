export const formatUser = (client) => ({
  idCliente: client.ID_Cliente,
  codigoCliente: client.ID_Cliente,
  nombres: client.Nombres,
  apellidos: client.Apellidos,
  fullName: `${client.Nombres} ${client.Apellidos}`.trim(),
  identificacion: client.Identificacion,
  tipoIdent: client.Tipo_ident,
  fechaNacimiento: client.Fecha_Nac,
  telefono: client.Telefono,
  email: client.Email || null,
  twoFactorEnabled: Boolean(client.TwoFactorEnabled),
});

export const formatCuenta = (cuenta) => ({
  contrato: cuenta.Contrato,
  balanceActual: Number(cuenta.Balance_Actual || 0),
  ultimaFechaMovimiento: cuenta.Ult_fecha_mov,
  ultimoMontoMovimiento: Number(cuenta.ult_mto_mov || 0),
  tipoMovimiento: cuenta.tipo_mov,
});

export const formatCertificado = (certificado) => ({
  contrato: certificado.Contrato,
  balanceActual: Number(certificado.Balance_Actual || 0),
  ultimaFechaPago: certificado.Ult_fecha_pago,
  ultimoMontoPagado: Number(certificado.ult_mto_pagado || 0),
});

export const formatPrestamo = (prestamo) => ({
  contrato: prestamo.Contrato,
  balanceActual: Number(prestamo.Balance_Actual || 0),
  ultimaFechaPago: prestamo.Ult_fecha_pago,
  ultimoMontoPagado: Number(prestamo.ult_mto_pagado || 0),
});

const describeBrowser = (userAgent = '') => {
  if (/edg\//i.test(userAgent)) return 'Edge';
  if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) return 'Chrome';
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) return 'Safari';
  if (/firefox\//i.test(userAgent)) return 'Firefox';
  if (/opr\//i.test(userAgent) || /opera/i.test(userAgent)) return 'Opera';
  return 'Navegador';
};

const describeOs = (userAgent = '') => {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/iphone|ipad|ios/i.test(userAgent)) return 'iPhone';
  if (/android/i.test(userAgent)) return 'Android';
  if (/mac os x|macintosh/i.test(userAgent)) return 'macOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  return 'Dispositivo desconocido';
};

export const formatSession = (session, currentSessionId = null) => ({
  id: session.ID_Sesion,
  device: `${describeBrowser(session.UserAgent)} · ${describeOs(session.UserAgent)}`,
  ip: session.IpAddress || 'No disponible',
  lastActiveAt: session.Ultima_Actividad || session.Creado_En,
  createdAt: session.Creado_En,
  current: currentSessionId ? session.ID_Sesion === currentSessionId : false,
});
