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
}

export interface AppData {
  clients: Client[];
  cars: Car[];
  noteOptions: string[];
}