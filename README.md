# Control de Stock - Ferretería

Sistema de gestión de inventario para ferreterías con soporte multi-sucursal, control de movimientos, descuentos, clientes frecuentes y alertas de reposición.

## Estructura del Proyecto

```
/
├── src/
│   ├── app/
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── figma/          # Componentes generados por Figma
│   │   │   ├── ui/             # Componentes shadcn/ui
│   │   │   ├── GlobalSearch.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── UndoToast.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx # Autenticación y sesión de usuario
│   │   ├── hooks/
│   │   │   ├── useTheme.ts
│   │   │   └── useUndoAction.ts
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Movements.tsx
│   │   │   ├── Offers.tsx
│   │   │   └── Restock.tsx
│   │   ├── types/
│   │   │   └── index.ts        # Interfaces y constantes globales
│   │   ├── utils/
│   │   │   └── storage.ts      # Capa de persistencia (localStorage)
│   │   ├── App.tsx
│   │   └── routes.tsx
│   └── styles/
│       ├── fonts.css
│       ├── globals.css
│       ├── index.css
│       ├── tailwind.css
│       └── theme.css
│
├── docs/
│   ├── Guidelines.md
│   └── ATTRIBUTIONS.md
│
├── design/
│   └── default_shadcn_theme.css
│
├── index.html
├── package.json
├── vite.config.ts
└── postcss.config.mjs
```

## Tecnologías

- **React 18** — Framework de UI
- **TypeScript** — Tipado estático
- **React Router v7** — Navegación
- **Tailwind CSS v4** — Estilos utilitarios
- **shadcn/ui + Radix UI** — Componentes accesibles
- **Vite 6** — Build tool
- **Motion** — Animaciones
- **Recharts** — Gráficos
- **Sonner** — Notificaciones toast
- **react-hook-form** — Manejo de formularios
- **next-themes** — Modo oscuro/claro
- **LocalStorage** — Persistencia de datos

## Modelos de Datos

| Entidad | Descripción |
|---|---|
| `User` | Usuarios con rol `admin` o `employee`, asignados a una sucursal |
| `Product` | Productos con categoría, sucursal, precio, stock actual y stock mínimo |
| `Movement` | Entradas/salidas de stock con motivo, vendedor, cliente y descuento aplicado |
| `Customer` | Clientes con seguimiento de compras y flag de cliente frecuente |
| `Discount` | Descuentos por porcentaje o monto fijo, para todos o clientes frecuentes |

## Características

### 🔐 Autenticación
- Login con usuario y contraseña
- Roles: **admin** (acceso total) y **empleado** (restringido a su sucursal)

### 📊 Dashboard
- Visión general del inventario
- KPIs: total de productos, valor del inventario, movimientos del día
- Productos con stock bajo
- Filtrado por sucursal según rol del usuario

### 📦 Inventario
- CRUD completo de productos
- Categorías predefinidas (herramientas, plomería, electricidad, etc.)
- Soporte para 6 sucursales
- Búsqueda y filtros por categoría, sucursal y nivel de stock
- **Deshacer**: crear, editar o eliminar puede revertirse con toast temporal o `Ctrl+Z`

### 📈 Movimientos
- Registro de entradas y salidas de stock
- Motivos predefinidos por tipo de movimiento
- Soporte para ventas con: cliente, vendedor, descuento aplicado
- Detección automática de clientes frecuentes
- Historial filtrable por tipo, fecha y sucursal
- **Deshacer**: cada registro puede revertirse en los segundos siguientes

### 🏷️ Ofertas y Descuentos
- Gestión de descuentos por porcentaje o monto fijo
- Activación/desactivación por descuento
- Aplicación a todos los clientes o solo a frecuentes
- Integración directa con el flujo de ventas en Movimientos

### ⚠️ A Reponer
- Listado de productos cuyo stock está por debajo del mínimo
- Priorización por nivel de stock
- Filtro por sucursal
- Cálculo de cantidad sugerida para reponer

### 🔍 Búsqueda Global
- Búsqueda rápida con atajo `⌘K` / `Ctrl+K`
- Resultados de productos y movimientos en tiempo real

## Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Construir para producción
pnpm build
```

## Heurísticas de Nielsen Implementadas

1. **Visibilidad del estado del sistema** — Toasts para todas las acciones; barra de progreso en el toast de deshacer
2. **Coincidencia con el mundo real** — Terminología en español del dominio ferretero
3. **Control y libertad del usuario** — Confirmaciones antes de acciones destructivas + deshacer con `Ctrl+Z`
4. **Consistencia y estándares** — Componentes UI uniformes en todas las vistas
5. **Prevención de errores** — Validación de formularios en tiempo real
6. **Reconocimiento antes que recuerdo** — Información contextual siempre visible
7. **Flexibilidad y eficiencia** — Búsqueda global `⌘K`; atajo `Ctrl+Z` para deshacer
8. **Diseño estético y minimalista** — Interfaz limpia; toast de deshacer no intrusivo
9. **Ayuda para recuperarse de errores** — Mensajes claros; el diálogo de eliminación informa que la acción puede deshacerse
10. **Ayuda y documentación** — Tooltips y placeholders descriptivos

## Modo Oscuro

Soporte completo para modo claro/oscuro con persistencia de preferencia vía `next-themes`.

## Licencia

Ver [ATTRIBUTIONS.md](./docs/ATTRIBUTIONS.md) para información sobre las licencias de las dependencias utilizadas.
