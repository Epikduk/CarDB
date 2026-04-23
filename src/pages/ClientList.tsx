import { useState, useMemo } from 'react';
import { Search, UserPlus, Car as CarIcon, ArrowRight } from 'lucide-react';
import { AddClientModal } from '../components/AddClientModal';
import { AddCarModal } from '../components/AddCarModal';
import { Client, Car } from '../types';

interface ClientListProps {
  clients: Client[];
  cars: Car[];
  addClient: any;
  addCarToClient: any;
  onSelectCar: (carId: string) => void;
}

export function ClientList({ clients, cars, addClient, addCarToClient, onSelectCar }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddCarOpen, setIsAddCarOpen] = useState<{ isOpen: boolean; clientId: string }>({
    isOpen: false,
    clientId: '',
  });

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const combined = cars.map(car => ({
      car,
      client: clients.find(c => c.id === car.clientId)
    })).filter(item => item.client);

    if (!term) return combined;

    return combined.filter(({ car, client }) => {
      return (
        client?.fullName.toLowerCase().includes(term) ||
        client?.phone.toLowerCase().includes(term) ||
        car.vin.toLowerCase().includes(term) ||
        car.brand.toLowerCase().includes(term) ||
        car.model.toLowerCase().includes(term)
      );
    });
  }, [clients, cars, searchTerm]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">База данных клиентов</h1>
          <p className="text-slate-500">Управление клиентами и их автомобилями</p>
        </div>
        <button
          onClick={() => setIsAddClientOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <UserPlus size={20} />
          <span>Добавить клиента</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Поиск по ФИО, телефону, VIN или марке..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm font-semibold uppercase tracking-wider">
                <th className="px-6 py-4 border-b">Клиент / Телефон</th>
                <th className="px-6 py-4 border-b">Автомобиль</th>
                <th className="px-6 py-4 border-b">VIN Номер</th>
                <th className="px-6 py-4 border-b text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.length > 0 ? (
                filteredData.map(({ car, client }) => (
                  <tr key={car.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{client?.fullName}</div>
                      <div className="text-sm text-slate-500">{client?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CarIcon size={16} className="text-slate-400" />
                        <span className="text-slate-700 font-medium">{car.brand} {car.model}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">
                      {car.vin}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsAddCarOpen({ isOpen: true, clientId: client!.id })}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Добавить еще одну машину"
                        >
                          <CarIcon size={20} />
                        </button>
                        <button
                          onClick={() => onSelectCar(car.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-md transition-all text-sm font-medium"
                        >
                          К машине <ArrowRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    База данных пуста или ничего не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onAdd={addClient}
      />

      <AddCarModal
        isOpen={isAddCarOpen.isOpen}
        onClose={() => setIsAddCarOpen({ isOpen: false, clientId: '' })}
        clientId={isAddCarOpen.clientId}
        onAdd={addCarToClient}
      />
    </div>
  );
}