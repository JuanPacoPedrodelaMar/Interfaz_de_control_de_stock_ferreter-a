# Control de Stock - Ferretería

Sistema de gestión de inventario para ferreterías con gestión de stock, movimientos y alertas de reposición.

## Estructura del Proyecto

```
/
├── src/                # Código fuente de la aplicación
│   ├── app/           # Código principal de la aplicación
│   │   ├── components/ # Componentes React
│   │   ├── hooks/     # Custom hooks
│   │   ├── pages/     # Páginas de la aplicación
│   │   ├── types/     # Definiciones TypeScript
│   │   └── utils/     # Funciones utilitarias
│   └── styles/        # Estilos globales y temas
│
├── docs/              # Documentación del proyecto
│   ├── Guidelines.md  # Guías de desarrollo
│   └── ATTRIBUTIONS.md # Atribuciones
│
├── design/            # Archivos de diseño
│   └── default_shadcn_theme.css # Tema por defecto
│
└── node_modules/      # Dependencias (generado)
```

## Tecnologías

- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **React Router** - Navegación
- **Tailwind CSS v4** - Estilos
- **shadcn/ui** - Componentes de UI
- **Vite** - Build tool
- **LocalStorage** - Persistencia de datos

## Características

### 📊 Dashboard
- Visión general del inventario
- Estadísticas de stock
- Productos con stock bajo
- Valor total del inventario

### 📦 Inventario
- Gestión completa de productos
- Búsqueda y filtros avanzados
- Edición y eliminación de productos
- Alertas de stock bajo

### 📈 Movimientos
- Registro de entradas y salidas
- Historial de movimientos
- Validación de stock disponible
- Motivos predefinidos

### ⚠️ A Reponer
- Listado de productos con stock bajo
- Priorización por nivel de stock
- Cálculo de cantidad sugerida
- Acciones rápidas

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

El sistema implementa las 10 heurísticas de usabilidad de Nielsen:

1. **Visibilidad del estado del sistema** - Notificaciones toast para todas las acciones
2. **Coincidencia entre el sistema y el mundo real** - Terminología clara en español
3. **Control y libertad del usuario** - Confirmaciones antes de acciones destructivas
4. **Consistencia y estándares** - Componentes UI uniformes
5. **Prevención de errores** - Validación de formularios en tiempo real
6. **Reconocimiento antes que recuerdo** - Información contextual visible
7. **Flexibilidad y eficiencia** - Búsqueda global con atajo de teclado (⌘K)
8. **Diseño estético y minimalista** - Interfaz limpia y enfocada
9. **Ayuda para reconocer y recuperarse de errores** - Mensajes de error claros
10. **Ayuda y documentación** - Tooltips y placeholders descriptivos

## Modo Oscuro

El sistema incluye soporte completo para modo claro/oscuro con persistencia de preferencia.

## Licencia

Ver ATTRIBUTIONS.md para información sobre las licencias de las dependencias utilizadas.
