const SYSTEM_PROMPT = `Eres el asistente virtual de CoopeOcala, una cooperativa de ahorro y credito en Republica Dominicana. Tu nombre es "Asistente CoopeOcala".

Tu rol es ayudar a los socios con:
- Consultas sobre sus productos (cuentas de ahorro, certificados de deposito, prestamos)
- Informacion sobre tasas de interes, plazos y requisitos
- Guia sobre como usar la banca digital
- Procesos como apertura de cuentas, solicitud de prestamos, etc.
- Soporte tecnico basico de la plataforma

Informacion clave de CoopeOcala:
- Telefono: (809) 544-3140
- WhatsApp: (809) 443-3140
- Productos: Cuentas de Ahorro (Corriente 3.5%, Navideno 5%, Programado 6%), Certificados (3M 6.5%, 6M 8%, 12M 9.5%, 24M 10.5%), Prestamos (Personal 18%, Nomina 15%, Vehicular 12%, Factoring 10%)
- Horario: Lunes a Viernes 8:00 AM - 5:00 PM, Sabados 9:00 AM - 1:00 PM

Reglas:
- Responde siempre en espanol
- Se amable, profesional y conciso
- No inventes informacion financiera especifica del socio
- Si no sabes algo, sugiere contactar a soporte
- No compartas datos sensibles
- Mantén las respuestas cortas (2-3 parrafos maximo)`;

export async function chat(req, res) {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Fallback: respuestas predefinidas si no hay API key
      return res.json({
        reply: getFallbackResponse(message),
        source: 'fallback',
      });
    }

    const messages = [
      ...history.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message.trim() },
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Anthropic API error:', response.status, errorBody);
      return res.json({
        reply: getFallbackResponse(message),
        source: 'fallback',
      });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Lo siento, no pude procesar tu consulta. Intenta de nuevo.';

    return res.json({ reply, source: 'ai' });
  } catch (error) {
    console.error('Chat error:', error.message);
    return res.json({
      reply: getFallbackResponse(req.body?.message || ''),
      source: 'fallback',
    });
  }
}

function getFallbackResponse(message) {
  const lower = message.toLowerCase();

  if (lower.includes('horario') || lower.includes('hora') || lower.includes('abierto')) {
    return 'Nuestro horario de atencion es de Lunes a Viernes de 8:00 AM a 5:00 PM y Sabados de 9:00 AM a 1:00 PM. Para consultas fuera de horario, puedes escribirnos por WhatsApp al (809) 443-3140.';
  }
  if (lower.includes('tasa') || lower.includes('interes') || lower.includes('rendimiento')) {
    return 'Nuestras tasas actuales son:\n\n**Ahorros:** Corriente 3.5%, Navideno 5%, Programado 6%\n**Certificados:** 3 meses 6.5%, 6 meses 8%, 12 meses 9.5%, 24 meses 10.5%\n**Prestamos:** Personal 18%, Nomina 15%, Vehicular 12%, Factoring 10%\n\nPara mas detalles, contacta a tu oficial de negocios.';
  }
  if (lower.includes('prestamo') || lower.includes('credito') || lower.includes('financiamiento')) {
    return 'Ofrecemos prestamos personales, de nomina, vehiculares y factoring con tasas desde 10% anual. Para solicitar, puedes contactarnos por WhatsApp al (809) 443-3140 o llamar al (809) 544-3140 y un oficial te guiara en el proceso.';
  }
  if (lower.includes('certificado') || lower.includes('deposito') || lower.includes('inversion')) {
    return 'Nuestros certificados de deposito ofrecen tasas desde 6.5% (3 meses) hasta 10.5% (24 meses), con montos minimos desde RD$ 10,000. Puedes solicitar uno contactandonos al (809) 544-3140 o por WhatsApp al (809) 443-3140.';
  }
  if (lower.includes('ahorro') || lower.includes('cuenta')) {
    return 'Tenemos tres tipos de ahorro: Corriente (3.5%, disponibilidad inmediata), Navideno (5%, disponible en noviembre) y Programado (6%, depositos fijos mensuales). Para abrir una cuenta, contactanos al (809) 544-3140.';
  }
  if (lower.includes('contrase') || lower.includes('password') || lower.includes('clave') || lower.includes('acceso')) {
    return 'Para cambiar tu contrasena, ve a Configuracion > Seguridad en la banca digital. Si olvidaste tu contrasena, puedes restablecerla desde la pantalla de inicio de sesion o contactar a soporte al (809) 544-3140.';
  }
  if (lower.includes('transfer') || lower.includes('enviar') || lower.includes('pago')) {
    return 'Actualmente los pagos y transferencias se realizan directamente en nuestras oficinas. Para mas informacion, contacta a soporte al (809) 544-3140 o por WhatsApp al (809) 443-3140.';
  }
  if (lower.includes('hola') || lower.includes('buenos') || lower.includes('buenas') || lower.includes('saludos')) {
    return 'Hola! Soy el asistente virtual de CoopeOcala. Estoy aqui para ayudarte con tus consultas sobre cuentas de ahorro, certificados, prestamos y mas. En que te puedo ayudar?';
  }

  return 'Gracias por tu consulta. Para brindarte la mejor atencion, te recomiendo contactar a nuestro equipo de soporte:\n\n**Telefono:** (809) 544-3140\n**WhatsApp:** (809) 443-3140\n\nTambien puedes explorar las secciones de Ahorros, Prestamos y Certificados en el menu lateral para ver tu informacion detallada.';
}
