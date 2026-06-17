Aquí tienes el `README.md` completamente actualizado, reflejando todos los cambios realizados en el proyecto: eliminación del rol warehouse, nuevas funcionalidades, estructura de archivos y características actualizadas.

---

## `README.md`

```markdown
# Control de Stock - Ferretería

Sistema de gestión de inventario para ferreterías con soporte multi-sucursal, control de movimientos, descuentos, clientes frecuentes, alertas de reposición, solicitudes entre sucursales y registro de compras a proveedores.

---

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
│   │   │   ├── AuthContext.tsx # Autenticación y sesión de usuario
│   │   │   └── UndoContext.tsx # Sistema global de deshacer/rehacer
│   │   ├── hooks/
│   │   │   ├── useTheme.ts     # Modo oscuro/claro
│   │   │   └── useUndoAction.ts # Lógica de historial de acciones
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx   # Resumen y KPIs
│   │   │   ├── Inventory.tsx   # Gestión de productos
│   │   │   ├── Movements.tsx   # Movimientos de stock (entradas/salidas)
│   │   │   ├── Restock.tsx     # Productos con stock bajo
│   │   │   ├── Purchases.tsx   # Historial de compras a proveedores (contador/admin)
│   │   │   ├── Requests.tsx    # Solicitudes de stock entre sucursales
│   │   │   ├── Offers.tsx      # Ofertas y descuentos (admin/contador)
│   │   │   └── Login.tsx       # Pantalla de inicio de sesión
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

---

## Tecnologías

- **React 18** — Framework de UI
- **TypeScript** — Tipado estático
- **React Router v7** — Navegación
- **Tailwind CSS v4** — Estilos utilitarios
- **shadcn/ui + Radix UI** — Componentes accesibles
- **Vite 6** — Build tool
- **Motion** — Animaciones
- **Recharts** — Gráficos (para futuras implementaciones)
- **Sonner** — Notificaciones toast
- **react-hook-form** — Manejo de formularios
- **next-themes** — Modo oscuro/claro
- **LocalStorage** — Persistencia de datos (para demo)

---

## Modelos de Datos

| Entidad | Descripción |
|---|---|
| `User` | Usuarios con rol `admin`, `employee` o `contador`. Asignados a una sucursal (o `"all"` para admin/contador). |
| `Product` | Productos con categoría, sucursal, precio, stock actual, stock mínimo y unidad de medida. |
| `Movement` | Entradas/salidas de stock con motivo, vendedor, cliente y descuento aplicado. |
| `Customer` | Clientes con seguimiento de compras y flag de cliente frecuente. |
| `Discount` | Descuentos por porcentaje o monto fijo, para todos o clientes frecuentes. |
| `StockRequest` | Solicitudes de stock entre sucursales (estado: pendiente/aprobada/rechazada). |
| `PurchaseOrder` | Pedidos a proveedores (estado: pendiente/entregado/cancelado). |

---

## Características

### 🔐 Autenticación y Roles
- Login con usuario y contraseña.
- **Roles disponibles**:
  - `admin`: acceso total a todas las funcionalidades.
  - `employee`: acceso restringido a su sucursal; puede crear productos (sin precio), registrar movimientos (excepto ventas sin precio), solicitar stock a otras sucursales y ver solicitudes recibidas.
  - `contador`: acceso a precios, ofertas, compras a proveedores; **no** puede crear productos ni registrar movimientos de stock.

### 📊 Dashboard
- Visión general del inventario.
- KPIs: total de productos, valor del inventario, movimientos del día.
- Alertas:
  - **Stock bajo** (visible para admin y empleados, oculto para contador).
  - **Productos sin precio** (visible para admin y contador).
  - **Solicitudes pendientes** (visible para admin y empleados).
- Filtrado automático por sucursal según el rol del usuario.

### 📦 Inventario
- CRUD completo de productos.
- Categorías predefinidas (herramientas, plomería, electricidad, etc.).
- Soporte para **5 sucursales** (Centro, Norte, Sur, Este, Oeste).
- **Unidad de medida** por producto (metros, kilos, unidades, etc.).
- Búsqueda y filtros por categoría, sucursal y nivel de stock.
- **Deshacer/Rehacer**: todas las acciones (crear, editar, eliminar) pueden revertirse con toast temporal o atajo de teclado (`Ctrl+Z` / `Ctrl+Y`).
- **Carga desde Excel** (interfaz de demostración; la lógica real se puede implementar a futuro).
- **Actualización masiva de precios** (solo admin y contador): permite subir o bajar precios en porcentaje.
- **Restricciones por rol**:
  - Empleados: crean productos con precio 0 (sin asignar). No pueden ver ni editar el campo precio.
  - Contadores: solo pueden editar el precio de productos existentes. No pueden crear ni eliminar productos.
  - Admin: control total.

### 📈 Movimientos
- Registro de entradas y salidas de stock.
- Motivos predefinidos por tipo de movimiento.
- **Ventas**: soporte para cliente, vendedor, descuentos y pago en efectivo con descuento adicional.
- **Detección automática de clientes frecuentes** (basada en número de compras) y aplicación de descuentos automáticos.
- **Restricción**: no se pueden vender productos sin precio definido (el sistema lo impide).
- Historial filtrable por tipo, fecha, sucursal y cliente.
- **Deshacer/Rehacer** para cada movimiento registrado.

### 🏷️ Ofertas y Descuentos
- Gestión de descuentos por porcentaje o monto fijo.
- Activación/desactivación por descuento.
- Aplicación a todos los clientes o solo a frecuentes.
- Visualización y gestión solo para admin y contador.

### ⚠️ A Reponer
- Listado de productos cuyo stock está por debajo del mínimo.
- Priorización por nivel de stock (crítico, urgente, atención, reponer).
- Filtro por sucursal.
- **Acciones disponibles**:
  - **Pedir a Proveedor**: registra una orden de compra automática (visible en el historial de compras).
  - **Solicitar a otra sucursal**: permite al empleado solicitar stock a otra sucursal que tenga disponibilidad. La solicitud queda pendiente para que el empleado de la otra sucursal la apruebe o rechace.
- Cálculo de cantidad sugerida a pedir y costo estimado.
- Resumen de reposición (total de unidades e inversión estimada).
- **Oculto para contadores** (redirigidos a la página de Compras).

### 📋 Solicitudes entre Sucursales (nuevo)
- **Página `/requests`**: visible para admin y empleados (no contadores).
- **Solicitudes recibidas**: listado de peticiones de otras sucursales pendientes de aprobación.
  - Botones **Aprobar** (traslada el stock automáticamente y actualiza inventarios) y **Rechazar**.
- **Historial**: solicitudes enviadas y recibidas con su estado.
- Notificaciones en el Dashboard para empleados cuando tienen solicitudes pendientes.

### 📊 Compras a Proveedores (nuevo)
- **Página `/purchases`**: visible para admin y contador (no empleados).
- Historial completo de pedidos realizados a proveedores.
- Información: fecha, producto, sucursal, cantidad, costo total, proveedor y estado.
- Las órdenes se generan automáticamente desde la página "A Reponer" al hacer clic en "Pedir a Proveedor".

### 🔍 Búsqueda Global
- Búsqueda rápida con atajo `⌘K` / `Ctrl+K`.
- Resultados de productos en tiempo real.

### 🎨 Modo Oscuro/Claro
- Soporte completo para ambos modos.
- Persistencia de preferencia en localStorage.
- Botón de cambio de tema disponible en el Login y en el Layout principal.

---

## Instalación y Ejecución

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Construir para producción
pnpm build
```

