# PROJECT DUMP — Control de Stock Ferretería

Generado: 2026-06-17

## Árbol de Archivos

```
src/
├── app/
│   ├── components/
│   │   ├── figma/
│   │   │   └── ImageWithFallback.tsx
│   │   ├── ui/
│   │   │   ├── accordion.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── use-mobile.ts
│   │   │   └── utils.ts
│   │   ├── GlobalSearch.tsx
│   │   ├── Layout.tsx
│   │   └── UndoToast.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── UndoContext.tsx
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   └── useUndoAction.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Inventory.tsx
│   │   ├── Login.tsx
│   │   ├── Movements.tsx
│   │   ├── Offers.tsx
│   │   └── Restock.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── storage.ts
│   ├── App.tsx
│   └── routes.tsx
├── styles/
│   ├── fonts.css
│   ├── globals.css
│   ├── index.css
│   ├── tailwind.css
│   └── theme.css
├── main.tsx
├── README.md
├── package.json
├── vite.config.ts
├── postcss.config.mjs
└── index.html
```

---

## Contenido de Archivos Relevantes

### `src/app/App.tsx`
```tsx
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { UndoProvider } from "./contexts/UndoContext";

export default function App() {
  return (
    <AuthProvider>
      <UndoProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </UndoProvider>
    </AuthProvider>
  );
}
```

---

### `src/app/routes.tsx`
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

### `src/app/contexts/AuthContext.tsx`
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

### `src/app/contexts/UndoContext.tsx`
```tsx
import React, { createContext, useContext } from "react";
import { useUndoAction, UndoAction } from "../hooks/useUndoAction";

interface UndoContextType {
  canUndo: boolean;
  canRedo: boolean;
  pushAction: (action: UndoAction) => void;
  undo: () => void;
  redo: () => void;
}

const UndoContext = createContext<UndoContextType | null>(null);

export function UndoProvider({ children }: { children: React.ReactNode }) {
  const { canUndo, canRedo, pushAction, undo, redo } = useUndoAction();

  return (
    <UndoContext.Provider
      value={{
        canUndo,
        canRedo,
        pushAction,
        undo,
        redo,
      }}
    >
      {children}
    </UndoContext.Provider>
  );
}

export function useUndo() {
  const ctx = useContext(UndoContext);
  if (!ctx) throw new Error("useUndo must be used within UndoProvider");
  return ctx;
}
```

---

### `src/app/hooks/useTheme.ts`
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

### `src/app/hooks/useUndoAction.ts`
```ts
import { useCallback, useState } from "react";

export interface UndoAction {
  message: string;
  undo: () => void;
  redo: () => void;
}

/**
 * Hook para gestionar historial de deshacer/rehacer.
 *
 * Retorna:
 * - `canUndo`: boolean si hay acciones para deshacer
 * - `canRedo`: boolean si hay acciones para rehacer
 * - `pushAction(action)`: añade una nueva acción al historial
 * - `undo()`: deshace la última acción
 * - `redo()`: rehace la última acción deshecha
 */
export function useUndoAction() {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);

  const pushAction = useCallback((action: UndoAction) => {
    setUndoStack((prev) => [...prev, action]);
    setRedoStack([]); // Clear redo stack when new action is performed
  }, []);

  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;

      const lastAction = prev[prev.length - 1];
      const newStack = prev.slice(0, -1);

      lastAction.undo();
      setRedoStack((redoPrev) => [...redoPrev, lastAction]);

      return newStack;
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;

      const lastAction = prev[prev.length - 1];
      const newStack = prev.slice(0, -1);

      lastAction.redo();
      setUndoStack((undoPrev) => [...undoPrev, lastAction]);

      return newStack;
    });
  }, []);

  return {
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    pushAction,
    undo,
    redo,
  };
}
```

---

