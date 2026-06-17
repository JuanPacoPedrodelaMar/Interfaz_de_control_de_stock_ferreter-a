import { Product, Movement, User, Customer, Discount } from "../types";

const PRODUCTS_KEY = "ferreteria_products";
const MOVEMENTS_KEY = "ferreteria_movements";
const USERS_KEY = "ferreteria_users";
const CUSTOMERS_KEY = "ferreteria_customers";
const DISCOUNTS_KEY = "ferreteria_discounts";
const SESSION_KEY = "ferreteria_session";

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
    const discounts: Discount[] = JSON.parse(data);
    // Migración: asegurar que el descuento de efectivo existe
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

};