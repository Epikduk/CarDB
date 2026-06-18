import { useState, useEffect, useRef } from 'react';
import { Client, Car, MaintenanceRecord, AppData, WarehouseCategory, WarehouseItem, CashRecord } from '../types';

const initialData: AppData = { 
  clients: [], cars: [], noteOptions: [], lastUsedNote: '',
  warehouseCategories: [], warehouseItems: [], cashRecords: []
};

export function useStorage() {
  const [data, setData] = useState<AppData>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    window.electronAPI.readDB().then((savedData) => {
      if (savedData) {
        setData({
          clients: savedData.clients || [],
          cars: savedData.cars || [],
          noteOptions: savedData.noteOptions || [],
          lastUsedNote: savedData.lastUsedNote || '',
          warehouseCategories: savedData.warehouseCategories || [],
          warehouseItems: (savedData.warehouseItems || []).map((i: any) => ({ ...i, reserved: i.reserved || 0 })),
          cashRecords: savedData.cashRecords || []
        });
      }
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    window.electronAPI.writeDB(data);
  }, [data, isLoaded]);

  // --- ЛОГИКА КАССЫ (ПЕРЕСЧЕТ) ---
  const recalculateCash = (records: CashRecord[]): CashRecord[] => {
    const sorted = [...records].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.createdAt - b.createdAt;
    });
    
    let currentBalance = 0;
    return sorted.map(r => {
      currentBalance += r.flow;
      return { ...r, total: currentBalance };
    });
  };

  const addCashRecord = (record: Omit<CashRecord, 'id' | 'total' | 'createdAt'>) => {
    setData(prev => {
      const newRecord: CashRecord = {
        ...record,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        total: 0 // Будет пересчитано
      };
      return { ...prev, cashRecords: recalculateCash([...prev.cashRecords, newRecord]) };
    });
  };

  const updateCashRecord = (id: string, updatedFields: Partial<CashRecord>) => {
    setData(prev => {
      const updated = prev.cashRecords.map(r => r.id === id ? { ...r, ...updatedFields } : r);
      return { ...prev, cashRecords: recalculateCash(updated) };
    });
  };

  const deleteCashRecord = (id: string) => {
    setData(prev => ({ ...prev, cashRecords: recalculateCash(prev.cashRecords.filter(r => r.id !== id)) }));
  };

  // --- ОСТАЛЬНЫЕ ФУНКЦИИ (БЕЗ ИЗМЕНЕНИЙ) ---
  const severWarehouseLinks = (draftCars: Car[], warehouseItemId: string) => {
    return draftCars.map(car => ({
      ...car,
      records: car.records.map(r => r.warehouseItemId === warehouseItemId ? { ...r, warehouseItemId: undefined } : r)
    }));
  };
  const adjustWarehouse = (draftItems: WarehouseItem[], itemId: string, qtyDiff: number, totalDiff: number = 0) => {
    return draftItems.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + totalDiff), reserved: Math.max(0, (i.reserved || 0) + qtyDiff) } : i);
  };
  const addRecord = (carId: string, record: Omit<MaintenanceRecord, 'id'>) => {
    setData(prev => {
      const car = prev.cars.find(c => c.id === carId);
      if (!car) return prev;
      if (record.warehouseItemId) {
        const exists = car.records.find(r => r.date === record.date && r.warehouseItemId === record.warehouseItemId);
        if (exists) return prev;
      }
      const newItems = record.warehouseItemId ? adjustWarehouse(prev.warehouseItems, record.warehouseItemId, record.quantity) : prev.warehouseItems;
      return { ...prev, lastUsedNote: record.note, warehouseItems: newItems, cars: prev.cars.map(c => c.id === carId ? { ...c, records: [...c.records, { ...record, id: crypto.randomUUID() }] } : c) };
    });
  };
  const updateRecord = (carId: string, recordId: string, updatedFields: Partial<MaintenanceRecord>) => {
    setData(prev => {
      const car = prev.cars.find(c => c.id === carId);
      if (!car) return prev;
      const oldRecord = car.records.find(r => r.id === recordId);
      if (!oldRecord) return prev;
      let draftItems = [...prev.warehouseItems];
      let draftCars = [...prev.cars];
      const newDate = updatedFields.date || oldRecord.date;
      const warehouseId = oldRecord.warehouseItemId;
      if (warehouseId) {
        const conflict = car.records.find(r => r.id !== recordId && r.date === newDate && r.warehouseItemId === warehouseId);
        if (conflict) {
          const addedQty = (updatedFields.quantity ?? oldRecord.quantity);
          const newTotalQty = conflict.quantity + addedQty;
          draftItems = adjustWarehouse(draftItems, warehouseId, addedQty - oldRecord.quantity);
          return { ...prev, warehouseItems: draftItems, cars: draftCars.map(c => c.id === carId ? { ...c, records: c.records.filter(r => r.id !== recordId).map(r => r.id === conflict.id ? { ...r, quantity: newTotalQty, totalPrice: newTotalQty * r.unitPriceSale, purchasePrice: newTotalQty * r.unitPricePurchase } : r) } : c) };
        }
      }
      let finalWhId = oldRecord.warehouseItemId;
      if (warehouseId && oldRecord.status === 0) {
        if (updatedFields.status === 2) {
          draftItems = adjustWarehouse(draftItems, warehouseId, -oldRecord.quantity, -oldRecord.quantity);
          finalWhId = undefined;
          const updatedItem = draftItems.find(i => i.id === warehouseId);
          if (updatedItem && updatedItem.quantity <= 0) { draftItems = draftItems.filter(i => i.id !== warehouseId); draftCars = severWarehouseLinks(draftCars, warehouseId); }
        } else if (updatedFields.status === 3) {
          draftItems = adjustWarehouse(draftItems, warehouseId, -oldRecord.quantity);
          finalWhId = undefined;
        } else if (updatedFields.quantity !== undefined) {
          draftItems = adjustWarehouse(draftItems, warehouseId, updatedFields.quantity - oldRecord.quantity);
        }
      }
      return { ...prev, ...(updatedFields.note ? { lastUsedNote: updatedFields.note } : {}), warehouseItems: draftItems, cars: draftCars.map(c => c.id === carId ? { ...c, records: c.records.map(r => r.id === recordId ? { ...r, ...updatedFields, warehouseItemId: finalWhId } : r) } : c) };
    });
  };
  const deleteWarehouseItem = (id: string) => { setData(prev => ({ ...prev, warehouseItems: prev.warehouseItems.filter(i => i.id !== id), cars: severWarehouseLinks(prev.cars, id) })); };
  const updateGroupDate = (carId: string, oldDate: string, newDate: string) => { if (oldDate === newDate) return; setData(prev => { const car = prev.cars.find(c => c.id === carId); if (!car) return prev; const staticRecords = car.records.filter(r => r.date !== oldDate && r.date !== newDate); const targetRecords = car.records.filter(r => r.date === newDate); const movingRecords = car.records.filter(r => r.date === oldDate); const merged = [...targetRecords]; movingRecords.forEach(moving => { if (moving.warehouseItemId) { const idx = merged.findIndex(r => r.warehouseItemId === moving.warehouseItemId); if (idx > -1) { const existing = merged[idx]; const newQty = existing.quantity + moving.quantity; merged[idx] = { ...existing, quantity: newQty, totalPrice: newQty * existing.unitPriceSale, purchasePrice: newQty * existing.unitPricePurchase }; return; } } merged.push({ ...moving, date: newDate }); }); return { ...prev, cars: prev.cars.map(c => c.id === carId ? { ...c, records: [...staticRecords, ...merged] } : c) }; }); };
  const deleteRecord = (carId: string, recordId: string) => { setData(prev => { const car = prev.cars.find(c => c.id === carId); const record = car?.records.find(r => r.id === recordId); let newWarehouseItems = prev.warehouseItems; if (record?.warehouseItemId && record.status === 0) newWarehouseItems = adjustWarehouse(prev.warehouseItems, record.warehouseItemId, -record.quantity); return { ...prev, warehouseItems: newWarehouseItems, cars: prev.cars.map(c => c.id === carId ? { ...c, records: c.records.filter(r => r.id !== recordId) } : c) }; }); };
  const updateClientActivity = (clientId: string) => { setData(prev => ({ ...prev, clients: prev.clients.map(c => c.id === clientId ? { ...c, lastActivity: Date.now() } : c) })); };
  const addClient = (fullName: string, phone: string, carData: any) => { const clientId = crypto.randomUUID(); const newClient = { id: clientId, fullName, phone, lastActivity: Date.now() }; const newCar = { id: crypto.randomUUID(), clientId, records: [], ...carData }; setData(prev => ({ ...prev, clients: [...prev.clients, newClient], cars: [...prev.cars, newCar] })); };
  const updateClient = (id: string, updatedFields: Partial<Client>) => { setData(prev => ({ ...prev, clients: prev.clients.map(c => c.id === id ? { ...c, ...updatedFields } : c) })); };
  const deleteClient = (clientId: string) => { setData(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== clientId), cars: prev.cars.filter(car => car.clientId !== clientId) })); };
  const addCarToClient = (clientId: string, carData: any) => { const newCar = { id: crypto.randomUUID(), clientId, records: [], ...carData }; setData(prev => ({ ...prev, cars: [...prev.cars, newCar] })); };
  const updateCar = (id: string, updatedFields: Partial<Car>) => { setData(prev => ({ ...prev, cars: prev.cars.map(c => c.id === id ? { ...c, ...updatedFields } : c) })); };
  const deleteCar = (carId: string) => { setData(prev => ({ ...prev, cars: prev.cars.filter(car => car.id !== carId) })); };
  const updateNoteOptions = (newOptions: string[]) => { setData(prev => ({ ...prev, noteOptions: newOptions })); };
  const addWarehouseCategory = (name: string) => { setData(prev => ({ ...prev, warehouseCategories: [...prev.warehouseCategories, { id: crypto.randomUUID(), name }] })); };
  const updateWarehouseCategory = (id: string, name: string) => { setData(prev => ({ ...prev, warehouseCategories: prev.warehouseCategories.map(c => c.id === id ? { ...c, name } : c) })); };
  const deleteWarehouseCategory = (id: string) => { setData(prev => ({ ...prev, warehouseCategories: prev.warehouseCategories.filter(c => c.id !== id), warehouseItems: prev.warehouseItems.filter(i => i.categoryId !== id) })); };
  const addWarehouseItem = (item: Omit<WarehouseItem, 'id' | 'reserved'>) => { setData(prev => ({ ...prev, warehouseItems: [...prev.warehouseItems, { ...item, id: crypto.randomUUID(), reserved: 0 }] })); };
  const updateWarehouseItem = (id: string, updatedFields: Partial<WarehouseItem>) => { setData(prev => ({ ...prev, warehouseItems: prev.warehouseItems.map(i => i.id === id ? { ...i, ...updatedFields } : i) })); };

  return {
    isLoaded, clients: data.clients, cars: data.cars, noteOptions: data.noteOptions,
    lastUsedNote: data.lastUsedNote, warehouseCategories: data.warehouseCategories,
    warehouseItems: data.warehouseItems, cashRecords: data.cashRecords,
    addClient, updateClient, deleteClient, addCarToClient, updateCar, deleteCar,
    addRecord, updateRecord, deleteRecord, updateNoteOptions, updateClientActivity, updateGroupDate,
    addWarehouseCategory, updateWarehouseCategory, deleteWarehouseCategory,
    addWarehouseItem, updateWarehouseItem, deleteWarehouseItem,
    addCashRecord, updateCashRecord, deleteCashRecord
  };
}