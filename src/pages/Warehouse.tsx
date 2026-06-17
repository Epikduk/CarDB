import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Edit2, LayoutGrid, Tag, Check, X, Package } from 'lucide-react';

export function Warehouse({ 
  categories = [], // Значение по умолчанию
  items = [],      // Значение по умолчанию
  addCategory, updateCategory, deleteCategory, 
  addItem, updateItem, deleteItem, onBack 
}: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<'all' | string>('all');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isManagingCats, setIsManagingCats] = useState(false);
  
  const [formData, setFormData] = useState({ catalogNumber: '', brand: '', description: '', quantity: '0', unitPricePurchase: '0', note: '' });
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [tempCatName, setTempCatName] = useState('');

  const filteredItems = useMemo(() => {
    let result = Array.isArray(items) ? items : [];
    if (activeCategoryId !== 'all') {
      result = result.filter((i: any) => i.categoryId === activeCategoryId);
    }
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      result = result.filter((i: any) => 
        (i.catalogNumber + i.brand + i.description + i.note).toLowerCase().includes(s)
      );
    }
    return result;
  }, [items, activeCategoryId, searchTerm]);

  const handleSaveItem = () => {
    const data = {
      ...formData,
      categoryId: activeCategoryId === 'all' ? (categories[0]?.id || '') : activeCategoryId,
      quantity: Number(formData.quantity) || 0,
      unitPricePurchase: Number(formData.unitPricePurchase) || 0
    };
    if (editingItemId) updateItem(editingItemId, data);
    else addItem(data);
    setIsAddingItem(false);
    setEditingItemId(null);
    setFormData({ catalogNumber: '', brand: '', description: '', quantity: '0', unitPricePurchase: '0', note: '' });
  };

  const timesNewRoman = { fontFamily: '"Times New Roman", Times, serif' };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500 text-left font-sans">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black text-black uppercase italic tracking-tighter leading-none mb-2">Склад запчастей</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Управление наличием и категориями</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsManagingCats(!isManagingCats)} className="btn-action !bg-white !text-slate-400 border border-slate-200 hover:!text-black">
            <Tag size={16} /> Категории
          </button>
          <button 
            disabled={activeCategoryId === 'all' && (!categories || categories.length === 0)}
            onClick={() => { setFormData({ catalogNumber: '', brand: '', description: '', quantity: '0', unitPricePurchase: '0', note: '' }); setIsAddingItem(true); }} 
            className="btn-action !bg-orange-500 hover:!bg-orange-600 disabled:opacity-50"
          >
            <Plus size={16} /> Добавить товар
          </button>
        </div>
      </div>

      {isManagingCats && (
        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Новая категория:</h3>
            <div className="flex gap-2">
              <input 
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Название..."
              />
              <button onClick={() => { if(newCatName) addCategory(newCatName); setNewCatName(''); }} className="p-2 bg-black text-white rounded-xl hover:bg-orange-500 transition-all"><Plus size={18}/></button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(categories || []).map((cat: any) => (
              <div key={cat.id} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                {editingCatId === cat.id ? (
                  <input 
                    autoFocus
                    className="text-xs font-bold outline-none border-b-2 border-orange-500 w-24"
                    value={tempCatName}
                    onChange={e => setTempCatName(e.target.value)}
                    onBlur={() => { updateCategory(cat.id, tempCatName); setEditingCatId(null); }}
                    onKeyDown={e => e.key === 'Enter' && (updateCategory(cat.id, tempCatName), setEditingCatId(null))}
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                )}
                <button onClick={() => { setEditingCatId(cat.id); setTempCatName(cat.name); }} className="text-slate-300 hover:text-blue-500"><Edit2 size={12}/></button>
                <button onClick={() => deleteCategory(cat.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={12}/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Поиск по складу..." 
            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-orange-500 shadow-sm transition-all font-bold text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveCategoryId('all')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeCategoryId === 'all' ? 'bg-white shadow-sm text-black' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid size={14} /> Все записи
          </button>
          {(categories || []).map((cat: any) => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeCategoryId === cat.id ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={timesNewRoman}>
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-widest font-sans">
              <tr>
                <th className="px-6 py-4 w-[180px]">Артикул</th>
                <th className="px-6 py-4 w-[150px]">Бренд</th>
                <th className="px-6 py-4">Описание</th>
                <th className="px-6 py-4 w-[100px] text-center">Кол-во</th>
                <th className="px-6 py-4 w-[150px] text-right">Закупка</th>
                <th className="px-6 py-4 w-[250px]">Примечание</th>
                <th className="px-6 py-4 w-[100px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[14px]">
              {(isAddingItem || editingItemId) && (
                <tr className="bg-orange-50/50 border-b-2 border-orange-500 sticky top-0 z-10">
                  <td className="p-2"><input className="w-full p-2 border rounded-xl font-bold" placeholder="Артикул" value={formData.catalogNumber} onChange={e => setFormData({...formData, catalogNumber: e.target.value})} /></td>
                  <td className="p-2"><input className="w-full p-2 border rounded-xl font-bold" placeholder="Бренд" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} /></td>
                  <td className="p-2"><input className="w-full p-2 border rounded-xl font-bold" placeholder="Описание" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></td>
                  <td className="p-2"><input type="number" className="w-full p-2 border rounded-xl font-bold text-center" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} /></td>
                  <td className="p-2"><input type="number" className="w-full p-2 border rounded-xl font-bold text-right" value={formData.unitPricePurchase} onChange={e => setFormData({...formData, unitPricePurchase: e.target.value})} /></td>
                  <td className="p-2"><input className="w-full p-2 border rounded-xl font-bold" placeholder="Прим." value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} /></td>
                  <td className="p-2 flex gap-1 justify-center">
                    <button onClick={handleSaveItem} className="p-2 bg-black text-white rounded-lg hover:bg-green-600"><Check size={16}/></button>
                    <button onClick={() => { setIsAddingItem(false); setEditingItemId(null); }} className="p-2 bg-slate-200 text-slate-500 rounded-lg hover:bg-red-500 hover:text-white"><X size={16}/></button>
                  </td>
                </tr>
              )}

              {filteredItems.map((item: any) => (
                <tr key={item.id} className="hover:bg-orange-50/30 transition-colors group">
                  <td className="px-6 py-3 font-bold text-slate-400 group-hover:text-black">{item.catalogNumber || '—'}</td>
                  <td className="px-6 py-3 font-black text-slate-800 uppercase italic leading-none">{item.brand}</td>
                  <td className="px-6 py-3 font-medium text-slate-600 leading-tight">{item.description}</td>
                  <td className="px-6 py-3 text-center font-bold text-black">{item.quantity}</td>
                  <td className="px-6 py-3 text-right font-bold text-orange-600">{(Number(item.unitPricePurchase) || 0).toLocaleString()} ₽</td>
                  <td className="px-6 py-3 text-slate-400 italic text-xs">{item.note}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingItemId(item.id); setFormData(item); }} className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-white rounded-lg shadow-sm"><Edit2 size={14}/></button>
                      <button onClick={() => deleteItem(item.id)} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-white rounded-lg shadow-sm"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && !isAddingItem && (
                <tr>
                  <td colSpan={7} className="py-20 text-center flex flex-col items-center justify-center">
                    <Package size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest italic leading-none">На складе пока пусто</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}