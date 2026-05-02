import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Product, Movement, MOVEMENT_REASONS } from "../types";
import { storage } from "../utils/storage";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Plus, TrendingUp, TrendingDown, Calendar, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";

export function Movements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filterType = searchParams.get("filter") as "entry" | "exit" | null;

  const [formData, setFormData] = useState({
    productId: "",
    type: "" as "entry" | "exit" | "",
    quantity: "",
    reason: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [formErrors, setFormErrors] = useState({
    productId: "",
    type: "",
    quantity: "",
    reason: "",
    description: "",
    date: "",
  });

  useEffect(() => {
    setProducts(storage.getProducts());
    setMovements(storage.getMovements());
  }, []);

  const handleOpenDialog = () => {
    setFormData({
      productId: "",
      type: "",
      quantity: "",
      reason: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setFormErrors({
      productId: "",
      type: "",
      quantity: "",
      reason: "",
      description: "",
      date: "",
    });
    setIsDialogOpen(true);
  };

  const selectedProduct = products.find((p) => p.id === formData.productId);

  const validateForm = () => {
    const errors = {
      productId: "",
      type: "",
      quantity: "",
      reason: "",
      description: "",
      date: "",
    };
    let isValid = true;

    if (!formData.productId) {
      errors.productId = "Debes seleccionar un producto";
      isValid = false;
    }

    if (!formData.type) {
      errors.type = "Debes seleccionar el tipo de movimiento";
      isValid = false;
    }

    if (!formData.quantity) {
      errors.quantity = "La cantidad es obligatoria";
      isValid = false;
    } else if (parseInt(formData.quantity) <= 0) {
      errors.quantity = "La cantidad debe ser mayor a 0";
      isValid = false;
    } else if (formData.type === "exit" && selectedProduct && parseInt(formData.quantity) > selectedProduct.currentStock) {
      errors.quantity = `No puedes retirar más de ${selectedProduct.currentStock} unidades (stock disponible)`;
      isValid = false;
    }

    if (!formData.reason) {
      errors.reason = "Debes seleccionar un motivo";
      isValid = false;
    } else if (formData.reason === "Otro" && !formData.description.trim()) {
      errors.description = "Cuando seleccionas 'Otro', debes explicar el motivo en la descripción";
      isValid = false;
    } else if (formData.reason === "Otro" && formData.description.trim().length < 10) {
      errors.description = "La descripción debe tener al menos 10 caracteres";
      isValid = false;
    }

    if (!formData.date) {
      errors.date = "La fecha es obligatoria";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    const product = products.find((p) => p.id === formData.productId);
    if (!product) {
      toast.error("Producto no encontrado");
      return;
    }

    const quantity = parseInt(formData.quantity);

    // Crear el movimiento
    const newMovement: Movement = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      type: formData.type,
      quantity: quantity,
      reason: formData.reason,
      description: formData.description.trim() || undefined,
      date: formData.date,
    };

    // Actualizar el stock del producto
    const updatedProducts = products.map((p) =>
      p.id === product.id
        ? {
            ...p,
            currentStock:
              formData.type === "entry"
                ? p.currentStock + quantity
                : p.currentStock - quantity,
          }
        : p
    );

    const updatedMovements = [newMovement, ...movements];

    storage.saveProducts(updatedProducts);
    storage.saveMovements(updatedMovements);
    setProducts(updatedProducts);
    setMovements(updatedMovements);

    // H1: Visibilidad del estado del sistema con mensajes descriptivos
    toast.success(
      `${formData.type === "entry" ? "Entrada" : "Salida"} registrada: ${quantity} unidades de "${product.name}"`
    );
    setIsDialogOpen(false);
  };

  // Filtrar y ordenar movimientos
  const filteredMovements = filterType
    ? movements.filter((m) => m.type === filterType)
    : movements;

  const sortedMovements = [...filteredMovements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const clearFilter = () => {
    setSearchParams({});
  };

  // Obtener los motivos disponibles según el tipo seleccionado
  const availableReasons = formData.type 
    ? MOVEMENT_REASONS[formData.type] 
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-semibold text-foreground">Movimientos de Stock</h2>
            {filterType && (
              <Badge
                variant="secondary"
                className={`flex items-center gap-1 ${
                  filterType === "entry"
                    ? "bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-400"
                    : "bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-400"
                }`}
              >
                {filterType === "entry" ? (
                  <>
                    <TrendingUp className="h-3 w-3" />
                    Solo Entradas
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3" />
                    Solo Salidas
                  </>
                )}
                <button
                  onClick={clearFilter}
                  className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                  aria-label="Quitar filtro"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {filterType
              ? `Mostrando ${sortedMovements.length} de ${movements.length} movimientos`
              : `Registra entradas y salidas de productos (${movements.length} movimientos registrados)`}
          </p>
        </div>
        <Button onClick={handleOpenDialog} disabled={products.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Movimiento
        </Button>
      </div>

      {/* H6: Reconocimiento - Mensaje cuando no hay productos */}
      {products.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay productos en el inventario. Debes agregar productos antes de registrar movimientos.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de movimientos */}
      <div className="space-y-4">
        {sortedMovements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No hay movimientos registrados. ¡Registra tu primer movimiento usando el botón 'Nuevo Movimiento'!
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedMovements.map((movement) => (
            <Card key={movement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{movement.productName}</CardTitle>
                      <Badge
                        variant={movement.type === "entry" ? "default" : "outline"}
                        className={`flex items-center gap-1 ${
                          movement.type === "entry" 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : "bg-green-600 hover:bg-green-700 text-white border-green-600"
                        }`}
                      >
                        {movement.type === "entry" ? (
                          <>
                            <TrendingUp className="h-3 w-3" />
                            Entrada
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3" />
                            Salida
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(movement.date).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Cantidad</p>
                    <p
                      className={`text-lg font-semibold ${
                        movement.type === "entry" ? "text-blue-600" : "text-green-600"
                      }`}
                    >
                      {movement.type === "entry" ? "+" : "-"}
                      {movement.quantity} unidades
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Motivo</p>
                    <p className="text-lg font-medium">{movement.reason}</p>
                  </div>
                </div>
                {movement.description && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Descripción adicional:</p>
                    <p className="text-sm text-foreground">{movement.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog para nuevo movimiento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Movimiento de Stock</DialogTitle>
            <DialogDescription>
              Registra una entrada (agregar stock) o salida (retirar stock) de productos
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="product">
                  Producto <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger 
                    id="product"
                    aria-required="true"
                    aria-invalid={!!formErrors.productId}
                  >
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No hay productos registrados
                      </div>
                    ) : (
                      products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} • Stock: {product.currentStock} unidades • {product.branch}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formErrors.productId && (
                  <p className="text-sm text-red-600" role="alert">
                    {formErrors.productId}
                  </p>
                )}
                {/* H6: Reconocimiento - Mostrar info del producto seleccionado */}
                {selectedProduct && (
                  <div className="p-3 bg-muted rounded-md text-sm">
                    <p className="font-medium">{selectedProduct.name}</p>
                    <p className="text-muted-foreground">
                      Stock actual: <span className="font-semibold">{selectedProduct.currentStock}</span> unidades
                      {" • "}
                      {selectedProduct.category} • {selectedProduct.branch}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipo de Movimiento <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => {
                    setFormData({ ...formData, type: value as "entry" | "exit", reason: "" });
                  }}
                >
                  <SelectTrigger 
                    id="type"
                    aria-required="true"
                    aria-invalid={!!formErrors.type}
                  >
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span>Entrada (Agregar stock)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="exit">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span>Salida (Retirar stock)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.type && (
                  <p className="text-sm text-red-600" role="alert">
                    {formErrors.type}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Cantidad <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    aria-required="true"
                    aria-invalid={!!formErrors.quantity}
                  />
                  {formErrors.quantity && (
                    <p className="text-sm text-red-600" role="alert">
                      {formErrors.quantity}
                    </p>
                  )}
                  {/* H5: Prevención de errores - Advertencia si se acerca al stock */}
                  {formData.type === "exit" && selectedProduct && formData.quantity && 
                   parseInt(formData.quantity) > selectedProduct.currentStock * 0.8 && 
                   parseInt(formData.quantity) <= selectedProduct.currentStock && (
                    <p className="text-sm text-amber-600">
                      ⚠️ Estás retirando una gran cantidad del stock disponible
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">
                    Fecha <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    max={new Date().toISOString().split("T")[0]}
                    aria-required="true"
                  />
                  {formErrors.date && (
                    <p className="text-sm text-red-600" role="alert">
                      {formErrors.date}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">
                  Motivo <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) => setFormData({ ...formData, reason: value })}
                  disabled={!formData.type}
                >
                  <SelectTrigger 
                    id="reason"
                    aria-required="true"
                    aria-invalid={!!formErrors.reason}
                  >
                    <SelectValue placeholder={formData.type ? "Selecciona un motivo" : "Primero selecciona el tipo de movimiento"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.reason && (
                  <p className="text-sm text-red-600" role="alert">
                    {formErrors.reason}
                  </p>
                )}
                {!formData.type && (
                  <p className="text-sm text-muted-foreground">
                    Selecciona primero el tipo de movimiento para ver los motivos disponibles
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Descripción adicional 
                  {formData.reason === "Otro" && <span className="text-red-600"> *</span>}
                  {formData.reason && formData.reason !== "Otro" && (
                    <span className="text-muted-foreground text-xs ml-1">(opcional)</span>
                  )}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={
                    formData.reason === "Otro" 
                      ? "Explica el motivo de este movimiento (obligatorio)"
                      : "Agrega detalles adicionales sobre este movimiento (opcional)"
                  }
                  rows={3}
                  aria-required={formData.reason === "Otro"}
                  aria-invalid={!!formErrors.description}
                />
                {formErrors.description && (
                  <p className="text-sm text-red-600" role="alert">
                    {formErrors.description}
                  </p>
                )}
                {formData.reason === "Otro" ? (
                  <p className="text-sm text-amber-600">
                    ⚠️ Debes explicar el motivo cuando seleccionas "Otro"
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Puedes agregar información adicional como: proveedor, cliente, número de factura, etc.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Registrar Movimiento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}