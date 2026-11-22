/* ==========================================================================
   Memoria del chat en Supabase (REST / PostgREST).
   Si no hay configuración o falla la red, se usa localStorage y el chat
   sigue funcionando. Nunca expone secretos ni bloquea la conversación.
   ========================================================================== */
(() => {
  'use strict';

  const cfg = window.PAM_SUPABASE || {};
  const url = String(cfg.url || '').replace(/\/$/, '');
  const key = String(cfg.anonKey || '');
  const activo = Boolean(url && key);
  const tabla = String(cfg.tabla || 'chat_memoria').replace(/[^a-zA-Z0-9_]/g, '');
  const limite = Math.min(50, Math.max(1, Number(cfg.mensajes) || 12));
  const endpoint = `${url}/rest/v1/${tabla}`;
  const LOCAL = 'pam_memoria_local';

  function cabeceras(sessionId, extra = {}) {
    return {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
      ...extra,
    };
  }

  function leerLocal(sessionId) {
    try {
      const todo = JSON.parse(localStorage.getItem(LOCAL) || '{}');
      return Array.isArray(todo[sessionId]) ? todo[sessionId] : [];
    } catch (_) {
      return [];
    }
  }

  function guardarLocal(sessionId, mensaje) {
    try {
      const todo = JSON.parse(localStorage.getItem(LOCAL) || '{}');
      const actual = Array.isArray(todo[sessionId]) ? todo[sessionId] : [];
      actual.push(mensaje);
      todo[sessionId] = actual.slice(-limite);
      localStorage.setItem(LOCAL, JSON.stringify(todo));
    } catch (_) { /* almacenamiento lleno o bloqueado */ }
  }

  async function leer(sessionId) {
    if (!activo) return leerLocal(sessionId);
    const params = new URLSearchParams({
      select: 'rol,contenido,creado_en',
      session_id: `eq.${sessionId}`,
      order: 'id.desc',
      limit: String(limite),
    });
    const respuesta = await fetch(`${endpoint}?${params}`, {
      headers: cabeceras(sessionId, { Accept: 'application/json' }),
      cache: 'no-store',
    });
    if (!respuesta.ok) throw new Error(`Supabase devolvió HTTP ${respuesta.status}`);
    const filas = await respuesta.json();
    return filas.reverse().map((f) => ({ rol: f.rol, contenido: f.contenido }));
  }

  async function guardar(sessionId, rol, contenido) {
    const mensaje = { rol, contenido, creado_en: new Date().toISOString() };
    guardarLocal(sessionId, mensaje);
    if (!activo) return;
    const respuesta = await fetch(endpoint, {
      method: 'POST',
      headers: cabeceras(sessionId, { Prefer: 'return=minimal' }),
      body: JSON.stringify({ session_id: sessionId, rol, contenido }),
    });
    if (!respuesta.ok) throw new Error(`Supabase devolvió HTTP ${respuesta.status}`);
  }

  window.PAM_MEMORIA = { activo, leer, guardar, origen: activo ? 'supabase' : 'local' };
})();
