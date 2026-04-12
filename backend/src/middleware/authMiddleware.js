import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1]?.trim();

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.sessionId) {
      const rows = await query(
        `
          SELECT ID_Sesion, ID_Cliente, Revocado_En
          FROM WEB_SESIONES
          WHERE ID_Sesion = ?
          LIMIT 1
        `,
        [decoded.sessionId]
      );
      const session = rows[0];

      if (
        !session ||
        session.Revocado_En ||
        Number(session.ID_Cliente) !== Number(decoded.idCliente)
      ) {
        return res.status(401).json({ message: 'La sesion ya no esta activa' });
      }

      await query(
        `
          UPDATE WEB_SESIONES
          SET Ultima_Actividad = NOW()
          WHERE ID_Sesion = ?
        `,
        [decoded.sessionId]
      );
    }

    req.user = {
      idCliente: decoded.idCliente,
      identificacion: decoded.identificacion,
      sessionId: decoded.sessionId || null,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalido o vencido' });
  }
};

export default authMiddleware;
