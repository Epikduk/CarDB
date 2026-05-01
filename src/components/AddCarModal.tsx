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

  const labelStyle = "block text-[11px] font-black text-slate-400 uppercase mb-1.5 tracking-[0.1em] ml-1";
  const inputStyle = "w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all text-slate-800 font-bold text-[14px] bg-white shadow-sm";

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[130] p-4 animate-in fade-in duration-200 text-left">
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border border-white/20">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">
            {initialData ? 'Редактировать авто' : 'Новый автомобиль'}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-300 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-all">
            <X size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <input className={`${inputStyle} uppercase`} value={formData.vin} onChange={e => setFormData({...formData, vin: e.target.value})} />
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
              <textarea className={`${inputStyle} h-20 resize-none font-bold`} value={formData.carNote} onChange={e => setFormData({...formData, carNote: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-950 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-green-600 transition-all shadow-lg active:scale-95 mt-2">
            Сохранить данные
          </button>
        </form>
      </div>
    </div>
  );
}