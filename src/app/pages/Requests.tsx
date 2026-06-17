import { useEffect, useState } from "react";
import { StockRequest } from "../types";
import { storage } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { useUndo } from "../contexts/UndoContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Check, X, Clock, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router";

export function Requests() {
  const { currentUser } = useAuth();
  const { pushAction } = useUndo();
  const isEmployee = currentUser?.role === "employee";
  const isAdmin = currentUser?.role === "admin";
  const isContador = currentUser?.role === "contador";

  if (isContador) {
    return <Navigate to="/purchases" replace />;
  }

  const userBranch = currentUser?.branch;

  const [requests, setRequests] = useState<StockRequest[]>([]);

  useEffect(() => {
    setRequests(storage.getStockRequests());
  }, []);

  // Filtrar según rol: admin ve todas, empleado ve las que involucran su sucursal
  const filteredRequests = requests.filter((r) => {
    if (isAdmin) return true;
    if (isEmployee) {
      return r.fromBranch === userBranch || r.toBranch === userBranch;
    }
    return false;
  });

  // Separar solicitudes recibidas (para mi sucursal) y enviadas (desde mi sucursal)
  const received = filteredRequests.filter((r) => r.toBranch === userBranch && r.status === "pending");
  const sent = filteredRequests.filter((r) => r.fromBranch === userBranch);
  const other = filteredRequests.filter((r) => isAdmin || (r.status !== "pending" && (r.fromBranch === userBranch || r.toBranch === userBranch)));

  const handleApprove = (request: StockRequest) => {
    const updated = storage.updateStockRequestStatus(request.id, "approved", currentUser!.id, currentUser!.fullName);
    if (!updated) return;

    // Actualizar stock: restar de la sucursal origen (toBranch) y sumar a la destino (fromBranch)
    const products = storage.getProducts();
    // Producto en la sucursal destino (la que recibe)
    const destProduct = products.find((p) => p.id === request.productId && p.branch === request.toBranch);
    // Producto en la sucursal origen (la que da)
    const originProduct = products.find((p) => p.id === request.productId && p.branch === request.fromBranch);

    if (destProduct && originProduct) {
      if (originProduct.currentStock < request.quantity) {
        toast.error(`Stock insuficiente en ${request.fromBranch} para aprobar la solicitud.`);
        return;
      }
      // Restar de origen
      const updatedProducts = products.map((p) => {
        if (p.id === request.productId && p.branch === request.fromBranch) {
          return { ...p, currentStock: p.currentStock - request.quantity };
        }
        if (p.id === request.productId && p.branch === request.toBranch) {
          return { ...p, currentStock: p.currentStock + request.quantity };
        }
        return p;
      });
      storage.saveProducts(updatedProducts);
    }

    // Actualizar lista
    setRequests(storage.getStockRequests());
    toast.success(`Solicitud aprobada: ${request.quantity} ${request.productUnit || "unidades"} de "${request.productName}"`);
  };

  const handleReject = (request: StockRequest) => {
    const updated = storage.updateStockRequestStatus(request.id, "rejected", currentUser!.id, currentUser!.fullName);
    if (!updated) return;
    setRequests(storage.getStockRequests());
    toast.info(`Solicitud rechazada: ${request.quantity} ${request.productUnit || "unidades"} de "${request.productName}"`);
  };

  const getStatusBadge = (status: StockRequest["status"]) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    const labels = {
      pending: "Pendiente",
      approved: "Aprobada",
      rejected: "Rechazada",
    };
    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-foreground">Solicitudes de Stock</h2>
        <p className="text-muted-foreground mt-1">
          Gestiona las solicitudes de stock entre sucursales.
        </p>
      </div>

      {/* Solicitudes recibidas (pendientes) */}
      {received.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Solicitudes recibidas (pendientes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Sucursal origen</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {received.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.productName}</TableCell>
                      <TableCell>{r.quantity} {r.productUnit || "unidades"}</TableCell>
                      <TableCell>{r.requestedByName}</TableCell>
                      <TableCell>{r.fromBranch}</TableCell>
                      <TableCell>{new Date(r.createdAt).toLocaleDateString("es-AR")}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button size="sm" variant="default" onClick={() => handleApprove(r)}>
                          <Check className="h-4 w-4 mr-1" /> Aprobar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(r)}>
                          <X className="h-4 w-4 mr-1" /> Rechazar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solicitudes enviadas y otras (historial) */}
      {(sent.length > 0 || other.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            {sent.length === 0 && other.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">No hay solicitudes previas.</div>
            )}
            {(sent.length > 0 || other.length > 0) && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Desde</TableHead>
                      <TableHead>Hacia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sent.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.productName}</TableCell>
                        <TableCell>{r.quantity} {r.productUnit || "unidades"}</TableCell>
                        <TableCell>{r.fromBranch}</TableCell>
                        <TableCell>{r.toBranch}</TableCell>
                        <TableCell>{getStatusBadge(r.status)}</TableCell>
                        <TableCell>{new Date(r.createdAt).toLocaleDateString("es-AR")}</TableCell>
                      </TableRow>
                    ))}
                    {other.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.productName}</TableCell>
                        <TableCell>{r.quantity} {r.productUnit || "unidades"}</TableCell>
                        <TableCell>{r.fromBranch}</TableCell>
                        <TableCell>{r.toBranch}</TableCell>
                        <TableCell>{getStatusBadge(r.status)}</TableCell>
                        <TableCell>{new Date(r.createdAt).toLocaleDateString("es-AR")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {received.length === 0 && sent.length === 0 && other.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay solicitudes de stock entre sucursales.
          </CardContent>
        </Card>
      )}
    </div>
  );
}