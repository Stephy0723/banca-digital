import nodemailer from 'nodemailer';

let transporter;

const isTruthy = (value = '') => value.toString().toLowerCase() === 'true';
const escapeHtml = (value = '') =>
  value
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const isEmailServiceConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_FROM
  );

const getTransporter = () => {
  if (!isEmailServiceConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure:
        process.env.SMTP_SECURE
          ? isTruthy(process.env.SMTP_SECURE)
          : Number(process.env.SMTP_PORT) === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
  }

  return transporter;
};

const buildValidationEmailTemplate = ({ fullName, code }) => {
  const recipientName = escapeHtml(fullName || 'socio');
  const safeCode = escapeHtml(code);

  return {
    subject: 'Tu codigo de validacion de CoopeOcala',
    text: [
      'CoopeOcala',
      'Validacion de acceso web',
      '',
      `Hola ${fullName || 'socio'},`,
      '',
      'Recibimos una solicitud para activar o validar tu acceso a la banca digital.',
      `Tu codigo de validacion es: ${code}`,
      '',
      'Este codigo vence en 10 minutos.',
      'Por seguridad, no lo compartas con nadie.',
      '',
      'Si no solicitaste este acceso, puedes ignorar este mensaje.',
      '',
      'Equipo CoopeOcala',
      'https://coopeocala.com',
    ].join('\n'),
    html: `
      <div style="margin:0; padding:32px 16px; background:#f4f7f6;">
        <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #dbe7e2; border-radius:24px; overflow:hidden; box-shadow:0 18px 40px rgba(19,46,39,0.08);">
          <div style="padding:28px 32px; background:linear-gradient(135deg, #0d7c5f 0%, #0f5f4c 100%); color:#ffffff;">
            <div style="display:inline-block; padding:6px 12px; border-radius:999px; background:rgba(255,255,255,0.16); font-size:12px; letter-spacing:0.08em; text-transform:uppercase; font-weight:700;">
              CoopeOcala
            </div>
            <h1 style="margin:16px 0 8px; font-size:28px; line-height:1.2; font-weight:800;">
              Validacion de acceso web
            </h1>
            <p style="margin:0; font-size:15px; line-height:1.7; color:rgba(255,255,255,0.9);">
              Protegemos el acceso a la banca digital con una verificacion rapida y segura.
            </p>
          </div>

          <div style="padding:32px;">
            <p style="margin:0 0 14px; font-size:16px; line-height:1.7; color:#183153;">
              Hola <strong>${recipientName}</strong>,
            </p>
            <p style="margin:0 0 22px; font-size:15px; line-height:1.8; color:#425466;">
              Recibimos una solicitud para activar o validar tu acceso a la banca digital de CoopeOcala.
              Utiliza el siguiente codigo para continuar con tu registro:
            </p>

            <div style="margin:0 0 24px; padding:24px; border-radius:20px; background:linear-gradient(180deg, #f7fbf9 0%, #eef7f3 100%); border:1px solid #d7ebe3; text-align:center;">
              <div style="margin-bottom:8px; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#5f7d72; font-weight:700;">
                Codigo de validacion
              </div>
              <div style="font-size:34px; line-height:1; font-weight:800; letter-spacing:8px; color:#0d7c5f;">
                ${safeCode}
              </div>
              <div style="margin-top:12px; font-size:13px; color:#6c7f77;">
                Vigente por 10 minutos
              </div>
            </div>

            <div style="margin:0 0 24px; padding:18px 20px; border-radius:18px; background:#fff8ea; border:1px solid #f0ddb2;">
              <div style="margin:0 0 8px; font-size:14px; font-weight:700; color:#8a5b00;">
                Recomendacion de seguridad
              </div>
              <p style="margin:0; font-size:14px; line-height:1.7; color:#6a5320;">
                No compartas este codigo con nadie. Nuestro equipo nunca te pedira esta clave por llamada,
                mensaje o correo.
              </p>
            </div>

            <p style="margin:0 0 10px; font-size:14px; line-height:1.7; color:#425466;">
              Si no solicitaste este acceso, puedes ignorar este mensaje con tranquilidad.
            </p>
            <p style="margin:0; font-size:14px; line-height:1.7; color:#425466;">
              Gracias por confiar en <strong>CoopeOcala</strong>.
            </p>
          </div>

          <div style="padding:20px 32px 28px; border-top:1px solid #e6efeb; background:#fbfcfc;">
            <p style="margin:0 0 6px; font-size:13px; line-height:1.6; color:#5f6f6a;">
              Equipo CoopeOcala
            </p>
            <p style="margin:0; font-size:13px; line-height:1.6; color:#5f6f6a;">
              Sitio web: <a href="https://coopeocala.com" style="color:#0d7c5f; text-decoration:none; font-weight:700;">coopeocala.com</a>
            </p>
          </div>
        </div>
      </div>
    `,
  };
};

export const sendValidationCodeEmail = async ({ to, fullName, code }) => {
  if (!isEmailServiceConfigured()) {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      throw new Error('El servicio de correo no esta configurado');
    }

    console.log(`[DEV] Codigo de validacion para ${to}: ${code}`);

    return {
      delivered: false,
      mode: 'development',
      previewCode: code,
      message:
        'SMTP no esta configurado; se genero un codigo de prueba para desarrollo.',
    };
  }

  const smtpTransporter = getTransporter();
  const emailTemplate = buildValidationEmailTemplate({ fullName, code });

  await smtpTransporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: emailTemplate.subject,
    text: emailTemplate.text,
    html: emailTemplate.html,
  });

  return {
    delivered: true,
    mode: 'smtp',
    message: 'Codigo enviado correctamente a tu correo.',
  };
};
