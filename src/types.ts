export interface MaintenanceRecord {
  id: string;
  date: string;
  catalogNumber: string;
  brand: string;
  description: string;
  quantity: number;
  unitPriceSale: number;
  unitPricePurchase: number;
  totalPrice: number;
  purchasePrice: number;
  note: string;
  status?: number;
  prepayment?: number;
}

export interface Car {
  id: string;
  clientId: string;
  vin: string;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  carNote: string;
  records: MaintenanceRecord[];
}

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  lastActivity?: number;
}

// Новые интерфейсы для склада
export interface WarehouseCategory {
  id: string;
  name: string;
}

export interface WarehouseItem {
  id: string;
  categoryId: string; // Связь с категорией
  catalogNumber: string;
  brand: string;
  description: string;
  quantity: number;
  unitPricePurchase: number;
  note: string;
}

export interface AppData {
  clients: Client[];
  cars: Car[];
  noteOptions: string[];
  lastUsedNote?: string;
  warehouseCategories: WarehouseCategory[]; // Категории склада
  warehouseItems: WarehouseItem[];         // Товары на складе
}