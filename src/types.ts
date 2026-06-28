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

export interface CashRecord {
  id: string;
  date: string;
  flow: number;
  description: string;
  total: number;
  createdAt: number;
}

export interface AppData {
  clients: Client[];
  cars: Car[];
  noteOptions: string[];
  lastUsedNote?: string;
  lastSelectedCarId?: string; // ID последней выбранной машины
  warehouseCategories: WarehouseCategory[];
  warehouseItems: WarehouseItem[];
  cashRecords: CashRecord[];
}