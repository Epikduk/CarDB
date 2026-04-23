import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Calendar, Search, FileText, X as CloseIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Client, Car, MaintenanceRecord } from '../types';
import { ReportModal } from '../components/ReportModal';

interface CarDetailsProps {
  carId: string;
  clients: Client[];
  cars: Car[];
  noteOptions: string[];
  addRecord: (carId: string, record: Omit<MaintenanceRecord, 'id'>) => void;
  deleteRecord: (carId: string, recordId: string) => void;
  onBack: () => void;
}

export function CarDetails({ carId, clients, cars, noteOptions, addRecord, deleteRecord, onBack }: CarDetailsProps) {
  const car = cars.find(c => c.id === carId);
  const client = clients.find(c => c.id === car?.clientId);

  const [isAdding, setIsAdding] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    catalogNumber: '',
    brand: '',
    description: '',
    quantity: '1',
    unitPriceSale: '',
    unitPricePurchase: '',
    note: ''
  });

  useEffect(() => {
    if (isAdding) {
      setFormData(prev => ({ 
        ...prev, 
        note: noteOptions.length > 0 ? noteOptions[0] : '' 
      }));
    }
  }, [isAdding, noteOptions]);

  const filteredGroupedRecords = useMemo(() => {
    if (!car || !car.records) return [];
    const term = historySearch.toLowerCase();
    const filtered = car.records.filter(r => 
      (r.catalogNumber || '').toLowerCase().includes(term) ||
      (r.brand || '').toLowerCase().includes(term) ||
      (r.description || '').toLowerCase().includes(term)
    );
    const groups = filtered.reduce((acc: { [key: string]: MaintenanceRecord[] }, record) => {
      const date = record.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(record);
      return acc;
    }, {});
    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        date,
        records: groups[date],
        subTotalSales: groups[date].reduce((sum, r) => sum + (Number(r.totalPrice) || 0), 0),
        subTotalPurchase: groups[date].reduce((sum, r) => sum + (Number(r.purchasePrice) || 0), 0)
      }));
  }, [car, historySearch]);

  if (!car || !client) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(formData.quantity) || 0;
    const priceSale = Number(formData.unitPriceSale) || 0;
    const pricePurchase = Number(formData.unitPricePurchase) || 0;

    const recordToSave: Omit<MaintenanceRecord, 'id'> = {
      date: formData.date,
      catalogNumber: formData.catalogNumber.replace(/\s+/g, ''),
      brand: formData.brand,
      description: formData.description,
      quantity: qty,
      unitPriceSale: priceSale,
      unitPricePurchase: pricePurchase,
      totalPrice: qty * priceSale,
      purchasePrice: qty * pricePurchase,
      note: formData.note || (noteOptions.length > 0 ? noteOptions[0] : '—')
    };

    addRecord(carId, recordToSave);
    setIsAdding(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      catalogNumber: '', brand: '', description: '',
      quantity: '1', unitPriceSale: '', unitPricePurchase: '', 
      note: noteOptions[0] || ''
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 group transition-colors">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Назад к списку</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{car.brand} {car.model}</h1>
            <p className="text-slate-500 font-mono mt-1 text-sm tracking-widest">VIN: {car.vin}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 min-w-[250px]">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Владелец</p>
            <p className="text-lg font-bold text-slate-800">{client.fullName}</p>
            <p className="text-slate-600 font-medium">{client.phone}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800 whitespace-nowrap">История обслуживания</h2>
          
          <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Поиск по истории..." 
                className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>

            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 rounded-lg text-sm transition-all"
            >
              <FileText size={18} />
              <span>Отчет</span>
            </button>

            {!isAdding ? (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm transition-all shadow-sm whitespace-nowrap"
              >
                <Plus size={18} />
                <span>Добавить</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAdding(false)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm transition-all shadow-sm whitespace-nowrap animate-in fade-in zoom-in duration-200"
              >
                <CloseIcon size={18} />
                <span>Отменить</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-4 py-2 border-b">Дата</th>
                {/* НАЗВАНИЕ СТОЛБЦА ОБНОВЛЕНО */}
                <th className="px-4 py-2 border-b">Каталожный номер</th>
                <th className="px-4 py-2 border-b">Бренд</th>
                <th className="px-4 py-2 border-b">Описание</th>
                <th className="px-4 py-2 border-b text-center">Кол-во</th>
                <th className="px-4 py-2 border-b text-right">Продажа</th>
                <th className="px-4 py-2 border-b text-right">Закупка</th>
                <th className="px-4 py-2 border-b">Примечание</th>
                <th className="px-4 py-2 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {isAdding && (
                <tr className="bg-blue-50/50 border-b-2 border-blue-100 animate-in slide-in-from-top-2 duration-200">
                  <td className="p-1"><input type="date" className="w-full p-1 border rounded text-xs outline-none focus:ring-2 focus:ring-blue-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></td>
                  <td className="p-1"><input type="text" placeholder="Артикул" className="w-full p-1 border rounded text-xs outline-none focus:ring-2 focus:ring-blue-500" value={formData.catalogNumber} onChange={e => setFormData({...formData, catalogNumber: e.target.value})} /></td>
                  <td className="p-1"><input type="text" placeholder="Бренд" className="w-full p-1 border rounded text-xs outline-none focus:ring-2 focus:ring-blue-500" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} /></td>
                  <td className="p-1"><input type="text" placeholder="Описание" className="w-full p-1 border rounded text-xs outline-none focus:ring-2 focus:ring-blue-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></td>
                  <td className="p-1"><input type="number" placeholder="0" onFocus={e => e.target.select()} className="w-16 p-1 border rounded text-xs text-center outline-none focus:ring-2 focus:ring-blue-500" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} /></td>
                  <td className="p-1"><input type="number" placeholder="0" onFocus={e => e.target.select()} className="w-24 p-1 border rounded text-xs text-right bg-green-50 outline-none focus:ring-2 focus:ring-blue-500" value={formData.unitPriceSale} onChange={e => setFormData({...formData, unitPriceSale: e.target.value})} /></td>
                  <td className="p-1"><input type="number" placeholder="0" onFocus={e => e.target.select()} className="w-24 p-1 border rounded text-xs text-right bg-red-50 outline-none focus:ring-2 focus:ring-blue-500" value={formData.unitPricePurchase} onChange={e => setFormData({...formData, unitPricePurchase: e.target.value})} /></td>
                  <td className="p-1">
                    {noteOptions.length > 0 ? (
                      <select className="w-full p-1 border rounded text-xs bg-white h-7 outline-none border-blue-200 focus:ring-2 focus:ring-blue-500" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}>
                        {noteOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <div className="text-[9px] text-red-400 text-center leading-tight">Заполните список в настройках</div>
                    )}
                  </td>
                  <td className="p-1 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-bold transition-all shadow-sm">ОК</button>
                      <button onClick={() => setIsAdding(false)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-bold transition-all shadow-sm">Отмена</button>
                    </div>
                  </td>
                </tr>
              )}

              {filteredGroupedRecords.length > 0 ? (
                filteredGroupedRecords.map((group) => (
                  <React.Fragment key={group.date}>
                    <tr className="bg-slate-50 border-y border-slate-200">
                      <td colSpan={9} className="px-4 py-2 font-bold text-slate-700 text-sm flex items-center gap-2">
                        <Calendar size={14} className="text-blue-500" />
                        {format(new Date(group.date), 'dd MMMM yyyy', { locale: ru })}
                      </td>
                    </tr>
                    {group.records.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 text-sm border-b border-slate-100 transition-colors">
                        <td className="px-4 py-3 text-slate-400 text-[10px]">...</td>
                        <td className="px-4 py-3 font-mono text-xs">{record.catalogNumber || '—'}</td>
                        <td className="px-4 py-3">{record.brand || '—'}</td>
                        <td className="px-4 py-3">{record.description}</td>
                        <td className="px-4 py-3 text-center">{record.quantity}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-semibold text-slate-900">{(record.totalPrice || 0).toLocaleString()} ₽</div>
                          <div className="text-[9px] text-slate-400">{(record.unitPriceSale || 0).toLocaleString()} / шт</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="text-slate-600">{(record.purchasePrice || 0).toLocaleString()} ₽</div>
                          <div className="text-[9px] text-slate-400">{(record.unitPricePurchase || 0).toLocaleString()} / шт</div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-medium text-[10px] uppercase tracking-wider">{record.note}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => deleteRecord(car.id, record.id)} className="text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <td colSpan={5} className="px-4 py-2 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Итого:</td>
                      <td className="px-4 py-2 text-right font-bold text-blue-600">{(group.subTotalSales || 0).toLocaleString()} ₽</td>
                      <td className="px-4 py-2 text-right font-bold text-slate-500">{(group.subTotalPurchase || 0).toLocaleString()} ₽</td>
                      <td colSpan={2} className="px-4 py-2 text-left">
                         <span className="text-[10px] text-slate-400 uppercase mr-2 font-bold">Прибыль:</span>
                         <span className={`font-bold ${group.subTotalSales - group.subTotalPurchase >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {(group.subTotalSales - group.subTotalPurchase).toLocaleString()} ₽
                         </span>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              ) : !isAdding && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 italic">История пуста</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)}
        records={car.records}
        car={car}
        client={client}
      />
    </div>
  );
}