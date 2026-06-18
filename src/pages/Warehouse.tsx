import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Edit2, LayoutGrid, Tag, Check, X, ArrowLeft } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

export function Warehouse({ 
  categories = [], items = [], addCategory, updateCategory, deleteCategory, 
  addItem, updateItem, deleteWarehouseItem, onBack, selectionMode, onSelectItem 
}: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<'all' | string>('all');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isManagingCats, setIsManagingCats] = useState(false);
  const [formData, setFormData] = useState<any>({ catalogNumber: '', brand: '', description: '', quantity: '', unitPricePurchase: '', note: '', categoryId: '' });
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [tempCatName, setTempCatName] = useState('');
  const [confirmDeleteCat, setConfirmDeleteCat] = useState({ isOpen: false, id: '', name: '' });

  const filteredItems = useMemo(() => {
    let result = Array.isArray(items) ? items : [];
    if (activeCategoryId !== 'all') result = result.filter((i: any) => i.categoryId === activeCategoryId);
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      result = result.filter((i: any) => (i.catalogNumber + i.brand + i.description + (i.note || '')).toLowerCase().includes(s));
    }
    return result;
  }, [items, activeCategoryId, searchTerm]);

  const handleSaveItem = () => {
    const targetCategoryId = editingItemId ? formData.categoryId : activeCategoryId;
    if (!targetCategoryId || targetCategoryId === 'all') return;
    const cleanCatalogNumber = (formData.catalogNumber || '').replace(/\s+/g, '');
    const data = { ...formData, catalogNumber: cleanCatalogNumber, categoryId: targetCategoryId, quantity: Number(formData.quantity) || 0, unitPricePurchase: Number(formData.unitPricePurchase) || 0 };
    if (editingItemId) updateItem(editingItemId, data); else addItem(data);
    setIsAddingItem(false); setEditingItemId(null); setFormData({ catalogNumber: '', brand: '', description: '', quantity: '', unitPricePurchase: '', note: '', categoryId: '' });
  };

  const handleDeleteCategoryRequest = (cat: any) => {
    const hasItems = items.some((item: any) => item.categoryId === cat.id);
    if (hasItems) setConfirmDeleteCat({ isOpen: true, id: cat.id, name: cat.name });
    else deleteCategory(cat.id);
  };

  const timesNewRoman = { fontFamily: '"Times New Roman", Times, serif' };
  const noArrowsClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
  const canAddItem = activeCategoryId !== 'all' && categories.length > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500 text-left font-sans">
      {selectionMode && (
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 mb-4 font-bold uppercase text-[10px] hover:text-green-600 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Назад к заказу
        </button>
      )}

      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-black text-black uppercase italic tracking-tight leading-none mt-4">
          {selectionMode ? 'Выберите деталь' : 'Склад'}
        </h1>
        <div className="flex items-center gap-4">
          {!selectionMode && (
            <button onClick={() => setIsManagingCats(!isManagingCats)} className="btn-action !bg-white !text-slate-500 border border-slate-200 hover:!border-slate-400 hover:!text-black shadow-none !px-5"><Tag size={18} /> Категории</button>
          )}
          {!selectionMode && (
            <button disabled={!canAddItem} onClick={() => { setFormData({ catalogNumber: '', brand: '', description: '', quantity: '1', unitPricePurchase: '', note: '', categoryId: '' }); setIsAddingItem(true); }} className={`btn-action self-center transition-all ${!canAddItem ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}><Plus size={18} /> <span>Добавить товар</span></button>
          )}
        </div>
      </div>

      {isManagingCats && !selectionMode && (
        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4"><h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Управление категориями</h3><button onClick={() => setIsManagingCats(false)} className="p-1 text-slate-300 hover:text-black"><X size={20}/></button></div>
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2 mr-4">
              <input className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-green-500" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Название..." onKeyDown={e => e.key === 'Enter' && newCatName && (addCategory(newCatName), setNewCatName(''))} />
              <button onClick={() => { if(newCatName) { addCategory(newCatName); setNewCatName(''); }}} className="p-2 bg-black text-white rounded-xl hover:bg-green-600 transition-all"><Plus size={18}/></button>
            </div>
            {categories.map((cat: any) => (
              <div key={cat.id} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm group">
                {editingCatId === cat.id ? <input autoFocus className="text-xs font-bold outline-none border-b-2 border-green-500 w-24" value={tempCatName} onChange={e => setTempCatName(e.target.value)} onBlur={() => { updateCategory(cat.id, tempCatName); setEditingCatId(null); }} onKeyDown={e => e.key === 'Enter' && (updateCategory(cat.id, tempCatName), setEditingCatId(null))}/> : <span className="text-xs font-bold text-slate-700">{cat.name}</span>}
                <button onClick={() => { setEditingCatId(cat.id); setTempCatName(cat.name); }} className="text-slate-300 hover:text-green-600"><Edit2 size={12}/></button>
                <button onClick={() => handleDeleteCategoryRequest(cat)} className="text-slate-300 hover:text-red-600"><Trash2 size={12}/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative mb-6"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="text" placeholder="Поиск по складу..." className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-green-500 shadow-sm transition-all font-bold text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>

      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-8 overflow-x-auto no-scrollbar max-w-fit">
        <button onClick={() => setActiveCategoryId('all')} className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeCategoryId === 'all' ? 'bg-white shadow-md text-black' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={14} /> Все записи</button>
        <div className="w-px h-4 bg-slate-200 self-center mx-1"></div>
        {categories.map((cat: any) => (
          <button key={cat.id} onClick={() => setActiveCategoryId(cat.id)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeCategoryId === cat.id ? 'bg-white shadow-md text-black' : 'text-slate-400 hover:text-slate-600'}`}>{cat.name}</button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl mb-12 relative overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left table-fixed min-w-[1100px] border-collapse" style={timesNewRoman}>
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-sm text-slate-500 text-[11px] font-bold uppercase tracking-widest font-sans">
              <tr>
                <th className="px-6 py-3 w-[180px]">Артикул</th>
                <th className="px-3 py-3 w-[150px]">Бренд</th>
                <th className="px-3 py-3">Описание</th>
                <th className="px-3 py-3 w-[130px] text-center font-bold">Количество</th>
                <th className="px-3 py-3 w-[150px] text-right font-bold">Закупка</th>
                <th className="px-6 py-3 w-[220px] text-center font-bold">Примечание</th>
                {!selectionMode && <th className="px-3 py-3 w-[80px]"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[14px]">
              {(isAddingItem || editingItemId) && !selectionMode && (
                <tr className="bg-white border-b-2 border-green-500 sticky top-[41px] z-[19] shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                  <td className="p-1.5 pl-4"><input className="w-full p-2 border border-slate-200 rounded-lg text-[14px] font-bold outline-none" value={formData.catalogNumber} onChange={e => setFormData({...formData, catalogNumber: e.target.value})} /></td>
                  <td className="p-1.5"><input className="w-full p-2 border border-slate-200 rounded-lg text-[14px] font-bold outline-none uppercase" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} /></td>
                  <td className="p-1.5"><input className="w-full p-2 border border-slate-200 rounded-lg text-[14px] font-bold outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></td>
                  <td className="p-1.5"><input type="number" className={`w-full p-2 border border-slate-200 rounded-lg text-[14px] font-bold outline-none text-center ${noArrowsClass}`} value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} /></td>
                  <td className="p-1.5"><input type="number" className={`w-full p-2 border border-slate-200 rounded-lg text-[14px] font-bold outline-none text-right text-red-600 bg-red-50/30 ${noArrowsClass}`} value={formData.unitPricePurchase} onChange={e => setFormData({...formData, unitPricePurchase: e.target.value})} /></td>
                  <td className="p-1.5"><input className="w-full p-2 border border-slate-200 rounded-lg text-[14px] font-bold outline-none" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} /></td>
                  <td className="p-1.5 flex gap-1 justify-center items-center h-[50px] font-sans pr-4"><button onClick={handleSaveItem} className="bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-green-600">ОК</button><button onClick={() => { setIsAddingItem(false); setEditingItemId(null); }} className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-red-600">X</button></td>
                </tr>
              )}
              {filteredItems.map((item: any) => {
                const isFull = item.quantity <= (item.reserved || 0);
                return (
                  <tr 
                    key={item.id} 
                    onClick={() => { if (selectionMode && !isFull) onSelectItem(item); }}
                    className={`transition-colors group border-b border-slate-50 last:border-0 bg-white ${selectionMode ? (isFull ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-green-50') : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="px-6 py-2 text-slate-500 group-hover:text-black">{item.catalogNumber || '—'}</td>
                    <td className="px-3 py-2 font-bold text-slate-800 uppercase">{item.brand || '—'}</td>
                    <td className="px-3 py-2 font-medium">{item.description}</td>
                    <td className="px-3 py-2 text-center font-bold">
                      <span className="text-black">{item.quantity}</span>
                      {item.reserved > 0 && <span className="ml-1 text-slate-400 font-bold">({item.reserved})</span>}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-slate-400 whitespace-nowrap">{(Number(item.unitPricePurchase) || 0).toLocaleString()} ₽</td>
                    <td className="px-6 py-2 text-center">{item.note}</td>
                    {!selectionMode && (
                      <td className="px-3 py-2 text-right pr-4">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all font-sans">
                          <button onClick={(e) => { e.stopPropagation(); setEditingItemId(item.id); setFormData(item); setIsAddingItem(true); }} className="p-1.5 text-slate-300 hover:text-green-600 hover:bg-white rounded-lg shadow-sm"><Edit2 size={14}/></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteWarehouseItem(item.id); }} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-white rounded-lg shadow-sm"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmModal isOpen={confirmDeleteCat.isOpen} onClose={() => setConfirmDeleteCat({ ...confirmDeleteCat, isOpen: false })} onConfirm={() => deleteCategory(confirmDeleteCat.id)} title="Удаление категории" message={`Внимание! При удалении категории "${confirmDeleteCat.name}" все товары, находящиеся в ней, также будут безвозвратно удалены. Продолжить?`} />
    </div>
  );
}