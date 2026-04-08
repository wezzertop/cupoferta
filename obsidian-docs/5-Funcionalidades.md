# 5. Funcionalidades del Sistema

## 5.1 Feed Principal (Home)

### Descripción
El corazón del sistema. Muestra las ofertas en un feed dinámico.

### Características
- **Vistas**: Grid (cuadrícula) y Lista - intercambiable por el usuario
- **Paginación**: Infinita (carga progresiva)
- **Ordenamiento**:
  - 🔥 **Hot**: Por temperatura (votos recientes)
  - 🆕 **New**: Más recientes primero
  - 💬 **Commented**: Más comentados
  - 🎟️ **Coupons**: Solo cupones

### Filtros
- Por categoría
- Por tienda
- Rango de precio

### Expiración
- Las ofertas se ocultan automáticamente al alcanzar `expires_at`
- Deals con fecha pasada se marcan como `expired`

---

## 5.2 NewDealWizard (Publicación)

### Descripción
Asistente de 4 pasos para publicar ofertas. Incluye un bot guía (**CholloBot**).

### Paso 1: URL + Imágenes
- Validación de URL (detecta dominio y genera preview)
- Upload de hasta 4 imágenes
- Procesamiento: cropping automático (1:1), fondo blanco si es necesario

### Paso 2: Detalles
- Título (required)
- Precio actual (required)
- Precio anterior (optional)
- Descripción con soporte Markdown:
  - Negritas (`**texto**`)
  - Listas
  - Enlaces

### Paso 3: Categorización
- Selección de tienda
- Selección de categoría
- Opción de solicitar nueva categoría/tienda

### Paso 4: Revisión + Envío
- Resumen de la oferta
- Envío a moderación (status: `pending`)

---

## 5.3 DealDrawer (Detalle de Oferta)

### Descripción
Panel lateral (drawer) que se abre al hacer click en una oferta.

### Modos
1. **Details**: Información completa, imágenes, precios
2. **Metrics**: Estadísticas (vistas, votos, comentarios)
3. **Votes**: Historial de votos de la comunidad
4. **Chat**: Sección de comentarios

### Acciones
- Votar (caliente/frío)
- Guardar (bookmark)
- Compartir
- Reportar
- Editar (si es autor)
- Eliminar (si es autor o admin)

---

## 5.4 Sistema de Auth

### Métodos
- Email + Contraseña
- Magic Link (supabase)

### Flujo
1. Usuario abre AuthModal
2. Selecciona login o signup
3. Ingresa email (signup: también username)
4. Confirma email o usa magic link
5. Se crea automáticamente `profile` vía trigger

---

## 5.5 Perfil de Usuario

### Modal de Perfil
- Avatar (upload a Storage)
- Username
- Bio
- Stats: ofertas publicadas, ofertas guardadas
- Ver ofertas propias o guardadas

### Settings (Ajustes)
- **Profile**: Editar avatar, username, bio
- **Notifications**: Configurar alertas
- **Appearance**: Toggle dark/light mode
- **Account**: Eliminar cuenta

---

## 5.6 Sistema de Moderación (Admin)

### Acceso
Solo usuarios con `profiles.role = 'admin'` pueden acceder.

### Dashboard (AdminModal)

#### Cola de Moderación
- Lista de ofertas con `status = 'pending'`
- Acciones: Aprobar, Rechazar, Solicitar cambios

#### Gestión de Reportes
- Ver denuncias de la comunidad
- Resolver o ignorar

#### Control de Usuarios
- Ver perfil de usuario
- Amonestar (enviar notificación)
- Banear (toggle `banned = true`)

#### Notificaciones de Sistema
- Envío manual de avisos de moderación

#### Logs
- Registro histórico de acciones administrativas

#### Integración Telegram
- Configurar canal para automáticamente publicar ofertas aprobadas

---

## 5.7 Búsqueda

### SearchModal
- Búsqueda por título, descripción, tienda, categoría
- Resultados en tiempo real
- Filtros adicionales

---

## 5.8 Sistema de Alertas (Notifications)

### Tipos
- `reply`: Respuesta a comentario
- `mention`: Mención en comentario
- `vote`: Voto en oferta propia
- `mod`: Aviso de moderación

### Comportamiento
- Badge en header
- Lista en AlertsModal
- Marcar como leído

---

## 5.9 Sistema de Reportes

### Flujo
1. Usuario hace click en "Reportar" (deal/comentario/usuario)
2. Abre ReportModal
3. Selecciona razón:
   - Spam
   - Precio incorrecto
   - Enlace roto
   - Contenido inapropiado
   - Otro
4. Envía reporte
5. Admin revisa en dashboard

---

*Relacionado: [[4-Base-de-datos]] | [[6-Guias-desarrollo]]*