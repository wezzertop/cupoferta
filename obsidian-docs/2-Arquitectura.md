# 2. Arquitectura del Proyecto

## Estructura de Carpetas

```
cupoferta/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Feed principal
│   ├── layout.tsx          # Layout raíz
│   ├── providers.tsx       # Providers de React
│   ├── globals.css         # Estilos globales
│   ├── about/              # Página "Sobre Nosotros"
│   ├── contacto/           # Página de contacto
│   ├── faq/                # Preguntas frecuentes
│   ├── guia/               # Guía de uso
│   ├── legal/              # Legal (T&C, Privacidad)
│   ├── reglas/             # Normas de la comunidad
│   ├── blog/               # Blog
│   └── api/                # API Routes (Admin)
│       └── admin/
│           ├── moderation/
│           ├── reports/
│           └── users/
├── components/             # Componentes React
│   ├── layout/             # Header, Sidebar, Footer, Modals
│   ├── deals/              # DealCard, DealDrawer, Wizard
│   ├── admin/              # AdminModal (dashboard)
│   ├── auth/               # AuthModal (login/signup)
│   └── modals/             # ReportModal, etc.
├── lib/                    # Lógica y utilidades
│   ├── store.ts            # Zustand store
│   ├── utils.ts            # Funciones helper
│   ├── avatars.ts          # Utilidades de avatares
│   └── supabase/           # Cliente Supabase
│       ├── client.ts       # Cliente navegador
│       └── server.ts       # Cliente servidor
├── supabase/               # Base de datos
│   ├── schema.sql          # Schema principal
│   ├── seed.sql            # Datos iniciales
│   └── *.sql               # Migraciones (fases)
├── public/                 # Assets estáticos
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Patrón de Componentes

Los componentes siguen un patrón atómico:
- **Layout**: Header, Sidebar, Footer, MobileNavbar
- **Deals**: DealCard, DealDrawer, NewDealWizard, CommentSection
- **Modals**: AuthModal, ProfileModal, SearchModal, SettingsModal

## Flujo de Datos

```
User Action → Zustand Store → Supabase Client → Database
                ↓
         UI Components (re-render)
```

## Servidor de Desarrollo

```bash
npm run dev      # Inicia en localhost:3000
npm run build    # Build de producción
npm run lint     # Verificar código
```

---

*Relacionado: [[1-Stack-tecnologico]] | [[4-Base-de-datos]]*