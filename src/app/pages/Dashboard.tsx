import { useEffect, useState } from "react";
import { Product, Movement } from "../types";
import { storage } from "../utils/storage";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AlertTriangle, Package, TrendingUp, TrendingDown } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Link } from "react-router";

export function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  useEffect(() => {
    setProducts(storage.getProducts());
    setMovements(storage.getMovements());
  }, []);

  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStock);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.currentStock, 0);

  const today = new Date().toISOString().split("T")[0];
  const todayMovements = movements.filter((m) => m.date === today);
  const todayEntries = todayMovements.filter((m) => m.type === "entry").length;
  const todayExits = todayMovements.filter((m) => m.type === "exit").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Resumen general del inventario</p>
      </div>

      {/* Alertas de stock bajo */}
      {lowStockProducts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{lowStockProducts.length} producto(s)</strong> están por debajo del stock
            mínimo.{" "}
            <Link to="/restock" className="underline font-medium">
              Ver productos a reponer
            </Link>
          </AlertDescription>
        </Alert>
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
              <div className="text-2xl font-semibold">{products.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Productos registrados</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/restock">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-red-600">{lowStockProducts.length}</div>
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
          <CardTitle>Valor Total del Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-primary">
            ${totalValue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Basado en el stock actual y precios registrados
          </p>
        </CardContent>
      </Card>

      {/* Productos con stock crítico */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos con Stock Crítico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.category} • {product.branch || "Sin sucursal"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">
                      Stock: {product.currentStock} / {product.minStock}
                    </p>
                    <p className="text-sm text-muted-foreground">Mínimo requerido</p>
                  </div>
                </div>
              ))}
              {lowStockProducts.length > 5 && (
                <Link
                  to="/restock"
                  className="block text-center text-sm text-primary hover:text-primary/80 font-medium pt-2"
                >
                  Ver todos los productos a reponer ({lowStockProducts.length})
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}