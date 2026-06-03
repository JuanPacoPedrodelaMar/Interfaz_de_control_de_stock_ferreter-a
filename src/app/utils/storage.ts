import { Product, Movement, User, Customer, Discount, StockRequest } from "../types";

const PRODUCTS_KEY = "ferreteria_products";
const MOVEMENTS_KEY = "ferreteria_movements";
const USERS_KEY = "ferreteria_users";
const CUSTOMERS_KEY = "ferreteria_customers";
const DISCOUNTS_KEY = "ferreteria_discounts";
const SESSION_KEY = "ferreteria_session";
const STOCK_REQUESTS_KEY = "ferreteria_stock_requests";

// Umbral de compras para que un cliente sea considerado frecuente
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
  {
    id: "u6",
    username: "almacen",
    password: "almacen123",
    role: "warehouse",
    branch: "Almacén Central",
    fullName: "Roberto Sánchez - Almacén",
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
];

export const storage = {
  // Products
  getProducts(): Product[] {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
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

  /**
   * Busca un cliente por nombre (case-insensitive, coincidencia exacta).
   * Retorna el cliente si existe, undefined si no.
   */
  findCustomerByName(name: string): Customer | undefined {
    if (!name.trim()) return undefined;
    const customers = this.getCustomers();
    const normalized = name.trim().toLowerCase();
    return customers.find((c) => c.name.trim().toLowerCase() === normalized);
  },

  /**
   * Registra una compra para un cliente. Si no existe lo crea.
   * Incrementa su contador de compras y lo marca como frecuente
   * cuando alcanza FREQUENT_CUSTOMER_THRESHOLD.
   * Retorna el cliente actualizado.
   */
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
        // Actualizar teléfono si no tenía uno y ahora se provee
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
    return JSON.parse(data);
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

  // Stock Requests
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
    requestedBy: string,
    requestedByName: string,
    fromBranch: string,
    toBranch: string,
    quantity: number
  ): StockRequest {
    const requests = this.getStockRequests();
    const newRequest: StockRequest = {
      id: Date.now().toString(),
      productId,
      productName,
      requestedBy,
      requestedByName,
      fromBranch,
      toBranch,
      quantity,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    requests.push(newRequest);
    this.saveStockRequests(requests);
    return newRequest;
  },
  updateStockRequest(
    requestId: string,
    status: "pending" | "approved" | "rejected",
    resolvedBy?: string
  ): void {
    const requests = this.getStockRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index !== -1) {
      requests[index] = {
        ...requests[index],
        status,
        resolvedAt: new Date().toISOString(),
        resolvedBy,
      };
      this.saveStockRequests(requests);
    }
  },
};
