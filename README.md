# Ficticlo Ecommerce

¡Bienvenido a Ficticlo! Este proyecto es una plataforma ecommerce moderna, robusta y segura, desarrollada con Next.js, Express y TypeScript, lista para producción y escalabilidad en Azure.

---

## Tecnologías principales

- **Frontend:** Next.js 13+, React, TypeScript, CSS Modules
- **Backend:** Express.js, TypeScript
- **Base de datos:** Azure Cosmos DB
- **Almacenamiento de imágenes:** Azure Blob Storage
- **Autenticación:** JWT, bcrypt
- **Pagos:** Transbank Webpay Plus (modo integración)
- **Cloud:** Azure Functions, App Service
- **Validación y sanitización:** sanitize-html, express-validator
- **Rate limiting:** express-rate-limit
- **Control de acceso:** Roles (usuario/admin)

---

## Estructura del proyecto

```
api/
  src/
    app.ts                # Configuración principal del backend Express
    functions/            # Funciones serverless y utilidades
    lib/                  # Lógica de negocio: blob, cosmos, notificaciones, usuarios
    middleware/           # Middlewares de autenticación y seguridad
    routes/               # Rutas REST: login, usuarios, productos, pedidos, ofertas, notificaciones, webpay
    scripts/              # Scripts de mantenimiento y seed
    types/                # Tipos TypeScript compartidos
  webpay/                 # Integración con Transbank Webpay
app/
  globals.css             # Estilos globales
  layout.tsx              # Layout principal
  page.tsx                # Página principal
  admin/                  # Dashboard de administración
    AuthContext.tsx       # Contexto de autenticación admin
    layout.tsx            # Layout admin
    page.tsx              # Dashboard admin
    components/           # Paneles y utilidades admin
  checkout/               # Flujo de checkout
  login/                  # Modal y estilos de login
  offers/                 # Página de ofertas
  products/               # Listado y detalle de productos
  components/             # Componentes reutilizables (carrito, header, footer, etc)
  context/                # Contextos globales (auth, carrito)
  data/                   # Datos mock y utilidades
  models/                 # Modelos de datos
  public/                 # Archivos estáticos
  scripts/                # Scripts de mantenimiento
  types/                  # Tipos TypeScript
```

---

## ¿Cómo funciona la ecommerce?

### 1. Registro y creación de usuario
- Los usuarios pueden registrarse con email y contraseña.
- La contraseña se almacena de forma segura usando bcrypt.
- El sistema valida y sanitiza todos los datos de entrada.

### 2. Inicio de sesión y autenticación
- Login seguro con JWT.
- El usuario recibe un token que protege sus sesiones y rutas privadas.
- El contexto de autenticación gestiona el estado en frontend y backend.

### 3. Dashboard de administración
- Acceso exclusivo para administradores.
- Paneles para gestionar productos, categorías, ofertas, pedidos y notificaciones.
- Visualización de métricas, control de stock y alertas de bajo inventario.
- Creación, edición y eliminación de productos y ofertas.

### 4. Cambio de contraseña
- Los usuarios pueden cambiar su contraseña desde el perfil.
- Validación estricta y actualización segura en la base de datos.

### 5. Subida de imágenes
- Los administradores pueden subir imágenes de productos.
- Las imágenes se almacenan en Azure Blob Storage.
- El sistema valida el tipo y tamaño de archivo.

### 6. Navegación y compra
- Los usuarios exploran productos por categorías y ofertas.
- Pueden ver detalles, agregar al carrito y modificar cantidades.
- El checkout se realiza mediante Webpay Plus, con confirmación y notificaciones.

### 7. Notificaciones y ofertas
- El sistema envía notificaciones relevantes a los usuarios (ofertas, estado de pedidos, alertas de stock).
- Los administradores pueden crear y gestionar ofertas especiales.

### 8. Seguridad avanzada
- Todas las rutas sensibles están protegidas por autenticación y autorización.
- Rate limiting para evitar abusos.
- Sanitización y validación en frontend y backend.
- Claves y secretos protegidos en archivos `.env` y excluidos por `.gitignore`.

---

## Carpetas y archivos clave

- **api/src/routes/**: Rutas RESTful para login, usuarios, productos, pedidos, ofertas, notificaciones, webpay.
- **api/src/middleware/**: Middlewares de autenticación, autorización y sanitización.
- **api/src/lib/**: Lógica de negocio y conexión con Azure.
- **api/webpay/**: Integración con Transbank Webpay Plus.
- **app/admin/**: Dashboard de administración y paneles.
- **app/components/**: Componentes reutilizables (carrito, header, footer, modales, etc).
- **app/context/**: Contextos globales de autenticación y carrito.
- **app/products/**: Listado y detalle de productos.
- **app/checkout/**: Flujo de compra y confirmación.
- **app/login/**: Modal y estilos de login.
- **app/offers/**: Página de ofertas.
- **app/scripts/**: Scripts de mantenimiento y utilidades.
- **app/types/**: Tipos TypeScript compartidos.

---

## Instalación y despliegue

1. Clona el repositorio:
   ```sh
   git clone https://github.com/EmanuelKanji/ficticlo-ecommerce.git
   ```
2. Instala dependencias en frontend y backend:
   ```sh
   cd Ficticlo-Next.js-Typescript
   npm install
   cd api
   npm install
   ```
3. Configura los archivos `.env` en `api/` y `app/` con tus claves y endpoints.
4. Ejecuta el backend:
   ```sh
   cd api
   npm run build
   npm start
   ```
5. Ejecuta el frontend:
   ```sh
   cd app
   npm run build
   npm start
   ```
6. Accede a la app en `http://localhost:3000`

---

## Licencia

MIT

---

## Autor

Emanuel Kanji

---

## Contribuciones

¡Las contribuciones son bienvenidas! Abre un issue o pull request para sugerir mejoras, reportar bugs o agregar nuevas funcionalidades.

---

## Contacto

Para dudas, soporte o propuestas: [emanuelkanji@gmail.com](mailto:emanuelkanji@gmail.com)
