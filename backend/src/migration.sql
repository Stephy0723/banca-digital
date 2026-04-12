-- Migración: agregar columna cedula a la tabla users para el flujo de registro de CoopeOcala
-- Ejecutar en la base de datos banca_digital

-- Agregar columna cedula (permite NULL para usuarios ya existentes)
ALTER TABLE users ADD COLUMN IF NOT EXISTS cedula VARCHAR(20) UNIQUE;

-- Hacer password nullable (los asociados pre-registrados no tienen password hasta completar el registro)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Ejemplo: insertar un asociado pre-registrado para pruebas
-- INSERT INTO users (full_name, email, cedula) VALUES ('Juan Pérez', 'juan@coopeocala.com', '00100123456');
