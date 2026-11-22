-- ==========================================================================
-- Puerto A&M · memoria del chat de atención al cliente
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- ==========================================================================

create table if not exists public.chat_memoria (
  id bigint generated always as identity primary key,
  session_id text not null,
  rol text not null check (rol in ('customer', 'assistant')),
  contenido text not null,
  creado_en timestamptz not null default now()
);

create index if not exists chat_memoria_session_idx
  on public.chat_memoria (session_id, id desc);

alter table public.chat_memoria enable row level security;

-- Cada visitante sólo puede leer/escribir las filas de SU session_id.
-- El valor viaja en la cabecera x-session-id (ver supabase-memoria.js).
drop policy if exists "chat_memoria_insert" on public.chat_memoria;
create policy "chat_memoria_insert"
  on public.chat_memoria for insert to anon, authenticated
  with check (
    session_id = coalesce(
      current_setting('request.headers', true)::json ->> 'x-session-id', ''
    )
  );

drop policy if exists "chat_memoria_select" on public.chat_memoria;
create policy "chat_memoria_select"
  on public.chat_memoria for select to anon, authenticated
  using (
    session_id = coalesce(
      current_setting('request.headers', true)::json ->> 'x-session-id', ''
    )
  );

-- Permisos de tabla para el rol público (las políticas RLS anteriores sólo
-- filtran filas; sin estos GRANTs PostgREST devuelve 42501).
grant usage on schema public to anon, authenticated;
grant select, insert on public.chat_memoria to anon, authenticated;
grant usage, select on sequence public.chat_memoria_id_seq to anon, authenticated;

-- NOTA DE SEGURIDAD: x-session-id es un identificador de demo; cualquier
-- cliente puede enviar otro valor. Para producción usa Supabase Auth
-- (anonymous sign-ins) y compara la política con auth.uid() en una columna
-- user_id, en lugar de esta cabecera.
