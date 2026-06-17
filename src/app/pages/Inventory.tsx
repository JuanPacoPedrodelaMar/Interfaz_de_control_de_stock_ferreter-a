import { useEffect, useState, useRef } from "react";
import { Product, CATEGORIES, BRANCHES, UNITS } from "../types";
import { storage } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
import { useUndo } from "../contexts/UndoContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  Building2,
  Copy,
  Lock,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
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
import { Badge } from "../components/ui/badge";

export function Inventory() {
  const { currentUser } = useAuth();
  const { pushAction } = useUndo();
  const isEmployee = currentUser?.role === "employee";
  const isContador = currentUser?.role === "contador";
  const isAdmin = currentUser?.role === "admin";
  const userBranch = currentUser?.branch;

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>(
    isEmployee && userBranch ? userBranch : "all"
  );
  const [showOnlyNoPrice, setShowOnlyNoPrice] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [showBranchCopy, setShowBranchCopy] = useState(false);
  const nameInputRef = useRef<HTMLDivElement>(null);

  // Estado para el diálogo de carga Excel (solo interfaz)
  const [isExcelDialogOpen, setIsExcelDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    branch: isEmployee && userBranch ? userBranch : "",
    price: "",
    currentStock: "",
    minStock: "",
    unit: "Unidades",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    category: "",
    branch: "",
    price: "",
    currentStock: "",
    minStock: "",
    unit: "",
  });

  useEffect(() => {
    setProducts(storage.getProducts());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nameInputRef.current && !nameInputRef.current.contains(event.target as Node)) {
        setSimilarProducts([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar productos según rol y filtros
  const visibleProducts =
    isEmployee && userBranch
      ? products.filter((p) => p.branch === userBranch)
      : products;

  const filteredProducts = visibleProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.branch && product.branch.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesBranch = branchFilter === "all" || product.branch === branchFilter;
    const matchesNoPrice = !showOnlyNoPrice || product.price === 0;
    return matchesSearch && matchesCategory && matchesBranch && matchesNoPrice;
  });

  // Productos sin precio (para notificaciones)
  const productsWithoutPrice = visibleProducts.filter((p) => p.price === 0);

  const handleOpenDialog = (product?: Product) => {
    // Si es contador, solo puede editar precio, y solo si el producto existe (no crear)
    if (isContador && !product) {
      toast.info("Los contadores no pueden crear productos. Solo pueden definir precios.");
      return;
    }

    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        branch: product.branch || "",
        price: product.price.toString(),
        currentStock: product.currentStock.toString(),
        minStock: product.minStock.toString(),
        unit: product.unit || "Unidades",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category: "",
        branch: isEmployee && userBranch ? userBranch : "",
        price: "0", // empleados crean con precio 0
        currentStock: "",
        minStock: "",
        unit: "Unidades",
      });
    }
    setFormErrors({ name: "", category: "", branch: "", price: "", currentStock: "", minStock: "", unit: "" });
    setSimilarProducts([]);
    setShowBranchCopy(false);
    setIsDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    if (!editingProduct && name.trim().length >= 2) {
      const similar = products.filter((p) =>
        p.name.toLowerCase().includes(name.toLowerCase())
      );
      setSimilarProducts(similar);
      setShowBranchCopy(similar.length > 0);
    } else {
      setSimilarProducts([]);
      setShowBranchCopy(false);
    }
  };

  const handleCopyToNewBranch = (product: Product) => {
    setSimilarProducts([]);
    setShowBranchCopy(false);
    setEditingProduct(null);
    setFormData({
      name: product.name,
      category: product.category,
      branch: isEmployee && userBranch ? userBranch : "",
      price: "0", // siempre precio 0 para nuevo producto
      currentStock: "0",
      minStock: product.minStock.toString(),
      unit: product.unit || "Unidades",
    });
    toast.info(`Configuración copiada de "${product.name}". Selecciona la nueva sucursal y ajusta el stock.`);
  };

  const handleSelectExistingProduct = (product: Product) => {
    setSimilarProducts([]);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      branch: product.branch || "",
      price: product.price.toString(),
      currentStock: product.currentStock.toString(),
      minStock: product.minStock.toString(),
      unit: product.unit || "Unidades",
    });
    toast.info(`Editando producto existente: "${product.name}" en ${product.branch}`);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setSimilarProducts([]);
    setShowBranchCopy(false);
    setFormData({
      name: "",
      category: "",
      branch: isEmployee && userBranch ? userBranch : "",
      price: "0",
      currentStock: "",
      minStock: "",
      unit: "Unidades",
    });
    setFormErrors({ name: "", category: "", branch: "", price: "", currentStock: "", minStock: "", unit: "" });
  };

  const validateForm = () => {
    const errors = { name: "", category: "", branch: "", price: "", currentStock: "", minStock: "", unit: "" };
    let isValid = true;

    // Si es contador, solo validamos precio
    if (isContador) {
      if (!formData.price) {
        errors.price = "El precio es obligatorio";
        isValid = false;
      } else if (parseFloat(formData.price) <= 0) {
        errors.price = "El precio debe ser mayor a 0";
        isValid = false;
      }
      setFormErrors(errors);
      return isValid;
    }

    // Validación completa para admin y empleado
    if (!formData.name.trim()) {
      errors.name = "El nombre del producto es obligatorio";
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      errors.name = "El nombre debe tener al menos 3 caracteres";
      isValid = false;
    }

    if (!formData.category) {
      errors.category = "Debes seleccionar una categoría";
      isValid = false;
    }

    if (!formData.branch) {
      errors.branch = "Debes seleccionar una sucursal";
      isValid = false;
    }

    if (!formData.unit) {
      errors.unit = "Debes seleccionar una unidad de medida";
      isValid = false;
    }

    // Si es nuevo producto, verificar que no exista ya en esa sucursal
    if (!editingProduct && formData.branch) {
      const duplicate = products.find(
        (p) =>
          p.name.toLowerCase() === formData.name.trim().toLowerCase() &&
          p.branch === formData.branch
      );
      if (duplicate) {
        errors.branch = `Este producto ya existe en "${formData.branch}". Usa editar para modificarlo.`;
        isValid = false;
      }
    }

    // Para admin, el precio puede ser cualquier número >= 0 (si se muestra)
    if (isAdmin && formData.price && parseFloat(formData.price) < 0) {
      errors.price = "El precio no puede ser negativo";
      isValid = false;
    }

    if (!formData.currentStock) {
      errors.currentStock = "El stock actual es obligatorio";
      isValid = false;
    } else if (parseInt(formData.currentStock) < 0) {
      errors.currentStock = "El stock no puede ser negativo";
      isValid = false;
    }

    if (!formData.minStock) {
      errors.minStock = "El stock mínimo es obligatorio";
      isValid = false;
    } else if (parseInt(formData.minStock) < 0) {
      errors.minStock = "El stock mínimo no puede ser negativo";
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

    const prevProducts = [...products];
    let updatedProducts: Product[];

    if (editingProduct) {
      // Si es contador, solo actualiza precio
      let updatedFields: Partial<Product> = {};
      if (isContador) {
        updatedFields = {
          price: parseFloat(formData.price),
        };
      } else {
        updatedFields = {
          name: formData.name.trim(),
          category: formData.category,
          branch: formData.branch,
          price: parseFloat(formData.price),
          currentStock: parseInt(formData.currentStock),
          minStock: parseInt(formData.minStock),
          unit: formData.unit,
        };
      }
      updatedProducts = products.map((p) =>
        p.id === editingProduct.id
          ? { ...p, ...updatedFields }
          : p
      );
      toast.success(`"${editingProduct.name}" actualizado correctamente`);
      const productName = editingProduct.name;
      pushAction({
        message: `"${productName}" actualizado`,
        undo: () => {
          storage.saveProducts(prevProducts);
          setProducts(prevProducts);
          toast.info("Edición deshecha");
        },
        redo: () => {
          storage.saveProducts(updatedProducts);
          setProducts(updatedProducts);
          toast.success("Edición rehecha");
        },
      });
    } else {
      // Crear nuevo producto (solo admin o empleado)
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        category: formData.category,
        branch: formData.branch,
        price: parseFloat(formData.price), // empleados siempre 0
        currentStock: parseInt(formData.currentStock),
        minStock: parseInt(formData.minStock),
        unit: formData.unit,
        createdAt: new Date().toISOString(),
      };
      updatedProducts = [...products, newProduct];
      toast.success(`"${formData.name}" agregado al inventario de ${formData.branch}`);
      const productName = formData.name.trim();
      const productBranch = formData.branch;
      pushAction({
        message: `"${productName}" creado en ${productBranch}`,
        undo: () => {
          storage.saveProducts(prevProducts);
          setProducts(prevProducts);
          toast.info("Creación deshecha");
        },
        redo: () => {
          storage.saveProducts(updatedProducts);
          setProducts(updatedProducts);
          toast.success("Creación rehecha");
        },
      });
    }

    storage.saveProducts(updatedProducts);
    setProducts(updatedProducts);
    handleCloseDialog();
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    const prevProducts = [...products];
    const deletedName = productToDelete.name;
    const deletedBranch = productToDelete.branch;
    const updatedProducts = products.filter((p) => p.id !== productToDelete.id);
    storage.saveProducts(updatedProducts);
    setProducts(updatedProducts);
    toast.success(`"${deletedName}" eliminado del inventario`);
    setProductToDelete(null);
    pushAction({
      message: `"${deletedName}" eliminado de ${deletedBranch}`,
      undo: () => {
        storage.saveProducts(prevProducts);
        setProducts(prevProducts);
        toast.info("Eliminación deshecha");
      },
      redo: () => {
        storage.saveProducts(updatedProducts);
        setProducts(updatedProducts);
        toast.success("Eliminación rehecha");
      },
    });
  };

  // --- Diálogo de carga Excel (SOLO INTERFAZ) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setFile(null);
      return;
    }
    setFile(files[0]);
    toast.info(`Archivo seleccionado: ${files[0].name}`);
  };

  const handleImportExcel = () => {
    if (!file) {
      toast.error("Selecciona un archivo primero.");
      return;
    }
    // Demostración: solo mostramos un mensaje
    toast.info("Funcionalidad de importación en desarrollo. Por ahora, solo se muestra la interfaz.");
  };

  // --- Actualización masiva de precios (solo admin y contador) ---
  const [isPriceUpdateOpen, setIsPriceUpdateOpen] = useState(false);
  const [priceUpdatePercent, setPriceUpdatePercent] = useState("");
  const [priceUpdateDirection, setPriceUpdateDirection] = useState<"increase" | "decrease">("increase");

  const canBulkUpdatePrices =
    currentUser?.role === "admin" || currentUser?.role === "contador";

  const handleBulkPriceUpdate = () => {
    const pct = parseFloat(priceUpdatePercent);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      toast.error("Ingresa un porcentaje válido entre 0.1 y 100");
      return;
    }

    const prevProducts = [...products];
    const multiplier =
      priceUpdateDirection === "increase" ? 1 + pct / 100 : 1 - pct / 100;

    const updatedProducts = products.map((p) => ({
      ...p,
      price: Math.round(p.price * multiplier * 100) / 100,
    }));

    storage.saveProducts(updatedProducts);
    setProducts(updatedProducts);

    const dirLabel = priceUpdateDirection === "increase" ? "subidos" : "bajados";
    toast.success(
      `Precios ${dirLabel} un ${pct}% en ${updatedProducts.length} productos`
    );

    pushAction({
      message: `Precios ${dirLabel} ${pct}% (${updatedProducts.length} productos)`,
      undo: () => {
        storage.saveProducts(prevProducts);
        setProducts(prevProducts);
        toast.info("Actualización de precios deshecha");
      },
      redo: () => {
        storage.saveProducts(updatedProducts);
        setProducts(updatedProducts);
        toast.success("Actualización de precios rehecha");
      },
    });

    setIsPriceUpdateOpen(false);
    setPriceUpdatePercent("");
    setPriceUpdateDirection("increase");
  };

  // Agrupar productos por nombre para mostrar cuántas sucursales tiene
  const productNameCounts = products.reduce((acc, p) => {
    acc[p.name.toLowerCase()] = (acc[p.name.toLowerCase()] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Inventario</h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            {isEmployee && userBranch ? (
              <>
                <Building2 className="h-4 w-4" />
                {userBranch} — {visibleProducts.length} productos registrados
              </>
            ) : (
              <>
                Gestiona todos tus productos ({products.length} registros en{" "}
                {new Set(products.map((p) => p.branch)).size} sucursales)
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Botón de importación Excel (solo admin y empleados) */}
          {!isContador && (
            <Button variant="outline" onClick={() => setIsExcelDialogOpen(true)}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Cargar Excel
            </Button>
          )}

          {canBulkUpdatePrices && (
            <Button variant="outline" onClick={() => setIsPriceUpdateOpen(true)}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Actualizar precios
            </Button>
          )}

          {/* Botón nuevo producto: solo admin y empleados (no contador) */}
          {!isContador && (
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          )}
        </div>
      </div>

      {/* Alerta de productos sin precio (para admin y contador) */}
      {(isAdmin || isContador) && productsWithoutPrice.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-400 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-amber-800 dark:text-amber-300">
            <strong>{productsWithoutPrice.length} producto(s)</strong> no tienen precio definido.{" "}
            {isContador ? (
              "Por favor, asigna un precio a estos productos para habilitarlos para la venta."
            ) : (
              <span>
                Los contadores deben definir el precio.{" "}
                <button
                  onClick={() => setShowOnlyNoPrice(true)}
                  className="underline font-medium hover:text-amber-900 dark:hover:text-amber-200"
                >
                  Ver productos sin precio
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Diálogo de carga Excel (SOLO INTERFAZ) */}
      <Dialog open={isExcelDialogOpen} onOpenChange={setIsExcelDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargar productos desde Excel</DialogTitle>
            <DialogDescription>
              Sube un archivo Excel (.xlsx, .xls) con los datos de los productos.
              Los productos se crearán con <strong>precio 0</strong> (deberá ser definido por un contador).
              <br />
              <span className="text-amber-600 dark:text-amber-400">⚠️ Funcionalidad en demostración — la importación real no está activa.</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="font-medium mb-2">Formato esperado de columnas:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-mono bg-background px-1 rounded">nombre</span> <span className="text-muted-foreground">(obligatorio)</span></div>
                <div><span className="font-mono bg-background px-1 rounded">categoría</span> <span className="text-muted-foreground">(obligatorio)</span></div>
                <div><span className="font-mono bg-background px-1 rounded">sucursal</span> <span className="text-muted-foreground">(obligatorio)</span></div>
                <div><span className="font-mono bg-background px-1 rounded">stock_actual</span> <span className="text-muted-foreground">(obligatorio, número)</span></div>
                <div><span className="font-mono bg-background px-1 rounded">stock_mínimo</span> <span className="text-muted-foreground">(obligatorio, número)</span></div>
                <div><span className="font-mono bg-background px-1 rounded">unidad</span> <span className="text-muted-foreground">(opcional, por defecto "Unidades")</span></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Las categorías y sucursales deben coincidir con las definidas en el sistema.
              </p>
            </div>

            <div>
              <Label htmlFor="excel-file">Seleccionar archivo</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExcelDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleImportExcel} disabled={!file}>
                Importar productos (demo)
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de actualización masiva de precios */}
      <Dialog open={isPriceUpdateOpen} onOpenChange={setIsPriceUpdateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Actualizar precios</DialogTitle>
            <DialogDescription>
              Ajusta el precio de todos los productos en un porcentaje. La
              acción puede deshacerse con Ctrl+Z.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Dirección</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPriceUpdateDirection("increase")}
                  className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    priceUpdateDirection === "increase"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Subir precios
                </button>
                <button
                  type="button"
                  onClick={() => setPriceUpdateDirection("decrease")}
                  className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    priceUpdateDirection === "decrease"
                      ? "bg-destructive text-destructive-foreground border-destructive"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <TrendingDown className="h-4 w-4" />
                  Bajar precios
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePercent">Porcentaje (%)</Label>
              <div className="relative">
                <Input
                  id="pricePercent"
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={priceUpdatePercent}
                  onChange={(e) => setPriceUpdatePercent(e.target.value)}
                  placeholder="Ej: 10"
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </div>
            {priceUpdatePercent && parseFloat(priceUpdatePercent) > 0 && (
              <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                Se{" "}
                {priceUpdateDirection === "increase" ? "subirán" : "bajarán"}{" "}
                los precios de{" "}
                <span className="font-semibold text-foreground">
                  {products.length} productos
                </span>{" "}
                un{" "}
                <span className="font-semibold text-foreground">
                  {priceUpdatePercent}%
                </span>
                .
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPriceUpdateOpen(false);
                setPriceUpdatePercent("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBulkPriceUpdate}
              variant={priceUpdateDirection === "decrease" ? "destructive" : "default"}
            >
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className={`grid gap-4 ${isEmployee || isContador ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Buscar productos"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger aria-label="Filtrar por categoría">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de sucursal solo para admin (y contador? contador ve todas) */}
            {!isEmployee && !isContador && (
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger aria-label="Filtrar por sucursal">
                  <SelectValue placeholder="Filtrar por sucursal" />
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
            )}
          </div>
          {/* Filtro adicional para "Sin precio" (admin y contador) */}
          {(isAdmin || isContador) && (
            <div className="flex items-center gap-3 mt-3">
              <Button
                variant={showOnlyNoPrice ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyNoPrice(!showOnlyNoPrice)}
              >
                {showOnlyNoPrice ? "Mostrar todos" : "Mostrar sin precio"}
                {productsWithoutPrice.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {productsWithoutPrice.length}
                  </Badge>
                )}
              </Button>
            </div>
          )}
          {(searchTerm || categoryFilter !== "all" || (!isEmployee && !isContador && branchFilter !== "all") || showOnlyNoPrice) && (
            <p className="text-sm text-muted-foreground mt-3">
              Mostrando {filteredProducts.length} de {visibleProducts.length} registros
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lista de productos */}
      <div className="grid gap-4">
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {visibleProducts.length === 0
                  ? "No hay productos registrados. ¡Agrega tu primer producto usando el botón 'Nuevo Producto'!"
                  : "No se encontraron productos con los filtros aplicados."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => {
            const isLowStock = product.currentStock <= product.minStock;
            const branchCount = productNameCounts[product.name.toLowerCase()] || 1;
            const hasPrice = product.price > 0;
            const canEditPrice = isAdmin || isContador;
            const canEditFull = isAdmin || isEmployee;

            return (
              <Card
                key={product.id}
                className={isLowStock ? "border-amber-400 dark:border-amber-700" : ""}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {!hasPrice && (
                          <Badge variant="outline" className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-700">
                            Sin precio
                          </Badge>
                        )}
                        {isLowStock && (
                          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                        )}
                        {!isEmployee && branchCount > 1 && (
                          <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            <Building2 className="h-3 w-3" />
                            {branchCount} sucursales
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {product.category} •{" "}
                        <span className="font-medium text-foreground/80">
                          {product.branch || "Sin sucursal"}
                        </span>
                        {" • "}
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {product.unit || "Unidades"}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {/* Botón editar: si es contador, solo puede editar precio; admin y empleado pueden editar todo */}
                      {(canEditFull || canEditPrice) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(product)}
                          aria-label={`Editar ${product.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {/* Eliminar solo admin y empleado (no contador) */}
                      {!isContador && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProductToDelete(product)}
                          aria-label={`Eliminar ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Precio</p>
                      <p className={`text-lg font-semibold ${hasPrice ? "" : "text-muted-foreground"}`}>
                        {hasPrice ? `$${product.price.toLocaleString("es-AR")}` : "Sin asignar"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stock Actual</p>
                      <p
                        className={`text-lg font-semibold ${
                          isLowStock ? "text-amber-600 dark:text-amber-500" : ""
                        }`}
                      >
                        {product.currentStock} {product.unit || "u"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stock Mínimo</p>
                      <p className="text-lg font-semibold">{product.minStock} {product.unit || "u"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unidad</p>
                      <p className="text-lg font-semibold">{product.unit || "Unidades"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="text-lg font-semibold text-primary">
                        {hasPrice
                          ? `$${(product.price * product.currentStock).toLocaleString("es-AR")}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  {isLowStock && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-md">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                        ⚠️ Stock bajo en {product.branch}: Este producto requiere reposición
                      </p>
                    </div>
                  )}
                  {!hasPrice && (isAdmin || isContador) && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-md">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                        💰 Este producto no tiene precio definido. Asigna un precio para habilitarlo para la venta.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog crear/editar producto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? isContador
                  ? "Define el precio del producto. Los demás campos no son editables para contadores."
                  : "Modifica los datos del producto. Un mismo producto puede tener stock independiente en cada sucursal."
                : isEmployee
                ? `Los productos se agregarán al inventario de ${userBranch} sin precio (deberá ser definido por un contador).`
                : "Completa los campos. El mismo producto puede existir en distintas sucursales con stock separado."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Nombre - solo visible para admin y empleado (no contador) */}
              {!isContador && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nombre del Producto <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative" ref={nameInputRef}>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Ingrese nombre del producto"
                        aria-required="true"
                        aria-invalid={!!formErrors.name}
                      />
                      {/* Panel de productos similares */}
                      {similarProducts.length > 0 && !editingProduct && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-[240px] overflow-y-auto">
                          <div className="p-2 border-b border-border bg-muted/50">
                            <p className="text-xs text-muted-foreground font-medium">
                              Este producto existe en otras sucursales — ¿qué deseas hacer?
                            </p>
                          </div>
                          {similarProducts.map((product) => (
                            <div
                              key={product.id}
                              className="p-3 border-b border-border last:border-b-0"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-foreground">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {product.branch} • Stock: {product.currentStock}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyToNewBranch(product)}
                                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md transition-colors"
                                    title="Agregar a nueva sucursal con esta configuración"
                                  >
                                    <Copy className="h-3 w-3" />
                                    Nueva sucursal
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectExistingProduct(product)}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 px-2 py-1 rounded-md transition-colors"
                                  >
                                    <Edit className="h-3 w-3" />
                                    Editar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {formErrors.name && (
                      <p className="text-sm text-destructive">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Categoría <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.category && (
                      <p className="text-sm text-destructive">{formErrors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">
                      Sucursal <span className="text-destructive">*</span>
                    </Label>
                    {isEmployee ? (
                      <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-muted/50 text-sm text-foreground">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1">{userBranch}</span>
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    ) : (
                      <Select
                        value={formData.branch}
                        onValueChange={(value) => setFormData({ ...formData, branch: value })}
                      >
                        <SelectTrigger id="branch">
                          <SelectValue placeholder="Selecciona una sucursal" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRANCHES.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {formErrors.branch && (
                      <p className="text-sm text-destructive">{formErrors.branch}</p>
                    )}
                    {showBranchCopy && formData.branch && !editingProduct && (
                      <p className="text-xs text-muted-foreground">
                        Se creará un registro independiente para esta sucursal con su propio stock.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">
                      Unidad de medida <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger id="unit">
                        <SelectValue placeholder="Selecciona una unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.unit && (
                      <p className="text-sm text-destructive">{formErrors.unit}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentStock">
                        Stock Actual <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="currentStock"
                        type="number"
                        min="0"
                        value={formData.currentStock}
                        onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                        placeholder="0"
                      />
                      {formErrors.currentStock && (
                        <p className="text-sm text-destructive">{formErrors.currentStock}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minStock">
                        Stock Mínimo <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="minStock"
                        type="number"
                        min="0"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                        placeholder="0"
                      />
                      {formErrors.minStock && (
                        <p className="text-sm text-destructive">{formErrors.minStock}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Alerta cuando el stock sea igual o menor a este valor (por sucursal)
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Precio - solo visible para admin y contador */}
              {(isAdmin || isContador) && (
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Precio ($) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                  {formErrors.price && (
                    <p className="text-sm text-destructive">{formErrors.price}</p>
                  )}
                  {isContador && (
                    <p className="text-sm text-muted-foreground">
                      Asigna el precio para habilitar el producto a la venta.
                    </p>
                  )}
                </div>
              )}

              {/* Si es contador y está editando, mostramos el nombre y unidad como texto informativo */}
              {isContador && editingProduct && (
                <div className="p-3 bg-muted/50 rounded-md text-sm space-y-1">
                  <p><span className="text-muted-foreground">Producto:</span> {editingProduct.name}</p>
                  <p><span className="text-muted-foreground">Sucursal:</span> {editingProduct.branch}</p>
                  <p><span className="text-muted-foreground">Unidad:</span> {editingProduct.unit || "Unidades"}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingProduct ? "Guardar Cambios" : "Crear Producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar "{productToDelete?.name}" de {productToDelete?.branch}.
              Tendrás unos segundos para deshacer la acción después de confirmar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}