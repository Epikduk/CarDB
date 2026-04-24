import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Calendar, Search, Edit2, Check, X as CloseIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Client, Car, MaintenanceRecord } from '../types';

interface CarDetailsProps {
  carId: string;
  clients: Client[];
  cars: Car[];
  noteOptions: string[];
  addRecord: (carId: string, record: Omit<MaintenanceRecord, 'id'>) => void;
  updateRecord: (carId: string, recordId: string, updatedFields: Partial<MaintenanceRecord>) => void;
  deleteRecord: (carId: string, recordId: string) => void;
  onBack: () => void;
}

export function CarDetails({ carId, clients, cars, noteOptions, addRecord, updateRecord, deleteRecord, onBack }: CarDetailsProps) {
  const car = cars.find(c => c.id === carId);
  const client = clients.find(c => c.id === car?.clientId);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const [formData, setFormData] = useState<any>({});

  const totalCarProfit = useMemo(() => {
    if (!car) return 0;
    const sales = car.records.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    const purchase = car.records.reduce((sum, r) => sum + (r.purchasePrice || 0), 0);
    return sales - purchase;
  }, [car]);

  useEffect(() => {
    if (isAdding) {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        catalogNumber: '', brand: '', description: '',
        quantity: '1', unitPriceSale: '', unitPricePurchase: '',
        note: noteOptions[0] || ''
      });
    }
  }, [isAdding, noteOptions]);

  const filteredGroupedRecords = useMemo(() => {
    if (!car || !car.records) return [];
    const term = historySearch.toLowerCase();
    
    const filtered = car.records.filter(r => 
      (r.catalogNumber || '').toLowerCase().includes(term) ||
      (r.brand || '').toLowerCase().includes(term) ||
      (r.description || '').toLowerCase().includes(term) ||
      (r.note || '').toLowerCase().includes(term)
    );

    const groups = filtered.reduce((acc: { [key: string]: MaintenanceRecord[] }, record) => {
      const date = record.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(record);
      return acc;
    }, {});

    return Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(date => ({
      date,
      records: groups[date],
      subTotalSales: groups[date].reduce((sum, r) => sum + (Number(r.totalPrice) || 0), 0),
      subTotalPurchase: groups[date].reduce((sum, r) => sum + (Number(r.purchasePrice) || 0), 0)
    }));
  }, [car, historySearch]);

  if (!car || !client) return null;

  const handleSave = () => {
    const qty = Number(formData.quantity) || 0;
    const priceS = Number(formData.unitPriceSale) || 0;
    const priceP = Number(formData.unitPricePurchase) || 0;

    const data = {
      ...formData,
      catalogNumber: formData.catalogNumber.replace(/\s+/g, ''),
      quantity: qty,
      totalPrice: qty * priceS,
      purchasePrice: qty * priceP
    };

    if (editingId) {
      updateRecord(car.id, editingId, data);
    } else {
      addRecord(car.id, data);
    }
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (record: MaintenanceRecord) => {
    setEditingId(record.id);
    setFormData({
      ...record,
      // Если старые записи не имели полей unitPrice, вычисляем их
      unitPriceSale: record.unitPriceSale || (record.totalPrice / record.quantity),
      unitPricePurchase: record.unitPricePurchase || (record.purchasePrice / record.quantity)
    });
  };

  return (
    <div className="p-4 max-w-7xl mx-auto animate-in fade-in duration-500 font-normal text-slate-700">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 font-normal group transition-colors">
        <ArrowLeft size={18} />
        <span>Назад к списку</span>
      </button>

      {/* ШАПКА */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {car.brand} {car.model} <span className="text-slate-400 font-normal ml-2">{car.year}</span>
            </h1>
            <p className="text-slate-400 font-normal text-[10px] tracking-widest uppercase mt-0.5">
              VIN: {car.vin} | ГРЗ: {car.licensePlate || '—'}
            </p>
            {car.carNote && <p className="text-[11px] text-slate-400 mt-1 italic">Прим: {car.carNote}</p>}
          </div>
          <div className="h-8 w-px bg-slate-100 hidden md:block"></div>
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Владелец</p>
            <p className="text-lg font-normal text-slate-800 leading-none">{client.fullName}</p>
            <p className="text-slate-500 text-[11px] mt-1">{client.phone}</p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 px-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-center md:text-right">
          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mb-1">Общая прибыль</p>
          <p className={`text-2xl font-normal ${totalCarProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalCarProfit.toLocaleString()} ₽
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-normal text-slate-700 uppercase tracking-wider ml-2">История обслуживания</h2>
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64">
              <div className="absolute left-3 top-0 bottom-0 flex items-center text-slate-400">
                <Search size={14} />
              </div>
              <input 
                type="text" 
                placeholder="Поиск по истории..." 
                className="w-full h-9 pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                value={historySearch} 
                onChange={(e) => setHistorySearch(e.target.value)} 
              />
            </div>
            {!isAdding ? (
              <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-normal transition-all shadow-md active:scale-95">
                <Plus size={16} /> <span>Добавить</span>
              </button>
            ) : (
              <button onClick={() => setIsAdding(false)} className="flex items-center gap-2 h-9 px-6 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-normal transition-all active:scale-95">
                <CloseIcon size={16} /> <span>Отменить</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-auto max-h-[calc(100vh-280px)] bg-white">
          <table className="w-full text-left border-collapse table-fixed min-w-[1100px]">
            <thead className="sticky top-0 z-20 bg-slate-50 shadow-sm border-b">
              <tr className="text-slate-500 text-[10px] font-normal uppercase tracking-widest">
                <th className="w-[120px] px-4 py-2">Дата</th>
                <th className="w-[160px] px-4 py-2">Артикул</th>
                <th className="w-[140px] px-4 py-2">Бренд</th>
                <th className="px-4 py-2">Описание</th>
                <th className="w-[110px] px-4 py-2 text-center">Количество</th>
                <th className="w-[150px] px-4 py-2 text-right">Итоговая сумма</th>
                <th className="w-[140px] px-4 py-2 text-right">Закупка</th>
                <th className="w-[140px] px-4 py-2">Примечание</th>
                <th className="w-[80px] px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="text-slate-700 text-[13px] font-normal">
              {/* СТРОКА ДОБАВЛЕНИЯ / РЕДАКТИРОВАНИЯ */}
              {(isAdding || editingId) && (
                <tr className="bg-white border-b-2 border-blue-100 sticky top-[34px] z-10 shadow-sm font-normal">
                  <td className="p-1.5"><input type="date" className="w-full p-1 border border-slate-200 rounded text-xs outline-none focus:ring-2 focus:ring-blue-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></td>
                  <td className="p-1.5"><input type="text" className="w-full p-1 border border-slate-200 rounded text-xs outline-none focus:ring-2 focus:ring-blue-500" value={formData.catalogNumber} onChange={e => setFormData({...formData, catalogNumber: e.target.value})} /></td>
                  <td className="p-1.5"><input type="text" className="w-full p-1 border border-slate-200 rounded text-xs outline-none focus:ring-2 focus:ring-blue-500" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} /></td>
                  <td className="p-1.5"><input type="text" className="w-full p-1 border border-slate-200 rounded text-xs outline-none focus:ring-2 focus:ring-blue-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></td>
                  <td className="p-1.5"><input type="number" onFocus={e => e.target.select()} className="w-full p-1 border border-slate-200 rounded text-xs text-center outline-none focus:ring-2 focus:ring-blue-500" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} /></td>
                  <td className="p-1.5"><input type="number" onFocus={e => e.target.select()} className="w-full p-1 border border-slate-200 rounded text-xs text-right bg-green-50/30 outline-none focus:ring-2 focus:ring-blue-500" value={formData.unitPriceSale} onChange={e => setFormData({...formData, unitPriceSale: e.target.value})} /></td>
                  <td className="p-1.5"><input type="number" onFocus={e => e.target.select()} className="w-full p-1 border border-slate-200 rounded text-xs text-right bg-red-50/30 outline-none focus:ring-2 focus:ring-blue-500" value={formData.unitPricePurchase} onChange={e => setFormData({...formData, unitPricePurchase: e.target.value})} /></td>
                  <td className="p-1.5">
                    <select className="w-full p-1 border border-slate-200 rounded text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}>
                      {noteOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td className="p-1.5 text-center flex gap-1 justify-center">
                    <button onClick={handleSave} className="bg-green-600 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm hover:bg-green-700">ОК</button>
                    <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm hover:bg-red-600">Х</button>
                  </td>
                </tr>
              )}

              {filteredGroupedRecords.map((group) => (
                <React.Fragment key={group.date}>
                  <tr className="bg-slate-50/80 border-y border-slate-100 font-normal text-slate-500 text-[11px]">
                    <td colSpan={9} className="px-4 py-1 flex items-center gap-2">
                      <Calendar size={12} className="text-blue-500" />
                      {format(new Date(group.date), 'dd MMMM yyyy', { locale: ru })}
                    </td>
                  </tr>
                  {group.records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 border-b border-slate-100 transition-colors font-normal">
                      <td className="px-4 py-1"></td>
                      <td className="px-4 py-1 text-slate-700">{record.catalogNumber || '—'}</td>
                      <td className="px-4 py-1 text-slate-700">{record.brand || '—'}</td>
                      <td className="px-4 py-1 text-slate-700">{record.description}</td>
                      <td className="px-4 py-1 text-center text-slate-700">{record.quantity}</td>
                      <td className="px-4 py-1 text-right text-slate-900 font-normal">
                        <div>{record.totalPrice.toLocaleString()} ₽</div>
                        <div className="text-[9px] text-slate-400">{(record.unitPriceSale || 0).toLocaleString()} / шт</div>
                      </td>
                      <td className="px-4 py-1 text-right text-slate-900 font-normal">
                        <div>{record.purchasePrice.toLocaleString()} ₽</div>
                        <div className="text-[9px] text-slate-400">{(record.unitPricePurchase || 0).toLocaleString()} / шт</div>
                      </td>
                      <td className="px-4 py-1 text-[11px] uppercase text-slate-500">{record.note}</td>
                      <td className="px-4 py-1 text-right flex gap-2 justify-end pr-4">
                        <button onClick={() => startEdit(record)} className="text-slate-300 hover:text-blue-600 transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => deleteRecord(car.id, record.id)} className="text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-white border-b border-slate-200 text-right text-[10px] font-normal">
                    <td colSpan={5} className="px-4 py-1.5 text-slate-400 uppercase tracking-widest">Итого:</td>
                    <td className="px-4 py-1.5 text-slate-900 text-sm font-normal">{group.subTotalSales.toLocaleString()} ₽</td>
                    <td className="px-4 py-1.5 text-slate-900 text-sm font-normal">{group.subTotalPurchase.toLocaleString()} ₽</td>
                    <td colSpan={2} className="px-4 py-1.5 text-left pl-8 font-normal text-sm">
                       <span className="text-slate-400 mr-2 uppercase">Прибыль:</span>
                       <span className={group.subTotalSales - group.subTotalPurchase >= 0 ? 'text-green-600' : 'text-red-600'}>
                         {(group.subTotalSales - group.subTotalPurchase).toLocaleString()} ₽
                       </span>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}