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
  warehouseItemId?: string;
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

export interface WarehouseCategory {
  id: string;
  name: string;
}

export interface WarehouseItem {
  id: string;
  categoryId: string;
  catalogNumber: string;
  brand: string;
  description: string;
  quantity: number;
  reserved: number;
  unitPricePurchase: number;
  note: string;
}

// НОВЫЙ ТИП ДЛЯ КАССЫ
export interface CashRecord {
  id: string;
  date: string;
  flow: number;        // Денежный поток (+ или -)
  description: string;
  total: number;       // Итоговая сумма (баланс после этой операции)
  createdAt: number;   // Время создания для точной сортировки внутри одного дня
}

export interface AppData {
  clients: Client[];
  cars: Car[];
  noteOptions: string[];
  lastUsedNote?: string;
  warehouseCategories: WarehouseCategory[];
  warehouseItems: WarehouseItem[];
  cashRecords: CashRecord[]; // Массив записей кассы
}