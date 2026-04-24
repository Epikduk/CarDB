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

  const labelStyle = "block text-[10px] font-normal text-slate-400 uppercase mb-1 tracking-widest font-normal";
  const inputStyle = "w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-normal transition-all text-slate-700";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[130] p-4 font-normal text-slate-700">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Редактировать авто' : 'Новый автомобиль'}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 font-normal">
            <div>
              <label className={labelStyle}>Марка</label>
              <input required className={inputStyle} value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Модель</label>
              <input required className={inputStyle} value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className={labelStyle}>VIN Номер</label>
              {/* Удален атрибут required */}
              <input className={`${inputStyle} uppercase font-mono`} value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Год выпуска</label>
              <input className={inputStyle} value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Гос. Номер</label>
              <input className={`${inputStyle} uppercase`} value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className={labelStyle}>Примечание</label>
              <textarea className={`${inputStyle} h-20`} value={formData.carNote} onChange={e => setFormData({...formData, carNote: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] font-normal">
            Сохранить изменения
          </button>
        </form>
      </div>
    </div>
  );
}