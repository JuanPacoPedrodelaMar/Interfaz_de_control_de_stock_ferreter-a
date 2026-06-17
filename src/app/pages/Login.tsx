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
