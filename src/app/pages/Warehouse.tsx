import { useEffect, useState } from "react";
import { Product, StockRequest } from "../types";
import { storage } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
import { useUndo } from "../contexts/UndoContext";

export function Warehouse() {
  const { currentUser } = useAuth();
  const { pushAction } = useUndo();

  const [products, setProducts] = useState<Product[]>([]);
  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  const [requestToProcess, setRequestToProcess] = useState<{
    request: StockRequest;
    action: "approve" | "reject";
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(storage.getProducts());
    setStockRequests(storage.getStockRequests());
  };

  // Only show products from Almacén Central
  const warehouseProducts = products.filter((p) => p.branch === "Almacén Central");

  const lowStockProducts = warehouseProducts.filter(
    (p) => p.currentStock <= p.minStock
  );

  const pendingRequests = stockRequests.filter((r) => r.status === "pending");

  const handleProcessRequest = (
    request: StockRequest,
    action: "approve" | "reject"
  ) => {
    setRequestToProcess({ request, action });
  };

  const confirmProcessRequest = () => {
    if (!requestToProcess || !currentUser) return;

    const { request, action } = requestToProcess;

    if (action === "approve") {
      // Find the warehouse product
      const warehouseProduct = products.find(
        (p) => p.id === request.productId && p.branch === "Almacén Central"
      );

      if (!warehouseProduct) {
        toast.error("Producto no encontrado en el almacén");
        setRequestToProcess(null);
        return;
      }

      if (warehouseProduct.currentStock < request.quantity) {
        toast.error("Stock insuficiente en el almacén");
        setRequestToProcess(null);
        return;
      }

      // Save previous state for undo
      const previousWarehouseStock = warehouseProduct.currentStock;
      const previousRequestStatus = request.status;

      // Reduce warehouse stock
      const updatedProducts = products.map((p) =>
        p.id === request.productId && p.branch === "Almacén Central"
          ? { ...p, currentStock: p.currentStock - request.quantity }
          : p
      );

      // Find or create target branch product
      let targetProduct = products.find(
        (p) => p.id === request.productId && p.branch === request.fromBranch
      );

      if (targetProduct) {
        // Update existing product in target branch
        const targetIndex = updatedProducts.findIndex(
          (p) => p.id === request.productId && p.branch === request.fromBranch
        );
        updatedProducts[targetIndex] = {
          ...updatedProducts[targetIndex],
          currentStock: updatedProducts[targetIndex].currentStock + request.quantity,
        };
      }

      storage.saveProducts(updatedProducts);
      storage.updateStockRequest(request.id, "approved", currentUser.id);

      // Create movement records
      const movements = storage.getMovements();

      // Exit from warehouse
      movements.push({
        id: Date.now().toString(),
        productId: request.productId,
        productName: request.productName,
        productBranch: "Almacén Central",
        type: "exit",
        quantity: request.quantity,
        reason: "Traslado a otra sucursal",
        description: `Traslado a ${request.fromBranch} (Solicitud #${request.id})`,
        date: new Date().toISOString(),
      });

      // Entry to target branch
      movements.push({
        id: (Date.now() + 1).toString(),
        productId: request.productId,
        productName: request.productName,
        productBranch: request.fromBranch,
        type: "entry",
        quantity: request.quantity,
        reason: "Traslado desde almacén",
        description: `Desde Almacén Central (Solicitud #${request.id})`,
        date: new Date().toISOString(),
      });

      storage.saveMovements(movements);

      // Push undo action
      pushAction({
        message: `Aprobada solicitud de ${request.quantity} unidades de ${request.productName}`,
        undo: () => {
          // Restore warehouse stock
          const restoreProducts = storage.getProducts().map((p) =>
            p.id === request.productId && p.branch === "Almacén Central"
              ? { ...p, currentStock: previousWarehouseStock }
              : p.id === request.productId && p.branch === request.fromBranch
                ? {
                    ...p,
                    currentStock: p.currentStock - request.quantity,
                  }
                : p
          );
          storage.saveProducts(restoreProducts);

          // Restore request status
          storage.updateStockRequest(request.id, previousRequestStatus);

          // Remove movements
          const currentMovements = storage.getMovements();
          const filteredMovements = currentMovements.filter(
            (m) => !m.description?.includes(`Solicitud #${request.id}`)
          );
          storage.saveMovements(filteredMovements);

          loadData();
          toast.success("Acción deshecha");
        },
        redo: () => {
          confirmProcessRequest();
        },
      });

      toast.success(
        `Solicitud aprobada. ${request.quantity} unidades transferidas a ${request.fromBranch}`
      );
    } else {
      // Reject request
      const previousStatus = request.status;

      storage.updateStockRequest(request.id, "rejected", currentUser.id);

      pushAction({
        message: `Rechazada solicitud de ${request.productName}`,
        undo: () => {
          storage.updateStockRequest(request.id, previousStatus);
          loadData();
          toast.success("Acción deshecha");
        },
        redo: () => {
          storage.updateStockRequest(request.id, "rejected", currentUser.id);
          loadData();
          toast.success("Solicitud rechazada");
        },
      });

      toast.info("Solicitud rechazada");
    }

    loadData();
    setRequestToProcess(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-foreground">
          Gestión de Almacén Central
        </h2>
        <p className="text-muted-foreground mt-1 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Inventario y solicitudes de stock
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{warehouseProducts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-amber-600">
              {lowStockProducts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Solicitudes Pendientes
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600">
              {pendingRequests.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList>
          <TabsTrigger value="requests">
            Solicitudes ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas ({lowStockProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay solicitudes pendientes</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => {
              const product = products.find(
                (p) => p.id === request.productId && p.branch === "Almacén Central"
              );
              const hasStock = product && product.currentStock >= request.quantity;

              return (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg">
                            {request.productName}
                          </h3>
                          <Badge variant="outline">{request.status}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">
                              Solicitado por:
                            </p>
                            <p className="font-medium">{request.requestedByName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Sucursal:</p>
                            <p className="font-medium">{request.fromBranch}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Cantidad:</p>
                            <p className="font-medium">{request.quantity} unidades</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Stock disponible:
                            </p>
                            <p
                              className={`font-medium ${hasStock ? "text-green-600" : "text-red-600"}`}
                            >
                              {product?.currentStock || 0} unidades
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Solicitado:{" "}
                          {new Date(request.createdAt).toLocaleString("es-ES")}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleProcessRequest(request, "approve")}
                          disabled={!hasStock}
                          size="sm"
                          variant="default"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Aprobar
                        </Button>
                        <Button
                          onClick={() => handleProcessRequest(request, "reject")}
                          size="sm"
                          variant="outline"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          {warehouseProducts.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay productos en el almacén</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {warehouseProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {product.currentStock} unidades
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Mínimo: {product.minStock}
                        </p>
                        {product.currentStock <= product.minStock && (
                          <Badge variant="outline" className="text-amber-600 mt-1">
                            Stock bajo
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {lowStockProducts.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                  <p>No hay productos con stock bajo</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            lowStockProducts.map((product) => {
              const percentage =
                (product.currentStock / (product.minStock || 1)) * 100;

              return (
                <Card key={product.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          <h3 className="font-semibold">{product.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {product.category}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Stock actual:
                            </span>{" "}
                            <span className="font-semibold text-amber-600">
                              {product.currentStock}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Mínimo:</span>{" "}
                            <span className="font-semibold">{product.minStock}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Nivel:</span>{" "}
                            <span
                              className={`font-semibold ${percentage < 50 ? "text-red-600" : "text-amber-600"}`}
                            >
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!requestToProcess}
        onOpenChange={() => setRequestToProcess(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {requestToProcess?.action === "approve"
                ? "Aprobar Solicitud"
                : "Rechazar Solicitud"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {requestToProcess?.action === "approve"
                ? `¿Está seguro de aprobar la solicitud de ${requestToProcess.request.quantity} unidades de ${requestToProcess.request.productName} para ${requestToProcess.request.fromBranch}?`
                : `¿Está seguro de rechazar la solicitud de ${requestToProcess?.request.productName}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmProcessRequest}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
