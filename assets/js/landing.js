/* ==========================================================================
   Puerto A&M | Landing pública
   El chat y el formulario consumen APIs reales. Nunca se simulan respuestas.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let sessionId = sessionStorage.getItem('pam_chat_session') || '';
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('pam_chat_session', sessionId);
  }

  /* --------------------------- Navegación -------------------------------- */
  const nav = $('#nav');
  const navLinks = $('#navLinks');
  const menuToggle = $('#menuToggle');

  const actualizarNav = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  actualizarNav();
  window.addEventListener('scroll', actualizarNav, { passive: true });

  menuToggle.addEventListener('click', () => {
    const abierto = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(abierto));
  });
  $$('#navLinks a').forEach((enlace) => enlace.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  // Si el observador no llega a dispararse (pestaña en segundo plano, por
  // ejemplo), el contenido debe seguir siendo visible: nunca ocultar info.
  setTimeout(() => $$('.reveal').forEach((nodo) => nodo.classList.add('visible')), 1400);

  if ('IntersectionObserver' in window && !reducido) {
    const observer = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visible');
          observer.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach((nodo) => observer.observe(nodo));

    const observadorLinks = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        $$('#navLinks a').forEach((a) => a.classList.toggle(
          'active', a.getAttribute('href') === `#${entrada.target.id}`
        ));
      });
    }, { threshold: 0.4 });
    $$('main section[id]').forEach((seccion) => observadorLinks.observe(seccion));
  } else {
    $$('.reveal').forEach((nodo) => nodo.classList.add('visible'));
  }

  // Línea de progreso de la experiencia
  const timeline = $('#timeline');
  const progress = $('#timelineProgress');
  if (timeline && progress) {
    const actualizar = () => {
      const rect = timeline.getBoundingClientRect();
      const total = rect.height || 1;
      const avance = Math.min(1, Math.max(0, (window.innerHeight * 0.75 - rect.top) / total));
      progress.style.width = `${avance * 100}%`;
    };
    window.addEventListener('scroll', actualizar, { passive: true });
    actualizar();
  }

  $('#year').textContent = String(new Date().getFullYear());

  /* ------------------------------ Toast ---------------------------------- */
  let toastTimer;
  function toast(mensaje, error = false) {
    const nodo = $('#toast');
    nodo.textContent = mensaje;
    nodo.classList.toggle('error', error);
    nodo.hidden = false;
    requestAnimationFrame(() => nodo.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      nodo.classList.remove('show');
      setTimeout(() => { nodo.hidden = true; }, 320);
    }, 5000);
  }

  /* ------------------- Estado público (sin datos financieros) ------------- */
  function cargarEstado() {
    $('#contactStatusText').textContent = 'Asistente en línea para atenderte';
    $('#contactStatus .status-dot').classList.add('online');
    $('#chatFootnote').textContent = 'Asistente local · sin servicios externos';
  }
  cargarEstado();

  /* ------------------------------- Chat ---------------------------------- */
  const widget = $('#chatWidget');
  const launcher = $('#chatLauncher');
  const panel = $('#chatPanel');
  const mensajes = $('#chatMessages');
  const input = $('#chatInput');
  const form = $('#chatForm');
  const enviarBtn = $('button[type="submit"]', form);
  let ocupado = false;

  function abrirChat(prefill = '') {
    panel.hidden = false;
    widget.classList.add('open');
    launcher.setAttribute('aria-expanded', 'true');
    if (prefill) {
      input.value = prefill;
      input.focus();
      input.setSelectionRange(prefill.length, prefill.length);
    } else {
      input.focus();
    }
  }
  function cerrarChat() {
    panel.hidden = true;
    widget.classList.remove('open');
    launcher.setAttribute('aria-expanded', 'false');
  }
  launcher.addEventListener('click', () => panel.hidden ? abrirChat() : cerrarChat());
  $('#chatClose').addEventListener('click', cerrarChat);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) cerrarChat(); });
  $$('[data-chat-open]').forEach((boton) => boton.addEventListener('click', () => {
    abrirChat(boton.dataset.prefill || '');
    if (boton.closest('.service-card')) {
      $('#servicios').scrollIntoView({ behavior: reducido ? 'auto' : 'smooth' });
    }
  }));
  $$('#chatSuggestions button').forEach((boton) => boton.addEventListener('click', () => {
    input.value = boton.dataset.prefill;
    input.focus();
  }));

  // Render seguro: el contenido del servidor nunca se inserta como HTML.
  function anadirMensaje(texto, quien) {
    const contenedor = document.createElement('div');
    contenedor.className = `chat-message chat-message--${quien}`;
    const burbuja = document.createElement('div');
    burbuja.className = 'bubble';
    String(texto).split('**').forEach((parte, i) => {
      if (i % 2 === 1) {
        const fuerte = document.createElement('strong');
        fuerte.textContent = parte;
        burbuja.appendChild(fuerte);
      } else if (parte) {
        burbuja.appendChild(document.createTextNode(parte));
      }
    });
    contenedor.appendChild(burbuja);
    mensajes.appendChild(contenedor);
    mensajes.scrollTop = mensajes.scrollHeight;
  }

  function indicadorEscritura() {
    const nodo = document.createElement('div');
    nodo.className = 'chat-message chat-message--bot';
    nodo.innerHTML = '<div class="bubble typing"><i></i><i></i><i></i></div>';
    mensajes.appendChild(nodo);
    mensajes.scrollTop = mensajes.scrollHeight;
    return nodo;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (ocupado) return;
    const mensaje = input.value.trim();
    if (!mensaje) return;
    anadirMensaje(mensaje, 'user');
    input.value = '';
    ocupado = true;
    enviarBtn.disabled = true;
    const espera = indicadorEscritura();
    try {
      const datos = window.PAM_ATENCION.responder(mensaje);
      espera.remove();
      anadirMensaje(datos.respuesta || 'No se recibió respuesta del canal de atención.', 'bot');
    } catch (error) {
      espera.remove();
      anadirMensaje(`No pude completar la solicitud: ${error.message}. Intenta de nuevo.`, 'bot');
    } finally {
      ocupado = false;
      enviarBtn.disabled = false;
      input.focus();
    }
  });

  /* ----------------------------- Formulario ------------------------------ */
  const contacto = $('#contactForm');
  const nota = $('#formNote');
  const submit = $('#contactSubmit');

  contacto.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    const datos = new FormData(contacto);
    const payload = Object.fromEntries(datos.entries());
    $$('.invalid', contacto).forEach((n) => n.classList.remove('invalid'));
    nota.className = 'form-note';
    nota.textContent = 'Enviando solicitud…';

    if (!payload.nombre?.trim() || !payload.mensaje?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email || '')) {
      for (const nombre of ['nombre', 'email', 'mensaje']) {
        const campo = contacto.elements[nombre];
        if (nombre === 'email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campo.value) : !campo.value.trim()) {
          campo.classList.add('invalid');
        }
      }
      nota.classList.add('error');
      nota.textContent = 'Revisa los campos marcados: nombre, correo válido y mensaje son obligatorios.';
      return;
    }

    submit.disabled = true;
    try {
      const referencia = Date.now().toString(36).toUpperCase()
        + Math.random().toString(36).slice(2, 6).toUpperCase();
      const registro = { ...payload, referencia, fecha: new Date().toISOString() };
      const guardadas = JSON.parse(localStorage.getItem('pam_solicitudes') || '[]');
      guardadas.push(registro);
      localStorage.setItem('pam_solicitudes', JSON.stringify(guardadas.slice(-50)));
      nota.classList.add('ok');
      nota.textContent = `Solicitud registrada en este navegador (referencia: ${referencia}). Esta versión pública no envía correos.`;
      contacto.reset();
      toast('Solicitud registrada');
    } catch (error) {
      nota.classList.add('error');
      nota.textContent = `No se pudo guardar la solicitud en este navegador: ${error.message}`;
      toast('No se pudo registrar la solicitud', true);
    } finally {
      submit.disabled = false;
    }
  });
})();
