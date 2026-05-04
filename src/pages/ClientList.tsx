import React, { useState, useMemo, useEffect, useLayoutEffect } from 'react';
import { Search, UserPlus, Car as CarIcon, Phone, Plus, Trash2, Edit2, ChevronDown, SortAsc, CarFront, History, Filter } from 'lucide-react';
import { AddClientModal } from '../components/AddClientModal';
import { AddCarModal } from '../components/AddCarModal';
import { ConfirmModal } from '../components/ConfirmModal';

export function ClientList({ 
  clients, cars, addClient, updateClient, deleteClient, 
  addCarToClient, updateCar, deleteCar, onSelectCar,
  expandedClientIds, setExpandedClientIds, scrollPos, setScrollPos,
  sortBy, setSortBy, statusFilter, setStatusFilter
}: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<{ type: any, data?: any }>({ type: null });
  const [confirm, setConfirm] = useState({ isOpen: false, id: '', name: '', type: 'client' as 'client' | 'car' });

  // --- ЛОГИКА ВОССТАНОВЛЕНИЯ СКРОЛЛА ---
  useLayoutEffect(() => {
    const timer = setTimeout(() => { window.scrollTo(0, scrollPos); }, 0);
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

  // --- ЛОГИКА ПОИСКА И СОРТИРОВКИ ---
  const groupedData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    const filtered = clients.map((client: any) => {
      const clientCars = cars.filter((car: any) => car.clientId === client.id);
      
      const filteredCars = clientCars.filter((car: any) => {
        const carInfo = (car.brand + car.model + car.vin + (car.licensePlate || '')).toLowerCase();
        const isHistoryMatch = car.records?.some((record: any) => 
          (record.description + (record.catalogNumber || '') + (record.brand || '')).toLowerCase().includes(term)
        );
        const matchesSearch = carInfo.includes(term) || isHistoryMatch;
        const matchesStatus = statusFilter === 'all' || car.records?.some((r: any) => r.status === statusFilter);

        return matchesSearch && matchesStatus;
      });

      const isClientMatch = (client.fullName + client.phone).toLowerCase().includes(term);
      const hasMatch = statusFilter === 'all' 
        ? (isClientMatch || filteredCars.length > 0)
        : (filteredCars.length > 0);

      return { client, clientCars, filteredCars, hasMatch };
    }).filter((g: any) => g.hasMatch);

    return filtered.sort((a: any, b: any) => {
      if (sortBy === 'name') return a.client.fullName.localeCompare(b.client.fullName);
      if (sortBy === 'cars') return b.clientCars.length - a.clientCars.length;
      if (sortBy === 'activity') return (b.client.lastActivity || 0) - (a.client.lastActivity || 0);
      return 0;
    });
  }, [clients, cars, searchTerm, sortBy, statusFilter]);

  const toggleExpand = (clientId: string) => {
    const newSet = new Set(expandedClientIds);
    if (newSet.has(clientId)) newSet.delete(clientId);
    else newSet.add(clientId);
    setExpandedClientIds(newSet);
  };

  const handleCarClick = (carId: string) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    onSelectCar(carId);
  };

  const controlBtnStyle = (isActive: boolean, activeClass: string) => `
    flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all 
    ${isActive ? `bg-white shadow-md ${activeClass}` : 'text-slate-400 hover:text-slate-600'}
  `;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500 text-left font-sans text-slate-900">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-black text-black uppercase italic tracking-tight leading-none mt-4">База клиентов</h1>
        
        <div className="flex items-center gap-4">
          {/* ЕДИНЫЙ БЛОК УПРАВЛЕНИЯ */}
          <div className="flex flex-col bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-sm min-w-[400px]">
            <div className="flex gap-1">
              <button onClick={() => setSortBy('name')} className={controlBtnStyle(sortBy === 'name', 'text-black')}><SortAsc size={14} /> А-Я</button>
              <button onClick={() => setSortBy('activity')} className={controlBtnStyle(sortBy === 'activity', 'text-black')}><History size={14} /> Недавние</button>
              <button onClick={() => setSortBy('cars')} className={controlBtnStyle(sortBy === 'cars', 'text-black')}><CarFront size={14} /> По авто</button>
            </div>
            <div className="h-px bg-slate-200 my-1 mx-1"></div>
            <div className="flex gap-1">
              <button onClick={() => setStatusFilter('all')} className={controlBtnStyle(statusFilter === 'all', 'text-slate-900')}>Все</button>
              <button onClick={() => setStatusFilter(0)} className={controlBtnStyle(statusFilter === 0, 'text-slate-900')}>Уценка</button>
              <button onClick={() => setStatusFilter(1)} className={controlBtnStyle(statusFilter === 1, 'text-yellow-600')}>Заказано</button>
              <button onClick={() => setStatusFilter(2)} className={controlBtnStyle(statusFilter === 2, 'text-green-600')}>Выполнено</button>
              <button onClick={() => setStatusFilter(3)} className={controlBtnStyle(statusFilter === 3, 'text-red-600')}>Отменено</button>
            </div>
          </div>

          {/* Исправленная кнопка "Новый клиент" (не растягивается) */}
          <button 
            onClick={() => setModal({ type: 'addClient' })} 
            className="btn-action !py-3 !px-6 self-center ml-2"
          >
            <UserPlus size={18} /> <span>Новый клиент</span>
          </button>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="Поиск по базе..." className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-green-500 shadow-sm transition-all font-bold text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {groupedData.map(({ client, clientCars, filteredCars }: any) => {
          const isExpanded = expandedClientIds.has(client.id);
          const displayCars = statusFilter === 'all' && !searchTerm ? clientCars : filteredCars;
          
          return (
            <div key={client.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden hover:border-green-500/20 transition-all">
              <div onClick={() => toggleExpand(client.id)} className={`p-4 bg-slate-50/50 flex justify-between items-center cursor-pointer group/card relative z-10 transition-all border-b ${isExpanded ? 'border-slate-200' : 'border-transparent'}`}>
                <div className="flex items-center gap-4 text-left">
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}><ChevronDown size={20} className="text-slate-300 group-hover/card:text-green-600" /></div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-slate-900 italic uppercase leading-none tracking-tighter">{client.fullName}</h3>
                      <button onClick={(e) => { e.stopPropagation(); setModal({ type: 'editClient', data: client }); }} className="p-1 text-slate-300 hover:text-green-600 transition-colors"><Edit2 size={14}/></button>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase mt-1.5 leading-none">
                      <Phone size={12} className="text-green-600"/>{client.phone}
                      <span className="mx-2 text-slate-200">|</span>
                      <span>Автомобилей: {clientCars.length}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setConfirm({ isOpen: true, id: client.id, name: client.fullName, type: 'client' })} className="p-2 text-slate-300 hover:text-red-600 transition-all"><Trash2 size={20}/></button>
                  <button onClick={() => setModal({ type: 'addCar', data: client.id })} className="btn-action">
                    <Plus size={14}/> Добавить авто
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-1 bg-white animate-in slide-in-from-top-1 duration-200">
                  {displayCars.map((car: any) => (
                    <div key={car.id} onClick={() => handleCarClick(car.id)} className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-green-50 transition-all cursor-pointer border border-transparent hover:border-green-100 mb-0.5">
                      <div className="flex items-center gap-4 flex-1 text-left min-w-0 overflow-hidden">
                        <div className="p-2.5 bg-slate-100 text-slate-400 rounded-xl group-hover:bg-white group-hover:text-green-600 group-hover:shadow-sm transition-all flex-shrink-0"><CarIcon size={22}/></div>
                        <div className="flex items-center w-full min-w-0">
                          <div className="w-[280px] flex-shrink-0 flex items-center pr-4">
                            <span className="text-[15px] font-bold text-slate-800 group-hover:text-black uppercase truncate leading-none">{car.brand} {car.model}</span>
                            <span className="text-slate-400 text-[15px] ml-3 flex-shrink-0 font-normal leading-none">{car.year}</span>
                          </div>
                          <div className="flex items-center gap-10 flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">VIN:</span>
                              <span className="text-[14px] font-bold text-slate-600 group-hover:text-slate-900 uppercase tracking-wider leading-none whitespace-nowrap select-text">{car.vin || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">ГРЗ:</span>
                              <span className="text-[14px] font-bold text-slate-600 group-hover:text-slate-950 uppercase tracking-wider leading-none whitespace-nowrap select-text">{car.licensePlate || '—'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setModal({ type: 'editCar', data: car })} className="p-2 text-slate-200 hover:text-green-600 opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={16}/></button>
                        <button onClick={() => setConfirm({ isOpen: true, id: car.id, name: `${car.brand} ${car.model}`, type: 'car' })} className="p-2 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                  {displayCars.length === 0 && (
                    <div className="p-8 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest italic leading-none">Нет совпадений по статусу</div>
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