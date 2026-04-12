import dotenv from 'dotenv';
import app from './app.js';
import { initDatabase, isDatabaseConfigured } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  if (!isDatabaseConfigured()) {
    console.warn('Faltan variables de entorno para conectar MySQL.');
  } else {
    try {
      await initDatabase();
      console.log('Base de datos MySQL inicializada correctamente.');
    } catch (error) {
      console.error(`No se pudo inicializar MySQL: ${error.message}`);
    }
  }

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();
