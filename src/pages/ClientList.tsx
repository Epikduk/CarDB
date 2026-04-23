import { useState, useMemo } from 'react';
import { Search, UserPlus, Car as CarIcon, ArrowRight, Phone, Plus, Trash2 } from 'lucide-react';
import { AddClientModal } from '../components/AddClientModal';
import { AddCarModal } from '../components/AddCarModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Client, Car } from '../types';

interface ClientListProps {
  clients: Client[];
  cars: Car[];
  addClient: any;
  deleteClient: (id: string) => void;
  deleteCar: (id: string) => void;
  addCarToClient: any;
  onSelectCar: (carId: string) => void;
}

export function ClientList({ clients, cars, addClient, deleteClient, deleteCar, addCarToClient, onSelectCar }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddCarOpen, setIsAddCarOpen] = useState({ isOpen: false, clientId: '' });
  
  const [confirmDelete, setConfirmDelete] = useState({ 
    isOpen: false, 
    id: '', 
    name: '', 
    type: 'client' as 'client' | 'car' 
  });

  const groupedData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return clients.map(client => ({
      client,
      clientCars: cars.filter(car => car.clientId === client.id)
    })).filter(({ client, clientCars }) => {
      const matchesClient = client.fullName.toLowerCase().includes(term) || client.phone.toLowerCase().includes(term);
      const matchesCars = clientCars.some(car => 
        car.brand.toLowerCase().includes(term) || 
        car.model.toLowerCase().includes(term) || 
        car.vin.toLowerCase().includes(term)
      );
      return matchesClient || matchesCars;
    });
  }, [clients, cars, searchTerm]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">База клиентов</h1>
          <p className="text-slate-500 text-sm">Всего клиентов: {clients.length}</p>
        </div>
        <button onClick={() => setIsAddClientOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 font-semibold">
          <UserPlus size={20} /> <span>Новый клиент</span>
        </button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="Поиск по базе..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm text-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {groupedData.map(({ client, clientCars }) => (
          <div key={client.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-300 transition-all">
            <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-slate-900">{client.fullName}</h3>
                <div className="flex items-center gap-2 text-slate-500 mt-1"><Phone size={14} /> <span className="font-medium">{client.phone}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setConfirmDelete({ isOpen: true, id: client.id, name: client.fullName, type: 'client' })} 
                  className="p-2 text-slate-300 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                  title="Удалить клиента"
                >
                  <Trash2 size={20} />
                </button>
                <button onClick={() => setIsAddCarOpen({ isOpen: true, clientId: client.id })} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-all text-sm font-bold shadow-sm">
                  <Plus size={16} /> Добавить авто
                </button>
              </div>
            </div>

            <div className="p-2">
              <div className="grid grid-cols-1 gap-1">
                {clientCars.map(car => (
                  <div key={car.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors"><CarIcon size={20} /></div>
                      <div>
                        <div className="font-bold text-slate-800">{car.brand} {car.model}</div>
                        <div className="text-xs font-mono text-slate-400">VIN: {car.vin}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setConfirmDelete({ isOpen: true, id: car.id, name: `${car.brand} ${car.model}`, type: 'car' })}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Удалить машину"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      {/* ВОЗВРАЩЕН СТИЛЬ: БЕЛАЯ -> СИНЯЯ ПРИ НАВЕДЕНИИ */}
                      <button 
                        onClick={() => onSelectCar(car.id)} 
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-sm font-bold opacity-0 group-hover:opacity-100"
                      >
                        К машине <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {clientCars.length === 0 && <div className="p-4 text-center text-slate-400 text-xs italic">Нет добавленных машин</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={() => confirmDelete.type === 'client' ? deleteClient(confirmDelete.id) : deleteCar(confirmDelete.id)}
        title={confirmDelete.type === 'client' ? "Удаление клиента" : "Удаление автомобиля"}
        message={confirmDelete.type === 'client' 
          ? `Вы действительно хотите удалить клиента "${confirmDelete.name}" и все его автомобили?` 
          : `Вы действительно хотите удалить автомобиль "${confirmDelete.name}" из базы данных?`
        }
      />

      <AddClientModal isOpen={isAddClientOpen} onClose={() => setIsAddClientOpen(false)} onAdd={addClient} />
      <AddCarModal isOpen={isAddCarOpen.isOpen} onClose={() => setIsAddCarOpen({ isOpen: false, clientId: '' })} clientId={isAddCarOpen.clientId} onAdd={addCarToClient} />
    </div>
  );
}