# PROJECT DUMP — Control de Stock Ferretería

Generado: 2026-06-01

## Árbol de Archivos

```
src/README.md
src/app/App.tsx
src/app/components/GlobalSearch.tsx
src/app/components/Layout.tsx
src/app/components/UndoToast.tsx
src/app/components/figma/ImageWithFallback.tsx
src/app/components/ui/accordion.tsx
src/app/components/ui/alert-dialog.tsx
src/app/components/ui/alert.tsx
src/app/components/ui/aspect-ratio.tsx
src/app/components/ui/avatar.tsx
src/app/components/ui/badge.tsx
src/app/components/ui/breadcrumb.tsx
src/app/components/ui/button.tsx
src/app/components/ui/calendar.tsx
src/app/components/ui/card.tsx
src/app/components/ui/carousel.tsx
src/app/components/ui/chart.tsx
src/app/components/ui/checkbox.tsx
src/app/components/ui/collapsible.tsx
src/app/components/ui/command.tsx
src/app/components/ui/context-menu.tsx
src/app/components/ui/dialog.tsx
src/app/components/ui/drawer.tsx
src/app/components/ui/dropdown-menu.tsx
src/app/components/ui/form.tsx
src/app/components/ui/hover-card.tsx
src/app/components/ui/input-otp.tsx
src/app/components/ui/input.tsx
src/app/components/ui/label.tsx
src/app/components/ui/menubar.tsx
src/app/components/ui/navigation-menu.tsx
src/app/components/ui/pagination.tsx
src/app/components/ui/popover.tsx
src/app/components/ui/progress.tsx
src/app/components/ui/radio-group.tsx
src/app/components/ui/resizable.tsx
src/app/components/ui/scroll-area.tsx
src/app/components/ui/select.tsx
src/app/components/ui/separator.tsx
src/app/components/ui/sheet.tsx
src/app/components/ui/sidebar.tsx
src/app/components/ui/skeleton.tsx
src/app/components/ui/slider.tsx
src/app/components/ui/sonner.tsx
src/app/components/ui/switch.tsx
src/app/components/ui/table.tsx
src/app/components/ui/tabs.tsx
src/app/components/ui/textarea.tsx
src/app/components/ui/toggle-group.tsx
src/app/components/ui/toggle.tsx
src/app/components/ui/tooltip.tsx
src/app/components/ui/use-mobile.ts
src/app/components/ui/utils.ts
src/app/contexts/AuthContext.tsx
src/app/hooks/useTheme.ts
src/app/hooks/useUndoAction.ts
src/app/pages/Dashboard.tsx
src/app/pages/Inventory.tsx
src/app/pages/Login.tsx
src/app/pages/Movements.tsx
src/app/pages/Offers.tsx
src/app/pages/Restock.tsx
src/app/routes.tsx
src/app/types/index.ts
src/app/utils/storage.ts
src/main.tsx
src/styles/fonts.css
src/styles/globals.css
src/styles/index.css
src/styles/tailwind.css
src/styles/theme.css
```

---

## `src/README.md`

```md
# Source Code

This folder contains all application source code.

## Structure

```
src/
├── app/                      # Main application code
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components (shadcn/ui)
│   │   ├── figma/           # Figma-specific components
│   │   ├── GlobalSearch.tsx # Global search component
│   │   └── Layout.tsx       # Main layout component
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Dashboard page
│   │   ├── Inventory.tsx    # Inventory management page
│   │   ├── Movements.tsx    # Stock movements page
│   │   └── Restock.tsx      # Restock alerts page
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Root application component
│   └── routes.tsx           # Application routing
└── styles/                  # Global styles and themes
    ├── fonts.css            # Font imports
    ├── index.css            # Main stylesheet
    └── theme.css            # Theme variables and customizations
```

## Key Directories

### `/app/components/ui`
Reusable UI components from shadcn/ui. These are customizable components built on top of Radix UI primitives.

### `/app/pages`
Main page components for different sections of the application:
- Dashboard: Overview and statistics
- Inventory: Product management
- Movements: Stock entry/exit tracking
- Restock: Low stock alerts

### `/app/hooks`
Custom React hooks for shared functionality (e.g., theme management).

### `/app/utils`
Utility functions and helpers (e.g., localStorage management).

### `/styles`
Global styles, theme configurations, and font imports.

```

---

## `src/app/App.tsx`

```tsx
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

```

---

## `src/app/components/GlobalSearch.tsx`

```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Product } from "../types";
import { storage } from "../utils/storage";
import { Search, Package } from "lucide-react";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setProducts(storage.getProducts());
    }
  }, [isOpen]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.branch && product.branch.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectProduct = () => {
    setIsOpen(false);
    setSearchTerm("");
    navigate("/inventory");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="relative w-64 justify-start text-sm text-muted-foreground"
      >
        <Search className="h-4 w-4 mr-2" />
        Buscar productos...
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Buscar Productos</DialogTitle>
            <DialogDescription>
              Busca productos por nombre, categoría o sucursal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, categoría o sucursal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {searchTerm === "" ? (
                <div className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Escribe para buscar productos
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No se encontraron productos
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => {
                    const isLowStock = product.currentStock <= product.minStock;
                    return (
                      <button
                        key={product.id}
                        onClick={handleSelectProduct}
                        className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">
                                {product.name}
                              </p>
                              {isLowStock && (
                                <span className="text-xs bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                  Stock bajo
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {product.category} • {product.branch || "Sin sucursal"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              ${product.price.toLocaleString("es-AR")}
                            </p>
                            <p
                              className={`text-sm ${
                                isLowStock
                                  ? "text-amber-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Stock: {product.currentStock}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

```

---

## `src/app/components/Layout.tsx`

```tsx
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  Package,
  LayoutDashboard,
  ArrowLeftRight,
  AlertTriangle,
  Moon,
  Sun,
  LogOut,
  Tag,
  ChevronDown,
  User,
  Building2,
} from "lucide-react";
import { cn } from "./ui/utils";
import { useTheme } from "../hooks/useTheme";
import { Button } from "./ui/button";
import { GlobalSearch } from "./GlobalSearch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "./ui/badge";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada correctamente");
    navigate("/login", { replace: true });
  };

  const navigation = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Inventario", path: "/inventory", icon: Package },
    { name: "Movimientos", path: "/movements", icon: ArrowLeftRight },
    { name: "A Reponer", path: "/restock", icon: AlertTriangle },
    ...(isAdmin
      ? [{ name: "Ofertas", path: "/offers", icon: Tag }]
      : []),
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Package className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-semibold text-foreground hidden lg:block">
                  Control de Stock - Ferretería
                </h1>
                <h1 className="text-xl font-semibold text-foreground lg:hidden">
                  Ferretería
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <GlobalSearch />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="rounded-full"
                      aria-label={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
                    >
                      {theme === "dark" ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cambiar a modo {theme === "dark" ? "claro" : "oscuro"}</p>
                  </TooltipContent>
                </Tooltip>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 max-w-[200px]">
                      <div className="bg-primary rounded-full p-1 flex-shrink-0">
                        <User className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span className="hidden sm:block truncate text-sm">
                        {currentUser?.fullName}
                      </span>
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>
                      <div className="space-y-1">
                        <p className="font-semibold">{currentUser?.fullName}</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              currentUser?.role === "admin"
                                ? "text-primary border-primary/40"
                                : "text-muted-foreground"
                            }
                          >
                            {currentUser?.role === "admin" ? "Administrador" : "Empleado"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Building2 className="h-3 w-3" />
                          {currentUser?.branch === "all"
                            ? "Todas las sucursales"
                            : currentUser?.branch}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav
          className="bg-card border-b border-border overflow-x-auto"
          aria-label="Navegación principal"
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {navigation.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors whitespace-nowrap",
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
}

```

---

## `src/app/components/UndoToast.tsx`

```tsx
import { useEffect, useRef, useState } from "react";
import { X, RotateCcw } from "lucide-react";
import { UNDO_DURATION } from "../hooks/useUndoAction";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

/**
 * Toast de deshacer no intrusivo — aparece en la esquina inferior izquierda
 * para no interferir con las notificaciones Sonner del lado superior derecho.
 *
 * Incluye:
 * - Mensaje descriptivo de la acción realizada
 * - Botón "Deshacer" para revertir la acción
 * - Botón "×" para cerrar rápidamente
 * - Barra de progreso que muestra el tiempo restante
 * - Soporte de teclado: Ctrl+Z / Cmd+Z
 *
 * Heurísticas de Nielsen que mejora:
 * H1 – Visibilidad del estado: la barra de progreso muestra el tiempo restante
 * H3 – Control y libertad: permite deshacer cualquier acción destructiva o de mutación
 * H7 – Flexibilidad: atajo de teclado Ctrl+Z para usuarios avanzados
 */
export function UndoToast({ message, onUndo, onDismiss }: UndoToastProps) {
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());
  const rafRef = useRef<number | null>(null);

  // Anima la barra de progreso usando requestAnimationFrame para suavidad
  useEffect(() => {
    startRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / UNDO_DURATION) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Atajo de teclado: Ctrl+Z / Cmd+Z
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        onUndo();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onUndo]);

  return (
    <div
      className="fixed bottom-5 left-5 z-50 w-[300px] rounded-lg shadow-lg border border-border bg-card text-card-foreground overflow-hidden animate-in slide-in-from-bottom-3 fade-in duration-200"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <RotateCcw
          className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="text-sm flex-1 text-foreground leading-snug truncate">
          {message}
        </span>
        <button
          onClick={onUndo}
          className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline shrink-0 px-1.5 py-0.5 rounded hover:bg-primary/10 transition-colors"
          aria-label="Deshacer acción (Ctrl+Z)"
        >
          Deshacer
        </button>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* Barra de tiempo — H1: Visibilidad del estado del sistema */}
      <div className="h-[3px] bg-muted" aria-hidden="true">
        <div
          className="h-full bg-primary"
          style={{ width: `${progress}%`, transition: "none" }}
        />
      </div>
    </div>
  );
}
```

---

## `src/app/components/figma/ImageWithFallback.tsx`

```tsx
import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}

```

---

## `src/app/components/ui/accordion.tsx`

```tsx
"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "./utils";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

```

---

## `src/app/components/ui/alert-dialog.tsx`

```tsx
"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    data-slot="alert-dialog-overlay"
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
      className,
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      data-slot="alert-dialog-content"
      className={cn(
        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

```

---

## `src/app/components/ui/alert.tsx`

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };

```

---

## `src/app/components/ui/aspect-ratio.tsx`

```tsx
"use client";

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };

```

---

## `src/app/components/ui/avatar.tsx`

```tsx
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "./utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };

```

---

## `src/app/components/ui/badge.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

```

---

## `src/app/components/ui/breadcrumb.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "./utils";

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};

```

---

## `src/app/components/ui/button.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
```

---

## `src/app/components/ui/calendar.tsx`

```tsx
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };

```

---

## `src/app/components/ui/card.tsx`

```tsx
import * as React from "react";

import { cn } from "./utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};

```

---

## `src/app/components/ui/carousel.tsx`

```tsx
"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};

