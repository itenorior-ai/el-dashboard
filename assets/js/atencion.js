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

  function responder(mensaje, historial = []) {
    const q = normalizar(mensaje);
    const tiene = (...palabras) => palabras.some((p) => q.includes(p));
    const ultimoAsistente = [...historial].reverse().find((m) => m.rol === 'assistant');

    // Retoma el último tema cuando el cliente habla de "eso" o pide más info.
    function retomar(ultimo) {
      const t = normalizar(ultimo ? ultimo.contenido : '');
      if (t.includes('reservac')) return `Seguimos con la reservación. ${FORMULARIO} Incluye fecha, hora y número de personas.`;
      if (t.includes('evento')) return `Seguimos con el evento privado. ${FORMULARIO} Cuéntame el tipo de celebración, fecha aproximada e invitados.`;
      if (t.includes('barra')) return `Seguimos con la barra. **Barra & coctelería** — ${SERVICIOS[1][1]}. ${FORMULARIO}`;
      if (t.includes('restaurante')) return `Seguimos con el restaurante. **Restaurante** — ${SERVICIOS[0][1]}. ${FORMULARIO}`;
      return SERVICIOS_TEXTO;
    }

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
    } else if (historial.length && tiene('y eso', 'mas informacion', 'dime mas', 'que dijiste',
                                        'repiteme', 'y entonces', 'sigue', 'mas detalles', 'eso')) {
      texto = retomar(ultimoAsistente);
    } else {
      texto = `Puedo orientarte sobre el restaurante, la barra, los eventos privados y las reservaciones. ${FORMULARIO}`;
    }

    // La memoria también sirve para recordar datos que el cliente ya dio.
    const detalles = [];
    historial.filter((m) => m.rol === 'customer').forEach((m) => {
      const previo = normalizar(m.contenido);
      const personas = previo.match(/(\d{1,3})\s*personas?/);
      if (personas) detalles.push(`${personas[1]} personas`);
      const dia = previo.match(/\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/);
      if (dia) detalles.push(dia[1]);
    });
    if (detalles.length) {
      texto += ` Tengo anotado de nuestra conversación: ${[...new Set(detalles)].join(', ')}.`;
    }

    return { respuesta: texto, origen: 'local', mensajes_en_memoria: historial.length };
  }

  window.PAM_ATENCION = { responder };
})();
