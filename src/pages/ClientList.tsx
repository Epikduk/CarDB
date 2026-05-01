import React, { useState, useMemo, useEffect, useLayoutEffect } from 'react';
import { Search, UserPlus, Car as CarIcon, Phone, Plus, Trash2, Edit2, ChevronDown } from 'lucide-react';
import { AddClientModal } from '../components/AddClientModal';
import { AddCarModal } from '../components/AddCarModal';
import { ConfirmModal } from '../components/ConfirmModal';

export function ClientList({ 
  clients, cars, addClient, updateClient, deleteClient, 
  addCarToClient, updateCar, deleteCar, onSelectCar,
  expandedClientIds, setExpandedClientIds, scrollPos, setScrollPos
}: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<{ type: any, data?: any }>({ type: null });
  const [confirm, setConfirm] = useState({ isOpen: false, id: '', name: '', type: 'client' as 'client' | 'car' });

  // --- ЛОГИКА ВОССТАНОВЛЕНИЯ СКРОЛЛА ---
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo(0, scrollPos);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // --- ЛОГИКА СОХРАНЕНИЯ СКРОЛЛА ---
  useEffect(() => {
    const handleScroll = () => {
      setScrollPos(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollPos]);

  // --- ЛОГИКА ПОИСКА ---
  const groupedData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return clients.map((client: any) => {
      const clientCars = cars.filter((car: any) => car.clientId === client.id);
      const filteredCars = clientCars.filter((car: any) => {
        const carInfo = (car.brand + car.model + car.vin + (car.licensePlate || '')).toLowerCase();
        const isCarMatch = carInfo.includes(term);
        const isHistoryMatch = car.records?.some((record: any) => 
          (record.description + (record.catalogNumber || '') + (record.brand || '')).toLowerCase().includes(term)
        );
        return isCarMatch || isHistoryMatch;
      });
      const isClientMatch = (client.fullName + client.phone).toLowerCase().includes(term);
      return { client, clientCars, filteredCars, hasMatch: isClientMatch || filteredCars.length > 0 };
    }).filter((g: any) => g.hasMatch);
  }, [clients, cars, searchTerm]);

  // --- ЛОГИКА ВЫПАДАЮЩЕГО СПИСКА ---
  const toggleExpand = (clientId: string) => {
    const newSet = new Set(expandedClientIds);
    if (newSet.has(clientId)) newSet.delete(clientId);
    else newSet.add(clientId);
    setExpandedClientIds(newSet);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500 text-left">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-black uppercase italic tracking-tight leading-none">База клиентов</h1>
        <button onClick={() => setModal({ type: 'addClient' })} className="btn-action !py-3 !px-6">
          <UserPlus size={18} /> <span>Новый клиент</span>
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Поиск по базе..." 
          className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-green-500 shadow-sm transition-all font-bold text-sm" 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {groupedData.map(({ client, clientCars, filteredCars }: any) => {
          const isExpanded = expandedClientIds.has(client.id);
          const displayCars = searchTerm ? filteredCars : clientCars;
          
          return (
            <div key={client.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden hover:border-green-500/20 transition-all">
              {/* Шапка клиента */}
              <div 
                onClick={() => toggleExpand(client.id)}
                className={`p-4 bg-slate-50/50 flex justify-between items-center cursor-pointer group/card relative z-10 transition-all border-b ${
                  isExpanded ? 'border-slate-200' : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} className="text-slate-300 group-hover/card:text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 text-left">
                      <h3 className="text-lg font-black text-slate-900 italic uppercase leading-none">{client.fullName}</h3>
                      <button onClick={(e) => { e.stopPropagation(); setModal({ type: 'editClient', data: client }); }} className="p-1 text-slate-300 hover:text-green-600 transition-colors">
                        <Edit2 size={14}/>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase mt-1.5 leading-none">
                      <Phone size={12} className="text-green-600"/>{client.phone}
                      <span className="mx-2 text-slate-200">|</span>
                      <span>Автомобилей: {clientCars.length}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setConfirm({ isOpen: true, id: client.id, name: client.fullName, type: 'client' })} className="p-2 text-slate-300 hover:text-red-600 transition-all"><Trash2 size={20}/></button>
                  <button onClick={() => setModal({ type: 'addCar', data: client.id })} className="btn-action">
                    <Plus size={14}/> Добавить авто
                  </button>
                </div>
              </div>

              {/* Список машин */}
              {isExpanded && (
                <div className="p-1 bg-white animate-in slide-in-from-top-1 duration-200">
                  {displayCars.map((car: any) => (
                    <div key={car.id} onClick={() => onSelectCar(car.id)} className="group flex items-center justify-between p-3 rounded-xl hover:bg-green-50 transition-all cursor-pointer border border-transparent hover:border-green-100 mb-0.5">
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-2 bg-slate-100 text-slate-400 rounded-xl group-hover:bg-green-100 group-hover:text-green-600 transition-all"><CarIcon size={20}/></div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 group-hover:text-black">{car.brand} {car.model} <span className="text-slate-400 font-normal ml-2">{car.year}</span></div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">VIN: {car.vin || '—'} | ГРЗ: {car.licensePlate || '—'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setModal({ type: 'editCar', data: car })} className="p-2 text-slate-300 hover:text-green-600 opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={16}/></button>
                        <button onClick={() => setConfirm({ isOpen: true, id: car.id, name: `${car.brand} ${car.model}`, type: 'car' })} className="p-2 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                  {displayCars.length === 0 && (
                    <div className="p-8 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest italic">Машины не найдены</div>
                  )}
                </div>
              )}
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