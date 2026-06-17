import { useEffect, useState } from "react";
import { PurchaseOrder } from "../types";
import { storage } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Calendar, Package, Building2 } from "lucide-react";
import { Navigate } from "react-router";

export function Purchases() {
  const { currentUser } = useAuth();
  const isContador = currentUser?.role === "contador";
  const isAdmin = currentUser?.role === "admin";

  if (!isContador && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    setPurchases(storage.getPurchaseOrders());
  }, []);

  const getStatusBadge = (status: PurchaseOrder["status"]) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    const labels = {
      pending: "Pendiente",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-foreground">Registro de Compras a Proveedores</h2>
        <p className="text-muted-foreground mt-1">
          Historial de pedidos realizados para reposición de stock.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No hay compras registradas aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Sucursal</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Costo Total</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(p.date + "T12:00:00").toLocaleDateString("es-AR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          {p.productName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {p.branch}
                        </div>
                      </TableCell>
                      <TableCell>{p.quantity} {p.productUnit || "unidades"}</TableCell>
                      <TableCell>${p.cost.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{p.provider}</TableCell>
                      <TableCell>{getStatusBadge(p.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}