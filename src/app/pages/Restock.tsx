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
  // Empleados siempre ven solo su sucursal; admin y contador pueden elegir
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

    // Create stock request
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

            // Find warehouse stock for this product (only show to employees when requesting)
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

                  {/* Warehouse stock info (only visible when replenishing) */}
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

                  {/* Action buttons */}
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
