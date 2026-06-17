import { Product, Movement, User, Customer, Discount, StockRequest, PurchaseOrder } from "../types";

const PRODUCTS_KEY = "ferreteria_products";
const MOVEMENTS_KEY = "ferreteria_movements";
const USERS_KEY = "ferreteria_users";
const CUSTOMERS_KEY = "ferreteria_customers";
const DISCOUNTS_KEY = "ferreteria_discounts";
const SESSION_KEY = "ferreteria_session";
const STOCK_REQUESTS_KEY = "ferreteria_stock_requests";
const PURCHASE_ORDERS_KEY = "ferreteria_purchase_orders";

export const FREQUENT_CUSTOMER_THRESHOLD = 3;

const DEFAULT_USERS: User[] = [
  {
    id: "u1",
    username: "admin",
    password: "admin123",
    role: "admin",
    branch: "all",
    fullName: "Administrador",
  },
  {
    id: "u2",
    username: "juanperez",
    password: "empleado123",
    role: "employee",
    branch: "Sucursal Centro",
    fullName: "Juan Pérez",
  },
  {
    id: "u3",
    username: "mariagarcia",
    password: "empleado123",
    role: "employee",
    branch: "Sucursal Norte",
    fullName: "María García",
  },
  {
    id: "u4",
    username: "carloslopez",
    password: "empleado123",
    role: "employee",
    branch: "Sucursal Sur",
    fullName: "Carlos López",
  },
  {
    id: "u5",
    username: "contador",
    password: "contador123",
    role: "contador",
    branch: "all",
    fullName: "Ana Martínez - Contador",
  },
];

const DEFAULT_DISCOUNTS: Discount[] = [
  {
    id: "d1",
    name: "Descuento cliente frecuente (10%)",
    type: "percentage",
    value: 10,
    isActive: true,
    appliesTo: "frequent_customers",
    createdAt: new Date().toISOString(),
  },
  {
    id: "d2",
    name: "Oferta especial de temporada (15%)",
    type: "percentage",
    value: 15,
    isActive: false,
    appliesTo: "all",
    createdAt: new Date().toISOString(),
  },
  {
    id: "d-cash",
    name: "Pago en efectivo (5%)",
    type: "percentage",
    value: 5,
    isActive: true,
    appliesTo: "all",
    createdAt: new Date().toISOString(),
  },
];

export const storage = {
  // Products
  getProducts(): Product[] {
    const data = localStorage.getItem(PRODUCTS_KEY);
    if (!data) return [];
    let products: Product[] = JSON.parse(data);
    products = products.map(p => ({
      ...p,
      unit: p.unit || "Unidades",
    }));
    return products;
  },
  saveProducts(products: Product[]): void {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  // Movements
  getMovements(): Movement[] {
    const data = localStorage.getItem(MOVEMENTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveMovements(movements: Movement[]): void {
    localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
  },

  // Users
  getUsers(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(data);
  },
  saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // Customers
  getCustomers(): Customer[] {
    const data = localStorage.getItem(CUSTOMERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveCustomers(customers: Customer[]): void {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  },

  findCustomerByName(name: string): Customer | undefined {
    if (!name.trim()) return undefined;
    const customers = this.getCustomers();
    const normalized = name.trim().toLowerCase();
    return customers.find((c) => c.name.trim().toLowerCase() === normalized);
  },

  updateCustomerFromSale(name: string, phone?: string): Customer {
    const customers = this.getCustomers();
    const normalized = name.trim().toLowerCase();
    const existingIndex = customers.findIndex(
      (c) => c.name.trim().toLowerCase() === normalized
    );

    let updatedCustomer: Customer;

    if (existingIndex !== -1) {
      const existing = customers[existingIndex];
      const newCount = existing.purchaseCount + 1;
      updatedCustomer = {
        ...existing,
        purchaseCount: newCount,
        isFrequent: newCount >= FREQUENT_CUSTOMER_THRESHOLD,
        ...(phone && phone.trim() && !existing.phone
          ? { phone: phone.trim() }
          : {}),
      };
      customers[existingIndex] = updatedCustomer;
    } else {
      updatedCustomer = {
        id: Date.now().toString(),
        name: name.trim(),
        phone: phone?.trim() || undefined,
        isFrequent: 1 >= FREQUENT_CUSTOMER_THRESHOLD,
        purchaseCount: 1,
        createdAt: new Date().toISOString(),
      };
      customers.push(updatedCustomer);
    }

    this.saveCustomers(customers);
    return updatedCustomer;
  },

  // Discounts
  getDiscounts(): Discount[] {
    const data = localStorage.getItem(DISCOUNTS_KEY);
    if (!data) {
      localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(DEFAULT_DISCOUNTS));
      return DEFAULT_DISCOUNTS;
    }
    const discounts: Discount[] = JSON.parse(data);
    if (!discounts.find((d) => d.id === "d-cash")) {
      const withCash = [
        ...discounts,
        DEFAULT_DISCOUNTS.find((d) => d.id === "d-cash")!,
      ];
      localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(withCash));
      return withCash;
    }
    return discounts;
  },
  saveDiscounts(discounts: Discount[]): void {
    localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(discounts));
  },

  // Session
  getCurrentUser(): User | null {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },
  setCurrentUser(user: User): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },
  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  // Stock Requests (entre sucursales)
  getStockRequests(): StockRequest[] {
    const data = localStorage.getItem(STOCK_REQUESTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveStockRequests(requests: StockRequest[]): void {
    localStorage.setItem(STOCK_REQUESTS_KEY, JSON.stringify(requests));
  },
  createStockRequest(
    productId: string,
    productName: string,
    productUnit: string,
    requestedBy: string,
    requestedByName: string,
    fromBranch: string,
    toBranch: string,
    quantity: number
  ): StockRequest {
    const newRequest: StockRequest = {
      id: Date.now().toString(),
      productId,
      productName,
      productUnit,
      requestedBy,
      requestedByName,
      fromBranch,
      toBranch,
      quantity,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const requests = this.getStockRequests();
    requests.push(newRequest);
    this.saveStockRequests(requests);
    return newRequest;
  },
  updateStockRequestStatus(
    requestId: string,
    status: "approved" | "rejected",
    resolvedBy: string,
    resolvedByName: string
  ): StockRequest | null {
    const requests = this.getStockRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return null;
    const updated = {
      ...requests[index],
      status,
      resolvedAt: new Date().toISOString(),
      resolvedBy,
      resolvedByName,
    };
    requests[index] = updated;
    this.saveStockRequests(requests);
    return updated;
  },

  // Purchase Orders (compras a proveedores)
  getPurchaseOrders(): PurchaseOrder[] {
    const data = localStorage.getItem(PURCHASE_ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  savePurchaseOrders(orders: PurchaseOrder[]): void {
    localStorage.setItem(PURCHASE_ORDERS_KEY, JSON.stringify(orders));
  },
  createPurchaseOrder(
    productId: string,
    productName: string,
    productUnit: string,
    branch: string,
    quantity: number,
    cost: number,
    provider: string
  ): PurchaseOrder {
    const newOrder: PurchaseOrder = {
      id: Date.now().toString(),
      productId,
      productName,
      productUnit,
      branch,
      quantity,
      cost,
      provider,
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const orders = this.getPurchaseOrders();
    orders.push(newOrder);
    this.savePurchaseOrders(orders);
    return newOrder;
  },
};