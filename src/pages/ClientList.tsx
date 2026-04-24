import { useState, useMemo } from 'react';
import { Search, UserPlus, Car as CarIcon, Phone, Plus, Trash2, Edit2 } from 'lucide-react';
import { AddClientModal } from '../components/AddClientModal';
import { AddCarModal } from '../components/AddCarModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Client, Car } from '../types';

interface ClientListProps {
  clients: Client[]; cars: Car[];
  addClient: any; updateClient: any; deleteClient: any;
  addCarToClient: any; updateCar: any; deleteCar: any;
  onSelectCar: (carId: string) => void;
}

export function ClientList({ clients, cars, addClient, updateClient, deleteClient, addCarToClient, updateCar, deleteCar, onSelectCar }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<{ type: 'addClient' | 'editClient' | 'addCar' | 'editCar' | null, data?: any }>({ type: null });
  const [confirm, setConfirm] = useState({ isOpen: false, id: '', name: '', type: 'client' as 'client' | 'car' });

  const groupedData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return clients.map(client => {
      const clientCars = cars.filter(car => car.clientId === client.id);
      const filteredCars = clientCars.filter(car => {
        const carInfo = (car.brand + car.model + car.vin + (car.licensePlate || '')).toLowerCase();
        const historyMatch = car.records.some(r => r.description.toLowerCase().includes(term));
        return carInfo.includes(term) || historyMatch;
      });
      return { client, clientCars, filteredCars, hasClientMatch: (client.fullName + client.phone).toLowerCase().includes(term) };
    }).filter(g => g.hasClientMatch || g.filteredCars.length > 0);
  }, [clients, cars, searchTerm]);

  return (
    <div className="p-4 max-w-7xl mx-auto animate-in fade-in font-normal text-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">База клиентов</h1>
        <button onClick={() => setModal({ type: 'addClient' })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95">
          <UserPlus size={18} /> <span>Новый клиент</span>
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="Поиск по базе..." className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all font-normal" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {groupedData.map(({ client, clientCars, filteredCars }) => {
          const displayCars = searchTerm ? filteredCars : clientCars;
          return (
            <div key={client.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all">
              <div className="p-4 bg-slate-50/50 border-b flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{client.fullName}</h3>
                    <button onClick={() => setModal({ type: 'editClient', data: client })} className="p-1 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={14}/></button>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium"><Phone size={12}/>{client.phone}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setConfirm({ isOpen: true, id: client.id, name: client.fullName, type: 'client' })} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                  <button onClick={() => setModal({ type: 'addCar', data: client.id })} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-xs font-bold shadow-sm active:scale-95">
                    <Plus size={14}/> Добавить авто
                  </button>
                </div>
              </div>
              <div className="p-1">
                {displayCars.map(car => (
                  <div key={car.id} onClick={() => onSelectCar(car.id)} className="group flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-all cursor-pointer border border-transparent hover:border-blue-100 mb-0.5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors"><CarIcon size={20}/></div>
                      <div className="font-normal">
                        <div className="text-sm font-bold text-slate-800">{car.brand} {car.model} <span className="text-slate-400 font-normal ml-2">{car.year}</span></div>
                        <div className="text-[10px] font-normal text-slate-500 uppercase tracking-tight">VIN: {car.vin} | ГРЗ: {car.licensePlate || '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setModal({ type: 'editCar', data: car })} className="p-2 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={16}/></button>
                      <button onClick={() => setConfirm({ isOpen: true, id: car.id, name: `${car.brand} ${car.model}`, type: 'car' })} className="p-2 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <AddClientModal isOpen={modal.type === 'addClient' || modal.type === 'editClient'} onClose={() => setModal({ type: null })} onAdd={(name: string, phone: string, car: any) => modal.type === 'editClient' ? updateClient(modal.data.id, { fullName: name, phone }) : addClient(name, phone, car)} initialData={modal.type === 'editClient' ? modal.data : null} />
      <AddCarModal isOpen={modal.type === 'addCar' || modal.type === 'editCar'} onClose={() => setModal({ type: null })} clientId={modal.type === 'addCar' ? modal.data : modal.data?.clientId} onAdd={(cid: string, car: any) => modal.type === 'editCar' ? updateCar(modal.data.id, car) : addCarToClient(cid, car)} initialData={modal.type === 'editCar' ? modal.data : null} />
      <ConfirmModal isOpen={confirm.isOpen} onClose={() => setConfirm({ ...confirm, isOpen: false })} onConfirm={() => confirm.type === 'client' ? deleteClient(confirm.id) : deleteCar(confirm.id)} title={confirm.type === 'client' ? "Удаление клиента" : "Удаление авто"} message={`Вы действительно хотите удалить ${confirm.name}?`} />
    </div>
  );
}