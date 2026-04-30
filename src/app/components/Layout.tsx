import { Link, Outlet, useLocation } from "react-router";
import { Package, LayoutDashboard, ArrowLeftRight, AlertTriangle, Moon, Sun } from "lucide-react";
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

export function Layout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Inventario", path: "/inventory", icon: Package },
    { name: "Movimientos", path: "/movements", icon: ArrowLeftRight },
    { name: "A Reponer", path: "/restock", icon: AlertTriangle },
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
                {/* H7: Flexibilidad - Búsqueda global con atajo visible */}
                <GlobalSearch />
                {/* H10: Ayuda - Tooltip explicativo */}
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
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-card border-b border-border" aria-label="Navegación principal">
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
                      "flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors",
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