import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const databaseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  dateStrings: true,
};

export const pool = mysql.createPool(databaseConfig);

let databaseInitialized = false;

export const isDatabaseConfigured = () =>
  Boolean(databaseConfig.host && databaseConfig.user && databaseConfig.database);

export const query = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

export const pingDatabase = async () => {
  if (!isDatabaseConfigured()) {
    return {
      ok: false,
      message: 'Faltan variables de entorno de MySQL',
    };
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.ping();

    return {
      ok: true,
      message: 'Conexion a MySQL disponible',
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message,
    };
  } finally {
    connection?.release();
  }
};

const ensureColumn = async (connection, tableName, columnName, definition) => {
  const [rows] = await connection.query(
    `SHOW COLUMNS FROM ${tableName} LIKE ?`,
    [columnName]
  );

  if (rows.length === 0) {
    await connection.query(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`
    );
  }
};

export const initDatabase = async () => {
  if (databaseInitialized || !isDatabaseConfigured()) {
    return;
  }

  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS WEB_USUARIOS (
        ID_WebUsuario INT AUTO_INCREMENT PRIMARY KEY,
        ID_Cliente INT NOT NULL UNIQUE,
        Email VARCHAR(160) NULL,
        PasswordHash VARCHAR(255) NOT NULL,
        Estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
        TwoFactorEnabled TINYINT(1) NOT NULL DEFAULT 0,
        TwoFactorSecret VARCHAR(128) NULL,
        TwoFactorPendingSecret VARCHAR(128) NULL,
        TwoFactorEnabledAt DATETIME NULL,
        Creado_En TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        Actualizado_En TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        Ultimo_Login TIMESTAMP NULL DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await ensureColumn(connection, 'WEB_USUARIOS', 'Email', 'VARCHAR(160) NULL AFTER ID_Cliente');
    await ensureColumn(connection, 'WEB_USUARIOS', 'TwoFactorEnabled', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER Estado');
    await ensureColumn(connection, 'WEB_USUARIOS', 'TwoFactorSecret', 'VARCHAR(128) NULL AFTER TwoFactorEnabled');
    await ensureColumn(connection, 'WEB_USUARIOS', 'TwoFactorPendingSecret', 'VARCHAR(128) NULL AFTER TwoFactorSecret');
    await ensureColumn(connection, 'WEB_USUARIOS', 'TwoFactorEnabledAt', 'DATETIME NULL AFTER TwoFactorPendingSecret');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS WEB_REGISTRO_VALIDACIONES (
        ID_Validacion INT AUTO_INCREMENT PRIMARY KEY,
        ProcesoToken CHAR(32) NOT NULL UNIQUE,
        ID_Cliente INT NOT NULL,
        Email VARCHAR(160) NOT NULL,
        CodigoHash CHAR(64) NOT NULL,
        Intentos INT NOT NULL DEFAULT 0,
        Expira_En DATETIME NOT NULL,
        Verificado_En DATETIME NULL,
        Usado_En DATETIME NULL,
        Creado_En TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_web_registro_cliente (ID_Cliente),
        INDEX idx_web_registro_email (Email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS WEB_2FA_RECOVERY_CODES (
        ID_RecoveryCode INT AUTO_INCREMENT PRIMARY KEY,
        ID_Cliente INT NOT NULL,
        CodeHash CHAR(64) NOT NULL,
        Used_En DATETIME NULL,
        Creado_En TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_web_2fa_codes_cliente (ID_Cliente),
        INDEX idx_web_2fa_codes_hash (CodeHash)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS WEB_SESIONES (
        ID_Sesion CHAR(36) PRIMARY KEY,
        ID_Cliente INT NOT NULL,
        UserAgent VARCHAR(255) NULL,
        IpAddress VARCHAR(64) NULL,
        Ultima_Actividad DATETIME NOT NULL,
        Creado_En TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        Revocado_En DATETIME NULL,
        INDEX idx_web_sesiones_cliente (ID_Cliente),
        INDEX idx_web_sesiones_ultima_actividad (Ultima_Actividad)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    databaseInitialized = true;
  } finally {
    connection.release();
  }
};
