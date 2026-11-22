# El dashboard — Landing pública de Puerto A&M

Versión pública y estática de la landing de Puerto A&M, publicada con **GitHub Pages**.

## Qué incluye

- Landing responsive corporativa (blanco, azul profundo, animaciones y SVG propios).
- **Chat de atención al cliente 100 % local**: funciona con JavaScript en el navegador, sin n8n, sin API keys y sin servicios externos.
- Respuestas basadas únicamente en los servicios publicados en la propia página. Si falta un dato (horarios, dirección, teléfono, precios o disponibilidad), lo dice explícitamente en lugar de inventarlo.
- Formulario de contacto: guarda la solicitud en `localStorage` del navegador y avisa con claridad de que **no se envía ningún correo**.
- Aislamiento de información: los temas financieros se rechazan en el chat público.

## Limitación de GitHub Pages

Pages sirve archivos estáticos: **no puede ejecutar el backend FastAPI**. El panel administrativo, las métricas del Excel y el asistente BI viven en el proyecto local `puerto-am-bi` y no se publican en este sitio. No se muestra ninguna cifra financiera en esta landing.

## Estructura

```
site/
├── index.html
└── assets/
    ├── css/landing.css
    └── js/
        ├── atencion.js   # motor de respuestas locales
        └── landing.js    # interacción de la página
```

## Ver en local

```bash
python3 -m http.server 8080 --directory site
# http://localhost:8080
```
