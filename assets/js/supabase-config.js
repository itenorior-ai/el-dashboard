/* ==========================================================================
   Configuración de Supabase para la memoria del chat.
   Rellena URL y anon key con los valores de tu proyecto (Project Settings →
   API). La anon key es pública y está protegida por RLS; NUNCA pongas aquí
   la service_role key. Si dejas los campos vacíos, el chat usa localStorage.
   ========================================================================== */
window.PAM_SUPABASE = {
  url: 'https://ywbvezofpehwattythez.supabase.co',
  anonKey: 'sb_publishable_bhRLeJTu9NktKnajBkzc8g_x_otAZjL',
  tabla: 'chat_memoria',
  mensajes: 12,
};
