# 3. Sistema de Diseño

## Filosofía Visual

CupOferta adopta una estética **Premium Dark/Light** con:
- Transiciones suaves (200ms)
- Micro-interacciones
- Mode toggle fluido
- Diseño responsive-first

---

## Paleta de Colores

### Color de Marca (Accent)

| Nombre | Hex | Uso |
| :--- | :--- | :--- |
| **Primary** | `#009ea8` | Botones, links, focus states |
| **Light** | `#e0f2f1` | Backgrounds sutiles |
| **Dark** | `#007b83` | Hover states |

### Modo Claro (Light Mode)

| Variable | Hex | Elemento |
| :--- | :--- | :--- |
| `--background` | `#f8fafc` | Fondo página |
| `--foreground` | `#0f172a` | Texto principal |
| border | `#e2e8f0` | Bordes, divisores |

### Modo Oscuro (Dark Mode - Default)

| Variable | Hex | Elemento |
| :--- | :--- | :--- |
| `--background` | `#0a0a0a` | Fondo negro puro |
| Superficie | `#111111` | Cards, modals |
| `--foreground` | `#f8fafc` | Texto |
| border | `rgba(255,255,255,0.05)` | Bordes sutiles |

---

## Tipografía

### Fuentes

| Estilo | Fuente | Pesos | Uso |
| :--- | :--- | :--- | :--- |
| **Heading** | Plus Jakarta Sans | 700-900 | Títulos, Hero, Logo |
| **Body** | Inter | 400-600 | Descripciones, textos |
| **Numbers** | Plus Jakarta Sans | 800 | Precios, contadores |

### Implementación CSS

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap');

:root {
  --font-heading: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', sans-serif;
}

.font-heading { font-family: var(--font-heading); }
.font-body { font-family: var(--font-body); }
.font-numbers { font-family: var(--font-heading); font-variant-numeric: tabular-nums; }
```

---

## Componentes UI

### Botones

- **Primary**: Background `#009ea8`, texto blanco
- **Secondary**: Border `#009ea8`, texto `#009ea8`
- **Ghost**: Sin border, texto `#009ea8`
- **Estados**: `hover` (oscurecer 10%), `active` (scale 0.95)

### Cards (Ofertas)

- Border-radius: 12px
- Sombra sutil en light mode
- Fondo `#111111` en dark mode
- Transición al hover: escala 1.02

### Inputs

- Border-radius: 8px
- Border: 1px solid
- Focus: outline 2px `#009ea8`

---

## Utilidades CSS

### Scrollbars

```css
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { 
  background: rgba(0,158,168,0.3); 
  border-radius: 10px; 
}
```

### Safe Areas (Mobile)

```css
.pb-safe { padding-bottom: max(1rem, var(--safe-bottom)); }
.pt-safe { padding-top: max(0px, var(--safe-top)); }
```

### Animaciones

- `btn-effect`: `transition-all duration-200 active:scale-95`
- `banner-shimmer`: Animación de brillo para banners

---

*Relacionado: [[1-Stack-tecnologico]] | [[5-Funcionalidades]]*