```

---

## `src/app/components/ui/chart.tsx`

```tsx
"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "./utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
  }) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload.fill || item.color;

          return (
            <div
              key={item.dataKey}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center",
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          },
                        )}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center",
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean;
    nameKey?: string;
  }) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value}
            className={cn(
              "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3",
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};

```

---

## `src/app/components/ui/checkbox.tsx`

```tsx
"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "./utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };

```

---

## `src/app/components/ui/collapsible.tsx`

```tsx
"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

```

---

## `src/app/components/ui/command.tsx`

```tsx
"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";

import { cn } from "./utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};

```

---

## `src/app/components/ui/context-menu.tsx`

```tsx
"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "./utils";

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};

```

---

## `src/app/components/ui/dialog.tsx`

```tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "./utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal data-slot="dialog-portal">
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      data-slot="dialog-content"
      className={cn(
        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close asChild>
        <button
          type="button"
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </button>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};

```

---

## `src/app/components/ui/drawer.tsx`

```tsx
"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "./utils";

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className,
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};

```

---

## `src/app/components/ui/dropdown-menu.tsx`

```tsx
"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "./utils";

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

```

---

## `src/app/components/ui/form.tsx`

```tsx
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "./utils";
import { Label } from "./label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};

```

---

## `src/app/components/ui/hover-card.tsx`

```tsx
"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "./utils";

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };

```

---

## `src/app/components/ui/input-otp.tsx`

```tsx
"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";

import { cn } from "./utils";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm bg-input-background transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

```

---

## `src/app/components/ui/input.tsx`

```tsx
import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

```

---

## `src/app/components/ui/label.tsx`

```tsx
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "./utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };

```

---

## `src/app/components/ui/menubar.tsx`

```tsx
"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "./utils";

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  );
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </MenubarPortal>
  );
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
  );
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};

```

---

## `src/app/components/ui/navigation-menu.tsx`

```tsx
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "./utils";

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 isolate z-50 flex justify-center",
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};

```

---

## `src/app/components/ui/pagination.tsx`

```tsx
import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "./utils";
import { Button, buttonVariants } from "./button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};

```

---

## `src/app/components/ui/popover.tsx`

```tsx
"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "./utils";

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };

```

---

## `src/app/components/ui/progress.tsx`

```tsx
"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "./utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };

```

---

## `src/app/components/ui/radio-group.tsx`

```tsx
"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";

import { cn } from "./utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };

```

---

## `src/app/components/ui/resizable.tsx`

```tsx
"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "./utils";

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

```

---

## `src/app/components/ui/scroll-area.tsx`

```tsx
"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "./utils";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };

```

---

## `src/app/components/ui/select.tsx`

```tsx
"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";

import { cn } from "./utils";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

```

---

## `src/app/components/ui/separator.tsx`

```tsx
"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "./utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };

```

---

## `src/app/components/ui/sheet.tsx`

```tsx
"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "./utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

```

---

## `src/app/components/ui/sidebar.tsx`

```tsx
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";

import { useIsMobile } from "./use-mobile";
import { cn } from "./utils";
import { Button } from "./button";
import { Input } from "./input";
import { Separator } from "./separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { Skeleton } from "./skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean;
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};

```

---

## `src/app/components/ui/skeleton.tsx`

```tsx
import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };

```

---

## `src/app/components/ui/slider.tsx`

```tsx
"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "./utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };

```

---

## `src/app/components/ui/sonner.tsx`

```tsx
"use client";

import { useTheme } from "../../hooks/useTheme";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      style={
        {
          "--normal-bg":      "var(--card)",
          "--normal-text":    "var(--card-foreground)",
          "--normal-border":  "var(--border)",

          "--success-bg":     "var(--card)",
          "--success-text":   "var(--card-foreground)",
          "--success-border": "var(--border)",

          "--error-bg":       "var(--card)",
          "--error-text":     "var(--card-foreground)",
          "--error-border":   "var(--border)",

          "--warning-bg":     "var(--card)",
          "--warning-text":   "var(--card-foreground)",
          "--warning-border": "var(--border)",

          "--info-bg":        "var(--card)",
          "--info-text":      "var(--card-foreground)",
          "--info-border":    "var(--border)",

          "--border-radius":  "var(--radius)",
          "--width":          "300px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
```

---

## `src/app/components/ui/switch.tsx`

```tsx
"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-background focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-card dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

```

---

## `src/app/components/ui/table.tsx`

```tsx
"use client";

import * as React from "react";

import { cn } from "./utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

```

---

## `src/app/components/ui/tabs.tsx`

```tsx
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-card dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

```

---

## `src/app/components/ui/textarea.tsx`

```tsx
import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

```

---

## `src/app/components/ui/toggle-group.tsx`

```tsx
"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "./utils";
import { toggleVariants } from "./toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
});

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };

```

---

## `src/app/components/ui/toggle.tsx`

```tsx
"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };

```

---

## `src/app/components/ui/tooltip.tsx`

```tsx
"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "./utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

```

---

## `src/app/components/ui/use-mobile.ts`

```ts
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

```

---

## `src/app/components/ui/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

---

## `src/app/contexts/AuthContext.tsx`

```tsx
import React, { createContext, useContext, useState } from "react";
import { User } from "../types";
import { storage } from "../utils/storage";

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return storage.getCurrentUser();
  });

  const login = (username: string, password: string): boolean => {
    const users = storage.getUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      storage.setCurrentUser(user);
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    storage.clearSession();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

```

---

## `src/app/hooks/useTheme.ts`

```ts
import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      return stored;
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
}

```

---

## `src/app/hooks/useUndoAction.ts`

```ts
import { useCallback, useRef, useState } from "react";

/** Duración del toast de deshacer en milisegundos */
export const UNDO_DURATION = 5000;

export interface UndoConfig {
  message: string;
  onUndo: () => void;
}

/**
 * Hook para gestionar la acción de deshacer (undo) con toast temporal.
 *
 * Retorna:
 * - `undoConfig`: configuración actual del toast (null si no hay acción pendiente)
 * - `showUndo(config)`: muestra el toast con la acción a deshacer
 * - `dismiss()`: cierra el toast sin ejecutar undo
 * - `executeUndo()`: ejecuta el undo y cierra el toast
 */
export function useUndoAction() {
  const [undoConfig, setUndoConfig] = useState<UndoConfig | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showUndo = useCallback(
    (config: UndoConfig) => {
      clearTimer();
      setUndoConfig(config);
      timerRef.current = setTimeout(() => {
        setUndoConfig(null);
      }, UNDO_DURATION);
    },
    [clearTimer]
  );

  const dismiss = useCallback(() => {
    clearTimer();
    setUndoConfig(null);
  }, [clearTimer]);

  const executeUndo = useCallback(() => {
    clearTimer();
    setUndoConfig((prev) => {
      prev?.onUndo();
      return null;
    });
  }, [clearTimer]);

  return { undoConfig, showUndo, dismiss, executeUndo };
}

```

---

## `src/app/pages/Dashboard.tsx`

```tsx
import { useEffect, useState } from "react";
import { Product, Movement } from "../types";
import { storage } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AlertTriangle, Package, TrendingUp, TrendingDown, Building2 } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Link } from "react-router";

export function Dashboard() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  const isEmployee = currentUser?.role === "employee";
  const userBranch = currentUser?.branch;

  useEffect(() => {
    setProducts(storage.getProducts());
    setMovements(storage.getMovements());
  }, []);

  // Los empleados solo ven los datos de su sucursal
  const visibleProducts =
    isEmployee && userBranch
      ? products.filter((p) => p.branch === userBranch)
      : products;

  const visibleMovements =
    isEmployee && userBranch
      ? movements.filter(
          (m) => m.productBranch === userBranch || m.sellerBranch === userBranch
        )
      : movements;

  const lowStockProducts = visibleProducts.filter(
    (p) => p.currentStock <= p.minStock
  );
  const totalValue = visibleProducts.reduce(
    (sum, p) => sum + p.price * p.currentStock,
    0
  );

  const today = new Date().toISOString().split("T")[0];
  const todayMovements = visibleMovements.filter((m) => m.date === today);
  const todayEntries = todayMovements.filter((m) => m.type === "entry").length;
  const todayExits = todayMovements.filter((m) => m.type === "exit").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1 flex items-center gap-2">
          {isEmployee && userBranch ? (
            <>
              <Building2 className="h-4 w-4" />
              Resumen de inventario — {userBranch}
            </>
          ) : (
            "Resumen general del inventario"
          )}
        </p>
      </div>

      {/* Alerta stock bajo - en amber, diferente al naranja principal */}
      {lowStockProducts.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-400 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            <strong>{lowStockProducts.length} producto(s)</strong> están por debajo del stock
            mínimo{isEmployee && userBranch ? ` en ${userBranch}` : ""}.{" "}
            <Link
              to="/restock"
              className="underline font-medium hover:text-amber-900 dark:hover:text-amber-200"
            >
              Ver productos a reponer
            </Link>
          </AlertDescription>
        </div>
      )}

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/inventory">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{visibleProducts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {isEmployee ? "En tu sucursal" : "Registros de inventario"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/restock">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-amber-600 dark:text-amber-500">
                {lowStockProducts.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Requieren reposición</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/movements?filter=entry">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas Hoy</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-blue-600">{todayEntries}</div>
              <p className="text-xs text-muted-foreground mt-1">Movimientos de entrada</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/movements?filter=exit">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salidas Hoy</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-green-600">{todayExits}</div>
              <p className="text-xs text-muted-foreground mt-1">Movimientos de salida</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Valor total del inventario */}
      <Card>
        <CardHeader>
          <CardTitle>
            Valor Total del Inventario
            {isEmployee && userBranch && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                — {userBranch}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-primary">
            ${totalValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Basado en {visibleProducts.length} producto(s) y su stock actual
          </p>
        </CardContent>
      </Card>

      {/* Movimientos recientes */}
      {visibleMovements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Movimientos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visibleMovements.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    {m.type === "entry" ? (
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    )}
                    <span className="font-medium">{m.productName}</span>
                    <span className="text-muted-foreground">{m.reason}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        m.type === "entry" ? "text-blue-600" : "text-green-600"
                      }
                    >
                      {m.type === "entry" ? "+" : "-"}
                      {m.quantity}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(m.date + "T12:00:00").toLocaleDateString("es-AR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/movements"
              className="text-sm text-primary hover:underline mt-4 inline-block"
            >
              Ver todos los movimientos →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## `src/app/pages/Inventory.tsx`

```tsx
import { useEffect, useState, useRef } from "react";
import { Product, CATEGORIES, BRANCHES } from "../types";
import { storage } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { useUndoAction } from "../hooks/useUndoAction";
import { UndoToast } from "../components/UndoToast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Building2,
  Copy,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";

