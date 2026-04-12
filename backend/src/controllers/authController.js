import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { pool, query } from '../config/db.js';
import { formatSession, formatUser } from '../utils/formatters.js';
import { sendValidationCodeEmail } from '../utils/mailer.js';
import {
  buildOtpAuthUri,
  formatManualKey,
  generateRecoveryCodes,
  generateTwoFactorSecret,
  hashRecoveryCode,
  normalizeRecoveryCode,
  verifyTotpToken,
} from '../utils/twoFactor.js';
import {
  normalizeDateInput,
  normalizeEmail,
  normalizeName,
  sanitizeClientCode,
  sanitizeIdentification,
  validateCompleteRegistrationInput,
  validateLoginInput,
  validateRegistrationCodeInput,
  validateRegistrationEmailInput,
  validateRegistrationIdentityInput,
} from '../utils/validation.js';

const SUPPORT_PAGE_URL = 'https://coopeocala.com/registro-de-socios';
const WHATSAPP_URL = 'https://wa.me/18094433140?text=Hola%20CoopEocala%2C%20necesito%20ayuda%20para%20registrarme%20en%20la%20banca%20digital.';
const REGISTER_SCOPE = 'coopeocala-register';
const LOGIN_2FA_SCOPE = 'coopeocala-login-2fa';
const REGISTER_STAGES = {
  IDENTIFIED: 'identified',
  CODE_SENT: 'code_sent',
  VERIFIED: 'email_verified',
};
const CODE_EXP_MINUTES = 10;
const MAX_CODE_ATTEMPTS = 5;
const SESSION_WINDOW_HOURS = 12;
const clientFields = [
  'c.ID_Cliente',
  'c.Nombres',
  'c.Apellidos',
  'c.Identificacion',
  'c.Tipo_ident',
  'c.Fecha_Nac',
  'c.Telefono',
  'w.ID_WebUsuario',
  'w.Email',
  'w.PasswordHash',
  'w.Estado',
  'w.TwoFactorEnabled',
  'w.TwoFactorSecret',
  'w.TwoFactorPendingSecret',
  'w.TwoFactorEnabledAt',
].join(',');
const clientByCodeSql =
  'SELECT ' +
  clientFields +
  ' FROM ACCESO_CLIENTES c LEFT JOIN WEB_USUARIOS w ON w.ID_Cliente = c.ID_Cliente WHERE c.ID_Cliente = ? LIMIT 1';
const clientByIdentSql =
  'SELECT ' +
  clientFields +
  " FROM ACCESO_CLIENTES c INNER JOIN WEB_USUARIOS w ON w.ID_Cliente = c.ID_Cliente WHERE REPLACE(REPLACE(c.Identificacion, '-', ''), ' ', '') = ? LIMIT 1";
const processSql =
  'SELECT ID_Validacion,ProcesoToken,ID_Cliente,Email,CodigoHash,Intentos,Expira_En,Verificado_En,Usado_En FROM WEB_REGISTRO_VALIDACIONES WHERE ProcesoToken = ? AND ID_Cliente = ? LIMIT 1';
const activeSessionsSql = `
  SELECT
    ID_Sesion,
    ID_Cliente,
    UserAgent,
    IpAddress,
    Ultima_Actividad,
    Creado_En,
    Revocado_En
  FROM WEB_SESIONES
  WHERE ID_Cliente = ?
    AND Revocado_En IS NULL
    AND COALESCE(Ultima_Actividad, Creado_En) >= DATE_SUB(NOW(), INTERVAL ${SESSION_WINDOW_HOURS} HOUR)
  ORDER BY
    CASE WHEN ID_Sesion = ? THEN 0 ELSE 1 END,
    COALESCE(Ultima_Actividad, Creado_En) DESC
`;

