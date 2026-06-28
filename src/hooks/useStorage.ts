import { useState, useEffect, useRef } from 'react';
import { Client, Car, MaintenanceRecord, AppData, WarehouseCategory, WarehouseItem, CashRecord } from '../types';

const initialData: AppData = { 
  clients: [], cars: [], noteOptions: [], lastUsedNote: '', lastSelectedCarId: '',
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
          ...initialData,
          ...savedData,
          warehouseItems: (savedData.warehouseItems || []).map((i: any) => ({ ...i, reserved: i.reserved || 0 }))
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

  // Запоминаем последнюю выбранную машину
  const updateLastCar = (carId: string) => {
    setData(prev => ({ ...prev, lastSelectedCarId: carId }));
  };

  const adjustWarehouse = (draftItems: WarehouseItem[], itemId: string, qtyDiff: number, totalDiff: number = 0) => {
    return draftItems.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + totalDiff), reserved: Math.max(0, (i.reserved || 0) + qtyDiff) } : i);
  };

  const severWarehouseLinks = (draftCars: Car[], warehouseItemId: string) => {
    return draftCars.map(car => ({ ...car, records: car.records.map(r => r.warehouseItemId === warehouseItemId ? { ...r, warehouseItemId: undefined } : r) }));
  };

  const addRecord = (carId: string, record: Omit<MaintenanceRecord, 'id'>) => {
    setData(prev => {
      const car = prev.cars.find(c => c.id === carId);
      if (record.warehouseItemId && car) {
        if (car.records.find(r => r.date === record.date && r.warehouseItemId === record.warehouseItemId)) return prev;
      }
      const newItems = record.warehouseItemId ? adjustWarehouse(prev.warehouseItems, record.warehouseItemId, record.quantity) : prev.warehouseItems;
      return { ...prev, lastUsedNote: record.note, warehouseItems: newItems, cars: prev.cars.map(c => c.id === carId ? { ...c, records: [...c.records, { ...record, id: crypto.randomUUID() }] } : c) };
    });
  };

  const updateRecord = (carId: string, recordId: string, updatedFields: Partial<MaintenanceRecord>) => {
    setData(prev => {
      const car = prev.cars.find(c => c.id === carId);
      if (!car || !car.records.find(r => r.id === recordId)) return prev;
      const oldRecord = car.records.find(r => r.id === recordId)!;
      let draftItems = [...prev.warehouseItems];
      let draftCars = [...prev.cars];
      const newDate = updatedFields.date || oldRecord.date;
      const warehouseId = oldRecord.warehouseItemId;

      if (warehouseId) {
        const conflict = car.records.find(r => r.id !== recordId && r.date === newDate && r.warehouseItemId === warehouseId);
        if (conflict) {
          const addedQty = (updatedFields.quantity ?? oldRecord.quantity);
          draftItems = adjustWarehouse(draftItems, warehouseId, addedQty - oldRecord.quantity);
          return { ...prev, warehouseItems: draftItems, cars: draftCars.map(c => c.id === carId ? { ...c, records: c.records.filter(r => r.id !== recordId).map(r => r.id === conflict.id ? { ...r, quantity: r.quantity + addedQty, totalPrice: (r.quantity + addedQty) * r.unitPriceSale, purchasePrice: (r.quantity + addedQty) * r.unitPricePurchase } : r) } : c) };
        }
        if (oldRecord.status === 0) {
          if (updatedFields.status === 2) { draftItems = adjustWarehouse(draftItems, warehouseId, -oldRecord.quantity, -oldRecord.quantity); if (draftItems.find(i => i.id === warehouseId)!.quantity <= 0) { draftItems = draftItems.filter(i => i.id !== warehouseId); draftCars = severWarehouseLinks(draftCars, warehouseId); } }
          else if (updatedFields.status === 3) draftItems = adjustWarehouse(draftItems, warehouseId, -oldRecord.quantity);
          else if (updatedFields.quantity !== undefined) draftItems = adjustWarehouse(draftItems, warehouseId, updatedFields.quantity - oldRecord.quantity);
        }
      }
      return { ...prev, lastUsedNote: updatedFields.note || prev.lastUsedNote, warehouseItems: draftItems, cars: draftCars.map(c => c.id === carId ? { ...c, records: c.records.map(r => r.id === recordId ? { ...r, ...updatedFields } : r) } : c) };
    });
  };

  const deleteRecord = (carId: string, recordId: string) => {
    setData(prev => {
      const record = prev.cars.find(c => c.id === carId)?.records.find(r => r.id === recordId);
      const newItems = record?.warehouseItemId && record.status === 0 ? adjustWarehouse(prev.warehouseItems, record.warehouseItemId, -record.quantity) : prev.warehouseItems;
      return { ...prev, warehouseItems: newItems, cars: prev.cars.map(c => c.id === carId ? { ...c, records: c.records.filter(r => r.id !== recordId) } : c) };
    });
  };

  const deleteWarehouseItem = (id: string) => { setData(prev => ({ ...prev, warehouseItems: prev.warehouseItems.filter(i => i.id !== id), cars: severWarehouseLinks(prev.cars, id) })); };
  const updateGroupDate = (carId: string, oldDate: string, newDate: string) => { if (oldDate === newDate) return; setData(prev => { const car = prev.cars.find(c => c.id === carId); if (!car) return prev; const staticRecs = car.records.filter(r => r.date !== oldDate && r.date !== newDate); const targetRecs = car.records.filter(r => r.date === newDate); const movingRecs = car.records.filter(r => r.date === oldDate); const merged = [...targetRecs]; movingRecs.forEach(m => { const idx = merged.findIndex(r => r.warehouseItemId && r.warehouseItemId === m.warehouseItemId); if (idx > -1) { merged[idx].quantity += m.quantity; merged[idx].totalPrice = merged[idx].quantity * merged[idx].unitPriceSale; merged[idx].purchasePrice = merged[idx].quantity * merged[idx].unitPricePurchase; } else merged.push({ ...m, date: newDate }); }); return { ...prev, cars: prev.cars.map(c => c.id === carId ? { ...c, records: [...staticRecs, ...merged] } : c) }; }); };
  const updateClientActivity = (clientId: string) => { setData(prev => ({ ...prev, clients: prev.clients.map(c => c.id === clientId ? { ...c, lastActivity: Date.now() } : c) })); };
  const addClient = (fullName: string, phone: string, carData: any) => { const cid = crypto.randomUUID(); setData(prev => ({ ...prev, clients: [...prev.clients, { id: cid, fullName, phone, lastActivity: Date.now() }], cars: [...prev.cars, { id: crypto.randomUUID(), clientId: cid, records: [], ...carData }] })); };
  const updateClient = (id: string, f: Partial<Client>) => { setData(prev => ({ ...prev, clients: prev.clients.map(c => c.id === id ? { ...c, ...f } : c) })); };
  const deleteClient = (id: string) => { setData(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== id), cars: prev.cars.filter(car => car.clientId !== id) })); };
  const addCarToClient = (cid: string, d: any) => { setData(prev => ({ ...prev, cars: [...prev.cars, { id: crypto.randomUUID(), clientId: cid, records: [], ...d }] })); };
  const updateCar = (id: string, f: Partial<Car>) => { setData(prev => ({ ...prev, cars: prev.cars.map(c => c.id === id ? { ...c, ...f } : c) })); };
  const deleteCar = (id: string) => { setData(prev => ({ ...prev, cars: prev.cars.filter(c => c.id !== id) })); };
  const updateNoteOptions = (o: string[]) => { setData(prev => ({ ...prev, noteOptions: o })); };
  const addWarehouseCategory = (n: string) => { setData(prev => ({ ...prev, warehouseCategories: [...prev.warehouseCategories, { id: crypto.randomUUID(), name: n }] })); };
  const updateWarehouseCategory = (id: string, n: string) => { setData(prev => ({ ...prev, warehouseCategories: prev.warehouseCategories.map(c => c.id === id ? { ...c, name: n } : c) })); };
  const deleteWarehouseCategory = (id: string) => { setData(prev => ({ ...prev, warehouseCategories: prev.warehouseCategories.filter(c => c.id !== id), warehouseItems: prev.warehouseItems.filter(i => i.categoryId !== id) })); };
  const addWarehouseItem = (i: any) => { setData(prev => ({ ...prev, warehouseItems: [...prev.warehouseItems, { ...i, id: crypto.randomUUID(), reserved: 0 }] })); };
  const updateWarehouseItem = (id: string, f: any) => { setData(prev => ({ ...prev, warehouseItems: prev.warehouseItems.map(i => i.id === id ? { ...i, ...f } : i) })); };
  const addCashRecord = (r: any) => { const recalculate = (recs: CashRecord[]) => { const s = [...recs].sort((a,b) => a.date !== b.date ? a.date.localeCompare(b.date) : a.createdAt - b.createdAt); let b = 0; return s.map(x => { b += x.flow; return { ...x, total: b }; }); }; setData(prev => ({ ...prev, cashRecords: recalculate([...prev.cashRecords, { ...r, id: crypto.randomUUID(), createdAt: Date.now(), total: 0 }]) })); };
  const updateCashRecord = (id: string, f: any) => { const recalculate = (recs: CashRecord[]) => { const s = [...recs].sort((a,b) => a.date !== b.date ? a.date.localeCompare(b.date) : a.createdAt - b.createdAt); let b = 0; return s.map(x => { b += x.flow; return { ...x, total: b }; }); }; setData(prev => ({ ...prev, cashRecords: recalculate(prev.cashRecords.map(r => r.id === id ? { ...r, ...f } : r)) })); };
  const deleteCashRecord = (id: string) => { const recalculate = (recs: CashRecord[]) => { const s = [...recs].sort((a,b) => a.date !== b.date ? a.date.localeCompare(b.date) : a.createdAt - b.createdAt); let b = 0; return s.map(x => { b += x.flow; return { ...x, total: b }; }); }; setData(prev => ({ ...prev, cashRecords: recalculate(prev.cashRecords.filter(r => r.id !== id)) })); };

  return {
    isLoaded, clients: data.clients, cars: data.cars, noteOptions: data.noteOptions,
    lastUsedNote: data.lastUsedNote, lastSelectedCarId: data.lastSelectedCarId, warehouseCategories: data.warehouseCategories,
    warehouseItems: data.warehouseItems, cashRecords: data.cashRecords,
    addClient, updateClient, deleteClient, addCarToClient, updateCar, deleteCar,
    addRecord, updateRecord, deleteRecord, updateNoteOptions, updateClientActivity, updateGroupDate,
    addWarehouseCategory, updateWarehouseCategory, deleteWarehouseCategory,
    addWarehouseItem, updateWarehouseItem, deleteWarehouseItem,
    addCashRecord, updateCashRecord, deleteCashRecord, updateLastCar
  };
}