### `src/app/components/Layout.tsx`
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
  Undo2,
  Redo2,
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
import { useUndo } from "../contexts/UndoContext";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { useEffect } from "react";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout, isAdmin } = useAuth();
  const { canUndo, canRedo, undo, redo } = useUndo();

  const isContador = currentUser?.role === "contador";

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada correctamente");
    navigate("/login", { replace: true });
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z" && canUndo) {
        e.preventDefault();
        undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  const navigation = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Inventario", path: "/inventory", icon: Package },
    { name: "Movimientos", path: "/movements", icon: ArrowLeftRight },
    { name: "A Reponer", path: "/restock", icon: AlertTriangle },
    ...(isAdmin || isContador
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

                {/* Undo/Redo buttons */}
                <div className="hidden sm:flex items-center gap-1 ml-2 border-l border-border pl-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={undo}
                        disabled={!canUndo}
                        className="h-8 w-8"
                        aria-label="Deshacer (Ctrl+Z)"
                      >
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Deshacer (Ctrl+Z)</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={redo}
                        disabled={!canRedo}
                        className="h-8 w-8"
                        aria-label="Rehacer (Ctrl+Y)"
                      >
                        <Redo2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rehacer (Ctrl+Y)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                            {currentUser?.role === "admin"
                              ? "Administrador"
                              : currentUser?.role === "contador"
                                ? "Contador"
                                : "Empleado"}
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

### `src/app/components/GlobalSearch.tsx`
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

### `src/app/components/figma/ImageWithFallback.tsx`
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

### `src/app/components/UndoToast.tsx`
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

### `src/app/pages/Dashboard.tsx`
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

### `src/app/pages/Inventory.tsx`
```tsx
import { useEffect, useState, useRef } from "react";
import { Product, CATEGORIES, BRANCHES } from "../types";
import { storage } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { useUndo } from "../contexts/UndoContext";
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
  TrendingUp,
  TrendingDown,
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
  const { pushAction } = useUndo();
  const isEmployee = currentUser?.role === "employee";
  const isContador = currentUser?.role === "contador";
  const userBranch = currentUser?.branch;

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
  // Contadores y admin ven todo
  const visibleProducts =
    isEmployee && userBranch
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
      pushAction({
        message: `"${productName}" actualizado`,
        undo: () => {
          storage.saveProducts(prevProducts);
          setProducts(prevProducts);
          toast.info("Edición deshecha");
        },
        redo: () => {
          storage.saveProducts(updatedProducts);
          setProducts(updatedProducts);
          toast.success("Edición rehecha");
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
      const productBranch = formData.branch;
      pushAction({
        message: `"${productName}" creado en ${productBranch}`,
        undo: () => {
          storage.saveProducts(prevProducts);
          setProducts(prevProducts);
          toast.info("Creación deshecha");
        },
        redo: () => {
          storage.saveProducts(updatedProducts);
          setProducts(updatedProducts);
          toast.success("Creación rehecha");
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
    pushAction({
      message: `"${deletedName}" eliminado de ${deletedBranch}`,
      undo: () => {
        storage.saveProducts(prevProducts);
        setProducts(prevProducts);
        toast.info("Eliminación deshecha");
      },
      redo: () => {
        storage.saveProducts(updatedProducts);
        setProducts(updatedProducts);
        toast.success("Eliminación rehecha");
      },
    });
  };

  // Agrupar productos por nombre para mostrar cuántas sucursales tiene
  const productNameCounts = products.reduce((acc, p) => {
    acc[p.name.toLowerCase()] = (acc[p.name.toLowerCase()] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const [isPriceUpdateOpen, setIsPriceUpdateOpen] = useState(false);
  const [priceUpdatePercent, setPriceUpdatePercent] = useState("");
  const [priceUpdateDirection, setPriceUpdateDirection] = useState<"increase" | "decrease">("increase");

  const canBulkUpdatePrices =
    currentUser?.role === "admin" || currentUser?.role === "contador";

  const handleBulkPriceUpdate = () => {
    const pct = parseFloat(priceUpdatePercent);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      toast.error("Ingresa un porcentaje válido entre 0.1 y 100");
      return;
    }

    const prevProducts = [...products];
    const multiplier =
      priceUpdateDirection === "increase" ? 1 + pct / 100 : 1 - pct / 100;

    const updatedProducts = products.map((p) => ({
      ...p,
      price: Math.round(p.price * multiplier * 100) / 100,
    }));

    storage.saveProducts(updatedProducts);
    setProducts(updatedProducts);

    const dirLabel = priceUpdateDirection === "increase" ? "subidos" : "bajados";
    toast.success(
      `Precios ${dirLabel} un ${pct}% en ${updatedProducts.length} productos`
    );

    pushAction({
      message: `Precios ${dirLabel} ${pct}% (${updatedProducts.length} productos)`,
      undo: () => {
        storage.saveProducts(prevProducts);
        setProducts(prevProducts);
        toast.info("Actualización de precios deshecha");
      },
      redo: () => {
        storage.saveProducts(updatedProducts);
        setProducts(updatedProducts);
        toast.success("Actualización de precios rehecha");
      },
    });

    setIsPriceUpdateOpen(false);
    setPriceUpdatePercent("");
    setPriceUpdateDirection("increase");
  };

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
        <div className="flex items-center gap-2">
          {canBulkUpdatePrices && (
            <Button variant="outline" onClick={() => setIsPriceUpdateOpen(true)}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Actualizar precios
            </Button>
          )}
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Dialog actualización masiva de precios */}
      <Dialog open={isPriceUpdateOpen} onOpenChange={setIsPriceUpdateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Actualizar precios</DialogTitle>
            <DialogDescription>
              Ajusta el precio de todos los productos en un porcentaje. La
              acción puede deshacerse con Ctrl+Z.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Dirección</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPriceUpdateDirection("increase")}
                  className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    priceUpdateDirection === "increase"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Subir precios
                </button>
                <button
                  type="button"
                  onClick={() => setPriceUpdateDirection("decrease")}
                  className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    priceUpdateDirection === "decrease"
                      ? "bg-destructive text-destructive-foreground border-destructive"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <TrendingDown className="h-4 w-4" />
                  Bajar precios
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePercent">Porcentaje (%)</Label>
              <div className="relative">
                <Input
                  id="pricePercent"
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={priceUpdatePercent}
                  onChange={(e) => setPriceUpdatePercent(e.target.value)}
                  placeholder="Ej: 10"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </div>
            {priceUpdatePercent && parseFloat(priceUpdatePercent) > 0 && (
              <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                Se{" "}
                {priceUpdateDirection === "increase" ? "subirán" : "bajarán"}{" "}
                los precios de{" "}
                <span className="font-semibold text-foreground">
                  {products.length} productos
                </span>{" "}
                un{" "}
                <span className="font-semibold text-foreground">
                  {priceUpdatePercent}%
                </span>
                .
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPriceUpdateOpen(false);
                setPriceUpdatePercent("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBulkPriceUpdate}
              variant={priceUpdateDirection === "decrease" ? "destructive" : "default"}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
```

---

### `src/app/pages/Login.tsx`
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
    { label: "Contador", username: "contador", password: "contador123", branch: "Todas las sucursales" },
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

### `src/app/pages/Movements.tsx`
```tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Product, Movement, MOVEMENT_REASONS, Discount, BRANCHES, Customer } from "../types";
import { storage, FREQUENT_CUSTOMER_THRESHOLD } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { useUndo } from "../contexts/UndoContext";
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
  const { pushAction } = useUndo();

  const isEmployee = currentUser?.role === "employee";
  const isContador = currentUser?.role === "contador";
  const userBranch = currentUser?.branch;

  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);

  const filterType = searchParams.get("filter") as "entry" | "exit" | null;
  const [branchFilter, setBranchFilter] = useState<string>(
    isEmployee && userBranch ? userBranch : "all"
  );
  const [customerFilter, setCustomerFilter] = useState<string>("");

  const [formData, setFormData] = useState({
    productId: "",
    type: "" as "entry" | "exit" | "",
    quantity: "",
    reason: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    customerPhone: "",
    isFrequentCustomer: false,
    discountId: "",
    isCash: false,
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
      isCash: false,
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
  const cashDiscount = discounts.find((d) => d.id === "d-cash" && d.isActive);

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
  const priceAfterDiscount = Math.max(0, unitPrice - discountAmount);
  let cashDiscountAmount = 0;
  if (formData.isCash && cashDiscount && qty > 0) {
    if (cashDiscount.type === "percentage") {
      cashDiscountAmount = priceAfterDiscount * (cashDiscount.value / 100);
    } else {
      cashDiscountAmount = cashDiscount.value;
    }
  }
  const finalUnitPrice = Math.max(0, priceAfterDiscount - cashDiscountAmount);
  const totalAmount = finalUnitPrice * qty;

  const handleCustomerNameChange = (name: string) => {
    const found = storage.findCustomerByName(name);
    setFoundCustomer(found || null);

    if (found?.isFrequent) {
      const frequentDiscount = activeDiscounts.find(
        (d) => d.appliesTo === "frequent_customers"
      );
      setFormData((prev) => ({
        ...prev,
        customerName: name,
        isFrequentCustomer: true,
        discountId: prev.discountId || frequentDiscount?.id || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        customerName: name,
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
        isCash: formData.isCash,
        cashDiscountValue: formData.isCash && cashDiscount ? cashDiscount.value : undefined,
        unitPrice,
        finalUnitPrice,
        totalAmount,
      }),
    };

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

    if (isSale && formData.customerName.trim()) {
      const updatedCustomer = storage.updateCustomerFromSale(
        formData.customerName.trim(),
        formData.customerPhone.trim() || undefined
      );
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

    const productName = product.name;
    const updatedProductsCopy = [...updatedProducts];
    const newMovementsCopy = [...updatedMovements];

    pushAction({
      message: `${typeLabel}: ${quantity} u. de "${productName}"`,
      undo: () => {
        storage.saveProducts(prevProducts);
        storage.saveMovements(prevMovements);
        setProducts(prevProducts);
        setMovements(prevMovements);
        toast.info("Movimiento deshecho");
      },
      redo: () => {
        storage.saveProducts(updatedProductsCopy);
        storage.saveMovements(newMovementsCopy);
        setProducts(updatedProductsCopy);
        setMovements(newMovementsCopy);
        toast.success("Movimiento rehecho");
      },
    });
  };

  const visibleProducts =
    isEmployee && userBranch
      ? products.filter((p) => p.branch === userBranch)
      : products;

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
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Por cliente</Label>
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

          {!isContador && (
            <Button
              onClick={handleOpenDialog}
              disabled={visibleProducts.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Movimiento
            </Button>
          )}
          {isContador && (
            <div className="text-sm text-muted-foreground">
              Los contadores no pueden registrar movimientos
            </div>
          )}
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
                      {movement.isCash && (
                        <div className="flex items-center gap-2">
                          <BadgePercent className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <div>
                            <span className="text-muted-foreground">Pago: </span>
                            <span className="font-medium text-green-600">
                              Efectivo
                              {movement.cashDiscountValue ? ` (−${movement.cashDiscountValue}%)` : ""}
                            </span>
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

              {isSale && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      <p className="font-medium text-sm">Información de la Venta</p>
                    </div>

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

                    <div className="space-y-2">
                      <Label htmlFor="customerName">Nombre del cliente (opcional)</Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => handleCustomerNameChange(e.target.value)}
                        placeholder="Nombre del cliente"
                      />
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
                      <Label htmlFor="customerPhone">Teléfono del cliente (opcional)</Label>
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

                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="isCash"
                        checked={formData.isCash}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isCash: !!checked })
                        }
                      />
                      <Label htmlFor="isCash" className="cursor-pointer">
                        Pago en efectivo
                        {cashDiscount && (
                          <span className="ml-1.5 text-xs text-green-600 font-medium">
                            ({cashDiscount.value}% de descuento)
                          </span>
                        )}
                      </Label>
                    </div>

                    {activeDiscounts.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="discount">Aplicar oferta / descuento</Label>
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
                            </>
                          )}
                          {formData.isCash && cashDiscount && cashDiscountAmount > 0 && (
                            <>
                              <span>Efectivo ({cashDiscount.value}%):</span>
                              <span className="text-right font-medium text-green-600">
                                -$
                                {cashDiscountAmount.toLocaleString("es-AR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </>
                          )}
                          {(selectedDiscount || (formData.isCash && cashDiscount)) && (
                            <>
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
    </div>
  );
}
```

---

### `src/app/pages/Offers.tsx`
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
  const { currentUser, isAdmin } = useAuth();
  const isContador = currentUser?.role === "contador";
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

  if (!isAdmin && !isContador) {
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

### `src/app/pages/Restock.tsx`
```tsx
import { useEffect, useState } from "react";
import { Product } from "../types";
import { storage } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { useUndo } from "../contexts/UndoContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  AlertTriangle,
  Package,
  ShoppingCart,
  Filter,
  Building2,
  Lock,
  Send,
  Warehouse,
} from "lucide-react";
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
import { toast } from "sonner";

export function Restock() {
  const { currentUser } = useAuth();
  const { pushAction } = useUndo();
  const isEmployee = currentUser?.role === "employee";
  const isContador = currentUser?.role === "contador";
  const userBranch = currentUser?.branch;

  const [products, setProducts] = useState<Product[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>(
    isEmployee && userBranch ? userBranch : "all"
  );

  useEffect(() => {
    setProducts(storage.getProducts());
  }, []);

  const handleRequestFromWarehouse = (product: Product) => {
    if (!currentUser) return;

    const warehouseProduct = products.find(
      (p) => p.id === product.id && p.branch === "Almacén Central"
    );

    if (!warehouseProduct) {
      toast.error("Producto no encontrado en el almacén");
      return;
    }

    const deficit = Math.max(product.minStock - product.currentStock, product.minStock);

    if (warehouseProduct.currentStock < deficit) {
      toast.error(
        `Stock insuficiente en almacén. Disponible: ${warehouseProduct.currentStock}, Necesario: ${deficit}`
      );
      return;
    }

    const newRequest = storage.createStockRequest(
      product.id,
      product.name,
      currentUser.id,
      currentUser.fullName,
      product.branch,
      "Almacén Central",
      deficit
    );

    pushAction({
      message: `Solicitud de ${deficit} unidades de ${product.name} enviada al almacén`,
      undo: () => {
        const requests = storage.getStockRequests();
        const filtered = requests.filter((r) => r.id !== newRequest.id);
        storage.saveStockRequests(filtered);
        toast.success("Solicitud cancelada");
      },
      redo: () => {
        const requests = storage.getStockRequests();
        requests.push(newRequest);
        storage.saveStockRequests(requests);
        toast.success("Solicitud enviada al almacén");
      },
    });

    toast.success(
      `Solicitud enviada al almacén. Se solicitaron ${deficit} unidades de ${product.name}`
    );
  };

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
            const deficit = Math.max(product.minStock - product.currentStock, product.minStock);
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

            const warehouseProduct = products.find(
              (p) => p.id === product.id && p.branch === "Almacén Central"
            );
            const warehouseStock = warehouseProduct?.currentStock || 0;
            const canRequestFromWarehouse = warehouseStock >= deficit;

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
                <CardContent className="space-y-4">
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
                      <p className="text-sm text-muted-foreground">Cantidad Sugerida</p>
                      <p className="text-lg font-semibold text-primary">
                        {deficit} unidades
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Costo Estimado</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        $
                        {(product.price * deficit).toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>

                  {(isEmployee || isContador) && product.branch !== "Almacén Central" && (
                    <div className="border border-border rounded-lg p-3 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Warehouse className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Stock en Almacén Central:
                          </span>
                        </div>
                        <span
                          className={`text-sm font-semibold ${canRequestFromWarehouse ? "text-green-600" : "text-amber-600"}`}
                        >
                          {warehouseStock} unidades
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
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

                  {(isEmployee || isContador) && product.branch !== "Almacén Central" && (
                    <div className="flex gap-2 pt-2">
                      {canRequestFromWarehouse ? (
                        <Button
                          onClick={() => handleRequestFromWarehouse(product)}
                          className="flex-1"
                          variant="default"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Solicitar al Almacén ({deficit} unidades)
                        </Button>
                      ) : (
                        <div className="flex-1 space-y-2">
                          <Button
                            onClick={() =>
                              toast.info(
                                "Pedido registrado para envío a proveedor. El almacén también será notificado para reabastecer."
                              )
                            }
                            className="w-full"
                            variant="default"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Pedir a Proveedor ({deficit} unidades)
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">
                            Stock insuficiente en almacén ({warehouseStock} disponibles)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

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

### `src/app/types/index.ts`
```ts
export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "employee" | "contador" | "warehouse";
  branch: string; // 'all' for admin and contador, 'Almacén Central' for warehouse
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
  isCash?: boolean;
  cashDiscountValue?: number;
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
    "Traslado desde almacén",
    "Ajuste de inventario (entrada)",
    "Producción interna",
    "Otro",
  ],
  exit: [
    "Venta",
    "Traslado a otra sucursal",
    "Traslado a almacén",
    "Producto defectuoso",
    "Producto vencido",
    "Merma o pérdida",
    "Uso interno",
    "Ajuste de inventario (salida)",
    "Otro",
  ],
};