const one = async (sql, params = []) => (await query(sql, params))[0] || null;
const buildAuthToken = (client, sessionId) =>
  jwt.sign(
    {
      idCliente: client.ID_Cliente,
      identificacion: client.Identificacion,
      sessionId,
    },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
const buildRegisterToken = ({
  stage,
  idCliente,
  identificacion,
  email = null,
  processToken = null,
}) =>
  jwt.sign(
    { scope: REGISTER_SCOPE, stage, idCliente, identificacion, email, processToken },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  );
const buildTwoFactorLoginToken = ({ idCliente, identificacion }) =>
  jwt.sign(
    { scope: LOGIN_2FA_SCOPE, idCliente, identificacion },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );
const hashCode = (value) =>
  crypto.createHash('sha256').update(value.toString()).digest('hex');
const isExpired = (value) => new Date(value).getTime() < Date.now();
const supportPayload = (message) => ({
  message,
  contactSupport: true,
  supportPageUrl: SUPPORT_PAGE_URL,
  whatsappUrl: WHATSAPP_URL,
});

const verifyRegisterToken = (token, stages = []) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.scope !== REGISTER_SCOPE) {
      return { ok: false, status: 401, message: 'La sesion de registro no es valida' };
    }

    if (stages.length && !stages.includes(payload.stage)) {
      return {
        ok: false,
        status: 409,
        message: 'La sesion de registro ya no corresponde a esta etapa',
      };
    }

    return { ok: true, payload };
  } catch {
    return {
      ok: false,
      status: 401,
      message: 'La sesion de registro expiro o no es valida',
    };
  }
};

const verifyTwoFactorLoginToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.scope !== LOGIN_2FA_SCOPE) {
      return { ok: false, status: 401, message: 'La verificacion 2FA no es valida' };
    }

    return { ok: true, payload };
  } catch {
    return {
      ok: false,
      status: 401,
      message: 'La verificacion 2FA expiro o no es valida',
    };
  }
};

const getClientByCode = (code) => one(clientByCodeSql, [code]);
const getClientByIdent = (identificacion) => one(clientByIdentSql, [identificacion]);
const getProcess = (processToken, idCliente) => one(processSql, [processToken, idCliente]);

const runQuery = async (executor, sql, params = []) => {
  if (typeof executor === 'function') {
    return executor(sql, params);
  }

  const [rows] = await executor.query(sql, params);
  return rows;
};

const oneWith = async (executor, sql, params = []) =>
  (await runQuery(executor, sql, params))[0] || null;

const sameIdentity = (client, body) =>
  normalizeName(client.Nombres) === normalizeName(body.nombres) &&
  normalizeName(client.Apellidos) === normalizeName(body.apellidos) &&
  sanitizeIdentification(client.Identificacion) ===
    sanitizeIdentification(body.identificacion) &&
  normalizeDateInput(client.Fecha_Nac) === normalizeDateInput(body.fechaNacimiento) &&
  sanitizeClientCode(client.ID_Cliente) === sanitizeClientCode(body.codigoCliente);

const getRequestIp = (req) =>
  (req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    null)
    ?.toString()
    .slice(0, 64) || null;

const getUserAgent = (req) =>
  req.get('user-agent')?.toString().slice(0, 255) || null;

const createAuthenticatedSession = async (executor, req, client) => {
  const sessionId = crypto.randomUUID();

  await runQuery(
    executor,
    `
      INSERT INTO WEB_SESIONES (ID_Sesion, ID_Cliente, UserAgent, IpAddress, Ultima_Actividad)
      VALUES (?, ?, ?, ?, NOW())
    `,
    [sessionId, client.ID_Cliente, getUserAgent(req), getRequestIp(req)]
  );
  await runQuery(
    executor,
    'UPDATE WEB_USUARIOS SET Ultimo_Login = NOW() WHERE ID_Cliente = ?',
    [client.ID_Cliente]
  );

  return {
    token: buildAuthToken(client, sessionId),
    user: formatUser(client),
    sessionId,
  };
};

const getActiveSessions = async (idCliente, currentSessionId = null) => {
  const rows = await query(activeSessionsSql, [idCliente, currentSessionId || '']);
  return rows.map((session) => formatSession(session, currentSessionId));
};

