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
  type: "entry" | "exit";
  quantity: number;
  reason: string;
  description?: string;
  date: string;
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