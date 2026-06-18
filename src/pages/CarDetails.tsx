import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Search, Edit2, X as CloseIcon, ShoppingCart, CheckCircle2, RotateCcw, Wallet, XCircle, Download, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { CustomSelect } from '../components/CustomSelect';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ROBOTO_FONT_BASE64 } from '../font';

export function CarDetails({ 
  carId, clients, cars, noteOptions, lastUsedNote, addRecord, updateRecord, deleteRecord, updateGroupDate, onBack,
  openPrepaymentIds, setOpenPrepaymentIds, warehouseSelection, onStartWarehouseSelection, warehouseItems = []
}: any) {
  const car = cars.find((c: any) => c.id === carId);
  const client = clients.find((c: any) => c.id === car?.clientId);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const [formData, setFormData] = useState<any>({});
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editingGroupDate, setEditingGroupDate] = useState<string | null>(null);
  const [tempDateValue, setTempDateValue] = useState<string>('');

  useEffect(() => {
    if (warehouseSelection && warehouseSelection.carId === carId) {
      setFormData(warehouseSelection.formData);
      setIsAdding(warehouseSelection.isAdding);
      setEditingId(warehouseSelection.recordId);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  }, [warehouseSelection, carId]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const baseOptions = useMemo(() => {
    const otherOptions = noteOptions.filter((opt: string) => opt !== lastUsedNote).sort((a: string, b: string) => a.localeCompare(b));
    return lastUsedNote && noteOptions.includes(lastUsedNote) ? [lastUsedNote, ...otherOptions] : otherOptions;
  }, [noteOptions, lastUsedNote]);

  const fullOptionsWithWarehouse = useMemo(() => {
    const opts = Array.from(new Set([...noteOptions, 'склад']));
    const otherOptions = opts.filter((opt: string) => opt !== lastUsedNote).sort((a: string, b: string) => a.localeCompare(b));
    return lastUsedNote && opts.includes(lastUsedNote) ? [lastUsedNote, ...otherOptions] : otherOptions;
  }, [noteOptions, lastUsedNote]);

  useEffect(() => {
    if (isAdding && !formData.date && !warehouseSelection) {
      setFormData({ date: format(new Date(), 'yyyy-MM-dd'), catalogNumber: '', brand: '', description: '', quantity: '1', unitPriceSale: '', unitPricePurchase: '', note: lastUsedNote || baseOptions[0] || '', status: 0 });
    }
  }, [isAdding, baseOptions, lastUsedNote, warehouseSelection]);

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
      const activeRecords = dayRecords.filter((r: any) => r.status !== 3);
      const totalSale = activeRecords.reduce((s: number, r: any) => s + (Number(r.totalPrice) || 0), 0);
      const totalPurchase = activeRecords.reduce((s: number, r: any) => s + (Number(r.purchasePrice) || 0), 0);
      const yellowProfit = dayRecords.filter((r: any) => r.status === 1).reduce((s: number, r: any) => s + ((Number(r.totalPrice) || 0) - (Number(r.purchasePrice) || 0)), 0);
      const greenProfit = dayRecords.filter((r: any) => r.status === 2).reduce((s: number, r: any) => s + ((Number(r.totalPrice) || 0) - (Number(r.purchasePrice) || 0)), 0);
      return { date, records: dayRecords, sale: totalSale, purchase: totalPurchase, yellowProfit, greenProfit };
    });
  }, [car, historySearch]);

  const handleSave = () => {
    let qty = Number(formData.quantity) || 1;
    if (qty < 1) qty = 1;
    if (formData.warehouseItemId) {
      const item = warehouseItems.find((i: any) => i.id === formData.warehouseItemId);
      if (item) {
        const curRec = car.records.find((r:any) => r.id === editingId);
        const otherReserved = (item.reserved || 0) - (curRec ? curRec.quantity : 0);
        const available = item.quantity - otherReserved;
        if (qty > available) qty = available;
      }
    }
    const salePrice = Number(formData.unitPriceSale) || 0;
    const purchasePrice = Number(formData.unitPricePurchase) || 0;
    const cleanCatalogNumber = (formData.catalogNumber || '').replace(/\s+/g, '');
    const data = { ...formData, catalogNumber: cleanCatalogNumber, quantity: qty, unitPriceSale: salePrice, unitPricePurchase: purchasePrice, totalPrice: qty * salePrice, purchasePrice: qty * purchasePrice, prepayment: Number(formData.prepayment) || 0 };
    if (editingId) updateRecord(car.id, editingId, data); else addRecord(car.id, data);
    setIsAdding(false); setEditingId(null); setFormData({});
  };

  const updateStatus = (recordId: string, newStatus: number) => {
    const record = car.records.find((r: any) => r.id === recordId);
    if (!record) return;
    if (record.warehouseItemId && newStatus === 1) return;
    updateRecord(car.id, recordId, { ...record, status: newStatus });
  };

  const handleGroupStatus = (records: any[], newStatus: number) => { 
    records.forEach(r => { if (!(r.warehouseItemId && newStatus === 1)) updateStatus(r.id, newStatus); });
  };

  const handleConfirmDateChange = (oldDate: string) => { if (tempDateValue && tempDateValue !== oldDate) updateGroupDate(car.id, oldDate, tempDateValue); setEditingGroupDate(null); };
  const handleAddAtDate = (date: string) => { setFormData({ date, catalogNumber: '', brand: '', description: '', quantity: '1', unitPriceSale: '', unitPricePurchase: '', note: lastUsedNote || baseOptions[0] || '', status: 0 }); setIsAdding(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleGroupPrepayment = (records: any[], amount: string) => { if (records.length > 0) updateRecord(car.id, records[0].id, { ...records[0], prepayment: Number(amount) || 0 }); };
  const handleDeleteClick = (recordId: string) => { if (pendingDeleteId === recordId) { deleteRecord(car.id, recordId); setPendingDeleteId(null); } else { setPendingDeleteId(recordId); setTimeout(() => setPendingDeleteId(null), 3000); } };
  const togglePrepayment = (recordId: string) => { const newSet = new Set(openPrepaymentIds); if (newSet.has(recordId)) newSet.delete(recordId); else newSet.add(recordId); setOpenPrepaymentIds(newSet); };

  // ВОССТАНОВЛЕННАЯ ФУНКЦИЯ PDF
  const exportDayPDF = (group: any) => {
    try {
      const doc = new jsPDF();
      const cleanFont = ROBOTO_FONT_BASE64.replace(/^data:font\/ttf;base64,/, '').replace(/['"()]/g, '').trim();
      doc.addFileToVFS('Roboto-Regular.ttf', cleanFont);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(18);
      doc.text(`ЗАКАЗ ОТ ${format(new Date(group.date), 'dd.MM.yyyy')}`, 14, 20);
      doc.setFontSize(11);
      doc.text(`Автомобиль: ${car.brand} ${car.model} (${car.licensePlate || car.vin || '—'})`, 14, 30);
      
      const tableData = group.records
        .filter((r: any) => r.status !== 3)
        .map((r: any) => [
          r.brand || '—', 
          r.description, 
          r.quantity, 
          `${(r.totalPrice || 0).toLocaleString()} ₽`
        ]);

      autoTable(doc, {
        startY: 38,
        head: [['Бренд', 'Описание', 'Кол-во', 'Сумма']],
        body: tableData,
        theme: 'grid',
        styles: { font: 'Roboto', fontStyle: 'normal', fontSize: 10 },
        headStyles: { fillColor: [0, 0, 0], font: 'Roboto', fontStyle: 'normal' },
        foot: [['ИТОГО', '', '', `${(group.sale || 0).toLocaleString()} ₽`]],
        footStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], font: 'Roboto', fontStyle: 'normal' }
      });
      
      doc.save(`Order_${group.date}_${client.fullName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
    }
  };

  if (!car || !client) return null;

  const timesNewRoman = { fontFamily: '"Times New Roman", Times, serif' };
  const noArrowsClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
  const isWarehouseRecord = !!formData.warehouseItemId;

  return (
    <div className="p-4 max-w-[1400px] mx-auto animate-in fade-in duration-500 text-left">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-4 font-bold uppercase text-[10px] hover:text-green-600 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Назад
      </button>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 mb-6 flex justify-between items-start shadow-sm relative overflow-hidden text-slate-900">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
        <div className="flex-1 flex flex-col gap-4 text-left">
          <h1 className="text-2xl font-black text-black uppercase italic tracking-tight leading-none">{car.brand} {car.model} <span className="text-slate-400 font-normal ml-2">{car.year}</span></h1>
          <div className="mt-4 flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">VIN Номер</span>
            <span className="text-[13px] font-bold uppercase tracking-wider leading-none">{car.vin || '—'}</span>
          </div>
          {car.carNote && (
            <div className="mt-3 flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Примечание</span>
              <span className="text-[13px] font-bold uppercase tracking-wider leading-tight">{car.carNote}</span>
            </div>
          )}
        </div>
        <div className="flex gap-10 items-center h-full self-center text-left mr-8">
          <div className="w-px bg-slate-100 h-16"></div>
          <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest leading-none">Владелец</p><p className="text-xl font-bold text-black leading-none">{client.fullName}</p><p className="text-green-600 text-[12px] mt-2 font-bold">{client.phone}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl mb-12 relative overflow-hidden">
        <div className="p-3 border-b bg-slate-50/30 flex justify-between items-center relative z-50">
          <h2 className="text-[11px] font-black text-slate-500 uppercase italic ml-2 tracking-widest text-left leading-none font-sans">История обслуживания</h2>
          <div className="flex gap-2 items-center">
            <div className="relative w-64 h-9">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input type="text" placeholder="Поиск по истории..." className="w-full h-full pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs focus:border-green-500 transition-all outline-none font-bold shadow-sm font-sans" value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
            </div>
            {!isAdding ? (
              <button onClick={() => { setFormData({}); setIsAdding(true); }} className="btn-action !h-9 font-sans"><Plus size={16} /> Добавить</button>
            ) : (
              <button onClick={() => { setIsAdding(false); setEditingId(null); setFormData({}); }} className="bg-red-600 text-white font-bold px-6 h-9 rounded-xl text-[10px] uppercase transition-all shadow-md font-sans"><CloseIcon size={16} className="inline mr-1" /> Отменить</button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left table-fixed min-w-[1200px] border-collapse" style={timesNewRoman}>
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-sm text-slate-500 text-[11px] font-bold uppercase tracking-widest font-sans">
              <tr>
                <th className="w-[140px] px-4 py-3 text-center">Статус</th>
                <th className="w-[150px] px-3 py-3 font-bold">Артикул</th>
                <th className="w-[130px] px-3 py-3 font-bold">Бренд</th>
                <th className="px-3 py-3 font-bold">Описание</th>
                <th className="w-[100px] px-3 py-3 text-center font-bold">Количество</th>
                <th className="w-[150px] px-3 py-3 text-right font-bold">Итоговая сумма</th>
                <th className="w-[120px] px-3 py-3 text-right font-bold">Закупка</th>
                <th className="w-[180px] px-6 py-3 text-center font-bold">Примечание</th>
                <th className="w-[80px] px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[14px]">
              {(isAdding || editingId) && (
                <tr className="bg-white border-b-2 border-green-500 sticky top-[41px] z-[19] shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                  <td className="p-1.5 bg-white"><input type="date" style={timesNewRoman} className="w-full h-9 px-2 border border-slate-200 rounded-lg text-[14px] font-bold outline-none text-center" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}/></td>
                  <td className="p-1.5 bg-white"><input disabled={isWarehouseRecord} type="text" style={timesNewRoman} className={`w-full p-2 border border-slate-200 rounded-lg text-[14px] font-bold outline-none ${isWarehouseRecord ? 'bg-slate-50 opacity-60' : ''}`} value={formData.catalogNumber} onChange={e => setFormData({...formData, catalogNumber: e.target.value})}/></td>
                  <td className="p-1.5 bg-white"><input disabled={isWarehouseRecord} type="text" style={timesNewRoman} className={`w-full p-2 border border-slate-200 rounded-lg text-[14px] font-bold outline-none uppercase ${isWarehouseRecord ? 'bg-slate-50 opacity-60' : ''}`} value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})}/></td>
                  <td className="p-1.5 bg-white"><input disabled={isWarehouseRecord} type="text" style={timesNewRoman} className={`w-full p-2 border border-slate-200 rounded-lg text-[14px] font-bold outline-none ${isWarehouseRecord ? 'bg-slate-50 opacity-60' : ''}`} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}/></td>
                  <td className="p-1.5 bg-white">
                    <input type="number" style={timesNewRoman} className={`w-full p-2 border border-slate-200 rounded-lg text-[14px] text-center font-bold outline-none ${noArrowsClass}`} value={formData.quantity} onChange={e => {
                      let val = Number(e.target.value);
                      if (isWarehouseRecord) {
                        const item = warehouseItems.find((i:any) => i.id === formData.warehouseItemId);
                        if (item) {
                          const curRec = car.records.find((r:any) => r.id === editingId);
                          const otherReserved = (item.reserved || 0) - (curRec ? curRec.quantity : 0);
                          const available = item.quantity - otherReserved;
                          if (val > available) val = available;
                        }
                      }
                      if (val < 1) val = 1;
                      setFormData({...formData, quantity: val});
                    }}/>
                  </td>
                  <td className="p-1.5 bg-white"><input type="number" style={timesNewRoman} className={`w-full p-2 border border-slate-200 rounded-lg text-[14px] text-right font-bold text-green-600 bg-green-50/50 outline-none ${noArrowsClass}`} value={formData.unitPriceSale} onChange={e => setFormData({...formData, unitPriceSale: e.target.value})}/></td>
                  <td className="p-1.5 bg-white"><input type="number" disabled={isWarehouseRecord} style={timesNewRoman} className={`w-full p-2 border border-slate-200 rounded-lg text-[14px] text-right font-bold text-red-600 bg-red-50/50 outline-none ${noArrowsClass} ${isWarehouseRecord ? 'opacity-50' : ''}`} value={formData.unitPricePurchase} onChange={e => setFormData({...formData, unitPricePurchase: e.target.value})}/></td>
                  <td className="p-1.5 bg-white overflow-visible px-4 font-serif">
                    <CustomSelect 
                      options={editingId && !isWarehouseRecord ? baseOptions : fullOptionsWithWarehouse} 
                      value={formData.note} 
                      disabled={isWarehouseRecord} 
                      onChange={(val: string) => { 
                        if (val === 'склад') onStartWarehouseSelection({ carId, recordId: editingId, isAdding, formData }); 
                        else setFormData({...formData, note: val, warehouseItemId: undefined}); 
                      }} 
                    />
                  </td>
                  <td className="p-1.5 bg-white flex gap-1 justify-center items-center h-[50px] font-sans">
                    <button onClick={handleSave} className="bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-green-600">ОК</button>
                    <button onClick={() => {setIsAdding(false); setEditingId(null); setFormData({});}} className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-red-600">X</button>
                  </td>
                </tr>
              )}
              {filteredGroupedRecords.map((g: any) => {
                const recordIdForPrepayment = g.records[0]?.id;
                const isPrepaymentOpen = openPrepaymentIds.has(recordIdForPrepayment);
                const isEditingThisGroup = editingGroupDate === g.date;

                return (
                  <React.Fragment key={g.date}>
                    <tr className="bg-slate-50/80 border-y border-slate-100 text-slate-400 text-[13px] font-bold font-sans">
                      <td colSpan={9} className="px-4 py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {isEditingThisGroup ? (
                              <div className="flex items-center gap-1.5 animate-in slide-in-from-left-2 duration-200">
                                <input type="date" className="px-3 py-1 bg-white border-2 border-green-500 rounded-xl font-bold text-slate-900 outline-none shadow-sm text-[13px]" value={tempDateValue} onChange={(e) => setTempDateValue(e.target.value)} autoFocus/>
                                <button onClick={() => handleConfirmDateChange(g.date)} className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-all active:scale-90"><Check size={16} /></button>
                                <button onClick={() => setEditingGroupDate(null)} className="p-1.5 bg-white text-slate-400 border border-slate-200 rounded-lg hover:text-red-600 transition-all active:scale-90"><X size={16} /></button>
                              </div>
                            ) : (
                              <button onClick={() => { setEditingGroupDate(g.date); setTempDateValue(g.date); }} className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 font-bold tracking-[0.15em] transition-all hover:border-green-500 hover:text-green-600 cursor-pointer text-[12px]">{format(new Date(g.date), 'dd.MM.yyyy')}</button>
                            )}

                            <div className="flex items-center gap-1.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm font-sans">
                              <button onClick={() => handleGroupStatus(g.records, 0)} title="Сброс" className="p-1 text-slate-300 hover:bg-slate-100 rounded transition-all"><RotateCcw size={14}/></button>
                              <button onClick={() => handleGroupStatus(g.records, 1)} title="Заказано" className="p-1 text-yellow-500 hover:bg-yellow-50 rounded transition-all"><ShoppingCart size={14}/></button>
                              <button onClick={() => handleGroupStatus(g.records, 2)} title="Выполнено" className="p-1 text-green-600 hover:bg-green-50 rounded transition-all"><CheckCircle2 size={14}/></button>
                              <button onClick={() => handleGroupStatus(g.records, 3)} title="Отменено" className="p-1 text-red-500 hover:bg-red-50 rounded transition-all"><XCircle size={14}/></button>
                            </div>

                            <div className="flex items-center gap-2 ml-2 font-sans">
                              <button onClick={() => togglePrepayment(recordIdForPrepayment)} className={`p-1.5 rounded-lg transition-all ${g.records[0]?.prepayment > 0 ? 'bg-blue-500 text-white shadow-md' : isPrepaymentOpen ? 'bg-blue-100 text-blue-600' : 'bg-white border border-slate-200 text-slate-300 hover:text-blue-500 shadow-sm'}`}><Wallet size={14} /></button>
                              {isPrepaymentOpen && (
                                <div className="flex items-center gap-2 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 animate-in slide-in-from-left-2 duration-200 shadow-sm font-sans">
                                  <span className="text-[9px] text-blue-400 font-black uppercase">Предоплата:</span>
                                  <input type="number" style={timesNewRoman} className={`w-16 bg-transparent text-blue-600 font-bold outline-none text-center border-b border-blue-200 text-[13px] ${noArrowsClass}`} value={g.records[0]?.prepayment || ''} onChange={(e) => updateRecord(car.id, g.records[0].id, { prepayment: Number(e.target.value) || 0 })} />
                                  <span className="text-blue-600 font-bold text-[13px]">₽</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button onClick={() => { setFormData({ date: g.date }); setIsAdding(true); }} className="btn-action !h-8 !py-0 !px-4 !rounded-xl font-sans"><Plus size={14} /> Добавить</button>
                        </div>
                      </td>
                    </tr>
                    {g.records.map((r: any) => (
                      <tr key={r.id} className={`transition-colors group border-b border-slate-50 last:border-0 ${r.status === 1 ? 'bg-yellow-50' : r.status === 2 ? 'bg-green-100' : r.status === 3 ? 'bg-red-50 text-slate-400' : 'bg-white hover:bg-green-50/50'}`}>
                        <td className="px-4 py-2">
                          <div className="flex gap-1 justify-center font-sans">
                            <button onClick={() => updateStatus(r.id, 0)} className={`p-1.5 rounded-lg transition-all ${r.status > 0 ? 'bg-slate-50 text-slate-300 hover:bg-slate-200 hover:text-slate-600' : 'opacity-0 pointer-events-none'}`}><RotateCcw size={14} /></button>
                            <button disabled={!!r.warehouseItemId} onClick={() => updateStatus(r.id, 1)} className={`p-1.5 rounded-lg transition-all ${r.status === 1 ? 'bg-yellow-400 text-white shadow-md' : 'bg-slate-50 text-slate-300 hover:bg-yellow-200 hover:text-yellow-700'} ${r.warehouseItemId ? 'opacity-10 cursor-not-allowed' : ''}`}><ShoppingCart size={14} /></button>
                            <button onClick={() => updateStatus(r.id, 2)} className={`p-1.5 rounded-lg transition-all ${r.status === 2 ? 'bg-green-500 text-white shadow-md' : 'bg-slate-50 text-slate-300 hover:bg-green-200 hover:text-green-700'}`}><CheckCircle2 size={14}/></button>
                            <button onClick={() => updateStatus(r.id, 3)} className={`p-1.5 rounded-lg transition-all ${r.status === 3 ? 'bg-red-500 text-white shadow-md' : 'bg-slate-50 text-slate-300 hover:bg-red-100 hover:text-red-700'}`}><XCircle size={14} /></button>
                          </div>
                        </td>
                        <td className="px-3 py-1.5 text-slate-500 group-hover:text-black">{r.catalogNumber || '—'}</td>
                        <td className={`px-3 py-1.5 font-bold ${r.status === 3 ? '' : 'text-slate-800'}`}>{r.brand || '—'}</td>
                        <td className="px-3 py-1.5 font-medium">{r.description}</td>
                        <td className="px-3 py-1.5 text-center font-bold">{r.quantity}</td>
                        <td className="px-3 py-1.5 text-right font-bold whitespace-nowrap">
                          <div>{(Number(r.totalPrice) || 0).toLocaleString()} ₽</div>
                          <div className="text-[11.5px] text-slate-400 font-bold">{(Number(r.unitPriceSale) || 0).toLocaleString()} / шт</div>
                        </td>
                        <td className="px-3 py-1.5 text-right font-bold text-slate-400 whitespace-nowrap">
                          <div>{(Number(r.purchasePrice) || 0).toLocaleString()} ₽</div>
                          <div className="text-[11.5px] text-slate-300 font-bold">{(Number(r.unitPricePurchase) || 0).toLocaleString()} / шт</div>
                        </td>
                        <td className="px-6 py-1.5 text-center">{r.note}</td>
                        <td className="px-3 py-1.5 text-right pr-4"><div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all font-sans">
                          <button onClick={() => { setEditingId(r.id); setFormData({...r, unitPriceSale: r.unitPriceSale || (r.totalPrice/r.quantity)}); setIsAdding(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1.5 text-slate-300 hover:text-green-600 hover:bg-white rounded-lg shadow-sm"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteClick(r.id)} className={`p-1.5 rounded-lg shadow-sm transition-all ${pendingDeleteId === r.id ? 'bg-red-600 text-white animate-pulse' : 'text-slate-300 hover:text-red-600 hover:bg-white'}`}><Trash2 size={14} /></button>
                        </div></td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50/40 text-right border-b border-slate-200/50 uppercase">
                      <td colSpan={5} className="px-6 py-3 text-slate-400 text-[12px] font-sans font-bold tracking-tight">Итого:</td>
                      <td className="px-3 py-3 text-black text-[16px] font-bold border-r border-slate-100/50 whitespace-nowrap">{(g.sale || 0).toLocaleString()} ₽</td>
                      <td className="px-3 py-3 text-slate-500 text-[16px] font-bold border-r border-slate-100/50 whitespace-nowrap">{(g.purchase || 0).toLocaleString()} ₽</td>
                      <td className="px-6 py-3 text-center whitespace-nowrap leading-none">
                        <div className="flex items-center justify-center gap-10">
                          <div className="flex flex-col gap-1 items-center font-sans">
                            <span className="text-slate-400 text-[12px] font-bold tracking-tight uppercase leading-none">Прибыль:</span>
                            {g.greenProfit !== 0 && <span className="text-green-600 text-[17px] font-bold leading-none">{g.greenProfit.toLocaleString()} ₽</span>}
                            {g.yellowProfit !== 0 && <span className="text-yellow-600 text-[17px] font-bold leading-none">{g.yellowProfit.toLocaleString()} ₽</span>}
                            {g.yellowProfit === 0 && g.greenProfit === 0 && <span className="text-slate-400 text-[16px] leading-none">0 ₽</span>}
                          </div>
                          <button onClick={() => exportDayPDF(g)} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-green-600 transition-all shadow-md active:scale-95 group/pdf" title="Экспорт заказа в PDF"><Download size={18} className="group-hover/pdf:scale-110 transition-transform" /></button>
                        </div>
                      </td>
                      <td></td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}