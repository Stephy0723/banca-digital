import { query } from '../config/db.js';
import {
  formatCertificado,
  formatCuenta,
  formatPrestamo,
  formatSession,
  formatUser,
} from '../utils/formatters.js';

const buildRecentActivity = ({ cuentas, certificados, prestamos }) => {
  const accountActivity = cuentas
    .filter((cuenta) => cuenta.ultimaFechaMovimiento)
    .map((cuenta) => {
      const movementName = (cuenta.tipoMovimiento || '').toLowerCase();
      const isOutgoing = /reti|cargo|deb|pago/.test(movementName);

      return {
        id: `cuenta-${cuenta.contrato}`,
        title: `Cuenta ${cuenta.contrato}`,
        subtitle: cuenta.tipoMovimiento || 'Movimiento registrado',
        date: cuenta.ultimaFechaMovimiento,
        amount: cuenta.ultimoMontoMovimiento,
        type: isOutgoing ? 'out' : 'in',
      };
    });

  const certificateActivity = certificados
    .filter((certificado) => certificado.ultimaFechaPago)
    .map((certificado) => ({
      id: `certificado-${certificado.contrato}`,
      title: `Certificado ${certificado.contrato}`,
      subtitle: 'Pago registrado',
      date: certificado.ultimaFechaPago,
      amount: certificado.ultimoMontoPagado,
      type: 'in',
    }));

  const loanActivity = prestamos
    .filter((prestamo) => prestamo.ultimaFechaPago)
    .map((prestamo) => ({
      id: `prestamo-${prestamo.contrato}`,
      title: `Prestamo ${prestamo.contrato}`,
      subtitle: 'Pago aplicado',
      date: prestamo.ultimaFechaPago,
      amount: prestamo.ultimoMontoPagado,
      type: 'out',
    }));

  return [...accountActivity, ...certificateActivity, ...loanActivity]
    .sort((left, right) => new Date(right.date) - new Date(left.date))
    .slice(0, 10);
};

export const getMyAccount = async (req, res) => {
  try {
    const [clients, cuentasRows, certificadosRows, prestamosRows, recentSessionRows] = await Promise.all([
      query(
        `
          SELECT
            c.ID_Cliente,
            c.Nombres,
            c.Apellidos,
            c.Identificacion,
            c.Tipo_ident,
            c.Fecha_Nac,
            c.Telefono,
            w.Email,
            w.TwoFactorEnabled
          FROM ACCESO_CLIENTES c
          LEFT JOIN WEB_USUARIOS w ON w.ID_Cliente = c.ID_Cliente
          WHERE c.ID_Cliente = ?
          LIMIT 1
        `,
        [req.user.idCliente]
      ),
      query(
        `
          SELECT
            Contrato,
            ID_Cliente,
            Tipo_Cuenta,
            Balance_Actual,
            Ult_fecha_mov,
            ult_mto_mov,
            tipo_mov
          FROM CONSULTA_CUENTAS
          WHERE ID_Cliente = ?
          ORDER BY Balance_Actual DESC
        `,
        [req.user.idCliente]
      ),
      query(
        `
          SELECT
            Contrato,
            ID_Cliente,
            Tipo_Certificado,
            Balance_Actual,
            Ult_fecha_pago,
            ult_mto_pagado
          FROM CONSULTA_CERTIFICADO
          WHERE ID_Cliente = ?
          ORDER BY Balance_Actual DESC
        `,
        [req.user.idCliente]
      ),
      query(
        `
          SELECT
            Contrato,
            ID_Cliente,
            Tipo_prestamo,
            Balance_Actual,
            Ult_fecha_pago,
            ult_mto_pagado
          FROM CONSULTA_PRESTAMO
          WHERE ID_Cliente = ?
          ORDER BY Balance_Actual DESC
        `,
        [req.user.idCliente]
      ),
      query(
        `
          SELECT
            ID_Sesion,
            UserAgent,
            IpAddress,
            Ultima_Actividad,
            Creado_En
          FROM WEB_SESIONES
          WHERE ID_Cliente = ?
            AND Revocado_En IS NULL
          ORDER BY COALESCE(Ultima_Actividad, Creado_En) DESC
          LIMIT 6
        `,
        [req.user.idCliente]
      ),
    ]);

    const client = clients[0];

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    const cuentas = cuentasRows.map(formatCuenta);
    const certificados = certificadosRows.map(formatCertificado);
    const prestamos = prestamosRows.map(formatPrestamo);

    return res.json({
      user: formatUser(client),
      stats: {
        totalProductos: cuentas.length + certificados.length + prestamos.length,
        balanceCuentas: cuentas.reduce(
          (total, cuenta) => total + cuenta.balanceActual,
          0
        ),
        balanceCertificados: certificados.reduce(
          (total, certificado) => total + certificado.balanceActual,
          0
        ),
        balancePrestamos: prestamos.reduce(
          (total, prestamo) => total + prestamo.balanceActual,
          0
        ),
      },
      cuentas,
      certificados,
      prestamos,
      recentActivity: buildRecentActivity({ cuentas, certificados, prestamos }),
      recentLogins: recentSessionRows.map((session) => {
        const formattedSession = formatSession(
          {
            ID_Sesion: session.ID_Sesion,
            UserAgent: session.UserAgent,
            IpAddress: session.IpAddress,
            Ultima_Actividad: session.Ultima_Actividad,
            Creado_En: session.Creado_En,
          },
          req.user.sessionId
        );

        return {
          date: formattedSession.lastActiveAt,
          device: formattedSession.device,
          ip: formattedSession.ip,
        };
      }),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener los productos del socio',
      error: error.message,
    });
  }
};
