import { useState, useEffect, useRef } from 'react';
import { Client, Car, MaintenanceRecord, AppData } from '../types';

const initialData: AppData = { clients: [], cars: [], noteOptions: [] };

export function useStorage() {
  const [data, setData] = useState<AppData>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    window.electronAPI.readDB().then((savedData) => {
      if (savedData) setData(prev => ({ ...initialData, ...savedData }));
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    window.electronAPI.writeDB(data);
  }, [data, isLoaded]);

  // СОЗДАНИЕ ТОЛЬКО КЛИЕНТА
  const addClient = (fullName: string, phone: string) => {
    const clientId = crypto.randomUUID();
    const newClient = { id: clientId, fullName, phone };
    setData(prev => ({ ...prev, clients: [...prev.clients, newClient] }));
  };

  const updateClient = (id: string, updatedFields: Partial<Client>) => {
    setData(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === id ? { ...c, ...updatedFields } : c)
    }));
  };

  const deleteClient = (clientId: string) => {
    setData(prev => ({
      ...prev,
      clients: prev.clients.filter(c => c.id !== clientId),
      cars: prev.cars.filter(car => car.clientId !== clientId)
    }));
  };

  const addCarToClient = (clientId: string, carData: any) => {
    const newCar = { id: crypto.randomUUID(), clientId, records: [], ...carData };
    setData(prev => ({ ...prev, cars: [...prev.cars, newCar] }));
  };

  const updateCar = (id: string, updatedFields: Partial<Car>) => {
    setData(prev => ({
      ...prev,
      cars: prev.cars.map(c => c.id === id ? { ...c, ...updatedFields } : c)
    }));
  };

  const deleteCar = (carId: string) => {
    setData(prev => ({ ...prev, cars: prev.cars.filter(car => car.id !== carId) }));
  };

  const addRecord = (carId: string, record: Omit<MaintenanceRecord, 'id'>) => {
    setData(prev => ({
      ...prev,
      cars: prev.cars.map(car => car.id === carId ? { ...car, records: [...car.records, { ...record, id: crypto.randomUUID() }] } : car)
    }));
  };

  const updateRecord = (carId: string, recordId: string, updatedFields: Partial<MaintenanceRecord>) => {
    setData(prev => ({
      ...prev,
      cars: prev.cars.map(car => car.id === carId ? {
        ...car,
        records: car.records.map(r => r.id === recordId ? { ...r, ...updatedFields } : r)
      } : car)
    }));
  };

  const deleteRecord = (carId: string, recordId: string) => {
    setData(prev => ({ ...prev, cars: prev.cars.map(car => car.id === carId ? { ...car, records: car.records.filter(r => r.id !== recordId) } : car) }));
  };

  const updateNoteOptions = (newOptions: string[]) => { setData(prev => ({ ...prev, noteOptions: newOptions })); };

  return {
    isLoaded, clients: data.clients, cars: data.cars, noteOptions: data.noteOptions,
    addClient, updateClient, deleteClient,
    addCarToClient, updateCar, deleteCar,
    addRecord, updateRecord, deleteRecord,
    updateNoteOptions
  };
}