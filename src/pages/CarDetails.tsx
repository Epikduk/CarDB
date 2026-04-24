import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Calendar, Search, Edit2, Check, X as CloseIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Client, Car, MaintenanceRecord } from '../types';

interface CarDetailsProps {
  carId: string; clients: Client[]; cars: Car[]; noteOptions: string[];
  addRecord: any; updateRecord: any; deleteRecord: any; onBack: () => void;
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
    if (isAdding) setFormData({ date: format(new Date(), 'yyyy-MM-dd'), catalogNumber: '', brand: '', description: '', quantity: '1', unitPriceSale: '', unitPricePurchase: '', note: noteOptions[0] || '' });
  }, [isAdding, noteOptions]);

  const filteredGroupedRecords = useMemo(() => {
    if (!car) return [];
    const term = historySearch.toLowerCase();
    const filtered = car.records.filter(r => (r.catalogNumber + r.brand + r.description + r.note).toLowerCase().includes(term));
    const groups = filtered.reduce((acc: any, r) => {
      if (!acc[r.date]) acc[r.date] = [];
      acc[r.date].push(r);
      return acc;
    }, {});
    return Object.keys(groups).sort((a,b) => b.localeCompare(a)).map(date => ({
      date, records: groups[date],
      sale: groups[date].reduce((s: number, r: any) => s + r.totalPrice, 0),
      purchase: groups[date].reduce((s: number, r: any) => s + r.purchasePrice, 0)
    }));
  }, [car, historySearch]);

  if (!car || !client) return null;

  const handleSave = () => {
    const qty = Number(formData.quantity) || 0;
    const data = { ...formData, quantity: qty, totalPrice: qty * Number(formData.unitPriceSale), purchasePrice: qty * Number(formData.unitPricePurchase) };
    if (editingId) updateRecord(car.id, editingId, data); else addRecord(car.id, data);
    setIsAdding(false); setEditingId(null);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto animate-in fade-in text-slate-700 font-normal">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 mb-4 font-medium transition-colors hover:text-slate-800"><ArrowLeft size={18} /> Назад</button>

      <div className="bg-white rounded-xl shadow-sm border p-5 mb-6 flex justify-between items-center font-normal">
        <div className="flex gap-8 items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              {car.brand} {car.model} <span className="text-slate-400 font-normal ml-2">{car.year}</span>
            </h1>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
               <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest">
                 VIN: {car.vin || '—'} | ГРЗ: {car.licensePlate || '—'}
               </p>
               {/* ПРИМЕЧАНИЕ ОФОРМЛЕНО В ТОМ ЖЕ СТИЛЕ ЧТО И VIN */}
               {car.carNote && (
                 <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest">
                   Прим: {car.carNote}
                 </p>
               )}
            </div>
          </div>
          <div className="w-px bg-slate-100 h-10"></div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 font-normal text-slate-400">Владелец</p>
            <p className="text-lg font-normal text-slate-800 leading-none">{client.fullName}</p>
            <p className="text-slate-400 text-[11px] mt-1 font-normal">{client.phone}</p>
          </div>
        </div>
        <div className="bg-slate-50 px-8 py-2 border border-slate-100 rounded-2xl text-right">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-normal">Общая прибыль</p>
          <p className={`text-xl font-normal ${totalCarProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{totalCarProfit.toLocaleString()} ₽</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden font-normal">
        <div className="p-3 border-b bg-white flex justify-between items-center gap-4">
          <h2 className="text-sm font-normal text-slate-700 uppercase tracking-wider ml-2">История обслуживания</h2>
          <div className="flex gap-2">
            <div className="relative w-64 h-9">
              <div className="absolute left-3 top-0 bottom-0 flex items-center text-slate-400"><Search size={16} /></div>
              <input type="text" placeholder="Поиск по истории..." className="w-full h-9 pl-10 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/30" value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
            </div>
            {!isAdding ? (
              <button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white px-6 h-9 rounded-lg text-sm font-normal shadow-md hover:bg-blue-700 active:scale-95 transition-all"><Plus size={16} className="inline mr-1" /> Добавить</button>
            ) : (
              <button onClick={() => setIsAdding(false)} className="bg-red-600 text-white px-6 h-9 rounded-lg text-sm font-normal active:scale-95 transition-all"><CloseIcon size={16} className="inline mr-1" /> Отменить</button>
            )}
          </div>
        </div>

        <div className="overflow-auto max-h-[calc(100vh-280px)] bg-white">
          <table className="w-full text-left table-fixed min-w-[1100px] border-collapse font-normal">
            <thead className="sticky top-0 z-20 bg-slate-50 shadow-sm border-b font-normal">
              <tr className="text-slate-500 text-[10px] font-normal uppercase tracking-widest">
                <th className="w-[120px] px-4 py-2 font-normal">Дата</th>
                <th className="w-[160px] px-4 py-2 font-normal">Артикул</th>
                <th className="w-[140px] px-4 py-2 font-normal">Бренд</th>
                <th className="px-4 py-2 font-normal">Описание</th>
                <th className="w-[100px] px-4 py-2 text-center font-normal">Количество</th>
                <th className="w-[140px] px-4 py-2 text-right font-normal">Итоговая сумма</th>
                <th className="w-[130px] px-4 py-2 text-right font-normal">Закупка</th>
                <th className="w-[140px] px-4 py-2 font-normal">Примечание</th>
                <th className="w-[80px] px-4 py-2 font-normal"></th>
              </tr>
            </thead>
            <tbody className="text-[13px] font-normal">
              {(isAdding || editingId) && (
                <tr className="bg-white border-b-2 border-blue-100 sticky top-[34px] z-10 shadow-sm font-normal">
                  <td className="p-1.5"><input type="date" className="w-full p-1 border border-slate-200 rounded text-xs outline-none focus:ring-2 focus:ring-blue-500 font-normal" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}/></td>
                  <td className="p-1.5"><input type="text" className="w-full p-1 border border-slate-200 rounded text-xs outline-none focus:ring-2 focus:ring-blue-500 font-normal" value={formData.catalogNumber} onChange={e => setFormData({...formData, catalogNumber: e.target.value})}/></td>
                  <td className="p-1.5"><input type="text" className="w-full p-1 border border-slate-200 rounded text-xs outline-none focus:ring-2 focus:ring-blue-500 font-normal" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}/></td>
                  <td className="p-1.5"><input type="text" className="w-full p-1 border border-slate-200 rounded text-xs outline-none focus:ring-2 focus:ring-blue-500 font-normal" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}/></td>
                  <td className="p-1.5"><input type="number" onFocus={e => e.target.select()} className="w-full p-1 border border-slate-200 rounded text-xs text-center outline-none focus:ring-2 focus:ring-blue-500 font-normal" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})}/></td>
                  <td className="p-1.5"><input type="number" onFocus={e => e.target.select()} className="w-full p-1 border border-slate-200 rounded text-xs text-right outline-none focus:ring-2 focus:ring-blue-500 bg-green-50/30 font-normal" value={formData.unitPriceSale} onChange={e => setFormData({...formData, unitPriceSale: e.target.value})}/></td>
                  <td className="p-1.5"><input type="number" onFocus={e => e.target.select()} className="w-full p-1 border border-slate-200 rounded text-xs text-right outline-none focus:ring-2 focus:ring-blue-500 bg-red-50/30 font-normal" value={formData.unitPricePurchase} onChange={e => setFormData({...formData, unitPricePurchase: e.target.value})}/></td>
                  <td className="p-1.5 font-normal">
                    <select className="w-full p-1 border border-slate-200 rounded text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500 font-normal" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}>
                      {noteOptions.map((o:any, i:any) => <option key={i} value={o}>{o}</option>)}
                    </select>
                  </td>
                  <td className="p-1.5 text-center flex gap-1 items-center justify-center font-normal">
                    <button onClick={handleSave} className="h-7 bg-green-600 text-white px-2 rounded text-[10px] font-bold hover:bg-green-700 transition-colors font-normal">ОК</button>
                    <button onClick={() => {setIsAdding(false); setEditingId(null);}} className="h-7 bg-red-600 text-white px-2 rounded text-[10px] font-bold hover:bg-red-700 transition-colors font-normal">Х</button>
                  </td>
                </tr>
              )}
              {filteredGroupedRecords.map((g: any) => (
                <React.Fragment key={g.date}>
                  <tr className="bg-slate-50/80 border-y border-slate-100 font-normal text-slate-500 text-[11px]"><td colSpan={9} className="px-4 py-1 flex items-center gap-2 font-normal"><Calendar size={12} className="text-blue-500" />{format(new Date(g.date), 'dd MMMM yyyy', { locale: ru })}</td></tr>
                  {g.records.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 border-b border-slate-100 transition-colors font-normal text-slate-700">
                      <td className="px-4 py-1 font-normal"></td>
                      <td className="px-4 py-1 font-normal">{r.catalogNumber || '—'}</td>
                      <td className="px-4 py-1 font-normal">{r.brand || '—'}</td>
                      <td className="px-4 py-1 font-normal">{r.description}</td>
                      <td className="px-4 py-1 text-center font-normal">{r.quantity}</td>
                      <td className="px-4 py-1 text-right font-normal">
                        <div className="font-normal text-slate-900">{r.totalPrice.toLocaleString()} ₽</div>
                        <div className="text-[9px] text-slate-400 font-normal">{(r.unitPriceSale || 0).toLocaleString()} / шт</div>
                      </td>
                      <td className="px-4 py-1 text-right font-normal text-slate-900">
                        <div className="font-normal">{r.purchasePrice.toLocaleString()} ₽</div>
                        <div className="text-[9px] text-slate-400 font-normal">{(r.unitPricePurchase || 0).toLocaleString()} / шт</div>
                      </td>
                      <td className="px-4 py-1 font-normal tracking-tight text-[11px] uppercase text-slate-500">{r.note}</td>
                      <td className="px-4 py-1 font-normal">
                        <div className="flex gap-2 justify-end items-center h-full">
                          <button onClick={() => { setEditingId(r.id); setFormData({...r, unitPriceSale: r.unitPriceSale || (r.totalPrice/r.quantity), unitPricePurchase: r.unitPricePurchase || (r.purchasePrice/r.quantity)}); }} className="text-slate-300 hover:text-blue-600 transition-colors font-normal"><Edit2 size={14} /></button>
                          <button onClick={() => deleteRecord(car.id, r.id)} className="text-slate-300 hover:text-red-600 transition-colors font-normal"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-white border-b border-slate-200 text-right text-[10px] font-normal">
                    <td colSpan={5} className="px-4 py-1.5 text-slate-400 uppercase tracking-widest font-normal">Итого за день:</td>
                    <td className="px-4 py-1.5 text-slate-900 text-sm font-normal">{g.sale.toLocaleString()} ₽</td>
                    <td className="px-4 py-1.5 text-slate-900 text-sm font-normal">{g.purchase.toLocaleString()} ₽</td>
                    <td colSpan={2} className="px-4 py-1.5 text-left pl-8 font-normal text-sm font-normal">Прибыль: <span className={g.sale-g.purchase >= 0 ? 'text-green-600' : 'text-red-600'}>{(g.sale-g.purchase).toLocaleString()} ₽</span></td>
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