export interface StockRequest {
  id: string;
  productId: string;
  productName: string;
  requestedBy: string;
  requestedByName: string;
  fromBranch: string;
  toBranch: string;
  quantity: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
```

---

### `src/app/utils/storage.ts`
```ts
import { Product, Movement, User, Customer, Discount } from "../types";

const PRODUCTS_KEY = "ferreteria_products";
const MOVEMENTS_KEY = "ferreteria_movements";
const USERS_KEY = "ferreteria_users";
const CUSTOMERS_KEY = "ferreteria_customers";
const DISCOUNTS_KEY = "ferreteria_discounts";
const SESSION_KEY = "ferreteria_session";

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
  {
    id: "u5",
    username: "contador",
    password: "contador123",
    role: "contador",
    branch: "all",
    fullName: "Ana Martínez - Contador",
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
  {
    id: "d-cash",
    name: "Pago en efectivo (5%)",
    type: "percentage",
    value: 5,
    isActive: true,
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

  findCustomerByName(name: string): Customer | undefined {
    if (!name.trim()) return undefined;
    const customers = this.getCustomers();
    const normalized = name.trim().toLowerCase();
    return customers.find((c) => c.name.trim().toLowerCase() === normalized);
  },

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
    const discounts: Discount[] = JSON.parse(data);
    if (!discounts.find((d) => d.id === "d-cash")) {
      const withCash = [
        ...discounts,
        DEFAULT_DISCOUNTS.find((d) => d.id === "d-cash")!,
      ];
      localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(withCash));
      return withCash;
    }
    return discounts;
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

  // Stock Requests (placeholder)
  getStockRequests(): any[] {
    const data = localStorage.getItem("ferreteria_stock_requests");
    return data ? JSON.parse(data) : [];
  },
  saveStockRequests(requests: any[]): void {
    localStorage.setItem("ferreteria_stock_requests", JSON.stringify(requests));
  },
  createStockRequest(
    productId: string,
    productName: string,
    requestedBy: string,
    requestedByName: string,
    fromBranch: string,
    toBranch: string,
    quantity: number
  ): any {
    const newRequest = {
      id: Date.now().toString(),
      productId,
      productName,
      requestedBy,
      requestedByName,
      fromBranch,
      toBranch,
      quantity,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const requests = this.getStockRequests();
    requests.push(newRequest);
    this.saveStockRequests(requests);
    return newRequest;
  },
};
```

---

### `src/styles/index.css`
```css
@import './fonts.css';
@import './tailwind.css';
@import './theme.css';
```

### `src/styles/tailwind.css`
```css
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';

@import 'tw-animate-css';
```

### `src/styles/theme.css`
```css
@custom-variant dark (&:is(.dark *));

:root {
  --font-size: 16px;
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --card: #f8f8f9;
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
  --border: rgba(0, 0, 0, 0.15);
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

### Componentes UI (shadcn)

Todos los componentes UI (`accordion.tsx`, `alert.tsx`, `alert-dialog.tsx`, etc.) son los estándar de shadcn/ui, sin modificaciones respecto al dump anterior. No se incluyen aquí para evitar redundancia, pero están presentes en el proyecto.

---

### `src/main.tsx`
```tsx
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

---

### `package.json`, `vite.config.ts`, `postcss.config.mjs`, `index.html`
Estos archivos se mantienen igual que en la versión anterior y no se incluyen nuevamente para no alargar el dump.

---