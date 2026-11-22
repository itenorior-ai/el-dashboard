/* ==========================================================================
   Atención al cliente 100 % local para la versión pública (GitHub Pages).
   No hay backend, n8n ni APIs externas: las respuestas se basan únicamente
   en los servicios publicados en esta misma página. Nada se inventa.
   ========================================================================== */
(() => {
  'use strict';

  const FORMULARIO = 'Si me dejas los detalles en el formulario de contacto de la página, quedan registrados en este navegador y podremos retomarlo por ahí.';

  const SERVICIOS = [
    ['Restaurante', 'una carta de temporada que combina técnicas cuidadas, ingredientes honestos y presentaciones con carácter'],
    ['Barra & coctelería', 'un espacio para brindar, con clásicos reinterpretados y propuestas de autor para acompañar cada momento de la noche'],
    ['Eventos privados', 'celebraciones, reuniones y encuentros con un servicio pensado a la medida de cada ocasión'],
  ];

  const SERVICIOS_TEXTO = 'Estas son las tres experiencias de Puerto A&M:\n\n'
    + SERVICIOS.map(([n, d]) => `**${n}** — ${d}.`).join('\n')
    + `\n\n${FORMULARIO}`;

  const SIN_DATO = `Todavía no tengo ese dato publicado en esta página, y no quiero darte una información equivocada. ${FORMULARIO}`;

  function normalizar(texto) {
    return String(texto || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function responder(mensaje) {
    const q = normalizar(mensaje);
    const tiene = (...palabras) => palabras.some((p) => q.includes(p));

    let texto;
    if (tiene('cfdi', 'factura', 'sat', 'banco', 'utilidad', 'margen', 'egreso',
              'gasto', 'proveedor', 'nacional soft', 'caja', 'balance',
              'impuesto', 'venta', 'ingreso', 'excel', 'dashboard')) {
      texto = 'Ese tema se atiende únicamente en el panel administrativo. En este canal puedo ayudarte con horarios, reservaciones, servicios y solicitudes generales.';
    } else if (tiene('hola', 'buenas', 'buen dia', 'hey', 'saludos')) {
      texto = 'Hola. Soy el asistente de Puerto A&M. Puedo orientarte sobre el restaurante, la barra y los eventos privados, y ayudarte a registrar una solicitud. ¿Qué te gustaría saber?';
    } else if (tiene('que puedes', 'que sabes', 'ayudame', 'ayuda', 'capacidad', 'opciones')) {
      texto = 'Puedo ayudarte con el restaurante, la barra y la coctelería, los eventos privados, las reservaciones y el registro de solicitudes. No manejo información financiera ni datos que no estén publicados en esta página.';
    } else if (tiene('gracias', 'agradeco')) {
      texto = 'Con gusto. Si necesitas algo más, estoy aquí; también puedes usar el formulario de contacto.';
    } else if (tiene('reserv', 'mesa', 'disponibilidad', 'agendar cita')) {
      texto = `Puedo ayudarte a registrar tu reservación, pero no tengo disponibilidad en tiempo real, así que no puedo confirmar una mesa desde aquí. ${FORMULARIO} Incluye fecha, hora y número de personas.`;
    } else if (tiene('evento', 'celebrac', 'reunion', 'cumplea', 'boda', 'cotizac')) {
      texto = `Para eventos privados, cuéntame el tipo de celebración, la fecha aproximada y el número de invitados. No tengo precios publicados en este canal. ${FORMULARIO}`;
    } else if (tiene('barra', 'coctel', 'cocteler', 'bebid', 'trago', 'bar')) {
      texto = `**Barra & coctelería** — ${SERVICIOS[1][1]}. ${FORMULARIO}`;
    } else if (tiene('restaurante', 'carta', 'menu', 'platillo', 'comida', 'plato')) {
      texto = `**Restaurante** — ${SERVICIOS[0][1]}. ${FORMULARIO}`;
    } else if (tiene('servicio', 'ofrecen', 'experiencia', 'que hacen')) {
      texto = SERVICIOS_TEXTO;
    } else if (tiene('horario', 'abren', 'cierran', 'direccion', 'ubicac', 'donde estan',
                     'telefono', 'celular', 'whatsapp', 'correo', 'email', 'precio',
                     'costo', 'cuesta', 'tarifa', 'estatus', 'persona', 'humano', 'asesor')) {
      texto = SIN_DATO;
    } else {
      texto = `Puedo orientarte sobre el restaurante, la barra, los eventos privados y las reservaciones. ${FORMULARIO}`;
    }

    return { respuesta: texto, origen: 'local' };
  }

  window.PAM_ATENCION = { responder };
})();
