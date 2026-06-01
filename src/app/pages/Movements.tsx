import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Product, Movement, MOVEMENT_REASONS, Discount, BRANCHES, Customer } from "../types";
import { storage, FREQUENT_CUSTOMER_THRESHOLD } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  X,
  Filter,
  User,
  Tag,
  ShoppingCart,
  Building2,
  BadgePercent,
  Lock,
  Star,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";

export function Movements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const isEmployee = currentUser?.role === "employee";
  const userBranch = currentUser?.branch;

  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Estado para auto-detección de cliente frecuente
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);

  // Filtros activos
  const filterType = searchParams.get("filter") as "entry" | "exit" | null;
  // Empleados comienzan con su sucursal filtrada; admin ve todo
  const [branchFilter, setBranchFilter] = useState<string>(
    isEmployee && userBranch ? userBranch : "all"
  );
  // Filtro por cliente (nombre parcial o completo)
  const [customerFilter, setCustomerFilter] = useState<string>("");

  const [formData, setFormData] = useState({
    productId: "",
    type: "" as "entry" | "exit" | "",
    quantity: "",
    reason: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    // Sale fields
    customerName: "",
    customerPhone: "",
    isFrequentCustomer: false,
    discountId: "",
  });

  const [formErrors, setFormErrors] = useState({
    productId: "",
    type: "",
    quantity: "",
    reason: "",
    description: "",
    date: "",
    customerName: "",
  });

  useEffect(() => {
    setProducts(storage.getProducts());
    setMovements(storage.getMovements());
    setDiscounts(storage.getDiscounts());
  }, []);

  const handleOpenDialog = () => {
    setFoundCustomer(null);
    setFormData({
      productId: "",
      type: "",
      quantity: "",
      reason: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      customerName: "",
      customerPhone: "",
      isFrequentCustomer: false,
      discountId: "",
    });
    setFormErrors({
      productId: "",
      type: "",
      quantity: "",
      reason: "",
      description: "",
      date: "",
      customerName: "",
    });
    setIsDialogOpen(true);
  };

  const selectedProduct = products.find((p) => p.id === formData.productId);
  const isSale = formData.type === "exit" && formData.reason === "Venta";
  const activeDiscounts = discounts.filter((d) => d.isActive);
  const selectedDiscount = discounts.find((d) => d.id === formData.discountId);

  // Cálculo de precios para venta
  const unitPrice = selectedProduct?.price || 0;
  const qty = parseInt(formData.quantity) || 0;
  let discountAmount = 0;
  if (selectedDiscount && qty > 0) {
    if (selectedDiscount.type === "percentage") {
      discountAmount = unitPrice * (selectedDiscount.value / 100);
    } else {
      discountAmount = selectedDiscount.value;
    }
  }
  const finalUnitPrice = Math.max(0, unitPrice - discountAmount);
  const totalAmount = finalUnitPrice * qty;

  /**
   * Cuando el empleado escribe el nombre del cliente:
   * - Busca en la base de datos de clientes
   * - Si es frecuente, auto-chequea el checkbox y selecciona el descuento frecuente
   * - Muestra información sobre compras anteriores
   */
  const handleCustomerNameChange = (name: string) => {
    const found = storage.findCustomerByName(name);
    setFoundCustomer(found || null);

    if (found?.isFrequent) {
      // Auto-detectar cliente frecuente y aplicar descuento automáticamente
      const frequentDiscount = activeDiscounts.find(
        (d) => d.appliesTo === "frequent_customers"
      );
      setFormData((prev) => ({
        ...prev,
        customerName: name,
        isFrequentCustomer: true,
        // Solo auto-aplica el descuento frecuente si no hay uno seleccionado ya
        discountId: prev.discountId || frequentDiscount?.id || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        customerName: name,
        // Si el cliente no es frecuente, no modificar el estado del checkbox
        // (el usuario podría haberlo marcado manualmente)
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      productId: "",
      type: "",
      quantity: "",
      reason: "",
      description: "",
      date: "",
      customerName: "",
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
    } else if (
      formData.type === "exit" &&
      selectedProduct &&
      parseInt(formData.quantity) > selectedProduct.currentStock
    ) {
      errors.quantity = `No puedes retirar más de ${selectedProduct.currentStock} unidades disponibles`;
      isValid = false;
    }

    if (!formData.reason) {
      errors.reason = "Debes seleccionar un motivo";
      isValid = false;
    } else if (formData.reason === "Otro" && !formData.description.trim()) {
      errors.description = "Cuando seleccionas 'Otro', debes explicar el motivo";
      isValid = false;
    } else if (formData.reason === "Otro" && formData.description.trim().length < 10) {
      errors.description = "La descripción debe tener al menos 10 caracteres";
      isValid = false;
    }

    if (!formData.date) {
      errors.date = "La fecha es obligatoria";
      isValid = false;
    }

    if (
      isSale &&
      selectedDiscount?.appliesTo === "frequent_customers" &&
      !formData.isFrequentCustomer
    ) {
      toast.warning(
        `La oferta "${selectedDiscount.name}" es solo para clientes frecuentes. Marca al cliente como frecuente o selecciona otra oferta.`,
        { duration: 4000 }
      );
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

    const newMovement: Movement = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      productBranch: product.branch,
      type: formData.type as "entry" | "exit",
      quantity,
      reason: formData.reason,
      description: formData.description.trim() || undefined,
      date: formData.date,
      sellerId: currentUser?.id,
      sellerName: currentUser?.fullName,
      sellerBranch:
        currentUser?.branch === "all" ? product.branch : currentUser?.branch,
      ...(isSale && {
        customerName: formData.customerName.trim() || undefined,
        customerPhone: formData.customerPhone.trim() || undefined,
        isFrequentCustomer: formData.isFrequentCustomer,
        discountId: formData.discountId || undefined,
        discountName: selectedDiscount?.name,
        discountValue: selectedDiscount?.value,
        unitPrice,
        finalUnitPrice,
        totalAmount,
      }),
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

    // Si es una venta con nombre de cliente, actualizar registro de clientes
    if (isSale && formData.customerName.trim()) {
      const updatedCustomer = storage.updateCustomerFromSale(
        formData.customerName.trim(),
        formData.customerPhone.trim() || undefined
      );

      // Notificar si el cliente acaba de alcanzar el umbral de cliente frecuente
      if (
        updatedCustomer.isFrequent &&
        updatedCustomer.purchaseCount === FREQUENT_CUSTOMER_THRESHOLD
      ) {
        toast.success(
          `⭐ ¡${updatedCustomer.name} acaba de convertirse en cliente frecuente! (${FREQUENT_CUSTOMER_THRESHOLD} compras)`,
          { duration: 5000 }
        );
      }
    }

    toast.success(
      `${formData.type === "entry" ? "Entrada" : "Salida"} registrada: ${quantity} unidades de "${product.name}"${
        isSale && formData.customerName ? ` — Cliente: ${formData.customerName}` : ""
      }`
    );
    setIsDialogOpen(false);
  };

  // Productos visibles según rol:
  // Empleados solo ven productos de su sucursal en el formulario
  const visibleProducts =
    isEmployee && userBranch
      ? products.filter((p) => p.branch === userBranch)
      : products;

  // Filtrar movimientos
  const filteredMovements = movements
    .filter((m) => {
      const matchesType = !filterType || m.type === filterType;
      const matchesBranch =
        branchFilter === "all" ||
        m.productBranch === branchFilter ||
        m.sellerBranch === branchFilter;
      const matchesCustomer =
        !customerFilter ||
        (m.customerName
          ?.toLowerCase()
          .includes(customerFilter.toLowerCase()) ?? false);
      return matchesType && matchesBranch && matchesCustomer;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const clearFilter = () => setSearchParams({});

  const availableReasons = formData.type
    ? MOVEMENT_REASONS[formData.type as "entry" | "exit"]
    : [];

  const activeFiltersCount =
    (filterType ? 1 : 0) +
    (!isEmployee && branchFilter !== "all" ? 1 : 0) +
    (customerFilter ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-3xl font-semibold text-foreground">
              Movimientos de Stock
            </h2>
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
                    <TrendingUp className="h-3 w-3" /> Solo Entradas
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3" /> Solo Salidas
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
            {/* Badge de sucursal solo visible para admin */}
            {!isEmployee && branchFilter !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-primary/10 text-primary"
              >
                <Building2 className="h-3 w-3" />
                {branchFilter}
                <button
                  onClick={() => setBranchFilter("all")}
                  className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                  aria-label="Quitar filtro de sucursal"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {/* Badge de filtro por cliente */}
            {customerFilter && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-violet-100 dark:bg-violet-950/50 text-violet-800 dark:text-violet-400"
              >
                <User className="h-3 w-3" />
                Cliente: {customerFilter}
                <button
                  onClick={() => setCustomerFilter("")}
                  className="ml-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
                  aria-label="Quitar filtro de cliente"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {/* Indicador de sucursal para empleados */}
            {isEmployee && userBranch && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-muted text-muted-foreground"
              >
                <Building2 className="h-3 w-3" />
                {userBranch}
                <Lock className="h-3 w-3 ml-0.5" />
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Mostrando {filteredMovements.length} de {movements.length} movimientos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Botón de filtros */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Filtrar movimientos</h4>

                {/* Filtro por tipo */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Por tipo</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={filterType === "entry" ? "default" : "outline"}
                      className="flex-1 h-8 text-xs"
                      onClick={() => {
                        setSearchParams({ filter: "entry" });
                        setIsFilterOpen(false);
                      }}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Entradas
                    </Button>
                    <Button
                      size="sm"
                      variant={filterType === "exit" ? "default" : "outline"}
                      className="flex-1 h-8 text-xs"
                      onClick={() => {
                        setSearchParams({ filter: "exit" });
                        setIsFilterOpen(false);
                      }}
                    >
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Salidas
                    </Button>
                  </div>
                </div>

                {/* Filtro por sucursal: solo visible para admin */}
                {!isEmployee && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Por sucursal</Label>
                    <Select
                      value={branchFilter}
                      onValueChange={(v) => {
                        setBranchFilter(v);
                        setIsFilterOpen(false);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Todas las sucursales" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las sucursales</SelectItem>
                        {BRANCHES.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* ── NUEVO: Filtro por cliente ── */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Por cliente
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      className="h-8 text-xs pl-7"
                      placeholder="Ej: Roberto Núñez..."
                      value={customerFilter}
                      onChange={(e) => setCustomerFilter(e.target.value)}
                    />
                    {customerFilter && (
                      <button
                        onClick={() => setCustomerFilter("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  {customerFilter && (
                    <p className="text-xs text-muted-foreground">
                      {filteredMovements.length} movimiento(s) de "{customerFilter}"
                    </p>
                  )}
                </div>

                {(filterType ||
                  (!isEmployee && branchFilter !== "all") ||
                  customerFilter) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full h-8 text-xs text-muted-foreground"
                    onClick={() => {
                      clearFilter();
                      if (!isEmployee) setBranchFilter("all");
                      setCustomerFilter("");
                      setIsFilterOpen(false);
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpiar todos los filtros
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            onClick={handleOpenDialog}
            disabled={visibleProducts.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      {visibleProducts.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay productos en el inventario
            {isEmployee && userBranch ? ` de ${userBranch}` : ""}. Debes agregar
            productos antes de registrar movimientos.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de movimientos */}
      <div className="space-y-4">
        {filteredMovements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {customerFilter
                  ? `No se encontraron movimientos para el cliente "${customerFilter}".`
                  : "No hay movimientos que coincidan con los filtros aplicados."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMovements.map((movement) => (
            <Card key={movement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <CardTitle className="text-lg">{movement.productName}</CardTitle>
                      <Badge
                        className={`flex items-center gap-1 ${
                          movement.type === "entry"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-green-600 hover:bg-green-700 text-white border-green-600"
                        }`}
                      >
                        {movement.type === "entry" ? (
                          <>
                            <TrendingUp className="h-3 w-3" /> Entrada
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3" /> Salida
                          </>
                        )}
                      </Badge>
                      {movement.productBranch && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {movement.productBranch}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(movement.date + "T12:00:00").toLocaleDateString("es-AR", {
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
                        movement.type === "entry"
                          ? "text-blue-600"
                          : "text-green-600"
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

                {/* Info de venta */}
                {movement.reason === "Venta" && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-md space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Detalles de la venta
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      {movement.customerName && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <span className="text-muted-foreground">Cliente: </span>
                            <span className="font-medium">
                              {movement.customerName}
                            </span>
                            {movement.isFrequentCustomer && (
                              <Badge
                                variant="outline"
                                className="ml-1 text-xs py-0 h-4 text-primary border-primary/40"
                              >
                                <Star className="h-2.5 w-2.5 mr-0.5" />
                                Frecuente
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      {movement.sellerName && (
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <span className="text-muted-foreground">Vendedor: </span>
                            <span className="font-medium">{movement.sellerName}</span>
                            {movement.sellerBranch && (
                              <span className="text-muted-foreground text-xs">
                                {" "}
                                ({movement.sellerBranch})
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {movement.discountName && (
                        <div className="flex items-center gap-2">
                          <BadgePercent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <span className="text-muted-foreground">Descuento: </span>
                            <span className="font-medium">{movement.discountName}</span>
                          </div>
                        </div>
                      )}
                      {movement.totalAmount !== undefined && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <span className="text-muted-foreground">Total: </span>
                            <span className="font-semibold text-primary">
                              $
                              {movement.totalAmount.toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            {movement.discountName &&
                              movement.unitPrice && (
                                <span className="text-muted-foreground text-xs ml-1">
                                  (sin desc.: $
                                  {(
                                    movement.unitPrice *
                                    (movement.quantity || 0)
                                  ).toLocaleString("es-AR")}
                                  )
                                </span>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {movement.description && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">
                      Descripción adicional:
                    </p>
                    <p className="text-sm text-foreground">{movement.description}</p>
                  </div>
                )}

                {movement.reason !== "Venta" && movement.sellerName && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>Registrado por: {movement.sellerName}</span>
                    {movement.sellerBranch && (
                      <span>({movement.sellerBranch})</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog nuevo movimiento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Movimiento de Stock</DialogTitle>
            <DialogDescription>
              Registra una entrada (agregar stock) o salida (retirar stock) de
              productos
              {isEmployee && userBranch ? ` de ${userBranch}` : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Producto */}
              <div className="space-y-2">
                <Label htmlFor="product">
                  Producto <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productId: value })
                  }
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleProducts.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No hay productos registrados
                        {isEmployee && userBranch ? ` en ${userBranch}` : ""}
                      </div>
                    ) : (
                      visibleProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} · {product.branch} · Stock:{" "}
                          {product.currentStock}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formErrors.productId && (
                  <p className="text-sm text-destructive">{formErrors.productId}</p>
                )}
                {selectedProduct && (
                  <div className="p-3 bg-muted rounded-md text-sm">
                    <p className="font-medium">{selectedProduct.name}</p>
                    <p className="text-muted-foreground">
                      Stock:{" "}
                      <span className="font-semibold">
                        {selectedProduct.currentStock}
                      </span>{" "}
                      unidades · {selectedProduct.category} ·{" "}
                      <span className="font-medium">{selectedProduct.branch}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipo de Movimiento <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value as "entry" | "exit",
                      reason: "",
                      discountId: "",
                    })
                  }
                >
                  <SelectTrigger id="type">
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
                  <p className="text-sm text-destructive">{formErrors.type}</p>
                )}
              </div>

              {/* Cantidad y Fecha */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    Cantidad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="0"
                  />
                  {formErrors.quantity && (
                    <p className="text-sm text-destructive">{formErrors.quantity}</p>
                  )}
                  {formData.type === "exit" &&
                    selectedProduct &&
                    formData.quantity &&
                    parseInt(formData.quantity) > selectedProduct.currentStock * 0.8 &&
                    parseInt(formData.quantity) <= selectedProduct.currentStock && (
                      <p className="text-sm text-amber-600">
                        ⚠️ Retirando una gran cantidad del stock disponible
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">
                    Fecha <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {formErrors.date && (
                    <p className="text-sm text-destructive">{formErrors.date}</p>
                  )}
                </div>
              </div>

              {/* Motivo */}
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Motivo <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) =>
                    setFormData({ ...formData, reason: value, discountId: "" })
                  }
                  disabled={!formData.type}
                >
                  <SelectTrigger id="reason">
                    <SelectValue
                      placeholder={
                        formData.type
                          ? "Selecciona un motivo"
                          : "Primero selecciona el tipo de movimiento"
                      }
                    />
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
                  <p className="text-sm text-destructive">{formErrors.reason}</p>
                )}
              </div>

              {/* SECCIÓN DE VENTA */}
              {isSale && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      <p className="font-medium text-sm">Información de la Venta</p>
                    </div>

                    {/* Vendedor (auto desde sesión) */}
                    <div className="p-3 bg-muted/50 rounded-md text-sm flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Vendedor:</span>
                      <span className="font-medium">{currentUser?.fullName}</span>
                      <span className="text-muted-foreground text-xs">
                        (
                        {currentUser?.branch === "all"
                          ? selectedProduct?.branch
                          : currentUser?.branch}
                        )
                      </span>
                    </div>

                    {/* Cliente */}
                    <div className="space-y-2">
                      <Label htmlFor="customerName">
                        Nombre del cliente (opcional)
                      </Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => handleCustomerNameChange(e.target.value)}
                        placeholder="Nombre del cliente"
                      />
                      {/* Info de cliente detectado */}
                      {formData.customerName && formData.customerName.length >= 2 && (
                        <div className="text-xs mt-1">
                          {foundCustomer ? (
                            foundCustomer.isFrequent ? (
                              <div className="flex items-center gap-1.5 text-primary font-medium">
                                <Star className="h-3.5 w-3.5 fill-primary" />
                                Cliente frecuente detectado —{" "}
                                {foundCustomer.purchaseCount} compras anteriores.
                                Descuento aplicado automáticamente.
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                Cliente registrado —{" "}
                                {foundCustomer.purchaseCount} compra
                                {foundCustomer.purchaseCount !== 1 ? "s" : ""}{" "}
                                anterior
                                {foundCustomer.purchaseCount !== 1 ? "es" : ""}.
                                Necesita{" "}
                                {FREQUENT_CUSTOMER_THRESHOLD -
                                  foundCustomer.purchaseCount}{" "}
                                más para ser frecuente.
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <User className="h-3.5 w-3.5" />
                              Cliente nuevo
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">
                        Teléfono del cliente (opcional)
                      </Label>
                      <Input
                        id="customerPhone"
                        value={formData.customerPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerPhone: e.target.value,
                          })
                        }
                        placeholder="Ej: 011-1234-5678"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="isFrequent"
                        checked={formData.isFrequentCustomer}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            isFrequentCustomer: !!checked,
                            discountId: !checked ? "" : formData.discountId,
                          })
                        }
                      />
                      <Label htmlFor="isFrequent" className="cursor-pointer">
                        Cliente frecuente
                        {foundCustomer?.isFrequent && (
                          <span className="ml-1.5 text-xs text-primary">
                            (auto-detectado)
                          </span>
                        )}
                      </Label>
                    </div>

                    {/* Descuento */}
                    {activeDiscounts.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="discount">
                          Aplicar oferta / descuento
                        </Label>
                        <Select
                          value={formData.discountId}
                          onValueChange={(v) =>
                            setFormData({ ...formData, discountId: v })
                          }
                        >
                          <SelectTrigger id="discount">
                            <SelectValue placeholder="Sin descuento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Sin descuento</SelectItem>
                            {activeDiscounts.map((d) => {
                              const requiresFrequent =
                                d.appliesTo === "frequent_customers";
                              const canApply =
                                !requiresFrequent || formData.isFrequentCustomer;
                              return (
                                <SelectItem
                                  key={d.id}
                                  value={d.id}
                                  disabled={!canApply}
                                >
                                  <div className="flex items-center gap-2">
                                    <BadgePercent className="h-4 w-4" />
                                    {d.name} (
                                    {d.type === "percentage"
                                      ? `${d.value}%`
                                      : `$${d.value}`}
                                    )
                                    {requiresFrequent && !canApply && (
                                      <span className="text-xs text-muted-foreground">
                                        · Solo clientes frecuentes
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {foundCustomer?.isFrequent &&
                          formData.discountId &&
                          selectedDiscount?.appliesTo === "frequent_customers" && (
                            <p className="text-xs text-primary flex items-center gap-1">
                              <Star className="h-3 w-3 fill-primary" />
                              Descuento aplicado automáticamente por cliente frecuente
                            </p>
                          )}
                      </div>
                    )}

                    {/* Preview de precio */}
                    {selectedProduct && qty > 0 && (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-md space-y-1 text-sm">
                        <p className="font-medium text-foreground">
                          Resumen de la venta
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                          <span>Precio unitario:</span>
                          <span className="text-right font-medium text-foreground">
                            ${unitPrice.toLocaleString("es-AR")}
                          </span>
                          {selectedDiscount && (
                            <>
                              <span>Descuento ({selectedDiscount.name}):</span>
                              <span className="text-right font-medium text-green-600">
                                -$
                                {discountAmount.toLocaleString("es-AR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                              <span>Precio final por unidad:</span>
                              <span className="text-right font-medium text-foreground">
                                $
                                {finalUnitPrice.toLocaleString("es-AR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </>
                          )}
                          <span>Cantidad:</span>
                          <span className="text-right font-medium text-foreground">
                            {qty} unidades
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-primary/20 font-semibold text-foreground">
                          <span>Total:</span>
                          <span className="text-primary">
                            $
                            {totalAmount.toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {/* Descripción adicional */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Descripción adicional
                  {formData.reason === "Otro" && (
                    <span className="text-destructive"> *</span>
                  )}
                  {formData.reason && formData.reason !== "Otro" && (
                    <span className="text-muted-foreground text-xs ml-1">
                      (opcional)
                    </span>
                  )}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={
                    formData.reason === "Otro"
                      ? "Explica el motivo de este movimiento (obligatorio)"
                      : "Número de factura, proveedor, observaciones..."
                  }
                  rows={3}
                />
                {formErrors.description && (
                  <p className="text-sm text-destructive">
                    {formErrors.description}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
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