const getSecurityOverview = async (idCliente, currentSessionId = null) => {
  const [client, recoveryCodeRows, sessions] = await Promise.all([
    getClientByCode(idCliente),
    query(
      `
        SELECT COUNT(*) AS total
        FROM WEB_2FA_RECOVERY_CODES
        WHERE ID_Cliente = ?
          AND Used_En IS NULL
      `,
      [idCliente]
    ),
    getActiveSessions(idCliente, currentSessionId),
  ]);

  if (!client || !client.ID_WebUsuario) {
    return null;
  }

  return {
    user: formatUser(client),
    twoFactorEnabled: Boolean(client.TwoFactorEnabled),
    recoveryCodesRemaining: Number(recoveryCodeRows[0]?.total || 0),
    sessions,
  };
};

const storeRecoveryCodes = async (connection, idCliente, codes) => {
  await connection.query('DELETE FROM WEB_2FA_RECOVERY_CODES WHERE ID_Cliente = ?', [
    idCliente,
  ]);

  for (const code of codes) {
    await connection.query(
      `
        INSERT INTO WEB_2FA_RECOVERY_CODES (ID_Cliente, CodeHash)
        VALUES (?, ?)
      `,
      [idCliente, hashRecoveryCode(code)]
    );
  }
};

const validatePasswordChangeInput = ({ currentPassword, newPassword }) => {
  if (!currentPassword) {
    return 'La contrasena actual es obligatoria';
  }

  if (!newPassword) {
    return 'La nueva contrasena es obligatoria';
  }

  if (newPassword.length < 8) {
    return 'La nueva contrasena debe tener al menos 8 caracteres';
  }

  return null;
};

export const identifyClientForRegistration = async (req, res) => {
  const error = validateRegistrationIdentityInput(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const client = await getClientByCode(sanitizeClientCode(req.body.codigoCliente));

    if (!client || !sameIdentity(client, req.body)) {
      return res.status(404).json(
        supportPayload(
          'No pudimos validar tus datos en la base de socios. Si necesitas ayuda, nuestro equipo puede registrarte.'
        )
      );
    }

    if (client.ID_WebUsuario) {
      return res.status(409).json({
        message: 'Este socio ya tiene acceso web activo. Puedes iniciar sesion.',
        goToLogin: true,
      });
    }

    return res.json({
      message: 'Datos validados correctamente.',
      registrationToken: buildRegisterToken({
        stage: REGISTER_STAGES.IDENTIFIED,
        idCliente: client.ID_Cliente,
        identificacion: client.Identificacion,
      }),
      client: formatUser(client),
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Error al validar los datos del socio',
      error: err.message,
    });
  }
};

