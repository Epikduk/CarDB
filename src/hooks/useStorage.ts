import { useState, useEffect, useRef } from 'react';
import { Client, Car, MaintenanceRecord, AppData } from '../types';

// При первом запуске база полностью пуста
const initialData: AppData = {
  clients: [],
  cars: [],
  noteOptions: [] 
};

export function useStorage() {
  const [data, setData] = useState<AppData>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    window.electronAPI.readDB().then((savedData) => {
      if (savedData) {
        setData(prev => ({
          ...initialData,
          ...savedData,
          // Гарантируем, что даже если в старом файле не было поля, оно появится
          noteOptions: savedData.noteOptions || [] 
        }));
      }
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.electronAPI.writeDB(data);
  }, [data, isLoaded]);

  const addClient = (fullName: string, phone: string, vin: string, brand: string, model: string) => {
    const clientId = crypto.randomUUID();
    const carId = crypto.randomUUID();
    setData(prev => ({
      ...prev,
      clients: [...prev.clients, { id: clientId, fullName, phone }],
      cars: [...prev.cars, { id: carId, clientId, vin, brand, model, records: [] }]
    }));
  };

  const addCarToClient = (clientId: string, vin: string, brand: string, model: string) => {
    const carId = crypto.randomUUID();
    setData(prev => ({
      ...prev,
      cars: [...prev.cars, { id: carId, clientId, vin, brand, model, records: [] }]
    }));
  };

  const addRecord = (carId: string, record: Omit<MaintenanceRecord, 'id'>) => {
    setData(prev => ({
      ...prev,
      cars: prev.cars.map(car => 
        car.id === carId ? { ...car, records: [...car.records, { ...record, id: crypto.randomUUID() }] } : car
      )
    }));
  };

  const deleteRecord = (carId: string, recordId: string) => {
    setData(prev => ({
      ...prev,
      cars: prev.cars.map(car => 
        car.id === carId ? { ...car, records: car.records.filter(r => r.id !== recordId) } : car
      )
    }));
  };

  const updateNoteOptions = (newOptions: string[]) => {
    setData(prev => ({ ...prev, noteOptions: newOptions }));
  };

  return {
    isLoaded,
    clients: data.clients,
    cars: data.cars,
    noteOptions: data.noteOptions,
    addClient,
    addCarToClient,
    addRecord,
    deleteRecord,
    updateNoteOptions
  };
}