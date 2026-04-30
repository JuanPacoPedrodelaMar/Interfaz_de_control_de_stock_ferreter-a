import { useEffect, useState } from "react";
import { Product } from "../types";
import { storage } from "../utils/storage";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AlertTriangle, Package, ShoppingCart, Filter } from "lucide-react";
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
  const [products, setProducts] = useState<Product[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>("all");

  useEffect(() => {
    setProducts(storage.getProducts());
  }, []);

  const lowStockProducts = products
    .filter((p) => p.currentStock <= p.minStock)
    .filter((p) => branchFilter === "all" || p.branch === branchFilter)
    .sort((a, b) => {
      // Ordenar por gravedad: primero los que tienen menos stock relativo
      const percentA = a.currentStock / a.minStock;
      const percentB = b.currentStock / b.minStock;
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
          <p className="text-muted-foreground mt-1">
            Listado de productos que están por debajo del stock mínimo
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* H6: Reconocimiento - Filtro por sucursal */}
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
          {lowStockProducts.length > 0 && (
            <Button onClick={handlePrint} variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Imprimir Lista
            </Button>
          )}
        </div>
      </div>

      {/* Resumen */}
      {lowStockProducts.length > 0 && (
        <Card className="border-red-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <CardTitle>
                {lowStockProducts.length} producto(s) requieren atención inmediata
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              Estos productos han alcanzado o están por debajo de su stock mínimo configurado.
              Se recomienda realizar un pedido de reposición lo antes posible para evitar desabastecimiento.
            </p>
          </CardContent>
        </Card>
      )}

      {/* H1: Visibilidad del estado */}
      {branchFilter !== "all" && lowStockProducts.length === 0 && products.filter(p => p.currentStock <= p.minStock).length > 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No hay productos con stock bajo en la sucursal "{branchFilter}". Cambia el filtro para ver otros resultados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lista de productos a reponer */}
      <div className="space-y-4">
        {lowStockProducts.length === 0 && products.filter(p => p.currentStock <= p.minStock).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                ¡Todo está en orden!
              </h3>
              <p className="text-muted-foreground">
                No hay productos que requieran reposición en este momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          lowStockProducts.map((product) => {
            const deficit = product.minStock - product.currentStock;
            const percentage = (product.currentStock / product.minStock) * 100;
            const severity =
              percentage <= 0
                ? "critical"
                : percentage <= 50
                ? "high"
                : percentage <= 100
                ? "medium"
                : "low";

            const severityColors = {
              critical: "border-red-600",
              high: "border-red-500",
              medium: "border-red-400",
              low: "border-red-300",
            };

            const severityLabels = {
              critical: "CRÍTICO",
              high: "URGENTE",
              medium: "ATENCIÓN",
              low: "REPONER",
            };

            const severityBadgeVariant = {
              critical: "destructive" as const,
              high: "destructive" as const,
              medium: "default" as const,
              low: "secondary" as const,
            };

            return (
              <Card key={product.id} className={severityColors[severity]}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge variant={severityBadgeVariant[severity]}>
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
                      <p className="text-lg font-semibold text-red-600">
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
                      <p className="text-lg font-semibold text-green-600">
                        $
                        {(product.price * Math.max(deficit, product.minStock)).toLocaleString(
                          "es-AR",
                          { minimumFractionDigits: 2 }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Nivel de stock</span>
                      <span className="font-medium">{percentage.toFixed(0)}% del mínimo</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          severity === "critical"
                            ? "bg-red-600"
                            : severity === "high"
                            ? "bg-red-500"
                            : severity === "medium"
                            ? "bg-red-400"
                            : "bg-red-300"
                        }`}
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
                <span className="text-2xl font-semibold text-green-600">
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