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
