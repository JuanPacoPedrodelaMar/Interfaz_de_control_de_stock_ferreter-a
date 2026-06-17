import { useEffect, useState } from "react";
import { Product, Movement, StockRequest } from "../types";
import { storage } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  Building2,
  AlertCircle,
  Bell,
} from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Link } from "react-router";

export function Dashboard() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [pendingRequests, setPendingRequests] = useState<StockRequest[]>([]);

  const isEmployee = currentUser?.role === "employee";
  const isContador = currentUser?.role === "contador";
  const isAdmin = currentUser?.role === "admin";
  const userBranch = currentUser?.branch;

  useEffect(() => {
    setProducts(storage.getProducts());
    setMovements(storage.getMovements());

    // Cargar solicitudes pendientes para el empleado (solo si no es contador)
    if (currentUser && !isContador) {
      const allRequests = storage.getStockRequests();
      const pending = allRequests.filter(
        (r) => r.toBranch === currentUser.branch && r.status === "pending"
      );
      setPendingRequests(pending);
    } else {
      setPendingRequests([]);
    }
  }, [currentUser, isContador]);

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
  const productsWithoutPrice = visibleProducts.filter((p) => p.price === 0);

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

      {/* Alerta de solicitudes pendientes (solo para empleados y admin) */}
      {!isContador && pendingRequests.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-400 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30">
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            Tienes <strong>{pendingRequests.length} solicitud(es) de stock pendiente(s)</strong> de otras sucursales.
            <Link to="/requests" className="underline font-medium hover:text-blue-900 dark:hover:text-blue-200 ml-1">
              Revisar solicitudes
            </Link>
          </AlertDescription>
        </div>
      )}

      {/* Alerta stock bajo - oculta para contadores */}
      {!isContador && lowStockProducts.length > 0 && (
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

      {/* Alerta productos sin precio (solo admin y contador) */}
      {(isAdmin || isContador) && productsWithoutPrice.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-400 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <AlertDescription className="text-amber-800 dark:text-amber-300">
            <strong>{productsWithoutPrice.length} producto(s)</strong> no tienen precio definido.{" "}
            {isContador ? (
              "Por favor, asigna un precio para habilitarlos a la venta."
            ) : (
              <Link to="/inventory" className="underline font-medium hover:text-amber-900 dark:hover:text-amber-200">
                Ver productos sin precio
              </Link>
            )}
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