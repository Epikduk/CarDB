import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Calendar, Search, Edit2, X as CloseIcon, ShoppingCart, CheckCircle2, RotateCcw, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CustomSelect } from '../components/CustomSelect';

export function CarDetails({ carId, clients, cars, noteOptions, addRecord, updateRecord, deleteRecord, onBack }: any) {
  const car = cars.find((c: any) => c.id === carId);
  const client = clients.find((c: any) => c.id === car?.clientId);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const [formData, setFormData] = useState<any>({});
  const [openPrepaymentId, setOpenPrepaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdding) setFormData({ 
      date: format(new Date(), 'yyyy-MM-dd'), 
      catalogNumber: '', brand: '', description: '', 
      quantity: '1', unitPriceSale: '', unitPricePurchase: '', 
      note: noteOptions[0] || '', prepayment: '', status: 0 
    });
  }, [isAdding, noteOptions]);

  const filteredGroupedRecords = useMemo(() => {
    if (!car) return [];
    const term = historySearch.toLowerCase();
    const filtered = car.records.filter((r: any) => (r.catalogNumber + r.brand + r.description + (r.note || '')).toLowerCase().includes(term));
    const groups = filtered.reduce((acc: any, r: any) => {
      if (!acc[r.date]) acc[r.date] = [];
      acc[r.date].push(r);
      return acc;
    }, {});
    
    return Object.keys(groups).sort((a,b) => b.localeCompare(a)).map(date => {
      const dayRecords = groups[date];
      const totalSale = dayRecords.reduce((s: number, r: any) => s + (r.totalPrice || 0), 0);
      const totalPurchase = dayRecords.reduce((s: number, r: any) => s + (r.purchasePrice || 0), 0);
      
      const yellowProfit = dayRecords
        .filter((r: any) => r.status === 1)
        .reduce((s: number, r: any) => s + (r.totalPrice - r.purchasePrice), 0);
        
      const greenProfit = dayRecords
        .filter((r: any) => r.status === 2)
        .reduce((s: number, r: any) => s + (r.totalPrice - r.purchasePrice), 0);

      return {
        date, records: dayRecords, sale: totalSale, purchase: totalPurchase,
        yellowProfit, greenProfit
      };
    });
  }, [car, historySearch]);

  const handleSave = () => {
    const qty = Number(formData.quantity) || 0;
    const data = { 
      ...formData, 
      quantity: qty, 
      totalPrice: qty * Number(formData.unitPriceSale), 
      purchasePrice: qty * Number(formData.unitPricePurchase),
      prepayment: Number(formData.prepayment) || 0
    };
    if (editingId) updateRecord(car.id, editingId, data); else addRecord(car.id, data);
    setIsAdding(false); setEditingId(null);
  };

  const updateStatus = (recordId: string, newStatus: number) => {
    const record = car.records.find((r: any) => r.id === recordId);
    if (record) updateRecord(car.id, recordId, { ...record, status: newStatus });
  };

  const handleGroupStatus = (records: any[], newStatus: number) => {
    records.forEach(r => updateStatus(r.id, newStatus));
  };

  const handleGroupPrepayment = (records: any[], amount: string) => {
    if (records.length > 0) {
      updateRecord(car.id, records[0].id, { ...records[0], prepayment: Number(amount) || 0 });
    }
  };

  if (!car || !client) return null;

  // Стиль для скрытия стрелочек у input type="number"
  const noArrowsClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="p-4 max-w-7xl mx-auto animate-in fade-in duration-500 text-left">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-4 font-bold uppercase text-[10px] hover:text-green-600 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Назад
      </button>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 mb-6 flex justify-between items-start shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-black text-black uppercase italic tracking-tight leading-none">{car.brand} {car.model} <span className="text-slate-400 font-normal ml-2">{car.year}</span></h1>
            <div className="mt-4 flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">VIN Номер</span>
              <span className="text-[13px] font-mono font-black text-slate-900 uppercase tracking-widest leading-none">{car.vin || '—'}</span>
            </div>
            {car.carNote && (
              <div className="mt-3 flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Примечание</span>
                <span className="text-[13px] font-bold text-slate-900 uppercase italic leading-tight">{car.carNote}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-10 items-center h-full self-center mr-8">
          <div className="w-px bg-slate-100 h-16"></div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Владелец</p>
            <p className="text-xl font-bold text-black leading-none">{client.fullName}</p>
            <p className="text-green-600 text-[12px] mt-2 font-bold">{client.phone}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-3 border-b bg-slate-50/30 flex justify-between items-center">
          <h2 className="text-[11px] font-black text-slate-500 uppercase italic ml-2 tracking-widest">История обслуживания</h2>
          <div className="flex gap-2">
            <div className="relative w-64 h-9">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input type="text" placeholder="Поиск по истории..." className="w-full h-full pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs focus:border-green-500 transition-all outline-none font-bold shadow-sm" value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
            </div>
            {!isAdding ? (
              <button onClick={() => setIsAdding(true)} className="btn-action !h-9"><Plus size={16} /> Добавить</button>
            ) : (
              <button onClick={() => setIsAdding(false)} className="bg-red-600 text-white font-bold px-6 h-9 rounded-xl text-[10px] uppercase transition-all shadow-md"><CloseIcon size={16} className="inline mr-1" /> Отменить</button>
            )}
          </div>
        </div>

        <div className="overflow-auto max-h-[calc(100vh-320px)] min-h-[350px]">
          <table className="w-full text-left table-fixed min-w-[1150px] border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-sm text-slate-400 text-[10px] font-black uppercase">
              <tr>
                <th className="w-[120px] px-4 py-3 text-center">Статус</th>
                <th className="w-[150px] px-3 py-3 font-bold">Артикул</th>
                <th className="w-[130px] px-3 py-3 font-bold">Бренд</th>
                <th className="px-3 py-3 font-bold">Описание</th>
                <th className="w-[100px] px-3 py-3 text-center font-bold">Количество</th>
                <th className="w-[150px] px-3 py-3 text-right font-bold">Итоговая сумма</th>
                <th className="w-[120px] px-3 py-3 text-right font-bold">Закупка</th>
                <th className="w-[130px] px-3 py-3 font-bold">Примечание</th>
                <th className="w-[80px] px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px]">
              {(isAdding || editingId) && (
                <tr className="bg-white border-b-2 border-green-500 sticky top-[42px] z-[50] shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                  <td className="p-1.5 bg-white"><input type="date" className="w-full p-2 border border-slate-200 rounded-lg text-[10px] font-bold outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}/></td>
                  <td className="p-1.5 bg-white"><input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-[11px] font-bold outline-none" value={formData.catalogNumber} onChange={e => setFormData({...formData, catalogNumber: e.target.value})}/></td>
                  <td className="p-1.5 bg-white"><input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-[11px] font-bold outline-none" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}/></td>
                  <td className="p-1.5 bg-white"><input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-[11px] font-bold outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}/></td>
                  <td className="p-1.5 bg-white"><input type="number" className={`w-full p-2 border border-slate-200 rounded-lg text-[11px] text-center font-bold outline-none ${noArrowsClass}`} value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})}/></td>
                  <td className="p-1.5 bg-white"><input type="number" className={`w-full p-2 border border-slate-200 rounded-lg text-[11px] text-right font-bold text-green-600 bg-green-50/50 outline-none ${noArrowsClass}`} value={formData.unitPriceSale} onChange={e => setFormData({...formData, unitPriceSale: e.target.value})}/></td>
                  <td className="p-1.5 bg-white"><input type="number" className={`w-full p-2 border border-slate-200 rounded-lg text-[11px] text-right font-bold text-red-600 bg-red-50/50 outline-none ${noArrowsClass}`} value={formData.unitPricePurchase} onChange={e => setFormData({...formData, unitPricePurchase: e.target.value})}/></td>
                  <td className="p-1.5 bg-white overflow-visible"><CustomSelect options={noteOptions} value={formData.note} onChange={(val: string) => setFormData({...formData, note: val})} /></td>
                  <td className="p-1.5 bg-white flex gap-1 justify-center items-center h-[50px]">
                    <button onClick={handleSave} className="bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-green-600">ОК</button>
                    <button onClick={() => {setIsAdding(false); setEditingId(null);}} className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-red-600">X</button>
                  </td>
                </tr>
              )}

              {!isAdding && !editingId && filteredGroupedRecords.length === 0 && (
                <tr><td colSpan={9} className="py-32 text-center text-slate-300 font-black uppercase text-[11px] tracking-[0.2em] italic">История обслуживания пуста</td></tr>
              )}

              {filteredGroupedRecords.map((g: any) => (
                <React.Fragment key={g.date}>
                  <tr className="bg-slate-50/80 border-y border-slate-100 text-slate-400 text-[10px] font-black uppercase">
                    <td colSpan={9} className="px-4 py-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 tracking-widest whitespace-nowrap mr-2">
                          <Calendar size={12} className="text-green-600" />
                          {format(new Date(g.date), 'dd.MM.yyyy')}
                        </div>
                        <div className="flex items-center gap-1.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm">
                          <span className="text-[8px] text-slate-300 px-1">ВСЕ:</span>
                          <button onClick={() => handleGroupStatus(g.records, 1)} title="Заказано" className="p-1 text-yellow-500 hover:bg-yellow-50 rounded transition-all"><ShoppingCart size={14}/></button>
                          <button onClick={() => handleGroupStatus(g.records, 2)} title="Выполнено" className="p-1 text-green-600 hover:bg-green-50 rounded transition-all"><CheckCircle2 size={14}/></button>
                          <button onClick={() => handleGroupStatus(g.records, 0)} title="Сброс" className="p-1 text-slate-300 hover:bg-slate-100 rounded transition-all"><RotateCcw size={14}/></button>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                           <button onClick={() => setOpenPrepaymentId(openPrepaymentId === g.records[0]?.id ? null : g.records[0]?.id)} className={`p-1.5 rounded-lg transition-all ${g.records[0]?.prepayment > 0 ? 'bg-blue-500 text-white shadow-md' : openPrepaymentId === g.records[0]?.id ? 'bg-blue-100 text-blue-600' : 'bg-white border border-slate-200 text-slate-300 hover:text-blue-500 shadow-sm'}`}><Wallet size={14} /></button>
                           {openPrepaymentId === g.records[0]?.id && (
                             <div className="flex items-center gap-2 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 animate-in slide-in-from-left-2 duration-200 shadow-sm">
                               <span className="text-[9px] text-blue-400 font-black">ПРЕДОПЛАТА:</span>
                               <input type="number" className={`w-16 bg-transparent text-blue-600 font-black outline-none text-center border-b border-blue-200 text-[11px] ${noArrowsClass}`} value={g.records[0]?.prepayment || ''} onChange={(e) => handleGroupPrepayment(g.records, e.target.value)} autoFocus />
                               <span className="text-blue-600 font-black text-[11px]">₽</span>
                             </div>
                           )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  {g.records.map((r: any) => (
                    <tr key={r.id} className={`transition-colors group border-b border-slate-50 last:border-0 ${r.status === 1 ? 'bg-yellow-50' : r.status === 2 ? 'bg-green-100' : 'bg-white hover:bg-green-50/50'}`}>
                      <td className="px-4 py-2">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => updateStatus(r.id, 1)} className={`p-1.5 rounded-lg ${r.status === 1 ? 'bg-yellow-400 text-white' : 'bg-slate-50 text-slate-300 hover:bg-yellow-200 hover:text-yellow-700'}`}><ShoppingCart size={14} /></button>
                          <button onClick={() => updateStatus(r.id, 2)} className={`p-1.5 rounded-lg ${r.status === 2 ? 'bg-green-500 text-white' : 'bg-slate-50 text-slate-300 hover:bg-green-200 hover:text-green-700'}`}><CheckCircle2 size={14} /></button>
                          {r.status > 0 && <button onClick={() => updateStatus(r.id, 0)} className="p-1.5 bg-slate-50 text-slate-300 rounded-lg hover:bg-slate-200"><RotateCcw size={14} /></button>}
                        </div>
                      </td>
                      <td className="px-3 py-1.5 font-mono text-slate-500 group-hover:text-black">{r.catalogNumber || '—'}</td>
                      <td className="px-3 py-1.5 font-bold text-slate-800">{r.brand || '—'}</td>
                      <td className="px-3 py-1.5 text-slate-600 group-hover:text-black font-medium">{r.description}</td>
                      <td className="px-3 py-1.5 text-center font-bold text-slate-900">{r.quantity}</td>
                      <td className="px-3 py-1.5 text-right font-black text-black whitespace-nowrap">
                        <div>{r.totalPrice.toLocaleString()} ₽</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter italic">{(r.unitPriceSale || 0).toLocaleString()} / шт</div>
                      </td>
                      <td className="px-3 py-1.5 text-right font-bold text-slate-400 whitespace-nowrap">
                        <div>{r.purchasePrice.toLocaleString()} ₽</div>
                        <div className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter italic">{(r.unitPricePurchase || 0).toLocaleString()} / шт</div>
                      </td>
                      <td className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 group-hover:text-slate-600">{r.note}</td>
                      <td className="px-3 py-1.5 text-right">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditingId(r.id); setFormData({...r, unitPriceSale: r.unitPriceSale || (r.totalPrice/r.quantity), unitPricePurchase: r.unitPricePurchase || (r.purchasePrice/r.quantity)}); }} className="p-1.5 text-slate-300 hover:text-green-600 hover:bg-white rounded-lg shadow-sm"><Edit2 size={14} /></button>
                          <button onClick={() => deleteRecord(car.id, r.id)} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-white rounded-lg shadow-sm"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/40 text-right uppercase border-b border-slate-200/50">
                    <td colSpan={5} className="px-6 py-3 text-slate-400 italic text-[12px] font-black tracking-widest uppercase">Итого:</td>
                    <td className="px-4 py-3 text-black text-[15px] font-black border-r border-slate-100/50 whitespace-nowrap">{g.sale.toLocaleString()} ₽</td>
                    <td className="px-4 py-3 text-slate-500 text-[15px] font-bold border-r border-slate-100/50 whitespace-nowrap">{g.purchase.toLocaleString()} ₽</td>
                    <td colSpan={2} className="px-6 py-3 text-left pl-10 text-[12px] font-black italic tracking-tight whitespace-nowrap">
                       <div className="flex flex-col gap-0.5">
                         <span className="text-slate-400 text-[11px] mb-0.5 uppercase tracking-tighter">Прибыль:</span>
                         {g.greenProfit !== 0 && (
                           <span className="text-green-600 text-[16px] font-black leading-none">{g.greenProfit.toLocaleString()} ₽</span>
                         )}
                         {g.yellowProfit !== 0 && (
                           <span className="text-yellow-600 text-[16px] font-black leading-none">{g.yellowProfit.toLocaleString()} ₽</span>
                         )}
                         {g.yellowProfit === 0 && g.greenProfit === 0 && (
                           <span className="text-slate-400 text-[15px]">0 ₽</span>
                         )}
                       </div>
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