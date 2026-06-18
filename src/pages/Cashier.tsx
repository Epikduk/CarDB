import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Edit2, Check, X, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

export function Cashier({ records = [], addRecord, updateRecord, deleteRecord }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({ date: format(new Date(), 'yyyy-MM-dd'), flow: '', description: '' });

  // Сортировка для отображения: новые записи по дате и времени создания будут в правильном порядке
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.createdAt - a.createdAt;
    });
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return sortedRecords;
    const s = searchTerm.toLowerCase();
    return sortedRecords.filter(r => r.description.toLowerCase().includes(s));
  }, [sortedRecords, searchTerm]);

  const currentBalance = useMemo(() => {
    if (records.length === 0) return 0;
    const sorted = [...records].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.createdAt - b.createdAt;
    });
    return sorted[sorted.length - 1].total;
  }, [records]);

  const handleSave = () => {
    const data = {
      date: formData.date,
      flow: Number(formData.flow) || 0,
      description: formData.description || 'Без описания'
    };

    if (editingId) updateRecord(editingId, data);
    else addRecord(data);

    setIsAdding(false);
    setEditingId(null);
    setFormData({ date: format(new Date(), 'yyyy-MM-dd'), flow: '', description: '' });
  };

  const timesNewRoman = { fontFamily: '"Times New Roman", Times, serif' };
  const noArrowsClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500 text-left font-sans">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-black text-black uppercase italic tracking-tight leading-none mt-4">Касса</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Текущий баланс</p>
            <p className={`text-3xl font-black italic tracking-tighter ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentBalance.toLocaleString()} ₽
            </p>
          </div>
          <button 
            onClick={() => { setFormData({ date: format(new Date(), 'yyyy-MM-dd'), flow: '', description: '' }); setIsAdding(true); }} 
            className="btn-action self-center"
          >
            <Plus size={18} /> <span>Новая запись</span>
          </button>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Поиск по описанию..." 
          className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-green-500 shadow-sm transition-all font-bold text-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl mb-12 relative overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left table-fixed min-w-[800px] border-collapse" style={timesNewRoman}>
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-sm text-slate-500 text-[11px] font-bold uppercase tracking-widest font-sans">
              <tr>
                <th className="px-6 py-4 w-[160px]">Дата</th>
                <th className="px-6 py-4 w-[180px] text-right">Денежный поток</th>
                <th className="px-6 py-4">Описание</th>
                <th className="px-6 py-4 w-[180px] text-right">Итоговая сумма</th>
                <th className="px-6 py-4 w-[100px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[15px]">
              {/* Строка добавления/редактирования */}
              {(isAdding || editingId) && (
                <tr className="bg-white border-b-2 border-green-500 sticky top-[41px] z-[19] shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                  <td className="p-2"><input type="date" className="w-full p-2 border border-slate-200 rounded-lg font-bold outline-none text-center" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></td>
                  <td className="p-2"><input type="number" className={`w-full p-2 border border-slate-200 rounded-lg font-bold outline-none text-right ${noArrowsClass}`} value={formData.flow} onChange={e => setFormData({...formData, flow: e.target.value})} /></td>
                  <td className="p-2"><input type="text" className="w-full p-2 border border-slate-200 rounded-lg font-bold outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></td>
                  <td className="p-2"></td>
                  <td className="p-2 flex gap-1 justify-center items-center h-[54px] font-sans">
                    <button onClick={handleSave} className="bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-green-600">ОК</button>
                    <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-red-600">X</button>
                  </td>
                </tr>
              )}

              {filteredRecords.map((r: any) => (
                <tr key={r.id} className="hover:bg-green-50/30 transition-colors group">
                  <td className="px-6 py-3 font-bold text-slate-400">{format(new Date(r.date), 'dd.MM.yyyy')}</td>
                  <td className={`px-6 py-3 font-black text-right ${r.flow >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    <div className="flex items-center justify-end gap-2">
                      {r.flow >= 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                      {r.flow.toLocaleString()} ₽
                    </div>
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-700">{r.description}</td>
                  <td className={`px-6 py-3 font-bold text-right whitespace-nowrap ${r.total >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {r.total.toLocaleString()} ₽
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all font-sans">
                      <button onClick={() => { setEditingId(r.id); setFormData(r); setIsAdding(true); }} className="p-1.5 text-slate-300 hover:text-green-600 hover:bg-white rounded-lg shadow-sm"><Edit2 size={14}/></button>
                      <button onClick={() => deleteRecord(r.id)} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-white rounded-lg shadow-sm"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}