---

## Heurísticas de Nielsen Implementadas

1. **Visibilidad del estado del sistema** — Toasts para todas las acciones; barra de progreso en el toast de deshacer.
2. **Coincidencia con el mundo real** — Terminología en español del dominio ferretero.
3. **Control y libertad del usuario** — Confirmaciones antes de acciones destructivas + deshacer con `Ctrl+Z` y botones de deshacer/rehacer.
4. **Consistencia y estándares** — Componentes UI uniformes en todas las vistas.
5. **Prevención de errores** — Validación de formularios en tiempo real; bloqueo de ventas sin precio.
6. **Reconocimiento antes que recuerdo** — Información contextual siempre visible.
7. **Flexibilidad y eficiencia** — Búsqueda global `⌘K`; atajo `Ctrl+Z` para deshacer; actualización masiva de precios.
8. **Diseño estético y minimalista** — Interfaz limpia; toast de deshacer no intrusivo.
9. **Ayuda para recuperarse de errores** — Mensajes claros; diálogos informativos.
10. **Ayuda y documentación** — Tooltips y placeholders descriptivos.

---

## Licencia

Ver [ATTRIBUTIONS.md](./docs/ATTRIBUTIONS.md) para información sobre las licencias de las dependencias utilizadas.
```

---

Este README refleja todas las funcionalidades actuales del sistema, incluyendo los nuevos módulos de Solicitudes entre Sucursales, Compras a Proveedores, el campo de Unidad de Medida, la interfaz de carga Excel, las restricciones por rol y la eliminación de toda referencia al rol warehouse y al Depósito Central.
