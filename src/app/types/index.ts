export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "employee" | "contador";
  branch: string; // 'all' for admin and contador
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
  unit: string;
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
  isCash?: boolean;
  cashDiscountValue?: number;
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

export interface StockRequest {
  id: string;
  productId: string;
  productName: string;
  productUnit: string;
  requestedBy: string;
  requestedByName: string;
  fromBranch: string;
  toBranch: string;
  quantity: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
}

export interface PurchaseOrder {
  id: string;
  productId: string;
  productName: string;
  productUnit: string;
  branch: string;
  quantity: number;
  cost: number;
  provider: string;
  date: string;
  status: "pending" | "delivered" | "cancelled";
  createdAt: string;
}

export const UNITS = [
  "Unidades",
  "Metros",
  "Kilogramos",
  "Gramos",
  "Litros",
  "Centímetros",
  "Piezas",
  "Pares",
  "Docenas",
  "Otro",
];
