import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function AddCarModal({ isOpen, onClose, clientId, onAdd, initialData }: any) {
  const [formData, setFormData] = useState({ vin: '', brand: '', model: '', year: '', licensePlate: '', carNote: '' });

  useEffect(() => {
    if (initialData) setFormData({ ...initialData });
    else setFormData({ vin: '', brand: '', model: '', year: '', licensePlate: '', carNote: '' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onAdd(clientId, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[130] p-4 font-normal">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden font-normal">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Редактировать авто' : 'Новый автомобиль'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-[13px] font-normal">
            <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Марка</label><input required className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-normal" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} /></div>
            <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Модель</label><input required className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-normal" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} /></div>
            <div className="col-span-2"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-normal">VIN Номер</label><input required className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-normal uppercase" value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} /></div>
            <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-normal">Год выпуска</label><input className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-normal" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} /></div>
            <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-normal">Гос. Номер</label><input className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-normal uppercase" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} /></div>
            <div className="col-span-2"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-normal">Примечание</label><textarea className="w-full px-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-normal h-20" value={formData.carNote} onChange={e => setFormData({...formData, carNote: e.target.value})} /></div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all font-normal">Сохранить</button>
        </form>
      </div>
    </div>
  );
}