# 4. Base de Datos (Supabase)

## Schema Principal

El proyecto usa PostgreSQL con **Row Level Security (RLS)** habilitado en todas las tablas.

---

## Tablas

### 1. profiles

Extiende `auth.users` con datos públicos del usuario.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | PK, referencia a auth.users |
| `username` | TEXT | Nombre único |
| `avatar_url` | TEXT | URL del avatar |
| `role` | TEXT | 'user' o 'admin' |
| `bio` | TEXT | Biografía del usuario |
| `banned` | BOOLEAN | Estado de baneo |
| `created_at` | TIMESTAMP | Fecha de creación |

### 2. deals

Contenido principal: ofertas/chollos.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `user_id` | UUID | FK a profiles |
| `title` | TEXT | Título de la oferta |
| `description` | TEXT | Descripción (Markdown) |
| `price` | NUMERIC | Precio actual |
| `old_price` | NUMERIC | Precio anterior |
| `store` | TEXT | Tienda |
| `category` | TEXT | Categoría |
| `image_url` | TEXT | Imagen principal |
| `images` | TEXT[] | Array de URLs (hasta 4) |
| `shipping_type` | TEXT | Tipo de envío |
| `views_count` | INTEGER | Vistas |
| `temp` | INTEGER | Temperatura (votos) |
| `comments_count` | INTEGER | Comentarios |
| `status` | TEXT | 'active', 'pending', 'expired', 'rejected' |
| `expires_at` | TIMESTAMP | Fecha de expiración |
| `created_at` | TIMESTAMP | Creación |

### 3. deal_votes

Votos de temperatura (+1 / -1) por usuario.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `user_id` | UUID | FK a profiles |
| `deal_id` | UUID | FK a deals |
| `vote_type` | INTEGER | 1 (caliente) o -1 (frío) |
| `created_at` | TIMESTAMP | Fecha |

**PK Compuesta**: `(user_id, deal_id)`

### 4. comments

Hilos de comentarios por oferta.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `deal_id` | UUID | FK a deals |
| `user_id` | UUID | FK a profiles |
| `parent_id` | UUID | FK a comments (respuestas) |
| `content` | TEXT | Texto del comentario |
| `created_at` | TIMESTAMP | Fecha |

### 5. saved_deals

Marcadores guardados por usuario.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `user_id` | UUID | FK a profiles |
| `deal_id` | UUID | FK a deals |
| `created_at` | TIMESTAMP | Fecha |

**PK Compuesta**: `(user_id, deal_id)`

### 6. reports

Denuncias de la comunidad.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `reporter_id` | UUID | FK a profiles |
| `target_id` | UUID | ID del objetivo |
| `target_type` | TEXT | 'deal', 'comment', 'user' |
| `reason` | TEXT | Razón de la denuncia |
| `status` | TEXT | 'pending', 'resolved', 'dismissed' |
| `created_at` | TIMESTAMP | Fecha |

### 7. notifications

Sistema de alertas.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `user_id` | UUID | FK a profiles |
| `type` | TEXT | 'reply', 'mention', 'vote', 'mod' |
| `title` | TEXT | Título |
| `message` | TEXT | Mensaje |
| `link` | TEXT | Enlace de acción |
| `read` | BOOLEAN | Leída o no |
| `created_at` | TIMESTAMP | Fecha |

---

## Triggers Automáticos

### update_deal_temperature()

Actualiza la temperatura del deal al insertar/actualizar/eliminar un voto.

```sql
UPDATE deals SET temp = temp + NEW.vote_type WHERE id = NEW.deal_id;
```

### update_deal_comments_count()

Actualiza el contador de comentarios automáticamente.

### create_profile_for_new_user()

Crea un registro en `profiles` al registrar un usuario en `auth.users`.

---

## Políticas RLS

### Deals

- **SELECT**: Todos pueden ver deals activos
- **INSERT**: Usuarios autenticados (no baneados)
- **UPDATE**: Solo el autor del deal

### Comments

- **SELECT**: Público
- **INSERT**: Usuarios autenticados
- **UPDATE/DELETE**: Solo el autor

### Profiles

- **SELECT**: Público
- **UPDATE**: Solo el propio usuario

---

## Integraciones

### Telegram Bot

El sistema puede enviar ofertas aprobadas a un canal de Telegram automáticamente (configurado en Admin).

### Storage

- **avatars/**: Avatares de usuario
- **deals/**: Imágenes de ofertas

---

*Relacionado: [[2-Arquitectura]] | [[5-Funcionalidades]]*