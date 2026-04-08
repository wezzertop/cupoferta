# 6. Guías de Desarrollo

## 6.1 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- pnpm (o npm/yarn)
- Cuenta de Supabase

### Configuración

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd cupoferta

# 2. Instalar dependencias
npm install
# o con pnpm: pnpm install

# 3. Crear archivo .env.local
cp .env.example .env.local

# 4. Editar .env.local con tus credenciales de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# 5. Iniciar servidor de desarrollo
npm run dev
```

### Credenciales Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Settings → API
4. Copiar URL y `anon` key

---

## 6.2 Estructura del Código

### Componentes

Los componentes siguen una estructura típica de React:

```tsx
'use client';

import { useState } from 'react';

export function MiComponente() {
  const [state, setState] = useState(false);
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Estado Global (Zustand)

Located at `lib/store.ts`:

```typescript
import { create } from 'zustand';

interface UIStore {
  // state
  isDarkMode: boolean;
  // actions
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isDarkMode: true,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
```

Usage:
```tsx
import { useUIStore } from '@/lib/store';

const { isDarkMode, toggleDarkMode } = useUIStore();
```

### Cliente Supabase

```typescript
// Browser client
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Uso
const { data } = await supabase.from('deals').select('*');
```

---

## 6.3 API Routes

### Endpoints de Admin

Located in `app/api/admin/`:

| Ruta | Método | Descripción |
| :--- | :--- | :--- |
| `/api/admin/moderation` | GET/POST/PATCH | Moderar deals |
| `/api/admin/reports` | GET/PATCH | Gestionar reportes |
| `/api/admin/users` | GET/PATCH | Gestionar usuarios |

### Ejemplo de Endpoint

```typescript
// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/ssr';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin');
  
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}
```

---

## 6.4 Estilos y Tailwind

### Clases Personalizadas

En `app/globals.css`:

```css
@layer utilities {
  .font-heading { font-family: var(--font-heading); }
  .font-body { font-family: var(--font-body); }
  .custom-scrollbar { ... }
  .btn-effect { @apply transition-all duration-200 active:scale-95; }
}
```

### Colores Custom

En `tailwind.config.ts`:

```typescript
colors: {
  accent: '#009ea8',
  accentLight: '#e0f2f1',
  accentDark: '#007b83',
}
```

---

## 6.5 Scripts Útiles

```bash
npm run dev      # Desarrollo (localhost:3000)
npm run build    # Build producción
npm run start    # Servidor producción
npm run lint     # Verificar código
```

---

## 6.6 Migraciones de Base de Datos

### Aplicar Schema

1. Ir a Supabase Dashboard → SQL Editor
2. Copiar contenido de `supabase/schema.sql`
3. Ejecutar

### Migraciones Posteriores

Cada fase tiene su propio archivo:
- `alter_schema_fase7.sql`
- `alter_schema_fase8.sql`
- `alter_schema_fase9_sync.sql`
- `alter_schema_fase10_notifications.sql`

---

## 6.7 Testing y Debug

### Modo Desarrollo
- Verificar variables de entorno
- Revisar consola del navegador
- Usar Supabase Dashboard para ver datos

### Errores Comunes

| Error | Solución |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` missing | Verificar .env.local |
| RLS policy denied | Revisar políticas en Supabase |
| Auth error | Verificar anon key |

---

*Relacionado: [[1-Stack-tecnologico]] | [[5-Funcionalidades]] | [[7-Roadmap]]*