export function Inventory() {
  const { currentUser } = useAuth();
  const isEmployee = currentUser?.role === "employee";
  const userBranch = currentUser?.branch;

  const { undoConfig, showUndo, dismiss, executeUndo } = useUndoAction();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  // Empleados comienzan con su sucursal; admin comienza con "all"
  const [branchFilter, setBranchFilter] = useState<string>(
    isEmployee && userBranch ? userBranch : "all"
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [showBranchCopy, setShowBranchCopy] = useState(false);
  const nameInputRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    branch: isEmployee && userBranch ? userBranch : "",
    price: "",
    currentStock: "",
    minStock: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    category: "",
    branch: "",
    price: "",
    currentStock: "",
    minStock: "",
  });

  useEffect(() => {
    setProducts(storage.getProducts());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nameInputRef.current && !nameInputRef.current.contains(event.target as Node)) {
        setSimilarProducts([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Los empleados solo ven los productos de su sucursal
  const visibleProducts = isEmployee && userBranch
    ? products.filter((p) => p.branch === userBranch)
    : products;

  const filteredProducts = visibleProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.branch && product.branch.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesBranch = branchFilter === "all" || product.branch === branchFilter;
    return matchesSearch && matchesCategory && matchesBranch;
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        branch: product.branch || "",
        price: product.price.toString(),
        currentStock: product.currentStock.toString(),
        minStock: product.minStock.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category: "",
        // Los empleados siempre crean productos en su propia sucursal
        branch: isEmployee && userBranch ? userBranch : "",
        price: "",
        currentStock: "",
        minStock: "",
      });
    }
    setFormErrors({ name: "", category: "", branch: "", price: "", currentStock: "", minStock: "" });
    setSimilarProducts([]);
    setShowBranchCopy(false);
    setIsDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    if (!editingProduct && name.trim().length >= 2) {
      const similar = products.filter((p) =>
        p.name.toLowerCase().includes(name.toLowerCase())
      );
      setSimilarProducts(similar);
      setShowBranchCopy(similar.length > 0);
    } else {
      setSimilarProducts([]);
      setShowBranchCopy(false);
    }
  };

  // Copiar configuración de un producto existente para agregar a otra sucursal
  const handleCopyToNewBranch = (product: Product) => {
    setSimilarProducts([]);
    setShowBranchCopy(false);
    setEditingProduct(null);
    setFormData({
      name: product.name,
      category: product.category,
      // Empleados solo pueden copiar a su propia sucursal
      branch: isEmployee && userBranch ? userBranch : "",
      price: product.price.toString(),
      currentStock: "0",
      minStock: product.minStock.toString(),
    });
    toast.info(`Configuración copiada de "${product.name}". Selecciona la nueva sucursal y ajusta el stock.`);
  };

  const handleSelectExistingProduct = (product: Product) => {
    setSimilarProducts([]);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      branch: product.branch || "",
      price: product.price.toString(),
      currentStock: product.currentStock.toString(),
      minStock: product.minStock.toString(),
    });
    toast.info(`Editando producto existente: "${product.name}" en ${product.branch}`);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setSimilarProducts([]);
    setShowBranchCopy(false);
    setFormData({
      name: "",
      category: "",
      branch: isEmployee && userBranch ? userBranch : "",
      price: "",
      currentStock: "",
      minStock: "",
    });
    setFormErrors({ name: "", category: "", branch: "", price: "", currentStock: "", minStock: "" });
  };

  const validateForm = () => {
    const errors = { name: "", category: "", branch: "", price: "", currentStock: "", minStock: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "El nombre del producto es obligatorio";
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      errors.name = "El nombre debe tener al menos 3 caracteres";
      isValid = false;
    }

    if (!formData.category) {
      errors.category = "Debes seleccionar una categoría";
      isValid = false;
    }

    if (!formData.branch) {
      errors.branch = "Debes seleccionar una sucursal";
      isValid = false;
    }

    // Si es nuevo producto, verificar que no exista ya en esa sucursal
    if (!editingProduct && formData.branch) {
      const duplicate = products.find(
        (p) =>
          p.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          p.branch === formData.branch
      );
      if (duplicate) {
        errors.branch = `Este producto ya existe en "${formData.branch}". Usa editar para modificarlo.`;
        isValid = false;
      }
    }

    if (!formData.price) {
      errors.price = "El precio es obligatorio";
      isValid = false;
    } else if (parseFloat(formData.price) <= 0) {
      errors.price = "El precio debe ser mayor a 0";
      isValid = false;
    }

    if (!formData.currentStock) {
      errors.currentStock = "El stock actual es obligatorio";
      isValid = false;
    } else if (parseInt(formData.currentStock) < 0) {
      errors.currentStock = "El stock no puede ser negativo";
      isValid = false;
    }

    if (!formData.minStock) {
      errors.minStock = "El stock mínimo es obligatorio";
      isValid = false;
    } else if (parseInt(formData.minStock) < 0) {
      errors.minStock = "El stock mínimo no puede ser negativo";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    const prevProducts = [...products];
    let updatedProducts: Product[];

    if (editingProduct) {
      updatedProducts = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: formData.name.trim(),
              category: formData.category,
              branch: formData.branch,
              price: parseFloat(formData.price),
              currentStock: parseInt(formData.currentStock),
              minStock: parseInt(formData.minStock),
            }
          : p
      );
      toast.success(`"${formData.name}" actualizado correctamente`);
      const productName = formData.name.trim();
      showUndo({
        message: `"${productName}" actualizado`,
        onUndo: () => {
          storage.saveProducts(prevProducts);
          setProducts(prevProducts);
          toast.info("Edición deshecha");
        },
      });
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        category: formData.category,
        branch: formData.branch,
        price: parseFloat(formData.price),
        currentStock: parseInt(formData.currentStock),
        minStock: parseInt(formData.minStock),
        createdAt: new Date().toISOString(),
      };
      updatedProducts = [...products, newProduct];
      toast.success(`"${formData.name}" agregado al inventario de ${formData.branch}`);
      const productName = formData.name.trim();
      showUndo({
        message: `"${productName}" creado en ${formData.branch}`,
        onUndo: () => {
          storage.saveProducts(prevProducts);
          setProducts(prevProducts);
          toast.info("Creación deshecha");
        },
      });
    }

    storage.saveProducts(updatedProducts);
    setProducts(updatedProducts);
    handleCloseDialog();
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    const prevProducts = [...products];
    const deletedName = productToDelete.name;
    const deletedBranch = productToDelete.branch;
    const updatedProducts = products.filter((p) => p.id !== productToDelete.id);
    storage.saveProducts(updatedProducts);
    setProducts(updatedProducts);
    toast.success(`"${deletedName}" eliminado del inventario`);
    setProductToDelete(null);
    showUndo({
      message: `"${deletedName}" eliminado de ${deletedBranch}`,
      onUndo: () => {
        storage.saveProducts(prevProducts);
        setProducts(prevProducts);
        toast.info("Eliminación deshecha");
      },
    });
  };

  // Agrupar productos por nombre para mostrar cuántas sucursales tiene
  const productNameCounts = products.reduce((acc, p) => {
    acc[p.name.toLowerCase()] = (acc[p.name.toLowerCase()] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Inventario</h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            {isEmployee && userBranch ? (
              <>
                <Building2 className="h-4 w-4" />
                {userBranch} — {visibleProducts.length} productos registrados
              </>
            ) : (
              <>
                Gestiona todos tus productos ({products.length} registros en{" "}
                {new Set(products.map((p) => p.branch)).size} sucursales)
              </>
            )}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className={`grid gap-4 ${isEmployee ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Buscar productos"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger aria-label="Filtrar por categoría">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* El filtro de sucursal solo aparece para el admin */}
            {!isEmployee && (
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger aria-label="Filtrar por sucursal">
                  <SelectValue placeholder="Filtrar por sucursal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las sucursales</SelectItem>
                  {BRANCHES.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {(searchTerm || categoryFilter !== "all" || (!isEmployee && branchFilter !== "all")) && (
            <p className="text-sm text-muted-foreground mt-3">
              Mostrando {filteredProducts.length} de {visibleProducts.length} registros
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lista de productos */}
      <div className="grid gap-4">
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {visibleProducts.length === 0
                  ? "No hay productos registrados. ¡Agrega tu primer producto usando el botón 'Nuevo Producto'!"
                  : "No se encontraron productos con los filtros aplicados."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => {
            const isLowStock = product.currentStock <= product.minStock;
            const branchCount = productNameCounts[product.name.toLowerCase()] || 1;
            return (
              <Card
                key={product.id}
                className={isLowStock ? "border-amber-400 dark:border-amber-700" : ""}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {isLowStock && (
                          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                        )}
                        {!isEmployee && branchCount > 1 && (
                          <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            <Building2 className="h-3 w-3" />
                            {branchCount} sucursales
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.category} •{" "}
                        <span className="font-medium text-foreground/80">
                          {product.branch || "Sin sucursal"}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(product)}
                        aria-label={`Editar ${product.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProductToDelete(product)}
                        aria-label={`Eliminar ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Precio</p>
                      <p className="text-lg font-semibold">
                        ${product.price.toLocaleString("es-AR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stock Actual</p>
                      <p
                        className={`text-lg font-semibold ${
                          isLowStock ? "text-amber-600 dark:text-amber-500" : ""
                        }`}
                      >
                        {product.currentStock} unidades
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stock Mínimo</p>
                      <p className="text-lg font-semibold">{product.minStock} unidades</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="text-lg font-semibold text-primary">
                        ${(product.price * product.currentStock).toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                  {isLowStock && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-md">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                        ⚠️ Stock bajo en {product.branch}: Este producto requiere reposición
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog crear/editar producto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Modifica los datos del producto. Un mismo producto puede tener stock independiente en cada sucursal."
                : isEmployee
                ? `Los productos se agregarán al inventario de ${userBranch}.`
                : "Completa los campos. El mismo producto puede existir en distintas sucursales con stock separado."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre del Producto <span className="text-destructive">*</span>
                </Label>
                <div className="relative" ref={nameInputRef}>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ingrese nombre del producto"
                    aria-required="true"
                    aria-invalid={!!formErrors.name}
                  />
                  {/* Panel de productos similares */}
                  {similarProducts.length > 0 && !editingProduct && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-[240px] overflow-y-auto">
                      <div className="p-2 border-b border-border bg-muted/50">
                        <p className="text-xs text-muted-foreground font-medium">
                          Este producto existe en otras sucursales — ¿qué deseas hacer?
                        </p>
                      </div>
                      {similarProducts.map((product) => (
                        <div
                          key={product.id}
                          className="p-3 border-b border-border last:border-b-0"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-foreground">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {product.branch} • Stock: {product.currentStock}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleCopyToNewBranch(product)}
                                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md transition-colors"
                                title="Agregar a nueva sucursal con esta configuración"
                              >
                                <Copy className="h-3 w-3" />
                                Nueva sucursal
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectExistingProduct(product)}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 px-2 py-1 rounded-md transition-colors"
                              >
                                <Edit className="h-3 w-3" />
                                Editar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Categoría <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-sm text-destructive">{formErrors.category}</p>
                )}
              </div>

              {/* Sucursal: bloqueada para empleados, editable para admin */}
              <div className="space-y-2">
                <Label htmlFor="branch">
                  Sucursal <span className="text-destructive">*</span>
                </Label>
                {isEmployee ? (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-muted/50 text-sm text-foreground">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{userBranch}</span>
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                ) : (
                  <Select
                    value={formData.branch}
                    onValueChange={(value) => setFormData({ ...formData, branch: value })}
                  >
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Selecciona una sucursal" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {formErrors.branch && (
                  <p className="text-sm text-destructive">{formErrors.branch}</p>
                )}
                {showBranchCopy && formData.branch && !editingProduct && (
                  <p className="text-xs text-muted-foreground">
                    Se creará un registro independiente para esta sucursal con su propio stock.
                  </p>
                )}
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Precio ($) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                  {formErrors.price && (
                    <p className="text-sm text-destructive">{formErrors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentStock">
                    Stock Actual <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="currentStock"
                    type="number"
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    placeholder="0"
                  />
                  {formErrors.currentStock && (
                    <p className="text-sm text-destructive">{formErrors.currentStock}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">
                  Stock Mínimo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  placeholder="0"
                />
                {formErrors.minStock && (
                  <p className="text-sm text-destructive">{formErrors.minStock}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Alerta cuando el stock sea igual o menor a este valor (por sucursal)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingProduct ? "Guardar Cambios" : "Crear Producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar "{productToDelete?.name}" de {productToDelete?.branch}.
              Tendrás unos segundos para deshacer la acción después de confirmar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Toast de deshacer — H3: Control y libertad del usuario */}
      {undoConfig && (
        <UndoToast
          message={undoConfig.message}
          onUndo={executeUndo}
          onDismiss={dismiss}
        />
      )}
    </div>
  );
}


```

---

## `src/app/pages/Login.tsx`

```tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Package, Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { toast } from "sonner";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Por favor ingresa tu usuario y contraseña");
      return;
    }

    setIsLoading(true);
    // Small delay to feel authentic
    await new Promise((r) => setTimeout(r, 500));

    const success = login(username.trim(), password);
    setIsLoading(false);

    if (success) {
      toast.success("Sesión iniciada correctamente");
      navigate("/", { replace: true });
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  const demoAccounts = [
    { label: "Administrador", username: "admin", password: "admin123", branch: "Todas las sucursales" },
    { label: "Empleado - Suc. Centro", username: "juanperez", password: "empleado123", branch: "Sucursal Centro" },
    { label: "Empleado - Suc. Norte", username: "mariagarcia", password: "empleado123", branch: "Sucursal Norte" },
    { label: "Empleado - Suc. Sur", username: "carloslopez", password: "empleado123", branch: "Sucursal Sur" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo y título */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-primary rounded-2xl p-4">
              <Package className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-foreground">Ferretería</h1>
          <p className="text-muted-foreground">Control de Stock</p>
        </div>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingresa tu usuario"
                    className="pl-10"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Cuentas demo */}
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Cuentas de demostración</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => {
                    setUsername(acc.username);
                    setPassword(acc.password);
                    setError("");
                  }}
                  className="w-full text-left p-3 rounded-md border border-border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{acc.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Usuario: <span className="font-mono">{acc.username}</span> · Pass:{" "}
                        <span className="font-mono">{acc.password}</span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">{acc.branch}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

```

---

## `src/app/pages/Movements.tsx`

```tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Product, Movement, MOVEMENT_REASONS, Discount, BRANCHES, Customer } from "../types";
import { storage, FREQUENT_CUSTOMER_THRESHOLD } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { useUndoAction } from "../hooks/useUndoAction";
import { UndoToast } from "../components/UndoToast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  X,
  Filter,
  User,
  Tag,
  ShoppingCart,
  Building2,
  BadgePercent,
  Lock,
  Star,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";

export function Movements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const isEmployee = currentUser?.role === "employee";
  const userBranch = currentUser?.branch;

  const { undoConfig, showUndo, dismiss, executeUndo } = useUndoAction();

  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Estado para auto-detección de cliente frecuente
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);

  // Filtros activos
  const filterType = searchParams.get("filter") as "entry" | "exit" | null;
  // Empleados comienzan con su sucursal filtrada; admin ve todo
  const [branchFilter, setBranchFilter] = useState<string>(
    isEmployee && userBranch ? userBranch : "all"
  );
  // Filtro por cliente (nombre parcial o completo)
  const [customerFilter, setCustomerFilter] = useState<string>("");

  const [formData, setFormData] = useState({
    productId: "",
    type: "" as "entry" | "exit" | "",
    quantity: "",
    reason: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    // Sale fields
    customerName: "",
    customerPhone: "",
    isFrequentCustomer: false,
    discountId: "",
  });

  const [formErrors, setFormErrors] = useState({
    productId: "",
    type: "",
    quantity: "",
    reason: "",
    description: "",
    date: "",
    customerName: "",
  });

  useEffect(() => {
    setProducts(storage.getProducts());
    setMovements(storage.getMovements());
    setDiscounts(storage.getDiscounts());
  }, []);

  const handleOpenDialog = () => {
    setFoundCustomer(null);
    setFormData({
      productId: "",
      type: "",
      quantity: "",
      reason: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      customerName: "",
      customerPhone: "",
      isFrequentCustomer: false,
      discountId: "",
    });
    setFormErrors({
      productId: "",
      type: "",
      quantity: "",
      reason: "",
      description: "",
      date: "",
      customerName: "",
    });
    setIsDialogOpen(true);
  };

  const selectedProduct = products.find((p) => p.id === formData.productId);
  const isSale = formData.type === "exit" && formData.reason === "Venta";
  const activeDiscounts = discounts.filter((d) => d.isActive);
  const selectedDiscount = discounts.find((d) => d.id === formData.discountId);

  // Cálculo de precios para venta
  const unitPrice = selectedProduct?.price || 0;
  const qty = parseInt(formData.quantity) || 0;
  let discountAmount = 0;
  if (selectedDiscount && qty > 0) {
    if (selectedDiscount.type === "percentage") {
      discountAmount = unitPrice * (selectedDiscount.value / 100);
    } else {
      discountAmount = selectedDiscount.value;
    }
  }
  const finalUnitPrice = Math.max(0, unitPrice - discountAmount);
  const totalAmount = finalUnitPrice * qty;

  /**
   * Cuando el empleado escribe el nombre del cliente:
   * - Busca en la base de datos de clientes
   * - Si es frecuente, auto-chequea el checkbox y selecciona el descuento frecuente
   * - Muestra información sobre compras anteriores
   */
  const handleCustomerNameChange = (name: string) => {
    const found = storage.findCustomerByName(name);
    setFoundCustomer(found || null);

    if (found?.isFrequent) {
      // Auto-detectar cliente frecuente y aplicar descuento automáticamente
      const frequentDiscount = activeDiscounts.find(
        (d) => d.appliesTo === "frequent_customers"
      );
      setFormData((prev) => ({
        ...prev,
        customerName: name,
        isFrequentCustomer: true,
        // Solo auto-aplica el descuento frecuente si no hay uno seleccionado ya
        discountId: prev.discountId || frequentDiscount?.id || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        customerName: name,
        // Si el cliente no es frecuente, no modificar el estado del checkbox
        // (el usuario podría haberlo marcado manualmente)
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      productId: "",
      type: "",
      quantity: "",
      reason: "",
      description: "",
      date: "",
      customerName: "",
    };
    let isValid = true;

    if (!formData.productId) {
      errors.productId = "Debes seleccionar un producto";
      isValid = false;
    }

    if (!formData.type) {
      errors.type = "Debes seleccionar el tipo de movimiento";
      isValid = false;
    }

    if (!formData.quantity) {
      errors.quantity = "La cantidad es obligatoria";
      isValid = false;
    } else if (parseInt(formData.quantity) <= 0) {
      errors.quantity = "La cantidad debe ser mayor a 0";
      isValid = false;
    } else if (
      formData.type === "exit" &&
      selectedProduct &&
      parseInt(formData.quantity) > selectedProduct.currentStock
    ) {
      errors.quantity = `No puedes retirar más de ${selectedProduct.currentStock} unidades disponibles`;
      isValid = false;
    }

    if (!formData.reason) {
      errors.reason = "Debes seleccionar un motivo";
      isValid = false;
    } else if (formData.reason === "Otro" && !formData.description.trim()) {
      errors.description = "Cuando seleccionas 'Otro', debes explicar el motivo";
      isValid = false;
    } else if (formData.reason === "Otro" && formData.description.trim().length < 10) {
      errors.description = "La descripción debe tener al menos 10 caracteres";
      isValid = false;
    }

    if (!formData.date) {
      errors.date = "La fecha es obligatoria";
      isValid = false;
    }

    if (
      isSale &&
      selectedDiscount?.appliesTo === "frequent_customers" &&
      !formData.isFrequentCustomer
    ) {
      toast.warning(
        `La oferta "${selectedDiscount.name}" es solo para clientes frecuentes. Marca al cliente como frecuente o selecciona otra oferta.`,
        { duration: 4000 }
      );
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    const product = products.find((p) => p.id === formData.productId);
    if (!product) {
      toast.error("Producto no encontrado");
      return;
    }

    const quantity = parseInt(formData.quantity);

    // Capturamos el estado anterior para poder deshacer
    const prevProducts = [...products];
    const prevMovements = [...movements];

    const newMovement: Movement = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      productBranch: product.branch,
      type: formData.type as "entry" | "exit",
      quantity,
      reason: formData.reason,
      description: formData.description.trim() || undefined,
      date: formData.date,
      sellerId: currentUser?.id,
      sellerName: currentUser?.fullName,
      sellerBranch:
        currentUser?.branch === "all" ? product.branch : currentUser?.branch,
      ...(isSale && {
        customerName: formData.customerName.trim() || undefined,
        customerPhone: formData.customerPhone.trim() || undefined,
        isFrequentCustomer: formData.isFrequentCustomer,
        discountId: formData.discountId || undefined,
        discountName: selectedDiscount?.name,
        discountValue: selectedDiscount?.value,
        unitPrice,
        finalUnitPrice,
        totalAmount,
      }),
    };

    // Actualizar el stock del producto
    const updatedProducts = products.map((p) =>
      p.id === product.id
        ? {
            ...p,
            currentStock:
              formData.type === "entry"
                ? p.currentStock + quantity
                : p.currentStock - quantity,
          }
        : p
    );

    const updatedMovements = [newMovement, ...movements];
    storage.saveProducts(updatedProducts);
    storage.saveMovements(updatedMovements);
    setProducts(updatedProducts);
    setMovements(updatedMovements);

    // Si es una venta con nombre de cliente, actualizar registro de clientes
    if (isSale && formData.customerName.trim()) {
      const updatedCustomer = storage.updateCustomerFromSale(
        formData.customerName.trim(),
        formData.customerPhone.trim() || undefined
      );

      // Notificar si el cliente acaba de alcanzar el umbral de cliente frecuente
      if (
        updatedCustomer.isFrequent &&
        updatedCustomer.purchaseCount === FREQUENT_CUSTOMER_THRESHOLD
      ) {
        toast.success(
          `⭐ ¡${updatedCustomer.name} acaba de convertirse en cliente frecuente! (${FREQUENT_CUSTOMER_THRESHOLD} compras)`,
          { duration: 5000 }
        );
      }
    }

    const typeLabel = formData.type === "entry" ? "Entrada" : "Salida";
    toast.success(
      `${typeLabel} registrada: ${quantity} unidades de "${product.name}"${
        isSale && formData.customerName ? ` — Cliente: ${formData.customerName}` : ""
      }`
    );
    setIsDialogOpen(false);

    // Mostrar toast de deshacer — H3: Control y libertad del usuario
    const productName = product.name;
    showUndo({
      message: `${typeLabel}: ${quantity} u. de "${productName}"`,
      onUndo: () => {
        storage.saveProducts(prevProducts);
        storage.saveMovements(prevMovements);
        setProducts(prevProducts);
        setMovements(prevMovements);
        toast.info("Movimiento deshecho");
      },
    });
  };

  // Productos visibles según rol:
  // Empleados solo ven productos de su sucursal en el formulario
  const visibleProducts =
    isEmployee && userBranch
      ? products.filter((p) => p.branch === userBranch)
      : products;

  // Filtrar movimientos
  const filteredMovements = movements
    .filter((m) => {
      const matchesType = !filterType || m.type === filterType;
      const matchesBranch =
        branchFilter === "all" ||
        m.productBranch === branchFilter ||
        m.sellerBranch === branchFilter;
      const matchesCustomer =
        !customerFilter ||
        (m.customerName
          ?.toLowerCase()
          .includes(customerFilter.toLowerCase()) ?? false);
      return matchesType && matchesBranch && matchesCustomer;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const clearFilter = () => setSearchParams({});

  const availableReasons = formData.type
    ? MOVEMENT_REASONS[formData.type as "entry" | "exit"]
    : [];

  const activeFiltersCount =
    (filterType ? 1 : 0) +
    (!isEmployee && branchFilter !== "all" ? 1 : 0) +
    (customerFilter ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-3xl font-semibold text-foreground">
              Movimientos de Stock
            </h2>
            {filterType && (
              <Badge
                variant="secondary"
                className={`flex items-center gap-1 ${
                  filterType === "entry"
                    ? "bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-400"
                    : "bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-400"
                }`}
              >
                {filterType === "entry" ? (
                  <>
                    <TrendingUp className="h-3 w-3" /> Solo Entradas
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3" /> Solo Salidas
                  </>
                )}
                <button
                  onClick={clearFilter}
                  className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                  aria-label="Quitar filtro"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {/* Badge de sucursal solo visible para admin */}
            {!isEmployee && branchFilter !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-primary/10 text-primary"
              >
                <Building2 className="h-3 w-3" />
                {branchFilter}
                <button
                  onClick={() => setBranchFilter("all")}
                  className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                  aria-label="Quitar filtro de sucursal"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {/* Badge de filtro por cliente */}
            {customerFilter && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-violet-100 dark:bg-violet-950/50 text-violet-800 dark:text-violet-400"
              >
                <User className="h-3 w-3" />
                Cliente: {customerFilter}
                <button
                  onClick={() => setCustomerFilter("")}
                  className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                  aria-label="Quitar filtro de cliente"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {/* Indicador de sucursal para empleados */}
            {isEmployee && userBranch && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-muted text-muted-foreground"
              >
                <Building2 className="h-3 w-3" />
                {userBranch}
                <Lock className="h-3 w-3 ml-0.5" />
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Mostrando {filteredMovements.length} de {movements.length} movimientos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Botón de filtros */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Filtrar movimientos</h4>

                {/* Filtro por tipo */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Por tipo</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={filterType === "entry" ? "default" : "outline"}
                      className="flex-1 h-8 text-xs"
                      onClick={() => {
                        setSearchParams({ filter: "entry" });
                        setIsFilterOpen(false);
                      }}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Entradas
                    </Button>
                    <Button
                      size="sm"
                      variant={filterType === "exit" ? "default" : "outline"}
                      className="flex-1 h-8 text-xs"
                      onClick={() => {
                        setSearchParams({ filter: "exit" });
                        setIsFilterOpen(false);
                      }}
                    >
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Salidas
                    </Button>
                  </div>
                </div>

                {/* Filtro por sucursal: solo visible para admin */}
                {!isEmployee && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Por sucursal</Label>
                    <Select
                      value={branchFilter}
                      onValueChange={(v) => {
                        setBranchFilter(v);
                        setIsFilterOpen(false);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Todas las sucursales" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las sucursales</SelectItem>
                        {BRANCHES.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* ── NUEVO: Filtro por cliente ── */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Por cliente
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      className="h-8 text-xs pl-7"
                      placeholder="Ej: Roberto Núñez..."
                      value={customerFilter}
                      onChange={(e) => setCustomerFilter(e.target.value)}
                    />
                    {customerFilter && (
                      <button
                        onClick={() => setCustomerFilter("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  {customerFilter && (
                    <p className="text-xs text-muted-foreground">
                      {filteredMovements.length} movimiento(s) de "{customerFilter}"
                    </p>
                  )}
                </div>

                {(filterType ||
                  (!isEmployee && branchFilter !== "all") ||
                  customerFilter) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full h-8 text-xs text-muted-foreground"
                    onClick={() => {
                      clearFilter();
                      if (!isEmployee) setBranchFilter("all");
                      setCustomerFilter("");
                      setIsFilterOpen(false);
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpiar todos los filtros
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            onClick={handleOpenDialog}
            disabled={visibleProducts.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      {visibleProducts.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay productos en el inventario
            {isEmployee && userBranch ? ` de ${userBranch}` : ""}. Debes agregar
            productos antes de registrar movimientos.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de movimientos */}
      <div className="space-y-4">
        {filteredMovements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {customerFilter
                  ? `No se encontraron movimientos para el cliente "${customerFilter}".`
                  : "No hay movimientos que coincidan con los filtros aplicados."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMovements.map((movement) => (
            <Card key={movement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <CardTitle className="text-lg">{movement.productName}</CardTitle>
                      <Badge
                        className={`flex items-center gap-1 ${
                          movement.type === "entry"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white border-green-600"
                        }`}
                      >
                        {movement.type === "entry" ? (
                          <>
                            <TrendingUp className="h-3 w-3" /> Entrada
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3" /> Salida
                          </>
                        )}
                      </Badge>
                      {movement.productBranch && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {movement.productBranch}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(movement.date + "T12:00:00").toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Cantidad</p>
                    <p
                      className={`text-lg font-semibold ${
                        movement.type === "entry"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {movement.type === "entry" ? "+" : "-"}
                      {movement.quantity} unidades
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Motivo</p>
                    <p className="text-lg font-medium">{movement.reason}</p>
                  </div>
                </div>

                {/* Info de venta */}
                {movement.reason === "Venta" && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-md space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Detalles de la venta
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      {movement.customerName && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <span className="text-muted-foreground">Cliente: </span>
                            <span className="font-medium">
                              {movement.customerName}
                            </span>
                            {movement.isFrequentCustomer && (
                              <Badge
                                variant="outline"
                                className="ml-1 text-xs py-0 h-4 text-primary border-primary/40"
                              >
                                <Star className="h-2.5 w-2.5 mr-0.5" />
                                Frecuente
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      {movement.sellerName && (
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <span className="text-muted-foreground">Vendedor: </span>
                            <span className="font-medium">{movement.sellerName}</span>
                            {movement.sellerBranch && (
                              <span className="text-muted-foreground text-xs">
                                {" "}
                                ({movement.sellerBranch})
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {movement.discountName && (
                        <div className="flex items-center gap-2">
                          <BadgePercent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <span className="text-muted-foreground">Descuento: </span>
                            <span className="font-medium">{movement.discountName}</span>
                          </div>
                        </div>
                      )}
                      {movement.totalAmount !== undefined && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <span className="text-muted-foreground">Total: </span>
                            <span className="font-semibold text-primary">
                              $
                              {movement.totalAmount.toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            {movement.discountName &&
                              movement.unitPrice && (
                                <span className="text-muted-foreground text-xs ml-1">
                                  (sin desc.: $
                                  {(
                                    movement.unitPrice *
                                    (movement.quantity || 0)
                                  ).toLocaleString("es-AR")}
                                  )
                                </span>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {movement.description && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">
                      Descripción adicional:
                    </p>
                    <p className="text-sm text-foreground">{movement.description}</p>
                  </div>
                )}

                {movement.reason !== "Venta" && movement.sellerName && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>Registrado por: {movement.sellerName}</span>
                    {movement.sellerBranch && (
                      <span>({movement.sellerBranch})</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog nuevo movimiento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Movimiento de Stock</DialogTitle>
            <DialogDescription>
              Registra una entrada (agregar stock) o salida (retirar stock) de
              productos
              {isEmployee && userBranch ? ` de ${userBranch}` : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Producto */}
              <div className="space-y-2">
                <Label htmlFor="product">
                  Producto <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productId: value })
                  }
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleProducts.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No hay productos registrados
                        {isEmployee && userBranch ? ` en ${userBranch}` : ""}
                      </div>
                    ) : (
                      visibleProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} · {product.branch} · Stock:{" "}
                          {product.currentStock}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formErrors.productId && (
                  <p className="text-sm text-destructive">{formErrors.productId}</p>
                )}
                {selectedProduct && (
                  <div className="p-3 bg-muted rounded-md text-sm">
                    <p className="font-medium">{selectedProduct.name}</p>
                    <p className="text-muted-foreground">
                      Stock:{" "}
                      <span className="font-semibold">
                        {selectedProduct.currentStock}
                      </span>{" "}
                      unidades · {selectedProduct.category} ·{" "}
                      <span className="font-medium">{selectedProduct.branch}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipo de Movimiento <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value as "entry" | "exit",
                      reason: "",
                      discountId: "",
                    })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span>Entrada (Agregar stock)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="exit">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span>Salida (Retirar stock)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.type && (
                  <p className="text-sm text-destructive">{formErrors.type}</p>
                )}
              </div>

              {/* Cantidad y Fecha */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Cantidad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="0"
                  />
                  {formErrors.quantity && (
                    <p className="text-sm text-destructive">{formErrors.quantity}</p>
                  )}
                  {formData.type === "exit" &&
                    selectedProduct &&
                    formData.quantity &&
                    parseInt(formData.quantity) > selectedProduct.currentStock * 0.8 &&
                    parseInt(formData.quantity) <= selectedProduct.currentStock && (
                      <p className="text-sm text-amber-600">
                        ⚠️ Retirando una gran cantidad del stock disponible
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">
                    Fecha <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {formErrors.date && (
                    <p className="text-sm text-destructive">{formErrors.date}</p>
                  )}
                </div>
              </div>

              {/* Motivo */}
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Motivo <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) =>
                    setFormData({ ...formData, reason: value, discountId: "" })
                  }
                  disabled={!formData.type}
                >
                  <SelectTrigger id="reason">
                    <SelectValue
                      placeholder={
                        formData.type
                          ? "Selecciona un motivo"
                          : "Primero selecciona el tipo de movimiento"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.reason && (
                  <p className="text-sm text-destructive">{formErrors.reason}</p>
                )}
              </div>

              {/* SECCIÓN DE VENTA */}
              {isSale && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      <p className="font-medium text-sm">Información de la Venta</p>
                    </div>

                    {/* Vendedor (auto desde sesión) */}
                    <div className="p-3 bg-muted/50 rounded-md text-sm flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Vendedor:</span>
                      <span className="font-medium">{currentUser?.fullName}</span>
                      <span className="text-muted-foreground text-xs">
                        (
                        {currentUser?.branch === "all"
                          ? selectedProduct?.branch
                          : currentUser?.branch}
                        )
                      </span>
                    </div>

                    {/* Cliente */}
                    <div className="space-y-2">
                      <Label htmlFor="customerName">
                        Nombre del cliente (opcional)
                      </Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => handleCustomerNameChange(e.target.value)}
                        placeholder="Nombre del cliente"
                      />
                      {/* Info de cliente detectado */}
                      {formData.customerName && formData.customerName.length >= 2 && (
                        <div className="text-xs mt-1">
                          {foundCustomer ? (
                            foundCustomer.isFrequent ? (
                              <div className="flex items-center gap-1.5 text-primary font-medium">
                                <Star className="h-3.5 w-3.5 fill-primary" />
                                Cliente frecuente detectado —{" "}
                                {foundCustomer.purchaseCount} compras anteriores.
                                Descuento aplicado automáticamente.
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                Cliente registrado —{" "}
                                {foundCustomer.purchaseCount} compra
                                {foundCustomer.purchaseCount !== 1 ? "s" : ""}{" "}
                                anterior
                                {foundCustomer.purchaseCount !== 1 ? "es" : ""}.
                                Necesita{" "}
                                {FREQUENT_CUSTOMER_THRESHOLD -
                                  foundCustomer.purchaseCount}{" "}
                                más para ser frecuente.
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <User className="h-3.5 w-3.5" />
                              Cliente nuevo
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">
                        Teléfono del cliente (opcional)
                      </Label>
                      <Input
                        id="customerPhone"
                        value={formData.customerPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerPhone: e.target.value,
                          })
                        }
                        placeholder="Ej: 011-1234-5678"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="isFrequent"
                        checked={formData.isFrequentCustomer}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            isFrequentCustomer: !!checked,
                            discountId: !checked ? "" : formData.discountId,
                          })
                        }
                      />
                      <Label htmlFor="isFrequent" className="cursor-pointer">
                        Cliente frecuente
                        {foundCustomer?.isFrequent && (
                          <span className="ml-1.5 text-xs text-primary">
                            (auto-detectado)
                          </span>
                        )}
                      </Label>
                    </div>

                    {/* Descuento */}
                    {activeDiscounts.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="discount">
                          Aplicar oferta / descuento
                        </Label>
                        <Select
                          value={formData.discountId}
                          onValueChange={(v) =>
                            setFormData({ ...formData, discountId: v })
                          }
                        >
                          <SelectTrigger id="discount">
                            <SelectValue placeholder="Sin descuento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin descuento</SelectItem>
                            {activeDiscounts.map((d) => {
                              const requiresFrequent =
                                d.appliesTo === "frequent_customers";
                              const canApply =
                                !requiresFrequent || formData.isFrequentCustomer;
                              return (
                                <SelectItem
                                  key={d.id}
                                  value={d.id}
                                  disabled={!canApply}
                                >
                                  <div className="flex items-center gap-2">
                                    <BadgePercent className="h-4 w-4" />
                                    {d.name} (
                                    {d.type === "percentage"
                                      ? `${d.value}%`
                                      : `$${d.value}`}
                                    )
                                    {requiresFrequent && !canApply && (
                                      <span className="text-xs text-muted-foreground">
                                        · Solo clientes frecuentes
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {foundCustomer?.isFrequent &&
                          formData.discountId &&
                          selectedDiscount?.appliesTo === "frequent_customers" && (
                            <p className="text-xs text-primary flex items-center gap-1">
                              <Star className="h-3 w-3 fill-primary" />
                              Descuento aplicado automáticamente por cliente frecuente
                            </p>
                          )}
                      </div>
                    )}

                    {/* Preview de precio */}
                    {selectedProduct && qty > 0 && (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-md space-y-1 text-sm">
                        <p className="font-medium text-foreground">
                          Resumen de la venta
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                          <span>Precio unitario:</span>
                          <span className="text-right font-medium text-foreground">
                            ${unitPrice.toLocaleString("es-AR")}
                          </span>
                          {selectedDiscount && (
                            <>
                              <span>Descuento ({selectedDiscount.name}):</span>
                              <span className="text-right font-medium text-green-600">
                                -$
                                {discountAmount.toLocaleString("es-AR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                              <span>Precio final por unidad:</span>
                              <span className="text-right font-medium text-foreground">
                                $
                                {finalUnitPrice.toLocaleString("es-AR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </>
                          )}
                          <span>Cantidad:</span>
                          <span className="text-right font-medium text-foreground">
                            {qty} unidades
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-primary/20 font-semibold text-foreground">
                          <span>Total:</span>
                          <span className="text-primary">
                            $
                            {totalAmount.toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {/* Descripción adicional */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Descripción adicional
                  {formData.reason === "Otro" && (
                    <span className="text-destructive"> *</span>
                  )}
                  {formData.reason && formData.reason !== "Otro" && (
                    <span className="text-muted-foreground text-xs ml-1">
                      (opcional)
                    </span>
                  )}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={
                    formData.reason === "Otro"
                      ? "Explica el motivo de este movimiento (obligatorio)"
                      : "Número de factura, proveedor, observaciones..."
                  }
                  rows={3}
                />
                {formErrors.description && (
                  <p className="text-sm text-destructive">
                    {formErrors.description}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Registrar Movimiento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Toast de deshacer — H3: Control y libertad del usuario */}
      {undoConfig && (
        <UndoToast
          message={undoConfig.message}
          onUndo={executeUndo}
          onDismiss={dismiss}
        />
      )}
    </div>
  );
}

```

---

## `src/app/pages/Offers.tsx`

```tsx
import { useEffect, useState } from "react";
import { Discount } from "../types";
import { storage } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Plus, Edit, Trash2, Tag, Percent, DollarSign, Users, Globe } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router";

export function Offers() {
  const { isAdmin } = useAuth();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    appliesTo: "all" as "all" | "frequent_customers",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    value: "",
  });

  useEffect(() => {
    setDiscounts(storage.getDiscounts());
  }, []);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleOpenDialog = (discount?: Discount) => {
    if (discount) {
      setEditingDiscount(discount);
      setFormData({
        name: discount.name,
        type: discount.type,
        value: discount.value.toString(),
        appliesTo: discount.appliesTo,
        isActive: discount.isActive,
      });
    } else {
      setEditingDiscount(null);
      setFormData({
        name: "",
        type: "percentage",
        value: "",
        appliesTo: "all",
        isActive: true,
      });
    }
    setFormErrors({ name: "", value: "" });
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    const errors = { name: "", value: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "El nombre es obligatorio";
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      errors.name = "El nombre debe tener al menos 3 caracteres";
      isValid = false;
    }

    if (!formData.value) {
      errors.value = "El valor es obligatorio";
      isValid = false;
    } else {
      const num = parseFloat(formData.value);
      if (isNaN(num) || num <= 0) {
        errors.value = "El valor debe ser mayor a 0";
        isValid = false;
      } else if (formData.type === "percentage" && num > 100) {
        errors.value = "El porcentaje no puede ser mayor a 100%";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    let updatedDiscounts: Discount[];

    if (editingDiscount) {
      updatedDiscounts = discounts.map((d) =>
        d.id === editingDiscount.id
          ? {
              ...d,
              name: formData.name.trim(),
              type: formData.type,
              value: parseFloat(formData.value),
              appliesTo: formData.appliesTo,
              isActive: formData.isActive,
            }
          : d
      );
      toast.success(`Oferta "${formData.name}" actualizada`);
    } else {
      const newDiscount: Discount = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        type: formData.type,
        value: parseFloat(formData.value),
        appliesTo: formData.appliesTo,
        isActive: formData.isActive,
        createdAt: new Date().toISOString(),
      };
      updatedDiscounts = [...discounts, newDiscount];
      toast.success(`Oferta "${formData.name}" creada`);
    }

    storage.saveDiscounts(updatedDiscounts);
    setDiscounts(updatedDiscounts);
    setIsDialogOpen(false);
  };

  const handleToggleActive = (discount: Discount) => {
    const updated = discounts.map((d) =>
      d.id === discount.id ? { ...d, isActive: !d.isActive } : d
    );
    storage.saveDiscounts(updated);
    setDiscounts(updated);
    toast.success(
      `Oferta "${discount.name}" ${!discount.isActive ? "activada" : "desactivada"}`
    );
  };

  const confirmDelete = () => {
    if (!discountToDelete) return;
    const updated = discounts.filter((d) => d.id !== discountToDelete.id);
    storage.saveDiscounts(updated);
    setDiscounts(updated);
    toast.success(`Oferta "${discountToDelete.name}" eliminada`);
    setDiscountToDelete(null);
  };

  const activeCount = discounts.filter((d) => d.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Ofertas y Descuentos</h2>
          <p className="text-muted-foreground mt-1">
            Gestiona los descuentos disponibles para aplicar en ventas (
            {activeCount} activos de {discounts.length} totales)
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Oferta
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de ofertas</p>
                <p className="text-2xl font-semibold">{discounts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2">
                <Tag className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ofertas activas</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                  {activeCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Para clientes frecuentes</p>
                <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                  {discounts.filter((d) => d.appliesTo === "frequent_customers").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de ofertas */}
      <div className="space-y-4">
        {discounts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Tag className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay ofertas configuradas
              </h3>
              <p className="text-muted-foreground">
                Crea tu primera oferta usando el botón "Nueva Oferta"
              </p>
            </CardContent>
          </Card>
        ) : (
          discounts.map((discount) => (
            <Card
              key={discount.id}
              className={`transition-opacity ${!discount.isActive ? "opacity-60" : ""}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <CardTitle className="text-lg">{discount.name}</CardTitle>
                      <Badge
                        className={
                          discount.isActive
                            ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 border-green-300 dark:border-green-700"
                            : "bg-muted text-muted-foreground"
                        }
                        variant="outline"
                      >
                        {discount.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {discount.appliesTo === "all" ? (
                          <>
                            <Globe className="h-3 w-3" /> General
                          </>
                        ) : (
                          <>
                            <Users className="h-3 w-3" /> Clientes frecuentes
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-2">
                      <Label htmlFor={`toggle-${discount.id}`} className="text-sm text-muted-foreground cursor-pointer">
                        {discount.isActive ? "Activa" : "Inactiva"}
                      </Label>
                      <Switch
                        id={`toggle-${discount.id}`}
                        checked={discount.isActive}
                        onCheckedChange={() => handleToggleActive(discount)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(discount)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDiscountToDelete(discount)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    {discount.type === "percentage" ? (
                      <Percent className="h-5 w-5 text-primary" />
                    ) : (
                      <DollarSign className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Descuento</p>
                      <p className="text-2xl font-semibold text-primary">
                        {discount.type === "percentage"
                          ? `${discount.value}%`
                          : `$${discount.value.toLocaleString("es-AR")}`}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">
                      {discount.type === "percentage" ? "Porcentaje" : "Monto fijo"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Aplica a</p>
                    <p className="font-medium">
                      {discount.appliesTo === "all"
                        ? "Todos los clientes"
                        : "Clientes frecuentes"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingDiscount ? "Editar Oferta" : "Nueva Oferta"}
            </DialogTitle>
            <DialogDescription>
              {editingDiscount
                ? "Modifica los datos de la oferta."
                : "Configura un nuevo descuento o oferta para aplicar en ventas."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="disc-name">
                  Nombre de la oferta <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="disc-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Descuento de temporada"
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="disc-type">Tipo de descuento</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, type: v as "percentage" | "fixed" })
                    }
                  >
                    <SelectTrigger id="disc-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                      <SelectItem value="fixed">Monto fijo ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disc-value">
                    Valor {formData.type === "percentage" ? "(%)" : "($)"}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="disc-value"
                    type="number"
                    min="0.01"
                    max={formData.type === "percentage" ? "100" : undefined}
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === "percentage" ? "10" : "500"}
                  />
                  {formErrors.value && (
                    <p className="text-sm text-destructive">{formErrors.value}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="disc-applies">Aplica a</Label>
                <Select
                  value={formData.appliesTo}
                  onValueChange={(v) =>
                    setFormData({ ...formData, appliesTo: v as "all" | "frequent_customers" })
                  }
                >
                  <SelectTrigger id="disc-applies">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clientes</SelectItem>
                    <SelectItem value="frequent_customers">
                      Solo clientes frecuentes
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formData.appliesTo === "frequent_customers" && (
                  <p className="text-sm text-muted-foreground">
                    Esta oferta solo se puede aplicar cuando el cliente es marcado como frecuente en la venta.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="disc-active"
                  checked={formData.isActive}
                  onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                />
                <Label htmlFor="disc-active">
                  Oferta activa (disponible para aplicar en ventas)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingDiscount ? "Guardar Cambios" : "Crear Oferta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog
        open={!!discountToDelete}
        onOpenChange={(open) => !open && setDiscountToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta oferta?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar "{discountToDelete?.name}". Esta acción no se puede
              deshacer. Las ventas ya registradas con este descuento no se verán afectadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

```

---

## `src/app/pages/Restock.tsx`

```tsx
import { useEffect, useState } from "react";
import { Product } from "../types";
import { storage } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AlertTriangle, Package, ShoppingCart, Filter, Building2, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { BRANCHES } from "../types";

export function Restock() {
  const { currentUser } = useAuth();
  const isEmployee = currentUser?.role === "employee";
  const userBranch = currentUser?.branch;

  const [products, setProducts] = useState<Product[]>([]);
  // Empleados siempre ven solo su sucursal; admin puede elegir
  const [branchFilter, setBranchFilter] = useState<string>(
    isEmployee && userBranch ? userBranch : "all"
  );

  useEffect(() => {
    setProducts(storage.getProducts());
  }, []);

  // Stock mínimo se verifica por cada sucursal por separado (cada producto es independiente)
  const lowStockProducts = products
    .filter((p) => p.currentStock <= p.minStock)
    .filter((p) => branchFilter === "all" || p.branch === branchFilter)
    .sort((a, b) => {
      const percentA = a.currentStock / (a.minStock || 1);
      const percentB = b.currentStock / (b.minStock || 1);
      return percentA - percentB;
    });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Productos a Reponer</h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            {isEmployee && userBranch ? (
              <>
                <Building2 className="h-4 w-4" />
                {userBranch} — productos por debajo del stock mínimo
              </>
            ) : (
              "Listado de productos por debajo del stock mínimo (verificado por sucursal)"
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* El selector de sucursal solo aparece para el admin */}
          {!isEmployee ? (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-[180px]" aria-label="Filtrar por sucursal">
                  <SelectValue placeholder="Filtrar sucursal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las sucursales</SelectItem>
                  {BRANCHES.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            /* Para empleados: indicador visual de sucursal bloqueada */
            <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-muted/50 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{userBranch}</span>
              <Lock className="h-3.5 w-3.5" />
            </div>
          )}

          {lowStockProducts.length > 0 && (
            <Button onClick={handlePrint} variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Imprimir Lista
            </Button>
          )}
        </div>
      </div>

      {/* Resumen alerta - amber en lugar de rojo */}
      {lowStockProducts.length > 0 && (
        <Card className="border-amber-400 dark:border-amber-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
              <CardTitle>
                {lowStockProducts.length} producto(s) requieren atención inmediata
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              Estos productos han alcanzado o están por debajo de su stock mínimo configurado.
              El stock mínimo se verifica de forma independiente para cada sucursal.
            </p>
          </CardContent>
        </Card>
      )}

      {!isEmployee && branchFilter !== "all" &&
        lowStockProducts.length === 0 &&
        products.filter((p) => p.currentStock <= p.minStock).length > 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No hay productos con stock bajo en la sucursal "{branchFilter}". Cambia el
                filtro para ver otros resultados.
              </p>
            </CardContent>
          </Card>
        )}

      {/* Lista de productos a reponer */}
      <div className="space-y-4">
        {lowStockProducts.length === 0 &&
        products.filter((p) => p.currentStock <= p.minStock).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                ¡Todo está en orden!
              </h3>
              <p className="text-muted-foreground">
                No hay productos que requieran reposición en este momento
                {isEmployee && userBranch ? ` en ${userBranch}` : ""}.
              </p>
            </CardContent>
          </Card>
        ) : lowStockProducts.length === 0 && isEmployee ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                ¡Todo está en orden en tu sucursal!
              </h3>
              <p className="text-muted-foreground">
                No hay productos con stock bajo en {userBranch}.
              </p>
            </CardContent>
          </Card>
        ) : (
          lowStockProducts.map((product) => {
            const deficit = product.minStock - product.currentStock;
            const percentage =
              product.minStock > 0
                ? (product.currentStock / product.minStock) * 100
                : 0;
            const severity =
              percentage <= 0
                ? "critical"
                : percentage <= 50
                ? "high"
                : percentage <= 100
                ? "medium"
                : "low";

            const severityBorderColors = {
              critical: "border-amber-600 dark:border-amber-600",
              high: "border-amber-500 dark:border-amber-500",
              medium: "border-amber-400 dark:border-amber-600",
              low: "border-amber-300 dark:border-amber-700",
            };

            const severityBarColors = {
              critical: "bg-amber-600",
              high: "bg-amber-500",
              medium: "bg-amber-400",
              low: "bg-amber-300",
            };

            const severityLabels = {
              critical: "CRÍTICO",
              high: "URGENTE",
              medium: "ATENCIÓN",
              low: "REPONER",
            };

            const severityBadgeColors = {
              critical:
                "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 border-amber-400 dark:border-amber-700",
              high: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700",
              medium:
                "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-500 border-amber-200 dark:border-amber-800",
              low: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-800",
            };

            return (
              <Card key={product.id} className={severityBorderColors[severity]}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge
                          variant="outline"
                          className={severityBadgeColors[severity]}
                        >
                          {severityLabels[severity]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.category} • {product.branch || "Sin sucursal"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Stock Actual</p>
                      <p className="text-lg font-semibold text-amber-600 dark:text-amber-500">
                        {product.currentStock} unidades
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stock Mínimo</p>
                      <p className="text-lg font-semibold">{product.minStock} unidades</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cantidad Sugerida a Pedir</p>
                      <p className="text-lg font-semibold text-primary">
                        {Math.max(deficit, product.minStock)} unidades
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Costo Estimado</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        $
                        {(
                          product.price * Math.max(deficit, product.minStock)
                        ).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Nivel de stock</span>
                      <span className="font-medium">{percentage.toFixed(0)}% del mínimo</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${severityBarColors[severity]}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Resumen de costos */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Reposición</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Total de productos a reponer:</span>
                <span className="text-lg font-semibold">{lowStockProducts.length}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-muted-foreground">Total de unidades a pedir:</span>
                <span className="text-lg font-semibold">
                  {lowStockProducts.reduce(
                    (sum, p) => sum + Math.max(p.minStock - p.currentStock, p.minStock),
                    0
                  )}{" "}
                  unidades
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-foreground font-medium">Inversión estimada total:</span>
                <span className="text-2xl font-semibold text-green-600 dark:text-green-400">
                  $
                  {lowStockProducts
                    .reduce(
                      (sum, p) =>
                        sum + p.price * Math.max(p.minStock - p.currentStock, p.minStock),
                      0
                    )
                    .toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              💡 Sugerencia: Este resumen puede imprimirse para compartir con el equipo de compras
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

```

---

## `src/app/routes.tsx`

```tsx
import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { Movements } from "./pages/Movements";
import { Restock } from "./pages/Restock";
import { Offers } from "./pages/Offers";
import { Login } from "./pages/Login";
import { Layout } from "./components/Layout";
import { useAuth } from "./contexts/AuthContext";

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "inventory", element: <Inventory /> },
      { path: "movements", element: <Movements /> },
      { path: "restock", element: <Restock /> },
      { path: "offers", element: <Offers /> },
    ],
  },
]);

```

---

## `src/app/types/index.ts`

```ts
export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "employee";
  branch: string; // 'all' for admin
  fullName: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  isFrequent: boolean;
  purchaseCount: number;
  createdAt: string;
}

export interface Discount {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  isActive: boolean;
  appliesTo: "all" | "frequent_customers";
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  branch: string;
  price: number;
  currentStock: number;
  minStock: number;
  createdAt: string;
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  productBranch?: string;
  type: "entry" | "exit";
  quantity: number;
  reason: string;
  description?: string;
  date: string;
  // Sale info (when type=exit, reason=Venta)
  customerName?: string;
  customerPhone?: string;
  isFrequentCustomer?: boolean;
  sellerId?: string;
  sellerName?: string;
  sellerBranch?: string;
  discountId?: string;
  discountName?: string;
  discountValue?: number;
  unitPrice?: number;
  finalUnitPrice?: number;
  totalAmount?: number;
}

export const CATEGORIES = [
  "Herramientas manuales",
  "Herramientas eléctricas",
  "Materiales de construcción",
  "Pintura",
  "Plomería",
  "Electricidad",
  "Ferretería general",
  "Adhesivos y selladores",
  "Otros",
];

export const BRANCHES = [
  "Sucursal Centro",
  "Sucursal Norte",
  "Sucursal Sur",
  "Sucursal Este",
  "Sucursal Oeste",
  "Depósito Central",
];

export const MOVEMENT_REASONS = {
  entry: [
    "Compra a proveedor",
    "Devolución de cliente",
    "Traslado desde otra sucursal",
    "Ajuste de inventario (entrada)",
    "Producción interna",
    "Otro",
  ],
  exit: [
    "Venta",
    "Traslado a otra sucursal",
    "Producto defectuoso",
    "Producto vencido",
    "Merma o pérdida",
    "Uso interno",
    "Ajuste de inventario (salida)",
    "Otro",
  ],
};

```

---

## `src/app/utils/storage.ts`

```ts
import { Product, Movement, User, Customer, Discount } from "../types";

const PRODUCTS_KEY = "ferreteria_products";
const MOVEMENTS_KEY = "ferreteria_movements";
const USERS_KEY = "ferreteria_users";
const CUSTOMERS_KEY = "ferreteria_customers";
const DISCOUNTS_KEY = "ferreteria_discounts";
const SESSION_KEY = "ferreteria_session";

// Umbral de compras para que un cliente sea considerado frecuente
export const FREQUENT_CUSTOMER_THRESHOLD = 3;

const DEFAULT_USERS: User[] = [
  {
    id: "u1",
    username: "admin",
    password: "admin123",
    role: "admin",
    branch: "all",
    fullName: "Administrador",
  },
  {
    id: "u2",
    username: "juanperez",
    password: "empleado123",
    role: "employee",
    branch: "Sucursal Centro",
    fullName: "Juan Pérez",
  },
  {
    id: "u3",
    username: "mariagarcia",
    password: "empleado123",
    role: "employee",
    branch: "Sucursal Norte",
    fullName: "María García",
  },
  {
    id: "u4",
    username: "carloslopez",
    password: "empleado123",
    role: "employee",
    branch: "Sucursal Sur",
    fullName: "Carlos López",
  },
];

const DEFAULT_DISCOUNTS: Discount[] = [
  {
    id: "d1",
    name: "Descuento cliente frecuente (10%)",
    type: "percentage",
    value: 10,
    isActive: true,
    appliesTo: "frequent_customers",
    createdAt: new Date().toISOString(),
  },
  {
    id: "d2",
    name: "Oferta especial de temporada (15%)",
    type: "percentage",
    value: 15,
    isActive: false,
    appliesTo: "all",
    createdAt: new Date().toISOString(),
  },
];

export const storage = {
  // Products
  getProducts(): Product[] {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveProducts(products: Product[]): void {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  // Movements
  getMovements(): Movement[] {
    const data = localStorage.getItem(MOVEMENTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveMovements(movements: Movement[]): void {
    localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
  },

  // Users
  getUsers(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(data);
  },
  saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // Customers
  getCustomers(): Customer[] {
    const data = localStorage.getItem(CUSTOMERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveCustomers(customers: Customer[]): void {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  },

  /**
   * Busca un cliente por nombre (case-insensitive, coincidencia exacta).
   * Retorna el cliente si existe, undefined si no.
   */
  findCustomerByName(name: string): Customer | undefined {
    if (!name.trim()) return undefined;
    const customers = this.getCustomers();
    const normalized = name.trim().toLowerCase();
    return customers.find((c) => c.name.trim().toLowerCase() === normalized);
  },

  /**
   * Registra una compra para un cliente. Si no existe lo crea.
   * Incrementa su contador de compras y lo marca como frecuente
   * cuando alcanza FREQUENT_CUSTOMER_THRESHOLD.
   * Retorna el cliente actualizado.
   */
  updateCustomerFromSale(name: string, phone?: string): Customer {
    const customers = this.getCustomers();
    const normalized = name.trim().toLowerCase();
    const existingIndex = customers.findIndex(
      (c) => c.name.trim().toLowerCase() === normalized
    );

    let updatedCustomer: Customer;

    if (existingIndex !== -1) {
      const existing = customers[existingIndex];
      const newCount = existing.purchaseCount + 1;
      updatedCustomer = {
        ...existing,
        purchaseCount: newCount,
        isFrequent: newCount >= FREQUENT_CUSTOMER_THRESHOLD,
        // Actualizar teléfono si no tenía uno y ahora se provee
        ...(phone && phone.trim() && !existing.phone
          ? { phone: phone.trim() }
          : {}),
      };
      customers[existingIndex] = updatedCustomer;
    } else {
      updatedCustomer = {
        id: Date.now().toString(),
        name: name.trim(),
        phone: phone?.trim() || undefined,
        isFrequent: 1 >= FREQUENT_CUSTOMER_THRESHOLD,
        purchaseCount: 1,
        createdAt: new Date().toISOString(),
      };
      customers.push(updatedCustomer);
    }

    this.saveCustomers(customers);
    return updatedCustomer;
  },

  // Discounts
  getDiscounts(): Discount[] {
    const data = localStorage.getItem(DISCOUNTS_KEY);
    if (!data) {
      localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(DEFAULT_DISCOUNTS));
      return DEFAULT_DISCOUNTS;
    }
    return JSON.parse(data);
  },
  saveDiscounts(discounts: Discount[]): void {
    localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(discounts));
  },

  // Session
  getCurrentUser(): User | null {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },
  setCurrentUser(user: User): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },
  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  },
};

```

---

## `src/main.tsx`

```tsx

  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  
```

---

## `src/styles/fonts.css`

```css

```

---

## `src/styles/globals.css`

```css

```

---

## `src/styles/index.css`

```css
@import './fonts.css';
@import './tailwind.css';
@import './theme.css';

```

---

## `src/styles/tailwind.css`

```css
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';

@import 'tw-animate-css';

```

---

## `src/styles/theme.css`

```css
@custom-variant dark (&:is(.dark *));

:root {
  --font-size: 16px;
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --card: #ffffff;
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: #ea580c;
  --primary-foreground: #ffffff;
  --secondary: oklch(0.95 0.0058 264.53);
  --secondary-foreground: #030213;
  --muted: #ececf0;
  --muted-foreground: #717182;
  --accent: #fff7ed;
  --accent-foreground: #ea580c;
  --destructive: #d4183d;
  --destructive-foreground: #ffffff;
  --border: rgba(0, 0, 0, 0.1);
  --input: transparent;
  --input-background: #f3f3f5;
  --switch-background: #cbced4;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: #ea580c;
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: #ea580c;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: #ea580c;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --card: #222222;
  --card-foreground: #fafafa;
  --popover: #171717;
  --popover-foreground: #fafafa;
  --primary: #fb923c;
  --primary-foreground: #171717;
  --secondary: #262626;
  --secondary-foreground: #fafafa;
  --muted: #262626;
  --muted-foreground: #a3a3a3;
  --accent: #292524;
  --accent-foreground: #fb923c;
  --destructive: #dc2626;
  --destructive-foreground: #fafafa;
  --border: #262626;
  --input: #262626;
  --input-background: #171717;
  --switch-background: #404040;
  --ring: #fb923c;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: #171717;
  --sidebar-foreground: #fafafa;
  --sidebar-primary: #fb923c;
  --sidebar-primary-foreground: #171717;
  --sidebar-accent: #262626;
  --sidebar-accent-foreground: #fafafa;
  --sidebar-border: #262626;
  --sidebar-ring: #fb923c;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-input-background: var(--input-background);
  --color-switch-background: var(--switch-background);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
  }

  /**
  * Default typography styles for HTML elements (h1-h4, p, label, button, input).
  * These are in @layer base, so Tailwind utility classes (like text-sm, text-lg) automatically override them.
  */

  html {
    font-size: var(--font-size);
  }

  h1 {
    font-size: var(--text-2xl);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }

  h2 {
    font-size: var(--text-xl);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }

  h4 {
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }

  label {
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }

  button {
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }

  input {
    font-size: var(--text-base);
    font-weight: var(--font-weight-normal);
    line-height: 1.5;
  }

  /* Scrollbar personalizado */
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  }

  .dark * {
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  }

  *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  *::-webkit-scrollbar-track {
    background: transparent;
  }

  *::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  .dark *::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
  }

  *::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }

  .dark *::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }

  /* Flechas de input number personalizadas */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    opacity: 1;
    cursor: pointer;
  }

  input[type="number"]::-webkit-inner-spin-button {
    filter: brightness(1.5);
  }

  .dark input[type="number"]::-webkit-inner-spin-button {
    filter: brightness(0.8);
  }
}

```

---

## `package.json`

```json
{
  "name": "@figma/my-make-file",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite"
  },
  "dependencies": {
    "@emotion/react": "11.14.0",
    "@emotion/styled": "11.14.1",
    "@mui/icons-material": "7.3.5",
    "@mui/material": "7.3.5",
    "@popperjs/core": "2.11.8",
    "@radix-ui/react-accordion": "1.2.3",
    "@radix-ui/react-alert-dialog": "1.1.6",
    "@radix-ui/react-aspect-ratio": "1.1.2",
    "@radix-ui/react-avatar": "1.1.3",
    "@radix-ui/react-checkbox": "1.1.4",
    "@radix-ui/react-collapsible": "1.1.3",
    "@radix-ui/react-context-menu": "2.2.6",
    "@radix-ui/react-dialog": "1.1.6",
    "@radix-ui/react-dropdown-menu": "2.1.6",
    "@radix-ui/react-hover-card": "1.1.6",
    "@radix-ui/react-label": "2.1.2",
    "@radix-ui/react-menubar": "1.1.6",
    "@radix-ui/react-navigation-menu": "1.2.5",
    "@radix-ui/react-popover": "1.1.6",
    "@radix-ui/react-progress": "1.1.2",
    "@radix-ui/react-radio-group": "1.2.3",
    "@radix-ui/react-scroll-area": "1.2.3",
    "@radix-ui/react-select": "2.1.6",
    "@radix-ui/react-separator": "1.1.2",
    "@radix-ui/react-slider": "1.2.3",
    "@radix-ui/react-slot": "1.1.2",
    "@radix-ui/react-switch": "1.1.3",
    "@radix-ui/react-tabs": "1.1.3",
    "@radix-ui/react-toggle-group": "1.1.2",
    "@radix-ui/react-toggle": "1.1.2",
    "@radix-ui/react-tooltip": "1.1.8",
    "canvas-confetti": "1.9.4",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "1.1.1",
    "date-fns": "3.6.0",
    "embla-carousel-react": "8.6.0",
    "input-otp": "1.4.2",
    "lucide-react": "0.487.0",
    "motion": "12.23.24",
    "next-themes": "0.4.6",
    "react-day-picker": "8.10.1",
    "react-dnd": "16.0.1",
    "react-dnd-html5-backend": "16.0.1",
    "react-hook-form": "7.55.0",
    "react-popper": "2.3.0",
    "react-resizable-panels": "2.1.7",
    "react-responsive-masonry": "2.7.1",
    "react-router": "7.13.0",
    "react-slick": "0.31.0",
    "recharts": "2.15.2",
    "sonner": "2.0.3",
    "tailwind-merge": "3.2.0",
    "tw-animate-css": "1.3.8",
    "vaul": "1.1.2"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.12",
    "@vitejs/plugin-react": "4.7.0",
    "tailwindcss": "4.1.12",
    "vite": "6.3.5"
  },
  "peerDependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    },
    "react-dom": {
      "optional": true
    }
  },
  "pnpm": {
    "overrides": {
      "vite": "6.3.5"
    }
  }
}
```

---

## `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})

```

---

## `postcss.config.mjs`

```js
/**
 * PostCSS Configuration
 *
 * Tailwind CSS v4 (via @tailwindcss/vite) automatically sets up all required
 * PostCSS plugins — you do NOT need to include `tailwindcss` or `autoprefixer` here.
 *
 * This file only exists for adding additional PostCSS plugins, if needed.
 * For example:
 *
 * import postcssNested from 'postcss-nested'
 * export default { plugins: [postcssNested()] }
 *
 * Otherwise, you can leave this file empty.
 */
export default {}

```

---

## `index.html`

```html

  <!DOCTYPE html>
  <html lang="en">
    <head>
      
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Interfaz de control de stock</title>
      <meta name="description" content="Manage inventory effortlessly with alerts for low stock, product registration, and tracking for hardware store employees and purchasing managers." />
      <meta name="robots" content="noindex, nofollow" />
      <style>html, body { height: 100%; margin: 0; } #root { height: 100%; }</style>
      
    </head>

    <body>
      
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
      
    </body>
  </html>
  
```

---
