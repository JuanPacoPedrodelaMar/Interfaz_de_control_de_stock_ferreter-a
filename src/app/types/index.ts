export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "employee";
  branch: string; // 'all' for admin
  fullName: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  isFrequent: boolean;
  purchaseCount: number;
  createdAt: string;
}

export interface Discount {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  isActive: boolean;
  appliesTo: "all" | "frequent_customers";
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  branch: string;
  price: number;
  currentStock: number;
  minStock: number;
  createdAt: string;
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  productBranch?: string;
  type: "entry" | "exit";
  quantity: number;
  reason: string;
  description?: string;
  date: string;
  // Sale info (when type=exit, reason=Venta)
  customerName?: string;
  customerPhone?: string;
  isFrequentCustomer?: boolean;
  sellerId?: string;
  sellerName?: string;
  sellerBranch?: string;
  discountId?: string;
  discountName?: string;
  discountValue?: number;
  unitPrice?: number;
  finalUnitPrice?: number;
  totalAmount?: number;
}

export const CATEGORIES = [
  "Herramientas manuales",
  "Herramientas eléctricas",
  "Materiales de construcción",
  "Pintura",
  "Plomería",
  "Electricidad",
  "Ferretería general",
  "Adhesivos y selladores",
  "Otros",
];

export const BRANCHES = [
  "Sucursal Centro",
  "Sucursal Norte",
  "Sucursal Sur",
  "Sucursal Este",
  "Sucursal Oeste",
  "Depósito Central",
];

export const MOVEMENT_REASONS = {
  entry: [
    "Compra a proveedor",
    "Devolución de cliente",
    "Traslado desde otra sucursal",
    "Ajuste de inventario (entrada)",
    "Producción interna",
    "Otro",
  ],
  exit: [
    "Venta",
    "Traslado a otra sucursal",
    "Producto defectuoso",
    "Producto vencido",
    "Merma o pérdida",
    "Uso interno",
    "Ajuste de inventario (salida)",
    "Otro",
  ],
};