export const sendRegistrationCode = async (req, res) => {
  const error = validateRegistrationEmailInput(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const session = verifyRegisterToken(req.body.registrationToken, [
    REGISTER_STAGES.IDENTIFIED,
    REGISTER_STAGES.CODE_SENT,
  ]);

  if (!session.ok) {
    return res.status(session.status).json({ message: session.message });
  }

  const email = normalizeEmail(req.body.email);

  try {
    const client = await getClientByCode(session.payload.idCliente);

    if (!client) {
      return res
        .status(404)
        .json({ message: 'El socio ya no aparece disponible en la base de datos' });
    }

    if (client.ID_WebUsuario) {
      return res.status(409).json({
        message: 'Este socio ya tiene acceso web activo. Puedes iniciar sesion.',
        goToLogin: true,
      });
    }

    const owner = await one(
      'SELECT ID_WebUsuario,ID_Cliente FROM WEB_USUARIOS WHERE LOWER(Email) = ? LIMIT 1',
      [email]
    );

    if (owner && Number(owner.ID_Cliente) !== Number(client.ID_Cliente)) {
      return res
        .status(409)
        .json({ message: 'Ese correo ya esta asociado a otro acceso web.' });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const processToken = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + CODE_EXP_MINUTES * 60 * 1000);

    await query('DELETE FROM WEB_REGISTRO_VALIDACIONES WHERE ID_Cliente = ?', [
      client.ID_Cliente,
    ]);
    await query(
      `
        INSERT INTO WEB_REGISTRO_VALIDACIONES
          (ProcesoToken, ID_Cliente, Email, CodigoHash, Expira_En)
        VALUES (?, ?, ?, ?, ?)
      `,
      [processToken, client.ID_Cliente, email, hashCode(code), expiresAt]
    );

    let mailResult;

    try {
      mailResult = await sendValidationCodeEmail({
        to: email,
        fullName: `${client.Nombres} ${client.Apellidos}`.trim(),
        code,
      });
    } catch (err) {
      await query(
        'DELETE FROM WEB_REGISTRO_VALIDACIONES WHERE ProcesoToken = ?',
        [processToken]
      );
      throw err;
    }

    return res.json({
      message: mailResult.message || 'Codigo enviado correctamente.',
      registrationToken: buildRegisterToken({
        stage: REGISTER_STAGES.CODE_SENT,
        idCliente: client.ID_Cliente,
        identificacion: client.Identificacion,
        email,
        processToken,
      }),
      client: formatUser({ ...client, Email: email }),
      emailDeliveryMode: mailResult.mode,
      developmentCode: mailResult.previewCode,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Error al enviar el codigo de validacion',
      error: err.message,
    });
  }
};

export const verifyRegistrationCode = async (req, res) => {
  const error = validateRegistrationCodeInput(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const session = verifyRegisterToken(req.body.registrationToken, [
    REGISTER_STAGES.CODE_SENT,
  ]);

  if (!session.ok) {
    return res.status(session.status).json({ message: session.message });
  }

  try {
    const process = await getProcess(
      session.payload.processToken,
      session.payload.idCliente
    );

    if (
      !process ||
      normalizeEmail(process.Email) !== normalizeEmail(session.payload.email)
    ) {
      return res.status(404).json({
        message: 'No encontramos una validacion activa para este registro.',
      });
    }

    if (process.Usado_En) {
      return res.status(409).json({
        message: 'Este codigo ya fue utilizado. Inicia el registro nuevamente.',
      });
    }

    if (process.Verificado_En) {
      return res.json({
        message: 'El correo ya habia sido validado.',
        registrationToken: buildRegisterToken({
          stage: REGISTER_STAGES.VERIFIED,
          idCliente: session.payload.idCliente,
          identificacion: session.payload.identificacion,
          email: process.Email,
          processToken: process.ProcesoToken,
        }),
      });
    }

    if (isExpired(process.Expira_En)) {
      return res.status(410).json({
        message: 'El codigo vencio. Solicita un nuevo codigo.',
      });
    }

    if (Number(process.Intentos) >= MAX_CODE_ATTEMPTS) {
      return res.status(429).json({
        message: 'Agotaste los intentos permitidos. Solicita un nuevo codigo.',
      });
    }

    if (hashCode(req.body.code.trim()) !== process.CodigoHash) {
      await query(
        'UPDATE WEB_REGISTRO_VALIDACIONES SET Intentos = Intentos + 1 WHERE ID_Validacion = ?',
        [process.ID_Validacion]
      );
      const remaining = MAX_CODE_ATTEMPTS - (Number(process.Intentos) + 1);

      return res.status(400).json({
        message:
          remaining > 0
            ? `El codigo no coincide. Te quedan ${remaining} intento${remaining === 1 ? '' : 's'}.`
            : 'Agotaste los intentos permitidos. Solicita un nuevo codigo.',
      });
    }

    await query(
      'UPDATE WEB_REGISTRO_VALIDACIONES SET Verificado_En = NOW() WHERE ID_Validacion = ?',
      [process.ID_Validacion]
    );

    return res.json({
      message: 'Correo validado correctamente.',
      registrationToken: buildRegisterToken({
        stage: REGISTER_STAGES.VERIFIED,
        idCliente: session.payload.idCliente,
        identificacion: session.payload.identificacion,
        email: process.Email,
        processToken: process.ProcesoToken,
      }),
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Error al validar el codigo',
      error: err.message,
    });
  }
};

export const completeRegistration = async (req, res) => {
  const error = validateCompleteRegistrationInput(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const session = verifyRegisterToken(req.body.registrationToken, [
    REGISTER_STAGES.VERIFIED,
  ]);

  if (!session.ok) {
    return res.status(session.status).json({ message: session.message });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [clientRows] = await connection.query(clientByCodeSql, [
      session.payload.idCliente,
    ]);
    const client = clientRows[0];

    if (!client) {
      await connection.rollback();
      return res
        .status(404)
        .json({ message: 'El socio ya no aparece disponible en la base de datos' });
    }

    if (client.ID_WebUsuario) {
      await connection.rollback();
      return res.status(409).json({
        message: 'Este socio ya tiene acceso web activo. Puedes iniciar sesion.',
        goToLogin: true,
      });
    }

    const [processRows] = await connection.query(processSql, [
      session.payload.processToken,
      session.payload.idCliente,
    ]);
    const process = processRows[0];

    if (
      !process ||
      normalizeEmail(process.Email) !== normalizeEmail(session.payload.email)
    ) {
      await connection.rollback();
      return res.status(404).json({
        message: 'No encontramos una validacion activa para completar el registro.',
      });
    }

    if (process.Usado_En) {
      await connection.rollback();
      return res.status(409).json({
        message: 'Este codigo ya fue utilizado. Inicia el registro nuevamente.',
      });
    }

    if (!process.Verificado_En && isExpired(process.Expira_En)) {
      await connection.rollback();
      return res.status(410).json({
        message: 'La validacion vencio. Solicita un nuevo codigo.',
      });
    }

    if (!process.Verificado_En) {
      await connection.rollback();
      return res.status(409).json({
        message: 'Debes validar el codigo del correo antes de crear tu contrasena.',
      });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    await connection.query(
      `
        INSERT INTO WEB_USUARIOS (ID_Cliente, Email, PasswordHash, Estado)
        VALUES (?, ?, ?, ?)
      `,
      [client.ID_Cliente, normalizeEmail(process.Email), passwordHash, 'ACTIVO']
    );
    await connection.query(
      'UPDATE WEB_REGISTRO_VALIDACIONES SET Usado_En = NOW() WHERE ID_Validacion = ?',
      [process.ID_Validacion]
    );

    await connection.commit();

    return res.status(201).json({
      message:
        'Acceso web creado correctamente. Ya puedes iniciar sesion con tu identificacion y contrasena.',
      user: formatUser({ ...client, Email: normalizeEmail(process.Email) }),
    });
  } catch (err) {
    await connection.rollback();

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Ya existe un acceso web para este socio o correo.',
      });
    }

    return res.status(500).json({
      message: 'Error al completar el registro',
      error: err.message,
    });
  } finally {
    connection.release();
  }
};

export const login = async (req, res) => {
  const error = validateLoginInput(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const client = await getClientByIdent(
      sanitizeIdentification(req.body.identificacion)
    );

    if (!client || !client.PasswordHash) {
      return res
        .status(401)
        .json({ message: 'Identificacion o contrasena incorrecta' });
    }

    if (client.Estado && client.Estado !== 'ACTIVO') {
      return res.status(403).json({
        message: 'Tu acceso web no esta disponible en este momento',
      });
    }

    const ok = await bcrypt.compare(req.body.password, client.PasswordHash);

    if (!ok) {
      return res
        .status(401)
        .json({ message: 'Identificacion o contrasena incorrecta' });
    }

    if (client.TwoFactorEnabled && client.TwoFactorSecret) {
      return res.json({
        requiresTwoFactor: true,
        twoFactorToken: buildTwoFactorLoginToken({
          idCliente: client.ID_Cliente,
          identificacion: client.Identificacion,
        }),
        user: formatUser(client),
      });
    }

    const auth = await createAuthenticatedSession(query, req, client);
    return res.json(auth);
  } catch (err) {
    return res.status(500).json({
      message: 'Error al iniciar sesion',
      error: err.message,
    });
  }
};

export const loginWithTwoFactor = async (req, res) => {
  const session = verifyTwoFactorLoginToken(req.body.twoFactorToken);

  if (!session.ok) {
    return res.status(session.status).json({ message: session.message });
  }

  const code = req.body.code?.toString().trim() || '';
  const recoveryCode = normalizeRecoveryCode(req.body.recoveryCode);

  if (!code && !recoveryCode) {
    return res.status(400).json({
      message: 'Ingresa un codigo de autenticacion o un codigo de respaldo.',
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [clientRows] = await connection.query(clientByCodeSql, [
      session.payload.idCliente,
    ]);
    const client = clientRows[0];

    if (
      !client ||
      !client.ID_WebUsuario ||
      !client.TwoFactorEnabled ||
      !client.TwoFactorSecret
    ) {
      await connection.rollback();
      return res.status(404).json({
        message: 'La configuracion 2FA ya no esta disponible para este usuario.',
      });
    }

    if (client.Estado && client.Estado !== 'ACTIVO') {
      await connection.rollback();
      return res.status(403).json({
        message: 'Tu acceso web no esta disponible en este momento',
      });
    }

    if (recoveryCode) {
      const codeRow = await oneWith(
        connection,
        `
          SELECT ID_RecoveryCode, Used_En
          FROM WEB_2FA_RECOVERY_CODES
          WHERE ID_Cliente = ?
            AND CodeHash = ?
          LIMIT 1
        `,
        [client.ID_Cliente, hashRecoveryCode(recoveryCode)]
      );

      if (!codeRow || codeRow.Used_En) {
        await connection.rollback();
        return res.status(401).json({
          message: 'El codigo de respaldo no es valido o ya fue utilizado.',
        });
      }

      await connection.query(
        'UPDATE WEB_2FA_RECOVERY_CODES SET Used_En = NOW() WHERE ID_RecoveryCode = ?',
        [codeRow.ID_RecoveryCode]
      );
    } else if (!verifyTotpToken({ secret: client.TwoFactorSecret, token: code })) {
      await connection.rollback();
      return res.status(401).json({
        message: 'El codigo de autenticacion no es valido.',
      });
    }

    const auth = await createAuthenticatedSession(connection, req, client);
    await connection.commit();

    return res.json({
      ...auth,
      recoveryCodeUsed: Boolean(recoveryCode),
    });
  } catch (err) {
    await connection.rollback();
    return res.status(500).json({
      message: 'Error al completar la autenticacion 2FA',
      error: err.message,
    });
  } finally {
    connection.release();
  }
};

export const validateSession = async (req, res) => {
  try {
    const client = await getClientByCode(req.user.idCliente);

    if (!client || !client.ID_WebUsuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (client.Estado && client.Estado !== 'ACTIVO') {
      return res.status(403).json({
        message: 'Tu acceso web no esta disponible en este momento',
      });
    }

    return res.json({ user: formatUser(client) });
  } catch (err) {
    return res.status(500).json({
      message: 'Error al validar la sesion',
      error: err.message,
    });
  }
};

export const getSecurityStatus = async (req, res) => {
  try {
    const security = await getSecurityOverview(req.user.idCliente, req.user.sessionId);

    if (!security) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(security);
  } catch (err) {
    return res.status(500).json({
      message: 'Error al obtener la configuracion de seguridad',
      error: err.message,
    });
  }
};

export const setupTwoFactor = async (req, res) => {
  try {
    const client = await getClientByCode(req.user.idCliente);

    if (!client || !client.ID_WebUsuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (client.TwoFactorEnabled) {
      return res.status(409).json({
        message: 'La autenticacion 2FA ya esta activa en esta cuenta.',
      });
    }

    const secret = generateTwoFactorSecret();
    const accountName =
      client.Email ||
      sanitizeIdentification(client.Identificacion) ||
      `socio-${client.ID_Cliente}`;
    const otpAuthUrl = buildOtpAuthUri({
      secret,
      accountName,
      issuer: 'CoopEocala',
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl, {
      width: 240,
      margin: 1,
    });

    await query(
      `
        UPDATE WEB_USUARIOS
        SET TwoFactorPendingSecret = ?
        WHERE ID_Cliente = ?
      `,
      [secret, client.ID_Cliente]
    );

    return res.json({
      message:
        'Escanea el codigo QR en tu app autenticadora y luego valida un codigo de 6 digitos.',
      qrCodeDataUrl,
      manualKey: formatManualKey(secret),
      otpAuthUrl,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Error al preparar la autenticacion 2FA',
      error: err.message,
    });
  }
};

export const enableTwoFactor = async (req, res) => {
  const code = req.body.code?.toString().trim() || '';

  if (!/^\d{6}$/.test(code)) {
    return res
      .status(400)
      .json({ message: 'Ingresa un codigo 2FA valido de 6 digitos.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [clientRows] = await connection.query(clientByCodeSql, [req.user.idCliente]);
    const client = clientRows[0];

    if (!client || !client.ID_WebUsuario) {
      await connection.rollback();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!client.TwoFactorPendingSecret) {
      await connection.rollback();
      return res.status(409).json({
        message: 'Primero debes generar un codigo QR para configurar 2FA.',
      });
    }

    if (
      !verifyTotpToken({
        secret: client.TwoFactorPendingSecret,
        token: code,
      })
    ) {
      await connection.rollback();
      return res.status(400).json({
        message: 'El codigo ingresado no coincide con tu app autenticadora.',
      });
    }

    const recoveryCodes = generateRecoveryCodes(8);

    await connection.query(
      `
        UPDATE WEB_USUARIOS
        SET
          TwoFactorEnabled = 1,
          TwoFactorSecret = TwoFactorPendingSecret,
          TwoFactorPendingSecret = NULL,
          TwoFactorEnabledAt = NOW()
        WHERE ID_Cliente = ?
      `,
      [client.ID_Cliente]
    );
    await storeRecoveryCodes(connection, client.ID_Cliente, recoveryCodes);

    await connection.commit();

    return res.json({
      message:
        'La autenticacion 2FA fue activada. Guarda tus codigos de respaldo en un lugar seguro.',
      recoveryCodes,
      user: formatUser({ ...client, TwoFactorEnabled: 1 }),
    });
  } catch (err) {
    await connection.rollback();
    return res.status(500).json({
      message: 'Error al activar la autenticacion 2FA',
      error: err.message,
    });
  } finally {
    connection.release();
  }
};

export const disableTwoFactor = async (req, res) => {
  const password = req.body.password?.toString() || '';

  if (!password) {
    return res.status(400).json({
      message: 'Ingresa tu contrasena para desactivar 2FA.',
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [clientRows] = await connection.query(clientByCodeSql, [req.user.idCliente]);
    const client = clientRows[0];

    if (!client || !client.ID_WebUsuario || !client.PasswordHash) {
      await connection.rollback();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const passwordMatches = await bcrypt.compare(password, client.PasswordHash);

    if (!passwordMatches) {
      await connection.rollback();
      return res.status(401).json({
        message: 'La contrasena actual no es correcta.',
      });
    }

    await connection.query(
      `
        UPDATE WEB_USUARIOS
        SET
          TwoFactorEnabled = 0,
          TwoFactorSecret = NULL,
          TwoFactorPendingSecret = NULL,
          TwoFactorEnabledAt = NULL
        WHERE ID_Cliente = ?
      `,
      [client.ID_Cliente]
    );
    await connection.query(
      'DELETE FROM WEB_2FA_RECOVERY_CODES WHERE ID_Cliente = ?',
      [client.ID_Cliente]
    );

    await connection.commit();

    return res.json({
      message: 'La autenticacion 2FA fue desactivada.',
      user: formatUser({ ...client, TwoFactorEnabled: 0 }),
    });
  } catch (err) {
    await connection.rollback();
    return res.status(500).json({
      message: 'Error al desactivar 2FA',
      error: err.message,
    });
  } finally {
    connection.release();
  }
};

export const listActiveSessions = async (req, res) => {
  try {
    const sessions = await getActiveSessions(req.user.idCliente, req.user.sessionId);
    return res.json({ sessions });
  } catch (err) {
    return res.status(500).json({
      message: 'Error al obtener las sesiones activas',
      error: err.message,
    });
  }
};

export const revokeSession = async (req, res) => {
  const sessionId = req.params.sessionId?.toString().trim();

  if (!sessionId) {
    return res.status(400).json({ message: 'Sesion invalida' });
  }

  try {
    const session = await one(
      `
        SELECT ID_Sesion, ID_Cliente, Revocado_En
        FROM WEB_SESIONES
        WHERE ID_Sesion = ?
        LIMIT 1
      `,
      [sessionId]
    );

    if (!session || Number(session.ID_Cliente) !== Number(req.user.idCliente)) {
      return res.status(404).json({ message: 'La sesion indicada no existe' });
    }

    if (session.Revocado_En) {
      return res.status(409).json({ message: 'La sesion ya estaba cerrada' });
    }

    await query(
      `
        UPDATE WEB_SESIONES
        SET Revocado_En = NOW()
        WHERE ID_Sesion = ?
      `,
      [sessionId]
    );

    return res.json({
      message:
        req.user.sessionId === sessionId
          ? 'La sesion actual fue cerrada.'
          : 'La sesion seleccionada fue cerrada.',
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Error al cerrar la sesion',
      error: err.message,
    });
  }
};

export const logout = async (req, res) => {
  if (!req.user.sessionId) {
    return res.json({ message: 'Sesion cerrada localmente.' });
  }

  try {
    await query(
      `
        UPDATE WEB_SESIONES
        SET Revocado_En = NOW()
        WHERE ID_Sesion = ?
          AND ID_Cliente = ?
          AND Revocado_En IS NULL
      `,
      [req.user.sessionId, req.user.idCliente]
    );

    return res.json({ message: 'Sesion cerrada correctamente.' });
  } catch (err) {
    return res.status(500).json({
      message: 'Error al cerrar la sesion',
      error: err.message,
    });
  }
};

export const changePassword = async (req, res) => {
  const error = validatePasswordChangeInput(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const client = await getClientByCode(req.user.idCliente);

    if (!client || !client.ID_WebUsuario || !client.PasswordHash) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const passwordMatches = await bcrypt.compare(
      req.body.currentPassword,
      client.PasswordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'La contrasena actual no es correcta.',
      });
    }

    if (req.body.currentPassword === req.body.newPassword) {
      return res.status(400).json({
        message: 'La nueva contrasena debe ser diferente a la actual.',
      });
    }

    const newPasswordHash = await bcrypt.hash(req.body.newPassword, 10);

    await query(
      `
        UPDATE WEB_USUARIOS
        SET PasswordHash = ?
        WHERE ID_Cliente = ?
      `,
      [newPasswordHash, client.ID_Cliente]
    );

    if (req.user.sessionId) {
      await query(
        `
          UPDATE WEB_SESIONES
          SET Revocado_En = NOW()
          WHERE ID_Cliente = ?
            AND ID_Sesion <> ?
            AND Revocado_En IS NULL
        `,
        [client.ID_Cliente, req.user.sessionId]
      );
    }

    return res.json({
      message:
        'Contrasena actualizada correctamente. Cerramos las otras sesiones activas por seguridad.',
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Error al actualizar la contrasena',
      error: err.message,
    });
  }
};
