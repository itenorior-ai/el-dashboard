# El dashboard — Landing pública de Puerto A&M

Versión pública y estática de la landing de Puerto A&M, publicada con **GitHub Pages**.

## Qué incluye

- Landing responsive corporativa (blanco, azul profundo, animaciones y SVG propios).
- **Chat de atención al cliente con memoria en Supabase**: las respuestas se generan localmente en el navegador (sin n8n ni APIs de IA), pero la conversación se guarda en Postgres y se restaura al volver a abrir la página.
- **Memoria**: tabla `public.chat_memoria` en el proyecto Supabase `puerto-am-memoria`, con RLS por `session_id`. Si Supabase no responde, el chat degrada a `localStorage` y sigue funcionando.
- Respuestas basadas únicamente en los servicios publicados en la propia página. Si falta un dato (horarios, dirección, teléfono, precios o disponibilidad), lo dice explícitamente en lugar de inventarlo.
- El asistente recuerda datos concretos que el cliente ya mencionó (por ejemplo, «4 personas» o un día de la semana) y retoma el tema anterior si dice «y eso», «dime más», etc.
- Formulario de contacto: guarda la solicitud en `localStorage` del navegador y avisa con claridad de que **no se envía ningún correo**.
- Aislamiento de información: los temas financieros se rechazan en el chat público.

## Limitación de GitHub Pages

Pages sirve archivos estáticos: **no puede ejecutar el backend FastAPI**. El panel administrativo, las métricas del Excel y el asistente BI viven en el proyecto local `puerto-am-bi` y no se publican en este sitio. No se muestra ninguna cifra financiera en esta landing.

## Estructura

```
.
├── index.html
├── assets/
│   ├── css/landing.css
│   └── js/
│       ├── supabase-config.js   # URL y publishable key (públicas)
│       ├── supabase-memoria.js  # lectura/escritura REST con RLS
│       ├── atencion.js          # motor de respuestas + uso de memoria
│       └── landing.js           # interacción de la página
└── supabase/
    └── schema.sql               # tabla, políticas RLS y GRANTs
```

## Supabase

Proyecto: `puerto-am-memoria` (organización ILIANA TENORIO). La clave
`sb_publishable_...` es pública y está protegida por RLS: cada visitante sólo
ve las filas de su propio `session_id`. La clave `service_role` **nunca** se
coloca en el frontend.

## Ver en local

```bash
python3 -m http.server 8080
# http://localhost:8080
```
