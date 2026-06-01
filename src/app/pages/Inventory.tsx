import { useEffect, useState, useRef } from "react";
import { Product, CATEGORIES, BRANCHES } from "../types";
import { storage } from "../utils/storage";
import { useAuth } from "../contexts/AuthContext";
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
  const isEmployee = currentUser?.role === "employee";
  const userBranch = currentUser?.branch;

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  // Empleados comienzan con su sucursal; admin comienza con "all"
  const [branchFilter, setBranchFilter] = useState<string>(
    isEmployee && userBranch ? userBranch : "all"
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [showBranchCopy, setShowBranchCopy] = useState(false);
  const nameInputRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    branch: isEmployee && userBranch ? userBranch : "",
    price: "",
    currentStock: "",
    minStock: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    category: "",
    branch: "",
    price: "",
    currentStock: "",
    minStock: "",
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

  // Los empleados solo ven los productos de su sucursal
  const visibleProducts = isEmployee && userBranch
    ? products.filter((p) => p.branch === userBranch)
    : products;

  const filteredProducts = visibleProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.branch && product.branch.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesBranch = branchFilter === "all" || product.branch === branchFilter;
    return matchesSearch && matchesCategory && matchesBranch;
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        branch: product.branch || "",
        price: product.price.toString(),
        currentStock: product.currentStock.toString(),
        minStock: product.minStock.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category: "",
        // Los empleados siempre crean productos en su propia sucursal
        branch: isEmployee && userBranch ? userBranch : "",
        price: "",
        currentStock: "",
        minStock: "",
      });
    }
    setFormErrors({ name: "", category: "", branch: "", price: "", currentStock: "", minStock: "" });
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

  // Copiar configuración de un producto existente para agregar a otra sucursal
  const handleCopyToNewBranch = (product: Product) => {
    setSimilarProducts([]);
    setShowBranchCopy(false);
    setEditingProduct(null);
    setFormData({
      name: product.name,
      category: product.category,
      // Empleados solo pueden copiar a su propia sucursal
      branch: isEmployee && userBranch ? userBranch : "",
      price: product.price.toString(),
      currentStock: "0",
      minStock: product.minStock.toString(),
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
      price: "",
      currentStock: "",
      minStock: "",
    });
    setFormErrors({ name: "", category: "", branch: "", price: "", currentStock: "", minStock: "" });
  };

  const validateForm = () => {
    const errors = { name: "", category: "", branch: "", price: "", currentStock: "", minStock: "" };
    let isValid = true;

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

    if (!formData.price) {
      errors.price = "El precio es obligatorio";
      isValid = false;
    } else if (parseFloat(formData.price) <= 0) {
      errors.price = "El precio debe ser mayor a 0";
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

    let updatedProducts: Product[];

    if (editingProduct) {
      updatedProducts = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: formData.name.trim(),
              category: formData.category,
              branch: formData.branch,
              price: parseFloat(formData.price),
              currentStock: parseInt(formData.currentStock),
              minStock: parseInt(formData.minStock),
            }
          : p
      );
      toast.success(`"${formData.name}" actualizado correctamente`);
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        category: formData.category,
        branch: formData.branch,
        price: parseFloat(formData.price),
        currentStock: parseInt(formData.currentStock),
        minStock: parseInt(formData.minStock),
        createdAt: new Date().toISOString(),
      };
      updatedProducts = [...products, newProduct];
      toast.success(`"${formData.name}" agregado al inventario de ${formData.branch}`);
    }

    storage.saveProducts(updatedProducts);
    setProducts(updatedProducts);
    handleCloseDialog();
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    const updatedProducts = products.filter((p) => p.id !== productToDelete.id);
    storage.saveProducts(updatedProducts);
    setProducts(updatedProducts);
    toast.success(`"${productToDelete.name}" eliminado del inventario`);
    setProductToDelete(null);
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
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className={`grid gap-4 ${isEmployee ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
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

            {/* El filtro de sucursal solo aparece para el admin */}
            {!isEmployee && (
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
          {(searchTerm || categoryFilter !== "all" || (!isEmployee && branchFilter !== "all")) && (
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
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(product)}
                        aria-label={`Editar ${product.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProductToDelete(product)}
                        aria-label={`Eliminar ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Precio</p>
                      <p className="text-lg font-semibold">
                        ${product.price.toLocaleString("es-AR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stock Actual</p>
                      <p
                        className={`text-lg font-semibold ${
                          isLowStock ? "text-amber-600 dark:text-amber-500" : ""
                        }`}
                      >
                        {product.currentStock} unidades
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stock Mínimo</p>
                      <p className="text-lg font-semibold">{product.minStock} unidades</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="text-lg font-semibold text-primary">
                        ${(product.price * product.currentStock).toLocaleString("es-AR")}
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
                ? "Modifica los datos del producto. Un mismo producto puede tener stock independiente en cada sucursal."
                : isEmployee
                ? `Los productos se agregarán al inventario de ${userBranch}.`
                : "Completa los campos. El mismo producto puede existir en distintas sucursales con stock separado."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Nombre */}
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

              {/* Categoría */}
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

              {/* Sucursal: bloqueada para empleados, editable para admin */}
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

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-4">
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
                </div>

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
              Esta acción no se puede deshacer.
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
