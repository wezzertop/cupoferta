# 1. Stack Tecnológico

## Visión General

CupOferta utiliza un stack moderno y optimizado para velocidad de desarrollo y rendimiento en producción.

## Tecnologías Principales

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | SSR, routing, optimización |
| **UI** | React 18 | Componentes interactivos |
| **Estilos** | Tailwind CSS 3.3 | Utilidades CSS, diseño responsivo |
| **Backend/DB** | Supabase | PostgreSQL, Auth, Storage, Realtime |
| **Estado** | Zustand 4.5 | Gestión de estado global |
| **Iconos** | Lucide React | Iconos vectoriales |

## Dependencias

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.3.0",
    "@supabase/supabase-js": "^2.42.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.368.0",
    "next": "14.2.1",
    "react": "^18",
    "react-dom": "^18",
    "tailwind-merge": "^2.2.2",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

## Herramientas de Desarrollo

- **TypeScript** - Tipado estático
- **ESLint** - Linting y calidad de código
- **PostCSS** - Procesamiento de CSS
- **pnpm** - Gestor de paquetes (workspace)

## Claves de Entorno Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

---

*Relacionado: [[2-Arquitectura]] | [[3-Sistema-de-diseno]]*